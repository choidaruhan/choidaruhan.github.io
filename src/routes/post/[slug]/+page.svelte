<script lang="ts">
  import { posts } from "@/core/app/states/posts";
  import type { Post } from "@/core/shared/types/Post";
  import { renderMarkdown } from "@/core/domain/posts/renderMarkdown";
  import { formatPostDate } from "@/core/shared/utils/formatPostDate";
  import { page } from "$app/stores";

  $: slug = $page.params.slug;
  $: displayedPost = ($posts as Post[]).find((p: Post) => p.slug === slug);
</script>

{#if displayedPost}
  <article class="post-view">
    <header class="post-header">
      <h1 class="post-title">{displayedPost.title}</h1>
      <time class="post-date">{formatPostDate(displayedPost)}</time>
    </header>

    <div class="post-content">
      {@html renderMarkdown(displayedPost.content || "")}
    </div>
  </article>
{:else}
  <div class="no-post">
    <p>글을 찾을 수 없습니다.</p>
  </div>
{/if}
