const DEFAULT_API_BASE = '/api';

export interface Post {
  id?: number;
  title: string;
  content: string;
  created_at?: string;
  date?: string;
  published_at?: string;
}

export class BlogApiClient {
  constructor(private apiBase: string = DEFAULT_API_BASE) {}

  async fetchPosts(): Promise<Post[]> {
    const res = await fetch(`${this.apiBase}/posts`);
    if (!res.ok) throw new Error('Failed to load posts');
    return await res.json();
  }

  async fetchPost(id: number): Promise<Post> {
    const res = await fetch(`${this.apiBase}/posts/${id}`);
    if (!res.ok) throw new Error('Failed to load post');
    return await res.json();
  }

  async createPost(post: Omit<Post, 'id'>, token?: string | null): Promise<Post> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${this.apiBase}/posts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Failed to submit post');
    return await res.json();
  }

  async updatePost(id: number, post: Omit<Post, 'id'>, token?: string | null): Promise<Post> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${this.apiBase}/posts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(post),
    });
    if (!res.ok) throw new Error('Update failed');
    return await res.json();
  }

  async deletePost(id: number, token?: string | null): Promise<void> {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${this.apiBase}/posts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) throw new Error('Delete failed');
  }

  async searchPosts(query: string): Promise<Post[]> {
    const res = await fetch(`${this.apiBase}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    return await res.json();
  }
}

export const defaultBlogApi = new BlogApiClient();