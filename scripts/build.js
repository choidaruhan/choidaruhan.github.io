/**
 * build.js — posts/*.md → posts-data.js (ES module)
 *
 * 사용법:
 *   node scripts/build.js
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "posts");
const OUTPUT = join(__dirname, "..", "posts-data.js");

function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)/);
  if (!m) return { meta: {}, body: raw.trim() };

  const body = m[2].trim();
  const fm = m[1];
  const meta = {};
  const lines = fm.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.match(/^-\s/)) continue; // list item, handled by parent key

    const kv = line.match(/^([\w]+):\s*(.*)/);
    if (!kv) continue;

    const key = kv[1];
    let val = kv[2].trim();

    // multi-line YAML list (e.g. tags:)
    if (val === "") {
      const items = [];
      while (i + 1 < lines.length && lines[i + 1].match(/^\s+-\s/)) {
        i++;
        items.push(lines[i].replace(/^\s*-\s*/, "").trim());
      }
      meta[key] = items;
    } else {
      // strip surrounding quotes
      if (
        (val[0] === '"' && val[val.length - 1] === '"') ||
        (val[0] === "'" && val[val.length - 1] === "'")
      ) {
        val = val.slice(1, -1);
      }
      meta[key] = val;
    }
  }

  return { meta, body };
}

async function build() {
  const files = (await readdir(POSTS_DIR))
    .filter((f) => f.endsWith(".md"))
    .sort();

  const posts = [];
  let id = 1;

  for (const file of files) {
    const raw = await readFile(join(POSTS_DIR, file), "utf-8");
    const { meta, body } = parseFrontmatter(raw);

    posts.push({
      id: id++,
      title: meta.title || file,
      date: meta.date || "",
      tags: meta.tags || [],
      content: body,
    });
  }

  posts.sort((a, b) => b.date.localeCompare(a.date)); // 최신순

  const js =
    [
      "// 이 파일은 scripts/build.js 로 자동 생성됩니다. 직접 수정하지 마세요.",
      `// 빌드 시각: ${new Date().toISOString()}`,
      `const posts = ${JSON.stringify(posts, null, 2)};`,
      `export default posts;`,
    ].join("\n") + "\n";

  await writeFile(OUTPUT, js, "utf-8");
  console.log(
    `\n\x1b[92m\u2713\x1b[0m Generated posts-data.js with \x1b[93m${posts.length}\x1b[0m posts`,
  );
  posts.forEach((p) => console.log(`   \u2022 ${p.date}  ${p.title}`));
}

build().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
