# ramgaku.github.io

GitHub Pages로 호스팅되는 개인 블로그입니다.

## 구조

```
ramgaku.github.io/
├── posts/
│   ├── index.json      # 게시물 목록 인덱스
│   ├── web/            # Web 카테고리
│   ├── playground/     # Playground 카테고리
│   └── trouble/        # 삽질 기록 카테고리
├── css/                # 스타일시트
├── js/                 # JavaScript
├── sitemap.xml         # SEO
└── robots.txt          # SEO
```

## 게시물 형식

게시물은 `.txt` 파일로 저장되며 YAML Front Matter를 사용합니다:

```yaml
---
title: 게시물 제목
description: 설명
date: 2025-12-01
tags: [tag1, tag2]
---

# 본문 (마크다운)
```

## 게시물 인덱스 (posts/index.json)

```json
{
  "posts": [
    {
      "id": "post-id",
      "path": "posts/web/post-id.txt",
      "category": "Web"
    }
  ]
}
```

## 배포

GitHub에 push하면 자동으로 GitHub Pages에 배포됩니다.

```bash
git add .
git commit -m "메시지"
git push origin main
```

## 관련 도구

- **GitBlogEditor**: 블로그 관리용 Node.js 도구 (별도 레포)
