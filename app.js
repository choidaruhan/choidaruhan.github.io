const postList = document.getElementById('post-list');
const postDetail = document.getElementById('post-detail');
const searchInput = document.getElementById('search');
const themeToggle = document.getElementById('theme-toggle');
const logo = document.getElementById('logo');

let posts = [];

function initTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
}

function renderPostList(filteredPosts) {
  postDetail.classList.add('hidden');
  postList.classList.remove('hidden');

  if (filteredPosts.length === 0) {
    postList.innerHTML = '<p class="no-results">검색 결과가 없습니다.</p>';
    return;
  }

  postList.innerHTML = filteredPosts.map(post => `
    <div class="post-card" data-id="${post.id}">
      <h2>${escapeHtml(post.title)}</h2>
      <div class="meta">
        <span>${post.date}</span>
        <div class="tags">${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
      </div>
      <p class="excerpt">${escapeHtml(post.content.split('\n')[0])}</p>
    </div>
  `).join('');
}

function showPostDetail(id) {
  const post = posts.find(p => p.id === id);
  if (!post) return;

  postList.classList.add('hidden');
  postDetail.classList.remove('hidden');

  postDetail.innerHTML = `
    <button class="back-btn">← 목록으로</button>
    <h2>${escapeHtml(post.title)}</h2>
    <div class="meta">
      <span>${post.date}</span>
      <div class="tags">${post.tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>
    </div>
    <div class="content">${escapeHtml(post.content)}</div>
  `;
}

function filterPosts(query) {
  const q = query.toLowerCase().trim();
  if (!q) return posts;
  return posts.filter(p =>
    p.title.toLowerCase().includes(q) ||
    p.content.toLowerCase().includes(q) ||
    p.tags.some(t => t.toLowerCase().includes(q))
  );
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadPosts() {
  const res = await fetch('posts.json');
  posts = await res.json();
  posts.sort((a, b) => b.date.localeCompare(a.date));
  renderPostList(posts);
}

postList.addEventListener('click', e => {
  const card = e.target.closest('.post-card');
  if (card) showPostDetail(Number(card.dataset.id));
});

postDetail.addEventListener('click', e => {
  if (e.target.classList.contains('back-btn')) {
    renderPostList(filterPosts(searchInput.value));
  }
});

searchInput.addEventListener('input', e => {
  if (!postList.classList.contains('hidden')) {
    renderPostList(filterPosts(e.target.value));
  }
});

logo.addEventListener('click', e => {
  e.preventDefault();
  searchInput.value = '';
  renderPostList(posts);
});

themeToggle.addEventListener('click', toggleTheme);

initTheme();
loadPosts();
