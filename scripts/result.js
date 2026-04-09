import { playResult, playClick, playHover, startBGM } from './audio.js';
import { logout, requireLogin } from "./session.js";

requireLogin();

// Add hover sounds to all buttons and links
document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', playHover);
});


// Exit button - Logout functionality
const exitBtn = document.getElementById("exitBtn");
if (exitBtn) {
    exitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        playClick();

        await logout();   // sign out user
        window.location.href = "index.html";  // redirect to home page
    });
}

document.addEventListener('DOMContentLoaded', () => {
    playResult(); 

    const correctCount = parseInt(localStorage.getItem("heart_correct_count")) || 0;
    const wrongCount = parseInt(localStorage.getItem("heart_wrong_count")) || 0;
    const total = 5;

    document.getElementById("correct-count").innerText = correctCount.toString().padStart(2, "0");
    document.getElementById("wrong-count").innerText = wrongCount.toString().padStart(2, "0");


    // Rank System


    const rankEl = document.getElementById("rank-name");
    const quoteEl = document.getElementById("rank-quote");

    if (correctCount <= 1) {
        rankEl.innerText = "HEART NOVICE";
        quoteEl.innerText = "Your journey begins; the pulse is steady.";
    }
    else if (correctCount === 2) {
        rankEl.innerText = "PULSE EXPLORER";
        quoteEl.innerText = "Great job! Your vision is getting sharper.";
    }
    else if (correctCount === 3) {
        rankEl.innerText = "RHYTHM ADEPT";
        quoteEl.innerText = "You're in sync now. Every move counts.";
    }
    else if (correctCount === 4) {
        rankEl.innerText = "HEART STRATEGIST";
        quoteEl.innerText = "Impressive work. You're reading the beat perfectly.";
    }
    else if (correctCount === 5) {
        rankEl.innerText = "CARDIO MASTER";
        quoteEl.innerText = "Peak performance! You've mastered the rhythm.";
    }

});

const playAgainBtn = document.getElementById("playAgainBtn");

if (playAgainBtn) {
    playAgainBtn.addEventListener("click", () => {
        playClick();

        // clear previous round results
        localStorage.removeItem("heart_correct_count");
        localStorage.removeItem("heart_wrong_count");

        // start new game
        window.location.href = "gamescreen.html";
    });
}