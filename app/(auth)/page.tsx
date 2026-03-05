"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Zap, Check, ExternalLink, X, Eye, EyeOff, Loader2, CheckCircle2, XCircle, Rocket, Sparkles, ArrowRight, Bot, Globe, ShoppingCart, Gift, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { supabase } from "@/lib/supabase";
import { OpenClawPricingModal, PLANS, type BillingPeriod } from "@/components/PricingModal";
import { TraditionalVsClawDrift } from "@/components/TraditionalVsClawDrift";
import type { ModelOption, ChannelOption } from "@/lib/constants/openclaw-deploy";
import { MODEL_TO_OPENROUTER_ID, CHANNEL_DISPLAY_NAMES } from "@/lib/constants/openclaw-deploy";
import { CHANNEL_CONFIGS, MODEL_OPTIONS, CHANNEL_OPTIONS } from "@/lib/constants/openclaw-channels";
import { AppHeader } from "@/components/AppHeader";

// ===== 连接通道弹窗组件 =====
function ConnectChannelModal({
  channel,
  isOpen,
  onClose,
  onConnect,
}: {
  channel: ChannelOption;
  isOpen: boolean;
  onClose: () => void;
  onConnect: (credentials: Record<string, string>) => void;
}) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [multiInputs, setMultiInputs] = useState<Record<string, string>>({});
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});
  const modalRef = useRef<HTMLDivElement>(null);
  const config = CHANNEL_CONFIGS[channel];
  const hasMultiInputs = !!config.inputs && config.inputs.length > 0;

  useEffect(() => {
    setToken("");
    setShowToken(false);
    setMultiInputs({});
    setShowFields({});
  }, [channel]);

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

  let stepCounter = 0;

  const handleSubmit = () => {
    if (hasMultiInputs) {
      const emptyField = config.inputs!.find((f) => !multiInputs[f.key]?.trim());
      if (emptyField) {
        toast.error(`Please enter ${emptyField.label}`);
        return;
      }
      onConnect(multiInputs);
    } else {
      if (!token.trim()) {
        toast.error("Please enter a token");
        return;
      }
      onConnect({ token });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/30 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="oc-modal-enter w-full max-w-[580px] max-h-[90vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-7 md:p-8 space-y-5 scrollbar-hide shadow-2xl"
      >
        {/* 头部 */}
        <div className="flex items-start gap-4">
          <div
            className="shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: config.accentColor + "12" }}
          >
            {config.icon}
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <h2 className="text-gray-900 text-[22px] font-bold tracking-tight">Connect {config.name}</h2>
            <p className="text-gray-500 text-sm mt-0.5">{config.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 分区步骤说明 */}
        {config.sections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="rounded-xl border border-gray-100 bg-gray-50/70 px-5 py-4 space-y-3">
            <p
              className="text-[11px] font-bold tracking-[0.14em] uppercase"
              style={{ color: config.accentColor }}
            >
              {section.title}
            </p>
            {section.steps.map((stepContent, stepIdx) => {
              stepCounter++;
              return (
                <div key={stepIdx} className="flex items-start gap-3">
                  <span
                    className="shrink-0 mt-0.5 w-6 h-6 rounded-lg text-[12px] font-bold flex items-center justify-center text-white"
                    style={{ backgroundColor: config.accentColor }}
                  >
                    {stepCounter}
                  </span>
                  <p className="text-gray-600 text-[14px] leading-relaxed">
                    {stepContent}
                  </p>
                </div>
              );
            })}
          </div>
        ))}

        {/* 输入区域 */}
        {hasMultiInputs ? (
          <div className="space-y-3">
            {config.inputs!.map((field) => (
              <div key={field.key} className="space-y-2">
                <label className="text-gray-500 text-[12px] font-semibold uppercase tracking-wider">
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.secret && !showFields[field.key] ? "password" : "text"}
                    value={multiInputs[field.key] || ""}
                    onChange={(e) =>
                      setMultiInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                    }
                    placeholder={field.placeholder}
                    className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] font-mono placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
                    style={{
                      borderColor: multiInputs[field.key] ? config.accentColor + "66" : undefined,
                    }}
                  />
                  {field.secret && (
                    <button
                      onClick={() =>
                        setShowFields((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showFields[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder={config.placeholder}
              className="w-full px-4 py-3.5 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 text-[14px] font-mono placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
              style={{ borderColor: token ? config.accentColor + "66" : undefined }}
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* 底部操作栏 */}
        <div className="flex items-center justify-between pt-2">
          <a
            href={config.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-[14px] font-medium transition-colors"
            style={{ color: config.linkColor }}
            onMouseEnter={(e) => (e.currentTarget.style.color = config.linkColorHover)}
            onMouseLeave={(e) => (e.currentTarget.style.color = config.linkColor)}
          >
            {config.linkText}
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={handleSubmit}
            className="px-8 py-2.5 rounded-xl text-white text-[15px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
            style={{
              backgroundColor: config.accentColor,
              boxShadow: `0 4px 14px ${config.accentColor}40`,
            }}
          >
            {config.buttonText}
          </button>
        </div>
      </div>

      <style jsx>{`
        .oc-modal-enter {
          animation: ocModalIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes ocModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(16px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ===== 连接通道内联表单（弹窗内容直接放在页面下方） =====
function ConnectChannelInline({
  channel,
  onConnect,
}: {
  channel: ChannelOption;
  onConnect: (credentials: Record<string, string>) => void;
}) {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [multiInputs, setMultiInputs] = useState<Record<string, string>>({});
  const [showFields, setShowFields] = useState<Record<string, boolean>>({});
  const config = CHANNEL_CONFIGS[channel];
  const hasMultiInputs = !!config.inputs && config.inputs.length > 0;

  useEffect(() => {
    setToken("");
    setShowToken(false);
    setMultiInputs({});
    setShowFields({});
  }, [channel]);

  let stepCounter = 0;

  const handleSubmit = () => {
    if (hasMultiInputs) {
      const emptyField = config.inputs!.find((f) => !multiInputs[f.key]?.trim());
      if (emptyField) {
        toast.error(`Please enter ${emptyField.label}`);
        return;
      }
      onConnect(multiInputs);
    } else {
      if (!token.trim()) {
        toast.error("Please enter a token");
        return;
      }
      onConnect({ token });
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div
          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: config.accentColor + "12" }}
        >
          {config.icon}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <h3 className="text-gray-900 text-[16px] font-bold tracking-tight">Connect {config.name}</h3>
          <p className="text-gray-500 text-[13px] mt-0.5">{config.subtitle}</p>
        </div>
      </div>

      {config.sections.map((section, sectionIdx) => (
        <div key={sectionIdx} className="rounded-xl border border-gray-100 bg-white px-4 py-3 space-y-2">
          <p
            className="text-[11px] font-bold tracking-[0.14em] uppercase"
            style={{ color: config.accentColor }}
          >
            {section.title}
          </p>
          {section.steps.map((stepContent, stepIdx) => {
            stepCounter++;
            return (
              <div key={stepIdx} className="flex items-start gap-2.5">
                <span
                  className="shrink-0 mt-0.5 w-5 h-5 rounded-md text-[11px] font-bold flex items-center justify-center text-white"
                  style={{ backgroundColor: config.accentColor }}
                >
                  {stepCounter}
                </span>
                <p className="text-gray-600 text-[13px] leading-relaxed">
                  {stepContent}
                </p>
              </div>
            );
          })}
        </div>
      ))}

      {hasMultiInputs ? (
        <div className="space-y-2.5">
          {config.inputs!.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-gray-500 text-[12px] font-semibold uppercase tracking-wider">
                {field.label}
              </label>
              <div className="relative">
                <input
                  type={field.secret && !showFields[field.key] ? "password" : "text"}
                  value={multiInputs[field.key] || ""}
                  onChange={(e) =>
                    setMultiInputs((prev) => ({ ...prev, [field.key]: e.target.value }))
                  }
                  placeholder={field.placeholder}
                  className="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-mono placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
                  style={{
                    borderColor: multiInputs[field.key] ? config.accentColor + "66" : undefined,
                  }}
                />
                {field.secret && (
                  <button
                    type="button"
                    onClick={() =>
                      setShowFields((prev) => ({ ...prev, [field.key]: !prev[field.key] }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showFields[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <input
            type={showToken ? "text" : "password"}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder={config.placeholder}
            className="w-full px-3.5 py-2.5 pr-12 rounded-xl border border-gray-200 bg-white text-gray-900 text-[13px] font-mono placeholder-gray-400 outline-none transition-all duration-200 focus:border-gray-300 focus:ring-2 focus:ring-gray-200"
            style={{ borderColor: token ? config.accentColor + "66" : undefined }}
          />
          <button
            type="button"
            onClick={() => setShowToken(!showToken)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <a
          href={config.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[14px] font-medium transition-colors"
          style={{ color: config.linkColor }}
          onMouseEnter={(e) => (e.currentTarget.style.color = config.linkColorHover)}
          onMouseLeave={(e) => (e.currentTarget.style.color = config.linkColor)}
        >
          {config.linkText}
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
        <button
          type="button"
          onClick={handleSubmit}
          className="px-6 py-2 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          style={{
            backgroundColor: config.accentColor,
            boxShadow: `0 4px 14px ${config.accentColor}40`,
          }}
        >
          {config.buttonText}
        </button>
      </div>
    </div>
  );
}

// ===== 部署步骤定义 =====
interface DeployStep {
  event: string;
  label: string;
  status: "pending" | "active" | "success" | "error";
  detail?: string;
}

const INITIAL_DEPLOY_STEPS: DeployStep[] = [
  { event: "start_openclaw_deployment", label: "Starting deployment", status: "pending" },
  { event: "create_fly_app", label: "Creating Machine app", status: "pending" },
  { event: "create_fly_volume", label: "Creating persistent volume", status: "pending" },
  { event: "deploy_openclaw", label: "Deploying OpenClaw", status: "pending" },
  { event: "scale_fly_app", label: "Deployment complete", status: "pending" },
];

// ===== 主页面组件 =====
export default function OpenClawInstallPage() {
  const { data: session } = useSession();
  const [instanceName, setInstanceName] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<ModelOption>("claude-opus");
  const [selectedChannel, setSelectedChannel] = useState<ChannelOption>("telegram");

  const [channelCredentials, setChannelCredentials] = useState<Record<string, Record<string, string>>>({});

  const [isDeploying, setIsDeploying] = useState(false);
  const [deploySteps, setDeploySteps] = useState<DeployStep[]>(INITIAL_DEPLOY_STEPS);
  const [deployResult, setDeployResult] = useState<{ success: boolean; url?: string; error?: string; recordId?: string } | null>(null);
  const [clientId, setClientId] = useState<string>("");
  const [deployRecordId, setDeployRecordId] = useState<string>("");

  // 订阅弹窗（由 deploy API 返回无订阅时打开）
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState<string | null>(null);

  // 部署列表（用于第一屏漂浮小龙虾个数，点击进详情、hover 展示名称）
  const [deployments, setDeployments] = useState<{ id: string; name: string | null; flyAppName: string }[]>([]);
  const [hoveredLobsterId, setHoveredLobsterId] = useState<string | null>(null);

  // 用 ref 追踪部署状态，避免在 broadcast 回调中依赖 state 导致重新订阅
  const isDeployingRef = useRef(false);
  const deployRecordIdRef = useRef("");
  useEffect(() => {
    isDeployingRef.current = isDeploying;
  }, [isDeploying]);

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@example.com";

  useEffect(() => {
    if (session?.user?.id) {
      setClientId(`openclaw-${session.user.id.slice(0, 8)}-${Date.now().toString(36)}`);
    }
  }, [session?.user?.id]);

  // 拉取部署列表（用于第一屏漂浮小龙虾个数）
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchDeployments = async () => {
      try {
        const res = await fetch("/api/openclaw");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.data)) {
          setDeployments(
            data.data.map((r: { id: string; name?: string | null; flyAppName?: string }) => ({
              id: r.id,
              name: r.name ?? null,
              flyAppName: r.flyAppName ?? "",
            }))
          );
        }
      } catch {
        // ignore
      }
    };

    fetchDeployments();
  }, [session?.user?.id]);

  // 部署成功后刷新部署列表，使新小龙虾出现
  useEffect(() => {
    if (!session?.user?.id || !deployResult?.success) return;
    fetch("/api/openclaw")
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (data?.success && Array.isArray(data.data)) {
          setDeployments(
            data.data.map((r: { id: string; name?: string | null; flyAppName?: string }) => ({
              id: r.id,
              name: r.name ?? null,
              flyAppName: r.flyAppName ?? "",
            }))
          );
        }
      })
      .catch(() => {});
  }, [session?.user?.id, deployResult?.success]);

  // 订阅 Supabase broadcast 频道，clientId 就绪后即建立连接，不依赖 isDeploying
  useEffect(() => {
    if (!clientId) return;

    const channel = supabase
      .channel(`private:${clientId}`)
      .on("broadcast", { event: "openclaw" }, (payload: { payload: any }) => {
        // 仅在部署中才处理事件
        if (!isDeployingRef.current) return;

        const { event, status, app_url, error } = payload.payload;

        setDeploySteps((prev) => {
          const currentIdx = prev.findIndex((s) => s.event === event);
          // 未识别的事件直接忽略，避免 currentIdx=-1 时错误地把 step 0 重置为 active
          if (currentIdx === -1) return prev;

          const isError = status?.includes("failed");

          return prev.map((step, stepIdx) => {
            // 当前事件对应的步骤：标记为 success 或 error
            if (step.event === event) {
              return {
                ...step,
                status: isError ? "error" : "success",
                detail: isError ? error || `Failed at ${event}` : status,
              };
            }
            // 当前事件之前的所有步骤：全部标记为 success（解决第一步不更新的问题）
            if (stepIdx < currentIdx && !isError) {
              return { ...step, status: "success" };
            }
            // 下一个步骤：标记为 active
            if (stepIdx === currentIdx + 1 && !isError) {
              return { ...step, status: "active" };
            }
            return step;
          });
        });

        if (event === "scale_fly_app" && status === "scaled") {
          setIsDeploying(false);
          setDeployResult({
            success: true,
            url: app_url || `https://${clientId}.fly.dev`,
            recordId: deployRecordIdRef.current,
          });
          toast.success("OpenClaw deployed successfully!");
        }

        if (status?.includes("failed")) {
          setIsDeploying(false);
          setDeployResult({
            success: false,
            error: error || `Deployment failed at ${event}`,
          });
          toast.error(`Deployment failed: ${error || event}`);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [clientId]);

  const handleChannelClick = (channel: ChannelOption) => {
    setSelectedChannel(channel);
  };

  const handleConnect = (channel: ChannelOption, credentials: Record<string, string>) => {
    setChannelCredentials((prev) => ({
      ...prev,
      [channel]: credentials,
    }));
    toast.success(`${CHANNEL_CONFIGS[channel].name} connected successfully!`);
  };

  const handleInlineCheckout = useCallback(async (plan: typeof PLANS[number]) => {
    if (!session?.user) {
      toast.error("Please sign in first");
      return;
    }
    const productId = billingPeriod === "annually" ? plan.annualProductId : plan.monthlyProductId;
    try {
      setIsCheckoutProcessing(plan.id);
      const response = await fetch(`/api/checkout?product_id=${productId}`);
      if (!response.ok) throw new Error("Failed to create checkout session");
      const data = await response.json();
      if (!data.checkoutUrl) throw new Error("Invalid checkout URL received");
      window.location.href = data.checkoutUrl;
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to process checkout");
    } finally {
      setIsCheckoutProcessing(null);
    }
  }, [session, billingPeriod]);

  const isChannelConnected = !!channelCredentials[selectedChannel];

  const handleStartTrial = useCallback(async () => {
    if (!instanceName.trim()) {
      toast.info("Please name your OpenClaw instance first");
      return;
    }

    if (!isChannelConnected) {
      toast.info(`Connect ${selectedChannel.charAt(0).toUpperCase() + selectedChannel.slice(1)} first`);
      handleChannelClick(selectedChannel);
      return;
    }

    if (isDeploying) return;

    setIsDeploying(true);
    setDeployResult(null);
    setDeploySteps(
      INITIAL_DEPLOY_STEPS.map((s, i) => ({
        ...s,
        status: i === 0 ? "active" : "pending",
      }))
    );

    try {
      const primaryModel = MODEL_TO_OPENROUTER_ID[selectedModel];

      const openclawConfig: Record<string, any> = {
        agents: {
          defaults: {
            model: {
              primary: primaryModel,
              fallbacks: [primaryModel],
            },
            maxConcurrent: 4,
          },
          list: [{ id: "main", default: true }],
        },
        auth: {
          profiles: {
            "openrouter:default": { mode: "api_key", provider: "openrouter" },
          },
        },
        bindings: [{ agentId: "main", match: { channel: selectedChannel } }],
        channels: {
          [selectedChannel]: {
            enabled: true,
            ...(selectedChannel === "telegram" && {
              botToken: channelCredentials.telegram?.token || "",
              dmPolicy: "open",
              allowFrom: ['*'],
              groups: { "*": { requireMention: true } },
            }),
            ...(selectedChannel === "discord" && {
              groupPolicy: "allowlist",
              guilds: {},
            }),
            ...(selectedChannel === "feishu" && {
              dmPolicy: "open",
              allowFrom: ['*'],
              accounts: {
                main: {
                  appId: channelCredentials.feishu?.appId || "",
                  appSecret: channelCredentials.feishu?.appSecret || "",
                  botName: "AI Assistant",
                },
              },
            }),
          },
        },
        gateway: { mode: "local", controlUi: { dangerouslyAllowHostHeaderOriginFallback: true } },
        meta: {
          lastTouchedVersion: '2026.2.23',
        },
      };

      const res = await fetch("/api/deploy-openclaw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          flyAppName: clientId,
          instanceName: instanceName.trim(),
          openclawConfig,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        // 无订阅时由 API 返回 403 + code，打开定价弹窗并提前返回
        if (res.status === 403 && data.code === "NO_OPENCLAW_SUBSCRIPTION") {
          setPricingModalOpen(true);
          toast.info(data.error || "An OpenClaw subscription is required.");
          setIsDeploying(false);
          return;
        }
        throw new Error(data.error || "Failed to trigger deployment");
      }

      if (data.recordId) {
        setDeployRecordId(data.recordId);
        deployRecordIdRef.current = data.recordId;
      }

    } catch (err: any) {
      setIsDeploying(false);
      setDeployResult({ success: false, error: err.message });
      setDeploySteps((prev) =>
        prev.map((s) => (s.status === "active" ? { ...s, status: "error", detail: err.message } : s))
      );
      toast.error(err.message || "Failed to start deployment");
    }
  }, [instanceName, isChannelConnected, isDeploying, clientId, selectedChannel]);

  const channelDisplayName = CHANNEL_DISPLAY_NAMES[selectedChannel];

  return (
    <div className="min-h-screen bg-[#f8f9fc] relative overflow-x-hidden">
      {/* ===== 背景装饰 ===== */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[55%] h-[55%] rounded-full bg-orange-200/30 blur-[120px]" />
        <div className="absolute top-[10%] -right-[15%] w-[50%] h-[50%] rounded-full bg-blue-200/25 blur-[130px]" />
        <div className="absolute -bottom-[25%] left-[15%] w-[45%] h-[45%] rounded-full bg-blue-200/20 blur-[110px]" />
      </div>
      {/* 网格纹理 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.4]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* ===== 漂浮的 OpenClaw SVG：数量=部署个数，点击进详情、hover 展示名称；容器 pointer-events-none 保证可滚动 ===== */}
      <div className="fixed top-0 left-0 w-full h-screen overflow-hidden z-[1] pointer-events-none">
        {deployments.slice(0, 5).map((record, i) => {
          const layout = [
            { size: 72, duration: 60, delay: 0, startX: 4, startY: 15 },
            { size: 60, duration: 70, delay: 0, startX: 78, startY: 55 },
            { size: 80, duration: 80, delay: 0, startX: 42, startY: 70 },
            { size: 64, duration: 65, delay: 2, startX: 12, startY: 65 },
            { size: 56, duration: 75, delay: 1, startX: 72, startY: 18 },
          ][i % 5];
          const displayName = record.name?.trim() || record.flyAppName || record.id;
          const animIdx = i % 5;
          return (
            <a
              key={record.id}
              href={`/openclaw/${record.id}`}
              className="openclaw-float-wrap group absolute pointer-events-auto cursor-pointer outline-none flex flex-col items-center"
              style={{
                left: `${layout.startX}%`,
                top: `${layout.startY}%`,
                width: layout.size,
                height: layout.size,
                animation: `openclaw-float-${animIdx} ${layout.duration}s ease-in-out ${layout.delay}s infinite`,
                animationPlayState: hoveredLobsterId === record.id ? "paused" : "running",
              }}
              onMouseEnter={() => setHoveredLobsterId(record.id)}
              onMouseLeave={() => setHoveredLobsterId(null)}
            >
              <span
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2.5 py-1 rounded-lg bg-gray-900/90 text-white text-xs font-medium whitespace-nowrap pointer-events-none shadow-lg"
                style={{ maxWidth: "min(180px, 40vw)" }}
              >
                {displayName.length > 20 ? `${displayName.slice(0, 18)}…` : displayName}
              </span>
              <svg
                viewBox="0 0 120 120"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full block transition-transform duration-200 group-hover:scale-125 origin-center"
                style={{
                  filter: "drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3))",
                }}
              >
                <defs>
                  <defs />
                </defs>
                <path d="M60 10 C30 10 15 35 15 55 C15 75 30 95 45 100 L45 110 L55 110 L55 100 C55 100 60 102 65 100 L65 110 L75 110 L75 100 C90 95 105 75 105 55 C105 35 90 10 60 10Z" fill="#e74c3c" />
                <g className="openclaw-claw-left" style={{ transformOrigin: "25px 50px" }}>
                  <path d="M20 45 C5 40 0 50 5 60 C10 70 20 65 25 55 C28 48 25 45 20 45Z" fill="#e74c3c" />
                </g>
                <g className="openclaw-claw-right" style={{ transformOrigin: "95px 50px" }}>
                  <path d="M100 45 C115 40 120 50 115 60 C110 70 100 65 95 55 C92 48 95 45 100 45Z" fill="#e74c3c" />
                </g>
                <path d="M45 15 Q35 5 30 8" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
                <path d="M75 15 Q85 5 90 8" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
                <circle cx="45" cy="35" r="6" fill="#0f172a" />
                <circle cx="75" cy="35" r="6" fill="#0f172a" />
                <g className="openclaw-eye-left" style={{ transformOrigin: "46px 34px" }}>
                  <circle cx="46" cy="34" r="2" fill="#22d3ee" />
                </g>
                <g className="openclaw-eye-right" style={{ transformOrigin: "76px 34px" }}>
                  <circle cx="76" cy="34" r="2" fill="#22d3ee" />
                </g>
                <ellipse cx="45" cy="35" rx="6" ry="6" fill="#e74c3c" className="openclaw-blink" />
                <ellipse cx="75" cy="35" rx="6" ry="6" fill="#e74c3c" className="openclaw-blink" />
              </svg>
            </a>
          );
        })}
      </div>

      <style jsx>{`
        /* 漂浮路径（在第一屏内大范围上下左右飘动，动画在 <a> 上；暂停由 React hover 状态控制） */
        @keyframes openclaw-float-0 {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(40vw, 30vh) rotate(15deg); }
          40% { transform: translate(70vw, -10vh) rotate(-10deg); }
          60% { transform: translate(30vw, 60vh) rotate(20deg); }
          80% { transform: translate(80vw, 40vh) rotate(-8deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes openclaw-float-1 {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(-50vw, -20vh) rotate(-12deg); }
          40% { transform: translate(-20vw, 25vh) rotate(18deg); }
          60% { transform: translate(-60vw, -5vh) rotate(-15deg); }
          80% { transform: translate(-10vw, -35vh) rotate(10deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes openclaw-float-2 {
          0% { transform: translate(0, 0) rotate(0deg); }
          20% { transform: translate(20vw, -50vh) rotate(10deg); }
          40% { transform: translate(-30vw, -30vh) rotate(-18deg); }
          60% { transform: translate(40vw, -55vh) rotate(12deg); }
          80% { transform: translate(-15vw, -20vh) rotate(-8deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes openclaw-float-3 {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(-25vw, 35vh) rotate(14deg); }
          50% { transform: translate(35vw, -25vh) rotate(-12deg); }
          75% { transform: translate(-15vw, -40vh) rotate(8deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }
        @keyframes openclaw-float-4 {
          0% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(45vw, 20vh) rotate(-10deg); }
          50% { transform: translate(-35vw, 25vh) rotate(16deg); }
          75% { transform: translate(20vw, -30vh) rotate(-6deg); }
          100% { transform: translate(0, 0) rotate(0deg); }
        }

        /* 眨眼动画 - 通过 scaleY 缩放遮罩实现 */
        :global(.openclaw-blink) {
          opacity: 0;
          animation: openclaw-blink 4s ease-in-out infinite;
        }
        @keyframes openclaw-blink {
          0%, 90%, 100% { opacity: 0; }
          93%, 97% { opacity: 1; }
        }

        /* 眼珠滚动 */
        :global(.openclaw-eye-left),
        :global(.openclaw-eye-right) {
          animation: openclaw-eye-look 6s ease-in-out infinite;
        }
        @keyframes openclaw-eye-look {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(2px, -1px); }
          40% { transform: translate(-2px, 1px); }
          60% { transform: translate(1px, 2px); }
          80% { transform: translate(-1px, -1px); }
        }

        /* 左爪挥动 */
        :global(.openclaw-claw-left) {
          animation: openclaw-wave-left 3s ease-in-out infinite;
        }
        @keyframes openclaw-wave-left {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          50% { transform: rotate(10deg); }
          75% { transform: rotate(-8deg); }
        }

        /* 右爪挥动 */
        :global(.openclaw-claw-right) {
          animation: openclaw-wave-right 3.5s ease-in-out infinite;
        }
        @keyframes openclaw-wave-right {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(-10deg); }
          75% { transform: rotate(8deg); }
        }
      `}</style>

      <AppHeader />

      {/* ===== Hero 区域 ===== */}
      <section className="relative pt-16 pb-10 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          {/* 标签 */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-[12px] font-bold tracking-[0.08em] uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>One-Click Deploy</span>
          </div>

          {/* 大标题 */}
          <h1 className="text-[40px] md:text-[52px] font-extrabold tracking-tight leading-[1.08]">
            <span className="text-gray-900">Deploy Your</span>
            <br />
            <span className="text-orange-600">
              OpenClaw
            </span>
          </h1>

          {/* 副标题 */}
          <p className="text-gray-500 text-[16px] md:text-[18px] max-w-lg mx-auto leading-relaxed">
            Choose a model, connect a channel, and launch your
            <span className="text-gray-700 font-semibold"> OpenClaw </span>
            instance in minutes.
          </p>

          {/* 特性亮点 */}
          <div className="flex items-center justify-center gap-6 pt-2">
            {[
              { icon: <Zap className="w-4 h-4" />, text: "One-click deploy" },
              { icon: <Bot className="w-4 h-4" />, text: "Multi-channel" },
              { icon: <Layers className="w-4 h-4" />, text: "Multi-model" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-gray-400 text-[13px] font-medium">
                <span className="text-orange-400">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ===== 配置卡片 ===== */}
      <section className="relative px-4 pb-16">
      <div className="w-full max-w-[880px] mx-auto rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 overflow-hidden">
        {/* 顶部彩色条 */}
        <div className="h-1 bg-orange-500" />

        <div className="p-6 md:p-8 space-y-5">
        {/* ===== 名字输入 ===== */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[12px] font-bold">
              1
            </span>
            <p className="text-gray-700 text-[14px] font-semibold">Name your OpenClaw instance</p>
          </div>
          <input
            type="text"
            value={instanceName}
            onChange={(e) => setInstanceName(e.target.value)}
            placeholder="e.g. my-awesome-bot"
            className="w-full px-3.5 py-2.5 rounded-xl border-2 border-gray-200 bg-white text-gray-900 text-[14px] font-medium placeholder-gray-400 outline-none transition-all duration-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            style={instanceName.trim() ? { borderColor: "#3b82f6", backgroundColor: "#f0f7ff" } : undefined}
          />
        </div>

        {/* ===== 模型选择 ===== */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600 text-[12px] font-bold">
              2
            </span>
            <p className="text-gray-700 text-[14px] font-semibold">Choose your default model</p>
          </div>
          <div className="grid grid-cols-4 gap-2.5">
            {MODEL_OPTIONS.map((model) => {
              const isSelected = selectedModel === model.key;
              return (
                <button
                  key={model.key}
                  onClick={() => setSelectedModel(model.key)}
                  className={`
                    relative flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 group text-left
                    ${isSelected
                      ? "shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }
                  `}
                  style={isSelected ? {
                    borderColor: model.color,
                    backgroundColor: model.lightBg,
                    boxShadow: `0 4px 20px ${model.color}20`,
                  } : undefined}
                >
                  {model.badge && (
                    <span
                      className={`
                        absolute -top-2 -right-2 px-1.5 py-px rounded text-[10px] font-medium leading-normal
                        ${model.badge === "Recommended"
                          ? "bg-indigo-500 text-white"
                          : "bg-emerald-500 text-white"
                        }
                      `}
                    >
                      {model.badge}
                    </span>
                  )}
                  <div className={`transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                    {model.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold text-[14px] ${isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-800"}`}>
                      {model.name}
                    </span>
                  </div>
                  {isSelected && (
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: model.color }}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ===== 通道选择 ===== */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 text-[12px] font-bold">
              3
            </span>
            <p className="text-gray-700 text-[14px] font-semibold">Connect a messaging channel</p>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {CHANNEL_OPTIONS.map((ch) => {
              const isSelected = selectedChannel === ch.key;
              const isConnected = !!channelCredentials[ch.key];
              return (
                <button
                  key={ch.key}
                  onClick={() => handleChannelClick(ch.key)}
                  className={`
                    relative flex flex-col items-center gap-2 px-3 py-3.5 rounded-xl border-2 transition-all duration-200 group
                    ${isSelected
                      ? "shadow-md"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                    }
                  `}
                  style={isSelected ? {
                    borderColor: ch.color,
                    backgroundColor: ch.lightBg,
                    boxShadow: `0 4px 20px ${ch.color}20`,
                  } : undefined}
                >
                  <div className={`transition-transform duration-200 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                    {ch.icon}
                  </div>
                  <span className={`font-semibold text-[13px] ${isSelected ? "text-gray-900" : "text-gray-600 group-hover:text-gray-800"}`}>
                    {ch.name}
                  </span>
                  {isConnected && (
                    <div
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-[3px] ring-white"
                      style={{ boxShadow: "0 2px 8px rgba(16,185,129,0.4)" }}
                    >
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {/* 连接通道表单直接放在下方，无需弹窗 */}
          <ConnectChannelInline
            channel={selectedChannel}
            onConnect={(credentials) => handleConnect(selectedChannel, credentials)}
          />
        </div>

        {/* ===== 部署进度 ===== */}
        {(isDeploying || deployResult) && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 space-y-1">
            <p className="text-gray-500 text-[11px] font-bold tracking-[0.14em] uppercase mb-3 flex items-center gap-2">
              {isDeploying && <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
              {deployResult?.success && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
              {deployResult && !deployResult.success && <span className="w-2 h-2 rounded-full bg-red-500" />}
              Deployment Progress
            </p>
            <div className="space-y-0">
              {deploySteps.map((step, idx) => (
                <div key={step.event} className="flex items-start gap-4 relative">
                  {idx < deploySteps.length - 1 && (
                    <div
                      className={`absolute left-[11px] top-[26px] w-[2px] h-[calc(100%)] transition-colors duration-500 ${
                        step.status === "success"
                          ? "bg-emerald-300"
                          : step.status === "error"
                          ? "bg-red-300"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                  <div className="shrink-0 relative z-10">
                    {step.status === "pending" && (
                      <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-white" />
                    )}
                    {step.status === "active" && (
                      <div className="w-6 h-6 rounded-full bg-blue-100 border-2 border-blue-500 flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                      </div>
                    )}
                    {step.status === "success" && (
                      <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-emerald-600" />
                      </div>
                    )}
                    {step.status === "error" && (
                      <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 pb-3">
                    <span
                      className={`text-[14px] block ${
                        step.status === "active"
                          ? "text-gray-900 font-semibold"
                          : step.status === "success"
                          ? "text-gray-500"
                          : step.status === "error"
                          ? "text-red-600 font-semibold"
                          : "text-gray-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.detail && step.status === "error" && (
                      <p className="text-red-400 text-[12px] mt-1 truncate">{step.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {deployResult?.success && deployResult.url && (
              <div className="mt-2 pt-4 border-t border-gray-200">
                <a
                  href={deployResult.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-[14px] font-semibold hover:bg-emerald-100 transition-colors group"
                >
                  <Rocket className="w-4 h-4 group-hover:animate-bounce" />
                  <span className="truncate">{deployResult.url}</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-auto shrink-0 opacity-60" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* ===== CTA 按钮 ===== */}
        {deployResult?.success ? (
          <div className="flex items-center justify-center gap-4">
            <a
              href="/"
              className="px-6 py-3.5 rounded-xl text-[15px] font-semibold text-gray-500 hover:text-gray-700 transition-all duration-200"
            >
              Go to Dashboard
            </a>
            <a
              href={deployResult.recordId ? `/openclaw/${deployResult.recordId}` : deployResult.url || "#"}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[15px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
              style={{ boxShadow: "0 4px 20px rgba(249,115,22,0.35)" }}
            >
              <span>View {instanceName || userName}</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <button
            onClick={handleStartTrial}
            disabled={isDeploying}
            className={`
              w-full flex items-center justify-center gap-2.5 px-6 py-3 rounded-xl text-[15px] font-bold transition-all duration-300 relative overflow-hidden group
              ${isDeploying
                ? "bg-blue-50 text-blue-500 cursor-not-allowed border border-blue-200"
                : isChannelConnected
                ? "bg-orange-500 hover:bg-orange-600 text-white border-0 hover:opacity-95 active:scale-[0.98]"
                : "bg-gray-100 text-gray-500 hover:text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
            `}
            style={
              !isDeploying && isChannelConnected
                ? { boxShadow: "0 6px 30px rgba(249,115,22,0.25)" }
                : undefined
            }
          >
            {isChannelConnected && !isDeploying && (
              <div className="absolute inset-0 bg-white/10 -translate-x-full animate-shimmer" />
            )}
            {isDeploying ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Deploying...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Start Deploy</span>
                <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        )}

        {/* ===== 底部状态 ===== */}
        <div className="text-center">
          <p className="text-gray-400 text-[13px] font-medium">
            {deployResult?.success
              ? "Your OpenClaw instance is live!"
              : isDeploying
              ? "Deployment in progress, please wait..."
              : isChannelConnected
              ? (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    {channelDisplayName} connected
                  </span>
                  {" · Ready to deploy"}
                </>
              )
              : `Connect ${channelDisplayName} to start`}
          </p>
        </div>
        </div>
      </div>
      </section>

      {/* ===== Traditional vs ClawDrift 对比 ===== */}
      <section className="relative px-4 py-12 md:py-16">
        <div className="max-w-[880px] mx-auto">
          <TraditionalVsClawDrift />
        </div>
      </section>

      {/* ===== 订阅定价区域 ===== */}
      <section className="relative px-4 pb-18">
        <div className="max-w-[780px] mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-orange-600 text-[11px] font-bold tracking-[0.08em] uppercase mb-4">
              <Gift className="w-3.5 h-3.5" />
              <span>Pricing</span>
            </div>
            <h2 className="text-[28px] md:text-[36px] font-extrabold tracking-tight leading-[1.08]">
              <span className="text-orange-600">
                Choose Your Plan
              </span>
            </h2>
            <p className="text-gray-500 text-[14px] md:text-[15px] mt-2.5 max-w-md mx-auto leading-relaxed">
              Get your cloud-based OpenClaw agent up and running.
            </p>
          </div>

          {/* 月付/年付切换 */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex items-center bg-white border border-gray-200/80 rounded-full p-0.5 shadow-sm">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 ${
                  billingPeriod === "monthly"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-5 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 flex items-center gap-1.5 ${
                  billingPeriod === "annually"
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Annually
                <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white text-[10px] font-bold">
                  save 17%
                </span>
              </button>
            </div>
          </div>

          {/* 价格卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PLANS.map((plan) => {
              const price = billingPeriod === "annually" ? plan.annualPrice : plan.monthlyPrice;
              const showOriginalPrice = true;
              const isPopular = plan.isPopular;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-6 md:p-7 flex flex-col transition-all duration-300 hover:shadow-lg ${
                    isPopular
                      ? "border-2 shadow-lg"
                      : "border-2 border-gray-200/80 bg-white/80 backdrop-blur-xl hover:border-gray-300"
                  }`}
                  style={
                    isPopular
                      ? {
                          borderColor: plan.accentColor,
                          backgroundColor: plan.lightBg,
                          boxShadow: `0 7px 32px ${plan.accentColor}15`,
                        }
                      : undefined
                  }
                >
                  {/* Popular 标签 */}
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="px-3.5 py-0.5 rounded-full bg-orange-500 text-white text-[11px] font-bold shadow-md">
                        Popular
                      </span>
                    </div>
                  )}

                  {/* 计划名称 */}
                  <h3 className="text-gray-900 text-[18px] font-bold mb-3">{plan.name}</h3>

                  {/* 价格 */}
                  <div className="flex items-baseline gap-1.5 mb-3">
                    {showOriginalPrice && (
                      <span className="text-gray-400 text-[13px] line-through">
                        ${plan.originalMonthlyPrice}
                      </span>
                    )}
                    <span className="text-gray-900 text-[34px] font-extrabold tracking-tight">
                      ${price}
                    </span>
                    <span className="text-gray-500 text-[13px] font-medium">/ month</span>
                  </div>

                  {/* Badge */}
                  {(plan.badgeMonthly || plan.badgeAnnually) && (
                    <div className="mb-3">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[12px] font-semibold"
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

                  {/* 描述 */}
                  <p className="text-gray-500 text-[13px] leading-relaxed mb-5">{plan.description}</p>

                  {/* CTA 按钮 */}
                  <button
                    onClick={() => handleInlineCheckout(plan)}
                    disabled={isCheckoutProcessing === plan.id}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[14px] font-bold text-white transition-all duration-200 hover:opacity-95 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
                    style={{
                      backgroundColor: isPopular ? "#f97316" : plan.accentColor,
                      boxShadow: `0 4px 18px ${plan.accentColor}30`,
                    }}
                  >
                    {isCheckoutProcessing !== plan.id && (
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <ShoppingCart className="w-4 h-4" />
                    {isCheckoutProcessing === plan.id ? "Processing..." : plan.ctaText}
                  </button>

                  {/* 账单说明 */}
                  <p className="text-gray-400 text-[11px] mt-2.5 text-center font-medium">
                    {billingPeriod === "annually"
                      ? "billed annually, cancel anytime"
                      : "billed monthly, cancel anytime"}
                  </p>

                  {/* 分割线 */}
                  <div className="border-t border-gray-200 my-5" />

                  {/* 功能标题 */}
                  <h4 className="text-gray-700 text-[13px] font-bold mb-3">{plan.featureTitle}</h4>

                  {/* 功能列表 */}
                  <ul className="space-y-2.5 flex-1">
                    {plan.features.map((feature, idx) => {
                      const text = feature.dynamic
                        ? feature.text.replace("${credits}", billingPeriod === "annually" ? "$180" : "$15")
                        : feature.text;
                      return (
                        <li key={idx} className="flex items-start gap-2">
                          <div
                            className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                            style={{ backgroundColor: plan.accentColor + "15" }}
                          >
                            <Check className="w-3 h-3" style={{ color: plan.accentColor }} />
                          </div>
                          <span className="text-gray-600 text-[13px]">{text}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 订阅弹窗 */}
      <OpenClawPricingModal
        isOpen={pricingModalOpen}
        onClose={() => setPricingModalOpen(false)}
      />
    </div>
  );
}
