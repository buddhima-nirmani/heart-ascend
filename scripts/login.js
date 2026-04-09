import { startBGM, playClick, playUnsuccess, playSuccess, playHover } from './audio.js';
import { login } from "./firebase.js";

const form = document.getElementById("loginForm");
// Start BGM on this page
startBGM();

// Add hover sounds to all buttons and links
document.querySelectorAll('button, a').forEach(el => {
    el.addEventListener('mouseenter', playHover);
});

// Handle form submission
form.addEventListener("submit", async function(event){
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    
    if(!email){
        playUnsuccess();
        setTimeout(() => alert("Please enter your email"), 100);
        return;
    }

    if(!password){
        playUnsuccess();
        setTimeout(() => alert("Please enter your password"), 100);
        return;
    }

    // If validation passes, play the click sound
    playClick();

    try{
        const user = await login(email, password);
        // Save login time in localStorage
        localStorage.setItem("loginTime", Date.now());
        await playSuccess();
        setTimeout(() => {
            alert("Login successful! Welcome back!");
            window.location.href = "howtoplay.html";
        }, 100);
    }
    catch(error){
        playUnsuccess();
        if(error.code === "auth/user-not-found"){
            alert("Email not found. Please check your email or sign up.");
        }
        else if(error.code === "auth/wrong-password"){
            alert("Invalid password. Please try again.");
        }
        else if(error.code === "auth/invalid-credential"){
            alert("Invalid email or password. Please try again.");
        }
        else{
            alert(error.message || "Invalid login. Please try again.");
        }
    }
});