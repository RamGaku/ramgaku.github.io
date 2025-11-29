const CDP = require('chrome-remote-interface');
const path = require('path');
const fs = require('fs');

async function testCDP() {
    let client;
    try {
        console.log('CDP에 연결 중...');
        
        // 연결 옵션 추가
        client = await CDP({
            port: 9222,
            host: 'localhost'
        });
        
        const {Page, Runtime, DOM} = client;
        
        // 프로토콜 활성화
        await Promise.all([
            Page.enable(),
            Runtime.enable(),
            DOM.enable()
        ]);
        
        console.log('프로토콜 활성화 완료');
        
        // 게임 파일 경로
        const gameFilePath = path.resolve(__dirname, 'posts/playground/breakout-game.html');
        const gameFileUrl = `file:///${gameFilePath.replace(/\\/g, '/')}`;
        
        console.log(`게임 페이지 로드: ${gameFileUrl}`);
        
        // 페이지 네비게이션
        await Page.navigate({url: gameFileUrl});
        
        // 페이지 로드 완료까지 대기
        await new Promise((resolve) => {
            Page.loadEventFired(resolve);
        });
        
        console.log('페이지 로드 완료');
        
        // 잠시 대기 (게임 초기화)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // DOM에서 캔버스 요소 찾기
        const {root} = await DOM.getDocument();
        const {nodeId: canvasNodeId} = await DOM.querySelector({
            selector: '#gameCanvas',
            nodeId: root.nodeId
        });
        
        console.log('캔버스 요소 찾기 완료');
        
        // 게임 시작 알림 JavaScript 실행
        await Runtime.evaluate({
            expression: `
                console.log('CDP에서 게임 조작 시작!');
                
                // 점수를 표시하는 함수
                function showScore() {
                    const scoreValue = document.getElementById('scoreValue').textContent;
                    console.log('현재 점수:', scoreValue);
                    return scoreValue;
                }
                
                // 자동으로 패들 이동시키는 함수
                function autoPlay() {
                    const canvas = document.getElementById('gameCanvas');
                    const rect = canvas.getBoundingClientRect();
                    
                    setInterval(() => {
                        // 공의 위치를 추적하여 패들 자동 이동
                        if (typeof ball !== 'undefined' && typeof paddle !== 'undefined') {
                            const targetX = ball.x - paddle.width / 2;
                            if (targetX > paddle.x + 5) {
                                // 우측으로 이동
                                const event = new KeyboardEvent('keydown', {
                                    code: 'ArrowRight',
                                    key: 'ArrowRight'
                                });
                                document.dispatchEvent(event);
                            } else if (targetX < paddle.x - 5) {
                                // 좌측으로 이동
                                const event = new KeyboardEvent('keydown', {
                                    code: 'ArrowLeft',
                                    key: 'ArrowLeft'
                                });
                                document.dispatchEvent(event);
                            }
                        }
                    }, 50);
                }
                
                showScore();
                'CDP 조작 준비 완료!';
            `
        });
        
        console.log('게임 조작 함수 주입 완료');
        
        // 5초 후 자동 플레이 시작
        setTimeout(async () => {
            console.log('자동 플레이 시작...');
            await Runtime.evaluate({
                expression: `
                    autoPlay();
                    console.log('자동 플레이 활성화됨!');
                    'auto play started';
                `
            });
        }, 2000);
        
        // 10초간 게임 상태 모니터링
        const monitorInterval = setInterval(async () => {
            try {
                const result = await Runtime.evaluate({
                    expression: `
                        const scoreValue = document.getElementById('scoreValue').textContent;
                        const gameOverVisible = document.getElementById('gameOver').style.display !== 'none';
                        JSON.stringify({
                            score: scoreValue,
                            gameOver: gameOverVisible,
                            ballPosition: typeof ball !== 'undefined' ? {x: ball.x, y: ball.y} : null
                        });
                    `
                });
                
                const gameState = JSON.parse(result.result.value);
                console.log('게임 상태:', gameState);
                
                if (gameState.gameOver) {
                    console.log('게임 오버 감지! 재시작...');
                    await Runtime.evaluate({
                        expression: `
                            const spaceEvent = new KeyboardEvent('keydown', {
                                code: 'Space',
                                key: ' '
                            });
                            document.dispatchEvent(spaceEvent);
                            'game restarted';
                        `
                    });
                }
                
            } catch (error) {
                console.error('모니터링 중 에러:', error.message);
            }
        }, 1000);
        
        // 30초 후 종료
        setTimeout(() => {
            clearInterval(monitorInterval);
            console.log('CDP 테스트 완료');
            client.close();
        }, 30000);
        
    } catch (error) {
        console.error('CDP 연결 실패:', error);
        if (client) {
            client.close();
        }
    }
}

// 스크립트 실행
console.log('=== CDP 벽돌깨기 게임 테스트 ===');
console.log('Chrome이 --remote-debugging-port=9222로 실행되어 있어야 합니다.');
testCDP();