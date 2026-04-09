💖 Heart Ascend

Count the hearts, beat the clock, and climb the leaderboard in this cosmic challenge.

Heart Ascend is a browser-based reflex game where players must count hearts in a challenge image within a 10-second timer — across 5 rounds. Players earn a rank based on their performance and compete on a global leaderboard.

🎮 Gameplay

5 challenges per game session
10 seconds to count the hearts in each challenge image
Submit your answer before time runs out — or it auto-skips!
Earn a rank based on how many you get correct:

Correct AnswersRank0–1Heart Novice2Pulse Explorer3Rhythm Adept4Heart Strategist5Cardio Master

Build your win streak by getting all 5 correct and climb the leaderboard 🔥


✨ Features

🔐 User Authentication — Sign up and log in with email & password via Firebase Auth
🏆 Leaderboard — Global leaderboard ranked by longest win streak
👤 Player Profile — View your stats (missions completed, perfect streak, rank) and edit your nickname
🎵 Audio System — Background music, button sound effects, and a ticking clock when time is low
🔇 Mute Button — Toggle music on/off from any screen; music position is saved across pages
⏸️ Pause & Rules Modal — View the rules mid-game without losing your timer progress
📱 Responsive Design — Works on desktop and mobile screens
✨ Animations — Glassmorphism UI, star backgrounds, floating hearts, shimmer effects


🛠️ Tech Stack
TechnologyPurposeHTML5Page structureCSS3Styling, animations, glassmorphism effectsVanilla JavaScript (ES Modules)Game logic, UI interactionsFirebase AuthenticationUser sign-up and loginFirebase FirestoreStoring player stats and leaderboard dataHeart APIFetching randomised heart counting challengesGoogle Fonts (Fredoka)Typography

📁 Project Structure
heart-ascend/
│
├── index.html          # Welcome / landing screen
├── login.html          # Login page
├── signup.html         # Sign-up page
├── howtoplay.html      # Rules / how to play screen
├── gamescreen.html     # Main game screen
├── result.html         # End-of-game results screen
├── leaderboard.html    # Global leaderboard
├── profile.html        # Player profile page
│
├── css/
│   ├── index.css
│   ├── login.css
│   ├── signup.css
│   ├── rules.css
│   ├── game.css
│   ├── result.css
│   ├── leaderboard.css
│   ├── profile.css
│   ├── fonts.css
│   └── audio-controls.css
│
├── scripts/
│   ├── firebase.js     # Firebase config and auth/Firestore functions
│   ├── session.js      # Session management (login guard, logout, timeout)
│   ├── audio.js        # All audio logic (BGM, sound effects, mute)
│   ├── game.js         # Core game logic (API fetch, timer, scoring)
│   ├── result.js       # Result screen logic (rank display, play again)
│   ├── leaderboard.js  # Leaderboard data fetching and rendering
│   ├── profile.js      # Profile data fetching and nickname editing
│   ├── howtoplay.js    # Rules page logic
│   ├── login.js        # Login form handling
│   └── signup.js       # Sign-up form handling
│
└── assets/
    ├── images/         # Game images, icons, medals, UI assets
    └── audio/          # Background music and sound effects
