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
        
        // 地理题库 - 按场景和题型分类
        this.questionBank = {
            // 企鹅 - 南极场景
            penguin: [
                // 南极冰盖
                { q: '眼前的冰盖表面呈现波浪状起伏，这种地貌是？', options: ['A. 冰川槽谷', 'B. 冰丘', 'C. 冰原', 'D. 冰川U型谷'], answer: 'B', type: '地形识别' },
                { q: '南极冰盖中心年降水量不足50mm，但冰层很厚，主要原因是？', options: ['A. 蒸发量小', 'B. 气温极低', 'C. 风力小', 'D. 地势高'], answer: 'A', type: '气候分析' },
                { q: '南极冰盖最厚的地方可达4000多米，位于？', options: ['A. 南极半岛', 'B. 罗斯冰架', 'C. 东南极高原', 'D. 西南极'], answer: 'C', type: '区位判断' },
                { q: '科考站为什么多建在南极边缘而非内陆？', options: ['A. 风景好', 'B. 气温较高便于生活', 'C. 靠近海洋', 'D. 地势平坦'], answer: 'B', type: '人地关系' },
                { q: '如果南极冰盖全部融化，全球海平面将上升约60米，主要影响？', options: ['A. 山地城市', 'B. 沿海低地', 'C. 高原地区', 'D. 内陆盆地'], answer: 'B', type: '综合应用' },
                
                // 南极半岛
                { q: '南极半岛是南极洲最温暖的地区，主要原因是？', options: ['A. 纬度较低', 'B. 海拔较低', 'C. 洋流影响', 'D. 地热活动'], answer: 'A', type: '气候分析' },
                { q: '南极半岛夏季气温可达0℃以上，这种气候类型属于？', options: ['A. 极地气候', 'B. 苔原气候', 'C. 冰原气候', 'D. 高山气候'], answer: 'C', type: '气候分析' },
                { q: '南极半岛附近海域生物丰富，主要原因是？', options: ['A. 水温高', 'B. 营养盐丰富', 'C. 光照强', 'D. 盐度低'], answer: 'B', type: '综合应用' },
                { q: '南极半岛是企鹅的主要栖息地，企鹅选择此地的原因是？', options: ['A. 食物丰富', 'B. 气候温和', 'C. 天敌少', 'D. 以上都是'], answer: 'D', type: '人地关系' },
                { q: '南极半岛的冰川地貌主要由什么作用形成？', options: ['A. 流水侵蚀', 'B. 风力侵蚀', 'C. 冰川侵蚀', 'D. 海浪侵蚀'], answer: 'C', type: '地形识别' },
                
                // 罗斯海
                { q: '罗斯海的海冰面积冬季和夏季差异很大，主要原因是？', options: ['A. 气温变化', 'B. 洋流变化', 'C. 降水变化', 'D. 风力变化'], answer: 'A', type: '气候分析' },
                { q: '罗斯海附近的罗斯冰架是世界最大的冰架，它是？', options: ['A. 海冰', 'B. 陆地冰川延伸到海上', 'C. 冰山', 'D. 海水冻结'], answer: 'B', type: '地形识别' },
                { q: '罗斯海海域的洋流主要流向是？', options: ['A. 顺时针', 'B. 逆时针', 'C. 向北', 'D. 向南'], answer: 'B', type: '区位判断' },
                { q: '罗斯海是南极科考的重要区域，主要原因是？', options: ['A. 交通便利', 'B. 气候温和', 'C. 科研价值高', 'D. 资源丰富'], answer: 'C', type: '人地关系' },
                { q: '罗斯海海冰消融会对全球气候产生什么影响？', options: ['A. 海平面上升', 'B. 反射率降低', 'C. 洋流改变', 'D. 以上都是'], answer: 'D', type: '综合应用' },
                
                // 南极高原
                { q: '南极高原平均海拔超过3000米，气压特点是？', options: ['A. 气压高', 'B. 气压低', 'C. 气压正常', 'D. 气压不稳定'], answer: 'B', type: '气候分析' },
                { q: '南极高原是地球上最寒冷的地方，最低气温可达？', options: ['A. -60℃', 'B. -70℃', 'C. -80℃', 'D. -90℃'], answer: 'D', type: '区位判断' },
                { q: '南极高原的冰盖厚度可达4000米，形成原因是？', options: ['A. 降雪累积', 'B. 海水冻结', 'C. 冰川搬运', 'D. 火山喷发'], answer: 'A', type: '地形识别' },
                { q: '南极高原几乎没有生命存在，主要限制因素是？', options: ['A. 极端低温', 'B. 缺少水源', 'C. 缺少氧气', 'D. 以上都是'], answer: 'D', type: '人地关系' },
                { q: '南极高原的冰芯记录了地球气候变化历史，可追溯到？', options: ['A. 1万年前', 'B. 10万年前', 'C. 80万年前', 'D. 100万年前'], answer: 'C', type: '综合应用' },
                
                // 科考站区
                { q: '中国在南极建立的第一个科考站是？', options: ['A. 长城站', 'B. 中山站', 'C. 昆仑站', 'D. 泰山站'], answer: 'A', type: '区位判断' },
                { q: '南极科考站选址的主要考虑因素是？', options: ['A. 交通便利', 'B. 气候相对温和', 'C. 科研价值', 'D. 以上都是'], answer: 'D', type: '人地关系' },
                { q: '南极科考站的建筑设计需要考虑什么？', options: ['A. 抗风', 'B. 保温', 'C. 防雪', 'D. 以上都是'], answer: 'D', type: '综合应用' },
                { q: '南极科考主要在哪个季节进行？', options: ['A. 春季', 'B. 夏季', 'C. 秋季', 'D. 冬季'], answer: 'B', type: '气候分析' },
                { q: '南极科考站的能源主要来自？', options: ['A. 太阳能', 'B. 风能', 'C. 柴油发电', 'D. 地热能'], answer: 'C', type: '人地关系' }
            ],
            
            // 大熊猫 - 中国西南场景
            panda: [
                { q: '四川盆地的地形特点是？', options: ['A. 四周高中间低', 'B. 四周低中间高', 'C. 东高西低', 'D. 南高北低'], answer: 'A', type: '地形识别' },
                { q: '四川盆地的气候类型是？', options: ['A. 热带季风', 'B. 亚热带季风', 'C. 温带季风', 'D. 高原气候'], answer: 'B', type: '气候分析' },
                { q: '秦岭是中国重要的地理分界线，它分隔了？', options: ['A. 南方和北方', 'B. 东部和西部', 'C. 季风区和非季风区', 'D. 内流区和外流区'], answer: 'A', type: '区位判断' },
                { q: '岷江是长江的重要支流，它的流向是？', options: ['A. 自北向南', 'B. 自南向北', 'C. 自西向东', 'D. 自东向西'], answer: 'A', type: '地形识别' },
                { q: '大熊猫选择竹林作为栖息地的主要原因是？', options: ['A. 食物来源', 'B. 隐蔽性好', 'C. 气候适宜', 'D. 以上都是'], answer: 'D', type: '人地关系' }
            ],
            
            // 骆驼 - 沙漠场景
            camel: [
                { q: '塔克拉玛干沙漠的沙丘类型主要是？', options: ['A. 新月形沙丘', 'B. 沙垄', 'C. 沙山', 'D. 以上都有'], answer: 'D', type: '地形识别' },
                { q: '沙漠绿洲形成的关键因素是？', options: ['A. 降水', 'B. 地下水', 'C. 河流', 'D. 以上都是'], answer: 'D', type: '气候分析' },
                { q: '戈壁滩与沙漠的主要区别是？', options: ['A. 有砾石覆盖', 'B. 降水更少', 'C. 温度更高', 'D. 风力更大'], answer: 'A', type: '地形识别' },
                { q: '古丝绸之路选择沙漠边缘通过的原因是？', options: ['A. 有绿洲补给', 'B. 地势平坦', 'C. 避开沙漠', 'D. 以上都是'], answer: 'D', type: '人地关系' },
                { q: '沙漠化防治的有效措施是？', options: ['A. 植树造林', 'B. 合理放牧', 'C. 节约用水', 'D. 以上都是'], answer: 'D', type: '综合应用' }
            ],
            
            // 袋鼠 - 澳大利亚场景
            kangaroo: [
                { q: '大分水岭东侧降水多的原因是？', options: ['A. 地形雨', 'B. 对流雨', 'C. 锋面雨', 'D. 台风雨'], answer: 'A', type: '气候分析' },
                { q: '墨累-达令盆地是澳大利亚重要的？', options: ['A. 工业区', 'B. 农业区', 'C. 牧业区', 'D. 矿业区'], answer: 'B', type: '区位判断' },
                { q: '大堡礁是世界最大的珊瑚礁群，形成条件是？', options: ['A. 水温高', 'B. 水质清', 'C. 阳光足', 'D. 以上都是'], answer: 'D', type: '地形识别' },
                { q: '澳大利亚内陆沙漠气候干旱的原因是？', options: ['A. 副热带高压', 'B. 距海远', 'C. 地形阻挡', 'D. 以上都是'], answer: 'D', type: '气候分析' },
                { q: '悉尼港成为重要港口的优势是？', options: ['A. 天然深水港', 'B. 经济腹地广', 'C. 交通便利', 'D. 以上都是'], answer: 'D', type: '人地关系' }
            ],
            
            // 北极熊 - 北极场景
            polar_bear: [
                { q: '北冰洋海冰面积减少的主要原因是？', options: ['A. 全球变暖', 'B. 洋流变化', 'C. 人类活动', 'D. 火山喷发'], answer: 'A', type: '气候分析' },
                { q: '格陵兰岛的冰川作用形成了什么地貌？', options: ['A. U型谷', 'B. V型谷', 'C. 峡湾', 'D. A和C'], answer: 'D', type: '地形识别' },
                { q: '苔原带的植被特点是？', options: ['A. 低矮', 'B. 生长期短', 'C. 耐寒', 'D. 以上都是'], answer: 'D', type: '区位判断' },
                { q: '北极圈内会出现极昼极夜现象，原因是？', options: ['A. 地球自转', 'B. 地球公转', 'C. 黄赤交角', 'D. B和C'], answer: 'D', type: '综合应用' },
                { q: '因纽特人适应极地环境的方式是？', options: ['A. 捕猎为生', 'B. 建造冰屋', 'C. 穿兽皮衣', 'D. 以上都是'], answer: 'D', type: '人地关系' }
            ]
        };
        
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
        
        // 根据选择的动物生成对应的5张地图
        const animalMapConfigs = {
            penguin: [
                { name: '南极冰盖', bgColor: '#E8F4F8', theme: 'ice', desc: '冰川地貌' },
                { name: '南极半岛', bgColor: '#D4E8F0', theme: 'ice', desc: '极地气候' },
                { name: '罗斯海', bgColor: '#B8D4E8', theme: 'ice', desc: '洋流与海冰' },
                { name: '南极高原', bgColor: '#F0F8FC', theme: 'ice', desc: '海拔与气压' },
                { name: '科考站区', bgColor: '#DCE8F0', theme: 'ice', desc: '人类活动' }
            ],
            panda: [
                { name: '四川盆地', bgColor: '#E8D4C0', theme: 'bamboo', desc: '盆地地形' },
                { name: '秦岭山脉', bgColor: '#C8D8C0', theme: 'bamboo', desc: '山地垂直带' },
                { name: '岷江河谷', bgColor: '#B8D0C8', theme: 'bamboo', desc: '河流地貌' },
                { name: '竹林生态区', bgColor: '#2D5016', theme: 'bamboo', desc: '植被气候' },
                { name: '自然保护区', bgColor: '#3D6026', theme: 'bamboo', desc: '人地关系' }
            ],
            camel: [
                { name: '塔克拉玛干沙漠', bgColor: '#F4E4C1', theme: 'cactus', desc: '风沙地貌' },
                { name: '沙漠绿洲', bgColor: '#E8D8B0', theme: 'cactus', desc: '水源聚落' },
                { name: '戈壁滩', bgColor: '#D8C8A8', theme: 'cactus', desc: '荒漠化' },
                { name: '沙漠边缘', bgColor: '#E0D0B0', theme: 'cactus', desc: '气候过渡' },
                { name: '古丝绸之路', bgColor: '#D4C4A4', theme: 'cactus', desc: '交通贸易' }
            ],
            kangaroo: [
                { name: '大分水岭', bgColor: '#B8C8B0', theme: 'eucalyptus', desc: '地形雨' },
                { name: '墨累-达令盆地', bgColor: '#D8C8A8', theme: 'eucalyptus', desc: '农业区位' },
                { name: '大堡礁', bgColor: '#88C8D8', theme: 'eucalyptus', desc: '珊瑚礁' },
                { name: '内陆沙漠', bgColor: '#E8D0A8', theme: 'eucalyptus', desc: '大陆性气候' },
                { name: '悉尼港', bgColor: '#A8C8D8', theme: 'eucalyptus', desc: '海港城市' }
            ],
            polar_bear: [
                { name: '北冰洋海冰', bgColor: '#E0F0F8', theme: 'arctic', desc: '海冰消融' },
                { name: '格陵兰岛', bgColor: '#D8E8F0', theme: 'arctic', desc: '冰川作用' },
                { name: '苔原带', bgColor: '#C8D0C0', theme: 'arctic', desc: '冻土植被' },
                { name: '北极圈', bgColor: '#D0E0E8', theme: 'arctic', desc: '极昼极夜' },
                { name: '因纽特村落', bgColor: '#C8D8D0', theme: 'arctic', desc: '极地适应' }
            ]
        };
        
        const configs = animalMapConfigs[this.currentAnimal] || animalMapConfigs.penguin;
        
        for (let i = 0; i < 5; i++) {
            const config = configs[i];
            const map = {
                name: config.name,
                bgColor: config.bgColor,
                theme: config.theme,
                description: config.desc,
                obstacles: []
            };
            
            // 生成5个障碍物，位置随机但不重叠
            const positions = this.generateObstaclePositions(5);
            for (let j = 0; j < 5; j++) {
                map.obstacles.push({
                    x: positions[j].x,
                    y: positions[j].y,
                    width: 50,
                    height: 50,
                    completed: false,
                    questionIndex: i * 5 + j
                });
            }
            
            this.maps.push(map);
        }
    }
    
    generateObstaclePositions(count) {
        const positions = [];
        const minDistance = 150; // 最小间距
        
        for (let i = 0; i < count; i++) {
            let attempts = 0;
            let pos;
            
            do {
                pos = {
                    x: 200 + i * 200 + (Math.random() - 0.5) * 50,
                    y: 150 + Math.random() * 250
                };
                attempts++;
            } while (attempts < 10 && this.isTooClose(pos, positions, minDistance));
            
            positions.push(pos);
        }
        
        return positions;
    }
    
    isTooClose(pos, positions, minDistance) {
        return positions.some(p => {
            const dx = pos.x - p.x;
            const dy = pos.y - p.y;
            return Math.sqrt(dx * dx + dy * dy) < minDistance;
        });
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
        // 根据当前动物获取题库
        const animalQuestions = this.questionBank[this.currentAnimal] || this.questionBank.penguin;
        const questionIndex = obstacle.questionIndex % animalQuestions.length;
        
        this.currentQuestion = {
            data: animalQuestions[questionIndex],
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
            // 未完成 - 根据地图主题绘制不同风格
            const map = this.maps[this.currentMap];
            const theme = map?.theme || 'ice';
            
            switch(theme) {
                case 'ice':
                    this.drawIceBlock(x, y, w, h);
                    break;
                case 'cactus':
                    this.drawCactus(x, y, w, h);
                    break;
                case 'bamboo':
                    this.drawBamboo(x, y, w, h);
                    break;
                case 'eucalyptus':
                    this.drawEucalyptus(x, y, w, h);
                    break;
                case 'arctic':
                    this.drawArcticIce(x, y, w, h);
                    break;
                default:
                    this.drawIceBlock(x, y, w, h);
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
        // 更新生命值显示
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.health) {
                heart.style.opacity = '1';
                heart.style.filter = 'grayscale(0)';
            } else {
                heart.style.opacity = '0.3';
                heart.style.filter = 'grayscale(1)';
            }
        });
        
        // 更新地图信息
        const mapName = document.getElementById('map-name');
        const mapProgress = document.getElementById('map-progress');
        const animalName = document.getElementById('animal-name');
        
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
