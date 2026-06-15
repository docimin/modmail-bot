import { readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import type { BotCommand } from "../framework.ts";

/** Dynamically import every command module in this folder. */
export async function loadCommands(): Promise<Map<string, BotCommand>> {
  const dir = dirname(fileURLToPath(import.meta.url));
  const files = (await readdir(dir)).filter(
    (f) =>
      (f.endsWith(".ts") || f.endsWith(".js")) &&
      !f.startsWith("loader") &&
      !f.startsWith("index") &&
      !f.endsWith(".d.ts"),
  );

  const map = new Map<string, BotCommand>();
  for (const file of files) {
    const mod = (await import(`./${file}`)) as { default?: BotCommand };
    const cmd = mod.default;
    if (!cmd?.data) continue;
    map.set(cmd.data.toJSON().name, cmd);
  }
  return map;
}
