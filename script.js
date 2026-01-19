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

    // Points Cards Configuration - UPDATED WITH EFFECTS
    const POINTS_CARDS = [
        { 
            id: 1, 
            title: "Small Win", 
            points: 5, 
            icon: "⭐", 
            type: "positive",
            effect: "Adds 5 points to your score"
        },
        { 
            id: 2, 
            title: "Good Score", 
            points: 10, 
            icon: "🎯", 
            type: "positive",
            effect: "Adds 10 points to your score"
        },
        { 
            id: 3, 
            title: "Big Win", 
            points: 15, 
            icon: "🏆", 
            type: "positive",
            effect: "Adds 15 points to your score"
        },
        { 
            id: 4, 
            title: "Risk Card", 
            points: -10, 
            icon: "⚠️", 
            type: "negative",
            effect: "Subtracts 10 points from your score"
        },
        { 
            id: 5, 
            title: "Double Points", 
            points: "2x", 
            icon: "✌️", 
            type: "multiplier",
            effect: "Doubles your base points"
        },
        { 
            id: 6, 
            title: "Steal 5", 
            points: -5, 
            icon: "🎭", 
            type: "steal",
            effect: "Takes 5 points from opponent, adds to you"
        },
        { 
            id: 7, 
            title: "Bonus Points", 
            points: 8, 
            icon: "🎁", 
            type: "positive",
            effect: "Adds 8 bonus points"
        },
        { 
            id: 8, 
            title: "Lucky Draw", 
            points: "Random", 
            icon: "🎲", 
            type: "random",
            effect: "Adds random points (1-20)"
        },
        { 
            id: 9, 
            title: "Half Points", 
            points: "÷2", 
            icon: "½", 
            type: "divide",
            effect: "Cuts opponent's score in half (round down)"
        },
        { 
            id: 10, 
            title: "Swap Scores", 
            points: "🔄", 
            icon: "🔄", 
            type: "swap",
            effect: "Swaps scores with opponent"
        },
        { 
            id: 11, 
            title: "Protection", 
            points: "🛡️", 
            icon: "🛡️", 
            type: "protect",
            effect: "Protects from negative cards next turn"
        },
        { 
            id: 12, 
            title: "Extra Turn", 
            points: "↻", 
            icon: "↻", 
            type: "extraTurn",
            effect: "Gets an extra turn"
        }
    ];

    // Game modifiers
    let protectedPlayers = { 1: false, 2: false };
    let extraTurns = { 1: 0, 2: 0 };

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
                },
                {
                    id: 4,
                    question: "Why are fuel trucks grounded with a metal chain during refueling?",
                    options: [
                        "To prevent static charge buildup",
                        "To increase fuel flow rate",
                        "To measure fuel quantity",
                        "To stabilize the truck"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "The chain provides a path for static electricity to flow to ground, preventing sparks that could ignite fuel vapors."
                },
                {
                    id: 5,
                    question: "In an electrostatic precipitator, how are smoke particles removed?",
                    options: [
                        "They are charged and attracted to oppositely charged plates",
                        "They are filtered through fine mesh",
                        "They are dissolved in water spray",
                        "They are burned at high temperature"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "Particles are given a negative charge and attracted to positively charged collection plates where they stick and are removed."
                },
                {
                    id: 6,
                    question: "What type of electric field pattern exists between two opposite charges?",
                    options: [
                        "Field lines go from positive to negative",
                        "Field lines go from negative to positive",
                        "Field lines are parallel",
                        "Field lines are circular"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "Electric field lines always point from positive to negative charges. Between opposite charges, lines connect them directly."
                },
                {
                    id: 7,
                    question: "What happens during charging by induction without contact?",
                    options: [
                        "Charge separation occurs in the neutral object",
                        "Electrons are transferred by direct contact",
                        "Protons move between objects",
                        "Both objects become positively charged"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "A charged object brought near a conductor causes charge separation - electrons move away or toward the charged object."
                },
                {
                    id: 8,
                    question: "Why do clothes sometimes stick together after being in a dryer?",
                    options: [
                        "Static charge buildup causes attraction",
                        "Heat causes fibers to melt slightly",
                        "Moisture creates adhesive bonds",
                        "Detergent residue acts like glue"
                    ],
                    correctAnswer: 0,
                    points: 10,
                    explanation: "Friction in the dryer transfers electrons between clothes, creating opposite charges that attract each other."
                },
                {
                    id: 9,
                    question: "What safety precaution is taken in operating theaters to prevent static sparks?",
                    options: [
                        "Conductive flooring and footwear",
                        "Special anti-static lighting",
                        "Humidity control systems",
                        "All of the above"
                    ],
                    correctAnswer: 3,
                    points: 15,
                    explanation: "Multiple measures are used: conductive floors, special footwear, humidity control, and non-static materials to prevent sparks near flammable anesthetics."
                },
                {
                    id: 10,
                    question: "How does a photocopier use static electricity?",
                    options: [
                        "Charged drum attracts toner to specific areas",
                        "Static cleans the paper surface",
                        "It neutralizes paper before printing",
                        "It heats the toner for fixing"
                    ],
                    correctAnswer: 0,
                    points: 15,
                    explanation: "Light removes charge from a photoconductive drum in pattern of the original. Toner (negatively charged) sticks to remaining charged areas."
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
                },
                {
                    id: 3,
                    question: "Which fraction is NOT equivalent to \\(\\frac{2}{3}\\)?",
                    options: [
                        "\\(\\frac{4}{9}\\)",
                        "\\(\\frac{6}{9}\\)",
                        "\\(\\frac{8}{12}\\)",
                        "\\(\\frac{10}{15}\\)"
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
        // Reset game modifiers
        protectedPlayers = { 1: false, 2: false };
        extraTurns = { 1: 0, 2: 0 };
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
        // Reset game modifiers
        protectedPlayers = { 1: false, 2: false };
        extraTurns = { 1: 0, 2: 0 };
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
        
        // Take first 6 cards for variety
        const selectedCards = shuffledCards.slice(0, 6);
        
        selectedCards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            cardElement.dataset.cardId = card.id;
            cardElement.dataset.index = index;
            cardElement.title = card.effect; // Tooltip with effect
            
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
        let cardEffectApplied = false;
        let cardEffectMessage = "";
        
        if (isCorrect) {
            // Base points for correct answer
            pointsEarned = question.points || 10;
            cardEffectMessage = `Base points: +${pointsEarned}`;
            
            // If card is selected, apply card effect
            if (selectedCard) {
                pointsEarned = applyCardEffect(pointsEarned, selectedCard);
                cardEffectApplied = true;
                cardEffectMessage = `Card effect applied: ${selectedCard.effect}`;
            }
            
            // Add to current player's score
            scores[currentPlayer] += pointsEarned;
            updateScores();
            
        } else {
            cardEffectMessage = "Wrong answer - no base points";
            
            // Penalty for wrong answer if negative card is selected
            if (selectedCard && selectedCard.type === 'negative') {
                // Check if player is protected
                if (!protectedPlayers[currentPlayer]) {
                    pointsEarned = selectedCard.points; // Negative number
                    scores[currentPlayer] += pointsEarned;
                    updateScores();
                    cardEffectApplied = true;
                    cardEffectMessage = `Penalty applied: ${selectedCard.effect}`;
                } else {
                    cardEffectMessage = "Protected! No penalty applied.";
                    protectedPlayers[currentPlayer] = false; // Protection used
                }
            }
            
            // Some cards still work even with wrong answer
            if (selectedCard && selectedCard.type === 'steal') {
                applyStealEffect();
                cardEffectApplied = true;
                cardEffectMessage = `Steal effect applied: ${selectedCard.effect}`;
            }
        }
        
        // Apply special effects that don't depend on correctness
        if (selectedCard && !cardEffectApplied) {
            applySpecialCardEffect(selectedCard);
        }
        
        // Show results
        showResults(isCorrect, pointsEarned, cardEffectMessage);
        
        // Disable options
        document.querySelectorAll('.option').forEach(opt => {
            opt.style.pointerEvents = 'none';
        });
        
        // Show next button
        elements.submitBtn.style.display = 'none';
        elements.nextBtn.style.display = 'flex';
    }

    function applyCardEffect(basePoints, card) {
        let finalPoints = basePoints;
        
        switch(card.type) {
            case 'positive':
                finalPoints += card.points;
                break;
                
            case 'negative':
                // Only apply if not protected
                if (!protectedPlayers[currentPlayer]) {
                    finalPoints += card.points; // Negative number
                } else {
                    protectedPlayers[currentPlayer] = false; // Protection used
                }
                break;
                
            case 'multiplier':
                finalPoints *= 2;
                break;
                
            case 'steal':
                const opponent = currentPlayer === 1 ? 2 : 1;
                const stealAmount = 5;
                scores[opponent] = Math.max(0, scores[opponent] - stealAmount);
                finalPoints += stealAmount;
                break;
                
            case 'random':
                const randomPoints = Math.floor(Math.random() * 20) + 1;
                finalPoints += randomPoints;
                break;
                
            case 'divide':
                const opp = currentPlayer === 1 ? 2 : 1;
                scores[opp] = Math.floor(scores[opp] / 2);
                break;
                
            case 'swap':
                const temp = scores[1];
                scores[1] = scores[2];
                scores[2] = temp;
                updateScores();
                break;
                
            case 'protect':
                protectedPlayers[currentPlayer] = true;
                break;
                
            case 'extraTurn':
                extraTurns[currentPlayer]++;
                break;
        }
        
        return finalPoints;
    }

    function applyStealEffect() {
        const opponent = currentPlayer === 1 ? 2 : 1;
        const stealAmount = 5;
        scores[opponent] = Math.max(0, scores[opponent] - stealAmount);
        scores[currentPlayer] += stealAmount;
        updateScores();
    }

    function applySpecialCardEffect(card) {
        switch(card.type) {
            case 'divide':
                const opponent = currentPlayer === 1 ? 2 : 1;
                scores[opponent] = Math.floor(scores[opponent] / 2);
                updateScores();
                break;
                
            case 'swap':
                const temp = scores[1];
                scores[1] = scores[2];
                scores[2] = temp;
                updateScores();
                break;
                
            case 'protect':
                protectedPlayers[currentPlayer] = true;
                break;
                
            case 'extraTurn':
                extraTurns[currentPlayer]++;
                break;
        }
    }

    function showResults(isCorrect, points, effectMessage = "") {
        // Update result display
        elements.answerResult.textContent = isCorrect ? 'Correct' : 'Incorrect';
        elements.answerResult.className = `result-value ${isCorrect ? 'correct' : 'incorrect'}`;
        
        elements.cardPointsResult.textContent = points >= 0 ? `+${points}` : points;
        elements.cardPointsResult.className = `result-value ${points >= 0 ? 'positive' : 'negative'}`;
        
        elements.totalEarned.textContent = points >= 0 ? `+${points}` : points;
        elements.totalEarned.className = `result-value total`;
        
        // Show card effect message if available
        if (effectMessage && selectedCard) {
            const effectElement = document.createElement('div');
            effectElement.className = 'result-item';
            effectElement.innerHTML = `
                <span class="result-label">Card Effect:</span>
                <span class="result-value neutral">${effectMessage}</span>
            `;
            elements.resultsDisplay.querySelector('.result-details').appendChild(effectElement);
        }
        
        // Show results
        elements.resultsDisplay.style.display = 'block';
        
        // If card was already selected, show it
        if (selectedCard) {
            elements.selectedCardInfo.style.display = 'block';
        }
    }

    function nextQuestion() {
        // Check for extra turns
        if (extraTurns[currentPlayer] > 0) {
            extraTurns[currentPlayer]--;
            // Same player gets another turn
            currentQuestion++;
            if (currentQuestion >= quizData.questions.length) {
                endGame();
                return;
            }
            loadQuestion(currentQuestion);
        } else {
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
