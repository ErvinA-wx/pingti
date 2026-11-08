import { z } from 'zod'

const OptionalShortText = z.string().trim().max(300).optional().default('')
const OptionalLongText = z.string().trim().max(3000).optional().default('')
const OptionalEmail = z
  .union([z.literal(''), z.string().trim().email().max(254)])
  .optional()
  .default('')

const BaseSubmissionSchema = z.object({
  language: z.enum(['zh', 'en']).default('zh'),
  contactEmail: OptionalEmail,
  allowContact: z.boolean().default(false),
  declaration: z.literal(true),
  website: z.string().max(0).optional().default(''),
  turnstileToken: z.string().min(1).max(2048),
  startedAt: z.number().int().positive(),
  idempotencyKey: z.string().uuid()
})

export const SiteSubmissionSchema = BaseSubmissionSchema.extend({
  contactEmail: z.string().trim().email().max(254),
  allowContact: z.literal(true),
  kind: z.literal('site'),
  submissionType: z.enum(['new', 'update', 'broken', 'security', 'remove']),
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(2048),
  category: z.string().trim().max(120).default(''),
  positioning: z.enum(['alternative', 'original', '']).default(''),
  alternativeTargets: OptionalShortText,
  languages: OptionalShortText,
  pricing: z.enum(['free', 'freemium', 'paid', 'unknown', '']).default(''),
  registration: z.enum(['yes', 'no', 'unknown', '']).default(''),
  summary: z.string().trim().max(240).default(''),
  details: OptionalLongText,
  reason: z.string().trim().min(10).max(2000),
  limitations: OptionalLongText,
  references: OptionalLongText,
  relationship: z.enum(['user', 'owner', 'promoter', 'other']),
  promotionConsent: z.boolean().default(false),
  promotionalText: OptionalLongText,
  videoUrl: z.union([z.literal(''), z.url().max(2048)]).default(''),
  materialConsent: z.boolean().default(false),
  supportStatus: z.enum(['shared', 'willing', 'none', '']).default(''),
  supportLinks: OptionalLongText
}).superRefine((value, ctx) => {
  const required = (
    field: 'category' | 'positioning' | 'alternativeTargets' | 'summary',
    minimum = 1
  ) => {
    if (value[field].length < minimum)
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: `Please provide at least ${minimum} characters.`
      })
  }
  if (value.submissionType === 'new') {
    required('category')
    required('positioning')
    required('summary', 10)
    if (value.positioning === 'alternative') required('alternativeTargets')
    for (const field of ['pricing', 'registration'] as const) {
      if (!value[field])
        ctx.addIssue({
          code: 'custom',
          path: [field],
          message: 'Please choose an option, including Unknown if needed.'
        })
    }
  }
  for (const field of ['url', 'videoUrl'] as const) {
    if (value[field] && !/^https?:\/\//i.test(value[field]))
      ctx.addIssue({
        code: 'custom',
        path: [field],
        message: 'Use an HTTP or HTTPS URL.'
      })
  }
  if (
    (value.promotionConsent || value.materialConsent) &&
    !['owner', 'promoter'].includes(value.relationship)
  ) {
    ctx.addIssue({
      code: 'custom',
      path: ['relationship'],
      message:
        'Only the owner or an authorized representative may grant promotional permission.'
    })
  }
  if (value.materialConsent && !value.promotionConsent)
    ctx.addIssue({
      code: 'custom',
      path: ['promotionConsent'],
      message: 'Material use requires promotional permission.'
    })
  if (value.materialConsent && !value.promotionalText && !value.videoUrl)
    ctx.addIssue({
      code: 'custom',
      path: ['promotionalText'],
      message: 'Provide promotional text or a downloadable video URL.'
    })
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

// Shared by the form, field-level validation, and maintenance emails.
export const submissionLabels: Record<string, [string, string]> = {
  submissionType: ['提交类型', 'Submission type'],
  name: ['项目名称', 'Project name'],
  url: ['项目网址', 'Project URL'],
  category: ['推荐分类', 'Suggested category'],
  positioning: ['项目定位', 'Project positioning'],
  alternativeTargets: [
    '平替了哪些网站、工具或服务',
    'Alternatives to which websites, tools, or services?'
  ],
  languages: ['语言或地区', 'Languages / regions'],
  pricing: ['收费情况', 'Pricing'],
  registration: ['是否需要注册', 'Registration required'],
  summary: ['一句话介绍', 'One-line description'],
  details: ['详细介绍（选填）', 'Detailed description (optional)'],
  reason: [
    '替代价值、独创点或需要修改的内容',
    'Alternative value, original idea, or requested change'
  ],
  limitations: [
    '已知限制或风险（选填）',
    'Known limitations or risks (optional)'
  ],
  references: [
    '参考链接或截图链接（选填）',
    'Reference or screenshot URLs (optional)'
  ],
  relationship: ['与项目的关系', 'Relationship to this project'],
  promotionConsent: [
    '允许 pingti.org 在社交媒体宣传本项目',
    'Allow pingti.org to promote this project on social media'
  ],
  promotionalText: [
    '宣传文案／项目介绍（选填）',
    'Promotional text / project introduction (optional)'
  ],
  videoUrl: ['可下载的视频链接（选填）', 'Downloadable video URL (optional)'],
  materialConsent: [
    '素材使用与合理修订授权',
    'Permission to use and reasonably edit promotional materials'
  ],
  supportStatus: [
    '是否已通过网站或社交媒体介绍 pingti.org（选填）',
    'Has pingti.org been featured on a website or social media? (optional)'
  ],
  supportLinks: [
    '介绍 pingti.org 的网页或帖子链接（选填）',
    'Webpage or post URLs featuring pingti.org (optional)'
  ],
  requestType: ['需求类型', 'Request type'],
  title: ['需求标题', 'Request title'],
  problem: ['想解决的问题', 'Problem to solve'],
  desiredOutcome: ['期望结果', 'Desired outcome'],
  scenario: ['使用场景', 'Use case'],
  currentMethod: [
    '当前使用的方法或工具（选填）',
    'Current method or tools (optional)'
  ],
  currentIssues: [
    '现有方案为什么不合适（选填）',
    'Why the current solution is unsuitable (optional)'
  ],
  platform: ['平台或设备（选填）', 'Platform or device (optional)'],
  regionLanguage: ['地区或语言（选填）', 'Region or language (optional)'],
  pricePreference: ['价格偏好', 'Pricing preference'],
  openSource: ['开源要求', 'Open-source preference'],
  impact: ['影响程度', 'Impact'],
  contactEmail: ['联系邮箱', 'Contact email'],
  allowContact: ['允许后续联系', 'Allow follow-up contact'],
  declaration: [
    '确认信息真实且不含个人敏感资料',
    'Confirm accurate information without sensitive personal data'
  ],
  turnstileToken: ['真人验证', 'Human verification']
}

export const submissionOptions: Record<string, [string, string, string][]> = {
  submissionType: [
    ['new', '推荐新项目', 'New project'],
    ['update', '更新已有信息', 'Update project'],
    ['broken', '报告链接失效', 'Broken link'],
    ['security', '报告安全问题', 'Security issue'],
    ['remove', '申请移除', 'Removal request']
  ],
  positioning: [
    ['alternative', '平替项目', 'Alternative project'],
    [
      'original',
      '独创项目（自报，重点审核）',
      'Original project (self-declared, highlighted for review)'
    ]
  ],
  pricing: [
    ['free', '免费', 'Free'],
    ['freemium', '部分免费', 'Freemium'],
    ['paid', '付费', 'Paid'],
    ['unknown', '不清楚', 'Unknown']
  ],
  registration: [
    ['yes', '是', 'Yes'],
    ['no', '否', 'No'],
    ['unknown', '不清楚', 'Unknown']
  ],
  relationship: [
    ['user', '普通用户', 'User'],
    ['owner', '站长或开发者', 'Owner / developer'],
    ['promoter', '获授权的推广人员', 'Authorized representative'],
    ['other', '其他', 'Other']
  ],
  supportStatus: [
    ['shared', '已经介绍', 'Already shared'],
    ['willing', '愿意之后支持', 'Willing to share later'],
    ['none', '暂未介绍', 'Not yet']
  ],
  requestType: [
    ['find-tool', '寻找替代品', 'Find an alternative'],
    ['new-category', '新增分类', 'Suggest a category'],
    ['feature', '网站功能', 'Feature request'],
    ['correction', '内容纠错', 'Content correction'],
    ['accessibility', '无障碍', 'Accessibility'],
    ['other', '其他', 'Other']
  ],
  scenario: [
    ['personal', '个人', 'Personal'],
    ['study', '学习', 'Study'],
    ['work', '工作', 'Work'],
    ['development', '开发', 'Development'],
    ['other', '其他', 'Other']
  ],
  pricePreference: [
    ['free', '必须免费', 'Free only'],
    ['freemium', '可接受部分免费', 'Freemium accepted'],
    ['any', '均可', 'Any']
  ],
  openSource: [
    ['not-required', '不要求', 'Not required'],
    ['preferred', '优先开源', 'Preferred'],
    ['required', '必须开源', 'Required']
  ],
  impact: [
    ['minor', '一般', 'Minor'],
    ['major', '造成不便', 'Major inconvenience'],
    ['blocked', '无法完成任务', 'Unable to complete the task']
  ]
}

export const materialConsentText: [string, string] = [
  '本人确认有权提供并授权使用上述资料，同意 pingti.org 为介绍本项目，在其社交媒体账号中使用这些资料，并进行必要的翻译、文字润色、剪辑、字幕、裁切和格式调整。修订应保持原意，不夸大或歪曲项目功能。',
  'I confirm that I have the right to provide and authorize the use of these materials. I allow pingti.org to use them on its social media accounts to introduce this project, including reasonable translation, copy editing, video editing, subtitles, cropping, and format changes. Edits must preserve the original meaning and must not exaggerate or misrepresent the project.'
]
export const materialConsentVersion = '2026-11-08'
