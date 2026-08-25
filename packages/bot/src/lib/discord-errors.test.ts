import { expect, test } from "bun:test";
import { ticketErrorMessage } from "./discord-errors.ts";

function apiError(code: number) {
  return Object.assign(new Error("Discord said no"), { code, status: 403 });
}

test("50001 explains the bot cannot see the inbox channel", () => {
  const msg = ticketErrorMessage(apiError(50001));
  expect(msg).toContain("inbox channel");
  expect(msg).toContain("staff");
});

test("50013 explains a missing permission", () => {
  const msg = ticketErrorMessage(apiError(50013));
  expect(msg).toContain("permission");
  expect(msg).toContain("staff");
});

test("50035 explains an invalid configuration", () => {
  expect(ticketErrorMessage(apiError(50035))).toContain("configured");
});

test("an unknown Discord code falls back to the generic message", () => {
  expect(ticketErrorMessage(apiError(12345))).toBe(
    "Something went wrong opening your ticket. Please try again later.",
  );
});

test("a non-Discord error falls back to the generic message", () => {
  expect(ticketErrorMessage(new Error("boom"))).toBe(
    "Something went wrong opening your ticket. Please try again later.",
  );
});

test("null and undefined are handled", () => {
  expect(ticketErrorMessage(null)).toContain("Something went wrong");
  expect(ticketErrorMessage(undefined)).toContain("Something went wrong");
});
