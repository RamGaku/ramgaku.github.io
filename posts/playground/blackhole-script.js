const canvas = document.getElementById('spaceCanvas');
const ctx = canvas.getContext('2d');

// 픽셀 아트 스타일 설정
ctx.imageSmoothingEnabled = false;

let isPaused = false;
let animationId;

// 캔버스 크기에 따른 스케일 팩터 계산
function getScaleFactor() {
    const baseWidth = 800;
    const baseHeight = 600;
    const scaleX = canvas.width / baseWidth;
    const scaleY = canvas.height / baseHeight;
    return Math.min(scaleX, scaleY);
}

// 블랙홀 (크기를 스케일에 맞춰 조정)
function updateBlackHole() {
    const scale = getScaleFactor();
    blackHole.x = canvas.width / 2;
    blackHole.y = canvas.height / 2;
    blackHole.radius = 4 * scale;
    blackHole.eventHorizon = 60 * scale;
    blackHole.gravityRange = 400 * scale;
    blackHole.coreRadius = 8 * scale;
}

const blackHole = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 4,
    eventHorizon: 60,
    gravityRange: 400,
    coreRadius: 8,
    mass: 1000,
    baseMass: 1000,
    coreParticleCount: 0
};

// 소행성과 파편 배열
let asteroids = [];
let particles = [];
let stars = [];
let absorbers = [];

// 통계
let stats = {
    asteroidCount: 0,
    particleCount: 0,
    absorbedCount: 0
};

// 별 생성 (배경)
function createStars() {
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            brightness: Math.random()
        });
    }
}

// 소행성 생성
function createAsteroid() {
    const side = Math.floor(Math.random() * 4);
    let x, y, vx, vy;

    switch (side) {
        case 0: // 왼쪽
            x = -30;
            y = Math.random() * canvas.height;
            vx = Math.random() * 2 + 1;
            vy = (Math.random() - 0.5) * 2;
            break;
        case 1: // 오른쪽
            x = canvas.width + 30;
            y = Math.random() * canvas.height;
            vx = -(Math.random() * 2 + 1);
            vy = (Math.random() - 0.5) * 2;
            break;
        case 2: // 위쪽
            x = Math.random() * canvas.width;
            y = -30;
            vx = (Math.random() - 0.5) * 2;
            vy = Math.random() * 2 + 1;
            break;
        case 3: // 아래쪽
            x = Math.random() * canvas.width;
            y = canvas.height + 30;
            vx = (Math.random() - 0.5) * 2;
            vy = -(Math.random() * 2 + 1);
            break;
    }

    asteroids.push({
        x: x,
        y: y,
        vx: vx,
        vy: vy,
        size: Math.random() * 15 + 10,
        health: 100,
        maxHealth: 100,
        color: Math.random() > 0.5 ? '#8B4513' : '#696969'
    });
}

// 파편 생성
function createParticles(x, y, count, color, sourceSize = null) {
    for (let i = 0; i < count; i++) {
        const particleSize = sourceSize ? Math.min(sourceSize * 0.1, Math.random() * 3 + 1) : Math.random() * 3 + 1;

        particles.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            size: particleSize,
            life: 1,
            decay: 0,
            color: color,
            counted: false
        });
    }
}

// 중력 계산
function applyGravity(obj) {
    const dx = blackHole.x - obj.x;
    const dy = blackHole.y - obj.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < blackHole.gravityRange && distance > 0.1) {
        const force = (blackHole.mass) / (distance * distance);
        const ax = (dx / distance) * force * 0.1;
        const ay = (dy / distance) * force * 0.1;

        obj.vx += ax;
        obj.vy += ay;

        // 소행성이 중력 범위 안에 있을 때 거리에 따른 파편 생성
        if (obj.health !== undefined && obj.size !== undefined) {
            const gravityStrengthByDistance = Math.min(1, (blackHole.gravityRange / distance) * 0.3);
            const sizeMultiplier = Math.max(1, obj.size / 15);

            const baseParticleChance = gravityStrengthByDistance * 0.02 * sizeMultiplier;

            let intensiveZone = 0;
            if (distance < blackHole.eventHorizon * 2) {
                intensiveZone = 1 - (distance / (blackHole.eventHorizon * 2));
                obj.health -= intensiveZone * 3 * sizeMultiplier;
            }

            const totalParticleChance = baseParticleChance + (intensiveZone * 0.4 * sizeMultiplier);
            let particleCount = 1;

            if (intensiveZone > 0) {
                particleCount = Math.floor(intensiveZone * sizeMultiplier * 5) + 1;
            }

            if (Math.random() < totalParticleChance) {
                const massLoss = particleCount * 0.5;
                obj.size = Math.max(5, obj.size - massLoss);

                createParticles(obj.x, obj.y, particleCount, obj.color, obj.size);
            }
        }
    }
}

// 소행성끼리 충돌 체크
function checkAsteroidCollisions() {
    for (let i = 0; i < asteroids.length; i++) {
        for (let j = i + 1; j < asteroids.length; j++) {
            const a1 = asteroids[i];
            const a2 = asteroids[j];

            const dx = a1.x - a2.x;
            const dy = a1.y - a2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = a1.size + a2.size;

            if (distance < minDistance) {
                // 첫 번째 소행성을 두 개로 분할
                if (a1.size > 8) {
                    const newSize1 = a1.size * 0.7;
                    const newSize2 = a1.size * 0.7;

                    asteroids.push({
                        x: a1.x + Math.random() * 10 - 5,
                        y: a1.y + Math.random() * 10 - 5,
                        vx: a1.vx + (Math.random() - 0.5) * 4,
                        vy: a1.vy + (Math.random() - 0.5) * 4,
                        size: newSize1,
                        health: 100,
                        maxHealth: 100,
                        color: a1.color
                    });

                    asteroids.push({
                        x: a1.x + Math.random() * 10 - 5,
                        y: a1.y + Math.random() * 10 - 5,
                        vx: a1.vx + (Math.random() - 0.5) * 4,
                        vy: a1.vy + (Math.random() - 0.5) * 4,
                        size: newSize2,
                        health: 100,
                        maxHealth: 100,
                        color: a1.color
                    });
                } else {
                    createParticles(a1.x, a1.y, 8, a1.color, a1.size);
                }

                // 두 번째 소행성을 두 개로 분할
                if (a2.size > 8) {
                    const newSize1 = a2.size * 0.7;
                    const newSize2 = a2.size * 0.7;

                    asteroids.push({
                        x: a2.x + Math.random() * 10 - 5,
                        y: a2.y + Math.random() * 10 - 5,
                        vx: a2.vx + (Math.random() - 0.5) * 4,
                        vy: a2.vy + (Math.random() - 0.5) * 4,
                        size: newSize1,
                        health: 100,
                        maxHealth: 100,
                        color: a2.color
                    });

                    asteroids.push({
                        x: a2.x + Math.random() * 10 - 5,
                        y: a2.y + Math.random() * 10 - 5,
                        vx: a2.vx + (Math.random() - 0.5) * 4,
                        vy: a2.vy + (Math.random() - 0.5) * 4,
                        size: newSize2,
                        health: 100,
                        maxHealth: 100,
                        color: a2.color
                    });
                } else {
                    createParticles(a2.x, a2.y, 8, a2.color, a2.size);
                }

                // 원래 소행성들 제거 (뒤에서부터 제거)
                asteroids.splice(Math.max(i, j), 1);
                asteroids.splice(Math.min(i, j), 1);

                return;
            }
        }
    }
}

// 소행성 업데이트
function updateAsteroids() {
    checkAsteroidCollisions();

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i];

        applyGravity(asteroid);

        asteroid.x += asteroid.vx;
        asteroid.y += asteroid.vy;

        if (asteroid.health <= 0 || asteroid.size <= 5) {
            const finalParticleCount = Math.floor(asteroid.size / 2) + 5;
            createParticles(asteroid.x, asteroid.y, finalParticleCount, asteroid.color, asteroid.size);
            asteroids.splice(i, 1);
            continue;
        }

        if (asteroid.x < -200 || asteroid.x > canvas.width + 200 ||
            asteroid.y < -200 || asteroid.y > canvas.height + 200) {
            asteroids.splice(i, 1);
        }
    }
}

// 파편 업데이트
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.x += particle.vx;
        particle.y += particle.vy;

        const friction = particle.isFragment ? 0.999 : 0.998;
        particle.vx *= friction;
        particle.vy *= friction;

        const dx = blackHole.x - particle.x;
        const dy = blackHole.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < blackHole.gravityRange && distance > 0.1) {
            const force = (blackHole.mass) / (distance * distance);
            const ax = (dx / distance) * force * 0.1;
            const ay = (dy / distance) * force * 0.1;

            particle.vx += ax;
            particle.vy += ay;
        }

        const glowOuterRadius = 40;
        if (distance < glowOuterRadius) {
            if (!particle.counted) {
                particle.counted = true;
                blackHole.coreParticleCount++;
                blackHole.mass = blackHole.baseMass + (blackHole.coreParticleCount * 100);
            }

            const angle = Math.atan2(particle.y - blackHole.y, particle.x - blackHole.x);

            const newOrbitRadius = glowOuterRadius + Math.random() * 80;
            particle.x = blackHole.x + Math.cos(angle) * newOrbitRadius;
            particle.y = blackHole.y + Math.sin(angle) * newOrbitRadius;

            const orbitSpeed = 2 + Math.random() * 4;
            const angleOffset = (Math.random() - 0.5) * Math.PI / 3;
            const direction = Math.random() > 0.5 ? 1 : -1;
            particle.vx = Math.cos(angle + Math.PI / 2 * direction + angleOffset) * orbitSpeed;
            particle.vy = Math.sin(angle + Math.PI / 2 * direction + angleOffset) * orbitSpeed;
        }

        const maxSpeed = 20;
        particle.vx = Math.max(-maxSpeed, Math.min(maxSpeed, particle.vx));
        particle.vy = Math.max(-maxSpeed, Math.min(maxSpeed, particle.vy));

        if (isNaN(particle.x) || isNaN(particle.y)) {
            particle.x = blackHole.x + (Math.random() - 0.5) * 100;
            particle.y = blackHole.y + (Math.random() - 0.5) * 100;
            particle.vx = (Math.random() - 0.5) * 4;
            particle.vy = (Math.random() - 0.5) * 4;
        }

        if (particle.x < -500 || particle.x > canvas.width + 500 ||
            particle.y < -500 || particle.y > canvas.height + 500) {
            particle.x = blackHole.x + (Math.random() - 0.5) * 200;
            particle.y = blackHole.y + (Math.random() - 0.5) * 200;
        }
    }
}

// 픽셀 아트 스타일로 원 그리기
function drawPixelCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    for (let i = -radius; i <= radius; i++) {
        for (let j = -radius; j <= radius; j++) {
            if (i * i + j * j <= radius * radius) {
                ctx.fillRect(Math.floor(x + i), Math.floor(y + j), 1, 1);
            }
        }
    }
}

// 그리기 함수
function draw() {
    ctx.fillStyle = '#000008';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 별 그리기
    stars.forEach(star => {
        const twinkle = Math.sin(Date.now() * 0.001 + star.x) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness * twinkle})`;
        ctx.fillRect(Math.floor(star.x), Math.floor(star.y), star.size, star.size);
    });

    // 블랙홀 중심 크기 계산
    const gravityScale = blackHole.mass / blackHole.baseMass;
    const dynamicRadius = blackHole.radius * (1 + Math.log(gravityScale) * 0.3);
    const time = Date.now() * 0.001;

    // 사건의 지평선 glow 효과
    const glowLayers = 8;
    for (let i = glowLayers; i >= 0; i--) {
        const waveOffset = Math.sin(time * 2 + i * 0.5) * 2 + Math.cos(time * 3 + i * 0.3) * 1.5;
        const glowRadius = dynamicRadius + i * 4 + waveOffset;
        const alphaWave = Math.sin(time * 1.5 + i * 0.7) * 0.1 + 0.9;
        const alpha = (1 - i / glowLayers) * 0.4 * alphaWave;
        drawPixelCircle(blackHole.x, blackHole.y, glowRadius, `rgba(138, 43, 226, ${alpha})`);
    }

    // 소행성 그리기
    asteroids.forEach(asteroid => {
        const healthRatio = asteroid.health / asteroid.maxHealth;
        const red = Math.floor((1 - healthRatio) * 255);
        const original = asteroid.color === '#8B4513' ? [139, 69, 19] : [105, 105, 105];

        const finalColor = `rgb(${Math.min(255, original[0] + red)}, ${Math.max(0, original[1] - red)}, ${Math.max(0, original[2] - red)})`;

        drawPixelCircle(asteroid.x, asteroid.y, asteroid.size, finalColor);

        for (let i = 0; i < 3; i++) {
            const angle = (Date.now() * 0.001 + asteroid.x) * 0.5 + i * Math.PI * 2 / 3;
            const detailX = asteroid.x + Math.cos(angle) * (asteroid.size * 0.7);
            const detailY = asteroid.y + Math.sin(angle) * (asteroid.size * 0.7);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.fillRect(Math.floor(detailX), Math.floor(detailY), 2, 2);
        }
    });

    // 파편 그리기
    particles.forEach(particle => {
        const size = Math.max(1, particle.size);

        if (particle.isFragment) {
            drawPixelCircle(particle.x, particle.y, size, particle.color);
        } else {
            ctx.fillStyle = particle.color;
            ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), Math.ceil(size), Math.ceil(size));
        }
    });

    // 블랙홀 중심 (완전히 검은색)
    drawPixelCircle(blackHole.x, blackHole.y, dynamicRadius, '#000000');
}

// 통계 업데이트
function updateStats() {
    stats.asteroidCount = asteroids.length;
    stats.particleCount = particles.length;

    const gravityLevel = Math.floor((blackHole.mass - blackHole.baseMass) / 100) + 1;

    document.getElementById('asteroidCount').textContent = stats.asteroidCount;
    document.getElementById('particleCount').textContent = stats.particleCount;
    document.getElementById('absorbedCount').textContent = stats.absorbedCount;
    document.getElementById('gravityStrength').textContent = gravityLevel;
}

// 캔버스 리사이즈 처리
function handleResize() {
    const rect = canvas.getBoundingClientRect();
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    updateBlackHole();
}

// 소행성 자동 생성 관련
let lastSpawnTime = 0;

function getSpawnRate() {
    const spawnInput = document.getElementById('spawnRate');
    return parseFloat(spawnInput.value) || 0.2;
}

// 슬라이더와 입력창 동기화
function syncSpawnControls() {
    const spawnInput = document.getElementById('spawnRate');
    const spawnSlider = document.getElementById('spawnSlider');

    spawnInput.addEventListener('input', function () {
        spawnSlider.value = this.value;
    });

    spawnSlider.addEventListener('input', function () {
        spawnInput.value = this.value;
    });
}

// 게임 루프
function gameLoop(currentTime = 0) {
    if (!isPaused) {
        updateAsteroids();
        updateParticles();
        draw();
        updateStats();

        const spawnRate = getSpawnRate();
        const spawnInterval = 1000 / spawnRate;

        if (spawnRate > 0 && currentTime - lastSpawnTime >= spawnInterval) {
            createAsteroid();
            lastSpawnTime = currentTime;
        }
    }

    animationId = requestAnimationFrame(gameLoop);
}

// 컨트롤 함수들
function togglePause() {
    isPaused = !isPaused;
}

function resetSimulation() {
    asteroids = [];
    particles = [];
    stats.absorbedCount = 0;
    blackHole.coreParticleCount = 0;
    blackHole.mass = blackHole.baseMass;
}

function spawnAsteroid() {
    createAsteroid();
}

// 초기화
createStars();
updateBlackHole();
syncSpawnControls();

// 리사이즈 이벤트 리스너
window.addEventListener('resize', handleResize);
window.addEventListener('orientationchange', () => {
    setTimeout(handleResize, 100);
});

gameLoop();
