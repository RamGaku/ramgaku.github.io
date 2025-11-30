const CDP = require('chrome-remote-interface');

async function testButtonClicks() {
    let client;
    
    try {
        console.log('🔍 버튼 클릭 테스트 시작...');
        
        const tab = await CDP.New({
            port: 9223,
            url: 'http://localhost:3001'
        });
        
        client = await CDP({
            port: 9223,
            tab: tab
        });
        
        const { Page, Runtime, Console } = client;
        
        await Page.enable();
        await Runtime.enable();
        await Console.enable();
        
        // 콘솔 에러 캐치
        Console.messageAdded((params) => {
            console.log(`🟡 브라우저 콘솔: [${params.message.level}] ${params.message.text}`);
        });
        
        await Page.navigate({ url: 'http://localhost:3001' });
        await Page.loadEventFired();
        
        // 페이지 로딩 대기
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log('🎯 탭 버튼 클릭 테스트...');
        
        // 미리보기 탭 클릭 시도
        const previewClickResult = await Runtime.evaluate({
            expression: `
                try {
                    const previewBtn = document.querySelector('[data-tab="preview"]');
                    if (previewBtn) {
                        console.log('미리보기 버튼 발견:', previewBtn);
                        previewBtn.click();
                        console.log('미리보기 버튼 클릭됨');
                        'SUCCESS';
                    } else {
                        'NO_BUTTON';
                    }
                } catch (error) {
                    console.error('미리보기 클릭 에러:', error);
                    error.message;
                }
            `
        });
        
        console.log('📄 미리보기 탭 클릭 결과:', previewClickResult.result.value);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 터미널 탭 클릭 시도
        const terminalClickResult = await Runtime.evaluate({
            expression: `
                try {
                    const terminalBtn = document.querySelector('[data-tab="terminal"]');
                    if (terminalBtn) {
                        console.log('터미널 버튼 발견:', terminalBtn);
                        terminalBtn.click();
                        console.log('터미널 버튼 클릭됨');
                        'SUCCESS';
                    } else {
                        'NO_BUTTON';
                    }
                } catch (error) {
                    console.error('터미널 클릭 에러:', error);
                    error.message;
                }
            `
        });
        
        console.log('💻 터미널 탭 클릭 결과:', terminalClickResult.result.value);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 이벤트 리스너 확인
        const eventListenerCheck = await Runtime.evaluate({
            expression: `
                try {
                    const buttons = document.querySelectorAll('.tab-btn');
                    const results = [];
                    buttons.forEach((btn, index) => {
                        const listeners = getEventListeners ? getEventListeners(btn) : 'getEventListeners not available';
                        results.push({
                            index,
                            dataTab: btn.dataset.tab,
                            hasClickListener: btn.onclick !== null || (listeners && listeners.click),
                            classList: Array.from(btn.classList)
                        });
                    });
                    JSON.stringify(results);
                } catch (error) {
                    error.message;
                }
            `
        });
        
        console.log('🎪 이벤트 리스너 상태:', eventListenerCheck.result.value);
        
        // JavaScript 앱 객체 확인
        const appObjectCheck = await Runtime.evaluate({
            expression: `
                try {
                    const checks = {
                        blogManagerExists: typeof BlogManager !== 'undefined',
                        windowBlogManager: typeof window.blogManager !== 'undefined',
                        documentReady: document.readyState,
                        scriptsLoaded: {
                            socketio: typeof io !== 'undefined',
                            monaco: typeof monaco !== 'undefined',
                            terminal: typeof Terminal !== 'undefined',
                            marked: typeof marked !== 'undefined'
                        }
                    };
                    JSON.stringify(checks);
                } catch (error) {
                    error.message;
                }
            `
        });
        
        console.log('🔧 JavaScript 상태:', appObjectCheck.result.value);
        
        // 강제로 탭 전환 시도
        console.log('🚀 강제 탭 전환 시도...');
        
        const forceTabSwitch = await Runtime.evaluate({
            expression: `
                try {
                    // 모든 탭 버튼에서 active 제거
                    document.querySelectorAll('.tab-btn').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // 모든 탭 내용에서 active 제거
                    document.querySelectorAll('.tab-pane').forEach(pane => {
                        pane.classList.remove('active');
                    });
                    
                    // 터미널 탭 활성화
                    const terminalBtn = document.querySelector('[data-tab="terminal"]');
                    const terminalPane = document.querySelector('#tab-terminal');
                    
                    if (terminalBtn && terminalPane) {
                        terminalBtn.classList.add('active');
                        terminalPane.classList.add('active');
                        'TERMINAL_ACTIVATED';
                    } else {
                        'ELEMENTS_NOT_FOUND';
                    }
                } catch (error) {
                    error.message;
                }
            `
        });
        
        console.log('⚡ 강제 탭 전환 결과:', forceTabSwitch.result.value);
        
        // 최종 상태 확인
        const finalStateCheck = await Runtime.evaluate({
            expression: `
                try {
                    const activeTab = document.querySelector('.tab-btn.active');
                    const activePane = document.querySelector('.tab-pane.active');
                    
                    JSON.stringify({
                        activeTabText: activeTab ? activeTab.textContent : 'none',
                        activePaneId: activePane ? activePane.id : 'none',
                        allTabButtons: Array.from(document.querySelectorAll('.tab-btn')).map(btn => ({
                            text: btn.textContent,
                            dataTab: btn.dataset.tab,
                            isActive: btn.classList.contains('active')
                        }))
                    });
                } catch (error) {
                    error.message;
                }
            `
        });
        
        console.log('🎬 최종 상태:', finalStateCheck.result.value);
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 CDP 연결 종료');
        }
    }
}

testButtonClicks().catch(console.error);