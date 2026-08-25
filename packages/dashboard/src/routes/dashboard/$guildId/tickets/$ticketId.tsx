import { PRIORITIES, type Priority } from "@modmail/core";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowLeft,
  Clock,
  Lock,
  Paperclip,
  Send,
  StickyNote,
  UserX,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { MultiSelect, type Option } from "#/components/forms.tsx";
import { Dialog } from "#/components/ui/Dialog.tsx";
import {
  Avatar,
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Label,
  Select,
  Switch,
  Textarea,
} from "#/components/ui/index.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { discordAvatar, formatDateTime, relativeTime } from "#/lib/utils.ts";
import { listSnippets } from "#/server/fns/snippets.ts";
import { listTags } from "#/server/fns/tags.ts";
import {
  addNote,
  assignTicket,
  closeTicket,
  getTicket,
  replyTicket,
  setPriority,
  setTicketTags,
} from "#/server/fns/tickets.ts";

export const Route = createFileRoute("/dashboard/$guildId/tickets/$ticketId")({
  loader: async ({ params }) => {
    const [data, snippets, tags] = await Promise.all([
      getTicket({ data: { guildId: params.guildId, ticketId: params.ticketId } }),
      listSnippets({ data: { guildId: params.guildId } }),
      listTags({ data: { guildId: params.guildId } }),
    ]);
    return { data, snippets, tags };
  },
  component: TicketDetail,
});

type TicketData = NonNullable<Awaited<ReturnType<typeof getTicket>>>;
type TicketMessage = TicketData["ticket"]["messages"][number];

function TicketDetail() {
  const { guildId } = Route.useParams();
  const { data, snippets, tags } = Route.useLoaderData();

  if (!data) {
    return (
      <div>
        <PageHeader
          title="Ticket not found"
          description="This ticket doesn't exist or you no longer have access to it."
          actions={
            <Link to="/dashboard/$guildId/tickets" params={{ guildId }}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4" /> Back to tickets
              </Button>
            </Link>
          }
        />
        <div className="px-8 py-6">
          <EmptyState
            icon={<UserX className="h-8 w-8" />}
            title="Nothing to show here"
            description="The ticket you're looking for may have been deleted."
          />
        </div>
      </div>
    );
  }

  return <TicketView guildId={guildId} data={data} snippets={snippets} tags={tags} />;
}

function TicketView({
  guildId,
  data,
  snippets,
  tags,
}: {
  guildId: string;
  data: TicketData;
  snippets: Awaited<ReturnType<typeof listSnippets>>;
  tags: Awaited<ReturnType<typeof listTags>>;
}) {
  const router = useRouter();
  const { ticket, member } = data;
  const closed = ticket.status === "closed";

  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [snippetId, setSnippetId] = useState("");
  const [noteMode, setNoteMode] = useState(false);
  const [sending, setSending] = useState(false);

  const [closeOpen, setCloseOpen] = useState(false);
  const [closeReason, setCloseReason] = useState("");
  const [silent, setSilent] = useState(false);
  const [closing, setClosing] = useState(false);

  const memberName = member?.displayName ?? member?.username ?? ticket.userId;
  const memberAvatar = member?.avatar ?? discordAvatar(ticket.userId, null);

  async function send() {
    if (!content.trim()) return;
    setSending(true);
    try {
      if (noteMode) {
        await addNote({ data: { guildId, ticketId: ticket.id, content } });
        toast.success("Internal note added");
      } else {
        await replyTicket({
          data: {
            guildId,
            ticketId: ticket.id,
            content,
            anonymous,
            snippetId: snippetId || undefined,
          },
        });
        toast.success("Reply sent");
      }
      setContent("");
      setSnippetId("");
      router.invalidate();
    } catch {
      toast.error(noteMode ? "Couldn't add note" : "Couldn't send reply");
    } finally {
      setSending(false);
    }
  }

  function applySnippet(id: string) {
    setSnippetId(id);
    const snippet = snippets.find((s) => s.id === id);
    if (snippet) setContent(snippet.content);
  }

  async function changePriority(priority: Priority) {
    try {
      await setPriority({ data: { guildId, ticketId: ticket.id, priority } });
      toast.success("Priority updated");
      router.invalidate();
    } catch {
      toast.error("Couldn't update priority");
    }
  }

  async function unassign() {
    try {
      await assignTicket({ data: { guildId, ticketId: ticket.id, staffId: null } });
      toast.success("Ticket unassigned");
      router.invalidate();
    } catch {
      toast.error("Couldn't unassign");
    }
  }

  async function changeTags(tagIds: string[]) {
    try {
      await setTicketTags({ data: { guildId, ticketId: ticket.id, tagIds } });
      router.invalidate();
    } catch {
      toast.error("Couldn't update tags");
    }
  }

  async function close() {
    setClosing(true);
    try {
      await closeTicket({
        data: { guildId, ticketId: ticket.id, reason: closeReason || undefined, silent },
      });
      toast.success("Ticket closed");
      setCloseOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't close ticket");
    } finally {
      setClosing(false);
    }
  }

  const tagOptions: Option[] = tags.map((t) => ({ value: t.id, label: t.name }));
  const selectedTagIds = ticket.tags.map((t) => t.tag.id);

  return (
    <div>
      <PageHeader
        title={`Ticket #${ticket.number}`}
        description={ticket.reason ?? "No reason given"}
        actions={
          <>
            <Badge tone={closed ? "muted" : "success"}>{closed ? "Closed" : "Open"}</Badge>
            <Link to="/dashboard/$guildId/tickets" params={{ guildId }}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </Link>
          </>
        }
      />

      <div className="flex gap-6 px-8 py-6">
        <div className="flex flex-1 flex-col">
          {closed && (
            <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-card)] border border-border bg-surface-2 px-5 py-4">
              <Lock className="mt-0.5 h-5 w-5 text-muted" />
              <div>
                <div className="font-medium text-text">This ticket is closed</div>
                <div className="text-sm text-muted">
                  {ticket.closeReason ?? "No reason was given."}
                  {ticket.closedAt && ` · ${relativeTime(ticket.closedAt)}`}
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {ticket.messages.length === 0 ? (
              <EmptyState
                title="No messages yet"
                description="The conversation will appear here."
              />
            ) : (
              ticket.messages.map((m) => <MessageBubble key={m.id} message={m} />)
            )}
          </div>

          <Card className="mt-4 p-4">
            <div className="mb-2 flex items-center gap-2">
              <Button
                variant={noteMode ? "ghost" : "secondary"}
                size="sm"
                onClick={() => setNoteMode(false)}
                disabled={closed}
              >
                <Send className="h-4 w-4" /> Reply
              </Button>
              <Button
                variant={noteMode ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setNoteMode(true)}
                disabled={closed}
              >
                <StickyNote className="h-4 w-4" /> Internal note
              </Button>
            </div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              disabled={closed}
              placeholder={
                noteMode ? "Write a private note for your team…" : "Write a reply to the user…"
              }
            />
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-4">
                {!noteMode && (
                  <>
                    <div className="flex items-center gap-2 text-sm text-muted">
                      <Switch checked={anonymous} onChange={setAnonymous} disabled={closed} />
                      Anonymous
                    </div>
                    <Select
                      value={snippetId}
                      onChange={(e) => applySnippet(e.target.value)}
                      disabled={closed || snippets.length === 0}
                      className="w-44"
                    >
                      <option value="">Insert snippet…</option>
                      {snippets.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </Select>
                  </>
                )}
              </div>
              <Button onClick={send} loading={sending} disabled={closed || !content.trim()}>
                {noteMode ? <StickyNote className="h-4 w-4" /> : <Send className="h-4 w-4" />}
                {noteMode ? "Add note" : "Send"}
              </Button>
            </div>
          </Card>
        </div>

        <aside className="w-80 shrink-0 space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar src={memberAvatar} size={44} />
              <div className="min-w-0">
                <div className="truncate font-medium text-text">{memberName}</div>
                <div className="truncate text-xs text-muted">{ticket.userId}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1.5 text-xs text-faint">
              {member?.joinedAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Joined {formatDateTime(member.joinedAt)}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" /> Opened {relativeTime(ticket.createdAt)}
              </div>
              {ticket.lastUserMessageAt && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> Last reply{" "}
                  {relativeTime(ticket.lastUserMessageAt)}
                </div>
              )}
            </div>
          </Card>

          <Card className="space-y-4 p-4">
            <Field label="Priority">
              <Select
                value={ticket.priority}
                onChange={(e) => changePriority(e.target.value as Priority)}
                disabled={closed}
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Category">
              <Badge tone="muted">{ticket.category?.name ?? "Uncategorized"}</Badge>
            </Field>

            <div>
              <Label>Assignee</Label>
              {ticket.assignedStaffId ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-text">{ticket.assignedStaffId}</span>
                  <Button variant="ghost" size="sm" onClick={unassign} disabled={closed}>
                    Unassign
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-faint">Unassigned</p>
              )}
            </div>

            <Field label="Tags">
              <MultiSelect
                options={tagOptions}
                value={selectedTagIds}
                onChange={changeTags}
                placeholder="Add tags…"
              />
            </Field>
          </Card>

          {!closed && (
            <Button variant="danger" className="w-full" onClick={() => setCloseOpen(true)}>
              <Lock className="h-4 w-4" /> Close ticket
            </Button>
          )}
        </aside>
      </div>

      <Dialog
        open={closeOpen}
        onClose={() => setCloseOpen(false)}
        title="Close ticket"
        description="The user will be notified unless you close silently."
        footer={
          <>
            <Button variant="ghost" onClick={() => setCloseOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={close} loading={closing}>
              Close ticket
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Reason" hint="Optional. Shown to the user unless silent.">
            <Textarea
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              rows={3}
              placeholder="Resolved, no further action needed…"
            />
          </Field>
          <div className="flex items-center gap-2 text-sm text-muted">
            <Switch checked={silent} onChange={setSilent} />
            Close silently (don't notify the user)
          </div>
        </div>
      </Dialog>
    </div>
  );
}

function MessageBubble({ message }: { message: TicketMessage }) {
  const time = relativeTime(message.createdAt);

  if (message.type === "system") {
    return (
      <div className="py-1 text-center text-xs text-faint">
        {message.content} · {time}
      </div>
    );
  }

  if (message.type === "internal") {
    return (
      <div className="rounded-[var(--radius-card)] border border-warning/40 bg-warning/10 px-4 py-3">
        <div className="mb-1 flex items-center gap-2 text-xs font-medium text-warning">
          <AlertTriangle className="h-3.5 w-3.5" /> Internal note
          <span className="ml-auto font-normal text-faint">{time}</span>
        </div>
        <Content message={message} />
      </div>
    );
  }

  const isStaff = message.type === "staff";

  return (
    <div className={isStaff ? "flex justify-end" : "flex justify-start"}>
      <div className={`flex max-w-[80%] gap-2 ${isStaff ? "flex-row-reverse" : "flex-row"}`}>
        {!isStaff && (
          <Avatar src={message.authorAvatar ?? undefined} size={32} className="mt-0.5" />
        )}
        <div className="min-w-0">
          <div
            className={`mb-1 flex items-center gap-2 text-xs text-faint ${isStaff ? "justify-end" : ""}`}
          >
            <span className="font-medium text-muted">
              {isStaff ? (message.anonymous ? "Staff" : message.authorTag) : message.authorTag}
            </span>
            {isStaff && message.anonymous && <Badge tone="muted">Anonymous</Badge>}
            <span>{time}</span>
          </div>
          <div
            className={`rounded-[var(--radius-card)] px-4 py-2 text-sm ${
              isStaff ? "bg-accent/15 text-text" : "bg-surface-2 text-text"
            }`}
          >
            <Content message={message} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Content({ message }: { message: TicketMessage }) {
  if (message.deleted) {
    return <p className="text-sm italic text-faint">Message deleted</p>;
  }
  return (
    <div>
      <p className="whitespace-pre-wrap break-words">{message.content}</p>
      {message.edited && <span className="text-xs text-faint">(edited)</span>}
      {message.attachments.length > 0 && (
        <div className="mt-2 space-y-1">
          {message.attachments.map((a) => (
            <a
              key={a.url}
              href={a.url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-accent hover:underline"
            >
              <Paperclip className="h-3.5 w-3.5" /> {a.name}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
