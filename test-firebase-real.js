const CDP = require('chrome-remote-interface');

async function testFirebaseReal() {
    try {
        console.log('🔥 실제 Firebase 연동 테스트 시작...');
        
        const tab = await CDP.New({port: 9222});
        const client = await CDP({tab});
        const {Page, Runtime} = client;
        
        await Page.enable();
        await Runtime.enable();
        
        const gameUrl = 'http://localhost:53430/posts/playground/falling-bricks-breakout-v2.html';
        console.log(`📄 게임 로드: ${gameUrl}`);
        
        await Page.navigate({url: gameUrl});
        await new Promise(resolve => Page.loadEventFired(resolve));
        await new Promise(resolve => setTimeout(resolve, 5000)); // Firebase 초기화 대기
        
        console.log('✅ 게임 로드 완료!');
        
        // Firebase 연결 상태 및 디버깅 정보 확인
        const firebaseStatus = await Runtime.evaluate({
            expression: `
                JSON.stringify({
                    isFirebaseEnabled: typeof window.isFirebaseEnabled === 'function' ? window.isFirebaseEnabled() : false,
                    hasSaveScore: typeof window.saveScore === 'function',
                    hasLoadRankings: typeof window.loadRankings === 'function',
                    consoleLog: 'Firebase 상태 체크 완료'
                })
            `
        });
        
        console.log('🔥 Firebase 상태:', firebaseStatus.result.value);
        
        // 브라우저 콘솔 로그 확인
        const consoleLogs = await Runtime.evaluate({
            expression: `
                // 콘솔 로그 캡처를 위한 임시 함수
                let capturedLogs = [];
                const originalLog = console.log;
                console.log = function(...args) {
                    capturedLogs.push(args.join(' '));
                    originalLog.apply(console, args);
                };
                
                // Firebase 연결 테스트
                setTimeout(() => {
                    console.log('Firebase 테스트 로그');
                }, 100);
                
                '로그 캡처 설정 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 실제 점수 저장 테스트
        console.log('💾 실제 Firebase 점수 저장 테스트...');
        const saveResult = await Runtime.evaluate({
            expression: `
                new Promise((resolve) => {
                    if (window.saveScore) {
                        window.saveScore('CDPFirebase테스터', 9999, 5).then(() => {
                            resolve('점수 저장 성공');
                        }).catch((error) => {
                            resolve('점수 저장 실패: ' + error.message);
                        });
                    } else {
                        resolve('saveScore 함수 없음');
                    }
                })
            `
        });
        
        console.log('💾 저장 결과:', saveResult.result.value);
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 랭킹 로드 테스트
        console.log('📊 Firebase 랭킹 로드 테스트...');
        await Runtime.evaluate({
            expression: `
                if (window.loadRankings) {
                    window.loadRankings();
                }
                '랭킹 로드 시작'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 최종 랭킹 데이터 확인
        const finalRankings = await Runtime.evaluate({
            expression: `
                const rankingItems = Array.from(document.querySelectorAll('.ranking-item')).map(item => ({
                    rank: item.querySelector('.rank')?.textContent,
                    name: item.querySelector('.name')?.textContent,
                    score: item.querySelector('.score')?.textContent,
                    level: item.querySelector('.level')?.textContent
                }));
                
                JSON.stringify({
                    rankingCount: rankingItems.length,
                    rankings: rankingItems,
                    firebaseEnabled: window.isFirebaseEnabled ? window.isFirebaseEnabled() : false
                }, null, 2)
            `
        });
        
        console.log('📋 최종 랭킹 데이터:', finalRankings.result.value);
        
        // 게임오버 시뮬레이션으로 UI 테스트
        console.log('🎮 실제 점수 등록 시뮬레이션...');
        await Runtime.evaluate({
            expression: `
                // 높은 점수로 게임오버 시뮬레이션
                window.score = 15000;
                window.level = 8;
                window.gameState = 'gameOver';
                window.showGameOver();
                
                '게임오버 시뮬레이션 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // 자동 점수 등록
        await Runtime.evaluate({
            expression: `
                document.getElementById('playerNameInput').value = 'Real테스터';
                window.submitScore();
                '실제 점수 등록 완료'
            `
        });
        
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // 최종 확인
        const finalCheck = await Runtime.evaluate({
            expression: `
                const newRankings = Array.from(document.querySelectorAll('.ranking-item')).map(item => ({
                    rank: item.querySelector('.rank')?.textContent,
                    name: item.querySelector('.name')?.textContent,
                    score: item.querySelector('.score')?.textContent
                }));
                
                JSON.stringify(newRankings)
            `
        });
        
        console.log('🏁 최종 랭킹 확인:', finalCheck.result.value);
        
        // 스크린샷 캡처
        console.log('📸 Firebase 연동 스크린샷 캡처...');
        const screenshot = await Page.captureScreenshot({
            format: 'png',
            quality: 90
        });
        
        require('fs').writeFileSync('./firebase-real-test.png', screenshot.data, 'base64');
        console.log('📸 스크린샷 저장: firebase-real-test.png');
        
        client.close();
        console.log('✅ Firebase 실제 연동 테스트 완료!');
        
    } catch (error) {
        console.error('❌ Firebase 테스트 에러:', error.message);
    }
}

testFirebaseReal();