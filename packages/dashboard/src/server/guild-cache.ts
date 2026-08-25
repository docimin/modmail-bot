interface Entry<T> {
  value: T;
  expires: number;
}

/**
 * Per-key cache that collapses concurrent loads into one and keeps serving the
 * last good value while a refresh is failing. A page load fans out into several
 * server functions at once; without this they each hit Discord in parallel and
 * the rate-limited ones would otherwise look like "no access".
 */
export function createStaleCache<T>(ttlMs: number) {
  const entries = new Map<string, Entry<T>>();
  const inflight = new Map<string, Promise<T>>();

  return {
    async fetch(key: string, load: () => Promise<T>): Promise<T> {
      const hit = entries.get(key);
      if (hit && hit.expires > Date.now()) return hit.value;

      let pending = inflight.get(key);
      if (!pending) {
        pending = load()
          .then((value) => {
            entries.set(key, { value, expires: Date.now() + ttlMs });
            return value;
          })
          .finally(() => inflight.delete(key));
        inflight.set(key, pending);
      }

      try {
        return await pending;
      } catch (err) {
        const stale = entries.get(key);
        if (stale) return stale.value;
        throw err;
      }
    },
  };
}
