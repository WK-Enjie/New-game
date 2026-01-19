// Brain Battle Game - Complete Working Version
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    let currentScreen = 'start';
    let currentQuestion = 0;
    let currentPlayer = 1;
    let selectedQuiz = null;
    let quizData = null;
    let scores = { 1: 0, 2: 0 };
    let selectedBoxes = [];
    let selectedOption = null;

    // DOM Elements
    const elements = {
        // Screens
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

    // Initialize
    init();

    function init() {
        setupEventListeners();
        initCodeInput();
        console.log('Game initialized');
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

    function validateCode() {
        const code = getCurrentCode();
        if (code.length !== 6) return;
        
        showLoading('Loading quiz...');
        
        // Check if code exists
        const quiz = findQuizByCode(code);
        
        if (quiz) {
            selectedQuiz = quiz;
            showQuizInfo(quiz);
            elements.startError.textContent = '';
            elements.startGameBtn.disabled = false;
        } else {
            showError('Invalid code. Please try a demo code.');
            hideQuizInfo();
            elements.startGameBtn.disabled = true;
        }
        
        hideLoading();
    }

    function findQuizByCode(code) {
        // Demo quizzes
        const demoQuizzes = {
            '106011': {
                code: '106011',
                title: 'P6 Fractions (Set 1)',
                subject: 'Mathematics - Primary 6',
                questions: 10
            },
            '106012': {
                code: '106012',
                title: 'P6 Fractions (Set 2)',
                subject: 'Mathematics - Primary 6',
                questions: 5
            }
        };
        
        return demoQuizzes[code] || null;
    }

    function showQuizInfo(quiz) {
        elements.quizTitleDisplay.textContent = quiz.title;
        elements.quizSubjectDisplay.textContent = quiz.subject;
        elements.quizCountDisplay.textContent = quiz.questions;
        elements.quizInfo.style.display = 'block';
    }

    function hideQuizInfo() {
        elements.quizInfo.style.display = 'none';
        selectedQuiz = null;
        quizData = null;
    }

    function startGame() {
        if (!selectedQuiz) {
            showError('Please select a valid quiz first.');
            return;
        }
        
        // Load quiz data
        loadQuizData();
        
        // Switch to game screen
        switchScreen('game');
        
        // Initialize game
        initializeGame();
        
        // Load first question
        loadQuestion(currentQuestion);
    }

    function loadQuizData() {
        // For demo, use hardcoded data
        quizData = {
            title: selectedQuiz.title,
            questions: getQuestionsForCode(selectedQuiz.code)
        };
    }

    function getQuestionsForCode(code) {
        const questions = {
            '106011': [
                {
                    question: "Calculate: \\(\\frac{3}{4} \\times \\frac{2}{5}\\)",
                    options: ["\\(\\frac{3}{10}\\)", "\\(\\frac{6}{20}\\)", "\\(\\frac{5}{9}\\)", "\\(\\frac{8}{15}\\)"],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    question: "Simplify: \\(\\frac{5}{6} \\div \\frac{2}{3}\\)",
                    options: ["\\(\\frac{5}{4}\\)", "\\(\\frac{10}{18}\\)", "\\(\\frac{15}{12}\\)", "\\(\\frac{4}{5}\\)"],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    question: "Which fraction is NOT equivalent to \\(\\frac{2}{3}\\)?",
                    options: ["\\(\\frac{4}{9}\\)", "\\(\\frac{6}{9}\\)", "\\(\\frac{8}{12}\\)", "\\(\\frac{10}{15}\\)"],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    question: "John had \\(\\frac{3}{5}\\) of a cake. He ate \\(\\frac{1}{4}\\) of what he had. What fraction of the whole cake did he eat?",
                    options: ["\\(\\frac{3}{20}\\)", "\\(\\frac{4}{9}\\)", "\\(\\frac{1}{5}\\)", "\\(\\frac{7}{20}\\)"],
                    correctAnswer: 0,
                    points: 15
                },
                {
                    question: "A rope is 12 m long. Ali cuts off \\(\\frac{2}{3}\\) of it. What length of rope is left?",
                    options: ["4 m", "6 m", "8 m", "10 m"],
                    correctAnswer: 0,
                    points: 15
                }
            ],
            '106012': [
                {
                    question: "John had \\(\\frac{5}{8}\\) of a pizza. He ate \\(\\frac{1}{4}\\) of what he had. What fraction of the whole pizza did he eat?",
                    options: ["\\(\\frac{5}{32}\\)", "\\(\\frac{1}{4}\\)", "\\(\\frac{5}{24}\\)", "\\(\\frac{3}{8}\\)"],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    question: "Express \\(\\frac{7}{12}\\) as a fraction with denominator 36",
                    options: ["\\(\\frac{21}{36}\\)", "\\(\\frac{14}{36}\\)", "\\(\\frac{28}{36}\\)", "\\(\\frac{35}{36}\\)"],
                    correctAnswer: 0,
                    points: 8
                },
                {
                    question: "A rope 24m long was cut into 3 pieces. The first piece was \\(\\frac{3}{8}\\) of the rope, the second was \\(\\frac{1}{3}\\) of the rope. What fraction of the rope was the third piece?",
                    options: ["\\(\\frac{7}{24}\\)", "\\(\\frac{5}{12}\\)", "\\(\\frac{1}{2}\\)", "\\(\\frac{17}{24}\\)"],
                    correctAnswer: 0,
                    points: 15
                },
                {
                    question: "Mr. Tan gave \\(\\frac{1}{4}\\) of his stamps to Ali and \\(\\frac{2}{5}\\) of the remainder to Bob. What fraction of his original stamps did he have left?",
                    options: ["\\(\\frac{9}{20}\\)", "\\(\\frac{11}{20}\\)", "\\(\\frac{3}{10}\\)", "\\(\\frac{7}{20}\\)"],
                    correctAnswer: 0,
                    points: 20
                },
                {
                    question: "In a class, \\(\\frac{3}{7}\\) of the students are boys. If there are 6 more girls than boys, how many students are in the class?",
                    options: ["42", "49", "56", "63"],
                    correctAnswer: 0,
                    points: 20
                }
            ]
        };
        
        return questions[code] || questions['106011'];
    }

    function switchScreen(screenName) {
        currentScreen = screenName;
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
        }
    }

    function initializeGame() {
        elements.gameQuizTitle.textContent = quizData.title;
        elements.totalQ.textContent = quizData.questions.length;
        updateScores();
        updateCurrentPlayer();
        initializeRiskBoxes();
    }

    function updateScores() {
        elements.player1Score.textContent = scores[1];
        elements.player2Score.textContent = scores[2];
    }

    function updateCurrentPlayer() {
        elements.currentPlayerName.textContent = `Player ${currentPlayer}`;
        
        // Update player highlights
        document.querySelectorAll('.player-score').forEach((el, index) => {
            if (index + 1 === currentPlayer) {
                el.style.transform = 'scale(1.1)';
            } else {
                el.style.transform = 'scale(1)';
            }
        });
    }

    function loadQuestion(index) {
        if (!quizData || !quizData.questions[index]) {
            console.error('Question not found:', index);
            return;
        }
        
        const question = quizData.questions[index];
        
        // Update question counter
        elements.currentQ.textContent = index + 1;
        
        // Set base points
        elements.basePoints.textContent = question.points || 10;
        
        // Set question text
        elements.questionText.innerHTML = question.question;
        
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
        selectedOption = null;
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
        
        // Process MathJax
        if (window.MathJax) {
            setTimeout(() => {
                MathJax.typesetPromise();
            }, 100);
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
        
        box.addEventListener('click', () => selectRiskBox(box, number));
        
        if (riskLevel === 'low') {
            elements.lowRiskBoxes.appendChild(box);
        } else {
            elements.highRiskBoxes.appendChild(box);
        }
    }

    function selectRiskBox(box, number) {
        if (box.classList.contains('selected')) {
            // Deselect
            box.classList.remove('selected');
            box.querySelector('.box-question').textContent = '?';
            selectedBoxes = selectedBoxes.filter(n => n !== number);
        } else {
            // Check limit
            if (selectedBoxes.length >= 3) {
                showFeedback('Maximum 3 boxes!', 'warning');
                return;
            }
            
            // Select
            box.classList.add('selected');
            box.querySelector('.box-question').textContent = '✓';
            selectedBoxes.push(number);
        }
        
        updateSelectionInfo();
        updateSubmitButton();
    }

    function updateSelectionInfo() {
        elements.selectedCount.textContent = selectedBoxes.length;
    }

    function selectOption(optionElement) {
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        optionElement.classList.add('selected');
        selectedOption = parseInt(optionElement.dataset.index);
        
        updateSubmitButton();
    }

    function updateSubmitButton() {
        elements.submitBtn.disabled = !(selectedBoxes.length > 0 && selectedOption !== null);
    }

    function submitAnswer() {
        if (selectedBoxes.length === 0 || selectedOption === null) {
            showFeedback('Please select boxes and an answer!', 'warning');
            return;
        }
        
        const question = quizData.questions[currentQuestion];
        const isCorrect = selectedOption === question.correctAnswer;
        
        // Calculate points
        const points = calculatePoints(isCorrect, selectedBoxes, question.points || 10);
        
        // Update score if correct
        if (isCorrect) {
            scores[currentPlayer] += points.total;
            updateScores();
        }
        
        // Show results
        showResults(points, isCorrect);
        
        // Update game controls
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
    }

    function calculatePoints(isCorrect, boxes, basePoints) {
        const results = [];
        let total = 0;
        
        boxes.forEach(boxNumber => {
            // Generate random points based on box number
            let points;
            if (boxNumber <= 6) {
                // Low risk: 5-15 points
                points = Math.floor(Math.random() * 11) + 5;
            } else {
                // High risk: -10 to 30 points
                points = Math.floor(Math.random() * 41) - 10;
            }
            
            // If answer is wrong, make points negative
            if (!isCorrect) {
                points = -Math.abs(points);
            }
            
            // Apply base points multiplier
            points = Math.round(points * (basePoints / 10));
            
            results.push({
                boxNumber: boxNumber,
                points: points,
                isPositive: points >= 0
            });
            
            total += points;
            
            // Update box display
            const box = document.querySelector(`.risk-box[data-box-number="${boxNumber}"]`);
            if (box) {
                const boxContent = box.querySelector('.box-question');
                boxContent.className = 'box-revealed';
                boxContent.classList.add(points >= 0 ? 'positive' : 'negative');
                boxContent.textContent = points >= 0 ? `+${points}` : points;
            }
        });
        
        return { results, total };
    }

    function showResults(points, isCorrect) {
        // Show feedback
        if (isCorrect) {
            showFeedback('Correct! Check your box results.', 'correct');
        } else {
            showFeedback('Incorrect! Better luck next time.', 'incorrect');
        }
        
        // Show box results
        elements.boxResults.innerHTML = '';
        points.results.forEach(result => {
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
        
        elements.pointsEarned.textContent = points.total >= 0 ? `+${points.total}` : points.total;
        elements.resultsDisplay.style.display = 'block';
    }

    function nextQuestion() {
        // Switch player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer();
        
        // Check if more questions
        if (currentQuestion < quizData.questions.length - 1) {
            currentQuestion++;
            loadQuestion(currentQuestion);
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
        selectedBoxes = [];
        selectedOption = null;
        
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
        let message = "It's a Tie!";
        
        if (scores[1] > scores[2]) {
            winner = 1;
            message = "Player 1 Wins!";
        } else if (scores[2] > scores[1]) {
            winner = 2;
            message = "Player 2 Wins!";
        }
        
        // Update game over screen
        elements.winnerTitle.textContent = message;
        elements.winnerMessage.textContent = `Final Scores: Player 1: ${scores[1]}, Player 2: ${scores[2]}`;
        elements.finalScore1.textContent = scores[1];
        elements.finalScore2.textContent = scores[2];
        
        elements.winnerTrophy.textContent = winner === 0 ? "🤝" : "🏆";
        
        switchScreen('gameOver');
    }

    function playAgain() {
        // Reset game
        currentQuestion = 0;
        currentPlayer = 1;
        scores = { 1: 0, 2: 0 };
        selectedBoxes = [];
        selectedOption = null;
        
        // Start again
        startGame();
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

    function showLoading(message) {
        // Create simple loading indicator
        const loading = document.createElement('div');
        loading.id = 'simple-loading';
        loading.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 20px rgba(0,0,0,0.2);
            z-index: 1000;
            text-align: center;
        `;
        loading.innerHTML = `<div style="margin-bottom: 15px; color: #4361ee;"><i class="fas fa-spinner fa-spin fa-2x"></i></div><div>${message}</div>`;
        document.body.appendChild(loading);
    }

    function hideLoading() {
        const loading = document.getElementById('simple-loading');
        if (loading) {
            loading.remove();
        }
    }
});