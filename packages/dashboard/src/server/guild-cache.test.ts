import { expect, test } from "bun:test";
import { createStaleCache } from "./guild-cache.ts";

test("serves a fresh value without calling the loader again", async () => {
  const cache = createStaleCache<number>(10_000);
  let calls = 0;
  const load = async () => {
    calls++;
    return 1;
  };
  expect(await cache.fetch("u", load)).toBe(1);
  expect(await cache.fetch("u", load)).toBe(1);
  expect(calls).toBe(1);
});

test("concurrent callers share one in-flight load", async () => {
  const cache = createStaleCache<number>(10_000);
  let calls = 0;
  const load = async () => {
    calls++;
    await new Promise((r) => setTimeout(r, 20));
    return 7;
  };
  const results = await Promise.all([
    cache.fetch("u", load),
    cache.fetch("u", load),
    cache.fetch("u", load),
  ]);
  expect(results).toEqual([7, 7, 7]);
  expect(calls).toBe(1);
});

test("reloads once the entry has expired", async () => {
  const cache = createStaleCache<number>(1);
  let calls = 0;
  const load = async () => ++calls;
  expect(await cache.fetch("u", load)).toBe(1);
  await new Promise((r) => setTimeout(r, 10));
  expect(await cache.fetch("u", load)).toBe(2);
});

test("returns the stale value when a refresh fails", async () => {
  const cache = createStaleCache<number>(1);
  expect(await cache.fetch("u", async () => 42)).toBe(42);
  await new Promise((r) => setTimeout(r, 10));
  const value = await cache.fetch("u", async () => {
    throw new Error("discord 429");
  });
  expect(value).toBe(42);
});

test("rethrows when the loader fails and nothing is cached", async () => {
  const cache = createStaleCache<number>(10_000);
  await expect(
    cache.fetch("u", async () => {
      throw new Error("discord 429");
    }),
  ).rejects.toThrow("discord 429");
});

test("keys are independent", async () => {
  const cache = createStaleCache<string>(10_000);
  expect(await cache.fetch("a", async () => "A")).toBe("A");
  expect(await cache.fetch("b", async () => "B")).toBe("B");
  expect(await cache.fetch("a", async () => "changed")).toBe("A");
});
