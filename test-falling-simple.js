const CDP = require('chrome-remote-interface');

async function testFallingBreakoutSimple() {
    try {
        console.log('🎮 간단 Falling Breakout CDP 테스트 시작...');
        
        const tab = await CDP.New({port: 9222});
        const client = await CDP({tab});
        const {Page, Runtime} = client;
        
        await Page.enable();
        await Runtime.enable();
        
        const gameUrl = 'http://localhost:53430/posts/playground/falling-bricks-breakout.html';
        console.log(`📄 게임 로드: ${gameUrl}`);
        
        await Page.navigate({url: gameUrl});
        await new Promise(resolve => Page.loadEventFired(resolve));
        
        // 3초 대기
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ 게임 로드 완료, 상태 체크...');
        
        // 기본 상태 확인
        for (let i = 0; i < 5; i++) {
            const result = await Runtime.evaluate({
                expression: `
                    try {
                        const scoreEl = document.getElementById('score');
                        const levelEl = document.getElementById('level'); 
                        const bricksEl = document.getElementById('bricksCount');
                        
                        JSON.stringify({
                            score: scoreEl ? scoreEl.textContent : 'null',
                            level: levelEl ? levelEl.textContent : 'null', 
                            bricks: bricksEl ? bricksEl.textContent : 'null',
                            timestamp: Date.now()
                        });
                    } catch (e) {
                        JSON.stringify({ error: e.message });
                    }
                `
            });
            
            console.log(`📊 [${i+1}] 상태:`, result.result.value);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        // 자동 모드 확인 및 패들 제어 테스트
        console.log('🎮 패들 제어 테스트...');
        
        await Runtime.evaluate({
            expression: `
                // 좌우 화살표 키 이벤트 전송
                const leftKey = new KeyboardEvent('keydown', { key: 'ArrowLeft', code: 'ArrowLeft' });
                const rightKey = new KeyboardEvent('keydown', { key: 'ArrowRight', code: 'ArrowRight' });
                
                console.log('패들 제어 이벤트 전송');
                
                // 좌로 이동
                for (let i = 0; i < 20; i++) {
                    document.dispatchEvent(leftKey);
                }
                
                setTimeout(() => {
                    // 우로 이동 
                    for (let i = 0; i < 40; i++) {
                        document.dispatchEvent(rightKey);
                    }
                }, 1000);
                
                'UI 제어 이벤트 전송 완료';
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 최종 스크린샷
        console.log('📸 스크린샷 캡처...');
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./falling-breakout-simple-test.png', screenshot.data, 'base64');
        console.log('📸 스크린샷 저장: falling-breakout-simple-test.png');
        
        // 게임 재시작 테스트
        console.log('🔄 게임 재시작...');
        await Runtime.evaluate({
            expression: `
                const restartBtn = document.querySelector('.btn');
                if (restartBtn) {
                    restartBtn.click();
                    console.log('재시작 버튼 클릭');
                }
                '재시작 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const finalState = await Runtime.evaluate({
            expression: `
                try {
                    JSON.stringify({
                        score: document.getElementById('score')?.textContent,
                        level: document.getElementById('level')?.textContent,
                        gameRunning: typeof gameState !== 'undefined' ? gameState : 'unknown'
                    });
                } catch (e) {
                    JSON.stringify({error: e.message});
                }
            `
        });
        
        console.log('🏁 최종 상태:', finalState.result.value);
        
        client.close();
        console.log('✅ 간단 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 테스트 에러:', error.message);
    }
}

testFallingBreakoutSimple();