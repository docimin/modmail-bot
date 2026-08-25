import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient();
export const { signIn, signOut, useSession } = authClient;

export function loginWithDiscord(callbackURL = "/dashboard") {
  return authClient.signIn.social({ provider: "discord", callbackURL });
}
