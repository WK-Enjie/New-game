// Brain Battle Card Game - Complete Working Version
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

    // Points Cards Configuration - SIMPLIFIED
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

    // DEMO QUIZZES
    const DEMO_QUIZZES = {
        "334151": {
            code: "334151",
            title: "Static Electricity (Conceptual)",
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
                    question: "When a plastic rod is rubbed with wool, the plastic becomes negatively charged. What has been transferred?",
                    options: [
                        "Electrons from wool to plastic",
                        "Protons from plastic to wool", 
                        "Electrons from plastic to wool",
                        "Protons from wool to plastic"
                    ],
                    correctAnswer: 0,
                    points: 10
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
                    points: 15
                }
            ]
        }
    };

    // Initialize
    init();

    function init() {
        setupEventListeners();
        initCodeInput();
    }

    function setupEventListeners() {
        elements.keypadButtons.forEach(btn => {
            if (!btn.id) btn.addEventListener('click', () => handleCodeInput(btn.dataset.key));
        });
        elements.backspaceBtn.addEventListener('click', handleBackspace);
        elements.clearBtn.addEventListener('click', handleClear);
        elements.validateBtn.addEventListener('click', validateCode);
        elements.startGameBtn.addEventListener('click', startGame);
        elements.demoButtons.forEach(btn => {
            btn.addEventListener('click', () => enterDemoCode(btn.dataset.code));
        });
        elements.submitBtn.addEventListener('click', submitAnswer);
        elements.nextBtn.addEventListener('click', nextQuestion);
        elements.homeBtn.addEventListener('click', goHome);
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
        if (index < 5) elements.codeDigits[index + 1].classList.add('active');
        updateValidateButton();
    }

    function handleBackspace() {
        let index = 5;
        while (index >= 0 && elements.codeDigits[index].textContent === '_') index--;
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
        elements.validateBtn.disabled = getCurrentCode().length !== 6;
    }

    function getCurrentCode() {
        return Array.from(elements.codeDigits).map(d => d.textContent).join('').replace(/_/g, '');
    }

    function enterDemoCode(code) {
        handleClear();
        code.split('').forEach((char, index) => {
            if (index < 6) elements.codeDigits[index].textContent = char;
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
        
        if (DEMO_QUIZZES[code]) {
            setTimeout(() => {
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
            }, 500);
        } else {
            showError('Quiz not found. Use 334151 for demo.');
            showLoading(false);
        }
    }

    function showLoading(show) {
        elements.loadingIndicator.style.display = show ? 'block' : 'none';
        elements.validateBtn.disabled = show;
        elements.validateBtn.innerHTML = show ? 
            '<i class="fas fa-spinner fa-spin"></i> Loading...' : 
            '<i class="fas fa-search"></i> Load Quiz';
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
        gameStats = { questionsAnswered: 0, correctAnswers: 0 };
    }

    function switchScreen(screenName) {
        currentScreen = screenName;
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        const screen = document.getElementById(`${screenName}-screen`);
        if (screen) screen.classList.add('active');
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
        const question = quizData.questions[index];
        elements.currentQ.textContent = index + 1;
        elements.basePoints.textContent = question.points || 10;
        elements.questionText.innerHTML = question.question;
        
        elements.optionsContainer.innerHTML = '';
        ['A', 'B', 'C', 'D'].forEach((letter, i) => {
            if (i < 4) {
                const option = document.createElement('div');
                option.className = 'option';
                option.dataset.index = i;
                option.innerHTML = `
                    <div class="option-letter">${letter}</div>
                    <div class="option-text">${question.options[i]}</div>
                `;
                option.addEventListener('click', () => selectOption(option));
                elements.optionsContainer.appendChild(option);
            }
        });
        
        selectedOption = null;
        selectedCard = null;
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
            setTimeout(() => MathJax.typesetPromise([elements.questionText]), 100);
        }
    }

    function createPointsCards() {
        elements.cardsGrid.innerHTML = '';
        const shuffledCards = [...POINTS_CARDS].sort(() => Math.random() - 0.5).slice(0, 5);
        
        shuffledCards.forEach((card, index) => {
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
            
            cardElement.addEventListener('click', () => selectCard(cardElement, card));
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
        if (elements.submitBtn.style.display !== 'none') return;
        
        document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));
        cardElement.classList.add('selected');
        selectedCard = card;
        
        elements.selectedCardPoints.textContent = card.points;
        const pointsClass = card.type === 'positive' ? 'positive' : 
                          card.type === 'negative' ? 'negative' : 'neutral';
        elements.selectedCardPoints.className = `card-points ${pointsClass}`;
        elements.selectedCardInfo.style.display = 'block';
    }

    function selectOption(optionElement) {
        document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
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
        
        // Calculate points - FIXED BONUS CARD LOGIC
        let pointsEarned = 0;
        let cardEffectMessage = "";
        
        if (isCorrect) {
            pointsEarned = question.points || 10;
            
            // Apply card effect if card is selected
            if (selectedCard) {
                console.log("Applying card effect:", selectedCard);
                
                // Handle different card types
                if (selectedCard.type === 'multiplier') {
                    pointsEarned *= 2;
                    cardEffectMessage = `Points doubled!`;
                } 
                else if (selectedCard.type === 'steal') {
                    const opponent = currentPlayer === 1 ? 2 : 1;
                    const stealAmount = 5;
                    scores[opponent] = Math.max(0, scores[opponent] - stealAmount);
                    pointsEarned += stealAmount;
                    cardEffectMessage = `Stole ${stealAmount} points!`;
                }
                else if (selectedCard.type === 'random') {
                    const randomPoints = Math.floor(Math.random() * 20) + 1;
                    pointsEarned += randomPoints;
                    cardEffectMessage = `Random bonus: +${randomPoints}`;
                }
                else if (selectedCard.type === 'positive') {
                    // This handles Small Win, Good Score, Big Win, Bonus Points
                    pointsEarned += selectedCard.points;
                    cardEffectMessage = `Bonus: +${selectedCard.points} points`;
                }
                else if (selectedCard.type === 'negative') {
                    // Risk Card - subtract points
                    pointsEarned += selectedCard.points; // Negative number
                    cardEffectMessage = `Risk: ${selectedCard.points} points`;
                }
            }
            
            scores[currentPlayer] += pointsEarned;
            updateScores();
        } else {
            cardEffectMessage = "Wrong answer";
            
            // For wrong answers, only negative cards apply
            if (selectedCard && selectedCard.type === 'negative') {
                pointsEarned = selectedCard.points; // Negative number
                scores[currentPlayer] += pointsEarned;
                updateScores();
                cardEffectMessage = `Wrong answer penalty: ${selectedCard.points}`;
            }
        }
        
        // Show results with card effect message
        showResults(isCorrect, pointsEarned, cardEffectMessage);
        
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
    }

    function showResults(isCorrect, points, effectMessage = "") {
        elements.answerResult.textContent = isCorrect ? 'Correct' : 'Incorrect';
        elements.answerResult.className = `result-value ${isCorrect ? 'correct' : 'incorrect'}`;
        
        elements.cardPointsResult.textContent = points >= 0 ? `+${points}` : points;
        elements.cardPointsResult.className = `result-value ${points >= 0 ? 'positive' : 'negative'}`;
        
        elements.totalEarned.textContent = points >= 0 ? `+${points}` : points;
        elements.totalEarned.className = `result-value total`;
        
        // Clear previous effect messages
        const existingEffect = elements.resultsDisplay.querySelector('.effect-message');
        if (existingEffect) existingEffect.remove();
        
        // Add new effect message if exists
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
        
        if (selectedCard) {
            elements.selectedCardInfo.style.display = 'block';
        }
    }

    function nextQuestion() {
        currentPlayer = currentPlayer === 1 ? 2 : 1;
        updateCurrentPlayer();
        
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
        
        const accuracy = gameStats.questionsAnswered > 0 
            ? Math.round((gameStats.correctAnswers / gameStats.questionsAnswered) * 100)
            : 0;
        
        elements.winnerTitle.textContent = winnerText;
        elements.winnerMessage.textContent = message;
        elements.finalScore1.textContent = scores[1];
        elements.finalScore2.textContent = scores[2];
        elements.questionsAnswered.textContent = gameStats.questionsAnswered;
        elements.correctAnswers.textContent = gameStats.correctAnswers;
        elements.accuracyRate.textContent = `${accuracy}%`;
        
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
        setTimeout(() => elements.startError.textContent = '', 5000);
    }
});
