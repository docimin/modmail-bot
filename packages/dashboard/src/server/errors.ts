/** Discord (or better-auth) could not be reached — distinct from a real denial. */
export class UpstreamError extends Error {
  constructor(detail: string) {
    super("UPSTREAM_UNAVAILABLE");
    console.error(`[access] ${detail}`);
  }
}
