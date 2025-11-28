---
title: GitHub Pages 블로그에 댓글 시스템 연동하기 (Giscus)
category: Web
date: 2024
---

## 소개

GitHub Pages 정적 사이트에 댓글 기능을 추가하는 방법.

기존에 Cusdis를 썼는데, 매번 관리자가 승인해야 댓글이 보이는 번거로움이 있어서 Giscus로 변경했다.

## 왜 Giscus인가

정적 사이트 댓글 시스템 비교:

- **Cusdis** - 익명 가능, 근데 관리자 승인 필요 (번거로움)
- **Disqus** - 광고 있고 무거움
- **utterances** - GitHub Issues 기반, 가벼움
- **Giscus** - GitHub Discussions 기반, 승인 불필요, 리액션 지원

Giscus가 가장 깔끔하고 GitHub Pages와 찰떡궁합이라 선택.

## 설정 방법

1. GitHub repo Settings → Features → **Discussions 활성화**
2. [giscus.app](https://giscus.app/ko) 접속
3. Repository에 `username/repo-name` 입력
4. Discussion 카테고리 선택 (보통 Announcements)
5. 생성된 script 코드 복사

## 코드 적용

giscus.app에서 생성된 코드 예시:

```html
<script src="https://giscus.app/client.js"
    data-repo="username/repo-name"
    data-repo-id="R_xxxxxx"
    data-category="Announcements"
    data-category-id="DIC_xxxxxx"
    data-mapping="pathname"
    data-theme="dark"
    data-lang="ko"
    crossorigin="anonymous"
    async>
</script>
```

동적으로 로드하려면 JavaScript로 script 엘리먼트를 생성해서 추가하면 됨.

주의: 로컬 file:// 환경에서는 보안 정책 때문에 작동 안 함. 배포 후 테스트 필요.
