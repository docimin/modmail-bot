import { createFileRoute, redirect } from "@tanstack/react-router";
import { Inbox } from "lucide-react";
import { Button } from "#/components/ui/index.tsx";
import { loginWithDiscord } from "#/lib/auth-client.ts";
import { getSession } from "#/server/fns/session.ts";

export const Route = createFileRoute("/login")({
  loader: async () => {
    const user = await getSession();
    if (user) throw redirect({ to: "/dashboard" });
    return null;
  },
  component: Login,
});

function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4">
      <div className="w-full max-w-sm rounded-[var(--radius-card)] border border-border bg-surface p-8 text-center">
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-white">
          <Inbox className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-semibold text-text">Sign in to Modmail</h1>
        <p className="mt-2 text-sm text-muted">
          Use your Discord account to manage the servers you own or moderate.
        </p>
        <Button className="mt-6 w-full" onClick={() => loginWithDiscord("/dashboard")}>
          Continue with Discord
        </Button>
      </div>
    </div>
  );
}
