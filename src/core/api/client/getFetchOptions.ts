export function getFetchOptions(existingHeaders: Record<string, string> = {}) {
  return {
    credentials: "include" as RequestCredentials,
    headers: { ...existingHeaders },
  };
}
