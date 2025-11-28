// 픽셀 눈 효과
const snowCanvas = document.getElementById('snowCanvas');
const snowCtx = snowCanvas.getContext('2d');

// 픽셀 스타일 설정
snowCtx.imageSmoothingEnabled = false;

// 눈송이 배열
let snowflakes = [];
const MAX_SNOWFLAKES = 150;

// 캔버스 리사이즈
function resizeSnowCanvas() {
    snowCanvas.width = window.innerWidth;
    snowCanvas.height = window.innerHeight;
}

// 눈송이 생성
function createSnowflake() {
    return {
        x: Math.random() * snowCanvas.width,
        y: -5,
        size: Math.floor(Math.random() * 3) + 2, // 2~4px 픽셀 크기
        speed: Math.random() * 1 + 0.5,
        drift: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
    };
}

// 눈송이 업데이트
function updateSnowflakes() {
    // 새 눈송이 추가
    if (snowflakes.length < MAX_SNOWFLAKES && Math.random() < 0.3) {
        snowflakes.push(createSnowflake());
    }

    // 눈송이 이동
    for (let i = snowflakes.length - 1; i >= 0; i--) {
        const flake = snowflakes[i];

        flake.y += flake.speed;
        flake.x += flake.drift;

        // 약간의 흔들림 추가
        flake.x += Math.sin(flake.y * 0.01) * 0.3;

        // 화면 밖으로 나가면 제거
        if (flake.y > snowCanvas.height + 10 ||
            flake.x < -10 ||
            flake.x > snowCanvas.width + 10) {
            snowflakes.splice(i, 1);
        }
    }
}

// 픽셀 눈송이 그리기
function drawSnowflakes() {
    snowCtx.clearRect(0, 0, snowCanvas.width, snowCanvas.height);

    snowflakes.forEach(flake => {
        snowCtx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;

        // 픽셀 사각형으로 그리기
        const x = Math.floor(flake.x);
        const y = Math.floor(flake.y);
        const size = flake.size;

        // 십자가 모양 픽셀 눈송이
        if (size >= 3) {
            // 중심
            snowCtx.fillRect(x, y, 2, 2);
            // 상하좌우
            snowCtx.fillRect(x - 1, y, 1, 2);
            snowCtx.fillRect(x + 2, y, 1, 2);
            snowCtx.fillRect(x, y - 1, 2, 1);
            snowCtx.fillRect(x, y + 2, 2, 1);
        } else {
            // 작은 눈송이는 단순 사각형
            snowCtx.fillRect(x, y, size, size);
        }
    });
}

// 애니메이션 루프
function snowLoop() {
    updateSnowflakes();
    drawSnowflakes();
    requestAnimationFrame(snowLoop);
}

// 눈 효과 on/off
let snowEnabled = true;

function toggleSnow() {
    snowEnabled = !snowEnabled;
    const btn = document.getElementById('snowToggle');
    const text = btn.querySelector('.snow-toggle-text');

    if (snowEnabled) {
        btn.classList.remove('off');
        text.textContent = 'snow: on';
        snowCanvas.style.display = 'block';
    } else {
        btn.classList.add('off');
        text.textContent = 'snow: off';
        snowCanvas.style.display = 'none';
    }
}

// 초기화
resizeSnowCanvas();
window.addEventListener('resize', resizeSnowCanvas);
snowLoop();
