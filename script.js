// Brain Battle Game - JSON Loading Version
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    const gameState = {
        currentScreen: 'start',
        currentQuestion: 0,
        currentPlayer: 1,
        selectedQuiz: null,
        quizData: null,
        scores: { 1: 0, 2: 0 },
        selectedBoxes: [],
        selectedOption: null,
        boxPoints: {}
    };

    // Points configuration
    const BOX_POINTS = {
        lowRisk: [
            { min: 5, max: 15 },   // Box 1
            { min: 8, max: 18 },   // Box 2
            { min: 6, max: 12 },   // Box 3
            { min: 4, max: 10 },   // Box 4
            { min: 7, max: 14 },   // Box 5
            { min: 9, max: 20 }    // Box 6
        ],
        highRisk: [
            { min: -10, max: 30 },  // Box 7
            { min: -15, max: 40 },  // Box 8
            { min: -20, max: 50 },  // Box 9
            { min: -25, max: 60 },  // Box 10
            { min: -30, max: 70 },  // Box 11
            { min: -40, max: 100 }  // Box 12
        ]
    };

    // Quiz directory structure based on your design
    const QUIZ_PATHS = {
        '1': { // Primary (Level 1)
            '0': 'Questions/primary/math/',
            '1': 'Questions/primary/science/'
        },
        '2': { // Lower Secondary (Level 2)
            '0': 'Questions/lower-secondary/math/',
            '1': 'Questions/lower-secondary/science/'
        },
        '3': { // Upper Secondary (Level 3)
            '0': 'Questions/upper-secondary/math/',
            '2': 'Questions/upper-secondary/combined-physics/',
            '3': 'Questions/upper-secondary/pure-physics/',
            '4': 'Questions/upper-secondary/combined-chem/',
            '5': 'Questions/upper-secondary/pure-chem/'
        }
    };

    // DOM Elements
    const elements = {
        // Start screen
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        gameOverScreen: document.getElementById('game-over'),
        
        // Code input
        codeDigits: document.querySelectorAll('.code-digit'),
        keypadButtons: document.querySelectorAll('.keypad-btn'),
        backspaceBtn: document.getElementById('backspace'),
        clearBtn: document.getElementById('clear'),
        validateBtn: document.getElementById('validate-code'),
        startGameBtn: document.getElementById('start-game'),
        startError: document.getElementById('start-error'),
        
        // Quiz info
        quizInfo: document.getElementById('quiz-info'),
        quizTitleDisplay: document.getElementById('quiz-title-display'),
        quizSubjectDisplay: document.getElementById('quiz-subject-display'),
        quizCountDisplay: document.getElementById('quiz-count-display'),
        
        // Game screen
        gameQuizTitle: document.getElementById('game-quiz-title'),
        currentQ: document.getElementById('current-q'),
        totalQ: document.getElementById('total-q'),
        currentPlayerName: document.getElementById('current-player-name'),
        player1Score: document.getElementById('player1-score'),
        player2Score: document.getElementById('player2-score'),
        
        // Question elements
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        basePoints: document.getElementById('base-points'),
        
        // Box elements
        lowRiskBoxes: document.getElementById('low-risk-boxes'),
        highRiskBoxes: document.getElementById('high-risk-boxes'),
        selectedCount: document.getElementById('selected-count'),
        clearSelectionsBtn: document.getElementById('clear-selections'),
        
        // Game controls
        submitBtn: document.getElementById('submit-answer'),
        nextBtn: document.getElementById('next-question'),
        homeBtn: document.getElementById('home-btn'),
        
        // Feedback & Results
        feedback: document.getElementById('feedback'),
        resultsDisplay: document.getElementById('results-display'),
        boxResults: document.getElementById('box-results'),
        pointsEarned: document.getElementById('points-earned'),
        
        // Game over
        winnerTrophy: document.getElementById('winner-trophy'),
        winnerTitle: document.getElementById('winner-title'),
        winnerMessage: document.getElementById('winner-message'),
        finalScore1: document.getElementById('final-score1'),
        finalScore2: document.getElementById('final-score2'),
        playAgainBtn: document.getElementById('play-again'),
        newGameBtn: document.getElementById('new-game'),
        
        // Demo buttons
        demoButtons: document.querySelectorAll('.demo-btn')
    };

    // Initialize the game
    initGame();

    function initGame() {
        setupEventListeners();
        initCodeInput();
    }

    function setupEventListeners() {
        // Code keypad
        elements.keypadButtons.forEach(btn => {
            if (!btn.id) {
                btn.addEventListener('click', () => handleCodeInput(btn.dataset.key));
            }
        });
        
        elements.backspaceBtn.addEventListener('click', handleBackspace);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.validateBtn.addEventListener('click', validateCode);
        elements.startGameBtn.addEventListener('click', startGame);
        
        // Demo buttons
        elements.demoButtons.forEach(btn => {
            btn.addEventListener('click', () => enterDemoCode(btn.dataset.code));
        });
        
        // Game controls
        elements.submitBtn.addEventListener('click', submitAnswer);
        elements.nextBtn.addEventListener('click', nextQuestion);
        elements.homeBtn.addEventListener('click', goHome);
        elements.clearSelectionsBtn.addEventListener('click', clearSelections);
        
        // Game over buttons
        elements.playAgainBtn.addEventListener('click', playAgain);
        elements.newGameBtn.addEventListener('click', newGame);
    }

    function initCodeInput() {
        elements.codeDigits[0].classList.add('active');
        
        elements.codeDigits.forEach(digit => {
            digit.addEventListener('click', function() {
                elements.codeDigits.forEach(d => d.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }

    function handleCodeInput(key) {
        const activeDigit = document.querySelector('.code-digit.active');
        if (!activeDigit) return;
        
        const index = parseInt(activeDigit.dataset.index);
        activeDigit.textContent = key;
        activeDigit.classList.remove('active');
        
        if (index < 5) {
            elements.codeDigits[index + 1].classList.add('active');
        }
        
        updateValidateButton();
    }

    function handleBackspace() {
        const activeDigit = document.querySelector('.code-digit.active');
        let index;
        
        if (activeDigit) {
            index = parseInt(activeDigit.dataset.index);
        } else {
            index = 5;
            while (index >= 0 && elements.codeDigits[index].textContent === '_') {
                index--;
            }
            if (index < 0) return;
        }
        
        elements.codeDigits[index].textContent = '_';
        elements.codeDigits[index].classList.add('active');
        
        elements.codeDigits.forEach((digit, i) => {
            if (i !== index) digit.classList.remove('active');
        });
        
        updateValidateButton();
    }

    function handleClear() {
        elements.codeDigits.forEach(digit => {
            digit.textContent = '_';
            digit.classList.remove('active');
        });
        elements.codeDigits[0].classList.add('active');
        updateValidateButton();
        hideQuizInfo();
    }

    function updateValidateButton() {
        const code = getCurrentCode();
        elements.validateBtn.disabled = code.length !== 6;
    }

    function getCurrentCode() {
        let code = '';
        elements.codeDigits.forEach(digit => {
            if (digit.textContent !== '_') {
                code += digit.textContent;
            }
        });
        return code;
    }

    function enterDemoCode(code) {
        handleClear();
        code.split('').forEach((char, index) => {
            if (index < 6) {
                elements.codeDigits[index].textContent = char;
            }
        });
        updateValidateButton();
        validateCode();
    }

    async function validateCode() {
        const code = getCurrentCode();
        if (code.length !== 6) return;
        
        try {
            // Parse the code to determine file path
            const level = code[0]; // First digit: 1, 2, or 3
            const subject = code[1]; // Second digit: 0-5
            const grade = code[2]; // Third digit: grade level
            const chapter = code.substring(3, 5); // Fourth and fifth: chapter
            const worksheet = code[5]; // Sixth: worksheet
            
            // Get base path from mapping
            const basePath = QUIZ_PATHS[level]?.[subject];
            if (!basePath) {
                throw new Error('Invalid quiz code format');
            }
            
            // Construct full file path
            const filePath = `${basePath}${code}.json`;
            
            // Set loading state
            showLoading('Loading quiz...', `Code: ${code}`);
            
            // Fetch the JSON file
            const response = await fetch(filePath);
            
            if (!response.ok) {
                throw new Error(`Quiz file not found: ${filePath}`);
            }
            
            const quizData = await response.json();
            
            // Store quiz info
            gameState.selectedQuiz = {
                code: code,
                path: filePath,
                title: quizData.title,
                subject: quizData.subject,
                grade: quizData.grade,
                chapter: quizData.chapter,
                questionCount: quizData.questions.length
            };
            
            gameState.quizData = quizData;
            
            // Update UI
            showQuizInfo(gameState.selectedQuiz);
            elements.startError.textContent = '';
            elements.startGameBtn.disabled = false;
            
            hideLoading();
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            showError(`Failed to load quiz: ${error.message}`);
            hideQuizInfo();
            elements.startGameBtn.disabled = true;
            hideLoading();
        }
    }

    function showQuizInfo(quiz) {
        elements.quizTitleDisplay.textContent = quiz.title;
        elements.quizSubjectDisplay.textContent = `${quiz.subject} - ${quiz.grade}`;
        elements.quizCountDisplay.textContent = quiz.questionCount;
        elements.quizInfo.style.display = 'block';
    }

    function hideQuizInfo() {
        elements.quizInfo.style.display = 'none';
        gameState.selectedQuiz = null;
        gameState.quizData = null;
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
        loadQuestion(0);
        
        // Initialize risk boxes
        initializeRiskBoxes();
    }

    function resetGameState() {
        gameState.currentQuestion = 0;
        gameState.currentPlayer = 1;
        gameState.scores = { 1: 0, 2: 0 };
        gameState.selectedBoxes = [];
        gameState.selectedOption = null;
        gameState.boxPoints = {};
    }

    function switchScreen(screenName) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show selected screen
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            gameState.currentScreen = screenName;
        }
    }

    function initializeGameDisplay() {
        elements.gameQuizTitle.textContent = gameState.quizData.title;
        elements.totalQ.textContent = gameState.quizData.questions.length;
        updateScores();
        updateCurrentPlayer();
    }

    function updateScores() {
        elements.player1Score.textContent = gameState.scores[1];
        elements.player2Score.textContent = gameState.scores[2];
    }

    function updateCurrentPlayer() {
        const playerName = `Player ${gameState.currentPlayer}`;
        elements.currentPlayerName.textContent = playerName;
        
        // Update player highlights
        document.querySelectorAll('.player-score').forEach((el, index) => {
            if (index + 1 === gameState.currentPlayer) {
                el.style.transform = 'scale(1.1)';
                el.style.transition = 'transform 0.3s';
            } else {
                el.style.transform = 'scale(1)';
            }
        });
    }

    function loadQuestion(index) {
        if (!gameState.quizData || !gameState.quizData.questions[index]) return;
        
        const question = gameState.quizData.questions[index];
        
        // Update question counter
        elements.currentQ.textContent = index + 1;
        
        // Set base points
        elements.basePoints.textContent = question.points || 10;
        
        // Set question text
        renderQuestionText(question.question);
        
        // Clear and add options
        elements.optionsContainer.innerHTML = '';
        
        const letters = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, i) => {
            if (i < 4) {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.index = i;
                optionElement.innerHTML = `
                    <div class="option-letter">${letters[i]}</div>
                    <div class="option-text">${option}</div>
                `;
                
                optionElement.addEventListener('click', () => selectOption(optionElement));
                elements.optionsContainer.appendChild(optionElement);
            }
        });
        
        // Reset selection state
        gameState.selectedOption = null;
        elements.submitBtn.disabled = true;
        
        // Clear box selections
        clearSelections();
        
        // Reset feedback and results
        elements.resultsDisplay.style.display = 'none';
        elements.feedback.innerHTML = `
            <div class="feedback-placeholder">
                <i class="fas fa-lightbulb"></i> Select boxes and choose an answer
            </div>
        `;
        
        // Show submit button, hide next button
        elements.submitBtn.style.display = 'flex';
        elements.nextBtn.style.display = 'none';
        
        // Re-render MathJax for any LaTeX
        if (window.MathJax) {
            setTimeout(() => {
                MathJax.typesetPromise();
            }, 100);
        }
    }

    function renderQuestionText(text) {
        // Check if text contains LaTeX
        if (text.includes('\\(') || text.includes('$') || text.includes('\\frac')) {
            elements.questionText.innerHTML = `<div class="math-content">${text}</div>`;
        } else {
            elements.questionText.textContent = text;
        }
    }

    function initializeRiskBoxes() {
        // Clear existing boxes
        elements.lowRiskBoxes.innerHTML = '';
        elements.highRiskBoxes.innerHTML = '';
        
        // Create low risk boxes (1-6)
        for (let i = 1; i <= 6; i++) {
            createRiskBox(i, 'low');
        }
        
        // Create high risk boxes (7-12)
        for (let i = 7; i <= 12; i++) {
            createRiskBox(i, 'high');
        }
    }

    function createRiskBox(number, riskLevel) {
        const box = document.createElement('div');
        box.className = 'risk-box';
        box.dataset.boxNumber = number;
        
        const boxNumber = document.createElement('div');
        boxNumber.className = 'box-number';
        boxNumber.textContent = number;
        
        const boxContent = document.createElement('div');
        boxContent.className = 'box-question';
        boxContent.textContent = '?';
        
        box.appendChild(boxNumber);
        box.appendChild(boxContent);
        
        box.addEventListener('click', () => selectRiskBox(box, number, riskLevel));
        
        // Add to appropriate container
        if (riskLevel === 'low') {
            elements.lowRiskBoxes.appendChild(box);
        } else {
            elements.highRiskBoxes.appendChild(box);
        }
        
        return box;
    }

    function selectRiskBox(box, number, riskLevel) {
        // Check if box is already selected
        if (box.classList.contains('selected')) {
            // Deselect the box
            box.classList.remove('selected');
            box.querySelector('.box-question').textContent = '?';
            gameState.selectedBoxes = gameState.selectedBoxes.filter(n => n !== number);
        } else {
            // Check selection limit
            if (gameState.selectedBoxes.length >= 3) {
                showFeedback('Maximum 3 boxes allowed!', 'warning');
                return;
            }
            
            // Select the box
            box.classList.add('selected');
            box.querySelector('.box-question').textContent = '✓';
            gameState.selectedBoxes.push(number);
        }
        
        updateSelectionInfo();
        updateSubmitButton();
    }

    function updateSelectionInfo() {
        elements.selectedCount.textContent = gameState.selectedBoxes.length;
    }

    function selectOption(optionElement) {
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        optionElement.classList.add('selected');
        gameState.selectedOption = parseInt(optionElement.dataset.index);
        
        updateSubmitButton();
    }

    function updateSubmitButton() {
        const canSubmit = gameState.selectedBoxes.length > 0 && gameState.selectedOption !== null;
        elements.submitBtn.disabled = !canSubmit;
    }

    function submitAnswer() {
        if (gameState.selectedBoxes.length === 0 || gameState.selectedOption === null) {
            showFeedback('Please select boxes and an answer!', 'warning');
            return;
        }
        
        const question = gameState.quizData.questions[gameState.currentQuestion];
        const isCorrect = gameState.selectedOption === question.correctAnswer;
        
        // Process box points
        const results = processBoxPoints(isCorrect);
        
        // Show feedback
        if (isCorrect) {
            showFeedback('Correct answer! Check your box results.', 'correct');
        } else {
            const correctAnswer = question.options[question.correctAnswer];
            showFeedback(`Incorrect. The right answer was: ${correctAnswer}`, 'incorrect');
        }
        
        // Show results
        showResults(results);
        
        // Update game controls
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
    }

    function processBoxPoints(isCorrect) {
        const question = gameState.quizData.questions[gameState.currentQuestion];
        const basePointsValue = question.points || 10;
        
        let totalPoints = 0;
        const results = [];
        
        gameState.selectedBoxes.forEach(boxNumber => {
            const riskLevel = boxNumber >= 7 ? 'highRisk' : 'lowRisk';
            const index = (boxNumber - 1) % 6;
            const range = BOX_POINTS[riskLevel][index];
            
            // Generate random points within range
            let points = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
            
            // If answer is wrong, points are negative
            if (!isCorrect) {
                points = -Math.abs(points);
            }
            
            // Apply base points multiplier
            points = Math.round(points * (basePointsValue / 10));
            
            // Store result
            results.push({
                boxNumber: boxNumber,
                points: points,
                isPositive: points >= 0
            });
            
            totalPoints += points;
            
            // Update box display
            const box = document.querySelector(`.risk-box[data-box-number="${boxNumber}"]`);
            if (box) {
                const boxContent = box.querySelector('.box-question');
                boxContent.className = 'box-revealed';
                boxContent.classList.add(points >= 0 ? 'positive' : 'negative');
                boxContent.textContent = points >= 0 ? `+${points}` : points.toString();
            }
        });
        
        // Update player score if correct
        if (isCorrect) {
            gameState.scores[gameState.currentPlayer] += totalPoints;
            updateScores();
        }
        
        return {
            results: results,
            total: totalPoints,
            isCorrect: isCorrect
        };
    }

    function showResults(data) {
        elements.boxResults.innerHTML = '';
        
        data.results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'box-result';
            resultElement.innerHTML = `
                <div class="box-number-result">Box ${result.boxNumber}</div>
                <div class="box-points-result ${result.isPositive ? 'positive' : 'negative'}">
                    ${result.points >= 0 ? '+' : ''}${result.points}
                </div>
            `;
            elements.boxResults.appendChild(resultElement);
        });
        
        elements.pointsEarned.textContent = data.total >= 0 ? `+${data.total}` : data.total.toString();
        elements.resultsDisplay.style.display = 'block';
    }

    function nextQuestion() {
        // Switch to next player
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer();
        
        // Check if there are more questions
        if (gameState.currentQuestion < gameState.quizData.questions.length - 1) {
            gameState.currentQuestion++;
            loadQuestion(gameState.currentQuestion);
        } else {
            endGame();
        }
    }

    function clearSelections() {
        // Clear box selections
        document.querySelectorAll('.risk-box').forEach(box => {
            box.classList.remove('selected');
            const content = box.querySelector('.box-question');
            content.className = 'box-question';
            content.textContent = '?';
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
        updateSubmitButton();
    }

    function goHome() {
        switchScreen('start');
        clearSelections();
    }

    function endGame() {
        // Determine winner
        let winner = 0;
        let winnerText = "It's a Tie!";
        let message = "Both players played well!";
        
        if (gameState.scores[1] > gameState.scores[2]) {
            winner = 1;
            winnerText = "Player 1 Wins!";
            message = "Congratulations Player 1!";
        } else if (gameState.scores[2] > gameState.scores[1]) {
            winner = 2;
            winnerText = "Player 2 Wins!";
            message = "Congratulations Player 2!";
        }
        
        // Update game over screen
        elements.winnerTitle.textContent = winnerText;
        elements.winnerMessage.textContent = message;
        elements.finalScore1.textContent = gameState.scores[1];
        elements.finalScore2.textContent = gameState.scores[2];
        
        // Update trophy
        if (winner === 0) {
            elements.winnerTrophy.textContent = "🤝";
        } else {
            elements.winnerTrophy.textContent = "🏆";
        }
        
        switchScreen('gameOver');
    }

    function playAgain() {
        if (gameState.selectedQuiz && gameState.quizData) {
            startGame();
        } else {
            goHome();
        }
    }

    function newGame() {
        goHome();
        handleClear();
    }

    function showError(message) {
        elements.startError.textContent = message;
        setTimeout(() => {
            elements.startError.textContent = '';
        }, 5000);
    }

    function showFeedback(message, type) {
        let className = 'feedback-placeholder';
        let icon = 'fas fa-lightbulb';
        
        switch(type) {
            case 'correct':
                className = 'feedback-correct';
                icon = 'fas fa-check-circle';
                break;
            case 'incorrect':
                className = 'feedback-incorrect';
                icon = 'fas fa-times-circle';
                break;
            case 'warning':
                className = 'feedback-warning';
                icon = 'fas fa-exclamation-triangle';
                break;
        }
        
        elements.feedback.innerHTML = `
            <div class="${className}">
                <i class="${icon}"></i> ${message}
            </div>
        `;
    }

    // Loading functions
    function showLoading(message, details = '') {
        // Create loading overlay if it doesn't exist
        let loadingOverlay = document.getElementById('loading-overlay');
        if (!loadingOverlay) {
            loadingOverlay = document.createElement('div');
            loadingOverlay.id = 'loading-overlay';
            loadingOverlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(26, 26, 46, 0.95);
                display: none;
                align-items: center;
                justify-content: center;
                z-index: 9999;
                flex-direction: column;
            `;
            
            const loadingContent = document.createElement('div');
            loadingContent.style.cssText = `
                text-align: center;
                background: rgba(255, 255, 255, 0.1);
                padding: 50px;
                border-radius: 12px;
                border: 2px solid #2ec4b6;
                backdrop-filter: blur(10px);
            `;
            
            const spinner = document.createElement('div');
            spinner.style.cssText = `
                width: 80px;
                height: 80px;
                border: 8px solid rgba(255, 255, 255, 0.1);
                border-top: 8px solid #2ec4b6;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin: 0 auto 30px;
            `;
            
            const text = document.createElement('div');
            text.id = 'loading-text';
            text.style.cssText = `
                font-size: 1.5rem;
                color: #2ec4b6;
                margin-bottom: 15px;
                font-weight: 600;
            `;
            
            const detailsEl = document.createElement('div');
            detailsEl.id = 'loading-details';
            detailsEl.style.cssText = `
                color: rgba(255, 255, 255, 0.7);
                font-size: 1rem;
            `;
            
            // Add CSS animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            
            loadingContent.appendChild(spinner);
            loadingContent.appendChild(text);
            loadingContent.appendChild(detailsEl);
            loadingOverlay.appendChild(loadingContent);
            document.body.appendChild(loadingOverlay);
        }
        
        document.getElementById('loading-text').textContent = message;
        document.getElementById('loading-details').textContent = details;
        loadingOverlay.style.display = 'flex';
    }

    function hideLoading() {
        const loadingOverlay = document.getElementById('loading-overlay');
        if (loadingOverlay) {
            loadingOverlay.style.display = 'none';
        }
    }
});