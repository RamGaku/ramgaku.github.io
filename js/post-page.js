// 개별 게시물 페이지용 스크립트

// TOC 클릭 이벤트
document.addEventListener('DOMContentLoaded', () => {
    const tocNav = document.getElementById('toc-nav');
    if (tocNav) {
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

    // 스크롤 감지 (TOC 활성화)
    setupScrollSpy();
});

// 스크롤 감지
function setupScrollSpy() {
    const contentBody = document.getElementById('content-body');
    const tocNav = document.getElementById('toc-nav');

    if (!contentBody || !tocNav) return;

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
