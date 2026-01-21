// Simple game state
const game = {
    players: [
        { name: "Player 1", color: "#4a6bff", score: 0, powerups: [] },
        { name: "Player 2", color: "#ff6b4a", score: 0, powerups: [] }
    ],
    currentPlayer: 0,
    questions: [],
    currentQuestion: 0,
    selectedOption: null,
    level: null,
    subject: null,
    pin: null
};

// Sample questions for different PINs
const questionBank = {
    "354011": [
        { q: "What is the chemical formula for water?", options: ["H2O", "CO2", "O2", "NaCl"], correct: 0, points: 10 },
        { q: "Who discovered penicillin?", options: ["Marie Curie", "Alexander Fleming", "Albert Einstein", "Isaac Newton"], correct: 1, points: 10 },
        { q: "What is the atomic number of carbon?", options: ["6", "8", "12", "14"], correct: 0, points: 10 },
        { q: "Which gas is most abundant in Earth's atmosphere?", options: ["Oxygen", "Carbon Dioxide", "Nitrogen", "Hydrogen"], correct: 2, points: 10 },
        { q: "What is the pH of pure water?", options: ["5", "6", "7", "8"], correct: 2, points: 10 }
    ],
    "101011": [
        { q: "What is 5 + 3?", options: ["7", "8", "9", "10"], correct: 1, points: 10 },
        { q: "How many sides does a triangle have?", options: ["3", "4", "5", "6"], correct: 0, points: 10 },
        { q: "What is 10 - 4?", options: ["5", "6", "7", "8"], correct: 1, points: 10 },
        { q: "Which shape is round?", options: ["Square", "Triangle", "Circle", "Rectangle"], correct: 2, points: 10 },
        { q: "What is 2 × 3?", options: ["5", "6", "7", "8"], correct: 1, points: 10 }
    ],
    "default": [
        { q: "What is 15 + 27?", options: ["32", "42", "52", "62"], correct: 1, points: 10 },
        { q: "What is the capital of France?", options: ["London", "Berlin", "Paris", "Madrid"], correct: 2, points: 10 },
        { q: "Who painted the Mona Lisa?", options: ["Van Gogh", "Picasso", "Da Vinci", "Rembrandt"], correct: 2, points: 10 },
        { q: "What is the largest planet?", options: ["Earth", "Mars", "Jupiter", "Saturn"], correct: 2, points: 10 },
        { q: "How many continents are there?", options: ["5", "6", "7", "8"], correct: 2, points: 10 }
    ]
};

// Chapter data for modal
const chapters = {
    primary: {
        math: ["Numbers to 10", "Number Bonds", "Addition", "Subtraction", "Shapes"],
        science: ["Living Things", "Plants", "Animals", "Materials", "Weather"]
    },
    lower: {
        math: ["Algebra", "Geometry", "Statistics", "Probability", "Fractions"],
        science: ["Cells", "Energy", "Forces", "Matter", "Ecosystems"]
    },
    upper: {
        math: ["Calculus", "Trigonometry", "Vectors", "Complex Numbers", "Statistics"],
        physics: ["Mechanics", "Waves", "Electricity", "Magnetism", "Thermodynamics"],
        chemistry: ["Atomic Structure", "Chemical Bonding", "Organic Chemistry", "Acids & Bases", "Electrochemistry"]
    }
};

// Initialize
function init() {
    // Load players
    game.players[0].name = document.getElementById('player1').value;
    game.players[1].name = document.getElementById('player2').value;
    game.players[0].color = document.getElementById('color1').value;
    game.players[1].color = document.getElementById('color2').value;
    
    // Update displays
    document.getElementById('p1name').textContent = game.players[0].name;
    document.getElementById('p2name').textContent = game.players[1].name;
    document.getElementById('score1').style.borderColor = game.players[0].color;
    document.getElementById('score2').style.borderColor = game.players[1].color;
    
    // Setup event listeners
    setupEvents();
    
    // Update subjects based on level
    updateSubjects();
}

// Setup all event listeners
function setupEvents() {
    // Player name changes
    document.getElementById('player1').addEventListener('input', e => {
        game.players[0].name = e.target.value || "Player 1";
        document.getElementById('p1name').textContent = game.players[0].name;
    });
    
    document.getElementById('player2').addEventListener('input', e => {
        game.players[1].name = e.target.value || "Player 2";
        document.getElementById('p2name').textContent = game.players[1].name;
    });
    
    // Player color changes
    document.getElementById('color1').addEventListener('input', e => {
        game.players[0].color = e.target.value;
        document.getElementById('score1').style.borderColor = e.target.value;
    });
    
    document.getElementById('color2').addEventListener('input', e => {
        game.players[1].color = e.target.value;
        document.getElementById('score2').style.borderColor = e.target.value;
    });
    
    // Level selection
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            game.level = e.target.dataset.level;
            updateSubjects();
        });
    });
    
    // Chapter list modal
    document.getElementById('showChapters').addEventListener('click', showChapterList);
    document.getElementById('closeModal').addEventListener('click', () => {
        document.getElementById('chapterModal').style.display = 'none';
    });
    
    // Use PIN button
    document.getElementById('usePin').addEventListener('click', usePin);
    document.getElementById('pin').addEventListener('keypress', e => {
        if (e.key === 'Enter') usePin();
    });
    
    // Start game
    document.getElementById('start').addEventListener('click', startGame);
    
    // Power-up selection
    document.querySelectorAll('.powerup').forEach(p => {
        p.addEventListener('click', selectPowerup);
    });
    
    // Confirm powerups
    document.getElementById('confirmPowerups').addEventListener('click', confirmPowerups);
    
    // Game controls
    document.getElementById('submit').addEventListener('click', submitAnswer);
    document.getElementById('next').addEventListener('click', nextQuestion);
    
    // Results screen
    document.getElementById('playAgain').addEventListener('click', playAgain);
    document.getElementById('newGame').addEventListener('click', newGame);
}

// Update subjects based on selected level
function updateSubjects() {
    const container = document.getElementById('subjects');
    container.innerHTML = '';
    
    if (!game.level) return;
    
    const subjects = game.level === '1' ? ['Math (0)', 'Science (1)'] :
                    game.level === '2' ? ['Math (0)', 'Science (1)'] :
                    ['Math (1)', 'Combined Physics (2)', 'Pure Physics (3)', 
                     'Combined Chemistry (4)', 'Pure Chemistry (5)'];
    
    subjects.forEach((sub, i) => {
        const btn = document.createElement('button');
        btn.textContent = sub;
        btn.dataset.subject = i;
        btn.addEventListener('click', e => {
            document.querySelectorAll('#subjects button').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            game.subject = e.target.dataset.subject;
        });
        container.appendChild(btn);
    });
}

// Show chapter list modal
function showChapterList() {
    const list = document.getElementById('chapterList');
    list.innerHTML = '';
    
    for (const [level, subjects] of Object.entries(chapters)) {
        for (const [subject, chapterList] of Object.entries(subjects)) {
            const section = document.createElement('div');
            section.className = 'subject-section';
            
            const title = document.createElement('h3');
            title.textContent = `${level.charAt(0).toUpperCase() + level.slice(1)} - ${subject}`;
            section.appendChild(title);
            
            const ul = document.createElement('ul');
            chapterList.forEach((chapter, i) => {
                const li = document.createElement('li');
                li.textContent = `Ch ${i + 1}: ${chapter}`;
                ul.appendChild(li);
            });
            section.appendChild(ul);
            
            list.appendChild(section);
        }
    }
    
    document.getElementById('chapterModal').style.display = 'block';
}

// Use PIN to load questions
function usePin() {
    const pin = document.getElementById('pin').value;
    if (pin.length !== 6 || !/^\d+$/.test(pin)) {
        alert('Please enter a valid 6-digit PIN');
        return;
    }
    
    game.pin = pin;
    game.level = pin[0];
    game.subject = pin[1];
    
    // Update UI to show selected PIN
    document.querySelectorAll('.level-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.level === game.level) {
            btn.classList.add('selected');
        }
    });
    
    updateSubjects();
    
    // Highlight subject based on PIN
    setTimeout(() => {
        document.querySelectorAll('#subjects button').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.subject === game.subject) {
                btn.classList.add('selected');
            }
        });
    }, 100);
    
    alert(`PIN ${pin} loaded!\nLevel: ${game.level}, Subject: ${game.subject}`);
}

// Start the game
function startGame() {
    if (!game.level || !game.subject) {
        alert('Please select level and subject or enter a PIN');
        return;
    }
    
    // Load questions based on PIN or use default
    game.questions = questionBank[game.pin] || questionBank.default;
    
    // Switch to powerup screen
    document.getElementById('setup').classList.remove('active');
    document.getElementById('powerups').classList.add('active');
    
    // Give random powerups to players
    assignPowerups();
}

// Assign random powerups to players
function assignPowerups() {
    const powerupTypes = ['increase', 'decrease', 'swap', 'double'];
    
    // Clear previous selections
    game.players[0].powerups = [];
    game.players[1].powerups = [];
    document.querySelectorAll('.powerup').forEach(p => p.classList.remove('selected'));
    document.getElementById('p1selected').innerHTML = '';
    document.getElementById('p2selected').innerHTML = '';
    
    // Assign 2 random powerups to each player
    for (let i = 0; i < 2; i++) {
        const p1 = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        const p2 = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        game.players[0].powerups.push(p1);
        game.players[1].powerups.push(p2);
        
        // Show in UI (simplified - in real app would mark specific powerups)
        addPowerupToDisplay('p1selected', p1);
        addPowerupToDisplay('p2selected', p2);
    }
}

function addPowerupToDisplay(elementId, type) {
    const div = document.getElementById(elementId);
    const span = document.createElement('span');
    span.style.display = 'block';
    span.style.margin = '5px 0';
    span.style.padding = '5px';
    span.style.background = '#e0e0e0';
    span.style.borderRadius = '4px';
    
    switch(type) {
        case 'increase': span.textContent = '+20% Points'; break;
        case 'decrease': span.textContent = '-20% Points'; break;
        case 'swap': span.textContent = 'Swap Scores'; break;
        case 'double': span.textContent = 'Double Points'; break;
    }
    
    div.appendChild(span);
}

// Select powerup (for manual selection - not used in auto-assign)
function selectPowerup(e) {
    const type = e.target.dataset.type;
    const player = e.target.closest('.player-powerups').id === 'player1' ? 0 : 1;
    
    if (game.players[player].powerups.includes(type)) {
        // Remove if already selected
        game.players[player].powerups = game.players[player].powerups.filter(p => p !== type);
        e.target.classList.remove('selected');
    } else if (game.players[player].powerups.length < 2) {
        // Add if less than 2
        game.players[player].powerups.push(type);
        e.target.classList.add('selected');
    }
    
    updatePowerupDisplay();
}

function updatePowerupDisplay() {
    // Simplified - would update visual display
}

// Confirm powerups and start quiz
function confirmPowerups() {
    document.getElementById('powerups').classList.remove('active');
    document.getElementById('game').classList.add('active');
    
    // Reset game state
    game.currentPlayer = 0;
    game.currentQuestion = 0;
    game.players[0].score = 0;
    game.players[1].score = 0;
    
    loadQuestion();
}

// Load current question
function loadQuestion() {
    const q = game.questions[game.currentQuestion];
    
    document.getElementById('qNum').textContent = game.currentQuestion + 1;
    document.getElementById('qTotal').textContent = game.questions.length;
    document.getElementById('question').textContent = q.q;
    
    const options = document.getElementById('options');
    options.innerHTML = '';
    
    q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = opt;
        div.dataset.index = i;
        div.addEventListener('click', () => selectOption(div, i));
        options.appendChild(div);
    });
    
    document.getElementById('next').style.display = 'none';
    document.getElementById('submit').style.display = 'block';
    document.getElementById('feedback').textContent = '';
    
    updateScores();
}

function selectOption(element, index) {
    document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
    element.classList.add('selected');
    game.selectedOption = index;
}

// Submit answer
function submitAnswer() {
    if (game.selectedOption === null) {
        alert('Please select an answer!');
        return;
    }
    
    const q = game.questions[game.currentQuestion];
    const isCorrect = game.selectedOption === q.correct;
    
    // Update score
    if (isCorrect) {
        game.players[game.currentPlayer].score += q.points;
        document.getElementById('feedback').textContent = `Correct! +${q.points} points`;
        document.getElementById('feedback').style.color = '#4CAF50';
    } else {
        document.getElementById('feedback').textContent = `Wrong! Correct answer: ${q.options[q.correct]}`;
        document.getElementById('feedback').style.color = '#f44336';
    }
    
    // Highlight correct/wrong answers
    document.querySelectorAll('.option').forEach((opt, i) => {
        if (i === q.correct) {
            opt.classList.add('correct');
        } else if (i === game.selectedOption && !isCorrect) {
            opt.classList.add('wrong');
        }
        opt.style.pointerEvents = 'none';
    });
    
    document.getElementById('submit').style.display = 'none';
    document.getElementById('next').style.display = 'block';
    
    updateScores();
}

// Next question
function nextQuestion() {
    game.currentQuestion++;
    game.currentPlayer = game.currentPlayer === 0 ? 1 : 0;
    game.selectedOption = null;
    
    if (game.currentQuestion < game.questions.length) {
        loadQuestion();
    } else {
        endGame();
    }
}

// Update scores display
function updateScores() {
    document.getElementById('score1').querySelector('.name').textContent = game.players[0].name;
    document.getElementById('score1').querySelector('.points').textContent = game.players[0].score;
    
    document.getElementById('score2').querySelector('.name').textContent = game.players[1].name;
    document.getElementById('score2').querySelector('.points').textContent = game.players[1].score;
    
    // Highlight current player
    document.getElementById('score1').classList.toggle('active', game.currentPlayer === 0);
    document.getElementById('score2').classList.toggle('active', game.currentPlayer === 1);
    
    document.getElementById('currentPlayer').textContent = game.players[game.currentPlayer].name;
    document.getElementById('currentPlayer').style.color = game.players[game.currentPlayer].color;
}

// End game and show results
function endGame() {
    document.getElementById('game').classList.remove('active');
    document.getElementById('results').classList.add('active');
    
    // Determine winner and loser
    let winner, loser;
    if (game.players[0].score > game.players[1].score) {
        winner = game.players[0];
        loser = game.players[1];
    } else if (game.players[1].score > game.players[0].score) {
        winner = game.players[1];
        loser = game.players[0];
    } else {
        // Tie
        winner = game.players[0];
        loser = game.players[1];
    }
    
    // Display final scores
    document.getElementById('winnerName').textContent = winner.name;
    document.getElementById('loserName').textContent = loser.name;
    document.getElementById('winnerScore').textContent = winner.score;
    document.getElementById('loserScore').textContent = loser.score;
    
    // Apply final powerup
    applyFinalPowerup(winner, loser);
}

// Apply final powerup
function applyFinalPowerup(winner, loser) {
    // Randomly select one of loser's powerups
    const powerup = loser.powerups[Math.floor(Math.random() * loser.powerups.length)];
    
    let newWinnerScore = winner.score;
    let newLoserScore = loser.score;
    let description = '';
    
    switch(powerup) {
        case 'increase':
            newLoserScore = Math.floor(loser.score * 1.2);
            description = `${loser.name}'s score increased by 20%!`;
            break;
        case 'decrease':
            newLoserScore = Math.floor(loser.score * 0.8);
            description = `${loser.name}'s score decreased by 20%!`;
            break;
        case 'swap':
            newWinnerScore = loser.score;
            newLoserScore = winner.score;
            description = `Scores swapped between ${winner.name} and ${loser.name}!`;
            break;
        case 'double':
            newLoserScore = loser.score * 2;
            description = `${loser.name}'s score doubled!`;
            break;
    }
    
    // Update display
    document.getElementById('powerupDesc').textContent = description;
    document.getElementById('newWinner').textContent = winner.name;
    document.getElementById('newLoser').textContent = loser.name;
    document.getElementById('newWinnerScore').textContent = newWinnerScore;
    document.getElementById('newLoserScore').textContent = newLoserScore;
}

// Play again
function playAgain() {
    document.getElementById('results').classList.remove('active');
    document.getElementById('powerups').classList.add('active');
    assignPowerups();
}

// New game
function newGame() {
    document.getElementById('results').classList.remove('active');
    document.getElementById('setup').classList.add('active');
    
    // Reset PIN
    document.getElementById('pin').value = '';
    game.pin = null;
    game.level = null;
    game.subject = null;
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
}

// Start everything when page loads
window.addEventListener('DOMContentLoaded', init);