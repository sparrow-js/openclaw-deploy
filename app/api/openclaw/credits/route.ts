import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { openclawCredits } from '@/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';
import { getOpenRouterKeyInfo } from '@/lib/openrouter';

/**
 * 从用户的 OpenRouter 账户获取额度信息
 * 返回格式与前端 CreditsSummary 接口一致
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 查询用户的 openclawCredits 记录（含 OpenRouter API Key）
    const records = await db
      .select()
      .from(openclawCredits)
      .where(
        and(
          eq(openclawCredits.userId, userId),
          isNotNull(openclawCredits.openrouterApiKey)
        )
      );

    if (records.length === 0) {
      return NextResponse.json({
        success: true,
        data: null,
      });
    }

    // 从 OpenRouter 查询每个 API Key 的额度信息
    const details = [];
    let totalUsage = 0;
    let totalLimit = 0;
    let totalRemaining = 0;
    let hasAnyLimit = false;

    for (const record of records) {
      const keyInfo = await getOpenRouterKeyInfo(record.openrouterApiKey!);

      if (keyInfo.success) {
        const usage = keyInfo.data.usage || 0;
        const limit = keyInfo.data.limit;
        const remaining = limit != null ? Math.max(0, limit - usage) : null;

        totalUsage += usage;
        if (limit != null) {
          hasAnyLimit = true;
          totalLimit += limit;
          totalRemaining += remaining ?? 0;
        }

        details.push({
          instanceId: record.id,
          label: keyInfo.data.label || record.id.slice(0, 8),
          usage,
          limit,
          remaining,
          is_free_tier: keyInfo.data.is_free_tier,
        });

        // 同步最后查询时间
        await db
          .update(openclawCredits)
          .set({
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(openclawCredits.id, record.id));
      } else {
        // 查询失败，仍记录到 details
        details.push({
          instanceId: record.id,
          label: record.id.slice(0, 8),
          usage: 0,
          limit: null,
          remaining: null,
          is_free_tier: false,
        });

        await db
          .update(openclawCredits)
          .set({
            lastSyncAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(openclawCredits.id, record.id));
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalLimit: hasAnyLimit ? totalLimit : 0,
        totalUsage,
        totalRemaining: hasAnyLimit ? totalRemaining : 0,
        instanceCount: records.length,
        details,
      },
    });
  } catch (error) {
    console.error('Error fetching openclaw credits:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
