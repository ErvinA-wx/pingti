---
title: 提交中心
description: 向平替指南提交优质网站、信息更新、安全问题或真实用户需求。
head:
  - - meta
    - name: keywords
      content: 网站提交,工具推荐,用户需求,平替指南,中文资源导航
---

# 提交中心

我们欢迎可验证、有实际价值的信息。提交内容会先进入审核队列，不会自动发布；请勿填写密码、身份证件、支付信息等敏感资料。

<div class="submit-entry-grid">
  <a class="submit-entry" href="/submit/site">
    <strong>🌐 提交网站信息</strong>
    <span>推荐新网站，更新已有信息，报告失效链接、安全问题或申请移除。</span>
  </a>
  <a class="submit-entry" href="/submit/request">
    <strong>💡 提交用户需求</strong>
    <span>告诉我们正在寻找的工具、缺少的分类、功能建议或内容纠错。</span>
  </a>
</div>

## 处理原则

- 审核以真实性、可访问性、安全性和实际价值为准。
- 站长、开发者和推广人员可以提交，但必须如实说明与网站的关系。
- 网站信息提交必须填写联系邮箱并允许工作人员联系确认；用户需求提交的联系邮箱与后续联系授权为选填。表单提交后会显示提交编号。
- 自动化滥用会被真人验证、蜜罐字段和请求频率限制拦截。
- 也可以直接发送邮件至 [submit@pingti.org](mailto:submit@pingti.org)。

## 人工与 AI 提报

- [中文项目表单](/submit/site?lang=zh) · [English project form](/submit/site?lang=en)
- [中文需求表单](/submit/request?lang=zh) · [English request form](/submit/request?lang=en)
- 全部业务字段直接展示，无需逐层点击展开。人工和 AI 代填采用相同审核标准，不清楚的信息可选“不清楚”，选填项可留空。
- 新项目必须选择“平替项目”或“独创项目”。平替须填写具体对象；独创为提报者自报，进入重点复核，不代表本站已经认证。
- 社媒宣传及素材使用、合理修订均需明确授权，普通推荐者不能代项目授权。提供素材本身不构成授权，未授权素材仅供内部审核。
- 支持或介绍 pingti.org 完全自愿，不是收录条件。提交不保证收录或社媒宣传。
- [机器可读字段规范与示例（JSON）](https://api.pingti.org/submissions)包含字段名称、类型、选项和条件规则。生产提交仍需有效真人验证，可能需要人工协助；不提供绕过验证的入口。

## English submission guide

People and authorized AI agents are welcome to use the forms above. All business fields are visible. New projects must choose **Alternative project** (specific target names required) or **Original project** (self-declared and highlighted for review). Do not invent missing facts.

Promotional permission and permission to use and reasonably edit supplied materials are separate, voluntary choices. Grant them only with explicit authorization from the project owner. Materials without permission are for internal review only. Sharing pingti.org is optional and does not affect listing decisions. Submissions do not guarantee listing or promotion.

The [JSON field specification](https://api.pingti.org/submissions) includes shared validation rules and illustrative examples. Production submissions require genuine Turnstile verification; human assistance may be necessary. Successful submissions return a reference; validation errors identify the affected fields.

<style>
.submit-entry-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; margin:24px 0; }
.submit-entry { display:flex; flex-direction:column; gap:8px; padding:20px; color:var(--vp-c-text-1)!important; text-decoration:none!important; border:1px solid var(--vp-c-divider); border-radius:12px; background:var(--vp-c-bg-alt); transition:border-color .2s,transform .2s; }
.submit-entry:hover { border-color:var(--vp-c-brand-1); transform:translateY(-2px); }
.submit-entry strong { color:var(--vp-c-brand-1); font-size:18px; }
.submit-entry span { color:var(--vp-c-text-2); line-height:1.65; }
@media (max-width:640px) { .submit-entry-grid { grid-template-columns:1fr; } }
</style>
