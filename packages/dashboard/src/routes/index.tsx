import { createFileRoute, Link } from "@tanstack/react-router";
import { GitBranch, Inbox, LayoutDashboard, MessagesSquare, ShieldCheck, Zap } from "lucide-react";
import { Button } from "#/components/ui/index.tsx";
import { loginWithDiscord } from "#/lib/auth-client.ts";
import { getPublicConfig } from "#/server/fns/public.ts";
import { getSession } from "#/server/fns/session.ts";

export const Route = createFileRoute("/")({
  loader: async () => {
    const [config, user] = await Promise.all([getPublicConfig(), getSession()]);
    return { config, user };
  },
  component: Landing,
});

const FEATURES = [
  {
    icon: Inbox,
    title: "Thread or channel inbox",
    desc: "Every DM becomes a private staff thread (or channel). Reply, edit, and close from Discord or the web.",
  },
  {
    icon: MessagesSquare,
    title: "Snippets & canned replies",
    desc: "Save common answers and fire them off with a slash command or one click in the dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Blocks, cooldowns & gating",
    desc: "Stop spam with per-user blocks, cooldowns, minimum account age and confirmation prompts.",
  },
  {
    icon: Zap,
    title: "Automation",
    desc: "Auto-close inactive tickets, schedule closes, ping roles, and route by category.",
  },
  {
    icon: LayoutDashboard,
    title: "Feature-rich dashboard",
    desc: "Manage tickets, settings, categories, tags, staff and analytics from anywhere.",
  },
  {
    icon: GitBranch,
    title: "Multi-server",
    desc: "One bot, every server. Members pick which community they're contacting.",
  },
];

function Landing() {
  const { config, user } = Route.useLoaderData();

  return (
    <div className="min-h-screen bg-bg text-text">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white">
            <Inbox className="h-4 w-4" />
          </div>
          Modmail
        </div>
        <div className="flex items-center gap-3">
          <a href={config.inviteUrl} target="_blank" rel="noreferrer">
            <Button variant="outline" size="sm">
              Add to server
            </Button>
          </a>
          {user ? (
            <Link to="/dashboard">
              <Button size="sm">Open dashboard</Button>
            </Link>
          ) : (
            <Button size="sm" onClick={() => loginWithDiscord()}>
              Sign in
            </Button>
          )}
        </div>
      </header>

      <section className="relative mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-accent/20 blur-[120px]" />
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted">
          Modern, multi-server modmail for Discord
        </span>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-bold leading-tight tracking-tight">
          Talk to your community,
          <span className="text-accent"> one ticket at a time.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted">
          Members DM the bot, your team handles everything from a private inbox — set up entirely
          through slash commands or a full web dashboard.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <a href={config.inviteUrl} target="_blank" rel="noreferrer">
            <Button size="md">Add to your server</Button>
          </a>
          {user ? (
            <Link to="/dashboard">
              <Button variant="outline" size="md">
                Open dashboard
              </Button>
            </Link>
          ) : (
            <Button variant="outline" size="md" onClick={() => loginWithDiscord()}>
              Sign in with Discord
            </Button>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-[var(--radius-card)] border border-border bg-surface p-5"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <f.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Modmail · self-hosted Discord support
      </footer>
    </div>
  );
}
