<script lang="ts">
  import { onMount } from "svelte";
  import { fetchPost } from "@/core/infra/api/client/fetchPost";
  import { createPost } from "@/core/infra/api/client/createPost";
  import { updatePost } from "@/core/infra/api/client/updatePost";
  import { API_BASE } from "@/core/app/constants/API_BASE";
  import type { Post } from "@/core/shared/types/Post";

  let title = "";
  let content = "";
  let slug = "";
  let user: { email: string; name?: string } | null = null;
  let editingId: number | null = null;
  let message = "";
  let error = "";
  let loading = false;
  let checkingAuth = true;

  onMount(async () => {
    // Check authentication via Cloudflare Access
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        credentials: "include",
      });
      if (res.ok) {
        // If already authenticated, go to write page
        window.location.href = "/write";
      } else {
        user = null;
        // Optionally auto-trigger login if you want it seamless
        // login(); 
      }
    } catch (e) {
      user = null;
      error = "인증 확인에 실패했습니다.";
      console.error("Auth check failed:", e);
    } finally {
      checkingAuth = false;
    }

    // Check for edit mode via URL params
    const url = new URL(window.location.href);
    const editId = url.searchParams.get("edit");
    if (editId && user) {
      editingId = parseInt(editId);
      try {
        loading = true;
        const post = await fetchPost(editingId, `${API_BASE}/api`);
        title = post.title;
        content = post.content;
        slug = post.slug || "";
      } catch (err: any) {
        error =
          "글을 불러오는데 실패했습니다: " + (err.message || "Unknown error");
      } finally {
        loading = false;
      }
    }
  });

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    error = "";
    message = "";

    if (!title.trim() || !content.trim()) {
      error = "제목과 내용을 모두 입력해주세요.";
      return;
    }

    if (!user) {
      error = "인증이 필요합니다.";
      return;
    }

    const postData = {
      title: title.trim(),
      content: content.trim(),
      slug: slug.trim() || undefined,
    };

    try {
      loading = true;
      if (editingId) {
        await updatePost(editingId, postData, `${API_BASE}/api`);
        message = "글이 수정되었습니다.";
      } else {
        await createPost(postData, `${API_BASE}/api`);
        message = "글이 작성되었습니다.";
        title = "";
        content = "";
        slug = "";
        editingId = null;
      }
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (err: any) {
      if (
        err.message === "Unauthorized" ||
        err.message.includes("401") ||
        err.message.toLowerCase().includes("unauthorized")
      ) {
        error = "세션이 만료되었습니다. 다시 로그인해주세요.";
        user = null;
      } else {
        error = err.message || "오류가 발생했습니다.";
      }
    } finally {
      loading = false;
    }
  }

  function generateSlug() {
    if (title && !slug) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9가-힣]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
    }
  }

  function login() {
    const redirectTo = encodeURIComponent(window.location.href);
    window.location.href = `${API_BASE}/auth/login?redirect_to=${redirectTo}`;
  }

  function logout() {
    const redirectTo = encodeURIComponent(window.location.origin);
    window.location.href = `${API_BASE}/auth/logout?redirect_to=${redirectTo}`;
  }
</script>

  {#if !checkingAuth && !user}
    <div class="login-prompt">
      <p>관리자 기능에 접근하려면 로그인이 필요합니다.</p>
      <button on:click={login} class="login-btn"
        >Cloudflare Access로 로그인</button
      >
    </div>
  {/if}
