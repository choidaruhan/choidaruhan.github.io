export async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('cf_access_token');
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
}

export async function fetchPosts() {
  const response = await fetch(`${window.API_URL}/posts`);
  if (!response.ok) throw new Error('Failed to fetch posts');
  return response.json();
}

export async function fetchPost(id) {
  const response = await fetch(`${window.API_URL}/posts/${id}`);
  if (!response.ok) throw new Error('Post not found');
  return response.json();
}

export async function createPost(id, title, content) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('cf_access_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${window.API_URL}/posts`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({ id, title, content })
  });
  if (!response.ok) throw new Error('Save failed');
  return response.json();
}

export async function deletePostApi(id) {
  const response = await fetchWithAuth(`${window.API_URL}/posts/${id}`, { method: 'DELETE' });
  if (!response.ok) throw new Error('Delete failed');
  return response.json();
}

export async function searchPosts(query) {
  const response = await fetch(`${window.API_URL}/search?q=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error(`Search failed: ${response.status}`);
  return response.json();
}
