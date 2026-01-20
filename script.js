// Game State
const gameState = {
    player1: {
        name: "Player 1",
        score: 0,
        powerup: null,
        hasAnswered: false
    },
    player2: {
        name: "Player 2",
        score: 0,
        powerup: null,
        hasAnswered: false
    },
    currentPlayer: 1,
    currentQuestion: 0,
    questions: [],
    selectedOption: null,
    timer: null,
    timeRemaining: 30,
    startTime: null,
    selectedWorksheet: "344122" // Default to your worksheet
};

// Power-ups configuration
const powerUps = {
    double: { name: "Double Points", multiplier: 2, icon: "fas fa-times-circle" },
    halve: { name: "Halve Points", multiplier: 0.5, icon: "fas fa-divide" },
    increase30: { name: "+30% Points", multiplier: 1.3, icon: "fas fa-arrow-up" },
    decrease30: { name: "-30% Points", multiplier: 0.7, icon: "fas fa-arrow-down" },
    switch: { name: "Switch Scores", multiplier: 0, icon: "fas fa-exchange-alt" }
};

// Your worksheet data
const worksheetData = {
    "code": "344122",
    "title": "Sec 4 Combined Chemistry - Chapter 12: Reactivity Series (Worksheet 2)",
    "subject": "Combined Chemistry",
    "level": "Upper Secondary",
    "topic": "Chapter 12: Metals and Reactivity Series",
    "difficulty": "Intermediate",
    "author": "Chemistry Department",
    "created": "2024-01-25",
    "description": "Second worksheet on reactivity series, displacement reactions, and corrosion of iron.",
    "questions": [
        {
            "id": 1,
            "question": "Which metal reacts most vigorously with dilute sulfuric acid?",
            "options": ["Magnesium", "Zinc", "Iron", "Copper"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Magnesium is highest in the reactivity series among these options, so it reacts most vigorously."
        },
        {
            "id": 2,
            "question": "Which metal will NOT displace hydrogen from dilute hydrochloric acid?",
            "options": ["Zinc", "Iron", "Copper", "Magnesium"],
            "correctAnswer": 2,
            "points": 5,
            "explanation": "Copper is below hydrogen in the reactivity series, so it cannot displace hydrogen from acids."
        },
        {
            "id": 3,
            "question": "What happens when iron is placed in copper sulfate solution?",
            "options": ["Iron becomes coated with copper", "Copper becomes coated with iron", "No visible change", "The solution turns green"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Iron is more reactive than copper, so it displaces copper from the solution, forming a copper coating."
        },
        {
            "id": 4,
            "question": "Which metal reacts with cold water to form a hydroxide and hydrogen gas?",
            "options": ["Sodium", "Iron", "Copper", "Silver"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Sodium reacts vigorously with cold water to form sodium hydroxide and hydrogen gas."
        },
        {
            "id": 5,
            "question": "What is the correct order of reactivity (most reactive first)?",
            "options": ["K > Na > Ca > Mg", "Mg > Ca > Na > K", "Ca > Mg > K > Na", "Na > K > Mg > Ca"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Potassium (K) is most reactive, followed by sodium (Na), then calcium (Ca), then magnesium (Mg)."
        },
        {
            "id": 6,
            "question": "Which statement about obtaining metals from their ores is true?",
            "options": ["Gold is usually found as a pure metal", "All metals require electricity to extract", "More reactive metals are cheaper to obtain", "Iron is always found as a pure element"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Gold is very unreactive and can be found as a pure metal in nature, while more reactive metals are always found combined in ores."
        },
        {
            "id": 7,
            "question": "What is formed when magnesium reacts with steam?",
            "options": ["Magnesium oxide and hydrogen", "Magnesium hydroxide", "Magnesium hydride", "Magnesium and oxygen"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Magnesium reacts with steam to form magnesium oxide and hydrogen gas."
        },
        {
            "id": 8,
            "question": "Which metal will displace silver from silver nitrate solution?",
            "options": ["Copper", "Gold", "Silver", "Platinum"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Copper is more reactive than silver and will displace it from silver nitrate solution."
        },
        {
            "id": 9,
            "question": "Why does painting prevent rusting?",
            "options": ["Prevents oxygen and water from reaching iron", "Makes iron less reactive", "Absorbs moisture", "Produces a protective gas"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Paint forms a barrier that prevents oxygen and water from coming into contact with the iron surface."
        },
        {
            "id": 10,
            "question": "Which metal reacts with dilute acid but not with cold water?",
            "options": ["Zinc", "Sodium", "Potassium", "Calcium"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Zinc reacts with dilute acids but does not react with cold water."
        },
        {
            "id": 11,
            "question": "What happens when copper is placed in iron sulfate solution?",
            "options": ["No reaction", "Copper dissolves", "Iron coats the copper", "Gas bubbles form"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Copper is less reactive than iron, so it cannot displace iron from its salt solution."
        },
        {
            "id": 12,
            "question": "Which metal requires the most electricity to obtain from its ore?",
            "options": ["Aluminum", "Iron", "Zinc", "Copper"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Aluminum is the most reactive among these and requires the most electricity to extract from its ore."
        },
        {
            "id": 13,
            "question": "What are the products when calcium reacts with water?",
            "options": ["Calcium hydroxide and hydrogen", "Calcium oxide and hydrogen", "Calcium hydride", "Calcium carbonate"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Calcium reacts with water to form calcium hydroxide and hydrogen gas."
        },
        {
            "id": 14,
            "question": "Which metal is stored under oil to prevent reaction with air?",
            "options": ["Sodium", "Iron", "Copper", "Aluminum"],
            "correctAnswer": 0,
            "points": 5,
            "explanation": "Sodium is very reactive and reacts with oxygen and moisture in air, so it's stored under oil."
        },
        {
            "id": 15,
            "question": "What is observed when a rusty iron nail is placed in dilute acid?",
            "options": ["The rust dissolves", "The nail becomes shiny", "Gas bubbles form on rust", "The solution turns blue"],
            "correctAnswer": 0,
            points: 5,
            "explanation": "Rust (iron oxide) reacts with acid to form a soluble salt, so the rust dissolves."
        }
    ]
};

// DOM Elements
const screens = {
    setup: document.getElementById('setup-screen'),
    powerup: document.getElementById('powerup-screen'),
    quiz: document.getElementById('quiz-screen'),
    results: document.getElementById('results-screen')
};

// Initialize the game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    populateChapterOptions();
    updateWorksheetInfo();
});

function initializeEventListeners() {
    // Player name inputs
    document.getElementById('player1-name').addEventListener('input', (e) => {
        gameState.player1.name = e.target.value || "Player 1";
    });
    
    document.getElementById('player2-name').addEventListener('input', (e) => {
        gameState.player2.name = e.target.value || "Player 2";
    });
    
    // Level selection
    document.getElementById('level-select').addEventListener('change', (e) => {
        updateGradeOptions(e.target.value);
    });
    
    // Grade selection
    document.getElementById('grade-select').addEventListener('change', () => {
        document.getElementById('chapter-select').disabled = false;
    });
    
    // Chapter selection
    document.getElementById('chapter-select').addEventListener('change', () => {
        document.getElementById('worksheet-select').disabled = false;
    });
    
    // Worksheet selection
    document.getElementById('worksheet-select').addEventListener('change', (e) => {
        gameState.selectedWorksheet = e.target.value;
        updateWorksheetInfo();
    });
    
    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', loadWorksheetData);
    
    // Reset button
    document.getElementById('reset-btn').addEventListener('click', resetGame);
    
    // Power-up selection buttons
    document.querySelectorAll('.select-powerup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const player = e.target.dataset.player || e.target.closest('.select-powerup-btn').dataset.player;
            selectRandomPowerup(parseInt(player));
        });
    });
    
    // Start quiz button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Back to setup button
    document.getElementById('back-to-setup-btn').addEventListener('click', () => {
        showScreen('setup');
    });
    
    // Quiz controls
    document.getElementById('submit-answer-btn').addEventListener('click', submitAnswer);
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    
    // Results screen buttons
    document.getElementById('play-again-btn').addEventListener('click', playAgain);
    document.getElementById('new-worksheet-btn').addEventListener('click', () => {
        resetGame();
        showScreen('setup');
    });
}

function populateChapterOptions() {
    const chapterSelect = document.getElementById('chapter-select');
    for (let i = 1; i <= 20; i++) {
        const option = document.createElement('option');
        option.value = i.toString().padStart(2, '0');
        option.textContent = `Chapter ${i}`;
        chapterSelect.appendChild(option);
    }
}

function updateGradeOptions(level) {
    const gradeSelect = document.getElementById('grade-select');
    gradeSelect.innerHTML = '<option value="">-- Select Grade --</option>';
    
    if (level === '1') {
        // Primary school
        for (let i = 1; i <= 6; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Primary ${i}`;
            gradeSelect.appendChild(option);
        }
    } else if (level === '2') {
        // Lower secondary
        for (let i = 1; i <= 2; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Secondary ${i}`;
            gradeSelect.appendChild(option);
        }
    } else if (level === '3') {
        // Upper secondary
        for (let i = 3; i <= 4; i++) {
            const option = document.createElement('option');
            option.value = i.toString();
            option.textContent = `Secondary ${i}`;
            gradeSelect.appendChild(option);
        }
    }
    
    gradeSelect.disabled = false;
}

function updateWorksheetInfo() {
    const infoDiv = document.getElementById('selected-worksheet-info');
    const detailsP = document.getElementById('worksheet-details');
    
    if (gameState.selectedWorksheet === "344122") {
        detailsP.innerHTML = `
            <strong>${worksheetData.subject}</strong><br>
            ${worksheetData.level} - Secondary 4<br>
            ${worksheetData.topic}<br>
            <small>${worksheetData.description}</small>
        `;
        infoDiv.style.display = 'block';
    }
}

async function loadWorksheetData() {
    // Show loading state
    const startBtn = document.getElementById('start-game-btn');
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    startBtn.disabled = true;
    
    try {
        // Convert worksheet data to game format
        gameState.questions = worksheetData.questions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options.map((opt, index) => ({
                id: String.fromCharCode(65 + index), // A, B, C, D
                text: opt
            })),
            correctAnswer: String.fromCharCode(65 + q.correctAnswer), // Convert 0->A, 1->B, etc.
            points: q.points,
            explanation: q.explanation
        }));
        
        console.log(`Loaded worksheet ${worksheetData.code}: ${worksheetData.title}`);
        console.log(`Contains ${gameState.questions.length} questions`);
        
        // Update player names on power-up screen
        document.getElementById('player1-display').textContent = gameState.player1.name;
        document.getElementById('player2-display').textContent = gameState.player2.name;
        
        // Reset power-ups
        gameState.player1.powerup = null;
        gameState.player2.powerup = null;
        updatePowerupDisplay();
        
        // Show power-up screen
        showScreen('powerup');
        
    } catch (error) {
        console.error("Error loading worksheet:", error);
        alert("Error loading worksheet data. Please try again.");
    } finally {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game with Demo';
        startBtn.disabled = false;
    }
}

function selectRandomPowerup(player) {
    const powerupKeys = Object.keys(powerUps);
    const randomPowerupKey = powerupKeys[Math.floor(Math.random() * powerupKeys.length)];
    
    if (player === 1) {
        gameState.player1.powerup = randomPowerupKey;
    } else {
        gameState.player2.powerup = randomPowerupKey;
    }
    
    updatePowerupDisplay();
    checkPowerupSelection();
}

function updatePowerupDisplay() {
    // Update player 1 power-up display
    const player1PowerupDiv = document.querySelector('#player1-powerup .selected-powerup');
    if (gameState.player1.powerup) {
        const powerup = powerUps[gameState.player1.powerup];
        player1PowerupDiv.innerHTML = `
            <div class="has-powerup">
                <i class="${powerup.icon}"></i>
                <span>${powerup.name}</span>
            </div>
        `;
    } else {
        player1PowerupDiv.innerHTML = '<p class="no-powerup">No power-up selected yet</p>';
    }
    
    // Update player 2 power-up display
    const player2PowerupDiv = document.querySelector('#player2-powerup .selected-powerup');
    if (gameState.player2.powerup) {
        const powerup = powerUps[gameState.player2.powerup];
        player2PowerupDiv.innerHTML = `
            <div class="has-powerup">
                <i class="${powerup.icon}"></i>
                <span>${powerup.name}</span>
            </div>
        `;
    } else {
        player2PowerupDiv.innerHTML = '<p class="no-powerup">No power-up selected yet</p>';
    }
}

function checkPowerupSelection() {
    const startQuizBtn = document.getElementById('start-quiz-btn');
    if (gameState.player1.powerup && gameState.player2.powerup) {
        startQuizBtn.disabled = false;
    } else {
        startQuizBtn.disabled = true;
    }
}

function startQuiz() {
    // Set up quiz screen
    document.getElementById('quiz-player1-name').textContent = gameState.player1.name;
    document.getElementById('quiz-player2-name').textContent = gameState.player2.name;
    document.getElementById('player1-powerup-name').textContent = powerUps[gameState.player1.powerup]?.name || "None";
    document.getElementById('player2-powerup-name').textContent = powerUps[gameState.player2.powerup]?.name || "None";
    
    // Update worksheet name
    document.getElementById('current-worksheet-name').textContent = worksheetData.title;
    document.getElementById('results-worksheet-name').textContent = worksheetData.title;
    
    // Reset game state
    gameState.currentQuestion = 0;
    gameState.player1.score = 0;
    gameState.player2.score = 0;
    gameState.player1.hasAnswered = false;
    gameState.player2.hasAnswered = false;
    gameState.currentPlayer = Math.random() < 0.5 ? 1 : 2;
    gameState.startTime = Date.now();
    
    // Show quiz screen
    showScreen('quiz');
    
    // Load first question
    loadQuestion();
}

function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    
    if (!question) {
        endGame();
        return;
    }
    
    // Update question counter
    document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = gameState.questions.length;
    
    // Update question text
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('question-points').textContent = question.points;
    
    // Update player scores
    document.getElementById('player1-score').textContent = gameState.player1.score;
    document.getElementById('player2-score').textContent = gameState.player2.score;
    
    // Update current turn indicator
    document.getElementById('player1-turn-indicator').style.display = gameState.currentPlayer === 1 ? 'block' : 'none';
    document.getElementById('player2-turn-indicator').style.display = gameState.currentPlayer === 2 ? 'block' : 'none';
    
    // Update player status active class
    document.getElementById('player1-status').classList.toggle('active', gameState.currentPlayer === 1);
    document.getElementById('player2-status').classList.toggle('active', gameState.currentPlayer === 2);
    
    // Load options
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    
    question.options.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.optionId = option.id;
        
        optionDiv.innerHTML = `
            <div class="option-letter">${option.id}</div>
            <div class="option-text">${option.text}</div>
        `;
        
        optionDiv.addEventListener('click', () => selectOption(option.id));
        optionsContainer.appendChild(optionDiv);
    });
    
    // Reset selected option
    gameState.selectedOption = null;
    document.getElementById('submit-answer-btn').disabled = true;
    document.getElementById('next-question-btn').style.display = 'none';
    
    // Reset timer
    gameState.timeRemaining = 30;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    // Start timer
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(updateTimer, 1000);
}

function selectOption(optionId) {
    // Deselect all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select clicked option
    const selectedOption = document.querySelector(`.option[data-option-id="${optionId}"]`);
    selectedOption.classList.add('selected');
    
    gameState.selectedOption = optionId;
    document.getElementById('submit-answer-btn').disabled = false;
}

function updateTimer() {
    gameState.timeRemaining--;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    if (gameState.timeRemaining <= 0) {
        clearInterval(gameState.timer);
        // Auto-submit with no answer (wrong)
        submitAnswer(true);
    }
}

function submitAnswer(isTimeout = false) {
    clearInterval(gameState.timer);
    
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = !isTimeout && gameState.selectedOption === question.correctAnswer;
    const currentPlayer = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    
    // Mark player as having answered
    currentPlayer.hasAnswered = true;
    
    if (isCorrect) {
        // Add points
        currentPlayer.score += question.points;
        
        // Show correct feedback
        const correctOption = document.querySelector(`.option[data-option-id="${question.correctAnswer}"]`);
        correctOption.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
        correctOption.style.borderColor = '#4caf50';
        
        // Update score display
        if (gameState.currentPlayer === 1) {
            document.getElementById('player1-score').textContent = gameState.player1.score;
        } else {
            document.getElementById('player2-score').textContent = gameState.player2.score;
        }
    } else if (!isTimeout) {
        // Show incorrect feedback
        const selectedOption = document.querySelector(`.option[data-option-id="${gameState.selectedOption}"]`);
        if (selectedOption) {
            selectedOption.style.backgroundColor = 'rgba(244, 67, 54, 0.3)';
            selectedOption.style.borderColor = '#f44336';
        }
        
        // Show correct answer
        const correctOption = document.querySelector(`.option[data-option-id="${question.correctAnswer}"]`);
        correctOption.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
        correctOption.style.borderColor = '#4caf50';
    }
    
    // Disable all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.style.pointerEvents = 'none';
    });
    
    // Show next question button
    document.getElementById('submit-answer-btn').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'block';
}

function nextQuestion() {
    // Check if both players have answered
    if (gameState.player1.hasAnswered && gameState.player2.hasAnswered) {
        // Both players answered, move to next question
        gameState.currentQuestion++;
        gameState.player1.hasAnswered = false;
        gameState.player2.hasAnswered = false;
        
        // Switch current player
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        
        // Load next question
        loadQuestion();
    } else {
        // Other player's turn
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        gameState.selectedOption = null;
        
        // Load same question for other player
        loadQuestionForOtherPlayer();
    }
}

function loadQuestionForOtherPlayer() {
    const question = gameState.questions[gameState.currentQuestion];
    
    // Update current turn indicator
    document.getElementById('player1-turn-indicator').style.display = gameState.currentPlayer === 1 ? 'block' : 'none';
    document.getElementById('player2-turn-indicator').style.display = gameState.currentPlayer === 2 ? 'block' : 'none';
    
    // Update player status active class
    document.getElementById('player1-status').classList.toggle('active', gameState.currentPlayer === 1);
    document.getElementById('player2-status').classList.toggle('active', gameState.currentPlayer === 2);
    
    // Reset selected option
    gameState.selectedOption = null;
    document.getElementById('submit-answer-btn').disabled = true;
    document.getElementById('next-question-btn').style.display = 'none';
    
    // Reset timer
    gameState.timeRemaining = 30;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    // Start timer
    if (gameState.timer) clearInterval(gameState.timer);
    gameState.timer = setInterval(updateTimer, 1000);
}

function endGame() {
    clearInterval(gameState.timer);
    
    // Calculate final scores with power-ups
    let player1FinalScore = gameState.player1.score;
    let player2FinalScore = gameState.player2.score;
    
    // Apply power-ups
    if (gameState.player1.powerup) {
        player1FinalScore = applyPowerup(gameState.player1.powerup, player1FinalScore, player2FinalScore, true);
    }
    
    if (gameState.player2.powerup) {
        player2FinalScore = applyPowerup(gameState.player2.powerup, player2FinalScore, player1FinalScore, false);
    }
    
    // Calculate completion time
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - gameState.startTime) / 1000 / 60);
    document.getElementById('completion-time').textContent = completionTime;
    
    // Update results screen
    document.getElementById('results-player1-name').textContent = gameState.player1.name;
    document.getElementById('results-player2-name').textContent = gameState.player2.name;
    
    document.getElementById('player1-raw-score').textContent = gameState.player1.score;
    document.getElementById('player2-raw-score').textContent = gameState.player2.score;
    
    document.getElementById('player1-final-powerup').textContent = 
        powerUps[gameState.player1.powerup]?.name || "None";
    document.getElementById('player2-final-powerup').textContent = 
        powerUps[gameState.player2.powerup]?.name || "None";
    
    document.getElementById('player1-final-score').textContent = Math.round(player1FinalScore);
    document.getElementById('player2-final-score').textContent = Math.round(player2FinalScore);
    
    // Determine winner
    let winnerName, winningMessage;
    if (player1FinalScore > player2FinalScore) {
        winnerName = gameState.player1.name;
        winningMessage = `${winnerName} wins with ${Math.round(player1FinalScore)} points!`;
        document.getElementById('player1-final').classList.add('winner');
        document.getElementById('player2-final').classList.remove('winner');
    } else if (player2FinalScore > player1FinalScore) {
        winnerName = gameState.player2.name;
        winningMessage = `${winnerName} wins with ${Math.round(player2FinalScore)} points!`;
        document.getElementById('player2-final').classList.add('winner');
        document.getElementById('player1-final').classList.remove('winner');
    } else {
        winnerName = "It's a tie!";
        winningMessage = "Both players have the same score!";
        document.getElementById('player1-final').classList.add('winner');
        document.getElementById('player2-final').classList.add('winner');
    }
    
    document.getElementById('winner-name').textContent = winnerName;
    document.getElementById('winning-message').textContent = winningMessage;
    
    // Show results screen
    showScreen('results');
}

function applyPowerup(powerupKey, playerScore, opponentScore, isPlayer1) {
    const powerup = powerUps[powerupKey];
    
    switch(powerupKey) {
        case 'double':
            return playerScore * 2;
        case 'halve':
            return playerScore * 0.5;
        case 'increase30':
            return playerScore * 1.3;
        case 'decrease30':
            return playerScore * 0.7;
        case 'switch':
            return opponentScore;
        default:
            return playerScore;
    }
}

function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show requested screen
    screens[screenName].classList.add('active');
}

function resetGame() {
    // Reset game state
    gameState.player1 = {
        name: "Player 1",
        score: 0,
        powerup: null,
        hasAnswered: false
    };
    gameState.player2 = {
        name: "Player 2",
        score: 0,
        powerup: null,
        hasAnswered: false
    };
    gameState.currentPlayer = 1;
    gameState.currentQuestion = 0;
    gameState.questions = [];
    gameState.selectedOption = null;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Reset form
    document.getElementById('player1-name').value = "Player 1";
    document.getElementById('player2-name').value = "Player 2";
    document.getElementById('level-select').value = "";
    document.getElementById('subject-select').value = "";
    document.getElementById('grade-select').innerHTML = '<option value="">-- Select Grade --</option>';
    document.getElementById('grade-select').disabled = true;
    document.getElementById('chapter-select').value = "";
    document.getElementById('chapter-select').disabled = true;
    document.getElementById('worksheet-select').value = "";
    document.getElementById('worksheet-select').disabled = true;
    document.getElementById('selected-worksheet-info').style.display = 'none';
    document.getElementById('start-game-btn').innerHTML = '<i class="fas fa-play"></i> Start Game with Demo';
}

function playAgain() {
    // Reset scores but keep player names and power-ups
    gameState.player1.score = 0;
    gameState.player2.score = 0;
    gameState.currentQuestion = 0;
    gameState.currentPlayer = Math.random() < 0.5 ? 1 : 2;
    gameState.player1.hasAnswered = false;
    gameState.player2.hasAnswered = false;
    gameState.selectedOption = null;
    gameState.startTime = Date.now();
    
    // Start quiz again
    startQuiz();
}