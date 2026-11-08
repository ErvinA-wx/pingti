import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import { z } from 'zod'
import {
  materialConsentText,
  materialConsentVersion,
  submissionLabels,
  submissionOptions,
  SubmissionSchema
} from '../docs/.vitepress/types/Submission.ts'

const base = {
  kind: 'site',
  language: 'en',
  submissionType: 'new',
  name: 'Review fixture',
  url: 'https://example.com',
  category: 'Tools',
  positioning: 'alternative',
  alternativeTargets: 'Notion',
  pricing: 'free',
  registration: 'no',
  summary: 'A real description used only by local tests.',
  reason: 'A verified replacement for a specific workflow.',
  relationship: 'user',
  contactEmail: 'test@example.com',
  allowContact: true,
  declaration: true,
  turnstileToken: 'local-test-token',
  startedAt: Date.now() - 10000,
  idempotencyKey: '3f59d8d0-169a-4e1c-892d-0652cf6ab5cc'
}

test('new alternatives require a specific target; original projects do not', () => {
  assert.equal(
    SubmissionSchema.safeParse({ ...base, alternativeTargets: '' }).success,
    false
  )
  assert.equal(
    SubmissionSchema.safeParse({
      ...base,
      positioning: 'original',
      alternativeTargets: ''
    }).success,
    true
  )
  assert.equal(
    SubmissionSchema.safeParse({ ...base, positioning: '' }).success,
    false
  )
})
test('existing-project feedback is not forced to invent a category or replacement', () => {
  const result = SubmissionSchema.safeParse({
    ...base,
    submissionType: 'broken',
    positioning: '',
    alternativeTargets: '',
    category: '',
    summary: '',
    pricing: '',
    registration: ''
  })
  assert.equal(result.success, true)
})
test('pricing must be chosen explicitly, with Unknown accepted', () => {
  assert.equal(
    SubmissionSchema.safeParse({ ...base, pricing: '' }).success,
    false
  )
  assert.equal(
    SubmissionSchema.safeParse({ ...base, pricing: 'unknown' }).success,
    true
  )
})
test('only owners or authorized representatives may grant permission', () => {
  assert.equal(
    SubmissionSchema.safeParse({ ...base, promotionConsent: true }).success,
    false
  )
  assert.equal(
    SubmissionSchema.safeParse({
      ...base,
      relationship: 'owner',
      promotionConsent: true
    }).success,
    true
  )
})
test('material permission requires promotion permission and at least one material', () => {
  assert.equal(
    SubmissionSchema.safeParse({
      ...base,
      relationship: 'owner',
      materialConsent: true
    }).success,
    false
  )
  assert.equal(
    SubmissionSchema.safeParse({
      ...base,
      relationship: 'owner',
      promotionConsent: true,
      materialConsent: true
    }).success,
    false
  )
  assert.equal(
    SubmissionSchema.safeParse({
      ...base,
      relationship: 'owner',
      promotionConsent: true,
      materialConsent: true,
      promotionalText: 'Explicitly authorized test copy.'
    }).success,
    true
  )
})
test('providing copy does not silently grant permission; non-HTTP video URLs are rejected', () => {
  const result = SubmissionSchema.parse({
    ...base,
    promotionalText: 'Internal review only.'
  })
  assert.equal(result.promotionConsent, false)
  assert.equal(result.materialConsent, false)
  assert.equal(
    SubmissionSchema.safeParse({ ...base, videoUrl: 'javascript:alert(1)' })
      .success,
    false
  )
})
test('request emails remain optional in both languages', () => {
  for (const language of ['zh', 'en']) {
    const request = {
      kind: 'request',
      language,
      requestType: 'find-tool',
      title: 'PDF editor',
      problem: 'Looking for a fully offline PDF editor.',
      desiredOutcome: 'Edit and export PDF files offline.',
      scenario: 'work',
      pricePreference: 'free',
      openSource: 'preferred',
      impact: 'minor',
      declaration: true,
      turnstileToken: base.turnstileToken,
      startedAt: base.startedAt,
      idempotencyKey: base.idempotencyKey
    }
    assert.equal(SubmissionSchema.parse(request).contactEmail, '')
  }
})
test('the same validation schema exports machine-readable fields', () => {
  const json = JSON.stringify(z.toJSONSchema(SubmissionSchema))
  for (const field of [
    'positioning',
    'alternativeTargets',
    'promotionConsent',
    'materialConsent',
    'videoUrl'
  ])
    assert.ok(json.includes(field))
})

async function handlerHarness(body, { emailFails = false } = {}) {
  const source = await readFile(
    new URL('../api/routes/submissions.post.ts', import.meta.url),
    'utf8'
  )
  const code = ts
    .transpileModule(source, {
      compilerOptions: {
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022
      }
    })
    .outputText.replace(/import[\s\S]*?from ['"][^'"]+['"];?/g, '')
    .replace('export default', 'return')
  const stored = [],
    emails = [],
    statuses = []
  const env = {
    TURNSTILE_SECRET_KEY: 'test-secret',
    RATE_LIMITER: { limit: async () => ({ success: true }) },
    SUBMISSIONS_DB: {
      prepare: (sql) => ({
        bind: (...args) => ({
          run: async () => {
            stored.push({ sql, args })
          },
          first: async () => null
        })
      })
    },
    SUBMISSION_EMAIL: {
      send: async (email) => {
        if (emailFails) throw new Error('Simulated email outage')
        emails.push(email)
      }
    }
  }
  const args = {
    defineEventHandler: (fn) => fn,
    EmailMessage: class {
      constructor(from, to, raw) {
        Object.assign(this, { from, to, raw })
      }
    },
    SubmissionSchema,
    materialConsentText,
    materialConsentVersion,
    submissionLabels,
    submissionOptions,
    readBody: async () => body,
    getHeader: (_event, key) =>
      key === 'origin' ? 'https://pingti.org' : 'test-agent',
    createError: (obj) => Object.assign(new Error(obj.statusMessage), obj),
    setResponseStatus: (_event, status) => statuses.push(status),
    fetch: async () => ({
      ok: true,
      json: async () => ({ success: true, hostname: 'pingti.org' })
    }),
    crypto,
    console: { error() {} }
  }
  const handler = new Function(...Object.keys(args), code)(
    ...Object.values(args)
  )
  const result = await handler({ context: { cloudflare: { env } } })
  return { result, stored, emails, statuses }
}

test('invalid AI submissions receive actionable field errors before persistence', async () => {
  const { result, stored, statuses } = await handlerHarness({
    ...base,
    alternativeTargets: ''
  })
  assert.ok(result.errors.some((error) => error.field === 'alternativeTargets'))
  assert.deepEqual(statuses, [400])
  assert.equal(stored.length, 0)
})
test('originality, consent provenance, and readable subject survive the complete API path', async () => {
  const { result, stored, emails, statuses } = await handlerHarness({
    ...base,
    positioning: 'original',
    alternativeTargets: '',
    relationship: 'owner',
    promotionConsent: true,
    materialConsent: true,
    promotionalText: 'Authorized local fixture.'
  })
  assert.match(result.reference, /^SITE-\d{8}-[A-F0-9]{6}$/)
  assert.equal(statuses.at(-1), 201)
  const record = JSON.parse(stored[0].args[3])
  assert.equal(record.positioning, 'original')
  assert.equal(record.materialConsentVersion, materialConsentVersion)
  assert.ok(record.materialConsentAt)
  assert.equal('turnstileToken' in record, false)
  const subject = emails[0].raw.match(/Subject: =\?UTF-8\?B\?(.+?)\?=/)[1]
  const decoded = Buffer.from(subject, 'base64').toString()
  assert.match(decoded, /独创待核/)
  assert.match(decoded, /Review fixture/)
  assert.match(decoded, /有授权素材/)
  assert.match(emails[0].raw, /站长自报，重点复核/)
  assert.match(emails[0].raw, /授权文案/)
})
test('email failures preserve the record and return the submission reference', async () => {
  const { result, stored, statuses } = await handlerHarness(base, {
    emailFails: true
  })
  assert.equal(statuses.at(-1), 201)
  assert.ok(result.reference)
  assert.equal(result.notificationPending, true)
  assert.ok(
    stored.some((item) => item.sql.includes("notification_status = 'failed'"))
  )
})
