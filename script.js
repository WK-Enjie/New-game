// Game State
const gameState = {
    player1: {
        name: "Player 1",
        score: 0,
        powerup1: null,
        powerup2: null,
        appliedPowerup: null
    },
    player2: {
        name: "Player 2",
        score: 0,
        powerup1: null,
        powerup2: null,
        appliedPowerup: null
    },
    currentPlayer: 1,
    currentQuestion: 0,
    questions: [],
    selectedOption: null,
    timer: null,
    timeRemaining: 30,
    startTime: null,
    selectedWorksheet: null,
    
    levels: {
        '1': { name: 'Primary School', folder: 'primary', grades: ['1', '2', '3', '4', '5', '6'] },
        '2': { name: 'Lower Secondary', folder: 'lower-secondary', grades: ['1', '2'] },
        '3': { name: 'Upper Secondary', folder: 'upper-secondary', grades: ['3', '4'] }
    },
    
    // All subjects in the system
    allSubjects: {
        '0': { name: 'Mathematics', folder: 'math' },
        '1': { name: 'Science', folder: 'science' },
        '2': { name: 'Combined Physics', folder: 'combined-physics' },
        '3': { name: 'Pure Physics', folder: 'pure-physics' },
        '4': { name: 'Combined Chemistry', folder: 'combined-chemistry' },
        '5': { name: 'Pure Chemistry', folder: 'pure-chemistry' }
    },
    
    // Subjects available by level
    subjectsByLevel: {
        '1': ['0', '1'],  // Primary School: Math (0), Science (1)
        '2': ['0', '1', '2', '4'],  // Lower Secondary: Math, Science, Combined Physics, Combined Chemistry
        '3': ['0', '2', '3', '4', '5']  // Upper Secondary: Math, Combined Physics, Pure Physics, Combined Chemistry, Pure Chemistry
    },
    
    availableChapters: [],
    availableWorksheets: []
};

// Power-ups configuration
const powerUps = {
    double: { name: "Double Points", multiplier: 2, icon: "fas fa-times-circle" },
    halve: { name: "Halve Points", multiplier: 0.5, icon: "fas fa-divide" },
    increase30: { name: "+30% Points", multiplier: 1.3, icon: "fas fa-arrow-up" },
    decrease30: { name: "-30% Points", multiplier: 0.7, icon: "fas fa-arrow-down" },
    switch: { name: "Switch Scores", multiplier: 0, icon: "fas fa-exchange-alt" },
    steal50: { name: "Steal 50%", multiplier: 0, icon: "fas fa-hand-holding-usd" }
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
    document.getElementById('level-select').addEventListener('change', async (e) => {
        const level = e.target.value;
        updateSubjectOptions(level);
        await updateGradeOptions(level);
        updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Subject selection
    document.getElementById('subject-select').addEventListener('change', async () => {
        await updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Grade selection
    document.getElementById('grade-select').addEventListener('change', async () => {
        await updateChapterOptions();
        updateWorksheetOptions();
    });
    
    // Chapter selection
    document.getElementById('chapter-select').addEventListener('change', async () => {
        await updateWorksheetOptions();
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
    
    // View subject list button
    document.getElementById('view-subject-list-btn').addEventListener('click', showSubjectList);
    
    // Power-up selection buttons
    document.querySelectorAll('.select-powerup-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const button = e.target.closest('.select-powerup-btn');
            const player = parseInt(button.dataset.player);
            const slot = parseInt(button.dataset.slot);
            selectRandomPowerup(player, slot);
        });
    });
    
    // Clear powerups buttons
    document.querySelectorAll('.clear-powerups-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const player = parseInt(e.target.closest('.clear-powerups-btn').dataset.player);
            clearPlayerPowerups(player);
        });
    });
    
    // Start quiz button
    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    
    // Back to setup button
    document.getElementById('back-to-setup-btn').addEventListener('click', () => {
        showScreen('setup');
    });
    
    // Quiz controls
    document.getElementById('submit-answer-btn').addEventListener('click', () => {
        submitAnswer(false);
    });
    document.getElementById('next-question-btn').addEventListener('click', nextQuestion);
    
    // Results screen buttons
    document.getElementById('play-again-btn').addEventListener('click', playAgain);
    document.getElementById('new-worksheet-btn').addEventListener('click', () => {
        resetGame();
        showScreen('setup');
    });
    
    // Contents buttons
    document.getElementById('view-contents-btn').addEventListener('click', showWorksheetContents);
    document.getElementById('hide-contents-btn').addEventListener('click', hideWorksheetContents);
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
}

function updateSubjectOptions(level) {
    const subjectSelect = document.getElementById('subject-select');
    
    if (!level) {
        subjectSelect.disabled = true;
        subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
        return;
    }
    
    // Clear existing options
    subjectSelect.innerHTML = '<option value="">-- Select Subject --</option>';
    
    // Get subjects available for this level
    const availableSubjectCodes = gameState.subjectsByLevel[level] || [];
    
    if (availableSubjectCodes.length === 0) {
        subjectSelect.disabled = true;
        const option = document.createElement('option');
        option.value = "";
        option.textContent = "No subjects available for this level";
        subjectSelect.appendChild(option);
        return;
    }
    
    // Populate with available subjects
    availableSubjectCodes.forEach(code => {
        const subject = gameState.allSubjects[code];
        if (subject) {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = subject.name;
            subjectSelect.appendChild(option);
        }
    });
    
    subjectSelect.disabled = false;
}

function showSubjectList() {
    const levelSelect = document.getElementById('level-select');
    const level = levelSelect.value;
    
    if (!level) {
        alert("Please select an education level first!");
        return;
    }
    
    const levelName = gameState.levels[level].name;
    const availableSubjectCodes = gameState.subjectsByLevel[level] || [];
    
    if (availableSubjectCodes.length === 0) {
        alert(`No subjects available for ${levelName}.`);
        return;
    }
    
    let subjectList = `Available subjects for ${levelName}:\n\n`;
    
    // Show available subjects with their codes
    availableSubjectCodes.forEach(code => {
        const subject = gameState.allSubjects[code];
        if (subject) {
            subjectList += `${code}: ${subject.name}\n`;
        }
    });
    
    // Show unavailable subjects (for reference)
    const allSubjectCodes = Object.keys(gameState.allSubjects);
    const unavailableSubjects = allSubjectCodes.filter(code => !availableSubjectCodes.includes(code));
    
    if (unavailableSubjects.length > 0) {
        subjectList += "\nNot available for this level:\n";
        unavailableSubjects.forEach(code => {
            const subject = gameState.allSubjects[code];
            if (subject) {
                subjectList += `${code}: ${subject.name}\n`;
            }
        });
    }
    
    alert(subjectList);
}

async function updateGradeOptions(level) {
    const gradeSelect = document.getElementById('grade-select');
    gradeSelect.innerHTML = '<option value="">-- Select Grade --</option>';
    
    if (level && gameState.levels[level]) {
        const grades = gameState.levels[level].grades;
        grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade;
            let gradeName = `Primary ${grade}`;
            if (level === '2') {
                gradeName = `Secondary ${grade}`;
            } else if (level === '3') {
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

async function updateChapterOptions() {
    const level = document.getElementById('level-select').value;
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapterSelect = document.getElementById('chapter-select');
    
    chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
    chapterSelect.disabled = true;
    
    if (level && subject && grade) {
        // Show loading indicator
        chapterSelect.innerHTML = '<option value="">Scanning for chapters...</option>';
        
        // Find available chapters for this grade and subject
        const availableChapters = await findAvailableChapters(level, subject, grade);
        
        // Clear loading message
        chapterSelect.innerHTML = '<option value="">-- Select Chapter --</option>';
        
        if (availableChapters.length > 0) {
            availableChapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = `Chapter ${parseInt(chapter)}`;
                chapterSelect.appendChild(option);
            });
            chapterSelect.disabled = false;
            
            gameState.availableChapters = availableChapters;
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No chapters available for this subject/grade";
            chapterSelect.appendChild(option);
            chapterSelect.disabled = true;
        }
    }
}

async function findAvailableChapters(level, subject, grade) {
    const availableChapters = [];
    
    for (let chapterNum = 1; chapterNum <= 20; chapterNum++) {
        const chapterCode = chapterNum.toString().padStart(2, '0');
        const hasWorksheets = await checkIfChapterHasWorksheets(level, subject, grade, chapterCode);
        
        if (hasWorksheets) {
            availableChapters.push(chapterCode);
        }
    }
    
    return availableChapters;
}

async function checkIfChapterHasWorksheets(level, subject, grade, chapter) {
    for (let worksheetNum = 1; worksheetNum <= 3; worksheetNum++) {
        const worksheetCode = `${level}${subject}${grade}${chapter}${worksheetNum}`;
        const fileExists = await checkIfWorksheetExists(worksheetCode);
        
        if (fileExists) {
            return true;
        }
    }
    return false;
}

async function updateWorksheetOptions() {
    const level = document.getElementById('level-select').value;
    const subject = document.getElementById('subject-select').value;
    const grade = document.getElementById('grade-select').value;
    const chapter = document.getElementById('chapter-select').value;
    const worksheetSelect = document.getElementById('worksheet-select');
    
    worksheetSelect.innerHTML = '<option value="">-- Select Worksheet --</option>';
    worksheetSelect.disabled = true;
    
    if (level && subject && grade && chapter) {
        worksheetSelect.innerHTML = '<option value="">Scanning for worksheets...</option>';
        
        const availableWorksheets = await findAvailableWorksheets(level, subject, grade, chapter);
        
        worksheetSelect.innerHTML = '<option value="">-- Select Worksheet --</option>';
        
        if (availableWorksheets.length > 0) {
            availableWorksheets.forEach(worksheetCode => {
                const worksheetNum = worksheetCode.charAt(5);
                const option = document.createElement('option');
                option.value = worksheetCode;
                option.textContent = `Worksheet ${worksheetNum}`;
                worksheetSelect.appendChild(option);
            });
            worksheetSelect.disabled = false;
            
            gameState.availableWorksheets = availableWorksheets;
        } else {
            const option = document.createElement('option');
            option.value = "";
            option.textContent = "No worksheets available for this chapter";
            worksheetSelect.appendChild(option);
            worksheetSelect.disabled = true;
        }
    }
}

async function findAvailableWorksheets(level, subject, grade, chapter) {
    const availableWorksheets = [];
    
    for (let worksheetNum = 1; worksheetNum <= 3; worksheetNum++) {
        const worksheetCode = `${level}${subject}${grade}${chapter}${worksheetNum}`;
        const fileExists = await checkIfWorksheetExists(worksheetCode);
        
        if (fileExists) {
            availableWorksheets.push(worksheetCode);
        }
    }
    
    return availableWorksheets;
}

async function checkIfWorksheetExists(worksheetCode) {
    const levelCode = worksheetCode.charAt(0);
    const subjectCode = worksheetCode.charAt(1);
    
    const levelFolder = gameState.levels[levelCode]?.folder;
    const subject = gameState.allSubjects[subjectCode];
    
    if (!levelFolder || !subject) {
        console.log(`Invalid level or subject code: Level ${levelCode}, Subject ${subjectCode}`);
        return false;
    }
    
    const filePath = `data/${levelFolder}/${subject.folder}/${worksheetCode}.json`;
    
    console.log(`Checking for worksheet: ${filePath}`);
    
    try {
        const response = await fetch(filePath, { method: 'HEAD' });
        if (response.ok) {
            console.log(`Worksheet found: ${filePath}`);
            return true;
        } else {
            console.log(`Worksheet not found (HTTP ${response.status}): ${filePath}`);
            return false;
        }
    } catch (error) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                console.log(`Worksheet found (GET fallback): ${filePath}`);
                return true;
            } else {
                console.log(`Worksheet not found (GET HTTP ${response.status}): ${filePath}`);
                return false;
            }
        } catch (e) {
            console.log(`Error checking worksheet: ${filePath}`, e.message);
            return false;
        }
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
        const subject = gameState.allSubjects[subjectCode];
        const subjectName = subject?.name || 'Unknown Subject';
        
        let gradeName = `Primary ${grade}`;
        if (levelCode === '2') {
            gradeName = `Secondary ${grade}`;
        } else if (levelCode === '3') {
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
    
    const worksheetExists = await checkIfWorksheetExists(gameState.selectedWorksheet);
    if (!worksheetExists) {
        alert("This worksheet is no longer available. Please select another worksheet.");
        resetWorksheetSelection();
        return;
    }
    
    const startBtn = document.getElementById('start-game-btn');
    const originalText = startBtn.innerHTML;
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    startBtn.disabled = true;
    
    try {
        const success = await loadWorksheetFromFile();
        
        if (!success) {
            throw new Error("Failed to load worksheet");
        }
        
        document.getElementById('player1-display').textContent = gameState.player1.name;
        document.getElementById('player2-display').textContent = gameState.player2.name;
        
        clearPlayerPowerups(1);
        clearPlayerPowerups(2);
        
        showScreen('powerup');
        
    } catch (error) {
        console.error("Error loading worksheet:", error);
        alert(`Error loading worksheet: ${error.message}. Please try another worksheet.`);
        resetWorksheetSelection();
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
    const subject = gameState.allSubjects[subjectCode];
    
    if (!levelFolder || !subject) {
        throw new Error("Invalid worksheet code");
    }
    
    const filePath = `data/${levelFolder}/${subject.folder}/${worksheetCode}.json`;
    
    console.log(`Loading worksheet from: ${filePath}`);
    
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Worksheet not found at ${filePath}`);
        }
        
        const worksheetData = await response.json();
        
        if (!worksheetData.questions || !Array.isArray(worksheetData.questions) || worksheetData.questions.length === 0) {
            throw new Error("Invalid worksheet format: No questions found");
        }
        
        gameState.questions = worksheetData.questions.map(q => ({
            id: q.id,
            text: q.question,
            options: q.options.map((opt, index) => ({
                id: String.fromCharCode(65 + index),
                text: opt
            })),
            correctAnswer: String.fromCharCode(65 + q.correctAnswer),
            points: q.points || 10,
            explanation: q.explanation || "No explanation provided."
        }));
        
        console.log(`Successfully loaded worksheet: ${worksheetData.title || worksheetCode} with ${gameState.questions.length} questions`);
        
        gameState.currentWorksheetData = worksheetData;
        
        return true;
        
    } catch (error) {
        console.log(`Could not load ${filePath}:`, error.message);
        throw error;
    }
}

function resetWorksheetSelection() {
    gameState.selectedWorksheet = null;
    document.getElementById('worksheet-select').value = "";
    document.getElementById('selected-worksheet-info').style.display = 'none';
    document.getElementById('start-game-btn').disabled = true;
}

function selectRandomPowerup(player, slot) {
    const powerupKeys = Object.keys(powerUps);
    const randomPowerupKey = powerupKeys[Math.floor(Math.random() * powerupKeys.length)];
    
    if (player === 1) {
        if (slot === 1) {
            gameState.player1.powerup1 = randomPowerupKey;
        } else {
            gameState.player1.powerup2 = randomPowerupKey;
        }
    } else {
        if (slot === 1) {
            gameState.player2.powerup1 = randomPowerupKey;
        } else {
            gameState.player2.powerup2 = randomPowerupKey;
        }
    }
    
    updatePowerupDisplay(player);
    checkPowerupSelection();
}

function clearPlayerPowerups(player) {
    if (player === 1) {
        gameState.player1.powerup1 = null;
        gameState.player1.powerup2 = null;
    } else {
        gameState.player2.powerup1 = null;
        gameState.player2.powerup2 = null;
    }
    
    updatePowerupDisplay(player);
    checkPowerupSelection();
}

function updatePowerupDisplay(player) {
    const playerData = player === 1 ? gameState.player1 : gameState.player2;
    const playerDiv = document.getElementById(`player${player}-powerup`);
    
    const powerup1Div = playerDiv.querySelector('.selected-powerup:nth-child(1)');
    const powerup2Div = playerDiv.querySelector('.selected-powerup:nth-child(2)');
    
    if (playerData.powerup1) {
        const powerup = powerUps[playerData.powerup1];
        powerup1Div.innerHTML = `
            <div class="has-powerup">
                <i class="${powerup.icon}"></i>
                <span>${powerup.name}</span>
            </div>
        `;
    } else {
        powerup1Div.innerHTML = '<p class="no-powerup">Power-up 1: Not selected</p>';
    }
    
    if (playerData.powerup2) {
        const powerup = powerUps[playerData.powerup2];
        powerup2Div.innerHTML = `
            <div class="has-powerup">
                <i class="${powerup.icon}"></i>
                <span>${powerup.name}</span>
            </div>
        `;
    } else {
        powerup2Div.innerHTML = '<p class="no-powerup">Power-up 2: Not selected</p>';
    }
}

function checkPowerupSelection() {
    const startQuizBtn = document.getElementById('start-quiz-btn');
    const player1Ready = gameState.player1.powerup1 && gameState.player1.powerup2;
    const player2Ready = gameState.player2.powerup1 && gameState.player2.powerup2;
    
    startQuizBtn.disabled = !(player1Ready && player2Ready);
}

function startQuiz() {
    document.getElementById('quiz-player1-name').textContent = gameState.player1.name;
    document.getElementById('quiz-player2-name').textContent = gameState.player2.name;
    
    const player1Powerups = getPlayerPowerupsText(1);
    const player2Powerups = getPlayerPowerupsText(2);
    document.getElementById('player1-powerup-name').textContent = player1Powerups;
    document.getElementById('player2-powerup-name').textContent = player2Powerups;
    
    const worksheetData = gameState.currentWorksheetData;
    document.getElementById('current-worksheet-name').textContent = worksheetData?.title || "Worksheet Challenge";
    document.getElementById('results-worksheet-name').textContent = worksheetData?.title || "Worksheet Challenge";
    
    gameState.currentQuestion = 0;
    gameState.player1.score = 0;
    gameState.player2.score = 0;
    gameState.player1.appliedPowerup = null;
    gameState.player2.appliedPowerup = null;
    gameState.currentPlayer = Math.random() < 0.5 ? 1 : 2;
    gameState.startTime = Date.now();
    
    showScreen('quiz');
    
    loadQuestion();
}

function getPlayerPowerupsText(player) {
    const playerData = player === 1 ? gameState.player1 : gameState.player2;
    const powerups = [];
    
    if (playerData.powerup1) {
        powerups.push(powerUps[playerData.powerup1].name);
    }
    if (playerData.powerup2) {
        powerups.push(powerUps[playerData.powerup2].name);
    }
    
    return powerups.length > 0 ? powerups.join(", ") : "None selected";
}

function loadQuestion() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const question = gameState.questions[gameState.currentQuestion];
    
    if (!question) {
        endGame();
        return;
    }
    
    document.getElementById('current-question').textContent = gameState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = gameState.questions.length;
    
    document.getElementById('question-text').textContent = question.text;
    document.getElementById('question-points').textContent = question.points;
    
    document.getElementById('player1-score').textContent = gameState.player1.score;
    document.getElementById('player2-score').textContent = gameState.player2.score;
    
    document.getElementById('player1-turn-indicator').style.display = gameState.currentPlayer === 1 ? 'block' : 'none';
    document.getElementById('player2-turn-indicator').style.display = gameState.currentPlayer === 2 ? 'block' : 'none';
    
    document.getElementById('player1-status').classList.toggle('active', gameState.currentPlayer === 1);
    document.getElementById('player2-status').classList.toggle('active', gameState.currentPlayer === 2);
    
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
    
    gameState.selectedOption = null;
    document.getElementById('submit-answer-btn').disabled = true;
    document.getElementById('submit-answer-btn').style.display = 'block';
    document.getElementById('next-question-btn').style.display = 'none';
    
    gameState.timeRemaining = 30;
    document.getElementById('time-remaining').textContent = gameState.timeRemaining;
    
    gameState.timer = setInterval(updateTimer, 1000);
}

function selectOption(optionId) {
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
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
        submitAnswer(true);
    }
}

function submitAnswer(isTimeout = false) {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    const question = gameState.questions[gameState.currentQuestion];
    const isCorrect = !isTimeout && gameState.selectedOption === question.correctAnswer;
    const currentPlayer = gameState.currentPlayer === 1 ? gameState.player1 : gameState.player2;
    
    if (isCorrect) {
        currentPlayer.score += question.points;
        
        console.log(`Player ${gameState.currentPlayer} answered correctly! Scored ${question.points} points. Total: ${currentPlayer.score}`);
        
        if (gameState.currentPlayer === 1) {
            document.getElementById('player1-score').textContent = gameState.player1.score;
        } else {
            document.getElementById('player2-score').textContent = gameState.player2.score;
        }
    } else {
        console.log(`Player ${gameState.currentPlayer} answered incorrectly.`);
    }
    
    const options = document.querySelectorAll('.option');
    options.forEach(opt => {
        opt.style.pointerEvents = 'none';
        
        if (opt.dataset.optionId === gameState.selectedOption) {
            if (isCorrect) {
                opt.style.backgroundColor = 'rgba(76, 175, 80, 0.3)';
                opt.style.borderColor = '#4caf50';
            } else if (!isTimeout) {
                opt.style.backgroundColor = 'rgba(244, 67, 54, 0.3)';
                opt.style.borderColor = '#f44336';
            }
        }
    });
    
    document.getElementById('submit-answer-btn').style.display = 'none';
    document.getElementById('next-question-btn').style.display = 'block';
    
    const nextButton = document.getElementById('next-question-btn');
    nextButton.innerHTML = '<i class="fas fa-forward"></i> Next Question';
    
    if (isTimeout) {
        console.log(`Player ${gameState.currentPlayer} ran out of time.`);
    }
}

function nextQuestion() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    gameState.currentQuestion++;
    
    if (gameState.currentQuestion >= gameState.questions.length) {
        endGame();
        return;
    }
    
    gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    
    loadQuestion();
}

function endGame() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
    selectRandomPowerupToApply();
    
    let player1FinalScore = gameState.player1.score;
    let player2FinalScore = gameState.player2.score;
    
    const player1RawScore = player1FinalScore;
    const player2RawScore = player2FinalScore;
    
    let winner = player1RawScore > player2RawScore ? 1 : 
                 player2RawScore > player1RawScore ? 2 : 0;
    
    if (winner === 1 && gameState.player1.appliedPowerup) {
        player1FinalScore = applyPowerup(
            gameState.player1.appliedPowerup, 
            player1FinalScore, 
            player2FinalScore, 
            true
        );
    } else if (winner === 2 && gameState.player2.appliedPowerup) {
        player2FinalScore = applyPowerup(
            gameState.player2.appliedPowerup, 
            player2FinalScore, 
            player1FinalScore, 
            false
        );
    } else if (winner === 0) {
        player1FinalScore = player1RawScore;
        player2FinalScore = player2RawScore;
    }
    
    const endTime = Date.now();
    const completionTime = Math.floor((endTime - gameState.startTime) / 1000 / 60);
    document.getElementById('completion-time').textContent = completionTime;
    
    updateResultsScreen(player1FinalScore, player2FinalScore, winner);
    
    showScreen('results');
}

function selectRandomPowerupToApply() {
    if (gameState.player1.powerup1 && gameState.player1.powerup2) {
        const randomChoice = Math.random() < 0.5 ? 1 : 2;
        gameState.player1.appliedPowerup = randomChoice === 1 ? 
            gameState.player1.powerup1 : gameState.player1.powerup2;
    } else if (gameState.player1.powerup1) {
        gameState.player1.appliedPowerup = gameState.player1.powerup1;
    } else if (gameState.player1.powerup2) {
        gameState.player1.appliedPowerup = gameState.player1.powerup2;
    }
    
    if (gameState.player2.powerup1 && gameState.player2.powerup2) {
        const randomChoice = Math.random() < 0.5 ? 1 : 2;
        gameState.player2.appliedPowerup = randomChoice === 1 ? 
            gameState.player2.powerup1 : gameState.player2.powerup2;
    } else if (gameState.player2.powerup1) {
        gameState.player2.appliedPowerup = gameState.player2.powerup1;
    } else if (gameState.player2.powerup2) {
        gameState.player2.appliedPowerup = gameState.player2.powerup2;
    }
}

function updateResultsScreen(player1FinalScore, player2FinalScore, winner) {
    document.getElementById('results-player1-name').textContent = gameState.player1.name;
    document.getElementById('results-player2-name').textContent = gameState.player2.name;
    
    document.getElementById('player1-raw-score').textContent = gameState.player1.score;
    document.getElementById('player2-raw-score').textContent = gameState.player2.score;
    
    updatePlayerPowerupDisplay(1);
    updatePlayerPowerupDisplay(2);
    
    document.getElementById('player1-final-score').textContent = Math.round(player1FinalScore);
    document.getElementById('player2-final-score').textContent = Math.round(player2FinalScore);
    
    let winnerName, winningMessage;
    if (winner === 1) {
        winnerName = gameState.player1.name;
        winningMessage = `${winnerName} wins with ${Math.round(player1FinalScore)} points!`;
        document.getElementById('player1-final').classList.add('winner');
        document.getElementById('player2-final').classList.remove('winner');
        document.getElementById('winner-powerup-notice').style.display = 'flex';
    } else if (winner === 2) {
        winnerName = gameState.player2.name;
        winningMessage = `${winnerName} wins with ${Math.round(player2FinalScore)} points!`;
        document.getElementById('player2-final').classList.add('winner');
        document.getElementById('player1-final').classList.remove('winner');
        document.getElementById('winner-powerup-notice').style.display = 'flex';
    } else {
        winnerName = "It's a tie!";
        winningMessage = "Both players have the same score!";
        document.getElementById('player1-final').classList.add('winner');
        document.getElementById('player2-final').classList.add('winner');
        document.getElementById('winner-powerup-notice').style.display = 'none';
    }
    
    document.getElementById('winner-name').textContent = winnerName;
    document.getElementById('winning-message').textContent = winningMessage;
}

function updatePlayerPowerupDisplay(player) {
    const playerData = player === 1 ? gameState.player1 : gameState.player2;
    const powerupListDiv = document.getElementById(`player${player}-all-powerups`);
    const appliedPowerupSpan = document.getElementById(`player${player}-applied-powerup`);
    
    powerupListDiv.innerHTML = '';
    
    if (playerData.powerup1) {
        const powerupTag = document.createElement('span');
        powerupTag.className = 'powerup-tag';
        powerupTag.textContent = powerUps[playerData.powerup1].name;
        if (playerData.appliedPowerup === playerData.powerup1) {
            powerupTag.style.background = 'rgba(247, 37, 133, 0.3)';
            powerupTag.style.borderColor = '#f72585';
        }
        powerupListDiv.appendChild(powerupTag);
    } else {
        const powerupTag = document.createElement('span');
        powerupTag.className = 'powerup-tag';
        powerupTag.textContent = 'None';
        powerupListDiv.appendChild(powerupTag);
    }
    
    if (playerData.powerup2) {
        const powerupTag = document.createElement('span');
        powerupTag.className = 'powerup-tag';
        powerupTag.textContent = powerUps[playerData.powerup2].name;
        if (playerData.appliedPowerup === playerData.powerup2) {
            powerupTag.style.background = 'rgba(247, 37, 133, 0.3)';
            powerupTag.style.borderColor = '#f72585';
        }
        powerupListDiv.appendChild(powerupTag);
    } else {
        const powerupTag = document.createElement('span');
        powerupTag.className = 'powerup-tag';
        powerupTag.textContent = 'None';
        powerupListDiv.appendChild(powerupTag);
    }
    
    if (playerData.appliedPowerup) {
        appliedPowerupSpan.textContent = powerUps[playerData.appliedPowerup].name;
        appliedPowerupSpan.style.color = '#f72585';
    } else {
        appliedPowerupSpan.textContent = 'None';
        appliedPowerupSpan.style.color = '#b0b0b0';
    }
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
        case 'steal50':
            return playerScore + (opponentScore * 0.5);
        default:
            return playerScore;
    }
}

function showWorksheetContents() {
    const contentsDiv = document.getElementById('worksheet-contents');
    const contentsList = document.getElementById('contents-list');
    
    contentsList.innerHTML = '';
    
    gameState.questions.forEach((question, index) => {
        const questionItem = document.createElement('div');
        questionItem.className = 'question-item';
        
        const correctAnswer = question.options.find(opt => opt.id === question.correctAnswer);
        
        questionItem.innerHTML = `
            <h4>Question ${index + 1}: ${question.text}</h4>
            <div class="question-options">
                ${question.options.map(opt => `
                    <div class="option-item ${opt.id === question.correctAnswer ? 'correct-option' : ''}">
                        ${opt.id}. ${opt.text}
                    </div>
                `).join('')}
            </div>
            <div class="question-explanation">
                <strong>Answer:</strong> ${correctAnswer ? correctAnswer.id + '. ' + correctAnswer.text : 'Unknown'}<br>
                <strong>Explanation:</strong> ${question.explanation || 'No explanation provided.'}
            </div>
        `;
        
        contentsList.appendChild(questionItem);
    });
    
    contentsDiv.style.display = 'block';
    document.getElementById('view-contents-btn').style.display = 'none';
    
    contentsDiv.scrollIntoView({ behavior: 'smooth' });
}

function hideWorksheetContents() {
    const contentsDiv = document.getElementById('worksheet-contents');
    contentsDiv.style.display = 'none';
    document.getElementById('view-contents-btn').style.display = 'block';
}

function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.remove('active');
    });
    
    screens[screenName].classList.add('active');
}

function resetGame() {
    gameState.player1 = {
        name: "Player 1",
        score: 0,
        powerup1: null,
        powerup2: null,
        appliedPowerup: null
    };
    gameState.player2 = {
        name: "Player 2",
        score: 0,
        powerup1: null,
        powerup2: null,
        appliedPowerup: null
    };
    gameState.currentPlayer = 1;
    gameState.currentQuestion = 0;
    gameState.questions = [];
    gameState.selectedOption = null;
    gameState.selectedWorksheet = null;
    gameState.currentWorksheetData = null;
    gameState.availableChapters = [];
    gameState.availableWorksheets = [];
    
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
    
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
    
    hideWorksheetContents();
}

function playAgain() {
    gameState.player1.score = 0;
    gameState.player2.score = 0;
    gameState.currentQuestion = 0;
    gameState.currentPlayer = Math.random() < 0.5 ? 1 : 2;
    gameState.selectedOption = null;
    gameState.startTime = Date.now();
    
    startQuiz();
}