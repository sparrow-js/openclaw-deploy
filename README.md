# OpenClaw Deploy

一键部署你的 **OpenClaw** AI 机器人到云端。

选模型、连通道、点部署，几分钟内即可在 Telegram、Discord、飞书等渠道运行你的专属 AI 助手。我们负责基础设施、API 密钥与 Webhook 配置，你只管用。

---

## 为什么用 OpenClaw Deploy？

| 传统自建方式 | OpenClaw Deploy |
|-------------|-----------------|
| 买 VPS、配环境、装框架、配模型与 API、接 Webhook、排错… 动辄 **60+ 分钟** | **&lt;1 分钟** 完成部署 |
| 非技术用户时间成本成倍增加 | 选模型、选通道、一键部署，零运维 |

---

## 功能概览

- **一键部署**：选好模型与消息通道，即可将 OpenClaw 实例部署到云端（Fly.io）
- **多模型**：支持 Claude Opus、GPT-5.2、Kimi K2.5、MiniMax M2.5 等（通过 OpenRouter）
- **多通道**：Telegram、Discord、飞书，连接即用
- **云端托管**：独立存储、长期记忆、7×24 运行，无需自管服务器

---

## 技术栈

- **前端**: Next.js 15、React 19、Tailwind CSS
- **认证**: NextAuth 5
- **数据库**: PostgreSQL + Drizzle ORM
- **部署**: Fly.io（Machine + 持久化卷）
- **支付与订阅**: Creem
- **存储与实时**: Supabase（Blob、Realtime）、Vercel Blob

---

## 本地开发

### 环境要求

- Node.js 18+
- pnpm
- Docker（本地跑 PostgreSQL 时使用）

### 安装与运行

```bash
# 安装依赖
pnpm install

# 复制环境变量并填写
cp .env.example .env

# 启动本地数据库（可选）
pnpm db:start

# 执行数据库迁移
pnpm migrate

# 启动开发服务器
pnpm dev
```

### 常用脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动 Next.js 开发服务器（Turbo） |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动生产服务 |
| `pnpm db:start` / `pnpm db:stop` | 启停 Docker 中的 PostgreSQL |
| `pnpm db:reset` | 重置数据库并重新迁移 |
| `pnpm db:studio` | 打开 Drizzle Studio |
| `pnpm generate` | 生成 Drizzle 迁移文件 |
| `pnpm migrate` | 执行数据库迁移（push） |

---

## 许可证

见 [LICENSE](./LICENSE) 文件。
