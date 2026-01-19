// Game State
let currentGame = {
    quizData: null,
    allQuizzes: {}, // Store all loaded quizzes by code
    currentQuestionIndex: 0,
    players: [
        { name: "Player 1", score: 0, power: 5, isActive: true, effects: [] },
        { name: "Player 2", score: 0, power: 5, isActive: false, effects: [] }
    ],
    riskMultiplier: 1,
    selectedAnswer: null,
    isAnswerSubmitted: false,
    gameStats: {
        questionsAnswered: 0,
        correctAnswers: 0,
        diceRolls: 0,
        cardsDrawn: 0
    }
};

// Category mappings for folder structure
const CATEGORIES = {
    level: {
        '1': { name: 'Primary School', short: 'Pri', folder: 'primary' },
        '2': { name: 'Lower Secondary', short: 'LowSec', folder: 'lower-secondary' },
        '3': { name: 'Upper Secondary', short: 'UpSec', folder: 'upper-secondary' }
    },
    subject: {
        '0': { name: 'Mathematics', short: 'Math', folder: 'math' },
        '1': { name: 'Science (General)', short: 'Science', folder: 'science' },
        '2': { name: 'Combined Physics', short: 'CombPhys', folder: 'combined-physics' },
        '3': { name: 'Pure Physics', short: 'PurePhys', folder: 'pure-physics' },
        '4': { name: 'Combined Chemistry', short: 'CombChem', folder: 'combined-chem' },
        '5': { name: 'Pure Chemistry', short: 'PureChem', folder: 'pure-chem' }
    },
    grade: {
        '1': 'Primary 1',
        '2': 'Primary 2',
        '3': 'Primary 3',
        '4': 'Primary 4',
        '5': 'Primary 5',
        '6': 'Primary 6',
        '7': 'Secondary 1',
        '8': 'Secondary 2',
        '9': 'Secondary 3',
        '10': 'Secondary 4'
    }
};

// Chance Cards
const chanceCards = [
    { type: "bonus", message: "🎉 Bonus Points! +20 points!", effect: "score", value: 20 },
    { type: "power", message: "⚡ Power Boost! +3 power points", effect: "power", value: 3 },
    { type: "steal", message: "🔄 Steal 10 points from opponent!", effect: "steal", value: 10 },
    { type: "double", message: "✨ Double next correct answer points!", effect: "multiplier", value: 2 },
    { type: "shield", message: "🛡️ Immune to point loss next turn", effect: "shield", value: 1 },
    { type: "swap", message: "🔄 Swap scores with opponent!", effect: "swap", value: 0 }
];

// DOM Elements
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over')
};

// Code input state
let currentCode = ['_', '_', '_', '_', '_', '_'];
let currentDigitIndex = 0;

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateCodeDisplay();
    
    // Auto-scan for quizzes on page load
    setTimeout(() => {
        scanAvailableQuizzes();
    }, 1000);
});

function initializeEventListeners() {
    // Keypad buttons
    document.querySelectorAll('.keypad-btn').forEach(btn => {
        if (btn.id !== 'backspace' && btn.id !== 'clear') {
            btn.addEventListener('click', (e) => {
                const digit = e.target.dataset.key;
                enterDigit(digit);
            });
        }
    });
    
    // Special keys
    document.getElementById('backspace').addEventListener('click', backspaceDigit);
    document.getElementById('clear').addEventListener('click', clearCode);
    
    // Action buttons
    document.getElementById('validate-code').addEventListener('click', validateCode);
    document.getElementById('rescan-quizzes').addEventListener('click', scanAvailableQuizzes);
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Quiz list filtering
    document.getElementById('quiz-search').addEventListener('input', filterQuizList);
    document.getElementById('quiz-filter').addEventListener('change', filterQuizList);
    
    // Game screen buttons
    document.getElementById('submit-answer').addEventListener('click', submitAnswer);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('home-btn').addEventListener('click', goToHome);
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    document.getElementById('draw-card').addEventListener('click', drawCard);
    
    // Risk buttons
    document.querySelectorAll('.risk-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.risk-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentGame.riskMultiplier = parseFloat(e.target.dataset.risk);
        });
    });
    
    // Game over buttons
    document.getElementById('play-again').addEventListener('click', playAgain);
    document.getElementById('new-quiz').addEventListener('click', newQuiz);
}

// Code Input Functions
function enterDigit(digit) {
    if (currentDigitIndex >= 6) return;
    
    currentCode[currentDigitIndex] = digit;
    currentDigitIndex++;
    updateCodeDisplay();
    
    if (currentDigitIndex === 6) {
        document.getElementById('validate-code').disabled = false;
    }
}

function backspaceDigit() {
    if (currentDigitIndex > 0) {
        currentDigitIndex--;
        currentCode[currentDigitIndex] = '_';
        updateCodeDisplay();
    }
    document.getElementById('validate-code').disabled = true;
}

function clearCode() {
    currentCode = ['_', '_', '_', '_', '_', '_'];
    currentDigitIndex = 0;
    updateCodeDisplay();
    document.getElementById('validate-code').disabled = true;
}

function updateCodeDisplay() {
    const digits = document.querySelectorAll('.code-digit');
    digits.forEach((digit, index) => {
        digit.textContent = currentCode[index];
        digit.classList.toggle('active', index === currentDigitIndex);
    });
    
    // Update validate button
    const validateBtn = document.getElementById('validate-code');
    validateBtn.disabled = currentDigitIndex !== 6;
}

// Quiz Scanning Functions
async function scanAvailableQuizzes() {
    showLoading(true, "Scanning folder structure...");
    
    try {
        // Clear existing quizzes
        currentGame.allQuizzes = {};
        
        // Known quiz files based on your image
        const knownFiles = [
            'Questions/upper-secondary/math/304021.json',
            'Questions/upper-secondary/math/304022.json',
            'Questions/upper-secondary/math/304023.json'
        ];
        
        let totalFound = 0;
        
        // Try to load known files
        for (const filePath of knownFiles) {
            try {
                // Extract code from filename
                const filename = filePath.split('/').pop();
                const code = filename.replace('.json', '');
                
                // Load the JSON file
                const response = await fetch(filePath);
                
                if (response.ok) {
                    const quizData = await response.json();
                    
                    // Decode the code
                    const metadata = decodeCode(code);
                    if (metadata) {
                        currentGame.allQuizzes[code] = {
                            ...quizData,
                            code: code,
                            metadata: metadata,
                            folderPath: getFolderPath(metadata)
                        };
                        totalFound++;
                        
                        showLoading(true, `Loading quiz files...`, 
                            `Loaded: ${code}<br>${quizData.title}<br>Found: ${totalFound} quizzes`);
                    }
                }
            } catch (error) {
                console.warn(`Could not load ${filePath}:`, error);
            }
        }
        
        // If no files were found, try to list files from directories
        if (totalFound === 0) {
            showLoading(true, "Scanning directories...");
            
            // Try to scan directories (this requires server-side support or CORS)
            const directories = [
                'Questions/primary/math/',
                'Questions/primary/science/',
                'Questions/lower-secondary/math/',
                'Questions/lower-secondary/science/',
                'Questions/upper-secondary/math/',
                'Questions/upper-secondary/pure-physics/',
                'Questions/upper-secondary/pure-chem/',
                'Questions/upper-secondary/combined-physics/',
                'Questions/upper-secondary/combined-chem/'
            ];
            
            for (const dir of directories) {
                try {
                    // Try to get directory listing
                    // Note: This only works if your server provides directory listing
                    const response = await fetch(dir);
                    if (response.ok) {
                        const text = await response.text();
                        // Parse HTML for links (simplified)
                        const jsonFiles = text.match(/\d{6}\.json/g) || [];
                        
                        for (const filename of jsonFiles) {
                            const code = filename.replace('.json', '');
                            const fileUrl = dir + filename;
                            
                            try {
                                const quizResponse = await fetch(fileUrl);
                                if (quizResponse.ok) {
                                    const quizData = await quizResponse.json();
                                    const metadata = decodeCode(code);
                                    
                                    if (metadata) {
                                        currentGame.allQuizzes[code] = {
                                            ...quizData,
                                            code: code,
                                            metadata: metadata,
                                            folderPath: getFolderPath(metadata)
                                        };
                                        totalFound++;
                                    }
                                }
                            } catch (error) {
                                console.warn(`Could not load ${fileUrl}:`, error);
                            }
                        }
                    }
                } catch (error) {
                    // Directory listing not available
                    console.warn(`Could not scan ${dir}:`, error);
                }
            }
        }
        
        // If still no files found, provide helpful message
        if (totalFound === 0) {
            showLoading(false);
            showFeedback("No JSON quiz files found. Please ensure your files are in the correct folder structure.", "warning");
            showAvailableQuizzes();
            return;
        }
        
        showLoading(false);
        updateScanCount();
        showAvailableQuizzes();
        showFeedback(`✅ Found ${totalFound} quiz files`, 'success');
        
    } catch (error) {
        console.error('Error scanning quizzes:', error);
        showError("Error scanning folder structure. Please check browser console.");
        showLoading(false);
        
        // Fallback: Try to load at least the known files
        try {
            await loadKnownFilesFallback();
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
        }
    }
}

async function loadKnownFilesFallback() {
    // Hardcoded fallback for demo purposes
    const fallbackQuizzes = {
        '304021': {
            title: "Chapter 4: Algebra Basics",
            subject: "Mathematics",
            grade: "Secondary 4",
            questions: [
                {
                    question: "Solve for x: 2x + 5 = 13",
                    options: ["x = 4", "x = 3", "x = 5", "x = 6"],
                    correct: 0,
                    points: 10,
                    explanation: "2x + 5 = 13 → 2x = 8 → x = 4"
                },
                {
                    question: "Simplify: 3(x + 4) - 2x",
                    options: ["x + 12", "x + 4", "3x + 10", "5x + 12"],
                    correct: 0,
                    points: 10,
                    explanation: "3(x + 4) - 2x = 3x + 12 - 2x = x + 12"
                }
            ]
        },
        '304022': {
            title: "Chapter 4: Advanced Algebra",
            subject: "Mathematics",
            grade: "Secondary 4",
            questions: [
                {
                    question: "Factorize: x² - 9",
                    options: ["(x - 3)(x + 3)", "(x - 9)(x + 1)", "(x - 3)²", "(x + 3)²"],
                    correct: 0,
                    points: 10,
                    explanation: "x² - 9 is a difference of squares: (x - 3)(x + 3)"
                }
            ]
        },
        '304023': {
            title: "Chapter 4: Quadratic Equations",
            subject: "Mathematics",
            grade: "Secondary 4",
            questions: [
                {
                    question: "Solve: x² - 5x + 6 = 0",
                    options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = -1, -6"],
                    correct: 0,
                    points: 15,
                    explanation: "Factor: (x - 2)(x - 3) = 0 → x = 2 or x = 3"
                }
            ]
        }
    };
    
    for (const [code, quizData] of Object.entries(fallbackQuizzes)) {
        const metadata = decodeCode(code);
        if (metadata) {
            currentGame.allQuizzes[code] = {
                ...quizData,
                code: code,
                metadata: metadata,
                folderPath: getFolderPath(metadata)
            };
        }
    }
    
    updateScanCount();
    showAvailableQuizzes();
    showFeedback("Using fallback quiz data. Check console for loading errors.", "warning");
}

function decodeCode(code) {
    if (code.length !== 6 || !/^\d{6}$/.test(code)) return null;
    
    const digits = code.split('').map(Number);
    
    // Get level (1st digit)
    const level = CATEGORIES.level[digits[0]];
    if (!level) return null;
    
    // Get subject (2nd digit)
    const subject = CATEGORIES.subject[digits[1]];
    if (!subject) return null;
    
    // Get grade (3rd digit)
    const gradeCode = digits[2];
    let grade = '';
    if (digits[0] === 1) {
        // Primary (1-6)
        grade = CATEGORIES.grade[gradeCode] || `Primary ${gradeCode}`;
    } else if (digits[0] === 2 || digits[0] === 3) {
        // Secondary (7-10 corresponds to 1-4)
        const secGrade = gradeCode + 6;
        grade = CATEGORIES.grade[secGrade] || `Secondary ${gradeCode}`;
    } else {
        return null;
    }
    
    // Get chapter (4th and 5th digits)
    const chapter = digits[3] === 0 ? digits[4].toString() : (digits[3] * 10 + digits[4]).toString();
    
    // Get worksheet (6th digit)
    const worksheet = digits[5];
    
    return {
        level: level.name,
        levelShort: level.short,
        levelFolder: level.folder,
        subject: subject.name,
        subjectShort: subject.short,
        subjectFolder: subject.folder,
        grade: grade,
        chapter: chapter,
        worksheet: worksheet,
        fullCode: code
    };
}

function getFolderPath(metadata) {
    return `Questions/${metadata.levelFolder}/${metadata.subjectFolder}/`;
}

function updateScanCount() {
    const count = Object.keys(currentGame.allQuizzes).length;
    document.getElementById('scan-count').textContent = `${count} Quizzes Found`;
    document.getElementById('quiz-count').textContent = `(${count})`;
}

function showAvailableQuizzes() {
    const quizListDiv = document.getElementById('quiz-list');
    const availableDiv = document.getElementById('available-quizzes');
    
    if (Object.keys(currentGame.allQuizzes).length === 0) {
        quizListDiv.innerHTML = `
            <div class="no-quizzes">
                <div style="margin-bottom: 15px;">📂 No quiz files found.</div>
                <div style="font-size: 0.9rem; color: #888;">
                    Please ensure JSON files are in the Questions/ folder structure.<br>
                    Example: Questions/upper-secondary/math/304021.json
                </div>
            </div>
        `;
        availableDiv.style.display = 'block';
        return;
    }
    
    availableDiv.style.display = 'block';
    filterQuizList(); // This will populate the list
}

function filterQuizList() {
    const searchTerm = document.getElementById('quiz-search').value.toLowerCase();
    const filterValue = document.getElementById('quiz-filter').value;
    const quizListDiv = document.getElementById('quiz-list');
    
    let filteredQuizzes = Object.values(currentGame.allQuizzes);
    
    // Apply category filter
    if (filterValue !== 'all') {
        filteredQuizzes = filteredQuizzes.filter(quiz => {
            if (filterValue === 'primary') return quiz.metadata.levelFolder === 'primary';
            if (filterValue === 'lower-secondary') return quiz.metadata.levelFolder === 'lower-secondary';
            if (filterValue === 'upper-secondary') return quiz.metadata.levelFolder === 'upper-secondary';
            return true;
        });
    }
    
    // Apply search filter
    if (searchTerm) {
        filteredQuizzes = filteredQuizzes.filter(quiz => {
            return quiz.code.includes(searchTerm) ||
                   quiz.title.toLowerCase().includes(searchTerm) ||
                   (quiz.metadata?.subject?.toLowerCase() || '').includes(searchTerm) ||
                   (quiz.metadata?.grade?.toLowerCase() || '').includes(searchTerm);
        });
    }
    
    // Sort by code
    filteredQuizzes.sort((a, b) => a.code.localeCompare(b.code));
    
    // Display quizzes
    if (filteredQuizzes.length === 0) {
        quizListDiv.innerHTML = '<div class="no-quizzes">No quizzes match your search.</div>';
        return;
    }
    
    let html = '';
    filteredQuizzes.forEach(quiz => {
        const meta = quiz.metadata;
        html += `
            <div class="quiz-item" data-code="${quiz.code}">
                <div class="quiz-code">${quiz.code}</div>
                <div class="quiz-desc">
                    <strong>${quiz.title}</strong><br>
                    ${meta.levelShort} • ${meta.subjectShort} • ${meta.grade}<br>
                    Chapter ${meta.chapter}, Worksheet ${meta.worksheet}
                </div>
                <div class="quiz-folder">${quiz.folderPath}</div>
            </div>
        `;
    });
    
    quizListDiv.innerHTML = html;
    
    // Add click handlers
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.addEventListener('click', () => {
            const code = item.dataset.code;
            currentCode = code.split('');
            currentDigitIndex = 6;
            updateCodeDisplay();
            validateCode();
            
            // Highlight selected
            document.querySelectorAll('.quiz-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            // Scroll to validation section
            item.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
    });
}

function validateCode() {
    const code = currentCode.join('');
    
    if (!currentGame.allQuizzes[code]) {
        showError(`Quiz code ${code} not found. Available quizzes are listed below.`);
        return;
    }
    
    // Load the quiz
    currentGame.quizData = currentGame.allQuizzes[code];
    
    // Update quiz info display
    updateQuizInfoDisplay();
    
    // Enable start button
    document.getElementById('start-game').disabled = false;
    document.getElementById('start-error').textContent = '';
    
    showFeedback(`✅ Quiz "${currentGame.quizData.title}" loaded successfully`, 'success');
}

function updateQuizInfoDisplay() {
    const infoDiv = document.getElementById('quiz-info');
    const metadata = currentGame.quizData.metadata;
    
    document.getElementById('quiz-title-display').textContent = currentGame.quizData.title;
    document.getElementById('quiz-folder-display').textContent = currentGame.quizData.folderPath;
    document.getElementById('quiz-grade-display').textContent = `${metadata.grade} • ${metadata.subject}`;
    document.getElementById('quiz-count-display').textContent = `${currentGame.quizData.questions.length} questions`;
    
    infoDiv.style.display = 'block';
    infoDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Game Functions
function startGame() {
    if (!currentGame.quizData) {
        showError("No quiz loaded. Please enter a valid code.");
        return;
    }
    
    // Reset game state
    currentGame.currentQuestionIndex = 0;
    currentGame.players[0].score = 0;
    currentGame.players[1].score = 0;
    currentGame.players[0].power = 5;
    currentGame.players[1].power = 5;
    currentGame.players[0].isActive = true;
    currentGame.players[1].isActive = false;
    currentGame.players[0].effects = [];
    currentGame.players[1].effects = [];
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    currentGame.gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0,
        diceRolls: 0,
        cardsDrawn: 0
    };
    
    // Update UI
    document.getElementById('game-quiz-title').textContent = currentGame.quizData.title;
    document.getElementById('total-q').textContent = currentGame.quizData.questions.length;
    
    // Switch screens
    screens.start.classList.remove('active');
    screens.game.classList.add('active');
    
    // Load first question
    loadQuestion();
    updateUI();
}

function loadQuestion() {
    const question = currentGame.quizData.questions[currentGame.currentQuestionIndex];
    const optionsContainer = document.getElementById('options-container');
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-points').textContent = `${question.points} pts`;
    document.getElementById('current-q').textContent = currentGame.currentQuestionIndex + 1;
    
    // Create options
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        
        optionElement.addEventListener('click', () => selectAnswer(index));
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset answer state
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'none';
    
    // Reset chance elements
    document.getElementById('dice').textContent = '?';
    document.getElementById('dice-result').innerHTML = '';
    document.getElementById('card-result').innerHTML = '';
    
    // Update feedback
    document.getElementById('feedback').innerHTML = `
        <div class="feedback-placeholder">
            <span class="feedback-icon">💡</span>
            Select an answer to begin!
        </div>
    `;
}

function selectAnswer(index) {
    if (currentGame.isAnswerSubmitted) return;
    
    // Remove selected class from all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Add selected class to clicked option
    document.querySelectorAll('.option')[index].classList.add('selected');
    currentGame.selectedAnswer = index;
    document.getElementById('submit-answer').disabled = false;
}

function submitAnswer() {
    if (currentGame.selectedAnswer === null || currentGame.isAnswerSubmitted) return;
    
    const question = currentGame.quizData.questions[currentGame.currentQuestionIndex];
    const isCorrect = currentGame.selectedAnswer === question.correct;
    const activePlayer = currentGame.players.find(p => p.isActive);
    
    // Update game stats
    currentGame.gameStats.questionsAnswered++;
    if (isCorrect) currentGame.gameStats.correctAnswers++;
    
    // Calculate points with risk multiplier
    let pointsEarned = isCorrect ? question.points * currentGame.riskMultiplier : 0;
    
    // Apply active effects
    currentGame.players.forEach(player => {
        player.effects.forEach((effect, index) => {
            if (effect.type === 'multiplier' && isCorrect) {
                pointsEarned *= effect.value;
                player.effects.splice(index, 1);
            }
            if (effect.type === 'shield' && !isCorrect) {
                pointsEarned = 0;
                player.effects.splice(index, 1);
            }
        });
    });
    
    // Update player score
    activePlayer.score += Math.round(pointsEarned);
    
    // Show feedback
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <span class="feedback-icon">✅</span>
                <strong>Correct!</strong> +${Math.round(pointsEarned)} points!
                <div class="explanation">${question.explanation || ''}</div>
            </div>
        `;
    } else {
        feedback.innerHTML = `
            <div class="feedback-incorrect">
                <span class="feedback-icon">❌</span>
                <strong>Incorrect!</strong> No points earned.
                <div class="explanation">${question.explanation || ''}</div>
                <div class="correct-answer">Correct answer: ${question.options[question.correct]}</div>
            </div>
        `;
    }
    
    // Highlight correct/incorrect answers
    document.querySelectorAll('.option').forEach((opt, index) => {
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === currentGame.selectedAnswer && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    currentGame.isAnswerSubmitted = true;
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'block';
}

function nextQuestion() {
    currentGame.currentQuestionIndex++;
    
    // Switch active player
    currentGame.players[0].isActive = !currentGame.players[0].isActive;
    currentGame.players[1].isActive = !currentGame.players[1].isActive;
    
    if (currentGame.currentQuestionIndex < currentGame.quizData.questions.length) {
        loadQuestion();
        updateUI();
    } else {
        endGame();
    }
}

function updateUI() {
    // Update player displays
    currentGame.players.forEach((player, index) => {
        const playerElement = document.getElementById(`player${index + 1}`);
        const scoreElement = playerElement.querySelector('.player-score');
        
        playerElement.classList.toggle('active', player.isActive);
        scoreElement.textContent = player.score;
        
        // Update power display
        if (index === 0) {
            document.getElementById('power-count').textContent = player.power;
        }
    });
    
    // Update effects
    const effectsList = document.getElementById('effects-list');
    effectsList.innerHTML = '';
    
    currentGame.players.forEach(player => {
        player.effects.forEach(effect => {
            const effectElement = document.createElement('div');
            effectElement.className = 'effect-item';
            effectElement.innerHTML = `${effect.message}`;
            effectsList.appendChild(effectElement);
        });
    });
}

function rollDice() {
    const activePlayer = currentGame.players.find(p => p.isActive);
    
    if (activePlayer.power < 1) {
        showFeedback("❌ Not enough power points!", "error");
        return;
    }
    
    // Deduct power
    activePlayer.power -= 1;
    currentGame.gameStats.diceRolls++;
    
    // Roll dice (1-6)
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    
    // Update dice display
    const diceElement = document.getElementById('dice');
    const resultElement = document.getElementById('dice-result');
    
    diceElement.textContent = diceRoll;
    diceElement.style.animation = 'none';
    setTimeout(() => {
        diceElement.style.animation = 'bounce 0.5s';
    }, 10);
    
    // Calculate bonus
    let bonus = 0;
    let message = "";
    
    switch(diceRoll) {
        case 1:
            bonus = -5;
            message = "😢 Bad luck! -5 points";
            break;
        case 6:
            bonus = 15;
            message = "🎉 Critical success! +15 points";
            break;
        default:
            bonus = diceRoll * 2;
            message = `🎲 Rolled ${diceRoll}! +${bonus} points`;
    }
    
    activePlayer.score = Math.max(0, activePlayer.score + bonus);
    resultElement.innerHTML = `<strong>${message}</strong>`;
    
    updateUI();
    showFeedback(message, bonus > 0 ? "success" : "warning");
}

function drawCard() {
    const activePlayer = currentGame.players.find(p => p.isActive);
    const opponent = currentGame.players.find(p => !p.isActive);
    
    if (activePlayer.power < 2) {
        showFeedback("❌ Not enough power points! Need 2 ⚡", "error");
        return;
    }
    
    // Deduct power
    activePlayer.power -= 2;
    currentGame.gameStats.cardsDrawn++;
    
    // Draw random card
    const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
    
    // Update card display
    const resultElement = document.getElementById('card-result');
    resultElement.innerHTML = `<strong>${card.message}</strong>`;
    
    // Apply card effect
    switch(card.effect) {
        case 'score':
            activePlayer.score += card.value;
            break;
        case 'power':
            activePlayer.power += card.value;
            break;
        case 'steal':
            opponent.score = Math.max(0, opponent.score - card.value);
            activePlayer.score += card.value;
            break;
        case 'multiplier':
            activePlayer.effects.push({
                type: 'multiplier',
                value: card.value,
                message: '2× Multiplier'
            });
            break;
        case 'shield':
            activePlayer.effects.push({
                type: 'shield',
                value: card.value,
                message: '🛡️ Shield Active'
            });
            break;
        case 'swap':
            const tempScore = activePlayer.score;
            activePlayer.score = opponent.score;
            opponent.score = tempScore;
            break;
    }
    
    updateUI();
    showFeedback(card.message, "info");
}

function endGame() {
    // Determine winner
    const player1Score = currentGame.players[0].score;
    const player2Score = currentGame.players[1].score;
    let winnerMessage = "";
    
    if (player1Score > player2Score) {
        winnerMessage = "👑 Player 1 Wins!";
    } else if (player2Score > player1Score) {
        winnerMessage = "👑 Player 2 Wins!";
    } else {
        winnerMessage = "🤝 It's a Tie!";
    }
    
    // Update game over screen
    document.getElementById('winner-message').textContent = winnerMessage;
    document.getElementById('final-score1').textContent = player1Score;
    document.getElementById('final-score2').textContent = player2Score;
    
    // Update game stats
    const statsGrid = document.getElementById('game-stats');
    statsGrid.innerHTML = `
        <div class="stat-item">
            <div class="stat-label">Questions</div>
            <div class="stat-value">${currentGame.gameStats.questionsAnswered}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Correct</div>
            <div class="stat-value">${currentGame.gameStats.correctAnswers}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Dice Rolls</div>
            <div class="stat-value">${currentGame.gameStats.diceRolls}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Cards Drawn</div>
            <div class="stat-value">${currentGame.gameStats.cardsDrawn}</div>
        </div>
    `;
    
    // Switch to game over screen
    screens.game.classList.remove('active');
    screens.gameOver.classList.add('active');
}

function goToHome() {
    screens.game.classList.remove('active');
    screens.gameOver.classList.remove('active');
    screens.start.classList.add('active');
}

function playAgain() {
    // Reset game state but keep current quiz
    currentGame.currentQuestionIndex = 0;
    currentGame.players[0].score = 0;
    currentGame.players[1].score = 0;
    currentGame.players[0].power = 5;
    currentGame.players[1].power = 5;
    currentGame.players[0].isActive = true;
    currentGame.players[1].isActive = false;
    currentGame.players[0].effects = [];
    currentGame.players[1].effects = [];
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    currentGame.gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0,
        diceRolls: 0,
        cardsDrawn: 0
    };
    
    screens.gameOver.classList.remove('active');
    screens.game.classList.add('active');
    loadQuestion();
    updateUI();
}

function newQuiz() {
    screens.gameOver.classList.remove('active');
    screens.start.classList.add('active');
    
    // Reset code
    clearCode();
    
    // Hide quiz info
    document.getElementById('quiz-info').style.display = 'none';
    document.getElementById('start-game').disabled = true;
}

// Utility Functions
function showFeedback(message, type) {
    // Create temporary feedback element
    const feedback = document.createElement('div');
    feedback.className = `feedback-toast feedback-${type}`;
    feedback.innerHTML = `
        <span class="feedback-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        ${message}
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

function showError(message) {
    const errorDiv = document.getElementById('start-error');
    errorDiv.textContent = message;
    errorDiv.style.color = '#f44336';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function showLoading(show, text = "Loading...", details = "") {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingDetails = document.getElementById('loading-details');
    
    if (show) {
        loadingText.textContent = text;
        loadingDetails.innerHTML = details;
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}