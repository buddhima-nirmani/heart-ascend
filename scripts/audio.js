// --- Define all sounds ---
const bgm = new Audio('assets/audio/main_bgm.mp3');
bgm.loop = true;       // keeps repeating
bgm.volume = 0.15;      // Lowered slightly to let sound effects stand out

const subBgm = new Audio('assets/audio/sub_bgm.mp3');
subBgm.loop = true;
subBgm.volume = 0.3;  // Set to a lower volume as requested

// --- Persistence Logic ---
const BGM_TIME_KEY = 'heart_ascend_bgm_time';
const SUB_BGM_TIME_KEY = 'heart_ascend_sub_bgm_time';
const BGM_MUTE_KEY = 'heart_ascend_bgm_muted';

let isMuted = localStorage.getItem(BGM_MUTE_KEY) === 'true';
let activeBGMType = null; // Tracks which BGM should be playing ('main' or 'sub')

// Check if there is a saved time in localStorage and resume from there
const savedTime = localStorage.getItem(BGM_TIME_KEY);
if (savedTime) {
    bgm.currentTime = parseFloat(savedTime);
}

const savedSubTime = localStorage.getItem(SUB_BGM_TIME_KEY);
if (savedSubTime) {
    subBgm.currentTime = parseFloat(savedSubTime);
}

const btnClickSound = new Audio('assets/audio/btn_click.mp3');
btnClickSound.volume = 1.0; 

const btnHoverSound = new Audio('assets/audio/btn_hover.mp3');
btnHoverSound.volume = 1.0; 

const successSound = new Audio('assets/audio/success_tone2.mp3');
successSound.volume = 1.0; 

const unsuccessSound = new Audio('assets/audio/unsuccess_tone.mp3');
unsuccessSound.volume = 1.0; 

const resultSound = new Audio('assets/audio/result_tone.mp3');
resultSound.volume = 1.0; 

const clockSound = new Audio('assets/audio/clock_timer.mp3');
clockSound.loop = true;   // ticking loops while timer is low
clockSound.volume = 0.5; 

// Update localStorage with the current time as the music plays
bgm.addEventListener('timeupdate', () => {
    localStorage.setItem(BGM_TIME_KEY, bgm.currentTime);
});

subBgm.addEventListener('timeupdate', () => {
    localStorage.setItem(SUB_BGM_TIME_KEY, subBgm.currentTime);
});

// --- UI Logic for Mute Button ---
function updateMuteUI() {
    const btn = document.getElementById('mute-btn');
    if (btn) {
        const icon = btn.querySelector('img');
        if (icon) {
            icon.src = isMuted ? 'assets/images/mute.png' : 'assets/images/unmute.png';
            icon.alt = isMuted ? 'Music Muted' : 'Music Playing';
        }
    }
}

function createMuteButton() {
    if (document.getElementById('mute-btn')) return;
    const btn = document.createElement('div');
    btn.id = 'mute-btn';
    btn.className = 'mute-control';

    const icon = document.createElement('img');
    icon.className = 'mute-icon';
    btn.appendChild(icon);

    btn.onclick = () => {
        isMuted = !isMuted;
        localStorage.setItem(BGM_MUTE_KEY, isMuted);
        updateMuteUI();
        if (isMuted) {
            bgm.pause();
            subBgm.pause();
        } else {
            if (activeBGMType === 'main') bgm.play().catch(() => {});
            else if (activeBGMType === 'sub') subBgm.play().catch(() => {});
        }
        playClick();
    };
    document.body.appendChild(btn);
    updateMuteUI();
}

// --- Helper Functions (ready to import and use anywhere) ---

// Play background music (browsers need a user click first, so we wait for one)
export function startBGM() {
    activeBGMType = 'main';
    subBgm.pause(); // Stop sub BGM if it was playing
    createMuteButton();
    if (isMuted) return;

    const tryPlay = () => {
        bgm.play().catch(() => {});
        document.removeEventListener('click', tryPlay);
        document.removeEventListener('keydown', tryPlay);
    };
    // Try immediately — works if user already interacted
    bgm.play().catch(() => {
        // If browser blocks it, wait for first user action
        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('keydown', tryPlay, { once: true });
    });
}

// Play the sub background music for gameplay and rules
export function startSubBGM() {
    activeBGMType = 'sub';
    bgm.pause(); // Stop main BGM if it was playing
    createMuteButton();
    if (isMuted) return;

    const tryPlay = () => {
        subBgm.play().catch(() => {});
        document.removeEventListener('click', tryPlay);
        document.removeEventListener('keydown', tryPlay);
    };
    // Try immediately
    subBgm.play().catch(() => {
        // If browser blocks it, wait for first user action
        document.addEventListener('click', tryPlay, { once: true });
        document.addEventListener('keydown', tryPlay, { once: true });
    });
}

export function stopBGM() {
    bgm.pause();
    bgm.currentTime = 0;
}

// Play button click — resets so it plays even if clicked rapidly
export function playClick() {
    btnClickSound.currentTime = 0;
    btnClickSound.play().catch(() => {});
}

// Play hover sound
export function playHover() {
    btnHoverSound.currentTime = 0;
    btnHoverSound.play().catch(() => {});
}

export function playSuccess() {
    successSound.currentTime = 0;
    successSound.play().catch(() => {});
}

export function playUnsuccess() {
    unsuccessSound.currentTime = 0;
    unsuccessSound.play().catch(() => {});
}

export function playResult() {
    resultSound.currentTime = 0;
    resultSound.play().catch(() => {});
}

// Clock ticking — call startClock() when timer hits 5s, stopClock() after answer
export function startClock() {
    clockSound.currentTime = 0;
    clockSound.play().catch(() => {});
}

export function stopClock() {
    clockSound.pause();
    clockSound.currentTime = 0;
}