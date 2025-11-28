// Cusdis 설정
const CUSDIS_APP_ID = 'ea2dd455-570d-4ac5-a635-50ebd613ebdc';
const CUSDIS_HOST = 'https://cusdis.com';

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
const BLOG_TITLE_TEXT = '람가의 블로그';
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
            <div id="cusdis_thread"
                data-host="${CUSDIS_HOST}"
                data-app-id="${CUSDIS_APP_ID}"
                data-page-id="${postId}"
                data-page-title="${post.title}"
                data-page-url="${window.location.origin}/#${postId}"
                data-theme="dark"
            ></div>
        </div>
    `;

    // Cusdis 스크립트 로드
    loadCusdis();

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

    contentBody.innerHTML = `<div class="recent-posts">${recentPostsHtml}</div>`;
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

// Cusdis 스크립트 로드
function loadCusdis() {
    // 기존 스크립트 제거
    const existingScript = document.getElementById('cusdis-script');
    if (existingScript) {
        existingScript.remove();
    }

    // 새 스크립트 로드
    const script = document.createElement('script');
    script.id = 'cusdis-script';
    script.src = 'https://cusdis.com/js/cusdis.es.js';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    // 스크립트 로드 후 Cusdis 초기화
    script.onload = () => {
        if (window.CUSDIS) {
            window.CUSDIS.initial();
        }
    };
}
