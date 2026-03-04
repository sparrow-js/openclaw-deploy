/**
 * Unified Webhook API Route
 * 
 * Handles incoming webhooks from Creem's payment system.
 * Routes to appropriate handler based on product ID:
 * - OpenClaw products → OpenClaw subscription logic (userId-based)
 * - Other products → Standard payment logic (userId-based)
 * 
 * @module api/webhook
 */

import { NextResponse, NextRequest } from "next/server";
import { db } from '@/db';
import { subscription, oneTimePurchase, credits, openclawCredits } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { createOpenRouterApiKey } from '@/lib/openrouter';

/**
 * Webhook Response Interface
 * 
 * Represents the structure of incoming webhook events from Creem.
 */
export interface WebhookResponse {
  id: string;
  eventType: string;
  object: {
    request_id: string;
    object: string;
    id: string;
    customer: {
      id: string;
    };
    product: {
      id: string;
      billing_type: string;
    };
    status: string;
    metadata: any;
    /** 订阅当前周期开始（ISO 或秒级时间戳） */
    current_period_start?: string | number;
    /** 订阅当前周期结束（ISO 或秒级时间戳） */
    current_period_end?: string | number;
  };
}

// =============================================================================
// OpenClaw Product Constants & Logic
// =============================================================================

/**
 * OpenClaw Product IDs (from PricingModal)
 */
const OPENCLAW_PRODUCTS = {
  // Hosting plan
  // test
  HOSTING_MONTHLY: "prod_6675ACpu5rlPbMGHCqm6iD",
  HOSTING_ANNUAL: "prod_2zVx4AYK0BByTZBc38mjGH",
  // Personal Assistant plan
  // test
  PERSONAL_ASSISTANT_MONTHLY: "prod_Bka9IjmZdNWqNUTGqShCD",
  PERSONAL_ASSISTANT_ANNUAL: "prod_7L8YvbSJH22uSIhj2klY3T",
} as const;

/** Personal Assistant product IDs (includes built-in AI credits) */
const PERSONAL_ASSISTANT_PRODUCTS = new Set<string>([
  OPENCLAW_PRODUCTS.PERSONAL_ASSISTANT_MONTHLY,
  OPENCLAW_PRODUCTS.PERSONAL_ASSISTANT_ANNUAL,
]);

/** All valid OpenClaw product IDs */
const ALL_OPENCLAW_PRODUCTS = new Set<string>(Object.values(OPENCLAW_PRODUCTS));

/** 年付产品 ID（用于计算默认周期） */
const OPENCLAW_ANNUAL_PRODUCTS = new Set<string>([
  OPENCLAW_PRODUCTS.HOSTING_ANNUAL,
  OPENCLAW_PRODUCTS.PERSONAL_ASSISTANT_ANNUAL,
]);

function parsePeriodDate(v: string | number | undefined): Date | null {
  if (v == null) return null;
  if (typeof v === "number") return new Date(v * 1000);
  try {
    const d = new Date(v);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

/** 无 webhook 周期时按产品类型生成默认周期（当前周期开始=now，结束=now+1月/1年） */
function defaultPeriodEnd(productId: string): { start: Date; end: Date } {
  const start = new Date();
  const end = new Date(start);
  if (OPENCLAW_ANNUAL_PRODUCTS.has(productId)) {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return { start, end };
}

/** Credit limits per plan period */
const CREDIT_LIMITS: Record<string, number> = {
  [OPENCLAW_PRODUCTS.HOSTING_MONTHLY]: 5,   // 月 5 凭证
  [OPENCLAW_PRODUCTS.HOSTING_ANNUAL]: 60,    // 60 凭证 (年付)
  [OPENCLAW_PRODUCTS.PERSONAL_ASSISTANT_MONTHLY]: 15,  // $15/month
  [OPENCLAW_PRODUCTS.PERSONAL_ASSISTANT_ANNUAL]: 180,   // $15/month (billed annually)
};

/**
 * Provision OpenRouter API Key for Personal Assistant plan
 * 
 * Creates an OpenRouter API Key with monthly credit limit and stores it
 * in the openclawCredits table for the user.
 * 
 * If the user already has an openclawCredits record, skip creation.
 * 
 * @param userId - The user ID to provision credits for
 * @param creditLimit - Monthly credit limit in dollars
 */
async function provisionOpenClawCredits(userId: string, creditLimit: number): Promise<void> {
  try {
    console.log(`[OpenClaw Webhook] Provisioning OpenRouter API Key for user ${userId} (limit: $${creditLimit}/month)`);
    // Check if user already has an openclawCredits record
    const existing = await db
      .select({ id: openclawCredits.id, openrouterApiKey: openclawCredits.openrouterApiKey })
      .from(openclawCredits)
      .where(eq(openclawCredits.userId, userId))
      .limit(1);

    if (existing.length > 0 && existing[0].openrouterApiKey) {
      // User already has credits with an API key, just update timestamp
      await db
        .update(openclawCredits)
        .set({ updatedAt: new Date() })
        .where(eq(openclawCredits.userId, userId));
      console.log(`[OpenClaw Webhook] User ${userId} already has OpenRouter API Key, skipped provisioning`);
      return;
    }

    const adminApiKey = process.env.OPEN_ROUTER_MANAGEMENT_KEY;
    if (!adminApiKey) {
      console.error('[OpenClaw Webhook] OPEN_ROUTER_MANAGEMENT_KEY not configured');
      return;
    }

    // Create OpenRouter API Key with monthly reset
    const keyName = `openclaw-pa-${userId.slice(0, 8)}-${Date.now()}`;
    console.log(`[OpenClaw Webhook] Creating OpenRouter API Key: ${keyName}`);
    const keyResult = await createOpenRouterApiKey(adminApiKey, {
      name: keyName,
      limit: creditLimit,
      limitReset: 'monthly',
    });

    if (!keyResult.success) {
      console.error(`[OpenClaw Webhook] Failed to create OpenRouter API Key: ${keyResult.error}`);
      return;
    }

    const openrouterApiKey = keyResult.data.key;
    const openrouterApiKeyHash = keyResult.data.data.hash;

    if (existing.length > 0) {
      // Update existing record with the new API key
      await db
        .update(openclawCredits)
        .set({
          openrouterApiKey,
          openrouterApiKeyHash,
          updatedAt: new Date(),
        })
        .where(eq(openclawCredits.userId, userId));
    } else {
      // Create new openclawCredits record
      await db.insert(openclawCredits).values({
        userId,
        openrouterApiKey,
        openrouterApiKeyHash,
      });
    }

    console.log(`[OpenClaw Webhook] Provisioned OpenRouter API Key for user ${userId} (limit: $${creditLimit}/month)`);
  } catch (error) {
    console.error(`[OpenClaw Webhook] Failed to provision credits for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Handle OpenClaw webhook events
 * 
 * All OpenClaw plans are subscriptions (no one-time payments).
 * Uses userId for tracking (no workspace logic).
 * 
 * Plans:
 * - Hosting: Cloud-based OpenClaw bot (user brings their own AI models)
 * - Personal Assistant: Cloud bot + built-in AI credits (OpenRouter API Key)
 * 
 * Event Types:
 * - subscription.paid: New subscription or successful renewal
 * - subscription.canceled: Subscription cancellation requested
 * - subscription.expired: Subscription ended
 */
async function handleOpenClawWebhook(webhook: WebhookResponse): Promise<NextResponse> {
  const productId = webhook.object.product.id;
  const userId = webhook.object.metadata?.userId || webhook.object.request_id;
  const subscriptionId = webhook.object.id;
  const providerCustomerId = webhook.object.customer.id;
  console.log(`[OpenClaw Webhook] Event: ${webhook.eventType}, Product: ${productId}, User: ${userId}`);

  if (webhook.eventType === "subscription.paid") {
    /**
     * Subscription Paid
     * - New subscription or successful renewal
     * - Upsert subscription record
     * - Provision OpenRouter API Key with monthly credits for all plans
     */
    console.log(`[OpenClaw Webhook] Subscription paid for user ${userId}, product ${productId}`);

    const periodStart = parsePeriodDate(webhook.object.current_period_start);
    const periodEnd = parsePeriodDate(webhook.object.current_period_end);
    const { start: defaultStart, end: defaultEnd } = defaultPeriodEnd(productId);
    const currentPeriodStart = periodStart ?? defaultStart;
    const currentPeriodEnd = periodEnd ?? defaultEnd;

    // Upsert subscription to handle both new and renewal payments
    const existingSubscription = await db
      .select()
      .from(subscription)
      .where(eq(subscription.id, subscriptionId))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription（含周期，便于续费后更新）
      await db
        .update(subscription)
        .set({
          status: "active",
          currentPeriodStart,
          currentPeriodEnd,
          updatedAt: new Date(),
        })
        .where(eq(subscription.id, subscriptionId));
    } else {
      // Create new subscription
      await db.insert(subscription).values({
        id: subscriptionId,
        userId,
        product: productId,
        status: "active",
        providerCustomerId,
        providerSubscriptionId: subscriptionId,
        price: 0,
        currency: 'USD',
        currentPeriodStart,
        currentPeriodEnd,
      });
    }

    const creditLimit = CREDIT_LIMITS[productId] || 0;
    await provisionOpenClawCredits(userId, creditLimit);
  }

  if (webhook.eventType === "subscription.canceled") {
    /**
     * Subscription Canceled
     * - User requested cancellation
     * - Access typically maintained until period end
     */
    console.log(`[OpenClaw Webhook] Subscription canceled for user ${userId}, product ${productId}`);

    await db
      .update(subscription)
      .set({
        status: "canceled",
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, subscriptionId));
  }

  if (webhook.eventType === "subscription.expired") {
    /**
     * Subscription Expired
     * - Payment failed or canceled period ended
     * - Revoke access to subscription features
     */
    console.log(`[OpenClaw Webhook] Subscription expired for user ${userId}, product ${productId}`);

    await db
      .update(subscription)
      .set({
        status: "expired",
        updatedAt: new Date(),
      })
      .where(eq(subscription.id, subscriptionId));
  }

  return NextResponse.json({
    success: true,
    message: "Webhook received successfully",
  });
}

// =============================================================================
// Standard Webhook Logic (user-based)
// =============================================================================

/**
 * Add credits for one-time purchase (by userId).
 */
async function addCredits(userId: string, creditAmount: number): Promise<void> {
  try {
    const existingCredits = await db
      .select({ totalCredits: credits.totalCredits, usedCredits: credits.usedCredits })
      .from(credits)
      .where(eq(credits.userId, userId))
      .limit(1);

    if (existingCredits.length > 0) {
      const currentRecord = existingCredits[0];
      const newTotalCredits = currentRecord.totalCredits + creditAmount;
      await db
        .update(credits)
        .set({ totalCredits: newTotalCredits, updatedAt: new Date() })
        .where(eq(credits.userId, userId));
    } else {
      await db.insert(credits).values({
        userId,
        totalCredits: creditAmount,
        usedCredits: 0,
      });
    }
  } catch (error) {
    console.error(`Failed to add credits for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Recharge credits for subscription renewal (by userId).
 */
async function rechargeCredits(userId: string, creditAmount: number): Promise<void> {
  try {
    const existingCredits = await db
      .select({ totalCredits: credits.totalCredits, usedCredits: credits.usedCredits })
      .from(credits)
      .where(eq(credits.userId, userId))
      .limit(1);

    if (existingCredits.length > 0) {
      const currentRecord = existingCredits[0];
      const remainingCredits = currentRecord.totalCredits - currentRecord.usedCredits;
      const newTotalCredits = remainingCredits + creditAmount;
      await db
        .update(credits)
        .set({
          totalCredits: newTotalCredits,
          usedCredits: 0,
          updatedAt: new Date(),
        })
        .where(eq(credits.userId, userId));
    } else {
      await db.insert(credits).values({
        userId,
        totalCredits: creditAmount,
        usedCredits: 0,
      });
    }
  } catch (error) {
    console.error(`Failed to recharge credits for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Handle standard webhook events (user-based).
 */
async function handleStandardWebhook(webhook: WebhookResponse): Promise<NextResponse> {
  const isSubscription = webhook.object.product.billing_type === "recurring";
  const userId = webhook.object.metadata?.userId || webhook.object.request_id;

  if (!userId) {
    console.error('[Webhook] No userId in metadata or request_id');
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  if (!isSubscription) {
    if (webhook.eventType === "checkout.completed") {
      const productId = webhook.object.product.id;
      const providerCustomerId = webhook.object.customer.id;

      await db.insert(oneTimePurchase).values({
        id: webhook.object.id,
        userId,
        product: productId,
        providerCustomerId,
        providerPaymentId: webhook.object.id,
        price: 0,
        currency: 'USD',
        status: 'completed',
      });

      if (productId === "prod_1CYy8zHjvROsgvjs2o6jo2/ch_1l9rGdJg1oR7Bwe13Ny7fS") {
        await addCredits(userId, 50);
      }
    }
  } else {
    if (webhook.eventType === "subscription.paid") {
      const productId = webhook.object.product.id;
      const providerCustomerId = webhook.object.customer.id;

      const existingSubscription = await db
        .select()
        .from(subscription)
        .where(eq(subscription.id, webhook.object.id))
        .limit(1);

      if (existingSubscription.length > 0) {
        await db
          .update(subscription)
          .set({ status: "active", updatedAt: new Date() })
          .where(eq(subscription.id, webhook.object.id));
      } else {
        await db.insert(subscription).values({
          id: webhook.object.id,
          userId,
          product: productId,
          status: "active",
          providerCustomerId,
          providerSubscriptionId: webhook.object.id,
          price: 0,
          currency: 'USD',
        });
      }

      if (productId === "prod_2b7MmbBoPnhLryOjs3kBLE/ch_2HOQUtZ1pWch4cW5Ua2fCa") {
        await rechargeCredits(userId, 100);
      }
    }

    if (webhook.eventType === "subscription.canceled") {
      await db
        .update(subscription)
        .set({ status: "canceled", updatedAt: new Date() })
        .where(eq(subscription.id, webhook.object.id));
    }

    if (webhook.eventType === "subscription.expired") {
      await db
        .update(subscription)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(subscription.id, webhook.object.id));
    }
  }

  return NextResponse.json({
    success: true,
    message: "Webhook received successfully",
  });
}

// =============================================================================
// Unified POST Handler
// =============================================================================

/**
 * POST /api/webhook
 * 
 * Unified webhook endpoint that routes to appropriate handler based on product ID.
 * - OpenClaw products → handleOpenClawWebhook (userId-based, subscriptions only)
 * - Other products → handleStandardWebhook (userId-based, one-time + subscriptions)
 * 
 * @param req - Incoming webhook request
 * @returns Confirmation of webhook processing
 */
export async function POST(req: NextRequest) {
  const webhook = (await req.json()) as WebhookResponse;
  const productId = webhook.object.product.id;

  // Route to appropriate handler based on product ID
  if (ALL_OPENCLAW_PRODUCTS.has(productId)) {
    return handleOpenClawWebhook(webhook);
  } else {
    return handleStandardWebhook(webhook);
  }
}
