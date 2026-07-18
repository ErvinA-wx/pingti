---
title: 上游同步指南
description: 说明平替指南如何持续跟踪并合并 FMHY 上游更新。
---

# 与 FMHY 上游保持同步

本仓库保留两条长期分支：

- `main`：平替指南的生产分支，包含中文框架和站点配置。
- `upstream-mirror`：FMHY `main` 的只读镜像，由 GitHub Actions 定期更新。

## 自动流程

`sync-upstream.yml` 每周运行，也支持手动触发。工作流会：

1. 获取 `https://github.com/fmhy/edit.git` 的最新 `main`。
2. 强制更新 `upstream-mirror`，确保它与上游完全一致。
3. 如果上游领先于生产分支，创建或更新一个同步 PR。
4. 在 PR 中展示上游 Commit SHA，供翻译与代码审查使用。

## 合并规则

不要直接把 `upstream-mirror` 合并到生产环境。同步 PR 必须经过以下处理：

1. 检查 `docs/.vitepress`、`docs/index.md`、`docs/posts.md`、`README.md` 与部署配置的冲突。
2. 保留 `pingti.org`、中文 SEO、中文导航和 Cloudflare Pages 设置。
3. 使用 DeepSeek 翻译新增或变化的界面字符串。
4. 正文更新按页面逐项翻译，避免覆盖已经审校的中文内容。
5. 运行格式、Lint、构建、链接与浏览器测试。
6. 通过 Cloudflare Preview 验证后才能合并到 `main`。

## 本地辅助检查

```bash
git remote add upstream https://github.com/fmhy/edit.git
git fetch upstream main
git log --oneline main..upstream/main
git diff --stat main...upstream/main
```

建议把每次同步拆为两类提交：先合并上游代码变化，再提交中文翻译与站点适配。这样能够清楚区分原始改动和本地化改动。
