import { createFileRoute, getRouteApi, Link } from "@tanstack/react-router";
import {
  Inbox,
  CheckCircle2,
  Ban,
  Timer,
  ArrowRight,
  Rocket,
} from "lucide-react";
import { getStats } from "#/server/fns/stats.ts";
import { listTickets } from "#/server/fns/tickets.ts";
import { PageHeader } from "#/components/AppShell.tsx";
import { Badge, Button, Card } from "#/components/ui/index.tsx";
import { relativeTime } from "#/lib/utils.ts";

const guildRoute = getRouteApi("/dashboard/$guildId");

export const Route = createFileRoute("/dashboard/$guildId/")({
  loader: async ({ params }) => {
    const [stats, recent] = await Promise.all([
      getStats({ data: { guildId: params.guildId } }),
      listTickets({ data: { guildId: params.guildId, status: "open", pageSize: 6 } }),
    ]);
    return { stats, recent };
  },
  component: Overview,
});

function Overview() {
  const { guildId } = Route.useParams();
  const { stats, recent } = Route.useLoaderData();
  const { ctx } = guildRoute.useLoaderData();

  return (
    <div>
      <PageHeader title="Overview" description="A snapshot of your modmail activity." />
      <div className="space-y-6 px-8 py-6">
        {!ctx.setupCompleted && (
          <div className="flex items-center justify-between rounded-[var(--radius-card)] border border-accent/40 bg-accent/10 px-5 py-4">
            <div className="flex items-center gap-3">
              <Rocket className="h-5 w-5 text-accent" />
              <div>
                <div className="font-medium text-text">Finish setting up modmail</div>
                <div className="text-sm text-muted">Pick an inbox channel and enable the bot to start receiving tickets.</div>
              </div>
            </div>
            <Link to="/dashboard/$guildId/settings" params={{ guildId }}>
              <Button size="sm">Set up</Button>
            </Link>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={<Inbox className="h-5 w-5" />} label="Open tickets" value={stats.open} tone="accent" />
          <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Closed" value={stats.closed} tone="success" />
          <Stat
            icon={<Timer className="h-5 w-5" />}
            label="Avg. first response"
            value={stats.avgFirstResponseMinutes === null ? "—" : `${stats.avgFirstResponseMinutes}m`}
            tone="default"
          />
          <Stat icon={<Ban className="h-5 w-5" />} label="Blocked users" value={stats.blocked} tone="danger" />
        </div>

        <Card>
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold text-text">Open tickets</h3>
            <Link to="/dashboard/$guildId/tickets" params={{ guildId }} className="text-sm text-accent hover:underline">
              View all
            </Link>
          </div>
          {recent.items.length === 0 ? (
            <div className="px-5 py-10 text-center text-sm text-muted">No open tickets right now. 🎉</div>
          ) : (
            <ul className="divide-y divide-border">
              {recent.items.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/dashboard/$guildId/tickets/$ticketId"
                    params={{ guildId, ticketId: t.id }}
                    className="flex items-center justify-between px-5 py-3 hover:bg-surface-2"
                  >
                    <div className="flex items-center gap-3">
                      <Badge tone="muted">#{t.number}</Badge>
                      <div>
                        <div className="text-sm font-medium text-text">{t.reason ?? "No reason given"}</div>
                        <div className="text-xs text-muted">User {t.userId} · {relativeTime(t.createdAt)}</div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-faint" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  tone: "accent" | "success" | "danger" | "default";
}) {
  const tones = {
    accent: "text-accent bg-accent/15",
    success: "text-success bg-success/15",
    danger: "text-danger bg-danger/15",
    default: "text-muted bg-surface-3",
  };
  return (
    <Card className="p-5">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${tones[tone]}`}>{icon}</div>
        <div>
          <div className="text-2xl font-bold text-text">{value}</div>
          <div className="text-xs text-muted">{label}</div>
        </div>
      </div>
    </Card>
  );
}
