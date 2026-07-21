---
title: 远程控制、内网穿透与虚拟组网怎么选：5 款工具对比
description: 对比 RustDesk、frp、Tailscale、NetBird 与 ZeroTier 的用途、数据路径、自托管边界、免费范围和许可证，帮助家庭用户、开发者与团队选择远程访问方案。
date: 2026-07-21
updated: 2026-07-21
category: pingti
tag: 远程访问
image: /posts/remote-access-mesh-network-tools-2026.png
next: false
prev: false
footer: true
authors: []
---

<Post authors="" />

<nav aria-label="面包屑"><a href="/">首页</a> › <a href="/posts">博客</a> › 远程访问与虚拟组网工具</nav>

> <strong>编辑：</strong>平替指南　<strong>首次发布：</strong>2026 年 7 月 21 日　<strong>最后核验：</strong>2026 年 7 月 21 日<br>
> <strong>核验范围：</strong>官方产品与架构文档、定价页、官方 GitHub 仓库、许可证文件及正式 Release。本文未安装运行，功能与限制均基于官方公开资料核验。

RustDesk、frp、Tailscale、NetBird 和 ZeroTier 经常一起出现在“远程访问工具”清单中，但它们解决的是三类不同问题：RustDesk 控制另一台设备的桌面；frp 把单个内网服务发布到公网；Tailscale、NetBird 和 ZeroTier 则把多台设备组成虚拟私网。正确的选择顺序不是比较 Star 数，而是先确认要访问的是“屏幕”“一个端口”还是“整张设备网络”，再评估控制面、数据中继、许可证和运维成本。

## 5 款工具快速对比

| 项目 | 类型 | 业务数据路径 | 自托管边界 | 许可证与免费范围 |
| --- | --- | --- | --- | --- |
| [RustDesk](https://rustdesk.com/) | 远程桌面 | 优先 P2P；直连失败时经中继 | 可自建 ID 与中继服务器；高级管理能力属于 Server Pro | 客户端与 OSS Server 为 [AGPL-3.0](https://github.com/rustdesk/rustdesk/blob/master/LICENCE)；社区客户端和 OSS 自托管免费 |
| [frp](https://github.com/fatedier/frp) | 反向代理 / 内网穿透 | 常规模式经自建公网 `frps` 转发 | `frps`、`frpc`、域名、证书和带宽均自行维护 | [Apache-2.0](https://github.com/fatedier/frp/blob/dev/LICENSE)；软件免费，公网主机等成本自付 |
| [Tailscale](https://tailscale.com/) | WireGuard 设备组网 | 优先 P2P；失败时经 DERP 或配置的 peer relay | 客户端核心和 DERP 可自建；官方协调控制面是托管服务 | 核心仓库 [BSD-3-Clause](https://github.com/tailscale/tailscale/blob/main/LICENSE)；Personal 有免费方案 |
| [NetBird](https://netbird.io/) | WireGuard 零信任覆盖网络 | 优先 P2P；失败时经加密 Relay | 可自建 Management、Signal、Relay、Dashboard 与数据库 | [BSD-3-Clause 与 AGPLv3 混合许可](https://github.com/netbirdio/netbird/blob/main/LICENSE)；Cloud Free 与社区自托管均可用 |
| [ZeroTier](https://www.zerotier.com/) | 虚拟二层 / 三层网络 | 大部分 P2P；必要时经 Root / Relay | 可自建 Controller，但默认仍使用官方 planet roots | Agent 主体 [MPL-2.0](https://github.com/zerotier/ZeroTierOne/blob/dev/LICENSE-MPL.txt)；Controller 含[非商业 source-available 许可](https://github.com/zerotier/ZeroTierOne/blob/dev/nonfree/LICENSE.md) |

“P2P”并不表示任何环境都能直连。对称 NAT、CGNAT、UDP 被阻断或严格防火墙都可能让连接落到中继；此时速度和延迟取决于中继的位置、带宽和负载。

## RustDesk：真正需要操作远端桌面时

[RustDesk](https://github.com/rustdesk/rustdesk) 提供 Windows、macOS、Linux、Android 和 iOS 客户端，目标是远程查看屏幕、操作键鼠和传输文件。客户端先通过 `hbbs` 完成设备 ID、信令和打洞，能直连时建立 P2P 会话；打洞失败时由 `hbbr` 中继流量。

- **适合：**远程协助家人、维护无人值守电脑、从外部操作办公或家中桌面，以及希望自行掌控 ID 与中继服务器的使用者。
- **不适合：**只需要访问 NAS 的一个端口，或希望让多台设备长期处于同一虚拟网段的场景。
- **注意：**未配置私有服务器的客户端仍使用 RustDesk 公共基础设施，不能写成“默认不经过任何第三方”。只有正确设置自建 ID Server、公钥和中继，信令及必要的中继流量才转到自己的服务器。自托管还需要保护远控入口、设置强密码并及时升级。

截至核验日，客户端稳定版为 [1.4.9](https://github.com/rustdesk/rustdesk/releases/tag/1.4.9)，OSS Server 稳定版为 [1.1.16](https://github.com/rustdesk/rustdesk-server/releases/tag/1.1.16)。OSS Server 可以免费自建；Web 控制台、用户与设备管理、审计等能力属于 [Server Pro](https://rustdesk.com/pricing) 范围。

## frp：已有公网服务器，要发布一个内网服务

[frp](https://github.com/fatedier/frp) 是反向代理工具。在内网设备运行 `frpc`，让它主动连接公网服务器上的 `frps`，再由 `frps` 把 TCP、UDP、HTTP 或 HTTPS 请求转到内网服务。它适合暴露 SSH、Web 面板、开发环境或游戏端口，但不是远程桌面，也不会自动提供用户身份和零信任设备策略。

- **适合：**已有 VPS，明确知道要开放哪些端口，并能维护域名、TLS、认证、防火墙和日志的管理员。
- **不适合：**希望安装客户端后自动发现所有设备，或需要开箱即用的 SSO、设备授权和细粒度访问策略的团队。
- **注意：**常规模式的业务流量明确经过自建 `frps`，公网服务器会成为带宽、性能和可用性瓶颈。错误配置可能把数据库、SSH 或管理后台直接暴露到公网，应启用 token 或 OIDC、TLS、最小 `allowPorts`、主机防火墙和持续监控。

frp 软件采用 [Apache-2.0](https://github.com/fatedier/frp/blob/dev/LICENSE)，截至核验日稳定版为 [v0.70.0](https://github.com/fatedier/frp/releases/tag/v0.70.0)。软件本身免费，但公网主机、域名和流量不是免费的。

## Tailscale：少运维的跨设备私网

[Tailscale](https://github.com/tailscale/tailscale) 使用 WireGuard 把设备加入同一个 `tailnet`。官方协调服务器负责身份、密钥、端点和策略分发，不承载正常业务数据；设备尽量建立端到端加密的 UDP P2P 连接，直连失败时才通过 DERP 或配置的 peer relay 中继。

- **适合：**家庭 NAS、远程开发、小团队跨 NAT 访问，以及需要 ACL、子网路由、Exit Node 和身份登录但不想维护控制面的使用者。
- **不适合：**要求官方方案全栈完全自托管，或不能向托管控制面提供节点公 IP、公钥、设备和连接关系等元数据的组织。
- **注意：**开源仓库包含客户端、CLI、守护进程与大量核心代码，但官方协调控制面和部分闭源系统 GUI 不在该许可证范围内。自建 DERP 只替换中继，不等于自建控制面；Headscale 是独立社区项目，不是 Tailscale 官方支持的控制面产品。

截至核验日，稳定版为 [v1.98.9](https://github.com/tailscale/tailscale/releases/tag/v1.98.9)。[Personal 免费方案](https://tailscale.com/pricing) 当前支持最多 6 位用户、用户设备不限，并对 ACL group、tagged resources 等资源设有额度；具体限制可能随定价调整。

## NetBird：希望把控制面也部署在自己环境中

[NetBird](https://github.com/netbirdio/netbird) 同样以 WireGuard 构建设备覆盖网络，但把系统明确拆分为客户端、Management、Signal 和 Relay。Management 保存网络状态、公钥、私网 IP、用户、ACL 和 DNS 等控制面信息；Signal 协助交换连接候选。业务流量优先在节点间 P2P，无法直连时才经仍保持 WireGuard 端到端加密的 Relay。

- **适合：**需要身份、组、ACL、私有 DNS 和 Web 管理界面，并希望在托管服务与较完整自托管控制面之间选择的家庭实验室、DevOps 和小团队。
- **不适合：**没有公网域名、TLS、容器、数据库和网络运维能力，却要求高可用自托管开箱即用的团队。
- **注意：**自托管不只是运行一个 VPN 容器，还要维护 Dashboard、Management、Signal、Relay / STUN、反向代理、数据库、备份和升级。Management 虽不解密业务流量，仍保存网络拓扑、用户和策略等元数据；SCIM、部分企业集成与官方高可用能力属于商业范围。

NetBird 使用混合许可证：多数客户端与通用代码为 BSD-3-Clause，而 `management/`、`signal/`、`relay/` 和 `combined/` 为 AGPLv3，不能笼统说成全仓库 BSD。截至核验日，稳定版为 [v0.74.7](https://github.com/netbirdio/netbird/releases/tag/v0.74.7)；[Cloud Free](https://netbird.io/pricing) 当前为最多 5 位用户、100 台机器，社区自托管不套用这组云端配额，但基础设施和运维成本由部署方承担。

## ZeroTier：需要虚拟 LAN 或二层能力

[ZeroTier One](https://github.com/zerotier/ZeroTierOne) 更接近一台运行在互联网之上的可编程虚拟交换机，除了三层 IP 连接，还适合虚拟 LAN、广播发现、二层桥接、游戏联机、IoT 和边缘设备。大多数业务流量在节点间加密 P2P 传输；无法直连时可能经 Root / Relay，免费中继的性能不一定稳定。

- **适合：**需要跨地点虚拟局域网、二层连接或设备类型较多，并希望用 ZeroTier Central 快速授权成员的个人和团队。
- **不适合：**认为自建 Controller 就能在商业环境免费使用、完全脱离厂商基础设施或直接实现离线隔离的团队。
- **注意：**自建 Network Controller 管理成员和网络配置，但普通客户端默认仍使用 ZeroTier 的全球 planet roots。私有 Moon 已被官方标为 deprecated；完全独立的私有 Root / air-gap 是另一层部署。控制器身份、`identity.secret`、API token 和 `controller.d` 必须妥善备份与限权。

ZeroTier 仓库采用混合许可：Agent 主体为 MPL-2.0，`nonfree/` 中的 Controller 等代码采用只允许个人非商业、教学研究和限期评估等用途的 source-available 许可，商业使用需要授权。因此本文不把整个 ZeroTier 方案统称为“完全开源”。截至核验日，稳定版为 [1.16.2](https://github.com/zerotier/ZeroTierOne/releases/tag/1.16.2)；[Central Personal](https://www.zerotier.com/pricing/) 当前免费范围为 10 台设备、1 个网络和 1 位管理员。

## 按需求直接选择

- **需要看屏幕、控制键鼠：**选择 RustDesk；要求控制信令和中继时再自建 OSS Server。
- **只需把一个端口或网站发布出去：**已有 VPS 且能做好认证和防火墙时选择 frp。
- **家庭 NAS 和远程开发，优先少运维：**选择 Tailscale，接受官方托管控制面与相关元数据边界。
- **需要身份策略，同时希望完整自托管控制面：**优先评估 NetBird，并为 Relay、数据库、证书与升级准备运维能力。
- **需要虚拟 LAN、二层桥接或游戏广播发现：**评估 ZeroTier，但先确认设备额度和 Controller 商业许可。

相关资源可查看平替指南的[远程桌面工具](/system-tools#远程桌面)、[VPN 与虚拟组网工具](/privacy#vpn-服务器)、[开发者与反向代理工具](/developer-tools#web-开发工具)以及[网络隐私说明](/privacy)。

## 安全与持续核验

远程桌面、反向代理和虚拟组网都会扩大设备的可访问边界。无论选择哪一项，都应从最小权限与最小路由开始，启用强认证和设备审批，限制管理端口，保护控制面数据库与密钥，并验证中继发生时的延迟和带宽。不要因为连接使用端到端加密，就假设控制面不保存任何元数据；也不要因为可以自托管，就忽略漏洞修补、备份、监控和许可证义务。

本次更新没有在原有专题页重复添加项目。RustDesk、frp、Tailscale、NetBird 与 ZeroTier 原条目继续由 FMHY 上游同步；三个相关专题页新增受本地幂等补丁保护的选型指南反链。如果上游未来移除其中某项，本地补丁会按官网与 GitHub 别名识别并自动补回。
