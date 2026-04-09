// =============================================
// HEART ASCEND - LEADERBOARD
// =============================================

import { auth, db } from "./firebase.js";
import { collection, getDocs, query, orderBy } from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { onAuthStateChanged } from
    "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { requireLogin, logout } from "./session.js";
import { playClick, playHover, startBGM } from "./audio.js";

// Start background music
startBGM();

// Protect page — redirect to login if not logged in
requireLogin();

// Add sound effects to buttons
const exitBtn = document.getElementById("exitBtn");
const backBtn = document.querySelector('a[href="howtoplay.html"]');
const profileBtn = document.querySelector('a[href="profile.html"]');

[exitBtn, backBtn, profileBtn].forEach(btn => {
    if(btn) {
        btn.addEventListener('mouseenter', playHover);
        btn.addEventListener('click', playClick);
    }
});

// Exit button
if (exitBtn) {
    exitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        await logout();
        window.location.href = "index.html";
    });
}

// -----------------------------------------------
// LOAD LEADERBOARD DATA FROM FIRESTORE
// -----------------------------------------------
async function loadLeaderboard(currentUserUid) {
    try {
        // Fetch ALL players from Firestore
        const playersRef = collection(db, "players");
        const q = query(playersRef, orderBy("currentStreak", "desc"));
        const snapshot = await getDocs(q);

        // Build array of player data
        let players = [];
        snapshot.forEach((doc) => {
            players.push({ uid: doc.id, ...doc.data() });
        });

        // Sort: primary = currentStreak (desc), tiebreaker = gamesPlayed (desc)
        // This means if two players have the same streak,
        // the one who played more games ranks higher (more consistent)
        players.sort((a, b) => {
            if (b.currentStreak !== a.currentStreak) {
                return b.currentStreak - a.currentStreak;
            }
            return (b.gamesPlayed || 0) - (a.gamesPlayed || 0);
        });

        renderPodium(players, currentUserUid);
        renderTable(players, currentUserUid);

    } catch (error) {
        console.error("Error loading leaderboard:", error);
        document.getElementById("lb-rows").innerHTML = `
            <div class="lb-empty">
                <p>⚠️ Could not load leaderboard. Please try again later.</p>
            </div>
        `;
    }
}

// -----------------------------------------------
// RENDER TOP 3 PODIUM
// -----------------------------------------------
function renderPodium(players, currentUserUid) {
    // Positions: index 0 = 1st, 1 = 2nd, 2 = 3rd
    const positions = [
        { nameId: "p1-name", streakId: "p1-streak", rankId: "p1-rank" },
        { nameId: "p2-name", streakId: "p2-streak", rankId: "p2-rank" },
        { nameId: "p3-name", streakId: "p3-streak", rankId: "p3-rank" },
    ];

    positions.forEach((pos, i) => {
        const nameEl   = document.getElementById(pos.nameId);
        const streakEl = document.getElementById(pos.streakId);
        const rankEl   = document.getElementById(pos.rankId);

        if (players[i]) {
            const p = players[i];
            nameEl.innerText   = p.nickname || "Unknown";
            streakEl.innerText = `${p.currentStreak || 0} 🔥`;
            rankEl.innerText   = p.rank || "—";

            // Highlight if this is the current logged-in player
            if (p.uid === currentUserUid) {
                nameEl.style.color = "#ffe0ff";
                nameEl.style.textShadow = "0 0 10px rgba(157,80,187,0.8)";
            }
        } else {
            // Not enough players yet
            nameEl.innerText   = "—";
            streakEl.innerText = "— 🔥";
            rankEl.innerText   = "No player yet";
        }
    });
}

// -----------------------------------------------
// RENDER FULL TABLE (all players from 4th onward,
// but also shows all including top 3 for reference)
// -----------------------------------------------
function renderTable(players, currentUserUid) {
    const container = document.getElementById("lb-rows");

    if (players.length === 0) {
        container.innerHTML = `
            <div class="lb-empty">
                <p>No players yet. Be the first to play! 🚀</p>
            </div>
        `;
        return;
    }

    let html = "";

    players.forEach((player, index) => {
        const position   = index + 1;
        const isCurrentPlayer = player.uid === currentUserUid;
        const streak     = player.currentStreak || 0;
        const rankTitle  = player.rank          || "Heart Novice";
        const nickname   = player.nickname      || "Unknown";

        // Position badge styling for top 3
        let posDisplay = `<span class="col-rank-pos">${position}</span>`;
        if (position === 1) posDisplay = `<span class="col-rank-pos pos-gold">🥇</span>`;
        if (position === 2) posDisplay = `<span class="col-rank-pos pos-silver">🥈</span>`;
        if (position === 3) posDisplay = `<span class="col-rank-pos pos-bronze">🥉</span>`;

        // Highlight current player's row
        const rowClass = isCurrentPlayer ? "lb-row is-current-player" : "lb-row";

        // Show "YOU" badge if it's the current player
        const youBadge = isCurrentPlayer
            ? `<span class="you-badge">YOU</span>`
            : "";

        html += `
            <div class="${rowClass}">
                ${posDisplay}
                <div class="col-player">
                    <span class="player-name">${escapeHtml(nickname)}</span>
                    ${youBadge}
                </div>
                <div class="col-streak">${streak} 🔥</div>
                <div class="col-rank">${escapeHtml(rankTitle)}</div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// -----------------------------------------------
// HELPER: prevent XSS from Firestore data
// -----------------------------------------------
function escapeHtml(str) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

// -----------------------------------------------
// WAIT FOR AUTH, THEN LOAD
// -----------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadLeaderboard(user.uid);
    } else {
        // requireLogin() handles redirect, but just in case
        window.location.href = "login.html";
    }
});