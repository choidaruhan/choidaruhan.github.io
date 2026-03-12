import { API_BASE } from "./apiBase";

export const API_ENDPOINTS = {
  posts: `${API_BASE}/api/posts`,
  post: (id: number | string) => `${API_BASE}/api/posts/${id}`,
  search: (query: string) =>
    `${API_BASE}/api/posts?q=${encodeURIComponent(query)}`,
  health: `${API_BASE}/health`,
};
