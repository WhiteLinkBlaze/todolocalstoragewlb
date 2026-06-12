# [프로젝트명] — CLAUDE.md

## 기본 설정

- 항상 한국어로 응답한다.
- 응답은 짧고 압축적으로 유지한다 (`/caveman` 기본 적용).
- 코드를 바로 작성하지 않는다. 구현 전 `/grill-with-docs`로 요구사항을 먼저 정렬한다.

---

## Agent Skills

> mattpocock/skills 설치: `npx skills@latest add mattpocock/skills`
> 초기 세팅: `/setup-matt-pocock-skills` 한 번 실행 후 아래 내용이 채워짐

### 이슈 트래커

<!-- /setup-matt-pocock-skills 실행 후 자동 채워짐 -->
<!-- 예: GitHub Issues / Linear / 로컬 파일 기반 -->

### 트리아지 라벨

<!-- /setup-matt-pocock-skills 실행 후 자동 채워짐 -->

### 도메인 문서 위치

<!-- /setup-matt-pocock-skills 실행 후 자동 채워짐 -->
<!-- 예: docs/agents/domain.md -->

---

## 스킬 사용 가이드

| 스킬 | 언제 쓰나 |
|------|-----------|
| `/grill-with-docs` | 새 기능·설계 시작 전. 요구사항·도메인 용어 정렬 |
| `/to-prd` | 합의 후 PRD 문서로 고정 |
| `/to-issues` | PRD → 실행 가능한 세로 슬라이스 이슈로 분해 |
| `/tdd` | 각 이슈 구현 (Red→Green→Refactor) |
| `/diagnose` | 버그·장애 원인 분석. 재현 루프 먼저 |
| `/improve-codebase-architecture` | 구조 개선 필요 시. 먼저 후보 제시 후 선택 |
| `/caveman` | 응답이 장황해질 때 재활성화 |

---

## 작업 흐름

```
새 기능
  └─ /grill-with-docs → /to-prd → /to-issues → /tdd

버그
  └─ /diagnose → /tdd (회귀 테스트)

구조 개선
  └─ /improve-codebase-architecture → /tdd
```

---

## 프로젝트별 제약

<!-- 아래 항목을 실제 프로젝트에 맞게 채운다 -->

- **언어/프레임워크:** 
- **빌드 도구:** 
- **테스트 전략:** 
- **DB:** 
- **배포 환경:** 
