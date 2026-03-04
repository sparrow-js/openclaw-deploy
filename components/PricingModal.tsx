"use client";

import { useState, useRef, useEffect } from "react";
import { X, Check, Gift, ShoppingCart } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";

// ===== 计划类型 =====
export type BillingPeriod = "monthly" | "annually";

interface PlanFeature {
  text: string;
  dynamic?: boolean; // 需要根据 billing period 动态替换 ${credits}
}

export interface PricingPlan {
  id: string;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  originalMonthlyPrice: number;
  description: string;
  features: PlanFeature[];
  featureTitle: string;
  ctaText: string;
  isPopular?: boolean;
  badgeMonthly?: string;
  badgeAnnually?: string;
  accentColor: string;
  lightBg: string;
  // Creem product IDs
  monthlyProductId: string;
  annualProductId: string;
}

export const PLANS: PricingPlan[] = [
  {
    id: "hosting",
    name: "Hosting",
    monthlyPrice: 29.9,
    annualPrice: 24.9,
    originalMonthlyPrice: 39.9,
    description: "Cloud-based OpenClaw bot, hosted on our cloud servers.",
    featureTitle: "Cloud Bot features",
    accentColor: "#f97316",
    lightBg: "#fff7f3",
    features: [
      { text: "1 AI agent deployment" },
      { text: "Includes all OpenClaw features" },
      { text: "Independent storage" },
      { text: "Long-term memory" },
      { text: "7*24 hours working" },
      { text: "Multi-channel access" },
    ],
    ctaText: "Get your bot",
    badgeMonthly: "$5 credits",
    badgeAnnually: "$60 credits",
    monthlyProductId: "prod_6675ACpu5rlPbMGHCqm6iD",
    annualProductId: "prod_2zVx4AYK0BByTZBc38mjGH",
    // test
    // monthlyProductId: "prod_3zvOcH99FjZRUvADW6eVlh",
    // annualProductId: "prod_476iheZTHTcIfxg650jq3J",
  },
  {
    id: "personal-assistant",
    name: "Personal Assistant",
    monthlyPrice: 39.9,
    annualPrice: 32.9,
    originalMonthlyPrice: 49.9,
    description: "Your personal assistant, with built-in AI models.",
    featureTitle: "Personal Assistant features",
    accentColor: "#ea580c",
    lightBg: "#fff7ed",
    features: [
      { text: "1 AI agent deployment" },
      { text: "Includes all Cloud Bot features" },
      { text: "Built-in AI models with ${credits} credits", dynamic: true },
      { text: "Zero setup, start in minutes" },
      { text: "Professional support" },
    ],
    ctaText: "Get your assistant",
    isPopular: true,
    badgeMonthly: "$15 credits",
    badgeAnnually: "$180 credits",
    monthlyProductId: "prod_Bka9IjmZdNWqNUTGqShCD",
    annualProductId: "prod_7L8YvbSJH22uSIhj2klY3T",
    // test
    // monthlyProductId: "prod_6gvAHL0wKPybaPh4UlVOJ5",
    // annualProductId: "prod_5TAR1YXDdWFuOsqg6NFIVw",
  },
];

// ===== PricingModal 组件 =====
export function OpenClawPricingModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annually");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  // ESC 关闭
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleCheckout = async (plan: PricingPlan) => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }

    const productId =
      billingPeriod === "annually"
        ? plan.annualProductId
        : plan.monthlyProductId;

    try {
      setIsProcessing(plan.id);
      const response = await fetch(
        `/api/checkout?product_id=${productId}`
      );
      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }
      const data = await response.json();

      if (!data.checkoutUrl) {
        throw new Error("Invalid checkout URL received");
      }

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="oc-pricing-enter w-full max-w-[700px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200/80 bg-white/95 backdrop-blur-xl shadow-2xl shadow-gray-300/40 scrollbar-hide relative"
      >
        {/* 顶部彩色条 */}
        <div className="h-1 bg-gradient-to-r from-orange-400 to-orange-600" />

        <div className="p-6 md:p-7">
          {/* 关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
          >
            <X className="w-4 h-4" />
          </button>

          {/* 标题 */}
          <div className="text-center mb-5">
            <h2 className="text-[24px] md:text-[28px] font-extrabold tracking-tight leading-[1.08]">
              <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Pricing
              </span>
            </h2>
            <p className="text-gray-500 text-[13px] mt-1.5">
              Choose a plan to get your cloud-based OpenClaw agent.
            </p>
          </div>

          {/* 月付/年付切换 */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center bg-gray-100 border border-gray-200/80 rounded-full p-0.5">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-4 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  billingPeriod === "annually"
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200/60"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Annually
                <span className="px-1.5 py-px rounded-full bg-gradient-to-r from-orange-400 to-orange-600 text-white text-[10px] font-bold">
                  save 17%
                </span>
              </button>
            </div>
          </div>

          {/* 价格卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {PLANS.map((plan) => {
              const price =
                billingPeriod === "annually"
                  ? plan.annualPrice
                  : plan.monthlyPrice;
              const showOriginalPrice = true;
              const isPopular = plan.isPopular;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-4 md:p-5 flex flex-col transition-all duration-200 ${
                    isPopular
                      ? "border-2 shadow-lg"
                      : "border-2 border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                  }`}
                  style={
                    isPopular
                      ? {
                          borderColor: plan.accentColor,
                          backgroundColor: plan.lightBg,
                          boxShadow: `0 6px 24px ${plan.accentColor}15`,
                        }
                      : undefined
                  }
                >
                  {/* Popular 标签 */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold shadow-md">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* 计划名称 */}
                  <h3 className="text-gray-900 text-[15px] font-bold mb-2.5">
                    {plan.name}
                  </h3>

                  {/* 价格 */}
                  <div className="flex items-baseline gap-1.5 mb-2.5">
                    {showOriginalPrice && (
                      <span className="text-gray-400 text-[12px] line-through">
                        ${plan.originalMonthlyPrice}
                      </span>
                    )}
                    <span className="text-gray-900 text-[28px] font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className="text-gray-500 text-[12px] font-medium">/ month</span>
                  </div>

                  {/* Badge */}
                  {(plan.badgeMonthly || plan.badgeAnnually) && (
                    <div className="mb-2.5">
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{
                          backgroundColor: plan.accentColor + "12",
                          color: plan.accentColor,
                          border: `1px solid ${plan.accentColor}30`,
                        }}
                      >
                        <Gift className="w-3 h-3" />
                        {billingPeriod === "annually" ? plan.badgeAnnually : plan.badgeMonthly}
                      </span>
                    </div>
                  )}

                  {/* 描述 */}
                  <p className="text-gray-500 text-[12px] leading-relaxed mb-4">
                    {plan.description}
                  </p>

                  {/* CTA 按钮 */}
                  <button
                    onClick={() => handleCheckout(plan)}
                    disabled={isProcessing === plan.id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-[13px] font-bold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{
                      background: isPopular
                        ? "linear-gradient(135deg, #f97316 0%, #ea580c 100%)"
                        : `linear-gradient(135deg, ${plan.accentColor} 0%, ${plan.accentColor}dd 100%)`,
                      boxShadow: `0 3px 14px ${plan.accentColor}30`,
                    }}
                  >
                    {!isProcessing && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
                    <ShoppingCart className="w-3.5 h-3.5" />
                    {isProcessing === plan.id ? "Processing..." : plan.ctaText}
                  </button>

                  {/* 账单说明 */}
                  <p className="text-gray-400 text-[11px] mt-2 text-center font-medium">
                    {billingPeriod === "annually"
                      ? "billed annually, cancel anytime"
                      : "billed monthly, cancel anytime"}
                  </p>

                  {/* 分割线 */}
                  <div className="border-t border-gray-200 my-4" />

                  {/* 功能标题 */}
                  <h4 className="text-gray-700 text-[12px] font-bold mb-2.5">
                    {plan.featureTitle}
                  </h4>

                  {/* 功能列表 */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map((feature, idx) => {
                      const text = feature.dynamic
                        ? feature.text.replace("${credits}", billingPeriod === "annually" ? "$180" : "$15")
                        : feature.text;
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: plan.accentColor + "15" }}
                          >
                            <Check
                              className="w-2.5 h-2.5"
                              style={{ color: plan.accentColor }}
                            />
                          </div>
                          <span className="text-gray-600 text-[12px]">
                            {text}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        .oc-pricing-enter {
          animation: ocPricingIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes ocPricingIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(16px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
