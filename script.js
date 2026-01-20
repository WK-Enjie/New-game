class QuizGame {
    constructor() {
        this.worksheets = [];
        this.currentWorksheet = null;
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [];
        this.score = 0;
        this.coins = 1000;
        this.currentBet = 50;
        this.winStreak = 0;
        this.multiplier = 1;
        this.isGameActive = false;
        this.usedHints = new Set();
        this.isMobile = window.innerWidth <= 992;
        
        // Initialize the game
        this.init();
    }
    
    init() {
        // Load worksheets and set up event listeners
        this.loadWorksheets();
        this.setupEventListeners();
        this.setupMobileEvents();
        this.updateUI();
        this.handleResize();
    }
    
    async loadWorksheets() {
        try {
            // Sample worksheets data
            const worksheetData = [
                {
                    "code": "341-01-1",
                    "title": "Primary 3 Mathematics - Chapter 1",
                    "subject": "Mathematics",
                    "level": "Primary School",
                    "topic": "Chapter 1: Numbers to 1000",
                    "difficulty": "Beginner",
                    "author": "Math Department",
                    "created": "2024-01-15",
                    "description": "Basic number concepts for Primary 3 students.",
                    "questions": [
                        {
                            "id": 1,
                            "question": "What is the value of the digit 5 in the number 359?",
                            "options": ["5", "50", "500", "5000"],
                            "correctAnswer": 1,
                            "points": 10,
                            "explanation": "The digit 5 is in the tens place, so its value is 50."
                        },
                        {
                            "id": 2,
                            "question": "Which number comes after 299?",
                            "options": ["298", "300", "399", "301"],
                            "correctAnswer": 1,
                            "points": 10,
                            "explanation": "After 299 comes 300."
                        },
                        {
                            "id": 3,
                            "question": "What is 145 + 328?",
                            "options": ["463", "473", "483", "493"],
                            "correctAnswer": 1,
                            "points": 15,
                            "explanation": "145 + 328 = 473"
                        }
                    ]
                },
                {
                    "code": "342-09-1",
                    "title": "Secondary 4 Combined Chemistry - Chapter 9",
                    "subject": "Combined Chemistry",
                    "level": "Upper Secondary",
                    "topic": "Chapter 9: The Periodic Table",
                    "difficulty": "Intermediate",
                    "author": "Science Department",
                    "created": "2024-01-20",
                    "description": "Periodic table concepts and trends for combined chemistry.",
                    "questions": [
                        {
                            "id": 1,
                            "question": "Which group of elements are known as noble gases?",
                            "options": ["Group 1", "Group 2", "Group 7", "Group 0"],
                            "correctAnswer": 3,
                            "points": 15,
                            "explanation": "Noble gases are in Group 0 (or Group 18) of the periodic table."
                        },
                        {
                            "id": 2,
                            "question": "What is the trend in atomic radius across a period?",
                            "options": ["Increases", "Decreases", "Stays the same", "Increases then decreases"],
                            "correctAnswer": 1,
                            "points": 20,
                            "explanation": "Atomic radius decreases across a period due to increasing nuclear charge."
                        }
                    ]
                },
                {
                    "code": "334-15-1",
                    "title": "Static Electricity (Conceptual)",
                    "subject": "Pure Physics",
                    "level": "Upper Secondary",
                    "topic": "15. Static Electricity",
                    "difficulty": "Intermediate",
                    "author": "Physics Department",
                    "created": "2024-01-19",
                    "description": "Conceptual questions on static electricity covering charges, fields, charging methods, and applications.",
                    "questions": [
                        {
                            "id": 1,
                            "question": "What is the SI unit for measuring electric charge?",
                            "options": ["Coulomb", "Newton", "Joule", "Watt"],
                            "correctAnswer": 0,
                            "points": 10,
                            "explanation": "The coulomb (C) is the SI unit of electric charge."
                        },
                        {
                            "id": 2,
                            "question": "When a plastic rod is rubbed with wool, the plastic becomes negatively charged. What has been transferred?",
                            "options": [
                                "Electrons from wool to plastic",
                                "Protons from plastic to wool",
                                "Electrons from plastic to wool",
                                "Protons from wool to plastic"
                            ],
                            "correctAnswer": 0,
                            "points": 10,
                            "explanation": "Electrons are transferred from the wool to the plastic rod."
                        }
                    ]
                },
                {
                    "code": "201-01-1",
                    "title": "Secondary 1 Mathematics - Chapter 1",
                    "subject": "Mathematics",
                    "level": "Lower Secondary",
                    "topic": "Chapter 1: LCM and HCF",
                    "difficulty": "Intermediate",
                    "author": "Math Department",
                    "created": "2024-01-25",
                    "description": "LCM and HCF concepts for Secondary 1 students.",
                    "questions": [
                        {
                            "id": 1,
                            "question": "What is the LCM of 12 and 18?",
                            "options": ["24", "36", "48", "72"],
                            "correctAnswer": 1,
                            "points": 15,
                            "explanation": "LCM of 12 and 18 is 36."
                        },
                        {
                            "id": 2,
                            "question": "What is the HCF of 24 and 36?",
                            "options": ["6", "8", "12", "24"],
                            "correctAnswer": 2,
                            "points": 15,
                            "explanation": "HCF of 24 and 36 is 12."
                        }
                    ]
                }
            ];
            
            this.worksheets = worksheetData;
            
            this.updateWorksheetList();
            this.updateStats();
            
            // Simulate loading delay
            setTimeout(() => {
                document.querySelector('.loading').style.display = 'none';
            }, 800);
            
        } catch (error) {
            console.error("Error loading worksheets:", error);
            this.showError("Failed to load worksheets. Please check your internet connection.");
        }
    }
    
    setupEventListeners() {
        // Bet slider
        const betSlider = document.getElementById('bet-slider');
        betSlider.addEventListener('input', (e) => {
            this.currentBet = parseInt(e.target.value);
            document.getElementById('bet-amount').textContent = this.currentBet;
        });
        
        // Add touch support for slider on mobile
        betSlider.addEventListener('touchstart', () => {
            betSlider.classList.add('slider-active');
        });
        
        betSlider.addEventListener('touchend', () => {
            setTimeout(() => {
                betSlider.classList.remove('slider-active');
            }, 300);
        });
        
        // Place bet button
        document.getElementById('bet-btn').addEventListener('click', () => this.startGame());
        
        // Option buttons - using event delegation for better mobile performance
        document.getElementById('options-grid').addEventListener('click', (e) => {
            const optionBtn = e.target.closest('.option-btn');
            if (optionBtn && !optionBtn.disabled) {
                const selectedOption = parseInt(optionBtn.dataset.index);
                this.checkAnswer(selectedOption);
            }
        });
        
        // Add touch feedback for option buttons
        document.getElementById('options-grid').addEventListener('touchstart', (e) => {
            const optionBtn = e.target.closest('.option-btn');
            if (optionBtn && !optionBtn.disabled) {
                optionBtn.classList.add('touch-active');
            }
        }, { passive: true });
        
        document.getElementById('options-grid').addEventListener('touchend', (e) => {
            const optionBtn = e.target.closest('.option-btn');
            if (optionBtn) {
                optionBtn.classList.remove('touch-active');
            }
        }, { passive: true });
        
        // Game control buttons
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadWorksheets();
            this.showToast('Worksheets refreshed!', 'success');
        });
        
        // Filters
        document.getElementById('level-filter').addEventListener('change', () => this.updateWorksheetList());
        document.getElementById('subject-filter').addEventListener('change', () => this.updateWorksheetList());
        document.getElementById('difficulty-filter').addEventListener('change', () => this.updateWorksheetList());
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
        
        // Prevent zoom on mobile for better UX
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevent double tap zoom
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
    
    setupMobileEvents() {
        // Mobile menu button
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const selectionPanel = document.getElementById('selection-panel');
        const mobileOverlay = document.getElementById('mobile-overlay');
        const mobileWorksheetBtn = document.getElementById('mobile-worksheet-btn');
        const mobileGameBtn = document.getElementById('mobile-game-btn');
        
        mobileMenuBtn.addEventListener('click', () => {
            selectionPanel.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = selectionPanel.classList.contains('active') ? 'hidden' : '';
        });
        
        mobileOverlay.addEventListener('click', () => {
            selectionPanel.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
        
        mobileWorksheetBtn.addEventListener('click', () => {
            selectionPanel.classList.add('active');
            mobileOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            mobileWorksheetBtn.classList.add('active');
            mobileGameBtn.classList.remove('active');
        });
        
        mobileGameBtn.addEventListener('click', () => {
            selectionPanel.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            mobileGameBtn.classList.add('active');
            mobileWorksheetBtn.classList.remove('active');
        });
        
        // Close panel when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (this.isMobile && 
                !selectionPanel.contains(e.target) && 
                !mobileMenuBtn.contains(e.target) &&
                selectionPanel.classList.contains('active')) {
                selectionPanel.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    handleResize() {
        this.isMobile = window.innerWidth <= 992;
        const selectionPanel = document.getElementById('selection-panel');
        const mobileOverlay = document.getElementById('mobile-overlay');
        
        // Reset mobile menu on desktop
        if (!this.isMobile) {
            selectionPanel.classList.remove('active');
            mobileOverlay.classList.remove('active');
            document.body.style.overflow = '';
            selectionPanel.classList.remove('mobile-hidden');
        } else {
            selectionPanel.classList.add('mobile-hidden');
        }
        
        // Update any mobile-specific UI
        this.updateMobileUI();
    }
    
    updateMobileUI() {
        // Add mobile-specific classes if needed
        if (this.isMobile) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }
    
    updateWorksheetList() {
        const worksheetsList = document.getElementById('worksheets-list');
        const levelFilter = document.getElementById('level-filter').value;
        const subjectFilter = document.getElementById('subject-filter').value;
        const difficultyFilter = document.getElementById('difficulty-filter').value;
        
        // Filter worksheets
        const filteredWorksheets = this.worksheets.filter(ws => {
            const levelMatch = levelFilter === 'all' || 
                (levelFilter === '1' && ws.level.includes('Primary')) ||
                (levelFilter === '2' && ws.level.includes('Lower Secondary')) ||
                (levelFilter === '3' && ws.level.includes('Upper Secondary'));
            
            const subjectMatch = subjectFilter === 'all' || 
                ws.subject.toLowerCase().includes(this.getSubjectName(subjectFilter).toLowerCase());
            
            const difficultyMatch = difficultyFilter === 'all' || 
                ws.difficulty === difficultyFilter;
            
            return levelMatch && subjectMatch && difficultyMatch;
        });
        
        // Update worksheet count
        document.getElementById('worksheet-count').textContent = filteredWorksheets.length;
        
        // Clear current list
        worksheetsList.innerHTML = '';
        
        if (filteredWorksheets.length === 0) {
            worksheetsList.innerHTML = `
                <div class="no-worksheets">
                    <i class="fas fa-search"></i>
                    <p>No worksheets found matching your criteria.</p>
                    <button class="btn-refresh" onclick="quizGame.loadWorksheets()" style="margin-top: 10px;">
                        <i class="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
            `;
            return;
        }
        
        // Add worksheets to list
        filteredWorksheets.forEach((worksheet) => {
            const worksheetElement = document.createElement('div');
            worksheetElement.className = 'worksheet-item';
            if (this.currentWorksheet && this.currentWorksheet.code === worksheet.code) {
                worksheetElement.classList.add('active');
            }
            
            // Truncate description for mobile
            const description = this.isMobile && worksheet.description.length > 80 
                ? worksheet.description.substring(0, 80) + '...' 
                : worksheet.description;
            
            worksheetElement.innerHTML = `
                <div class="worksheet-header">
                    <div class="worksheet-title">${worksheet.title}</div>
                    <div class="worksheet-difficulty difficulty-${worksheet.difficulty.toLowerCase()}">
                        ${worksheet.difficulty}
                    </div>
                </div>
                <div class="worksheet-meta">
                    <span><i class="fas fa-graduation-cap"></i> ${worksheet.level}</span>
                    <span><i class="fas fa-atom"></i> ${worksheet.subject}</span>
                    <span><i class="fas fa-question-circle"></i> ${worksheet.questions.length} questions</span>
                </div>
                <div class="worksheet-description">${description}</div>
            `;
            
            worksheetElement.addEventListener('click', (e) => {
                this.selectWorksheet(worksheet);
                
                // Close panel on mobile after selection
                if (this.isMobile) {
                    document.getElementById('selection-panel').classList.remove('active');
                    document.getElementById('mobile-overlay').classList.remove('active');
                    document.body.style.overflow = '';
                    document.getElementById('mobile-game-btn').classList.add('active');
                    document.getElementById('mobile-worksheet-btn').classList.remove('active');
                }
            });
            
            // Add touch feedback
            worksheetElement.addEventListener('touchstart', () => {
                worksheetElement.classList.add('touch-active');
            }, { passive: true });
            
            worksheetElement.addEventListener('touchend', () => {
                setTimeout(() => {
                    worksheetElement.classList.remove('touch-active');
                }, 150);
            }, { passive: true });
            
            worksheetsList.appendChild(worksheetElement);
        });
    }
    
    getSubjectName(code) {
        const subjects = {
            '0': 'Mathematics',
            '1': 'Science',
            '2': 'Combined Physics',
            '3': 'Pure Physics',
            '4': 'Combined Chemistry',
            '5': 'Pure Chemistry'
        };
        return subjects[code] || 'Unknown';
    }
    
    selectWorksheet(worksheet) {
        this.currentWorksheet = worksheet;
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [...worksheet.questions].sort(() => Math.random() - 0.5);
        this.score = 0;
        this.winStreak = 0;
        this.multiplier = 1;
        this.usedHints.clear();
        
        // Update UI
        document.querySelectorAll('.worksheet-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Find and highlight the selected worksheet
        const worksheetElements = document.querySelectorAll('.worksheet-item');
        worksheetElements.forEach(item => {
            if (item.querySelector('.worksheet-title').textContent === worksheet.title) {
                item.classList.add('active');
                // Scroll into view on mobile
                if (this.isMobile) {
                    setTimeout(() => {
                        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                }
            }
        });
        
        // Enable bet button
        document.getElementById('bet-btn').disabled = false;
        
        // Update game panel
        const gameTitle = document.getElementById('game-title');
        gameTitle.innerHTML = `
            <i class="fas fa-gamepad"></i> 
            <span class="game-title-text">${this.isMobile ? worksheet.title.substring(0, 30) + '...' : worksheet.title}</span>
        `;
        
        // Reset question display with mobile-friendly content
        document.getElementById('question-display').innerHTML = `
            <div class="welcome-message">
                ${this.isMobile ? '<i class="fas fa-arrow-left mobile-only-arrow"></i>' : ''}
                <h3>Ready to Play?</h3>
                <p>${worksheet.title}</p>
                <div class="worksheet-info">
                    <p><strong>Topic:</strong> ${worksheet.topic}</p>
                    <p><strong>Difficulty:</strong> ${worksheet.difficulty}</p>
                    <p><strong>Questions:</strong> ${worksheet.questions.length}</p>
                    <p><strong>Points Available:</strong> ${worksheet.questions.reduce((sum, q) => sum + q.points, 0)}</p>
                </div>
                ${this.isMobile ? `
                    <div class="mobile-tip">
                        <i class="fas fa-hand-point-up"></i>
                        <span>Adjust your bet using the slider above</span>
                    </div>
                ` : ''}
            </div>
        `;
        
        // Clear options and feedback
        document.getElementById('options-grid').innerHTML = '';
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Update progress
        this.updateProgress();
        this.updateUI();
        
        // Show selection toast
        this.showToast(`Selected: ${worksheet.title}`, 'info');
    }
    
    startGame() {
        if (!this.currentWorksheet || this.coins < this.currentBet) {
            this.showError("Not enough coins to place bet!");
            return;
        }
        
        // Deduct bet from coins
        this.coins -= this.currentBet;
        this.isGameActive = true;
        
        // Disable bet button
        document.getElementById('bet-btn').disabled = true;
        
        // Enable game controls
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('skip-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        
        // Load first question
        this.loadQuestion();
        this.updateUI();
        
        // Show game start toast
        this.showToast(`Game started! Bet: ${this.currentBet} coins`, 'success');
    }
    
    loadQuestion() {
        if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
            this.endGame();
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        
        // Display question with mobile optimization
        const questionText = this.isMobile && question.question.length > 150 
            ? question.question.substring(0, 150) + '...' 
            : question.question;
        
        document.getElementById('question-display').innerHTML = `
            <div id="question-text">${questionText}</div>
            <div class="question-meta">
                <span><i class="fas fa-star"></i> ${question.points} points</span>
                <span><i class="fas fa-coins"></i> Win: ${question.points * this.multiplier} coins</span>
                <span><i class="fas fa-bolt"></i> Multiplier: ${this.multiplier.toFixed(1)}x</span>
            </div>
        `;
        
        // Display options optimized for mobile
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, index) => {
            const optionButton = document.createElement('button');
            optionButton.className = 'option-btn';
            optionButton.dataset.index = index;
            
            // Truncate long options for mobile
            const optionText = this.isMobile && option.length > 50 
                ? option.substring(0, 50) + '...' 
                : option;
            
            optionButton.innerHTML = `
                <div class="option-label">${optionLabels[index]}</div>
                <div class="option-text">${optionText}</div>
            `;
            
            // Add aria-label for accessibility
            optionButton.setAttribute('aria-label', `Option ${optionLabels[index]}: ${optionText}`);
            
            optionsGrid.appendChild(optionButton);
        });
        
        // Clear feedback
        document.getElementById('feedback').innerHTML = '';
        document.getElementById('feedback').className = 'feedback';
        
        // Update progress
        this.updateProgress();
        
        // Auto-focus on first option for keyboard users (desktop only)
        if (!this.isMobile) {
            setTimeout(() => {
                const firstOption = document.querySelector('.option-btn');
                if (firstOption) firstOption.focus();
            }, 100);
        }
    }
    
    checkAnswer(selectedIndex) {
        if (!this.isGameActive) return;
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Add visual feedback immediately for better mobile UX
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(btn => btn.disabled = true);
        
        // Highlight correct/wrong answers
        optionButtons.forEach((btn, index) => {
            if (index === question.correctAnswer) {
                setTimeout(() => {
                    btn.classList.add('correct');
                }, 100);
            } else if (index === selectedIndex && !isCorrect) {
                setTimeout(() => {
                    btn.classList.add('wrong');
                }, 100);
            }
        });
        
        // Update score and coins
        if (isCorrect) {
            this.score += question.points;
            const coinsWon = Math.round(question.points * this.multiplier);
            this.coins += coinsWon;
            this.winStreak++;
            this.multiplier = Math.min(this.multiplier + 0.2, 3);
            
            // Show success feedback
            document.getElementById('feedback').className = 'feedback correct';
            document.getElementById('feedback').innerHTML = `
                <div class="feedback-content">
                    <i class="fas fa-check-circle"></i> 
                    <div>
                        <strong>Correct!</strong> +${question.points} points
                        <div class="coins-won">+${coinsWon} coins!</div>
                        <div class="explanation">${question.explanation}</div>
                    </div>
                </div>
            `;
            
            // Celebrate with confetti for big wins
            if (coinsWon >= 100 || this.winStreak >= 3) {
                this.createConfetti();
            }
            
            // Haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate([50, 50, 50]);
            }
        } else {
            this.winStreak = 0;
            this.multiplier = Math.max(this.multiplier - 0.5, 1);
            
            // Show error feedback
            document.getElementById('feedback').className = 'feedback incorrect';
            const correctOption = question.options[question.correctAnswer];
            const correctOptionText = this.isMobile && correctOption.length > 40 
                ? correctOption.substring(0, 40) + '...' 
                : correctOption;
            
            document.getElementById('feedback').innerHTML = `
                <div class="feedback-content">
                    <i class="fas fa-times-circle"></i> 
                    <div>
                        <strong>Incorrect!</strong> 
                        <div class="correct-answer">Correct: ${correctOptionText}</div>
                        <div class="explanation">${question.explanation}</div>
                    </div>
                </div>
            `;
            
            // Haptic feedback for mobile
            if (navigator.vibrate) {
                navigator.vibrate([200]);
            }
        }
        
        // Enable next button
        document.getElementById('next-btn').disabled = false;
        document.getElementById('next-btn').focus();
        
        this.updateUI();
    }
    
    useHint() {
        if (!this.isGameActive || this.coins < 50 || this.usedHints.has(this.currentQuestionIndex)) {
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const wrongOptions = question.options
            .map((_, index) => index)
            .filter(index => index !== question.correctAnswer);
        
        // Randomly remove one wrong option
        const optionToRemove = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        
        // Disable the removed option with animation
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons[optionToRemove].style.transition = 'all 0.3s ease';
        optionButtons[optionToRemove].style.opacity = '0.3';
        optionButtons[optionToRemove].style.transform = 'scale(0.95)';
        optionButtons[optionToRemove].disabled = true;
        
        // Deduct coins
        this.coins -= 50;
        this.usedHints.add(this.currentQuestionIndex);
        
        // Show hint feedback
        document.getElementById('feedback').className = 'feedback hint';
        document.getElementById('feedback').innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-lightbulb"></i> 
                <div>
                    <strong>Hint used!</strong> One wrong option removed.
                    <div class="hint-cost">Cost: 50 coins</div>
                </div>
            </div>
        `;
        
        // Disable hint button for this question
        document.getElementById('hint-btn').disabled = true;
        
        // Haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate([50]);
        }
        
        this.updateUI();
    }
    
    skipQuestion() {
        if (!this.isGameActive || this.coins < 25) {
            return;
        }
        
        // Deduct coins
        this.coins -= 25;
        
        // Move to next question
        this.currentQuestionIndex++;
        
        // Show skip feedback
        document.getElementById('feedback').className = 'feedback feedback-info';
        document.getElementById('feedback').innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-forward"></i> 
                <div>
                    <strong>Question skipped!</strong>
                    <div class="skip-cost">Cost: 25 coins</div>
                </div>
            </div>
        `;
        
        // Load next question
        this.loadQuestion();
        
        // Reset hint button
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        
        this.updateUI();
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Reset hint button
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        
        // Load next question
        this.loadQuestion();
    }
    
    endGame() {
        this.isGameActive = false;
        
        // Calculate final score
        const totalPossiblePoints = this.shuffledQuestions.reduce((sum, q) => sum + q.points, 0);
        const percentage = (this.score / totalPossiblePoints) * 100;
        
        let message = '';
        let messageIcon = '';
        
        if (percentage >= 90) {
            message = 'Perfect Score! You\'re a genius! 🏆';
            messageIcon = 'fas fa-trophy';
            this.createConfetti();
        } else if (percentage >= 80) {
            message = 'Excellent! You\'re a quiz master! ⭐';
            messageIcon = 'fas fa-star';
            this.createConfetti();
        } else if (percentage >= 70) {
            message = 'Great job! You passed with flying colors! 👍';
            messageIcon = 'fas fa-thumbs-up';
        } else if (percentage >= 60) {
            message = 'Good job! You passed the challenge. ✅';
            messageIcon = 'fas fa-check-circle';
        } else {
            message = 'Keep practicing! You\'ll do better next time. 💪';
            messageIcon = 'fas fa-redo';
        }
        
        // Show game over screen optimized for mobile
        document.getElementById('question-display').innerHTML = `
            <div class="welcome-message">
                <h3><i class="${messageIcon}"></i> Game Complete!</h3>
                <p>${message}</p>
                <div class="final-score">
                    <div class="score-item">
                        <span>Final Score:</span>
                        <span class="score-value">${this.score}/${totalPossiblePoints}</span>
                    </div>
                    <div class="score-item">
                        <span>Percentage:</span>
                        <span class="score-value">${percentage.toFixed(1)}%</span>
                    </div>
                    <div class="score-item">
                        <span>Coin Balance:</span>
                        <span class="score-value">${this.coins}</span>
                    </div>
                    <div class="score-item">
                        <span>Highest Streak:</span>
                        <span class="score-value">${this.winStreak}</span>
                    </div>
                </div>
                <div class="game-complete-buttons">
                    <button id="play-again" class="btn-bet" style="margin-top: 15px;">
                        <i class="fas fa-redo"></i> Play Again
                    </button>
                    <button id="select-new" class="btn-refresh" style="margin-top: 10px;">
                        <i class="fas fa-book"></i> Select New Worksheet
                    </button>
                </div>
            </div>
        `;
        
        // Clear options and feedback
        document.getElementById('options-grid').innerHTML = '';
        document.getElementById('feedback').innerHTML = '';
        
        // Add event listeners for game complete buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.selectWorksheet(this.currentWorksheet);
        });
        
        document.getElementById('select-new').addEventListener('click', () => {
            if (this.isMobile) {
                document.getElementById('mobile-worksheet-btn').click();
            }
            this.showToast('Select a new worksheet to play!', 'info');
        });
        
        // Enable bet button for new game
        document.getElementById('bet-btn').disabled = false;
        
        // Show completion toast
        this.showToast(`Game complete! Score: ${this.score}/${totalPossiblePoints}`, 'success');
    }
    
    updateProgress() {
        const progress = ((this.currentQuestionIndex) / this.shuffledQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-text').textContent = 
            `Q ${this.currentQuestionIndex + 1}/${this.shuffledQuestions.length}`;
        document.getElementById('score-display').textContent = `Score: ${this.score}`;
    }
    
    updateUI() {
        // Update coin display
        document.getElementById('coins').textContent = this.coins;
        
        // Update multiplier
        document.getElementById('multiplier').textContent = `${this.multiplier.toFixed(1)}x`;
        
        // Update streak
        document.getElementById('streak').textContent = this.winStreak;
        
        // Update question count
        const totalQuestions = this.worksheets.reduce((sum, ws) => sum + ws.questions.length, 0);
        document.getElementById('question-count').textContent = totalQuestions;
        
        // Update subject count
        const uniqueSubjects = new Set(this.worksheets.map(ws => ws.subject));
        document.getElementById('subject-count').textContent = uniqueSubjects.size;
        
        // Update button states based on coin balance
        document.getElementById('hint-btn').disabled = !this.isGameActive || this.coins < 50;
        document.getElementById('skip-btn').disabled = !this.isGameActive || this.coins < 25;
        
        // Update bet slider max based on coins
        const betSlider = document.getElementById('bet-slider');
        const maxBet = Math.min(500, this.coins);
        betSlider.max = maxBet;
        if (this.currentBet > maxBet) {
            this.currentBet = maxBet;
            betSlider.value = maxBet;
            document.getElementById('bet-amount').textContent = maxBet;
        }
        
        // Update bet button text for mobile
        const betButton = document.getElementById('bet-btn');
        if (this.isMobile) {
            betButton.querySelector('.btn-text').innerHTML = `Bet: <span id="bet-amount">${this.currentBet}</span>`;
        }
    }
    
    updateStats() {
        document.getElementById('worksheet-count').textContent = this.worksheets.length;
        
        const totalQuestions = this.worksheets.reduce((sum, ws) => sum + ws.questions.length, 0);
        document.getElementById('question-count').textContent = totalQuestions;
        
        const uniqueSubjects = new Set(this.worksheets.map(ws => ws.subject));
        document.getElementById('subject-count').textContent = uniqueSubjects.size;
    }
    
    createConfetti() {
        const container = document.getElementById('confetti-container');
        const colors = ['#4cc9f0', '#4361ee', '#3a0ca3', '#7209b7', '#f72585'];
        
        // Clear existing confetti
        container.innerHTML = '';
        
        for (let i = 0; i < (this.isMobile ? 50 : 100); i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            const size = Math.random() * 10 + 5;
            confetti.style.width = size + 'px';
            confetti.style.height = size + 'px';
            confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
            
            container.appendChild(confetti);
            
            // Animate confetti
            const animation = confetti.animate([
                { 
                    transform: 'translateY(-100px) rotate(0deg)', 
                    opacity: 1 
                },
                { 
                    transform: `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, 
                    opacity: 0 
                }
            ], {
                duration: Math.random() * 2000 + 2000,
                easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }
    }
    
    showError(message) {
        const feedback = document.getElementById('feedback');
        feedback.className = 'feedback incorrect';
        feedback.innerHTML = `
            <div class="feedback-content">
                <i class="fas fa-exclamation-triangle"></i> 
                <div><strong>Error:</strong> ${message}</div>
            </div>
        `;
        
        // Haptic feedback for mobile
        if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
        }
        
        setTimeout(() => {
            if (feedback.innerHTML.includes(message)) {
                feedback.innerHTML = '';
                feedback.className = 'feedback';
            }
        }, 5000);
    }
    
    showToast(message, type = 'info') {
        // Create toast element
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to body
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
        
        // Haptic feedback for mobile
        if (navigator.vibrate && type === 'success') {
            navigator.vibrate(50);
        }
    }
}

// Add toast styles dynamically
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast {
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: rgba(10, 25, 47, 0.95);
        color: white;
        padding: 12px 20px;
        border-radius: 10px;
        border: 1px solid var(--border-color);
        display: flex;
        align-items: center;
        gap: 10px;
        z-index: 10000;
        transition: transform 0.3s ease;
        max-width: 90%;
        box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
        backdrop-filter: blur(10px);
    }
    
    .toast.show {
        transform: translateX(-50%) translateY(0);
    }
    
    .toast-success {
        border-color: var(--success-color);
        background: rgba(46, 204, 113, 0.15);
    }
    
    .toast-error {
        border-color: var(--danger-color);
        background: rgba(231, 76, 60, 0.15);
    }
    
    .toast-info {
        border-color: var(--primary-color);
        background: rgba(76, 201, 240, 0.15);
    }
    
    .touch-active {
        transform: scale(0.98) !important;
        opacity: 0.9 !important;
    }
    
    .slider-active {
        transform: scale(1.05);
    }
    
    @media (max-width: 768px) {
        .toast {
            bottom: 120px;
            font-size: 0.9rem;
            padding: 10px 15px;
        }
    }
`;
document.head.appendChild(toastStyles);

// Initialize the game when the page loads
let quizGame;
document.addEventListener('DOMContentLoaded', () => {
    quizGame = new QuizGame();
    
    // Add CSS for option button active states
    const activeStyles = document.createElement('style');
    activeStyles.textContent = `
        .option-btn:active {
            transform: scale(0.98) !important;
        }
        
        @media (hover: none) {
            .option-btn:hover {
                transform: none !important;
            }
        }
        
        /* Improve focus styles for accessibility */
        button:focus, select:focus, input:focus {
            outline: 2px solid var(--primary-color);
            outline-offset: 2px;
        }
        
        /* Hide focus outline for mouse users */
        .using-mouse button:focus,
        .using-mouse select:focus,
        .using-mouse input:focus {
            outline: none;
        }
    `;
    document.head.appendChild(activeStyles);
    
    // Detect mouse vs keyboard users for focus styles
    document.addEventListener('mousedown', () => {
        document.body.classList.add('using-mouse');
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Tab') {
            document.body.classList.remove('using-mouse');
        }
    });
    
    // Prevent context menu on mobile
    document.addEventListener('contextmenu', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
        }
    });
});

// Make quizGame available globally for console debugging
window.quizGame = quizGame;