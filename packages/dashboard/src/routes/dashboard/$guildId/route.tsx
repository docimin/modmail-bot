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

function GuildError({ error }: { error: Error }) {
  const upstream = error?.message === "UPSTREAM_UNAVAILABLE";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-4 text-center">
      <h1 className="text-xl font-semibold text-text">
        {upstream ? "Couldn't verify your access" : "No access to this server"}
      </h1>
      <p className="max-w-md text-sm text-muted">
        {upstream
          ? "Discord didn't respond in time, so we couldn't check your permissions. This is usually temporary — try again in a moment."
          : "You need the Manage Server permission, or to be added as staff, to view this server's modmail."}
      </p>
      {upstream ? (
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      ) : (
        <Link to="/dashboard">
          <Button variant="outline">Back to servers</Button>
        </Link>
      )}
    </div>
  );
}
