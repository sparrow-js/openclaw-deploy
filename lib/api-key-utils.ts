import crypto from 'crypto';

// 从环境变量获取加密密钥
const ENCRYPTION_KEY = process.env.API_KEY_ENCRYPTION_SECRET || process.env.NEXTAUTH_SECRET || 'default-secret-key-change-in-production';

/**
 * 生成一个新的 API key
 * 格式: gf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx (前缀 + 32字节随机字符串)
 */
export function generateApiKey(): string {
  const randomBytes = crypto.randomBytes(32);
  const key = randomBytes.toString('hex');
  return `gf_${key}`;
}

/**
 * 从完整的 API key 中提取前缀用于显示
 * 例如: gf_abc123... -> gf_abc1...
 */
export function extractKeyPrefix(apiKey: string): string {
  if (!apiKey.startsWith('gf_')) {
    throw new Error('Invalid API key format');
  }
  // 保留前缀 + 前4个字符
  return apiKey.substring(0, 8);
}

/**
 * 对 API key 进行哈希处理以安全存储
 * 使用 SHA-256 哈希算法
 */
export function hashApiKey(apiKey: string): string {
  return crypto
    .createHash('sha256')
    .update(apiKey)
    .digest('hex');
}

/**
 * 验证 API key 是否与存储的哈希匹配
 */
export function verifyApiKey(apiKey: string, storedHash: string): boolean {
  const hash = hashApiKey(apiKey);
  return hash === storedHash;
}

/**
 * 加密 API key
 * 使用 AES-256-CBC 算法
 */
export function encryptApiKey(apiKey: string): string {
  try {
    // 确保密钥长度为 32 字节
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    const iv = crypto.randomBytes(16);
    
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(apiKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // 返回 iv + 加密数据，用 : 分隔
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Error encrypting API key:', error);
    throw new Error('Failed to encrypt API key');
  }
}

/**
 * 解密 API key
 */
export function decryptApiKey(encryptedData: string): string {
  try {
    // 确保密钥长度为 32 字节
    const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
    
    // 分离 iv 和加密数据
    const parts = encryptedData.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Error decrypting API key:', error);
    throw new Error('Failed to decrypt API key');
  }
}

/**
 * 生成 API key 的完整信息
 * @returns { key: 完整密钥, hash: 哈希值, prefix: 显示前缀, encryptedKey: 加密后的密钥 }
 */
export function createApiKeyData() {
  const key = generateApiKey();
  const hash = hashApiKey(key);
  const prefix = extractKeyPrefix(key);
  const encryptedKey = encryptApiKey(key);
  
  return {
    key,           // 只在创建时返回给用户一次
    hash,          // 存储到数据库（用于验证）
    prefix,        // 用于在 UI 中显示
    encryptedKey,  // 存储到数据库（用于检索）
  };
}

/**
 * 验证 API key 格式是否正确
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  // 检查是否以 gf_ 开头，且总长度为 67 (gf_ + 64个十六进制字符)
  const regex = /^gf_[a-f0-9]{64}$/;
  return regex.test(apiKey);
}

