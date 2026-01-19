// ==========================================================================
// Mobile Detection & Optimizations
// ==========================================================================
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// Apply mobile optimizations
if (isTouchDevice) {
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Add touch device class for CSS targeting
    document.body.classList.add('touch-device');
    
    // Prevent zoom on double-tap for buttons
    document.addEventListener('touchend', function(event) {
        if (event.touches && event.touches.length > 1) {
            event.preventDefault();
        }
    }, {passive: false});
}

// ==========================================================================
// Game State
// ==========================================================================
let currentGame = {
    quizData: null,
    allQuizzes: {},
    currentQuestionIndex: 0,
    players: [
        { name: "Player 1", score: 0, isActive: true },
        { name: "Player 2", score: 0, isActive: false }
    ],
    selectedAnswer: null,
    isAnswerSubmitted: false,
    selectedBoxes: [], // Array of selected box indices
    boxValues: [], // Array of hidden point values for boxes
    gameStats: {
        questionsAnswered: 0,
        correctAnswers: 0,
        boxesSelected: 0,
        totalPointsEarned: 0,
        positiveBoxes: 0,
        negativeBoxes: 0
    }
};

// Box point distribution (12 boxes total)
const BOX_POINTS_DISTRIBUTION = [
    5, 10, 15, 20, 25, 30, // Positive values
    -5, -10, -15, -20, -25, -30, // Negative values
    0, 0, 0, 0 // Zero values (risk-free)
];

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

// ==========================================================================
// DOM Elements
// ==========================================================================
const screens = {
    start: document.getElementById('start-screen'),
    game: document.getElementById('game-screen'),
    gameOver: document.getElementById('game-over')
};

// Code input state
let currentCode = ['_', '_', '_', '_', '_', '_'];
let currentDigitIndex = 0;

// ==========================================================================
// Initialize Game
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    updateCodeDisplay();
    
    // Add keyboard event listener for typing
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Show loading immediately
    setTimeout(() => {
        scanAvailableQuizzes();
    }, 500);
    
    // Add vibration feedback for mobile (if supported)
    if ('vibrate' in navigator && isMobile) {
        window.vibrate = function(pattern = 50) {
            try {
                navigator.vibrate(pattern);
            } catch (e) {
                // Vibration not supported
            }
        };
    }
});

// ==========================================================================
// Event Listeners
// ==========================================================================
function initializeEventListeners() {
    // Keypad buttons with touch/click support
    document.querySelectorAll('.keypad-btn').forEach(btn => {
        if (btn.id !== 'backspace' && btn.id !== 'clear') {
            // Handle both touch and click
            btn.addEventListener('click', handleKeypadClick);
            if (isTouchDevice) {
                btn.addEventListener('touchstart', handleKeypadTouch);
            }
        }
    });
    
    // Special keys
    document.getElementById('backspace').addEventListener('click', backspaceDigit);
    document.getElementById('clear').addEventListener('click', clearCode);
    
    // Add touch events for mobile
    if (isTouchDevice) {
        document.getElementById('backspace').addEventListener('touchstart', backspaceDigit);
        document.getElementById('clear').addEventListener('touchstart', clearCode);
    }
    
    // Action buttons
    document.getElementById('validate-code').addEventListener('click', validateCode);
    document.getElementById('rescan-quizzes').addEventListener('click', scanAvailableQuizzes);
    document.getElementById('start-game').addEventListener('click', startGame);
    
    // Quiz list filtering
    const quizSearch = document.getElementById('quiz-search');
    const quizFilter = document.getElementById('quiz-filter');
    
    quizSearch.addEventListener('input', debounce(filterQuizList, 300));
    quizFilter.addEventListener('change', filterQuizList);
    
    // Game screen buttons
    document.getElementById('submit-answer').addEventListener('click', submitAnswer);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('home-btn').addEventListener('click', goToHome);
    document.getElementById('clear-selections').addEventListener('click', clearSelections);
    
    // Game over buttons
    document.getElementById('play-again').addEventListener('click', playAgain);
    document.getElementById('new-quiz').addEventListener('click', newQuiz);
    
    // Handle window resize for responsive adjustments
    window.addEventListener('resize', debounce(handleResize, 250));
    
    // Prevent accidental zoom on mobile
    if (isTouchDevice) {
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });
    }
}

// ==========================================================================
// Utility Functions
// ==========================================================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function handleKeypadClick(e) {
    const digit = e.currentTarget.dataset.key;
    enterDigit(digit);
    provideHapticFeedback();
}

function handleKeypadTouch(e) {
    e.preventDefault();
    const digit = e.currentTarget.dataset.key;
    enterDigit(digit);
    provideHapticFeedback();
}

function provideHapticFeedback() {
    if (window.vibrate) {
        window.vibrate(30);
    }
}

// ==========================================================================
// Keyboard Input Handler
// ==========================================================================
function handleKeyboardInput(e) {
    if (!screens.start.classList.contains('active')) return;
    
    const key = e.key;
    
    // Number keys 0-9
    if (/^[0-9]$/.test(key)) {
        enterDigit(key);
        e.preventDefault();
    }
    // Backspace key
    else if (key === 'Backspace') {
        backspaceDigit();
        e.preventDefault();
    }
    // Enter key to validate
    else if (key === 'Enter' && currentDigitIndex === 6) {
        validateCode();
        e.preventDefault();
    }
    // Escape key to clear
    else if (key === 'Escape') {
        clearCode();
        e.preventDefault();
    }
    // Arrow keys for navigation
    else if (key === 'ArrowLeft' && currentDigitIndex > 0) {
        currentDigitIndex--;
        updateCodeDisplay();
    }
    else if (key === 'ArrowRight' && currentDigitIndex < 6) {
        currentDigitIndex++;
        updateCodeDisplay();
    }
}

// ==========================================================================
// Code Input Functions
// ==========================================================================
function enterDigit(digit) {
    if (currentDigitIndex >= 6) return;
    
    currentCode[currentDigitIndex] = digit;
    currentDigitIndex++;
    updateCodeDisplay();
    
    if (currentDigitIndex === 6) {
        document.getElementById('validate-code').disabled = false;
        if (window.vibrate) window.vibrate([30, 20, 30]);
    }
}

function backspaceDigit() {
    if (currentDigitIndex > 0) {
        currentDigitIndex--;
        currentCode[currentDigitIndex] = '_';
        updateCodeDisplay();
        provideHapticFeedback();
    }
    document.getElementById('validate-code').disabled = true;
}

function clearCode() {
    currentCode = ['_', '_', '_', '_', '_', '_'];
    currentDigitIndex = 0;
    updateCodeDisplay();
    document.getElementById('validate-code').disabled = true;
    provideHapticFeedback();
}

function updateCodeDisplay() {
    const digits = document.querySelectorAll('.code-digit');
    digits.forEach((digit, index) => {
        digit.textContent = currentCode[index];
        digit.classList.toggle('active', index === currentDigitIndex);
    });
    
    const validateBtn = document.getElementById('validate-code');
    validateBtn.disabled = currentDigitIndex !== 6;
}

// ==========================================================================
// Quiz Scanning Functions (UPDATED FOR BETTER COMPATIBILITY)
// ==========================================================================
async function scanAvailableQuizzes() {
    showLoading(true, "Scanning folder structure...");
    
    try {
        currentGame.allQuizzes = {};
        
        // Try multiple approaches to find quiz files
        const foundQuizzes = await findQuizFiles();
        
        if (foundQuizzes.length === 0) {
            // Try fallback method
            await loadFallbackQuizzes();
        } else {
            // Process found quizzes
            for (const quiz of foundQuizzes) {
                const metadata = decodeCode(quiz.code);
                if (metadata) {
                    currentGame.allQuizzes[quiz.code] = {
                        ...quiz.data,
                        code: quiz.code,
                        metadata: metadata,
                        folderPath: getFolderPath(metadata)
                    };
                }
            }
        }
        
        showLoading(false);
        updateScanCount();
        showAvailableQuizzes();
        
        const count = Object.keys(currentGame.allQuizzes).length;
        if (count > 0) {
            showFeedback(`✅ Found ${count} quiz file${count !== 1 ? 's' : ''}`, 'success');
        } else {
            showFeedback("No quiz files found. Using demo quizzes.", 'warning');
        }
        
    } catch (error) {
        console.error('Error scanning quizzes:', error);
        showError("Error scanning folder structure. Using demo quizzes.");
        showLoading(false);
        
        // Always load fallback as last resort
        await loadFallbackQuizzes();
    }
}

async function findQuizFiles() {
    const foundQuizzes = [];
    
    // Define possible quiz locations
    const quizLocations = [
        // Direct file paths (for development)
        { path: 'Questions/upper-secondary/math/304021.json', code: '304021' },
        { path: 'Questions/upper-secondary/math/304022.json', code: '304022' },
        { path: 'Questions/upper-secondary/math/304023.json', code: '304023' },
        
        // Try to detect files in common locations
        { path: './304021.json', code: '304021' },
        { path: './quiz/304021.json', code: '304021' },
        { path: './data/304021.json', code: '304021' },
    ];
    
    // Also try to scan directories if we have a server-side component
    // This would require server-side support (like a PHP/Node.js endpoint)
    
    for (const location of quizLocations) {
        try {
            const response = await fetch(location.path);
            if (response.ok) {
                const data = await response.json();
                foundQuizzes.push({
                    code: location.code,
                    data: data,
                    path: location.path
                });
                
                // Update loading message
                showLoading(true, `Found: ${location.code}`, 
                    `Loaded ${foundQuizzes.length} quiz${foundQuizzes.length !== 1 ? 's' : ''}`);
            }
        } catch (error) {
            // File not found, continue to next
            continue;
        }
    }
    
    return foundQuizzes;
}

async function loadFallbackQuizzes() {
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
                },
                {
                    question: "Solve: 2x² - 8 = 0",
                    options: ["x = ±2", "x = ±4", "x = 2", "x = -2"],
                    correct: 0,
                    points: 15,
                    explanation: "2x² - 8 = 0 → x² = 4 → x = ±2"
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
                },
                {
                    question: "What is the vertex of y = x² - 4x + 3?",
                    options: ["(2, -1)", "(4, 3)", "(1, 0)", "(-2, 15)"],
                    correct: 0,
                    points: 20,
                    explanation: "Complete the square: y = (x-2)² - 1, vertex at (2, -1)"
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
    document.getElementById('scan-count').textContent = `${count} Quiz${count !== 1 ? 'es' : ''} Found`;
    document.getElementById('quiz-count').textContent = `(${count})`;
}

// ==========================================================================
// Quiz Display Functions
// ==========================================================================
function showAvailableQuizzes() {
    const quizListDiv = document.getElementById('quiz-list');
    const availableDiv = document.getElementById('available-quizzes');
    
    if (Object.keys(currentGame.allQuizzes).length === 0) {
        quizListDiv.innerHTML = `
            <div class="no-quizzes">
                <div style="margin-bottom: 15px; font-size: 1.2rem;">📂 No quiz files found</div>
                <div style="font-size: 0.9rem; color: #666; line-height: 1.5;">
                    Please ensure JSON files are in the correct folder structure:<br>
                    <code>Questions/[level]/[subject]/[6-digit-code].json</code><br><br>
                    <em>Currently using demo quizzes for testing.</em>
                </div>
            </div>
        `;
        availableDiv.style.display = 'block';
        return;
    }
    
    availableDiv.style.display = 'block';
    filterQuizList();
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
        quizListDiv.innerHTML = `
            <div class="no-quizzes">
                No quizzes match your search. Try a different term.
            </div>
        `;
        return;
    }
    
    let html = '';
    filteredQuizzes.forEach(quiz => {
        const meta = quiz.metadata;
        html += `
            <div class="quiz-item" data-code="${quiz.code}" role="button" tabindex="0">
                <div class="quiz-code">${quiz.code}</div>
                <div class="quiz-desc">
                    <strong>${quiz.title}</strong><br>
                    <small>${meta.levelShort} • ${meta.subjectShort} • ${meta.grade}</small><br>
                    <small>Chapter ${meta.chapter}, Worksheet ${meta.worksheet}</small>
                </div>
                <div class="quiz-folder">${quiz.folderPath}</div>
            </div>
        `;
    });
    
    quizListDiv.innerHTML = html;
    
    // Add click handlers with keyboard support
    document.querySelectorAll('.quiz-item').forEach(item => {
        item.addEventListener('click', handleQuizItemClick);
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleQuizItemClick(e);
            }
        });
    });
}

function handleQuizItemClick(e) {
    const item = e.currentTarget;
    const code = item.dataset.code;
    
    // Set the code
    currentCode = code.split('');
    currentDigitIndex = 6;
    updateCodeDisplay();
    validateCode();
    
    // Highlight selected
    document.querySelectorAll('.quiz-item').forEach(i => {
        i.classList.remove('active');
        i.setAttribute('aria-selected', 'false');
    });
    item.classList.add('active');
    item.setAttribute('aria-selected', 'true');
    item.focus();
    
    // Scroll to validation section on mobile
    if (isMobile) {
        document.querySelector('.code-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }
}

function validateCode() {
    const code = currentCode.join('');
    
    if (!currentGame.allQuizzes[code]) {
        showError(`Quiz code ${code} not found. Available quizzes are listed below.`);
        if (window.vibrate) window.vibrate([100, 50, 100]);
        return;
    }
    
    // Load the quiz
    currentGame.quizData = currentGame.allQuizzes[code];
    
    // Update quiz info display
    updateQuizInfoDisplay();
    
    // Enable start button
    const startBtn = document.getElementById('start-game');
    startBtn.disabled = false;
    startBtn.focus();
    document.getElementById('start-error').textContent = '';
    
    // Provide feedback
    showFeedback(`✅ Quiz "${currentGame.quizData.title}" loaded successfully`, 'success');
    if (window.vibrate) window.vibrate([30, 20, 30]);
}

function updateQuizInfoDisplay() {
    const infoDiv = document.getElementById('quiz-info');
    const metadata = currentGame.quizData.metadata;
    
    document.getElementById('quiz-title-display').textContent = currentGame.quizData.title;
    document.getElementById('quiz-folder-display').textContent = currentGame.quizData.folderPath;
    document.getElementById('quiz-grade-display').textContent = `${metadata.grade} • ${metadata.subject}`;
    document.getElementById('quiz-count-display').textContent = `${currentGame.quizData.questions.length} question${currentGame.quizData.questions.length !== 1 ? 's' : ''}`;
    
    infoDiv.style.display = 'block';
    
    // Scroll into view on mobile
    if (isMobile) {
        infoDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ==========================================================================
// Game Functions
// ==========================================================================
function startGame() {
    if (!currentGame.quizData) {
        showError("No quiz loaded. Please enter a valid code.");
        return;
    }
    
    // Reset game state
    currentGame.currentQuestionIndex = 0;
    currentGame.players[0].score = 0;
    currentGame.players[1].score = 0;
    currentGame.players[0].isActive = true;
    currentGame.players[1].isActive = false;
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    currentGame.selectedBoxes = [];
    currentGame.gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0,
        boxesSelected: 0,
        totalPointsEarned: 0,
        positiveBoxes: 0,
        negativeBoxes: 0
    };
    
    // Update UI
    document.getElementById('game-quiz-title').textContent = currentGame.quizData.title;
    document.getElementById('total-q').textContent = currentGame.quizData.questions.length;
    
    // Switch screens with animation
    screens.start.classList.remove('active');
    setTimeout(() => {
        screens.game.classList.add('active');
        // Load first question after screen transition
        setTimeout(() => {
            loadQuestion();
            updateUI();
        }, 100);
    }, 300);
    
    // Provide haptic feedback on mobile
    if (window.vibrate) window.vibrate(100);
}

function loadQuestion() {
    if (!currentGame.quizData || !currentGame.quizData.questions[currentGame.currentQuestionIndex]) {
        console.error('No question data available');
        return;
    }
    
    const question = currentGame.quizData.questions[currentGame.currentQuestionIndex];
    const optionsContainer = document.getElementById('options-container');
    
    // Clear previous options
    optionsContainer.innerHTML = '';
    
    // Update question text
    document.getElementById('question-text').textContent = question.question;
    document.getElementById('question-points').textContent = `Base: ${question.points} pts`;
    document.getElementById('current-q').textContent = currentGame.currentQuestionIndex + 1;
    
    // Create options with accessibility
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.tabIndex = 0;
        optionElement.setAttribute('role', 'option');
        optionElement.setAttribute('aria-label', `Option ${String.fromCharCode(65 + index)}: ${option}`);
        optionElement.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)}</span>
            <span class="option-text">${option}</span>
        `;
        
        // Add both click and keyboard events
        optionElement.addEventListener('click', () => selectAnswer(index));
        optionElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectAnswer(index);
            }
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Reset answer state
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    currentGame.selectedBoxes = [];
    
    // Reset UI elements
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'none';
    document.getElementById('results-display').style.display = 'none';
    document.getElementById('clear-selections').disabled = false;
    
    // Generate new hidden points for boxes
    generateBoxPoints();
    
    // Update feedback
    document.getElementById('feedback').innerHTML = `
        <div class="feedback-placeholder">
            <span class="feedback-icon">💡</span>
            Select 1-3 boxes, then choose an answer!
        </div>
    `;
    
    // Focus first option for keyboard navigation
    setTimeout(() => {
        const firstOption = optionsContainer.querySelector('.option');
        if (firstOption) firstOption.focus();
    }, 100);
}

function generateBoxPoints() {
    // Create a shuffled copy of point distribution
    const shuffledPoints = [...BOX_POINTS_DISTRIBUTION]
        .sort(() => Math.random() - 0.5)
        .slice(0, 12);
    
    currentGame.boxValues = shuffledPoints;
    
    // Create boxes grid
    const pointsGrid = document.getElementById('points-grid');
    pointsGrid.innerHTML = '';
    
    for (let i = 0; i < 12; i++) {
        const box = document.createElement('div');
        box.className = 'point-box';
        box.dataset.index = i;
        box.tabIndex = 0;
        box.setAttribute('role', 'button');
        box.setAttribute('aria-label', `Box ${i + 1}, hidden points`);
        box.innerHTML = `
            <div class="box-number">${i + 1}</div>
            <div class="box-points">${currentGame.boxValues[i] >= 0 ? '+' : ''}${currentGame.boxValues[i]}</div>
        `;
        
        // Add event listeners
        box.addEventListener('click', () => selectBox(i));
        box.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                selectBox(i);
            }
        });
        
        pointsGrid.appendChild(box);
    }
    
    // Update selection info
    updateSelectionInfo();
}

function selectBox(index) {
    if (currentGame.isAnswerSubmitted) return;
    
    const box = document.querySelector(`.point-box[data-index="${index}"]`);
    
    // Check if box is already selected
    const boxIndex = currentGame.selectedBoxes.indexOf(index);
    
    if (boxIndex > -1) {
        // Deselect box
        currentGame.selectedBoxes.splice(boxIndex, 1);
        box.classList.remove('selected');
        box.setAttribute('aria-label', `Box ${index + 1}, hidden points`);
        provideHapticFeedback();
    } else {
        // Check if we can select more boxes (max 3)
        if (currentGame.selectedBoxes.length >= 3) {
            showFeedback("Maximum 3 boxes allowed!", "warning");
            if (window.vibrate) window.vibrate([100, 50, 100]);
            return;
        }
        
        // Select box
        currentGame.selectedBoxes.push(index);
        box.classList.add('selected');
        box.setAttribute('aria-label', `Box ${index + 1}, selected`);
        provideHapticFeedback();
    }
    
    // Update selection info
    updateSelectionInfo();
    
    // Enable submit button if we have at least 1 box and an answer
    const hasBoxes = currentGame.selectedBoxes.length >= 1;
    const hasAnswer = currentGame.selectedAnswer !== null;
    document.getElementById('submit-answer').disabled = !(hasBoxes && hasAnswer);
}

function updateSelectionInfo() {
    const count = currentGame.selectedBoxes.length;
    document.getElementById('selected-count').textContent = count;
    document.getElementById('selection-count').textContent = `${count}/3`;
    
    // Calculate potential points
    let potentialPoints = 0;
    let riskLevel = "Low";
    
    if (count > 0) {
        currentGame.selectedBoxes.forEach(index => {
            potentialPoints += currentGame.boxValues[index];
        });
        
        // Determine risk level
        const positiveCount = currentGame.selectedBoxes.filter(i => currentGame.boxValues[i] > 0).length;
        const negativeCount = currentGame.selectedBoxes.filter(i => currentGame.boxValues[i] < 0).length;
        
        if (negativeCount > positiveCount) {
            riskLevel = "High Risk";
        } else if (negativeCount === positiveCount) {
            riskLevel = "Medium Risk";
        } else {
            riskLevel = "Low Risk";
        }
    }
    
    document.getElementById('points-total').textContent = `Potential Points: ${potentialPoints >= 0 ? '+' : ''}${potentialPoints}`;
    document.getElementById('points-risk').textContent = `Risk Level: ${riskLevel}`;
}

function clearSelections() {
    if (currentGame.isAnswerSubmitted) return;
    
    currentGame.selectedBoxes = [];
    document.querySelectorAll('.point-box').forEach(box => {
        box.classList.remove('selected');
        box.setAttribute('aria-label', `Box ${parseInt(box.dataset.index) + 1}, hidden points`);
    });
    
    updateSelectionInfo();
    document.getElementById('submit-answer').disabled = true;
    provideHapticFeedback();
}

function selectAnswer(index) {
    if (currentGame.isAnswerSubmitted) return;
    
    // Remove selected class from all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
        opt.setAttribute('aria-selected', 'false');
    });
    
    // Add selected class to clicked option
    const selectedOption = document.querySelectorAll('.option')[index];
    selectedOption.classList.add('selected');
    selectedOption.setAttribute('aria-selected', 'true');
    selectedOption.focus();
    
    currentGame.selectedAnswer = index;
    
    // Enable submit button if we have at least 1 box
    document.getElementById('submit-answer').disabled = currentGame.selectedBoxes.length === 0;
    provideHapticFeedback();
}

function submitAnswer() {
    if (currentGame.selectedAnswer === null || currentGame.selectedBoxes.length === 0 || currentGame.isAnswerSubmitted) return;
    
    const question = currentGame.quizData.questions[currentGame.currentQuestionIndex];
    const isCorrect = currentGame.selectedAnswer === question.correct;
    const activePlayer = currentGame.players.find(p => p.isActive);
    
    // Update game stats
    currentGame.gameStats.questionsAnswered++;
    if (isCorrect) currentGame.gameStats.correctAnswers++;
    currentGame.gameStats.boxesSelected += currentGame.selectedBoxes.length;
    
    // Calculate points from selected boxes
    let pointsEarned = 0;
    let boxResultsHTML = '';
    
    currentGame.selectedBoxes.forEach((boxIndex, i) => {
        const boxValue = currentGame.boxValues[boxIndex];
        let earnedValue = isCorrect ? boxValue : 0;
        
        // Update game stats
        if (earnedValue > 0) currentGame.gameStats.positiveBoxes++;
        if (earnedValue < 0) currentGame.gameStats.negativeBoxes++;
        currentGame.gameStats.totalPointsEarned += earnedValue;
        
        pointsEarned += earnedValue;
        
        // Add to box results
        const resultClass = earnedValue > 0 ? 'positive' : earnedValue < 0 ? 'negative' : '';
        const resultSign = earnedValue > 0 ? '+' : '';
        boxResultsHTML += `
            <div class="box-result-item">
                <div class="box-result-number">${boxIndex + 1}</div>
                <div class="box-result-points ${resultClass}">
                    ${isCorrect ? `${resultSign}${earnedValue} points` : '0 points (wrong answer)'}
                </div>
            </div>
        `;
        
        // Reveal box
        const box = document.querySelector(`.point-box[data-index="${boxIndex}"]`);
        box.classList.add('revealed');
        if (earnedValue > 0) box.classList.add('positive');
        else if (earnedValue < 0) box.classList.add('negative');
    });
    
    // Update player score
    activePlayer.score += pointsEarned;
    
    // Show feedback with animation
    const feedback = document.getElementById('feedback');
    if (isCorrect) {
        feedback.innerHTML = `
            <div class="feedback-correct">
                <span class="feedback-icon">✅</span>
                <strong>Correct!</strong> You earned ${pointsEarned >= 0 ? '+' : ''}${pointsEarned} points from ${currentGame.selectedBoxes.length} box(es).
                <div class="explanation">${question.explanation || ''}</div>
            </div>
        `;
        if (window.vibrate) window.vibrate([100, 50, 100]);
    } else {
        feedback.innerHTML = `
            <div class="feedback-incorrect">
                <span class="feedback-icon">❌</span>
                <strong>Incorrect!</strong> No points earned (wrong answer).
                <div class="explanation">${question.explanation || ''}</div>
                <div class="correct-answer">Correct answer: ${question.options[question.correct]}</div>
            </div>
        `;
        if (window.vibrate) window.vibrate([200, 100, 200]);
    }
    
    // Show results display
    document.getElementById('box-results').innerHTML = boxResultsHTML;
    document.getElementById('total-earned').innerHTML = `Total Earned: <span>${pointsEarned >= 0 ? '+' : ''}${pointsEarned}</span> points`;
    document.getElementById('results-display').style.display = 'block';
    
    // Highlight correct/incorrect answers
    document.querySelectorAll('.option').forEach((opt, index) => {
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === currentGame.selectedAnswer && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Disable all boxes and options
    document.querySelectorAll('.point-box').forEach(box => {
        box.classList.add('disabled');
        box.setAttribute('tabindex', '-1');
    });
    
    document.querySelectorAll('.option').forEach(opt => {
        opt.setAttribute('tabindex', '-1');
    });
    
    currentGame.isAnswerSubmitted = true;
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('next-question').style.display = 'block';
    document.getElementById('clear-selections').disabled = true;
    
    // Focus next question button
    setTimeout(() => {
        document.getElementById('next-question').focus();
    }, 500);
}

function nextQuestion() {
    currentGame.currentQuestionIndex++;
    
    // Switch active player
    currentGame.players[0].isActive = !currentGame.players[0].isActive;
    currentGame.players[1].isActive = !currentGame.players[1].isActive;
    
    if (currentGame.currentQuestionIndex < currentGame.quizData.questions.length) {
        loadQuestion();
        updateUI();
        provideHapticFeedback();
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
        
        // Update accessibility attributes
        playerElement.setAttribute('aria-label', `${player.name}${player.isActive ? ' (Current Turn)' : ''}, Score: ${player.score}`);
    });
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
            <div class="stat-label">Boxes Selected</div>
            <div class="stat-value">${currentGame.gameStats.boxesSelected}</div>
        </div>
        <div class="stat-item">
            <div class="stat-label">Total Points</div>
            <div class="stat-value">${currentGame.gameStats.totalPointsEarned}</div>
        </div>
    `;
    
    // Switch to game over screen with animation
    screens.game.classList.remove('active');
    setTimeout(() => {
        screens.gameOver.classList.add('active');
        // Focus play again button
        setTimeout(() => {
            document.getElementById('play-again').focus();
        }, 100);
    }, 300);
    
    // Celebration haptic feedback on mobile
    if (window.vibrate) window.vibrate([100, 50, 100, 50, 100]);
}

// ==========================================================================
// Navigation Functions
// ==========================================================================
function goToHome() {
    screens.game.classList.remove('active');
    screens.gameOver.classList.remove('active');
    setTimeout(() => {
        screens.start.classList.add('active');
        // Focus on code input
        setTimeout(() => {
            document.querySelector('.code-digit').focus();
        }, 100);
    }, 300);
    provideHapticFeedback();
}

function playAgain() {
    // Reset game state but keep current quiz
    currentGame.currentQuestionIndex = 0;
    currentGame.players[0].score = 0;
    currentGame.players[1].score = 0;
    currentGame.players[0].isActive = true;
    currentGame.players[1].isActive = false;
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    currentGame.selectedBoxes = [];
    currentGame.gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0,
        boxesSelected: 0,
        totalPointsEarned: 0,
        positiveBoxes: 0,
        negativeBoxes: 0
    };
    
    screens.gameOver.classList.remove('active');
    setTimeout(() => {
        screens.game.classList.add('active');
        loadQuestion();
        updateUI();
    }, 300);
    provideHapticFeedback();
}

function newQuiz() {
    screens.gameOver.classList.remove('active');
    setTimeout(() => {
        screens.start.classList.add('active');
        clearCode();
        document.getElementById('quiz-info').style.display = 'none';
        document.getElementById('start-game').disabled = true;
        // Focus on code input
        setTimeout(() => {
            document.querySelector('.code-digit').focus();
        }, 100);
    }, 300);
    provideHapticFeedback();
}

// ==========================================================================
// UI Utility Functions
// ==========================================================================
function showFeedback(message, type) {
    const feedback = document.createElement('div');
    feedback.className = `feedback-toast feedback-${type}`;
    feedback.setAttribute('role', 'alert');
    feedback.setAttribute('aria-live', 'assertive');
    feedback.innerHTML = `
        <span class="feedback-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    document.body.appendChild(feedback);
    
    // Remove after 3 seconds
    setTimeout(() => {
        feedback.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }, 3000);
}

function showError(message) {
    const errorDiv = document.getElementById('start-error');
    errorDiv.textContent = message;
    errorDiv.style.color = '#f44336';
    
    // Scroll into view on mobile
    if (isMobile) {
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
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

function handleResize() {
    // Update any dynamic layouts if needed
    const isNowMobile = window.innerWidth <= 768;
    
    // Update touch detection if needed
    if (isNowMobile && !isTouchDevice) {
        document.body.classList.add('touch-device');
    } else if (!isNowMobile && isTouchDevice) {
        document.body.classList.remove('touch-device');
    }
}

// ==========================================================================
// Add CSS for feedback toasts and mobile optimizations
// ==========================================================================
const style = document.createElement('style');
style.textContent = `
    .feedback-toast {
        position: fixed;
        top: max(20px, env(safe-area-inset-top));
        right: max(20px, env(safe-area-inset-right));
        left: max(20px, env(safe-area-inset-left));
        padding: 15px 20px;
        border-radius: 12px;
        color: white;
        font-weight: 600;
        z-index: 2000;
        animation: slideInMobile 0.3s ease;
        box-shadow: 0 10px 25px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        gap: 12px;
        backdrop-filter: blur(10px);
        border: 2px solid rgba(255,255,255,0.1);
        max-width: 500px;
        margin: 0 auto;
    }
    
    @media (min-width: 768px) {
        .feedback-toast {
            left: auto;
            right: 25px;
            max-width: 450px;
        }
    }
    
    @keyframes slideInMobile {
        from { 
            transform: translateY(-100%); 
            opacity: 0; 
        }
        to { 
            transform: translateY(0); 
            opacity: 1; 
        }
    }
    
    @keyframes slideOut {
        from { 
            transform: translateY(0); 
            opacity: 1; 
        }
        to { 
            transform: translateY(-100%); 
            opacity: 0; 
        }
    }
    
    .feedback-success { 
        background: linear-gradient(135deg, rgba(76, 175, 80, 0.95), rgba(56, 142, 60, 0.95));
        border-left: 6px solid #2e7d32;
    }
    
    .feedback-error { 
        background: linear-gradient(135deg, rgba(244, 67, 54, 0.95), rgba(211, 47, 47, 0.95));
        border-left: 6px solid #c62828;
    }
    
    .feedback-warning { 
        background: linear-gradient(135deg, rgba(255, 152, 0, 0.95), rgba(245, 124, 0, 0.95));
        border-left: 6px solid #ef6c00;
    }
    
    .feedback-info { 
        background: linear-gradient(135deg, rgba(33, 150, 243, 0.95), rgba(25, 118, 210, 0.95));
        border-left: 6px solid #1565c0;
    }
    
    /* Mobile-specific optimizations */
    @media (max-width: 480px) {
        .option:focus {
            outline: 3px solid #2196f3;
            outline-offset: 2px;
        }
        
        .point-box:focus {
            outline: 3px solid #ff9800;
            outline-offset: 2px;
        }
        
        .keypad-btn:focus {
            outline: 3px solid #2196f3;
            outline-offset: 2px;
        }
    }
    
    /* Prevent text selection on interactive elements */
    .keypad-btn,
    .btn,
    .option,
    .point-box,
    .quiz-item {
        -webkit-user-select: none;
        user-select: none;
    }
    
    /* Improve scrolling on mobile */
    .quiz-list {
        -webkit-overflow-scrolling: touch;
    }
    
    /* Safe area insets for notched devices */
    .container {
        padding-top: env(safe-area-inset-top);
        padding-bottom: env(safe-area-inset-bottom);
    }
`;
document.head.appendChild(style);

// ==========================================================================
// Initialize any remaining setup
// ==========================================================================
// Check for service worker support (optional PWA feature)
if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(error => {
            console.log('ServiceWorker registration failed:', error);
        });
    });
}

// Handle offline/online status
window.addEventListener('online', () => {
    showFeedback("You're back online!", 'success');
});

window.addEventListener('offline', () => {
    showFeedback("You're offline. Some features may not work.", 'warning');
});