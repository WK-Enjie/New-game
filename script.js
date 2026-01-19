// Brain Battle Card Game - Searches Subfolders for JSON Files
document.addEventListener('DOMContentLoaded', function() {
    // Game State
    let currentScreen = 'start';
    let currentQuestion = 0;
    let currentPlayer = 1;
    let selectedQuiz = null;
    let quizData = null;
    let scores = { 1: 0, 2: 0 };
    let selectedOption = null;
    let playerGambles = { 1: null, 2: null };
    let gameStats = {
        questionsAnswered: 0,
        correctAnswers: 0
    };
    
    // Store shuffled questions
    let shuffledQuestions = [];

    // Gambling Options Configuration (ONLY AT END)
    const GAMBLING_OPTIONS = [
        { 
            id: 1, 
            title: "Double or Nothing", 
            description: "Risk it all! Double your points or lose them all",
            icon: "🎲",
            type: "doubleOrNothing"
        },
        { 
            id: 2, 
            title: "Safe 50%", 
            description: "Play it safe with a guaranteed 50% increase",
            icon: "🛡️",
            type: "safe"
        },
        { 
            id: 3, 
            title: "Lucky Dip", 
            description: "Random multiplier between 0.5x and 2x",
            icon: "🎁",
            type: "random"
        },
        { 
            id: 4, 
            title: "Skip Gamble", 
            description: "Keep your current points, no risk taken",
            icon: "✋",
            type: "skip"
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
        gamblingTitle: document.getElementById('gambling-title'),
        gamblingPlayerInfo: document.getElementById('gambling-player-info'),
        gamblingOptions: document.getElementById('gambling-options'),
        gamblingResult: document.getElementById('gambling-result'),
        resultIcon: document.getElementById('result-icon'),
        resultTitle: document.getElementById('result-title'),
        resultDescription: document.getElementById('result-description'),
        resultPoints: document.getElementById('result-points'),
        finalPoints1: document.getElementById('final-points1'),
        finalPoints2: document.getElementById('final-points2'),
        continueBtn: document.getElementById('continue-after-gamble'),
        nextGamblerBtn: document.getElementById('next-gambler'),
        
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
        newGameBtn: document.getElementById('new-game')
    };

    // Initialize Game
    init();

    function init() {
        console.log('Brain Battle Game - Searches Subfolders');
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
        
        // Game controls
        elements.submitBtn.addEventListener('click', submitAnswer);
        elements.nextBtn.addEventListener('click', nextQuestion);
        elements.homeBtn.addEventListener('click', goHome);
        
        // Gambling buttons
        elements.continueBtn.addEventListener('click', continueToGameOver);
        elements.nextGamblerBtn.addEventListener('click', nextGambler);
        
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

    async function validateCode() {
        const code = getCurrentCode();
        
        if (code.length !== 6) {
            showError('Code must be 6 digits');
            return;
        }
        
        // Show loading indicator
        showLoading(true);
        
        try {
            // Search for JSON file in multiple locations including subfolders
            const foundPath = await findQuizFile(code);
            
            if (!foundPath) {
                throw new Error(`Quiz ${code}.json not found in Questions/ folder or subfolders`);
            }
            
            console.log('Found quiz at:', foundPath);
            const response = await fetch(foundPath);
            
            if (!response.ok) {
                throw new Error(`Failed to load: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // Validate the JSON structure
            if (!validateQuizJSON(data, code)) {
                throw new Error('Invalid JSON structure');
            }
            
            // Store quiz data
            quizData = data;
            selectedQuiz = {
                code: code,
                title: quizData.title || 'Untitled Quiz',
                subject: quizData.subject || 'General',
                level: quizData.level || 'Not specified',
                questions: quizData.questions.length,
                path: foundPath
            };
            
            // Shuffle questions immediately when loaded
            shuffleQuestions();
            
            // Update UI
            showQuizInfo(selectedQuiz);
            elements.startError.textContent = '';
            elements.startGameBtn.disabled = false;
            showLoading(false);
            
            console.log(`Quiz loaded successfully from ${foundPath} with ${quizData.questions.length} questions`);
            
        } catch (error) {
            console.error('Error loading quiz:', error);
            showError(`Cannot load quiz: ${error.message}`);
            showLoading(false);
        }
    }

    // Function to search for quiz file in subfolders
    async function findQuizFile(code) {
        console.log(`Searching for quiz: ${code}.json`);
        
        // Define search paths including subfolders
        const searchPaths = [
            // Root level
            `Questions/${code}.json`,
            `./Questions/${code}.json`,
            `${code}.json`,
            `./${code}.json`,
            
            // Common subfolder patterns
            `Questions/Physics/${code}.json`,
            `Questions/Math/${code}.json`,
            `Questions/Science/${code}.json`,
            `Questions/English/${code}.json`,
            `Questions/Chemistry/${code}.json`,
            `Questions/Biology/${code}.json`,
            `Questions/Geography/${code}.json`,
            `Questions/History/${code}.json`,
            
            // Year-based subfolders
            `Questions/2024/${code}.json`,
            `Questions/2023/${code}.json`,
            `Questions/2022/${code}.json`,
            
            // Level-based subfolders
            `Questions/Primary/${code}.json`,
            `Questions/Secondary/${code}.json`,
            `Questions/College/${code}.json`,
            
            // Subject-based subfolders with years
            `Questions/Physics/2024/${code}.json`,
            `Questions/Math/2024/${code}.json`,
            `Questions/Science/2024/${code}.json`,
            
            // Two-level deep
            `Questions/Physics/Secondary/${code}.json`,
            `Questions/Math/Primary/${code}.json`,
            `Questions/Science/Secondary/${code}.json`,
            
            // Try with lowercase/uppercase variations
            `questions/${code}.json`,
            `QUESTIONS/${code}.json`,
            `questions/${code.toLowerCase()}.json`,
            `questions/${code.toUpperCase()}.json`
        ];
        
        // Also try to find all JSON files recursively (more advanced)
        try {
            // Method 1: Try to get directory listing (works on some servers)
            const recursiveResult = await searchRecursively(code);
            if (recursiveResult) {
                return recursiveResult;
            }
        } catch (recursiveError) {
            console.log('Recursive search failed, trying predefined paths');
        }
        
        // Method 2: Try all predefined paths
        for (const path of searchPaths) {
            try {
                console.log(`Trying path: ${path}`);
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    return path;
                }
            } catch (error) {
                // Continue to next path
                continue;
            }
        }
        
        // Method 3: Try with .txt extension too (some servers block .json)
        const txtPaths = [
            `Questions/${code}.txt`,
            `./Questions/${code}.txt`,
            `Questions/${code}.json.txt`
        ];
        
        for (const path of txtPaths) {
            try {
                console.log(`Trying txt path: ${path}`);
                const response = await fetch(path, { method: 'HEAD' });
                if (response.ok) {
                    return path;
                }
            } catch (error) {
                continue;
            }
        }
        
        return null;
    }

    // Advanced recursive search (works if server allows directory listing)
    async function searchRecursively(code) {
        try {
            // Try to get list of all available quizzes
            const indexResponse = await fetch('Questions/quiz-index.json');
            if (indexResponse.ok) {
                const index = await indexResponse.json();
                if (index[code]) {
                    return index[code];
                }
            }
        } catch (error) {
            console.log('No quiz index found');
        }
        
        // Try to scan directory (requires server support)
        try {
            const scanResponse = await fetch('Questions/scan.php?code=' + code);
            if (scanResponse.ok) {
                const result = await scanResponse.json();
                if (result.found) {
                    return result.path;
                }
            }
        } catch (error) {
            console.log('Directory scan not available');
        }
        
        return null;
    }

    function validateQuizJSON(data, expectedCode) {
        // Basic validation
        if (!data || typeof data !== 'object') {
            console.error('Quiz data is not an object');
            return false;
        }
        
        // Check if code matches (optional but good practice)
        if (data.code && data.code !== expectedCode) {
            console.warn(`Code mismatch: JSON has ${data.code}, expected ${expectedCode}`);
            // Still accept it - filename is the primary identifier
        }
        
        // Check for required questions array
        if (!Array.isArray(data.questions) || data.questions.length === 0) {
            console.error('Invalid or empty questions array');
            return false;
        }
        
        // Validate each question
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            if (!q.question || !Array.isArray(q.options) || q.options.length < 2) {
                console.error(`Invalid question at index ${i}`);
                return false;
            }
            
            // Convert correctAnswer to number if it's a string
            if (typeof q.correctAnswer === 'string') {
                q.correctAnswer = parseInt(q.correctAnswer);
            }
            
            if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer >= q.options.length) {
                console.error(`Invalid correctAnswer at index ${i}: ${q.correctAnswer}`);
                return false;
            }
        }
        
        return true;
    }

    function shuffleQuestions() {
        if (!quizData || !quizData.questions) return;
        
        // Create a copy of the questions array
        const questionsCopy = [...quizData.questions];
        
        // Fisher-Yates shuffle algorithm
        for (let i = questionsCopy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionsCopy[i], questionsCopy[j]] = [questionsCopy[j], questionsCopy[i]];
        }
        
        // Store shuffled questions
        shuffledQuestions = questionsCopy;
        
        console.log(`${shuffledQuestions.length} questions shuffled`);
    }

    function showLoading(show) {
        if (show) {
            elements.loadingIndicator.style.display = 'block';
            elements.validateBtn.disabled = true;
            elements.validateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
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
        
        // Show path if available (for debugging)
        if (quiz.path) {
            console.log(`Quiz loaded from: ${quiz.path}`);
        }
        
        elements.quizInfo.style.display = 'block';
    }

    function hideQuizInfo() {
        elements.quizInfo.style.display = 'none';
        selectedQuiz = null;
        quizData = null;
        shuffledQuestions = [];
        elements.startGameBtn.disabled = true;
    }

    function startGame() {
        if (!selectedQuiz || !quizData || shuffledQuestions.length === 0) {
            showError('Please select a valid quiz first.');
            return;
        }
        
        // Reset game state
        resetGameState();
        
        // Switch to game screen
        switchScreen('game');
        
        // Initialize game
        initializeGame();
        
        // Load first question (from shuffled list)
        loadQuestion(currentQuestion);
    }

    function resetGameState() {
        currentQuestion = 0;
        currentPlayer = 1;
        scores = { 1: 0, 2: 0 };
        selectedOption = null;
        playerGambles = { 1: null, 2: null };
        gameStats = {
            questionsAnswered: 0,
            correctAnswers: 0
        };
        
        // Re-shuffle questions for new game
        if (quizData && quizData.questions) {
            shuffleQuestions();
        }
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
        elements.gameQuizTitle.textContent = quizData.title || 'Quiz';
        elements.totalQ.textContent = shuffledQuestions.length;
        updateScores();
        updateCurrentPlayer();
        console.log('Game initialized with', shuffledQuestions.length, 'shuffled questions');
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
        if (shuffledQuestions.length === 0 || !shuffledQuestions[index]) {
            console.error('Question not found at index:', index);
            return;
        }
        
        const question = shuffledQuestions[index];
        
        // Update question counter
        elements.currentQ.textContent = index + 1;
        
        // Set base points
        elements.basePoints.textContent = question.points || 10;
        
        // Set question text
        elements.questionText.innerHTML = question.question;
        
        // Clear and add options
        elements.optionsContainer.innerHTML = '';
        
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'].slice(0, question.options.length);
        question.options.forEach((option, i) => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.index = i;
            optionElement.innerHTML = `
                <div class="option-letter">${letters[i] || String.fromCharCode(65 + i)}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionElement.addEventListener('click', function() {
                selectOption(optionElement);
            });
            
            elements.optionsContainer.appendChild(optionElement);
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
        
        const question = shuffledQuestions[currentQuestion];
        const isCorrect = selectedOption === question.correctAnswer;
        
        // Update game stats
        gameStats.questionsAnswered++;
        if (isCorrect) gameStats.correctAnswers++;
        
        // Calculate points - CORRECT: gain points, WRONG: lose points
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
        if (currentQuestion < shuffledQuestions.length - 1) {
            currentQuestion++;
            loadQuestion(currentQuestion);
        } else {
            // All questions answered - go to gambling screen
            showGamblingScreen();
        }
    }

    let currentGambler = 1;

    function showGamblingScreen() {
        // Reset gambling state
        currentGambler = 1;
        playerGambles = { 1: null, 2: null };
        
        // Create gambling screen for Player 1
        createGamblingScreen();
        
        // Update UI for Player 1
        elements.gamblingTitle.textContent = 'Final Gamble!';
        elements.gamblingPlayerInfo.textContent = 'Player 1: Choose Your Gamble';
        elements.nextGamblerBtn.style.display = 'none';
        elements.continueBtn.style.display = 'none';
        
        // Switch to gambling screen
        switchScreen('gambling');
        
        // Reset gambling result
        elements.gamblingResult.style.display = 'none';
    }

    function createGamblingScreen() {
        elements.gamblingOptions.innerHTML = '';
        
        // Create gambling cards
        GAMBLING_OPTIONS.forEach((option) => {
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
        playerGambles[currentGambler] = option;
        
        // Show next gambler button
        elements.nextGamblerBtn.style.display = 'flex';
        elements.nextGamblerBtn.disabled = false;
    }

    function nextGambler() {
        // Process current gambler's choice
        processIndividualGamble(currentGambler, playerGambles[currentGambler]);
        
        // Move to next gambler
        if (currentGambler === 1) {
            currentGambler = 2;
            
            // Update UI for Player 2
            elements.gamblingTitle.textContent = 'Player 2\'s Turn';
            elements.gamblingPlayerInfo.textContent = 'Player 2: Choose Your Gamble';
            elements.gamblingResult.style.display = 'none';
            
            // Reset card selection
            document.querySelectorAll('.gambling-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            elements.nextGamblerBtn.style.display = 'none';
            
        } else {
            // Both players have chosen - show results
            showFinalGambleResults();
        }
    }

    function processIndividualGamble(player, option) {
        let multiplier = 1;
        let result = '';
        let description = '';
        let icon = '';
        let pointsClass = 'neutral';
        
        // Apply different gambling effects
        switch(option.type) {
            case 'doubleOrNothing':
                // 50% chance to double, 50% chance to lose everything
                const isWin = Math.random() > 0.5;
                if (isWin) {
                    multiplier = 2;
                    result = 'DOUBLED!';
                    description = 'Player ' + player + ' got lucky! Points doubled!';
                    icon = '🎉';
                    pointsClass = 'positive';
                } else {
                    multiplier = 0;
                    result = 'LOST ALL!';
                    description = 'Player ' + player + ' was unlucky! Points lost!';
                    icon = '💥';
                    pointsClass = 'negative';
                }
                break;
                
            case 'safe':
                multiplier = 1.5;
                result = 'SAFE WIN';
                description = 'Player ' + player + ' played safe! Points increased by 50%';
                icon = '🛡️';
                pointsClass = 'positive';
                break;
                
            case 'random':
                // Random multiplier between 0.5 and 2
                multiplier = 0.5 + Math.random() * 1.5;
                multiplier = Math.round(multiplier * 100) / 100; // Round to 2 decimal places
                
                if (multiplier > 1) {
                    result = 'LUCKY!';
                    description = `Player ${player} got a ${multiplier}x multiplier!`;
                    icon = '🍀';
                    pointsClass = 'positive';
                } else if (multiplier < 1) {
                    result = 'UNLUCKY!';
                    description = `Player ${player} only got ${multiplier}x multiplier...`;
                    icon = '😞';
                    pointsClass = 'negative';
                } else {
                    result = 'NEUTRAL';
                    description = 'Player ' + player + ' - no change to points';
                    icon = '😐';
                    pointsClass = 'neutral';
                }
                break;
                
            case 'skip':
                multiplier = 1;
                result = 'NO CHANGE';
                description = 'Player ' + player + ' skipped the gamble';
                icon = '✋';
                pointsClass = 'neutral';
                break;
        }
        
        // Store original score
        const oldScore = scores[player];
        
        // Apply multiplier to player's score
        scores[player] = Math.round(scores[player] * multiplier);
        
        // Ensure score doesn't go negative
        scores[player] = Math.max(0, scores[player]);
        
        // Calculate point change
        const playerChange = scores[player] - oldScore;
        
        // Update result display
        elements.resultIcon.textContent = icon;
        elements.resultTitle.textContent = `Player ${player}: ${result}`;
        elements.resultDescription.textContent = description;
        
        // Show point change
        if (player === 1) {
            elements.finalPoints1.textContent = playerChange >= 0 ? `+${playerChange}` : playerChange;
            elements.finalPoints1.className = `final-points-value ${playerChange >= 0 ? 'positive' : 'negative'}`;
        } else {
            elements.finalPoints2.textContent = playerChange >= 0 ? `+${playerChange}` : playerChange;
            elements.finalPoints2.className = `final-points-value ${playerChange >= 0 ? 'positive' : 'negative'}`;
        }
        
        // Show player's new score
        elements.resultPoints.textContent = `New Score: ${scores[player]}`;
        elements.resultPoints.className = `result-points ${pointsClass}`;
        
        // Show gambling result
        elements.gamblingResult.style.display = 'block';
    }

    function showFinalGambleResults() {
        // Update UI for final results
        elements.gamblingTitle.textContent = 'Gamble Results';
        elements.gamblingPlayerInfo.textContent = 'Both players have chosen!';
        elements.gamblingOptions.style.display = 'none';
        elements.nextGamblerBtn.style.display = 'none';
        
        // Show continue button
        elements.continueBtn.style.display = 'flex';
        elements.continueBtn.disabled = false;
        
        // Show final scores
        elements.resultTitle.textContent = 'Final Scores';
        elements.resultDescription.textContent = 'After individual gambles:';
        elements.resultPoints.textContent = `Player 1: ${scores[1]} | Player 2: ${scores[2]}`;
        elements.resultPoints.className = 'result-points neutral';
        elements.resultIcon.textContent = '🏆';
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
        // Reset and start again (questions will be re-shuffled)
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