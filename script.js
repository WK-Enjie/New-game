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
    worksheetStructure: {
        levels: {
            "primary": { name: "Primary School", subjects: ["math", "science"] },
            "lower-secondary": { name: "Lower Secondary", subjects: ["math", "science"] },
            "upper-secondary": { name: "Upper Secondary", subjects: ["math", "combined-physics", "pure-physics", "combined-chemistry", "pure-chemistry"] }
        },
        subjectCodes: {
            "math": 0,
            "science": 1,
            "combined-physics": 2,
            "pure-physics": 3,
            "combined-chemistry": 4,
            "pure-chemistry": 5
        },
        grades: {
            "primary": ["1", "2", "3", "4", "5", "6"],
            "lower-secondary": ["1", "2"],
            "upper-secondary": ["3", "4"]
        }
    },
    selectedWorksheet: null
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
    loadWorksheetOptions();
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
    });
    
    // Subject selection
    document.getElementById('subject-select').addEventListener('change', () => {
        updateChapterOptions();
    });
    
    // Grade selection
    document.getElementById('grade-select').addEventListener('change', () => {
        updateChapterOptions();
    });
    
    // Chapter selection
    document.getElementById('chapter-select').addEventListener('change', () => {
        updateWorksheetOptions();
    });
    
    // Worksheet selection
    document.getElementById('worksheet-select').addEventListener('change', (e) => {
        const worksheetId = e.target.value;
        if (worksheetId) {
            gameState.selectedWorksheet = worksheetId;
            document.getElementById('start-game-btn').disabled = false;
            updateWorksheetInfo(worksheetId);
        } else {
            document.getElementById('start-game-btn').disabled = true;
        }
    });
    
    // Start game button
    document.getElementById('start-game-btn').addEventListener('click', () => {
        loadWorksheetData();
    });
    
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

function loadWorksheetOptions() {
    // This function would normally load from a server
    // For GitHub Pages, we'll simulate the structure
    console.log("Worksheet structure loaded");
}

function updateSubjectOptions(level) {
    const subjectSelect = document.getElementById('subject-select');
    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    
    if (level && gameState.worksheetStructure.levels[level]) {
        const subjects = gameState.worksheetStructure.levels[level].subjects;
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = formatSubjectName(subject);
            subjectSelect.appendChild(option);
        });
        subjectSelect.disabled = false;
    } else {
        subjectSelect.disabled = true;
    }
    
    // Reset dependent selects
    document.getElementById('grade-select').disabled = true;
    document.getElementById('chapter-select').disabled = true;
    document.getElementById('worksheet-select').disabled = true;
    document.getElementById('grade-select').innerHTML = '<option value="">-- Select Grade --</option>';
    document.getElementById('chapter-select').innerHTML = '<option value="">-- Select Chapter --</option>';
    document.getElementById('worksheet-select').innerHTML = '<option value="">-- Select Worksheet --</option>';
}

function updateGradeOptions(level) {
    const gradeSelect = document.getElementById('grade-select');
    gradeSelect.innerHTML = '<option value="">-- Select Grade --</option>';
    
    if (level && gameState.worksheetStructure.grades[level]) {
        const grades = gameState.worksheetStructure.grades[level];
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            option.textContent = formatGradeName(level, grade);
            gradeSelect.appendChild(option);
        });
        gradeSelect.disabled = false;
    } else {
        gradeSelect.disabled = true;
    }
}

function formatSubjectName(subject) {
    return subject.split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

function formatGradeName(level, grade) {
    if (level === 'primary') {
        return `Primary ${grade}`;
    } else if (level === 'lower-secondary') {
        return `Secondary ${grade}`;
    } else if (level === 'upper-secondary') {
        return `Secondary ${grade}`;
    }
    return grade;
}

function updateChapterOptions() {
    const level = document.getElementById('level-select').value;
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    
    chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
    
    if (level && subject && grade) {
        // Generate chapters 1-20 for demo purposes
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
    
    // Reset worksheet select
    document.getElementById('worksheet-select').disabled = true;
    document.getElementById('worksheet-select').innerHTML = '<option value="">-- Select Worksheet --</option>';
}

function updateWorksheetOptions() {
    const level = document.getElementById('level-select').value;
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapter = document.getElementById('chapter-select').value;
    const worksheetSelect = document.getElementById('worksheet-select');
    
    worksheetSelect.innerHTML = '<option value="">-- Select Worksheet --</option>';
    
    if (level && subject && grade && chapter) {
        // Generate worksheet options based on the file naming convention
        const levelCode = getLevelCode(level);
        const subjectCode = gameState.worksheetStructure.subjectCodes[subject];
        const gradeCode = grade;
        const chapterCode = chapter;
        
        // Generate 1-3 worksheets per chapter for demo
        for (let i = 1; i <= 3; i++) {
            const worksheetCode = `${levelCode}${subjectCode}${gradeCode}${chapterCode}${i}`;
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

function getLevelCode(level) {
    switch(level) {
        case 'primary': return '1';
        case 'lower-secondary': return '2';
        case 'upper-secondary': return '3';
        default: return '0';
    }
}

function updateWorksheetInfo(worksheetId) {
    const infoDiv = document.getElementById('selected-worksheet-info');
    const detailsP = document.getElementById('worksheet-details');
    
    // Parse the worksheet ID
    const levelCode = worksheetId.charAt(0);
    const subjectCode = worksheetId.charAt(1);
    const grade = worksheetId.charAt(2);
    const chapter = parseInt(worksheetId.substring(3, 5));
    const worksheetNum = worksheetId.charAt(5);
    
    let levelName, subjectName;
    
    switch(levelCode) {
        case '1': levelName = "Primary School"; break;
        case '2': levelName = "Lower Secondary"; break;
        case '3': levelName = "Upper Secondary"; break;
        default: levelName = "Unknown Level";
    }
    
    // Find subject name from code
    const subjects = gameState.worksheetStructure.subjectCodes;
    for (const [name, code] of Object.entries(subjects)) {
        if (code == subjectCode) {
            subjectName = formatSubjectName(name);
            break;
        }
    }
    
    detailsP.innerHTML = `
        <strong>${subjectName}</strong><br>
        ${levelName} - Grade ${grade}<br>
        Chapter ${chapter}, Worksheet ${worksheetNum}<br>
        <small>ID: ${worksheetId}</small>
    `;
    
    infoDiv.style.display = 'block';
}

async function loadWorksheetData() {
    const worksheetId = gameState.selectedWorksheet;
    
    if (!worksheetId) {
        alert("Please select a worksheet first!");
        return;
    }
    
    // Show loading state
    const startBtn = document.getElementById('start-game-btn');
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    startBtn.disabled = true;
    
    try {
        // For GitHub Pages, we'll use sample data since we can't access server files directly
        // In a real implementation, you would fetch from: `data/${level}/${subject}/${worksheetId}.json`
        await simulateWorksheetLoad(worksheetId);
        
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
        alert("Error loading worksheet data. Using sample questions instead.");
        createSampleQuestions();
        showScreen('powerup');
    } finally {
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
        startBtn.disabled = false;
    }
}

async function simulateWorksheetLoad(worksheetId) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create sample questions based on worksheet ID
    const levelCode = worksheetId.charAt(0);
    const subjectCode = worksheetId.charAt(1);
    const grade = worksheetId.charAt(2);
    const chapter = parseInt(worksheetId.substring(3, 5));
    
    let subjectName = "Mathematics";
    if (subjectCode == '1') subjectName = "Science";
    else if (subjectCode == '2') subjectName = "Combined Physics";
    else if (subjectCode == '3') subjectName = "Pure Physics";
    else if (subjectCode == '4') subjectName = "Combined Chemistry";
    else if (subjectCode == '5') subjectName = "Pure Chemistry";
    
    // Generate sample questions
    gameState.questions = [];
    const questionCount = 5; // Reduced for demo
    
    for (let i = 1; i <= questionCount; i++) {
        gameState.questions.push({
            id: i,
            text: `${subjectName} Chapter ${chapter}, Question ${i}: What is the correct answer?`,
            options: [
                { id: 'A', text: "Option A" },
                { id: 'B', text: "Option B" },
                { id: 'C', text: "Option C" },
                { id: 'D', text: "Option D" }
            ],
            correctAnswer: ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)],
            points: 10,
            explanation: "This is the correct answer because..."
        });
    }
    
    console.log(`Loaded worksheet ${worksheetId} with ${questionCount} questions`);
}

function createSampleQuestions() {
    // Create 5 sample questions for demo
    gameState.questions = [
        {
            id: 1,
            text: "What is 15 + 27?",
            options: [
                { id: 'A', text: "32" },
                { id: 'B', text: "42" },
                { id: 'C', text: "52" },
                { id: 'D', text: "62" }
            ],
            correctAnswer: 'B',
            points: 10,
            explanation: "15 + 27 = 42"
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
            points: 10,
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
            points: 15,
            explanation: "H₂O is the chemical formula for water"
        },
        {
            id: 4,
            text: "Solve: 3x + 5 = 20",
            options: [
                { id: 'A', text: "x = 3" },
                { id: 'B', text: "x = 5" },
                { id: 'C', text: "x = 7" },
                { id: 'D', text: "x = 9" }
            ],
            correctAnswer: 'B',
            points: 15,
            explanation: "3x = 15, so x = 5"
        },
        {
            id: 5,
            text: "What planet is known as the Red Planet?",
            options: [
                { id: 'A', text: "Venus" },
                { id: 'B', text: "Mars" },
                { id: 'C', text: "Jupiter" },
                { id: 'D', text: "Saturn" }
            ],
            correctAnswer: 'B',
            points: 10,
            explanation: "Mars is known as the Red Planet due to iron oxide on its surface"
        }
    ];
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
    const worksheetId = gameState.selectedWorksheet;
    const levelCode = worksheetId.charAt(0);
    const subjectCode = worksheetId.charAt(1);
    const grade = worksheetId.charAt(2);
    const chapter = parseInt(worksheetId.substring(3, 5));
    const worksheetNum = worksheetId.charAt(5);
    
    let subjectName = "Mathematics";
    if (subjectCode == '1') subjectName = "Science";
    else if (subjectCode == '2') subjectName = "Combined Physics";
    else if (subjectCode == '3') subjectName = "Pure Physics";
    else if (subjectCode == '4') subjectName = "Combined Chemistry";
    else if (subjectCode == '5') subjectName = "Pure Chemistry";
    
    document.getElementById('current-worksheet-name').textContent = 
        `${subjectName} - Chapter ${chapter}, Worksheet ${worksheetNum}`;
    
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
    
    // Update worksheet name
    const worksheetId = gameState.selectedWorksheet;
    const subjectCode = worksheetId.charAt(1);
    const chapter = parseInt(worksheetId.substring(3, 5));
    const worksheetNum = worksheetId.charAt(5);
    
    let subjectName = "Mathematics";
    if (subjectCode == '1') subjectName = "Science";
    else if (subjectCode == '2') subjectName = "Combined Physics";
    else if (subjectCode == '3') subjectName = "Pure Physics";
    else if (subjectCode == '4') subjectName = "Combined Chemistry";
    else if (subjectCode == '5') subjectName = "Pure Chemistry";
    
    document.getElementById('results-worksheet-name').textContent = 
        `${subjectName} - Chapter ${chapter}, Worksheet ${worksheetNum}`;
    
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
    gameState.selectedWorksheet = null;
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    // Reset form
    document.getElementById('player1-name').value = "Player 1";
    document.getElementById('player2-name').value = "Player 2";
    document.getElementById('level-select').value = "";
    document.getElementById('subject-select').innerHTML = '<option value="">-- Select Subject --</option>';
    document.getElementById('subject-select').disabled = true;
    document.getElementById('grade-select').innerHTML = '<option value="">-- Select Grade --</option>';
    document.getElementById('grade-select').disabled = true;
    document.getElementById('chapter-select').innerHTML = '<option value="">-- Select Chapter --</option>';
    document.getElementById('chapter-select').disabled = true;
    document.getElementById('worksheet-select').innerHTML = '<option value="">-- Select Worksheet --</option>';
    document.getElementById('worksheet-select').disabled = true;
    document.getElementById('selected-worksheet-info').style.display = 'none';
    document.getElementById('start-game-btn').disabled = true;
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