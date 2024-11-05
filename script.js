document.addEventListener("DOMContentLoaded", () => {
    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);

    // Global variables
    let roomCode = '';
    let playerRole = ''; // 'player1' or 'player2'

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
        onValue(ref(db, `games/${roomCode}/${playerRole === 'player1' ? 'player2Move' : 'player1Move'}`), (snapshot) => {
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
