import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { signInWithEmailAndPassword } 
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBI2J8JYcjJfAnEH42UnTyspqPO-dJGCfo",
    authDomain: "heart-ascend.firebaseapp.com",
    projectId: "heart-ascend",
    storageBucket: "heart-ascend.firebasestorage.app",
    messagingSenderId: "1015832734017",
    appId: "1:1015832734017:web:668132fcc6b24e5816d9c0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Signup - create new users with Firebase Authentication using email and password
export async function signup(nickname, email, password){

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "players", user.uid), {
        nickname: nickname,
        email: email,
        gamesPlayed: 0,
        currentStreak: 0,
        rank: "HEART NOVICE"
    });

    return user;
}


// Login - authenticate users with Firebase Authentication using email and password
export async function login(email, password){

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
}

// Update nickname - update the player's nickname in Firestore
export async function updateNickname(uid, newNickname) {
    const playerRef = doc(db, "players", uid);
    await updateDoc(playerRef, {
        nickname: newNickname
    });
}
