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

/**
 * POST /api/openclaw/subscription/cancel
 * 取消当前用户的 OpenClaw 订阅（按 userId 查找）
 */
export async function POST() {
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

    if (activeSubscriptions.length === 0) {
      return NextResponse.json(
        { error: 'No active subscription to cancel' },
        { status: 404 }
      );
    }

    const sub = activeSubscriptions[0];
    const apiKey = process.env.CREEM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Billing not configured' },
        { status: 500 }
      );
    }

    const res = await fetch(
      `https://api.creem.io/v1/subscriptions/${encodeURIComponent(sub.id)}/cancel`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ mode: 'scheduled' }),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[OpenClaw] Creem cancel failed:', res.status, err);
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription will cancel at period end.',
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
