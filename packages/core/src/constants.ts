export const COLORS = {
  accent: "#5865f2",
  success: "#3ea45f",
  error: "#ed4245",
  warning: "#faa61a",
} as const;

export const LIMITS = {
  content: 2000,
  embedTitle: 256,
  embedDescription: 4096,
  embedFieldName: 256,
  embedFieldValue: 1024,
  embedFooter: 2048,
  embedAuthor: 256,
  embedTotal: 6000,
  embedFields: 25,
  embeds: 10,
  snippetName: 100,
  snippetContent: 2000,
  reason: 1000,
} as const;

// Discord permission flag bits we care about (as bigint for the dashboard side).
export const PERMISSIONS = {
  ADMINISTRATOR: 1n << 3n,
  MANAGE_GUILD: 1n << 5n,
} as const;

export const DEFAULT_NAME_FORMAT = "{username}";

export const PRIORITIES = ["low", "normal", "high", "urgent"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_META: Record<Priority, { label: string; color: string }> = {
  low: { label: "Low", color: "#9aa0a6" },
  normal: { label: "Normal", color: "#5865f2" },
  high: { label: "High", color: "#faa61a" },
  urgent: { label: "Urgent", color: "#ed4245" },
};

export const LOCALES = ["en", "de"] as const;
export type Locale = (typeof LOCALES)[number];
