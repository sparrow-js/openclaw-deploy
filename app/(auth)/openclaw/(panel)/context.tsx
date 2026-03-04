"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { toast } from "react-toastify";

// ===== 类型 =====
export interface OpenClawRecord {
  id: string;
  userId: string;
  clientId: string;
  gatewayToken: string | null;
  name: string | null;
  flyAppName: string;
  flyAppUrl: string | null;
  dockerImage: string | null;
  region: string;
  volumeName: string | null;
  status: string;
  machineStatus: string | null;
  lastEvent: string | null;
  lastEventTimestamp: string | null;
  errorMessage: string | null;
  model: string | null;
  channel: string | null;
  openclawConfig: Record<string, any> | null;
  channelCredentials: Record<string, any> | null;
  metadata: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

// 每个实例的额度使用信息
export interface CreditInfo {
  instanceId: string;
  label: string;
  usage: number;       // 已使用金额（美元）
  limit: number | null; // 额度上限（美元）
  remaining: number | null; // 剩余额度
  is_free_tier: boolean;
}

// 汇总的额度信息
export interface CreditsSummary {
  totalLimit: number;      // 所有实例总额度
  totalUsage: number;      // 所有实例总消耗
  totalRemaining: number;  // 所有实例总剩余
  instanceCount: number;   // 有 API Key 的实例数
  details: CreditInfo[];   // 每个实例的详情
}

// ===== 状态映射（浅色主题）=====
export const STATUS_MAP: Record<string, { label: string; color: string; dotColor: string; bgColor: string; borderColor: string }> = {
  running: { label: "Deployed", color: "text-emerald-600", dotColor: "bg-emerald-500", bgColor: "bg-emerald-50", borderColor: "border-emerald-200" },
  deploying: { label: "Deploying", color: "text-blue-600", dotColor: "bg-blue-500", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
  pending: { label: "Pending", color: "text-yellow-600", dotColor: "bg-yellow-500", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
  stopped: { label: "Stopped", color: "text-gray-500", dotColor: "bg-gray-400", bgColor: "bg-gray-100", borderColor: "border-gray-200" },
  error: { label: "Error", color: "text-red-600", dotColor: "bg-red-500", bgColor: "bg-red-50", borderColor: "border-red-200" },
  deleted: { label: "Deleted", color: "text-gray-400", dotColor: "bg-gray-300", bgColor: "bg-gray-50", borderColor: "border-gray-200" },
};

export function getStatus(s: string) {
  return STATUS_MAP[s] || { label: s, color: "text-gray-500", dotColor: "bg-gray-400", bgColor: "bg-gray-100", borderColor: "border-gray-200" };
}

// ===== 通道显示 =====
export function getChannelDisplay(channel: string | null) {
  switch (channel) {
    case "telegram": return { name: "Telegram", color: "#29a9eb" };
    case "discord": return { name: "Discord", color: "#5865f2" };
    case "feishu": return { name: "Feishu", color: "#3370ff" };
    default: return { name: "Unknown", color: "#6b7280" };
  }
}

// ===== 模型显示 =====
export function getModelDisplay(model: string | null) {
  if (!model) return { name: "Unknown", icon: "🤖" };
  if (model.includes("claude-opus")) return { name: "Claude Opus", icon: "🧠" };
  if (model.includes("claude-sonnet")) return { name: "Claude Sonnet", icon: "🎯" };
  if (model.includes("gpt-5")) return { name: "GPT-5.2", icon: "⚡" };
  return { name: model.split("/").pop() || "Unknown", icon: "🤖" };
}

// ===== 时间格式化 =====
export function timeAgo(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

// ===== Context =====
interface PanelContextType {
  records: OpenClawRecord[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  refreshRecords: () => Promise<void>;
  credits: CreditsSummary | null;
  creditsLoading: boolean;
  refreshCredits: () => Promise<void>;
}

const PanelContext = createContext<PanelContextType>({
  records: [],
  loading: true,
  searchQuery: "",
  setSearchQuery: () => {},
  refreshRecords: async () => {},
  credits: null,
  creditsLoading: true,
  refreshCredits: async () => {},
});

export function usePanelContext() {
  return useContext(PanelContext);
}

export function PanelProvider({ children }: { children: ReactNode }) {
  const [records, setRecords] = useState<OpenClawRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [credits, setCredits] = useState<CreditsSummary | null>(null);
  const [creditsLoading, setCreditsLoading] = useState(true);

  const fetchRecords = useCallback(async () => {
    try {
      const res = await fetch("/api/openclaw");
      const data = await res.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCredits = useCallback(async () => {
    try {
      setCreditsLoading(true);
      const res = await fetch("/api/openclaw/credits");
      const data = await res.json();
      if (data.success) {
        setCredits(data.data);
      }
    } catch {
      // silent
    } finally {
      setCreditsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
    fetchCredits();
  }, [fetchRecords, fetchCredits]);

  return (
    <PanelContext.Provider value={{
      records, loading, searchQuery, setSearchQuery,
      refreshRecords: fetchRecords,
      credits, creditsLoading, refreshCredits: fetchCredits,
    }}>
      {children}
    </PanelContext.Provider>
  );
}
