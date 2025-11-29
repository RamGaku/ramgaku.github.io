const CDP = require('chrome-remote-interface');

async function testRankingSystem() {
    try {
        console.log('🏆 랭킹 시스템 CDP 테스트 시작...');
        
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
        
        // Firebase 연결 상태 확인
        const firebaseCheck = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    isFirebaseEnabled: typeof window.isFirebaseEnabled === 'function' ? window.isFirebaseEnabled() : false,
                    hasSaveScore: typeof window.saveScore === 'function',
                    hasLoadRankings: typeof window.loadRankings === 'function'
                })
            `
        });
        
        console.log('🔥 Firebase 상태:', firebaseCheck.result.value);
        
        // 로컬 점수 몇 개 추가 (테스트용)
        console.log('💾 테스트 점수 추가...');
        await Runtime.evaluate({
            expression: `
                // 테스트용 점수 추가
                const testScores = [
                    {name: '테스터1', score: 5000, level: 3},
                    {name: '테스터2', score: 8000, level: 4}, 
                    {name: '테스터3', score: 3200, level: 2},
                    {name: '고수', score: 12000, level: 6},
                    {name: '프로게이머', score: 15000, level: 7}
                ];
                
                testScores.forEach(ts => {
                    if (window.saveScore) {
                        window.saveScore(ts.name, ts.score, ts.level);
                    }
                });
                
                console.log('테스트 점수 추가 완료');
                '테스트 점수 추가 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 랭킹 표시 테스트
        console.log('📊 랭킹 표시 테스트...');
        await Runtime.evaluate({
            expression: `
                if (window.showRanking) {
                    window.showRanking();
                }
                '랭킹 표시'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 랭킹 데이터 확인
        const rankingData = await Runtime.evaluate({
            expression: `
                const rankingItems = Array.from(document.querySelectorAll('.ranking-item')).map(item => ({
                    rank: item.querySelector('.rank')?.textContent,
                    name: item.querySelector('.name')?.textContent,
                    score: item.querySelector('.score')?.textContent,
                    level: item.querySelector('.level')?.textContent
                }));
                
                JSON.stringify({
                    rankingVisible: document.getElementById('rankingContainer').style.display !== 'none',
                    rankingCount: rankingItems.length,
                    rankings: rankingItems
                }, null, 2)
            `
        });
        
        console.log('📋 랭킹 데이터:', rankingData.result.value);
        
        // 게임오버 시뮬레이션 (점수 등록 테스트)
        console.log('🎮 게임오버 시뮬레이션...');
        await Runtime.evaluate({
            expression: `
                // 점수 설정
                window.score = 6500;
                window.level = 4;
                
                // 게임오버 처리
                window.gameState = 'gameOver';
                window.showGameOver();
                
                '게임오버 시뮬레이션 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 점수 등록 UI 확인
        const scoreSubmitUI = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    gameOverVisible: document.getElementById('gameOver').style.display === 'block',
                    rankingContainerVisible: document.getElementById('rankingContainer').style.display === 'block',
                    scoreSubmitVisible: document.getElementById('scoreSubmitSection').style.display === 'block',
                    finalScore: document.getElementById('finalScore').textContent,
                    hasNameInput: !!document.getElementById('playerNameInput')
                })
            `
        });
        
        console.log('🎯 점수 등록 UI:', scoreSubmitUI.result.value);
        
        // 자동으로 점수 등록
        console.log('📝 자동 점수 등록...');
        await Runtime.evaluate({
            expression: `
                document.getElementById('playerNameInput').value = 'CDP테스터';
                window.submitScore();
                '점수 등록 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 최종 랭킹 확인
        const finalRanking = await Runtime.evaluate({
            expression: `
                const updatedRankings = Array.from(document.querySelectorAll('.ranking-item')).map(item => ({
                    rank: item.querySelector('.rank')?.textContent,
                    name: item.querySelector('.name')?.textContent,
                    score: item.querySelector('.score')?.textContent,
                    level: item.querySelector('.level')?.textContent
                }));
                
                JSON.stringify(updatedRankings, null, 2)
            `
        });
        
        console.log('🏁 최종 랭킹:', finalRanking.result.value);
        
        // 스크린샷 캡처
        console.log('📸 랭킹 시스템 스크린샷 캡처...');
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./ranking-system-test.png', screenshot.data, 'base64');
        console.log('📸 스크린샷 저장: ranking-system-test.png');
        
        client.close();
        console.log('✅ 랭킹 시스템 테스트 완료!');
        
    } catch (error) {
        console.error('❌ 랭킹 테스트 에러:', error.message);
    }
}

testRankingSystem();