// 洋流大冒险游戏逻辑
class OceanCurrentsGame {
    constructor() {
        this.canvas = document.getElementById('ocean-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 游戏状态
        this.currentLevel = 1;
        this.totalScore = 0;
        this.gemsCount = 0;
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.comboCount = 0;
        this.timeLeft = 15;
        this.timer = null;
        
        // 关卡进度
        this.levelProgress = {
            1: { unlocked: true, stars: 0, bestScore: 0, completed: false },
            2: { unlocked: false, stars: 0, bestScore: 0, completed: false },
            3: { unlocked: false, stars: 0, bestScore: 0, completed: false },
            4: { unlocked: false, stars: 0, bestScore: 0, completed: false },
            5: { unlocked: false, stars: 0, bestScore: 0, completed: false }
        };
        
        // 知识卡片解锁状态
        this.unlockedKnowledge = [];
        
        // 小船位置
        this.boat = {
            x: 100,
            y: 300,
            width: 40,
            height: 30,
            speed: 3,
            targetX: 100,
            targetY: 300
        };
        
        // 洋流效果
        this.currents = [];
        this.islands = [];
        
        // 加载保存的进度
        this.loadProgress();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateLevelCards();
        this.renderKnowledgeCards();
    }
    
    setupEventListeners() {
        // 返回主页
        document.getElementById('back-home').addEventListener('click', () => {
            window.location.href = 'index.html';
        });
        
        // 关卡卡片点击
        document.querySelectorAll('.level-card').forEach(card => {
            card.addEventListener('click', () => {
                const level = parseInt(card.dataset.level);
                if (this.levelProgress[level].unlocked) {
                    this.startLevel(level);
                }
            });
        });
        
        // 查看知识卡片
        document.getElementById('view-knowledge-btn').addEventListener('click', () => {
            this.showKnowledgeScreen();
        });
        
        document.getElementById('close-knowledge-btn').addEventListener('click', () => {
            this.hideKnowledgeScreen();
        });
        
        // 选项按钮
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.checkAnswer(e.target.dataset.answer);
            });
        });
        
        // 关卡完成按钮
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.nextLevel();
        });
        
        document.getElementById('retry-level-btn').addEventListener('click', () => {
            this.startLevel(this.currentLevel);
        });
        
        document.getElementById('back-to-select-btn').addEventListener('click', () => {
            this.showLevelSelect();
        });
    }
    
    startLevel(level) {
        this.currentLevel = level;
        this.currentQuestionIndex = 0;
        this.correctAnswers = 0;
        this.comboCount = 0;
        
        // 获取当前关卡的题目
        this.currentQuestions = this.getLevelQuestions(level);
        
        // 隐藏关卡选择，显示游戏界面
        document.getElementById('level-select-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        
        // 更新HUD
        document.getElementById('current-level').textContent = level;
        document.getElementById('total-questions').textContent = this.currentQuestions.length;
        
        // 初始化游戏场景
        this.initGameScene();
        
        // 开始第一题
        this.showNextQuestion();
    }
    
    initGameScene() {
        // 清空并重新生成洋流和岛屿
        this.currents = [];
        this.islands = [];
        
        // 根据关卡生成不同的场景
        const scenarioCount = 5 + this.currentLevel * 2;
        
        for (let i = 0; i < scenarioCount; i++) {
            // 生成洋流
            this.currents.push({
                x: 150 + i * 120,
                y: 200 + Math.sin(i) * 100,
                width: 80,
                height: 200,
                type: Math.random() > 0.5 ? 'warm' : 'cold',
                flow: Math.random() > 0.5 ? 'up' : 'down'
            });
            
            // 生成知识岛屿
            if (i < this.currentQuestions.length) {
                this.islands.push({
                    x: 200 + i * 120,
                    y: 250,
                    width: 50,
                    height: 50,
                    questionIndex: i,
                    completed: false
                });
            }
        }
        
        // 重置小船位置
        this.boat.x = 50;
        this.boat.y = 300;
        this.boat.targetX = 50;
        this.boat.targetY = 300;
        
        // 开始渲染循环
        this.gameLoop();
    }
    
    gameLoop() {
        if (!document.getElementById('game-screen').classList.contains('hidden')) {
            this.updateBoat();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
    
    updateBoat() {
        // 平滑移动小船
        const dx = this.boat.targetX - this.boat.x;
        const dy = this.boat.targetY - this.boat.y;
        
        if (Math.abs(dx) > 1) {
            this.boat.x += dx * 0.1;
        }
        if (Math.abs(dy) > 1) {
            this.boat.y += dy * 0.1;
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制海浪背景
        this.drawWaves();
        
        // 绘制洋流
        this.currents.forEach(current => this.drawCurrent(current));
        
        // 绘制岛屿
        this.islands.forEach(island => this.drawIsland(island));
        
        // 绘制小船
        this.drawBoat();
    }
    
    drawWaves() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            for (let x = 0; x < this.canvas.width; x += 20) {
                const wave = Math.sin((x + Date.now() * 0.001) * 0.05) * 5;
                this.ctx.lineTo(x, y + wave);
            }
            this.ctx.stroke();
        }
    }
    
    drawCurrent(current) {
        // 暖流用红色，寒流用蓝色
        const color = current.type === 'warm' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)';
        this.ctx.fillStyle = color;
        this.ctx.fillRect(current.x, current.y, current.width, current.height);
        
        // 绘制流动箭头
        this.ctx.fillStyle = current.type === 'warm' ? '#ef4444' : '#3b82f6';
        const arrowY = current.flow === 'up' ? current.y + 20 : current.y + current.height - 40;
        this.ctx.beginPath();
        this.ctx.moveTo(current.x + current.width / 2, arrowY);
        this.ctx.lineTo(current.x + current.width / 2 - 10, arrowY + (current.flow === 'up' ? 20 : -20));
        this.ctx.lineTo(current.x + current.width / 2 + 10, arrowY + (current.flow === 'up' ? 20 : -20));
        this.ctx.fill();
    }
    
    drawIsland(island) {
        const color = island.completed ? '#10b981' : '#f59e0b';
        
        // 岛屿主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(island.x, island.y, island.width, island.height);
        
        // 岛屿边框
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(island.x, island.y, island.width, island.height);
        
        // 问号或对勾
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        const symbol = island.completed ? '✓' : '?';
        this.ctx.fillText(symbol, island.x + island.width / 2, island.y + island.height / 2);
    }
    
    drawBoat() {
        const x = this.boat.x;
        const y = this.boat.y;
        
        // 船体
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(x, y + 10, this.boat.width, 15);
        
        // 船帆
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 20, y);
        this.ctx.lineTo(x + 20, y + 25);
        this.ctx.lineTo(x + 35, y + 12);
        this.ctx.fill();
        
        // 桅杆
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 20, y);
        this.ctx.lineTo(x + 20, y + 25);
        this.ctx.stroke();
    }
    
    showNextQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.completeLevel();
            return;
        }
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // 移动小船到对应岛屿
        const island = this.islands[this.currentQuestionIndex];
        if (island) {
            this.boat.targetX = island.x + 10;
            this.boat.targetY = island.y + 60;
        }
        
        // 延迟显示问题面板
        setTimeout(() => {
            this.displayQuestion(question);
        }, 800);
    }
    
    displayQuestion(question) {
        document.getElementById('question-text').textContent = question.question;
        document.getElementById('question-num').textContent = this.currentQuestionIndex + 1;
        
        const optionBtns = document.querySelectorAll('.option-btn');
        optionBtns.forEach((btn, index) => {
            btn.textContent = question.options[index];
            btn.disabled = false;
            btn.classList.remove('correct', 'wrong');
        });
        
        document.getElementById('question-panel').classList.remove('hidden');
        
        // 开始计时
        this.timeLeft = 15;
        this.updateTimer();
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            if (this.timeLeft <= 0) {
                this.timeOut();
            }
        }, 1000);
    }
    
    updateTimer() {
        document.getElementById('time-left').textContent = this.timeLeft;
    }
    
    checkAnswer(answer) {
        clearInterval(this.timer);
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        const optionBtns = document.querySelectorAll('.option-btn');
        
        optionBtns.forEach(btn => btn.disabled = true);
        
        if (answer === question.correct) {
            // 答对了
            this.correctAnswers++;
            this.comboCount++;
            
            // 计算得分
            const baseScore = 100;
            const timeBonus = this.timeLeft * 5;
            const comboBonus = this.comboCount * 10;
            const score = baseScore + timeBonus + comboBonus;
            this.totalScore += score;
            
            // 标记正确答案
            optionBtns.forEach(btn => {
                if (btn.dataset.answer === question.correct) {
                    btn.classList.add('correct');
                }
            });
            
            // 标记岛屿完成
            if (this.islands[this.currentQuestionIndex]) {
                this.islands[this.currentQuestionIndex].completed = true;
            }
            
            // 获得宝石
            this.gemsCount++;
            this.updateHUD();
            
        } else {
            // 答错了
            this.comboCount = 0;
            
            // 标记错误和正确答案
            optionBtns.forEach(btn => {
                if (btn.dataset.answer === answer) {
                    btn.classList.add('wrong');
                }
                if (btn.dataset.answer === question.correct) {
                    btn.classList.add('correct');
                }
            });
        }
        
        // 更新连对数
        document.getElementById('combo-count').textContent = this.comboCount;
        
        // 延迟进入下一题
        setTimeout(() => {
            document.getElementById('question-panel').classList.add('hidden');
            this.currentQuestionIndex++;
            this.showNextQuestion();
        }, 2000);
    }
    
    timeOut() {
        clearInterval(this.timer);
        this.comboCount = 0;
        
        const question = this.currentQuestions[this.currentQuestionIndex];
        const optionBtns = document.querySelectorAll('.option-btn');
        
        optionBtns.forEach(btn => {
            btn.disabled = true;
            if (btn.dataset.answer === question.correct) {
                btn.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            document.getElementById('question-panel').classList.add('hidden');
            this.currentQuestionIndex++;
            this.showNextQuestion();
        }, 2000);
    }
    
    updateHUD() {
        document.getElementById('total-score').textContent = this.totalScore;
        document.getElementById('gems-count').textContent = this.gemsCount;
    }
    
    completeLevel() {
        const totalQuestions = this.currentQuestions.length;
        const accuracy = Math.round((this.correctAnswers / totalQuestions) * 100);
        const levelScore = this.totalScore;
        
        // 计算星级
        let stars = 0;
        if (accuracy >= 90) stars = 3;
        else if (accuracy >= 70) stars = 2;
        else if (accuracy >= 50) stars = 1;
        
        // 更新关卡进度
        this.levelProgress[this.currentLevel].completed = true;
        this.levelProgress[this.currentLevel].stars = Math.max(this.levelProgress[this.currentLevel].stars, stars);
        this.levelProgress[this.currentLevel].bestScore = Math.max(this.levelProgress[this.currentLevel].bestScore, levelScore);
        
        // 解锁下一关
        if (this.currentLevel < 5) {
            this.levelProgress[this.currentLevel + 1].unlocked = true;
        }
        
        // 解锁知识卡片
        const knowledgeId = `level${this.currentLevel}`;
        if (!this.unlockedKnowledge.includes(knowledgeId)) {
            this.unlockedKnowledge.push(knowledgeId);
        }
        
        // 保存进度
        this.saveProgress();
        
        // 显示完成界面
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('level-complete-screen').classList.remove('hidden');
        
        document.getElementById('accuracy-rate').textContent = accuracy + '%';
        document.getElementById('level-score').textContent = levelScore;
        document.getElementById('earned-gems').textContent = this.correctAnswers;
        
        let starsHTML = '';
        for (let i = 0; i < 3; i++) {
            starsHTML += i < stars ? '⭐' : '☆';
        }
        document.getElementById('stars-earned').textContent = starsHTML;
        
        // 更新下一关按钮
        const nextBtn = document.getElementById('next-level-btn');
        if (this.currentLevel >= 5) {
            nextBtn.textContent = '返回选关';
            nextBtn.onclick = () => this.showLevelSelect();
        }
    }
    
    nextLevel() {
        if (this.currentLevel < 5) {
            this.startLevel(this.currentLevel + 1);
        } else {
            this.showLevelSelect();
        }
    }
    
    showLevelSelect() {
        document.getElementById('level-complete-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('level-select-screen').classList.remove('hidden');
        this.updateLevelCards();
    }
    
    updateLevelCards() {
        document.querySelectorAll('.level-card').forEach(card => {
            const level = parseInt(card.dataset.level);
            const progress = this.levelProgress[level];
            
            if (progress.unlocked) {
                card.classList.remove('locked');
                const starsSpan = card.querySelector('.stars');
                const bestScoreSpan = card.querySelector('.best-score');
                
                if (starsSpan) {
                    let starsHTML = '';
                    for (let i = 0; i < 3; i++) {
                        starsHTML += i < progress.stars ? '⭐' : '☆';
                    }
                    starsSpan.textContent = starsHTML;
                }
                
                if (bestScoreSpan) {
                    bestScoreSpan.textContent = `最高: ${progress.bestScore}`;
                }
            }
        });
    }
    
    showKnowledgeScreen() {
        document.getElementById('level-select-screen').classList.add('hidden');
        document.getElementById('knowledge-screen').classList.remove('hidden');
    }
    
    hideKnowledgeScreen() {
        document.getElementById('knowledge-screen').classList.add('hidden');
        document.getElementById('level-select-screen').classList.remove('hidden');
    }
    
    renderKnowledgeCards() {
        const grid = document.getElementById('knowledge-grid');
        grid.innerHTML = '';
        
        const knowledgeData = this.getKnowledgeData();
        
        knowledgeData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'knowledge-card';
            
            if (!this.unlockedKnowledge.includes(item.id)) {
                card.classList.add('locked');
            }
            
            card.innerHTML = `
                <h4>${item.title}</h4>
                <p>${this.unlockedKnowledge.includes(item.id) ? item.content : '🔒 完成关卡解锁'}</p>
            `;
            
            grid.appendChild(card);
        });
    }
    
    getKnowledgeData() {
        return [
            {
                id: 'level1',
                title: '暖流与寒流',
                content: '暖流是从水温高的海区流向水温低的海区；寒流则是从水温低的海区流向水温高的海区。'
            },
            {
                id: 'level2',
                title: '洋流成因',
                content: '主要有风海流（风力驱动）、密度流（密度差异）和补偿流（海水补充）三种成因。'
            },
            {
                id: 'level3',
                title: '洋流分布',
                content: '中低纬度：北半球顺时针，南半球逆时针。中高纬度：北半球逆时针，南半球西风漂流。'
            },
            {
                id: 'level4',
                title: '主要洋流',
                content: '包括北赤道暖流、日本暖流、墨西哥湾暖流、秘鲁寒流等重要洋流。'
            },
            {
                id: 'level5',
                title: '洋流影响',
                content: '影响气候、渔业资源、海洋航行和海洋污染扩散等多个方面。'
            }
        ];
    }
    
    saveProgress() {
        const data = {
            levelProgress: this.levelProgress,
            totalScore: this.totalScore,
            gemsCount: this.gemsCount,
            unlockedKnowledge: this.unlockedKnowledge
        };
        localStorage.setItem('oceanCurrentsProgress', JSON.stringify(data));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('oceanCurrentsProgress');
        if (saved) {
            const data = JSON.parse(saved);
            this.levelProgress = data.levelProgress || this.levelProgress;
            this.totalScore = data.totalScore || 0;
            this.gemsCount = data.gemsCount || 0;
            this.unlockedKnowledge = data.unlockedKnowledge || [];
            this.updateHUD();
        }
    }
    
    getLevelQuestions(level) {
        const allQuestions = this.getQuestionBank();
        return allQuestions[level] || [];
    }
    
    getQuestionBank() {
        return {
            // 第1关：暖流寒流识别（15题）
            1: [
                {
                    question: '从水温高的海区流向水温低的海区的洋流叫什么？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 密度流'],
                    correct: 'A'
                },
                {
                    question: '从水温低的海区流向水温高的海区的洋流叫什么？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 风海流', 'D. 上升流'],
                    correct: 'B'
                },
                {
                    question: '日本暖流属于什么类型的洋流？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 密度流'],
                    correct: 'A'
                },
                {
                    question: '秘鲁寒流属于什么类型的洋流？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 风海流', 'D. 上升流'],
                    correct: 'B'
                },
                {
                    question: '暖流对沿岸气候的影响是？',
                    options: ['A. 增温加湿', 'B. 降温减湿', 'C. 增温减湿', 'D. 降温加湿'],
                    correct: 'A'
                },
                {
                    question: '寒流对沿岸气候的影响是？',
                    options: ['A. 增温加湿', 'B. 降温减湿', 'C. 增温减湿', 'D. 降温加湿'],
                    correct: 'B'
                },
                {
                    question: '墨西哥湾暖流属于什么类型？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 密度流'],
                    correct: 'A'
                },
                {
                    question: '加利福尼亚寒流属于什么类型？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 风海流', 'D. 上升流'],
                    correct: 'B'
                },
                {
                    question: '北大西洋暖流对西欧气候的影响是？',
                    options: ['A. 形成温带海洋性气候', 'B. 形成热带沙漠气候', 'C. 形成温带大陆性气候', 'D. 形成地中海气候'],
                    correct: 'A'
                },
                {
                    question: '中低纬度大陆西岸的寒流常促使沿岸形成什么气候？',
                    options: ['A. 温带海洋性气候', 'B. 热带沙漠气候', 'C. 温带季风气候', 'D. 热带雨林气候'],
                    correct: 'B'
                },
                {
                    question: '东澳大利亚暖流属于什么类型？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 密度流'],
                    correct: 'A'
                },
                {
                    question: '本格拉寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '暖流的水温相对于周围海水来说是？',
                    options: ['A. 较高', 'B. 较低', 'C. 相同', 'D. 不确定'],
                    correct: 'A'
                },
                {
                    question: '寒流的水温相对于周围海水来说是？',
                    options: ['A. 较高', 'B. 较低', 'C. 相同', 'D. 不确定'],
                    correct: 'B'
                },
                {
                    question: '巴西暖流属于什么类型的洋流？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 密度流'],
                    correct: 'A'
                }
            ],
            
            // 第2关：洋流成因（18题）
            2: [
                {
                    question: '在风的长期且稳定吹拂下形成的洋流叫什么？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 补偿流', 'D. 上升流'],
                    correct: 'A'
                },
                {
                    question: '因海水温度、盐度不同导致密度差异而形成的洋流叫什么？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 补偿流', 'D. 下降流'],
                    correct: 'B'
                },
                {
                    question: '当某一海区海水减少，相邻海区海水前来补充而形成的洋流叫什么？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 补偿流', 'D. 环流'],
                    correct: 'C'
                },
                {
                    question: '世界大洋表层洋流系统中最常见的成因类型是？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 补偿流', 'D. 潮汐流'],
                    correct: 'A'
                },
                {
                    question: '赤道附近的北赤道暖流主要是由什么风形成的？',
                    options: ['A. 信风', 'B. 西风', 'C. 季风', 'D. 极地东风'],
                    correct: 'A'
                },
                {
                    question: '南半球的西风漂流主要是由什么风形成的？',
                    options: ['A. 信风', 'B. 西风', 'C. 季风', 'D. 极地东风'],
                    correct: 'B'
                },
                {
                    question: '补偿流可以分为哪两种流动方式？',
                    options: ['A. 水平和垂直', 'B. 顺时针和逆时针', 'C. 暖流和寒流', 'D. 上升和下降'],
                    correct: 'A'
                },
                {
                    question: '垂直补偿流可以细分为哪两种？',
                    options: ['A. 风海流和密度流', 'B. 暖流和寒流', 'C. 上升流和下降流', 'D. 顺流和逆流'],
                    correct: 'C'
                },
                {
                    question: '秘鲁寒流属于哪种成因的洋流？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 上升补偿流', 'D. 下降补偿流'],
                    correct: 'C'
                },
                {
                    question: '海水温度高，蒸发量大，盐度高，会导致海水密度如何变化？',
                    options: ['A. 增大', 'B. 减小', 'C. 不变', 'D. 先增后减'],
                    correct: 'A'
                },
                {
                    question: '信风主要分布在哪个纬度带？',
                    options: ['A. 0°-30°', 'B. 30°-60°', 'C. 60°-90°', 'D. 赤道附近'],
                    correct: 'A'
                },
                {
                    question: '西风主要分布在哪个纬度带？',
                    options: ['A. 0°-30°', 'B. 30°-60°', 'C. 60°-90°', 'D. 赤道附近'],
                    correct: 'B'
                },
                {
                    question: '上升补偿流会把什么带到海洋表层？',
                    options: ['A. 温暖海水', 'B. 深层冷水和营养物质', 'C. 淡水', 'D. 污染物'],
                    correct: 'B'
                },
                {
                    question: '北印度洋的洋流主要受什么影响？',
                    options: ['A. 信风', 'B. 西风', 'C. 季风', 'D. 极地东风'],
                    correct: 'C'
                },
                {
                    question: '风海流的流向与风向的关系是？',
                    options: ['A. 完全一致', 'B. 基本一致', 'C. 相反', 'D. 垂直'],
                    correct: 'B'
                },
                {
                    question: '密度大的海水会如何运动？',
                    options: ['A. 上升', 'B. 下沉', 'C. 水平流动', 'D. 静止不动'],
                    correct: 'B'
                },
                {
                    question: '赤道逆流属于哪种成因的洋流？',
                    options: ['A. 风海流', 'B. 密度流', 'C. 补偿流', 'D. 潮汐流'],
                    correct: 'C'
                },
                {
                    question: '洋流形成的根本动力来源于？',
                    options: ['A. 太阳辐射', 'B. 地球自转', 'C. 月球引力', 'D. 地热'],
                    correct: 'A'
                }
            ],
            
            // 第3关：洋流分布规律（20题）
            3: [
                {
                    question: '中低纬度海区，北半球洋流呈什么方向流动？',
                    options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'],
                    correct: 'A'
                },
                {
                    question: '中低纬度海区，南半球洋流呈什么方向流动？',
                    options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'],
                    correct: 'B'
                },
                {
                    question: '中高纬度海区，北半球洋流呈什么方向流动？',
                    options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'],
                    correct: 'B'
                },
                {
                    question: '南半球中高纬度海区形成什么洋流？',
                    options: ['A. 北赤道暖流', 'B. 西风漂流', 'C. 季风暖流', 'D. 极地东风流'],
                    correct: 'B'
                },
                {
                    question: '北印度洋冬季盛行什么风？',
                    options: ['A. 东北风', 'B. 西南风', 'C. 东南风', 'D. 西北风'],
                    correct: 'A'
                },
                {
                    question: '北印度洋夏季盛行什么风？',
                    options: ['A. 东北风', 'B. 西南风', 'C. 东南风', 'D. 西北风'],
                    correct: 'B'
                },
                {
                    question: '北印度洋冬季海水呈什么方向旋转？',
                    options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'],
                    correct: 'B'
                },
                {
                    question: '北印度洋夏季海水呈什么方向旋转？',
                    options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'],
                    correct: 'A'
                },
                {
                    question: '赤道两侧在信风驱动下形成什么洋流？',
                    options: ['A. 西风漂流', 'B. 北赤道暖流和南赤道暖流', 'C. 季风暖流', 'D. 补偿流'],
                    correct: 'B'
                },
                {
                    question: '大洋东岸的洋流通常是？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 不确定'],
                    correct: 'B'
                },
                {
                    question: '大洋西岸的洋流通常是？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 不确定'],
                    correct: 'A'
                },
                {
                    question: '南半球西风漂流形成的原因是？',
                    options: ['A. 陆地多', 'B. 海面广阔，终年受西风影响', 'C. 受季风影响', 'D. 受信风影响'],
                    correct: 'B'
                },
                {
                    question: '北赤道暖流到达大洋西岸后，大部分流向哪里？',
                    options: ['A. 赤道', 'B. 极地', 'C. 中纬度海区', 'D. 大洋东岸'],
                    correct: 'C'
                },
                {
                    question: '赤道逆流的流向是？',
                    options: ['A. 自东向西', 'B. 自西向东', 'C. 自南向北', 'D. 自北向南'],
                    correct: 'B'
                },
                {
                    question: '北太平洋洋流系统呈什么形状？',
                    options: ['A. 顺时针环流', 'B. 逆时针环流', 'C. 直线流动', 'D. 不规则流动'],
                    correct: 'A'
                },
                {
                    question: '南太平洋洋流系统呈什么形状？',
                    options: ['A. 顺时针环流', 'B. 逆时针环流', 'C. 直线流动', 'D. 不规则流动'],
                    correct: 'B'
                },
                {
                    question: '北印度洋洋流的特点是？',
                    options: ['A. 终年不变', 'B. 具有季节性变化', 'C. 流速很慢', 'D. 没有洋流'],
                    correct: 'B'
                },
                {
                    question: '中低纬度大陆东岸通常流经什么洋流？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 不确定'],
                    correct: 'A'
                },
                {
                    question: '中低纬度大陆西岸通常流经什么洋流？',
                    options: ['A. 暖流', 'B. 寒流', 'C. 补偿流', 'D. 不确定'],
                    correct: 'B'
                },
                {
                    question: '全球洋流分布的总体规律是？',
                    options: ['A. 随机分布', 'B. 呈环流系统分布', 'C. 只有暖流', 'D. 只有寒流'],
                    correct: 'B'
                }
            ],
            
            // 第4关：世界主要洋流（25题）
            4: [
                {
                    question: '日本暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '墨西哥湾暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '秘鲁寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '本格拉寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '加利福尼亚寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '北大西洋暖流是哪个洋流的延续？',
                    options: ['A. 日本暖流', 'B. 墨西哥湾暖流', 'C. 巴西暖流', 'D. 东澳大利亚暖流'],
                    correct: 'B'
                },
                {
                    question: '东澳大利亚暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '巴西暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '加那利寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '西澳大利亚寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'C'
                },
                {
                    question: '挪威暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'D'
                },
                {
                    question: '北太平洋暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '索马里暖流出现在哪个季节？',
                    options: ['A. 春季', 'B. 夏季', 'C. 秋季', 'D. 冬季'],
                    correct: 'B'
                },
                {
                    question: '莫桑比克暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'C'
                },
                {
                    question: '千岛寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'A'
                },
                {
                    question: '拉布拉多寒流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '南赤道暖流横跨哪些大洋？',
                    options: ['A. 只有太平洋', 'B. 只有大西洋', 'C. 太平洋、大西洋和印度洋', 'D. 只有印度洋'],
                    correct: 'C'
                },
                {
                    question: '西风漂流主要分布在哪个半球？',
                    options: ['A. 北半球', 'B. 南半球', 'C. 两个半球都有', 'D. 赤道附近'],
                    correct: 'B'
                },
                {
                    question: '日本暖流又被称为？',
                    options: ['A. 黑潮', 'B. 亲潮', 'C. 湾流', 'D. 寒流'],
                    correct: 'A'
                },
                {
                    question: '墨西哥湾暖流又被称为？',
                    options: ['A. 黑潮', 'B. 亲潮', 'C. 湾流', 'D. 寒流'],
                    correct: 'C'
                },
                {
                    question: '千岛寒流又被称为？',
                    options: ['A. 黑潮', 'B. 亲潮', 'C. 湾流', 'D. 暖流'],
                    correct: 'B'
                },
                {
                    question: '北角暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'D'
                },
                {
                    question: '斯匹次卑尔根暖流位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'D'
                },
                {
                    question: '赤道逆流的流向与赤道暖流的关系是？',
                    options: ['A. 相同', 'B. 相反', 'C. 垂直', 'D. 无关'],
                    correct: 'B'
                },
                {
                    question: '北冰洋寒流的特点是？',
                    options: ['A. 水温高', 'B. 水温低', 'C. 流速快', 'D. 盐度高'],
                    correct: 'B'
                }
            ],
            
            // 第5关：洋流影响应用（20题）
            5: [
                {
                    question: '寒暖流交汇的海域，渔业资源如何？',
                    options: ['A. 贫乏', 'B. 丰富', 'C. 一般', 'D. 没有鱼'],
                    correct: 'B'
                },
                {
                    question: '北海道渔场是由哪两个洋流交汇形成的？',
                    options: ['A. 日本暖流和千岛寒流', 'B. 墨西哥湾暖流和拉布拉多寒流', 'C. 秘鲁寒流和南赤道暖流', 'D. 本格拉寒流和巴西暖流'],
                    correct: 'A'
                },
                {
                    question: '秘鲁渔场形成的主要原因是？',
                    options: ['A. 寒暖流交汇', 'B. 上升补偿流', 'C. 河流入海口', 'D. 浅海大陆架'],
                    correct: 'B'
                },
                {
                    question: '顺洋流航行的好处是？',
                    options: ['A. 节省燃料、加快速度', 'B. 增加燃料消耗', 'C. 减慢速度', 'D. 没有影响'],
                    correct: 'A'
                },
                {
                    question: '寒暖流相遇可能形成什么，影响航行安全？',
                    options: ['A. 海啸', 'B. 海雾', 'C. 台风', 'D. 暴雨'],
                    correct: 'B'
                },
                {
                    question: '洋流对海洋污染的影响是？',
                    options: ['A. 加快扩散，但扩大范围', 'B. 减缓扩散', 'C. 消除污染', 'D. 没有影响'],
                    correct: 'A'
                },
                {
                    question: '北大西洋暖流对西欧气候的主要影响是？',
                    options: ['A. 形成温带海洋性气候', 'B. 形成热带沙漠气候', 'C. 形成温带大陆性气候', 'D. 形成地中海气候'],
                    correct: 'A'
                },
                {
                    question: '秘鲁寒流对南美洲西海岸气候的影响是？',
                    options: ['A. 增温加湿', 'B. 降温减湿，形成沙漠', 'C. 增温减湿', 'D. 降温加湿'],
                    correct: 'B'
                },
                {
                    question: '上升补偿流会把什么带到海洋表层？',
                    options: ['A. 温暖海水', 'B. 深层冷水和营养物质', 'C. 淡水', 'D. 污染物'],
                    correct: 'B'
                },
                {
                    question: '营养物质丰富的海域，浮游生物如何？',
                    options: ['A. 很少', 'B. 大量繁殖', 'C. 没有', 'D. 一般'],
                    correct: 'B'
                },
                {
                    question: '浮游生物丰富的海域，鱼类资源如何？',
                    options: ['A. 贫乏', 'B. 丰富', 'C. 一般', 'D. 没有'],
                    correct: 'B'
                },
                {
                    question: '纽芬兰渔场是由哪两个洋流交汇形成的？',
                    options: ['A. 日本暖流和千岛寒流', 'B. 墨西哥湾暖流和拉布拉多寒流', 'C. 秘鲁寒流和南赤道暖流', 'D. 本格拉寒流和巴西暖流'],
                    correct: 'B'
                },
                {
                    question: '洋流对气候的影响主要体现在？',
                    options: ['A. 温度和湿度', 'B. 只有温度', 'C. 只有湿度', 'D. 没有影响'],
                    correct: 'A'
                },
                {
                    question: '暖流流经的沿岸地区，降水量通常？',
                    options: ['A. 减少', 'B. 增加', 'C. 不变', 'D. 没有降水'],
                    correct: 'B'
                },
                {
                    question: '寒流流经的沿岸地区，降水量通常？',
                    options: ['A. 减少', 'B. 增加', 'C. 不变', 'D. 很多降水'],
                    correct: 'A'
                },
                {
                    question: '世界四大渔场都分布在哪个半球？',
                    options: ['A. 南半球', 'B. 北半球', 'C. 赤道附近', 'D. 两个半球都有'],
                    correct: 'B'
                },
                {
                    question: '洋流能加快污染物扩散的同时，也会？',
                    options: ['A. 加快净化速度', 'B. 减慢净化速度', 'C. 消除污染', 'D. 没有影响'],
                    correct: 'A'
                },
                {
                    question: '逆洋流航行会？',
                    options: ['A. 节省时间', 'B. 耗费更多时间和燃料', 'C. 加快速度', 'D. 没有影响'],
                    correct: 'B'
                },
                {
                    question: '北海渔场位于哪个大洋？',
                    options: ['A. 太平洋', 'B. 大西洋', 'C. 印度洋', 'D. 北冰洋'],
                    correct: 'B'
                },
                {
                    question: '洋流对全球热量平衡的作用是？',
                    options: ['A. 把低纬度热量输送到高纬度', 'B. 把高纬度热量输送到低纬度', 'C. 没有作用', 'D. 只影响局部地区'],
                    correct: 'A'
                }
            ]
        };
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new OceanCurrentsGame();
});
