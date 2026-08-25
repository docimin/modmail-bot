import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ScrollText } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { Badge, Button, Card, EmptyState, Spinner } from "#/components/ui/index.tsx";
import { relativeTime } from "#/lib/utils.ts";
import { listAudit } from "#/server/fns/audit.ts";

export const Route = createFileRoute("/dashboard/$guildId/audit")({
  loader: ({ params }) => listAudit({ data: { guildId: params.guildId } }),
  component: AuditPage,
});

type AuditResult = Awaited<ReturnType<typeof listAudit>>;
type AuditItem = AuditResult["items"][number];

function formatAction(action: string): string {
  return action.replace(/\./g, " ");
}

function AuditPage() {
  const { guildId } = Route.useParams();
  const initial = Route.useLoaderData();
  const [data, setData] = useState<AuditResult>(initial);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  async function goto(page: number) {
    if (page < 1 || page > totalPages || loading) return;
    setLoading(true);
    try {
      const res = await listAudit({ data: { guildId, page, pageSize: data.pageSize } });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Audit log"
        description="Every action taken across your modmail, by the bot and from this dashboard."
      />
      <div className="px-8 py-6">
        {data.items.length === 0 ? (
          <EmptyState
            icon={<ScrollText className="h-8 w-8" />}
            title="Nothing logged yet"
            description="Actions like opening tickets, editing settings and saving snippets will show up here."
          />
        ) : (
          <>
            <Card>
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-border px-5 py-2.5 text-xs font-medium uppercase tracking-wide text-faint sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
                <span>Action</span>
                <span className="hidden sm:block">Actor</span>
                <span className="hidden sm:block">Target</span>
                <span className="hidden sm:block">Source</span>
                <span className="text-right">When</span>
              </div>
              <ul className="divide-y divide-border">
                {data.items.map((item) => (
                  <AuditRow key={item.id} item={item} />
                ))}
              </ul>
            </Card>

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted">
                Page {data.page} of {totalPages} · {data.total} entries
                {loading && <Spinner className="h-4 w-4" />}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goto(data.page - 1)}
                  disabled={loading || data.page <= 1}
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goto(data.page + 1)}
                  disabled={loading || data.page >= totalPages}
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function AuditRow({ item }: { item: AuditItem }) {
  const target = item.targetType
    ? `${item.targetType}${item.targetId ? ` #${item.targetId}` : ""}`
    : "—";
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-3 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-text">{formatAction(item.action)}</div>
        <div className="mt-0.5 truncate text-xs text-muted sm:hidden">
          {item.actorId} · {target} · {relativeTime(item.createdAt)}
        </div>
      </div>
      <div className="hidden truncate text-sm text-muted sm:block">{item.actorId}</div>
      <div className="hidden truncate text-sm text-muted sm:block">{target}</div>
      <div className="hidden sm:block">
        <Badge tone={item.source === "dashboard" ? "accent" : "muted"}>{item.source}</Badge>
      </div>
      <div className="text-right text-xs text-faint">{relativeTime(item.createdAt)}</div>
    </li>
  );
}
