"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, useParams, usePathname } from "next/navigation";
import {
  Search, Bell, Plus, LayoutDashboard, CreditCard, Settings,
  ChevronRight, LogOut, HelpCircle, Loader2,
} from "lucide-react";
import { PanelProvider, usePanelContext, getStatus } from "./context";

// ===== 侧边栏组件 =====
function Sidebar({
  userName,
  userEmail,
}: {
  userName: string;
  userEmail: string;
}) {
  const { records } = usePanelContext();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const currentId = params.id as string | undefined;
  const isBilling = pathname === "/openclaw/billing";

  return (
    <aside className="w-[220px] h-screen flex flex-col bg-white/70 backdrop-blur-xl border-r border-gray-200/60 shrink-0">
      {/* Logo：与主站一致的红色螃蟹宝宝 */}
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-md shadow-red-200/50 overflow-hidden bg-white p-0.5">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 2px 6px rgba(220, 38, 38, 0.25))" }}
            >
              <circle cx="40" cy="44" r="24" fill="#e74c3c" />
              <path d="M12 42 Q4 38 6 28 Q10 20 18 26 L24 32 Q16 40 12 42Z" fill="#e74c3c" />
              <path d="M68 42 Q76 38 74 28 Q70 20 62 26 L56 32 Q64 40 68 42Z" fill="#e74c3c" />
              <path d="M30 32 Q26 22 28 14" stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M50 32 Q54 22 52 14" stroke="#e74c3c" strokeWidth="3.5" strokeLinecap="round" />
              <circle cx="28" cy="12" r="7" fill="#1e293b" />
              <circle cx="52" cy="12" r="7" fill="#1e293b" />
              <circle cx="29" cy="11" r="2.5" fill="#fff" />
              <circle cx="53" cy="11" r="2.5" fill="#fff" />
              <path d="M20 52 L14 60 M26 56 L22 64 M32 58 L30 66" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
              <path d="M60 52 L66 60 M54 56 L58 64 M48 58 L50 66" stroke="#e74c3c" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-gray-900 text-[15px] font-bold tracking-tight">OpenClaw</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <button
          onClick={() => router.push("/openclaw/dashboard")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
            pathname === "/openclaw/dashboard"
              ? "bg-orange-50 text-orange-600 border border-orange-200/60"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </button>
        <button
          onClick={() => router.push("/openclaw")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 text-[13px] font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-bold text-orange-500 uppercase tracking-[0.12em]">Employees</p>
        </div>
        <p className="px-3 text-gray-400 text-[12px]">
          {records.length} employee{records.length !== 1 ? "s" : ""}
        </p>
        {records.map((emp) => {
          const st = getStatus(emp.status);
          const displayName = (emp.name || emp.flyAppName).slice(0, 16);
          const isActive = currentId === emp.id;
          return (
            <button
              key={emp.id}
              onClick={() => router.push(`/openclaw/${emp.id}`)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-left transition-all duration-200 ${
                isActive
                  ? "bg-orange-50 text-orange-600 border border-orange-200/60"
                  : "text-gray-500 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dotColor}`} />
              <span className="truncate flex-1">{displayName}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 opacity-40" />
            </button>
          );
        })}

        <div className="pt-4 pb-1">
          <p className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.12em]">Management</p>
        </div>
        <button
          onClick={() => router.push("/openclaw/billing")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
            isBilling
              ? "bg-orange-50 text-orange-600 border border-orange-200/60"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Billing
        </button>
        <button
          onClick={() => router.push("/openclaw/settings")}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 text-[13px] font-medium"
        >
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </nav>

      {/* Help */}
      <div className="px-3 py-2">
        <a href="#" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 text-[12px]">
          <HelpCircle className="w-4 h-4" />
          Need help? Contact us
        </a>
      </div>

      {/* User */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-200/60">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white text-[12px] font-bold shrink-0 shadow-sm">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-700 text-[13px] font-semibold truncate">{userName}</p>
            <p className="text-gray-400 text-[11px] truncate">{userEmail}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ===== 顶部导航栏 =====
function TopBar() {
  const { searchQuery, setSearchQuery } = usePanelContext();
  const router = useRouter();

  return (
    <header className="shrink-0 h-14 flex items-center gap-4 px-6 border-b border-gray-200/60 bg-white/70 backdrop-blur-xl">
      <div className="flex items-center gap-2 flex-1">
        {/* <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees, tasks..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent text-gray-700 text-[13px] placeholder-gray-400 outline-none flex-1"
        /> */}
      </div>
      {/* <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200 relative">
        <Bell className="w-4.5 h-4.5" />
      </button> */}
      <button
        onClick={() => router.push("/openclaw")}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-semibold transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
        style={{ boxShadow: "0 2px 10px rgba(249,115,22,0.25)" }}
      >
        <Plus className="w-4 h-4" />
        Add Employee
      </button>
    </header>
  );
}

// ===== 内部 Layout（使用 Context）=====
function PanelLayoutInner({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const { loading } = usePanelContext();

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "user@example.com";

  if (loading) {
    return (
      <div className="flex h-screen bg-[#f8f9fc] items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden relative">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[55%] h-[55%] rounded-full bg-orange-200/20 blur-[120px]" />
        <div className="absolute top-[10%] -right-[15%] w-[50%] h-[50%] rounded-full bg-violet-200/15 blur-[130px]" />
        <div className="absolute -bottom-[25%] left-[15%] w-[45%] h-[45%] rounded-full bg-blue-200/15 blur-[110px]" />
      </div>
      {/* 网格纹理 */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.3]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

// ===== 导出 Layout =====
export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <PanelProvider>
      <PanelLayoutInner>{children}</PanelLayoutInner>
    </PanelProvider>
  );
}
