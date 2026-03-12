<script lang="ts">
  import { selectedPost } from "@/lib/stores/selectedPost";
  import { renderMarkdown } from "@/lib/utils/renderMarkdown";
  import { formatPostDate } from "@/lib/utils/formatPostDate";

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
