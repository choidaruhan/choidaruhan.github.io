<script lang="ts">
  import { onMount } from "svelte";
  import {
    filteredPosts,
    loading,
    selectedPost,
    searchPosts,
  } from "@/lib/stores/posts.store";
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
    window.location.href = "/admin";
  }

  function login() {
    const redirectTo = encodeURIComponent(window.location.origin + "/admin");
    window.location.href = `${API_BASE}/auth/login?redirect_to=${redirectTo}`;
  }

  onMount(async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        const data = (await res.json()) as {
          user: { email: string; name?: string };
        };
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
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE}/auth/logout?redirect_to=${redirectTo}`;
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
          <button class="admin-btn" on:click={goToAdmin}> ✏️ 글쓰기 </button>
          <button class="logout-btn" on:click={logout}> 로그아웃 </button>
        </div>
      {:else}
        <button class="login-btn" on:click={login}>
          🔐 Cloudflare Access 로그인
        </button>
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
