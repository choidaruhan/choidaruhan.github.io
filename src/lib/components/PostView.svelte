<script lang="ts">
  import { selectedPost } from "@/lib/stores/posts.store";
  import { renderMarkdown } from "@/lib/utils/markdown";
  import { formatPostDate } from "@/lib/utils/date";

  $: displayedPost = $selectedPost;
</script>

{#if displayedPost}
  <article class="post-view">
    <header class="post-header">
      <h1 class="post-title">{displayedPost.title}</h1>
      <time class="post-date">{formatPostDate(displayedPost)}</time>
    </header>

    <div class="post-content">
      {@html renderMarkdown(displayedPost.content || displayedPost.body || "")}
    </div>
  </article>
{:else}
  <div class="no-post">
    <p>글을 선택해주세요</p>
  </div>
{/if}

<style>
  .post-view {
    max-width: 800px;
    margin: 0 auto;
    padding: 40px 24px;
    background: #fff;
    min-height: 100%;
  }

  .post-header {
    margin-bottom: 32px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }

  .post-title {
    margin: 0 0 8px 0;
    font-size: 2rem;
    color: #1a1a2e;
    line-height: 1.3;
  }

  .post-date {
    font-size: 0.9rem;
    color: #888;
  }

  .post-content {
    line-height: 1.8;
    color: #333;
  }

  .post-content :global(h1),
  .post-content :global(h2),
  .post-content :global(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    color: #1a1a2e;
  }

  .post-content :global(p) {
    margin: 1em 0;
  }

  .post-content :global(code) {
    background: #f4f4f5;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .post-content :global(pre) {
    background: #1a1a2e;
    color: #eee;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
  }

  .post-content :global(pre code) {
    background: transparent;
    padding: 0;
  }

  .post-content :global(ul),
  .post-content :global(ol) {
    padding-left: 24px;
  }

  .post-content :global(blockquote) {
    margin: 1em 0;
    padding: 12px 20px;
    border-left: 4px solid #6366f1;
    background: #f9fafb;
    color: #555;
  }

  .no-post {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 300px;
    color: #888;
  }
</style>
