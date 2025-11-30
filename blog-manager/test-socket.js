const io = require('socket.io-client');

async function testSocketConnection() {
    console.log('🔌 Socket.io 연결 테스트 시작...');
    
    const socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
        console.log('✅ Socket.io 서버 연결 성공');
        console.log(`   연결 ID: ${socket.id}`);
        
        // 터미널 시작
        console.log('💻 터미널 세션 시작...');
        socket.emit('start-terminal');
        
        // 터미널 출력 수신
        socket.on('terminal-output', (data) => {
            console.log('📄 터미널 출력:', data.trim());
        });
        
        // 2초 후 명령어 실행
        setTimeout(() => {
            console.log('⌨️  명령어 실행: echo "Socket.io 테스트"');
            socket.emit('terminal-input', 'echo "Socket.io 테스트"\r\n');
        }, 2000);
        
        // 5초 후 dir 명령어 실행
        setTimeout(() => {
            console.log('📁 디렉토리 목록 조회...');
            socket.emit('terminal-input', 'dir\r\n');
        }, 5000);
        
        // 8초 후 연결 종료
        setTimeout(() => {
            console.log('🔌 Socket.io 연결 종료...');
            socket.disconnect();
            process.exit(0);
        }, 8000);
    });
    
    socket.on('disconnect', () => {
        console.log('❌ Socket.io 연결 해제됨');
    });
    
    socket.on('connect_error', (error) => {
        console.error('❌ Socket.io 연결 실패:', error.message);
        process.exit(1);
    });
}

testSocketConnection().catch(console.error);