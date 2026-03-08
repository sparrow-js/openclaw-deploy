import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="w-full border-t border-gray-200/60 bg-white/50 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-1 space-y-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md shadow-red-200/50 overflow-hidden bg-white p-0.5">
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
              <span className="text-gray-900 text-[15px] font-bold tracking-tight">Pincer</span>
            </Link>
            <p className="text-gray-400 text-[13px] leading-relaxed">
              AI-powered platform that deploys your OpenClaw instance in minutes.
            </p>
          </div>

          {/* Product */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-[13px] font-bold tracking-tight">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/openclaw/dashboard" className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/" className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors">
                  Deploy
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-[13px] font-bold tracking-tight">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://doc-needware.vercel.app/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/sparrow-js/openclaw-deploy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h4 className="text-gray-900 text-[13px] font-bold tracking-tight">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy-policy" className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-500 text-[13px] hover:text-orange-600 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider + Copyright */}
        <div className="mt-10 pt-6 border-t border-gray-200/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-gray-400 text-[12px]">
            &copy; {new Date().getFullYear()} Pincer. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/sparrow-js/openclaw-deploy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="GitHub"
            >
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
            </a>
            <a
              href="https://x.com/nicepkg"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="X (Twitter)"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
