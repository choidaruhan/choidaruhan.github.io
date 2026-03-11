<script lang="ts">
  import { onMount } from "svelte";
  import { filteredPosts, loading, selectedPost, searchPosts } from "@/lib/stores/posts.store";
  import { formatPostDate } from "@/lib/utils/date";
  import { API_BASE } from "@/lib/config";

  let searchQuery = "";
  let searchTimeout: ReturnType<typeof setTimeout>;

  let user: { email: string; name?: string } | null = null;
  let loadingAuth = true;

  function selectPost(post: any) {
    selectedPost.set(post);
  }

  function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchPosts(searchQuery);
    }, 300);
  }

  function goToAdmin() {
    window.location.href = '/admin';
  }

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        user = data.user;
      } else {
        user = null;
      }
    } catch (e) {
      user = null;
    } finally {
      loadingAuth = false;
    }
  });

  function logout() {
    // Cloudflare Access logout
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `https://choidaruhan.cloudflareaccess.com/logout?redirectTo=${redirectTo}`;
  }
</script>

<aside class="sidebar">
  <div class="sidebar-header">
    <h1 class="blog-title">최다루한의 블로그</h1>
    <div class="auth-section">
      {#if loadingAuth}
        <p class="auth-loading">인증 확인 중...</p>
      {:else if user}
        <div class="user-links">
          <button class="admin-btn" on:click={goToAdmin}>
            ✏️ 글쓰기
          </button>
          <button class="logout-btn" on:click={logout}>
            로그아웃
          </button>
        </div>
      {:else}
        <p class="login-hint">
          글쓰기는 Cloudflare Access로 보호되어 있습니다.
        </p>
      {/if}
    </div>
  </div>

  <div class="search-container">
    <input
      type="text"
      class="search-input"
      placeholder="검색..."
      bind:value={searchQuery}
      on:input={handleSearch}
    />
  </div>

  <div class="post-list-container">
    <h2 class="section-title">글 목록</h2>
    
    {#if $loading}
      <p class="loading">로딩 중...</p>
    {:else if $filteredPosts.length === 0}
      <p class="no-posts">글이 없습니다.</p>
    {:else}
      <ul class="post-list">
        {#each $filteredPosts as post (post.id)}
          <li>
            <button
              class="post-item"
              class:active={$selectedPost?.id === post.id}
              type="button"
              on:click={() => selectPost(post)}
            >
              <span class="post-title">{post.title}</span>
              <span class="post-date">{formatPostDate(post)}</span>
            </button>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</aside>

<style>
  .sidebar {
    width: 280px;
    min-width: 280px;
    height: 100vh;
    background: #1a1a2e;
    color: #eee;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .sidebar-header {
    padding: 24px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .blog-title {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
  }

  .auth-section {
    margin-top: 12px;
  }

  .auth-loading, .login-hint {
    font-size: 0.85rem;
    color: #888;
    padding: 8px 0;
  }

  .user-links {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .admin-btn, .logout-btn {
    width: 100%;
    padding: 8px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: background 0.2s;
    text-align: left;
    font-family: inherit;
  }

  .admin-btn {
    background: rgba(99, 102, 241, 0.2);
    color: #a5b4fc;
  }

  .admin-btn:hover {
    background: rgba(99, 102, 241, 0.4);
    color: #fff;
  }

  .logout-btn {
    background: rgba(255, 255, 255, 0.1);
    color: #ccc;
  }

  .logout-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  .search-container {
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .search-input {
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 0.9rem;
  }

  .search-input::placeholder {
    color: #666;
  }

  .search-input:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.15);
  }

  .post-list-container {
    flex: 1;
    overflow-y: auto;
    padding: 16px 12px;
  }

  .section-title {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #888;
    margin: 0 0 12px 8px;
  }

  .post-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .post-item {
    width: 100%;
    padding: 12px;
    border: none;
    background: transparent;
    color: #ccc;
    text-align: left;
    cursor: pointer;
    border-radius: 6px;
    transition: background 0.2s;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .post-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .post-item.active {
    background: rgba(99, 102, 241, 0.3);
    color: #fff;
  }

  .post-title {
    font-size: 0.95rem;
    font-weight: 500;
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .post-date {
    font-size: 0.75rem;
    color: #666;
  }

  .loading, .no-posts {
    color: #666;
    padding: 12px;
    font-size: 0.9rem;
  }
</style>
