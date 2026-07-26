# TwitchDropsMiner Headless

[![Headless CI](https://github.com/1em0ntea/TwitchDropsMiner-Headless/actions/workflows/headless-ci.yml/badge.svg)](https://github.com/1em0ntea/TwitchDropsMiner-Headless/actions/workflows/headless-ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

一个面向 Linux VPS 长期运行的 Twitch Drops Miner：原生无桌面服务、真正的浏览器管理界面、Docker 与 systemd 部署支持。

A lightweight, native headless Twitch Drops miner for long-running Linux VPS deployments, with a real browser-based management interface.

> [!IMPORTANT]
> 本项目是一个**全新的独立仓库**，基于
> [DevilXD/TwitchDropsMiner](https://github.com/DevilXD/TwitchDropsMiner)
> 的代码与历史开发；它不是旧 Fork 中的分支。Headless/VPS/Docker 相关问题请在本仓库反馈，不要向上游项目寻求支持。

## 为什么是 Headless / Why headless

- **真正的 Web UI**：状态、活动、战役、频道与设置都直接在浏览器中管理。
- **无桌面运行时**：生产入口不需要 X11、桌面会话、Tk 窗口、VNC 或 noVNC。
- **轻量依赖**：Headless 环境只安装 `aiohttp`、`truststore` 与 `yarl`。
- **实时更新**：REST API 负责命令与快照，Server-Sent Events（SSE）推送状态变化。
- **适合守护运行**：支持健康检查、持久化数据目录、优雅退出、Docker 重启策略与 systemd。
- **默认安全边界**：默认仅监听回环地址；Docker 端口也只发布到 VPS 的 `127.0.0.1`。

The browser UI talks to the miner core through a small `aiohttp` service. There is no remote desktop layer between them.

```text
Browser
  ├─ REST /api/v1/*  ── commands and snapshots
  └─ SSE  /api/v1/events ── live state updates
                 │
          Headless manager
                 │
       TwitchDropsMiner core
```

## Docker 快速开始 / Quick start

需要 Docker Engine 与 Docker Compose 插件。以下命令会生成独立的 Web 管理密码，并把容器端口限制在 VPS 本机：

```sh
git clone https://github.com/1em0ntea/TwitchDropsMiner-Headless.git
cd TwitchDropsMiner-Headless
cp deploy/.env.example .env
umask 077
openssl rand -base64 32 > deploy/secrets/web_password
docker compose build
docker compose up -d --wait
```

从自己的电脑建立 SSH 隧道：

```sh
ssh -L 5800:127.0.0.1:5800 your-user@your-vps
```

然后打开 <http://127.0.0.1:5800>，使用 `.env` 中的用户名（默认 `admin`）和刚生成的密码登录。Twitch 账号连接流程会显示在 Web UI 中。

检查运行状态：

```sh
docker compose ps
docker compose logs --tail=100 miner
curl --fail http://127.0.0.1:5800/healthz
curl --fail http://127.0.0.1:5800/readyz
```

容器使用非 root 用户、只读根文件系统、受限 Linux capabilities，并将持久状态写入 `tdm-data` volume。完整的反向代理、HTTPS、备份、更新、systemd 与原生 Python 部署说明见 [Linux VPS 部署指南](docs/vps-deployment.md)。

## Web 管理与 API / Web management and API

浏览器界面使用同源 API；没有 VNC/noVNC，也不需要在服务器上运行浏览器。

| Endpoint | Method | Purpose |
| --- | --- | --- |
| `/healthz` | `GET` | Web 进程存活检查 |
| `/readyz` | `GET` | Web 服务与数据目录就绪检查 |
| `/api/v1/session` | `GET` | 当前 Web 登录状态与 CSRF 信息 |
| `/api/v1/auth/login` | `POST` | Web 管理员登录 |
| `/api/v1/auth/logout` | `POST` | 注销当前 Web 会话 |
| `/api/v1/snapshot` | `GET` | 矿工、战役、频道、掉宝与设置快照 |
| `/api/v1/events` | `GET` | `snapshot` 事件的 SSE 实时流 |
| `/api/v1/actions/inventory-refresh` | `POST` | 刷新 Twitch Drops 库存 |
| `/api/v1/actions/channels/{id}/switch` | `POST` | 切换到指定频道 |
| `/api/v1/account/token` | `DELETE` | 撤销本地保存的 Twitch 登录 |
| `/api/v1/settings` | `PATCH` | 更新支持的 Headless 设置 |
| `/api/v1/actions/restart` | `POST` | 请求矿工重新启动 |

除健康检查、会话查询和登录外，管理接口需要有效会话。所有变更请求还需要 `X-CSRF-Token`。API 返回的快照经过专用序列化，不包含 Twitch token、cookie 或本地文件内容。

## 配置与安全 / Configuration and security

| Environment variable | Default | Description |
| --- | --- | --- |
| `TDM_DATA_DIR` | application directory | 持久数据目录 |
| `TDM_WEB_HOST` | `127.0.0.1` | Web 监听地址 |
| `TDM_WEB_PORT` | `5800` | Web 监听端口 |
| `TDM_WEB_USERNAME` | `admin` | 管理员用户名 |
| `TDM_WEB_PASSWORD_FILE` | unset | 管理员密码文件，推荐用于部署 |
| `TDM_WEB_PASSWORD` | unset | 管理员密码环境变量；不要与密码文件同时使用 |
| `TDM_WEB_COOKIE_SECURE` | `false` | 仅通过 HTTPS 发送会话 cookie |
| `TDM_WEB_TRUST_PROXY` | `false` | 信任反向代理转发的客户端地址 |
| `TDM_WEB_SESSION_HOURS` | `12` | 会话有效小时数 |
| `TDM_WEB_ALLOW_UNAUTHENTICATED` | `false` | 明确允许非回环地址无认证监听，危险 |

安全要点：

- 不要将端口 `5800` 直接暴露到公网；使用 SSH 隧道或带 HTTPS 的反向代理。
- 非回环监听在没有管理员密码时会被默认拒绝。
- 管理密码至少 12 个字符；登录尝试有速率限制，会话保存在内存中。
- 只有在同一台受信 VPS 上使用反向代理时才启用 `TDM_WEB_TRUST_PROXY`。
- `cookies.jar` 和数据卷可能授予 Twitch 账号访问权限，只应加密备份并严格限制访问。
- 不要提交 `.env`、`deploy/secrets/web_password`、`cookies.jar` 或数据目录副本。

## 本地开发与测试 / Development

需要 Python 3.10 或更新版本：

```sh
python3 -m venv .venv
. .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements-dev.txt
python -m pytest -q
python -m compileall -q headless main_headless.py
node --check headless/static/app.js
```

在回环地址启动开发实例：

```sh
mkdir -p .local-data
TDM_DATA_DIR="$PWD/.local-data" python main_headless.py
```

Headless CI 会在 Python 3.10 与 3.12 上运行测试及导入/编译检查，验证浏览器 JavaScript 语法，并构建生产 Docker 镜像。仓库仍保留部分上游桌面代码与构建文件以便同步和审计，但 VPS 生产入口是 `main_headless.py`，依赖清单是 `requirements-headless.txt`。

## 上游、支持与许可证 / Upstream, support and license

核心 Twitch Drops 逻辑来自 [DevilXD/TwitchDropsMiner](https://github.com/DevilXD/TwitchDropsMiner)，感谢 DevilXD 及所有上游贡献者。本仓库的 Web 服务、Headless 入口与 VPS 部署属于独立维护范围。

请将本版本的问题提交到本仓库，并在报告中附上经过脱敏的日志、部署方式与镜像/提交版本。不要在公开 issue 中粘贴 Twitch token、cookie、Web 密码或反向代理凭据。

本项目沿用上游的 [MIT License](LICENSE)。Twitch 是 Twitch Interactive, Inc. 的商标；本项目与 Twitch 无隶属或背书关系。使用者应自行遵守 Twitch 的服务条款及所在地法律。
