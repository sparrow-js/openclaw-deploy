"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, LayoutDashboard, BookOpen, Loader2 } from "lucide-react";

export function AppHeader() {
  const { data: session, status } = useSession();
  const userInitial = session?.user?.name?.charAt(0)?.toUpperCase() || "U";
  const userName = session?.user?.name || "User";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200/60 bg-white/70 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center">
        {/* 左侧：品牌 + 导航 */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md shadow-red-200/50 overflow-hidden bg-white p-0.5">
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
            <span className="text-gray-900 text-[16px] font-bold tracking-tight">Pincer</span>
          </Link>

          {/* 分隔线 */}
          <div className="hidden sm:block h-5 w-px bg-gray-200/80" />

          {/* 导航链接 */}
          <nav className="hidden sm:flex items-center gap-1">
            <Link
              href="/openclaw/dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 text-[13px] font-medium hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Dashboard
            </Link>
            <a
              href="https://doc-needware.vercel.app/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-gray-600 text-[13px] font-medium hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Docs
            </a>
          </nav>
        </div>

        {/* 弹性空间 */}
        <div className="flex-1" />

        {/* 右侧：登录状态 / 用户信息 */}
        <div className="flex items-center gap-2">
          {status === "loading" ? (
            <div className="flex items-center gap-2 px-3 py-1.5">
              <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
              <span className="text-gray-400 text-[13px]">加载中...</span>
            </div>
          ) : status === "unauthenticated" ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-[13px] font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              登录
            </Link>
          ) : (
            <>
              <div className="flex items-center gap-2.5 pl-2 pr-1 py-1 rounded-xl hover:bg-gray-100/80 transition-all duration-200 group cursor-default">
                <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                  {userInitial}
                </div>
                <span className="hidden sm:block text-gray-700 text-[13px] font-medium truncate max-w-[100px]">
                  {userName}
                </span>
              </div>
              <button
                onClick={() => signOut()}
                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
                title="退出登录"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
