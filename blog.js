// Giscus 설정
const GISCUS_REPO = 'RamGaku/ramgaku.github.io';
const GISCUS_REPO_ID = 'R_kgDOQcvYMg';
const GISCUS_CATEGORY = 'Announcements';
const GISCUS_CATEGORY_ID = 'DIC_kwDOQcvYMs4CzI0d';

// 게시물 캐시
let posts = {};
let postsIndex = [];

// DOM 요소
let contentTitle, contentBody, tocNav;

// 현재 활성화된 게시물
let currentPost = null;

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
    contentTitle = document.getElementById('content-title');
    contentBody = document.getElementById('content-body');
    tocNav = document.getElementById('toc-nav');

    await loadPostsIndex();
    initCategoryToggle();
    initPostNavigation();
    initPostCards();
    initBlogTitle();
    showRecentPosts();
});

// posts/index.json 로드
async function loadPostsIndex() {
    try {
        const response = await fetch('posts/index.json');
        const data = await response.json();
        postsIndex = data.posts;
    } catch (e) {
        console.error('Failed to load posts index:', e);
        postsIndex = [];
    }
}

// MD 파일 파싱
function parseMarkdown(md) {
    // Front matter 파싱
    const frontMatterMatch = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontMatterMatch) {
        return { meta: {}, content: md };
    }

    const frontMatter = frontMatterMatch[1];
    const content = frontMatterMatch[2];

    // 메타데이터 파싱
    const meta = {};
    frontMatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            meta[key.trim()] = valueParts.join(':').trim();
        }
    });

    return { meta, content };
}

// Markdown to HTML 변환 (간단한 구현)
function markdownToHtml(md) {
    let html = md;

    // 코드 블록을 먼저 추출하여 플레이스홀더로 치환 (충돌 방지)
    const codeBlocks = [];
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (match, lang, code) => {
        const escaped = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre><code class="language-${lang}">${escaped}</code></pre>`);
        return placeholder;
    });

    // 인라인 코드도 먼저 추출
    const inlineCodes = [];
    html = html.replace(/`([^`]+)`/g, (match, code) => {
        const placeholder = `__INLINE_CODE_${inlineCodes.length}__`;
        inlineCodes.push(`<code>${code}</code>`);
        return placeholder;
    });

    // 헤더 (## → h2, ### → h3)
    html = html.replace(/^### (.+)$/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
        return `<h3 id="${id}">${title}</h3>`;
    });
    html = html.replace(/^## (.+)$/gm, (match, title) => {
        const id = title.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-');
        return `<h2 id="${id}">${title}</h2>`;
    });

    // 볼드
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // 이탤릭
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // 링크
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // iframe (특수 처리)
    html = html.replace(/<iframe([^>]*)><\/iframe>/g, '<div class="iframe-container"><iframe$1></iframe></div>');

    // standalone 링크 처리
    html = html.replace(/^standalone: \[([^\]]+)\]\(([^)]+)\)$/gm,
        '<p class="standalone-link">standalone: <a href="$2" target="_blank">$1</a></p>');

    // 리스트 (순서 없음)
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

    // 리스트 (순서 있음)
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
    // 연속된 숫자 리스트를 ol로 감싸기 위해 별도 처리
    html = html.replace(/<ul>(<li>\d+\..*<\/li>\n?)+<\/ul>/g, match => {
        return match.replace(/<ul>/g, '<ol>').replace(/<\/ul>/g, '</ol>');
    });

    // 단락
    html = html.split('\n\n').map(para => {
        para = para.trim();
        if (!para) return '';
        if (para.startsWith('<')) return para;
        if (para.startsWith('__CODE_BLOCK_')) return para; // 코드 블록 플레이스홀더는 그대로
        return `<p>${para}</p>`;
    }).join('\n');

    // 빈 p 태그 제거
    html = html.replace(/<p>\s*<\/p>/g, '');

    // 코드 블록 복원
    codeBlocks.forEach((block, i) => {
        html = html.replace(`__CODE_BLOCK_${i}__`, block);
    });

    // 인라인 코드 복원
    inlineCodes.forEach((code, i) => {
        html = html.replace(`__INLINE_CODE_${i}__`, code);
    });

    return html;
}

// 섹션 추출 (TOC용)
function extractSections(html) {
    const sections = [];
    const regex = /<h([23]) id="([^"]+)">([^<]+)<\/h[23]>/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
        sections.push({
            level: parseInt(match[1]),
            id: match[2],
            title: match[3]
        });
    }

    return sections;
}

// 게시물 로드 (MD 파일에서)
async function fetchPost(postId) {
    // 캐시 확인
    if (posts[postId]) {
        return posts[postId];
    }

    // index에서 경로 찾기
    const postInfo = postsIndex.find(p => p.id === postId);
    if (!postInfo) {
        console.error('Post not found in index:', postId);
        return null;
    }

    try {
        const response = await fetch(postInfo.path);
        const md = await response.text();
        const { meta, content } = parseMarkdown(md);
        const htmlContent = markdownToHtml(content);
        const sections = extractSections(htmlContent);

        const post = {
            id: postId,
            title: meta.title || postId,
            category: meta.category || postInfo.category,
            date: meta.date || '',
            type: meta.type || 'post',
            src: meta.src || '',
            content: htmlContent,
            sections: sections
        };

        // 캐시에 저장
        posts[postId] = post;
        return post;
    } catch (e) {
        console.error('Failed to load post:', postId, e);
        return null;
    }
}

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
async function loadPost(postId) {
    const post = await fetchPost(postId);
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
async function showRecentPosts() {
    contentTitle.textContent = '최근 게시물';
    tocNav.innerHTML = '<p class="toc-empty">게시물을 선택하세요</p>';

    const githubLink = `
        <div class="github-link">
            <a href="https://github.com/RamGaku/ramgaku.github.io" target="_blank">
                github.com/RamGaku/ramgaku.github.io
            </a>
        </div>
    `;

    // 모든 게시물 로드
    const loadedPosts = await Promise.all(
        postsIndex.slice(0, 5).map(p => fetchPost(p.id))
    );

    const recentPostsHtml = loadedPosts
        .filter(post => post)
        .map(post => `
            <article class="post-card" data-post="${post.id}">
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
