import type { ResolvedAccess } from "@modmail/core";
import type { Database, Ticket } from "@modmail/db";
import type {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  Client,
  MessageComponentInteraction,
  ModalSubmitInteraction,
  RESTPostAPIApplicationCommandsJSONBody,
} from "discord.js";
import type { Logger } from "./logger.ts";
import type { DMRouter } from "./modmail/DMRouter.ts";
import type { TicketService } from "./modmail/TicketService.ts";
import type { ResolvedSettings, SettingsService } from "./settings/service.ts";

export interface Services {
  client: Client;
  db: Database;
  logger: Logger;
  settings: SettingsService;
  tickets: TicketService;
  dm: DMRouter;
  commands: Map<string, BotCommand>;
}

export type CommandAccess = "everyone" | "staff" | "admin";

export interface CommandContext {
  interaction: ChatInputCommandInteraction;
  services: Services;
  settings: ResolvedSettings;
  access: ResolvedAccess;
  /** the ticket whose channel this command was run in, if any */
  ticket: Ticket | null;
}

export interface BotCommand {
  data: { toJSON(): RESTPostAPIApplicationCommandsJSONBody };
  /** required access level; default "staff" */
  access?: CommandAccess;
  /** only usable inside a ticket channel; default false */
  inTicketOnly?: boolean;
  autocomplete?(interaction: AutocompleteInteraction, services: Services): Promise<void>;
  execute(ctx: CommandContext): Promise<void>;
}

export interface ComponentHandler {
  /** customId prefix this handler claims (e.g. "dm:") */
  prefix: string;
  handle(interaction: MessageComponentInteraction, services: Services): Promise<void>;
}

export interface ModalHandler {
  prefix: string;
  handle(interaction: ModalSubmitInteraction, services: Services): Promise<void>;
}
