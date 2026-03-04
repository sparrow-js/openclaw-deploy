"use client";

import React from "react";
import type { ChannelOption } from "./openclaw-deploy";
import { MODEL_OPTIONS_META, CHANNEL_OPTIONS_META } from "./openclaw-deploy";

// ===== 渠道/模型图标组件 =====

export function ClaudeIcon({ className }: { className?: string }) {
  return (
    <img src="/claude.svg" alt="Claude" className={className} style={{ objectFit: "contain" }} />
  );
}

export function OpenAIIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  );
}

export function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
    </svg>
  );
}

export function FeishuIcon({ className }: { className?: string }) {
  return (
    <img src="/feishu.png" alt="Feishu" className={className} style={{ objectFit: "contain" }} />
  );
}

export function KimiIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#000000" />
      <path d="M5 7.5L10.5 12L5 16.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16.5H19" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function MiniMaxIcon({ className }: { className?: string }) {
  return (
    <img src="/minmax.png" alt="MiniMax" className={className} style={{ objectFit: "contain" }} />
  );
}

// ===== 通道连接配置类型 =====

export interface ChannelSection {
  title: string;
  steps: React.ReactNode[];
}

export interface InputField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
}

export interface ChannelConfig {
  name: string;
  icon: React.ReactNode;
  subtitle: string;
  accentColor: string;
  accentColorHover: string;
  linkColor: string;
  linkColorHover: string;
  sections: ChannelSection[];
  placeholder: string;
  inputs?: InputField[];
  linkText: string;
  linkUrl: string;
  buttonText: string;
}

// 富文本辅助组件（用于 steps 中的 JSX）
const B = ({ children }: { children: React.ReactNode }) => (
  <span className="text-gray-900 font-semibold">{children}</span>
);
const Link = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#5865f2] hover:underline font-medium">
    {children}
  </a>
);
const Code = ({ children }: { children: React.ReactNode }) => (
  <code className="mx-1 px-2 py-0.5 rounded-md bg-gray-100 text-orange-600 text-[13px] font-mono border border-gray-200">{children}</code>
);

// ===== 渠道连接配置（含步骤说明与输入项） =====

export const CHANNEL_CONFIGS: Record<ChannelOption, ChannelConfig> = {
  telegram: {
    name: "Telegram",
    icon: <TelegramIcon className="w-10 h-10 text-[#29a9eb]" />,
    subtitle: "Takes ~1 minute",
    accentColor: "#29a9eb",
    accentColorHover: "#1a99db",
    linkColor: "#1a8fcc",
    linkColorHover: "#1578ad",
    sections: [
      {
        title: "CREATE THE BOT & GET TOKEN",
        steps: [
          <>Open Telegram → search <B>@BotFather</B></>,
          <>Send<Code>/newbot</Code>and follow the prompts</>,
          <>Copy the token and paste below</>,
        ],
      },
    ],
    placeholder: "123456789:ABCdef...",
    linkText: "Open BotFather",
    linkUrl: "https://t.me/BotFather",
    buttonText: "Connect",
  },
  discord: {
    name: "Discord",
    icon: <DiscordIcon className="w-10 h-10 text-[#5865f2]" />,
    subtitle: "Takes ~2 minutes",
    accentColor: "#5865f2",
    accentColorHover: "#4752c4",
    linkColor: "#4752c4",
    linkColorHover: "#3b44a8",
    sections: [
      {
        title: "DISCORD SETUP & CONFIGURATION",
        steps: [
          <>See full documentation: <a href="https://doc-needware.vercel.app/docs/discord" target="_blank" rel="noopener noreferrer" className="text-[#5865f2] hover:underline font-medium">Discord · doc-needware</a></>,
        ],
      },
    ],
    placeholder: "MTIzNDU2Nzg5.ABCdef...",
    linkText: "Open Developer Portal",
    linkUrl: "https://discord.com/developers/applications",
    buttonText: "Connect",
  },
  feishu: {
    name: "Feishu",
    icon: <FeishuIcon className="w-10 h-10" />,
    subtitle: "Takes ~5 minutes · WebSocket, no public URL needed",
    accentColor: "#3370ff",
    accentColorHover: "#2060ee",
    linkColor: "#2060ee",
    linkColorHover: "#1850cc",
    sections: [
      {
        title: "FEISHU SETUP & CONFIGURATION",
        steps: [
          <>See full documentation: <a href="https://doc-needware.vercel.app/docs/feishu" target="_blank" rel="noopener noreferrer" className="text-[#3370ff] hover:underline font-medium">Feishu Setup · doc-needware</a></>,
        ],
      },
    ],
    placeholder: "cli_xxxxxxxxxxxxxxxxx",
    inputs: [
      { key: "appId", label: "App ID", placeholder: "cli_xxxxxxxxxxxxxxxxx", secret: false },
      { key: "appSecret", label: "App Secret", placeholder: "Enter your App Secret", secret: true },
    ],
    linkText: "Open Feishu Platform",
    linkUrl: "https://open.feishu.cn/app",
    buttonText: "Connect",
  },
};

// ===== 模型/渠道选择器用选项（带图标） =====

export const MODEL_OPTIONS = MODEL_OPTIONS_META.map((m) => {
  const icon =
    m.key === "claude-opus" ? <ClaudeIcon className="w-6 h-6" /> :
    m.key === "gpt-5.2" ? <OpenAIIcon className="w-6 h-6 text-[#10a37f]" /> :
    m.key === "kimi-k2.5" ? <img src="/moonshot.png" alt="Kimi" className="w-6 h-6" /> :
    <MiniMaxIcon className="w-6 h-6" />;
  return { ...m, icon };
});

export const CHANNEL_OPTIONS = CHANNEL_OPTIONS_META.map((c) => ({
  ...c,
  icon:
    c.key === "telegram" ? <TelegramIcon className="w-7 h-7 text-[#29a9eb]" /> :
    c.key === "discord" ? <DiscordIcon className="w-7 h-7 text-[#5865f2]" /> :
    <FeishuIcon className="w-7 h-7" />,
}));
