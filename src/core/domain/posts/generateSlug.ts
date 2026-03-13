/**
 * 제목을 기반으로 URL용 슬러그를 생성합니다.
 * @param title 게시글 제목
 * @returns 생성된 슬러그
 */
export function generateSlug(title: string): string {
  if (!title) return "";
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9가-힣]/g, "-") // 영문, 숫자, 한글 제외 제거
    .replace(/-+/g, "-")            // 연속된 하이픈 하나로 축소
    .replace(/^-|-$/g, "");         // 앞뒤 하이픈 제거
}
