// Brain Battle Game - Main JavaScript File
document.addEventListener('DOMContentLoaded', function() {
    // Game State Variables
    let gameState = {
        currentScreen: 'start',
        currentQuestionIndex: 0,
        currentPlayer: 1,
        selectedQuiz: null,
        quizData: null,
        playerScores: { 1: 0, 2: 0 },
        playerPowers: {
            1: { reveal: 2, double: 1, block: 1, swap: 1 },
            2: { reveal: 2, double: 1, block: 1, swap: 1 }
        },
        activePower: null,
        selectedBoxes: [],
        selectedOption: null,
        chanceLevel: 50, // 0-100
        controlLevel: 50, // 0-100
        gameStats: {
            questionsAnswered: 0,
            powersUsed: { 1: 0, 2: 0 },
            riskTaken: 0,
            totalPointsEarned: { 1: 0, 2: 0 }
        }
    };

    // Points configuration for boxes
    const BOX_POINTS = {
        lowRisk: [
            { min: 5, max: 15 },
            { min: 8, max: 18 },
            { min: 6, max: 12 },
            { min: 4, max: 10 },
            { min: 7, max: 14 },
            { min: 9, max: 20 }
        ],
        highRisk: [
            { min: -10, max: 30 },
            { min: -15, max: 40 },
            { min: -20, max: 50 },
            { min: -25, max: 60 },
            { min: -30, max: 70 },
            { min: -40, max: 100 }
        ]
    };

    // DOM Elements
    const screens = {
        start: document.getElementById('start-screen'),
        game: document.getElementById('game-screen'),
        gameOver: document.getElementById('game-over')
    };

    // Code input elements
    const codeDigits = document.querySelectorAll('.code-digit');
    const keypadButtons = document.querySelectorAll('.keypad-btn');
    const backspaceBtn = document.getElementById('backspace');
    const clearBtn = document.getElementById('clear');
    const validateBtn = document.getElementById('validate-code');
    const rescanBtn = document.getElementById('rescan-quizzes');
    const startError = document.getElementById('start-error');

    // Quiz info elements
    const quizInfo = document.getElementById('quiz-info');
    const quizTitleDisplay = document.getElementById('quiz-title-display');
    const quizGradeDisplay = document.getElementById('quiz-grade-display');
    const quizCountDisplay = document.getElementById('quiz-count-display');
    const startGameBtn = document.getElementById('start-game');

    // Game screen elements
    const gameQuizTitle = document.getElementById('game-quiz-title');
    const currentQ = document.getElementById('current-q');
    const totalQ = document.getElementById('total-q');
    const chanceMeter = document.getElementById('chance-meter');
    const controlMeter = document.getElementById('control-meter');
    
    // Player elements
    const player1 = document.getElementById('player1');
    const player2 = document.getElementById('player2');
    const playerScoresEl = {
        1: document.querySelector('#player1 .player-score'),
        2: document.querySelector('#player2 .player-score')
    };
    
    // Power count elements
    const powerCounts = {
        1: {
            reveal: document.getElementById('p1-reveal'),
            double: document.getElementById('p1-double'),
            block: document.getElementById('p1-block'),
            swap: document.getElementById('p1-swap')
        },
        2: {
            reveal: document.getElementById('p2-reveal'),
            double: document.getElementById('p2-double'),
            block: document.getElementById('p2-block'),
            swap: document.getElementById('p2-swap')
        }
    };

    // Question elements
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const basePoints = document.getElementById('base-points');
    const questionPoints = document.getElementById('question-points');

    // Box selection elements
    const pointsGridLow = document.getElementById('points-grid-low');
    const pointsGridHigh = document.getElementById('points-grid-high');
    const selectedCount = document.getElementById('selected-count');
    const riskIndicator = document.getElementById('risk-indicator');
    const potentialPoints = document.getElementById('potential-points');
    const multiplierDisplay = document.getElementById('multiplier-display');
    const multiplierValue = document.getElementById('multiplier-value');
    const clearSelectionsBtn = document.getElementById('clear-selections');

    // Power controls
    const powerButtons = document.querySelectorAll('.power-btn');
    const activePowerDisplay = document.getElementById('active-power-display');

    // Game control buttons
    const submitAnswerBtn = document.getElementById('submit-answer');
    const nextQuestionBtn = document.getElementById('next-question');
    const skipQuestionBtn = document.getElementById('skip-question');
    const homeBtn = document.getElementById('home-btn');

    // Feedback and results
    const feedback = document.getElementById('feedback');
    const resultsDisplay = document.getElementById('results-display');
    const boxResults = document.getElementById('box-results');
    const totalEarned = document.getElementById('total-earned');
    const powerEffects = document.getElementById('power-effects');

    // Chance popup
    const chancePopup = document.getElementById('chance-popup');
    const chanceEventIcon = document.getElementById('chance-event-icon');
    const chanceEventTitle = document.getElementById('chance-event-title');
    const chanceEventDesc = document.getElementById('chance-event-desc');
    const closeChanceBtn = document.getElementById('close-chance');

    // Game over screen
    const finalScore1 = document.getElementById('final-score1');
    const finalScore2 = document.getElementById('final-score2');
    const finalPowers1 = document.getElementById('final-powers1');
    const finalPowers2 = document.getElementById('final-powers2');
    const gameStatsContainer = document.getElementById('game-stats');
    const chanceTaken = document.getElementById('chance-taken');
    const controlUsed = document.getElementById('control-used');
    const riskReward = document.getElementById('risk-reward');
    const playAgainBtn = document.getElementById('play-again');
    const newQuizBtn = document.getElementById('new-quiz');
    const showStrategyBtn = document.getElementById('show-strategy');

    // Loading overlay
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = document.getElementById('loading-text');
    const loadingDetails = document.getElementById('loading-details');

    // Strategy modal
    const strategyModal = document.getElementById('strategy-modal');
    const closeStrategyBtn = document.getElementById('close-strategy');

    // Demo buttons
    const demoButtons = document.querySelectorAll('.demo-btn');

    // Available quizzes cache
    let availableQuizzes = [];

    // Initialize the game
    initGame();

    function initGame() {
        // Set up event listeners
        setupEventListeners();
        
        // Scan for available quizzes
        scanQuizzes();
        
        // Initialize code input
        initCodeInput();
        
        // Check if we're on a touch device
        detectTouchDevice();
    }

    function setupEventListeners() {
        // Code keypad
        keypadButtons.forEach(btn => {
            if (!btn.id) { // Only number buttons
                btn.addEventListener('click', () => handleCodeInput(btn.dataset.key));
            }
        });
        
        backspaceBtn.addEventListener('click', handleBackspace);
        clearBtn.addEventListener('click', handleClear);
        validateBtn.addEventListener('click', validateCode);
        rescanBtn.addEventListener('click', scanQuizzes);
        startGameBtn.addEventListener('click', startGame);
        
        // Demo buttons
        demoButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const code = btn.dataset.code;
                enterDemoCode(code);
            });
        });
        
        // Power buttons
        powerButtons.forEach(btn => {
            btn.addEventListener('click', () => activatePower(btn.dataset.power));
        });
        
        // Game controls
        submitAnswerBtn.addEventListener('click', submitAnswer);
        nextQuestionBtn.addEventListener('click', nextQuestion);
        skipQuestionBtn.addEventListener('click', skipQuestion);
        homeBtn.addEventListener('click', goHome);
        clearSelectionsBtn.addEventListener('click', clearSelections);
        
        // Chance popup
        closeChanceBtn.addEventListener('click', () => {
            chancePopup.style.display = 'none';
        });
        
        // Game over buttons
        playAgainBtn.addEventListener('click', playAgain);
        newQuizBtn.addEventListener('click', newQuiz);
        showStrategyBtn.addEventListener('click', showStrategy);
        closeStrategyBtn.addEventListener('click', () => {
            strategyModal.style.display = 'none';
        });
    }

    function initCodeInput() {
        let currentDigit = 0;
        
        // Handle clicking on code digits
        codeDigits.forEach((digit, index) => {
            digit.addEventListener('click', () => {
                codeDigits.forEach(d => d.classList.remove('active'));
                digit.classList.add('active');
                currentDigit = index;
            });
        });
        
        // Set first digit as active
        codeDigits[0].classList.add('active');
    }

    function handleCodeInput(key) {
        const activeDigit = document.querySelector('.code-digit.active');
        if (!activeDigit) return;
        
        const index = parseInt(activeDigit.dataset.index);
        activeDigit.textContent = key;
        activeDigit.classList.remove('active');
        
        // Move to next digit if available
        if (index < 5) {
            codeDigits[index + 1].classList.add('active');
        }
        
        updateValidateButton();
    }

    function handleBackspace() {
        const activeDigit = document.querySelector('.code-digit.active');
        let index;
        
        if (activeDigit) {
            index = parseInt(activeDigit.dataset.index);
        } else {
            // If no active digit, clear the last one
            index = 5;
            while (index >= 0 && codeDigits[index].textContent === '_') {
                index--;
            }
            if (index < 0) return;
        }
        
        codeDigits[index].textContent = '_';
        codeDigits[index].classList.add('active');
        
        // Remove active from other digits
        codeDigits.forEach((digit, i) => {
            if (i !== index) digit.classList.remove('active');
        });
        
        updateValidateButton();
    }

    function handleClear() {
        codeDigits.forEach(digit => {
            digit.textContent = '_';
            digit.classList.remove('active');
        });
        codeDigits[0].classList.add('active');
        updateValidateButton();
        hideQuizInfo();
    }

    function updateValidateButton() {
        const code = getCurrentCode();
        validateBtn.disabled = code.length !== 6;
    }

    function getCurrentCode() {
        let code = '';
        codeDigits.forEach(digit => {
            if (digit.textContent !== '_') {
                code += digit.textContent;
            }
        });
        return code;
    }

    function enterDemoCode(code) {
        clearCode();
        code.split('').forEach((char, index) => {
            if (index < 6) {
                codeDigits[index].textContent = char;
            }
        });
        updateValidateButton();
        validateCode();
    }

    function clearCode() {
        codeDigits.forEach(digit => {
            digit.textContent = '_';
            digit.classList.remove('active');
        });
        codeDigits[0].classList.add('active');
        hideQuizInfo();
        updateValidateButton();
    }

    function validateCode() {
        const code = getCurrentCode();
        if (code.length !== 6) return;
        
        showLoading('Validating code...');
        
        // Simulate network delay
        setTimeout(() => {
            const quiz = findQuizByCode(code);
            if (quiz) {
                gameState.selectedQuiz = quiz;
                showQuizInfo(quiz);
                startError.textContent = '';
                startGameBtn.disabled = false;
            } else {
                showError('Invalid code. Please try another code.');
                hideQuizInfo();
                startGameBtn.disabled = true;
            }
            hideLoading();
        }, 500);
    }

    function findQuizByCode(code) {
        // Try to find quiz in cache first
        const cachedQuiz = availableQuizzes.find(q => q.code === code);
        if (cachedQuiz) return cachedQuiz;
        
        // Parse code to determine file path
        const level = parseInt(code[0]);
        const subject = parseInt(code[1]);
        const grade = parseInt(code[2]);
        const chapter = parseInt(code.substring(3, 5));
        const worksheet = parseInt(code[5]);
        
        // Construct file path based on code structure
        let filePath = '';
        
        // Level mapping
        const levels = ['primary', 'lower-secondary', 'upper-secondary'];
        const levelName = levels[level - 1] || levels[0];
        
        // Subject mapping based on level
        const subjectMap = {
            1: { // Primary
                0: 'math',
                1: 'science'
            },
            2: { // Lower Secondary
                0: 'math',
                1: 'science'
            },
            3: { // Upper Secondary
                0: 'math',
                2: 'combined-physics',
                3: 'pure-physics',
                4: 'combined-chem',
                5: 'pure-chem'
            }
        };
        
        const subjectName = subjectMap[level]?.[subject] || 'math';
        
        filePath = `Questions/${levelName}/${subjectName}/${code}.json`;
        
        return {
            code: code,
            path: filePath,
            title: `Quiz ${code}`,
            grade: `Level ${level}, Subject ${subject}`,
            questionCount: 0 // Will be updated when loaded
        };
    }

    function showQuizInfo(quiz) {
        quizTitleDisplay.textContent = quiz.title;
        quizGradeDisplay.textContent = quiz.grade;
        quizCountDisplay.textContent = quiz.questionCount || 'Loading...';
        quizInfo.style.display = 'block';
        
        // Load quiz data to get actual question count
        loadQuizData(quiz.code);
    }

    function hideQuizInfo() {
        quizInfo.style.display = 'none';
        gameState.selectedQuiz = null;
        quizData = null;
    }

    async function loadQuizData(code) {
        showLoading('Loading quiz questions...');
        
        try {
            // Construct the file path from code
            const level = parseInt(code[0]);
            const subject = parseInt(code[1]);
            
            const levels = ['primary', 'lower-secondary', 'upper-secondary'];
            const levelName = levels[level - 1] || levels[0];
            
            const subjectMap = {
                1: {0: 'math', 1: 'science'},
                2: {0: 'math', 1: 'science'},
                3: {0: 'math', 2: 'combined-physics', 3: 'pure-physics', 4: 'combined-chem', 5: 'pure-chem'}
            };
            
            const subjectName = subjectMap[level]?.[subject] || 'math';
            const filePath = `Questions/${levelName}/${subjectName}/${code}.json`;
            
            const response = await fetch(filePath);
            if (!response.ok) throw new Error('Quiz not found');
            
            const data = await response.json();
            gameState.quizData = data;
            
            // Update quiz info with actual count
            quizCountDisplay.textContent = data.questions.length;
            quizTitleDisplay.textContent = data.title || `Quiz ${code}`;
            quizGradeDisplay.textContent = data.subject || `Level ${level}`;
            
            hideLoading();
            return true;
        } catch (error) {
            console.error('Error loading quiz:', error);
            showError('Failed to load quiz. Please check the code and try again.');
            hideQuizInfo();
            hideLoading();
            return false;
        }
    }

    function scanQuizzes() {
        showLoading('Scanning for available quizzes...');
        
        // This would normally scan the Questions directory
        // For now, we'll use a predefined list of demo quizzes
        setTimeout(() => {
            availableQuizzes = [
                {
                    code: '304021',
                    path: 'Questions/upper-secondary/math/304021.json',
                    title: 'Secondary 4 Math: Algebra',
                    grade: 'Upper Secondary, Mathematics',
                    questionCount: 5
                },
                {
                    code: '304022',
                    path: 'Questions/upper-secondary/math/304022.json',
                    title: 'Secondary 4 Math: Advanced Algebra',
                    grade: 'Upper Secondary, Mathematics',
                    questionCount: 5
                },
                {
                    code: '101021',
                    path: 'Questions/primary/math/101021.json',
                    title: 'Primary 1 Math: Basic Arithmetic',
                    grade: 'Primary, Mathematics',
                    questionCount: 5
                }
            ];
            
            loadingDetails.textContent = `Found ${availableQuizzes.length} quizzes`;
            setTimeout(hideLoading, 1000);
        }, 1500);
    }

    function startGame() {
        if (!gameState.selectedQuiz || !gameState.quizData) {
            showError('Please select a valid quiz first.');
            return;
        }
        
        // Reset game state
        resetGameState();
        
        // Switch to game screen
        switchScreen('game');
        
        // Initialize game display
        initializeGameDisplay();
        
        // Load first question
        loadQuestion(gameState.currentQuestionIndex);
        
        // Initialize points grid
        initializePointsGrid();
    }

    function resetGameState() {
        gameState.currentQuestionIndex = 0;
        gameState.currentPlayer = 1;
        gameState.playerScores = { 1: 0, 2: 0 };
        gameState.playerPowers = {
            1: { reveal: 2, double: 1, block: 1, swap: 1 },
            2: { reveal: 2, double: 1, block: 1, swap: 1 }
        };
        gameState.activePower = null;
        gameState.selectedBoxes = [];
        gameState.selectedOption = null;
        gameState.chanceLevel = 50;
        gameState.controlLevel = 50;
        gameState.gameStats = {
            questionsAnswered: 0,
            powersUsed: { 1: 0, 2: 0 },
            riskTaken: 0,
            totalPointsEarned: { 1: 0, 2: 0 }
        };
    }

    function switchScreen(screenName) {
        // Hide all screens
        Object.values(screens).forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        if (screens[screenName]) {
            screens[screenName].classList.add('active');
        }
        
        gameState.currentScreen = screenName;
    }

    function initializeGameDisplay() {
        // Set quiz title
        if (gameState.quizData && gameState.quizData.title) {
            gameQuizTitle.textContent = gameState.quizData.title;
        } else {
            gameQuizTitle.textContent = gameState.selectedQuiz.title;
        }
        
        // Set total questions
        if (gameState.quizData && gameState.quizData.questions) {
            totalQ.textContent = gameState.quizData.questions.length;
        }
        
        // Update player displays
        updatePlayerDisplay();
        updatePowerCounts();
        
        // Reset active power
        activePowerDisplay.textContent = 'No active power';
        activePowerDisplay.style.backgroundColor = '';
        
        // Update meters
        updateChanceControlMeters();
    }

    function updatePlayerDisplay() {
        // Update scores
        playerScoresEl[1].textContent = gameState.playerScores[1];
        playerScoresEl[2].textContent = gameState.playerScores[2];
        
        // Update active player
        if (gameState.currentPlayer === 1) {
            player1.classList.add('active');
            player2.classList.remove('active');
        } else {
            player1.classList.remove('active');
            player2.classList.add('active');
        }
        
        // Update turn indicators
        document.querySelectorAll('.turn-indicator').forEach(indicator => {
            indicator.style.opacity = '0';
        });
        
        const activePlayer = document.querySelector(`#player${gameState.currentPlayer} .turn-indicator`);
        if (activePlayer) {
            activePlayer.style.opacity = '1';
        }
    }

    function updatePowerCounts() {
        for (const player of [1, 2]) {
            for (const power of ['reveal', 'double', 'block', 'swap']) {
                const count = gameState.playerPowers[player][power];
                powerCounts[player][power].textContent = count;
                
                // Update power button enabled state
                const powerBtn = document.querySelector(`.power-btn[data-power="${power}"]`);
                if (powerBtn) {
                    if (player === gameState.currentPlayer && count > 0) {
                        powerBtn.disabled = false;
                    } else if (player === gameState.currentPlayer && count === 0) {
                        powerBtn.disabled = true;
                    }
                }
            }
        }
    }

    function loadQuestion(index) {
        if (!gameState.quizData || !gameState.quizData.questions[index]) {
            console.error('Question not found:', index);
            return;
        }
        
        const question = gameState.quizData.questions[index];
        
        // Update question counter
        currentQ.textContent = index + 1;
        
        // Set question text
        questionText.textContent = question.question;
        
        // Set base points
        const points = question.points || 10;
        basePoints.textContent = points;
        
        // Clear previous options
        optionsContainer.innerHTML = '';
        
        // Add new options
        const letters = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, i) => {
            if (i < 4) { // Only show up to 4 options
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.index = i;
                optionElement.innerHTML = `
                    <div class="option-letter">${letters[i]}</div>
                    <div class="option-text">${option}</div>
                `;
                
                optionElement.addEventListener('click', () => selectOption(optionElement));
                optionsContainer.appendChild(optionElement);
            }
        });
        
        // Reset selection state
        gameState.selectedOption = null;
        submitAnswerBtn.disabled = true;
        
        // Clear box selections
        clearSelections();
        
        // Hide results and show feedback
        resultsDisplay.style.display = 'none';
        feedback.innerHTML = `
            <div class="feedback-placeholder">
                <span class="feedback-icon">💡</span>
                Select boxes (1-3) then choose an answer!
            </div>
        `;
        
        // Hide next/skip buttons, show submit
        submitAnswerBtn.style.display = 'block';
        nextQuestionBtn.style.display = 'none';
        skipQuestionBtn.style.display = 'none';
    }

    function initializePointsGrid() {
        // Clear existing boxes
        pointsGridLow.innerHTML = '';
        pointsGridHigh.innerHTML = '';
        
        // Create low risk boxes (1-6)
        for (let i = 1; i <= 6; i++) {
            const box = createPointBox(i, 'low');
            pointsGridLow.appendChild(box);
        }
        
        // Create high risk boxes (7-12)
        for (let i = 7; i <= 12; i++) {
            const box = createPointBox(i, 'high');
            pointsGridHigh.appendChild(box);
        }
        
        updateSelectionInfo();
    }

    function createPointBox(number, riskLevel) {
        const box = document.createElement('div');
        box.className = `point-box ${riskLevel}-risk`;
        box.dataset.boxNumber = number;
        box.dataset.riskLevel = riskLevel;
        box.dataset.points = ''; // Will be set when revealed
        
        const boxNumber = document.createElement('div');
        boxNumber.className = 'box-number';
        boxNumber.textContent = `Box ${number}`;
        
        const boxPoints = document.createElement('div');
        boxPoints.className = 'box-points';
        
        box.appendChild(boxNumber);
        box.appendChild(boxPoints);
        
        box.addEventListener('click', () => selectBox(box));
        
        return box;
    }

    function selectBox(box) {
        const boxNumber = parseInt(box.dataset.boxNumber);
        
        // Check if box is already selected
        if (box.classList.contains('selected')) {
            // Deselect the box
            box.classList.remove('selected');
            gameState.selectedBoxes = gameState.selectedBoxes.filter(num => num !== boxNumber);
            
            // Reset revealed state if needed
            if (box.dataset.revealed === 'true') {
                box.dataset.revealed = 'false';
                box.classList.remove('revealed');
                box.querySelector('.box-points').textContent = '';
                box.style.background = '';
            }
        } else {
            // Check if we can select more boxes
            if (gameState.selectedBoxes.length >= 3) {
                showFeedback('You can only select up to 3 boxes!', 'warning');
                return;
            }
            
            // Select the box
            box.classList.add('selected');
            gameState.selectedBoxes.push(boxNumber);
        }
        
        updateSelectionInfo();
        updateSubmitButtonState();
    }

    function updateSelectionInfo() {
        const count = gameState.selectedBoxes.length;
        selectedCount.textContent = count;
        
        // Calculate risk level based on selected boxes
        let riskScore = 0;
        gameState.selectedBoxes.forEach(boxNum => {
            if (boxNum >= 7) riskScore += 2; // High risk boxes
            else riskScore += 1; // Low risk boxes
        });
        
        let riskLevel = 'Low';
        let riskColor = 'var(--low-risk)';
        
        if (count === 3) {
            if (riskScore >= 5) {
                riskLevel = 'High';
                riskColor = 'var(--high-risk)';
            } else if (riskScore >= 3) {
                riskLevel = 'Medium';
                riskColor = 'var(--medium-risk)';
            }
        }
        
        riskIndicator.textContent = `Risk: ${riskLevel}`;
        riskIndicator.style.color = riskColor;
        
        // Update chance level based on risk
        gameState.chanceLevel = Math.min(100, 50 + (riskScore * 10));
        updateChanceControlMeters();
        
        // Calculate potential points
        calculatePotentialPoints();
    }

    function calculatePotentialPoints() {
        if (gameState.selectedBoxes.length === 0) {
            potentialPoints.textContent = '0';
            return;
        }
        
        let total = 0;
        gameState.selectedBoxes.forEach(boxNum => {
            const riskLevel = boxNum >= 7 ? 'highRisk' : 'lowRisk';
            const index = (boxNum - 1) % 6;
            const range = BOX_POINTS[riskLevel][index];
            
            // Use average of range for potential display
            const avg = (range.min + range.max) / 2;
            total += avg;
        });
        
        // Apply multiplier if double power is active
        const multiplier = gameState.activePower === 'double' ? 2 : 1;
        total *= multiplier;
        
        potentialPoints.textContent = Math.round(total);
        multiplierValue.textContent = `${multiplier}x`;
        multiplierDisplay.style.display = multiplier > 1 ? 'block' : 'none';
    }

    function selectOption(optionElement) {
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        optionElement.classList.add('selected');
        gameState.selectedOption = parseInt(optionElement.dataset.index);
        
        updateSubmitButtonState();
    }

    function updateSubmitButtonState() {
        const canSubmit = gameState.selectedBoxes.length > 0 && gameState.selectedOption !== null;
        submitAnswerBtn.disabled = !canSubmit;
    }

    function submitAnswer() {
        if (gameState.selectedBoxes.length === 0 || gameState.selectedOption === null) {
            showFeedback('Please select boxes and an answer!', 'warning');
            return;
        }
        
        const question = gameState.quizData.questions[gameState.currentQuestionIndex];
        const isCorrect = gameState.selectedOption === question.correctAnswer;
        
        // Process box points
        processBoxPoints(isCorrect);
        
        // Show feedback
        if (isCorrect) {
            showFeedback('Correct! Check your box results below.', 'correct');
        } else {
            showFeedback(`Incorrect. The correct answer was: ${question.options[question.correctAnswer]}`, 'incorrect');
        }
        
        // Update game stats
        gameState.gameStats.questionsAnswered++;
        
        // Show results and next button
        resultsDisplay.style.display = 'block';
        submitAnswerBtn.style.display = 'none';
        nextQuestionBtn.style.display = 'block';
        skipQuestionBtn.style.display = 'block';
        
        // Check for chance event
        if (Math.random() * 100 < gameState.chanceLevel) {
            triggerChanceEvent();
        }
    }

    function processBoxPoints(isCorrect) {
        const question = gameState.quizData.questions[gameState.currentQuestionIndex];
        const basePointsValue = question.points || 10;
        
        let totalPoints = 0;
        const results = [];
        
        gameState.selectedBoxes.forEach(boxNum => {
            const riskLevel = boxNum >= 7 ? 'highRisk' : 'lowRisk';
            const index = (boxNum - 1) % 6;
            const range = BOX_POINTS[riskLevel][index];
            
            // Generate random points within range
            let points = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            
            // If answer is wrong, points are negative
            if (!isCorrect) {
                points = -Math.abs(points);
            }
            
            // Apply double power multiplier
            if (gameState.activePower === 'double') {
                points *= 2;
            }
            
            // Apply base points multiplier
            points = Math.round(points * (basePointsValue / 10));
            
            // Store result
            results.push({
                boxNumber: boxNum,
                points: points,
                isPositive: points >= 0
            });
            
            totalPoints += points;
            
            // Update box display
            const box = document.querySelector(`.point-box[data-box-number="${boxNum}"]`);
            if (box) {
                box.classList.add('revealed');
                box.dataset.revealed = 'true';
                box.querySelector('.box-points').textContent = points >= 0 ? `+${points}` : points;
                box.classList.add(points >= 0 ? 'positive' : 'negative');
                
                if (gameState.activePower === 'double') {
                    box.classList.add('multiplied');
                }
            }
        });
        
        // Update player score
        if (isCorrect) {
            gameState.playerScores[gameState.currentPlayer] += totalPoints;
            gameState.gameStats.totalPointsEarned[gameState.currentPlayer] += totalPoints;
        }
        
        // Update display
        updatePlayerDisplay();
        
        // Show results
        displayBoxResults(results, totalPoints);
        
        // Reset active power
        if (gameState.activePower === 'double') {
            gameState.activePower = null;
            activePowerDisplay.textContent = 'No active power';
            activePowerDisplay.style.backgroundColor = '';
        }
        
        // Update control level
        gameState.controlLevel = Math.min(100, gameState.controlLevel + 10);
        updateChanceControlMeters();
    }

    function displayBoxResults(results, total) {
        boxResults.innerHTML = '';
        
        results.forEach(result => {
            const resultItem = document.createElement('div');
            resultItem.className = 'box-result-item';
            resultItem.innerHTML = `
                <span class="box-result-number">Box ${result.boxNumber}</span>
                <span class="box-result-points ${result.isPositive ? 'positive' : 'negative'}">
                    ${result.points >= 0 ? '+' : ''}${result.points}
                </span>
            `;
            boxResults.appendChild(resultItem);
        });
        
        const totalSpan = totalEarned.querySelector('span');
        totalSpan.textContent = `${total >= 0 ? '+' : ''}${total}`;
        
        // Show power effects if any
        if (gameState.activePower === 'double') {
            powerEffects.innerHTML = '<div>✌️ Double Points applied!</div>';
            powerEffects.style.display = 'block';
        } else {
            powerEffects.style.display = 'none';
        }
    }

    function activatePower(powerType) {
        const player = gameState.currentPlayer;
        
        // Check if player has this power available
        if (gameState.playerPowers[player][powerType] <= 0) {
            showFeedback(`No ${powerType} power available!`, 'warning');
            return;
        }
        
        // Use the power
        gameState.playerPowers[player][powerType]--;
        gameState.activePower = powerType;
        gameState.gameStats.powersUsed[player]++;
        
        // Update displays
        updatePowerCounts();
        
        // Show power activation message
        let powerMessage = '';
        let powerColor = '';
        
        switch(powerType) {
            case 'reveal':
                powerMessage = 'Reveal Box active! Click a box to see its points.';
                powerColor = 'rgba(76, 201, 240, 0.3)';
                break;
            case 'double':
                powerMessage = 'Double Points active! Next box points will be doubled.';
                powerColor = 'rgba(249, 199, 79, 0.3)';
                break;
            case 'block':
                powerMessage = 'Block active! Opponent cannot use powers next turn.';
                powerColor = 'rgba(231, 29, 54, 0.3)';
                break;
            case 'swap':
                powerMessage = 'Swap active! Select boxes to swap with opponent.';
                powerColor = 'rgba(46, 196, 182, 0.3)';
                break;
        }
        
        activePowerDisplay.textContent = powerMessage;
        activePowerDisplay.style.backgroundColor = powerColor;
        
        showFeedback(powerMessage, 'info');
        
        // Special handling for reveal power
        if (powerType === 'reveal') {
            enableBoxReveal();
        }
        
        // Update control level
        gameState.controlLevel = Math.min(100, gameState.controlLevel + 20);
        updateChanceControlMeters();
    }

    function enableBoxReveal() {
        const boxes = document.querySelectorAll('.point-box:not(.revealed)');
        boxes.forEach(box => {
            const originalClick = box.onclick;
            box.style.cursor = 'help';
            box.title = 'Click to reveal points';
            
            box.onclick = function() {
                const boxNum = parseInt(this.dataset.boxNumber);
                const riskLevel = boxNum >= 7 ? 'highRisk' : 'lowRisk';
                const index = (boxNum - 1) % 6;
                const range = BOX_POINTS[riskLevel][index];
                
                // Show average points as hint
                const avg = Math.round((range.min + range.max) / 2);
                this.querySelector('.box-points').textContent = `~${avg}`;
                this.classList.add('revealed');
                this.dataset.revealed = 'true';
                
                // Restore original click handler
                this.onclick = originalClick;
                this.style.cursor = '';
                this.title = '';
                
                // Consume the reveal power
                gameState.activePower = null;
                activePowerDisplay.textContent = 'No active power';
                activePowerDisplay.style.backgroundColor = '';
            };
        });
    }

    function skipQuestion() {
        // Skipping has a penalty
        const penalty = -20;
        gameState.playerScores[gameState.currentPlayer] += penalty;
        
        showFeedback(`Skipped! Penalty: ${penalty} points`, 'warning');
        
        // Update display
        updatePlayerDisplay();
        
        // Move to next question
        nextQuestion();
    }

    function nextQuestion() {
        // Switch to next player
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        
        // Check if there are more questions
        if (gameState.currentQuestionIndex < gameState.quizData.questions.length - 1) {
            gameState.currentQuestionIndex++;
            loadQuestion(gameState.currentQuestionIndex);
        } else {
            endGame();
        }
        
        // Update player display
        updatePlayerDisplay();
        
        // Reset active power (except block if it was used)
        if (gameState.activePower !== 'block') {
            gameState.activePower = null;
            activePowerDisplay.textContent = 'No active power';
            activePowerDisplay.style.backgroundColor = '';
        }
    }

    function triggerChanceEvent() {
        const events = [
            {
                icon: '🎁',
                title: 'Bonus Points!',
                desc: 'You get 50 bonus points for taking a risk!',
                effect: () => {
                    gameState.playerScores[gameState.currentPlayer] += 50;
                    updatePlayerDisplay();
                }
            },
            {
                icon: '🔄',
                title: 'Extra Turn!',
                desc: 'You get an extra turn!',
                effect: () => {
                    // Current player gets another turn
                    showFeedback('Extra turn earned!', 'info');
                }
            },
            {
                icon: '📊',
                title: 'Point Swap!',
                desc: 'Your points are swapped with your opponent!',
                effect: () => {
                    const temp = gameState.playerScores[1];
                    gameState.playerScores[1] = gameState.playerScores[2];
                    gameState.playerScores[2] = temp;
                    updatePlayerDisplay();
                }
            },
            {
                icon: '⚡',
                title: 'Power Surge!',
                desc: 'All your powers are replenished!',
                effect: () => {
                    for (const power in gameState.playerPowers[gameState.currentPlayer]) {
                        gameState.playerPowers[gameState.currentPlayer][power] = 
                            power === 'reveal' ? 2 : 1;
                    }
                    updatePowerCounts();
                }
            }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        
        chanceEventIcon.textContent = event.icon;
        chanceEventTitle.textContent = event.title;
        chanceEventDesc.textContent = event.desc;
        
        chancePopup.style.display = 'flex';
        
        // Apply event effect
        event.effect();
    }

    function endGame() {
        // Calculate winner
        let winner = 1;
        if (gameState.playerScores[2] > gameState.playerScores[1]) {
            winner = 2;
        } else if (gameState.playerScores[1] === gameState.playerScores[2]) {
            winner = 0; // Draw
        }
        
        // Update game over screen
        updateGameOverScreen(winner);
        
        // Switch to game over screen
        switchScreen('gameOver');
    }

    function updateGameOverScreen(winner) {
        // Update scores
        finalScore1.textContent = gameState.playerScores[1];
        finalScore2.textContent = gameState.playerScores[2];
        
        // Update powers used
        finalPowers1.textContent = gameState.gameStats.powersUsed[1];
        finalPowers2.textContent = gameState.gameStats.powersUsed[2];
        
        // Update winner display
        const trophy = document.getElementById('winner-trophy');
        const message = document.getElementById('winner-message');
        const style = document.getElementById('winner-style');
        
        if (winner === 0) {
            trophy.textContent = '🤝';
            message.textContent = 'It\'s a Draw!';
            style.textContent = 'Both players showed great skill!';
        } else {
            trophy.textContent = '🏆';
            message.textContent = `Player ${winner} Wins!`;
            style.textContent = `Congratulations Player ${winner}!`;
        }
        
        // Update game stats
        updateGameStats();
        
        // Calculate strategy stats
        const totalRiskTaken = gameState.gameStats.riskTaken;
        const avgRisk = totalRiskTaken / gameState.gameStats.questionsAnswered || 0;
        
        const totalControlUsed = gameState.gameStats.powersUsed[1] + gameState.gameStats.powersUsed[2];
        const avgControl = (totalControlUsed / gameState.gameStats.questionsAnswered) * 10 || 0;
        
        const riskRewardRatio = gameState.gameStats.totalPointsEarned[1] + gameState.gameStats.totalPointsEarned[2];
        
        chanceTaken.textContent = `${Math.round(avgRisk)}%`;
        controlUsed.textContent = `${Math.round(avgControl)}%`;
        riskReward.textContent = riskRewardRatio;
    }

    function updateGameStats() {
        const stats = [
            { label: 'Questions', value: gameState.gameStats.questionsAnswered },
            { label: 'Total Points', value: gameState.playerScores[1] + gameState.playerScores[2] },
            { label: 'Powers Used', value: gameState.gameStats.powersUsed[1] + gameState.gameStats.powersUsed[2] },
            { label: 'High Risk Boxes', value: gameState.gameStats.riskTaken }
        ];
        
        gameStatsContainer.innerHTML = '';
        
        stats.forEach(stat => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            statItem.innerHTML = `
                <div class="stat-label">${stat.label}</div>
                <div class="stat-value">${stat.value}</div>
            `;
            gameStatsContainer.appendChild(statItem);
        });
    }

    function clearSelections() {
        // Clear box selections
        document.querySelectorAll('.point-box').forEach(box => {
            box.classList.remove('selected');
            if (box.dataset.revealed === 'true') {
                box.classList.remove('revealed');
                box.dataset.revealed = 'false';
                box.querySelector('.box-points').textContent = '';
                box.classList.remove('positive', 'negative', 'multiplied');
            }
        });
        
        // Clear option selection
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Reset state
        gameState.selectedBoxes = [];
        gameState.selectedOption = null;
        
        // Update UI
        updateSelectionInfo();
        updateSubmitButtonState();
    }

    function goHome() {
        switchScreen('start');
        clearSelections();
    }

    function playAgain() {
        // Reset game with same quiz
        if (gameState.selectedQuiz && gameState.quizData) {
            startGame();
        } else {
            goHome();
        }
    }

    function newQuiz() {
        goHome();
        clearCode();
    }

    function showStrategy() {
        strategyModal.style.display = 'flex';
    }

    function showLoading(message, details = '') {
        loadingOverlay.classList.add('active');
        loadingText.textContent = message;
        loadingDetails.textContent = details;
    }

    function hideLoading() {
        loadingOverlay.classList.remove('active');
    }

    function showError(message) {
        startError.textContent = message;
        startError.style.display = 'block';
        
        // Hide error after 5 seconds
        setTimeout(() => {
            startError.textContent = '';
            startError.style.display = 'none';
        }, 5000);
    }

    function showFeedback(message, type = 'info') {
        let className = 'feedback-placeholder';
        let icon = '💡';
        
        switch(type) {
            case 'correct':
                className = 'feedback-correct';
                icon = '✅';
                break;
            case 'incorrect':
                className = 'feedback-incorrect';
                icon = '❌';
                break;
            case 'warning':
                className = 'feedback-warning';
                icon = '⚠️';
                break;
            case 'info':
                className = 'feedback-info';
                icon = 'ℹ️';
                break;
        }
        
        feedback.innerHTML = `
            <div class="${className}">
                <span class="feedback-icon">${icon}</span>
                ${message}
            </div>
        `;
    }

    function updateChanceControlMeters() {
        chanceMeter.style.width = `${gameState.chanceLevel}%`;
        controlMeter.style.width = `${gameState.controlLevel}%`;
    }

    function detectTouchDevice() {
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            document.body.classList.add('touch-device');
        }
    }

    // Sample quiz data structure for testing
    // This would normally come from JSON files
    window.sampleQuizData = {
        title: "Secondary 4 Math: Algebra",
        subject: "Upper Secondary, Mathematics",
        questions: [
            {
                question: "Solve for x: 2x + 5 = 13",
                options: ["x = 4", "x = 3", "x = 5", "x = 6"],
                correctAnswer: 0,
                points: 10
            },
            {
                question: "Factorize: x² - 9",
                options: ["(x-3)(x+3)", "(x-9)(x+1)", "(x-3)²", "(x+3)²"],
                correctAnswer: 0,
                points: 10
            },
            {
                question: "Simplify: (3x²y³)²",
                options: ["9x⁴y⁶", "6x⁴y⁶", "9x²y⁶", "3x⁴y⁶"],
                correctAnswer: 0,
                points: 10
            },
            {
                question: "Solve the quadratic: x² - 5x + 6 = 0",
                options: ["x = 2, 3", "x = 1, 6", "x = -2, -3", "x = -1, -6"],
                correctAnswer: 0,
                points: 10
            },
            {
                question: "Find the slope: y = 3x + 2",
                options: ["3", "2", "5", "1"],
                correctAnswer: 0,
                points: 10
            }
        ]
    };

    // For testing without actual JSON files
    // Uncomment this to use sample data
    /*
    window.loadQuizData = function(code) {
        gameState.quizData = window.sampleQuizData;
        quizCountDisplay.textContent = gameState.quizData.questions.length;
        quizTitleDisplay.textContent = gameState.quizData.title;
        quizGradeDisplay.textContent = gameState.quizData.subject;
        return true;
    };
    */

    // Initialize the game
    console.log('Brain Battle Game initialized!');
});