// Brain Battle Card Game - FINAL WORKING VERSION
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
    let hasSubmittedAnswer = false;

    // Points Cards Configuration - ALL WORKING
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
        startScreen: document.getElementById('start-screen'),
        gameScreen: document.getElementById('game-screen'),
        gameOverScreen: document.getElementById('game-over'),
        codeDigits: document.querySelectorAll('.code-digit'),
        keypadButtons: document.querySelectorAll('.keypad-btn'),
        backspaceBtn: document.getElementById('backspace'),
        clearBtn: document.getElementById('clear'),
        validateBtn: document.getElementById('validate-code'),
        startGameBtn: document.getElementById('start-game'),
        startError: document.getElementById('start-error'),
        loadingIndicator: document.getElementById('loading-indicator'),
        quizInfo: document.getElementById('quiz-info'),
        quizTitleDisplay: document.getElementById('quiz-title-display'),
        quizSubjectDisplay: document.getElementById('quiz-subject-display'),
        quizLevelDisplay: document.getElementById('quiz-level-display'),
        quizCountDisplay: document.getElementById('quiz-count-display'),
        gameQuizTitle: document.getElementById('game-quiz-title'),
        currentQ: document.getElementById('current-q'),
        totalQ: document.getElementById('total-q'),
        currentPlayerName: document.getElementById('current-player-name'),
        player1Score: document.getElementById('player1-score'),
        player2Score: document.getElementById('player2-score'),
        player1Display: document.getElementById('player1-display'),
        player2Display: document.getElementById('player2-display'),
        questionText: document.getElementById('question-text'),
        optionsContainer: document.getElementById('options-container'),
        basePoints: document.getElementById('base-points'),
        cardsGrid: document.getElementById('cards-grid'),
        selectedCardInfo: document.getElementById('selected-card-info'),
        selectedCardPoints: document.getElementById('selected-card-points'),
        submitBtn: document.getElementById('submit-answer'),
        nextBtn: document.getElementById('next-question'),
        homeBtn: document.getElementById('home-btn'),
        resultsDisplay: document.getElementById('results-display'),
        answerResult: document.getElementById('answer-result'),
        cardPointsResult: document.getElementById('card-points-result'),
        totalEarned: document.getElementById('total-earned'),
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
        demoButtons: document.querySelectorAll('.demo-btn')
    };

    // DEMO QUIZZES - READY TO USE
    const DEMO_QUIZZES = {
        "334151": {
            code: "334151",
            title: "Static Electricity Quiz",
            subject: "Pure Physics",
            level: "Secondary 4",
            questions: [
                {
                    id: 1,
                    question: "What is the SI unit for measuring electric charge?",
                    options: ["Coulomb", "Newton", "Joule", "Watt"],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    id: 2,
                    question: "When a plastic rod is rubbed with wool, what happens?",
                    options: [
                        "Electrons move from wool to plastic",
                        "Protons move from plastic to wool",
                        "Both become positively charged",
                        "Nothing happens"
                    ],
                    correctAnswer: 0,
                    points: 10
                },
                {
                    id: 3,
                    question: "What happens when two positive charges are brought together?",
                    options: [
                        "They repel each other",
                        "They attract each other",
                        "They cancel each other",
                        "They create a spark"
                    ],
                    correctAnswer: 0,
                    points: 15
                },
                {
                    id: 4,
                    question: "Why do fuel trucks have a metal chain touching the ground?",
                    options: [
                        "To prevent static sparks",
                        "To measure fuel level",
                        "For decoration",
                        "To make noise"
                    ],
                    correctAnswer: 0,
                    points: 15
                },
                {
                    id: 5,
                    question: "What device uses static electricity to remove dust from air?",
                    options: [
                        "Electrostatic precipitator",
                        "Air conditioner",
                        "Humidifier",
                        "Vacuum cleaner"
                    ],
                    correctAnswer: 0,
                    points: 15
                }
            ]
        },
        "101021": {
            code: "101021",
            title: "Fractions Practice",
            subject: "Mathematics",
            level: "Primary 6",
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
        setupEventListeners();
        initCodeInput();
    }

    function setupEventListeners() {
        // Code keypad
        elements.keypadButtons.forEach(btn => {
            if (!btn.id) {
                btn.addEventListener('click', function() {
                    handleCodeInput(this.dataset.key);
                });
            }
        });
        
        // Control buttons
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
        let index = 5;
        while (index >= 0 && elements.codeDigits[index].textContent === '_') {
            index--;
        }
        if (index < 0) return;
        
        elements.codeDigits[index].textContent = '_';
        elements.codeDigits.forEach(d => d.classList.remove('active'));
        elements.codeDigits[index].classList.add('active');
        
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
        
        if (code.length !== 6) {
            showError('Code must be 6 digits');
            return;
        }
        
        showLoading(true);
        
        // Simulate loading delay
        setTimeout(() => {
            if (DEMO_QUIZZES[code]) {
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
                
                console.log('Quiz loaded:', selectedQuiz.title);
            } else {
                showError('Quiz not found. Use 334151 or 101021 for demo.');
                showLoading(false);
            }
        }, 500);
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
        
        resetGameState();
        switchScreen('game');
        initializeGame();
        loadQuestion(currentQuestion);
    }

    function resetGameState() {
        currentQuestion = 0;
        currentPlayer = 1;
        scores = { 1: 0, 2: 0 };
        selectedOption = null;
        selectedCard = null;
        hasSubmittedAnswer = false;
        gameStats = {
            questionsAnswered: 0,
            correctAnswers: 0
        };
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
        createPointsCards();
    }

    function updateScores() {
        elements.player1Score.textContent = scores[1];
        elements.player2Score.textContent = scores[2];
    }

    function updateCurrentPlayer() {
        elements.currentPlayerName.textContent = `Player ${currentPlayer}`;
        
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
            console.error('Question not found');
            return;
        }
        
        const question = quizData.questions[index];
        
        elements.currentQ.textContent = index + 1;
        elements.basePoints.textContent = question.points || 10;
        elements.questionText.innerHTML = question.question;
        
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
        
        selectedOption = null;
        selectedCard = null;
        hasSubmittedAnswer = false;
        resetCards();
        
        elements.resultsDisplay.style.display = 'none';
        elements.selectedCardInfo.style.display = 'none';
        elements.submitBtn.style.display = 'flex';
        elements.nextBtn.style.display = 'none';
        elements.submitBtn.disabled = true;
        
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'auto';
        });
        
        if (window.MathJax) {
            setTimeout(() => {
                MathJax.typesetPromise([elements.questionText]);
            }, 100);
        }
    }

    function createPointsCards() {
        elements.cardsGrid.innerHTML = '';
        
        const shuffledCards = [...POINTS_CARDS].sort(() => Math.random() - 0.5);
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
        // Only allow card selection AFTER submitting answer
        if (!hasSubmittedAnswer) {
            console.log('Please submit your answer first!');
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
        
        // Apply card effect immediately
        applyCardEffect();
    }

    function selectOption(optionElement) {
        document.querySelectorAll('.option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        optionElement.classList.add('selected');
        selectedOption = parseInt(optionElement.dataset.index);
        elements.submitBtn.disabled = false;
    }

    function submitAnswer() {
        if (selectedOption === null) {
            showError('Please select an answer first.');
            return;
        }
        
        const question = quizData.questions[currentQuestion];
        const isCorrect = selectedOption === question.correctAnswer;
        
        gameStats.questionsAnswered++;
        if (isCorrect) gameStats.correctAnswers++;
        
        // Mark that answer has been submitted
        hasSubmittedAnswer = true;
        
        // Calculate base points
        const basePoints = isCorrect ? (question.points || 10) : 0;
        
        // Show initial results (without card effects yet)
        showResults(isCorrect, basePoints, "Select a card for bonus points!");
        
        // Disable options
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        // Show next button, hide submit
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
        
        console.log('Answer submitted. Base points:', basePoints);
    }

    function applyCardEffect() {
        if (!selectedCard || !hasSubmittedAnswer) {
            console.log('Cannot apply card effect:', { selectedCard, hasSubmittedAnswer });
            return;
        }
        
        const question = quizData.questions[currentQuestion];
        const isCorrect = selectedOption === question.correctAnswer;
        const basePoints = isCorrect ? (question.points || 10) : 0;
        
        console.log('Applying card effect:', selectedCard.title);
        console.log('Base points:', basePoints, 'Card type:', selectedCard.type);
        
        let totalPoints = basePoints;
        let cardEffectMessage = "";
        
        // Apply card effect based on type
        switch(selectedCard.type) {
            case 'positive':
                // Small Win, Good Score, Big Win, Bonus Points
                totalPoints = basePoints + selectedCard.points;
                cardEffectMessage = `+${selectedCard.points} bonus points!`;
                break;
                
            case 'negative':
                // Risk Card
                totalPoints = basePoints + selectedCard.points; // Negative number
                cardEffectMessage = `Risk: ${selectedCard.points} points`;
                break;
                
            case 'multiplier':
                // Double Points
                totalPoints = basePoints * 2;
                cardEffectMessage = `Double points! (×2)`;
                break;
                
            case 'steal':
                // Steal 5
                const opponent = currentPlayer === 1 ? 2 : 1;
                const stealAmount = 5;
                
                // Steal from opponent (minimum 0)
                scores[opponent] = Math.max(0, scores[opponent] - stealAmount);
                totalPoints = basePoints + stealAmount;
                cardEffectMessage = `Stole ${stealAmount} points!`;
                
                // Update opponent's score display
                updateScores();
                break;
                
            case 'random':
                // Lucky Draw
                const randomPoints = Math.floor(Math.random() * 20) + 1;
                totalPoints = basePoints + randomPoints;
                cardEffectMessage = `Lucky draw: +${randomPoints} points!`;
                break;
        }
        
        // Calculate points from card effect only
        const cardPointsEarned = totalPoints - basePoints;
        
        // Update current player's score
        scores[currentPlayer] += cardPointsEarned;
        updateScores();
        
        console.log('Card effect applied. Points earned:', cardPointsEarned);
        console.log('New scores:', scores);
        
        // Update results display with card effect
        showResults(isCorrect, totalPoints, cardEffectMessage);
    }

    function showResults(isCorrect, points, effectMessage = "") {
        elements.answerResult.textContent = isCorrect ? 'Correct' : 'Incorrect';
        elements.answerResult.className = `result-value ${isCorrect ? 'correct' : 'incorrect'}`;
        
        elements.cardPointsResult.textContent = points >= 0 ? `+${points}` : points;
        elements.cardPointsResult.className = `result-value ${points >= 0 ? 'positive' : 'negative'}`;
        
        elements.totalEarned.textContent = points >= 0 ? `+${points}` : points;
        elements.totalEarned.className = `result-value total`;
        
        // Clear previous effect messages
        const existingEffects = elements.resultsDisplay.querySelectorAll('.effect-message');
        existingEffects.forEach(effect => effect.remove());
        
        // Add new effect message if provided
        if (effectMessage) {
            const effectElement = document.createElement('div');
            effectElement.className = 'result-item effect-message';
            effectElement.innerHTML = `
                <span class="result-label">Card Effect:</span>
                <span class="result-value neutral">${effectMessage}</span>
            `;
            elements.resultsDisplay.querySelector('.result-details').appendChild(effectElement);
        }
        
        elements.resultsDisplay.style.display = 'block';
    }

    function nextQuestion() {
        // Switch to next player
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

    function goHome() {
        switchScreen('start');
    }

    function endGame() {
        let winner = 0;
        let winnerText = "It's a Tie!";
        let message = "Both players showed great skill!";
        
        if (scores[1] > scores[2]) {
            winner = 1;
            winnerText = "Player 1 Wins!";
            message = `Player 1 wins with ${scores[1]} points!`;
        } else if (scores[2] > scores[1]) {
            winner = 2;
            winnerText = "Player 2 Wins!";
            message = `Player 2 wins with ${scores[2]} points!`;
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