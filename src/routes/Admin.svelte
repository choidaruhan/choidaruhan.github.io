<script lang="ts">
  import { onMount } from "svelte";
  import { BlogApiClient } from "@/lib/api/blogApi";
  import { API_BASE } from "@/lib/config";
  import type { Post } from "@/lib/api/blogApi";

  const api = new BlogApiClient(API_BASE);

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
        const data = (await res.json()) as {
          user: { email: string; name?: string };
        };
        user = data.user;
      } else {
        user = null;
        error = "글을 작성하려면 Cloudflare Access 인증이 필요합니다.";
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
        const post = await api.fetchPost(editingId);
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
        await api.updatePost(editingId, postData);
        message = "글이 수정되었습니다.";
      } else {
        await api.createPost(postData);
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

<div class="admin-container">
  <div class="header">
    <h1>{editingId ? "✏️ 글 수정" : "📝 새 글 작성"}</h1>
    {#if user}
      <div class="user-info">
        <span>{user.name || user.email}님 환영합니다</span>
        <button on:click={logout} class="logout-btn">로그아웃</button>
      </div>
    {/if}
  </div>

  {#if checkingAuth}
    <div class="loading">인증 확인 중...</div>
  {:else if !user}
    <div class="login-prompt">
      <p>글을 작성하려면 Cloudflare Access 인증이 필요합니다.</p>
      <p class="hint">
        이 사이트는 Cloudflare Access로 보호되어 있습니다.<br />
        관리자에게 접근 권한을 요청하세요.
      </p>
      <button on:click={login} class="login-btn"
        >Cloudflare Access 로그인</button
      >
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

  {#if user && !checkingAuth}
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
        <small
          >수정 시 slug는 변경할 수 없습니다. 새 글 작성 시에만 사용 가능합니다.</small
        >
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
          {editingId ? "수정하기" : "작성하기"}
        </button>
        <a href="/" class="cancel-btn">취소</a>
      </div>
    </form>
  {/if}
</div>
