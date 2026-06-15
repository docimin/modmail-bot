import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Pencil, Trash2, MessageSquareText } from "lucide-react";
import { listSnippets, saveSnippet, deleteSnippet } from "#/server/fns/snippets.ts";
import { PageHeader } from "#/components/AppShell.tsx";
import {
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Textarea,
} from "#/components/ui/index.tsx";
import { Dialog } from "#/components/ui/Dialog.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { relativeTime } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/$guildId/snippets")({
  loader: ({ params }) => listSnippets({ data: { guildId: params.guildId } }),
  component: SnippetsPage,
});

type SnippetRow = Awaited<ReturnType<typeof listSnippets>>[number];

function SnippetsPage() {
  const { guildId } = Route.useParams();
  const snippets = Route.useLoaderData();
  const router = useRouter();
  const [editing, setEditing] = useState<SnippetRow | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setEditing(null);
    setName("");
    setContent("");
    setOpen(true);
  }
  function openEdit(s: SnippetRow) {
    setEditing(s);
    setName(s.name);
    setContent(s.content);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await saveSnippet({ data: { guildId, name, content } });
      toast.success("Snippet saved");
      setOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't save snippet");
    } finally {
      setSaving(false);
    }
  }

  async function remove(s: SnippetRow) {
    if (!confirm(`Delete snippet "${s.name}"?`)) return;
    await deleteSnippet({ data: { guildId, id: s.id } });
    toast.success("Snippet deleted");
    router.invalidate();
  }

  return (
    <div>
      <PageHeader
        title="Snippets"
        description="Reusable replies your team can send with a slash command or a click."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New snippet
          </Button>
        }
      />
      <div className="px-8 py-6">
        {snippets.length === 0 ? (
          <EmptyState
            icon={<MessageSquareText className="h-8 w-8" />}
            title="No snippets yet"
            description="Create canned replies for common questions."
            action={<Button onClick={openNew}>New snippet</Button>}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {snippets.map((s) => (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="font-medium text-text">{s.name}</div>
                    <p className="mt-1 line-clamp-3 text-sm text-muted">{s.content}</p>
                    <div className="mt-2 text-xs text-faint">
                      {s.uses} uses · updated {relativeTime(s.updatedAt)}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(s)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? "Edit snippet" : "New snippet"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!name || !content}>Save</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name" hint="Letters, numbers, _ and - only.">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="greeting" disabled={!!editing} />
          </Field>
          <Field label="Content">
            <Textarea value={content} onChange={(e) => setContent(e.target.value)} rows={5} placeholder="Hi! Thanks for reaching out…" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
