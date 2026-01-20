class QuizGame {
    constructor() {
        // Game state
        this.worksheets = new Map(); // Store by code
        this.currentWorksheet = null;
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [];
        this.score = 0;
        this.coins = 1000;
        this.currentBet = 50;
        this.winStreak = 0;
        this.multiplier = 1.0;
        this.isGameActive = false;
        this.usedHints = new Set();
        
        // Code system
        this.codeDigits = ['', '', '', '', '', ''];
        this.codeDefinitions = {
            level: {
                '1': { name: 'Primary School', folder: 'primary', icon: '👦' },
                '2': { name: 'Lower Secondary', folder: 'lower-secondary', icon: '👨‍🎓' },
                '3': { name: 'Upper Secondary', folder: 'upper-secondary', icon: '👩‍🎓' }
            },
            subject: {
                '0': { name: 'Mathematics', folder: 'math', icon: '🧮' },
                '1': { name: 'Science (General/Combined)', folder: 'science', icon: '🔬' },
                '2': { name: 'Combined Physics', folder: 'combined-physics', icon: '⚛️' },
                '3': { name: 'Pure Physics', folder: 'pure-physics', icon: '⚡' },
                '4': { name: 'Combined Chemistry', folder: 'combined-chem', icon: '⚗️' },
                '5': { name: 'Pure Chemistry', folder: 'pure-chem', icon: '🧪' }
            },
            grade: {
                '1': { name: 'Primary 1 / Secondary 1', icon: '1️⃣' },
                '2': { name: 'Primary 2 / Secondary 2', icon: '2️⃣' },
                '3': { name: 'Primary 3 / Secondary 3', icon: '3️⃣' },
                '4': { name: 'Primary 4 / Secondary 4', icon: '4️⃣' },
                '5': { name: 'Primary 5', icon: '5️⃣' },
                '6': { name: 'Primary 6', icon: '6️⃣' }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.scanForJSONFiles();
        this.updateUI();
        this.updateCodeDisplay();
    }
    
    setupEventListeners() {
        // Code digit inputs
        document.querySelectorAll('.digit-input input').forEach((input, index) => {
            input.addEventListener('input', (e) => {
                this.handleDigitInput(e.target.value, index);
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value) {
                    this.focusPreviousDigit(index);
                } else if (e.key >= '0' && e.key <= '9' && e.target.value) {
                    this.focusNextDigit(index);
                }
            });
        });
        
        // Activate button
        document.getElementById('activate-btn').addEventListener('click', () => {
            this.activateWorksheet();
        });
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.scanForJSONFiles();
        });
        
        // Upload button
        document.getElementById('upload-json-btn').addEventListener('click', () => {
            this.openFileUpload();
        });
        
        // Bet controls
        document.getElementById('bet-slider').addEventListener('input', (e) => {
            this.currentBet = parseInt(e.target.value);
            document.getElementById('bet-amount').textContent = this.currentBet;
            this.animateBetChange();
        });
        
        document.getElementById('bet-btn').addEventListener('click', () => this.startGame());
        
        // Game controls
        document.getElementById('hint-btn').addEventListener('click', () => this.useHint());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.nextQuestion());
        
        // Options grid
        document.getElementById('options-grid').addEventListener('click', (e) => {
            const optionCard = e.target.closest('.option-card');
            if (optionCard && !optionCard.classList.contains('disabled')) {
                const selectedOption = parseInt(optionCard.dataset.index);
                this.checkAnswer(selectedOption);
            }
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '4' && this.isGameActive) {
                const index = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.option-card');
                if (options[index] && !options[index].classList.contains('disabled')) {
                    this.checkAnswer(index);
                }
            }
            
            if (e.key === 'Enter' && this.currentWorksheet && !this.isGameActive) {
                document.getElementById('bet-btn').click();
            }
        });
    }
    
    async scanForJSONFiles() {
        this.showFeedback('Scanning for JSON files in Questions/ folder...', 'info');
        
        try {
            // Try to load from localStorage first
            await this.loadFromLocalStorage();
            
            // Try to fetch from server if available
            await this.fetchFromServer();
            
        } catch (error) {
            console.log('Cannot auto-scan in browser. Use "Upload JSON File" button instead.');
            this.showFeedback('Upload JSON files manually using the upload button', 'info');
        }
    }
    
    async fetchFromServer() {
        // Try to fetch a list of available worksheets from the server
        try {
            // This would require a backend endpoint that returns available files
            // For now, we'll just use the upload method
        } catch (error) {
            // Server fetch not available
        }
    }
    
    async loadFromLocalStorage() {
        const storedWorksheets = localStorage.getItem('quiz-worksheets');
        if (storedWorksheets) {
            try {
                const worksheets = JSON.parse(storedWorksheets);
                this.worksheets.clear();
                
                for (const [code, worksheet] of Object.entries(worksheets)) {
                    if (this.validateWorksheet(worksheet)) {
                        this.worksheets.set(code, worksheet);
                    }
                }
                
                this.updateWorksheetsList();
                this.updateStats();
                
                if (this.worksheets.size > 0) {
                    this.showFeedback(`Loaded ${this.worksheets.size} worksheets from storage`, 'success');
                }
            } catch (error) {
                console.error('Error loading from localStorage:', error);
            }
        }
    }
    
    setupFileUpload() {
        const fileInput = document.getElementById('json-file-input');
        
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            if (!file.name.match(/\.json$/i)) {
                this.showFeedback('Please select a JSON file', 'error');
                return;
            }
            
            try {
                const text = await this.readFile(file);
                const worksheet = JSON.parse(text);
                
                if (!this.validateWorksheet(worksheet)) {
                    this.showFeedback('Invalid worksheet format', 'error');
                    return;
                }
                
                this.worksheets.set(worksheet.code, worksheet);
                this.saveToLocalStorage();
                
                this.updateWorksheetsList();
                this.updateStats();
                
                this.showFeedback(`Loaded: ${worksheet.code} - ${worksheet.title}`, 'success');
                
                // Auto-activate if it matches current code
                const currentCode = this.codeDigits.join('');
                if (currentCode === worksheet.code) {
                    this.activateWorksheet();
                }
                
            } catch (error) {
                this.showFeedback('Error reading JSON file', 'error');
                console.error(error);
            }
            
            fileInput.value = '';
        });
    }
    
    readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }
    
    validateWorksheet(worksheet) {
        const requiredFields = ['code', 'title', 'subject', 'level', 'questions'];
        for (const field of requiredFields) {
            if (!worksheet[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        if (!/^\d{6}$/.test(worksheet.code)) {
            console.error('Code must be 6 digits');
            return false;
        }
        
        if (!Array.isArray(worksheet.questions) || worksheet.questions.length === 0) {
            console.error('Questions must be a non-empty array');
            return false;
        }
        
        return true;
    }
    
    saveToLocalStorage() {
        const obj = Object.fromEntries(this.worksheets);
        localStorage.setItem('quiz-worksheets', JSON.stringify(obj));
    }
    
    openFileUpload() {
        document.getElementById('json-file-input').click();
    }
    
    handleDigitInput(value, index) {
        let isValid = true;
        
        switch(index) {
            case 0: isValid = /^[1-3]$/.test(value); break;
            case 1: isValid = /^[0-5]$/.test(value); break;
            case 2: isValid = /^[1-6]$/.test(value); break;
            case 3: isValid = /^[0-9]$/.test(value); break;
            case 4: isValid = /^[0-9]$/.test(value); break;
            case 5: isValid = /^[1-9]$/.test(value); break;
        }
        
        const input = document.querySelector(`.digit-input[data-index="${index}"] input`);
        input.classList.remove('valid', 'invalid');
        
        if (value && isValid) {
            this.codeDigits[index] = value;
            input.classList.add('valid');
            this.focusNextDigit(index);
        } else if (value && !isValid) {
            input.classList.add('invalid');
            this.showFeedback(`Invalid digit for position ${index + 1}`, 'error');
        } else {
            this.codeDigits[index] = '';
        }
        
        this.updateCodeDisplay();
    }
    
    focusNextDigit(currentIndex) {
        if (currentIndex < 5) {
            const nextInput = document.querySelector(`.digit-input[data-index="${currentIndex + 1}"] input`);
            if (nextInput) {
                nextInput.focus();
                nextInput.select();
            }
        }
    }
    
    focusPreviousDigit(currentIndex) {
        if (currentIndex > 0) {
            const prevInput = document.querySelector(`.digit-input[data-index="${currentIndex - 1}"] input`);
            if (prevInput) {
                prevInput.focus();
                prevInput.select();
            }
        }
    }
    
    updateCodeDisplay() {
        const fullCode = this.codeDigits.join('');
        const codeDisplay = document.getElementById('full-code-display');
        const placeholder = document.querySelector('.code-placeholder');
        
        if (fullCode.length === 6) {
            placeholder.textContent = fullCode.split('').join(' ');
            codeDisplay.classList.add('active');
            document.getElementById('activate-btn').disabled = false;
        } else {
            let display = '';
            for (let i = 0; i < 6; i++) {
                display += this.codeDigits[i] ? this.codeDigits[i] + ' ' : '_ ';
            }
            placeholder.textContent = display.trim();
            codeDisplay.classList.remove('active');
            document.getElementById('activate-btn').disabled = true;
        }
    }
    
    getCodeMeaning(code) {
        if (code.length !== 6) return null;
        
        const digits = code.split('');
        const level = this.codeDefinitions.level[digits[0]];
        const subject = this.codeDefinitions.subject[digits[1]];
        const grade = this.codeDefinitions.grade[digits[2]];
        const chapter = parseInt(digits[3] + digits[4]);
        const worksheet = digits[5];
        
        if (!level || !subject || !grade) return null;
        
        return {
            level,
            subject,
            grade,
            chapter,
            worksheet,
            fullName: `${level.name} • ${subject.name} • ${grade.name} • Chapter ${chapter} • Worksheet ${worksheet}`
        };
    }
    
    activateWorksheet() {
        const code = this.codeDigits.join('');
        
        if (code.length !== 6) {
            this.showFeedback('Please enter all 6 digits', 'error');
            return;
        }
        
        const meaning = this.getCodeMeaning(code);
        if (!meaning) {
            this.showFeedback('Invalid code format', 'error');
            return;
        }
        
        if (this.worksheets.has(code)) {
            this.currentWorksheet = this.worksheets.get(code);
            this.activateExistingWorksheet(code, meaning);
        } else {
            this.showMissingWorksheet(code, meaning);
        }
    }
    
    activateExistingWorksheet(code, meaning) {
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [...this.currentWorksheet.questions].sort(() => Math.random() - 0.5);
        this.score = 0;
        this.winStreak = 0;
        this.multiplier = 1.0;
        this.usedHints.clear();
        this.isGameActive = false;
        
        document.getElementById('active-code').textContent = code;
        document.getElementById('active-worksheet-code').textContent = code;
        document.getElementById('worksheet-status').innerHTML = `
            <i class="fas fa-check-circle status-active"></i>
            <span class="status-active">ACTIVE</span>
        `;
        
        this.updateWorksheetInfo(code, meaning);
        document.getElementById('bet-btn').disabled = false;
        document.getElementById('game-title').textContent = this.currentWorksheet.title;
        
        this.showFeedback(`Worksheet ${code} activated!`, 'success');
        this.updateWorksheetsList();
    }
    
    showMissingWorksheet(code, meaning) {
        document.getElementById('active-code').textContent = code;
        document.getElementById('active-worksheet-code').textContent = code;
        document.getElementById('worksheet-status').innerHTML = `
            <i class="fas fa-times-circle" style="color: #F87272"></i>
            <span style="color: #F87272">NOT FOUND</span>
        `;
        
        const detailsDiv = document.getElementById('worksheet-details');
        detailsDiv.innerHTML = `
            <div class="worksheet-create-info">
                <div class="create-header">
                    <div class="create-icon" style="background: rgba(248, 114, 114, 0.1); color: #F87272;">
                        <i class="fas fa-file-exclamation"></i>
                    </div>
                    <div class="create-details">
                        <h3>Worksheet Not Found</h3>
                        <p>No JSON file found for code: ${code}</p>
                    </div>
                </div>
                
                <div class="code-breakdown-details">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Level:</span>
                        <span class="breakdown-value">${meaning.level.icon} ${meaning.level.name}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Subject:</span>
                        <span class="breakdown-value">${meaning.subject.icon} ${meaning.subject.name}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Grade:</span>
                        <span class="breakdown-value">${meaning.grade.icon} ${meaning.grade.name}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Chapter:</span>
                        <span class="breakdown-value">${meaning.chapter}</span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Worksheet:</span>
                        <span class="breakdown-value">${meaning.worksheet}</span>
                    </div>
                </div>
                
                <div class="file-creation-guide">
                    <h4>Expected File Location:</h4>
                    <div class="file-path">
                        <code>Questions/${meaning.level.folder}/${meaning.subject.folder}/${code}.json</code>
                    </div>
                    <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 10px;">
                        Upload a JSON file with the correct code or place it in the folder structure above.
                    </p>
                </div>
                
                <div class="create-actions">
                    <button class="create-btn" id="upload-json-manual">
                        <i class="fas fa-upload"></i>
                        UPLOAD JSON FILE
                    </button>
                </div>
            </div>
        `;
        
        document.getElementById('upload-json-manual').addEventListener('click', () => {
            this.openFileUpload();
        });
        
        document.getElementById('bet-btn').disabled = true;
        this.showFeedback(`Worksheet ${code} not found. Upload JSON file.`, 'error');
    }
    
    updateWorksheetInfo(code, meaning) {
        const detailsDiv = document.getElementById('worksheet-details');
        
        if (this.currentWorksheet) {
            detailsDiv.innerHTML = `
                <div class="worksheet-active-info">
                    <div class="active-header">
                        <div class="active-icon" style="background: rgba(108, 99, 255, 0.1); color: #6C63FF;">
                            ${meaning.subject.icon}
                        </div>
                        <div class="active-details">
                            <h3>${this.currentWorksheet.title}</h3>
                            <p>${this.currentWorksheet.topic}</p>
                        </div>
                    </div>
                    
                    <div class="worksheet-meta-info">
                        <div class="meta-item">
                            <i class="fas fa-chart-line"></i>
                            <span>${this.currentWorksheet.difficulty}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-question-circle"></i>
                            <span>${this.currentWorksheet.questions.length} Questions</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-star"></i>
                            <span>${this.currentWorksheet.questions.reduce((sum, q) => sum + q.points, 0)} Total Points</span>
                        </div>
                    </div>
                    
                    <div class="worksheet-description-box">
                        <p>${this.currentWorksheet.description}</p>
                    </div>
                    
                    <div class="worksheet-stats">
                        <div class="stat-box">
                            <div class="stat-number">${this.currentWorksheet.questions.length}</div>
                            <div class="stat-label">QUESTIONS</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">${Math.round(this.currentWorksheet.questions.reduce((sum, q) => sum + q.points, 0) / this.currentWorksheet.questions.length)}</div>
                            <div class="stat-label">AVG POINTS</div>
                        </div>
                        <div class="stat-box">
                            <div class="stat-number">${this.currentWorksheet.author}</div>
                            <div class="stat-label">AUTHOR</div>
                        </div>
                    </div>
                </div>
            `;
        }
    }
    
    updateWorksheetsList() {
        const worksheetsGrid = document.getElementById('worksheets-list');
        const availableCount = document.getElementById('available-count');
        
        if (this.worksheets.size === 0) {
            worksheetsGrid.innerHTML = `
                <div class="no-worksheets">
                    <div class="no-worksheets-icon">
                        <i class="fas fa-folder-open" style="font-size: 3rem; opacity: 0.5;"></i>
                    </div>
                    <h4>No Worksheets Found</h4>
                    <p>Upload JSON files using the button above</p>
                </div>
            `;
            availableCount.textContent = '0';
            return;
        }
        
        worksheetsGrid.innerHTML = '';
        let count = 0;
        
        this.worksheets.forEach((worksheet, code) => {
            const meaning = this.getCodeMeaning(code);
            if (!meaning) return;
            
            const card = document.createElement('div');
            card.className = `worksheet-card ${this.currentWorksheet?.code === code ? 'active' : ''}`;
            card.dataset.code = code;
            
            const difficultyClass = worksheet.difficulty ? 
                `difficulty-${worksheet.difficulty.toLowerCase()}` : 'difficulty-intermediate';
            
            card.innerHTML = `
                <div class="worksheet-code">${code}</div>
                <div class="worksheet-header">
                    <div class="worksheet-title">${meaning.subject.icon} ${worksheet.title}</div>
                    <div class="worksheet-difficulty ${difficultyClass}">
                        ${worksheet.difficulty || 'Intermediate'}
                    </div>
                </div>
                <div class="worksheet-meta">
                    <span><i class="fas fa-graduation-cap"></i> ${worksheet.level}</span>
                    <span><i class="fas fa-atom"></i> ${worksheet.subject}</span>
                    <span><i class="fas fa-question-circle"></i> ${worksheet.questions.length} questions</span>
                </div>
                <div class="worksheet-description">${worksheet.description || 'No description'}</div>
            `;
            
            card.addEventListener('click', () => {
                // Auto-fill the code and activate
                this.codeDigits = code.split('');
                document.querySelectorAll('.digit-input input').forEach((input, index) => {
                    input.value = this.codeDigits[index];
                    input.classList.add('valid');
                });
                this.updateCodeDisplay();
                this.activateWorksheet();
            });
            
            worksheetsGrid.appendChild(card);
            count++;
        });
        
        availableCount.textContent = count;
    }
    
    updateStats() {
        document.getElementById('worksheet-count').textContent = this.worksheets.size;
        
        let totalQuestions = 0;
        this.worksheets.forEach(ws => {
            totalQuestions += ws.questions.length;
        });
        
        document.getElementById('question-count').textContent = totalQuestions;
    }
    
    startGame() {
        if (!this.currentWorksheet || this.coins < this.currentBet) {
            this.showFeedback("Not enough coins!", "error");
            return;
        }
        
        this.coins -= this.currentBet;
        this.isGameActive = true;
        
        document.getElementById('bet-btn').disabled = true;
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('skip-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        
        this.loadQuestion();
        this.updateUI();
        
        this.showFeedback("Game started! Good luck!", "success");
    }
    
    loadQuestion() {
        if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
            this.endGame();
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        
        document.getElementById('question-number').textContent = `Q${this.currentQuestionIndex + 1}`;
        document.getElementById('question-points').innerHTML = `
            <i class="fas fa-star"></i>
            <span>${question.points} POINTS</span>
        `;
        
        document.getElementById('question-content').innerHTML = `
            <div class="question-text">${question.question}</div>
        `;
        
        const optionsGrid = document.getElementById('options-grid');
        optionsGrid.innerHTML = '';
        
        const optionLabels = ['A', 'B', 'C', 'D'];
        question.options.forEach((option, index) => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.dataset.index = index;
            
            optionCard.innerHTML = `
                <div class="option-label">${optionLabels[index]}</div>
                <div class="option-text">${option}</div>
            `;
            
            optionsGrid.appendChild(optionCard);
        });
        
        this.updateProgress();
    }
    
    checkAnswer(selectedIndex) {
        if (!this.isGameActive) return;
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.add('disabled');
        });
        
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach((card, index) => {
            if (index === question.correctAnswer) {
                card.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                card.classList.add('wrong');
            }
        });
        
        if (isCorrect) {
            this.handleCorrectAnswer(question);
        } else {
            this.handleWrongAnswer(question);
        }
        
        document.getElementById('next-btn').disabled = false;
        this.updateUI();
    }
    
    handleCorrectAnswer(question) {
        const pointsWon = question.points;
        const coinsWon = Math.round(pointsWon * this.multiplier);
        
        this.score += pointsWon;
        this.coins += coinsWon;
        this.winStreak++;
        this.multiplier = Math.min(this.multiplier + 0.2, 3.0);
        
        this.showFeedback(
            `Correct! +${pointsWon} points<br>+${coinsWon} coins (${this.multiplier.toFixed(1)}x)`,
            "success"
        );
    }
    
    handleWrongAnswer(question) {
        this.winStreak = 0;
        this.multiplier = Math.max(this.multiplier - 0.5, 1.0);
        
        const correctAnswer = question.options[question.correctAnswer];
        this.showFeedback(
            `Incorrect!<br>Correct: ${correctAnswer}`,
            "error"
        );
    }
    
    useHint() {
        if (!this.isGameActive || this.coins < 50 || this.usedHints.has(this.currentQuestionIndex)) {
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const wrongOptions = question.options
            .map((_, index) => index)
            .filter(index => index !== question.correctAnswer);
        
        const optionToRemove = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
        const optionCard = document.querySelector(`.option-card[data-index="${optionToRemove}"]`);
        
        optionCard.style.opacity = '0.3';
        optionCard.classList.add('disabled');
        
        this.coins -= 50;
        this.usedHints.add(this.currentQuestionIndex);
        document.getElementById('hint-btn').disabled = true;
        
        this.showFeedback("Hint used! -50 coins", "info");
        this.updateUI();
    }
    
    skipQuestion() {
        if (!this.isGameActive || this.coins < 25) {
            return;
        }
        
        this.coins -= 25;
        this.currentQuestionIndex++;
        this.loadQuestion();
        
        this.showFeedback("Question skipped! -25 coins", "info");
        this.updateUI();
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        this.loadQuestion();
    }
    
    endGame() {
        this.isGameActive = false;
        const totalPoints = this.shuffledQuestions.reduce((sum, q) => sum + q.points, 0);
        const accuracy = (this.score / totalPoints) * 100;
        
        const questionCard = document.getElementById('question-card');
        questionCard.innerHTML = `
            <div class="question-header">
                <div class="question-number">DONE!</div>
                <div class="question-points">
                    <i class="fas fa-trophy"></i>
                    <span>GAME OVER</span>
                </div>
            </div>
            <div class="question-content">
                <div class="game-results">
                    <div class="result-header">
                        <div class="result-icon">${accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}</div>
                        <h3>${accuracy >= 80 ? 'EXCELLENT!' : accuracy >= 60 ? 'GOOD JOB!' : 'KEEP PRACTICING!'}</h3>
                    </div>
                    
                    <div class="result-stats">
                        <div class="stat-row">
                            <span>Final Score</span>
                            <span class="stat-value">${this.score}/${totalPoints}</span>
                        </div>
                        <div class="stat-row">
                            <span>Accuracy</span>
                            <span class="stat-value">${accuracy.toFixed(1)}%</span>
                        </div>
                        <div class="stat-row">
                            <span>Highest Streak</span>
                            <span class="stat-value">${this.winStreak}</span>
                        </div>
                        <div class="stat-row">
                            <span>Coins Won</span>
                            <span class="stat-value coins-won">+${this.coins - 1000}</span>
                        </div>
                    </div>
                    
                    <div class="result-actions">
                        <button class="play-again-btn" id="play-again-btn">
                            <i class="fas fa-redo"></i>
                            PLAY AGAIN
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.activateWorksheet();
        });
        
        document.getElementById('options-grid').innerHTML = '';
        document.getElementById('bet-btn').disabled = false;
    }
    
    updateUI() {
        document.getElementById('coins').textContent = this.formatNumber(this.coins);
        document.getElementById('multiplier').textContent = `${this.multiplier.toFixed(1)}x`;
        document.getElementById('multiplier-fill').style.width = `${((this.multiplier - 1) / 2) * 100}%`;
        document.getElementById('streak').textContent = this.winStreak;
        document.getElementById('score').textContent = this.score;
        
        document.getElementById('hint-btn').disabled = !this.isGameActive || this.coins < 50;
        document.getElementById('skip-btn').disabled = !this.isGameActive || this.coins < 25;
        
        const betSlider = document.getElementById('bet-slider');
        const maxBet = Math.min(500, this.coins);
        betSlider.max = maxBet;
        if (this.currentBet > maxBet) {
            this.currentBet = maxBet;
            betSlider.value = maxBet;
            document.getElementById('bet-amount').textContent = maxBet;
        }
    }
    
    updateProgress() {
        const progress = (this.currentQuestionIndex / this.shuffledQuestions.length) * 100;
        document.getElementById('progress-fill').style.width = `${progress}%`;
        document.getElementById('progress-count').textContent = 
            `${this.currentQuestionIndex + 1}/${this.shuffledQuestions.length}`;
    }
    
    showFeedback(message, type) {
        const feedback = document.getElementById('feedback-message');
        feedback.innerHTML = message;
        feedback.className = `feedback-message show feedback-${type}`;
        
        setTimeout(() => {
            this.clearFeedback();
        }, 4000);
    }
    
    clearFeedback() {
        const feedback = document.getElementById('feedback-message');
        feedback.className = 'feedback-message';
        setTimeout(() => {
            feedback.innerHTML = '';
        }, 300);
    }
    
    animateBetChange() {
        const betAmount = document.getElementById('bet-amount');
        betAmount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            betAmount.style.transform = 'scale(1)';
        }, 300);
    }
    
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
}

// Initialize the game
const quizGame = new QuizGame();