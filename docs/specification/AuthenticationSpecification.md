# 인증 명세 (Authentication Specification)

이 프로젝트는 보안을 위해 Cloudflare Access를 사용하여 관리자 인증을 수행합니다.

## 1. 인증 아키텍처

- **플랫폼**: Cloudflare Access
- **메커니즘**: JWT (JSON Web Token) 기반 인증
- **흐름**:
  1. 사용자가 Cloudflare Access를 통해 로그인합니다.
  2. 요청 헤더에 `Cf-Access-Jwt-Assertion` 토큰이 발급됩니다.
  3. Worker 애플리케이션에서 해당 토큰의 서명과 유효 기간을 검증합니다.

## 2. JWT 검증 과정

JWT 검증은 `jose` 라이브러리를 사용하여 수행하며, 다음 단계를 거칩니다.

1. **토큰 추출**: 요청 헤더에서 `Cf-Access-Jwt-Assertion` 값을 읽습니다.
2. **JWKS 로드**: `https://<ACCESS_TEAM_DOMAIN>/cdn-cgi/access/certs` 경로에서 공개 키 세트(JWKS)를 가져옵니다.
3. **서명 검증**: 공개 키를 사용하여 토큰의 서명이 위조되지 않았는지 확인합니다.
4. **페이로드 체킹**:
   - `iss`: 발급자가 예상한 `ACCESS_TEAM_DOMAIN`인지 확인합니다.
   - `aud`: 대상(Audience)이 설정된 `ACCESS_AUDIENCE`와 일치하는지 확인합니다.
   - `exp`: 토큰이 만료되지 않았는지 확인합니다.

## 3. 환경 변수 설정 (`wrangler.toml`)

인증이 정상적으로 작동하려면 다음 변수가 올바르게 설정되어야 합니다.

- `ACCESS_TEAM_DOMAIN`: Cloudflare Access 팀 도메인 (예: `your-team.cloudflareaccess.com`)
- `ACCESS_AUDIENCE`: 어플리케이션의 Application Audience TAG

## 4. 로컬 개발 환경

- `.dev.vars` 파일의 `ALLOW_LOCAL_AUTH` 변수를 통해 로컬에서 인증을 우회하거나 테스트용 세션을 사용할 수 있습니다.

## 목적

- 보안이 핵심인 관리자 기능에 대해 인증 처리 과정을 투명하게 기록하여 보안 취약점을 방지하고 운영 효율성을 높입니다.
