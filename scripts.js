// Game State
const state = {
    stage: 0,
    score: 0,
    lives: 3,
    totalStages: 7,
    moving: false,
    timer: null,
    timeLeft: 20,
    musicOn: false
};

// Locations data
const locations = [
    { name: 'Hà Nội', fact: 'Ngày 26/3/1975, chiến dịch giải phóng Huế - Đà Nẵng bắt đầu. Đây là bước ngoặt quan trọng trên hành trình thống nhất đất nước.' },
    { name: 'Huế', fact: 'Ngày 26/3/1975, thành phố Huế được giải phóng. Cố đô Huế với bề dày lịch sử nghìn năm đã trở về với nhân dân.' },
    { name: 'Đà Nẵng', fact: 'Ngày 29/3/1975, Đà Nẵng - thành phố lớn thứ hai miền Nam được giải phóng hoàn toàn.' },
    { name: 'Quy Nhơn', fact: 'Các tỉnh duyên hải miền Trung lần lượt được giải phóng, mở đường tiến vào miền Nam.' },
    { name: 'Nha Trang', fact: 'Ngày 2/4/1975, Nha Trang được giải phóng. Quân giải phóng tiếp tục tiến về phía Nam với khí thế như vũ bão.' },
    { name: 'Xuân Lộc', fact: 'Trận Xuân Lộc (9-21/4/1975) là trận đánh ác liệt cuối cùng. Chiến thắng Xuân Lộc mở toang cánh cửa vào Sài Gòn.' },
    { name: 'Sài Gòn', fact: 'Ngày 30/4/1975, xe tăng húc đổ cổng Dinh Độc Lập. Chiến dịch Hồ Chí Minh toàn thắng, đất nước hoàn toàn thống nhất!' }
];

// Quiz data
const quizzes = [
    { question: 'Chiến dịch giải phóng miền Nam mang tên vị lãnh tụ nào?', options: ['Chiến dịch Hồ Chí Minh', 'Chiến dịch Điện Biên Phủ', 'Chiến dịch Trường Sơn', 'Chiến dịch Đông Xuân'], answer: 0 },
    { question: 'Thành phố Huế được giải phóng hoàn toàn vào ngày nào?', options: ['25/3/1975', '26/3/1975', '27/3/1975', '28/3/1975'], answer: 1 },
    { question: 'Đà Nẵng được giải phóng vào ngày nào?', options: ['28/3/1975', '29/3/1975', '30/3/1975', '31/3/1975'], answer: 1 },
    { question: 'Đường mòn Hồ Chí Minh còn có tên gọi nào khác?', options: ['Đường 1A', 'Đường Trường Sơn', 'Đường số 9', 'Đường Thống Nhất'], answer: 1 },
    { question: 'Trận đánh ác liệt cuối cùng trước khi giải phóng Sài Gòn là trận nào?', options: ['Trận Buôn Ma Thuột', 'Trận Phước Long', 'Trận Xuân Lộc', 'Trận Tây Ninh'], answer: 2 },
    { question: 'Xe tăng đầu tiên húc đổ cổng Dinh Độc Lập mang số hiệu gì?', options: ['Số 390', 'Số 843', 'Số 354', 'Số 279'], answer: 1 },
    { question: 'Ngày 30/4/1975 đánh dấu sự kiện lịch sử gì?', options: ['Ký hiệp định Paris', 'Giải phóng miền Nam thống nhất đất nước', 'Thành lập nước CHXHCN Việt Nam', 'Tổng tuyển cử'], answer: 1 }
];

// Default prizes (fallback)
const defaultPrizes = [
    'Một bữa Haidilao',
    'Một Matcha Latte',
    'Một Kichi-Kichi',
    'Một trà sữa',
    'Chúc em may mắn lần sau =,='
];

// Load prizes from localStorage or use defaults
let prizes = loadPrizes();

function loadPrizes() {
    try {
        const saved = localStorage.getItem('wheelPrizes');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch (e) { /* ignore */ }
    return [...defaultPrizes];
}

// DOM shortcuts
const $ = id => document.getElementById(id);

// ── Particles ──
const particleCanvas = $('particles-canvas');
const pCtx = particleCanvas.getContext('2d');
let particleList = [];

function resizeParticles() {
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeParticles);
resizeParticles();

class Particle {
    constructor() { this.reset(); }
    reset() {
        this.x = Math.random() * particleCanvas.width;
        this.y = Math.random() * particleCanvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.vy = -(Math.random() * 0.3 + 0.1);
        this.vx = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '#ffd600' : '#ef5350';
    }
    update() {
        this.y += this.vy;
        this.x += this.vx;
        this.opacity -= 0.001;
        if (this.y < 0 || this.opacity <= 0) this.reset();
    }
    draw() {
        pCtx.beginPath();
        pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        pCtx.fillStyle = this.color;
        pCtx.globalAlpha = this.opacity;
        pCtx.fill();
        pCtx.globalAlpha = 1;
    }
}

for (let i = 0; i < 60; i++) particleList.push(new Particle());

function renderParticles() {
    pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
    particleList.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(renderParticles);
}
renderParticles();

// ── YouTube Music ──
let player = null;

function syncMusicBtn() {
    const btn = $('music-toggle');
    if (state.musicOn) {
        btn.classList.add('playing');
        btn.querySelector('.music-icon').textContent = '🔊';
    } else {
        btn.classList.remove('playing');
        btn.querySelector('.music-icon').textContent = '🔇';
    }
}

function tryAutoPlay() {
    if (!player || state.musicOn) return;
    try {
        player.playVideo();
        state.musicOn = true;
        syncMusicBtn();
    } catch (e) { /* blocked by browser */ }
}

function onYouTubeIframeAPIReady() {
    player = new YT.Player('youtube-player', {
        height: '0', width: '0',
        videoId: 'qaVjA4a9O7w',
        playerVars: { autoplay: 0, loop: 1, playlist: 'qaVjA4a9O7w' },
        events: { onReady: function () { player.setVolume(40); } }
    });
}

$('music-toggle').addEventListener('click', function () {
    if (!player) return;
    if (state.musicOn) {
        player.pauseVideo();
        state.musicOn = false;
    } else {
        player.playVideo();
        state.musicOn = true;
    }
    syncMusicBtn();
});

// ── Screen Management ──
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

// ── HUD Updates ──
function updateHUD() {
    $('stage-display').textContent = `${state.stage + 1}/${state.totalStages}`;
    $('score-display').textContent = state.score;
    $('lives-display').textContent = '❤️'.repeat(state.lives) + '🖤'.repeat(Math.max(0, 3 - state.lives));
}

function updateProgress() {
    $('progress-fill').style.width = (state.stage / (state.totalStages - 1)) * 100 + '%';
}

function updateLocation() {
    $('location-name').textContent = locations[state.stage].name;
}

// ── Milestones ──
function buildMilestones() {
    const road = $('map-road');
    road.innerHTML = '';
    locations.forEach((loc, i) => {
        const dot = document.createElement('div');
        dot.className = 'milestone' + (i === 0 ? ' current' : '');
        dot.id = 'milestone-' + i;
        const label = document.createElement('span');
        label.className = 'milestone-label';
        label.textContent = loc.name;
        dot.appendChild(label);
        road.appendChild(dot);
    });
}

function updateMilestones() {
    locations.forEach((_, i) => {
        const el = $('milestone-' + i);
        el.classList.remove('current', 'reached');
        if (i < state.stage) el.classList.add('reached');
        else if (i === state.stage) el.classList.add('current');
    });
}

// ── Tank ──
function moveTank() {
    const tank = $('tank');
    const wrapper = $('tank-wrapper');
    const mapWidth = document.querySelector('.journey-map').offsetWidth;
    const pct = state.stage / (state.totalStages - 1);
    wrapper.style.left = (30 + pct * (mapWidth - 110)) + 'px';
    tank.classList.add('moving');
    setTimeout(() => tank.classList.remove('moving'), 1200);
}

// ── Fact Box ──
function showFact(idx) {
    const box = $('fact-box');
    box.classList.remove('visible');
    setTimeout(() => {
        $('fact-text').textContent = locations[idx].fact;
        box.classList.add('visible');
    }, 300);
}

// ── Game Flow ──
function startGame() {
    state.stage = 0;
    state.score = 0;
    state.lives = 3;
    showScreen('game-screen');
    buildMilestones();
    updateHUD();
    updateProgress();
    updateLocation();
    showFact(0);
    moveTank();
}

function handleAdvance() {
    if (state.moving) return;
    if (state.stage >= state.totalStages - 1) { triggerVictory(); return; }
    openQuiz(state.stage);
}

// ── Quiz ──
function openQuiz(idx) {
    const quiz = quizzes[idx];
    $('quiz-stage').textContent = `Chặng ${idx + 1}`;
    $('quiz-location').textContent = locations[idx + 1].name;
    $('quiz-question').textContent = quiz.question;
    $('quiz-feedback').textContent = '';
    $('quiz-feedback').style.color = '';

    const container = $('quiz-options');
    container.innerHTML = '';
    quiz.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'quiz-option';
        btn.textContent = opt;
        btn.onclick = () => selectAnswer(i, idx);
        container.appendChild(btn);
    });

    state.timeLeft = 20;
    const fill = $('quiz-timer-fill');
    fill.style.width = '100%';
    fill.style.background = '#ffd600';
    clearInterval(state.timer);
    state.timer = setInterval(() => {
        state.timeLeft -= 0.1;
        const pct = (state.timeLeft / 20) * 100;
        fill.style.width = pct + '%';
        fill.style.background = pct < 30 ? '#ef5350' : '#ffd600';
        if (state.timeLeft <= 0) {
            clearInterval(state.timer);
            onWrongAnswer(idx);
        }
    }, 100);

    $('quiz-modal').classList.add('active');
}

function selectAnswer(selected, idx) {
    clearInterval(state.timer);
    const quiz = quizzes[idx];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = $('quiz-feedback');

    options.forEach((el, i) => {
        el.classList.add('disabled');
        if (i === quiz.answer) el.classList.add('correct');
        if (i === selected && i !== quiz.answer) el.classList.add('wrong');
    });

    if (selected === quiz.answer) {
        feedback.textContent = 'Chính xác! Tiến lên!';
        feedback.style.color = '#a5d6a7';
        state.score += 100 + Math.round(state.timeLeft * 5);
        setTimeout(() => { closeQuiz(); advanceStage(); }, 1500);
    } else {
        onWrongAnswer(idx);
    }
}

function onWrongAnswer(idx) {
    const feedback = $('quiz-feedback');
    const options = document.querySelectorAll('.quiz-option');
    options.forEach((el, i) => {
        el.classList.add('disabled');
        if (i === quizzes[idx].answer) el.classList.add('correct');
    });

    state.lives--;
    updateHUD();

    if (state.lives <= 0) {
        feedback.textContent = 'Hết mạng! Game Over...';
        feedback.style.color = '#ef9a9a';
        setTimeout(() => { closeQuiz(); gameOver(); }, 2000);
    } else {
        feedback.textContent = `Sai rồi! Còn ${state.lives} mạng. Hãy thử lại!`;
        feedback.style.color = '#ef9a9a';
        setTimeout(closeQuiz, 2000);
    }
}

function closeQuiz() {
    $('quiz-modal').classList.remove('active');
}

function advanceStage() {
    state.moving = true;
    state.stage++;
    updateHUD();
    updateProgress();
    updateMilestones();
    updateLocation();
    moveTank();
    showFact(state.stage);

    setTimeout(() => {
        state.moving = false;
        if (state.stage >= state.totalStages - 1) setTimeout(triggerVictory, 800);
    }, 1300);
}

function gameOver() {
    state.stage = 0;
    state.score = 0;
    state.lives = 3;
    showScreen('intro-screen');
    alert('Hành trình chưa hoàn thành! Hãy thử lại nhé!');
}

// ── Victory & Fireworks ──
function triggerVictory() {
    $('final-score').textContent = state.score;
    showScreen('victory-screen');
    drawWheel();
    startFireworks();
}

const fwCanvas = $('fireworks-canvas');
const fwCtx = fwCanvas.getContext('2d');
let fwList = [];
let fwParticles = [];
let fwActive = false;

function resizeFw() {
    fwCanvas.width = fwCanvas.parentElement.offsetWidth || window.innerWidth;
    fwCanvas.height = fwCanvas.parentElement.offsetHeight || window.innerHeight;
}

class Firework {
    constructor() {
        this.x = Math.random() * fwCanvas.width;
        this.y = fwCanvas.height;
        this.targetY = Math.random() * fwCanvas.height * 0.4 + 50;
        this.speed = 3 + Math.random() * 3;
        this.color = `hsl(${Math.random() * 60 + 10}, 100%, 60%)`;
        this.alive = true;
    }
    update() {
        this.y -= this.speed;
        if (this.y <= this.targetY) { this.alive = false; this.explode(); }
    }
    explode() {
        const count = 30 + Math.floor(Math.random() * 20);
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            const speed = 1 + Math.random() * 3;
            fwParticles.push({
                x: this.x, y: this.y,
                vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
                life: 1, decay: 0.015 + Math.random() * 0.01,
                color: this.color, size: 2 + Math.random()
            });
        }
    }
    draw() {
        fwCtx.beginPath();
        fwCtx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        fwCtx.fillStyle = this.color;
        fwCtx.fill();
    }
}

function startFireworks() {
    resizeFw();
    fwActive = true;
    fwList = [];
    fwParticles = [];
    renderFireworks();
}

function renderFireworks() {
    if (!fwActive) return;
    fwCtx.fillStyle = 'rgba(0,0,0,0.15)';
    fwCtx.fillRect(0, 0, fwCanvas.width, fwCanvas.height);
    if (Math.random() < 0.06) fwList.push(new Firework());
    fwList = fwList.filter(f => { f.update(); if (f.alive) f.draw(); return f.alive; });
    fwParticles = fwParticles.filter(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.03; p.life -= p.decay;
        if (p.life <= 0) return false;
        fwCtx.beginPath();
        fwCtx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        fwCtx.fillStyle = p.color;
        fwCtx.globalAlpha = p.life;
        fwCtx.fill();
        fwCtx.globalAlpha = 1;
        return true;
    });
    requestAnimationFrame(renderFireworks);
}

// ── Spin Wheel ──
let wheelAngle = 0;
let spinning = false;

function drawWheel() {
    const canvas = $('wheel-canvas');
    const ctx = canvas.getContext('2d');
    const r = canvas.width / 2 - 10;
    const colors = ['#d32f2f', '#ffd600', '#2e7d32', '#1565c0', '#9c27b0', '#e65100'];
    const seg = (Math.PI * 2) / prizes.length;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(wheelAngle);

    prizes.forEach((prize, i) => {
        const start = seg * i;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r, start, start + seg);
        ctx.closePath();
        ctx.fillStyle = colors[i];
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text wrapping
        ctx.save();
        ctx.rotate(start + seg / 2);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        const words = prize.split(' ');
        let line = '', lines = [];
        words.forEach(w => {
            if ((line + ' ' + w).length > 12) { lines.push(line); line = w; }
            else { line = line ? line + ' ' + w : w; }
        });
        if (line) lines.push(line);
        lines.forEach((l, li) => ctx.fillText(l, r * 0.58, (li - lines.length / 2 + 0.5) * 14));
        ctx.restore();
    });

    // Center dot
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fillStyle = '#1a0a0a';
    ctx.fill();
    ctx.strokeStyle = '#ffd600';
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = '#ffd600';
    ctx.font = 'bold 14px Inter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', 0, 0);
    ctx.restore();
}

function spinWheel() {
    if (spinning) return;
    spinning = true;
    $('prize-result').textContent = '';
    $('spin-btn').style.opacity = '0.5';

    const amount = Math.PI * 2 * (8 + Math.random() * 5);
    const startAngle = wheelAngle;
    const startTime = performance.now();
    const duration = 5000;

    function animate(now) {
        const t = Math.min((now - startTime) / duration, 1);
        wheelAngle = startAngle + amount * (1 - Math.pow(1 - t, 4));
        drawWheel();
        if (t < 1) {
            requestAnimationFrame(animate);
        } else {
            wheelAngle = startAngle + amount;
            drawWheel();
            const seg = (Math.PI * 2) / prizes.length;
            const adjusted = (Math.PI * 2 - (wheelAngle % (Math.PI * 2)) + Math.PI * 1.5) % (Math.PI * 2);
            const idx = Math.floor(adjusted / seg) % prizes.length;
            $('prize-result').textContent = prizes[idx];
            $('spin-btn').style.opacity = '1';
            $('replay-btn').style.display = 'inline-block';
            spinning = false;
        }
    }
    requestAnimationFrame(animate);
}

// ── Replay ──
function replayGame() {
    fwActive = false;
    $('prize-result').textContent = '';
    $('replay-btn').style.display = 'none';
    showScreen('intro-screen');
}

// ── Resize ──
window.addEventListener('resize', () => {
    resizeParticles();
    if ($('victory-screen').classList.contains('active')) resizeFw();
    if ($('game-screen').classList.contains('active')) moveTank();
});

// ── Prize Editor ──
function togglePrizeEditor() {
    const editor = $('prize-editor');
    const visible = editor.style.display !== 'none';
    editor.style.display = visible ? 'none' : 'block';
    if (!visible) renderEditorList();
}

function renderEditorList() {
    const list = $('editor-list');
    list.innerHTML = '';
    prizes.forEach((prize, i) => {
        const row = document.createElement('div');
        row.className = 'editor-row';
        row.innerHTML = `<input type="text" value="${prize.replace(/"/g, '&quot;')}" data-index="${i}">` +
            `<button type="button" class="btn-remove" onclick="removePrizeRow(${i})">✕</button>`;
        list.appendChild(row);
    });
}

function addPrizeRow() {
    prizes.push('Phần thưởng mới');
    renderEditorList();
}

function removePrizeRow(index) {
    if (prizes.length <= 2) return;
    prizes.splice(index, 1);
    renderEditorList();
}

function savePrizes() {
    const inputs = $('editor-list').querySelectorAll('input');
    prizes.length = 0;
    inputs.forEach(input => {
        const val = input.value.trim();
        if (val) prizes.push(val);
    });
    if (prizes.length === 0) prizes.push(...defaultPrizes);
    localStorage.setItem('wheelPrizes', JSON.stringify(prizes));
    drawWheel();
    $('prize-editor').style.display = 'none';
}

function resetPrizes() {
    prizes.length = 0;
    prizes.push(...defaultPrizes);
    localStorage.removeItem('wheelPrizes');
    renderEditorList();
    drawWheel();
}
