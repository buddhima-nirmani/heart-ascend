import { startSubBGM, playClick } from './audio.js';
import { requireLogin, logout } from "./session.js";

requireLogin();
startSubBGM();

const logoutLink = document.getElementById("logoutLink");

if(logoutLink){
    logoutLink.addEventListener("click", logout);
}


const startGameBtn = document.getElementById("startGameBtn");

if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
        playClick();
        
        // clear previous round results
        localStorage.removeItem("heart_correct_count");
        localStorage.removeItem("heart_wrong_count");

        // start new game
        window.location.href = "gamescreen.html";
    });
}
