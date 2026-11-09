<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref
} from 'vue'
import {
  submissionLabels,
  submissionOptions,
  SubmissionSchema
} from '../../types/Submission'

const props = defineProps<{ kind: 'site' | 'request' }>()
const language = ref<'zh' | 'en'>('zh')
const tr = (zh: string, en: string) => (language.value === 'en' ? en : zh)
const title = computed(() =>
  props.kind === 'site'
    ? tr('网站信息提交', 'Submit a project')
    : tr('用户需求提交', 'Submit a request')
)
const form = reactive({
  kind: props.kind,
  language: 'zh',
  submissionType: 'new',
  name: '',
  url: '',
  category: '',
  positioning: '',
  alternativeTargets: '',
  languages: '',
  pricing: '',
  registration: '',
  summary: '',
  details: '',
  reason: '',
  limitations: '',
  references: '',
  relationship: 'user',
  promotionConsent: false,
  promotionalText: '',
  videoUrl: '',
  materialConsent: false,
  supportStatus: props.kind === 'site' ? 'willing' : '',
  supportLinks: '',
  requestType: 'find-tool',
  title: '',
  problem: '',
  desiredOutcome: '',
  scenario: 'personal',
  currentMethod: '',
  currentIssues: '',
  platform: '',
  regionLanguage: '',
  pricePreference: 'free',
  openSource: 'not-required',
  impact: 'minor',
  contactEmail: '',
  allowContact: false,
  declaration: false,
  website: '',
  turnstileToken: '',
  startedAt: 0,
  idempotencyKey: ''
})
// One visible control preserves both existing API consent fields.
const promotionalPermission = computed({
  get: () => form.promotionConsent && form.materialConsent,
  set: (allowed: boolean) => {
    form.promotionConsent = allowed
    form.materialConsent = allowed
  }
})
type Field = {
  key: keyof typeof form
  type?: string
  required?: boolean
  max?: number
  min?: number
  hint?: string
  placeholder?: string
  half?: boolean
}
const groups = computed<{ title: string; fields: Field[] }[]>(() => {
  const isNew = form.submissionType === 'new'
  const siteGroups: { title: string; fields: Field[] }[] = [
    {
      title: tr('项目信息', 'Project information'),
      fields: [
        { key: 'submissionType', required: true, half: true },
        { key: 'relationship', required: true, half: true },
        { key: 'name', required: true, max: 120 },
        { key: 'url', type: 'url', required: true, max: 2048 },
        { key: 'category', required: isNew, max: 120, half: true },
        { key: 'languages', max: 300, half: true },
        { key: 'pricing', required: isNew, half: true },
        { key: 'registration', required: isNew, half: true }
      ]
    },
    {
      title: tr('平替价值／独创点', 'Alternative value / original idea'),
      fields: [
        {
          key: 'positioning',
          type: 'radio',
          required: isNew
        },
        {
          key: 'alternativeTargets',
          required: isNew && form.positioning === 'alternative',
          max: 300,
          placeholder: tr(
            '例如 Notion, Canva（多个用逗号分隔，独创项目留空）',
            'e.g. Notion, Canva (comma-separated; leave blank for original projects)'
          )
        },
        {
          key: 'summary',
          required: isNew,
          min: isNew ? 10 : undefined,
          max: 240
        },
        {
          key: 'reason',
          type: 'textarea',
          required: true,
          min: 10,
          max: 2000,
          placeholder: tr(
            '说明替代哪些功能、独创点和使用场景，或需更新/纠正的问题',
            'Describe replaced features, the original idea and use case, or the requested correction'
          )
        },
        { key: 'details', type: 'textarea', max: 3000 }
      ]
    },
    {
      title: tr('社媒宣传与素材', 'Social promotion and materials'),
      fields: [
        {
          key: 'promotionConsent',
          type: 'checkbox'
        },
        {
          key: 'promotionalText',
          type: 'textarea',
          max: 3000,
          placeholder: tr(
            '留空则默认使用上方的项目介绍进行宣传',
            'Leave blank to use the project description above for promotion'
          )
        },
        {
          key: 'videoUrl',
          type: 'url',
          max: 2048,
          placeholder: tr(
            '提供无需登录即可下载的 HTTP(S) 视频链接',
            'HTTP(S) video link downloadable without signing in'
          )
        }
      ]
    },
    {
      title: tr('相互支持', 'Mutual support'),
      fields: [
        { key: 'supportStatus' },
        {
          key: 'supportLinks',
          type: 'textarea',
          max: 3000,
          placeholder: tr(
            '如已添加友链或发布推荐，请贴入对应 URL',
            'Paste the URL of the page or post linking to or recommending pingti.org'
          )
        }
      ]
    }
  ]
  const requestGroups: { title: string; fields: Field[] }[] = [
    {
      title: tr('需求概述', 'Request overview'),
      fields: [
        { key: 'requestType', required: true },
        { key: 'title', required: true, min: 4, max: 140 },
        {
          key: 'problem',
          type: 'textarea',
          required: true,
          min: 20,
          max: 3000
        },
        {
          key: 'desiredOutcome',
          type: 'textarea',
          required: true,
          min: 10,
          max: 2000
        },
        { key: 'scenario', required: true }
      ]
    },
    {
      title: tr('条件与背景', 'Requirements and context'),
      fields: [
        { key: 'currentMethod', type: 'textarea', max: 3000 },
        { key: 'currentIssues', type: 'textarea', max: 3000 },
        { key: 'platform', max: 300 },
        { key: 'regionLanguage', max: 300 },
        { key: 'pricePreference', required: true },
        { key: 'openSource', required: true },
        { key: 'impact', required: true },
        { key: 'references', type: 'textarea', max: 3000 }
      ]
    }
  ]
  return [
    ...(props.kind === 'site' ? siteGroups : requestGroups),
    {
      title: tr('联系方式', 'Contact information'),
      fields: [
        {
          key: 'contactEmail',
          type: 'email',
          required: props.kind === 'site',
          max: 254,
          placeholder:
            props.kind === 'site'
              ? tr(
                  '仅用于审核沟通，不公开显示',
                  'For review communication only; not displayed publicly'
                )
              : undefined,
          hint:
            props.kind === 'site'
              ? undefined
              : tr(
                  '仅用于审核及补充确认，不公开显示。网站提报必填；用户需求选填。',
                  'Used only for review and follow-up, never displayed publicly. Required for projects; optional for requests.'
                )
        },
        ...(props.kind === 'site'
          ? []
          : [
              {
                key: 'allowContact',
                type: 'checkbox',
                required: props.kind === 'site'
              } as Field
            ])
      ]
    }
  ]
})
const fieldLabel = (key: string) => {
  if (props.kind === 'site' && key === 'supportStatus') {
    return tr(
      '反向链接或社媒推荐（添加友链或推荐可优先审核）',
      'Backlink or social recommendation (links or recommendations may receive priority review)'
    )
  }
  if (props.kind === 'site' && key === 'supportLinks') {
    return tr(
      '友链所在页面或推荐帖链接',
      'Backlink page or recommendation post URL'
    )
  }
  if (props.kind === 'site' && key === 'promotionConsent') {
    return tr(
      '允许 pingti.org 在社交媒体宣传本项目，并授权使用及合理剪辑、润色或翻译所提供的素材（保持原意）。',
      'Allow pingti.org to promote this project on social media and use, reasonably edit, polish, or translate the supplied materials while preserving their original meaning.'
    )
  }
  const label = submissionLabels[key]?.[language.value === 'en' ? 1 : 0] || key
  return props.kind === 'site'
    ? label.replace(/（(?:选填|自愿)）|\s*\((?:optional|voluntary)\)/g, '')
    : label
}
const optionLabel = (key: string, option: string[]) => {
  if (props.kind === 'site' && key === 'supportStatus') {
    const labels: Record<string, string> = {
      willing: tr(
        '愿意在特定网站添加 pingti.org 友链 / 推荐',
        'Willing to add a pingti.org link / recommendation on a specific website'
      ),
      shared: tr(
        '已在网站或社媒推荐（请在下方贴入链接）',
        'Already recommended on a website or social media (paste the link below)'
      ),
      none: tr('暂不方便', 'Not convenient at the moment')
    }
    return labels[option[0]] || option[language.value === 'en' ? 2 : 1]
  }
  return option[language.value === 'en' ? 2 : 1]
}
const formElement = ref<HTMLFormElement>()
const turnstileElement = ref<HTMLElement>()
const errorSummary = ref<HTMLElement>()
const submitting = ref(false)
const errorMessage = ref('')
const fieldErrors = ref<{ field: string; message: string }[]>([])
const successReference = ref('')
const verificationError = ref(false)
let widgetId: string | undefined

declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id: string) => void
    }
  }
}
function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve()
  return new Promise((resolve, reject) => {
    // Remove a previously failed script so retry really loads it again.
    document.querySelector('script[data-pingti-turnstile]')?.remove()
    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.dataset.pingtiTurnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })
}
async function renderTurnstile() {
  verificationError.value = false
  try {
    await loadTurnstile()
    await nextTick()
    if (!turnstileElement.value || !window.turnstile) return
    if (widgetId) window.turnstile.remove(widgetId)
    widgetId = undefined
    form.turnstileToken = ''
    const isLocal = ['localhost', '127.0.0.1'].includes(
      window.location.hostname
    )
    widgetId = window.turnstile.render(turnstileElement.value, {
      sitekey: isLocal
        ? '1x00000000000000000000AA'
        : '0x4AAAAAAD4x5rqgwGKvCqKa',
      theme: 'auto',
      size: 'flexible',
      language: language.value === 'en' ? 'en' : 'zh-cn',
      callback: (token: string) => {
        form.turnstileToken = token
      },
      'expired-callback': () => {
        form.turnstileToken = ''
      },
      'error-callback': () => {
        form.turnstileToken = ''
        verificationError.value = true
      }
    })
  } catch {
    verificationError.value = true
  }
}
async function setLanguage(value: 'zh' | 'en') {
  language.value = value
  form.language = value
  errorMessage.value = ''
  fieldErrors.value = []
  const url = new URL(window.location.href)
  url.searchParams.set('lang', value)
  window.history.replaceState(window.history.state, '', url)
  document.title = `${title.value} • Pingti`
  await renderTurnstile()
}
function issueText(field: string, message: string) {
  const name = fieldLabel(field)
  if (language.value === 'en') return `${name}: ${message}`
  if (field === 'turnstileToken')
    return '真人验证尚未完成或已经过期，请重新验证。'
  if (field === 'relationship')
    return '宣传或素材授权需由站长、开发者或获授权人员确认，请检查与项目的关系。'
  if (field === 'promotionConsent')
    return '授权使用素材前，请先明确允许社媒宣传。'
  if (field === 'promotionalText' && form.materialConsent)
    return '已授权使用素材，请提供宣传文案或可下载的视频链接。'
  if (field === 'videoUrl' || field === 'url')
    return `${name}：请填写有效的 HTTP(S) 地址。`
  const config = groups.value
    .flatMap((group) => group.fields)
    .find((item) => item.key === field)
  if (config?.min)
    return `${name}：请至少填写 ${config.min} 个字符，最多 ${config.max} 个字符。`
  if (config?.max)
    return `${name}：请检查是否填写，长度不超过 ${config.max} 个字符。`
  return `${name}：请填写或选择有效内容。`
}
async function submit() {
  if (submitting.value) return
  errorMessage.value = ''
  fieldErrors.value = []
  const parsed = SubmissionSchema.safeParse(form)
  if (!parsed.success) {
    fieldErrors.value = parsed.error.issues.map((issue) => ({
      field: String(issue.path[0]),
      message: issueText(String(issue.path[0]), issue.message)
    }))
  }
  if (!formElement.value?.checkValidity() && !fieldErrors.value.length) {
    formElement.value?.reportValidity()
    return
  }
  if (fieldErrors.value.length) {
    errorMessage.value = tr(
      '请修正以下项目，已填写内容会保留。',
      'Please correct the following fields. Entered information is preserved.'
    )
    await nextTick()
    errorSummary.value?.focus()
    return
  }
  submitting.value = true
  try {
    const response = await fetch('https://api.pingti.org/submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
      signal: AbortSignal.timeout(30000)
    })
    const result = (await response.json().catch(() => ({}))) as {
      reference?: string
      errors?: { field: string; message: string }[]
    }
    if (!response.ok || !result.reference) {
      fieldErrors.value = (result.errors || []).map((issue) => ({
        field: issue.field,
        message: issueText(issue.field, issue.message)
      }))
      if (response.status === 429)
        throw new Error(
          tr(
            '提交次数过多，请稍后再试。',
            'Too many submissions. Please try again later.'
          )
        )
      throw new Error(
        fieldErrors.value.length
          ? tr(
              '请修正以下项目后重试。',
              'Please correct the following fields and retry.'
            )
          : tr(
              '提交暂未成功，请重试；已填写内容仍保留在本页。',
              'Submission could not be confirmed. Please retry; entered information remains on this page.'
            )
      )
    }
    successReference.value = result.reference
  } catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : tr('提交失败，请重试。', 'Submission failed. Please retry.')
    form.turnstileToken = ''
    window.turnstile?.reset(widgetId)
    await nextTick()
    errorSummary.value?.focus()
  } finally {
    submitting.value = false
  }
}
function submitAnother() {
  window.location.reload()
}
onMounted(() => {
  form.startedAt = Date.now()
  form.idempotencyKey = crypto.randomUUID()
  if (new URLSearchParams(window.location.search).get('lang') === 'en') {
    language.value = 'en'
    form.language = 'en'
  }
  document.title = `${title.value} • Pingti`
  renderTurnstile()
})
onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})
</script>

<template>
  <div
    class="submission-shell"
    :class="{ 'submission-site': props.kind === 'site' }"
    :lang="language === 'en' ? 'en' : 'zh-CN'"
  >
    <div class="form-languages" aria-label="Form language / 表单语言">
      <button
        type="button"
        :aria-pressed="language === 'zh'"
        @click="setLanguage('zh')"
      >
        简体中文
      </button>
      <button
        type="button"
        :aria-pressed="language === 'en'"
        @click="setLanguage('en')"
      >
        English
      </button>
    </div>
    <h1>{{ title }}</h1>
    <p v-if="props.kind === 'site'" class="submission-intro">
      {{
        tr(
          '信息经审核后发布，带 * 为必填项。',
          'Information is published after review. * marks required fields.'
        )
      }}
    </p>
    <p v-else>
      {{
        tr(
          '欢迎人工或 AI 代理代填。信息先进入审核队列，不会自动发布。带 * 的字段为必填，其余可留空。',
          'People and AI agents are welcome to submit. Information enters a review queue and is not published automatically. Fields marked * are required; other fields may be left blank.'
        )
      }}
    </p>
    <nav
      class="submission-nav"
      :aria-label="tr('提交入口', 'Submission pages')"
    >
      <a :href="`/submit/site?lang=${language}`">
        {{ tr('提交网站信息', 'Submit a project') }}
      </a>
      <a :href="`/submit/request?lang=${language}`">
        {{ tr('提交用户需求', 'Submit a request') }}
      </a>
      <a href="/submit/">{{ tr('提交说明', 'Submission guide') }}</a>
    </nav>
    <div v-if="successReference" class="submission-success" aria-live="polite">
      <h2>{{ tr('提交成功', 'Submission received') }}</h2>
      <p>
        {{ tr('提交编号', 'Reference') }}：
        <strong>{{ successReference }}</strong>
      </p>
      <p>
        {{
          tr(
            '内容已安全保存并进入审核队列。如需补充信息，请在邮件中注明该编号。',
            'Information has been saved for review. Quote this reference when emailing additional information.'
          )
        }}
      </p>
      <div class="success-actions">
        <button type="button" class="button primary" @click="submitAnother">
          {{ tr('再提交一条', 'Submit another') }}
        </button>
        <a class="button secondary" href="/">
          {{ tr('返回首页', 'Back to home') }}
        </a>
      </div>
    </div>
    <form v-else ref="formElement" novalidate @submit.prevent="submit">
      <input
        v-if="props.kind === 'site'"
        name="materialConsent"
        type="hidden"
        :value="form.materialConsent ? 'true' : 'false'"
      />
      <aside
        v-if="props.kind !== 'site'"
        class="submission-instructions"
        aria-labelledby="ai-instructions"
      >
        <h2 id="ai-instructions">
          {{
            tr(
              '填写说明（人工与 AI 通用）',
              'Instructions for people and AI agents'
            )
          }}
        </h2>
        <p>
          {{
            tr(
              '全部业务字段直接展示，无需点击展开。新项目必选平替或独创；选择平替须填写具体对象，独创可留空。不会因 AI 代填而降低审核评价。',
              'All business fields are visible without expanding sections. New projects must choose Alternative or Original. Alternatives require specific target names; original projects may leave targets blank. AI-assisted submissions receive the same review standards.'
            )
          }}
        </p>
        <p>
          {{
            tr(
              '不清楚的信息请选择“不清楚”或留空，不要编造。只有委托方明确许可时才能勾选宣传和素材授权。未授权素材仅供内部审核。真人验证可能需要人工协助。',
              'Choose Unknown or leave optional information blank rather than inventing facts. Grant promotional and material permissions only when explicitly authorized by the principal. Unlicensed materials are for internal review only. Verification may require human assistance.'
            )
          }}
        </p>
        <a
          href="https://api.pingti.org/submissions"
          target="_blank"
          rel="noopener"
        >
          {{
            tr(
              '查看机器可读字段规范与示例（JSON）',
              'Machine-readable field specification and examples (JSON)'
            )
          }}
        </a>
      </aside>
      <div
        v-if="errorMessage"
        ref="errorSummary"
        class="error-summary"
        role="alert"
        tabindex="-1"
      >
        <strong>{{ errorMessage }}</strong>
        <ul v-if="fieldErrors.length">
          <li v-for="(error, index) in fieldErrors" :key="index">
            <a
              :href="`#${error.field === 'turnstileToken' ? 'verification' : error.field}`"
            >
              {{ error.message }}
            </a>
          </li>
        </ul>
      </div>
      <fieldset v-for="group in groups" :key="group.title" class="form-card">
        <legend>{{ group.title }}</legend>
        <div class="form-fields">
          <div
            v-for="field in group.fields"
            :key="field.key"
            class="field"
            :class="{ 'field-half': field.half }"
          >
            <label
              v-if="field.type === 'checkbox'"
              class="check-row"
              :for="field.key"
            >
              <input
                v-if="props.kind === 'site' && field.key === 'promotionConsent'"
                id="promotionConsent"
                v-model="promotionalPermission"
                name="promotionConsent"
                type="checkbox"
              />
              <input
                v-else
                :id="field.key"
                v-model="form[field.key]"
                :name="field.key"
                type="checkbox"
                :required="field.required"
                :aria-describedby="
                  props.kind === 'site' ? undefined : `${field.key}-hint`
                "
              />
              <span>
                {{ fieldLabel(field.key) }}
                <b v-if="field.required">*</b>
              </span>
            </label>
            <template v-else-if="field.type === 'radio'">
              <span :id="`${field.key}-label`" class="field-label">
                {{ fieldLabel(field.key) }}
                <b v-if="field.required">*</b>
              </span>
              <div
                :id="field.key"
                class="position-options"
                role="radiogroup"
                :aria-labelledby="`${field.key}-label`"
                :aria-describedby="
                  props.kind === 'site' ? undefined : `${field.key}-hint`
                "
              >
                <label
                  v-for="option in submissionOptions[field.key]"
                  :key="option[0]"
                  class="check-row position-option"
                >
                  <input
                    v-model="form[field.key]"
                    :name="field.key"
                    type="radio"
                    :value="option[0]"
                    :required="field.required"
                  />
                  <span>
                    {{
                      option[0] === 'original'
                        ? tr('独创项目', 'Original project')
                        : option[language === 'en' ? 2 : 1]
                    }}
                  </span>
                </label>
              </div>
            </template>
            <template v-else>
              <label :for="field.key">
                {{ fieldLabel(field.key) }}
                <span v-if="field.required">*</span>
              </label>
              <select
                v-if="submissionOptions[field.key]"
                :id="field.key"
                v-model="form[field.key]"
                :name="field.key"
                :required="field.required"
                :aria-describedby="
                  props.kind === 'site' ? undefined : `${field.key}-hint`
                "
              >
                <option value="">{{ tr('请选择', 'Please select') }}</option>
                <option
                  v-for="option in submissionOptions[field.key]"
                  :key="option[0]"
                  :value="option[0]"
                >
                  {{ optionLabel(field.key, option) }}
                </option>
              </select>
              <textarea
                v-else-if="field.type === 'textarea'"
                :id="field.key"
                v-model.trim="form[field.key]"
                :name="field.key"
                :required="field.required"
                :minlength="field.min"
                :maxlength="field.max"
                :rows="props.kind === 'site' ? 3 : 4"
                :placeholder="field.placeholder"
                :aria-describedby="
                  props.kind === 'site' ? undefined : `${field.key}-hint`
                "
              ></textarea>
              <input
                v-else
                :id="field.key"
                v-model.trim="form[field.key]"
                :name="field.key"
                :type="field.type || 'text'"
                :required="field.required"
                :minlength="field.min"
                :maxlength="field.max"
                :placeholder="field.placeholder"
                :autocomplete="
                  field.key === 'contactEmail' ? 'email' : undefined
                "
                :aria-describedby="
                  props.kind === 'site' ? undefined : `${field.key}-hint`
                "
              />
            </template>
            <small v-if="props.kind !== 'site'" :id="`${field.key}-hint`">
              {{
                field.hint ||
                (field.max
                  ? tr(
                      `最多 ${field.max} 个字符。`,
                      `Up to ${field.max} characters.`
                    )
                  : '')
              }}
            </small>
          </div>
        </div>
      </fieldset>
      <fieldset id="verification" class="form-card verification-card">
        <legend>{{ tr('验证与提交', 'Verification and submission') }}</legend>
        <div class="submission-confirmations">
          <label
            v-if="props.kind === 'site'"
            class="check-row"
            for="allowContact"
          >
            <input
              id="allowContact"
              v-model="form.allowContact"
              name="allowContact"
              type="checkbox"
              required
            />
            <span>
              {{ fieldLabel('allowContact') }}
              <b>*</b>
            </span>
          </label>
          <label class="check-row required-check" for="declaration">
            <input
              id="declaration"
              v-model="form.declaration"
              name="declaration"
              type="checkbox"
              required
            />
            <span>
              {{
                tr(
                  '我确认信息真实，且没有提交密码或个人敏感信息。',
                  'I confirm that the information is accurate and contains no passwords or sensitive personal data.'
                )
              }}
              <b>*</b>
            </span>
          </label>
        </div>
        <div class="hp-field" aria-hidden="true">
          <label for="company-website">Leave empty</label>
          <input
            id="company-website"
            v-model="form.website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>
        <div class="turnstile-wrap">
          <div
            ref="turnstileElement"
            :aria-label="tr('真人验证', 'Human verification')"
          ></div>
          <p v-if="verificationError" role="alert">
            {{
              tr(
                '验证加载失败，请检查网络并重新加载。',
                'Verification could not load. Check the connection and reload verification.'
              )
            }}
          </p>
          <button type="button" class="text-button" @click="renderTurnstile">
            {{ tr('重新加载验证', 'Reload verification') }}
          </button>
        </div>
        <button class="submit-button" type="submit" :disabled="submitting">
          {{
            submitting
              ? tr('正在提交…', 'Submitting…')
              : props.kind === 'site'
                ? tr('提交网站信息', 'Submit a project')
                : tr('提交用户需求', 'Submit a request')
          }}
        </button>
      </fieldset>
    </form>
  </div>
</template>

<style scoped>
.form-languages,
.submission-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0 0 20px;
}
.form-languages button {
  padding: 8px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
  cursor: pointer;
}
.form-languages button[aria-pressed='true'] {
  font-weight: 700;
  background: var(--vp-c-bg-alt);
  border-color: var(--vp-c-text-2);
}
.submission-instructions {
  margin: 24px 0;
  font-size: 14px;
  line-height: 1.7;
}
.submission-instructions h2 {
  margin-top: 24px;
  font-size: 18px;
}
.position-options {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.position-option {
  margin: 0 !important;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
}
.field-label {
  color: var(--vp-c-text-1);
  font-weight: 600;
}
.field-label b,
.check-row b {
  color: var(--vp-c-danger-1);
}
.field,
.submission-success {
  overflow-wrap: anywhere;
}
.submission-shell {
  max-width: 720px;
  margin: 28px 0 56px;
}
.form-card {
  min-width: 0;
  margin: 0 0 20px;
  padding: 22px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-alt);
}
.form-card legend {
  padding: 0 8px;
  color: var(--vp-c-text-1);
  font-size: 17px;
  font-weight: 700;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-bottom: 18px;
}
.field:last-child {
  margin-bottom: 0;
}
.field-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
.field-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
label {
  color: var(--vp-c-text-1);
  font-size: 14px;
  font-weight: 600;
}
label span,
.required-check b {
  color: var(--vp-c-danger-1);
}
input,
select,
textarea {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font: inherit;
  font-size: 16px;
}
input,
select {
  min-height: 44px;
  padding: 0 12px;
}
textarea {
  padding: 10px 12px;
  resize: vertical;
  line-height: 1.55;
}
input:focus-visible,
select:focus-visible,
textarea:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--vp-c-brand-1) 35%, transparent);
  outline-offset: 2px;
  border-color: var(--vp-c-brand-1);
}
small {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.55;
}
.check-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 12px 0;
  cursor: pointer;
  font-weight: 500;
}
.check-row input {
  width: 18px;
  min-height: 18px;
  margin-top: 2px;
  flex: 0 0 auto;
}
.check-row span {
  color: var(--vp-c-text-1);
}
.turnstile-wrap {
  width: 100%;
  margin: 20px 0;
  min-height: 65px;
}
.submit-button,
.button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 0 20px;
  border: 1px solid transparent;
  border-radius: 8px;
  font-weight: 700;
  text-decoration: none !important;
  cursor: pointer;
}
.submit-button,
.button.primary {
  background: var(--vp-c-brand-1);
  color: var(--vp-c-white);
}
.submit-button:hover,
.button.primary:hover {
  background: var(--vp-c-brand-2);
}
.submit-button:disabled {
  opacity: 0.65;
  cursor: wait;
}
.button.secondary {
  border-color: var(--vp-c-divider);
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
.error-summary {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin: 0 0 20px;
  padding: 14px 16px;
  border: 1px solid var(--vp-c-danger-1);
  border-radius: 10px;
  background: var(--vp-c-danger-soft);
  color: var(--vp-c-text-1);
}
.hp-field {
  position: absolute !important;
  left: -10000px !important;
  width: 1px !important;
  height: 1px !important;
  overflow: hidden !important;
}
.text-button {
  margin-top: 8px;
  padding: 6px 0;
  border: 0;
  background: transparent;
  color: var(--vp-c-brand-1);
  font-weight: 600;
  cursor: pointer;
}
.submission-success {
  padding: 32px;
  text-align: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-alt);
}
.success-icon {
  display: grid;
  place-items: center;
  width: 52px;
  height: 52px;
  margin: 0 auto 14px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 28px;
  font-weight: 800;
}
.success-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 22px;
}
.submission-site {
  margin: 16px 0 32px;
}
.submission-site h1 {
  margin: 12px 0 6px;
}
.submission-site .form-languages {
  gap: 8px;
  margin-bottom: 8px;
}
.submission-site .form-languages button {
  padding: 6px 12px;
}
.submission-site .submission-intro {
  margin: 6px 0 10px;
  font-size: 14px;
  line-height: 1.6;
}
.submission-site .submission-nav {
  gap: 12px;
  margin-bottom: 14px;
  font-size: 14px;
}
.submission-site .form-card {
  margin-bottom: 12px;
  padding: 12px 16px 16px;
}
.submission-site .form-card legend {
  padding: 0 6px;
  font-size: 16px;
}
.submission-site .form-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}
.submission-site .field {
  grid-column: 1 / -1;
  gap: 4px;
  margin: 0;
  min-width: 0;
}
.submission-site .field-half {
  grid-column: auto;
}
.submission-site input,
.submission-site select {
  min-height: 40px;
  padding-inline: 10px;
}
.submission-site textarea {
  padding: 8px 10px;
}
.submission-site input::placeholder,
.submission-site textarea::placeholder {
  color: var(--vp-c-text-2);
  opacity: 1;
}
.submission-site .check-row {
  gap: 8px;
  margin: 0;
}
.submission-site .check-row input {
  min-height: 18px;
  padding: 0;
}
.submission-site .position-options {
  gap: 8px;
}
.submission-site .position-option {
  padding: 8px 12px;
}
.submission-site .submission-confirmations {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 20px;
}
.submission-site .turnstile-wrap {
  min-height: 0;
  margin: 8px 0;
}
.submission-site .text-button {
  margin: 0;
  padding: 4px 0;
}
@media (max-width: 700px) {
  .form-card {
    padding: 18px 14px;
  }
  .field-grid,
  .field-grid.three {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .submit-button {
    width: 100%;
  }
  .success-actions {
    flex-direction: column;
  }
  .submission-site .form-card {
    padding: 10px 12px 12px;
  }
  .submission-site .field-half {
    grid-column: 1 / -1;
  }
  .submission-site input,
  .submission-site select {
    min-height: 44px;
  }
  .submission-site .check-row input {
    min-height: 18px;
  }
}
</style>
