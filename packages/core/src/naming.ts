export interface NameVars {
  username: string;
  userId: string;
  number: number;
}

/** Build a channel/thread name from a format string, then sanitize for Discord. */
export function formatTicketName(format: string, vars: NameVars): string {
  const raw = format
    .replaceAll("{username}", vars.username)
    .replaceAll("{userId}", vars.userId)
    .replaceAll("{number}", String(vars.number));
  const cleaned = raw
    .toLowerCase()
    .replace(/[^a-z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 90);
  return cleaned || `ticket-${vars.number}`;
}
