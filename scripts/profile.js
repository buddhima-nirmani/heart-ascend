import { startBGM, stopBGM, playClick, playHover, playUnsuccess, playSuccess } from './audio.js';
import { auth, db, updateNickname } from "./firebase.js";
import { doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { requireLogin, logout } from "./session.js";

// protect page
requireLogin();
stopBGM(); // Resets the BGM to the beginning
startBGM();

// Add hover sounds to all buttons and links
document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', playHover);
});

const playerName = document.querySelector(".player-name");
const gamesPlayedEl = document.getElementById("display-games-played");
const streakEl = document.getElementById("display-current-streak");
const rankEl = document.querySelector(".rank-pill-bright");
const leaderboardRankEl = document.getElementById("leaderboard-rank-display");
const editNicknameBtn = document.getElementById("editNicknameBtn");
const profileSkeleton = document.getElementById("profile-loading-skeleton");
const profileContent = document.getElementById("profile-content");

// wait until firebase knows the logged in user
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadProfile(user.uid);
    }
});

async function loadProfile(uid) {
    try {
        // Show skeleton, hide content
        profileSkeleton.style.display = "grid";
        profileContent.style.display = "none";

        // Run both queries in parallel for better performance
        const [playerSnap, allPlayersData] = await Promise.all([
            getDoc(doc(db, "players", uid)),
            fetchAllPlayersData()
        ]);

        if (playerSnap.exists()) {
            const data = playerSnap.data();

            // Update UI with player data
            playerName.innerText = data.nickname;
            gamesPlayedEl.innerText = String(data.gamesPlayed).padStart(2, "0");
            streakEl.innerText = String(data.currentStreak).padStart(2, "0");
            rankEl.innerText = data.rank;

            // Calculate leaderboard rank from pre-fetched data
            const playerRank = calculatePlayerRank(uid, allPlayersData);
            if (playerRank > 0) {
                leaderboardRankEl.innerText = `#${playerRank} in Leaderboard`;
            } else {
                leaderboardRankEl.innerText = "Not Ranked";
            }
        }

        // Hide skeleton, show content
        profileSkeleton.style.display = "none";
        profileContent.style.display = "grid";

    } catch (error) {
        console.error("Error loading profile:", error);
        profileSkeleton.style.display = "none";
        profileContent.style.display = "grid";
    }
}

async function fetchAllPlayersData() {
    try {
        const playersRef = collection(db, "players");
        const q = query(playersRef, orderBy("currentStreak", "desc"));
        const snapshot = await getDocs(q);

        let players = [];
        snapshot.forEach((doc) => {
            players.push({ uid: doc.id, ...doc.data() });
        });

        // Sort: primary = currentStreak (desc), tiebreaker = gamesPlayed (desc)
        players.sort((a, b) => {
            if (b.currentStreak !== a.currentStreak) {
                return b.currentStreak - a.currentStreak;
            }
            return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
        });

        return players;
    } catch (error) {
        console.error("Error fetching all players:", error);
        return [];
    }
}

function calculatePlayerRank(uid, playersList) {
    const playerRank = playersList.findIndex(p => p.uid === uid) + 1;
    return playerRank;
}

// Handle Nickname Edit
const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const charCount = document.getElementById("charCount");
const modalConfirmBtn = document.getElementById("modalConfirmBtn");
const modalCancelBtn = document.getElementById("modalCancelBtn");
const modalCloseBtn = document.getElementById("modalCloseBtn");

function openNicknameModal() {
    const currentName = playerName.innerText;
    nicknameInput.value = currentName;
    charCount.textContent = currentName.length;
    nicknameModal.classList.add("active");
    nicknameInput.focus();
}

function closeNicknameModal() {
    nicknameModal.classList.remove("active");
}

function showToast(message, type = 'success') {
    const toast = document.createElement("div");
    toast.textContent = message;
    const bgColor = type === 'success' ? '#4CAF50' : '#ff4e50';
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${bgColor};
        color: white;
        padding: 16px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        font-size: 14px;
        z-index: 10000;
        animation: slideIn 0.3s ease-in-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// Add animation styles if not present
if (!document.querySelector("style[data-toast]")) {
    const style = document.createElement("style");
    style.setAttribute("data-toast", "true");
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

function updateCharCount() {
    charCount.textContent = nicknameInput.value.length;
}

if (editNicknameBtn) {
    editNicknameBtn.addEventListener("click", openNicknameModal);
}

if (modalCancelBtn) {
    modalCancelBtn.addEventListener("click", () => { playClick(); closeNicknameModal(); });
}

if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", () => { playClick(); closeNicknameModal(); });
}

if (nicknameInput) {
    nicknameInput.addEventListener("input", updateCharCount);
    nicknameInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            modalConfirmBtn.click();
        }
    });
}

// Close modal when clicking outside
if (nicknameModal) {
    nicknameModal.addEventListener("click", (e) => {
        if (e.target === nicknameModal) {
            closeNicknameModal();
        }
    });
}

if (modalConfirmBtn) {
    modalConfirmBtn.addEventListener("click", async () => {
        playClick();
        const newNickname = nicknameInput.value.trim();
        const currentName = playerName.innerText;

        if (!newNickname) {
            playUnsuccess();
            showToast("Nickname cannot be empty!", 'error');
            return;
        }

        if (newNickname === currentName) {
            closeNicknameModal();
            return;
        }

        try {
            const user = auth.currentUser;
            if (user) {
                await updateNickname(user.uid, newNickname);
                playerName.innerText = newNickname;
                closeNicknameModal();
                playSuccess();
                showToast("Nickname updated successfully!", 'success');
            }
        } catch (error) {
            console.error("Error updating nickname:", error);
            playUnsuccess();
            showToast("Failed to update nickname. Please try again.", 'error');
        }
    });
}

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