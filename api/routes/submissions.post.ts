import type { Submission } from '../../docs/.vitepress/types/Submission'
import { EmailMessage } from 'cloudflare:email'
import {
  materialConsentText,
  materialConsentVersion,
  submissionLabels,
  submissionOptions,
  SubmissionSchema
} from '../../docs/.vitepress/types/Submission'

const ALLOWED_ORIGINS = new Set([
  'https://pingti.org',
  'https://www.pingti.org',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
])
const TURNSTILE_VERIFY_URL =
  'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const MINIMUM_FILL_TIME_MS = 3000
const MAXIMUM_FILL_TIME_MS = 2 * 60 * 60 * 1000

interface TurnstileResult {
  success: boolean
  hostname?: string
  'error-codes'?: string[]
}

function getClientIP(event: any): string | undefined {
  return (
    getHeader(event, 'cf-connecting-ip') ||
    getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
  )
}

function makeReference(kind: 'site' | 'request'): string {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  const random = crypto
    .randomUUID()
    .replaceAll('-', '')
    .slice(0, 6)
    .toUpperCase()
  return `${kind === 'site' ? 'SITE' : 'REQ'}-${date}-${random}`
}

function encodeHeader(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return `=?UTF-8?B?${btoa(binary)}?=`
}

function safeHeader(value: string): string {
  return value.replace(/[\r\n]/g, ' ').trim()
}

function describeSubmission(submission: Submission): string {
  const hiddenKeys = new Set([
    'turnstileToken',
    'website',
    'startedAt',
    'idempotencyKey',
    'declaration',
    'kind'
  ])
  return Object.entries(submission)
    .filter(([key]) => !hiddenKeys.has(key))
    .map(([key, value]) => {
      const label = submissionLabels[key]?.[0] || key
      const option = submissionOptions[key]?.find(([id]) => id === value)?.[1]
      const text =
        typeof value === 'boolean'
          ? value
            ? '是'
            : '否'
          : option || String(value || '未填写')
      return `${label}：${text}`
    })
    .join('\n')
}

async function verifyTurnstile(
  secret: string,
  token: string,
  remoteIP?: string
): Promise<boolean> {
  const body = new FormData()
  body.set('secret', secret)
  body.set('response', token)
  if (remoteIP) body.set('remoteip', remoteIP)

  const response = await fetch(TURNSTILE_VERIFY_URL, { method: 'POST', body })
  if (!response.ok) return false
  const result = (await response.json()) as TurnstileResult
  return result.success && result.hostname === 'pingti.org'
}

export default defineEventHandler(async (event) => {
  const origin = getHeader(event, 'origin')
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    throw createError({ statusCode: 403, statusMessage: 'Origin not allowed' })
  }

  const body = await readBody(event)
  const parsed = SubmissionSchema.safeParse(body)
  if (!parsed.success) {
    setResponseStatus(event, 400)
    return {
      status: 'invalid',
      errors: parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        label:
          submissionLabels[String(issue.path[0])]?.[
            body?.language === 'en' ? 1 : 0
          ] || String(issue.path[0]),
        message: issue.message
      }))
    }
  }
  const submission = parsed.data

  // A visually and semantically hidden honeypot. Bots receive a generic success
  // response, while no data is stored or emailed.
  if (submission.website) {
    return { status: 'ok', reference: makeReference(submission.kind) }
  }

  const elapsed = Date.now() - submission.startedAt
  if (elapsed < MINIMUM_FILL_TIME_MS || elapsed > MAXIMUM_FILL_TIME_MS) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid form timing' })
  }

  const cf = event.context.cloudflare as any
  const env = cf?.env
  if (
    !env?.TURNSTILE_SECRET_KEY ||
    !env?.SUBMISSIONS_DB ||
    !env?.SUBMISSION_EMAIL
  ) {
    console.error('Submission service bindings are incomplete')
    throw createError({ statusCode: 503, statusMessage: 'Service unavailable' })
  }

  const clientIP = getClientIP(event)
  if (env.RATE_LIMITER && clientIP) {
    const { success } = await env.RATE_LIMITER.limit({
      key: `submission:${clientIP}`
    })
    if (!success) {
      throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
    }
  }

  const human = await verifyTurnstile(
    env.TURNSTILE_SECRET_KEY,
    submission.turnstileToken,
    clientIP
  )
  if (!human) {
    setResponseStatus(event, 400)
    return {
      status: 'invalid',
      errors: [
        {
          field: 'turnstileToken',
          message: 'Human verification expired. Please refresh verification.'
        }
      ]
    }
  }

  const reference = makeReference(submission.kind)
  const createdAt = new Date().toISOString()
  const { turnstileToken: _token, website: _honeypot, ...record } = submission
  const payload = {
    ...record,
    ...(submission.kind === 'site' && submission.materialConsent
      ? {
          materialConsentVersion,
          materialConsentText:
            materialConsentText[submission.language === 'en' ? 1 : 0],
          materialConsentAt: createdAt
        }
      : {})
  }
  try {
    await env.SUBMISSIONS_DB.prepare(
      `INSERT INTO submissions
       (id, idempotency_key, kind, payload_json, contact_email, status,
        notification_status, user_agent, created_at)
       VALUES (?, ?, ?, ?, ?, 'new', 'pending', ?, ?)`
    )
      .bind(
        reference,
        submission.idempotencyKey,
        submission.kind,
        JSON.stringify(payload),
        submission.contactEmail || null,
        (getHeader(event, 'user-agent') || '').slice(0, 500),
        createdAt
      )
      .run()
  } catch (error: any) {
    if (String(error?.message || error).includes('UNIQUE')) {
      const existing = await env.SUBMISSIONS_DB.prepare(
        'SELECT id FROM submissions WHERE idempotency_key = ?'
      )
        .bind(submission.idempotencyKey)
        .first()
      return { status: 'ok', reference: existing?.id || reference }
    }
    throw error
  }

  const kindName = submission.kind === 'site' ? '网站信息' : '用户需求'
  const short = (value: string, max = 40) =>
    safeHeader(value).replace(/\s+/g, ' ').slice(0, max)
  const typeName =
    submission.kind === 'site'
      ? submission.submissionType === 'new'
        ? submission.positioning === 'original'
          ? '独创待核'
          : '平替提报'
        : submissionOptions.submissionType.find(
            ([id]) => id === submission.submissionType
          )?.[1] || '项目更新'
      : '用户需求'
  const title = submission.kind === 'site' ? submission.name : submission.title
  const topic =
    submission.kind === 'site'
      ? submission.positioning === 'alternative' &&
        submission.alternativeTargets
        ? `${short(submission.alternativeTargets, 28)} 平替`
        : short(submission.summary || submission.reason, 28)
      : ''
  const promotion =
    submission.kind === 'site' && submission.promotionConsent
      ? submission.materialConsent &&
        (submission.promotionalText || submission.videoUrl)
        ? '可宣传·有授权素材'
        : '可宣传'
      : ''
  const subject =
    [`【${typeName}】${short(title)}`, topic, promotion]
      .filter(Boolean)
      .join('｜') + ` [${reference.slice(-6)}]`
  const replyTo = submission.contactEmail
    ? `Reply-To: ${safeHeader(submission.contactEmail)}\r\n`
    : ''
  const raw = [
    'From: Pingti 提交中心 <submit@pingti.org>',
    'To: eaweblink@gmail.com',
    `${replyTo}Subject: ${encodeHeader(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    '',
    `提交编号：${reference}`,
    `提交时间：${createdAt}`,
    `类型：${kindName}`,
    `填写语言：${submission.language === 'en' ? 'English' : '简体中文'}`,
    ...(submission.kind === 'site'
      ? [
          `项目：${safeHeader(submission.name)}`,
          `官网：${submission.url}`,
          `定位：${submission.positioning === 'original' ? '独创（站长自报，重点复核）' : submission.positioning === 'alternative' ? '平替项目' : '已有项目反馈'}`,
          `平替对象：${submission.alternativeTargets || '未填写'}`,
          `社媒宣传许可：${submission.promotionConsent ? '同意' : '未授权'}`,
          `素材使用及合理修订：${submission.materialConsent ? '同意' : '未授权，素材仅供内部审核'}`,
          `素材情况：${submission.promotionalText || submission.videoUrl ? '有资料' : '未提供'}`,
          ...(submission.materialConsent
            ? [
                `授权版本：${materialConsentVersion}`,
                `授权时间：${createdAt}`,
                `授权文案：${materialConsentText[submission.language === 'en' ? 1 : 0]}`
              ]
            : [])
        ]
      : []),
    '',
    describeSubmission(submission)
  ].join('\r\n')

  let notificationPending = false
  try {
    await env.SUBMISSION_EMAIL.send(
      new EmailMessage('submit@pingti.org', 'eaweblink@gmail.com', raw)
    )
    await env.SUBMISSIONS_DB.prepare(
      "UPDATE submissions SET notification_status = 'sent' WHERE id = ?"
    )
      .bind(reference)
      .run()
  } catch (error) {
    notificationPending = true
    console.error(`Submission ${reference} email notification failed`, error)
    await env.SUBMISSIONS_DB.prepare(
      "UPDATE submissions SET notification_status = 'failed' WHERE id = ?"
    )
      .bind(reference)
      .run()
  }

  setResponseStatus(event, 201)
  return { status: 'ok', reference, notificationPending }
})
