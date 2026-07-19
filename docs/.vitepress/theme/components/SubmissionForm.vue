<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'

const props = defineProps<{ kind: 'site' | 'request' }>()
const kind = props.kind

const API_URL = 'https://api.pingti.org/submissions'
const PRODUCTION_SITE_KEY = '0x4AAAAAAD4x5rqgwGKvCqKa'
const TEST_SITE_KEY = '1x00000000000000000000AA'

const form = reactive({
  kind: props.kind,
  submissionType: 'new',
  name: '',
  url: '',
  category: '',
  languages: '',
  pricing: 'free',
  registration: 'no',
  summary: '',
  details: '',
  reason: '',
  limitations: '',
  references: '',
  relationship: 'user',
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

const formElement = ref<HTMLFormElement>()
const turnstileElement = ref<HTMLElement>()
const errorSummary = ref<HTMLElement>()
const submitting = ref(false)
const errorMessage = ref('')
const successReference = ref('')
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
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-pingti-turnstile]'
    )
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(), { once: true })
      return
    }
    const script = document.createElement('script')
    script.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
    script.async = true
    script.defer = true
    script.dataset.pingtiTurnstile = 'true'
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(script)
  })
}

async function renderTurnstile() {
  errorMessage.value = ''
  try {
    await loadTurnstile()
    await nextTick()
    if (!turnstileElement.value || !window.turnstile || widgetId) return
    const isLocal = ['localhost', '127.0.0.1'].includes(
      window.location.hostname
    )
    const sitekey = isLocal ? TEST_SITE_KEY : PRODUCTION_SITE_KEY
    widgetId = window.turnstile.render(turnstileElement.value, {
      sitekey,
      theme: 'auto',
      size: 'flexible',
      language: 'zh-cn',
      callback: (token: string) => {
        form.turnstileToken = token
      },
      'expired-callback': () => {
        form.turnstileToken = ''
      },
      'error-callback': () => {
        form.turnstileToken = ''
        errorMessage.value = '真人验证加载失败，请重新加载验证。'
      }
    })
  } catch {
    errorMessage.value = '真人验证加载失败，请检查网络后重新加载。'
  }
}

function newAttempt() {
  form.startedAt = Date.now()
  form.idempotencyKey = crypto.randomUUID()
  form.turnstileToken = ''
}

function resetTurnstile() {
  form.turnstileToken = ''
  window.turnstile?.reset(widgetId)
}

async function submit() {
  errorMessage.value = ''
  if (!formElement.value?.reportValidity()) {
    errorMessage.value = '请检查标有错误或尚未填写的必填项目。'
  } else if (!form.turnstileToken) {
    errorMessage.value = '请先完成人机验证。'
  }

  if (errorMessage.value) {
    await nextTick()
    errorSummary.value?.focus()
    return
  }

  submitting.value = true
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const result = (await response.json().catch(() => ({}))) as {
      reference?: string
    }
    if (!response.ok || !result.reference) {
      if (response.status === 429) {
        throw new Error('提交次数过多，请稍后再试。')
      }
      if (response.status === 400) {
        throw new Error('验证已失效或填写内容不完整，请重新验证后再试。')
      }
      throw new Error('提交服务暂时不可用，已填写内容仍会保留。')
    }
    successReference.value = result.reference
  } catch (error) {
    errorMessage.value =
      error instanceof Error ? error.message : '提交失败，请稍后再试。'
    resetTurnstile()
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
  newAttempt()
  renderTurnstile()
})

onBeforeUnmount(() => {
  if (widgetId) window.turnstile?.remove(widgetId)
})
</script>

<template>
  <div class="submission-shell">
    <div v-if="successReference" class="submission-success" aria-live="polite">
      <div class="success-icon" aria-hidden="true">✓</div>
      <h2>提交成功</h2>
      <p>
        提交编号：
        <strong>{{ successReference }}</strong>
      </p>
      <p>
        内容已经安全保存并进入审核队列。如需补充信息，请在邮件中注明该编号。
      </p>
      <div class="success-actions">
        <button type="button" class="button primary" @click="submitAnother">
          再提交一条
        </button>
        <a class="button secondary" href="/">返回首页</a>
      </div>
    </div>

    <form v-else ref="formElement" novalidate @submit.prevent="submit">
      <div
        v-if="errorMessage"
        ref="errorSummary"
        class="error-summary"
        role="alert"
        tabindex="-1"
      >
        <strong>暂时无法提交</strong>
        <span>{{ errorMessage }}</span>
      </div>

      <fieldset v-if="kind === 'site'" class="form-card">
        <legend>1. 提交类型与网站信息</legend>
        <div class="field">
          <label for="submission-type">
            提交类型
            <span>*</span>
          </label>
          <select id="submission-type" v-model="form.submissionType" required>
            <option value="new">推荐新网站</option>
            <option value="update">更新已有信息</option>
            <option value="broken">报告链接失效</option>
            <option value="security">报告安全问题</option>
            <option value="remove">申请移除</option>
          </select>
        </div>
        <div class="field-grid">
          <div class="field">
            <label for="site-name">
              网站名称
              <span>*</span>
            </label>
            <input
              id="site-name"
              v-model.trim="form.name"
              required
              maxlength="120"
            />
          </div>
          <div class="field">
            <label for="site-category">
              推荐分类
              <span>*</span>
            </label>
            <input
              id="site-category"
              v-model.trim="form.category"
              required
              maxlength="120"
              placeholder="例如：人工智能 / 图像工具"
            />
          </div>
        </div>
        <div class="field">
          <label for="site-url">
            网站地址
            <span>*</span>
          </label>
          <input
            id="site-url"
            v-model.trim="form.url"
            type="url"
            required
            maxlength="2048"
            placeholder="https://example.com"
          />
        </div>
        <div class="field-grid three">
          <div class="field">
            <label for="site-languages">语言或地区</label>
            <input
              id="site-languages"
              v-model.trim="form.languages"
              maxlength="300"
              placeholder="简体中文 / 全球"
            />
          </div>
          <div class="field">
            <label for="site-pricing">
              收费情况
              <span>*</span>
            </label>
            <select id="site-pricing" v-model="form.pricing" required>
              <option value="free">免费</option>
              <option value="freemium">部分免费</option>
              <option value="paid">付费</option>
              <option value="unknown">不清楚</option>
            </select>
          </div>
          <div class="field">
            <label for="site-registration">
              需要注册
              <span>*</span>
            </label>
            <select id="site-registration" v-model="form.registration" required>
              <option value="no">否</option>
              <option value="yes">是</option>
              <option value="unknown">不清楚</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset v-if="kind === 'site'" class="form-card">
        <legend>2. 介绍与审核依据</legend>
        <div class="field">
          <label for="site-summary">
            一句话介绍
            <span>*</span>
          </label>
          <input
            id="site-summary"
            v-model.trim="form.summary"
            required
            minlength="10"
            maxlength="240"
          />
          <small>请具体说明网站能解决什么问题，10–240 字。</small>
        </div>
        <div class="field">
          <label for="site-details">
            详细介绍
            <span>*</span>
          </label>
          <textarea
            id="site-details"
            v-model.trim="form.details"
            required
            minlength="20"
            maxlength="3000"
            rows="6"
          ></textarea>
        </div>
        <div class="field">
          <label for="site-reason">
            提交理由或需要修改的内容
            <span>*</span>
          </label>
          <textarea
            id="site-reason"
            v-model.trim="form.reason"
            required
            minlength="10"
            maxlength="2000"
            rows="4"
          ></textarea>
        </div>
        <div class="field">
          <label for="site-limitations">已知限制或风险</label>
          <textarea
            id="site-limitations"
            v-model.trim="form.limitations"
            maxlength="3000"
            rows="3"
            placeholder="例如：仅限部分地区、有广告、需注意隐私设置"
          ></textarea>
        </div>
        <div class="field">
          <label for="site-references">参考链接或截图链接</label>
          <textarea
            id="site-references"
            v-model.trim="form.references"
            maxlength="3000"
            rows="3"
            placeholder="每行一个链接"
          ></textarea>
        </div>
      </fieldset>

      <fieldset v-if="kind === 'request'" class="form-card">
        <legend>1. 需求概述</legend>
        <div class="field">
          <label for="request-type">
            需求类型
            <span>*</span>
          </label>
          <select id="request-type" v-model="form.requestType" required>
            <option value="find-tool">寻找网站或工具</option>
            <option value="new-category">请求新增分类</option>
            <option value="feature">网站功能建议</option>
            <option value="correction">内容纠错</option>
            <option value="accessibility">无障碍需求</option>
            <option value="other">其他</option>
          </select>
        </div>
        <div class="field">
          <label for="request-title">
            需求标题
            <span>*</span>
          </label>
          <input
            id="request-title"
            v-model.trim="form.title"
            required
            minlength="4"
            maxlength="140"
          />
        </div>
        <div class="field">
          <label for="request-problem">
            想解决的问题
            <span>*</span>
          </label>
          <textarea
            id="request-problem"
            v-model.trim="form.problem"
            required
            minlength="20"
            maxlength="3000"
            rows="6"
          ></textarea>
        </div>
        <div class="field">
          <label for="request-outcome">
            期望结果
            <span>*</span>
          </label>
          <textarea
            id="request-outcome"
            v-model.trim="form.desiredOutcome"
            required
            minlength="10"
            maxlength="2000"
            rows="4"
          ></textarea>
        </div>
        <div class="field">
          <label for="request-scenario">
            使用场景
            <span>*</span>
          </label>
          <select id="request-scenario" v-model="form.scenario" required>
            <option value="personal">个人</option>
            <option value="study">学习</option>
            <option value="work">工作</option>
            <option value="development">开发</option>
            <option value="other">其他</option>
          </select>
        </div>
      </fieldset>

      <fieldset v-if="kind === 'request'" class="form-card">
        <legend>2. 条件与背景</legend>
        <div class="field">
          <label for="current-method">当前使用的方法或工具</label>
          <textarea
            id="current-method"
            v-model.trim="form.currentMethod"
            maxlength="3000"
            rows="3"
          ></textarea>
        </div>
        <div class="field">
          <label for="current-issues">现有方案为什么不合适</label>
          <textarea
            id="current-issues"
            v-model.trim="form.currentIssues"
            maxlength="3000"
            rows="3"
          ></textarea>
        </div>
        <div class="field-grid">
          <div class="field">
            <label for="request-platform">平台或设备</label>
            <input
              id="request-platform"
              v-model.trim="form.platform"
              maxlength="300"
              placeholder="Windows / Android / 浏览器"
            />
          </div>
          <div class="field">
            <label for="request-region">地区或语言</label>
            <input
              id="request-region"
              v-model.trim="form.regionLanguage"
              maxlength="300"
              placeholder="中国大陆 / 简体中文"
            />
          </div>
        </div>
        <div class="field-grid three">
          <div class="field">
            <label for="request-price">
              价格偏好
              <span>*</span>
            </label>
            <select id="request-price" v-model="form.pricePreference" required>
              <option value="free">必须免费</option>
              <option value="freemium">可接受部分付费</option>
              <option value="any">均可</option>
            </select>
          </div>
          <div class="field">
            <label for="request-open-source">
              开源要求
              <span>*</span>
            </label>
            <select id="request-open-source" v-model="form.openSource" required>
              <option value="not-required">不要求</option>
              <option value="preferred">优先开源</option>
              <option value="required">必须开源</option>
            </select>
          </div>
          <div class="field">
            <label for="request-impact">
              影响程度
              <span>*</span>
            </label>
            <select id="request-impact" v-model="form.impact" required>
              <option value="minor">一般不便</option>
              <option value="major">明显影响</option>
              <option value="blocked">目前无法完成</option>
            </select>
          </div>
        </div>
        <div class="field">
          <label for="request-references">参考产品或页面链接</label>
          <textarea
            id="request-references"
            v-model.trim="form.references"
            maxlength="3000"
            rows="3"
            placeholder="每行一个链接"
          ></textarea>
        </div>
      </fieldset>

      <fieldset class="form-card">
        <legend>3. 联系方式</legend>
        <div v-if="kind === 'site'" class="field">
          <label for="site-relationship">
            与网站的关系
            <span>*</span>
          </label>
          <select id="site-relationship" v-model="form.relationship" required>
            <option value="user">普通用户</option>
            <option value="owner">站长或开发者</option>
            <option value="promoter">推广人员</option>
            <option value="other">其他</option>
          </select>
          <small>利益关系不会导致自动拒绝，但请如实说明。</small>
        </div>
        <div class="field">
          <label for="contact-email">
            {{ kind === 'site' ? '联系邮箱' : '联系邮箱（选填）' }}
            <span v-if="kind === 'site'">*</span>
          </label>
          <input
            id="contact-email"
            v-model.trim="form.contactEmail"
            type="email"
            maxlength="254"
            autocomplete="email"
            placeholder="name@example.com"
            :required="kind === 'site'"
            :aria-required="kind === 'site'"
          />
          <small>仅在需要补充确认时使用，不会公开显示。</small>
        </div>
        <label class="check-row">
          <input
            v-model="form.allowContact"
            type="checkbox"
            :required="kind === 'site'"
            :aria-required="kind === 'site'"
          />
          <span>
            {{
              kind === 'request'
                ? '愿意接受后续联系或协助测试（选填）'
                : '允许工作人员联系确认信息'
            }}
            <b v-if="kind === 'site'">*</b>
          </span>
        </label>
      </fieldset>

      <fieldset class="form-card verification-card">
        <legend>4. 验证与提交</legend>
        <label class="check-row required-check">
          <input v-model="form.declaration" type="checkbox" required />
          <span>
            我确认信息真实，且没有提交密码或个人敏感信息。
            <b>*</b>
          </span>
        </label>

        <div class="hp-field" aria-hidden="true">
          <label for="company-website">请勿填写此项</label>
          <input
            id="company-website"
            v-model="form.website"
            tabindex="-1"
            autocomplete="off"
          />
        </div>

        <div class="turnstile-wrap">
          <div ref="turnstileElement" aria-label="真人验证"></div>
          <button
            v-if="errorMessage.includes('验证加载失败')"
            type="button"
            class="text-button"
            @click="renderTurnstile"
          >
            重新加载验证
          </button>
        </div>

        <button class="submit-button" type="submit" :disabled="submitting">
          {{
            submitting
              ? '正在提交…'
              : kind === 'site'
                ? '提交网站信息'
                : '提交用户需求'
          }}
        </button>
      </fieldset>
    </form>
  </div>
</template>

<style scoped>
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
}
</style>
