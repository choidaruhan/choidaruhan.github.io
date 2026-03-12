import { marked } from "marked";
import DOMPurify from "dompurify";

export function renderMarkdown(md: string | null | undefined): string {
  if (!md) return "";

  // 마크다운을 HTML로 변환
  const rawHtml = String(marked.parse(md));

  // XSS 보호를 위해 HTML 정화 (브라우저용)
  return DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ["del", "ins", "sub", "sup", "kbd", "mark"],
    ADD_ATTR: ["target", "rel"]
  });
}
