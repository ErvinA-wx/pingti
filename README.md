# 平替指南

平替指南是 [FMHY](https://github.com/fmhy/edit) 的简体中文本地化项目，面向中文用户整理免费、开源和实用的替代资源。

- 正式网站：<https://pingti.org>
- 博客：<https://pingti.org/blog>
- 上游仓库：<https://github.com/fmhy/edit>
- 当前仓库：<https://github.com/ErvinA-wx/pingti>

## 项目特点

- VitePress 静态生成，部署于 Cloudflare Pages
- 简体中文导航、搜索、主题与博客界面
- 自动生成 Sitemap、RSS、Open Graph 与 canonical 链接
- 保留上游同步分支，定期检查 FMHY 的最新改动

## 本地开发

需要 Node.js 24 和仓库声明的 pnpm 版本。

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm docs:dev
```

生产构建：

```bash
FMHY_BUILD_API=false FMHY_BUILD_NSFW=false pnpm docs:build
```

构建产物位于 `docs/.vitepress/dist`。

## 内容与翻译

界面翻译采用统一术语表。正文翻译应保留产品名、技术名、命令、URL 与来源，并在提交前完成链接和构建检查。

## 与上游保持同步

仓库通过 `.github/workflows/sync-upstream.yml` 定期把 `fmhy/edit` 的最新 `main` 分支同步到 `upstream-mirror`，并创建或更新同步 PR。合并前必须检查中文框架文件的冲突，并重新翻译新增界面文案。

详细流程见 [上游同步指南](docs/other/upstream-sync.md)。

## DeepSeek 全站汉化

仓库内置基于 Markdown AST 的结构化翻译流水线，固定使用 `deepseek-v4-flash`：

- 只翻译可见文本，保护链接、代码、图片、锚点和外部站点名称。
- 使用 `translation/glossary.json` 统一术语。
- 使用 `translation/memory.jsonl` 保存译文并支持增量翻译。
- DeepSeek 余额不足时保存断点、创建 GitHub Issue；充值后可继续执行。
- 上游更新先合并到 `upstream-localized`，完成汉化和验证后再通过 Draft PR 进入生产分支。

使用方法和续跑机制见 [全站中文翻译](docs/other/translation.md)。

## 免责声明

本站仅整理公开信息，不托管任何第三方文件。平替指南是独立中文本地化项目，与 FMHY 官方站点无隶属关系。原项目及第三方内容的版权归各自权利人所有。
