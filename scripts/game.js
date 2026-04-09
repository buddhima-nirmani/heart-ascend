import { startSubBGM, playSuccess, playUnsuccess, playClick, playHover, startClock, stopClock } from './audio.js';
import { auth, db } from "./firebase.js";
import { doc, getDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { requireLogin } from "./session.js";

requireLogin();
startSubBGM();


let currentChallenge = 1;
const maxChallenges = 5;
let timeLeft = 10;
let countdown;
let currentSolution = null;
let correctAnswers = 0;
let wrongAnswers = 0;
let isLoading = false;
let isGamePaused = false;
let hasSubmittedAnswer = false;

const timerElement = document.getElementById('timer-display');
const gameImage = document.getElementById('game-image');
const answerInput = document.getElementById('user-answer');
const submitBtn = document.getElementById('submit-btn');
const progressBar = document.getElementById('progress-bar');
const rulesBtn = document.getElementById('rulesBtn');
const rulesModal = document.getElementById('rulesModal');
const rulesCloseBtn = document.getElementById('rulesCloseBtn');
const rulesResumeBtn = document.getElementById('rulesResumeBtn');

// Add hover sounds to buttons
[submitBtn, rulesBtn, rulesCloseBtn, rulesResumeBtn].forEach(btn => {
    if(btn) btn.addEventListener('mouseenter', playHover);
});

// --- 1. Fetch Challenge from API ---
async function fetchChallenge() {
    // Check if game is over
    if (currentChallenge > maxChallenges) {
        endGame();
        return;
    }

    isLoading = true;
    submitBtn.disabled = true;

    // --- UPDATE PROGRESS BAR ---
    const progressPercent = ((currentChallenge - 1) / maxChallenges) * 100;
    progressBar.style.width = progressPercent + "%";

    // Show loader while fetching
    gameImage.src = "assets/images/load.png";
    answerInput.value = "";

    try {
        const response = await fetch('https://marcconrad.com/uob/heart/api.php');
        const data = await response.json();
        
        // Set answer immediately (don't wait for image)
        currentSolution = parseInt(data.solution);

        // ---Background Loading Logic ---
        const tempImg = new Image();
        tempImg.src = data.question;
        
        // Only swap the image once it's fully downloaded
        tempImg.onload = () => {
            gameImage.src = data.question;
            isLoading = false;
            submitBtn.disabled = false;
            resetTimer();
        };
        
        // Timeout: if image takes too long, show it anyway after 2 seconds
        setTimeout(() => {
            if (isLoading) {
                gameImage.src = data.question;
                isLoading = false;
                submitBtn.disabled = false;
                resetTimer();
            }
        }, 2000);

    } catch (error) {
        console.error("Error fetching game data:", error);
        isLoading = false;
        submitBtn.disabled = false;
        // Retry once if it fails
        setTimeout(fetchChallenge, 1500);
    }
}

// --- 2. Timer Logic ---
function startCountdown() {
    clearInterval(countdown);

    countdown = setInterval(() => {
        timeLeft--;
        timerElement.innerText = timeLeft + "s";
        
        // Start ticking sound when 5 seconds left (only if player hasn't submitted)
        if (timeLeft === 5 && !hasSubmittedAnswer) {
            startClock();
        }
        
        if (timeLeft <= 0) {
            clearInterval(countdown);
            stopClock(); // Stop ticking
            handleSubmission(null);
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(countdown);
    stopClock(); // Ensure clock sound is stopped before starting new timer
    hasSubmittedAnswer = false; // Reset flag for new challenge
    timeLeft = 10;
    timerElement.innerText = timeLeft + "s";

    if (!isGamePaused) {
        startCountdown();
    }
}

// --- Rules Modal Functions ---
function openRulesModal() {
    isGamePaused = true;
    clearInterval(countdown); // Stop the interval immediately
    stopClock();             // Stop the ticking sound
    rulesModal.classList.add('active');
}

function closeRulesModal() {
    isGamePaused = false;
    rulesModal.classList.remove('active');

    // Resume timer if time hasn't run out and game is active
    if (timeLeft > 0 && currentChallenge <= maxChallenges) {
        startCountdown();
        if (timeLeft <= 5) startClock();
    }
}

if (rulesBtn) {
    rulesBtn.addEventListener('click', openRulesModal);
}

if (rulesCloseBtn) {
    rulesCloseBtn.addEventListener('click', closeRulesModal);
}

if (rulesResumeBtn) {
    rulesResumeBtn.addEventListener('click', closeRulesModal);
}

// Close modal when clicking outside
if (rulesModal) {
    rulesModal.addEventListener('click', (e) => {
        if (e.target === rulesModal) {
            closeRulesModal();
        }
    });
}

//Submit button event listener

submitBtn.addEventListener('click', () => {
    playClick();
    let val = parseInt(answerInput.value);
    
    if (isNaN(val)) {
        playUnsuccess();
        return setTimeout(() => alert("Enter a number!"), 100);
    }
    if (val < 0 || val > 9) {
        playUnsuccess();
        return setTimeout(() => alert("Enter a number between 0 and 9!"), 100);
    }

    handleSubmission(val);
});

answerInput.addEventListener('keydown', (e) => {
    // Prevent typing '-' or any other invalid keys
    if (e.key === '-' || e.key === 'e' || e.key === '+' || e.key === '.') {
        e.preventDefault();
    }

    if (e.key === 'Enter') {
        e.preventDefault();
        submitBtn.click();
    }
});

// --- 3. Handle Answer Processing ---

function handleSubmission(userGuess) {
    clearInterval(countdown);
    stopClock(); // Stop the timer sound immediately when answer is submitted
    hasSubmittedAnswer = true; // Mark that answer has been submitted

    if (userGuess === currentSolution) {
        correctAnswers++;
    } else {
        wrongAnswers++;
    }

    currentChallenge++;
    answerInput.value = ""; 
    fetchChallenge();
}

// --- 4. End Game ---
async function endGame(){

const user = auth.currentUser;

    if(user){
        await updatePlayerStats(user.uid);
        // await updateGamesPlayed(user.uid);
    }

    localStorage.setItem('heart_correct_count', correctAnswers);
    localStorage.setItem('heart_wrong_count', wrongAnswers);

    window.location.href = "result.html";

}


// INITIAL TRIGGER: This starts the first question immediately
fetchChallenge();

//Store no of games played and the streak in firebase
async function updatePlayerStats(uid){

    const playerRef = doc(db,"players",uid);
    const playerSnap = await getDoc(playerRef);

    if(!playerSnap.exists()) return;
    const data = playerSnap.data();

    let gamesPlayed = (data.gamesPlayed || 0) + 1;
    let currentStreak = data.currentStreak || 0;

    if(correctAnswers === 5){
        currentStreak++;
    }else{
        currentStreak = 0;
    }

    const newRank = calculateRank(correctAnswers);

    await updateDoc(playerRef,{
        gamesPlayed: gamesPlayed,
        currentStreak: currentStreak,
        rank: newRank
    });
}

function calculateRank(correctAnswers){

    if (correctAnswers <= 1) return "HEART NOVICE";
    if (correctAnswers === 2) return "PULSE EXPLORER";
    if (correctAnswers === 3) return "RHYTHM ADEPT";
    if (correctAnswers === 4) return "HEART STRATEGIST";
    if (correctAnswers === 5) return "CARDIO MASTER";
}
