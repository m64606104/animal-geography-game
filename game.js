// 简化版动物地理大冒险 - 确保可用性优先
class AnimalGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // 设置画布尺寸
        this.canvas.width = 1200;
        this.canvas.height = 600;
        
        // 游戏状态
        this.currentAnimal = null;
        this.currentMap = 0;
        this.health = 10;
        this.score = 0;
        this.isPlaying = false;
        
        // 玩家
        this.player = {
            x: 100,
            y: 300,
            width: 40,
            height: 40,
            speed: 5
        };
        
        // 键盘控制
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        
        // 动物配置
        this.animals = {
            penguin: { name: '企鹅', emoji: '🐧', color: '#000' },
            panda: { name: '大熊猫', emoji: '🐼', color: '#000' },
            camel: { name: '骆驼', emoji: '🐫', color: '#8B4513' },
            kangaroo: { name: '袋鼠', emoji: '🦘', color: '#CD853F' },
            polar_bear: { name: '北极熊', emoji: '🐻‍❄️', color: '#FFF' }
        };
        
        // 地图配置
        this.maps = [];
        
        // 题库
        this.questions = [
            { q: '南极洲属于哪个板块？', options: ['A. 太平洋板块', 'B. 南极洲板块', 'C. 印度洋板块', 'D. 大西洋板块'], answer: 'B' },
            { q: '南极洲的面积大约是？', options: ['A. 1400万km²', 'B. 2400万km²', 'C. 3400万km²', 'D. 4400万km²'], answer: 'A' },
            { q: '企鹅主要分布在哪个半球？', options: ['A. 北半球', 'B. 南半球', 'C. 赤道', 'D. 全球'], answer: 'B' },
            { q: '大熊猫主要分布在中国的哪个省？', options: ['A. 四川', 'B. 云南', 'C. 贵州', 'D. 湖南'], answer: 'A' },
            { q: '竹子属于哪种植物类型？', options: ['A. 草本植物', 'B. 木本植物', 'C. 藤本植物', 'D. 苔藓植物'], answer: 'A' },
            { q: '世界最大的沙漠是？', options: ['A. 撒哈拉沙漠', 'B. 戈壁沙漠', 'C. 阿塔卡马沙漠', 'D. 南极洲沙漠'], answer: 'D' },
            { q: '骆驼的驼峰主要储存的是？', options: ['A. 水', 'B. 脂肪', 'C. 蛋白质', 'D. 矿物质'], answer: 'B' },
            { q: '澳大利亚位于哪个半球？', options: ['A. 北半球', 'B. 南半球', 'C. 跨赤道', 'D. 东半球'], answer: 'B' },
            { q: '袋鼠属于哪个动物分类？', options: ['A. 灵长类', 'B. 食肉类', 'C. 有袋类', 'D. 啮齿类'], answer: 'C' },
            { q: '北极圈大约位于哪个纬度？', options: ['A. 66.5°N', 'B. 66.5°S', 'C. 23.5°N', 'D. 23.5°S'], answer: 'A' }
        ];
        
        this.currentQuestion = null;
        
        this.init();
    }
    
    init() {
        // 隐藏游戏UI
        this.hideGameUI();
        
        // 绑定动物选择
        this.setupAnimalSelection();
        
        // 绑定键盘
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
        
        // 绑定答题按钮
        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.checkAnswer(String.fromCharCode(65 + index));
            });
        });
        
        // 绑定游戏控制按钮
        const exitBtn = document.getElementById('exit-game-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => this.exitGame());
        }
    }
    
    setupAnimalSelection() {
        const startBtn = document.getElementById('start-game-menu-btn');
        const animalCards = document.querySelectorAll('.animal-card');
        const confirmBtn = document.getElementById('confirm-animal-btn');
        const backBtn = document.getElementById('back-to-lobby-btn');
        const animalScreen = document.getElementById('animal-selection-screen');
        const lobby = document.getElementById('game-lobby');
        
        if (!startBtn || !confirmBtn || !backBtn) return;
        
        startBtn.addEventListener('click', () => {
            lobby.classList.add('hidden');
            animalScreen.classList.remove('hidden');
        });
        
        animalCards.forEach(card => {
            card.addEventListener('click', () => {
                animalCards.forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                this.currentAnimal = card.dataset.animal;
                confirmBtn.disabled = false;
            });
        });
        
        confirmBtn.addEventListener('click', () => {
            if (this.currentAnimal) {
                this.startGame();
            }
        });
        
        backBtn.addEventListener('click', () => {
            animalScreen.classList.add('hidden');
            lobby.classList.remove('hidden');
            animalCards.forEach(c => c.classList.remove('selected'));
            this.currentAnimal = null;
            confirmBtn.disabled = true;
        });
    }
    
    startGame() {
        // 隐藏选择界面
        document.getElementById('animal-selection-screen').classList.add('hidden');
        
        // 显示游戏UI
        this.showGameUI();
        
        // 生成地图
        this.generateMaps();
        
        // 重置游戏状态
        this.currentMap = 0;
        this.health = 10;
        this.score = 0;
        this.player.x = 100;
        this.player.y = 300;
        this.isPlaying = true;
        
        // 更新UI
        this.updateUI();
        
        // 开始游戏循环
        this.gameLoop();
    }
    
    generateMaps() {
        this.maps = [];
        const mapConfigs = [
            { name: '南极冰原', bgColor: '#E0F2F7' },
            { name: '沙漠绿洲', bgColor: '#F4E4C1' },
            { name: '竹林秘境', bgColor: '#2D5016' },
            { name: '澳洲内陆', bgColor: '#CD853F' },
            { name: '北极冰川', bgColor: '#F0F8FF' }
        ];
        
        for (let i = 0; i < 5; i++) {
            const map = {
                name: mapConfigs[i].name,
                bgColor: mapConfigs[i].bgColor,
                obstacles: []
            };
            
            // 生成5个障碍物
            for (let j = 0; j < 5; j++) {
                map.obstacles.push({
                    x: 200 + j * 200,
                    y: 200 + Math.random() * 200,
                    width: 50,
                    height: 50,
                    completed: false,
                    questionIndex: i * 5 + j
                });
            }
            
            this.maps.push(map);
        }
    }
    
    gameLoop() {
        if (!this.isPlaying) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // 移动玩家
        if (this.keys.ArrowUp && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys.ArrowDown && this.player.y < this.canvas.height - this.player.height) {
            this.player.y += this.player.speed;
        }
        if (this.keys.ArrowLeft && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys.ArrowRight && this.player.x < this.canvas.width - this.player.width) {
            this.player.x += this.player.speed;
        }
        
        // 检查碰撞
        this.checkCollisions();
        
        // 检查通关
        this.checkMapComplete();
    }
    
    checkCollisions() {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        map.obstacles.forEach(obs => {
            if (obs.completed) return;
            
            if (this.player.x < obs.x + obs.width &&
                this.player.x + this.player.width > obs.x &&
                this.player.y < obs.y + obs.height &&
                this.player.y + this.player.height > obs.y) {
                
                this.showQuestion(obs);
                this.player.x -= this.player.speed * 2;
            }
        });
    }
    
    checkMapComplete() {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        const allCompleted = map.obstacles.every(obs => obs.completed);
        
        if (allCompleted && this.player.x > this.canvas.width - 100) {
            this.nextMap();
        }
    }
    
    nextMap() {
        this.currentMap++;
        
        if (this.currentMap >= this.maps.length) {
            this.gameWin();
        } else {
            this.player.x = 100;
            this.player.y = 300;
            this.updateUI();
        }
    }
    
    showQuestion(obstacle) {
        const questionIndex = obstacle.questionIndex % this.questions.length;
        this.currentQuestion = {
            data: this.questions[questionIndex],
            obstacle: obstacle
        };
        
        const modal = document.getElementById('question-modal');
        const questionText = document.getElementById('question-text');
        const answerBtns = document.querySelectorAll('.answer-btn');
        
        questionText.textContent = this.currentQuestion.data.q;
        answerBtns.forEach((btn, index) => {
            btn.textContent = this.currentQuestion.data.options[index];
        });
        
        modal.classList.remove('hidden');
        this.isPlaying = false;
    }
    
    checkAnswer(answer) {
        if (!this.currentQuestion) return;
        
        const modal = document.getElementById('question-modal');
        
        if (answer === this.currentQuestion.data.answer) {
            this.currentQuestion.obstacle.completed = true;
            this.score += 10;
            alert('回答正确！+10分');
        } else {
            this.health -= 1;
            alert('回答错误！-1生命值');
            
            if (this.health <= 0) {
                this.gameOver();
                return;
            }
        }
        
        modal.classList.add('hidden');
        this.currentQuestion = null;
        this.isPlaying = true;
        this.updateUI();
        this.gameLoop();
    }
    
    draw() {
        const map = this.maps[this.currentMap];
        if (!map) return;
        
        // 清空画布
        this.ctx.fillStyle = map.bgColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制路径（带纹理）
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.fillRect(0, 250, this.canvas.width, 100);
        
        // 添加路径纹理
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.canvas.width; i += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, 250);
            this.ctx.lineTo(i, 350);
            this.ctx.stroke();
        }
        
        // 绘制障碍物（像素风格）
        map.obstacles.forEach(obs => {
            this.drawPixelObstacle(obs);
        });
        
        // 绘制终点（像素风格）
        this.drawPixelFinish();
        
        // 绘制玩家
        const animal = this.animals[this.currentAnimal];
        this.ctx.font = '40px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(animal.emoji, this.player.x + 20, this.player.y + 30);
    }
    
    drawPixelObstacle(obs) {
        const x = obs.x;
        const y = obs.y;
        const w = obs.width;
        const h = obs.height;
        
        if (obs.completed) {
            // 已完成 - 绿色勾选标记
            this.ctx.fillStyle = '#90EE90';
            this.ctx.fillRect(x, y, w, h);
            this.ctx.strokeStyle = '#228B22';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x, y, w, h);
            
            // 绘制勾选符号
            this.ctx.strokeStyle = '#228B22';
            this.ctx.lineWidth = 4;
            this.ctx.beginPath();
            this.ctx.moveTo(x + w * 0.2, y + h * 0.5);
            this.ctx.lineTo(x + w * 0.4, y + h * 0.7);
            this.ctx.lineTo(x + w * 0.8, y + h * 0.3);
            this.ctx.stroke();
        } else {
            // 未完成 - 根据地图类型绘制不同风格
            const mapIndex = this.currentMap;
            
            if (mapIndex === 0) {
                // 南极冰川
                this.drawIceBlock(x, y, w, h);
            } else if (mapIndex === 1) {
                // 沙漠仙人掌
                this.drawCactus(x, y, w, h);
            } else if (mapIndex === 2) {
                // 竹林
                this.drawBamboo(x, y, w, h);
            } else if (mapIndex === 3) {
                // 澳洲桉树
                this.drawEucalyptus(x, y, w, h);
            } else {
                // 北极冰块
                this.drawArcticIce(x, y, w, h);
            }
            
            // 添加问号标记
            this.ctx.fillStyle = '#FFF';
            this.ctx.strokeStyle = '#000';
            this.ctx.lineWidth = 2;
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeText('?', x + w/2, y + h/2 + 10);
            this.ctx.fillText('?', x + w/2, y + h/2 + 10);
        }
    }
    
    drawIceBlock(x, y, w, h) {
        // 冰块主体
        this.ctx.fillStyle = '#B0E0E6';
        this.ctx.fillRect(x, y, w, h);
        
        // 冰块高光
        this.ctx.fillStyle = '#E0F8FF';
        this.ctx.fillRect(x + 5, y + 5, w - 10, h/3);
        
        // 冰块边框
        this.ctx.strokeStyle = '#4682B4';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, w, h);
        
        // 冰晶纹理
        this.ctx.strokeStyle = '#87CEEB';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + w/4, y);
        this.ctx.lineTo(x + w/4, y + h);
        this.ctx.moveTo(x + w*3/4, y);
        this.ctx.lineTo(x + w*3/4, y + h);
        this.ctx.stroke();
    }
    
    drawCactus(x, y, w, h) {
        // 仙人掌主体
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(x + w/4, y, w/2, h);
        
        // 仙人掌手臂
        this.ctx.fillRect(x, y + h/3, w/3, h/4);
        this.ctx.fillRect(x + w*2/3, y + h/2, w/3, h/4);
        
        // 边框
        this.ctx.strokeStyle = '#006400';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + w/4, y, w/2, h);
        this.ctx.strokeRect(x, y + h/3, w/3, h/4);
        this.ctx.strokeRect(x + w*2/3, y + h/2, w/3, h/4);
        
        // 刺
        this.ctx.strokeStyle = '#8B4513';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            const py = y + (i + 1) * h/6;
            this.ctx.beginPath();
            this.ctx.moveTo(x + w/4, py);
            this.ctx.lineTo(x + w/4 - 5, py);
            this.ctx.moveTo(x + w*3/4, py);
            this.ctx.lineTo(x + w*3/4 + 5, py);
            this.ctx.stroke();
        }
    }
    
    drawBamboo(x, y, w, h) {
        // 竹子主干
        this.ctx.fillStyle = '#90EE90';
        this.ctx.fillRect(x + w/3, y, w/3, h);
        
        // 竹节
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 3;
        for (let i = 1; i < 4; i++) {
            const nodeY = y + i * h/4;
            this.ctx.beginPath();
            this.ctx.moveTo(x + w/3, nodeY);
            this.ctx.lineTo(x + w*2/3, nodeY);
            this.ctx.stroke();
        }
        
        // 竹叶
        this.ctx.fillStyle = '#7CFC00';
        this.ctx.beginPath();
        this.ctx.moveTo(x + w/2, y);
        this.ctx.lineTo(x, y + h/4);
        this.ctx.lineTo(x + w/3, y + h/6);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + w/2, y);
        this.ctx.lineTo(x + w, y + h/4);
        this.ctx.lineTo(x + w*2/3, y + h/6);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = '#228B22';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + w/3, y, w/3, h);
    }
    
    drawEucalyptus(x, y, w, h) {
        // 树干
        this.ctx.fillStyle = '#8B7355';
        this.ctx.fillRect(x + w/3, y + h/3, w/3, h*2/3);
        
        // 树冠
        this.ctx.fillStyle = '#9ACD32';
        this.ctx.beginPath();
        this.ctx.arc(x + w/2, y + h/3, w/2, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 树冠细节
        this.ctx.fillStyle = '#7CFC00';
        this.ctx.beginPath();
        this.ctx.arc(x + w/3, y + h/4, w/4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + w*2/3, y + h/4, w/4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 边框
        this.ctx.strokeStyle = '#556B2F';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + w/3, y + h/3, w/3, h*2/3);
        this.ctx.beginPath();
        this.ctx.arc(x + w/2, y + h/3, w/2, 0, Math.PI * 2);
        this.ctx.stroke();
    }
    
    drawArcticIce(x, y, w, h) {
        // 冰块主体（更白）
        this.ctx.fillStyle = '#F0F8FF';
        this.ctx.fillRect(x, y, w, h);
        
        // 冰块阴影
        this.ctx.fillStyle = '#E0F0FF';
        this.ctx.fillRect(x, y + h*2/3, w, h/3);
        
        // 冰块高光
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.fillRect(x + 5, y + 5, w/3, h/4);
        
        // 边框
        this.ctx.strokeStyle = '#B0C4DE';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, w, h);
        
        // 冰晶效果
        this.ctx.strokeStyle = '#ADD8E6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + w, y + h);
        this.ctx.moveTo(x + w, y);
        this.ctx.lineTo(x, y + h);
        this.ctx.stroke();
    }
    
    drawPixelFinish() {
        const x = this.canvas.width - 80;
        const y = 250;
        
        // 终点旗帜杆
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(x + 25, y, 10, 100);
        
        // 旗帜
        this.ctx.fillStyle = '#FFD700';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 35, y + 10);
        this.ctx.lineTo(x + 65, y + 25);
        this.ctx.lineTo(x + 35, y + 40);
        this.ctx.fill();
        
        // 旗帜边框
        this.ctx.strokeStyle = '#FF8C00';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 35, y + 10);
        this.ctx.lineTo(x + 65, y + 25);
        this.ctx.lineTo(x + 35, y + 40);
        this.ctx.closePath();
        this.ctx.stroke();
        
        // 文字
        this.ctx.fillStyle = '#000';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('终点', x + 40, y + 70);
    }
    
    updateUI() {
        const healthDisplay = document.getElementById('health-display');
        const mapName = document.getElementById('map-name');
        const mapProgress = document.getElementById('map-progress');
        const animalName = document.getElementById('animal-name');
        
        if (healthDisplay) healthDisplay.textContent = '❤️'.repeat(this.health);
        if (mapName) mapName.textContent = this.maps[this.currentMap]?.name || '';
        if (mapProgress) mapProgress.textContent = `${this.currentMap + 1}/5`;
        if (animalName && this.currentAnimal) {
            animalName.textContent = this.animals[this.currentAnimal].name;
        }
    }
    
    showGameUI() {
        document.getElementById('game-header').classList.remove('hidden');
        document.getElementById('game-footer').classList.remove('hidden');
        document.getElementById('canvas-container').classList.remove('hidden');
        document.getElementById('game-controls').classList.remove('hidden');
    }
    
    hideGameUI() {
        document.getElementById('game-header').classList.add('hidden');
        document.getElementById('game-footer').classList.add('hidden');
        document.getElementById('canvas-container').classList.add('hidden');
        document.getElementById('game-controls').classList.add('hidden');
    }
    
    exitGame() {
        if (confirm('确定要退出游戏吗？')) {
            this.isPlaying = false;
            this.hideGameUI();
            document.getElementById('game-lobby').classList.remove('hidden');
        }
    }
    
    gameOver() {
        alert('游戏结束！生命值耗尽。');
        this.exitGame();
    }
    
    gameWin() {
        alert(`恭喜通关！总分：${this.score}`);
        this.exitGame();
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new AnimalGame();
});
