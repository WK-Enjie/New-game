// Game State
let currentGame = {
    quizData: null,
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

// Sample Quiz Data (Fallback)
const sampleQuiz = {
    "title": "Chapter 16: Introduction to Electricity",
    "subject": "Science",
    "grade": "Secondary 1",
    "questions": [
        {
            "question": "What are the two types of electric charge?",
            "options": ["Hot and cold", "Positive and negative", "Strong and weak", "Large and small"],
            "correct": 1,
            "points": 5,
            "explanation": "There are two types of charge: positive and negative."
        },
        {
            "question": "What happens when you rub a balloon on your hair?",
            "options": [
                "Balloon becomes magnetic",
                "Balloon gains electric charge",
                "Hair loses all its color",
                "Nothing happens"
            ],
            "correct": 1,
            "points": 5,
            "explanation": "Rubbing transfers electrons, giving the balloon an electric charge."
        },
        {
            "question": "Which materials allow electric charges to move easily?",
            "options": ["Insulators", "Conductors", "Semiconductors", "Resistors"],
            "correct": 1,
            "points": 5,
            "explanation": "Conductors (like metals) allow charges to move freely."
        },
        {
            "question": "Why can you get a shock after walking on carpet?",
            "options": [
                "Carpet is electrically alive",
                "Static charge builds up and discharges",
                "Shoes generate electricity",
                "Body produces extra charge"
            ],
            "correct": 1,
            "points": 10,
            "explanation": "Friction builds static charge, which discharges when you touch metal."
        },
        {
            "question": "What is lightning?",
            "options": [
                "A chemical reaction",
                "A giant static electricity discharge",
                "Heat from the sun",
                "Sound in the clouds"
            ],
            "correct": 1,
            "points": 10,
            "explanation": "Lightning is a massive spark caused by static electricity in clouds."
        }
    ]
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
    gameOver: document.getElementById('game-over'),
    jsonHelp: document.getElementById('json-help')
};

// Initialize Game
document.addEventListener('DOMContentLoaded', () => {
    initializeEventListeners();
    loadSampleQuiz(); // Load sample quiz by default
});

function initializeEventListeners() {
    // Start screen buttons
    document.getElementById('sample-quiz').addEventListener('click', loadSampleQuiz);
    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('show-format').addEventListener('click', showJSONFormat);
    document.getElementById('close-help').addEventListener('click', hideJSONFormat);
    
    // File upload
    document.getElementById('quiz-file').addEventListener('change', handleFileUpload);
    
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentGame.difficulty = e.target.dataset.diff;
        });
    });
    
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
    document.getElementById('share-score').addEventListener('click', shareScore);
}

// File Upload Functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    document.getElementById('file-name').textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const quizData = JSON.parse(e.target.result);
            if (validateQuizData(quizData)) {
                currentGame.quizData = quizData;
                document.getElementById('start-game').disabled = false;
                showFeedback("✅ Quiz loaded successfully!", "success");
            } else {
                showFeedback("❌ Invalid quiz format. Please check the JSON structure.", "error");
            }
        } catch (error) {
            showFeedback("❌ Error reading file. Please check if it's valid JSON.", "error");
        }
    };
    reader.readAsText(file);
}

function validateQuizData(data) {
    return data && 
           data.title && 
           data.questions && 
           Array.isArray(data.questions) && 
           data.questions.length > 0;
}

function loadSampleQuiz() {
    currentGame.quizData = sampleQuiz;
    document.getElementById('start-game').disabled = false;
    showFeedback("✅ Sample quiz loaded. Ready to play!", "success");
}

function showJSONFormat() {
    screens.jsonHelp.classList.add('active');
}

function hideJSONFormat() {
    screens.jsonHelp.classList.remove('active');
}

// Game Functions
function startGame() {
    if (!currentGame.quizData) {
        showFeedback("❌ Please load a quiz first!", "error");
        return;
    }
    
    // Reset game state
    currentGame.currentQuestionIndex = 0;
    currentGame.players[0].score = 0;
    currentGame.players[1].score = 0;
    currentGame.players[0].power = 5;
    currentGame.players[1].power = 5;
    currentGame.selectedAnswer = null;
    currentGame.isAnswerSubmitted = false;
    
    // Update UI
    document.getElementById('quiz-title').textContent = currentGame.quizData.title;
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
                pointsEarned = 0; // No point loss with shield
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
        showFeedback(`✨ ${activePlayer.name} earned ${Math.round(pointsEarned)} points!`, "success");
    } else {
        feedback.innerHTML = `
            <div class="feedback-incorrect">
                <span class="feedback-icon">❌</span>
                <strong>Incorrect!</strong> No points earned.
                <div class="explanation">${question.explanation || ''}</div>
                <div class="correct-answer">Correct answer: ${question.options[question.correct]}</div>
            </div>
        `;
        showFeedback(`😢 ${activePlayer.name} answered incorrectly`, "warning");
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
            effectElement.textContent = effect.message;
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
    
    // Roll dice (1-6)
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    currentGame.gameStats.diceRolls++;
    
    // Update dice display
    const diceElement = document.getElementById('dice');
    const resultElement = document.getElementById('dice-result');
    
    diceElement.textContent = diceRoll;
    diceElement.style.animation = 'none';
    setTimeout(() => {
        diceElement.style.animation = 'bounce 0.5s';
    }, 10);
    
    // Calculate bonus based on dice roll
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
    
    activePlayer.score += bonus;
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
    
    // Draw random card
    const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
    currentGame.gameStats.cardsDrawn++;
    
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
    
    // Reset file input
    document.getElementById('quiz-file').value = '';
    document.getElementById('file-name').textContent = 'No file selected';
    document.getElementById('start-game').disabled = true;
}

function shareScore() {
    const scoreText = `🎮 Brain Battle Score: Player 1: ${currentGame.players[0].score} | Player 2: ${currentGame.players[1].score}`;
    
    if (navigator.share) {
        navigator.share({
            title: 'Brain Battle Results',
            text: scoreText,
            url: window.location.href
        });
    } else {
        // Fallback: Copy to clipboard
        navigator.clipboard.writeText(scoreText).then(() => {
            showFeedback("📋 Score copied to clipboard!", "success");
        });
    }
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

// Add CSS for feedback toasts
const style = document.createElement('style');
style.textContent = `
    .feedback-toast {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 10px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .feedback-success { background: #4CAF50; }
    .feedback-error { background: #F44336; }
    .feedback-warning { background: #FF9800; }
    .feedback-info { background: #2196F3; }
    
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    .feedback-correct, .feedback-incorrect {
        padding: 15px;
        border-radius: 10px;
        margin: 10px 0;
    }
    
    .feedback-correct {
        background: #E8F5E9;
        border-left: 5px solid #4CAF50;
    }
    
    .feedback-incorrect {
        background: #FFEBEE;
        border-left: 5px solid #F44336;
    }
    
    .explanation {
        margin-top: 10px;
        font-size: 0.9rem;
        color: #666;
    }
    
    .correct-answer {
        margin-top: 10px;
        font-weight: bold;
        color: #388E3C;
    }
`;
document.head.appendChild(style);