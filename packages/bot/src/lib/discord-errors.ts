const GENERIC = "Something went wrong opening your ticket. Please try again later.";

// Discord reports setup problems as generic 403s, so surface the cause instead of
// leaving staff to dig through bot logs.
const BY_CODE: Record<number, string> = {
  50001:
    "This server's modmail isn't set up correctly — the bot can't access the inbox channel. Please let the staff know.",
  50013:
    "This server's modmail isn't set up correctly — the bot is missing a permission it needs. Please let the staff know.",
  50035:
    "This server's modmail is misconfigured — the inbox channel it's configured to use doesn't look valid. Please let the staff know.",
};

export function ticketErrorMessage(err: unknown): string {
  const code = (err as { code?: unknown } | null | undefined)?.code;
  return typeof code === "number" ? (BY_CODE[code] ?? GENERIC) : GENERIC;
}
