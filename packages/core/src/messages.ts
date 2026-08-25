import type { EmbedTemplate, MessageTemplate } from "@modmail/db";
import { LIMITS } from "./constants.ts";

export interface RenderedEmbed {
  title?: string;
  description?: string;
  url?: string;
  color?: number;
  thumbnail?: { url: string };
  image?: { url: string };
  author?: { name: string; icon_url?: string; url?: string };
  footer?: { text: string; icon_url?: string };
  fields?: { name: string; value: string; inline: boolean }[];
  timestamp?: string;
}

export interface RenderedMessage {
  content?: string;
  embeds?: RenderedEmbed[];
}

export type TemplateVars = Record<string, string | number | null | undefined>;

/** Resolve a `#rrggbb` / `rrggbb` / integer-ish color to a Discord int. */
export function resolveColor(color?: string | null): number | undefined {
  if (!color) return undefined;
  const hex = color.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) return parseInt(hex, 16);
  const n = Number(color);
  return Number.isInteger(n) && n >= 0 ? n : undefined;
}

function escapeMarkdown(text: string): string {
  return text.replace(/([\\*_~`|>])/g, "\\$1");
}

function applyVars(input: string | undefined, vars: TemplateVars): string | undefined {
  if (input == null) return undefined;
  // $e[ ... ] => markdown-escape the inner text (after var substitution)
  let out = input.replace(/\$e\[([^\]]*)\]/g, (_m, inner: string) => {
    const replaced = inner.replace(/\$\{([^}]+)\}/g, (_t, key: string) =>
      String(vars[key.trim()] ?? ""),
    );
    return escapeMarkdown(replaced);
  });
  out = out.replace(/\$\{([^}]+)\}/g, (_t, key: string) => {
    const v = vars[key.trim()];
    return v == null ? "" : String(v);
  });
  return out;
}

function renderEmbed(embed: EmbedTemplate, vars: TemplateVars): RenderedEmbed | null {
  const e: RenderedEmbed = {};
  e.title = clip(applyVars(embed.title, vars), LIMITS.embedTitle);
  e.description = clip(applyVars(embed.description, vars), LIMITS.embedDescription);
  e.url = applyVars(embed.url, vars) || undefined;
  e.color = resolveColor(embed.color);

  const thumb = applyVars(embed.thumbnail, vars);
  if (thumb) e.thumbnail = { url: thumb };
  const image = applyVars(embed.image, vars);
  if (image) e.image = { url: image };

  if (embed.author?.name) {
    const name = clip(applyVars(embed.author.name, vars), LIMITS.embedAuthor);
    if (name) {
      e.author = {
        name,
        icon_url: applyVars(embed.author.iconUrl, vars) || undefined,
        url: applyVars(embed.author.url, vars) || undefined,
      };
    }
  }

  if (embed.footer?.text) {
    const text = clip(applyVars(embed.footer.text, vars), LIMITS.embedFooter);
    if (text) {
      e.footer = {
        text,
        icon_url: applyVars(embed.footer.iconUrl, vars) || undefined,
      };
    }
  }

  if (embed.fields?.length) {
    e.fields = embed.fields
      .slice(0, LIMITS.embedFields)
      .map((f) => ({
        name: clip(applyVars(f.name, vars), LIMITS.embedFieldName) ?? "",
        value: clip(applyVars(f.value, vars), LIMITS.embedFieldValue) ?? "",
        inline: !!f.inline,
      }))
      .filter((f) => f.name && f.value);
  }

  if (embed.timestamp) e.timestamp = new Date().toISOString();

  const hasContent =
    e.title || e.description || e.fields?.length || e.image || e.thumbnail || e.author || e.footer;
  return hasContent ? e : null;
}

function clip(s: string | undefined, max: number): string | undefined {
  if (s == null) return undefined;
  return s.length > max ? s.slice(0, max) : s;
}

/** Render a stored MessageTemplate to a Discord-ready payload. */
export function renderMessage(template: MessageTemplate, vars: TemplateVars = {}): RenderedMessage {
  const content = clip(applyVars(template.content, vars), LIMITS.content);
  const embeds = (template.embeds ?? [])
    .slice(0, LIMITS.embeds)
    .map((e) => renderEmbed(e, vars))
    .filter((e): e is RenderedEmbed => e !== null);
  const out: RenderedMessage = {};
  if (content) out.content = content;
  if (embeds.length) out.embeds = embeds;
  return out;
}

/** Apply variable substitution to a single relay-prefix string. */
export function renderPrefix(prefix: string, vars: TemplateVars): string {
  return applyVars(prefix, vars) ?? "";
}
