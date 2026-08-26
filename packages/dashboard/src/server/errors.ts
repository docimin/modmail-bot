/** Discord (or better-auth) could not be reached — distinct from a real denial. */
export class UpstreamError extends Error {
  constructor() {
    super("UPSTREAM_UNAVAILABLE");
  }
}

/** Enabling was refused because required configuration is still missing. */
export class SetupIncompleteError extends Error {
  constructor(missing: string[]) {
    super(`Can't enable modmail yet — still missing ${missing.join(" and ")}.`);
  }
}
