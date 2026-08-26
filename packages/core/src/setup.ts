export interface SetupState {
  mode: "threads" | "channels";
  inboxChannelId?: string | null;
  fallbackCategoryId?: string | null;
}

/**
 * What still has to be configured before modmail can be enabled. Without an
 * inbox channel the server is silently skipped when a user DMs the bot, and in
 * channels mode the fallback category is used as the parent for new ticket
 * channels — falling back to the inbox text channel there is not a valid parent.
 */
export function missingToEnable(state: SetupState): string[] {
  const missing: string[] = [];
  if (!state.inboxChannelId) missing.push("an inbox channel");
  if (state.mode === "channels" && !state.fallbackCategoryId)
    missing.push("a fallback category (used as the parent for ticket channels)");
  return missing;
}
