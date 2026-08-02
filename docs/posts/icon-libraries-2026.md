---
title: 16 个 UI 图标库与图标搜索工具：开源、免费层与商用授权怎么选
description: 核验 16 个 UI 图标库与图标搜索工具，区分可直接采用的开源项目、需要逐项核对授权的聚合平台，以及免费层或付费订阅的商业服务。
date: 2026-08-01
updated: 2026-08-01
category: pingti
tag: SVG 图标库
image: /posts/icon-libraries-2026.png
next: false
prev: false
footer: true
authors: []
---

<Post authors="" />

<nav aria-label="面包屑"><a href="/">首页</a> › <a href="/posts">博客</a> › UI 图标库与图标搜索工具</nav>

> <strong>编辑：</strong>平替指南　<strong>首次发布：</strong>2026 年 8 月 1 日　<strong>最后核验：</strong>2026 年 8 月 1 日<br>
> <strong>核验范围：</strong>各项目官网、官方文档、许可证或服务条款。本文未把图标逐个下载或用于商业产品；图标数量、套餐和授权可能变动，项目交付前应再次核对官方原文。

找图标不难，难的是在设计定稿后才发现授权、风格或技术接入不合适。这里的 16 个工具分为三类：可以把许可证随代码一并保留的开源图标库；只负责搜索或汇集、需要回到原始图库确认授权的平台；以及提供免费层但仍受专有许可、席位或再分发限制约束的商业服务。先按最终交付物选择，再看图标数量。

## 快速选择

| 场景 | 优先选择 | 关键边界 |
| --- | --- | --- |
| React、Vue、Svelte 等项目按需打包 | [Lucide](https://lucide.dev/)、[Iconoir](https://iconoir.com/)、[Tabler Icons](https://tabler.io/icons) | 仍应只引入实际使用的图标，避免整个图标包进入前端产物 |
| 一套图标需要粗细、填充、双色等多种视觉层次 | [Phosphor Icons](https://phosphoricons.com/)、[IconPark](https://iconpark.oceanengine.com/)、[Remix Icon](https://remixicon.com/) | Remix Icon 当前使用自定义许可；IconPark 仓库已归档。三者都要先确认维护与授权边界 |
| Material Design 或 Google 字体工作流 | [Material Symbols](https://fonts.google.com/icons) | 图标字体便利，但要评估首屏字体加载、可访问名称与字体子集 |
| 简洁线框、小型原型或旧项目兼容 | [Feather Icons](https://feathericons.com/)、[Eva Icons](https://akveo.github.io/eva-icons/) | 图标规模较小，开始前先确认是否覆盖业务语义 |
| 快速搜索多个开放图标集 | [Icônes](https://icones.js.org/) | 它是入口而非统一许可证；每个图标集的署名与使用范围不同 |
| 中文图标管理与团队项目协作 | [iconfont](https://www.iconfont.cn/) | 每个图标库的授权不同，不应从平台名称推断可商用或可再分发 |
| 需要 3D、动画或大规模商业素材 | [Iconsax](https://iconsax.io/)、[Hugeicons](https://hugeicons.com/)、[Nucleo](https://nucleoapp.com/)、[Iconly Pro](https://iconly.pro/) | 免费入口不等于开源；需要看席位、订阅有效期、模板分发与源文件再分发限制 |

## 开源图标库与官方授权库

### Material Symbols：Google 设计系统的图标字体与 SVG

[Material Symbols](https://fonts.google.com/icons) 是 Google Material Design 的官方图标集合，可作为字体或 SVG 使用。它适合已经采用 Material 组件、需要可变字重与填充参数的产品。需要注意：用图标字体时仍要给纯图标按钮补充可访问名称，并根据实际图标做字体子集，避免为几个图标加载整套字体。

### Phosphor、Lucide 与 Tabler：现代产品界面的主力选择

- [Phosphor Icons](https://phosphoricons.com/) 采用 MIT 许可，优势是同一图标提供多种字重和视觉风格，适合需要在导航、按钮、插画式提示之间分层的界面。
- [Lucide](https://lucide.dev/) 采用 ISC 许可，提供多框架包并强调按需引入，适合 React、Vue、Svelte 等项目把打包体积控制在实际使用范围内。
- [Tabler Icons](https://tabler.io/icons) 采用 MIT 许可，同时提供线框与填充图标及多种框架包，适合后台、数据密集型产品和需要统一图标语言的设计系统。

三者都允许商业使用，但不应把许可证宽松理解为可以随意混用。一个页面里若同时使用不同图标库，很容易在描边末端、圆角、视觉重量与 24px 网格上失去一致性。

### Remix Icon：当前版本使用自定义许可证

[Remix Icon](https://remixicon.com/) 是适合线框与填充配对的中性风格图标系统。官方仓库当前使用 2026 年 1 月发布的 [Remix Icon License v1.0](https://github.com/Remix-Design/RemixIcon/blob/master/License)，不再是早期常见资料所写的 Apache-2.0。该许可允许在个人、商业与客户项目中使用和修改图标，也允许把图标作为较大产品中的功能或装饰组件；但禁止把图标作为独立图标包销售、建立竞争图标库，或把图标用作 Logo、商标与品牌标识。分发完整图库或其中实质部分时还要保留版权与许可信息。

### Iconoir、Reicon、Feather 与 Eva：按风格和生态选

- [Iconoir](https://iconoir.com/) 为 MIT 开源，官方提供 SVG、React、React Native、Vue、Flutter、Figma 与 Framer 等入口，适合多端复用。
- [Reicon](https://reicon.dev/) 为 MIT 开源，提供描边、填充及多端框架和设计工具入口，适合想从较新的图标系统开始的项目。
- [Feather Icons](https://feathericons.com/) 为 MIT 开源，以少量、克制的线框图标见长；当业务图标需求不大时，它反而更容易维持视觉统一。
- [Eva Icons](https://akveo.github.io/eva-icons/) 是与 Eva Design System 配套的开源图标包，在 Angular 的 Nebular 与 React Native UI Kitten 生态中尤其方便。

### IconPark：需要同一图形的多主题变体

[IconPark](https://iconpark.oceanengine.com/) 是字节跳动发布的 Apache-2.0 开源项目。它将同一图形转换为线框、填充、双色和多色主题，适合状态提示、儿童向产品或需要强色彩编码的界面。官方 GitHub 仓库已归档，最后一次代码推送为 2023 年 2 月，因此新项目采用前要确认现有包是否兼容当前框架，并准备自行维护。多色图标的优势也是风险：正式产品仍应为错误、成功、警告等状态保留文字或形状差异，不能只依赖颜色传递信息。

## 聚合与图标管理：授权要回到来源

[Icônes](https://icones.js.org/) 基于 Iconify 提供跨图标集搜索、预览与复制，适合先比较候选图标；它不把各图库变成同一许可证。复制前要查看图标所属集合和原始授权，尤其是品牌标志、商标与非商业素材。

[iconfont](https://www.iconfont.cn/) 是阿里巴巴的图标管理、下载与字体转换平台，适合中文团队把项目图标集中管理。平台含官方与用户上传的不同图标库，实际使用条件取决于单个素材或图标库的授权。无论显示“免费”与否，都不应默认允许把 SVG、字体或素材包再次上传、售卖、训练模型或作为独立资产分发。

## 免费层与付费服务：能用于成品，不等于能自由分发

| 服务 | 适合场景 | 使用前必须确认 |
| --- | --- | --- |
| [Iconsax](https://iconsax.io/) | 需要大量圆润风格、动态图标或 Figma 工作流 | 免费与 Pro 都是专有许可；最终产品集成与单独分发图标文件是两件事，模板或 UI Kit 还可能要求署名 |
| [Hugeicons](https://hugeicons.com/) | 需要大量风格、专业包与团队接入 | Pro 按席位授权；源 SVG、图标字体和 Figma 源文件不可作为可下载资产转交 |
| [Nucleo](https://nucleoapp.com/) | 希望把多个图标集放入桌面应用统一管理 | 有免费 Essential 子集，完整家族为付费；模板、插件和开源项目存在图标数量及版权声明限制 |
| [Iconly Pro](https://iconly.pro/) | 需要扁平、3D、破碎线或动画等视觉素材 | 有免费入口与订阅内容；开始设计前确认选择的具体素材、套餐和交付授权 |

这些服务可以很适合商业项目，但“图标显示在网站或 App 中”不等于“图标源文件可以随源码、模板、设计系统或客户素材包自由转交”。若项目要交付可编辑 Figma 文件、主题或组件库，应在采购前核对团队席位、可包含数量、署名和下游使用者的权利。

## 一份落地清单

1. 先写出需要的图标语义、目标尺寸和状态，而不是先按图标数量选库。
2. 选定一个主库；只有品牌 Logo 等明确独立场景才引入第二个库。
3. 对 Web 项目优先用 SVG 组件或按需引入，检查构建产物中是否意外包含全量图标。
4. 为纯图标控件提供 `aria-label` 或可见文本；错误与状态不只靠颜色。
5. 在仓库或设计交付物中保存许可证链接、版本与下载日期；图标来源是聚合平台时额外记录原始图库。
6. 交付模板、主题、组件库或可下载资源前，再次核对是否允许再分发源文件。

相关资源可查看平替指南的[SVG 图标](/storage#svg-图标)、[开发者工具](/developer-tools)和[设计资源](/storage#设计资源)，以及本批项目的[最新收录](/latest#material-symbols)。

本次更新将 16 个图标入口写入平替指南的统一项目库。分类页、[最新收录](/latest)和首页由同一数据源生成；现有 SVG 图标页已包含的链接会被保留，不重复添加，未来上游同步也会保留本地新增条目与文章入口。
