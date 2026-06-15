// Shapes stored in jsonb columns. The canonical validators/defaults live in
// @modmail/core (zod), which produces types compatible with these. Defined here
// so the db package stays the lowest layer with no workspace dependencies.

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface EmbedTemplate {
  title?: string;
  description?: string;
  url?: string;
  color?: string;
  thumbnail?: string;
  image?: string;
  author?: { name?: string; iconUrl?: string; url?: string };
  footer?: { text?: string; iconUrl?: string };
  fields?: EmbedField[];
  timestamp?: boolean;
}

export interface MessageTemplate {
  content?: string;
  embeds?: EmbedTemplate[];
}

export interface WorkingHoursDay {
  day: number; // 0=Sunday .. 6=Saturday
  open: string; // "HH:mm"
  close: string; // "HH:mm"
}

export interface WorkingHours {
  enabled: boolean;
  timezone: string;
  days: WorkingHoursDay[];
}

/**
 * The behavioral config bag for a guild. Operationally critical fields
 * (enabled, mode, inbox/log channels, staff/admin roles) live as real columns;
 * everything else lives here and is parsed through the zod schema in core,
 * which fills defaults for any missing key (resilient to schema evolution).
 */
export interface GuildConfig {
  // appearance
  accentColor: string;
  successColor: string;
  errorColor: string;
  brandFooter: string;

  // ticket creation
  requireReason: boolean;
  confirmationEnabled: boolean;
  serverSelectEnabled: boolean;

  // greeting / lifecycle messages
  greetingEnabled: boolean;
  greetingMessage: MessageTemplate;
  closeMessageEnabled: boolean;
  closeMessage: MessageTemplate;
  blockedMessage: MessageTemplate;
  awayEnabled: boolean;
  awayMessage: MessageTemplate;
  receivedMessageEnabled: boolean; // confirm to user that staff received their msg

  // relay behaviour
  anonymousByDefault: boolean;
  showStaffNames: boolean;
  showStaffRoles: boolean;
  attachmentsEnabled: boolean;
  dmReplyPrefixUser: string;
  dmReplyPrefixStaff: string;
  dmReplyPrefixAnonymous: string;

  // channel / thread naming
  nameFormat: string;

  // automation
  autoCloseEnabled: boolean;
  autoCloseAfterMinutes: number;
  autoCloseSilent: boolean;
  closeOnLeave: boolean;
  deleteChannelAfterCloseSeconds: number;

  // anti-spam / gating
  cooldownSeconds: number;
  maxOpenTicketsPerUser: number;
  minAccountAgeMinutes: number;
  minGuildAgeMinutes: number;

  // pings
  pingRoleIds: string[];
  pingOnNewTicket: boolean;
  pingOnNewMessage: boolean;

  // misc
  locale: string;
  workingHours: WorkingHours;
}
