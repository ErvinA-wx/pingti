---
title: 8 个 AI 视频工作流 Skill：换装、漫画、Vox、古诗词与图书短视频怎么选
description: 核验 8 个面向 Codex、Claude Code 等 Agent 的视频工作流 Skill，比较产品动效、穿搭换装、手绘漫画、纸拼贴、国风古诗词和图书短视频的输出、依赖、许可证与素材风险。
date: 2026-08-05
updated: 2026-08-05
category: pingti
tag: AI 视频工作流
image: /posts/specialized-ai-video-workflow-skills-2026.png
next: false
prev: false
footer: true
authors: []
---

<Post authors="" />

<nav aria-label="面包屑"><a href="/">首页</a> › <a href="/posts">博客</a> › 专项 AI 视频工作流 Skill</nav>

> <strong>编辑：</strong>平替指南　<strong>首次发布：</strong>2026 年 8 月 5 日　<strong>最后核验：</strong>2026 年 8 月 5 日<br>
> <strong>核验方法：</strong>逐一检查官方 GitHub 仓库、README、根目录许可证和公开依赖说明。本文未安装运行，也未独立验证画质、生成速度、模型可用性或费用；功能与限制均基于核验日第一方公开资料。

这 8 个项目的共同点，是把某一种视频生产方法写成 Agent 可执行的 Skill；但它们不都是“一句话直接出 MP4”。female-outfit-director 只交付换装视频提示词方案，video-shotcraft 和 story-to-handdrawn-video 带有可执行渲染工程，Vox 与拼贴 B-roll 依赖云模型，古诗词工作流还需要独立 Docker 运行时，两个图书视频项目则重点解决长期生产和账号管理。选择时应先确认最终产物、人工确认节点和外部依赖，再比较视觉风格。

## 8 个视频工作流快速对比

| 项目 | 主要场景 | 实际输出与依赖 | 许可证 / 关键边界 |
| --- | --- | --- | --- |
| [video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | 电影感产品宣传片 | Remotion 工程、镜头配方和动效预览；需要前端与渲染环境 | [Apache-2.0](https://github.com/Vincentwei1021/video-shotcraft/blob/main/LICENSE)；Remotion 与随附音频另有条款 |
| [female-outfit-director](https://github.com/liyue-aigc/female-outfit-director) | 成年女性多套穿搭与卡点换装 | 输出首帧、时间轴、视频与负面提示词，不包含图像或视频生成服务 | [MIT](https://github.com/liyue-aigc/female-outfit-director/blob/main/LICENSE) |
| [story-to-handdrawn-video](https://github.com/gnipbao/story-to-handdrawn-video) | 中文故事、手绘日记漫画 | Remotion 渲染 3:4 静音 H.264 画面轨；图片生成可走 Agent 或可选 API | [MIT](https://github.com/gnipbao/story-to-handdrawn-video/blob/main/LICENSE)；字体为 SIL OFL，Remotion 另有许可 |
| [Vox Director](https://github.com/Alisa0808/vox-director) | 纸张拼贴风解说与广告 | Atlas Cloud 生成关键帧、视频、配音和音乐，本地 FFmpeg 合成 | [MIT](https://github.com/Alisa0808/vox-director/blob/main/LICENSE)；需要 API Key、云端上传与按量费用 |
| [gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) | 半调纸拼贴 B-roll | 三阶段人工确认；Agent 生静帧，Gemini API 生成视频 | [MIT](https://github.com/pyang5166/gbro-collage-broll/blob/main/LICENSE)；需要 Gemini API Key 与 FFmpeg |
| [HBG Classical Poem Silk Video](https://github.com/Mr-funny/hbg-classical-poem-silk-video) | 国风古诗词竖屏视频 | ImageGen 静帧、独立 Docker I2V、竖排题字、环境声、BGM 与 MP4 QA | [MIT](https://github.com/Mr-funny/hbg-classical-poem-silk-video/blob/main/LICENSE)；Docker 运行时为独立项目与独立许可 |
| [book-video-factory](https://github.com/bytec-ai/book-video-factory) | 多账号图书短视频生产 | 管理研究、文案、分镜、图片、配音、字幕、预览和导出；不绑定供应商 | 核验日根目录未见许可证文件；源码可见不等于获得复制、修改或再分发授权 |
| [Book Video](https://github.com/Endless1936/book-video) | 氛围型图书短视频 | 自然语言工作流、用户配音、ASR 对齐、HyperFrames 动画和成片渲染 | [Apache-2.0](https://github.com/Endless1936/book-video/blob/main/LICENSE)；仓库随附 BGM 不受该许可证覆盖 |

## 产品发布片：video-shotcraft

[video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) 是面向 Claude Code 与 Codex 的 Remotion 产品视频 Skill。仓库提供镜头配方、161 种风格及对应动效预览，并附可继续开发的 Remotion 模板。它适合已有网页或产品界面、愿意用 React 组件精确控制镜头和排版的团队。

- **适合：**产品发布、功能演示、开源项目宣传片，以及需要把动效参数纳入版本控制的工作流。
- **不适合：**只想拖入素材后快速剪辑，或没有 Node.js、Chromium、字体与无头渲染维护能力的场景。
- **注意：**项目许可证不自动覆盖 Remotion 或音频素材；CI 环境还要实际验证浏览器、字体和音频解码。

该项目已在上一批[Agent 视频制作工具指南](/posts/agent-video-production-tools-2026)中收录，本次保留原 ID 与首次收录日期，不建立重复记录。

## 穿搭换装：female-outfit-director

[female-outfit-director](https://github.com/liyue-aigc/female-outfit-director) 是中文提示词导演工作流。它会锁定成年人物设定、穿搭数量、拼贴布局、换装机制、动作连续性与声音节点，输出首帧提示词、时间轴、精简视频提示词和负面约束。它本身不调用或附带图像、视频生成服务。

- **适合：**需要先把人物一致性和卡点机制写清楚，再交给指定生成模型的人。
- **不适合：**期望安装后直接得到成片，或无法提供对人物素材合法使用依据的场景。
- **注意：**使用真人参考图前应取得明确同意；不得用来制作冒充、骚扰、性化或未经允许的商业代言内容。人物身份、服装品牌和音乐仍要单独核验。

## 手绘漫画：story-to-handdrawn-video

[story-to-handdrawn-video](https://github.com/gnipbao/story-to-handdrawn-video) 同时包含 Agent Skill 与 Remotion 渲染器，可把中文故事或有序图片制作成 3:4 手绘日记漫画动画。默认交付 1080×1440 的静音 H.264 画面轨，包含手写字幕、黑白画稿到彩色插画的揭示，以及可选卷页转场，配音和 BGM 留给后期。

- **适合：**故事号、知识叙事、手绘日记和希望先稳定画面轨再做声音后期的创作者。
- **不适合：**必须一次生成完整配音成片，或不愿维护 Node.js、Python、Chrome、FFmpeg 与 Remotion 的使用者。
- **注意：**默认图片生成方式依赖 Agent 能力；只有明确选择 API 路径才需要相应密钥。故事文本、上传图片、字体和生成图都应保留来源与授权记录。

## 纸拼贴解说：Vox Director 与 gbro-collage-broll

### Vox Director：覆盖整条解说生产链

[Vox Director](https://github.com/Alisa0808/vox-director) 把主题拆成脚本节拍、风格确认、拼贴关键帧、动态、配音、音乐、字幕与 FFmpeg 合成。它还提供已有口播视频和单张人物或产品照片的输入路径。工作流依赖 Atlas Cloud API，本地部分主要负责媒体处理与交付。

- **适合：**需要纸张拼贴风解释视频，并接受素材上传云端、模型按量计费和两次人工确认的团队。
- **不适合：**素材禁止出网、要求纯本地生产，或无法持续承担多个模型调用费用的场景。
- **注意：**模型 ID、价格和可用性会变化。使用真人声音克隆、肖像、品牌截图和新闻素材时，要取得同意并防止内容暗示虚假背书。

### gbro-collage-broll：只做可控的拼贴配画

[gbro-collage-broll](https://github.com/pyang5166/gbro-collage-broll) 聚焦一句文稿对应一段半调纸拼贴 B-roll。它先确认视觉隐喻，再确认静帧，最后才调用 Gemini 生成视频，避免在隐喻或美术方向错误时直接消耗视频费用。

- **适合：**已有口播或主片，只缺少短段落拼贴配画，并重视生成前人工审美把关的人。
- **不适合：**需要完整长片、旁白、音乐与发布流程，或希望完全无人值守批量出片的场景。
- **注意：**静帧依赖 Agent 的图像生成能力，视频阶段需要 Gemini API、Python 和 FFmpeg；三道确认会降低浪费，但不会保证模型输出可直接发布。

## 国风古诗词：HBG Classical Poem Silk Video

[HBG Classical Poem Silk Video](https://github.com/Mr-funny/hbg-classical-poem-silk-video) 把古诗拆成逐句或两句一景的国画分镜，用静态锚点约束图生视频中的建筑、人物和动物，再加入竖排毛笔字、环境声、BGM、交叉溶解和最终 MP4 抽帧质检。

- **适合：**有 Docker 环境、愿意逐景检查物象稳定性，并需要固定 1080×1920 国风交付规范的创作者。
- **不适合：**无法完成独立运行时授权、没有 Docker，或希望仅靠一个 Skill 文件完成全部生成的环境。
- **注意：**图生视频依赖另一个 HBG Gemini Flow Suite 项目；本仓库 MIT 不代表外部运行时、模型输出、诗词注释、字体以外的音乐与素材自动获得相同授权。古诗原文可能属于公版，现代译注、朗诵和配乐仍可能受保护。

## 图书短视频：book-video-factory 与 Book Video

### book-video-factory：把多账号生产规则沉淀下来

[book-video-factory](https://github.com/bytec-ai/book-video-factory) 重点不是绑定某个生成模型，而是为多个图书账号分别保存片头、声音、BGM、视觉风格与确认规则，并让每本书按统一目录推进研究、口播稿、分镜、图片、配音、字幕、预览和导出。它明确不自动安装大型依赖、不自动调用付费接口，也不自动发布。

- **适合：**已经有自己的研究、TTS、图片与渲染工具，希望把长期账号生产约定标准化的团队。
- **不适合：**需要开箱即用渲染器，或必须基于明确开源许可证二次分发 Skill 的产品。
- **注意：**截至核验日，仓库没有可识别的根目录许可证文件。可以阅读公开源码，不代表默认拥有复制、修改、打包或商用再分发权；需要二次开发时应先向维护者确认授权。

### Book Video：围绕单本书完成氛围视频

[Book Video](https://github.com/Endless1936/book-video) 从选书与口播文案开始，生成氛围图，再由使用者提供配音 MP3；工作流用 ASR 取得时间参考，以脚本为字幕真源，混入 BGM 并借助 HyperFrames、GSAP 等工具输出成片。它还维护每期产物状态，失败时保留旧的有效成片。

- **适合：**愿意人工审核文案、自己处理配音，并需要可恢复生产状态的图书内容创作者。
- **不适合：**要求自动取得图书全文、自动生成合法配音，或不愿维护本地媒体与前端渲染依赖的场景。
- **注意：**仓库 README 明确说明随附的四首 BGM 仅作学习交流素材，不属于 Apache-2.0。没有取得音乐权利时，不得把这些音频用于公开或商业成片。图书封面、摘录、译文与有声朗读也应分别核对版权和合理使用边界。

## 如何按交付目标选择

- **要做产品宣传片：**优先评估 video-shotcraft，接受 Remotion 工程化维护后再建立品牌模板。
- **只需要换装生成提示词：**选择 female-outfit-director；它不会替代实际图像和视频模型。
- **要交付手绘漫画画面轨：**选择 story-to-handdrawn-video，配音和音乐作为后期独立处理。
- **要完整的纸拼贴解说：**评估 Vox Director；只缺短段落配画时，gbro-collage-broll 更轻量。
- **要做中国古诗词国风竖屏视频：**选择 HBG Classical Poem Silk Video，但先准备 Docker 运行时和逐景 QA。
- **要管理多个图书账号：**book-video-factory 更偏生产规范；围绕一本书做氛围成片可评估 Book Video。

相关内容可查看平替指南的[视频工具](/video-tools)、[人工智能工具](/ai)、[开发者工具](/developer-tools)、[Agent 视频制作基础与通用工具](/posts/agent-video-production-tools-2026)，以及本批新增项目的[最新收录](/latest#female-outfit-director)。

## 发布前的共同风险

Agent Skill 本质上是能让代理读取文件、执行命令、调用模型和写入产物的操作说明。安装前应审查 `SKILL.md`、脚本、依赖和网络端点，在隔离目录使用最小权限与短期 API Key，排除 Cookie、浏览器配置、客户素材和未公开项目。云端模型工作流还要记录上传位置、保存期限、价格和模型版本。

成片发布前应人工核对事实、字幕、人物同意、声音克隆授权、图书摘录、封面、商标、字体、音乐、模型水印与平台规则。开源代码不自动授权仓库内所有媒体，也不保证生成结果不会侵犯第三方权利；“本地 FFmpeg 合成”同样不代表上游素材和模型调用没有出网。

本次更新新增 7 个项目，并复用已经收录的 video-shotcraft，共形成 8 项选型指南。新增项目已写入统一项目库；分类页、[最新收录](/latest)和首页由同一数据源生成，未来同步 FMHY 上游内容时会恢复本地区块且不会重复添加。
