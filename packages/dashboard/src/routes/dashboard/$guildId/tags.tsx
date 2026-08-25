import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Tag as TagIcon, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { ColorInput } from "#/components/forms.tsx";
import { Dialog } from "#/components/ui/Dialog.tsx";
import { Button, EmptyState, Field, Input } from "#/components/ui/index.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { createTag, deleteTag, listTags } from "#/server/fns/tags.ts";

export const Route = createFileRoute("/dashboard/$guildId/tags")({
  loader: ({ params }) => listTags({ data: { guildId: params.guildId } }),
  component: TagsPage,
});

type TagRow = Awaited<ReturnType<typeof listTags>>[number];

const DEFAULT_COLOR = "#5865f2";

function TagsPage() {
  const { guildId } = Route.useParams();
  const tags = Route.useLoaderData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [emoji, setEmoji] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setName("");
    setColor(DEFAULT_COLOR);
    setEmoji("");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await createTag({
        data: { guildId, name, color, emoji: emoji || undefined },
      });
      toast.success("Tag created");
      setOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't create tag");
    } finally {
      setSaving(false);
    }
  }

  async function remove(t: TagRow) {
    if (!confirm(`Delete tag "${t.name}"?`)) return;
    try {
      await deleteTag({ data: { guildId, id: t.id } });
      toast.success("Tag deleted");
      router.invalidate();
    } catch {
      toast.error("Couldn't delete tag");
    }
  }

  return (
    <div>
      <PageHeader
        title="Tags"
        description="Label tickets so your team can sort and filter conversations."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New tag
          </Button>
        }
      />
      <div className="px-8 py-6">
        {tags.length === 0 ? (
          <EmptyState
            icon={<TagIcon className="h-8 w-8" />}
            title="No tags yet"
            description="Create tags to categorize your tickets."
            action={<Button onClick={openNew}>New tag</Button>}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => {
              const dot = t.color ?? DEFAULT_COLOR;
              return (
                <div
                  key={t.id}
                  className="group flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-text"
                >
                  {t.emoji ? (
                    <span className="text-base leading-none">{t.emoji}</span>
                  ) : (
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: dot }}
                    />
                  )}
                  <span className="font-medium">{t.name}</span>
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    className="text-faint opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                    aria-label={`Delete ${t.name}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="New tag"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving} disabled={!name}>
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="billing" />
          </Field>
          <Field label="Color">
            <ColorInput value={color} onChange={setColor} />
          </Field>
          <Field label="Emoji" hint="Optional. Shown instead of the color dot.">
            <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="💸" />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
