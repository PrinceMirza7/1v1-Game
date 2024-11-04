// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, onValue } from "firebase/database"; // Import the Realtime Database functions

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCUox0PRo5cdcG5lY8S-C9zUBVXJv5J-Zk",
    authDomain: "v1game-52766.firebaseapp.com",
    databaseURL: "https://v1game-52766-default-rtdb.firebaseio.com",
    projectId: "v1game-52766",
    storageBucket: "v1game-52766.firebasestorage.app",
    messagingSenderId: "455095049518",
    appId: "1:455095049518:web:9c4709b5c6cc3f467b2ebf"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); // Initialize the database

// Global variables
let roomCode = '';
let playerRole = ''; // 'player1' or 'player2'

// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
    // Event listeners for buttons
    document.getElementById("generate-code").addEventListener("click", generateCode);
    document.getElementById("join-game").addEventListener("click", startGame);

    document.querySelectorAll(".game-btn").forEach(button => {
        button.addEventListener("click", (e) => {
            // Deselect previous choice
            document.querySelectorAll(".game-btn").forEach(btn => btn.classList.remove("active"));
            // Select new choice
            e.target.classList.add("active");
            playGame(e.target.dataset.choice);
        });
    });
});

// Generate a random room code
function generateCode() {
    roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    document.getElementById("room-code").value = roomCode;
    playerRole = 'player1';
}

// Start the game
function startGame() {
    roomCode = document.getElementById("room-code").value;
    if (!roomCode) {
        alert("Please enter or generate a room code.");
        return;
    }
    playerRole = playerRole || 'player2';
    document.getElementById("game-setup").style.display = "none";
    document.getElementById("game-area").style.display = "block";

    // Listen for opponent's move
    const opponentMoveRef = ref(db, `games/${roomCode}/${playerRole === 'player1' ? 'player2Move' : 'player1Move'}`);
    onValue(opponentMoveRef, (snapshot) => {
        const opponentMove = snapshot.val();
        if (opponentMove) {
            checkResult(opponentMove);
        }
    });
}

// Play the game
function playGame(playerChoice) {
    const playerMoveRef = ref(db, `games/${roomCode}/${playerRole}Move`);
    set(playerMoveRef, playerChoice);
    document.getElementById("result").innerText = "Waiting for opponent's move...";
}

// Check the game result
function checkResult(opponentMove) {
    const playerMove = document.querySelector('button.game-btn[data-choice].active').dataset.choice;

    let result;
    if (playerMove === opponentMove) {
        result = "It's a tie!";
    } else if (
        (playerMove === "rock" && opponentMove === "scissors") ||
        (playerMove === "scissors" && opponentMove === "paper") ||
        (playerMove === "paper" && opponentMove === "rock")
    ) {
        result = "You win!";
    } else {
        result = "You lose!";
    }

    document.getElementById("result").innerText = `You chose ${playerMove}, opponent chose ${opponentMove}. ${result}`;
}
