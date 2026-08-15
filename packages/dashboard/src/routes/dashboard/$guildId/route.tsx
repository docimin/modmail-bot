import { createFileRoute, Link, Outlet, redirect } from "@tanstack/react-router";
import { AppShell } from "#/components/AppShell.tsx";
import { Button } from "#/components/ui/index.tsx";
import { getGuildContext } from "#/server/fns/guilds.ts";
import { getSession } from "#/server/fns/session.ts";

export const Route = createFileRoute("/dashboard/$guildId")({
  loader: async ({ params }) => {
    const user = await getSession();
    if (!user) throw redirect({ to: "/login" });
    const ctx = await getGuildContext({ data: { guildId: params.guildId } });
    return { user, ctx };
  },
  component: GuildLayout,
  errorComponent: GuildError,
});

function GuildLayout() {
  const { user, ctx } = Route.useLoaderData();
  return (
    <AppShell guild={{ id: ctx.guildId, name: ctx.name, icon: ctx.icon }} user={user}>
      <Outlet />
    </AppShell>
  );
}

function GuildError() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <h1 className="text-xl font-semibold text-text">No access to this server</h1>
      <p className="max-w-md text-sm text-muted">
        You need the Manage Server permission, or to be added as staff, to view this server's
        modmail.
      </p>
      <Link to="/dashboard">
        <Button variant="outline">Back to servers</Button>
      </Link>
    </div>
  );
}
