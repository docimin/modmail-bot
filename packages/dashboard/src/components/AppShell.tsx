import { Link, useRouter } from "@tanstack/react-router";
import {
  Ban,
  BarChart3,
  ChevronLeft,
  FolderTree,
  Inbox,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  ScrollText,
  Settings,
  Tags,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { Avatar } from "#/components/ui/index.tsx";
import { signOut } from "#/lib/auth-client.ts";
import { cn } from "#/lib/utils.ts";

const NAV = [
  { to: "/dashboard/$guildId", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/$guildId/tickets", label: "Tickets", icon: Inbox, exact: false },
  { to: "/dashboard/$guildId/snippets", label: "Snippets", icon: MessageSquareText, exact: false },
  { to: "/dashboard/$guildId/categories", label: "Categories", icon: FolderTree, exact: false },
  { to: "/dashboard/$guildId/tags", label: "Tags", icon: Tags, exact: false },
  { to: "/dashboard/$guildId/blocked", label: "Blocked", icon: Ban, exact: false },
  { to: "/dashboard/$guildId/staff", label: "Staff", icon: Users, exact: false },
  { to: "/dashboard/$guildId/analytics", label: "Analytics", icon: BarChart3, exact: false },
  { to: "/dashboard/$guildId/audit", label: "Audit log", icon: ScrollText, exact: false },
  { to: "/dashboard/$guildId/settings", label: "Settings", icon: Settings, exact: false },
] as const;

export function AppShell({
  guild,
  user,
  children,
}: {
  guild: { id: string; name: string; icon: string | null };
  user: { name: string; image: string | null } | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const onSignOut = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-surface">
        <div className="flex items-center gap-3 px-4 py-4">
          {guild.icon ? (
            <Avatar src={guild.icon} size={36} className="rounded-xl" />
          ) : (
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface-3 text-sm font-semibold">
              {guild.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-text">{guild.name}</div>
            <Link
              to="/dashboard"
              className="flex items-center gap-0.5 text-xs text-muted hover:text-text"
            >
              <ChevronLeft className="h-3 w-3" /> All servers
            </Link>
          </div>
        </div>

        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              params={{ guildId: guild.id }}
              activeOptions={{ exact: item.exact }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-text"
              activeProps={{
                className: "bg-accent/15 text-accent hover:bg-accent/15 hover:text-accent",
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border p-3">
          <div className="flex items-center gap-3">
            <Avatar src={user?.image} size={32} />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-text">
                {user?.name ?? "Account"}
              </div>
            </div>
            <button
              type="button"
              onClick={onSignOut}
              className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-text"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 border-b border-border px-8 py-6",
        className,
      )}
    >
      <div>
        <h1 className="text-xl font-semibold text-text">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
