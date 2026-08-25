/** Discord (or better-auth) could not be reached — distinct from a real denial. */
export class UpstreamError extends Error {
  constructor() {
    super("UPSTREAM_UNAVAILABLE");
  }
}
