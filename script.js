// Brain Battle Card Game - Complete Working Version with JSON Loading
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    let currentScreen = 'start';
    let currentQuestion = 0;
    let currentPlayer = 1;
    let selectedQuiz = null;
    let quizData = null;
    let scores = { 1: 0, 2: 0 };
    let selectedOption = null;
    let selectedCard = null;
    let gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0
    };

    // Points Cards Configuration
    const POINTS_CARDS = [
        { id: 1, title: "Small Win", points: 5, icon: "⭐", type: "positive" },
        { id: 2, title: "Good Score", points: 10, icon: "🎯", type: "positive" },
        { id: 3, title: "Big Win", points: 15, icon: "🏆", type: "positive" },
        { id: 4, title: "Risk Card", points: -10, icon: "⚠️", type: "negative" },
        { id: 5, title: "Double Points", points: "2x", icon: "✌️", type: "multiplier" },
        { id: 6, title: "Steal 5", points: -5, icon: "🎭", type: "steal" },
        { id: 7, title: "Bonus Points", points: 8, icon: "🎁", type: "positive" },
        { id: 8, title: "Lucky Draw", points: "Random", icon: "🎲", type: "random" }
    ];

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
        
        // Cards elements
        cardsGrid: document.getElementById('cards-grid'),
        selectedCardInfo: document.getElementById('selected-card-info'),
        selectedCardPoints: document.getElementById('selected-card-points'),
        
        // Game controls
        submitBtn: document.getElementById('submit-answer'),
        nextBtn: document.getElementById('next-question'),
        homeBtn: document.getElementById('home-btn'),
        
        // Results
        resultsDisplay: document.getElementById('results-display'),
        answerResult: document.getElementById('answer-result'),
        cardPointsResult: document.getElementById('card-points-result'),
        totalEarned: document.getElementById('total-earned'),
        
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

    // Initialize Game
    init();

    function init() {
        console.log('Brain Battle Game Initializing...');
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
            // Try to load the quiz from the correct path
            const filePath = getQuizFilePath(code);
            await loadQuizFromFile(filePath, code);
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            showError(error.message || 'Failed to load quiz. Please check the code.');
            showLoading(false);
        }
    }

    function getQuizFilePath(code) {
        // Simplified file path - just look in the Questions folder
        // You can modify this based on your actual folder structure
        return `Questions/${code}.json`;
    }

    async function loadQuizFromFile(filePath, code) {
        try {
            // Fetch the JSON file
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
            
            console.log('Quiz loaded successfully:', selectedQuiz);
            
        } catch (error) {
            console.error('Error loading quiz file:', error);
            showLoading(false);
            throw error;
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
        selectedCard = null;
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
        createPointsCards();
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
        selectedCard = null;
        
        // Reset cards
        resetCards();
        
        // Hide results
        elements.resultsDisplay.style.display = 'none';
        elements.selectedCardInfo.style.display = 'none';
        
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

    function createPointsCards() {
        elements.cardsGrid.innerHTML = '';
        
        // Shuffle cards
        const shuffledCards = [...POINTS_CARDS].sort(() => Math.random() - 0.5);
        
        // Take first 5 cards
        const selectedCards = shuffledCards.slice(0, 5);
        
        selectedCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.index = index;
            
            const pointsClass = card.type === 'positive' ? 'positive' : 
                              card.type === 'negative' ? 'negative' : 'neutral';
            
            cardElement.innerHTML = `
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.title}</div>
                <div class="card-points ${pointsClass}">${card.points}</div>
            `;
            
            cardElement.addEventListener('click', function() {
                selectCard(cardElement, card);
            });
            
            elements.cardsGrid.appendChild(cardElement);
        });
    }

    function resetCards() {
        document.querySelectorAll('.card').forEach(card => {
            card.classList.remove('selected');
        });
        elements.selectedCardInfo.style.display = 'none';
        selectedCard = null;
    }

    function selectCard(cardElement, card) {
        // Only allow selection after answer is submitted
        if (elements.submitBtn.style.display !== 'none') {
            return;
        }
        
        // Deselect all cards
        document.querySelectorAll('.card').forEach(c => {
            c.classList.remove('selected');
        });
        
        // Select clicked card
        cardElement.classList.add('selected');
        selectedCard = card;
        
        // Show selected card info
        elements.selectedCardPoints.textContent = card.points;
        const pointsClass = card.type === 'positive' ? 'positive' : 
                          card.type === 'negative' ? 'negative' : 'neutral';
        elements.selectedCardPoints.className = `card-points ${pointsClass}`;
        elements.selectedCardInfo.style.display = 'block';
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
            // Base points for correct answer
            pointsEarned = question.points || 10;
            
            // If card is selected, apply card effect
            if (selectedCard) {
                if (selectedCard.type === 'multiplier') {
                    pointsEarned *= 2;
                } else if (selectedCard.type === 'steal') {
                    // Steal points from opponent
                    const opponent = currentPlayer === 1 ? 2 : 1;
                    const stealAmount = 5;
                    scores[opponent] = Math.max(0, scores[opponent] - stealAmount);
                    pointsEarned += stealAmount;
                } else if (selectedCard.type === 'random') {
                    // Random points between 1 and 20
                    pointsEarned += Math.floor(Math.random() * 20) + 1;
                } else if (typeof selectedCard.points === 'number') {
                    pointsEarned += selectedCard.points;
                }
            }
            
            // Add to current player's score
            scores[currentPlayer] += pointsEarned;
            updateScores();
        } else {
            // Penalty for wrong answer if negative card is selected
            if (selectedCard && selectedCard.type === 'negative') {
                pointsEarned = selectedCard.points; // Negative number
                scores[currentPlayer] += pointsEarned;
                updateScores();
            }
        }
        
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
        
        elements.cardPointsResult.textContent = points >= 0 ? `+${points}` : points;
        elements.cardPointsResult.className = `result-value ${points >= 0 ? 'positive' : 'negative'}`;
        
        elements.totalEarned.textContent = points >= 0 ? `+${points}` : points;
        elements.totalEarned.className = `result-value total`;
        
        // Show results
        elements.resultsDisplay.style.display = 'block';
        
        // If card was already selected, show it
        if (selectedCard) {
            elements.selectedCardInfo.style.display = 'block';
        }
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
            endGame();
        }
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