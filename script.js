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
    selectedWorksheet: null,
    
    // File structure configuration
    levels: {
        '1': { name: 'Primary School', folder: 'primary', grades: ['1', '2', '3', '4', '5', '6'] },
        '2': { name: 'Lower Secondary', folder: 'lower-secondary', grades: ['1', '2'] },
        '3': { name: 'Upper Secondary', folder: 'upper-secondary', grades: ['3', '4'] }
    },
    
    subjects: {
        '0': { name: 'Mathematics', folder: 'math' },
        '1': { name: 'Science', folder: 'science' },
        '2': { name: 'Combined Physics', folder: 'combined-physics' },
        '3': { name: 'Pure Physics', folder: 'pure-physics' },
        '4': { name: 'Combined Chemistry', folder: 'combined-chemistry' },
        '5': { name: 'Pure Chemistry', folder: 'pure-chemistry' }
    }
};

// Power-ups configuration
const powerUps = {
    double: { name: "Double Points", multiplier: 2, icon: "fas fa-times-circle" },
    halve: { name: "Halve Points", multiplier: 0.5, icon: "fas fa-divide" },
    increase30: { name: "+30% Points", multiplier: 1.3, icon: "fas fa-arrow-up" },
    decrease30: { name: "-30% Points", multiplier: 0.7, icon: "fas fa-arrow-down" },
    switch: { name: "Switch Scores", multiplier: 0, icon: "fas fa-exchange-alt" }
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
    populateDropdowns();
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
        const level = e.target.value;
        updateSubjectOptions(level);
        updateGradeOptions(level);
        updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Subject selection
    document.getElementById('subject-select').addEventListener('change', () => {
        updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Grade selection
    document.getElementById('grade-select').addEventListener('change', () => {
        updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Chapter selection
    document.getElementById('chapter-select').addEventListener('change', () => {
        updateWorksheetOptions();
    });
    
    // Worksheet selection
    document.getElementById('worksheet-select').addEventListener('change', (e) => {
        gameState.selectedWorksheet = e.target.value;
        updateWorksheetInfo();
        document.getElementById('start-game-btn').disabled = !gameState.selectedWorksheet;
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

function populateDropdowns() {
    // Clear existing options first to avoid duplicates
    document.getElementById('level-select').innerHTML = '<option value="">-- Select Level --</option>';
    document.getElementById('subject-select').innerHTML = '<option value="">-- Select Subject --</option>';
    
    // Populate level options
    const levelSelect = document.getElementById('level-select');
    for (const [code, level] of Object.entries(gameState.levels)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = level.name;
        levelSelect.appendChild(option);
    }
    
    // Populate subject options
    const subjectSelect = document.getElementById('subject-select');
    for (const [code, subject] of Object.entries(gameState.subjects)) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = subject.name;
        subjectSelect.appendChild(option);
    }
}

function updateSubjectOptions(level) {
    const subjectSelect = document.getElementById('subject-select');
    subjectSelect.disabled = !level;
}

function updateGradeOptions(level) {
    const gradeSelect = document.getElementById('grade-select');
    gradeSelect.innerHTML = '<option value="">-- Select Grade --</option>';
    
    if (level && gameState.levels[level]) {
        const grades = gameState.levels[level].grades;
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            let gradeName = `Grade ${grade}`;
            if (level === '2' || level === '3') {
                gradeName = `Secondary ${grade}`;
            }
            option.textContent = gradeName;
            gradeSelect.appendChild(option);
        });
        gradeSelect.disabled = false;
    } else {
        gradeSelect.disabled = true;
    }
}

function updateChapterOptions() {
    const level = document.getElementById('level-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    
    chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
    
    if (level && grade) {
        // Generate chapters 1-20
        for (let i = 1; i <= 20; i++) {
            const option = document.createElement('option');
            option.value = i.toString().padStart(2, '0');
            option.textContent = `Chapter ${i}`;
            chapterSelect.appendChild(option);
        }
        chapterSelect.disabled = false;
    } else {
        chapterSelect.disabled = true;
    }
}

function updateWorksheetOptions() {
    const level = document.getElementById('level-select').value;
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapter = document.getElementById('chapter-select').value;
    const worksheetSelect = document.getElementById('worksheet-select');
    
    worksheetSelect.innerHTML = '<option value="">-- Select Worksheet --</option>';
    
    if (level && subject && grade && chapter) {
        // Generate worksheet options 1-3 for the selected chapter
        for (let i = 1; i <= 3; i++) {
            const worksheetCode = `${level}${subject}${grade}${chapter}${i}`;
            const option = document.createElement('option');
            option.value = worksheetCode;
            option.textContent = `Worksheet ${i}`;
            worksheetSelect.appendChild(option);
        }
        worksheetSelect.disabled = false;
    } else {
        worksheetSelect.disabled = true;
    }
}

function updateWorksheetInfo() {
    const infoDiv = document.getElementById('selected-worksheet-info');
    const detailsP = document.getElementById('worksheet-details');
    
    if (gameState.selectedWorksheet) {
        const worksheetCode = gameState.selectedWorksheet;
        const levelCode = worksheetCode.charAt(0);
        const subjectCode = worksheetCode.charAt(1);
        const grade = worksheetCode.charAt(2);
        const chapter = parseInt(worksheetCode.substring(3, 5));
        const worksheetNum = worksheetCode.charAt(5);
        
        const levelName = gameState.levels[levelCode]?.name || 'Unknown Level';
        const subjectName = gameState.subjects[subjectCode]?.name || 'Unknown Subject';
        
        let gradeName = `Grade ${grade}`;
        if (levelCode === '2' || levelCode === '3') {
            gradeName = `Secondary ${grade}`;
        }
        
        detailsP.innerHTML = `
            <strong>${subjectName}</strong><br>
            ${levelName} - ${gradeName}<br>
            Chapter ${chapter}, Worksheet ${worksheetNum}<br>
            <small>Worksheet ID: ${worksheetCode}</small>
        `;
        infoDiv.style.display = 'block';
    } else {
        infoDiv.style.display = 'none';
    }
}

async function loadWorksheetData() {
    if (!gameState.selectedWorksheet) {
        alert("Please select a worksheet first!");
        return;
    }
    
    // Show loading state
    const startBtn = document.getElementById('start-game-btn');
    const originalText = startBtn.innerHTML;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    startBtn.disabled = true;
    
    try {
        // For GitHub Pages, try to load from actual file
        const success = await loadWorksheetFromFile();
        
        if (!success) {
            // Fall back to demo data
            console.log("Using demo worksheet data");
            await loadDemoWorksheet();
        }
        
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
        alert("Error loading worksheet. Using demo questions instead.");
        await loadDemoWorksheet();
        showScreen('powerup');
    } finally {
        startBtn.innerHTML = originalText;
        startBtn.disabled = false;
    }
}

async function loadWorksheetFromFile() {
    const worksheetCode = gameState.selectedWorksheet;
    const levelCode = worksheetCode.charAt(0);
    const subjectCode = worksheetCode.charAt(1);
    
    const levelFolder = gameState.levels[levelCode]?.folder;
    const subjectFolder = gameState.subjects[subjectCode]?.folder;
    
    if (!levelFolder || !subjectFolder) {
        console.error("Invalid worksheet code");
        return false;
    }
    
    // Construct the file path based on your structure
    const filePath = `data/${levelFolder}/${subjectFolder}/${worksheetCode}.json`;
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        const worksheetData = await response.json();
        
        // Convert to game format
        gameState.questions = worksheetData.questions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options.map((opt, index) => ({
                id: String.fromCharCode(65 + index), // A, B, C, D
                text: opt
            })),
            correctAnswer: String.fromCharCode(65 + q.correctAnswer),
            points: q.points || 10,
            explanation: q.explanation || "No explanation provided."
        }));
        
        console.log(`Successfully loaded worksheet: ${worksheetData.title}`);
        
        // Store worksheet metadata for display
        gameState.currentWorksheetData = worksheetData;
        
        return true;
        
    } catch (error) {
        console.log(`Could not load ${filePath}:`, error.message);
        return false;
    }
}

async function loadDemoWorksheet() {
    // Create simple demo questions
    gameState.questions = [
        {
            id: 1,
            text: "What is 5 + 7?",
            options: [
                { id: 'A', text: "10" },
                { id: 'B', text: "11" },
                { id: 'C', text: "12" },
                { id: 'D', text: "13" }
            ],
            correctAnswer: 'C',
            points: 5,
            explanation: "5 + 7 = 12"
        },
        {
            id: 2,
            text: "What is the capital of France?",
            options: [
                { id: 'A', text: "London" },
                { id: 'B', text: "Berlin" },
                { id: 'C', text: "Paris" },
                { id: 'D', text: "Madrid" }
            ],
            correctAnswer: 'C',
            points: 5,
            explanation: "Paris is the capital of France"
        },
        {
            id: 3,
            text: "What is H₂O?",
            options: [
                { id: 'A', text: "Oxygen" },
                { id: 'B', text: "Hydrogen" },
                { id: 'C', text: "Carbon Dioxide" },
                { id: 'D', text: "Water" }
            ],
            correctAnswer: 'D',
            points: 5,
            explanation: "H₂O is the chemical formula for water"
        }
    ];
    
    gameState.currentWorksheetData = {
        title: "Demo Worksheet",
        subject: "General Knowledge"
    };
    
    console.log("Using demo worksheet with", gameState.questions.length, "questions");
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
    const worksheetData = gameState.currentWorksheetData;
    document.getElementById('current-worksheet-name').textContent = worksheetData?.title || "Worksheet Challenge";
    document.getElementById('results-worksheet-name').textContent = worksheetData?.title || "Worksheet Challenge";
    
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
    // Clear any existing timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
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
    document.getElementById('submit-answer-btn').style.display = 'block';
    document.getElementById('next-question-btn').style.display = 'none';
    
    // Reset timer
    gameState.timeRemaining = 30;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    // Start timer
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
        submitAnswer(true); // Auto-submit when time runs out
    }
}

function submitAnswer(isTimeout = false) {
    // Stop the timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = !isTimeout && gameState.selectedOption === question.correctAnswer;
    const currentPlayer = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    
    // Mark player as having answered
    currentPlayer.hasAnswered = true;
    
    // Give points if correct
    if (isCorrect) {
        currentPlayer.score += question.points;
        console.log(`Player ${gameState.currentPlayer} scored ${question.points} points! Total: ${currentPlayer.score}`);
        
        // Update score display immediately
        if (gameState.currentPlayer === 1) {
            document.getElementById('player1-score').textContent = gameState.player1.score;
        } else {
            document.getElementById('player2-score').textContent = gameState.player2.score;
        }
    }
    
    // Show feedback
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none'; // Disable further clicks
        
        if (opt.dataset.optionId === question.correctAnswer) {
            // Highlight correct answer in green
            opt.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
            opt.style.borderColor = '#4caf50';
        } else if (opt.dataset.optionId === gameState.selectedOption && !isCorrect && !isTimeout) {
            // Highlight wrong answer in red (if user selected wrong answer)
            opt.style.backgroundColor = 'rgba(244, 67, 54, 0.3)';
            opt.style.borderColor = '#f44336';
        }
    });
    
    // Show "Next Question" button immediately
    document.getElementById('submit-answer-btn').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'block';
    
    // If timeout, also show which was the correct answer
    if (isTimeout) {
        const correctOption = document.querySelector(`.option[data-option-id="${question.correctAnswer}"]`);
        if (correctOption) {
            correctOption.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
            correctOption.style.borderColor = '#4caf50';
        }
    }
}

function nextQuestion() {
    // Clear timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Check if both players have answered
    if (gameState.player1.hasAnswered && gameState.player2.hasAnswered) {
        // Both players answered this question
        gameState.currentQuestion++;
        
        // Check if we've reached the end
        if (gameState.currentQuestion >= gameState.questions.length) {
            endGame();
            return;
        }
        
        // Reset for next question
        gameState.player1.hasAnswered = false;
        gameState.player2.hasAnswered = false;
        gameState.currentPlayer = Math.random() < 0.5 ? 1 : 2;
        
        // Load next question
        loadQuestion();
    } else {
        // Switch to other player for same question
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        loadQuestionForOtherPlayer();
    }
}

function loadQuestionForOtherPlayer() {
    // Clear timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Load the same question for the other player
    const question = gameState.questions[gameState.currentQuestion];
    
    // Update current turn indicator
    document.getElementById('player1-turn-indicator').style.display = gameState.currentPlayer === 1 ? 'block' : 'none';
    document.getElementById('player2-turn-indicator').style.display = gameState.currentPlayer === 2 ? 'block' : 'none';
    
    // Update player status active class
    document.getElementById('player1-status').classList.toggle('active', gameState.currentPlayer === 1);
    document.getElementById('player2-status').classList.toggle('active', gameState.currentPlayer === 2);
    
    // Reset option selection for new player
    gameState.selectedOption = null;
    
    // Reset options styling but keep correct/wrong answers visible
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.classList.remove('selected');
        opt.style.pointerEvents = 'auto'; // Re-enable clicks
        
        // Only reset border color, keep background color for feedback
        const currentBg = opt.style.backgroundColor;
        if (!currentBg.includes('76, 175, 80') && !currentBg.includes('244, 67, 54')) {
            // If not green (correct) or red (wrong), reset styling
            opt.style.backgroundColor = '';
            opt.style.borderColor = '';
        }
    });
    
    // Reset UI elements
    document.getElementById('submit-answer-btn').disabled = true;
    document.getElementById('submit-answer-btn').style.display = 'block';
    document.getElementById('next-question-btn').style.display = 'none';
    
    // Reset timer
    gameState.timeRemaining = 30;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    // Start timer
    gameState.timer = setInterval(updateTimer, 1000);
}

function endGame() {
    // Clear timer
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
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
    gameState.selectedWorksheet = null;
    gameState.currentWorksheetData = null;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Reset form
    document.getElementById('player1-name').value = "Player 1";
    document.getElementById('player2-name').value = "Player 2";
    document.getElementById('level-select').value = "";
    document.getElementById('subject-select').value = "";
    document.getElementById('grade-select').value = "";
    document.getElementById('grade-select').disabled = true;
    document.getElementById('chapter-select').value = "";
    document.getElementById('chapter-select').disabled = true;
    document.getElementById('worksheet-select').value = "";
    document.getElementById('worksheet-select').disabled = true;
    document.getElementById('selected-worksheet-info').style.display = 'none';
    document.getElementById('start-game-btn').disabled = true;
    document.getElementById('start-game-btn').innerHTML = '<i class="fas fa-play"></i> Start Game';
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