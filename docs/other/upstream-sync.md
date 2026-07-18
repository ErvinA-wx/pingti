---
title: 上游同步指南
description: 说明平替指南如何持续跟踪并合并 FMHY 上游更新。
---

# 与 FMHY 上游保持同步

本仓库保留三条长期分支：

- `main`：平替指南的生产分支，包含中文框架和站点配置。
- `upstream-mirror`：FMHY `main` 的只读镜像，由 GitHub Actions 定期更新。
- `upstream-localized`：以生产分支为基础合并上游，并通过 DeepSeek V4 Flash 完成增量汉化的可续跑分支。

## 自动流程

`sync-upstream.yml` 每周运行，也支持手动触发。工作流会：

1. 获取 `https://github.com/fmhy/edit.git` 的最新 `main`。
2. 强制更新 `upstream-mirror`，确保它与上游完全一致。
3. 在 `upstream-localized` 合并新提交，并保留中文站点配置。
4. 使用翻译记忆和 DeepSeek V4 Flash 翻译新增或变化的 Markdown 内容。
5. 翻译完成后创建或更新 Draft PR，并通过 Cloudflare Preview 验证。
6. 如果余额不足，保存断点并创建 GitHub Issue；充值后重新运行即可继续。

## 合并规则

不要直接把 `upstream-mirror` 合并到生产环境。同步 PR 必须经过以下处理：

1. 检查 `docs/.vitepress`、`docs/index.md`、`docs/posts.md`、`README.md` 与部署配置的冲突。
2. 保留 `pingti.org`、中文 SEO、中文导航和 Cloudflare Pages 设置。
3. 使用固定的 `deepseek-v4-flash` 翻译新增或变化的界面与正文。
4. 复用 `translation/memory.jsonl`，避免覆盖或重复翻译已经审校的中文内容。
5. 运行格式、Lint、构建、链接与浏览器测试。
6. 通过 Cloudflare Preview 验证后才能合并到 `main`。

## 本地辅助检查

```bash
git remote add upstream https://github.com/fmhy/edit.git
git fetch upstream main
git log --oneline main..upstream/main
git diff --stat main...upstream/main
```

详细的翻译、术语库和断点续跑说明见[全站中文翻译](/other/translation)。
