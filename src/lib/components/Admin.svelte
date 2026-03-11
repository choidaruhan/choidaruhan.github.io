<script lang="ts">
  import { onMount } from 'svelte';
  import { BlogApiClient } from '@/lib/api/blogApi';
  import { API_BASE } from '@/lib/config';
  import type { Post } from '@/lib/api/blogApi';

  const TOKEN_KEY = 'blog_auth_token';
  const api = new BlogApiClient(API_BASE);

  let title = '';
  let content = '';
  let slug = '';
  let token = '';
  let user: { login: string; name?: string; avatar?: string } | null = null;
  let editingId: number | null = null;
  let message = '';
  let error = '';
  let loading = false;
  let checkingAuth = true;

  onMount(async () => {
    // Check for token in URL (from OAuth callback)
    const url = new URL(window.location.href);
    const authToken = url.searchParams.get('auth_token');
    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
      token = authToken;
      // Remove token from URL
      url.searchParams.delete('auth_token');
      window.history.replaceState({}, '', url.toString());
    }

    // Check for stored token
    if (!token) {
      token = localStorage.getItem(TOKEN_KEY) || '';
    }

    // Verify token with server
    if (token) {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          user = data.user;
        } else {
          // Invalid token
          localStorage.removeItem(TOKEN_KEY);
          token = '';
        }
      } catch (e) {
        console.error('Auth check failed', e);
      }
    }

    checkingAuth = false;

    // Check for edit mode via URL params
    const editId = url.searchParams.get('edit');
    if (editId) {
      editingId = parseInt(editId);
      try {
        loading = true;
        const post = await api.fetchPost(editingId);
        title = post.title;
        content = post.content;
        slug = post.slug || '';
      } catch (err: any) {
        error = '글을 불러오는데 실패했습니다: ' + (err.message || 'Unknown error');
      } finally {
        loading = false;
      }
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = '';
    message = '';

    if (!title.trim() || !content.trim()) {
      error = '제목과 내용을 모두 입력해주세요.';
      return;
    }

    if (!token) {
      error = '로그인이 필요합니다.';
      return;
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      slug: slug.trim() || undefined
    };

    try {
      loading = true;
      if (editingId) {
        await api.updatePost(editingId, postData, token);
        message = '글이 수정되었습니다.';
      } else {
        await api.createPost(postData, token);
        message = '글이 작성되었습니다.';
        title = '';
        content = '';
        slug = '';
        editingId = null;
      }
      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      if (err.message === 'Unauthorized' || err.message.includes('401') || err.message.toLowerCase().includes('unauthorized')) {
        error = '세션이 만료되었습니다. 다시 로그인해주세요.';
        localStorage.removeItem(TOKEN_KEY);
        token = '';
        user = null;
      } else {
        error = err.message || '오류가 발생했습니다.';
      }
    } finally {
      loading = false;
    }
  }

  function generateSlug() {
    if (title && !slug) {
      slug = title.toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }

  function login() {
    const redirectTo = encodeURIComponent('/admin');
    window.location.href = `${API_BASE}/auth/github?redirect_to=${redirectTo}`;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    token = '';
    user = null;
    fetch(`${API_BASE}/auth/logout`, { method: 'POST' }).catch(() => {});
  }
</script>

<div class="admin-container">
  <div class="header">
    <h1>{editingId ? '✏️ 글 수정' : '📝 새 글 작성'}</h1>
    {#if user}
      <div class="user-info">
        <span>{user.name || user.login}님 환영합니다</span>
        <button on:click={logout} class="logout-btn">로그아웃</button>
      </div>
    {/if}
  </div>

  {#if checkingAuth}
    <div class="loading">인증 확인 중...</div>
  {:else if !token}
    <div class="login-prompt">
      <p>글을 작성하려면 로그인이 필요합니다.</p>
      <button on:click={login} class="login-btn">GitHub로 로그인</button>
    </div>
  {:else}
    <!-- The form is only visible when authenticated -->
  {/if}

  {#if loading && !checkingAuth}
    <div class="loading">처리 중...</div>
  {/if}

  {#if message}
    <div class="success">{message} 잠시 후 홈으로 이동합니다...</div>
  {/if}
  {#if error}
    <div class="error">{error}</div>
  {/if}

  {#if token && !checkingAuth}
    <form on:submit={handleSubmit}>
      <div class="form-group">
        <label for="title">제목 *</label>
        <input
          id="title"
          bind:value={title}
          required
          on:input={generateSlug}
          placeholder="글 제목을 입력하세요"
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="slug">URL 슬러그 (선택사항)</label>
        <input
          id="slug"
          bind:value={slug}
          placeholder="url-friendly-name (빈칸이면 자동 생성)"
          disabled={loading || editingId !== null}
        />
        <small>수정 시 slug는 변경할 수 없습니다. 새 글 작성 시에만 사용 가능합니다.</small>
      </div>

      <div class="form-group">
        <label for="content">내용 (Markdown) *</label>
        <textarea
          id="content"
          bind:value={content}
          required
          rows="20"
          placeholder="Markdown 형식으로 글을 작성하세요..."
          disabled={loading}
        ></textarea>
      </div>

      <div class="actions">
        <button type="submit" disabled={loading}>
          {editingId ? '수정하기' : '작성하기'}
        </button>
        <a href="/" class="cancel-btn">취소</a>
      </div>
    </form>
  {/if}
</div>

<style>
  .admin-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  h1 {
    margin-bottom: 24px;
    font-size: 1.75rem;
    color: #1a1a2e;
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .logout-btn {
    padding: 6px 12px;
    font-size: 0.85rem;
    background: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .loading {
    padding: 12px;
    background: #fff3cd;
    color: #856404;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  .success {
    padding: 12px;
    background: #d4edda;
    color: #155724;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  .error {
    padding: 12px;
    background: #f8d7da;
    color: #721c24;
    border-radius: 8px;
    margin-bottom: 20px;
    text-align: center;
  }

  .login-prompt {
    text-align: center;
    padding: 40px;
    background: #f8f9fa;
    border-radius: 8px;
  }

  .login-btn {
    margin-top: 16px;
    padding: 12px 24px;
    background: #24292e;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 1rem;
  }

  .login-btn:hover {
    background: #1a1e21;
  }

  .form-group {
    margin-bottom: 24px;
  }

  label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #333;
  }

  input, textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
    font-size: 1rem;
    transition: border-color 0.2s;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }

  input:disabled, textarea:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
  }

  textarea {
    resize: vertical;
    min-height: 400px;
    font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    line-height: 1.6;
    tab-size: 2;
  }

  small {
    display: block;
    margin-top: 6px;
    color: #666;
    font-size: 0.85rem;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 32px;
  }

  button[type="submit"] {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #6366f1;
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button[type="submit"]:hover:not(:disabled) {
    background: #4f46e5;
  }

  button[type="submit"]:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .cancel-btn {
    padding: 12px 24px;
    border: 1px solid #ddd;
    border-radius: 8px;
    text-decoration: none;
    color: #666;
    display: inline-flex;
    align-items: center;
    transition: background-color 0.2s;
  }

  .cancel-btn:hover {
    background: #f5f5f5;
  }
</style>
