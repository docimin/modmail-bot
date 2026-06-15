import { createFileRoute } from "@tanstack/react-router";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import {
  Inbox,
  CheckCircle2,
  Layers,
  Sun,
  Timer,
  MessageSquareText,
} from "lucide-react";
import { getAnalytics, getStats } from "#/server/fns/stats.ts";
import { PageHeader } from "#/components/AppShell.tsx";
import { Card } from "#/components/ui/index.tsx";

export const Route = createFileRoute("/dashboard/$guildId/analytics")({
  loader: async ({ params }) => {
    const [analytics, stats] = await Promise.all([
      getAnalytics({ data: { guildId: params.guildId } }),
      getStats({ data: { guildId: params.guildId } }),
    ]);
    return { analytics, stats };
  },
  component: Analytics,
});

const priorityColors: Record<string, string> = {
  low: "#9aa0a6",
  normal: "#5865f2",
  high: "#faa61a",
  urgent: "#ed4245",
};

const axisStyle = { fontSize: 12, fill: "#868d9e" };
const tooltipStyle = {
  contentStyle: {
    background: "#1e2330",
    border: "1px solid #262c39",
    borderRadius: 8,
    fontSize: 12,
  },
  labelStyle: { color: "#868d9e" },
  itemStyle: { color: "#dfe1e5" },
};

function Analytics() {
  const { analytics, stats } = Route.useLoaderData();

  return (
    <div>
      <PageHeader title="Analytics" description="Trends and breakdowns for your modmail inbox." />
      <div className="space-y-6 px-8 py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Stat icon={<Layers className="h-5 w-5" />} label="Total tickets" value={stats.total} tone="default" />
          <Stat icon={<Inbox className="h-5 w-5" />} label="Open" value={stats.open} tone="accent" />
          <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Closed" value={stats.closed} tone="success" />
          <Stat icon={<Sun className="h-5 w-5" />} label="Today" value={stats.today} tone="warning" />
          <Stat
            icon={<Timer className="h-5 w-5" />}
            label="Avg. first response"
            value={stats.avgFirstResponseMinutes === null ? "—" : `${stats.avgFirstResponseMinutes}m`}
            tone="default"
          />
          <Stat icon={<MessageSquareText className="h-5 w-5" />} label="Snippets" value={stats.snippets} tone="default" />
        </div>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-text">Tickets opened (30 days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={analytics.daily} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="ticketsArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5865f2" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#5865f2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#262c39" vertical={false} />
              <XAxis dataKey="day" tick={axisStyle} stroke="#262c39" tickLine={false} />
              <YAxis allowDecimals={false} tick={axisStyle} stroke="#262c39" tickLine={false} />
              <Tooltip {...tooltipStyle} />
              <Area
                type="monotone"
                dataKey="c"
                name="Tickets"
                stroke="#5865f2"
                strokeWidth={2}
                fill="url(#ticketsArea)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-text">By priority</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={analytics.byPriority} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#262c39" vertical={false} />
              <XAxis dataKey="priority" tick={axisStyle} stroke="#262c39" tickLine={false} />
              <YAxis allowDecimals={false} tick={axisStyle} stroke="#262c39" tickLine={false} />
              <Tooltip {...tooltipStyle} cursor={{ fill: "#262c3955" }} />
              <Bar dataKey="c" name="Tickets" radius={[4, 4, 0, 0]}>
                {analytics.byPriority.map((row) => (
                  <Cell key={row.priority} fill={priorityColors[row.priority] ?? "#5865f2"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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
  tone: "accent" | "success" | "danger" | "warning" | "default";
}) {
  const tones = {
    accent: "text-accent bg-accent/15",
    success: "text-success bg-success/15",
    danger: "text-danger bg-danger/15",
    warning: "text-warning bg-warning/15",
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
