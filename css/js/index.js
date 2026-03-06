// =============================================
//  UTILS
// =============================================
function $(id) { return document.getElementById(id); }

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => {
        s.classList.remove('active', 'fade-out');
    });
    const el = $(id);
    el.classList.add('active');
}

function transitionTo(fromId, toId, delay = 0) {
    setTimeout(() => {
        $(fromId).classList.add('fade-out');
        setTimeout(() => showScreen(toId), 600);
    }, delay);
}

// =============================================
//  FLOATING HEARTS
// =============================================
const HEART_CHARS = ['💕', '💗', '💓', '🌸', '✨', '💖', '💝', '🌷'];

function spawnHearts(containerId, count = 14) {
    const bg = $(containerId);
    if (!bg) return;
    bg.innerHTML = '';
    for (let i = 0; i < count; i++) {
        const h = document.createElement('span');
        h.className = 'heart-float';
        h.textContent = HEART_CHARS[Math.floor(Math.random() * HEART_CHARS.length)];
        h.style.left = Math.random() * 100 + '%';
        h.style.fontSize = (0.9 + Math.random() * 1.2) + 'rem';
        h.style.animationDuration = (6 + Math.random() * 8) + 's';
        h.style.animationDelay = (Math.random() * 6) + 's';
        bg.appendChild(h);
    }
}

['heartsBg', 'heartsBg2', 'heartsBg3', 'heartsBg4', 'heartsBg5'].forEach(id => spawnHearts(id));

// =============================================
//  AUDIO
// =============================================
const audio = $('bgMusic');
let audioStarted = false;

function startAudio() {
    if (audioStarted) return;
    audioStarted = true;
    audio.volume = 0.5;
    audio.play().catch(() => { });
}

// =============================================
//  SCREEN 1 — INTRO
// =============================================
$('btnHi').addEventListener('click', () => {
    startAudio();
    transitionTo('screen-intro', 'screen-passcode', 100);
});

// =============================================
//  SCREEN 2 — PASSCODE
// =============================================
const PASSWORD = '0307';
let input = '';
let attempts = 0;
const MAX_ATTEMPTS = 2;
let locked = false;

const dots = document.querySelectorAll('.dot');
const numpad = $('numpad');
const msg = $('passcode-msg');
const countdownWrap = $('countdown-wrap');
const countdownNum = $('countdownNum');

function updateDots() {
    dots.forEach((d, i) => {
        d.classList.toggle('filled', i < input.length);
        d.classList.remove('wrong', 'correct');
    });
}

function flashDots(type) {
    dots.forEach(d => { d.classList.add(type); });
    setTimeout(() => dots.forEach(d => d.classList.remove(type)), 600);
}

document.querySelectorAll('.num-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (locked) return;
        const v = btn.dataset.num;
        if (v === 'clear') {
            input = input.slice(0, -1);
            updateDots();
        } else if (v === 'enter') {
            checkPassword();
        } else {
            if (input.length < 4) {
                input += v;
                updateDots();
                if (input.length === 4) {
                    setTimeout(checkPassword, 200);
                }
            }
        }
    });
});

function checkPassword() {
    if (input === PASSWORD) {
        flashDots('correct');
        msg.textContent = '💕 Yay! Correct!';
        locked = true;
        transitionTo('screen-passcode', 'screen-gift', 900);
    } else {
        attempts++;
        flashDots('wrong');
        const passcodeGif = $('passcodeGif');
        passcodeGif.classList.add('shake');
        setTimeout(() => passcodeGif.classList.remove('shake'), 500);
        input = '';
        updateDots();

        if (attempts < MAX_ATTEMPTS) {
            msg.textContent = "You don't remember ? 😭";
            // Swap to sad gif
            passcodeGif.src = 'css/gifs/cry.gif';
        } else {
            // Max attempts — lockout
            locked = true;
            msg.textContent = '';
            document.querySelector('.passcode-title').style.display = 'none';
            document.querySelector('.passcode-hint').style.display = 'none';
            document.querySelector('.passcode-dots').style.display = 'none';
            document.querySelector('#passcode-gif-wrap').style.display = 'none';
            numpad.style.display = 'none';
            countdownWrap.classList.remove('hidden');
            startCountdown();
        }
    }
}

function startCountdown() {
    let count = 10;
    countdownNum.textContent = count;
    const interval = setInterval(() => {
        count--;
        countdownNum.textContent = count;
        if (count <= 0) {
            clearInterval(interval);
            // Reset after lockout
            attempts = 0;
            locked = false;
            input = '';
            updateDots();
            countdownWrap.classList.add('hidden');
            document.querySelector('.passcode-title').style.display = '';
            document.querySelector('.passcode-hint').style.display = '';
            document.querySelector('.passcode-dots').style.display = 'flex';
            document.querySelector('#passcode-gif-wrap').style.display = '';
            numpad.style.display = 'grid';
            msg.textContent = 'Okay... Try again 🫣';
            // Restore cute gif
            $('passcodeGif').src = 'css/gifs/try.gif';
        }
    }, 1000);
}

// =============================================
//  SCREEN 3 — GIFTBOX
// =============================================
const giftboxWrap = $('giftboxWrap');
const giftbox = $('giftbox');
const boxLid = $('boxLid');
const tapCounter = $('tapCounter');
const tapHint = $('tapHint');

let taps = 0;
const MAX_TAPS = 30;
const PARTICLES = ['💕', '🌸', '✨', '🎉', '💖', '🎀', '🌷', '⭐'];

giftboxWrap.addEventListener('click', handleTap);
giftboxWrap.addEventListener('touchend', (e) => { e.preventDefault(); handleTap(); });

function handleTap() {
    if (taps >= MAX_TAPS) return;
    taps++;
    tapCounter.textContent = taps + ' / ' + MAX_TAPS;

    // Lid opens more each tap
    if (taps === 1) {
        boxLid.classList.add('opening');
        setTimeout(() => boxLid.classList.add('open'), 300);
    }

    // Spawn particles
    spawnParticles();

    // Haptic hint update
    if (taps === 10) tapHint.textContent = 'Keep going! 💕';
    if (taps === 20) tapHint.textContent = 'Almost there! 🎀';
    if (taps === 25) tapHint.textContent = 'Just a few more! ✨';

    if (taps >= MAX_TAPS) {
        tapHint.textContent = '🎉 Surprise!';
        tapCounter.textContent = '30 / 30';
        setTimeout(() => {
            giftboxWrap.classList.add('vanish');
            setTimeout(() => transitionTo('screen-gift', 'screen-letter', 100), 700);
        }, 400);
    }
}

function spawnParticles() {
    const rect = giftbox.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    for (let i = 0; i < 5; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = PARTICLES[Math.floor(Math.random() * PARTICLES.length)];
        const angle = Math.random() * Math.PI * 2;
        const dist = 60 + Math.random() * 80;
        p.style.setProperty('--tx', Math.cos(angle) * dist + 'px');
        p.style.setProperty('--ty', Math.sin(angle) * dist - 40 + 'px');
        p.style.left = (cx - 16) + 'px';
        p.style.top = (cy - 16) + 'px';
        p.style.position = 'fixed';
        p.style.zIndex = '999';
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 850);
    }
}

// =============================================
//  SCREEN 4 — ENVELOPE
// =============================================
const envelope = $('envelope');
let envelopeOpened = false;

envelope.addEventListener('click', openEnvelope);
envelope.addEventListener('touchend', (e) => { e.preventDefault(); openEnvelope(); });

function openEnvelope() {
    if (envelopeOpened) return;
    envelopeOpened = true;
    envelope.classList.add('open');
    setTimeout(() => transitionTo('screen-letter', 'screen-message', 600), 500);
}