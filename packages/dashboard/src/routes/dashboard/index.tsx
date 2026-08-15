import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { CheckCircle2, CircleSlash, Plus, Settings2 } from "lucide-react";
import { Avatar, Badge, Button, EmptyState } from "#/components/ui/index.tsx";
import { getMyGuilds } from "#/server/fns/guilds.ts";
import { getPublicConfig } from "#/server/fns/public.ts";
import { getSession } from "#/server/fns/session.ts";

export const Route = createFileRoute("/dashboard/")({
  loader: async () => {
    const user = await getSession();
    if (!user) throw redirect({ to: "/login" });
    const [guilds, config] = await Promise.all([getMyGuilds(), getPublicConfig()]);
    return { user, guilds, config };
  },
  component: ServerSelector,
});

function ServerSelector() {
  const { guilds, config } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text">Your servers</h1>
          <p className="mt-1 text-sm text-muted">
            Servers you own or manage. Add the bot to set up modmail.
          </p>
        </div>
        <a href={config.inviteUrl} target="_blank" rel="noreferrer">
          <Button>
            <Plus className="h-4 w-4" /> Add to a server
          </Button>
        </a>
      </div>

      {guilds.length === 0 ? (
        <EmptyState
          title="No manageable servers found"
          description="You need the Manage Server permission in a Discord server to configure modmail there."
          action={
            <a href={config.inviteUrl} target="_blank" rel="noreferrer">
              <Button>Add the bot</Button>
            </a>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guilds.map((g) => (
            <div
              key={g.id}
              className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
            >
              <div className="flex items-center gap-3">
                {g.icon ? (
                  <Avatar src={g.icon} size={44} className="rounded-xl" />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface-3 font-semibold">
                    {g.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate font-semibold text-text">{g.name}</div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {g.botPresent ? (
                      g.enabled ? (
                        <Badge tone="success">
                          <CheckCircle2 className="h-3 w-3" /> Active
                        </Badge>
                      ) : (
                        <Badge tone="warning">
                          <CircleSlash className="h-3 w-3" /> Disabled
                        </Badge>
                      )
                    ) : (
                      <Badge tone="muted">Not added</Badge>
                    )}
                    {g.botPresent && !g.setupCompleted && <Badge tone="accent">Needs setup</Badge>}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {g.botPresent ? (
                  <Link to="/dashboard/$guildId" params={{ guildId: g.id }}>
                    <Button variant="secondary" className="w-full">
                      <Settings2 className="h-4 w-4" /> Manage
                    </Button>
                  </Link>
                ) : (
                  <a
                    href={`${config.inviteUrl}&guild_id=${g.id}&disable_guild_select=true`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button className="w-full">
                      <Plus className="h-4 w-4" /> Add bot
                    </Button>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
