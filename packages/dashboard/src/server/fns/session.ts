import { createServerFn } from "@tanstack/react-start";
import { auth } from "#/server/auth.ts";
import { currentHeaders } from "#/server/access.ts";

export const getSession = createServerFn({ method: "GET" }).handler(async () => {
  const session = await auth.api.getSession({ headers: currentHeaders() });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    image: session.user.image ?? null,
  };
});

export type SessionUser = Awaited<ReturnType<typeof getSession>>;
