import { createFileRoute, useRouter } from "@tanstack/react-router";
import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { ColorInput, MultiSelect, type Option } from "#/components/forms.tsx";
import { Dialog } from "#/components/ui/Dialog.tsx";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
  Switch,
} from "#/components/ui/index.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { deleteCategory, listCategories, saveCategory } from "#/server/fns/categories.ts";
import { getChannels, getRoles } from "#/server/fns/lookups.ts";

export const Route = createFileRoute("/dashboard/$guildId/categories")({
  loader: async ({ params }) => {
    const [categories, roles, channels] = await Promise.all([
      listCategories({ data: { guildId: params.guildId } }),
      getRoles({ data: { guildId: params.guildId } }),
      getChannels({ data: { guildId: params.guildId } }),
    ]);
    return { categories, roles, channels };
  },
  component: CategoriesPage,
});

type CategoryRow = Awaited<ReturnType<typeof listCategories>>[number];

function CategoriesPage() {
  const { guildId } = Route.useParams();
  const { categories, roles, channels } = Route.useLoaderData();
  const router = useRouter();

  const [editing, setEditing] = useState<CategoryRow | null>(null);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [color, setColor] = useState("#5865f2");
  const [staffRoleIds, setStaffRoleIds] = useState<string[]>([]);
  const [inboxChannelId, setInboxChannelId] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const roleOptions: Option[] = roles.map((r) => ({ value: r.id, label: r.name }));
  const textChannels = channels.filter((c) => c.type === 0);

  function openNew() {
    setEditing(null);
    setName("");
    setDescription("");
    setEmoji("");
    setColor("#5865f2");
    setStaffRoleIds([]);
    setInboxChannelId("");
    setEnabled(true);
    setOpen(true);
  }
  function openEdit(c: CategoryRow) {
    setEditing(c);
    setName(c.name);
    setDescription(c.description ?? "");
    setEmoji(c.emoji ?? "");
    setColor(c.color ?? "#5865f2");
    setStaffRoleIds(c.staffRoleIds ?? []);
    setInboxChannelId(c.inboxChannelId ?? "");
    setEnabled(c.enabled);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await saveCategory({
        data: {
          guildId,
          id: editing?.id,
          name,
          description: description || undefined,
          emoji: emoji || undefined,
          color: color || undefined,
          staffRoleIds,
          inboxChannelId: inboxChannelId || null,
          enabled,
        },
      });
      toast.success("Category saved");
      setOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't save category");
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: CategoryRow) {
    if (!confirm(`Delete category "${c.name}"?`)) return;
    try {
      await deleteCategory({ data: { guildId, id: c.id } });
      toast.success("Category deleted");
      router.invalidate();
    } catch {
      toast.error("Couldn't delete category");
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Route incoming tickets to the right team with custom categories."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> New category
          </Button>
        }
      />
      <div className="px-8 py-6">
        {categories.length === 0 ? (
          <EmptyState
            icon={<FolderTree className="h-8 w-8" />}
            title="No categories yet"
            description="Categories let users pick what their ticket is about."
            action={<Button onClick={openNew}>New category</Button>}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {categories.map((c) => (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      {c.emoji && <span className="text-base">{c.emoji}</span>}
                      <span className="font-medium text-text">{c.name}</span>
                      <Badge tone={c.enabled ? "success" : "muted"}>
                        {c.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                    )}
                    <div className="mt-2 text-xs text-faint">
                      {c.staffRoleIds.length} staff role
                      {c.staffRoleIds.length === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(c)}>
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
        title={editing ? "Edit category" : "New category"}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save} loading={saving} disabled={!name}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Name">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Billing" />
          </Field>
          <Field label="Description">
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Questions about payments and invoices"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Emoji">
              <Input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="💳" />
            </Field>
            <Field label="Color">
              <ColorInput value={color} onChange={setColor} />
            </Field>
          </div>
          <Field label="Staff roles" hint="Who gets pinged for tickets in this category.">
            <MultiSelect options={roleOptions} value={staffRoleIds} onChange={setStaffRoleIds} />
          </Field>
          <Field label="Inbox channel" hint="Override the default inbox for this category.">
            <Select value={inboxChannelId} onChange={(e) => setInboxChannelId(e.target.value)}>
              <option value="">Use default inbox</option>
              {textChannels.map((c) => (
                <option key={c.id} value={c.id}>
                  #{c.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Enabled">
            <Switch checked={enabled} onChange={setEnabled} />
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
