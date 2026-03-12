import { API_BASE } from "../../config/apiBase";

export function getFetchOptions(existingHeaders: Record<string, string> = {}) {
  return {
    credentials: "include" as RequestCredentials,
    headers: { ...existingHeaders },
  };
}

export const DEFAULT_API_BASE = `${API_BASE}/api`;
