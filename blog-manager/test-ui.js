const CDP = require('chrome-remote-interface');

async function testBlogManagerUI() {
    let client;
    
    try {
        console.log('📡 Chrome DevTools Protocol 연결 중...');
        
        // Chrome 탭 생성
        const tab = await CDP.New({
            port: 9223,
            url: 'http://localhost:3001'
        });
        
        client = await CDP({
            port: 9223,
            tab: tab
        });
        
        const { Page, Runtime, Network } = client;
        
        await Page.enable();
        await Runtime.enable();
        await Network.enable();
        
        console.log('🌐 Blog Manager 페이지 로딩 중...');
        
        // 페이지 로드 대기
        await Page.navigate({ url: 'http://localhost:3001' });
        await Page.loadEventFired();
        
        // 잠시 대기 (JS 로딩 완료)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('🔍 DOM 요소 확인 중...');
        
        // DOM 요소 존재 확인
        const elementsToCheck = [
            'header h1',           // 헤더 타이틀
            '.tabs .tab-btn',      // 탭 버튼들
            '#posts-list',         // 게시물 리스트
            '#new-post',           // 새 게시물 버튼
            '#editor',             // 에디터
            '.status-bar'          // 상태바
        ];
        
        for (const selector of elementsToCheck) {
            try {
                const result = await Runtime.evaluate({
                    expression: `document.querySelector('${selector}') !== null`
                });
                
                if (result.result.value) {
                    console.log(`✅ ${selector} 요소 발견`);
                } else {
                    console.log(`❌ ${selector} 요소 없음`);
                }
            } catch (error) {
                console.log(`❌ ${selector} 확인 실패:`, error.message);
            }
        }
        
        console.log('🎯 기능 테스트 시작...');
        
        // 헤더 텍스트 확인
        const titleResult = await Runtime.evaluate({
            expression: `document.querySelector('header h1').textContent`
        });
        console.log(`📋 헤더 제목: "${titleResult.result.value}"`);
        
        // 게시물 개수 확인
        const postsCountResult = await Runtime.evaluate({
            expression: `document.querySelectorAll('.post-item').length`
        });
        console.log(`📝 게시물 개수: ${postsCountResult.result.value}개`);
        
        // 탭 전환 테스트
        console.log('🔄 탭 전환 테스트...');
        
        const tabs = ['editor', 'preview', 'terminal'];
        for (const tabName of tabs) {
            await Runtime.evaluate({
                expression: `document.querySelector('[data-tab="${tabName}"]').click()`
            });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const isActive = await Runtime.evaluate({
                expression: `document.querySelector('[data-tab="${tabName}"]').classList.contains('active')`
            });
            
            if (isActive.result.value) {
                console.log(`✅ ${tabName} 탭 활성화 성공`);
            } else {
                console.log(`❌ ${tabName} 탭 활성화 실패`);
            }
        }
        
        // 새 게시물 모달 테스트
        console.log('🆕 새 게시물 모달 테스트...');
        
        await Runtime.evaluate({
            expression: `document.getElementById('new-post').click()`
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const modalVisible = await Runtime.evaluate({
            expression: `document.getElementById('new-post-modal').classList.contains('show')`
        });
        
        if (modalVisible.result.value) {
            console.log('✅ 새 게시물 모달 열림');
            
            // 모달 닫기
            await Runtime.evaluate({
                expression: `document.querySelector('.modal-close').click()`
            });
            console.log('✅ 모달 닫기 성공');
        } else {
            console.log('❌ 새 게시물 모달 열기 실패');
        }
        
        // Socket.io 연결 상태 확인
        console.log('🔌 Socket.io 연결 상태 확인...');
        
        const socketConnected = await Runtime.evaluate({
            expression: `window.io && window.io.Manager && window.io.Manager.prototype.connected !== undefined`
        });
        
        if (socketConnected.result.value) {
            console.log('✅ Socket.io 라이브러리 로드됨');
        } else {
            console.log('❌ Socket.io 라이브러리 로드 실패');
        }
        
        // 에디터 존재 확인
        console.log('✏️ Monaco Editor 확인...');
        
        const editorLoaded = await Runtime.evaluate({
            expression: `typeof monaco !== 'undefined' && monaco.editor !== undefined`
        });
        
        if (editorLoaded.result.value) {
            console.log('✅ Monaco Editor 로드됨');
        } else {
            console.log('❌ Monaco Editor 로드 실패');
        }
        
        // 터미널 확인
        console.log('💻 XTerm 터미널 확인...');
        
        const terminalLoaded = await Runtime.evaluate({
            expression: `typeof Terminal !== 'undefined'`
        });
        
        if (terminalLoaded.result.value) {
            console.log('✅ XTerm 터미널 로드됨');
        } else {
            console.log('❌ XTerm 터미널 로드 실패');
        }
        
        console.log('🎉 UI 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 중 오류 발생:', error.message);
        
        // 더 자세한 에러 정보
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Chrome이 디버깅 포트로 실행되지 않았을 수 있습니다.');
            console.log('   다음 명령어로 Chrome을 실행하세요:');
            console.log('   start chrome --remote-debugging-port=9223 --user-data-dir="c:\\temp\\chrome_debug_blog"');
        }
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 CDP 연결 종료');
        }
    }
}

// 실행
testBlogManagerUI().catch(console.error);