<script lang="ts">
  import { selectedPost } from "@/core/app/states/selectedPost";
  import { renderMarkdown } from "@/core/domain/posts/renderMarkdown";
  import { formatPostDate } from "@/core/shared/utils/formatPostDate";

  $: displayedPost = $selectedPost;
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
    <p>글을 선택해주세요</p>
  </div>
{/if}
