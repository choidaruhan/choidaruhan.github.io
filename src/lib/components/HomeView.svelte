<script lang="ts">
  import { filteredPosts, loading, selectedPost } from "@/lib/stores/posts.store";
  import { formatPostDate } from "@/lib/utils/date";

  function selectPost(post: any) {
    selectedPost.set(post);
  }
</script>

<section class="home-view">
  <div class="intro">
    <h1>블로그에 오신 것을 환영합니다</h1>
    <p>다양한 글들을 읽어보세요</p>
  </div>

  {#if $loading}
    <div class="loading">로딩 중...</div>
  {:else if $filteredPosts.length === 0}
    <div class="no-posts">아직 작성된 글이 없습니다.</div>
  {:else}
    <div class="posts-grid">
      {#each $filteredPosts as post (post.id)}
        <button 
          class="post-card"
          on:click={() => selectPost(post)}
          type="button"
        >
          <h2 class="post-title">{post.title}</h2>
          <time class="post-date">{formatPostDate(post)}</time>
          <p class="post-preview">
            {(post.content || post.body || '').slice(0, 150)}...
          </p>
        </button>
      {/each}
    </div>
  {/if}
</section>

<style>
  .home-view {
    max-width: 900px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .intro {
    text-align: center;
    margin-bottom: 48px;
  }

  .intro h1 {
    font-size: 2rem;
    margin: 0 0 8px 0;
    color: #1a1a2e;
  }

  .intro p {
    color: #666;
    margin: 0;
  }

  .loading, .no-posts {
    text-align: center;
    color: #888;
    padding: 40px;
  }

  .posts-grid {
    display: grid;
    gap: 24px;
  }

  .post-card {
    padding: 24px;
    border: 1px solid #eee;
    border-radius: 12px;
    background: #fff;
    cursor: pointer;
    transition: box-shadow 0.2s, transform 0.2s;
    text-align: left;
    width: 100%;
    font-family: inherit;
  }

  .post-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  .post-card:focus {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }

  .post-title {
    margin: 0 0 8px 0;
    font-size: 1.25rem;
    color: #1a1a2e;
  }

  .post-date {
    font-size: 0.85rem;
    color: #888;
  }

  .post-preview {
    margin: 12px 0 0 0;
    color: #555;
    line-height: 1.6;
  }
</style>
