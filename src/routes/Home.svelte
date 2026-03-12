<script lang="ts">
  import { filteredPosts } from "@/core/stores/filteredPosts";
  import { loading } from "@/core/stores/loading";
  import { selectedPost } from "@/core/stores/selectedPost";
  import { formatPostDate } from "@/core/utils/formatPostDate";

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
            {(post.content || "").slice(0, 150)}...
          </p>
        </button>
      {/each}
    </div>
  {/if}
</section>
