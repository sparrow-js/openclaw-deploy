import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { db } from '@/db';
import { subscription } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';

const OPENCLAW_PRODUCT_IDS = [
  "prod_6675ACpu5rlPbMGHCqm6iD",
  "prod_2zVx4AYK0BByTZBc38mjGH",
  "prod_Bka9IjmZdNWqNUTGqShCD",
  "prod_7L8YvbSJH22uSIhj2klY3T",
];

const OPENCLAW_ANNUAL_PRODUCTS = new Set([
  "prod_2zVx4AYK0BByTZBc38mjGH",
  "prod_7L8YvbSJH22uSIhj2klY3T",
]);

function fallbackPeriod(
  productId: string,
  createdAt: Date
): { start: string; end: string } {
  const start = new Date(createdAt);
  const end = new Date(start);
  if (OPENCLAW_ANNUAL_PRODUCTS.has(productId)) {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * GET /api/openclaw/subscription
 * 检查当前用户是否有活跃的 OpenClaw 订阅（按 userId）
 */
export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeSubscriptions = await db
      .select()
      .from(subscription)
      .where(
        and(
          eq(subscription.userId, userId),
          inArray(subscription.product, OPENCLAW_PRODUCT_IDS),
          eq(subscription.status, 'active')
        )
      );

    if (activeSubscriptions.length > 0) {
      const sub = activeSubscriptions[0];
      const periodStart =
        sub.currentPeriodStart != null
          ? sub.currentPeriodStart.toISOString()
          : fallbackPeriod(sub.product, sub.createdAt).start;
      const periodEnd =
        sub.currentPeriodEnd != null
          ? sub.currentPeriodEnd.toISOString()
          : fallbackPeriod(sub.product, sub.createdAt).end;
      return NextResponse.json({
        success: true,
        hasSubscription: true,
        subscription: {
          id: sub.id,
          product: sub.product,
          status: sub.status,
          currentPeriodStart: periodStart,
          currentPeriodEnd: periodEnd,
          cancelAtPeriodEnd: sub.cancelAtPeriodEnd ?? false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      hasSubscription: false,
      subscription: null,
    });
  } catch (error) {
    console.error('Error checking openclaw subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
