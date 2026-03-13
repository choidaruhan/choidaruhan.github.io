# 데이터베이스 명세 (Database Specification)

이 프로젝트에서 사용되는 데이터 저장소 구조를 명세합니다.

## 1. 개요

- **플랫폼**: Cloudflare D1 (SQLite 기반)
- **용도**: 블로그 포스트, 태그, 설정값 저장

## 2. 테이블 구조

### posts

- `id`: INTEGER (PK, Autoincrement)
- `title`: TEXT (제목)
- `content`: TEXT (본문)
- `createdAt`: DATETIME (생성일)

## 목적

- 시스템에서 다루는 데이터의 구조와 타입을 명확히 정의하여 데이터 무결성을 유지합니다.
