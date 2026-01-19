// Brain Battle Card Game - Gambling Edition
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    let currentScreen = 'start';
    let currentQuestion = 0;
    let currentPlayer = 1;
    let selectedQuiz = null;
    let quizData = null;
    let scores = { 1: 0, 2: 0 };
    let selectedOption = null;
    let selectedGamblingOption = null;
    let gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0
    };

    // Gambling Options Configuration
    const GAMBLING_OPTIONS = [
        { 
            id: 1, 
            title: "Double or Nothing", 
            description: "Risk it all! Double your points or lose them all",
            icon: "🎲",
            type: "doubleOrNothing",
            multiplier: 2,
            lossChance: 0.5
        },
        { 
            id: 2, 
            title: "Safe 50%", 
            description: "Play it safe with a guaranteed 50% increase",
            icon: "🛡️",
            type: "safe",
            multiplier: 1.5,
            lossChance: 0
        },
        { 
            id: 3, 
            title: "Lucky Dip", 
            description: "Random multiplier between 0.5x and 2x",
            icon: "🎁",
            type: "random",
            minMultiplier: 0.5,
            maxMultiplier: 2
        },
        { 
            id: 4, 
            title: "Skip Gamble", 
            description: "Keep your current points, no risk taken",
            icon: "✋",
            type: "skip",
            multiplier: 1
        }
    ];

    // DOM Elements
    const elements = {
        // Screens
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        gamblingScreen: document.getElementById('gambling-screen'),
        gameOverScreen: document.getElementById('game-over'),
        
        // Code input
        codeDigits: document.querySelectorAll('.code-digit'),
        keypadButtons: document.querySelectorAll('.keypad-btn'),
        backspaceBtn: document.getElementById('backspace'),
        clearBtn: document.getElementById('clear'),
        validateBtn: document.getElementById('validate-code'),
        startGameBtn: document.getElementById('start-game'),
        startError: document.getElementById('start-error'),
        loadingIndicator: document.getElementById('loading-indicator'),
        
        // Quiz info
        quizInfo: document.getElementById('quiz-info'),
        quizTitleDisplay: document.getElementById('quiz-title-display'),
        quizSubjectDisplay: document.getElementById('quiz-subject-display'),
        quizLevelDisplay: document.getElementById('quiz-level-display'),
        quizCountDisplay: document.getElementById('quiz-count-display'),
        
        // Game screen
        gameQuizTitle: document.getElementById('game-quiz-title'),
        currentQ: document.getElementById('current-q'),
        totalQ: document.getElementById('total-q'),
        currentPlayerName: document.getElementById('current-player-name'),
        player1Score: document.getElementById('player1-score'),
        player2Score: document.getElementById('player2-score'),
        player1Display: document.getElementById('player1-display'),
        player2Display: document.getElementById('player2-display'),
        
        // Question elements
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        basePoints: document.getElementById('base-points'),
        
        // Game controls
        submitBtn: document.getElementById('submit-answer'),
        nextBtn: document.getElementById('next-question'),
        homeBtn: document.getElementById('home-btn'),
        
        // Results
        resultsDisplay: document.getElementById('results-display'),
        answerResult: document.getElementById('answer-result'),
        pointsEarned: document.getElementById('points-earned'),
        
        // Gambling screen
        gamblingOptions: document.getElementById('gambling-options'),
        gamblingResult: document.getElementById('gambling-result'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultDescription: document.getElementById('result-description'),
        resultPoints: document.getElementById('result-points'),
        finalPoints1: document.getElementById('final-points1'),
        finalPoints2: document.getElementById('final-points2'),
        continueBtn: document.getElementById('continue-after-gamble'),
        
        // Game over
        winnerTrophy: document.getElementById('winner-trophy'),
        winnerTitle: document.getElementById('winner-title'),
        winnerMessage: document.getElementById('winner-message'),
        finalScore1: document.getElementById('final-score1'),
        finalScore2: document.getElementById('final-score2'),
        questionsAnswered: document.getElementById('questions-answered'),
        correctAnswers: document.getElementById('correct-answers'),
        accuracyRate: document.getElementById('accuracy-rate'),
        playAgainBtn: document.getElementById('play-again'),
        newGameBtn: document.getElementById('new-game'),
        
        // Demo buttons
        demoButtons: document.querySelectorAll('.demo-btn')
    };

    // DEMO QUIZZES - For testing without server
    const DEMO_QUIZZES = {
        "334151": {
            code: "334151",
            title: "Static Electricity (Conceptual)",
            subject: "Pure Physics",
            level: "Secondary 4",
            topic: "15. Static Electricity",
            difficulty: "Intermediate",
            author: "Physics Department",
            created: "2024-01-19",
            description: "Conceptual questions on static electricity covering charges, fields, charging methods, and applications - no calculations required.",
            questions: [
                {
                    id: 1,
                    question: "What is the SI unit for measuring electric charge?",
                    options: [
                        "Coulomb",
                        "Newton",
                        "Joule",
                        "Watt"
                    ],
                    correctAnswer: 0,
                    points: 10,
                    explanation: "The coulomb (C) is the SI unit of electric charge, named after French physicist Charles-Augustin de Coulomb."
                },
                {
                    id: 2,
                    question: "When a plastic rod is rubbed with wool, the plastic becomes negatively charged. What has been transferred?",
                    options: [
                        "Electrons from wool to plastic",
                        "Protons from plastic to wool",
                        "Electrons from plastic to wool",
                        "Protons from wool to plastic"
                    ],
                    correctAnswer: 0,
                    points: 10,
                    explanation: "Electrons are transferred from the wool to the plastic rod. The plastic gains electrons and becomes negatively charged."
                },
                {
                    id: 3,
                    question: "What happens when a negatively charged balloon is brought near a neutral wall?",
                    options: [
                        "The wall becomes positively charged by induction",
                        "The wall becomes negatively charged by conduction",
                        "Nothing happens because the wall is neutral",
                        "The balloon loses its charge immediately"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "The negatively charged balloon repels electrons in the wall, making the wall's surface positively charged by induction. This causes attraction."
                }
            ]
        },
        "101021": {
            code: "101021",
            title: "Primary Mathematics: Fractions",
            subject: "Mathematics",
            level: "Primary 6",
            difficulty: "Intermediate",
            questions: [
                {
                    id: 1,
                    question: "Calculate: \\(\\frac{3}{4} \\times \\frac{2}{5}\\)",
                    options: [
                        "\\(\\frac{3}{10}\\)",
                        "\\(\\frac{6}{20}\\)",
                        "\\(\\frac{5}{9}\\)",
                        "\\(\\frac{8}{15}\\)"
                    ],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    id: 2,
                    question: "Simplify: \\(\\frac{5}{6} \\div \\frac{2}{3}\\)",
                    options: [
                        "\\(\\frac{5}{4}\\)",
                        "\\(\\frac{10}{18}\\)",
                        "\\(\\frac{15}{12}\\)",
                        "\\(\\frac{4}{5}\\)"
                    ],
                    correctAnswer: 0,
                    points: 10
                }
            ]
        }
    };

    // Initialize Game
    init();

    function init() {
        console.log('Brain Battle Game - Gambling Edition Initializing...');
        setupEventListeners();
        initCodeInput();
        console.log('Game initialized successfully');
    }

    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Code keypad
        elements.keypadButtons.forEach(btn => {
            if (!btn.id) {
                btn.addEventListener('click', function() {
                    handleCodeInput(this.dataset.key);
                });
            }
        });
        
        elements.backspaceBtn.addEventListener('click', handleBackspace);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.validateBtn.addEventListener('click', validateCode);
        elements.startGameBtn.addEventListener('click', startGame);
        
        // Demo buttons
        elements.demoButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                enterDemoCode(this.dataset.code);
            });
        });
        
        // Game controls
        elements.submitBtn.addEventListener('click', submitAnswer);
        elements.nextBtn.addEventListener('click', nextQuestion);
        elements.homeBtn.addEventListener('click', goHome);
        
        // Gambling buttons
        elements.continueBtn.addEventListener('click', continueToGameOver);
        
        // Game over buttons
        elements.playAgainBtn.addEventListener('click', playAgain);
        elements.newGameBtn.addEventListener('click', newGame);
        
        console.log('Event listeners setup complete');
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
        // Activate the last digit instead of first
        elements.codeDigits.forEach(d => d.classList.remove('active'));
        elements.codeDigits[5].classList.add('active');
        updateValidateButton();
        validateCode();
    }

    async function validateCode() {
        const code = getCurrentCode();
        
        if (code.length !== 6) {
            showError('Code must be 6 digits');
            return;
        }
        
        // Show loading indicator
        showLoading(true);
        
        try {
            // First check if it's a demo quiz
            if (DEMO_QUIZZES[code]) {
                console.log('Loading demo quiz:', code);
                // Simulate loading delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                quizData = DEMO_QUIZZES[code];
                selectedQuiz = {
                    code: code,
                    title: quizData.title,
                    subject: quizData.subject,
                    level: quizData.level || 'Not specified',
                    questions: quizData.questions.length
                };
                
                showQuizInfo(selectedQuiz);
                elements.startError.textContent = '';
                elements.startGameBtn.disabled = false;
                showLoading(false);
                
            } else {
                // Try to load from JSON file
                const filePath = `Questions/${code}.json`;
                console.log('Attempting to load from:', filePath);
                
                const response = await fetch(filePath);
                
                if (!response.ok) {
                    throw new Error(`Quiz not found (Error ${response.status})`);
                }
                
                const data = await response.json();
                
                // Validate the quiz data structure
                if (!validateQuizData(data, code)) {
                    throw new Error('Invalid quiz data format');
                }
                
                // Store quiz data
                quizData = data;
                selectedQuiz = {
                    code: code,
                    title: data.title,
                    subject: data.subject,
                    level: data.level || 'Not specified',
                    questions: data.questions.length
                };
                
                // Update UI
                showQuizInfo(selectedQuiz);
                elements.startError.textContent = '';
                elements.startGameBtn.disabled = false;
                showLoading(false);
            }
            
            console.log('Quiz loaded successfully:', selectedQuiz);
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            showError('Quiz not found. Use 334151 for Static Electricity demo.');
            showLoading(false);
        }
    }

    function validateQuizData(data, expectedCode) {
        // Basic validation
        if (!data || typeof data !== 'object') {
            console.error('Quiz data is not an object');
            return false;
        }
        
        if (data.code !== expectedCode) {
            console.error(`Code mismatch: expected ${expectedCode}, got ${data.code}`);
            return false;
        }
        
        if (!data.title || !data.subject) {
            console.error('Missing title or subject');
            return false;
        }
        
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            console.error('Invalid or empty questions array');
            return false;
        }
        
        // Validate each question
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
                console.error(`Invalid question at index ${i}`);
                return false;
            }
            
            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
                console.error(`Invalid correctAnswer at index ${i}`);
                return false;
            }
        }
        
        return true;
    }

    function showLoading(show) {
        if (show) {
            elements.loadingIndicator.style.display = 'block';
            elements.validateBtn.disabled = true;
            elements.validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        } else {
            elements.loadingIndicator.style.display = 'none';
            elements.validateBtn.disabled = false;
            elements.validateBtn.innerHTML = '<i class="fas fa-search"></i> Load Quiz';
        }
    }

    function showQuizInfo(quiz) {
        elements.quizTitleDisplay.textContent = quiz.title;
        elements.quizSubjectDisplay.textContent = quiz.subject;
        elements.quizLevelDisplay.textContent = quiz.level;
        elements.quizCountDisplay.textContent = quiz.questions;
        elements.quizInfo.style.display = 'block';
    }

    function hideQuizInfo() {
        elements.quizInfo.style.display = 'none';
        selectedQuiz = null;
        quizData = null;
        elements.startGameBtn.disabled = true;
    }

    function startGame() {
        if (!selectedQuiz || !quizData) {
            showError('Please select a valid quiz first.');
            return;
        }
        
        // Reset game state
        resetGameState();
        
        // Switch to game screen
        switchScreen('game');
        
        // Initialize game
        initializeGame();
        
        // Load first question
        loadQuestion(currentQuestion);
    }

    function resetGameState() {
        currentQuestion = 0;
        currentPlayer = 1;
        scores = { 1: 0, 2: 0 };
        selectedOption = null;
        selectedGamblingOption = null;
        gameStats = {
            questionsAnswered: 0,
            correctAnswers: 0
        };
    }

    function switchScreen(screenName) {
        currentScreen = screenName;
        
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show the requested screen
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) {
            screen.classList.add('active');
            console.log(`Switched to screen: ${screenName}`);
        }
    }

    function initializeGame() {
        elements.gameQuizTitle.textContent = quizData.title;
        elements.totalQ.textContent = quizData.questions.length;
        updateScores();
        updateCurrentPlayer();
        console.log('Game initialized with', quizData.questions.length, 'questions');
    }

    function updateScores() {
        elements.player1Score.textContent = scores[1];
        elements.player2Score.textContent = scores[2];
    }

    function updateCurrentPlayer() {
        elements.currentPlayerName.textContent = `Player ${currentPlayer}`;
        
        // Update player highlights
        elements.player1Display.classList.remove('active');
        elements.player2Display.classList.remove('active');
        
        if (currentPlayer === 1) {
            elements.player1Display.classList.add('active');
        } else {
            elements.player2Display.classList.add('active');
        }
    }

    function loadQuestion(index) {
        if (!quizData || !quizData.questions[index]) {
            console.error('Question not found at index:', index);
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
                
                optionElement.addEventListener('click', function() {
                    selectOption(optionElement);
                });
                
                elements.optionsContainer.appendChild(optionElement);
            }
        });
        
        // Reset selection state
        selectedOption = null;
        
        // Hide results
        elements.resultsDisplay.style.display = 'none';
        
        // Show submit button, hide next button
        elements.submitBtn.style.display = 'flex';
        elements.nextBtn.style.display = 'none';
        
        // Enable submit button when option is selected
        elements.submitBtn.disabled = true;
        
        // Make options clickable again
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'auto';
        });
        
        // Process MathJax
        if (window.MathJax) {
            setTimeout(() => {
                MathJax.typesetPromise([elements.questionText]).catch(err => {
                    console.warn('MathJax rendering error:', err);
                });
            }, 100);
        }
    }

    function selectOption(optionElement) {
        // Deselect all options
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select clicked option
        optionElement.classList.add('selected');
        selectedOption = parseInt(optionElement.dataset.index);
        
        // Enable submit button
        elements.submitBtn.disabled = false;
    }

    function submitAnswer() {
        if (selectedOption === null) {
            showError('Please select an answer first.');
            return;
        }
        
        const question = quizData.questions[currentQuestion];
        const isCorrect = selectedOption === question.correctAnswer;
        
        // Update game stats
        gameStats.questionsAnswered++;
        if (isCorrect) gameStats.correctAnswers++;
        
        // Calculate points
        let pointsEarned = 0;
        
        if (isCorrect) {
            // Gain points for correct answer
            pointsEarned = question.points || 10;
            scores[currentPlayer] += pointsEarned;
        } else {
            // Lose points for wrong answer
            pointsEarned = -(question.points || 10);
            scores[currentPlayer] += pointsEarned; // This will subtract points
        }
        
        // Update scores
        updateScores();
        
        // Show results
        showResults(isCorrect, pointsEarned);
        
        // Disable options
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        // Show next button
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
    }

    function showResults(isCorrect, points) {
        // Update result display
        elements.answerResult.textContent = isCorrect ? 'Correct' : 'Incorrect';
        elements.answerResult.className = `result-value ${isCorrect ? 'correct' : 'incorrect'}`;
        
        elements.pointsEarned.textContent = points >= 0 ? `+${points}` : points;
        elements.pointsEarned.className = `result-value ${points >= 0 ? 'positive' : 'negative'}`;
        
        // Show results
        elements.resultsDisplay.style.display = 'block';
    }

    function nextQuestion() {
        // Switch to next player
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer();
        
        // Check if there are more questions
        if (currentQuestion < quizData.questions.length - 1) {
            currentQuestion++;
            loadQuestion(currentQuestion);
        } else {
            showGamblingScreen();
        }
    }

    function showGamblingScreen() {
        // Create gambling screen
        createGamblingScreen();
        
        // Switch to gambling screen
        switchScreen('gambling');
        
        // Reset gambling result
        elements.gamblingResult.style.display = 'none';
        elements.continueBtn.disabled = true;
    }

    function createGamblingScreen() {
        elements.gamblingOptions.innerHTML = '';
        
        // Shuffle gambling options
        const shuffledOptions = [...GAMBLING_OPTIONS].sort(() => Math.random() - 0.5);
        
        shuffledOptions.forEach((option, index) => {
            const gamblingCard = document.createElement('div');
            gamblingCard.className = 'gambling-card';
            gamblingCard.dataset.optionId = option.id;
            
            // Determine effect class
            let effectClass = 'neutral';
            if (option.type === 'safe') effectClass = 'positive';
            if (option.type === 'doubleOrNothing') effectClass = 'negative';
            
            let effectText = '';
            if (option.type === 'doubleOrNothing') effectText = '2x or 0x';
            else if (option.type === 'safe') effectText = '1.5x';
            else if (option.type === 'random') effectText = '0.5x-2x';
            else effectText = '1x';
            
            gamblingCard.innerHTML = `
                <div class="gambling-icon">${option.icon}</div>
                <div class="gambling-title">${option.title}</div>
                <div class="gambling-description">${option.description}</div>
                <div class="gambling-effect ${effectClass}">${effectText}</div>
            `;
            
            gamblingCard.addEventListener('click', function() {
                selectGamblingOption(gamblingCard, option);
            });
            
            elements.gamblingOptions.appendChild(gamblingCard);
        });
    }

    function selectGamblingOption(cardElement, option) {
        // Deselect all gambling cards
        document.querySelectorAll('.gambling-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select clicked card
        cardElement.classList.add('selected');
        selectedGamblingOption = option;
        
        // Process gambling result
        processGamblingResult(option);
    }

    function processGamblingResult(option) {
        let multiplier = 1;
        let result = '';
        let description = '';
        let icon = '';
        let pointsClass = 'neutral';
        
        switch(option.type) {
            case 'doubleOrNothing':
                // 50% chance to double, 50% chance to lose everything
                const isWin = Math.random() > 0.5;
                if (isWin) {
                    multiplier = 2;
                    result = 'DOUBLED!';
                    description = 'You got lucky! All points doubled!';
                    icon = '🎉';
                    pointsClass = 'positive';
                } else {
                    multiplier = 0;
                    result = 'LOST ALL!';
                    description = 'Bad luck! All points lost!';
                    icon = '💥';
                    pointsClass = 'negative';
                }
                break;
                
            case 'safe':
                multiplier = option.multiplier;
                result = 'SAFE WIN';
                description = 'Smart choice! Points increased by 50%';
                icon = '🛡️';
                pointsClass = 'positive';
                break;
                
            case 'random':
                // Random multiplier between 0.5 and 2
                multiplier = option.minMultiplier + Math.random() * (option.maxMultiplier - option.minMultiplier);
                multiplier = Math.round(multiplier * 100) / 100; // Round to 2 decimal places
                
                if (multiplier > 1) {
                    result = 'LUCKY!';
                    description = `You got a ${multiplier}x multiplier!`;
                    icon = '🍀';
                    pointsClass = 'positive';
                } else if (multiplier < 1) {
                    result = 'UNLUCKY!';
                    description = `Only ${multiplier}x multiplier...`;
                    icon = '😞';
                    pointsClass = 'negative';
                } else {
                    result = 'NEUTRAL';
                    description = 'No change to your points';
                    icon = '😐';
                    pointsClass = 'neutral';
                }
                break;
                
            case 'skip':
                multiplier = 1;
                result = 'NO CHANGE';
                description = 'You kept your current points';
                icon = '✋';
                pointsClass = 'neutral';
                break;
        }
        
        // Calculate new scores
        const oldScores = { ...scores };
        scores[1] = Math.round(scores[1] * multiplier);
        scores[2] = Math.round(scores[2] * multiplier);
        
        // Update result display
        elements.resultIcon.textContent = icon;
        elements.resultTitle.textContent = result;
        elements.resultDescription.textContent = description;
        
        // Calculate point changes
        const player1Change = scores[1] - oldScores[1];
        const player2Change = scores[2] - oldScores[2];
        
        // Show point changes
        elements.finalPoints1.textContent = player1Change >= 0 ? `+${player1Change}` : player1Change;
        elements.finalPoints1.className = `final-points-value ${player1Change >= 0 ? 'positive' : 'negative'}`;
        
        elements.finalPoints2.textContent = player2Change >= 0 ? `+${player2Change}` : player2Change;
        elements.finalPoints2.className = `final-points-value ${player2Change >= 0 ? 'positive' : 'negative'}`;
        
        // Show final points
        elements.resultPoints.textContent = `Player 1: ${scores[1]} | Player 2: ${scores[2]}`;
        elements.resultPoints.className = `result-points ${pointsClass}`;
        
        // Show gambling result
        elements.gamblingResult.style.display = 'block';
        
        // Enable continue button
        elements.continueBtn.disabled = false;
    }

    function continueToGameOver() {
        endGame();
    }

    function goHome() {
        switchScreen('start');
    }

    function endGame() {
        // Determine winner
        let winner = 0;
        let winnerText = "It's a Tie!";
        let message = "Both players showed great skill!";
        
        if (scores[1] > scores[2]) {
            winner = 1;
            winnerText = "Player 1 Wins!";
            message = `Congratulations Player 1 with ${scores[1]} points!`;
        } else if (scores[2] > scores[1]) {
            winner = 2;
            winnerText = "Player 2 Wins!";
            message = `Congratulations Player 2 with ${scores[2]} points!`;
        }
        
        // Calculate accuracy
        const accuracy = gameStats.questionsAnswered > 0 
            ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100)
            : 0;
        
        // Update game over screen
        elements.winnerTitle.textContent = winnerText;
        elements.winnerMessage.textContent = message;
        elements.finalScore1.textContent = scores[1];
        elements.finalScore2.textContent = scores[2];
        elements.questionsAnswered.textContent = gameStats.questionsAnswered;
        elements.correctAnswers.textContent = gameStats.correctAnswers;
        elements.accuracyRate.textContent = `${accuracy}%`;
        
        // Highlight winner
        document.querySelectorAll('.final-player').forEach(player => {
            player.classList.remove('winner');
        });
        
        if (winner === 1) {
            document.querySelector('.final-player:first-child').classList.add('winner');
        } else if (winner === 2) {
            document.querySelector('.final-player:last-child').classList.add('winner');
        }
        
        elements.winnerTrophy.textContent = winner === 0 ? "🤝" : "🏆";
        
        switchScreen('gameOver');
    }

    function playAgain() {
        // Reset and start again
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
});