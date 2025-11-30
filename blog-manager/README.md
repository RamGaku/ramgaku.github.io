# Blog Manager 🚀

GitHub Pages 블로그를 위한 통합 관리 도구입니다. CLI와 웹 UI를 모두 지원하여 편리한 블로그 관리를 제공합니다.

## 주요 기능

### 🌐 웹 UI
- **실시간 마크다운 에디터**: Monaco Editor 기반 문법 하이라이팅
- **라이브 미리보기**: 실시간 마크다운 렌더링
- **웹 터미널**: 브라우저에서 직접 터미널 명령어 실행
- **파일 감시**: 실시간 파일 변경 감지 및 동기화
- **드래그 앤 드롭**: 직관적인 UI

### 💻 CLI 도구
- **게시물 관리**: 생성, 편집, 목록 조회
- **미리보기 서버**: 로컬 개발 서버 실행
- **자동 배포**: git add, commit, push 원클릭 실행
- **대화형 인터페이스**: 단계별 가이드

## 설치 및 실행

### 1. 의존성 설치
```bash
cd blog-manager
npm install
```

### 2. 웹 UI 실행
```bash
npm start
# 또는
node cli/index.js preview
```

브라우저에서 `http://localhost:3001` 접속

### 3. CLI 사용
```bash
# 게시물 목록
node cli/index.js list

# 새 게시물 생성
node cli/index.js new "제목"

# 게시물 편집
node cli/index.js edit <post-id>

# 블로그 배포
node cli/index.js deploy
```

## 웹 UI 가이드

### 📝 에디터 탭
- **게시물 작성**: Monaco Editor로 마크다운 작성
- **실시간 저장**: Ctrl+S로 저장
- **문법 하이라이팅**: 마크다운 문법 지원
- **자동완성**: 스마트한 코드 완성

### 👁️ 미리보기 탭
- **실시간 렌더링**: 타이핑과 동시에 HTML 변환
- **스타일 적용**: 실제 블로그와 동일한 렌더링
- **스크롤 동기화**: 에디터와 미리보기 동기화

### 💻 터미널 탭
- **실시간 터미널**: 웹에서 cmd/bash 실행
- **Git 명령어**: add, commit, push 등 실행
- **파일 조작**: 파일 생성, 삭제, 이동
- **로그 확인**: 실시간 명령어 결과 확인

## CLI 명령어 상세

### `blog new [title]`
새 게시물을 생성합니다.

```bash
# 대화형 모드
blog new

# 직접 입력
blog new "새로운 게시물"

# 카테고리 지정
blog new "게시물 제목" -c playground
```

**옵션:**
- `-c, --category <category>`: 카테고리 지정 (web, playground, trouble)

### `blog list [options]`
게시물 목록을 표시합니다.

```bash
# 전체 목록
blog list

# 특정 카테고리
blog list -c web
```

### `blog edit <id>`
기존 게시물을 편집합니다.

```bash
blog edit firebase-ranking-system
```

### `blog preview [options]`
미리보기 서버를 실행합니다.

```bash
# 기본 포트 (3001)
blog preview

# 포트 지정
blog preview -p 8080
```

### `blog deploy [message]`
블로그를 배포합니다.

```bash
# 기본 커밋 메시지
blog deploy

# 커밋 메시지 지정
blog deploy "새 게시물 추가"

# 단계별 실행
blog deploy --no-push  # push 제외
```

**옵션:**
- `--no-add`: git add 건너뛰기
- `--no-commit`: git commit 건너뛰기  
- `--no-push`: git push 건너뛰기

## 프로젝트 구조

```
blog-manager/
├── cli/                    # CLI 명령어
│   └── index.js
├── server/                 # Express.js 서버
│   └── app.js
├── web-ui/                 # 웹 UI 파일
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── package.json
└── README.md
```

## 기술 스택

### Backend
- **Node.js**: JavaScript 런타임
- **Express.js**: 웹 서버 프레임워크
- **Socket.io**: 실시간 양방향 통신
- **Commander.js**: CLI 프레임워크
- **Inquirer.js**: 대화형 CLI
- **Chokidar**: 파일 감시

### Frontend  
- **Monaco Editor**: VS Code 기반 에디터
- **XTerm.js**: 웹 터미널 에뮬레이터
- **Marked.js**: 마크다운 파서
- **Vanilla JavaScript**: 프레임워크 없는 순수 JS

## 개발 가이드

### 개발 서버 실행
```bash
npm run dev  # nodemon으로 자동 재시작
```

### 새로운 기능 추가
1. **CLI 명령어**: `cli/index.js`에 새 명령어 추가
2. **API 엔드포인트**: `server/app.js`에 라우트 추가
3. **웹 UI**: `web-ui/app.js`에 기능 구현

### 파일 구조 확장
```javascript
// 새로운 카테고리 추가 예시
const categories = ['web', 'playground', 'trouble', 'new-category'];
```

## 주요 특징

### 🔄 실시간 동기화
- 파일 변경사항 자동 감지
- 웹 UI와 파일시스템 실시간 동기화
- 다중 클라이언트 지원

### 🛡️ 안전한 배포
- Git 상태 확인
- 단계별 배포 과정
- 에러 핸들링

### 🎨 사용자 친화적 UI
- VS Code 스타일 테마
- 직관적인 탭 인터페이스
- 반응형 디자인

### ⚡ 고성능
- 라이브 리로딩
- 효율적인 파일 감시
- 최적화된 에디터

## 문제 해결

### 터미널이 작동하지 않는 경우
- 권한 확인: 관리자 권한으로 실행
- 포트 충돌: 다른 포트 사용 (-p 옵션)

### Monaco Editor 로딩 실패
- 네트워크 연결 확인
- CDN 대신 로컬 파일 사용

### Git 명령어 실패
- Git 설치 확인
- 저장소 초기화 상태 확인

## 라이선스

MIT License

## 기여하기

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

**🎯 이제 블로그 관리가 이렇게 쉬워졌습니다!**

웹에서 편집하고, CLI로 배포하고, 터미널로 확인하는 통합 워크플로우를 경험해보세요.