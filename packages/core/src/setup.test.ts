import { expect, test } from "bun:test";
import { missingToEnable } from "./setup.ts";

test("threads mode needs only an inbox channel", () => {
  expect(missingToEnable({ mode: "threads", inboxChannelId: "1" })).toEqual([]);
});

test("threads mode without an inbox channel reports it", () => {
  const missing = missingToEnable({ mode: "threads", inboxChannelId: null });
  expect(missing).toHaveLength(1);
  expect(missing[0]).toContain("inbox channel");
});

test("channels mode needs a fallback category as well", () => {
  const missing = missingToEnable({
    mode: "channels",
    inboxChannelId: "1",
    fallbackCategoryId: null,
  });
  expect(missing).toHaveLength(1);
  expect(missing[0]).toContain("category");
});

test("channels mode is satisfied with both set", () => {
  expect(
    missingToEnable({ mode: "channels", inboxChannelId: "1", fallbackCategoryId: "2" }),
  ).toEqual([]);
});

test("reports every missing requirement at once", () => {
  const missing = missingToEnable({ mode: "channels" });
  expect(missing).toHaveLength(2);
});

test("treats an empty string as missing", () => {
  expect(missingToEnable({ mode: "threads", inboxChannelId: "" })).toHaveLength(1);
});
