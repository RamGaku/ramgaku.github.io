const CDP = require('chrome-remote-interface');

async function testEdgeWithCDP() {
    try {
        console.log('=== Edge CDP 벽돌깨기 테스트 ===');
        console.log('Edge 브라우저에 연결 중...');
        
        // 새 탭 생성
        const tab = await CDP.New({port: 9222});
        console.log('Edge 새 탭 생성됨:', tab.id);
        
        // 탭에 연결
        const client = await CDP({tab});
        const {Page, Runtime, DOM} = client;
        
        // 프로토콜 활성화
        await Page.enable();
        await Runtime.enable();
        await DOM.enable();
        
        console.log('Edge CDP 프로토콜 활성화 완료');
        
        // 게임 파일 로드
        const gameUrl = `file:///${__dirname.replace(/\\/g, '/')}/posts/playground/breakout-game.html`;
        console.log('Edge에서 게임 로드:', gameUrl);
        
        await Page.navigate({url: gameUrl});
        
        // 페이지 로드 대기
        await new Promise(resolve => {
            Page.loadEventFired(() => {
                console.log('Edge에서 페이지 로드 완료');
                resolve();
            });
        });
        
        // 3초 대기 (게임 초기화)
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Edge 브라우저 정보 확인
        const browserInfo = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    userAgent: navigator.userAgent,
                    vendor: navigator.vendor,
                    platform: navigator.platform,
                    title: document.title
                });
            `
        });
        
        const info = JSON.parse(browserInfo.result.value);
        console.log('Edge 브라우저 정보:', info);
        
        // 게임 초기 상태 확인
        const gameState = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    canvasExists: !!document.getElementById('gameCanvas'),
                    score: document.getElementById('scoreValue').textContent,
                    ballPosition: typeof ball !== 'undefined' ? {x: ball.x, y: ball.y} : null,
                    paddlePosition: typeof paddle !== 'undefined' ? {x: paddle.x} : null
                });
            `
        });
        
        const state = JSON.parse(gameState.result.value);
        console.log('게임 초기 상태:', state);
        
        // Edge에서 페이지 제목 변경
        await Runtime.evaluate({
            expression: `
                document.title = 'Edge CDP로 조작됨! 🔥';
                console.log('Edge에서 CDP 조작 성공!');
            `
        });
        
        console.log('Edge 페이지 제목 변경 완료');
        
        // 자동 플레이 함수 주입
        await Runtime.evaluate({
            expression: `
                let autoPlayInterval;
                
                function startAutoPlay() {
                    console.log('Edge에서 자동 플레이 시작!');
                    
                    autoPlayInterval = setInterval(() => {
                        if (typeof ball !== 'undefined' && typeof paddle !== 'undefined') {
                            const targetX = ball.x - paddle.width / 2;
                            
                            // 키 이벤트 정리
                            const upEvent = new KeyboardEvent('keyup', {
                                code: 'ArrowLeft',
                                key: 'ArrowLeft'
                            });
                            const upEvent2 = new KeyboardEvent('keyup', {
                                code: 'ArrowRight', 
                                key: 'ArrowRight'
                            });
                            document.dispatchEvent(upEvent);
                            document.dispatchEvent(upEvent2);
                            
                            // 새 방향 키 누르기
                            if (targetX > paddle.x + 10) {
                                const rightEvent = new KeyboardEvent('keydown', {
                                    code: 'ArrowRight',
                                    key: 'ArrowRight'
                                });
                                document.dispatchEvent(rightEvent);
                            } else if (targetX < paddle.x - 10) {
                                const leftEvent = new KeyboardEvent('keydown', {
                                    code: 'ArrowLeft',
                                    key: 'ArrowLeft' 
                                });
                                document.dispatchEvent(leftEvent);
                            }
                        }
                    }, 50);
                }
                
                startAutoPlay();
                'Edge 자동 플레이 함수 주입 완료';
            `
        });
        
        console.log('Edge에서 자동 플레이 시작됨');
        
        // 15초간 게임 모니터링
        for (let i = 0; i < 15; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            try {
                const currentState = await Runtime.evaluate({
                    expression: `
                        JSON.stringify({
                            score: document.getElementById('scoreValue').textContent,
                            gameOver: document.getElementById('gameOver').style.display !== 'none',
                            ballPos: typeof ball !== 'undefined' ? 
                                {x: Math.round(ball.x), y: Math.round(ball.y)} : null,
                            paddlePos: typeof paddle !== 'undefined' ? 
                                Math.round(paddle.x) : null
                        });
                    `
                });
                
                const current = JSON.parse(currentState.result.value);
                console.log(`[${i+1}초] 점수: ${current.score}, 공: (${current.ballPos?.x}, ${current.ballPos?.y}), 패들: ${current.paddlePos}`);
                
                // 게임 오버 시 재시작
                if (current.gameOver) {
                    console.log('Edge에서 게임 오버 감지! 재시작...');
                    await Runtime.evaluate({
                        expression: `
                            const spaceEvent = new KeyboardEvent('keydown', {
                                code: 'Space',
                                key: ' '
                            });
                            document.dispatchEvent(spaceEvent);
                        `
                    });
                }
                
            } catch (error) {
                console.error('모니터링 에러:', error.message);
            }
        }
        
        console.log('Edge CDP 테스트 완료! 브라우저는 계속 열어둠.');
        client.close();
        
    } catch (error) {
        console.error('Edge CDP 에러:', error.message);
    }
}

testEdgeWithCDP();