// Game State
let gameState = {
    currentScreen: 'home',
    players: {
        player1: { name: 'Player 1', score: 0, color: '#3498db', correctAnswers: 0 },
        player2: { name: 'Player 2', score: 0, color: '#9b59b6', correctAnswers: 0 }
    },
    currentPlayer: 'player1',
    worksheet: null,
    currentQuestionIndex: 0,
    selectedOption: null,
    isAnswered: false,
    powerupAvailable: false,
    timer: 30,
    timerInterval: null,
    gameStats: {
        totalAnswered: 0,
        totalCorrect: 0,
        powerupsUsed: 0
    }
};

// DOM Elements
const screens = {
    home: document.getElementById('homeScreen'),
    game: document.getElementById('gameScreen'),
    results: document.getElementById('resultsScreen')
};

// Home Screen Elements
const player1NameInput = document.getElementById('player1Name');
const player2NameInput = document.getElementById('player2Name');
const player1ColorOptions = document.querySelectorAll('.player-input:nth-child(1) .color-option');
const player2ColorOptions = document.querySelectorAll('.player-input:nth-child(2) .color-option');
const worksheetCodeInput = document.getElementById('worksheetCode');
const loadWorksheetBtn = document.getElementById('loadWorksheet');
const worksheetInfoDiv = document.getElementById('worksheetInfo');
const startGameBtn = document.getElementById('startGame');

// Game Screen Elements
const player1NameDisplay = document.querySelector('.player1-stats .player-name');
const player2NameDisplay = document.querySelector('.player2-stats .player-name');
const player1ScoreDisplay = document.querySelector('.player1-stats .player-score');
const player2ScoreDisplay = document.querySelector('.player2-stats .player-score');
const player1ColorDisplay = document.querySelector('.player1-stats .player-color');
const player2ColorDisplay = document.querySelector('.player2-stats .player-color');
const currentQuestionSpan = document.getElementById('currentQuestion');
const totalQuestionsSpan = document.getElementById('totalQuestions');
const timerDisplay = document.getElementById('timer');
const powerupIndicator = document.getElementById('powerupIndicator');
const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');
const usePowerupBtn = document.getElementById('usePowerup');
const nextQuestionBtn = document.getElementById('nextQuestion');
const powerupModal = document.getElementById('powerupModal');
const powerupPlayerDisplay = document.getElementById('powerupPlayer');
const powerupOptions = document.querySelectorAll('.powerup-option');
const cancelPowerupBtn = document.getElementById('cancelPowerup');

// Results Screen Elements
const winnerAnnouncement = document.getElementById('winnerAnnouncement');
const finalPlayer1Name = document.getElementById('finalPlayer1Name');
const finalPlayer2Name = document.getElementById('finalPlayer2Name');
const finalPlayer1Score = document.getElementById('finalPlayer1Score');
const finalPlayer2Score = document.getElementById('finalPlayer2Score');
const totalAnswered = document.getElementById('totalAnswered');
const totalCorrect = document.getElementById('totalCorrect');
const powerupsUsed = document.getElementById('powerupsUsed');
const playAgainBtn = document.getElementById('playAgain');
const newGameBtn = document.getElementById('newGame');

// Initialize the game
function init() {
    setupEventListeners();
    loadInitialData();
    updateUI();
}

// Setup event listeners
function setupEventListeners() {
    // Home screen
    loadWorksheetBtn.addEventListener('click', loadWorksheet);
    worksheetCodeInput.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') loadWorksheet();
    });
    startGameBtn.addEventListener('click', startGame);
    
    // Color pickers
    player1ColorOptions.forEach(option => {
        option.addEventListener('click', () => selectColor('player1', option));
    });
    player2ColorOptions.forEach(option => {
        option.addEventListener('click', () => selectColor('player2', option));
    });
    
    // Game screen
    usePowerupBtn.addEventListener('click', showPowerupModal);
    nextQuestionBtn.addEventListener('click', nextQuestion);
    cancelPowerupBtn.addEventListener('click', cancelPowerup);
    
    // Power-up options
    powerupOptions.forEach(option => {
        option.addEventListener('click', () => usePowerup(option.dataset.powerup));
    });
    
    // Results screen
    playAgainBtn.addEventListener('click', playAgain);
    newGameBtn.addEventListener('click', newGame);
}

// Load initial data
function loadInitialData() {
    // Set default colors as active
    player1ColorOptions[0].classList.add('active');
    player2ColorOptions[0].classList.add('active');
    
    // Load example worksheet (for testing)
    loadExampleWorksheet();
}

// Load example worksheet for testing
function loadExampleWorksheet() {
    // This is where you would load from your JSON files
    // For now, we'll use a test worksheet
    gameState.worksheet = {
        code: "321011",
        title: "Sec 3 Combined Physics - Chapter 1: Measurements",
        subject: "Combined Physics",
        level: "Upper Secondary",
        topic: "Chapter 1: Measurements and Physical Quantities",
        difficulty: "Intermediate",
        description: "Worksheet covering physical quantities, SI units, prefixes, measurements, and scalar/vector quantities.",
        questions: [
            {
                id: 1,
                question: "What are the two components that typically make up a physical quantity?",
                options: ["Magnitude and unit", "Number and symbol", "Value and direction", "Measurement and instrument"],
                correctAnswer: 0,
                points: 5,
                explanation: "A physical quantity consists of a numerical magnitude and a unit."
            },
            {
                id: 2,
                question: "Which of the following is NOT a base SI quantity?",
                options: ["Mass", "Length", "Volume", "Time"],
                correctAnswer: 2,
                points: 5,
                explanation: "Volume is a derived quantity (length³), while mass, length, and time are base quantities."
            },
            // Add more questions as needed
        ]
    };
}

// Select color for player
function selectColor(player, element) {
    const colorOptions = player === 'player1' ? player1ColorOptions : player2ColorOptions;
    colorOptions.forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    gameState.players[player].color = element.dataset.color;
    updateUI();
}

// Load worksheet from code
async function loadWorksheet() {
    const code = worksheetCodeInput.value.trim();
    
    if (code.length !== 6) {
        alert('Please enter a valid 6-digit code');
        return;
    }
    
    try {
        // Extract level, subject, and other info from code
        const level = parseInt(code[0]);
        const subject = parseInt(code[1]);
        const year = parseInt(code[2]);
        const chapter = parseInt(code[3] + code[4]);
        const worksheetNum = parseInt(code[5]);
        
        // Build file path based on code
        let subjectFolder = '';
        let levelFolder = '';
        
        // Determine level folder
        if (level === 1) levelFolder = 'primary';
        else if (level === 2) levelFolder = 'lower-secondary';
        else if (level === 3) levelFolder = 'upper-secondary';
        
        // Determine subject folder
        if (level === 1) {
            subjectFolder = subject === 0 ? 'math' : 'science';
        } else if (level === 2) {
            subjectFolder = subject === 0 ? 'math' : 'science';
        } else if (level === 3) {
            const subjectMap = {
                0: 'math',
                1: 'science',
                2: 'combined-physics',
                3: 'pure-physics',
                4: 'combined-chemistry',
                5: 'pure-chemistry'
            };
            subjectFolder = subjectMap[subject] || 'science';
        }
        
        // Construct path
        const path = `data/${levelFolder}/${subjectFolder}/${code}.json`;
        
        // Load JSON file
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error('Worksheet not found');
        }
        
        gameState.worksheet = await response.json();
        
        // Display worksheet info
        worksheetInfoDiv.innerHTML = `
            <h4>${gameState.worksheet.title}</h4>
            <p><strong>Subject:</strong> ${gameState.worksheet.subject}</p>
            <p><strong>Level:</strong> ${gameState.worksheet.level}</p>
            <p><strong>Topic:</strong> ${gameState.worksheet.topic}</p>
            <p><strong>Difficulty:</strong> ${gameState.worksheet.difficulty}</p>
            <p><strong>Questions:</strong> ${gameState.worksheet.questions.length}</p>
        `;
        
        // Enable start game button
        startGameBtn.disabled = false;
        
    } catch (error) {
        console.error('Error loading worksheet:', error);
        worksheetInfoDiv.innerHTML = `
            <div style="color: #e74c3c;">
                <i class="fas fa-exclamation-triangle"></i>
                Worksheet not found. Please check the code and try again.
            </div>
        `;
        startGameBtn.disabled = true;
    }
}

// Start the game
function startGame() {
    // Update player names
    gameState.players.player1.name = player1NameInput.value || 'Player 1';
    gameState.players.player2.name = player2NameInput.value || 'Player 2';
    
    // Reset game state
    gameState.currentQuestionIndex = 0;
    gameState.players.player1.score = 0;
    gameState.players.player2.score = 0;
    gameState.players.player1.correctAnswers = 0;
    gameState.players.player2.correctAnswers = 0;
    gameState.currentPlayer = 'player1';
    gameState.isAnswered = false;
    gameState.powerupAvailable = false;
    gameState.gameStats = {
        totalAnswered: 0,
        totalCorrect: 0,
        powerupsUsed: 0
    };
    
    // Switch to game screen
    switchScreen('game');
    
    // Start the first question
    loadQuestion();
    startTimer();
}

// Switch between screens
function switchScreen(screenName) {
    Object.keys(screens).forEach(screen => {
        screens[screen].classList.remove('active');
    });
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// Load current question
function loadQuestion() {
    if (!gameState.worksheet || !gameState.worksheet.questions) return;
    
    const question = gameState.worksheet.questions[gameState.currentQuestionIndex];
    
    // Update UI
    currentQuestionSpan.textContent = gameState.currentQuestionIndex + 1;
    totalQuestionsSpan.textContent = gameState.worksheet.questions.length;
    questionText.textContent = question.question;
    
    // Clear and add options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        
        optionElement.addEventListener('click', () => selectOption(optionElement, index));
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset controls
    gameState.selectedOption = null;
    gameState.isAnswered = false;
    nextQuestionBtn.disabled = true;
    usePowerupBtn.disabled = !gameState.powerupAvailable;
    
    // Update player turn indicator
    updatePlayerTurnIndicator();
}

// Select an option
function selectOption(element, index) {
    if (gameState.isAnswered) return;
    
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select new option
    element.classList.add('selected');
    gameState.selectedOption = index;
    gameState.isAnswered = true;
    
    // Check answer
    const question = gameState.worksheet.questions[gameState.currentQuestionIndex];
    const isCorrect = index === question.correctAnswer;
    
    // Update scores
    if (isCorrect) {
        const points = question.points || 5;
        gameState.players[gameState.currentPlayer].score += points;
        gameState.players[gameState.currentPlayer].correctAnswers++;
        gameState.gameStats.totalCorrect++;
        
        // Check for powerup availability (every 3 correct answers)
        if (gameState.players[gameState.currentPlayer].correctAnswers % 3 === 0) {
            gameState.powerupAvailable = true;
            powerupIndicator.style.display = 'inline-flex';
        }
    }
    
    gameState.gameStats.totalAnswered++;
    
    // Show correct/incorrect
    document.querySelectorAll('.option').forEach((opt, i) => {
        if (i === question.correctAnswer) {
            opt.classList.add('correct');
        } else if (i === index && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Enable next question button
    nextQuestionBtn.disabled = false;
    
    // Switch to next player
    gameState.currentPlayer = gameState.currentPlayer === 'player1' ? 'player2' : 'player1';
    
    // Stop timer
    stopTimer();
    
    updateUI();
}

// Start timer
function startTimer() {
    gameState.timer = 30;
    timerDisplay.textContent = gameState.timer;
    
    gameState.timerInterval = setInterval(() => {
        gameState.timer--;
        timerDisplay.textContent = gameState.timer;
        
        if (gameState.timer <= 0) {
            stopTimer();
            if (!gameState.isAnswered) {
                // Time's up - move to next question
                nextQuestion();
            }
        }
    }, 1000);
}

// Stop timer
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// Next question
function nextQuestion() {
    stopTimer();
    
    gameState.currentQuestionIndex++;
    
    if (gameState.currentQuestionIndex < gameState.worksheet.questions.length) {
        loadQuestion();
        startTimer();
        
        // Check if game should end (score >= 100)
        if (gameState.players.player1.score >= 100 || gameState.players.player2.score >= 100) {
            endGame();
        }
    } else {
        endGame();
    }
}

// Show power-up modal
function showPowerupModal() {
    powerupPlayerDisplay.textContent = `${gameState.players[gameState.currentPlayer].name}'s turn`;
    powerupModal.style.display = 'flex';
}

// Cancel power-up
function cancelPowerup() {
    powerupModal.style.display = 'none';
}

// Use power-up
function usePowerup(powerupType) {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const opponent = gameState.currentPlayer === 'player1' ? gameState.players.player2 : gameState.players.player1;
    
    switch (powerupType) {
        case 'double':
            currentPlayer.score *= 2;
            break;
        case 'halve':
            opponent.score = Math.floor(opponent.score / 2);
            break;
        case 'triple':
            currentPlayer.score *= 3;
            break;
        case 'swap':
            const tempScore = currentPlayer.score;
            currentPlayer.score = opponent.score;
            opponent.score = tempScore;
            break;
    }
    
    gameState.powerupAvailable = false;
    gameState.gameStats.powerupsUsed++;
    powerupIndicator.style.display = 'none';
    powerupModal.style.display = 'none';
    
    updateUI();
    
    // Check if game should end after power-up
    if (currentPlayer.score >= 100 || opponent.score >= 100) {
        endGame();
    }
}

// End game
function endGame() {
    stopTimer();
    switchScreen('results');
    
    // Determine winner
    let winner;
    if (gameState.players.player1.score > gameState.players.player2.score) {
        winner = gameState.players.player1;
        winnerAnnouncement.textContent = `🏆 ${winner.name} Wins! 🏆`;
        winnerAnnouncement.style.background = `linear-gradient(135deg, ${winner.color} 0%, #333 100%)`;
    } else if (gameState.players.player2.score > gameState.players.player1.score) {
        winner = gameState.players.player2;
        winnerAnnouncement.textContent = `🏆 ${winner.name} Wins! 🏆`;
        winnerAnnouncement.style.background = `linear-gradient(135deg, ${winner.color} 0%, #333 100%)`;
    } else {
        winnerAnnouncement.textContent = "🤝 It's a Tie! 🤝";
        winnerAnnouncement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
    
    // Update final scores
    finalPlayer1Name.textContent = gameState.players.player1.name;
    finalPlayer2Name.textContent = gameState.players.player2.name;
    finalPlayer1Score.textContent = gameState.players.player1.score;
    finalPlayer2Score.textContent = gameState.players.player2.score;
    
    // Apply player colors
    document.querySelector('.player1-final').style.backgroundColor = `${gameState.players.player1.color}20`;
    document.querySelector('.player2-final').style.backgroundColor = `${gameState.players.player2.color}20`;
    
    // Update stats
    totalAnswered.textContent = gameState.gameStats.totalAnswered;
    totalCorrect.textContent = gameState.gameStats.totalCorrect;
    powerupsUsed.textContent = gameState.gameStats.powerupsUsed;
}

// Play again
function playAgain() {
    gameState.currentQuestionIndex = 0;
    gameState.players.player1.score = 0;
    gameState.players.player2.score = 0;
    gameState.players.player1.correctAnswers = 0;
    gameState.players.player2.correctAnswers = 0;
    gameState.currentPlayer = 'player1';
    gameState.isAnswered = false;
    gameState.powerupAvailable = false;
    gameState.gameStats = {
        totalAnswered: 0,
        totalCorrect: 0,
        powerupsUsed: 0
    };
    
    switchScreen('game');
    loadQuestion();
    startTimer();
}

// New game
function newGame() {
    switchScreen('home');
    startGameBtn.disabled = true;
    worksheetInfoDiv.innerHTML = '';
}

// Update player turn indicator
function updatePlayerTurnIndicator() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.querySelectorAll('.player-stats').forEach(stats => {
        stats.style.opacity = '0.7';
        stats.style.transform = 'scale(0.95)';
    });
    
    const activeStats = gameState.currentPlayer === 'player1' ? 
        document.querySelector('.player1-stats') : 
        document.querySelector('.player2-stats');
    
    activeStats.style.opacity = '1';
    activeStats.style.transform = 'scale(1.05)';
    activeStats.style.boxShadow = `0 10px 30px ${currentPlayer.color}40`;
}

// Update UI
function updateUI() {
    // Update player displays
    player1NameDisplay.textContent = gameState.players.player1.name;
    player2NameDisplay.textContent = gameState.players.player2.name;
    player1ScoreDisplay.textContent = gameState.players.player1.score;
    player2ScoreDisplay.textContent = gameState.players.player2.score;
    player1ColorDisplay.style.backgroundColor = gameState.players.player1.color;
    player2ColorDisplay.style.backgroundColor = gameState.players.player2.color;
    
    // Update player stat backgrounds
    document.querySelector('.player1-stats').style.backgroundColor = `${gameState.players.player1.color}20`;
    document.querySelector('.player2-stats').style.backgroundColor = `${gameState.players.player2.color}20`;
    
    // Update power-up button
    usePowerupBtn.disabled = !gameState.powerupAvailable;
    
    // Update player turn indicator
    if (gameState.currentScreen === 'game') {
        updatePlayerTurnIndicator();
    }
}

// Initialize the game when page loads
document.addEventListener('DOMContentLoaded', init);