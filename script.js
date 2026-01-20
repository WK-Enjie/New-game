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
                '1': { name: 'Primary School', color: '#4CC9F0', icon: '👦' },
                '2': { name: 'Lower Secondary', color: '#36D399', icon: '👨‍🎓' },
                '3': { name: 'Upper Secondary', color: '#6C63FF', icon: '👩‍🎓' }
            },
            subject: {
                '0': { name: 'Mathematics', color: '#4CC9F0', icon: '🧮' },
                '1': { name: 'Science (General/Combined)', color: '#36D399', icon: '🔬' },
                '2': { name: 'Combined Physics', color: '#6C63FF', icon: '⚛️' },
                '3': { name: 'Pure Physics', color: '#6C63FF', icon: '⚡' },
                '4': { name: 'Combined Chemistry', color: '#FF6584', icon: '⚗️' },
                '5': { name: 'Pure Chemistry', color: '#FF6584', icon: '🧪' }
            },
            grade: {
                '1': { name: 'Primary 1 / Secondary 1', color: '#FBBD23' },
                '2': { name: 'Primary 2 / Secondary 2', color: '#FBBD23' },
                '3': { name: 'Primary 3 / Secondary 3', color: '#FBBD23' },
                '4': { name: 'Primary 4 / Secondary 4', color: '#FBBD23' },
                '5': { name: 'Primary 5', color: '#FBBD23' },
                '6': { name: 'Primary 6', color: '#FBBD23' }
            }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadSampleWorksheets();
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
        
        // Quick code buttons
        document.querySelectorAll('.quick-code-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.currentTarget.dataset.code;
                this.loadQuickCode(code);
            });
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
        
        // Refresh button
        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadSampleWorksheets();
            this.showFeedback('Worksheets refreshed!', 'success');
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Number keys for answers
            if (e.key >= '1' && e.key <= '4' && this.isGameActive) {
                const index = parseInt(e.key) - 1;
                const options = document.querySelectorAll('.option-card');
                if (options[index] && !options[index].classList.contains('disabled')) {
                    this.checkAnswer(index);
                }
            }
            
            // Enter to start game
            if (e.key === 'Enter' && this.currentWorksheet && !this.isGameActive) {
                document.getElementById('bet-btn').click();
            }
        });
    }
    
    handleDigitInput(value, index) {
        // Validate digit based on position
        let isValid = true;
        
        switch(index) {
            case 0: // Level (1-3)
                isValid = /^[1-3]$/.test(value);
                break;
            case 1: // Subject (0-5)
                isValid = /^[0-5]$/.test(value);
                break;
            case 2: // Grade (1-6)
                isValid = /^[1-6]$/.test(value);
                break;
            case 3: // Chapter tens (0-9)
                isValid = /^[0-9]$/.test(value);
                break;
            case 4: // Chapter ones (0-9)
                isValid = /^[0-9]$/.test(value);
                break;
            case 5: // Worksheet (1-9)
                isValid = /^[1-9]$/.test(value);
                break;
        }
        
        // Update digit
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
            nextInput.focus();
        }
    }
    
    focusPreviousDigit(currentIndex) {
        if (currentIndex > 0) {
            const prevInput = document.querySelector(`.digit-input[data-index="${currentIndex - 1}"] input`);
            prevInput.focus();
        }
    }
    
    updateCodeDisplay() {
        const fullCode = this.codeDigits.join('');
        const codeDisplay = document.getElementById('full-code-display');
        const placeholder = document.querySelector('.code-placeholder');
        
        if (fullCode.length === 6) {
            // Show actual code
            placeholder.textContent = fullCode.split('').join(' ');
            codeDisplay.classList.add('active');
            
            // Enable activate button
            document.getElementById('activate-btn').disabled = false;
        } else {
            // Show placeholder
            let display = '';
            for (let i = 0; i < 6; i++) {
                display += this.codeDigits[i] ? this.codeDigits[i] + ' ' : '_ ';
            }
            placeholder.textContent = display.trim();
            codeDisplay.classList.remove('active');
            
            // Disable activate button
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
        
        // Get meaning
        const meaning = this.getCodeMeaning(code);
        if (!meaning) {
            this.showFeedback('Invalid code format', 'error');
            return;
        }
        
        // Check if worksheet exists
        if (this.worksheets.has(code)) {
            // Worksheet exists, activate it
            this.currentWorksheet = this.worksheets.get(code);
            this.activateExistingWorksheet(code, meaning);
        } else {
            // Worksheet doesn't exist, show info for manual creation
            this.showNewWorksheetInfo(code, meaning);
        }
    }
    
    activateExistingWorksheet(code, meaning) {
        // Reset game state
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [...this.currentWorksheet.questions].sort(() => Math.random() - 0.5);
        this.score = 0;
        this.winStreak = 0;
        this.multiplier = 1.0;
        this.usedHints.clear();
        this.isGameActive = false;
        
        // Update UI
        document.getElementById('active-code').textContent = code;
        document.getElementById('active-worksheet-code').textContent = code;
        document.getElementById('worksheet-status').innerHTML = `
            <i class="fas fa-check-circle status-active"></i>
            <span class="status-active">ACTIVE</span>
        `;
        
        // Update worksheet info
        this.updateWorksheetInfo(code, meaning);
        
        // Enable bet button
        document.getElementById('bet-btn').disabled = false;
        
        // Show success
        this.showFeedback(`Worksheet ${code} activated!`, 'success');
        
        // Update game title
        document.getElementById('game-title').textContent = this.currentWorksheet.title;
        
        // Update available worksheets list
        this.updateWorksheetsList();
    }
    
    showNewWorksheetInfo(code, meaning) {
        // Show worksheet creation info
        document.getElementById('active-code').textContent = code;
        document.getElementById('active-worksheet-code').textContent = code;
        document.getElementById('worksheet-status').innerHTML = `
            <i class="fas fa-plus-circle" style="color: #FBBD23"></i>
            <span style="color: #FBBD23">CREATE FILE</span>
        `;
        
        // Show worksheet details for creation
        const detailsDiv = document.getElementById('worksheet-details');
        detailsDiv.innerHTML = `
            <div class="worksheet-create-info">
                <div class="create-header">
                    <div class="create-icon" style="background: ${meaning.subject.color}">
                        ${meaning.subject.icon}
                    </div>
                    <div class="create-details">
                        <h3>Create Worksheet File</h3>
                        <p>File not found. Create JSON file with this code.</p>
                    </div>
                </div>
                
                <div class="code-breakdown-details">
                    <div class="breakdown-item">
                        <span class="breakdown-label">Level:</span>
                        <span class="breakdown-value">
                            ${meaning.level.icon} ${meaning.level.name}
                        </span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Subject:</span>
                        <span class="breakdown-value">
                            ${meaning.subject.icon} ${meaning.subject.name}
                        </span>
                    </div>
                    <div class="breakdown-item">
                        <span class="breakdown-label">Grade:</span>
                        <span class="breakdown-value">${meaning.grade.name}</span>
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
                    <h4>File Creation Guide:</h4>
                    <div class="file-path">
                        <code>Questions/${this.getFolderPath(code)}/${code}.json</code>
                    </div>
                    <div class="json-template">
                        <pre>{
    "code": "${code}",
    "title": "${meaning.subject.name} - Chapter ${meaning.chapter}",
    "subject": "${meaning.subject.name}",
    "level": "${meaning.level.name}",
    "topic": "Chapter ${meaning.chapter}: [Topic Name]",
    "difficulty": "Intermediate",
    "author": "[Your Name]",
    "created": "${new Date().toISOString().split('T')[0]}",
    "description": "[Worksheet description]",
    "questions": [...]
}</pre>
                    </div>
                </div>
                
                <div class="create-actions">
                    <button class="create-btn" id="use-template-btn">
                        <i class="fas fa-file-download"></i>
                        DOWNLOAD TEMPLATE
                    </button>
                    <button class="create-btn secondary" id="load-sample-btn">
                        <i class="fas fa-magic"></i>
                        LOAD SAMPLE DATA
                    </button>
                </div>
            </div>
        `;
        
        // Add event listeners to new buttons
        document.getElementById('use-template-btn').addEventListener('click', () => {
            this.downloadTemplate(code, meaning);
        });
        
        document.getElementById('load-sample-btn').addEventListener('click', () => {
            this.loadSampleForCode(code, meaning);
        });
        
        // Disable game start
        document.getElementById('bet-btn').disabled = true;
        this.showFeedback(`Worksheet ${code} not found. Create file or load sample.`, 'info');
    }
    
    updateWorksheetInfo(code, meaning) {
        const detailsDiv = document.getElementById('worksheet-details');
        
        if (this.currentWorksheet) {
            detailsDiv.innerHTML = `
                <div class="worksheet-active-info">
                    <div class="active-header">
                        <div class="active-icon" style="background: ${meaning.subject.color}">
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
    
    getFolderPath(code) {
        const level = code[0];
        const subject = code[1];
        
        let folder = '';
        switch(level) {
            case '1': folder += 'primary/'; break;
            case '2': folder += 'lower-secondary/'; break;
            case '3': folder += 'upper-secondary/'; break;
        }
        
        switch(subject) {
            case '0': folder += 'math/'; break;
            case '1': folder += 'science/'; break;
            case '2': folder += 'combined-physics/'; break;
            case '3': folder += 'pure-physics/'; break;
            case '4': folder += 'combined-chem/'; break;
            case '5': folder += 'pure-chem/'; break;
        }
        
        return folder;
    }
    
    loadQuickCode(code) {
        // Set code digits
        const digits = code.split('');
        digits.forEach((digit, index) => {
            this.codeDigits[index] = digit;
            const input = document.querySelector(`.digit-input[data-index="${index}"] input`);
            input.value = digit;
            input.classList.add('valid');
        });
        
        this.updateCodeDisplay();
        
        // Check if worksheet exists
        if (this.worksheets.has(code)) {
            this.activateWorksheet();
        } else {
            // Auto-activate if it's a sample code
            if (['341011', '342091', '334151'].includes(code)) {
                setTimeout(() => this.activateWorksheet(), 300);
            }
        }
    }
    
    loadSampleWorksheets() {
        // Clear existing worksheets
        this.worksheets.clear();
        
        // Sample worksheets with proper codes
        const sampleWorksheets = [
            {
                code: '341011',
                title: 'Primary 3 Mathematics - Chapter 1',
                subject: 'Mathematics',
                level: 'Primary School',
                topic: 'Chapter 1: Numbers to 1000',
                difficulty: 'Beginner',
                author: 'Math Department',
                created: '2024-01-15',
                description: 'Basic number concepts for Primary 3 students.',
                questions: [
                    {
                        id: 1,
                        question: 'What is the value of the digit 5 in the number 359?',
                        options: ['5', '50', '500', '5000'],
                        correctAnswer: 1,
                        points: 10,
                        explanation: 'The digit 5 is in the tens place, so its value is 50.'
                    },
                    {
                        id: 2,
                        question: 'Which number comes after 299?',
                        options: ['298', '300', '399', '301'],
                        correctAnswer: 1,
                        points: 10,
                        explanation: 'After 299 comes 300.'
                    }
                ]
            },
            {
                code: '342091',
                title: 'Secondary 4 Combined Chemistry - Chapter 9',
                subject: 'Combined Chemistry',
                level: 'Upper Secondary',
                topic: 'Chapter 9: The Periodic Table',
                difficulty: 'Intermediate',
                author: 'Science Department',
                created: '2024-01-20',
                description: 'Periodic table concepts and trends for combined chemistry.',
                questions: [
                    {
                        id: 1,
                        question: 'Which group of elements are known as noble gases?',
                        options: ['Group 1', 'Group 2', 'Group 7', 'Group 0'],
                        correctAnswer: 3,
                        points: 15,
                        explanation: 'Noble gases are in Group 0 (or Group 18) of the periodic table.'
                    },
                    {
                        id: 2,
                        question: 'What is the trend in atomic radius across a period?',
                        options: ['Increases', 'Decreases', 'Stays the same', 'Increases then decreases'],
                        correctAnswer: 1,
                        points: 20,
                        explanation: 'Atomic radius decreases across a period due to increasing nuclear charge.'
                    }
                ]
            },
            {
                code: '334151',
                title: 'Static Electricity (Conceptual)',
                subject: 'Pure Physics',
                level: 'Upper Secondary',
                topic: 'Chapter 15: Static Electricity',
                difficulty: 'Intermediate',
                author: 'Physics Department',
                created: '2024-01-19',
                description: 'Conceptual questions on static electricity covering charges, fields, and applications.',
                questions: [
                    {
                        id: 1,
                        question: 'What is the SI unit for measuring electric charge?',
                        options: ['Coulomb', 'Newton', 'Joule', 'Watt'],
                        correctAnswer: 0,
                        points: 10,
                        explanation: 'The coulomb (C) is the SI unit of electric charge.'
                    },
                    {
                        id: 2,
                        question: 'When a plastic rod is rubbed with wool, the plastic becomes negatively charged. What has been transferred?',
                        options: [
                            'Electrons from wool to plastic',
                            'Protons from plastic to wool',
                            'Electrons from plastic to wool',
                            'Protons from wool to plastic'
                        ],
                        correctAnswer: 0,
                        points: 10,
                        explanation: 'Electrons are transferred from the wool to the plastic rod.'
                    }
                ]
            }
        ];
        
        // Add to worksheets map
        sampleWorksheets.forEach(ws => {
            this.worksheets.set(ws.code, ws);
        });
        
        // Update UI
        this.updateWorksheetsList();
        this.updateStats();
        
        this.showFeedback(`Loaded ${sampleWorksheets.length} sample worksheets`, 'success');
    }
    
    loadSampleForCode(code, meaning) {
        // Create sample worksheet for the code
        const sampleWorksheet = {
            code: code,
            title: `${meaning.subject.name} - Chapter ${meaning.chapter}`,
            subject: meaning.subject.name,
            level: meaning.level.name,
            topic: `Chapter ${meaning.chapter}: Sample Topic`,
            difficulty: 'Intermediate',
            author: 'Sample Author',
            created: new Date().toISOString().split('T')[0],
            description: `Sample worksheet for ${meaning.subject.name}, Chapter ${meaning.chapter}.`,
            questions: [
                {
                    id: 1,
                    question: `Sample question about ${meaning.subject.name} Chapter ${meaning.chapter}`,
                    options: ['Option A', 'Option B', 'Option C', 'Option D'],
                    correctAnswer: 0,
                    points: 10,
                    explanation: 'This is a sample explanation.'
                },
                {
                    id: 2,
                    question: 'Another sample question',
                    options: ['Choice 1', 'Choice 2', 'Choice 3', 'Choice 4'],
                    correctAnswer: 1,
                    points: 15,
                    explanation: 'Sample explanation for question 2.'
                }
            ]
        };
        
        // Add to worksheets and activate
        this.worksheets.set(code, sampleWorksheet);
        this.currentWorksheet = sampleWorksheet;
        this.activateExistingWorksheet(code, meaning);
        
        this.showFeedback('Loaded sample data for this code', 'success');
    }
    
    downloadTemplate(code, meaning) {
        const template = {
            code: code,
            title: `${meaning.subject.name} - Chapter ${meaning.chapter}`,
            subject: meaning.subject.name,
            level: meaning.level.name,
            topic: `Chapter ${meaning.chapter}: [Topic Name]`,
            difficulty: "Intermediate",
            author: "[Your Name]",
            created: new Date().toISOString().split('T')[0],
            description: "[Worksheet description]",
            questions: [
                {
                    id: 1,
                    question: "[Question text here]",
                    options: ["Option A", "Option B", "Option C", "Option D"],
                    correctAnswer: 0,
                    points: 10,
                    explanation: "[Explanation for correct answer]"
                }
            ]
        };
        
        const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${code}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showFeedback(`Template ${code}.json downloaded`, 'success');
    }
    
    updateWorksheetsList() {
        const worksheetsGrid = document.getElementById('worksheets-list');
        const availableCount = document.getElementById('available-count');
        
        if (this.worksheets.size === 0) {
            worksheetsGrid.innerHTML = `
                <div class="no-worksheets">
                    <div class="no-worksheets-icon">📁</div>
                    <h4>No Worksheets Found</h4>
                    <p>Enter a code or scan for files</p>
                </div>
            `;
            availableCount.textContent = '0';
            return;
        }
        
        // Clear and add worksheets
        worksheetsGrid.innerHTML = '';
        let count = 0;
        
        this.worksheets.forEach((worksheet, code) => {
            const meaning = this.getCodeMeaning(code);
            if (!meaning) return;
            
            const card = document.createElement('div');
            card.className = `worksheet-card ${this.currentWorksheet?.code === code ? 'active' : ''}`;
            card.dataset.code = code;
            
            card.innerHTML = `
                <div class="worksheet-code">${code}</div>
                <div class="worksheet-header">
                    <div class="worksheet-title">${meaning.subject.icon} ${worksheet.title}</div>
                    <div class="worksheet-difficulty difficulty-${worksheet.difficulty.toLowerCase()}">
                        ${worksheet.difficulty}
                    </div>
                </div>
                <div class="worksheet-meta">
                    <span><i class="fas fa-graduation-cap"></i> ${worksheet.level}</span>
                    <span><i class="fas fa-atom"></i> ${worksheet.subject}</span>
                    <span><i class="fas fa-question-circle"></i> ${worksheet.questions.length} questions</span>
                </div>
                <div class="worksheet-description">${worksheet.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.loadQuickCode(code);
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
    
    // GAME LOGIC METHODS (same as before, but updated for code system)
    
    startGame() {
        if (!this.currentWorksheet || this.coins < this.currentBet) {
            this.showFeedback("Not enough coins!", "error");
            return;
        }
        
        // Deduct bet
        this.coins -= this.currentBet;
        this.isGameActive = true;
        
        // Update UI
        document.getElementById('bet-btn').disabled = true;
        document.getElementById('hint-btn').disabled = false;
        document.getElementById('skip-btn').disabled = false;
        document.getElementById('next-btn').disabled = true;
        
        // Load first question
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
        
        // Update question display
        document.getElementById('question-number').textContent = `Q${this.currentQuestionIndex + 1}`;
        document.getElementById('question-points').innerHTML = `
            <i class="fas fa-star"></i>
            <span>${question.points} POINTS</span>
        `;
        
        document.getElementById('question-content').innerHTML = `
            <div class="question-text">${question.question}</div>
        `;
        
        // Update options
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
        
        // Update progress
        this.updateProgress();
    }
    
    checkAnswer(selectedIndex) {
        if (!this.isGameActive) return;
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Disable all options
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.add('disabled');
        });
        
        // Highlight answers
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach((card, index) => {
            if (index === question.correctAnswer) {
                card.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                card.classList.add('wrong');
            }
        });
        
        // Handle result
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
            this.activateWorksheet(); // Reactivate current worksheet
        });
        
        document.getElementById('options-grid').innerHTML = '';
        document.getElementById('bet-btn').disabled = false;
    }
    
    updateUI() {
        // Update coins
        document.getElementById('coins').textContent = this.formatNumber(this.coins);
        
        // Update multiplier
        document.getElementById('multiplier').textContent = `${this.multiplier.toFixed(1)}x`;
        document.getElementById('multiplier-fill').style.width = `${((this.multiplier - 1) / 2) * 100}%`;
        
        // Update streak and score
        document.getElementById('streak').textContent = this.winStreak;
        document.getElementById('score').textContent = this.score;
        
        // Update button states
        document.getElementById('hint-btn').disabled = !this.isGameActive || this.coins < 50;
        document.getElementById('skip-btn').disabled = !this.isGameActive || this.coins < 25;
        
        // Update bet slider
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

// Add additional styles
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .worksheet-create-info, .worksheet-active-info {
        padding: 15px;
    }
    
    .create-header, .active-header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 20px;
    }
    
    .create-icon, .active-icon {
        width: 60px;
        height: 60px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        flex-shrink: 0;
    }
    
    .create-details h3, .active-details h3 {
        font-size: 1.3rem;
        margin-bottom: 5px;
        color: var(--text-primary);
    }
    
    .create-details p, .active-details p {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .code-breakdown-details {
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        padding: 15px;
        margin-bottom: 20px;
    }
    
    .breakdown-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px dashed var(--border-color);
    }
    
    .breakdown-item:last-child {
        border-bottom: none;
    }
    
    .breakdown-label {
        color: var(--text-secondary);
        font-weight: 500;
    }
    
    .breakdown-value {
        color: var(--text-primary);
        font-weight: 600;
        text-align: right;
    }
    
    .file-creation-guide {
        background: rgba(0, 0, 0, 0.2);
        border-radius: var(--radius-md);
        padding: 15px;
        margin-bottom: 20px;
        border: 1px solid var(--border-color);
    }
    
    .file-creation-guide h4 {
        color: var(--text-primary);
        margin-bottom: 10px;
        font-size: 1rem;
    }
    
    .file-path {
        background: rgba(0, 0, 0, 0.3);
        padding: 10px;
        border-radius: var(--radius-sm);
        margin-bottom: 15px;
        font-family: monospace;
        font-size: 0.9rem;
        color: var(--primary-color);
        word-break: break-all;
    }
    
    .json-template pre {
        background: rgba(0, 0, 0, 0.3);
        padding: 15px;
        border-radius: var(--radius-sm);
        overflow-x: auto;
        font-family: monospace;
        font-size: 0.8rem;
        color: var(--text-secondary);
        line-height: 1.4;
        margin: 0;
    }
    
    .create-actions {
        display: flex;
        gap: 10px;
    }
    
    .create-btn {
        flex: 1;
        padding: 12px;
        border: none;
        border-radius: var(--radius-md);
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
    }
    
    .create-btn:first-child {
        background: var(--gradient-primary);
        color: white;
    }
    
    .create-btn.secondary {
        background: rgba(255, 255, 255, 0.1);
        color: var(--text-primary);
        border: 1px solid var(--border-color);
    }
    
    .create-btn:hover {
        transform: translateY(-3px);
    }
    
    .worksheet-meta-info {
        display: flex;
        gap: 15px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }
    
    .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 15px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: var(--radius-md);
        border: 1px solid var(--border-color);
    }
    
    .meta-item i {
        color: var(--primary-color);
    }
    
    .meta-item span {
        color: var(--text-secondary);
        font-size: 0.9rem;
    }
    
    .worksheet-description-box {
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        padding: 15px;
        margin-bottom: 20px;
        border: 1px solid var(--border-color);
    }
    
    .worksheet-description-box p {
        color: var(--text-secondary);
        line-height: 1.5;
        margin: 0;
    }
    
    .worksheet-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
    }
    
    .stat-box {
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        padding: 15px;
        text-align: center;
        border: 1px solid var(--border-color);
    }
    
    .stat-number {
        font-size: 1.2rem;
        font-weight: 700;
        color: var(--text-primary);
        margin-bottom: 5px;
    }
    
    .stat-label {
        font-size: 0.7rem;
        color: var(--text-secondary);
        text-transform: uppercase;
        letter-spacing: 1px;
    }
    
    .game-results {
        text-align: center;
        padding: 20px;
    }
    
    .result-header {
        margin-bottom: 25px;
    }
    
    .result-icon {
        font-size: 3rem;
        margin-bottom: 10px;
    }
    
    .result-header h3 {
        font-size: 1.5rem;
        color: var(--text-primary);
        margin-bottom: 5px;
    }
    
    .result-stats {
        background: rgba(255, 255, 255, 0.03);
        border-radius: var(--radius-md);
        padding: 20px;
        margin-bottom: 25px;
        border: 1px solid var(--border-color);
    }
    
    .stat-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--border-color);
    }
    
    .stat-row:last-child {
        border-bottom: none;
    }
    
    .coins-won {
        color: #FBBD23 !important;
    }
    
    .result-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    
    .play-again-btn {
        padding: 15px 30px;
        background: var(--gradient-primary);
        color: white;
        border: none;
        border-radius: var(--radius-md);
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        transition: all 0.3s ease;
    }
    
    .play-again-btn:hover {
        transform: translateY(-3px);
    }
`;
document.head.appendChild(additionalStyles);