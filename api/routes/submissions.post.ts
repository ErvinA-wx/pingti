import { EmailMessage } from 'cloudflare:email'
import { SubmissionSchema } from '../../docs/.vitepress/types/Submission'

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

function describeSubmission(submission: any): string {
  const hiddenKeys = new Set([
    'turnstileToken',
    'website',
    'startedAt',
    'idempotencyKey',
    'declaration'
  ])
  return Object.entries(submission)
    .filter(([key]) => !hiddenKeys.has(key))
    .map(([key, value]) => `${key}: ${String(value ?? '')}`)
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

  const submission = await readValidatedBody(event, SubmissionSchema.parseAsync)

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
    throw createError({ statusCode: 400, statusMessage: 'Human check failed' })
  }

  const reference = makeReference(submission.kind)
  const createdAt = new Date().toISOString()
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
        JSON.stringify(submission),
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
  const subject = `[${reference}] 新的${kindName}提交`
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
