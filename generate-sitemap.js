// 사이트맵 자동 생성 스크립트
const fs = require('fs');
const path = require('path');

async function generateSitemap() {
    const baseUrl = 'https://ramgaku.github.io';
    const posts = JSON.parse(fs.readFileSync('./posts/index.json', 'utf8'));
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- 메인 페이지 -->
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
`;

    // 각 게시물별 URL 추가
    for (const post of posts.posts) {
        try {
            const postContent = fs.readFileSync(post.path, 'utf8');
            const frontMatterMatch = postContent.match(/^---([\s\S]*?)---/);
            let lastmod = new Date().toISOString().split('T')[0];
            
            if (frontMatterMatch) {
                const frontMatter = frontMatterMatch[1];
                const dateMatch = frontMatter.match(/date:\s*(.+)/);
                if (dateMatch) {
                    const date = dateMatch[1].trim();
                    if (date.includes('-')) {
                        lastmod = date;
                    } else {
                        lastmod = `${date}-01-01`;
                    }
                }
            }
            
            sitemap += `    <url>
        <loc>${baseUrl}/#${post.id}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
`;
        } catch (error) {
            console.warn(`게시물 처리 실패: ${post.path}`, error.message);
        }
    }
    
    sitemap += `</urlset>`;
    
    fs.writeFileSync('./sitemap.xml', sitemap);
    console.log('사이트맵 생성 완료: sitemap.xml');
}

generateSitemap().catch(console.error);