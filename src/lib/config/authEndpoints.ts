import { API_BASE } from "./apiBase";

export const AUTH_ENDPOINTS = {
  login: `${API_BASE}/auth/login`,
  logout: `${API_BASE}/auth/logout`,
  me: `${API_BASE}/auth/me`,
};
