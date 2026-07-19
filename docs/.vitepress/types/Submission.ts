import { z } from 'zod'

const OptionalShortText = z.string().trim().max(300).optional().default('')
const OptionalLongText = z.string().trim().max(3000).optional().default('')
const OptionalEmail = z
  .union([z.literal(''), z.string().trim().email().max(254)])
  .optional()
  .default('')

const BaseSubmissionSchema = z.object({
  contactEmail: OptionalEmail,
  allowContact: z.boolean().default(false),
  declaration: z.literal(true),
  website: z.string().max(0).optional().default(''),
  turnstileToken: z.string().min(1).max(2048),
  startedAt: z.number().int().positive(),
  idempotencyKey: z.string().uuid()
})

export const SiteSubmissionSchema = BaseSubmissionSchema.extend({
  kind: z.literal('site'),
  submissionType: z.enum(['new', 'update', 'broken', 'security', 'remove']),
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
  category: z.string().trim().min(1).max(120),
  languages: OptionalShortText,
  pricing: z.enum(['free', 'freemium', 'paid', 'unknown']),
  registration: z.enum(['yes', 'no', 'unknown']),
  summary: z.string().trim().min(10).max(240),
  details: z.string().trim().min(20).max(3000),
  reason: z.string().trim().min(10).max(2000),
  limitations: OptionalLongText,
  references: OptionalLongText,
  relationship: z.enum(['user', 'owner', 'promoter', 'other'])
})

export const RequestSubmissionSchema = BaseSubmissionSchema.extend({
  kind: z.literal('request'),
  requestType: z.enum([
    'find-tool',
    'new-category',
    'feature',
    'correction',
    'accessibility',
    'other'
  ]),
  title: z.string().trim().min(4).max(140),
  problem: z.string().trim().min(20).max(3000),
  desiredOutcome: z.string().trim().min(10).max(2000),
  scenario: z.enum(['personal', 'study', 'work', 'development', 'other']),
  currentMethod: OptionalLongText,
  currentIssues: OptionalLongText,
  platform: OptionalShortText,
  regionLanguage: OptionalShortText,
  pricePreference: z.enum(['free', 'freemium', 'any']),
  openSource: z.enum(['required', 'preferred', 'not-required']),
  references: OptionalLongText,
  impact: z.enum(['minor', 'major', 'blocked'])
})

export const SubmissionSchema = z.discriminatedUnion('kind', [
  SiteSubmissionSchema,
  RequestSubmissionSchema
])

export type Submission = z.infer<typeof SubmissionSchema>
