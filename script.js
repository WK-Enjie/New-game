// Game State - Simple version for kids
const gameState = {
    quiz: null,
    currentQuestion: 0,
    currentPlayer: 1,
    scores: [0, 0],
    powerPoints: 5,
    riskLevel: 1,
    activeEffects: [],
    gameStats: {
        correctAnswers: 0,
        diceRolls: 0,
        cardsDrawn: 0,
        highestCombo: 0
    }
};

// Simple effects for kids
const effects = {
    double: { name: "Double Points", emoji: "⚡", multiplier: 2 },
    bonus: { name: "Bonus +10", emoji: "🎁", points: 10 },
    shield: { name: "Safety Net", emoji: "🛡️", protection: true },
    swap: { name: "Score Swap", emoji: "🔄", action: "swap" }
};

// Simple chance cards for kids
const chanceCards = [
    { name: "Double Points", emoji: "⚡", effect: "double" },
    { name: "Bonus Points", emoji: "🎁", effect: "bonus" },
    { name: "Safety Net", emoji: "🛡️", effect: "shield" },
    { name: "Swap Scores", emoji: "🔄", effect: "swap" },
    { name: "Extra Power", emoji: "🔋", effect: "power" },
    { name: "Lucky Guess", emoji: "🍀", effect: "lucky" }
];

// Initialize game
function initGame() {
    console.log("🚀 Starting game for ages 10-16!");
    
    // Reset state
    gameState.currentQuestion = 0;
    gameState.currentPlayer = 1;
    gameState.scores = [0, 0];
    gameState.powerPoints = 5;
    gameState.riskLevel = 1;
    gameState.activeEffects = [];
    gameState.gameStats = {
        correctAnswers: 0,
        diceRolls: 0,
        cardsDrawn: 0,
        highestCombo: 0
    };
    
    // Update UI
    updateScores();
    updatePowerPoints();
    updatePlayerTurn();
    loadQuestion();
    
    // Show game screen
    showScreen('game-screen');
    
    // Play fun sound (if we had audio)
    console.log("🎮 Game started!");
}

// Load question
function loadQuestion() {
    if (!gameState.quiz || !gameState.quiz.questions) {
        console.error("No quiz loaded!");
        return;
    }
    
    const question = gameState.quiz.questions[gameState.currentQuestion];
    if (!question) {
        endGame();
        return;
    }
    
    // Update counters
    document.getElementById('current-q').textContent = gameState.currentQuestion + 1;
    document.getElementById('total-q').textContent = gameState.quiz.questions.length;
    document.getElementById('question-points').textContent = (question.points || 10) * gameState.riskLevel + " pts";
    
    // Set question
    document.getElementById('question-text').textContent = question.question;
    
    // Clear and add options
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'option';
        optionEl.innerHTML = `
            <span class="option-letter">${String.fromCharCode(65 + index)})</span>
            <span class="option-text">${option}</span>
        `;
        optionEl.dataset.index = index;
        optionEl.onclick = () => selectOption(index);
        container.appendChild(optionEl);
    });
    
    // Reset UI
    gameState.selectedAnswer = null;
    gameState.answered = false;
    
    document.getElementById('submit-answer').disabled = true;
    document.getElementById('submit-answer').style.display = 'block';
    document.getElementById('next-question').style.display = 'none';
    
    // Clear feedback
    document.getElementById('feedback').innerHTML = `
        <div class="feedback-placeholder">
            <span class="feedback-icon">💡</span>
            Select your answer and use chance elements!
        </div>
    `;
    
    // Clear chance results
    document.getElementById('dice-result').textContent = '';
    document.getElementById('card-result').textContent = '';
    
    // Update effects
    updateEffectsDisplay();
}

// Select option
function selectOption(index) {
    if (gameState.answered) return;
    
    // Remove previous selection
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    // Select new option
    const options = document.querySelectorAll('.option');
    if (options[index]) {
        options[index].classList.add('selected');
        gameState.selectedAnswer = index;
        document.getElementById('submit-answer').disabled = false;
    }
}

// Submit answer
function submitAnswer() {
    if (gameState.answered || gameState.selectedAnswer === null) return;
    
    gameState.answered = true;
    const question = gameState.quiz.questions[gameState.currentQuestion];
    const isCorrect = gameState.selectedAnswer === question.correct;
    
    // Disable submit
    document.getElementById('submit-answer').disabled = true;
    
    // Mark answers
    document.querySelectorAll('.option').forEach((opt, index) => {
        if (index === question.correct) {
            opt.classList.add('correct');
        } else if (index === gameState.selectedAnswer && !isCorrect) {
            opt.classList.add('incorrect');
        }
    });
    
    // Calculate points
    let points = 0;
    if (isCorrect) {
        // Base points with risk multiplier
        points = (question.points || 10) * gameState.riskLevel;
        
        // Apply effects
        gameState.activeEffects.forEach(effect => {
            if (effect.multiplier) {
                points = Math.round(points * effect.multiplier);
            }
            if (effect.points) {
                points += effect.points;
            }
        });
        
        // Add to score
        gameState.scores[gameState.currentPlayer - 1] += points;
        gameState.gameStats.correctAnswers++;
        
        // Add power points for correct answer
        gameState.powerPoints += 1;
        
        // Show feedback
        let feedback = `
            <div class="feedback-correct">
                <h3>🎉 Correct Answer!</h3>
                <p class="points-earned">+${points} points earned!</p>
                <p class="risk-info">Risk Level: ${getRiskLabel(gameState.riskLevel)} (x${gameState.riskLevel})</p>
                ${question.explanation ? `<p class="explanation"><strong>💡 Explanation:</strong> ${question.explanation}</p>` : ''}
                <p class="power-earned">+1 Power Point!</p>
            </div>
        `;
        
        document.getElementById('feedback').innerHTML = feedback;
    } else {
        const correctLetter = String.fromCharCode(65 + question.correct);
        const correctText = question.options[question.correct];
        
        let feedback = `
            <div class="feedback-incorrect">
                <h3>😅 Not Quite Right</h3>
                <p class="correct-answer">The correct answer was: <strong>${correctLetter}) ${correctText}</strong></p>
                ${question.explanation ? `<p class="explanation"><strong>💡 Explanation:</strong> ${question.explanation}</p>` : ''}
                <p class="switch-player">Switching to ${gameState.currentPlayer === 1 ? 'Player 2' : 'Player 1'}!</p>
            </div>
        `;
        
        document.getElementById('feedback').innerHTML = feedback;
        
        // Switch player
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
        updatePlayerTurn();
    }
    
    // Remove used effects
    gameState.activeEffects = [];
    
    // Show next button
    document.getElementById('next-question').style.display = 'block';
    
    // Update UI
    updateScores();
    updatePowerPoints();
    updateEffectsDisplay();
}

// Next question
function nextQuestion() {
    gameState.currentQuestion++;
    
    if (gameState.currentQuestion >= gameState.quiz.questions.length) {
        endGame();
        return;
    }
    
    // Switch player if answer was incorrect
    if (gameState.answered) {
        gameState.currentPlayer = gameState.currentPlayer === 1 ? 2 : 1;
    }
    
    loadQuestion();
    updatePlayerTurn();
}

// Dice roll - Simple version for kids
function rollDice() {
    if (gameState.powerPoints < 1) {
        showMessage("Not enough Power Points! Get some by answering correctly.", "warning");
        return;
    }
    
    // Spend power point
    gameState.powerPoints--;
    gameState.gameStats.diceRolls++;
    
    // Animate dice
    const dice = document.getElementById('dice');
    dice.textContent = "🎲";
    dice.style.animation = "none";
    void dice.offsetWidth; // Trigger reflow
    
    // Simple dice animation
    let rolls = 0;
    const rollInterval = setInterval(() => {
        dice.textContent = Math.floor(Math.random() * 6) + 1;
        rolls++;
        
        if (rolls > 10) {
            clearInterval(rollInterval);
            
            // Final roll
            const result = Math.floor(Math.random() * 6) + 1;
            dice.textContent = result;
            
            // Apply effect
            applyDiceEffect(result);
        }
    }, 100);
}

function applyDiceEffect(result) {
    const resultDiv = document.getElementById('dice-result');
    let message = "";
    
    switch(result) {
        case 1:
            message = "😅 Rolled 1: Lose 2 points";
            gameState.scores[gameState.currentPlayer - 1] -= 2;
            break;
        case 2:
            message = "👍 Rolled 2: +2 points";
            gameState.scores[gameState.currentPlayer - 1] += 2;
            break;
        case 3:
            message = "🎲 Rolled 3: +1 Power Point";
            gameState.powerPoints++;
            break;
        case 4:
            message = "✨ Rolled 4: +5 points";
            gameState.scores[gameState.currentPlayer - 1] += 5;
            break;
        case 5:
            message = "🌟 Rolled 5: Double next answer!";
            gameState.activeEffects.push({...effects.double});
            break;
        case 6:
            message = "🎉 Rolled 6: Bonus +10 points!";
            gameState.scores[gameState.currentPlayer - 1] += 10;
            break;
    }
    
    resultDiv.textContent = message;
    updateScores();
    updatePowerPoints();
    updateEffectsDisplay();
}

// Draw chance card
function drawCard() {
    if (gameState.powerPoints < 2) {
        showMessage("Need 2 Power Points to draw a card!", "warning");
        return;
    }
    
    // Spend power points
    gameState.powerPoints -= 2;
    gameState.gameStats.cardsDrawn++;
    
    // Draw random card
    const card = chanceCards[Math.floor(Math.random() * chanceCards.length)];
    const resultDiv = document.getElementById('card-result');
    
    // Show card animation
    resultDiv.innerHTML = `<div class="card-reveal">🎴 Drawing card...</div>`;
    
    setTimeout(() => {
        // Apply card effect
        switch(card.effect) {
            case "double":
                gameState.activeEffects.push({...effects.double});
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! Next answer doubled!</div>`;
                break;
            case "bonus":
                gameState.scores[gameState.currentPlayer - 1] += 10;
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! +10 points!</div>`;
                updateScores();
                break;
            case "shield":
                gameState.activeEffects.push({...effects.shield});
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! Protected from point loss!</div>`;
                break;
            case "swap":
                [gameState.scores[0], gameState.scores[1]] = [gameState.scores[1], gameState.scores[0]];
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! Scores swapped!</div>`;
                updateScores();
                break;
            case "power":
                gameState.powerPoints += 3;
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! +3 Power Points!</div>`;
                updatePowerPoints();
                break;
            case "lucky":
                gameState.powerPoints += 2;
                gameState.scores[gameState.currentPlayer - 1] += 5;
                resultDiv.innerHTML = `<div class="card-reveal">${card.emoji} ${card.name}! +5 points & +2 Power!</div>`;
                updateScores();
                updatePowerPoints();
                break;
        }
        
        updateEffectsDisplay();
    }, 1000);
}

// Set risk level
function setRiskLevel(level) {
    gameState.riskLevel = level;
    
    // Update UI
    document.querySelectorAll('.risk-btn').forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.risk) === level) {
            btn.classList.add('active');
        }
    });
    
    showMessage(`Risk level set to: ${getRiskLabel(level)} (x${level})`, "info");
}

// Helper functions
function getRiskLabel(level) {
    switch(level) {
        case 1: return "Low";
        case 2: return "Medium";
        case 3: return "High";
        default: return "Unknown";
    }
}

function updateScores() {
    document.querySelectorAll('.player-score').forEach((scoreEl, index) => {
        scoreEl.textContent = gameState.scores[index];
    });
}

function updatePowerPoints() {
    document.getElementById('power-count').textContent = gameState.powerPoints;
}

function updatePlayerTurn() {
    document.querySelectorAll('.player').forEach((playerEl, index) => {
        const playerNum = index + 1;
        if (playerNum === gameState.currentPlayer) {
            playerEl.classList.add('active');
        } else {
            playerEl.classList.remove('active');
        }
    });
}

function updateEffectsDisplay() {
    const effectsList = document.getElementById('effects-list');
    if (gameState.activeEffects.length === 0) {
        effectsList.innerHTML = '<div class="no-effects">No active effects</div>';
        return;
    }
    
    effectsList.innerHTML = gameState.activeEffects.map(effect => 
        `<div class="effect-item">${effect.emoji} ${effect.name}</div>`
    ).join('');
}

// End game
function endGame() {
    const score1 = gameState.scores[0];
    const score2 = gameState.scores[1];
    
    let winnerMessage = "";
    if (score1 > score2) {
        winnerMessage = "Player 1 Wins! 🎉";
    } else if (score2 > score1) {
        winnerMessage = "Player 2 Wins! 🎉";
    } else {
        winnerMessage = "It's a Tie! 🤝";
    }
    
    // Update game over screen
    document.getElementById('winner-message').textContent = winnerMessage;
    document.getElementById('final-score1').textContent = score1;
    document.getElementById('final-score2').textContent = score2;
    
    // Update stats
    const statsHTML = `
        <div class="stat-item">
            <div class="stat-emoji">✅</div>
            <div class="stat-name">Correct Answers</div>
            <div class="stat-value">${gameState.gameStats.correctAnswers}</div>
        </div>
        <div class="stat-item">
            <div class="stat-emoji">🎲</div>
            <div class="stat-name">Dice Rolls</div>
            <div class="stat-value">${gameState.gameStats.diceRolls}</div>
        </div>
        <div class="stat-item">
            <div class="stat-emoji">🃏</div>
            <div class="stat-name">Cards Drawn</div>
            <div class="stat-value">${gameState.gameStats.cardsDrawn}</div>
        </div>
        <div class="stat-item">
            <div class="stat-emoji">📊</div>
            <div class="stat-name">Total Score</div>
            <div class="stat-value">${score1 + score2}</div>
        </div>
    `;
    
    document.getElementById('game-stats').innerHTML = statsHTML;
    
    // Show game over screen
    showScreen('game-over');
}

// Screen management
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// File upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        try {
            const quizData = JSON.parse(e.target.result);
            
            // Validate quiz format
            if (!quizData.questions || !Array.isArray(quizData.questions)) {
                throw new Error("Invalid quiz format: Missing questions array");
            }
            
            if (quizData.questions.length === 0) {
                throw new Error("Quiz has no questions");
            }
            
            // Check each question
            quizData.questions.forEach((q, i) => {
                if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length < 2) {
                    throw new Error(`Question ${i + 1} is invalid`);
                }
                if (q.correct === undefined || q.correct < 0 || q.correct >= q.options.length) {
                    throw new Error(`Question ${i + 1} has invalid correct answer`);
                }
            });
            
            gameState.quiz = quizData;
            
            // Update UI
            document.getElementById('quiz-title').textContent = quizData.title || "Quiz";
            document.getElementById('file-name').textContent = file.name;
            document.getElementById('start-game').disabled = false;
            
            showMessage("✅ Quiz loaded successfully!", "success");
            console.log("Quiz loaded:", quizData.title);
            
        } catch (error) {
            showMessage(`❌ Error: ${error.message}`, "error");
            console.error("Quiz loading error:", error);
        }
    };
    
    reader.readAsText(file);
}

// Sample quiz for quick play
function loadSampleQuiz() {
    const sampleQuiz = {
        "title": "Fun Trivia Challenge!",
        "questions": [
            {
                "question": "What is the largest planet in our solar system?",
                "options": ["Earth", "Saturn", "Jupiter", "Mars"],
                "correct": 2,
                "points": 10,
                "explanation": "Jupiter is the largest planet in our solar system."
            },
            {
                "question": "How many legs does a spider have?",
                "options": ["6", "8", "10", "12"],
                "correct": 1,
                "points": 5,
                "explanation": "Spiders have 8 legs."
            },
            {
                "question": "What is 15 × 4?",
                "options": ["45", "50", "60", "75"],
                "correct": 2,
                "points": 10,
                "explanation": "15 multiplied by 4 equals 60."
            },
            {
                "question": "Which animal is known as the 'King of the Jungle'?",
                "options": ["Tiger", "Elephant", "Lion", "Gorilla"],
                "correct": 2,
                "points": 10,
                "explanation": "The lion is often called the King of the Jungle."
            },
            {
                "question": "What gas do plants breathe in?",
                "options": ["Oxygen", "Nitrogen", "Carbon Dioxide", "Hydrogen"],
                "correct": 2,
                "points": 15,
                "explanation": "Plants use carbon dioxide during photosynthesis."
            }
        ]
    };
    
    gameState.quiz = sampleQuiz;
    document.getElementById('quiz-title').textContent = sampleQuiz.title;
    document.getElementById('file-name').textContent = "Fun Trivia Challenge";
    document.getElementById('start-game').disabled = false;
    
    showMessage("✅ Sample quiz loaded! Ready to play!", "success");
}

// Helper function to show messages
function showMessage(message, type = "info") {
    console.log(`${type}: ${message}`);
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message message-${type}`;
    messageEl.innerHTML = `
        <span class="message-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '💡'}</span>
        <span class="message-text">${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Remove after 3 seconds
    setTimeout(() => {
        messageEl.remove();
    }, 3000);
}

// Set difficulty
function setDifficulty(level) {
    const difficulties = {
        easy: { risk: 1, power: 8 },
        medium: { risk: 2, power: 5 },
        hard: { risk: 3, power: 3 }
    };
    
    gameState.powerPoints = difficulties[level].power;
    gameState.riskLevel = difficulties[level].risk;
    
    // Update UI
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.diff === level) {
            btn.classList.add('active');
        }
    });
    
    showMessage(`Difficulty set to: ${level.toUpperCase()}`, "info");
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log("🎮 Brain Battle Game Loaded!");
    console.log("👦👧 Perfect for ages 10-16!");
    
    // File upload
    document.getElementById('quiz-file').addEventListener('change', handleFileUpload);
    
    // Sample quiz
    document.getElementById('sample-quiz').addEventListener('click', loadSampleQuiz);
    
    // Start game
    document.getElementById('start-game').addEventListener('click', initGame);
    
    // Game controls
    document.getElementById('submit-answer').addEventListener('click', submitAnswer);
    document.getElementById('next-question').addEventListener('click', nextQuestion);
    document.getElementById('home-btn').addEventListener('click', () => showScreen('start-screen'));
    
    // Chance elements
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    document.getElementById('draw-card').addEventListener('click', drawCard);
    
    // Risk buttons
    document.querySelectorAll('.risk-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setRiskLevel(parseInt(this.dataset.risk));
        });
    });
    
    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            setDifficulty(this.dataset.diff);
        });
    });
    
    // Game over buttons
    document.getElementById('play-again').addEventListener('click', initGame);
    document.getElementById('new-quiz').addEventListener('click', () => {
        showScreen('start-screen');
        document.getElementById('quiz-file').value = '';
        document.getElementById('file-name').textContent = 'No file selected';
        document.getElementById('start-game').disabled = true;
    });
    
    // Share button (simulated)
    document.getElementById('share-score').addEventListener('click', function() {
        const score1 = gameState.scores[0] || 0;
        const score2 = gameState.scores[1] || 0;
        const winner = score1 > score2 ? "Player 1" : score2 > score1 ? "Player 2" : "Both players";
        
        const message = `🎮 I just played Brain Battle! Final score: ${score1} - ${score2}. ${winner} won! Try it at: ${window.location.href}`;
        showMessage("📤 Score copied to clipboard! Share it with friends!", "success");
        
        // Copy to clipboard (if supported)
        if (navigator.clipboard) {
            navigator.clipboard.writeText(message).catch(console.error);
        }
    });
    
    // JSON format help
    document.getElementById('show-format').addEventListener('click', function() {
        document.getElementById('json-help').classList.add('active');
    });
    
    document.getElementById('close-help').addEventListener('click', function() {
        document.getElementById('json-help').classList.remove('active');
    });
    
    // Close modal on outside click
    document.getElementById('json-help').addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
        }
    });
    
    // Set default difficulty
    setDifficulty('easy');
});