import postsData from "./posts-data.js";

const postList = document.getElementById("post-list");
const postDetail = document.getElementById("post-detail");
const searchInput = document.getElementById("search");
const themeToggle = document.getElementById("theme-toggle");
const logo = document.getElementById("logo");

let posts = [...postsData];

function initTheme() {
  const saved = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = saved || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  themeToggle.textContent = next === "dark" ? "☀️" : "🌙";
}

function renderPostList(filteredPosts) {
  postDetail.classList.add("hidden");
  postList.classList.remove("hidden");

  if (filteredPosts.length === 0) {
    postList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    return;
  }

  postList.innerHTML = filteredPosts
    .map(
      (post) => `
    <div class="post-card" data-id="${post.id}">
      <h2>${escapeHtml(post.title)}</h2>
      <div class="meta">
        <span>${post.date}</span>
        <div class="tags">${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
      </div>
      <p class="excerpt">${escapeHtml(post.content.split("\n")[0])}</p>
    </div>
  `,
    )
    .join("");
}

function showPostDetail(id) {
  const post = posts.find((p) => p.id === id);
  if (!post) return;

  postList.classList.add("hidden");
  postDetail.classList.remove("hidden");

  postDetail.innerHTML = `
    <button class="back-btn">← 목록으로</button>
    <h2>${escapeHtml(post.title)}</h2>
    <div class="meta">
      <span>${post.date}</span>
      <div class="tags">${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div>
    </div>
    <div class="content markdown-body">${markdownToHtml(post.content)}</div>
  `;
}

function filterPosts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return posts;
  return posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q) ||
      p.content.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q)),
  );
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function markdownToHtml(md) {
  let html = escapeHtml(md);

  // Code blocks (``` ... ```)
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    return `<pre><code class="language-${escapeHtml(lang)}">${code.trim()}</code></pre>`;
  });

  // Inline code (` ... `)
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");

  // Headers (###### to #)
  html = html.replace(/^######\s+(.+)$/gm, "<h6>$1</h6>");
  html = html.replace(/^#####\s+(.+)$/gm, "<h5>$1</h5>");
  html = html.replace(/^####\s+(.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^###\s+(.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^##\s+(.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");

  // Bold (** ... **)
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Italic (* ... *)
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Strikethrough (~~ ... ~~)
  html = html.replace(/~~(.+?)~~/g, "<del>$1</del>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Images ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" style="max-width:100%">',
  );

  // Unordered list items (- or *)
  html = html.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");

  // Ordered list items (1. 2. etc.)
  html = html.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Wrap consecutive <li> in <ul>
  html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");

  // Blockquotes
  html = html.replace(/^&gt;\s+(.+)$/gm, "<blockquote>$1</blockquote>");

  // Horizontal rule
  html = html.replace(/^---$/gm, "<hr>");

  // Paragraphs
  const blockTags = /^<(h[1-6]|ul|ol|li|pre|blockquote|hr|div|p|table)/;
  const lines = html.split("\n");
  const result = [];
  let inParagraph = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") {
      if (inParagraph) {
        result.push("</p>");
        inParagraph = false;
      }
    } else if (blockTags.test(line)) {
      if (inParagraph) {
        result.push("</p>");
        inParagraph = false;
      }
      result.push(lines[i]);
    } else {
      if (!inParagraph) {
        result.push("<p>");
        inParagraph = true;
      }
      result.push(lines[i]);
    }
  }
  if (inParagraph) result.push("</p>");

  return result.join("\n");
}

// Initial render
renderPostList(posts);

postList.addEventListener("click", (e) => {
  const card = e.target.closest(".post-card");
  if (card) showPostDetail(Number(card.dataset.id));
});

postDetail.addEventListener("click", (e) => {
  if (e.target.classList.contains("back-btn")) {
    renderPostList(filterPosts(searchInput.value));
  }
});

searchInput.addEventListener("input", (e) => {
  if (!postList.classList.contains("hidden")) {
    renderPostList(filterPosts(e.target.value));
  }
});

logo.addEventListener("click", (e) => {
  e.preventDefault();
  searchInput.value = "";
  renderPostList(posts);
});

themeToggle.addEventListener("click", toggleTheme);

initTheme();
