/**
 * OpenClaw 部署相关类型与数据配置（模型 ID、渠道展示名等）
 */

export type ModelOption = "claude-opus" | "gpt-5.2" | "kimi-k2.5" | "minimax-m2.5";
export type ChannelOption = "telegram" | "discord" | "feishu";

/** 模型 key -> OpenRouter 模型 ID */
export const MODEL_TO_OPENROUTER_ID: Record<ModelOption, string> = {
  "claude-opus": "openrouter/anthropic/claude-opus-4.6",
  "gpt-5.2": "openrouter/openai/gpt-5.2",
  "kimi-k2.5": "openrouter/moonshotai/kimi-k2.5",
  "minimax-m2.5": "openrouter/minimax/minimax-m2.5",
};

/** 渠道 key -> 展示名称 */
export const CHANNEL_DISPLAY_NAMES: Record<ChannelOption, string> = {
  telegram: "Telegram",
  discord: "Discord",
  feishu: "Feishu",
};

/** 模型选项元数据（不含 React 节点，用于与图标组合） */
export const MODEL_OPTIONS_META: {
  key: ModelOption;
  name: string;
  color: string;
  lightBg: string;
  badge?: string;
}[] = [
  { key: "claude-opus", name: "Claude Opus 4.6", color: "#e87c4a", lightBg: "#fff7f3", badge: "Recommended" },
  { key: "gpt-5.2", name: "GPT-5.2", color: "#10a37f", lightBg: "#f0fdf8", badge: "Recommended" },
  { key: "kimi-k2.5", name: "Kimi K2.5", color: "#000000", lightBg: "#f5f5f5", badge: "Affordable" },
  { key: "minimax-m2.5", name: "MiniMax M2.5", color: "#6C5CE7", lightBg: "#f5f3ff", badge: "Affordable" },
];

/** 渠道选项元数据（不含 React 节点，用于与图标组合） */
export const CHANNEL_OPTIONS_META: {
  key: ChannelOption;
  name: string;
  color: string;
  lightBg: string;
}[] = [
  { key: "telegram", name: "Telegram", color: "#29a9eb", lightBg: "#f0f9ff" },
  { key: "discord", name: "Discord", color: "#5865f2", lightBg: "#f5f3ff" },
  { key: "feishu", name: "Feishu", color: "#3370ff", lightBg: "#eff6ff" },
];
