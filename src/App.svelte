<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Sidebar from "./components/Sidebar.svelte";
  import Home from "./routes/Home.svelte";
  import Post from "./routes/Post.svelte";
  import Admin from "./routes/Admin.svelte";
  import Loading from "./components/Loading.svelte";
  import Error from "./components/Error.svelte";
  import { getFetchPosts } from "./core/app/states/getFetchPosts";
  import { selectedPost } from "./core/app/states/selectedPost";

  import type { ComponentType } from "svelte";

  let loading = true;
  let error = "";
  let currentRoute = "/";

  function handleRouteChange() {
    currentRoute = window.location.pathname;
    if (currentRoute === "/") {
      selectedPost.set(null);
    }
  }

  onMount(async () => {
    window.addEventListener("popstate", handleRouteChange);
    handleRouteChange();

    if (currentRoute === "/" || currentRoute.startsWith("/posts")) {
      try {
        await getFetchPosts();
      } catch (e) {
        error = "블로그를 불러오는데 실패했습니다.";
      } finally {
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  onDestroy(() => {
    window.removeEventListener("popstate", handleRouteChange);
  });

  interface ViewState {
    component: ComponentType;
    props?: Record<string, any>;
  }

  $: view = (() => {
    if (loading) return { component: Loading } as ViewState;
    if (error) return { component: Error, props: { message: error } } as ViewState;
    if (currentRoute.startsWith("/admin")) return { component: Admin } as ViewState;
    if ($selectedPost) return { component: Post } as ViewState;
    return { component: Home } as ViewState;
  })();
</script>

<svelte:head>
  <title>최다루한의 블로그</title>
  <meta name="description" content="개인 블로그" />
</svelte:head>

<div class="app-container">
  <Sidebar />

  <main class="main-content">
    <svelte:component this={view.component} {...(view.props || {})} />
  </main>
</div>
