import type { MessageTemplate } from "@modmail/db";

// Variables available: ${user}, ${server}, ${reason}, ${ticketId}, ${staff}, etc.
// See messages.ts for the substitution engine.

export const DEFAULT_GREETING: MessageTemplate = {
  embeds: [
    {
      title: "Ticket created",
      description:
        "Thanks for reaching out to **${server}**! Our staff team has been notified and will get back to you as soon as possible.\n\nSimply reply here to send a message.",
      color: "#5865f2",
    },
  ],
};

export const DEFAULT_CLOSE_MESSAGE: MessageTemplate = {
  embeds: [
    {
      title: "Ticket closed",
      description:
        "Your ticket in **${server}** has been closed. Feel free to message again to open a new one.",
      color: "#ed4245",
    },
  ],
};

export const DEFAULT_BLOCKED_MESSAGE: MessageTemplate = {
  embeds: [
    {
      title: "You are blocked",
      description: "You are currently blocked from creating tickets in **${server}**.",
      color: "#ed4245",
    },
  ],
};

export const DEFAULT_AWAY_MESSAGE: MessageTemplate = {
  embeds: [
    {
      title: "We're currently away",
      description:
        "Our team is outside of working hours right now. Your message has been received and we'll respond when we're back.",
      color: "#faa61a",
    },
  ],
};

export const DEFAULT_CONFIRMATION_MESSAGE: MessageTemplate = {
  embeds: [
    {
      title: "Open a ticket?",
      description: "Do you want to open a support ticket in **${server}**?",
      color: "#5865f2",
    },
  ],
};
