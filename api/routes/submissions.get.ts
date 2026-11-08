import { z } from 'zod'
import {
  materialConsentText,
  materialConsentVersion,
  submissionLabels,
  submissionOptions,
  SubmissionSchema
} from '../../docs/.vitepress/types/Submission'

export default defineEventHandler(() => ({
  version: '2026-11-08',
  form: 'https://pingti.org/submit/site',
  englishForm: 'https://pingti.org/submit/site?lang=en',
  endpoint: 'https://api.pingti.org/submissions',
  method: 'POST',
  contentType: 'application/json',
  instructions: [
    'People and authorized AI agents use the same form, validation, and review process. All business fields are visible.',
    'A new project must choose positioning=alternative or positioning=original. Alternative projects require specific alternativeTargets; original projects may leave them blank and should explain their idea in reason.',
    'New projects require category, a summary of at least 10 characters, an explicit pricing choice, and an explicit registration choice. Existing-project feedback may leave these blank.',
    'Unknown information must not be invented. Optional fields may be omitted or left blank.',
    'Only owners or authorized representatives may grant promotionConsent or materialConsent. Never grant permission without explicit authorization from the principal.',
    'Material consent requires promotional permission and promotionalText or videoUrl. Supplying materials alone does not grant permission. Support for pingti.org is optional and does not affect review.',
    'The website field is reserved and must be omitted or empty. Use url for the project website.',
    'The browser form supplies startedAt and idempotencyKey. Direct clients use a current Unix timestamp in milliseconds and a stable UUID per submission.',
    'A genuine production Turnstile token is required, expires after five minutes, and is single-use. This endpoint provides no automation bypass; human assistance may be necessary.',
    'Successful requests return HTTP 201 and a reference after persistence. HTTP 400 field errors include errors[].field and errors[].message. Retain the same idempotencyKey when retrying; rate limits apply.'
  ],
  labels: submissionLabels,
  options: submissionOptions,
  materialConsentVersion,
  materialConsentText,
  schema: z.toJSONSchema(SubmissionSchema),
  examples: {
    alternative: {
      kind: 'site',
      language: 'en',
      submissionType: 'new',
      name: 'Example project',
      url: 'https://example.com',
      category: 'Productivity',
      positioning: 'alternative',
      alternativeTargets: 'Notion',
      pricing: 'unknown',
      registration: 'unknown',
      summary: 'Illustrative project; replace this text with verified facts.',
      reason: 'Explain the actual replaced features and limitations here.',
      relationship: 'user',
      contactEmail: 'submitter@example.com',
      allowContact: true,
      promotionConsent: false,
      materialConsent: false,
      declaration: true,
      startedAt: 0,
      idempotencyKey: 'REPLACE_WITH_UUID',
      turnstileToken: 'REPLACE_WITH_GENUINE_TOKEN'
    },
    original: {
      kind: 'site',
      language: 'zh',
      submissionType: 'new',
      name: '独创示例（仅说明格式）',
      url: 'https://example.com',
      category: '工具',
      positioning: 'original',
      alternativeTargets: '',
      pricing: 'unknown',
      registration: 'unknown',
      summary: '此处填写经核实的实际用途，示例不是可直接提交的项目。',
      reason: '此处说明独创点和真实使用场景，不应宣称已获本站认证。',
      relationship: 'user',
      contactEmail: 'submitter@example.com',
      allowContact: true,
      promotionConsent: false,
      materialConsent: false,
      declaration: true,
      startedAt: 0,
      idempotencyKey: 'REPLACE_WITH_UUID',
      turnstileToken: 'REPLACE_WITH_GENUINE_TOKEN'
    }
  }
}))
