# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Communication Style

개인 저장소용 인터넷체를 사용할 것. 존댓말 및 너무 딱딱한 문체는 금지.

## Project Overview

GitHub Pages 정적 블로그 (`ramgaku.github.io`). 바닐라 JS로 구현된 SPA. UI는 한국어.

## Architecture

```
ramgaku.github.io/
├── index.html          # 메인 페이지 (SPA)
├── blog.js             # 블로그 핵심 로직 (마크다운 파싱, 라우팅)
├── blog.css            # 스타일
├── snow.js             # 눈 내리는 효과
├── blackholespace.html # 블랙홀 시뮬레이션 (standalone)
├── posts/
│   ├── index.json      # 게시물 목록 레지스트리
│   ├── playground/     # Playground 카테고리
│   ├── web/            # Web 카테고리
│   └── trouble/        # 삽질 기록 카테고리
└── .nojekyll           # Jekyll 비활성화
```

## Blog System

- 게시물은 `posts/<category>/<id>.txt` 형식으로 저장
- **주의: .md 확장자 사용 금지** - GitHub Pages에서 404 에러 발생함. 반드시 `.txt` 사용
- Front matter (YAML 형식) + 마크다운 본문 구조
- 새 게시물 추가 시:
  1. `posts/<category>/<id>.txt` 파일 생성
  2. `posts/index.json`에 등록
  3. `index.html` 사이드바에 링크 추가

## Comment System

Giscus (GitHub Discussions 기반) 사용. 설정값은 `blog.js` 상단에 있음.

## Development

```bash
npx serve .
```

로컬 file:// 프로토콜에서는 Giscus 댓글이 작동 안 함 (배포 후 테스트 필요).

**서버 종료 시 주의사항:**
- 서버 띄울 때 사용한 포트 번호 기억해둘 것
- 종료 요청 시 `netstat -ano | findstr :<포트번호>` 로 LISTENING 상태 확인
- 아직 살아있으면 `taskkill //PID <PID번호> //F` 로 직접 종료
- 거짓말하지 말고 직접 확인 후 보고할 것

## Deployment

`main` 브랜치에 푸시하면 GitHub Pages로 자동 배포.

## Google AdSense

- Publisher ID: `ca-pub-2234620038718524`
- 광고 슬롯 (수직): `5521900934`
- 광고 위치: 우측 TOC 네비게이터 하단 (`.toc-lower`)
- `ads.txt` 파일 루트에 있음
- 로컬에서는 광고 테스트 불가 (승인된 도메인에서만 작동)
- GDPR 동의 메시지: 3가지 선택사항으로 설정됨 (EEA/영국/스위스 사용자 대상)
