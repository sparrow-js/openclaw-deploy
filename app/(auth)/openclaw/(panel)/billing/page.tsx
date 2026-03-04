"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Wallet,
  DollarSign,
  TrendingUp,
  Sparkles,
  Loader2,
  RefreshCw,
  Check,
  Calendar,
  Gift,
  ShoppingCart,
  XCircle,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
import { usePanelContext } from "../context";
import {
  PLANS,
  type BillingPeriod,
  type PricingPlan,
} from "@/components/PricingModal";

// ===== Credit progress bar =====
function CreditProgressBar({ usage, limit }: { usage: number; limit: number }) {
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;
  return (
    <div className="w-full">
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isDanger
              ? "bg-gradient-to-r from-red-400 to-red-500"
              : isWarning
              ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : "bg-gradient-to-r from-emerald-400 to-teal-500"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// ===== Subscription state type =====
interface SubscriptionData {
  success: boolean;
  hasSubscription: boolean;
  subscription: {
    id: string;
    product: string;
    status: string;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean | null;
  } | null;
}

// Plan name and billing interval by product ID (matches PricingModal)
function getPlanDisplay(productId: string): { planName: string; interval: string } {
  const map: Record<string, { planName: string; interval: string }> = {
    "prod_6675ACpu5rlPbMGHCqm6iD": { planName: "Hosting", interval: "Monthly" },
    "prod_2zVx4AYK0BByTZBc38mjGH": { planName: "Hosting", interval: "Annual" },
    "prod_Bka9IjmZdNWqNUTGqShCD": { planName: "Personal Assistant", interval: "Monthly" },
    "prod_7L8YvbSJH22uSIhj2klY3T": { planName: "Personal Assistant", interval: "Annual" },
  };
  return map[productId] ?? { planName: "OpenClaw", interval: "—" };
}

export default function BillingPage() {
  const { data: session } = useSession();
  const { credits, creditsLoading, refreshCredits } = usePanelContext();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [subLoading, setSubLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annually");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [isCanceling, setIsCanceling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/openclaw/subscription");
        const data = await res.json();
        if (!cancelled) setSubscription(data);
      } catch {
        if (!cancelled) setSubscription({ success: false, hasSubscription: false, subscription: null });
      } finally {
        if (!cancelled) setSubLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/openclaw/subscription");
      const data = await res.json();
      setSubscription(data);
    } catch {
      setSubscription({ success: false, hasSubscription: false, subscription: null });
    }
  };

  const handleCancelSubscription = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = async () => {
    setShowCancelConfirm(false);
    setIsCanceling(true);
    try {
      const res = await fetch("/api/openclaw/subscription/cancel", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to cancel");
      toast.success("Subscription will cancel at period end.");
      await fetchSubscription();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to cancel subscription");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleCheckout = async (plan: PricingPlan) => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }
    const productId =
      billingPeriod === "annually" ? plan.annualProductId : plan.monthlyProductId;
    try {
      setIsProcessing(plan.id);
      const response = await fetch(
        `/api/checkout?product_id=${productId}`
      );
      if (!response.ok) throw new Error("Failed to create checkout session");
      const data = await response.json();
      if (!data.checkoutUrl) throw new Error("Invalid checkout URL received");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to process checkout"
      );
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-gray-900 text-[24px] font-bold">Billing</h1>
        <p className="text-gray-400 text-[14px] mt-1">
          Manage your subscription and usage
        </p>
      </div>

        {/* Subscription Card */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <span className="text-gray-900 text-[16px] font-semibold">Subscription</span>
            </div>
            {!subLoading && subscription?.hasSubscription && subscription.subscription && subscription.subscription.status === "active" && !subscription.subscription.cancelAtPeriodEnd && (
              <button
                type="button"
                onClick={handleCancelSubscription}
                disabled={isCanceling}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCanceling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancel subscription
              </button>
            )}
          </div>
          {subLoading ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-400 text-[14px]">Loading subscription...</span>
            </div>
          ) : subscription?.hasSubscription && subscription.subscription ? (
            (() => {
              const sub = subscription.subscription;
              const { planName, interval } = getPlanDisplay(sub.product);
              const periodStart = formatDate(sub.currentPeriodStart ?? null);
              const periodEnd = formatDate(sub.currentPeriodEnd ?? null);
              const periodText =
                periodStart !== "—" && periodEnd !== "—"
                  ? `${periodStart} – ${periodEnd}`
                  : periodEnd !== "—"
                    ? `Renews: ${periodEnd}`
                    : "—";
              return (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[13px] font-medium">
                      <Check className="w-3.5 h-3.5" />
                      {sub.status === "active" ? "Active" : sub.status}
                    </span>
                    <span className="text-gray-900 text-[15px] font-semibold">{planName}</span>
                    <span className="text-gray-500 text-[13px]">({interval})</span>
                  </div>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-gray-500">Current period:</span>
                      <span className="text-gray-900 font-medium">{periodText}</span>
                    </div>
                    {sub.cancelAtPeriodEnd && (
                      <div className="text-amber-600 font-medium">
                        Cancels at period end
                      </div>
                    )}
                  </dl>
                </div>
              );
            })()
          ) : (
            <p className="text-gray-500 text-[14px]">
              No active subscription. Upgrade to get more credits and features.
            </p>
          )}
        </div>

        {/* Credits Overview */}
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-gray-900 text-[16px] font-semibold">Credits Overview</span>
            </div>
            <button
              onClick={() => refreshCredits()}
              disabled={creditsLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-500 text-[12px] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${creditsLoading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          {creditsLoading && !credits ? (
            <div className="flex items-center gap-3 py-4">
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
              <span className="text-gray-400 text-[14px]">Loading credits...</span>
            </div>
          ) : !credits || credits.instanceCount === 0 ? (
            <p className="text-gray-500 text-[14px]">
              No instances with API keys yet. Deploy an employee to get started.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-600/70 text-[11px] font-medium uppercase tracking-wider">Total Limit</span>
                  </div>
                  <p className="text-emerald-700 text-[22px] font-bold">
                    ${(credits.totalLimit ?? 0).toFixed(2)}
                  </p>
                  <p className="text-emerald-500/60 text-[11px]">
                    {credits.instanceCount} instance{credits.instanceCount > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="rounded-xl border border-orange-200/80 bg-orange-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-orange-500" />
                    <span className="text-orange-600/70 text-[11px] font-medium uppercase tracking-wider">Used</span>
                  </div>
                  <p className="text-orange-700 text-[22px] font-bold">
                    ${(credits.totalUsage ?? 0).toFixed(4)}
                  </p>
                  <p className="text-orange-500/60 text-[11px]">
                    {credits.totalLimit
                      ? `${Math.round(((credits.totalUsage ?? 0) / credits.totalLimit) * 100)}% of total`
                      : "—"}
                  </p>
                </div>
                <div className="rounded-xl border border-blue-200/80 bg-blue-50/60 p-4 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-blue-600/70 text-[11px] font-medium uppercase tracking-wider">Remaining</span>
                  </div>
                  <p className="text-blue-700 text-[22px] font-bold">
                    ${(credits.totalRemaining ?? 0).toFixed(2)}
                  </p>
                  <p className="text-blue-500/60 text-[11px]">
                    {credits.totalLimit
                      ? `${100 - Math.round(((credits.totalUsage ?? 0) / credits.totalLimit) * 100)}% left`
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 text-[12px] font-medium">Overall Usage</span>
                  <span className="text-gray-900 text-[12px] font-semibold">
                    {credits.totalLimit
                      ? `${Math.round(((credits.totalUsage ?? 0) / credits.totalLimit) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <CreditProgressBar
                  usage={credits.totalUsage ?? 0}
                  limit={credits.totalLimit || 1}
                />
              </div>

              {credits.details && credits.details.length > 0 && (
                <div className="space-y-2">
                  <span className="text-gray-500 text-[12px] font-medium">Per Instance</span>
                  <div className="space-y-2.5">
                    {credits.details.map((detail) => {
                      const detailUsage = detail.usage ?? 0;
                      const detailLimit = detail.limit ?? 0;
                      const pct = detailLimit
                        ? Math.round((detailUsage / detailLimit) * 100)
                        : 0;
                      return (
                        <div key={detail.instanceId} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-700 text-[13px] font-medium truncate max-w-[200px]">
                              {detail.label}
                            </span>
                            <span className="text-gray-500 text-[11px] shrink-0 ml-2">
                              ${detailUsage.toFixed(4)} / ${detailLimit ? detailLimit.toFixed(2) : "∞"}
                              <span className="text-gray-400 ml-1">({pct}%)</span>
                            </span>
                          </div>
                          {detailLimit > 0 && (
                            <CreditProgressBar usage={detailUsage} limit={detailLimit} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Already subscribed — no upgrade needed */}
        {!subLoading && subscription?.hasSubscription && (
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 backdrop-blur-xl p-5 shadow-sm flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <Check className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-gray-900 text-[15px] font-semibold">You&apos;re on a plan</p>
              <p className="text-gray-500 text-[13px] mt-0.5">No upgrade needed. Continue using your current credits and features.</p>
            </div>
          </div>
        )}

        {/* Show upgrade section only when there is no active subscription */}
        {!subLoading && !subscription?.hasSubscription && (
        <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 md:p-8 shadow-sm">
          <div className="h-1 rounded-full bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500 mb-6" />
          <div className="text-center mb-6">
            <h2 className="text-gray-900 text-[22px] font-bold">
              Upgrade plan
            </h2>
            <p className="text-gray-500 text-[14px] mt-1">
              Choose a plan to get your cloud-based OpenClaw agent.
            </p>
          </div>

          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-gray-100 border border-gray-200/80 rounded-full p-1">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-5 py-2 rounded-full text-[14px] font-medium transition-all duration-200 flex items-center gap-2 ${
                  billingPeriod === "annually"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Annually
                <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-400 to-purple-500 text-white text-[11px] font-bold">
                  save 17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLANS.map((plan) => {
              const price =
                billingPeriod === "annually" ? plan.annualPrice : plan.monthlyPrice;
              const isPopular = plan.isPopular;
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl p-6 md:p-7 flex flex-col transition-all duration-200 ${
                    isPopular
                      ? "border-2 shadow-lg"
                      : "border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={
                    isPopular
                      ? {
                          borderColor: plan.accentColor,
                          backgroundColor: plan.lightBg,
                          boxShadow: `0 8px 30px ${plan.accentColor}15`,
                        }
                      : undefined
                  }
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-gradient-to-r from-orange-500 via-purple-500 to-blue-500 text-white text-[12px] font-bold shadow-md">
                        Popular
                      </span>
                    </div>
                  )}
                  <h3 className="text-gray-900 text-[18px] font-bold mb-4">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-gray-400 text-[14px] line-through">
                      ${plan.originalMonthlyPrice}
                    </span>
                    <span className="text-gray-900 text-[36px] font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className="text-gray-500 text-[14px] font-medium">/ month</span>
                  </div>
                  {(plan.badgeMonthly || plan.badgeAnnually) && (
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-semibold"
                        style={{
                          backgroundColor: plan.accentColor + "12",
                          color: plan.accentColor,
                          border: `1px solid ${plan.accentColor}30`,
                        }}
                      >
                        <Gift className="w-3.5 h-3.5" />
                        {billingPeriod === "annually" ? plan.badgeAnnually : plan.badgeMonthly}
                      </span>
                    </div>
                  )}
                  <p className="text-gray-500 text-[14px] leading-relaxed mb-6">
                    {plan.description}
                  </p>
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isProcessing === plan.id}
                    className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-[15px] font-bold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{
                      background: isPopular
                        ? "linear-gradient(135deg, #f97316 0%, #a855f7 50%, #3b82f6 100%)"
                        : `linear-gradient(135deg, ${plan.accentColor} 0%, ${plan.accentColor}dd 100%)`,
                      boxShadow: `0 4px 20px ${plan.accentColor}30`,
                    }}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {isProcessing === plan.id ? "Processing..." : plan.ctaText}
                  </button>
                  <p className="text-gray-400 text-[12px] mt-3 text-center font-medium">
                    {billingPeriod === "annually"
                      ? "billed annually, cancel anytime"
                      : "billed monthly, cancel anytime"}
                  </p>
                  <div className="border-t border-gray-200 my-6" />
                  <h4 className="text-gray-700 text-[14px] font-bold mb-4">
                    {plan.featureTitle}
                  </h4>
                  <ul className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => {
                      const text = feature.dynamic
                        ? feature.text.replace("${credits}", billingPeriod === "annually" ? "$180" : "$15")
                        : feature.text;
                      return (
                        <li key={idx} className="flex items-start gap-2.5">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: plan.accentColor + "15" }}
                          >
                            <Check className="w-3 h-3" style={{ color: plan.accentColor }} />
                          </div>
                          <span className="text-gray-600 text-[14px]">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
        )}

      {/* Cancel subscription confirmation modal */}
      {showCancelConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
          onClick={() => setShowCancelConfirm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-gray-900 text-[18px] font-semibold">Cancel subscription</h3>
            </div>
            <p className="text-gray-600 text-[14px] leading-relaxed mb-6">
              Your subscription will cancel at the end of the current period. You’ll keep access until then.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                className="px-4 py-2.5 rounded-lg text-[14px] font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Keep subscription
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-4 py-2.5 rounded-lg text-[14px] font-medium text-white bg-red-500 hover:bg-red-600 transition-colors"
              >
                Cancel at period end
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
