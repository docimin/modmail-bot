import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Plus, Trash2, Users } from "lucide-react";
import { listStaff, addStaff, removeStaff } from "#/server/fns/staff.ts";
import { PageHeader } from "#/components/AppShell.tsx";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  Field,
  Input,
  Select,
} from "#/components/ui/index.tsx";
import { Dialog } from "#/components/ui/Dialog.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { formatDateTime } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/$guildId/staff")({
  loader: ({ params }) => listStaff({ data: { guildId: params.guildId } }),
  component: StaffPage,
});

type StaffRow = Awaited<ReturnType<typeof listStaff>>[number];

function StaffPage() {
  const { guildId } = Route.useParams();
  const staff = Route.useLoaderData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setUserId("");
    setRole("staff");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await addStaff({ data: { guildId, userId, role } });
      toast.success("Staff member added");
      setOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't add staff member");
    } finally {
      setSaving(false);
    }
  }

  async function remove(s: StaffRow) {
    if (!confirm(`Remove ${s.userId} from dashboard access?`)) return;
    try {
      await removeStaff({ data: { guildId, userId: s.userId } });
      toast.success("Staff member removed");
      router.invalidate();
    } catch {
      toast.error("Couldn't remove staff member");
    }
  }

  return (
    <div>
      <PageHeader
        title="Staff access"
        description="Grant dashboard access to members who don't have Manage Server. Discord admins always have access."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Add staff
          </Button>
        }
      />
      <div className="px-8 py-6">
        {staff.length === 0 ? (
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No extra staff yet"
            description="Add members who should reach this dashboard without the Manage Server permission."
            action={<Button onClick={openNew}>Add staff</Button>}
          />
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-muted">
                  <th className="px-5 py-3 font-medium">User ID</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Added by</th>
                  <th className="px-5 py-3 font-medium">Added</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {staff.map((s) => (
                  <tr key={s.userId}>
                    <td className="px-5 py-3 font-medium text-text">{s.userId}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.role === "admin" ? "accent" : "muted"}>{s.role}</Badge>
                    </td>
                    <td className="px-5 py-3 text-muted">{s.addedById ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{formatDateTime(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="icon" onClick={() => remove(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Add staff"
        description="Enter a Discord user ID to grant them dashboard access."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!userId}>Add</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="User ID" hint="The member's Discord user ID.">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="123456789012345678"
            />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as "staff" | "admin")}>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </Select>
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
