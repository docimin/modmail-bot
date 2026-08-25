import type { Priority } from "@modmail/core";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Search, Ticket } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { Badge, Button, Card, EmptyState, Input, Select, Spinner } from "#/components/ui/index.tsx";
import { relativeTime } from "#/lib/utils.ts";
import { listTickets } from "#/server/fns/tickets.ts";

export const Route = createFileRoute("/dashboard/$guildId/tickets/")({
  loader: ({ params }) =>
    listTickets({ data: { guildId: params.guildId, status: "open", pageSize: 25 } }),
  component: TicketsPage,
});

type StatusFilter = "open" | "closed" | "all";
type PriorityFilter = "all" | Priority;
type TicketList = Awaited<ReturnType<typeof listTickets>>;
type TicketRow = TicketList["items"][number];

const priorityTone: Record<Priority, "muted" | "accent" | "warning" | "danger"> = {
  low: "muted",
  normal: "accent",
  high: "warning",
  urgent: "danger",
};

const statusTone: Record<TicketRow["status"], "success" | "muted"> = {
  open: "success",
  closed: "muted",
};

function TicketsPage() {
  const { guildId } = Route.useParams();
  const initial = Route.useLoaderData();
  const [data, setData] = useState<TicketList>(initial);
  const [status, setStatus] = useState<StatusFilter>("open");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const pageCount = Math.max(Math.ceil(data.total / data.pageSize), 1);

  async function fetchTickets(opts?: {
    status?: StatusFilter;
    priority?: PriorityFilter;
    search?: string;
    page?: number;
  }) {
    const next = {
      status: opts?.status ?? status,
      priority: opts?.priority ?? priority,
      search: opts?.search ?? search,
      page: opts?.page ?? 1,
    };
    setLoading(true);
    try {
      const res = await listTickets({
        data: {
          guildId,
          status: next.status,
          priority: next.priority === "all" ? undefined : next.priority,
          search: next.search.trim() || undefined,
          page: next.page,
          pageSize: 25,
        },
      });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  function onStatusChange(value: StatusFilter) {
    setStatus(value);
    void fetchTickets({ status: value, page: 1 });
  }
  function onPriorityChange(value: PriorityFilter) {
    setPriority(value);
    void fetchTickets({ priority: value, page: 1 });
  }
  function onSearchSubmit() {
    void fetchTickets({ page: 1 });
  }
  function goToPage(page: number) {
    void fetchTickets({ page });
  }

  return (
    <div>
      <PageHeader title="Tickets" description="Browse and triage your modmail threads." />
      <div className="px-8 py-6">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as StatusFilter)}
            className="w-36"
          >
            <option value="open">Open</option>
            <option value="closed">Closed</option>
            <option value="all">All</option>
          </Select>
          <Select
            value={priority}
            onChange={(e) => onPriorityChange(e.target.value as PriorityFilter)}
            className="w-40"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </Select>
          <div className="relative flex-1 min-w-50">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearchSubmit();
              }}
              placeholder="Search by user, reason or subject…"
              className="pl-9"
            />
          </div>
          {loading && <Spinner />}
        </div>

        {data.items.length === 0 ? (
          <EmptyState
            icon={<Ticket className="h-8 w-8" />}
            title="No tickets found"
            description="Try a different status or search term."
          />
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {data.items.map((t) => (
                <li key={t.id}>
                  <Link
                    to="/dashboard/$guildId/tickets/$ticketId"
                    params={{ guildId, ticketId: t.id }}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-surface-2"
                  >
                    <Badge tone="muted">#{t.number}</Badge>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-text">
                        {t.subject ?? t.reason ?? "No reason given"}
                      </div>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
                        <span>User {t.userId}</span>
                        <span className="text-faint">·</span>
                        <span>{relativeTime(t.createdAt)}</span>
                        {t.category && (
                          <>
                            <span className="text-faint">·</span>
                            <span>{t.category.name}</span>
                          </>
                        )}
                        {t.tags.map(({ tag }) => (
                          <span
                            key={tag.id}
                            className="rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: `${tag.color ?? "#5865f2"}22`,
                              color: tag.color ?? "#9aa0a6",
                            }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <Badge tone={priorityTone[t.priority]}>{t.priority}</Badge>
                    <Badge tone={statusTone[t.status]}>{t.status}</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-muted">
          <span>
            {data.total} ticket{data.total === 1 ? "" : "s"}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={loading || data.page <= 1}
              onClick={() => goToPage(data.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </Button>
            <span className="px-1 text-xs text-faint">
              Page {data.page} of {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={loading || data.page >= pageCount}
              onClick={() => goToPage(data.page + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
