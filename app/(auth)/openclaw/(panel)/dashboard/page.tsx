"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus, ChevronRight, Zap, Globe,
  Bot, Activity, Users, Loader2, Search,
  AlertTriangle, StopCircle, Wallet, RefreshCw, CreditCard,
} from "lucide-react";
import {
  usePanelContext,
  getStatus,
  getChannelDisplay,
  getModelDisplay,
  timeAgo,
  type OpenClawRecord,
  type CreditsSummary,
} from "../context";

// ===== 统计卡片（专业风格：中性底、清晰层级）=====
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
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="flex-1 min-w-[120px] rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100"
          style={{ color: iconColor }}
        >
          {icon}
        </span>
        <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
      </div>
      <p className="mt-2 text-sm font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

// ===== 分布标签（简洁列表项）=====
function DistributionTag({
  icon,
  label,
  count,
  color,
}: {
  icon?: React.ReactNode;
  label: string;
  count: number;
  color: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50/50 px-3 py-2">
      {icon ?? <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />}
      <span className="flex-1 text-sm text-gray-700">{label}</span>
      <span className="text-sm font-semibold tabular-nums text-gray-900">{count}</span>
    </div>
  );
}

// ===== 额度使用进度条（细、中性轨道）=====
function CreditProgressBar({ usage, limit }: { usage: number; limit: number }) {
  const percentage = limit > 0 ? Math.min((usage / limit) * 100, 100) : 0;
  const isWarning = percentage >= 80;
  const isDanger = percentage >= 95;

  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
      <div
        className={`h-full rounded-full transition-all duration-300 ${
          isDanger ? "bg-red-500" : isWarning ? "bg-amber-500" : "bg-emerald-500"
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

// ===== 额度概览卡片 =====
function CreditsOverviewCard({
  credits,
  creditsLoading,
  onRefresh,
}: {
  credits: CreditsSummary | null;
  creditsLoading: boolean;
  onRefresh: () => void;
}) {
  if (creditsLoading && !credits) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading credits…</span>
        </div>
      </div>
    );
  }

  if (!credits || credits.instanceCount === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <CreditCard className="h-4 w-4 text-gray-500" />
          </div>
          <span className="text-base font-semibold text-gray-900">Credits</span>
        </div>
        <p className="mt-3 text-sm text-gray-500">No instances with API keys yet. Deploy an employee to get started.</p>
      </div>
    );
  }

  const totalLimit = credits.totalLimit ?? 0;
  const totalUsage = credits.totalUsage ?? 0;
  const totalRemaining = credits.totalRemaining ?? 0;

  const usagePercent = totalLimit > 0
    ? Math.round((totalUsage / totalLimit) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100">
            <Wallet className="h-4 w-4 text-gray-600" />
          </div>
          <span className="text-base font-semibold text-gray-900">Credits</span>
        </div>
        <button
          onClick={onRefresh}
          disabled={creditsLoading}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${creditsLoading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Total limit</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">${totalLimit.toFixed(2)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{credits.instanceCount} instance{credits.instanceCount !== 1 ? "s" : ""}</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Used</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">${totalUsage.toFixed(4)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{usagePercent}% of total</p>
        </div>
        <div className="rounded-lg border border-gray-100 bg-gray-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">Remaining</p>
          <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900">${totalRemaining.toFixed(2)}</p>
          <p className="mt-0.5 text-xs text-gray-400">{100 - usagePercent}% left</p>
        </div>
      </div>

      <div className="mt-5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">Overall usage</span>
          <span className="text-xs font-semibold tabular-nums text-gray-700">{usagePercent}%</span>
        </div>
        <div className="mt-1.5">
          <CreditProgressBar usage={totalUsage} limit={totalLimit} />
        </div>
      </div>

      {credits.details && credits.details.length > 0 && (
        <div className="mt-5 border-t border-gray-100 pt-5">
          <p className="text-xs font-medium text-gray-500">Per instance</p>
          <div className="mt-3 space-y-3">
            {credits.details.map((detail) => {
              const detailUsage = detail.usage ?? 0;
              const detailLimit = detail.limit ?? 0;
              const pct = detailLimit ? Math.round((detailUsage / detailLimit) * 100) : 0;
              return (
                <div key={detail.instanceId}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium text-gray-700">{detail.label}</span>
                    <span className="shrink-0 text-xs tabular-nums text-gray-500">
                      ${detailUsage.toFixed(4)} / ${detailLimit ? detailLimit.toFixed(2) : "∞"} ({pct}%)
                    </span>
                  </div>
                  {detailLimit > 0 && (
                    <div className="mt-1">
                      <CreditProgressBar usage={detailUsage} limit={detailLimit} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ===== 员工行（专业列表项：中性头像、清晰元信息）=====
function EmployeeRow({ record, onClick }: { record: OpenClawRecord; onClick: () => void }) {
  const st = getStatus(record.status);
  const ch = getChannelDisplay(record.channel);
  const model = getModelDisplay(record.model);
  const displayName = record.flyAppName;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-left shadow-sm transition-colors hover:border-gray-300 hover:bg-gray-50/50"
    >
      <div className="relative shrink-0">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-base font-semibold text-gray-600">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${st.dotColor}`}
          title={st.label}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-gray-900">{displayName}</span>
          <span className={`shrink-0 text-xs font-medium ${st.color}`}>{st.label}</span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">{model.icon} {model.name}</span>
          <span className="text-gray-300">·</span>
          <span style={{ color: ch.color }}>{ch.name}</span>
          <span className="text-gray-300">·</span>
          <span className="flex items-center gap-0.5"><Globe className="h-3 w-3" /> {record.region}</span>
          {record.lastEvent && (
            <>
              <span className="text-gray-300">·</span>
              <span>{record.lastEvent}</span>
            </>
          )}
        </div>
        {record.status === "error" && record.errorMessage && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500" />
            <span className="truncate text-xs text-red-600">{record.errorMessage}</span>
          </div>
        )}
      </div>

      <div className="hidden shrink-0 items-center gap-4 sm:flex">
        <span className="text-right text-xs text-gray-400">{timeAgo(record.updatedAt)}</span>
        <ChevronRight className="h-4 w-4 text-gray-300 transition-colors group-hover:text-gray-500" />
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-gray-300 sm:hidden" />
    </button>
  );
}

// ===== Dashboard 页面（只有内容区域）=====
export default function DashboardPage() {
  const router = useRouter();
  const { records, searchQuery, credits, creditsLoading, refreshCredits } = usePanelContext();

  // 基于真实数据计算统计
  const stats = useMemo(() => {
    const total = records.length;
    const running = records.filter((r) => r.status === "running").length;
    const deploying = records.filter((r) => r.status === "deploying").length;
    const stopped = records.filter((r) => r.status === "stopped").length;
    const error = records.filter((r) => r.status === "error").length;
    const pending = records.filter((r) => r.status === "pending").length;

    // 渠道分布
    const channelMap = new Map<string, number>();
    records.forEach((r) => {
      const ch = r.channel || "unknown";
      channelMap.set(ch, (channelMap.get(ch) || 0) + 1);
    });

    // 模型分布
    const modelMap = new Map<string, number>();
    records.forEach((r) => {
      const m = getModelDisplay(r.model);
      modelMap.set(m.name, (modelMap.get(m.name) || 0) + 1);
    });

    // 区域分布
    const regionMap = new Map<string, number>();
    records.forEach((r) => {
      regionMap.set(r.region, (regionMap.get(r.region) || 0) + 1);
    });

    // 最近更新的记录
    const sortedByUpdate = [...records].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const lastUpdated = sortedByUpdate[0]?.updatedAt;

    return {
      total, running, deploying, stopped, error, pending,
      channelMap, modelMap, regionMap, lastUpdated,
    };
  }, [records]);

  // 搜索过滤
  const filteredRecords = searchQuery
    ? records.filter(
        (r) =>
          r.flyAppName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.channel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.region?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.status?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : records;

  const handleEmployeeClick = (id: string) => {
    router.push(`/openclaw/${id}`);
  };

  return (
    <>
      <header className="border-b border-gray-100 pb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and monitor your AI employees
          {stats.lastUpdated && (
            <span className="text-gray-400"> · Last updated {timeAgo(stats.lastUpdated)}</span>
          )}
        </p>
      </header>

      <section>
        <h2 className="sr-only">Overview</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={<Users className="w-4 h-4" />}
          iconColor="#f97316"
          label="Total Employees"
          value={stats.total}
        />
        <StatCard
          icon={<Activity className="w-4 h-4" />}
          iconColor="#22c55e"
          label="Online"
          value={stats.running}
          sub={stats.total > 0 ? `${Math.round((stats.running / stats.total) * 100)}% of total` : undefined}
        />
        <StatCard
          icon={<Loader2 className="w-4 h-4" />}
          iconColor="#3b82f6"
          label="Deploying"
          value={stats.deploying}
          sub={stats.pending > 0 ? `+${stats.pending} pending` : undefined}
        />
        <StatCard
          icon={<StopCircle className="w-4 h-4" />}
          iconColor="#6b7280"
          label="Stopped"
          value={stats.stopped}
        />
        <StatCard
          icon={<AlertTriangle className="w-4 h-4" />}
          iconColor="#ef4444"
          label="Errors"
          value={stats.error}
          sub={stats.error > 0 ? "Needs attention" : undefined}
        />
        </div>
      </section>

      <section>
        <CreditsOverviewCard
          credits={credits}
          creditsLoading={creditsLoading}
          onRefresh={refreshCredits}
        />
      </section>

      {stats.total > 0 && (
        <section>
          <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-gray-500">Distribution</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Channels</p>
              <div className="mt-3 space-y-1.5">
                {Array.from(stats.channelMap.entries()).map(([channel, count]) => {
                  const ch = getChannelDisplay(channel);
                  return <DistributionTag key={channel} label={ch.name} count={count} color={ch.color} />;
                })}
                {stats.channelMap.size === 0 && <p className="py-2 text-xs text-gray-400">No channels</p>}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Models</p>
              <div className="mt-3 space-y-1.5">
                {Array.from(stats.modelMap.entries()).map(([model, count]) => (
                  <DistributionTag key={model} label={model} count={count} color="#64748b" />
                ))}
                {stats.modelMap.size === 0 && <p className="py-2 text-xs text-gray-400">No models</p>}
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="text-sm font-semibold text-gray-900">Regions</p>
              <div className="mt-3 space-y-1.5">
                {Array.from(stats.regionMap.entries()).map(([region, count]) => (
                  <DistributionTag
                    key={region}
                    label={region.toUpperCase()}
                    count={count}
                    color="#64748b"
                    icon={<Globe className="h-3.5 w-3.5" />}
                  />
                ))}
                {stats.regionMap.size === 0 && <p className="py-2 text-xs text-gray-400">No regions</p>}
              </div>
            </div>
          </div>
        </section>
      )}

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Employees</h2>
          {filteredRecords.length > 0 && (
            <span className="text-xs text-gray-400">Sorted by latest update</span>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-16 text-center shadow-sm">
            {records.length === 0 ? (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <Bot className="h-6 w-6 text-gray-400" />
                </div>
                <p className="mt-4 text-sm font-semibold text-gray-900">No employees yet</p>
                <p className="mt-1 max-w-[260px] text-sm text-gray-500">
                  Deploy your first AI employee to get started.
                </p>
                <a
                  href="/openclaw"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4" />
                  Add Employee
                </a>
              </>
            ) : (
              <>
                <Search className="h-8 w-8 text-gray-300" />
                <p className="mt-3 text-sm font-medium text-gray-500">No results found</p>
                <p className="mt-0.5 text-xs text-gray-400">Try a different search term</p>
              </>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredRecords.map((record) => (
              <EmployeeRow
                key={record.id}
                record={record}
                onClick={() => handleEmployeeClick(record.id)}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
