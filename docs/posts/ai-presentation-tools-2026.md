---
title: 8 款 AI PPT 与 HTML 幻灯片工具：可编辑 PPTX、网页演示与模板怎么选
description: 核验 8 款面向 AI 编码代理的演示文稿工具，区分原生可编辑 PPTX、网页幻灯片、工作流 Skill 与模板库，并说明许可证、数据边界和商用限制。
date: 2026-07-22
updated: 2026-07-22
category: pingti
tag: 演示文稿工具
image: /posts/ai-presentation-tools-2026.png
next: false
prev: false
footer: true
authors: []
---

<Post authors="" />

<nav aria-label="面包屑"><a href="/">首页</a> › <a href="/posts">博客</a> › AI PPT 与 HTML 幻灯片工具</nav>

> <strong>编辑：</strong>平替指南　<strong>首次发布：</strong>2026 年 7 月 22 日　<strong>最后核验：</strong>2026 年 7 月 22 日<br>
> <strong>核验范围：</strong>项目官方 GitHub 仓库、README、许可证或 NOTICE 文件。本文未安装运行，功能、导出格式和限制均基于官方公开资料核验。

这 8 个项目都能让 AI 或编码代理参与制作演示文稿，但它们不是同一种“AI PPT 工具”：有的生成原生可编辑 PPTX，有的只交付 HTML 网页幻灯片，有的是把策划、预览和审查串起来的 Skill，还有的只提供模板素材。选型时先确认最终交付物，再确认是否允许商用、是否需要发送材料给模型服务，以及是否能接受自己维护本地环境。

## 8 款工具快速对比

| 项目 | 最终交付物 | 主要定位 | 许可证 / 使用边界 |
| --- | --- | --- | --- |
| [ppt-master](https://github.com/hugohe3/ppt-master) | 原生 PPTX | 从文档或主题生成真实 PowerPoint 形状、图表与动画 | [MIT](https://github.com/hugohe3/ppt-master/blob/main/LICENSE)；调用云模型时内容仍会离开本机 |
| [ppt-director](https://github.com/Hermess/ppt-director) | HTML 预览后映射 PPTX | 内容、设计语言、审查与交付流程编排 | 核验日仓库未见许可证文件；采用前应先向维护者确认授权 |
| [guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) | 单文件 HTML 幻灯片 | 杂志风、瑞士风网页 deck、配图与社交封面 | [AGPL-3.0](https://github.com/op7418/guizang-ppt-skill/blob/main/LICENSE) |
| [GordenPPTSkill](https://github.com/GordenSun/GordenPPTSkill) | 原生 PPTX | 中文商务模板的非破坏性文字编辑 | [代码 MIT](https://github.com/GordenSun/GordenPPTSkill/blob/main/LICENSE)，随附模板[限制非商业使用](https://github.com/GordenSun/GordenPPTSkill/blob/main/NOTICE.md) |
| [html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) | HTML 演示 | 主题、版式和动画工作台 | [MIT](https://github.com/lewislulu/html-ppt-skill/blob/main/LICENSE) |
| [frontend-slides](https://github.com/zarazhangrui/frontend-slides) | 网页幻灯片 | 用编码代理的前端能力生成与预览 slides | [MIT](https://github.com/zarazhangrui/frontend-slides/blob/main/LICENSE) |
| [beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) | HTML 模板 | 给编码代理选择的演示文稿模板库 | [MIT](https://github.com/zarazhangrui/beautiful-html-templates/blob/main/LICENSE) |
| [dashiAI-ppt-skill](https://github.com/chuspeeism/dashi-ppt-skill) | HTML、PDF、PPTX | 浏览器编辑并导出多种格式的演示文稿 Skill | [AGPL-3.0](https://github.com/chuspeeism/dashi-ppt-skill/blob/main/LICENSE) |

“可编辑 PPTX”也不等于任何版本的 PowerPoint、字体、母版和动画都能无损兼容；“本地运行”也不等于输入绝不会发送到外部模型。两类说法都要以实际工作流和配置为准。

## 需要原生 PowerPoint 交付

### ppt-master：以真实形状和动画生成 PPTX

[ppt-master](https://github.com/hugohe3/ppt-master) 让 AI 从 PDF、DOCX、网页、Markdown 或主题生成 PowerPoint 文件。仓库说明其导出目标是可直接点击编辑的文本框、形状和图表，并支持页间转场、逐元素进入动画、演讲者备注音频和自有 PPTX 模板。

- **适合：**最终必须交付 `.pptx`，并且后续仍要在 PowerPoint 或 Keynote 中编辑的团队。
- **不适合：**不愿安装 Python、配置 Agent 与模型，或要求完全离线、不允许任何内容连接模型服务的场景。
- **注意：**项目的处理流程主要在本机，但 README 明确把模型能力视作工作流的一部分；选择 Claude、GPT、Gemini 等外部模型或图像服务时，材料会按所选服务的配置传输。生成后仍应在目标 Office 版本中检查字体、图表、动画和版式。

### GordenPPTSkill：中文商务版式的文本替换工具

[GordenPPTSkill](https://github.com/GordenSun/GordenPPTSkill) 提供 17 套人工整理的中文商务 PPTX 模板，以及基于 `python-pptx` 的非破坏性文字编辑流程。它适合先选择模板、填写编辑配置，再保留原布局生成实际 PPTX。

- **适合：**想在固定中文商务版式内快速替换内容、并接受人工复核的个人学习或研究使用者。
- **不适合：**需要商用模板授权、自由重排页面，或要把整套视觉资产嵌入付费产品的团队。
- **注意：**代码和元数据使用 MIT，但仓库 `NOTICE.md` 明确区分了随附模板：模板来自公开分享渠道，仅允许个人学习、研究和非商业教学等用途。商用需要向原模板作者另行取得书面许可，不能把“代码 MIT”理解为模板也可自由商用。

### dashiAI-ppt-skill：先在浏览器编辑，再导出多种格式

[dashiAI-ppt-skill](https://github.com/chuspeeism/dashi-ppt-skill) 提供多种视觉主题的浏览器可编辑演示文稿流程，并声明可导出 HTML、PDF 和 PPTX。它适合希望先在网页中微调、再选择交付格式的 Agent 工作流。

- **适合：**希望用浏览器完成编辑与预览，并需要 HTML、PDF 或 PPTX 多格式输出的使用者。
- **不适合：**不愿承担 AGPL 义务，或要求在未经验证的复杂公司模板中保证像素级兼容的团队。
- **注意：**AGPL-3.0 对修改后通过网络提供服务的场景可能带来源码提供义务；PPTX 导出前应实际检查复杂图形、中文字体和动画是否符合交付标准。

## 更适合网页演讲和视觉预览

### guizang-ppt-skill：杂志风或瑞士风的 HTML deck

[guizang-ppt-skill](https://github.com/op7418/guizang-ppt-skill) 是面向 Claude Code、Codex 等编码代理的网页幻灯片 Skill。它提供电子杂志与瑞士国际主义两套视觉系统，可产出单文件横向翻页 HTML、配图和社交封面。

- **适合：**技术分享、产品叙事、线上演讲或需要先快速确认视觉方向的团队。
- **不适合：**必须把 `.pptx` 作为唯一交付物，或不愿遵守 AGPL-3.0 的使用者。
- **注意：**它的核心交付物是 HTML 幻灯片，而不是原生 PowerPoint。浏览器中的字体、动画和交互效果不应自动假设能无损转成 PPTX。

### html-ppt-skill：结构化的 HTML 演示工作台

[html-ppt-skill](https://github.com/lewislulu/html-ppt-skill) 是一个 Agent Skill，仓库说明包含主题、版式和二十余种动画，用于构建专业 HTML 演示文稿。

- **适合：**希望从主题、布局到展示动画都在 Web 环境完成的开发者和讲者。
- **不适合：**需要 PowerPoint 母版、批注协作或原生 Office 动画的组织。
- **注意：**HTML 的展示质量取决于浏览器、字体与显示环境。正式演讲前应在实际投屏设备和离线网络条件下演练，并准备静态 PDF 备份。

### frontend-slides 与 beautiful-html-templates：前端生成能力和模板素材库

[frontend-slides](https://github.com/zarazhangrui/frontend-slides) 让编码代理利用前端能力制作网页 slides；[beautiful-html-templates](https://github.com/zarazhangrui/beautiful-html-templates) 则提供可供代理挑选的 HTML 演示模板。二者可以配合，但前者偏生成与预览，后者偏可复用素材。

- **适合：**已经以 React、HTML/CSS 或前端工作流产出演讲内容，希望把设计模板交给编码代理执行的开发者。
- **不适合：**只想输入一句话后取得经过 Office 兼容验证的 PPTX，或不愿维护代码与部署环境的使用者。
- **注意：**模板库本身不是幻灯片渲染或导出引擎。生成前应查看模板依赖、图片与字体授权，并在不同屏幕比例下检查可读性。

## 把策划与质量审查放在生成之前

### ppt-director：先导演，再生成

[ppt-director](https://github.com/Hermess/ppt-director) 将受众、素材、评审视角、设计语言、HTML 预览、contact sheet、PPTX 映射和最终审查组合成生产线。仓库强调在生成 PPTX 前先完成内容规划和视觉导演稿，并在 HTML 与 PPTX 之间进行渲染比对。

- **适合：**政务汇报、解决方案、培训、研究报告等需要先明确受众、信息结构和评审标准的高要求演示。
- **不适合：**只需要几页快速草稿，或没有时间维护多个 Skill、设计语言和审查阶段的使用者。
- **注意：**它更像流程编排 Skill，不是单一的 PPT 生成器。核验日仓库没有根级许可证文件；即使其 README 公开可读，也不应自动假定可用于所有商业或再分发场景。

## 如何按交付要求选择

- **要交付可编辑 PPTX，且愿意使用模型与本地脚本：**先评估 ppt-master；需要固定中文商务模板时再看 GordenPPTSkill 的模板授权。
- **要先在浏览器编辑、并导出 HTML / PDF / PPTX：**评估 dashiAI-ppt-skill，并先审阅 AGPL 的合规影响。
- **只做网页演讲、技术分享或社交封面：**优先 guizang-ppt-skill 或 html-ppt-skill；前者偏两套设计语言，后者偏 HTML 演示工作台。
- **已有前端 Agent 工作流：**组合 frontend-slides 与 beautiful-html-templates，用模板约束页面结构与视觉方向。
- **内容复杂、需要评审和统一设计语言：**把 ppt-director 作为生成前的编排流程，再接入实际的 HTML 或 PPTX 生成工具。

相关资源可查看平替指南的[开发者工具](/developer-tools)、[人工智能工具](/ai)、[自托管指南](/other/selfhosting)，以及本批项目的[最新收录锚点](/latest#ppt-master)。

## 数据、授权与交付前检查

演示文稿往往包含客户资料、财务数据、内部战略和未公开图片。使用任何 AI 模型或在线图像服务前，应确认哪些输入会离开设备、服务商如何保存数据，以及是否可以关闭日志或使用企业级隔离。对外发布前还应核验：模板、字体、图片、图标、音乐与模型输出是否取得适当授权；PPTX 是否在目标版本的 PowerPoint 中实际打开；HTML 是否具备离线备份和演讲现场的浏览器兼容方案。

本次更新将 8 个项目录入平替指南的统一项目库。分类页、[最新收录](/latest)和首页会由同一数据源生成；后续 FMHY 上游同步不会抹去这批本地收录，也不会重复添加。
