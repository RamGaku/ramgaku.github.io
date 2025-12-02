# ramgaku.github.io

GitHub Pages 블로그.

## 작성 규칙

- 문서/코드에 꾸미는 말, 감성적 표현 사용 금지
- 간결하고 사실적인 설명만 작성
- **AI가 쓴 느낌 배제**: 이모지 남발 금지, "~해보세요!", "~할 수 있어요" 같은 친절체 금지, 반말 사용, 자연스러운 개발자 문체 유지
- **일관성 유지**: 게시물 구조/형식 변경 시 다른 게시물들에도 동일하게 적용되었는지 검토할 것

## ⚠️ 중요: 게시물 작성 시 반드시 GitBlogEditor API 사용

**게시물 생성/수정/삭제 시 파일을 직접 수정하지 말 것!**

GitBlogEditor 서버가 실행 중이면 반드시 API를 통해 작업:

```bash
# 서버 실행 (GitBlogEditor 디렉토리에서)
npm start

# 게시물 생성
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"id":"post-id","category":"Web","content":"---\ntitle: 제목\n---\n본문"}'

# 게시물 수정
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"id":"existing-post-id","category":"Web","content":"수정된 내용"}'

# 게시물 삭제
curl -X DELETE http://localhost:3001/api/posts/post-id
```

API가 index.json과 index.html 사이드바를 자동으로 업데이트함.

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
