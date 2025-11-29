const CDP = require('chrome-remote-interface');

async function testFallingBreakout() {
    try {
        console.log('🎮 Falling Bricks Breakout CDP 테스트 시작...');
        
        // 새 탭 생성 및 연결
        const tab = await CDP.New({port: 9222});
        const client = await CDP({tab});
        const {Page, Runtime} = client;
        
        await Page.enable();
        await Runtime.enable();
        
        // 게임 페이지 로드
        const gameUrl = 'http://localhost:53430/posts/playground/falling-bricks-breakout.html';
        console.log(`📄 게임 페이지 로드: ${gameUrl}`);
        await Page.navigate({url: gameUrl});
        
        // 페이지 로드 완료 대기
        await new Promise(resolve => {
            Page.loadEventFired(resolve);
        });
        
        console.log('✅ 게임 로드 완료!');
        
        // 2초 대기 (게임 초기화 완료)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 게임 상태 확인
        console.log('📊 게임 변수 체크...');
        const gameCheck = await Runtime.evaluate({
            expression: `
                // 게임 변수들 확인
                const variables = {
                    hasGameState: typeof gameState !== 'undefined',
                    hasScore: typeof score !== 'undefined', 
                    hasLevel: typeof level !== 'undefined',
                    hasBall: typeof ball !== 'undefined',
                    hasPaddle: typeof paddle !== 'undefined',
                    hasBricks: typeof bricks !== 'undefined',
                    hasAutoMode: typeof autoMode !== 'undefined'
                };
                
                console.log('게임 변수 상태:', variables);
                JSON.stringify(variables);
            `
        });
        
        console.log('🔍 게임 변수 상태:', gameCheck.result.value);
        
        // 간단한 게임 상태 체크 함수
        const simpleStateCheck = await Runtime.evaluate({
            expression: `
                function getSimpleGameState() {
                    try {
                        return {
                            canvasExists: !!document.getElementById('gameCanvas'),
                            scoreText: document.getElementById('score')?.textContent || 'N/A',
                            levelText: document.getElementById('level')?.textContent || 'N/A',
                            bricksText: document.getElementById('bricksCount')?.textContent || 'N/A'
                        };
                    } catch (e) {
                        return { error: e.message };
                    }
                }
                
                getSimpleGameState();
            `
        });
        
        console.log('🎯 간단 상태 체크:', JSON.stringify(simpleStateCheck.result.value, null, 2));
        
        // 자동 모드 토글 테스트
        console.log('🔄 자동 모드 테스트...');
        await Runtime.evaluate({
            expression: `
                // 자동 모드 토글 함수가 존재하는지 확인
                if (typeof toggleAutoMode === 'function') {
                    console.log('자동모드 토글 함수 발견');
                    
                    // 현재 자동모드 상태 확인
                    const currentMode = document.querySelector('.toggle-switch')?.classList.contains('active');
                    console.log('현재 자동모드:', currentMode);
                    
                    if (!currentMode) {
                        toggleAutoMode();
                        console.log('자동모드 활성화');
                    }
                } else {
                    console.log('자동모드 토글 함수 없음');
                }
                
                '자동모드 설정 완료'
            `
        });
        
        // 10초간 게임 진행 상황 관찰
        console.log('👁️  10초간 게임 관찰...');
        for (let i = 0; i < 10; i++) {
            const state = await Runtime.evaluate({
                expression: `
                    getSimpleGameState();
                `
            });
            
            const result = state.result.value;
            console.log(`📊 [${i+1}s] ${result.scoreText} | ${result.levelText} | ${result.bricksText}`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 수동 패들 제어 테스트
        console.log('🕹️  수동 패들 제어 테스트...');
        
        await Runtime.evaluate({
            expression: `
                // 자동 모드 비활성화
                if (document.querySelector('.toggle-switch')?.classList.contains('active')) {
                    toggleAutoMode();
                    console.log('자동모드 비활성화');
                }
                
                '수동 모드 전환 완료'
            `
        });
        
        // 패들 좌우 이동 테스트
        for (let direction of ['left', 'right', 'left']) {
            console.log(`➡️ 패들 ${direction} 이동 테스트...`);
            
            await Runtime.evaluate({
                expression: `
                    // 키보드 이벤트 시뮬레이션
                    const key = '${direction}' === 'left' ? 'ArrowLeft' : 'ArrowRight';
                    
                    for (let i = 0; i < 30; i++) {
                        const keydownEvent = new KeyboardEvent('keydown', {
                            key: key,
                            code: key,
                            bubbles: true
                        });
                        document.dispatchEvent(keydownEvent);
                    }
                    
                    console.log('패들 ${direction} 이동 명령 전송');
                    '패들 이동 완료'
                `
            });
            
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const state = await Runtime.evaluate({
                expression: `getSimpleGameState();`
            });
            
            console.log(`   상태: ${state.result.value.scoreText} | ${state.result.value.levelText}`);
        }
        
        // 게임 재시작 테스트
        console.log('🔄 게임 재시작 테스트...');
        
        await Runtime.evaluate({
            expression: `
                if (typeof restartGame === 'function') {
                    restartGame();
                    console.log('게임 재시작 함수 호출');
                } else {
                    console.log('게임 재시작 함수 없음');
                }
                
                '게임 재시작 완료'
            `
        });
        
        // 재시작 후 상태 확인
        await new Promise(resolve => setTimeout(resolve, 1000));
        const finalState = await Runtime.evaluate({
            expression: `getSimpleGameState();`
        });
        
        console.log('🏁 재시작 후 상태:', JSON.stringify(finalState.result.value, null, 2));
        
        // 스크린샷 캡처
        console.log('📸 스크린샷 캡처...');
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./falling-breakout-test.png', screenshot.data, 'base64');
        console.log('📸 스크린샷 저장됨: falling-breakout-test.png');
        
        client.close();
        console.log('✅ Falling Bricks Breakout CDP 테스트 완료!');
        
    } catch (error) {
        console.error('❌ CDP 테스트 에러:', error.message);
    }
}

// 테스트 실행
testFallingBreakout();