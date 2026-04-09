import { auth } from "./firebase.js";
import { signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Session timeout duration (30 minutes in milliseconds)
const SESSION_DURATION = 30 * 60 * 1000;

// Check if user session exists
export function requireLogin(){
    onAuthStateChanged(auth, (user) => {
        if(!user){
            window.location.href = "login.html";
        }
        else {
          // Create session on login
            createSession();
        }
    });
}

// Create session
export function createSession() {
  const currentTime = Date.now();
  localStorage.setItem("loginTime", currentTime);
}

// Check if session is expired
export function checkSession(){
    const loginTime = localStorage.getItem("loginTime");

    if(loginTime){
        const currentTime = Date.now();
        if(currentTime - loginTime > SESSION_DURATION){
            alert("Session expired! Please log in again.");
            logout();
            return false;
        }
        return true;
    }
    else{
        console.log("No login session found.");
        return false;
    }
}

// Logout function
export async function logout(){
    await signOut(auth);

    localStorage.removeItem("loginTime");

    window.location.href = "login.html";

}

// Run session check on page load
checkSession();