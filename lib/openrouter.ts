/**
 * OpenRouter API Key 管理工具
 * 文档参考: https://openrouter.ai/docs/api-reference/api-keys/create-keys
 */

const OPENROUTER_API_BASE = 'https://openrouter.ai/api/v1';

export interface CreateOpenRouterKeyOptions {
  name: string;           // API Key 名称
  limit?: number;         // 额度限制（美元），例如 10 表示 $10
  limitReset?: 'daily' | 'weekly' | 'monthly' | null; // 额度重置周期
}

// OpenRouter 创建 Key 的实际返回结构
// { key: "sk-or-v1-...", data: { hash, name, limit, ... } }
export interface OpenRouterKeyResponse {
  key: string;            // 创建的 API Key（仅返回一次，顶层字段）
  data: {
    hash: string;           // Key 的 hash（用于后续管理操作）
    name: string;           // Key 名称
    label: string;          // Key 的缩写标签
    disabled: boolean;
    limit: number | null;   // 额度限制
    limit_remaining: number | null; // 剩余额度
    limit_reset: string | null;
    include_byok_in_limit: boolean;
    usage: number;
    created_at: string;
    updated_at: string | null;
    expires_at: string | null;
  };
}

export interface OpenRouterKeyInfo {
  label: string;
  usage: number;          // 已使用额度（美元）
  limit: number | null;   // 额度限制
  is_free_tier: boolean;
  rate_limit: {
    requests: number;
    interval: string;
  };
}

/**
 * 使用管理员 API Key 创建新的 OpenRouter API Key
 * @param adminApiKey - 管理员/父账户的 API Key
 * @param options - 创建选项
 * @returns 创建结果，包含新 Key 和 Hash
 */
export async function createOpenRouterApiKey(
  adminApiKey: string,
  options: CreateOpenRouterKeyOptions
): Promise<{ success: true; data: OpenRouterKeyResponse } | { success: false; error: string }> {
  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/keys`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: options.name,
        limit: options.limit ?? null,
        limit_reset: options.limitReset ?? null,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter create key error:', response.status, errorText);
      return {
        success: false,
        error: `OpenRouter API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data as OpenRouterKeyResponse,
    };
  } catch (error) {
    console.error('Error creating OpenRouter API key:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating OpenRouter API key',
    };
  }
}

/**
 * 查询 OpenRouter API Key 的余额和使用情况
 * @param apiKey - 要查询的 API Key
 * @returns Key 信息，包括余额和使用量
 */
export async function getOpenRouterKeyInfo(
  apiKey: string
): Promise<{ success: true; data: OpenRouterKeyInfo } | { success: false; error: string }> {
  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/key`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `OpenRouter API error: ${response.status} - ${errorText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data as OpenRouterKeyInfo,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error querying OpenRouter key info',
    };
  }
}

/**
 * 删除 OpenRouter API Key
 * @param adminApiKey - 管理员 API Key
 * @param keyHash - 要删除的 Key 的 hash
 */
export async function deleteOpenRouterApiKey(
  adminApiKey: string,
  keyHash: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${OPENROUTER_API_BASE}/keys/${keyHash}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${adminApiKey}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `OpenRouter API error: ${response.status} - ${errorText}`,
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error deleting OpenRouter API key',
    };
  }
}

