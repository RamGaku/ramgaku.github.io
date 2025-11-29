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
        
        // 게임 상태 확인 및 제어 스크립트 주입
        await Runtime.evaluate({
            expression: `
                console.log('🔧 게임 제어 스크립트 주입 중...');
                
                // 게임 상태 모니터링 함수
                function getGameState() {
                    return {
                        gameState: window.gameState || 'unknown',
                        score: window.score || 0,
                        level: window.level || 1,
                        ballPosition: window.ball ? {
                            x: Math.round(window.ball.x),
                            y: Math.round(window.ball.y)
                        } : null,
                        paddleX: window.paddle ? Math.round(window.paddle.x) : null,
                        bricksCount: window.bricks ? window.bricks.flat().filter(b => b !== null).length : 0,
                        autoMode: window.autoMode || false
                    };
                }
                
                // 향상된 AI 제어 시스템
                let enhancedAI = {
                    enabled: false,
                    mode: 'defensive', // defensive, aggressive, smart
                    prediction: 3, // 공의 미래 위치 예측 프레임 수
                    
                    start: function() {
                        this.enabled = true;
                        console.log('🤖 Enhanced AI 시작됨!');
                    },
                    
                    stop: function() {
                        this.enabled = false;
                        console.log('⏹️ Enhanced AI 중지됨');
                    },
                    
                    // 공의 미래 위치 예측
                    predictBallPosition: function(frames) {
                        if (!window.ball) return null;
                        
                        let futureX = window.ball.x;
                        let futureY = window.ball.y;
                        let futureDx = window.ball.dx;
                        let futureDy = window.ball.dy;
                        
                        for (let i = 0; i < frames; i++) {
                            futureX += futureDx;
                            futureY += futureDy;
                            
                            // 벽 반사 계산
                            if (futureX + window.ball.radius > 800 || futureX - window.ball.radius < 0) {
                                futureDx = -futureDx;
                            }
                            if (futureY - window.ball.radius < 0) {
                                futureDy = -futureDy;
                            }
                            
                            // 패들에 닿을 높이에 도달하면 중단
                            if (futureY >= window.paddle.y - 10) {
                                break;
                            }
                        }
                        
                        return {x: futureX, y: futureY};
                    },
                    
                    // 최적 패들 위치 계산
                    getOptimalPaddlePosition: function() {
                        if (!window.ball || !window.paddle) return null;
                        
                        const prediction = this.predictBallPosition(this.prediction);
                        if (!prediction) return window.paddle.x;
                        
                        let targetX;
                        
                        switch (this.mode) {
                            case 'aggressive':
                                // 공을 벽돌 밀집 지역으로 튀기기
                                targetX = prediction.x - window.paddle.width * 0.3;
                                break;
                                
                            case 'smart':
                                // 벽돌 분포를 고려한 전략적 위치
                                const brickDensity = this.analyzeBrickDensity();
                                targetX = brickDensity.targetX - window.paddle.width / 2;
                                break;
                                
                            case 'defensive':
                            default:
                                // 공을 안전하게 받기
                                targetX = prediction.x - window.paddle.width / 2;
                                break;
                        }
                        
                        // 화면 경계 제한
                        return Math.max(0, Math.min(targetX, 800 - window.paddle.width));
                    },
                    
                    // 벽돌 분포 분석
                    analyzeBrickDensity: function() {
                        if (!window.bricks) return {targetX: 400, density: 0};
                        
                        let leftCount = 0, rightCount = 0;
                        let leftHP = 0, rightHP = 0;
                        
                        for (let r = 0; r < window.bricks.length; r++) {
                            for (let c = 0; c < window.bricks[r].length; c++) {
                                const brick = window.bricks[r][c];
                                if (brick) {
                                    if (c < 6) { // 왼쪽 절반
                                        leftCount++;
                                        leftHP += brick.hp;
                                    } else { // 오른쪽 절반
                                        rightCount++;
                                        rightHP += brick.hp;
                                    }
                                }
                            }
                        }
                        
                        // 더 많은 벽돌이 있는 쪽을 타겟으로
                        const targetX = leftHP > rightHP ? 200 : 600;
                        
                        return {
                            targetX: targetX,
                            density: leftHP + rightHP,
                            leftDensity: leftHP,
                            rightDensity: rightHP
                        };
                    },
                    
                    // AI 업데이트 (매 프레임 호출)
                    update: function() {
                        if (!this.enabled || !window.ball || !window.paddle) return;
                        
                        const optimalX = this.getOptimalPaddlePosition();
                        if (optimalX === null) return;
                        
                        const distance = optimalX - window.paddle.x;
                        const speed = Math.min(Math.abs(distance) * 0.6, window.paddle.speed * 2.5);
                        
                        if (Math.abs(distance) > 2) {
                            if (distance > 0) {
                                window.paddle.x = Math.min(window.paddle.x + speed, 800 - window.paddle.width);
                            } else {
                                window.paddle.x = Math.max(window.paddle.x - speed, 0);
                            }
                        }
                    }
                };
                
                // 글로벌 접근을 위해 window에 할당
                window.enhancedAI = enhancedAI;
                window.getGameState = getGameState;
                
                console.log('✅ 게임 제어 스크립트 주입 완료!');
                '게임 제어 시스템 준비 완료!'
            `
        });
        
        // 5초 동안 기본 상태 관찰
        console.log('👁️  5초간 게임 상태 관찰...');
        for (let i = 0; i < 5; i++) {
            const state = await Runtime.evaluate({
                expression: 'getGameState()'
            });
            
            console.log(`📊 [${i+1}s] 게임상태:`, JSON.stringify(state.result.value, null, 2));
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // Enhanced AI 활성화 및 테스트
        console.log('🤖 Enhanced AI 활성화...');
        
        await Runtime.evaluate({
            expression: `
                // 기존 자동모드 비활성화
                if (window.autoMode) {
                    toggleAutoMode();
                }
                
                // Enhanced AI 시작
                enhancedAI.start();
                
                // AI 업데이트 루프 생성
                if (window.enhancedAIInterval) {
                    clearInterval(window.enhancedAIInterval);
                }
                
                window.enhancedAIInterval = setInterval(() => {
                    enhancedAI.update();
                }, 16); // 60fps
                
                'Enhanced AI 활성화 완료!'
            `
        });
        
        // AI 모드별 테스트
        const aiModes = ['defensive', 'aggressive', 'smart'];
        
        for (const mode of aiModes) {
            console.log(`\n🎯 AI 모드 테스트: ${mode.toUpperCase()}`);
            
            await Runtime.evaluate({
                expression: `
                    enhancedAI.mode = '${mode}';
                    console.log('AI 모드 변경:', '${mode}');
                    'AI 모드 변경: ${mode}'
                `
            });
            
            // 각 모드에서 10초간 테스트
            for (let i = 0; i < 10; i++) {
                const state = await Runtime.evaluate({
                    expression: `
                        const state = getGameState();
                        const analysis = enhancedAI.analyzeBrickDensity();
                        const prediction = enhancedAI.predictBallPosition(3);
                        
                        JSON.stringify({
                            ...state,
                            aiMode: enhancedAI.mode,
                            brickAnalysis: analysis,
                            ballPrediction: prediction
                        })
                    `
                });
                
                const result = JSON.parse(state.result.value);
                console.log(`  [${mode}:${i+1}s] 점수:${result.score} 레벨:${result.level} 벽돌:${result.bricksCount} 공:(${result.ballPosition?.x},${result.ballPosition?.y}) AI분석:좌${result.brickAnalysis?.leftDensity}|우${result.brickAnalysis?.rightDensity}`);
                
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        // 게임 성능 분석
        console.log('\n📈 최종 게임 분석...');
        const finalAnalysis = await Runtime.evaluate({
            expression: `
                const state = getGameState();
                const analysis = enhancedAI.analyzeBrickDensity();
                
                // 게임 성능 지표 계산
                const performance = {
                    finalScore: state.score,
                    finalLevel: state.level,
                    remainingBricks: state.bricksCount,
                    gameState: state.gameState,
                    brickDistribution: analysis,
                    efficiency: state.score / Math.max(1, Date.now() - window.gameStartTime || 1)
                };
                
                JSON.stringify(performance, null, 2)
            `
        });
        
        console.log('🏁 최종 분석 결과:');
        console.log(finalAnalysis.result.value);
        
        // 스크린샷 캡처
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./falling-breakout-test.png', screenshot.data, 'base64');
        console.log('📸 스크린샷 저장됨: falling-breakout-test.png');
        
        // 정리
        await Runtime.evaluate({
            expression: `
                if (window.enhancedAIInterval) {
                    clearInterval(window.enhancedAIInterval);
                }
                enhancedAI.stop();
                '테스트 정리 완료'
            `
        });
        
        client.close();
        console.log('✅ Falling Bricks Breakout CDP 테스트 완료!');
        
    } catch (error) {
        console.error('❌ CDP 테스트 에러:', error.message);
    }
}

// 테스트 실행
testFallingBreakout();