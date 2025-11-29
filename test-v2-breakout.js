const CDP = require('chrome-remote-interface');

async function testV2Breakout() {
    try {
        console.log('🎮 Falling Bricks Breakout v2 CDP 테스트 시작...');
        
        const tab = await CDP.New({port: 9222});
        const client = await CDP({tab});
        const {Page, Runtime} = client;
        
        await Page.enable();
        await Runtime.enable();
        
        const gameUrl = 'http://localhost:53430/posts/playground/falling-bricks-breakout-v2.html';
        console.log(`📄 v2 게임 로드: ${gameUrl}`);
        
        await Page.navigate({url: gameUrl});
        await new Promise(resolve => Page.loadEventFired(resolve));
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('✅ v2 게임 로드 완료!');
        
        // 15초간 게임 진행 관찰
        for (let i = 0; i < 15; i++) {
            const result = await Runtime.evaluate({
                expression: `
                    try {
                        JSON.stringify({
                            score: document.getElementById('score')?.textContent,
                            level: document.getElementById('level')?.textContent, 
                            bricks: document.getElementById('bricksCount')?.textContent,
                            ballCount: balls ? balls.length : 0,
                            itemCount: items ? items.length : 0,
                            gameState: gameState,
                            timestamp: Date.now()
                        });
                    } catch (e) {
                        JSON.stringify({ error: e.message });
                    }
                `
            });
            
            const state = JSON.parse(result.result.value);
            console.log(`📊 [${i+1}s] ${state.score} | ${state.level} | ${state.bricks} | 공:${state.ballCount} | 아이템:${state.itemCount}`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 아이템 테스트 - 강제로 아이템 생성
        console.log('🎁 아이템 시스템 테스트...');
        await Runtime.evaluate({
            expression: `
                // 공 추가 아이템 생성
                createItem(400, 300, 'BALL_ADD');
                
                // 공 분열 아이템 생성
                setTimeout(() => {
                    createItem(450, 350, 'BALL_SPLIT');
                }, 2000);
                
                console.log('아이템 테스트용 아이템 생성됨');
                '아이템 테스트 시작'
            `
        });
        
        // 5초간 아이템 효과 관찰
        for (let i = 0; i < 5; i++) {
            const result = await Runtime.evaluate({
                expression: `
                    JSON.stringify({
                        ballCount: balls ? balls.length : 0,
                        itemCount: items ? items.length : 0,
                        score: document.getElementById('score')?.textContent
                    });
                `
            });
            
            const state = JSON.parse(result.result.value);
            console.log(`🎁 [아이템:${i+1}s] 공:${state.ballCount} | 아이템:${state.itemCount} | ${state.score}`);
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 레벨업 효과 테스트
        console.log('⬆️ 레벨업 효과 테스트...');
        await Runtime.evaluate({
            expression: `
                // 강제 레벨업
                level = 3;
                createLevelUpEffect();
                levelElement.textContent = '레벨: 3';
                
                '레벨업 효과 테스트 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 스크린샷 캡처
        console.log('📸 v2 스크린샷 캡처...');
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./falling-breakout-v2-test.png', screenshot.data, 'base64');
        console.log('📸 v2 스크린샷 저장: falling-breakout-v2-test.png');
        
        // 최종 상태 확인
        const finalState = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    score: document.getElementById('score')?.textContent,
                    level: document.getElementById('level')?.textContent,
                    ballCount: balls ? balls.length : 0,
                    totalBricks: bricks ? bricks.flat().filter(b => b !== null).length : 0,
                    gameState: gameState
                });
            `
        });
        
        console.log('🏁 v2 최종 상태:', finalState.result.value);
        
        client.close();
        console.log('✅ v2 테스트 완료!');
        
    } catch (error) {
        console.error('❌ v2 테스트 에러:', error.message);
    }
}

testV2Breakout();