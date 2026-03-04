import { Suspense } from "react";
import LoginGithubButton from "./login-git-button";
import LoginGoogleButton from "./login-google-button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | OpenClaw",
  description:
    "Sign in to OpenClaw — deploy your AI-powered multi-channel bot in minutes.",
  openGraph: {
    title: "Sign In | OpenClaw",
    description:
      "Sign in to OpenClaw — deploy your AI-powered multi-channel bot in minutes.",
    type: "website",
  },
  twitter: {
    title: "Sign In | OpenClaw",
    description:
      "Sign in to OpenClaw — deploy your AI-powered multi-channel bot in minutes.",
  },
};

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* 顶部 Logo 条 */}
      <div className="w-full px-6 py-5">
        <a href="/" className="inline-flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md shadow-red-200/50 overflow-hidden bg-white p-0.5">
            <svg
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
              style={{ filter: "drop-shadow(0 2px 6px rgba(220,38,38,0.25))" }}
            >
              <circle cx="40" cy="44" r="24" fill="#e74c3c" />
              <path
                d="M12 42 Q4 38 6 28 Q10 20 18 26 L24 32 Q16 40 12 42Z"
                fill="#e74c3c"
              />
              <path
                d="M68 42 Q76 38 74 28 Q70 20 62 26 L56 32 Q64 40 68 42Z"
                fill="#e74c3c"
              />
              <path
                d="M30 32 Q26 22 28 14"
                stroke="#e74c3c"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <path
                d="M50 32 Q54 22 52 14"
                stroke="#e74c3c"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
              <circle cx="28" cy="12" r="7" fill="#1e293b" />
              <circle cx="52" cy="12" r="7" fill="#1e293b" />
              <circle cx="29" cy="11" r="2.5" fill="#fff" />
              <circle cx="53" cy="11" r="2.5" fill="#fff" />
              <path
                d="M20 52 L14 60 M26 56 L22 64 M32 58 L30 66"
                stroke="#e74c3c"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M60 52 L66 60 M54 56 L58 64 M48 58 L50 66"
                stroke="#e74c3c"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="text-gray-900 text-[16px] font-bold tracking-tight">
            OpenClaw
          </span>
        </a>
      </div>

      {/* 主体内容 */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <div className="w-full max-w-[420px]">
          {/* 登录卡片 */}
          <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-xl shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="h-1 bg-orange-500" />

            <div className="p-8 md:p-10 space-y-8">
              {/* 标题区 */}
              <div className="text-center space-y-2">
                <h1 className="text-[28px] font-extrabold tracking-tight text-gray-900">
                  Welcome Back
                </h1>
                <p className="text-gray-500 text-[15px]">
                  Sign in to deploy your{" "}
                  <span className="text-orange-600 font-semibold">
                    OpenClaw
                  </span>{" "}
                  instance
                </p>
              </div>

              {/* 登录按钮 */}
              <div className="space-y-3">
                <Suspense
                  fallback={
                    <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                  }
                >
                  <LoginGoogleButton className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-[14px] font-medium hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer" />
                </Suspense>

                <Suspense
                  fallback={
                    <div className="h-12 w-full rounded-xl bg-gray-100 animate-pulse" />
                  }
                >
                  <LoginGithubButton className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border-2 border-gray-200 bg-white text-gray-700 text-[14px] font-medium hover:border-gray-300 hover:shadow-sm transition-all duration-200 cursor-pointer" />
                </Suspense>
              </div>

              {/* 分隔线 */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-gray-400 text-[12px] font-medium">
                  安全登录
                </span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* 特性亮点 */}
              <div className="flex items-center justify-center gap-6">
                {[
                  { text: "一键部署" },
                  { text: "多通道" },
                  { text: "多模型" },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 text-gray-400 text-[12px] font-medium"
                  >
                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 底部条款 */}
          <p className="text-gray-400 text-[12px] mt-6 text-center leading-relaxed">
            登录即表示您同意我们的{" "}
            <a
              href="/terms"
              className="text-gray-500 hover:text-orange-600 transition-colors underline decoration-dotted underline-offset-2"
            >
              服务条款
            </a>{" "}
            和{" "}
            <a
              href="/privacy-policy"
              className="text-gray-500 hover:text-orange-600 transition-colors underline decoration-dotted underline-offset-2"
            >
              隐私政策
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
