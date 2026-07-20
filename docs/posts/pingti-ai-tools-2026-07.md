---
title: 平替指南新增 10 款 AI 代理与开发工具
description: 本次平替指南更新收录 Meetily、OfficeCLI、OmniRoute、page-agent、CubeSandbox 等 10 个开源 AI 项目，并为上游与站点更新建立独立博客分类。
date: 2026-07-19
category: pingti
tag: AI 工具
next: false
prev: false
footer: true
authors: []
---

<Post authors="" />

本次更新为 [AI 工具页面](/ai#平替精选ai-代理与开发工具) 新增了 10 个开源项目，覆盖本地会议转录、编码代理、办公文档处理、模型网关、浏览器自动化、设计系统和安全沙箱。

## 新增项目

- [Meetily](https://github.com/Zackriya-Solutions/meetily)：完全本地运行的 AI 会议助手，使用 Parakeet / Whisper 完成快速转录，会议内容无需离开设备。
- [agent-skills](https://github.com/addyosmani/agent-skills)：为 Claude Code 等编码代理准备的生产级技能集合，涵盖测试、代码审查、调试和重构。
- [system_prompts_leaks](https://github.com/asgeirtj/system_prompts_leaks)：汇集多种主流 AI 模型系统提示，便于研究和比较不同助手的内部指令方式。
- [OfficeCLI](https://github.com/iOfficeAI/OfficeCLI)：让 AI 代理无需安装 Microsoft Office 即可读写 Word、Excel 和 PowerPoint 文件。
- [Orca](https://github.com/stablyai/orca)：在桌面端和移动端通过统一界面并行管理多个 AI 编码代理。
- [OmniRoute](https://github.com/diegosouzapw/OmniRoute)：通过单一端点连接 230 多个 AI 提供商的免费网关。
- [claude-video](https://github.com/bradautomates/claude-video)：自动完成视频下载、帧提取和音频转录，为 Claude 准备视频分析材料。
- [page-agent](https://github.com/alibaba/page-agent)：根据自然语言指令点击、输入并操作网页的浏览器自动化代理。
- [Astryx](https://github.com/facebook/astryx)：Meta 为人类与 AI 代理协作设计的开源设计系统。
- [CubeSandbox](https://github.com/TencentCloud/CubeSandbox)：为 AI 代理提供即时启动、并行执行和安全隔离能力的轻量沙箱。

## 上游同步不会覆盖这些内容

这些项目属于 pingti.org 的本地精选内容。我们新增了可重复执行的本地内容补丁：每次同步 FMHY 主仓库后，自动恢复本地精选区块，并以 GitHub 仓库地址检查重复项。如果某个项目将来已经被上游收录，本地补丁会跳过该项目，避免页面出现两份相同内容。

## 博客分为两个类别

博客现在提供两个来源明确的类别：

- **FMHY 上游更新**：继续收录从原主仓库同步并汉化的月度更新、公告和指南。
- **平替指南更新**：记录 pingti.org 自己完成的内容收录、功能优化和站点改进。

原有文章无需迁移或改写，默认保留在“FMHY 上游更新”类别；从本篇开始，站点自主更新会进入“平替指南更新”。

## 使用提醒

AI 代理、浏览器自动化和代码执行工具可能接触文件、账号或终端权限。建议先阅读项目文档和权限说明，在容器、虚拟机或沙箱内试用，并避免把重要数据或长期凭据直接交给尚未审核的代理。
