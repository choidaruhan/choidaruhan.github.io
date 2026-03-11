<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Sidebar from "./lib/components/Sidebar.svelte";
  import HomeView from "./lib/components/HomeView.svelte";
  import PostView from "./lib/components/PostView.svelte";
  import Admin from "./lib/components/Admin.svelte";
  import { fetchPosts, selectedPost } from "./lib/stores/posts.store";

  let loading = true;
  let error = "";
  let currentRoute = "/";

  function handleRouteChange() {
    currentRoute = window.location.pathname;
    // Reset selected post when navigating home
    if (currentRoute === "/") {
      selectedPost.set(null);
    }
  }

  onMount(async () => {
    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange();

    // Load posts only if not on admin page
    if (currentRoute === "/" || currentRoute.startsWith("/posts")) {
      try {
        await fetchPosts();
        loading = false;
      } catch (e) {
        error = "블로그를 불러오는데 실패했습니다.";
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  onDestroy(() => {
    window.removeEventListener("popstate", handleRouteChange);
  });
</script>

<svelte:head>
  <title>최다루한의 블로그</title>
  <meta name="description" content="개인 블로그" />
</svelte:head>

<div class="app-container">
  <Sidebar />

  <main class="main-content">
    {#if loading}
      <div class="loading">
        <p>블로그를 불러오는 중...</p>
      </div>
    {:else if error}
      <div class="error">
        <p>{error}</p>
      </div>
    {:else if currentRoute === "/admin" || currentRoute === "/admin/"}
      <Admin />
    {:else if $selectedPost}
      <PostView />
    {:else}
      <HomeView />
    {/if}
  </main>
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family:
      -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    background: #f5f5f5;
    color: #333;
  }

  .app-container {
    display: flex;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    background: #fff;
  }

  .loading,
  .error {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    color: #666;
  }

  .error {
    color: #e53e3e;
  }

  @media (max-width: 768px) {
    .app-container {
      flex-direction: column;
    }
  }
</style>
