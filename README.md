# OpenClaw Deploy

一键将 **OpenClaw** AI 机器人部署到云端。选模型、连通道、点部署，几分钟内即可在 Telegram、Discord、飞书等渠道运行；基础设施、API 与 Webhook 由我们负责，你只管用。

## 目录

- [功能概览](#功能概览)
- [为什么用 OpenClaw Deploy](#为什么用-openclaw-deploy)
- [技术栈](#技术栈)
- [本地开发](#本地开发)
- [许可证](#许可证)

---

## 功能概览

- **一键部署**：选择模型与消息通道，将 OpenClaw 实例部署到云端（Fly.io）
- **多模型**：通过 OpenRouter 支持 Claude Opus、GPT-5.2、Kimi K2.5、MiniMax M2.5 等
- **多通道**：Telegram、Discord、飞书，连接即用
- **云端托管**：独立存储、长期记忆、7×24 运行，无需自管服务器

## 为什么用 OpenClaw Deploy

| 传统自建 | OpenClaw Deploy |
|----------|-----------------|
| 买 VPS、配环境、装框架、配模型与 API、接 Webhook、排错… 动辄 **60+ 分钟** | **少于 1 分钟** 完成部署 |
| 非技术用户时间成本高 | 选模型、选通道、一键部署，零运维 |

## 技术栈

| 类别     | 技术 |
|----------|------|
| 前端     | Next.js 15、React 19、Tailwind CSS |
| 认证     | NextAuth 5 |
| 数据库   | PostgreSQL + Drizzle ORM |
| 部署     | Fly.io（Machine + 持久化卷） |
| 支付订阅 | Creem |
| 存储与实时 | Supabase（Blob、Realtime）、Vercel Blob |

## 本地开发

### 环境要求

- Node.js 18+
- pnpm
- Docker（可选，用于本地 PostgreSQL）

### 快速开始

```bash
pnpm install
cp .env.example .env   # 按注释填写各环境变量
pnpm db:start          # 可选：启动本地 PostgreSQL
pnpm migrate
pnpm dev
```

环境变量说明见 [.env.example](./.env.example)，按分组注释填写即可。

### 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器（Turbo） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务 |
| `pnpm db:start` / `pnpm db:stop` | 启停 Docker PostgreSQL |
| `pnpm db:reset` | 重置数据库并重新迁移 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm generate` | 生成 Drizzle 迁移文件 |
| `pnpm migrate` | 执行数据库迁移 |

---

## 许可证

见 [LICENSE](./LICENSE)。
