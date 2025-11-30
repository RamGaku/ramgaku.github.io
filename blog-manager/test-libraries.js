const CDP = require('chrome-remote-interface');

async function testLibraryLoading() {
    let client;
    
    try {
        console.log('📚 라이브러리 로딩 상태 확인...');
        
        const tab = await CDP.New({
            port: 9223,
            url: 'http://localhost:3001'
        });
        
        client = await CDP({
            port: 9223,
            tab: tab
        });
        
        const { Page, Runtime, Console, Network } = client;
        
        await Page.enable();
        await Runtime.enable();
        await Console.enable();
        await Network.enable();
        
        // 네트워크 요청 모니터링
        const failedRequests = [];
        Network.loadingFailed((params) => {
            failedRequests.push({
                url: params.request.url,
                errorText: params.errorText
            });
        });
        
        // 콘솔 에러 캐치
        const consoleErrors = [];
        Console.messageAdded((params) => {
            if (params.message.level === 'error') {
                consoleErrors.push(params.message.text);
            }
            console.log(`🟡 [${params.message.level}] ${params.message.text}`);
        });
        
        await Page.navigate({ url: 'http://localhost:3001' });
        await Page.loadEventFired();
        
        // 충분히 대기 (라이브러리 로딩 시간)
        await new Promise(resolve => setTimeout(resolve, 8000));
        
        // 각 라이브러리별 상세 확인
        const libraryCheck = await Runtime.evaluate({
            expression: `
                const checks = {};
                
                // Socket.io 확인
                checks.socketio = {
                    loaded: typeof io !== 'undefined',
                    version: typeof io !== 'undefined' ? (io.version || 'unknown') : null,
                    manager: typeof io !== 'undefined' ? typeof io.Manager : 'undefined'
                };
                
                // Monaco Editor 확인
                checks.monaco = {
                    loaded: typeof monaco !== 'undefined',
                    editor: typeof monaco !== 'undefined' ? typeof monaco.editor : 'undefined',
                    require: typeof require !== 'undefined'
                };
                
                // XTerm 확인
                checks.xterm = {
                    loaded: typeof Terminal !== 'undefined',
                    constructor: typeof Terminal,
                    fitAddon: typeof Terminal !== 'undefined' ? typeof Terminal.FitAddon : 'undefined'
                };
                
                // Marked 확인
                checks.marked = {
                    loaded: typeof marked !== 'undefined',
                    parse: typeof marked !== 'undefined' ? typeof marked.parse : 'undefined'
                };
                
                // BlogManager 확인
                checks.blogManager = {
                    classExists: typeof BlogManager !== 'undefined',
                    instanceCreated: typeof window.blogManager !== 'undefined',
                    domContentLoaded: document.readyState
                };
                
                JSON.stringify(checks, null, 2);
            `
        });
        
        console.log('📊 라이브러리 상세 상태:');
        console.log(libraryCheck.result.value);
        
        // 실제 스크립트 태그 확인
        const scriptTags = await Runtime.evaluate({
            expression: `
                Array.from(document.querySelectorAll('script')).map(script => ({
                    src: script.src,
                    loaded: script.readyState || 'unknown',
                    hasError: script.onerror !== null
                }));
            `
        });
        
        console.log('🏷️ 스크립트 태그 상태:', JSON.stringify(scriptTags.result.value, null, 2));
        
        // 수동으로 XTerm 초기화 시도
        console.log('🔧 수동 XTerm 초기화 시도...');
        
        const xtermInit = await Runtime.evaluate({
            expression: `
                try {
                    if (typeof Terminal !== 'undefined') {
                        const testTerminal = new Terminal({
                            fontSize: 14,
                            theme: { background: '#1e1e1e' }
                        });
                        'XTERM_INIT_SUCCESS';
                    } else {
                        'XTERM_NOT_LOADED';
                    }
                } catch (error) {
                    'XTERM_ERROR: ' + error.message;
                }
            `
        });
        
        console.log('💻 XTerm 초기화 결과:', xtermInit.result.value);
        
        // 수동으로 Marked 테스트
        const markedTest = await Runtime.evaluate({
            expression: `
                try {
                    if (typeof marked !== 'undefined') {
                        const html = marked.parse('# Test');
                        'MARKED_SUCCESS: ' + html;
                    } else {
                        'MARKED_NOT_LOADED';
                    }
                } catch (error) {
                    'MARKED_ERROR: ' + error.message;
                }
            `
        });
        
        console.log('📝 Marked 테스트 결과:', markedTest.result.value);
        
        console.log('❌ 실패한 네트워크 요청:', failedRequests);
        console.log('🚫 콘솔 에러들:', consoleErrors);
        
    } catch (error) {
        console.error('❌ 테스트 실패:', error.message);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 CDP 연결 종료');
        }
    }
}

testLibraryLoading().catch(console.error);