const CDP = require('chrome-remote-interface');

async function simpleTest() {
    try {
        console.log('CDP 연결 시도...');
        
        // 새 탭 생성
        const tab = await CDP.New({port: 9222});
        console.log('새 탭 생성됨:', tab.id);
        
        // 탭에 연결
        const client = await CDP({tab});
        const {Page, Runtime} = client;
        
        // 프로토콜 활성화
        await Page.enable();
        await Runtime.enable();
        
        console.log('프로토콜 활성화 완료');
        
        // 게임 파일 로드
        const gameUrl = `file:///${__dirname.replace(/\\/g, '/')}/posts/playground/breakout-game.html`;
        console.log('게임 로드:', gameUrl);
        
        await Page.navigate({url: gameUrl});
        
        // 페이지 로드 대기
        await new Promise(resolve => {
            Page.loadEventFired(() => {
                console.log('페이지 로드 완료');
                resolve();
            });
        });
        
        // 2초 대기 후 게임 조작
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 간단한 JavaScript 실행
        const result = await Runtime.evaluate({
            expression: `
                document.title = 'CDP로 조작됨!';
                console.log('CDP에서 페이지 제목 변경');
                '성공!';
            `
        });
        
        console.log('JavaScript 실행 결과:', result.result.value);
        
        // 키보드 이벤트 시뮬레이션
        await Runtime.evaluate({
            expression: `
                // 우측 화살표 키 이벤트 생성
                const rightKey = new KeyboardEvent('keydown', {
                    code: 'ArrowRight',
                    key: 'ArrowRight',
                    keyCode: 39
                });
                document.dispatchEvent(rightKey);
                
                console.log('키보드 이벤트 전송됨');
                'key event sent';
            `
        });
        
        console.log('키보드 이벤트 시뮬레이션 완료');
        
        // 5초 후 정리
        setTimeout(() => {
            client.close();
            console.log('CDP 연결 종료');
        }, 5000);
        
    } catch (error) {
        console.error('에러 발생:', error.message);
    }
}

console.log('=== 간단한 CDP 테스트 ===');
simpleTest();