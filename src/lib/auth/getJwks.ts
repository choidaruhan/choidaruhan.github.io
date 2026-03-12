import { createRemoteJWKSet } from "jose";

let jwksCache: ReturnType<typeof createRemoteJWKSet> | null = null;

export function getJwks(teamDomain: string): ReturnType<typeof createRemoteJWKSet> {
  if (!jwksCache) {
    jwksCache = createRemoteJWKSet(
      new URL(`https://${teamDomain}/cdn-cgi/access/certs`),
    );
  }
  return jwksCache;
}
