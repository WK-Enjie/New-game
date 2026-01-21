// GAME STATE
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
    pin: null,
    jsonFile: null
};

// CHAPTER DATA
const chapters = {
    "primary": {
        "math": ["Numbers to 10", "Number Bonds", "Addition", "Subtraction", "Shapes"],
        "science": ["Living Things", "Plants", "Animals", "Materials", "Weather"]
    },
    "lower-secondary": {
        "math": ["Algebra", "Geometry", "Fractions", "Decimals", "Statistics"],
        "science": ["Cells", "Energy", "Forces", "Matter", "Ecosystems"]
    },
    "upper-secondary": {
        "math": ["Calculus", "Trigonometry", "Vectors", "Probability", "Statistics"],
        "combined-physics": ["Measurement", "Kinematics", "Forces", "Energy", "Waves"],
        "pure-physics": ["Measurement", "Kinematics", "Dynamics", "Waves", "Electricity"],
        "combined-chemistry": ["Experimental", "Atomic", "Bonding", "Acids", "Periodic"],
        "pure-chemistry": ["Experimental", "Atomic", "Bonding", "Acids", "Organic"]
    }
};

// POWER-UPS
const powerups = [
    { id: "increase", name: "+20% Points" },
    { id: "decrease", name: "-20% Points" },
    { id: "swap", name: "Swap Scores" },
    { id: "double", name: "Double Points" }
];

// INITIALIZE
document.addEventListener('DOMContentLoaded', init);

function init() {
    console.log("Initializing game...");
    setupEventListeners();
    updateSubjectButtons();
    discoverAvailableWorksheets();
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    console.log("Setting up event listeners...");
    
    // Player name changes
    document.getElementById('player1').addEventListener('input', function() {
        game.players[0].name = this.value || "Player 1";
        document.getElementById('p1name').textContent = game.players[0].name;
        document.querySelector('#score1 .name').textContent = game.players[0].name;
    });
    
    document.getElementById('player2').addEventListener('input', function() {
        game.players[1].name = this.value || "Player 2";
        document.getElementById('p2name').textContent = game.players[1].name;
        document.querySelector('#score2 .name').textContent = game.players[1].name;
    });
    
    // Player color changes
    document.getElementById('color1').addEventListener('input', function(e) {
        game.players[0].color = e.target.value;
        document.getElementById('score1').style.borderColor = e.target.value;
    });
    
    document.getElementById('color2').addEventListener('input', function(e) {
        game.players[1].color = e.target.value;
        document.getElementById('score2').style.borderColor = e.target.value;
    });
    
    // Level selection
    document.querySelectorAll('.level-select button').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.level-select button').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            game.level = this.dataset.level;
            updateSubjectButtons();
            discoverAvailableWorksheets();
        });
    });
    
    // Chapter list button
    document.getElementById('showChapters').addEventListener('click', showChapterList);
    
    // Modal close button
    document.querySelector('.close').addEventListener('click', function() {
        document.getElementById('chapterModal').style.display = 'none';
    });
    
    // Load PIN button
    document.getElementById('loadPin').addEventListener('click', loadPin);
    document.getElementById('pin').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') loadPin();
    });
    
    // Start game button
    document.getElementById('start').addEventListener('click', startGame);
    
    // Power-up selection
    document.querySelectorAll('.powerup').forEach(p => {
        p.addEventListener('click', function() {
            const powerupType = this.dataset.type;
            const playerBox = this.closest('.player-box');
            const playerIndex = playerBox.querySelector('h3').id === 'p1name' ? 0 : 1;
            selectPowerup(playerIndex, powerupType, this);
        });
    });
    
    // Assign random powerups
    document.getElementById('assignRandom').addEventListener('click', assignRandomPowerups);
    
    // Start quiz button
    document.getElementById('startQuiz').addEventListener('click', startQuiz);
    
    // Game buttons
    document.getElementById('submit').addEventListener('click', submitAnswer);
    document.getElementById('next').addEventListener('click', nextQuestion);
    
    // Results buttons
    document.getElementById('playAgain').addEventListener('click', playAgain);
    document.getElementById('newGame').addEventListener('click', newGame);
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.id === 'chapterModal') {
            document.getElementById('chapterModal').style.display = 'none';
        }
    });
}

// UPDATE SUBJECT BUTTONS
function updateSubjectButtons() {
    const container = document.getElementById('subjects');
    container.innerHTML = '';
    
    if (!game.level) return;
    
    let subjects = [];
    
    if (game.level === '1') {
        subjects = [
            { id: 'math', name: 'Mathematics (0)', number: 0 },
            { id: 'science', name: 'Science (1)', number: 1 }
        ];
    } else if (game.level === '2') {
        subjects = [
            { id: 'math', name: 'Mathematics (0)', number: 0 },
            { id: 'science', name: 'Science (1)', number: 1 }
        ];
    } else if (game.level === '3') {
        subjects = [
            { id: 'math', name: 'Mathematics (1)', number: 1 },
            { id: 'combined-physics', name: 'Combined Physics (2)', number: 2 },
            { id: 'pure-physics', name: 'Pure Physics (3)', number: 3 },
            { id: 'combined-chemistry', name: 'Combined Chemistry (4)', number: 4 },
            { id: 'pure-chemistry', name: 'Pure Chemistry (5)', number: 5 }
        ];
    }
    
    subjects.forEach(subject => {
        const button = document.createElement('button');
        button.textContent = subject.name;
        button.dataset.subject = subject.id;
        button.dataset.number = subject.number;
        
        button.addEventListener('click', function() {
            document.querySelectorAll('#subjects button').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            game.subject = subject.id;
            discoverAvailableWorksheets();
        });
        
        container.appendChild(button);
    });
}

// DISCOVER AVAILABLE WORKSHEETS (MOCK - In real app, this would scan the server)
function discoverAvailableWorksheets() {
    const container = document.getElementById('worksheets');
    container.innerHTML = '';
    
    if (!game.level || !game.subject) return;
    
    // Get level folder name
    let levelFolder = '';
    if (game.level === '1') levelFolder = 'primary';
    else if (game.level === '2') levelFolder = 'lower-secondary';
    else if (game.level === '3') levelFolder = 'upper-secondary';
    
    // Generate example worksheets based on PIN patterns
    const examples = generateExampleWorksheets(levelFolder, game.subject);
    
    examples.forEach(worksheet => {
        const item = document.createElement('div');
        item.className = 'worksheet-item';
        
        const name = document.createElement('div');
        name.className = 'worksheet-name';
        name.textContent = `PIN: ${worksheet.pin}`;
        
        const path = document.createElement('div');
        path.className = 'worksheet-path';
        path.textContent = `data/${levelFolder}/${game.subject}/${worksheet.pin}.json`;
        
        item.appendChild(name);
        item.appendChild(path);
        
        item.addEventListener('click', function() {
            document.querySelectorAll('.worksheet-item').forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            game.pin = worksheet.pin;
            document.getElementById('pin').value = worksheet.pin;
            loadPin(); // Auto-load when clicked
        });
        
        container.appendChild(item);
    });
}

// GENERATE EXAMPLE WORKSHEETS
function generateExampleWorksheets(levelFolder, subject) {
    let examples = [];
    
    // Generate a few example PINs based on your structure
    if (levelFolder === 'primary') {
        if (subject === 'math') {
            examples = [
                { pin: '101011', desc: 'P1 Math Ch1 WS1' },
                { pin: '101012', desc: 'P1 Math Ch1 WS2' },
                { pin: '102011', desc: 'P2 Math Ch1 WS1' }
            ];
        } else if (subject === 'science') {
            examples = [
                { pin: '111011', desc: 'P1 Science Ch1 WS1' },
                { pin: '112011', desc: 'P2 Science Ch1 WS1' }
            ];
        }
    } else if (levelFolder === 'lower-secondary') {
        if (subject === 'math') {
            examples = [
                { pin: '211011', desc: 'Sec 1 Math Ch1 WS1' },
                { pin: '211012', desc: 'Sec 1 Math Ch1 WS2' },
                { pin: '212011', desc: 'Sec 2 Math Ch1 WS1' }
            ];
        } else if (subject === 'science') {
            examples = [
                { pin: '221011', desc: 'Sec 1 Science Ch1 WS1' },
                { pin: '222011', desc: 'Sec 2 Science Ch1 WS1' }
            ];
        }
    } else if (levelFolder === 'upper-secondary') {
        if (subject === 'math') {
            examples = [
                { pin: '313011', desc: 'Sec 3 Math Ch1 WS1' },
                { pin: '313012', desc: 'Sec 3 Math Ch1 WS2' },
                { pin: '314011', desc: 'Sec 4 Math Ch1 WS1' }
            ];
        } else if (subject === 'combined-physics') {
            examples = [
                { pin: '323011', desc: 'Sec 3 Combined Physics Ch1 WS1' },
                { pin: '323012', desc: 'Sec 3 Combined Physics Ch1 WS2' }
            ];
        } else if (subject === 'pure-physics') {
            examples = [
                { pin: '333011', desc: 'Sec 3 Pure Physics Ch1 WS1' },
                { pin: '333012', desc: 'Sec 3 Pure Physics Ch1 WS2' }
            ];
        } else if (subject === 'combined-chemistry') {
            examples = [
                { pin: '343011', desc: 'Sec 3 Combined Chemistry Ch1 WS1' },
                { pin: '343012', desc: 'Sec 3 Combined Chemistry Ch1 WS2' },
                { pin: '344091', desc: 'Sec 4 Combined Chemistry Ch9 WS1' },
                { pin: '344121', desc: 'Sec 4 Combined Chemistry Ch12 WS1' },
                { pin: '344122', desc: 'Sec 4 Combined Chemistry Ch12 WS2' }
            ];
        } else if (subject === 'pure-chemistry') {
            examples = [
                { pin: '353011', desc: 'Sec 3 Pure Chemistry Ch1 WS1' },
                { pin: '353012', desc: 'Sec 3 Pure Chemistry Ch1 WS2' },
                { pin: '354011', desc: 'Sec 4 Pure Chemistry Ch1 WS1' }
            ];
        }
    }
    
    return examples;
}

// SHOW CHAPTER LIST
function showChapterList() {
    const container = document.getElementById('chapterList');
    container.innerHTML = '';
    
    for (const [levelName, subjects] of Object.entries(chapters)) {
        for (const [subjectName, chapterList] of Object.entries(subjects)) {
            const section = document.createElement('div');
            section.className = 'subject-section';
            
            // Get display names
            let levelDisplay = levelName.replace('-', ' ').toUpperCase();
            let subjectDisplay = subjectName.replace('-', ' ').toUpperCase();
            
            const title = document.createElement('h4');
            title.textContent = `${levelDisplay} - ${subjectDisplay}`;
            section.appendChild(title);
            
            const list = document.createElement('ul');
            chapterList.forEach((chapter, index) => {
                const item = document.createElement('li');
                item.textContent = `Chapter ${(index + 1).toString().padStart(2, '0')}: ${chapter}`;
                list.appendChild(item);
            });
            
            section.appendChild(list);
            container.appendChild(section);
        }
    }
    
    document.getElementById('chapterModal').style.display = 'block';
}

// LOAD PIN AND FETCH JSON
async function loadPin() {
    const pin = document.getElementById('pin').value.trim();
    const status = document.getElementById('jsonStatus');
    
    if (pin.length !== 6) {
        status.textContent = "PIN must be 6 digits";
        status.className = "status error";
        return;
    }
    
    if (!/^\d+$/.test(pin)) {
        status.textContent = "PIN must contain only numbers";
        status.className = "status error";
        return;
    }
    
    game.pin = pin;
    
    // Parse PIN
    const level = pin[0];
    const subjectNum = parseInt(pin[1]);
    const grade = pin[2];
    const chapter = pin.substring(3, 5);
    const worksheet = pin[5];
    
    // Map to folder structure
    const levelFolder = level === '1' ? 'primary' : 
                       level === '2' ? 'lower-secondary' : 
                       'upper-secondary';
    
    let subjectFolder = '';
    if (level === '1' || level === '2') {
        subjectFolder = subjectNum === 0 ? 'math' : 'science';
    } else if (level === '3') {
        if (subjectNum === 1) subjectFolder = 'math';
        else if (subjectNum === 2) subjectFolder = 'combined-physics';
        else if (subjectNum === 3) subjectFolder = 'pure-physics';
        else if (subjectNum === 4) subjectFolder = 'combined-chemistry';
        else if (subjectNum === 5) subjectFolder = 'pure-chemistry';
    }
    
    // Construct file path
    const fileName = `${pin}.json`;
    const filePath = `data/${levelFolder}/${subjectFolder}/${fileName}`;
    
    // Update PIN info
    const pinInfo = document.getElementById('pinInfo');
    pinInfo.innerHTML = `
        <strong>PIN:</strong> ${pin}<br>
        <strong>Level:</strong> ${level === '1' ? 'Primary' : level === '2' ? 'Lower Secondary' : 'Upper Secondary'}<br>
        <strong>Subject:</strong> ${getSubjectName(subjectFolder)}<br>
        <strong>Grade:</strong> Sec ${grade}<br>
        <strong>Chapter:</strong> ${chapter}<br>
        <strong>Worksheet:</strong> ${worksheet}<br>
        <strong>File Path:</strong> ${filePath}
    `;
    
    // Try to load JSON file
    try {
        status.textContent = `Loading ${fileName}...`;
        status.className = "status";
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error(`JSON file not found: ${filePath}`);
            } else {
                throw new Error(`HTTP error: ${response.status}`);
            }
        }
        
        const jsonData = await response.json();
        
        // Validate JSON structure
        if (!jsonData.questions || !Array.isArray(jsonData.questions) || jsonData.questions.length === 0) {
            throw new Error("Invalid JSON structure: No questions found");
        }
        
        // Store the questions
        game.questions = jsonData.questions.map(q => ({
            q: q.question || q.q || "No question text",
            options: q.options || ["Option A", "Option B", "Option C", "Option D"],
            correct: q.correctAnswer || q.correct || 0,
            points: q.points || 10,
            explanation: q.explanation || ""
        }));
        
        status.textContent = `✓ Loaded ${game.questions.length} questions from ${fileName}`;
        status.className = "status success";
        
        // Update worksheet info
        document.getElementById('worksheetInfo').textContent = 
            `Worksheet: ${pin} - ${getSubjectName(subjectFolder)} Ch${chapter} WS${worksheet}`;
        
        // Update level/subject selection UI
        updateSelectionUI(level, subjectFolder);
        
        console.log(`Loaded ${game.questions.length} questions from ${filePath}`);
        
    } catch (error) {
        console.error("Error loading JSON:", error);
        status.textContent = `✗ Error: ${error.message}`;
        status.className = "status error";
        
        // Fallback to sample questions
        game.questions = getSampleQuestions();
        status.textContent += " (Using sample questions instead)";
        
        // Still update UI
        document.getElementById('worksheetInfo').textContent = 
            `Sample: ${pin} - ${getSubjectName(subjectFolder)}`;
    }
}

// UPDATE SELECTION UI
function updateSelectionUI(level, subject) {
    // Select level button
    document.querySelectorAll('.level-select button').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.level === level) {
            btn.classList.add('selected');
        }
    });
    
    // Select subject button
    setTimeout(() => {
        document.querySelectorAll('#subjects button').forEach(btn => {
            btn.classList.remove('selected');
            if (btn.dataset.subject === subject) {
                btn.classList.add('selected');
            }
        });
    }, 100);
}

// GET SAMPLE QUESTIONS (FALLBACK)
function getSampleQuestions() {
    return [
        { q: "Sample Question 1", options: ["A", "B", "C", "D"], correct: 0, points: 10 },
        { q: "Sample Question 2", options: ["A", "B", "C", "D"], correct: 1, points: 10 },
        { q: "Sample Question 3", options: ["A", "B", "C", "D"], correct: 2, points: 10 },
        { q: "Sample Question 4", options: ["A", "B", "C", "D"], correct: 3, points: 10 },
        { q: "Sample Question 5", options: ["A", "B", "C", "D"], correct: 0, points: 10 }
    ];
}

// GET SUBJECT NAME
function getSubjectName(subject) {
    const names = {
        'math': 'Mathematics',
        'science': 'Science',
        'combined-physics': 'Combined Physics',
        'pure-physics': 'Pure Physics',
        'combined-chemistry': 'Combined Chemistry',
        'pure-chemistry': 'Pure Chemistry'
    };
    return names[subject] || subject;
}

// START GAME
function startGame() {
    // Validate
    if (!game.pin) {
        alert("Please enter a PIN first");
        return;
    }
    
    if (game.questions.length === 0) {
        alert("No questions loaded. Please check the JSON file.");
        return;
    }
    
    // Switch to powerup screen
    document.getElementById('setup').classList.remove('active');
    document.getElementById('powerups').classList.add('active');
    
    // Assign random powerups
    assignRandomPowerups();
}

// ASSIGN RANDOM POWERUPS
function assignRandomPowerups() {
    // Clear previous
    game.players[0].powerups = [];
    game.players[1].powerups = [];
    document.querySelectorAll('.powerup').forEach(p => p.classList.remove('selected'));
    document.getElementById('p1selected').innerHTML = '';
    document.getElementById('p2selected').innerHTML = '';
    
    // Helper function
    function getRandomPowerups() {
        const shuffled = [...powerups].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 2);
    }
    
    // Assign
    const p1p = getRandomPowerups();
    const p2p = getRandomPowerups();
    
    game.players[0].powerups = p1p.map(p => p.id);
    game.players[1].powerups = p2p.map(p => p.id);
    
    updatePowerupDisplay();
}

// SELECT POWERUP
function selectPowerup(playerIndex, powerupType, element) {
    const player = game.players[playerIndex];
    
    if (player.powerups.includes(powerupType)) {
        player.powerups = player.powerups.filter(p => p !== powerupType);
        element.classList.remove('selected');
    } else if (player.powerups.length < 2) {
        player.powerups.push(powerupType);
        element.classList.add('selected');
    } else {
        alert(`${player.name} can only select 2 powerups!`);
        return;
    }
    
    updatePowerupDisplay();
}

// UPDATE POWERUP DISPLAY
function updatePowerupDisplay() {
    document.getElementById('p1selected').innerHTML = '';
    document.getElementById('p2selected').innerHTML = '';
    
    // Player 1
    game.players[0].powerups.forEach(powerupId => {
        const powerup = powerups.find(p => p.id === powerupId);
        if (powerup) {
            const div = document.createElement('div');
            div.textContent = powerup.name;
            div.style.cssText = 'margin: 5px 0; padding: 8px; background: #e9ecef; border-radius: 4px;';
            document.getElementById('p1selected').appendChild(div);
        }
    });
    
    // Player 2
    game.players[1].powerups.forEach(powerupId => {
        const powerup = powerups.find(p => p.id === powerupId);
        if (powerup) {
            const div = document.createElement('div');
            div.textContent = powerup.name;
            div.style.cssText = 'margin: 5px 0; padding: 8px; background: #e9ecef; border-radius: 4px;';
            document.getElementById('p2selected').appendChild(div);
        }
    });
}

// START QUIZ
function startQuiz() {
    if (game.players[0].powerups.length !== 2 || game.players[1].powerups.length !== 2) {
        alert("Each player must have 2 powerups selected!");
        return;
    }
    
    // Reset game state
    game.currentPlayer = 0;
    game.currentQuestion = 0;
    game.players[0].score = 0;
    game.players[1].score = 0;
    game.selectedOption = null;
    
    // Switch to game screen
    document.getElementById('powerups').classList.remove('active');
    document.getElementById('game').classList.add('active');
    
    // Load first question
    loadQuestion();
}

// LOAD QUESTION
function loadQuestion() {
    const q = game.questions[game.currentQuestion];
    
    // Update UI
    document.getElementById('qNum').textContent = game.currentQuestion + 1;
    document.getElementById('qTotal').textContent = game.questions.length;
    document.getElementById('question').textContent = q.q;
    
    // Update options
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    q.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.textContent = option;
        optionElement.dataset.index = index;
        
        optionElement.addEventListener('click', function() {
            document.querySelectorAll('.option').forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            game.selectedOption = index;
        });
        
        optionsContainer.appendChild(optionElement);
    });
    
    // Update game state
    updateScores();
    updateTurnInfo();
    
    // Reset buttons
    document.getElementById('submit').style.display = 'block';
    document.getElementById('next').style.display = 'none';
    document.getElementById('feedback').textContent = '';
    document.getElementById('feedback').className = '';
}

// SUBMIT ANSWER
function submitAnswer() {
    if (game.selectedOption === null) {
        alert("Please select an answer!");
        return;
    }
    
    const q = game.questions[game.currentQuestion];
    const isCorrect = game.selectedOption === q.correct;
    
    // Update score
    if (isCorrect) {
        game.players[game.currentPlayer].score += q.points;
        document.getElementById('feedback').textContent = `Correct! +${q.points} points`;
        document.getElementById('feedback').className = 'correct';
    } else {
        document.getElementById('feedback').textContent = "Incorrect!";
        document.getElementById('feedback').className = 'incorrect';
    }
    
    // Highlight answers
    document.querySelectorAll('.option').forEach((opt, index) => {
        opt.style.pointerEvents = 'none';
        if (index === q.correct) {
            opt.classList.add('correct');
        } else if (index === game.selectedOption && !isCorrect) {
            opt.classList.add('wrong');
        }
    });
    
    // Update UI
    updateScores();
    
    // Show next button
    document.getElementById('submit').style.display = 'none';
    document.getElementById('next').style.display = 'block';
}

// NEXT QUESTION
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

// UPDATE SCORES
function updateScores() {
    // Player 1
    document.querySelector('#score1 .points').textContent = game.players[0].score;
    document.querySelector('#score1 .name').textContent = game.players[0].name;
    document.getElementById('score1').style.borderColor = game.players[0].color;
    
    // Player 2
    document.querySelector('#score2 .points').textContent = game.players[1].score;
    document.querySelector('#score2 .name').textContent = game.players[1].name;
    document.getElementById('score2').style.borderColor = game.players[1].color;
    
    // Highlight current player
    document.getElementById('score1').classList.toggle('active', game.currentPlayer === 0);
    document.getElementById('score2').classList.toggle('active', game.currentPlayer === 1);
}

// UPDATE TURN INFO
function updateTurnInfo() {
    const player = game.players[game.currentPlayer];
    document.getElementById('turnInfo').textContent = `${player.name}'s Turn`;
    document.getElementById('turnInfo').style.color = player.color;
}

// END GAME
function endGame() {
    // Determine winner
    let winner, loser;
    if (game.players[0].score > game.players[1].score) {
        winner = game.players[0];
        loser = game.players[1];
    } else if (game.players[1].score > game.players[0].score) {
        winner = game.players[1];
        loser = game.players[0];
    } else {
        const rand = Math.random();
        winner = rand < 0.5 ? game.players[0] : game.players[1];
        loser = winner === game.players[0] ? game.players[1] : game.players[0];
    }
    
    // Update results display
    document.getElementById('winnerName').textContent = winner.name;
    document.getElementById('loserName').textContent = loser.name;
    document.getElementById('winnerScore').textContent = winner.score;
    document.getElementById('loserScore').textContent = loser.score;
    
    // Apply final powerup
    applyFinalPowerup(winner, loser);
    
    // Switch to results screen
    document.getElementById('game').classList.remove('active');
    document.getElementById('results').classList.add('active');
}

// APPLY FINAL POWERUP
function applyFinalPowerup(winner, loser) {
    const randomIndex = Math.floor(Math.random() * loser.powerups.length);
    const powerupId = loser.powerups[randomIndex];
    
    let newWinnerScore = winner.score;
    let newLoserScore = loser.score;
    let description = '';
    
    switch(powerupId) {
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
    document.getElementById('powerupText').textContent = description;
    document.getElementById('newWinner').textContent = winner.name;
    document.getElementById('newLoser').textContent = loser.name;
    document.getElementById('newWinnerScore').textContent = newWinnerScore;
    document.getElementById('newLoserScore').textContent = newLoserScore;
}

// PLAY AGAIN
function playAgain() {
    document.getElementById('results').classList.remove('active');
    document.getElementById('powerups').classList.add('active');
    assignRandomPowerups();
}

// NEW GAME
function newGame() {
    document.getElementById('results').classList.remove('active');
    document.getElementById('setup').classList.add('active');
    
    // Reset
    game.level = null;
    game.subject = null;
    game.pin = null;
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    document.getElementById('pin').value = '';
    document.getElementById('pinInfo').innerHTML = '';
    document.getElementById('jsonStatus').textContent = '';
    
    updateSubjectButtons();
    discoverAvailableWorksheets();
}