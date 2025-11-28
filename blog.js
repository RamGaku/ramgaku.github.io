// Giscus 설정
const GISCUS_REPO = 'RamGaku/ramgaku.github.io';
const GISCUS_REPO_ID = 'R_kgDOQcvYMg';
const GISCUS_CATEGORY = 'Announcements';
const GISCUS_CATEGORY_ID = 'DIC_kwDOQcvYMs4CzI0d';

// 게시물 데이터
const posts = {
    blackholespace: {
        title: '블랙홀 시뮬레이션',
        category: 'Playground',
        date: '2024',
        type: 'iframe',
        src: 'blackholespace.html',
        sections: [
            { id: 'intro', title: '소개', level: 2 },
            { id: 'controls', title: '조작법', level: 2 },
            { id: 'physics', title: '물리법칙 고려', level: 2 }
        ],
        content: `
            <h2 id="intro">소개</h2>
            <p>심심풀이로 블랙홀 시뮬레이터를 클로드로 만들어보았다.</p>
            <p class="standalone-link">standalone: <a href="blackholespace.html" target="_blank">blackholespace.html</a></p>

            <div class="iframe-container">
                <iframe src="blackholespace.html" title="블랙홀 시뮬레이션"></iframe>
            </div>

            <h2 id="controls">조작법</h2>
            <p>딱히 조작이랄건 없다. 그저 감상하는것.</p>

            <h2 id="physics">물리법칙 고려</h2>
            <ul>
                <li>사건의 지평선 근처에서 소행성 파편화</li>
                <li>소행성 간 충돌 시 분열</li>
                <li>파편의 궤도 운동</li>
                <li>재미를 위해 파편은 영원히 없어지지 않고 떠돌도록 하였음</li>
                <li>근데 점점 중앙으로 끌려들어가서 보이지 않는 파편이 존재하기는 함</li>
                <li>중력 및 질량계수에 대한 세밀한 조절이 추가적으로 필요</li>
            </ul>
        `
    },
    'giscus-comment': {
        title: 'GitHub Pages 블로그에 댓글 시스템 연동하기 (Giscus)',
        category: 'Web',
        date: '2024',
        sections: [
            { id: 'intro', title: '소개', level: 2 },
            { id: 'why-giscus', title: '왜 Giscus인가', level: 2 },
            { id: 'setup', title: '설정 방법', level: 2 },
            { id: 'code', title: '코드 적용', level: 2 }
        ],
        content: `
            <h2 id="intro">소개</h2>
            <p>GitHub Pages 정적 사이트에 댓글 기능을 추가하는 방법.</p>
            <p>기존에 Cusdis를 썼는데, 매번 관리자가 승인해야 댓글이 보이는 번거로움이 있어서 Giscus로 변경했다.</p>

            <h2 id="why-giscus">왜 Giscus인가</h2>
            <p>정적 사이트 댓글 시스템 비교:</p>
            <ul>
                <li><strong>Cusdis</strong> - 익명 가능, 근데 관리자 승인 필요 (번거로움)</li>
                <li><strong>Disqus</strong> - 광고 있고 무거움</li>
                <li><strong>utterances</strong> - GitHub Issues 기반, 가벼움</li>
                <li><strong>Giscus</strong> - GitHub Discussions 기반, 승인 불필요, 리액션 지원</li>
            </ul>
            <p>Giscus가 가장 깔끔하고 GitHub Pages와 찰떡궁합이라 선택.</p>

            <h2 id="setup">설정 방법</h2>
            <ol>
                <li>GitHub repo Settings → Features → <strong>Discussions 활성화</strong></li>
                <li><a href="https://giscus.app/ko" target="_blank">giscus.app</a> 접속</li>
                <li>Repository에 <code>username/repo-name</code> 입력</li>
                <li>Discussion 카테고리 선택 (보통 Announcements)</li>
                <li>생성된 script 코드 복사</li>
            </ol>

            <h2 id="code">코드 적용</h2>
            <p>giscus.app에서 생성된 코드 예시:</p>
            <pre><code>&lt;script src="https://giscus.app/client.js"
    data-repo="username/repo-name"
    data-repo-id="R_xxxxxx"
    data-category="Announcements"
    data-category-id="DIC_xxxxxx"
    data-mapping="pathname"
    data-theme="dark"
    data-lang="ko"
    crossorigin="anonymous"
    async&gt;
&lt;/script&gt;</code></pre>
            <p>동적으로 로드하려면 JavaScript로 script 엘리먼트를 생성해서 추가하면 됨.</p>
            <p>주의: 로컬 file:// 환경에서는 보안 정책 때문에 작동 안 함. 배포 후 테스트 필요.</p>
        `
    }
};

// DOM 요소
const contentTitle = document.getElementById('content-title');
const contentBody = document.getElementById('content-body');
const tocNav = document.getElementById('toc-nav');

// 현재 활성화된 게시물
let currentPost = null;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initCategoryToggle();
    initPostNavigation();
    initPostCards();
    initBlogTitle();
    showRecentPosts();
});

// 블로그 타이틀 타이핑 효과
const BLOG_TITLE_TEXT = '람가의 개발로그';
let typingInterval = null;

function initBlogTitle() {
    const titleElement = document.querySelector('.blog-title');

    // 클릭 시 대문으로
    titleElement.style.cursor = 'pointer';
    titleElement.addEventListener('click', () => {
        currentPost = null;
        document.querySelectorAll('.category-posts a').forEach(a => a.classList.remove('active'));
        showRecentPosts();
    });

    // 타이핑 효과 시작
    startTypingEffect();
}

function startTypingEffect() {
    const titleElement = document.querySelector('.blog-title');
    let charIndex = 0;

    // 기존 타이핑 중단
    if (typingInterval) {
        clearInterval(typingInterval);
    }

    // 텍스트 초기화
    titleElement.textContent = '';

    // 한 글자씩 타이핑
    typingInterval = setInterval(() => {
        if (charIndex < BLOG_TITLE_TEXT.length) {
            titleElement.textContent = BLOG_TITLE_TEXT.substring(0, charIndex + 1);
            charIndex++;
        } else {
            clearInterval(typingInterval);
            // 5초 후 다시 시작
            setTimeout(startTypingEffect, 5000);
        }
    }, 150);
}

// 카테고리 토글
function initCategoryToggle() {
    const categoryHeaders = document.querySelectorAll('.category-header');

    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.parentElement;
            category.classList.toggle('collapsed');
        });
    });
}

// 게시물 네비게이션
function initPostNavigation() {
    const postLinks = document.querySelectorAll('.category-posts a[data-post]');

    postLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const postId = link.dataset.post;
            loadPost(postId);

            // 활성 링크 표시
            document.querySelectorAll('.category-posts a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
        });
    });
}

// 게시물 카드 클릭
function initPostCards() {
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.post-card');
        if (card) {
            const postId = card.dataset.post;
            loadPost(postId);
        }
    });
}

// 게시물 로드
function loadPost(postId) {
    const post = posts[postId];
    if (!post) return;

    currentPost = postId;

    // 제목 업데이트
    contentTitle.textContent = post.title;

    // 본문 업데이트 (댓글 섹션 포함)
    contentBody.innerHTML = `
        <div class="post-content">${post.content}</div>
        <div class="comments-section">
            <h3 class="comments-title">댓글</h3>
            <div class="giscus"></div>
        </div>
    `;

    // Giscus 스크립트 로드
    loadGiscus(postId);

    // TOC 업데이트
    updateTOC(post.sections);

    // 스크롤 감지 설정
    setupScrollSpy();

    // 사이드바에서 해당 게시물 활성화
    document.querySelectorAll('.category-posts a').forEach(a => {
        a.classList.toggle('active', a.dataset.post === postId);
    });
}

// TOC 업데이트
function updateTOC(sections) {
    if (!sections || sections.length === 0) {
        tocNav.innerHTML = '<p class="toc-empty">목차가 없습니다</p>';
        return;
    }

    tocNav.innerHTML = sections.map(section => `
        <a href="#${section.id}" class="toc-h${section.level}" data-section="${section.id}">
            ${section.title}
        </a>
    `).join('');

    // TOC 클릭 이벤트
    tocNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').slice(1);
            const target = document.getElementById(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// 스크롤 감지
function setupScrollSpy() {
    const sections = contentBody.querySelectorAll('h2[id], h3[id]');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                tocNav.querySelectorAll('a').forEach(a => {
                    a.classList.toggle('active', a.dataset.section === id);
                });
            }
        });
    }, {
        rootMargin: '-20% 0px -60% 0px'
    });

    sections.forEach(section => observer.observe(section));
}

// 최근 게시물 표시
function showRecentPosts() {
    contentTitle.textContent = '최근 게시물';
    tocNav.innerHTML = '<p class="toc-empty">게시물을 선택하세요</p>';

    const githubLink = `
        <div class="github-link">
            <a href="https://github.com/RamGaku/ramgaku.github.io" target="_blank">
                github.com/RamGaku/ramgaku.github.io
            </a>
        </div>
    `;

    const recentPostsHtml = Object.entries(posts)
        .slice(0, 5)
        .map(([id, post]) => `
            <article class="post-card" data-post="${id}">
                <div class="post-category">${post.category}</div>
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${getExcerpt(post.content)}</p>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                </div>
            </article>
        `).join('');

    contentBody.innerHTML = `${githubLink}<div class="recent-posts">${recentPostsHtml}</div>`;
}

// 발췌문 추출
function getExcerpt(content) {
    const div = document.createElement('div');
    div.innerHTML = content;
    const text = div.textContent || div.innerText;
    return text.substring(0, 100).trim() + '...';
}

// 모바일 메뉴 토글
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('open');
}

// Giscus 스크립트 로드
function loadGiscus(postId) {
    // 기존 스크립트 제거
    const existingScript = document.getElementById('giscus-script');
    if (existingScript) {
        existingScript.remove();
    }

    // 기존 giscus 컨테이너 초기화
    const giscusContainer = document.querySelector('.giscus');
    if (giscusContainer) {
        giscusContainer.innerHTML = '';
    }

    // 새 스크립트 로드
    const script = document.createElement('script');
    script.id = 'giscus-script';
    script.src = 'https://giscus.app/client.js';
    script.setAttribute('data-repo', GISCUS_REPO);
    script.setAttribute('data-repo-id', GISCUS_REPO_ID);
    script.setAttribute('data-category', GISCUS_CATEGORY);
    script.setAttribute('data-category-id', GISCUS_CATEGORY_ID);
    script.setAttribute('data-mapping', 'specific');
    script.setAttribute('data-term', postId);
    script.setAttribute('data-strict', '0');
    script.setAttribute('data-reactions-enabled', '1');
    script.setAttribute('data-emit-metadata', '0');
    script.setAttribute('data-input-position', 'bottom');
    script.setAttribute('data-theme', 'dark_tritanopia');
    script.setAttribute('data-lang', 'ko');
    script.crossOrigin = 'anonymous';
    script.async = true;

    document.body.appendChild(script);
}
