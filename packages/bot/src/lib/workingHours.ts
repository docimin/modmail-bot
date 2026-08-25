import type { GuildConfig } from "@modmail/db";

/** True when working hours are enabled and "now" falls outside them. */
export function isOutsideWorkingHours(config: GuildConfig): boolean {
  const wh = config.workingHours;
  if (!config.awayEnabled || !wh.enabled || wh.days.length === 0) return false;

  try {
    const fmt = new Intl.DateTimeFormat("en-US", {
      timeZone: wh.timezone || "UTC",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = fmt.formatToParts(new Date());
    const weekdayStr = parts.find((p) => p.type === "weekday")?.value ?? "";
    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const day = dayMap[weekdayStr] ?? -1;
    const today = wh.days.find((d) => d.day === day);
    if (!today) return true; // closed all day

    const now = hour * 60 + minute;
    const [oh, om] = today.open.split(":").map(Number);
    const [ch, cm] = today.close.split(":").map(Number);
    const open = (oh ?? 0) * 60 + (om ?? 0);
    const close = (ch ?? 0) * 60 + (cm ?? 0);
    return now < open || now >= close;
  } catch {
    return false;
  }
}
