import { missingToEnable } from "@modmail/core";
import type { GuildConfig } from "@modmail/db";
import { createFileRoute, getRouteApi, useRouter } from "@tanstack/react-router";
import { AlertTriangle, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { PageHeader } from "#/components/AppShell.tsx";
import { ColorInput, MultiSelect, type Option } from "#/components/forms.tsx";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Field,
  Input,
  Select,
  Switch,
  Textarea,
} from "#/components/ui/index.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { getChannels, getRoles } from "#/server/fns/lookups.ts";
import { updateSettings } from "#/server/fns/settings.ts";

const guildRoute = getRouteApi("/dashboard/$guildId");

const MESSAGE_CHANNEL_TYPES = new Set([0, 5, 15]);
const CATEGORY_CHANNEL_TYPE = 4;

export const Route = createFileRoute("/dashboard/$guildId/settings")({
  loader: async ({ params }) => {
    const [channels, roles] = await Promise.all([
      getChannels({ data: { guildId: params.guildId } }),
      getRoles({ data: { guildId: params.guildId } }),
    ]);
    return { channels, roles };
  },
  component: SettingsPage,
});

type Mode = "threads" | "channels";

interface TopLevel {
  enabled: boolean;
  mode: Mode;
  inboxChannelId: string | null;
  logChannelId: string | null;
  transcriptChannelId: string | null;
  fallbackCategoryId: string | null;
  staffRoleIds: string[];
  adminRoleIds: string[];
}

function embedText(t: { embeds?: { description?: string }[] }): string {
  const first = t.embeds?.[0];
  return first?.description ?? "";
}

function SettingsPage() {
  const { guildId } = Route.useParams();
  const { channels, roles } = Route.useLoaderData();
  const { ctx } = guildRoute.useLoaderData();
  const router = useRouter();

  const [top, setTop] = useState<TopLevel>(() => ({
    enabled: ctx.enabled,
    mode: ctx.mode,
    inboxChannelId: ctx.inboxChannelId,
    logChannelId: ctx.logChannelId,
    transcriptChannelId: ctx.transcriptChannelId,
    fallbackCategoryId: ctx.fallbackCategoryId,
    staffRoleIds: ctx.staffRoleIds,
    adminRoleIds: ctx.adminRoleIds,
  }));
  const [config, setConfig] = useState<GuildConfig>(ctx.config);
  const [greeting, setGreeting] = useState(() => embedText(ctx.config.greetingMessage));
  const [closeText, setCloseText] = useState(() => embedText(ctx.config.closeMessage));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTop({
      enabled: ctx.enabled,
      mode: ctx.mode,
      inboxChannelId: ctx.inboxChannelId,
      logChannelId: ctx.logChannelId,
      transcriptChannelId: ctx.transcriptChannelId,
      fallbackCategoryId: ctx.fallbackCategoryId,
      staffRoleIds: ctx.staffRoleIds,
      adminRoleIds: ctx.adminRoleIds,
    });
    setConfig(ctx.config);
    setGreeting(embedText(ctx.config.greetingMessage));
    setCloseText(embedText(ctx.config.closeMessage));
  }, [ctx]);

  const messageChannelOpts: Option[] = channels
    .filter((c) => MESSAGE_CHANNEL_TYPES.has(c.type))
    .map((c) => ({ value: c.id, label: `#${c.name}` }));
  const categoryOpts: Option[] = channels
    .filter((c) => c.type === CATEGORY_CHANNEL_TYPE)
    .map((c) => ({ value: c.id, label: c.name }));
  const roleOpts: Option[] = roles
    .filter((r) => !r.managed)
    .map((r) => ({ value: r.id, label: r.name }));

  function setCfg<K extends keyof GuildConfig>(key: K, value: GuildConfig[K]) {
    setConfig((c) => ({ ...c, [key]: value }));
  }

  const missing = missingToEnable({
    mode: top.mode,
    inboxChannelId: top.inboxChannelId,
    fallbackCategoryId: top.fallbackCategoryId,
  });
  const blocked = top.enabled && missing.length > 0;

  async function save() {
    setSaving(true);
    try {
      const fullConfig: GuildConfig = {
        ...config,
        greetingMessage: { embeds: [{ description: greeting, color: config.accentColor }] },
        closeMessage: { embeds: [{ description: closeText, color: config.accentColor }] },
      };
      await updateSettings({ data: { guildId, update: { ...top, config: fullConfig } } });
      toast.success("Settings saved");
      router.invalidate();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure how modmail behaves in this server."
        actions={
          <Button onClick={save} loading={saving} disabled={blocked}>
            <Save className="h-4 w-4" /> Save changes
          </Button>
        }
      />

      <div className="space-y-6 px-8 py-6">
        <Section title="General" description="Core inbox behaviour and channels.">
          <Row label="Enabled" hint="Master switch for receiving modmail in this server.">
            <Switch checked={top.enabled} onChange={(v) => setTop((t) => ({ ...t, enabled: v }))} />
          </Row>
          {blocked && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2.5 text-sm text-text">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              <div>
                <p className="font-medium">Can't enable modmail yet</p>
                <p className="mt-0.5 text-muted">
                  Still missing {missing.join(" and ")}. Until this is set, the server won't appear
                  when someone DMs the bot.
                </p>
              </div>
            </div>
          )}
          <Field label="Mode">
            <Select
              value={top.mode}
              onChange={(e) => setTop((t) => ({ ...t, mode: e.target.value as Mode }))}
            >
              <option value="threads">Threads</option>
              <option value="channels">Channels</option>
            </Select>
          </Field>
          <Field label="Inbox channel">
            <ChannelSelect
              options={messageChannelOpts}
              value={top.inboxChannelId}
              onChange={(v) => setTop((t) => ({ ...t, inboxChannelId: v }))}
            />
          </Field>
          <Field label="Log channel">
            <ChannelSelect
              options={messageChannelOpts}
              value={top.logChannelId}
              onChange={(v) => setTop((t) => ({ ...t, logChannelId: v }))}
            />
          </Field>
          <Field label="Transcript channel">
            <ChannelSelect
              options={messageChannelOpts}
              value={top.transcriptChannelId}
              onChange={(v) => setTop((t) => ({ ...t, transcriptChannelId: v }))}
            />
          </Field>
          <Field
            label="Fallback category"
            hint="Where channels are created when no category matches."
          >
            <ChannelSelect
              options={categoryOpts}
              value={top.fallbackCategoryId}
              onChange={(v) => setTop((t) => ({ ...t, fallbackCategoryId: v }))}
            />
          </Field>
        </Section>

        <Section title="Permissions" description="Roles allowed to handle and administer modmail.">
          <Field label="Staff roles" hint="Can view and reply to tickets.">
            <MultiSelect
              options={roleOpts}
              value={top.staffRoleIds}
              onChange={(v) => setTop((t) => ({ ...t, staffRoleIds: v }))}
              placeholder="Select staff roles…"
            />
          </Field>
          <Field label="Admin roles" hint="Can change settings and manage everything.">
            <MultiSelect
              options={roleOpts}
              value={top.adminRoleIds}
              onChange={(v) => setTop((t) => ({ ...t, adminRoleIds: v }))}
              placeholder="Select admin roles…"
            />
          </Field>
        </Section>

        <Section title="Messages" description="Automated messages sent to users.">
          <Row label="Send greeting" hint="Message users get when they open a ticket.">
            <Switch
              checked={config.greetingEnabled}
              onChange={(v) => setCfg("greetingEnabled", v)}
            />
          </Row>
          <Field label="Greeting message">
            <Textarea
              value={greeting}
              onChange={(e) => setGreeting(e.target.value)}
              rows={3}
              disabled={!config.greetingEnabled}
            />
          </Field>
          <Row label="Send close message" hint="Message users get when their ticket is closed.">
            <Switch
              checked={config.closeMessageEnabled}
              onChange={(v) => setCfg("closeMessageEnabled", v)}
            />
          </Row>
          <Field label="Close message">
            <Textarea
              value={closeText}
              onChange={(e) => setCloseText(e.target.value)}
              rows={3}
              disabled={!config.closeMessageEnabled}
            />
          </Field>
          <Row label="Anonymous by default" hint="Hide staff identity on replies unless toggled.">
            <Switch
              checked={config.anonymousByDefault}
              onChange={(v) => setCfg("anonymousByDefault", v)}
            />
          </Row>
          <Row
            label="Show staff names"
            hint="Display the replying staff member's name to the user."
          >
            <Switch checked={config.showStaffNames} onChange={(v) => setCfg("showStaffNames", v)} />
          </Row>
        </Section>

        <Section title="Automation" description="Automatic ticket lifecycle handling.">
          <Row label="Auto-close inactive tickets">
            <Switch
              checked={config.autoCloseEnabled}
              onChange={(v) => setCfg("autoCloseEnabled", v)}
            />
          </Row>
          <Field label="Auto-close after (minutes)" hint="Minimum 5.">
            <NumberInput
              value={config.autoCloseAfterMinutes}
              min={5}
              disabled={!config.autoCloseEnabled}
              onChange={(n) => setCfg("autoCloseAfterMinutes", n)}
            />
          </Field>
          <Row label="Silent auto-close" hint="Don't notify the user when auto-closing.">
            <Switch
              checked={config.autoCloseSilent}
              onChange={(v) => setCfg("autoCloseSilent", v)}
              disabled={!config.autoCloseEnabled}
            />
          </Row>
          <Row label="Close on leave" hint="Close a ticket when the user leaves the server.">
            <Switch checked={config.closeOnLeave} onChange={(v) => setCfg("closeOnLeave", v)} />
          </Row>
          <Field
            label="Delete channel after close (seconds)"
            hint="0 keeps the channel. Channels mode only."
          >
            <NumberInput
              value={config.deleteChannelAfterCloseSeconds}
              min={0}
              onChange={(n) => setCfg("deleteChannelAfterCloseSeconds", n)}
            />
          </Field>
        </Section>

        <Section title="Anti-spam" description="Gate who can open tickets and how often.">
          <Row label="Require a reason" hint="Users must give a reason to open a ticket.">
            <Switch checked={config.requireReason} onChange={(v) => setCfg("requireReason", v)} />
          </Row>
          <Row label="Confirmation step" hint="Ask users to confirm before opening a ticket.">
            <Switch
              checked={config.confirmationEnabled}
              onChange={(v) => setCfg("confirmationEnabled", v)}
            />
          </Row>
          <Field label="Cooldown (seconds)" hint="Wait time between opening tickets. 0 disables.">
            <NumberInput
              value={config.cooldownSeconds}
              min={0}
              onChange={(n) => setCfg("cooldownSeconds", n)}
            />
          </Field>
          <Field label="Max open tickets per user" hint="Minimum 1.">
            <NumberInput
              value={config.maxOpenTicketsPerUser}
              min={1}
              onChange={(n) => setCfg("maxOpenTicketsPerUser", n)}
            />
          </Field>
          <Field
            label="Min account age (minutes)"
            hint="Block accounts younger than this. 0 disables."
          >
            <NumberInput
              value={config.minAccountAgeMinutes}
              min={0}
              onChange={(n) => setCfg("minAccountAgeMinutes", n)}
            />
          </Field>
        </Section>

        <Section title="Appearance" description="Branding and embed colors.">
          <Field label="Accent color">
            <ColorInput value={config.accentColor} onChange={(v) => setCfg("accentColor", v)} />
          </Field>
          <Field label="Success color">
            <ColorInput value={config.successColor} onChange={(v) => setCfg("successColor", v)} />
          </Field>
          <Field label="Error color">
            <ColorInput value={config.errorColor} onChange={(v) => setCfg("errorColor", v)} />
          </Field>
          <Field label="Brand footer" hint="Appended to the footer of modmail embeds.">
            <Input
              value={config.brandFooter}
              onChange={(e) => setCfg("brandFooter", e.target.value)}
              placeholder="Your server name"
            />
          </Field>
          <Field
            label="Name format"
            hint="Template for ticket channel/thread names, e.g. {username}."
          >
            <Input
              value={config.nameFormat}
              onChange={(e) => setCfg("nameFormat", e.target.value)}
              placeholder="{username}"
            />
          </Field>
          <Field label="Locale">
            <Select value={config.locale} onChange={(e) => setCfg("locale", e.target.value)}>
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </Select>
          </Field>
        </Section>

        <Section title="Pings" description="Notify roles on ticket activity.">
          <Field label="Ping roles">
            <MultiSelect
              options={roleOpts}
              value={config.pingRoleIds}
              onChange={(v) => setCfg("pingRoleIds", v)}
              placeholder="Select roles to ping…"
            />
          </Field>
          <Row label="Ping on new ticket">
            <Switch
              checked={config.pingOnNewTicket}
              onChange={(v) => setCfg("pingOnNewTicket", v)}
            />
          </Row>
          <Row label="Ping on new message">
            <Switch
              checked={config.pingOnNewMessage}
              onChange={(v) => setCfg("pingOnNewMessage", v)}
            />
          </Row>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="text-sm font-medium text-text">{label}</div>
        {hint && <p className="text-xs text-faint">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

function ChannelSelect({
  options,
  value,
  onChange,
}: {
  options: Option[];
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  return (
    <Select value={value ?? ""} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">None</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}

function NumberInput({
  value,
  min,
  disabled,
  onChange,
}: {
  value: number;
  min: number;
  disabled?: boolean;
  onChange: (n: number) => void;
}) {
  return (
    <Input
      type="number"
      min={min}
      value={value}
      disabled={disabled}
      onChange={(e) => {
        const n = Number(e.target.value);
        onChange(Number.isFinite(n) ? n : min);
      }}
    />
  );
}
