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
    updateUI();
    // Enable start button by default for testing
    startGameBtn.disabled = false;
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
    
    // Options click handlers
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('option')) {
            selectOption(e.target, parseInt(e.target.dataset.index));
        }
    });
}

// Select color for player
function selectColor(player, element) {
    const colorOptions = player === 'player1' ? player1ColorOptions : player2ColorOptions;
    colorOptions.forEach(opt => opt.classList.remove('active'));
    element.classList.add('active');
    
    gameState.players[player].color = element.dataset.color;
    updateUI();
}

// FIXED: Load worksheet from code
async function loadWorksheet() {
    const code = worksheetCodeInput.value.trim();
    
    if (code.length !== 6) {
        alert('Please enter a valid 6-digit code');
        return;
    }
    
    // Clear previous info
    worksheetInfoDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading worksheet...</p>';
    startGameBtn.disabled = true;
    
    try {
        console.log('Loading worksheet with code:', code);
        
        // SIMPLIFIED PATH - Direct relative path
        // For code 342121, the path is: data/upper-secondary/combined-chemistry/342121.json
        const path = `data/upper-secondary/combined-chemistry/${code}.json`;
        console.log('Trying to load from:', path);
        
        // Try to load the file
        const response = await fetch(path);
        
        if (!response.ok) {
            console.error('Fetch failed with status:', response.status);
            
            // Try alternative paths for debugging
            const altPaths = [
                `./data/upper-secondary/combined-chemistry/${code}.json`,
                `/data/upper-secondary/combined-chemistry/${code}.json`,
                `${code}.json`
            ];
            
            let errorMessage = `Worksheet not found at: ${path}`;
            
            // Test alternative paths
            for (const altPath of altPaths) {
                console.log('Trying alternative path:', altPath);
                try {
                    const altResponse = await fetch(altPath);
                    if (altResponse.ok) {
                        const data = await altResponse.json();
                        gameState.worksheet = data;
                        console.log('Successfully loaded from alternative path:', altPath);
                        break;
                    }
                } catch (altError) {
                    console.log('Alternative path failed:', altPath);
                }
            }
            
            if (!gameState.worksheet) {
                throw new Error(errorMessage);
            }
        } else {
            // Success - load the worksheet
            gameState.worksheet = await response.json();
            console.log('Worksheet loaded successfully:', gameState.worksheet.title);
        }
        
        // Validate the worksheet
        if (!gameState.worksheet || !gameState.worksheet.questions || !Array.isArray(gameState.worksheet.questions)) {
            throw new Error('Invalid worksheet format: missing questions array');
        }
        
        // Display worksheet info
        worksheetInfoDiv.innerHTML = `
            <h4>✅ ${gameState.worksheet.title}</h4>
            <p><strong>Subject:</strong> ${gameState.worksheet.subject}</p>
            <p><strong>Level:</strong> ${gameState.worksheet.level}</p>
            <p><strong>Topic:</strong> ${gameState.worksheet.topic}</p>
            <p><strong>Difficulty:</strong> ${gameState.worksheet.difficulty}</p>
            <p><strong>Questions:</strong> ${gameState.worksheet.questions.length}</p>
            <p style="color: #2ecc71; font-size: 0.9rem;">
                <i class="fas fa-check-circle"></i> Worksheet loaded successfully!
            </p>
        `;
        
        // Enable start game button
        startGameBtn.disabled = false;
        startGameBtn.innerHTML = `<i class="fas fa-play"></i> Start "${gameState.worksheet.title.substring(0, 30)}..."`;
        
    } catch (error) {
        console.error('Error loading worksheet:', error);
        worksheetInfoDiv.innerHTML = `
            <div style="color: #e74c3c; background: #fee; padding: 15px; border-radius: 10px; border: 1px solid #e74c3c;">
                <h4 style="margin-top: 0;"><i class="fas fa-exclamation-triangle"></i> Error Loading Worksheet</h4>
                <p><strong>Error:</strong> ${error.message}</p>
                <p><strong>Code entered:</strong> ${code}</p>
                <p><strong>Expected path:</strong> data/upper-secondary/combined-chemistry/${code}.json</p>
                <p style="margin-top: 10px; font-size: 0.9rem;">
                    <i class="fas fa-info-circle"></i> Make sure the file exists in the correct folder.
                </p>
            </div>
        `;
        startGameBtn.disabled = true;
        startGameBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    }
}

// Start the game
function startGame() {
    if (!gameState.worksheet) {
        alert('Please load a worksheet first');
        return;
    }
    
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
    if (!gameState.worksheet || !gameState.worksheet.questions) {
        alert('No questions available. Loading sample questions.');
        gameState.worksheet = createSampleWorksheet();
    }
    
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
            usePowerupBtn.disabled = false;
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
    usePowerupBtn.disabled = true;
    
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
    if (gameState.players.player1.score > gameState.players.player2.score) {
        winnerAnnouncement.textContent = `🏆 ${gameState.players.player1.name} Wins! 🏆`;
        winnerAnnouncement.style.background = gameState.players.player1.color;
    } else if (gameState.players.player2.score > gameState.players.player1.score) {
        winnerAnnouncement.textContent = `🏆 ${gameState.players.player2.name} Wins! 🏆`;
        winnerAnnouncement.style.background = gameState.players.player2.color;
    } else {
        winnerAnnouncement.textContent = "🤝 It's a Tie! 🤝";
        winnerAnnouncement.style.background = '#667eea';
    }
    
    // Update final scores
    finalPlayer1Name.textContent = gameState.players.player1.name;
    finalPlayer2Name.textContent = gameState.players.player2.name;
    finalPlayer1Score.textContent = gameState.players.player1.score;
    finalPlayer2Score.textContent = gameState.players.player2.score;
    
    // Apply player colors
    document.querySelector('.player1-final').style.borderColor = gameState.players.player1.color;
    document.querySelector('.player2-final').style.borderColor = gameState.players.player2.color;
    
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
    worksheetInfoDiv.innerHTML = '<p>Example code: <strong>342121</strong> (Sec 4 Chemistry Ch12)</p>';
    startGameBtn.disabled = true;
    startGameBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
    worksheetCodeInput.value = '342121'; // Pre-fill with example code
}

// Update player turn indicator
function updatePlayerTurnIndicator() {
    const currentPlayer = gameState.players[gameState.currentPlayer];
    document.querySelectorAll('.player-stats').forEach(stats => {
        stats.style.border = '2px solid #e0e0e0';
    });
    
    const activeStats = gameState.currentPlayer === 'player1' ? 
        document.querySelector('.player1-stats') : 
        document.querySelector('.player2-stats');
    
    activeStats.style.border = `3px solid ${currentPlayer.color}`;
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
    
    // Update player tur
