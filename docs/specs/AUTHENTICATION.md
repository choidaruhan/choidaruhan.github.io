# Authentication (인증)

Cloudflare Access 및 JWT 기반 인증 흐름입니다.

## 인증 방식
- **JWT 기반**: Cloudflare Access에서 발급한 JWT를 사용합니다.
- **인증 헤더**: Worker에서 `Cf-Access-Jwt-Assertion` 헤더를 통해 사용자 신원을 확인합니다.

## 자동 리디렉션 흐름
1. 사용자가 `/write` 접근.
2. 프론트엔드(`onMount`)에서 `/auth/me` 호출.
3. `401 Unauthorized` 발생 시 `/login`으로 이동.
4. `/login`에서 Cloudflare Access 로그인 수행 후 다시 `/write`로 복귀.

---
*Last Updated: 2026-03-13*
