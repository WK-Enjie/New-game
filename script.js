class WorksheetQuizGame {
    constructor() {
        console.log('🎮 Initializing Worksheet Quiz Game...');
        
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
        
        // Code input
        this.codeDigits = ['', '', '', '', '', ''];
        this.digitInputs = [];
        
        // Code definitions
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
        console.log('⚙️ Setting up game...');
        this.setupElements();
        this.setupEventListeners();
        this.loadFromLocalStorage();
        this.updateUI();
        console.log('✅ Game initialized successfully');
    }
    
    setupElements() {
        console.log('🔧 Setting up DOM elements...');
        
        // Get digit inputs
        this.digitInputs = [];
        for (let i = 0; i < 6; i++) {
            const input = document.getElementById(`digit-${i}`);
            if (input) {
                this.digitInputs.push(input);
                console.log(`✅ Found digit input ${i}`);
            } else {
                console.error(`❌ Missing digit input ${i}`);
            }
        }
        
        // Cache DOM elements
        this.elements = {
            fullCode: document.getElementById('full-code'),
            activateBtn: document.getElementById('activate-btn'),
            currentCode: document.getElementById('current-code'),
            worksheetTitle: document.getElementById('worksheet-title'),
            worksheetStatus: document.getElementById('worksheet-status'),
            worksheetDetails: document.getElementById('worksheet-details'),
            startBtn: document.getElementById('start-btn'),
            hintBtn: document.getElementById('hint-btn'),
            skipBtn: document.getElementById('skip-btn'),
            nextBtn: document.getElementById('next-btn'),
            coins: document.getElementById('coins'),
            multiplier: document.getElementById('multiplier'),
            streak: document.getElementById('streak'),
            score: document.getElementById('score'),
            questionNumber: document.getElementById('question-number'),
            questionPoints: document.getElementById('question-points'),
            questionContent: document.getElementById('question-content'),
            optionsGrid: document.getElementById('options-grid'),
            progressFill: document.getElementById('progress-fill'),
            progressText: document.getElementById('progress-text'),
            feedbackMessage: document.getElementById('feedback-message'),
            uploadArea: document.getElementById('upload-area'),
            fileInput: document.getElementById('file-input'),
            betSlider: document.getElementById('bet-slider'),
            betValue: document.getElementById('bet-value'),
            activeCode: document.getElementById('active-code'),
            worksheetCount: document.getElementById('worksheet-count'),
            questionCount: document.getElementById('question-count'),
            loadedFiles: document.getElementById('loaded-files')
        };
        
        // Verify all required elements exist
        let allElementsFound = true;
        for (const [key, element] of Object.entries(this.elements)) {
            if (!element) {
                console.error(`❌ Missing element: ${key}`);
                allElementsFound = false;
            }
        }
        
        if (allElementsFound) {
            console.log('✅ All DOM elements found');
        }
    }
    
    setupEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Digit input handling
        this.digitInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                this.handleDigitInput(e.target.value, index);
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.value && index > 0) {
                    this.focusPreviousDigit(index);
                } else if (e.key.match(/^[0-9]$/) && e.target.value && index < 5) {
                    this.focusNextDigit(index);
                }
            });
        });
        
        // Activate button
        this.elements.activateBtn.addEventListener('click', () => {
            console.log('🚀 Activate button clicked');
            this.activateWorksheet();
        });
        
        // Quick code buttons
        document.querySelectorAll('.quick-code').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const code = e.target.dataset.code;
                console.log(`🔢 Quick code selected: ${code}`);
                this.loadQuickCode(code);
            });
        });
        
        // Upload area
        this.elements.uploadArea.addEventListener('click', () => {
            console.log('📁 Opening file picker...');
            this.elements.fileInput.click();
        });
        
        this.elements.fileInput.addEventListener('change', (e) => {
            console.log('📁 Files selected:', e.target.files.length);
            this.handleFiles(e.target.files);
        });
        
        // Drag and drop
        this.elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            this.elements.uploadArea.style.borderColor = '#4cc9f0';
        });
        
        this.elements.uploadArea.addEventListener('dragleave', () => {
            this.elements.uploadArea.style.borderColor = '#4361ee';
        });
        
        this.elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            this.elements.uploadArea.style.borderColor = '#4361ee';
            console.log('📁 Files dropped:', e.dataTransfer.files.length);
            this.handleFiles(e.dataTransfer.files);
        });
        
        // Game controls
        this.elements.betSlider.addEventListener('input', (e) => {
            this.currentBet = parseInt(e.target.value);
            this.elements.betValue.textContent = this.currentBet;
        });
        
        this.elements.startBtn.addEventListener('click', () => {
            console.log('🎮 Starting game...');
            this.startGame();
        });
        
        this.elements.hintBtn.addEventListener('click', () => {
            console.log('💡 Using hint...');
            this.useHint();
        });
        
        this.elements.skipBtn.addEventListener('click', () => {
            console.log('⏭️ Skipping question...');
            this.skipQuestion();
        });
        
        this.elements.nextBtn.addEventListener('click', () => {
            console.log('➡️ Next question...');
            this.nextQuestion();
        });
        
        // Options grid
        this.elements.optionsGrid.addEventListener('click', (e) => {
            const optionCard = e.target.closest('.option-card');
            if (optionCard && !optionCard.classList.contains('disabled')) {
                const selectedIndex = parseInt(optionCard.dataset.index);
                console.log(`✅ Answer selected: ${selectedIndex}`);
                this.checkAnswer(selectedIndex);
            }
        });
        
        // Footer buttons
        document.getElementById('refresh-btn').addEventListener('click', () => {
            console.log('🔄 Refreshing worksheets...');
            this.loadFromLocalStorage();
            this.showFeedback('Refreshed worksheets from storage', 'info');
        });
        
        document.getElementById('clear-btn').addEventListener('click', () => {
            console.log('🗑️ Clearing all data...');
            if (confirm('Clear all worksheets and reset game?')) {
                localStorage.removeItem('quiz-worksheets');
                this.worksheets.clear();
                this.updateWorksheetsCount();
                this.showFeedback('All data cleared', 'info');
            }
        });
        
        console.log('✅ Event listeners set up');
    }
    
    handleDigitInput(value, index) {
        console.log(`⌨️ Digit ${index} input: "${value}"`);
        
        // Clear previous validation
        this.digitInputs[index].classList.remove('valid', 'invalid');
        
        // If empty, clear and return
        if (value === '') {
            this.codeDigits[index] = '';
            this.updateCodeDisplay();
            return;
        }
        
        // Validate based on position
        const validators = [
            /^[1-3]$/,  // Level
            /^[0-5]$/,  // Subject
            /^[1-6]$/,  // Grade
            /^[0-9]$/,  // Chapter tens
            /^[0-9]$/,  // Chapter ones
            /^[1-9]$/   // Worksheet
        ];
        
        const isValid = validators[index].test(value);
        
        if (isValid) {
            this.codeDigits[index] = value;
            this.digitInputs[index].classList.add('valid');
            
            // Auto-focus next input if not last
            if (index < 5 && value) {
                setTimeout(() => this.focusNextDigit(index), 10);
            }
        } else {
            this.digitInputs[index].classList.add('invalid');
            this.showFeedback(`Invalid digit for position ${index + 1}`, 'error');
            return;
        }
        
        this.updateCodeDisplay();
    }
    
    focusNextDigit(index) {
        if (index < 5) {
            this.digitInputs[index + 1].focus();
            this.digitInputs[index + 1].select();
        }
    }
    
    focusPreviousDigit(index) {
        if (index > 0) {
            this.digitInputs[index - 1].focus();
            this.digitInputs[index - 1].select();
        }
    }
    
    updateCodeDisplay() {
        const fullCode = this.codeDigits.join('');
        console.log(`🔤 Updating code display: ${fullCode}`);
        
        let display = '';
        for (let i = 0; i < 6; i++) {
            display += this.codeDigits[i] ? this.codeDigits[i] + ' ' : '_ ';
        }
        
        this.elements.fullCode.textContent = display.trim();
        
        // Enable/disable activate button
        const isComplete = fullCode.length === 6;
        this.elements.activateBtn.disabled = !isComplete;
        
        // Highlight if complete
        if (isComplete) {
            this.elements.fullCode.classList.add('active');
        } else {
            this.elements.fullCode.classList.remove('active');
        }
    }
    
    loadQuickCode(code) {
        console.log(`⚡ Loading quick code: ${code}`);
        
        const digits = code.split('');
        if (digits.length !== 6) {
            this.showFeedback('Invalid code length', 'error');
            return;
        }
        
        digits.forEach((digit, index) => {
            this.codeDigits[index] = digit;
            this.digitInputs[index].value = digit;
            this.digitInputs[index].classList.add('valid');
        });
        
        this.updateCodeDisplay();
        
        // Auto-activate after delay
        setTimeout(() => {
            if (!this.elements.activateBtn.disabled) {
                console.log('⚡ Auto-activating quick code...');
                this.activateWorksheet();
            }
        }, 300);
    }
    
    async handleFiles(files) {
        const jsonFiles = Array.from(files).filter(file => 
            file.name.toLowerCase().endsWith('.json')
        );
        
        if (jsonFiles.length === 0) {
            this.showFeedback('No JSON files found', 'error');
            return;
        }
        
        console.log(`📁 Processing ${jsonFiles.length} JSON files...`);
        
        let loadedCount = 0;
        let errorCount = 0;
        
        for (const file of jsonFiles) {
            try {
                console.log(`📄 Reading file: ${file.name}`);
                const worksheet = await this.readJSONFile(file);
                
                if (this.validateWorksheet(worksheet)) {
                    this.worksheets.set(worksheet.code, worksheet);
                    loadedCount++;
                    console.log(`✅ Loaded worksheet: ${worksheet.code}`);
                    
                    // Check if this matches current code
                    const currentCode = this.codeDigits.join('');
                    if (currentCode === worksheet.code) {
                        console.log(`🎯 Auto-activating matching code: ${worksheet.code}`);
                        setTimeout(() => this.activateWorksheet(), 100);
                    }
                } else {
                    console.error(`❌ Invalid worksheet: ${file.name}`);
                    errorCount++;
                }
            } catch (error) {
                console.error(`❌ Error loading ${file.name}:`, error);
                errorCount++;
            }
        }
        
        // Save to localStorage
        this.saveToLocalStorage();
        
        // Update UI
        this.updateWorksheetsCount();
        
        if (loadedCount > 0) {
            this.showFeedback(`Loaded ${loadedCount} worksheet${loadedCount !== 1 ? 's' : ''}`, 'success');
        }
        if (errorCount > 0) {
            this.showFeedback(`${errorCount} file${errorCount !== 1 ? 's' : ''} had errors`, 'error');
        }
    }
    
    readJSONFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const worksheet = JSON.parse(e.target.result);
                    resolve(worksheet);
                } catch (error) {
                    reject(new Error('Invalid JSON format'));
                }
            };
            reader.onerror = () => reject(new Error('Error reading file'));
            reader.readAsText(file);
        });
    }
    
    validateWorksheet(worksheet) {
        // Check required fields
        const required = ['code', 'title', 'subject', 'level', 'questions'];
        for (const field of required) {
            if (!worksheet[field]) {
                console.error(`Missing required field: ${field}`);
                return false;
            }
        }
        
        // Validate code format (6 digits)
        if (!/^\d{6}$/.test(worksheet.code)) {
            console.error('Invalid code format. Must be 6 digits.');
            return false;
        }
        
        // Validate questions array
        if (!Array.isArray(worksheet.questions) || worksheet.questions.length === 0) {
            console.error('Questions must be a non-empty array');
            return false;
        }
        
        // Validate each question
        for (const question of worksheet.questions) {
            if (!question.id || !question.question || !question.options || 
                question.correctAnswer === undefined || !question.points) {
                console.error('Invalid question format');
                return false;
            }
            
            if (!Array.isArray(question.options) || question.options.length !== 4) {
                console.error('Question must have exactly 4 options');
                return false;
            }
            
            if (question.correctAnswer < 0 || question.correctAnswer > 3) {
                console.error('Correct answer must be between 0 and 3');
                return false;
            }
        }
        
        return true;
    }
    
    saveToLocalStorage() {
        const obj = Object.fromEntries(this.worksheets);
        localStorage.setItem('quiz-worksheets', JSON.stringify(obj));
        console.log('💾 Saved to localStorage');
    }
    
    loadFromLocalStorage() {
        const stored = localStorage.getItem('quiz-worksheets');
        if (stored) {
            try {
                console.log('💾 Loading from localStorage...');
                const worksheets = JSON.parse(stored);
                this.worksheets.clear();
                
                for (const [code, worksheet] of Object.entries(worksheets)) {
                    this.worksheets.set(code, worksheet);
                }
                
                this.updateWorksheetsCount();
                console.log(`✅ Loaded ${this.worksheets.size} worksheets from storage`);
                return true;
            } catch (error) {
                console.error('Error loading from localStorage:', error);
                return false;
            }
        } else {
            console.log('ℹ️ No stored worksheets found');
            return false;
        }
    }
    
    updateWorksheetsCount() {
        const count = this.worksheets.size;
        
        // Update all count displays
        this.elements.worksheetCount.textContent = count;
        this.elements.activeCode.textContent = this.codeDigits.join('').padEnd(6, '-');
        this.elements.loadedFiles.textContent = `${count} file${count !== 1 ? 's' : ''} loaded`;
        
        // Calculate total questions
        let totalQuestions = 0;
        this.worksheets.forEach(ws => {
            totalQuestions += ws.questions.length;
        });
        this.elements.questionCount.textContent = totalQuestions;
    }
    
    getCodeInfo(code) {
        if (code.length !== 6) return null;
        
        const digits = code.split('');
        const level = this.codeDefinitions.level[digits[0]];
        const subject = this.codeDefinitions.subject[digits[1]];
        const grade = this.codeDefinitions.grade[digits[2]];
        
        if (!level || !subject || !grade) return null;
        
        const chapter = parseInt(digits[3] + digits[4]);
        const worksheet = digits[5];
        
        return {
            level,
            subject,
            grade,
            chapter,
            worksheet,
            folder: `${level.folder}/${subject.folder}`,
            display: `${level.name} • ${subject.name} • ${grade.name} • Chapter ${chapter.toString().padStart(2, '0')} • Worksheet ${worksheet}`
        };
    }
    
    activateWorksheet() {
        const code = this.codeDigits.join('');
        console.log(`🎯 Activating worksheet: ${code}`);
        
        if (code.length !== 6) {
            this.showFeedback('Please enter all 6 digits', 'error');
            return;
        }
        
        const codeInfo = this.getCodeInfo(code);
        if (!codeInfo) {
            this.showFeedback('Invalid code format', 'error');
            return;
        }
        
        // Update UI to show loading
        this.elements.currentCode.textContent = code;
        this.elements.worksheetTitle.textContent = 'Loading...';
        this.elements.worksheetStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> CHECKING';
        
        // Check if worksheet exists
        if (this.worksheets.has(code)) {
            this.currentWorksheet = this.worksheets.get(code);
            console.log(`✅ Worksheet found: ${this.currentWorksheet.title}`);
            this.showWorksheetActive(code, codeInfo);
        } else {
            console.log(`❌ Worksheet not found: ${code}`);
            this.showWorksheetMissing(code, codeInfo);
        }
    }
    
    showWorksheetActive(code, codeInfo) {
        // Reset game state for this worksheet
        this.currentQuestionIndex = 0;
        this.shuffledQuestions = [...this.currentWorksheet.questions].sort(() => Math.random() - 0.5);
        this.score = 0;
        this.winStreak = 0;
        this.multiplier = 1.0;
        this.usedHints.clear();
        this.isGameActive = false;
        
        // Update UI
        this.elements.worksheetTitle.textContent = this.currentWorksheet.title;
        this.elements.worksheetStatus.innerHTML = '<i class="fas fa-check-circle"></i> ACTIVE';
        this.elements.worksheetStatus.className = 'status-badge active';
        
        this.updateWorksheetDetails(codeInfo);
        this.elements.startBtn.disabled = false;
        
        // Show welcome screen
        this.showQuestionScreen();
        
        this.showFeedback(`✅ Worksheet ${code} activated!`, 'success');
    }
    
    showWorksheetMissing(code, codeInfo) {
        this.elements.worksheetTitle.textContent = 'WORKSHEET NOT FOUND';
        this.elements.worksheetStatus.innerHTML = '<i class="fas fa-times-circle"></i> MISSING';
        this.elements.worksheetStatus.className = 'status-badge';
        
        this.elements.worksheetDetails.innerHTML = `
            <div class="worksheet-details">
                <div class="empty-state">
                    <i class="fas fa-file-exclamation empty-icon"></i>
                    <h3>File Not Found</h3>
                    <p>No JSON file found for code: <strong>${code}</strong></p>
                    
                    <div class="folder-structure">
                        <h4>Expected File Location:</h4>
                        <code>Questions/${codeInfo.folder}/${code}.json</code>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 20px; background: rgba(67, 97, 238, 0.05); border-radius: 10px;">
                        <h4 style="margin-bottom: 10px;">File Details:</h4>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; text-align: left; font-size: 0.9rem;">
                            <div><strong>Level:</strong><br>${codeInfo.level.name}</div>
                            <div><strong>Subject:</strong><br>${codeInfo.subject.name}</div>
                            <div><strong>Grade:</strong><br>${codeInfo.grade.name}</div>
                            <div><strong>Chapter:</strong><br>${codeInfo.chapter.toString().padStart(2, '0')}</div>
                            <div><strong>Worksheet:</strong><br>${codeInfo.worksheet}</div>
                            <div><strong>Code:</strong><br>${code}</div>
                        </div>
                    </div>
                    
                    <p style="margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary);">
                        Upload a JSON file with code ${code} or place it in the correct folder.
                    </p>
                </div>
            </div>
        `;
        
        this.elements.startBtn.disabled = true;
        this.showFeedback(`Worksheet ${code} not found. Upload JSON file.`, 'error');
    }
    
    updateWorksheetDetails(codeInfo) {
        if (!this.currentWorksheet) return;
        
        this.elements.worksheetDetails.innerHTML = `
            <div class="worksheet-details">
                <div style="margin-bottom: 20px;">
                    <h3 style="color: var(--text-primary); margin-bottom: 10px;">${this.currentWorksheet.title}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${this.currentWorksheet.topic || 'No topic specified'}</p>
                </div>
                
                <div style="display: flex; gap: 15px; margin-bottom: 20px; flex-wrap: wrap;">
                    <div style="background: rgba(76, 201, 240, 0.1); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--success);">
                        <div style="font-size: 0.8rem; color: var(--success); margin-bottom: 5px;">DIFFICULTY</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.currentWorksheet.difficulty || 'Intermediate'}</div>
                    </div>
                    <div style="background: rgba(248, 150, 30, 0.1); padding: 10px 15px; border-radius: 8px; border: 1px solid #f8961e;">
                        <div style="font-size: 0.8rem; color: #f8961e; margin-bottom: 5px;">QUESTIONS</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.currentWorksheet.questions.length}</div>
                    </div>
                    <div style="background: rgba(67, 97, 238, 0.1); padding: 10px 15px; border-radius: 8px; border: 1px solid var(--primary);">
                        <div style="font-size: 0.8rem; color: var(--primary); margin-bottom: 5px;">TOTAL POINTS</div>
                        <div style="font-weight: 600; color: var(--text-primary);">${this.currentWorksheet.questions.reduce((sum, q) => sum + q.points, 0)}</div>
                    </div>
                </div>
                
                <div style="background: rgba(0, 0, 0, 0.2); padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">DESCRIPTION</div>
                    <div style="color: var(--text-primary); line-height: 1.5;">${this.currentWorksheet.description || 'No description provided.'}</div>
                </div>
                
                <div style="background: rgba(67, 97, 238, 0.05); padding: 15px; border-radius: 8px; border: 1px solid var(--border);">
                    <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">FILE INFO</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Author</div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.currentWorksheet.author || 'Unknown'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Created</div>
                            <div style="font-weight: 600; color: var(--text-primary);">${this.currentWorksheet.created || 'Unknown date'}</div>
                        </div>
                        <div>
                            <div style="font-size: 0.8rem; color: var(--text-secondary);">Source</div>
                            <div style="font-weight: 600; color: var(--text-primary);">Questions/${codeInfo.folder}/${this.currentWorksheet.code}.json</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showQuestionScreen() {
        if (!this.currentWorksheet) return;
        
        this.elements.questionContent.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">📚</div>
                <h2>${this.currentWorksheet.title}</h2>
                <p>Ready to play? Place your bet and start!</p>
                <div style="margin-top: 20px; font-size: 0.9rem; color: var(--text-secondary);">
                    <i class="fas fa-info-circle"></i> ${this.currentWorksheet.questions.length} questions • 
                    ${this.currentWorksheet.questions.reduce((sum, q) => sum + q.points, 0)} total points
                </div>
            </div>
        `;
        
        this.elements.optionsGrid.innerHTML = '';
        this.elements.questionNumber.textContent = '--';
        this.elements.questionPoints.textContent = '-- POINTS';
        this.elements.progressFill.style.width = '0%';
        this.elements.progressText.textContent = '0/0';
    }
    
    startGame() {
        if (!this.currentWorksheet || this.coins < this.currentBet) {
            this.showFeedback('Not enough coins!', 'error');
            return;
        }
        
        console.log('🎮 Starting game with bet:', this.currentBet);
        
        // Deduct bet
        this.coins -= this.currentBet;
        this.isGameActive = true;
        
        // Update buttons
        this.elements.startBtn.disabled = true;
        this.elements.hintBtn.disabled = false;
        this.elements.skipBtn.disabled = false;
        this.elements.nextBtn.disabled = true;
        
        // Load first question
        this.loadQuestion();
        this.updateUI();
        
        this.showFeedback('Game started! Good luck!', 'success');
    }
    
    loadQuestion() {
        if (!this.isGameActive || this.currentQuestionIndex >= this.shuffledQuestions.length) {
            this.endGame();
            return;
        }
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        console.log(`❓ Loading question ${this.currentQuestionIndex + 1}/${this.shuffledQuestions.length}`);
        
        // Update question display
        this.elements.questionNumber.textContent = `Q${this.currentQuestionIndex + 1}`;
        this.elements.questionPoints.textContent = `${question.points} POINTS`;
        
        this.elements.questionContent.innerHTML = `
            <div class="question-text">${question.question}</div>
        `;
        
        // Update options
        this.elements.optionsGrid.innerHTML = '';
        const optionLabels = ['A', 'B', 'C', 'D'];
        
        question.options.forEach((option, index) => {
            const optionCard = document.createElement('div');
            optionCard.className = 'option-card';
            optionCard.dataset.index = index;
            optionCard.innerHTML = `
                <div class="option-label">${optionLabels[index]}</div>
                <div class="option-text">${option}</div>
            `;
            this.elements.optionsGrid.appendChild(optionCard);
        });
        
        // Update progress
        this.updateProgress();
    }
    
    updateProgress() {
        const total = this.shuffledQuestions.length;
        const current = this.currentQuestionIndex + 1;
        const progress = (current / total) * 100;
        
        this.elements.progressFill.style.width = `${progress}%`;
        this.elements.progressText.textContent = `${current}/${total}`;
    }
    
    checkAnswer(selectedIndex) {
        if (!this.isGameActive) return;
        
        const question = this.shuffledQuestions[this.currentQuestionIndex];
        const isCorrect = selectedIndex === question.correctAnswer;
        console.log(`✅ Answer ${selectedIndex} is ${isCorrect ? 'correct' : 'wrong'}`);
        
        // Disable all options
        document.querySelectorAll('.option-card').forEach(card => {
            card.classList.add('disabled');
        });
        
        // Highlight correct/wrong answers
        document.querySelectorAll('.option-card').forEach((card, index) => {
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
        
        this.elements.nextBtn.disabled = false;
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
            `Correct! +${pointsWon} points (+${coinsWon} coins)`,
            'success'
        );
    }
    
    handleWrongAnswer(question) {
        this.winStreak = 0;
        this.multiplier = Math.max(this.multiplier - 0.5, 1.0);
        
        const correctAnswer = question.options[question.correctAnswer];
        this.showFeedback(
            `Wrong! Correct answer: ${correctAnswer}`,
            'error'
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
        this.elements.hintBtn.disabled = true;
        
        this.showFeedback('Hint used! -50 coins', 'info');
        this.updateUI();
    }
    
    skipQuestion() {
        if (!this.isGameActive || this.coins < 25) {
            return;
        }
        
        this.coins -= 25;
        this.currentQuestionIndex++;
        this.loadQuestion();
        
        this.showFeedback('Question skipped! -25 coins', 'info');
        this.updateUI();
    }
    
    nextQuestion() {
        this.currentQuestionIndex++;
        this.elements.hintBtn.disabled = false;
        this.elements.nextBtn.disabled = true;
        this.loadQuestion();
    }
    
    endGame() {
        this.isGameActive = false;
        
        const totalPoints = this.shuffledQuestions.reduce((sum, q) => sum + q.points, 0);
        const accuracy = (this.score / totalPoints) * 100;
        
        console.log(`🎮 Game ended. Score: ${this.score}/${totalPoints} (${accuracy.toFixed(1)}%)`);
        
        this.elements.questionContent.innerHTML = `
            <div class="welcome-screen">
                <div class="welcome-icon">${accuracy >= 80 ? '🏆' : accuracy >= 60 ? '⭐' : '💪'}</div>
                <h2>${accuracy >= 80 ? 'EXCELLENT!' : accuracy >= 60 ? 'GOOD JOB!' : 'KEEP PRACTICING!'}</h2>
                <p>Game Complete!</p>
                
                <div style="margin-top: 30px; background: rgba(0, 0, 0, 0.2); padding: 20px; border-radius: 10px; max-width: 400px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; text-align: left;">
                        <div>Final Score:</div>
                        <div style="font-weight: 600; color: var(--primary);">${this.score}/${totalPoints}</div>
                        
                        <div>Accuracy:</div>
                        <div style="font-weight: 600; color: var(--success);">${accuracy.toFixed(1)}%</div>
                        
                        <div>Highest Streak:</div>
                        <div style="font-weight: 600; color: var(--danger);">${this.winStreak}</div>
                        
                        <div>Coins Won:</div>
                        <div style="font-weight: 600; color: #f8961e;">+${this.coins - 1000}</div>
                    </div>
                </div>
                
                <button id="play-again-btn" style="margin-top: 30px; padding: 12px 30px; background: var(--primary); color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;">
                    <i class="fas fa-redo"></i> PLAY AGAIN
                </button>
            </div>
        `;
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            console.log('🔄 Playing again...');
            this.activateWorksheet();
        });
        
        this.elements.optionsGrid.innerHTML = '';
        this.elements.startBtn.disabled = false;
    }
    
    updateUI() {
        // Update stats
        this.elements.coins.textContent = this.coins.toLocaleString();
        this.elements.multiplier.textContent = `${this.multiplier.toFixed(1)}x`;
        this.elements.streak.textContent = this.winStreak;
        this.elements.score.textContent = this.score;
        
        // Update button states
        this.elements.hintBtn.disabled = !this.isGameActive || this.coins < 50;
        this.elements.skipBtn.disabled = !this.isGameActive || this.coins < 25;
        
        // Update bet slider
        const maxBet = Math.min(500, this.coins);
        this.elements.betSlider.max = maxBet;
        if (this.currentBet > maxBet) {
            this.currentBet = maxBet;
            this.elements.betSlider.value = maxBet;
            this.elements.betValue.textContent = maxBet;
        }
    }
    
    showFeedback(message, type) {
        console.log(`💬 Feedback (${type}): ${message}`);
        
        this.elements.feedbackMessage.innerHTML = message;
        this.elements.feedbackMessage.className = `feedback-message show feedback-${type}`;
        
        setTimeout(() => {
            this.elements.feedbackMessage.className = 'feedback-message';
        }, 3000);
    }
}

// Initialize game when page loads
window.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM loaded, initializing game...');
    window.game = new WorksheetQuizGame();
    console.log('🎉 Game ready!');
});