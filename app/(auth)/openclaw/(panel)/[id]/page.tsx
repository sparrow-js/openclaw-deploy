"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Pencil, Pause, X, Trash2,
  Zap, HardDrive, Clock, Bot, Activity,
  Save, ChevronDown, Settings, LayoutDashboard, Loader2,
  Globe, Server, AlertTriangle, ExternalLink, Copy, Hash,
  Link, RefreshCw, Info, Monitor, MoreHorizontal, Plus,
} from "lucide-react";
import { toast } from "react-toastify";
import { usePanelContext, getStatus, getChannelDisplay, getModelDisplay, timeAgo, type OpenClawRecord } from "../context";

// ===== Channel Icon 组件 =====
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

function FeishuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M5.32 3.27c-.47-.21-1 .17-.88.67l1.2 5.23c.06.27.24.5.49.61l5.38 2.45c.34.15.34.63 0 .79l-5.38 2.45c-.25.11-.43.34-.49.61l-1.2 5.23c-.12.5.41.88.88.67L21.73 13c.48-.22.48-.9 0-1.12L5.32 3.27z" />
    </svg>
  );
}

// ===== 模型解析辅助 =====
function parseModelInfo(model: string | null) {
  if (!model) return null;
  const parts = model.split("/");
  if (parts.length >= 2) {
    const providerKey = parts[0]; // e.g. "openrouter"
    const modelName = parts.slice(1).join("/"); // e.g. "anthropic/claude-sonnet-4.5"
    const providerMap: Record<string, { name: string; baseUrl: string }> = {
      openrouter: { name: "OpenRouter", baseUrl: "https://openrouter.ai/api/v1" },
      openai: { name: "OpenAI", baseUrl: "https://api.openai.com/v1" },
      anthropic: { name: "Anthropic", baseUrl: "https://api.anthropic.com/v1" },
    };
    const provider = providerMap[providerKey] || { name: providerKey, baseUrl: "N/A" };
    return { provider: provider.name, model: modelName, baseUrl: provider.baseUrl };
  }
  return { provider: "Unknown", model: model, baseUrl: "N/A" };
}

// ===== Channel 解析辅助 =====
function getChannelIcon(channel: string | null) {
  switch (channel) {
    case "telegram": return <TelegramIcon className="w-4 h-4 text-[#29a9eb]" />;
    case "discord": return <DiscordIcon className="w-4 h-4 text-[#5865f2]" />;
    case "feishu": return <FeishuIcon className="w-4 h-4 text-[#3370ff]" />;
    default: return <Globe className="w-4 h-4 text-gray-400" />;
  }
}

function getChannelName(channel: string | null) {
  switch (channel) {
    case "telegram": return "Telegram";
    case "discord": return "Discord";
    case "feishu": return "Feishu";
    default: return channel || "Unknown";
  }
}

// ===== Feishu Pairing Request 类型 =====
interface PairingRequest {
  code: string;
  feishuUserId: string;
  meta: string;
  requested: string;
}

// ===== ClawHub Skill 类型 =====
interface ClawHubSkill {
  slug: string;
  displayName: string;
  summary: string;
  tags: Record<string, string>;
  stats: {
    comments: number;
    downloads: number;
    installsAllTime: number;
    installsCurrent: number;
    stars: number;
    versions: number;
  };
  createdAt: number;
  updatedAt: number;
  latestVersion: {
    version: string;
    createdAt: number;
    changelog: string;
  };
}

// ===== 设备类型（匹配 OpenClaw CLI: devices list） =====
// Pending 设备（待审批的配对请求）
interface PendingDevice {
  request: string;   // 配对请求 UUID
  device: string;    // 设备指纹 hash
  role: string;      // e.g. "operator"
  ip: string;        // IP 地址
  age: string;       // e.g. "42s ago"
  flags: string;     // 标记
}

// Paired 设备（已配对的设备）
interface PairedDevice {
  device: string;    // 设备指纹 hash
  roles: string;     // e.g. "operator"
  scopes: string;    // e.g. "operator.admin, operator.approvals, operator.pairing"
  tokens: string;    // e.g. "operator"
  ip: string;        // IP 地址
}

// ===== 模型选项 =====
const MODEL_OPTIONS = [
  { value: "openrouter/anthropic/claude-sonnet-4", label: "Claude Sonnet 4", desc: "Fast & highly capable", icon: "🤖" },
  { value: "openrouter/anthropic/claude-opus-4.6", label: "Claude Opus 4.6", desc: "Most intelligent", icon: "🧠" },
  { value: "openrouter/openai/gpt-5.2", label: "GPT-5.2", desc: "Advanced reasoning", icon: "⚡" },
  { value: "openrouter/anthropic/claude-sonnet-4.5", label: "Claude Sonnet 4.5", desc: "Fast & highly capable", icon: "🎯" },
];

// ===== Tab 配置 =====
type TabKey = "overview" | "desktop" | "skills" | "configuration";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <Activity className="w-4 h-4" /> },
  { key: "desktop", label: "Desktop", icon: <LayoutDashboard className="w-4 h-4" /> },
  { key: "skills", label: "Skills", icon: <Zap className="w-4 h-4" /> },
  { key: "configuration", label: "Configuration", icon: <Settings className="w-4 h-4" /> },
];

// ===== 统计卡片 =====
function StatCard({
  icon,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  iconColor: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-[120px] rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-4 space-y-2 shadow-sm">
      <div className="flex items-center gap-2">
        <span style={{ color: iconColor }}>{icon}</span>
        <span className="text-gray-400 text-[12px] font-medium">{label}</span>
      </div>
      <p className="text-gray-900 text-[22px] font-bold">{value}</p>
      {sub && <p className="text-gray-400 text-[11px]">{sub}</p>}
    </div>
  );
}

// ===== 详情行 =====
function InfoRow({
  label,
  value,
  copyable,
  link,
}: {
  label: string;
  value: string | null;
  copyable?: boolean;
  link?: boolean;
}) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-gray-400 text-[13px]">{label}</span>
      <div className="flex items-center gap-2">
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-orange-600 text-[13px] font-medium hover:underline flex items-center gap-1"
          >
            {value}
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          <span className="text-gray-700 text-[13px] font-medium">{value}</span>
        )}
        {copyable && (
          <button
            onClick={() => {
              navigator.clipboard.writeText(value);
              toast.success("Copied!");
            }}
            className="p-1 rounded text-gray-300 hover:text-gray-500 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

// ===== 主页面（只有内容区域）=====
export default function EmployeeDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;
  const { refreshRecords } = usePanelContext();

  const [record, setRecord] = useState<OpenClawRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("overview");
  const [selectedModel, setSelectedModel] = useState("");
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Desktop tab 状态
  const [pendingDevices, setPendingDevices] = useState<PendingDevice[]>([]);
  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>([]);
  const [devicesLoading, setDevicesLoading] = useState(false);
  const [resettingLink, setResettingLink] = useState(false);
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());
  const [blockingIds, setBlockingIds] = useState<Set<string>>(new Set());

  // Skills tab 状态
  const [clawHubSkills, setClawHubSkills] = useState<ClawHubSkill[]>([]);
  const [clawHubLoading, setClawHubLoading] = useState(false);
  const [clawHubNextCursor, setClawHubNextCursor] = useState<string | null>(null);
  const [skillSearch, setSkillSearch] = useState("");
  const [installedSlugs, setInstalledSlugs] = useState<Set<string>>(new Set());
  const [installingSlugs, setInstallingSlugs] = useState<Set<string>>(new Set());

  // Feishu pairing 状态
  const [pairingRequests, setPairingRequests] = useState<PairingRequest[]>([]);
  const [pairingLoading, setPairingLoading] = useState(false);
  const [approvingCodes, setApprovingCodes] = useState<Set<string>>(new Set());
  const [rejectingCodes, setRejectingCodes] = useState<Set<string>>(new Set());

  // 删除状态
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const userName = session?.user?.name || "User";
  const employeeName = record?.name || userName;

  // 获取记录
  useEffect(() => {
    if (!recordId) return;
    const fetchRecord = async () => {
      try {
        const res = await fetch(`/api/openclaw/${recordId}`);
        const data = await res.json();
        if (data.success) {
          setRecord(data.data);
          setSelectedModel(data.data.model || MODEL_OPTIONS[0].value);
        } else {
          toast.error("Failed to load deployment data");
        }
      } catch {
        toast.error("Failed to load deployment data");
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [recordId]);

  // 保存模型：写入 DB、写入 Fly /data/openclaw.json 并重启机器
  const handleSaveModel = useCallback(async () => {
    if (!record || saving) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/openclaw/${record.id}/save-config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: selectedModel }),
      });
      const data = await res.json();
      if (data.success) {
        setRecord(data.data);
        toast.success("Model saved and machine restarted!");
      } else {
        toast.error(data.error || "Failed to save model");
      }
    } catch {
      toast.error("Failed to save model");
    } finally {
      setSaving(false);
    }
  }, [record, selectedModel, saving]);

  // 获取设备列表（pending + paired）
  const fetchDevices = useCallback(async () => {
    if (!recordId) return;
    setDevicesLoading(true);
    try {
      const res = await fetch(`/api/openclaw/${recordId}/devices`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPendingDevices(data.pending || []);
        setPairedDevices(data.paired || []);
      }
    } catch {
      // 静默失败
    } finally {
      setDevicesLoading(false);
    }
  }, [recordId]);

  // 切换到 Desktop tab 时加载设备
  useEffect(() => {
    if (activeTab === "desktop" && record) {
      fetchDevices();
    }
  }, [activeTab, record, fetchDevices]);

  // 搜索防抖 ref
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 获取 ClawHub Skills 列表（支持搜索）
  const fetchClawHubSkills = useCallback(async (opts?: { loadMore?: boolean; query?: string }) => {
    const { loadMore = false, query } = opts || {};
    setClawHubLoading(true);
    try {
      const params = new URLSearchParams({ limit: "50" });
      if (query !== undefined && query.trim()) {
        params.set("q", query.trim());
      }
      if (loadMore && clawHubNextCursor && !query?.trim()) {
        params.set("cursor", clawHubNextCursor);
      }
      const res = await fetch(`/api/clawhub/skills?${params}`);
      const data = await res.json();
      if (data.success) {
        if (loadMore) {
          setClawHubSkills((prev) => [...prev, ...(data.data || [])]);
        } else {
          setClawHubSkills(data.data || []);
        }
        setClawHubNextCursor(data.nextCursor || null);
      }
    } catch {
      toast.error("Failed to load skills from ClawHub");
    } finally {
      setClawHubLoading(false);
    }
  }, [clawHubNextCursor]);

  // 搜索防抖
  useEffect(() => {
    if (activeTab !== "skills") return;
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    searchTimerRef.current = setTimeout(() => {
      fetchClawHubSkills({ query: skillSearch });
    }, 400);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [skillSearch, activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  // 获取已安装的 skills
  const fetchInstalledSkills = useCallback(async () => {
    if (!recordId) return;
    try {
      const res = await fetch(`/api/openclaw/${recordId}/skills`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setInstalledSlugs(new Set(data.data.map((s: any) => s.slug || s.name || s)));
      }
    } catch {
      // 静默失败
    }
  }, [recordId]);

  // 切换到 Skills tab 时加载已安装 skills
  useEffect(() => {
    if (activeTab === "skills" && record) {
      fetchInstalledSkills();
    }
  }, [activeTab, record, fetchInstalledSkills]);

  // 安装 skill 到部署的应用（通过后端 API 代理，避免 CORS）
  const handleInstallSkill = useCallback(async (slug: string) => {
    if (!recordId || installingSlugs.has(slug)) return;
    setInstallingSlugs((prev) => new Set(prev).add(slug));
    try {
      const res = await fetch(`/api/openclaw/${recordId}/skills/install`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = await res.json();
      if (data.success) {
        setInstalledSlugs((prev) => new Set(prev).add(slug));
        toast.success(`Skill "${slug}" installed!`);
      } else {
        toast.error(data.error || "Failed to install skill");
      }
    } catch {
      toast.error("Failed to install skill");
    } finally {
      setInstallingSlugs((prev) => {
        const next = new Set(prev);
        next.delete(slug);
        return next;
      });
    }
  }, [recordId, installingSlugs]);

  // 审批设备（approve）— 通过后端 API 在容器内执行 CLI
  const handleApproveDevice = useCallback(async (requestId: string) => {
    if (!recordId || approvingIds.has(requestId)) return;
    setApprovingIds((prev) => new Set(prev).add(requestId));
    try {
      const res = await fetch(`/api/openclaw/${recordId}/devices/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", requestId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingDevices((prev) => prev.filter((d) => d.request !== requestId));
        toast.success("Device approved!");
        fetchDevices();
      } else {
        toast.error(data.error || "Failed to approve device");
      }
    } catch {
      toast.error("Failed to approve device");
    } finally {
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  }, [recordId, approvingIds, fetchDevices]);

  // 拒绝设备（reject）— 通过后端 API 在容器内执行 CLI
  const handleBlockDevice = useCallback(async (requestId: string) => {
    if (!recordId || blockingIds.has(requestId)) return;
    setBlockingIds((prev) => new Set(prev).add(requestId));
    try {
      const res = await fetch(`/api/openclaw/${recordId}/devices/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", requestId }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingDevices((prev) => prev.filter((d) => d.request !== requestId));
        toast.success("Device rejected!");
      } else {
        toast.error(data.error || "Failed to reject device");
      }
    } catch {
      toast.error("Failed to reject device");
    } finally {
      setBlockingIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  }, [recordId, blockingIds]);

  // 获取 Feishu pairing 请求列表
  const fetchPairingRequests = useCallback(async () => {
    if (!recordId) return;
    setPairingLoading(true);
    try {
      const res = await fetch(`/api/openclaw/${recordId}/pairing`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        setPairingRequests(data.requests || []);
      }
    } catch {
      // 静默失败
    } finally {
      setPairingLoading(false);
    }
  }, [recordId]);

  // 切换到 Desktop tab 时同时加载 pairing 请求
  useEffect(() => {
    if (activeTab === "desktop" && record && record.channel === "feishu") {
      fetchPairingRequests();
    }
  }, [activeTab, record, fetchPairingRequests]);

  // 审批 Feishu pairing 请求
  const handleApprovePairing = useCallback(async (code: string) => {
    if (!recordId || approvingCodes.has(code)) return;
    setApprovingCodes((prev) => new Set(prev).add(code));
    try {
      const res = await fetch(`/api/openclaw/${recordId}/pairing/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", code }),
      });
      const data = await res.json();
      if (data.success) {
        setPairingRequests((prev) => prev.filter((r) => r.code !== code));
        toast.success("Pairing approved!");
      } else {
        toast.error(data.error || "Failed to approve pairing");
      }
    } catch {
      toast.error("Failed to approve pairing");
    } finally {
      setApprovingCodes((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }
  }, [recordId, approvingCodes]);

  // 拒绝 Feishu pairing 请求
  const handleRejectPairing = useCallback(async (code: string) => {
    if (!recordId || rejectingCodes.has(code)) return;
    setRejectingCodes((prev) => new Set(prev).add(code));
    try {
      const res = await fetch(`/api/openclaw/${recordId}/pairing/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", code }),
      });
      const data = await res.json();
      if (data.success) {
        setPairingRequests((prev) => prev.filter((r) => r.code !== code));
        toast.success("Pairing rejected!");
      } else {
        toast.error(data.error || "Failed to reject pairing");
      }
    } catch {
      toast.error("Failed to reject pairing");
    } finally {
      setRejectingCodes((prev) => {
        const next = new Set(prev);
        next.delete(code);
        return next;
      });
    }
  }, [recordId, rejectingCodes]);

  // 删除部署
  const handleDelete = useCallback(async () => {
    if (!recordId || deleting) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/openclaw/${recordId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Deployment deleted successfully");
        setDeleteModalOpen(false);
        await refreshRecords();
        router.push("/openclaw/dashboard");
      } else {
        toast.error(data.error || "Failed to delete deployment");
      }
    } catch {
      toast.error("Failed to delete deployment");
    } finally {
      setDeleting(false);
    }
  }, [recordId, deleting, router, refreshRecords]);

  // 重置访问链接
  const handleResetLink = useCallback(async () => {
    if (!record || resettingLink) return;
    setResettingLink(true);
    try {
      // 通过部署的应用重置 token
      if (record.flyAppUrl) {
        await fetch(`${record.flyAppUrl}/api/v1/reset-token`, { method: "POST" });
      }
      toast.success("Access link has been reset!");
    } catch {
      toast.error("Failed to reset access link");
    } finally {
      setResettingLink(false);
    }
  }, [record, resettingLink]);

  const modelOption = MODEL_OPTIONS.find((m) => m.value === selectedModel) || MODEL_OPTIONS[0];
  const st = getStatus(record?.status || "pending");

  // Access link（基于 flyAppUrl + gatewayToken）
  const accessLink = record?.flyAppUrl && record?.gatewayToken ? `${record.flyAppUrl}/chat?token=${record.gatewayToken}` : null;

  // 从 record 获取真实数据
  const channelDisplay = record ? getChannelDisplay(record.channel) : null;
  const modelDisplay = record ? getModelDisplay(record.model) : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex items-center justify-center py-32 text-gray-500">
        <p>Deployment not found</p>
      </div>
    );
  }

  return (
    <>
      {/* Employee Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={() => router.push("/openclaw/dashboard")}
          className="mt-2 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-500 flex items-center justify-center text-white text-[22px] font-bold shadow-lg shadow-orange-200/50">
            {employeeName.charAt(0).toUpperCase()}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#f8f9fc] ${st.dotColor}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <h1 className="text-gray-900 text-[22px] font-bold">{employeeName}</h1>
            <button className="p-1 rounded text-gray-400 hover:text-gray-600">
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${st.bgColor} border ${st.borderColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`} />
              <span className={`text-[11px] font-semibold ${st.color}`}>{st.label}</span>
            </span>
            {channelDisplay && (
              <span className="text-[13px] font-medium" style={{ color: channelDisplay.color }}>
                {channelDisplay.name}
              </span>
            )}
            <span className="text-gray-400 text-[13px] flex items-center gap-1">
              <Globe className="w-3 h-3" /> {record.region.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-[13px] font-medium">
            <Pause className="w-3.5 h-3.5" />
            Pause
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-[13px] font-medium">
            <X className="w-3.5 h-3.5" />
            Cancel
          </button> */}
          <button
            onClick={() => { setDeleteConfirmText(""); setDeleteModalOpen(true); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-[13px] font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200/80">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-[13px] font-medium border-b-2 transition-all duration-200 ${
              activeTab === tab.key
                ? "text-orange-600 border-orange-500"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content: Overview */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Stats Grid - 真实数据 */}
          <div className="flex gap-3">
            <StatCard
              icon={<Activity className="w-4 h-4" />}
              iconColor={st.color.replace("text-", "#").includes("#") ? undefined as unknown as string : "#22c55e"}
              label="Status"
              value={st.label}
              sub={record.machineStatus ? `Machine: ${record.machineStatus}` : undefined}
            />
            <StatCard
              icon={<span className="text-[14px]">{modelDisplay?.icon || "🤖"}</span>}
              iconColor="#f97316"
              label="AI Model"
              value={modelDisplay?.name || "N/A"}
            />
            <StatCard
              icon={<span className="text-[14px]" style={{ color: channelDisplay?.color }}>●</span>}
              iconColor={channelDisplay?.color || "#6b7280"}
              label="Channel"
              value={channelDisplay?.name || "N/A"}
            />
            <StatCard
              icon={<Globe className="w-4 h-4" />}
              iconColor="#3b82f6"
              label="Region"
              value={record.region.toUpperCase()}
            />
            <StatCard
              icon={<Clock className="w-4 h-4" />}
              iconColor="#a855f7"
              label="Created"
              value={timeAgo(record.createdAt)}
              sub={new Date(record.createdAt).toLocaleDateString()}
            />
          </div>

          {/* Error Banner */}
          {record.status === "error" && record.errorMessage && (
            <div className="flex items-start gap-3 px-5 py-4 rounded-xl border border-red-200 bg-red-50/80 backdrop-blur-xl">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-[14px] font-semibold">Deployment Error</p>
                <p className="text-red-600 text-[13px] mt-1">{record.errorMessage}</p>
              </div>
            </div>
          )}

          {/* AI Model */}
          <div className="relative z-10 rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200/60 flex items-center justify-center">
                <Bot className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <p className="text-gray-900 text-[15px] font-semibold">AI Model</p>
                <p className="text-gray-400 text-[12px]">{modelOption.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Dropdown */}
              <div className="relative flex-1">
                <button
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-left hover:border-gray-300 transition-all duration-200"
                >
                  <span className="text-[16px]">{modelOption.icon}</span>
                  <span className="flex-1 text-gray-700 text-[14px] font-medium">
                    {modelOption.label} - {modelOption.desc}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {modelDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                    {MODEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedModel(opt.value);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedModel === opt.value ? "bg-orange-50" : ""
                        }`}
                      >
                        <span className="text-[16px]">{opt.icon}</span>
                        <span className="text-gray-700 text-[14px] font-medium">
                          {opt.label} - {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveModel}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                <Save className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>

          {/* Deployment Details */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200/60 flex items-center justify-center">
                <Server className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-gray-900 text-[15px] font-semibold">Deployment Details</p>
                <p className="text-gray-400 text-[12px]">Fly.io application information</p>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <InfoRow label="App Name" value={record.flyAppName} copyable />
              <InfoRow label="App URL" value={record.flyAppUrl} link copyable />
              <InfoRow label="Client ID" value={record.clientId} copyable />
              <InfoRow label="Docker Image" value={record.dockerImage} />
              <InfoRow label="Region" value={record.region.toUpperCase()} />
              <InfoRow label="Volume" value={record.volumeName} />
              <InfoRow label="Machine Status" value={record.machineStatus} />
              <InfoRow label="Created" value={new Date(record.createdAt).toLocaleString()} />
              <InfoRow label="Last Updated" value={new Date(record.updatedAt).toLocaleString()} />
            </div>
          </div>

          {/* Live Activity */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-gray-900 text-[15px] font-semibold">Live Activity</span>
                {record.status === "running" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-emerald-600 text-[11px] font-semibold">Running</span>
                  </span>
                ) : record.status === "deploying" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200">
                    <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
                    <span className="text-blue-600 text-[11px] font-semibold">Deploying</span>
                  </span>
                ) : record.status === "error" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200">
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                    <span className="text-red-600 text-[11px] font-semibold">Error</span>
                  </span>
                ) : (
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${st.bgColor} border ${st.borderColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dotColor}`} />
                    <span className={`text-[11px] font-semibold ${st.color}`}>{st.label}</span>
                  </span>
                )}
              </div>
              {record.lastEventTimestamp && (
                <div className="flex items-center gap-1.5 text-gray-400 text-[12px]">
                  <Clock className="w-3.5 h-3.5" />
                  {timeAgo(record.lastEventTimestamp)}
                </div>
              )}
            </div>

            {/* Activity Content */}
            {record.lastEvent ? (
              <div className="space-y-3">
                {/* Last Event */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-gray-50/80 border border-gray-100">
                  <div className="mt-0.5">
                    <Hash className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-700 text-[13px] font-medium">{record.lastEvent}</p>
                    {record.lastEventTimestamp && (
                      <p className="text-gray-400 text-[11px] mt-1">
                        {new Date(record.lastEventTimestamp).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Error event if present */}
                {record.errorMessage && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50/80 border border-red-100">
                    <div className="mt-0.5">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-red-600 text-[13px] font-medium">Error</p>
                      <p className="text-red-500 text-[12px] mt-1">{record.errorMessage}</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Zap className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-[14px] font-medium">No activity yet</p>
                <p className="text-gray-400 text-[12px] mt-1">Activity appears here when your AI employee works</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Desktop */}
      {activeTab === "desktop" && (
        <div className="space-y-6">
          {/* Access Link */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-5 shadow-sm">
            <div>
              <h3 className="text-gray-900 text-[16px] font-bold">Access Link</h3>
              <p className="text-gray-400 text-[13px] mt-0.5">Manage your bot access link</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-[13px] font-medium">Current Access Link</span>
                <button
                  onClick={handleResetLink}
                  disabled={resettingLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 text-[13px] font-medium disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resettingLink ? "animate-spin" : ""}`} />
                  Reset Link
                </button>
              </div>

              {accessLink ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-600 text-[13px] font-mono truncate select-all">
                    {accessLink}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(accessLink);
                      toast.success("Link copied!");
                    }}
                    className="shrink-0 p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    title="Copy"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <a
                    href={accessLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-3 rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                    title="Open in new tab"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              ) : (
                <div className="px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/80 text-gray-400 text-[13px]">
                  Access link will be available after deployment completes
                </div>
              )}

              <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-600/80 text-[12px] leading-relaxed">
                  When accessing from a new browser or device, you need to approve the device in the device list.
                </p>
              </div>
            </div>
          </div>

          {/* Feishu Pairing Requests */}
          {record.channel === "feishu" && (
            <div className="rounded-2xl border border-blue-200/80 bg-blue-50/30 backdrop-blur-xl p-6 space-y-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200/60 flex items-center justify-center">
                    <FeishuIcon className="w-4 h-4 text-[#3370ff]" />
                  </div>
                  <div>
                    <h3 className="text-gray-900 text-[16px] font-bold">Feishu Pairing Requests</h3>
                    <p className="text-gray-400 text-[13px] mt-0.5">
                      {pairingRequests.length > 0
                        ? `${pairingRequests.length} user${pairingRequests.length > 1 ? "s" : ""} waiting for pairing approval`
                        : "No pending pairing requests"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {pairingRequests.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-blue-700 text-[12px] font-semibold">{pairingRequests.length}</span>
                    </span>
                  )}
                  <button
                    onClick={fetchPairingRequests}
                    disabled={pairingLoading}
                    className="p-2 rounded-lg border border-blue-200 text-blue-500 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 disabled:opacity-50"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-4 h-4 ${pairingLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {pairingLoading && pairingRequests.length === 0 ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : pairingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pairingRequests.map((pr) => {
                    const isApproving = approvingCodes.has(pr.code);
                    const isRejecting = rejectingCodes.has(pr.code);

                    return (
                      <div
                        key={pr.code}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/90 border border-blue-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center shrink-0">
                          <FeishuIcon className="w-5 h-5 text-[#3370ff]" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-800 text-[14px] font-bold font-mono tracking-wider">{pr.code}</span>
                            <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                              Pairing
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-gray-500 text-[12px] font-mono" title={pr.feishuUserId}>
                              {pr.feishuUserId.length > 24
                                ? `${pr.feishuUserId.slice(0, 12)}...${pr.feishuUserId.slice(-8)}`
                                : pr.feishuUserId}
                            </span>
                            {pr.meta && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400 text-[11px]">{pr.meta}</span>
                              </>
                            )}
                            {pr.requested && (
                              <>
                                <span className="text-gray-300">·</span>
                                <span className="text-gray-400 text-[11px]">{timeAgo(pr.requested)}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleApprovePairing(pr.code)}
                            disabled={isApproving || isRejecting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
                            style={{
                              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                              boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
                            }}
                          >
                            {isApproving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectPairing(pr.code)}
                            disabled={isApproving || isRejecting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-[13px] font-semibold hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                          >
                            {isRejecting ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <X className="w-3.5 h-3.5" />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-[14px] font-medium">All clear!</p>
                  <p className="text-gray-400 text-[12px] mt-1">No Feishu users waiting for pairing approval</p>
                </div>
              )}
            </div>
          )}

          {/* Pending Approval */}
          {(() => {
            if (devicesLoading && pendingDevices.length === 0 && pairedDevices.length === 0) return null;
            return (
              <div className="rounded-2xl border border-yellow-200/80 bg-yellow-50/40 backdrop-blur-xl p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-yellow-100 border border-yellow-200/60 flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 text-[16px] font-bold">Pending Approval</h3>
                      <p className="text-gray-400 text-[13px] mt-0.5">
                        {pendingDevices.length > 0
                          ? `${pendingDevices.length} device${pendingDevices.length > 1 ? "s" : ""} waiting for your approval`
                          : "No pending devices"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {pendingDevices.length > 0 && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-100 border border-yellow-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
                        <span className="text-yellow-700 text-[12px] font-semibold">{pendingDevices.length}</span>
                      </span>
                    )}
                    <button
                      onClick={fetchDevices}
                      disabled={devicesLoading}
                      className="p-2 rounded-lg border border-yellow-200 text-yellow-600 hover:text-yellow-700 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 disabled:opacity-50"
                      title="Refresh"
                    >
                      <RefreshCw className={`w-4 h-4 ${devicesLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>
                </div>

                {pendingDevices.length > 0 ? (
                  <div className="space-y-3">
                    {pendingDevices.map((pd) => {
                      // 遮蔽设备指纹 hash
                      const maskedDevice =
                        pd.device.length > 10
                          ? `${pd.device.slice(0, 6)}...${pd.device.slice(-6)}`
                          : pd.device;
                      const isApproving = approvingIds.has(pd.request);
                      const isBlocking = blockingIds.has(pd.request);

                      return (
                        <div
                          key={pd.request}
                          className="flex items-center gap-4 px-4 py-3.5 rounded-xl bg-white/90 border border-yellow-200/60 shadow-sm hover:shadow-md transition-all duration-200"
                        >
                          {/* Device Icon */}
                          <div className="w-10 h-10 rounded-xl bg-yellow-50 border border-yellow-200/60 flex items-center justify-center shrink-0">
                            <Monitor className="w-5 h-5 text-yellow-600" />
                          </div>

                          {/* Device Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-gray-800 text-[13px] font-semibold font-mono" title={pd.device}>{maskedDevice}</span>
                              <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
                                Pending
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-gray-500 text-[12px] font-medium">{pd.role}</span>
                              {pd.ip && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-400 text-[12px]">{pd.ip}</span>
                                </>
                              )}
                              {pd.age && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-400 text-[12px]">{pd.age}</span>
                                </>
                              )}
                              {pd.flags && (
                                <>
                                  <span className="text-gray-300">·</span>
                                  <span className="text-gray-400 text-[11px]">{pd.flags}</span>
                                </>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-gray-300 text-[10px] font-mono" title={pd.request}>
                                Request: {pd.request.slice(0, 8)}...
                              </span>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(pd.request);
                                  toast.success("Request ID copied!");
                                }}
                                className="p-0.5 rounded text-gray-300 hover:text-gray-500 transition-colors"
                              >
                                <Copy className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveDevice(pd.request)}
                              disabled={isApproving || isBlocking}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-[13px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
                              style={{
                                background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                                boxShadow: "0 2px 8px rgba(34,197,94,0.25)",
                              }}
                            >
                              {isApproving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => handleBlockDevice(pd.request)}
                              disabled={isApproving || isBlocking}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-red-200 text-red-500 text-[13px] font-semibold hover:text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200 active:scale-[0.97] disabled:opacity-50"
                            >
                              {isBlocking ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <X className="w-3.5 h-3.5" />
                              )}
                              Reject
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-500 text-[14px] font-medium">All clear!</p>
                    <p className="text-gray-400 text-[12px] mt-1">No devices waiting for approval</p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Paired Devices */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 text-[16px] font-bold">Paired Devices</h3>
                <p className="text-gray-400 text-[13px] mt-0.5">
                  {pairedDevices.length > 0
                    ? `${pairedDevices.length} device${pairedDevices.length > 1 ? "s" : ""} paired`
                    : "Only paired devices can access the bot web interface"}
                </p>
              </div>
              <button
                onClick={fetchDevices}
                disabled={devicesLoading}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${devicesLoading ? "animate-spin" : ""}`} />
              </button>
            </div>

            {/* Paired Devices Table */}
            {devicesLoading && pairedDevices.length === 0 && pendingDevices.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
              </div>
            ) : pairedDevices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200/80">
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Device</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Roles</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Scopes</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Tokens</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">IP</th>
                      <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pairedDevices.map((pd) => {
                      // 遮蔽设备指纹 hash
                      const maskedDevice =
                        pd.device.length > 10
                          ? `${pd.device.slice(0, 6)}...${pd.device.slice(-6)}`
                          : pd.device;

                      return (
                        <tr key={pd.device} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="text-gray-700 text-[13px] font-mono" title={pd.device}>{maskedDevice}</span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-[13px]">{pd.roles}</td>
                          <td className="py-3 px-4">
                            <div className="flex flex-wrap gap-1">
                              {pd.scopes.split(",").map((scope) => scope.trim()).filter(Boolean).map((scope) => (
                                <span key={scope} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 text-[10px] font-medium border border-blue-100">
                                  {scope}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-[13px]">{pd.tokens}</td>
                          <td className="py-3 px-4 text-gray-500 text-[13px] font-mono">{pd.ip || "—"}</td>
                          <td className="py-3 px-4">
                            <button className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Monitor className="w-10 h-10 text-gray-300 mb-3" />
                <p className="text-gray-500 text-[14px] font-medium">No devices paired</p>
                <p className="text-gray-400 text-[12px] mt-1">
                  Devices will appear here when someone accesses the bot via the access link and gets approved
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Configuration */}
      {activeTab === "configuration" && (
        <div className="space-y-6">
          {/* Model Configuration */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-gray-900 text-[16px] font-bold">Model Configuration</h3>
                <p className="text-gray-400 text-[13px] mt-0.5">Manage your bot model settings</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`/api/openclaw/${recordId}`);
                    const data = await res.json();
                    if (data.success) {
                      setRecord(data.data);
                      setSelectedModel(data.data.model || MODEL_OPTIONS[0].value);
                      toast.success("Refreshed!");
                    }
                  } catch {
                    toast.error("Failed to refresh");
                  }
                }}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Model Selector */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <button
                  onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-200 bg-white text-left hover:border-gray-300 transition-all duration-200"
                >
                  <span className="text-[16px]">{modelOption.icon}</span>
                  <span className="flex-1 text-gray-700 text-[14px] font-medium">
                    {modelOption.label} - {modelOption.desc}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${modelDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {modelDropdownOpen && (
                  <div className="absolute z-20 top-full left-0 right-0 mt-1 rounded-xl border border-gray-200 bg-white shadow-xl overflow-hidden">
                    {MODEL_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSelectedModel(opt.value);
                          setModelDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                          selectedModel === opt.value ? "bg-orange-50" : ""
                        }`}
                      >
                        <span className="text-[16px]">{opt.icon}</span>
                        <span className="text-gray-700 text-[14px] font-medium">
                          {opt.label} - {opt.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveModel}
                disabled={saving || selectedModel === record.model}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-white text-[14px] font-semibold transition-all duration-200 disabled:opacity-50 hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  boxShadow: "0 4px 14px rgba(249,115,22,0.35)",
                }}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            </div>

            {/* Model Details Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200/80">
                    <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Provider</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Model</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Base URL</th>
                    <th className="text-left py-3 px-4 text-gray-500 text-[12px] font-semibold uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const modelInfo = parseModelInfo(record.model);
                    if (!modelInfo) {
                      return (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-gray-400 text-[13px]">
                            No model configured — select one above and click Save
                          </td>
                        </tr>
                      );
                    }
                    return (
                      <tr className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3.5 px-4 text-gray-700 text-[13px] font-medium">{modelInfo.provider}</td>
                        <td className="py-3.5 px-4 text-gray-600 text-[13px] font-mono">{modelInfo.model}</td>
                        <td className="py-3.5 px-4 text-gray-500 text-[13px] font-mono">{modelInfo.baseUrl}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex px-2.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            Default
                          </span>
                        </td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Skills */}
      {activeTab === "skills" && (
        <div className="space-y-6">
          {/* Header + Search */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-gray-900 text-[18px] font-bold">Skills Marketplace</h3>
              <p className="text-gray-400 text-[13px] mt-0.5">
                Browse and install skills from{" "}
                <a href="https://clawhub.ai" target="_blank" rel="noopener noreferrer" className="text-orange-500 hover:underline">
                  ClawHub
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <input
                  type="text"
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  placeholder="Search skills..."
                  className="w-[260px] pl-9 pr-4 py-2 rounded-xl border border-gray-200 bg-white/80 text-[13px] text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100 transition-all duration-200"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button
                onClick={() => fetchClawHubSkills({ query: skillSearch })}
                disabled={clawHubLoading}
                className="p-2 rounded-lg border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-4 h-4 ${clawHubLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>

          {/* Skills Grid */}
          {clawHubLoading && clawHubSkills.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : clawHubSkills.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clawHubSkills.map((skill) => {
                    const isInstalled = installedSlugs.has(skill.slug);
                    const isInstalling = installingSlugs.has(skill.slug);
                    const tagKeys = Object.keys(skill.tags).filter((t) => t !== "latest");

                    return (
                      <div
                        key={skill.slug}
                        className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-xl p-5 space-y-3 shadow-sm hover:border-gray-300/80 hover:shadow-md transition-all duration-200"
                      >
                        {/* Title + Install Button */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="text-gray-900 text-[14px] font-semibold truncate">{skill.displayName}</h4>
                              <span className="shrink-0 text-gray-400 text-[11px] font-mono">v{skill.latestVersion.version}</span>
                            </div>
                            <p className="text-gray-400 text-[11px] font-mono mt-0.5">{skill.slug}</p>
                          </div>
                          {isInstalled ? (
                            <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              Installed
                            </span>
                          ) : (
                            <button
                              onClick={() => handleInstallSkill(skill.slug)}
                              disabled={isInstalling}
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[12px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.97] disabled:opacity-50"
                              style={{
                                background: "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                                boxShadow: "0 2px 6px rgba(249,115,22,0.25)",
                              }}
                            >
                              {isInstalling ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <Plus className="w-3 h-3" />
                              )}
                              Install
                            </button>
                          )}
                        </div>

                        {/* Summary */}
                        <p className="text-gray-500 text-[12px] leading-relaxed line-clamp-2">{skill.summary}</p>

                        {/* Tags */}
                        {tagKeys.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {tagKeys.slice(0, 5).map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 text-[10px] font-medium">
                                {tag}
                              </span>
                            ))}
                            {tagKeys.length > 5 && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-400 text-[10px]">
                                +{tagKeys.length - 5}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex items-center gap-4 pt-1 border-t border-gray-100">
                          <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                            {skill.stats.downloads.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                            {skill.stats.stars}
                          </span>
                          <span className="flex items-center gap-1 text-gray-400 text-[11px]">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                            v{skill.stats.versions}
                          </span>
                          <span className="ml-auto text-gray-300 text-[10px]">
                            {new Date(skill.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>

              {/* Load More */}
              {clawHubNextCursor && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => fetchClawHubSkills({ loadMore: true })}
                    disabled={clawHubLoading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-500 text-[13px] font-medium hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50"
                  >
                    {clawHubLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                    Load more skills
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Zap className="w-10 h-10 text-gray-300 mb-3" />
              <p className="text-gray-500 text-[14px] font-medium">No skills available</p>
              <p className="text-gray-400 text-[12px] mt-1">Skills from ClawHub will appear here</p>
            </div>
          )}
        </div>
      )}
      {/* ===== 删除确认弹窗 ===== */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !deleting && setDeleteModalOpen(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-0 w-full max-w-md mx-4 overflow-hidden">
            {/* Header - Red warning */}
            <div className="bg-red-50 border-b border-red-100 px-6 py-5 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-red-100 border border-red-200 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5.5 h-5.5 text-red-600" />
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Delete Deployment</h3>
                <p className="text-[13px] text-red-600 font-medium mt-0.5">This action cannot be undone</p>
              </div>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="text-[13px] text-gray-600 leading-relaxed space-y-2">
                <p>This will <span className="font-semibold text-red-600">permanently destroy</span> the following:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-500 ml-1">
                  <li>Application and all associated machines</li>
                  <li>All paired devices and pending requests</li>
                  <li>Configuration data and deployment records</li>
                  <li>Access links and gateway tokens</li>
                </ul>
              </div>

              {/* Confirm input */}
              <div className="space-y-2">
                <label className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">
                  Type <span className="text-red-600 font-bold">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE here"
                  disabled={deleting}
                  className="w-full px-4 py-2.5 rounded-lg border-2 border-gray-300 text-[15px] font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400 disabled:opacity-50 placeholder:text-gray-400"
                  autoFocus
                />
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={deleting}
                className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-[13px] font-medium hover:bg-gray-100 transition-all duration-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE" || deleting}
                className="px-5 py-2.5 rounded-lg text-white text-[13px] font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.97]"
                style={{
                  background: deleteConfirmText === "DELETE"
                    ? "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                    : "#d1d5db",
                  boxShadow: deleteConfirmText === "DELETE"
                    ? "0 2px 8px rgba(239,68,68,0.35)"
                    : "none",
                }}
              >
                {deleting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Forever
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
