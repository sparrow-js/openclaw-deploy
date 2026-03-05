/**
 * 部署相关配置
 * UNLIMITED_DEPLOY_EMAILS: 逗号分隔的邮箱列表，这些邮箱不受「每用户仅限一次部署」限制
 * OPENCLAW_SUBSCRIPTION_EXEMPT_EMAILS: 逗号分隔的邮箱列表，这些邮箱部署时无需 OpenClaw 订阅
 */
const UNLIMITED_DEPLOY_EMAILS_RAW =
  process.env.UNLIMITED_DEPLOY_EMAILS ?? '';

export const UNLIMITED_DEPLOY_EMAILS = UNLIMITED_DEPLOY_EMAILS_RAW
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);

const SUBSCRIPTION_EXEMPT_RAW = process.env.OPENCLAW_SUBSCRIPTION_EXEMPT_EMAILS ?? '';
export const OPENCLAW_SUBSCRIPTION_EXEMPT_EMAILS = SUBSCRIPTION_EXEMPT_RAW
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
