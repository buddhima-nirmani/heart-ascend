import { startBGM, playClick, playUnsuccess, playSuccess, playHover } from './audio.js';
import { signup } from "./firebase.js";

const form = document.getElementById("signupForm");

// Start BGM on this page
startBGM();

// Add hover sounds to all buttons and links
document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', playHover);
});

// Handle form submission
form.addEventListener("submit", async function(event){
    event.preventDefault();

    const nickname = document.getElementById("nickname").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    // Validation checks
    if(!nickname){
        playUnsuccess();
        setTimeout(() => alert("Please enter a nickname"), 100);
        return;
    }

    if(!email){
        playUnsuccess();
        setTimeout(() => alert("Please enter an email"), 100);
        return;
    }

    if(!password){
        playUnsuccess();
        setTimeout(() => alert("Please enter a password"), 100);
        return;
    }

    if(password.length < 6){
        playUnsuccess();
        setTimeout(() => alert("Password must be at least 6 characters long"), 100);
        return;
    }

    if(password !== confirmPassword){
        playUnsuccess();
        setTimeout(() => alert("Passwords do not match"), 100);
        return;
    }

    playClick();

    try{
        await signup(nickname, email, password);
        await playSuccess();
        setTimeout(() => {
            alert("Account created successfully!");
            window.location.href = "howtoplay.html";
        }, 100);
    }
    catch(error){
        playUnsuccess();
        if(error.code === "auth/email-already-in-use"){
            alert("Email already in use. Please use a different email.");
        }
        else if(error.code === "auth/invalid-email"){
            alert("Invalid email format. Please enter a valid email.");
        }
        else if(error.code === "auth/weak-password"){
            alert("Password is too weak. Please use a stronger password.");
        }
        else{
            alert(error.message || "Signup failed. Please try again.");
        }
    }
});