import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclawCredits } from '@/db/schema';
import { createOpenRouterApiKey } from '@/lib/openrouter';

/**
 * POST /api/openclaw/create-key
 * 创建 OpenRouter API Key（每个实例独立的 Key，额度 $10）并写入 openclawCredits 表
 *
 * Request Body:
 *   - appName: string (用于生成 Key 名称，例如 fly app name)
 *   - limit?: number  (额度限制，默认 $10)
 *
 * Response:
 *   - success: boolean
 *   - openrouterApiKey?: string
 *   - openrouterApiKeyHash?: string
 */
export async function POST(request: Request) {
  try {
    // 验证用户身份
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { appName, limit } = body;

    if (!appName) {
      return NextResponse.json(
        { error: 'appName is required' },
        { status: 400 }
      );
    }

    const adminApiKey = process.env.OPEN_ROUTER_MANAGEMENT_KEY;

    if (!adminApiKey) {
      return NextResponse.json(
        { error: 'OPEN_ROUTER_MANAGEMENT_KEY not configured' },
        { status: 500 }
      );
    }

    // 创建 OpenRouter API Key
    const keyName = `openclaw-${appName}-${Date.now()}`;
    const keyResult = await createOpenRouterApiKey(adminApiKey, {
      name: keyName,
      limit: limit ?? 10, // 默认 $10 额度
    });

    if (!keyResult.success) {
      console.error(`Failed to create OpenRouter API Key: ${keyResult.error}`);
      return NextResponse.json(
        { error: `Failed to create OpenRouter API Key: ${keyResult.error}` },
        { status: 500 }
      );
    }

    const openrouterApiKey = keyResult.data.key;
    const openrouterApiKeyHash = keyResult.data.data.hash;

    console.log(
      `OpenRouter API Key created for ${appName}: ${keyResult.data.data.name} (hash: ${openrouterApiKeyHash})`
    );

    // 将 OpenRouter API Key 信息写入 openclawCredits 表
    await db.insert(openclawCredits).values({
      userId,
      openrouterApiKey,
      openrouterApiKeyHash,
    });

    return NextResponse.json({
      success: true,
      openrouterApiKey,
      openrouterApiKeyHash,
    });
  } catch (error) {
    console.error('Error creating OpenRouter API Key:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

