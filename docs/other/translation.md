---
title: 全站中文翻译
description: 使用 DeepSeek V4 Flash、术语库和翻译记忆维护平替指南的简体中文内容。
---

# 全站中文翻译

平替指南使用 `deepseek-v4-flash` 翻译 Markdown 正文。翻译程序直接操作 Markdown AST 中的文本节点，不把整份文件交给模型重写，因此链接、图片、代码、锚点和 VitePress 结构不会被修改。

## 本地运行

```bash
export DEEPSEEK_API_KEY="在本地安全设置 API Key"
pnpm translate:dry-run
pnpm translate:content
pnpm translate:check
```

API Key 只允许通过环境变量或 GitHub Actions Secret 提供，禁止写入仓库、日志、翻译记忆或配置文件。

## 翻译规则

- 固定使用 `deepseek-v4-flash`，不自动切换到 Pro 或其他模型。
- 外部链接的显示名默认视为网站、软件或品牌名，保持原文。
- `translation/glossary.json` 统一专业术语并维护不可翻译名称。
- `translation/memory.jsonl` 按原文、上下文和术语库版本保存译文，未变化的内容不会重复计费。
- 每次翻译后比较链接、图片和代码签名；结构发生变化时拒绝写入文件。

## 余额不足与断点续跑

DeepSeek 返回 HTTP 402 或余额接口显示不可用时，脚本会：

1. 保存所有已完成批次到 `translation/memory.jsonl`。
2. 把 `translation/status.json` 更新为 `balance_required`。
3. 使用退出码 `42` 告知自动化流程需要充值。
4. GitHub Actions 提交断点分支并创建“DeepSeek 余额不足”Issue。

充值并更新 GitHub Secret `DEEPSEEK_API_KEY` 后，重新运行相同工作流即可从翻译记忆继续，不会作废或重做已经完成的内容。

## 上游更新

“同步并汉化 FMHY 上游”工作流每周执行：

1. 更新只读的 `upstream-mirror`。
2. 在 `upstream-localized` 上安全合并上游。
3. 使用翻译记忆处理新增或变化的英文内容。
4. 完成后创建或更新本地化 Draft PR。
5. 余额不足时保留分支和断点，等待充值后继续。
