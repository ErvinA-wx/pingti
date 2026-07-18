---
title: 自托管 FMHY
description: 本指南将帮助您在本地设置并运行自己的 FMHY 实例。
---

# 自托管

:::warning
请注意，**必须**将您的实例与官方网站 (fmhy.net) 区分开，以免混淆。第 4 步中提供了具体操作步骤。
:::

本指南将帮助您在本地设置并运行自己的 FMHY 实例。

### Docker（实验性）

要运行本地实例，需要安装 [Docker](https://docs.docker.com/get-docker/) 和 [Docker Compose](https://docs.docker.com/compose/install/)。

安装完成后，运行以下命令：

```bash
git clone https://github.com/fmhy/edit.git
cd edit
sudo docker compose up --build
```

构建镜像并启动容器可能需要几分钟，容器将在端口 4173 上运行。

### Nix Flake

可以使用 [nix](https://nixos.org/) 设置开发环境，我们提供了一个 [flake](https://nixos.wiki/wiki/Flakes)，用于配置 `nodejs` 和 `pnpm`。

1. Fork 该仓库并使用 `git clone https://github.com/fmhy/edit.git` 克隆到本地。
2. 运行 `nix flake update` 以更新 flake 锁定文件。
3. 运行 `nix develop` 进入开发环境。
4. 进行更改。
5. 运行 `exit` 退出开发环境。

### 手动安装

需要安装以下内容：
- [Git](https://git-scm.com/downloads)
- [Node.js](https://nodejs.org/en/download/) - 安装版本 25.2.1
- [pnpm 9.12.2+](https://pnpm.io/installation)

#### 步骤 1：克隆仓库

```bash
git clone https://github.com/fmhy/edit.git
cd edit
```

#### 步骤 2：安装依赖

使用 pnpm 安装项目依赖：

```bash
pnpm install
```

#### 步骤 3：开发模式

以开发模式运行项目：

```bash
# Start the documentation site in dev mode
pnpm docs:dev

# Start the API in dev mode (if needed)
pnpm api:dev
```

开发服务器默认在 `http://localhost:5173` 启动。

#### 步骤 4：构建生产版本

需要更新以下内容：
- `meta`：`docs/.vitepress/constants.ts` 中的常量
  - `name`：实例名称
  - `hostname`：域名
  - `description`：实例描述
  - `tags`：Opengraph 标签
  - `build`：构建选项（可通过[环境变量](/other/selfhosting#environment-variables)配置）
- `docs/index.md`
  - `title`
  - `description`
  - `hero.name`
  - `hero.tagline`

构建生产版本：

```bash
# Build the documentation site
pnpm docs:build

# Build the API (if needed) using the Node.js preset
NITRO_PRESET=node pnpm api:build
```

#### 步骤 5：预览生产构建

在本地预览生产构建：

```bash
# Preview the documentation site
pnpm docs:preview

# Preview the API (if needed)
pnpm api:preview
```

#### 步骤 6：部署

更多信息请参阅 [VitePress deployment guide](https://vitepress.dev/guide/deploy)。

### API 部署

如需部署 API 组件（反馈系统），需要设置 Cloudflare Workers 和 KV 存储。

#### 前提条件

- A [Cloudflare account](https://dash.cloudflare.com/sign-up)
- 全局安装 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

#### 步骤 1：配置 Wrangler

使用 Cloudflare 账户信息更新 `wrangler.toml`：

1. 从 Cloudflare 仪表盘（位于右侧边栏）获取账户 ID
2. 将 `wrangler.toml` 中的 `account_id` 值替换为账户 ID
3. 如果使用自定义域名，保留 `workers_dev = false` 并更新 `routes` 部分
4. 如果部署到 `*.workers.dev`，设置 `workers_dev = true` 并移除 `routes` 部分

#### 步骤 2：创建 KV 命名空间

创建一个 KV 命名空间用于数据存储：

```bash
npx wrangler kv:namespace create STORAGE
```

此命令将返回一个命名空间 ID。复制此 ID 并替换 `wrangler.toml` 中 `[[kv_namespaces]]` 部分的 `id` 值（第 14 行）。

**注意：** 如果希望在不本地运行 Wrangler 的情况下部署（例如在 CI/CD 中），需要：
1. 在 Cloudflare 仪表盘中手动创建 KV 命名空间
2. 在复刻中更新 `wrangler.toml` 中的 `account_id` 和 `id` 值

#### 步骤 3：构建和部署

构建并部署 API：

```bash
# Build the API
pnpm api:build

# Deploy to Cloudflare Workers
pnpm api:deploy
```

API 将部署到配置的域名或 `*.workers.dev` 子域名。

#### 速率限制（可选）

速率限制绑定需要通过 Cloudflare 仪表盘进行设置。对于基本部署可以跳过此步骤，或稍后通过 Workers 仪表盘的“速率限制”部分进行配置。

#### 环境变量

##### 构建时变量（用于文档）

这些变量控制构建文档站点时包含的内容：

- `FMHY_BUILD_NSFW` - 启用 NSFW 侧边栏条目（实验性）
- `FMHY_BUILD_API` - 启用 API 组件用于反馈系统

##### 运行时变量（用于 API Worker）

这些变量由已部署的 Cloudflare Worker API 使用：

- `WEBHOOK_URL` - Discord webhook URL，用于发布反馈消息（API 反馈功能必需）

#### 故障排除

1. 如果遇到 Node.js 版本问题，请确保使用 Node.js 21+
2. 对于 pnpm 相关问题，请确保使用 pnpm 9+
3. 如果遇到构建问题，请尝试清除缓存：
    ```bash
    # Linux
    rm -rf docs/.vitepress/cache

    # PowerShell
    rm -r -fo docs/.vitepress/cache
    ```

### 反向代理

应该可以使用任何反向代理配合此 vitepress 网站，但可以在[此仓库](https://github.com/fmhy/edit/blob/main/.github/assets/nginx.conf)中找到适用于 nginx 服务器的合理配置