import { API_BASE } from "../config";
const DEFAULT_API_BASE = `${API_BASE}/api`;

export interface Post {
  id?: number;
  title: string;
  slug?: string;
  content: string;
  created_at?: string;
  updated_at?: string;
  date?: string;
  published_at?: string;
}

export class BlogApiClient {
  constructor(private apiBase: string = DEFAULT_API_BASE) {}

  private getFetchOptions(existingHeaders: Record<string, string> = {}) {
    return {
      credentials: "include" as RequestCredentials,
      headers: { ...existingHeaders },
    };
  }

  async fetchPosts(): Promise<Post[]> {
    const res = await fetch(`${this.apiBase}/posts`, this.getFetchOptions());
    if (!res.ok) throw new Error("Failed to load posts");
    return await res.json();
  }

  async fetchPost(id: number): Promise<Post> {
    const res = await fetch(
      `${this.apiBase}/posts/${id}`,
      this.getFetchOptions(),
    );
    if (!res.ok) throw new Error("Failed to load post");
    return await res.json();
  }

  async createPost(post: Omit<Post, "id">): Promise<Post> {
    const res = await fetch(`${this.apiBase}/posts`, {
      ...this.getFetchOptions({
        "Content-Type": "application/json",
      }),
      method: "POST",
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error("Failed to submit post");
    return await res.json();
  }

  async updatePost(id: number, post: Omit<Post, "id">): Promise<Post> {
    const res = await fetch(`${this.apiBase}/posts/${id}`, {
      ...this.getFetchOptions({
        "Content-Type": "application/json",
      }),
      method: "PUT",
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error("Update failed");
    return await res.json();
  }

  async deletePost(id: number): Promise<void> {
    const res = await fetch(`${this.apiBase}/posts/${id}`, {
      ...this.getFetchOptions(),
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Delete failed");
  }

  async searchPosts(query: string): Promise<Post[]> {
    const res = await fetch(
      `${this.apiBase}/posts?q=${encodeURIComponent(query)}`,
      this.getFetchOptions(),
    );
    if (!res.ok) throw new Error("Search failed");
    return await res.json();
  }
}

export const defaultBlogApi = new BlogApiClient();
