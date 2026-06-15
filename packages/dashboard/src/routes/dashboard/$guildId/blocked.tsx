import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Ban, Plus, ShieldOff } from "lucide-react";
import { listBlocked, blockUser, unblockUser } from "#/server/fns/blocked.ts";
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
import { relativeTime } from "#/lib/utils.ts";

export const Route = createFileRoute("/dashboard/$guildId/blocked")({
  loader: ({ params }) => listBlocked({ data: { guildId: params.guildId } }),
  component: BlockedPage,
});

type BlockedRow = Awaited<ReturnType<typeof listBlocked>>[number];

const durations = [
  { label: "Permanent", value: "" },
  { label: "1 hour", value: "60" },
  { label: "1 day", value: "1440" },
  { label: "7 days", value: "10080" },
  { label: "30 days", value: "43200" },
];

function BlockedPage() {
  const { guildId } = Route.useParams();
  const blocked = Route.useLoaderData();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState("");
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("");
  const [saving, setSaving] = useState(false);

  function openNew() {
    setUserId("");
    setReason("");
    setDuration("");
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    try {
      await blockUser({
        data: {
          guildId,
          userId: userId.trim(),
          reason: reason.trim() || undefined,
          durationMinutes: duration ? Number(duration) : undefined,
        },
      });
      toast.success("User blocked");
      setOpen(false);
      router.invalidate();
    } catch {
      toast.error("Couldn't block user");
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: BlockedRow) {
    if (!confirm(`Unblock user ${row.userId}?`)) return;
    try {
      await unblockUser({ data: { guildId, userId: row.userId } });
      toast.success("User unblocked");
      router.invalidate();
    } catch {
      toast.error("Couldn't unblock user");
    }
  }

  return (
    <div>
      <PageHeader
        title="Blocked users"
        description="Users who can't open new tickets. Blocks can be permanent or temporary."
        actions={
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" /> Block user
          </Button>
        }
      />
      <div className="px-8 py-6">
        {blocked.length === 0 ? (
          <EmptyState
            icon={<ShieldOff className="h-8 w-8" />}
            title="No blocked users"
            description="Block a user to stop them from opening new tickets."
            action={<Button onClick={openNew}>Block user</Button>}
          />
        ) : (
          <Card>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-faint">
                  <th className="px-5 py-3 font-medium">User</th>
                  <th className="px-5 py-3 font-medium">Reason</th>
                  <th className="px-5 py-3 font-medium">Blocked</th>
                  <th className="px-5 py-3 font-medium">Expires</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {blocked.map((row) => (
                  <tr key={row.userId} className="hover:bg-surface-2">
                    <td className="px-5 py-3 font-medium text-text">{row.userId}</td>
                    <td className="px-5 py-3 text-muted">{row.reason ?? "—"}</td>
                    <td className="px-5 py-3 text-muted">{relativeTime(row.createdAt)}</td>
                    <td className="px-5 py-3">
                      {row.expiresAt ? (
                        <Badge tone="warning">{relativeTime(row.expiresAt)}</Badge>
                      ) : (
                        <Badge tone="muted">Permanent</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button variant="ghost" size="sm" onClick={() => remove(row)}>
                        Unblock
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
        title="Block user"
        description="The user won't be able to open new tickets while blocked."
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} loading={saving} disabled={!userId.trim()}>
              <Ban className="h-4 w-4" /> Block
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="User ID" hint="The Discord ID of the user to block.">
            <Input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="123456789012345678"
              inputMode="numeric"
            />
          </Field>
          <Field label="Reason">
            <Input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Spamming the inbox"
            />
          </Field>
          <Field label="Duration">
            <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
              {durations.map((d) => (
                <option key={d.label} value={d.value}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Dialog>
    </div>
  );
}
