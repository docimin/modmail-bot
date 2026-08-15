import { and, eq, isNull, lt, lte, or, schema, sql } from "@modmail/db";
import type { Services } from "../framework.ts";

const INTERVAL_MS = 60_000;

export function startScheduler(services: Services): void {
  const run = () =>
    void tick(services).catch((err) => services.logger.error({ err }, "scheduler tick failed"));
  setInterval(run, INTERVAL_MS).unref?.();
  run();
}

async function tick(services: Services): Promise<void> {
  await runDueTasks(services);
  await autoCloseInactive(services);
  await expireBlocks(services);
}

async function runDueTasks(services: Services): Promise<void> {
  const { db } = services;
  const due = await db.query.scheduledTasks.findMany({
    where: lte(schema.scheduledTasks.runAt, new Date()),
    limit: 50,
  });
  for (const task of due) {
    try {
      if (task.type === "close_ticket" && task.ticketId) {
        const ticket = await db.query.tickets.findFirst({
          where: eq(schema.tickets.id, task.ticketId),
        });
        if (ticket && ticket.status === "open")
          await services.tickets.close(ticket, {
            byId: task.createdById ?? services.client.user!.id,
            reason: (task.payload.reason as string) ?? "Scheduled close",
            silent: Boolean(task.payload.silent),
          });
      } else if (task.type === "unblock_user") {
        const userId = task.payload.userId as string | undefined;
        if (userId)
          await db
            .delete(schema.blockedUsers)
            .where(
              and(
                eq(schema.blockedUsers.guildId, task.guildId),
                eq(schema.blockedUsers.userId, userId),
              ),
            );
      }
    } catch (err) {
      services.logger.error({ err, taskId: task.id }, "scheduled task failed");
    } finally {
      await db.delete(schema.scheduledTasks).where(eq(schema.scheduledTasks.id, task.id));
    }
  }
}

async function autoCloseInactive(services: Services): Promise<void> {
  const { db } = services;
  const settingsRows = await db.query.guildSettings.findMany({
    where: eq(schema.guildSettings.enabled, true),
  });

  for (const row of settingsRows) {
    const cfg = row.config;
    if (!cfg?.autoCloseEnabled || !cfg.autoCloseAfterMinutes) continue;
    const cutoff = new Date(Date.now() - cfg.autoCloseAfterMinutes * 60_000);

    const stale = await db.query.tickets.findMany({
      where: and(
        eq(schema.tickets.guildId, row.guildId),
        eq(schema.tickets.status, "open"),
        or(
          and(isNull(schema.tickets.lastUserMessageAt), lt(schema.tickets.createdAt, cutoff)),
          lt(schema.tickets.lastUserMessageAt, cutoff),
        ),
      ),
      limit: 25,
    });

    for (const ticket of stale) {
      await services.tickets
        .close(ticket, {
          byId: services.client.user!.id,
          reason: "Auto-closed due to inactivity",
          silent: cfg.autoCloseSilent,
        })
        .catch((err) => services.logger.error({ err }, "auto-close failed"));
    }
  }
}

async function expireBlocks(services: Services): Promise<void> {
  await services.db
    .delete(schema.blockedUsers)
    .where(
      and(
        sql`${schema.blockedUsers.expiresAt} is not null`,
        lt(schema.blockedUsers.expiresAt, new Date()),
      ),
    )
    .catch(() => null);
}
