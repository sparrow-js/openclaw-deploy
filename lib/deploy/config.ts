/**
 * 部署相关配置
 * UNLIMITED_DEPLOY_EMAILS: 逗号分隔的邮箱列表，这些邮箱不受「每用户仅限一次部署」限制
 */
const UNLIMITED_DEPLOY_EMAILS_RAW =
  process.env.UNLIMITED_DEPLOY_EMAILS ?? '';

export const UNLIMITED_DEPLOY_EMAILS = UNLIMITED_DEPLOY_EMAILS_RAW
  .split(',')
  .map((e) => e.trim())
  .filter(Boolean);
