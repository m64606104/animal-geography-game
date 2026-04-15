// 游戏状态管理
class GameState {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // 保持像素风格
        
        // 游戏状态
        this.isRunning = true;
        this.currentMap = 0;
        this.health = 10;
        this.maxHealth = 10;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        
        // 动物角色系统
        this.animals = {
            penguin: {
                name: '企鹅',
                emoji: '🐧',
                habitat: 'antarctica',
                maps: ['antarctica_ice_sheet', 'antarctica_peninsula', 'ross_sea', 'antarctica_plateau', 'research_station'],
                description: '生活在南极的可爱鸟类'
            },
            panda: {
                name: '大熊猫',
                emoji: '🐼',
                habitat: 'bamboo_forest',
                maps: ['sichuan_basin', 'qinling_mountains', 'minjiang_valley', 'bamboo_forest', 'nature_reserve'],
                description: '中国国宝，爱吃竹子'
            },
            camel: {
                name: '骆驼',
                emoji: '🐫',
                habitat: 'desert',
                maps: ['taklamakan_desert', 'desert_oasis', 'gobi_desert', 'desert_edge', 'silk_road'],
                description: '沙漠之舟，耐渴能手'
            },
            kangaroo: {
                name: '袋鼠',
                emoji: '🦘',
                habitat: 'australia',
                maps: ['great_dividing_range', 'murray_darling_basin', 'great_barrier_reef', 'outback_desert', 'sydney_harbour'],
                description: '澳大利亚跳跃大师'
            },
            polar_bear: {
                name: '北极熊',
                emoji: '🐻‍❄️',
                habitat: 'arctic',
                maps: ['arctic_ocean_ice', 'greenland', 'tundra_zone', 'arctic_circle', 'inuit_village'],
                description: '北极霸主，游泳健将'
            }
        };
        
        // 当前选择的动物（初始为null，等待用户选择）
        this.currentAnimal = null;
        this.selectedAnimal = null;
        
        // 当前动物角色
        this.player = {
            x: 50,
            y: 300,
            width: 32,
            height: 32,
            speed: 4,
            animal: null
        };
        
        // 键盘状态
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false
        };
        
        // RPG风格地图数据 - 将被动物系统动态生成
        this.maps = [];
        
        // 游戏是否已开始
        this.gameStarted = false;
        
        // 大型栖息地理题库
        this.habitatQuestionBank = {
            antarctica: [
                {
                    question: '南极洲属于哪个板块？',
                    options: ['A. 太平洋板块', 'B. 南极洲板块', 'C. 印度洋板块', 'D. 大西洋板块'],
                    correct: 'B'
                },
                {
                    question: '南极洲的面积大约是？',
                    options: ['A. 1400万平方公里', 'B. 2400万平方公里', 'C. 3400万平方公里', 'D. 4400万平方公里'],
                    correct: 'A'
                },
                {
                    question: '南极洲最丰富的资源是？',
                    options: ['A. 石油', 'B. 煤炭', 'C. 冰川', 'D. 铁矿'],
                    correct: 'C'
                },
                {
                    question: '企鹅主要分布在哪个半球？',
                    options: ['A. 北半球', 'B. 南半球', 'C. 赤道', 'D. 全球'],
                    correct: 'B'
                },
                {
                    question: '南极洲的年平均温度约为？',
                    options: ['A. -10°C', 'B. -25°C', 'C. -40°C', 'D. -55°C'],
                    correct: 'B'
                },
                {
                    question: '南极科考站最多的国家是？',
                    options: ['A. 美国', 'B. 俄罗斯', 'C. 中国', 'D. 阿根廷'],
                    correct: 'B'
                },
                {
                    question: '南极圈大约位于哪个纬度？',
                    options: ['A. 66.5°N', 'B. 66.5°S', 'C. 23.5°N', 'D. 23.5°S'],
                    correct: 'B'
                },
                {
                    question: '南极洲的极昼极夜现象持续约？',
                    options: ['A. 1个月', 'B. 3个月', 'C. 6个月', 'D. 12个月'],
                    correct: 'C'
                },
                {
                    question: '南极冰盖的平均厚度约为？',
                    options: ['A. 1000米', 'B. 2000米', 'C. 3000米', 'D. 4000米'],
                    correct: 'B'
                },
                {
                    question: '《南极条约》签订于哪一年？',
                    options: ['A. 1949年', 'B. 1959年', 'C. 1969年', 'D. 1979年'],
                    correct: 'B'
                }
            ],
            bamboo_forest: [
                {
                    question: '大熊猫主要分布在中国的哪个省？',
                    options: ['A. 四川', 'B. 云南', 'C. 贵州', 'D. 湖南'],
                    correct: 'A'
                },
                {
                    question: '竹子属于哪种植物类型？',
                    options: ['A. 草本植物', 'B. 木本植物', 'C. 藤本植物', 'D. 苔藓植物'],
                    correct: 'A'
                },
                {
                    question: '大熊猫一天中大部分时间在做什么？',
                    options: ['A. 捕猎', 'B. 睡觉', 'C. 玩耍', 'D. 迁徙'],
                    correct: 'B'
                },
                {
                    question: '竹子生长最快的记录是一天长高？',
                    options: ['A. 10厘米', 'B. 50厘米', 'C. 100厘米', 'D. 150厘米'],
                    correct: 'C'
                },
                {
                    question: '大熊猫的爪子主要用于？',
                    options: ['A. 攀爬', 'B. 捕食', 'C. 挖掘', 'D. 防御'],
                    correct: 'A'
                },
                {
                    question: '中国竹林面积最大的省份是？',
                    options: ['A. 福建', 'B. 江西', 'C. 浙江', 'D. 四川'],
                    correct: 'D'
                },
                {
                    question: '竹子的中空结构是为了？',
                    options: ['A. 减轻重量', 'B. 储存水分', 'C. 传导营养', 'D. 抵抗风力'],
                    correct: 'D'
                },
                {
                    question: '大熊猫的视力如何？',
                    options: ['A. 很好', 'B. 一般', 'C. 较差', 'D. 失明'],
                    correct: 'C'
                },
                {
                    question: '竹子开花间隔通常是？',
                    options: ['A. 1-2年', 'B. 10-20年', 'C. 60-120年', 'D. 200年以上'],
                    correct: 'C'
                },
                {
                    question: '大熊猫的栖息地海拔通常在？',
                    options: ['A. 1000米以下', 'B. 1500-3000米', 'C. 4000-5000米', 'D. 6000米以上'],
                    correct: 'B'
                }
            ],
            desert: [
                {
                    question: '世界最大的沙漠是？',
                    options: ['A. 撒哈拉沙漠', 'B. 戈壁沙漠', 'C. 阿塔卡马沙漠', 'D. 南极洲沙漠'],
                    correct: 'D'
                },
                {
                    question: '骆驼的驼峰主要储存的是？',
                    options: ['A. 水', 'B. 脂肪', 'C. 蛋白质', 'D. 矿物质'],
                    correct: 'B'
                },
                {
                    question: '仙人掌的刺是什么器官的变态？',
                    options: ['A. 根', 'B. 茎', 'C. 叶', 'D. 花'],
                    correct: 'C'
                },
                {
                    question: '沙漠地区昼夜温差大的原因是？',
                    options: ['A. 纬度高', 'B. 海拔高', 'C. 水汽少', 'D. 植被少'],
                    correct: 'C'
                },
                {
                    question: '骆驼一次能喝多少水？',
                    options: ['A. 10升', 'B. 30升', 'C. 60升', 'D. 100升'],
                    correct: 'D'
                },
                {
                    question: '世界最热的大陆是？',
                    options: ['A. 亚洲', 'B. 非洲', 'C. 南美洲', 'D. 澳大利亚'],
                    correct: 'B'
                },
                {
                    question: '沙漠中的绿洲水源主要来自？',
                    options: ['A. 河流', 'B. 湖泊', 'C. 地下水', 'D. 降雨'],
                    correct: 'C'
                },
                {
                    question: '骆驼的睫毛有什么作用？',
                    options: ['A. 美观', 'B. 防沙', 'C. 保暖', 'D. 通讯'],
                    correct: 'B'
                },
                {
                    question: '沙漠化主要发生在哪个纬度带？',
                    options: ['A. 赤道', 'B. 副热带', 'C. 温带', 'D. 寒带'],
                    correct: 'B'
                },
                {
                    question: '骆驼的脚掌结构适应什么环境？',
                    options: ['A. 沼泽', 'B. 雪地', 'C. 沙地', 'D. 岩石'],
                    correct: 'C'
                }
            ],
            australia: [
                {
                    question: '澳大利亚位于哪个半球？',
                    options: ['A. 北半球', 'B. 南半球', 'C. 跨赤道', 'D. 东半球'],
                    correct: 'B'
                },
                {
                    question: '袋鼠属于哪个动物分类？',
                    options: ['A. 灵长类', 'B. 食肉类', 'C. 有袋类', 'D. 啮齿类'],
                    correct: 'C'
                },
                {
                    question: '澳大利亚的国宝动物是？',
                    options: ['A. 袋鼠', 'B. 考拉', 'C. 鸸鹋', 'D. 鸭嘴兽'],
                    correct: 'B'
                },
                {
                    question: '大堡礁位于澳大利亚的哪个海岸？',
                    options: ['A. 东海岸', 'B. 西海岸', 'C. 南海岸', 'D. 北海岸'],
                    correct: 'A'
                },
                {
                    question: '袋鼠一次能跳跃多远？',
                    options: ['A. 3米', 'B. 6米', 'C. 9米', 'D. 12米'],
                    correct: 'C'
                },
                {
                    question: '澳大利亚的首都是？',
                    options: ['A. 悉尼', 'B. 墨尔本', 'C. 堪培拉', 'D. 布里斯班'],
                    correct: 'C'
                },
                {
                    question: '桉树叶主要含有哪种化学物质？',
                    options: ['A. 维生素', 'B. 蛋白质', 'C. 桉树油', 'D. 糖分'],
                    correct: 'C'
                },
                {
                    question: '澳大利亚最大的沙漠是？',
                    options: ['A. 大维多利亚沙漠', 'B. 辛普森沙漠', 'C. 大沙沙漠', 'D. 塔纳米沙漠'],
                    correct: 'A'
                },
                {
                    question: '袋鼠的尾巴主要作用是？',
                    options: ['A. 攻击', 'B. 平衡', 'C. 游泳', 'D. 保暖'],
                    correct: 'B'
                },
                {
                    question: '澳大利亚特有的卵生哺乳动物是？',
                    options: ['A. 袋鼠', 'B. 考拉', 'C. 鸭嘴兽', 'D. 袋熊'],
                    correct: 'C'
                }
            ],
            arctic: [
                {
                    question: '北极熊主要分布在哪个地区？',
                    options: ['A. 北极圈', 'B. 南极圈', 'C. 温带', 'D. 热带'],
                    correct: 'A'
                },
                {
                    question: '北极熊的皮肤是什么颜色？',
                    options: ['A. 白色', 'B. 黑色', 'C. 灰色', 'D. 棕色'],
                    correct: 'B'
                },
                {
                    question: '北冰洋的面积约为？',
                    options: ['A. 1400万平方公里', 'B. 2400万平方公里', 'C. 3400万平方公里', 'D. 4400万平方公里'],
                    correct: 'A'
                },
                {
                    question: '北极熊主要捕食什么？',
                    options: ['A. 鱼类', 'B. 海豹', 'C. 鸟类', 'D. 植物'],
                    correct: 'B'
                },
                {
                    question: '北极圈大约位于哪个纬度？',
                    options: ['A. 66.5°N', 'B. 66.5°S', 'C. 23.5°N', 'D. 23.5°S'],
                    correct: 'A'
                },
                {
                    question: '北极熊的游泳速度可达？',
                    options: ['A. 3公里/小时', 'B. 6公里/小时', 'C. 9公里/小时', 'D. 12公里/小时'],
                    correct: 'B'
                },
                {
                    question: '北极地区最主要的原住民是？',
                    options: ['A. 印第安人', 'B. 因纽特人', 'C. 毛利人', 'D. 萨米人'],
                    correct: 'B'
                },
                {
                    question: '北极熊的嗅觉能闻到多远的猎物？',
                    options: ['A. 10公里', 'B. 20公里', 'C. 30公里', 'D. 40公里'],
                    correct: 'C'
                },
                {
                    question: '北冰洋的中央部分常年覆盖着？',
                    options: ['A. 浮冰', 'B. 陆地', 'C. 岛屿', 'D. 开放水域'],
                    correct: 'A'
                },
                {
                    question: '北极熊的冬眠期通常是？',
                    options: ['A. 不冬眠', 'B. 1-2个月', 'C. 3-4个月', 'D. 5-6个月'],
                    correct: 'A'
                }
            ]
        };
        
        // 随机选择当前动物
        this.currentAnimal = this.getRandomAnimal();
        
        // 当前问题
        this.currentQuestion = null;
        this.questionTimer = null;
        this.timeLeft = 10;
        
        this.init();
    }
    
    getRandomAnimal() {
        const animalKeys = Object.keys(this.animals);
        const randomKey = animalKeys[Math.floor(Math.random() * animalKeys.length)];
        return randomKey;
    }
    
    generateAnimalContent() {
        // 根据选择的动物生成对应的地图
        const animal = this.animals[this.currentAnimal];
        this.generateHabitatMaps(animal.maps);
        this.generateHabitatQuestions(animal.habitat);
    }
    
    generateHabitatMaps(mapTypes) {
        // 根据动物栖息地生成地图
        this.maps = [];
        
        mapTypes.forEach((mapType, index) => {
            let mapData = this.createMapByType(mapType, index);
            this.maps.push(mapData);
        });
    }
    
    createMapByType(mapType, index) {
        // 优先使用扩展地图配置
        if (typeof EXTENDED_MAP_TEMPLATES !== 'undefined' && EXTENDED_MAP_TEMPLATES[mapType]) {
            const template = JSON.parse(JSON.stringify(EXTENDED_MAP_TEMPLATES[mapType]));
            // 更新questionId
            template.terrain.forEach(t => {
                if (t.hasOwnProperty('questionId')) {
                    t.questionId = index * 5 + t.questionId % 5;
                }
            });
            return template;
        }
        
        // 回退到默认配置
        const mapTemplates = {
            antarctica: {
                name: '南极冰原',
                backgroundColor: '#e0f2f7',
                pathColor: '#b3d9e6',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_rock', x: 200, y: 200, width: 40, height: 60, questionId: index * 5 + 0 },
                    { type: 'ice_rock', x: 400, y: 150, width: 40, height: 60, questionId: index * 5 + 1 },
                    { type: 'ice_rock', x: 600, y: 380, width: 40, height: 60, questionId: index * 5 + 2 },
                    { type: 'ice_rock', x: 800, y: 220, width: 40, height: 60, questionId: index * 5 + 3 },
                    { type: 'ice_rock', x: 1000, y: 350, width: 40, height: 60, questionId: index * 5 + 4 },
                    { type: 'ice_decoration', x: 150, y: 100, width: 30, height: 40 },
                    { type: 'ice_decoration', x: 300, y: 400, width: 30, height: 40 },
                    { type: 'ice_decoration', x: 500, y: 120, width: 30, height: 40 },
                    { type: 'ice_decoration', x: 700, y: 450, width: 30, height: 40 },
                    { type: 'ice_decoration', x: 900, y: 180, width: 30, height: 40 }
                ]
            },
            bamboo_forest: {
                name: '竹林秘境',
                backgroundColor: '#2d5016',
                pathColor: '#8fbc8f',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'bamboo', x: 200, y: 200, width: 30, height: 70, questionId: index * 5 + 0 },
                    { type: 'bamboo', x: 400, y: 150, width: 30, height: 70, questionId: index * 5 + 1 },
                    { type: 'bamboo', x: 600, y: 380, width: 30, height: 70, questionId: index * 5 + 2 },
                    { type: 'bamboo', x: 800, y: 220, width: 30, height: 70, questionId: index * 5 + 3 },
                    { type: 'bamboo', x: 1000, y: 350, width: 30, height: 70, questionId: index * 5 + 4 },
                    { type: 'bamboo_decoration', x: 150, y: 100, width: 25, height: 50 },
                    { type: 'bamboo_decoration', x: 300, y: 400, width: 25, height: 50 },
                    { type: 'bamboo_decoration', x: 500, y: 120, width: 25, height: 50 },
                    { type: 'bamboo_decoration', x: 700, y: 450, width: 25, height: 50 },
                    { type: 'bamboo_decoration', x: 900, y: 180, width: 25, height: 50 }
                ]
            },
            desert: {
                name: '沙漠绿洲',
                backgroundColor: '#f4e4c1',
                pathColor: '#daa520',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'cactus', x: 200, y: 250, width: 35, height: 50, questionId: index * 5 + 0 },
                    { type: 'cactus', x: 400, y: 320, width: 35, height: 50, questionId: index * 5 + 1 },
                    { type: 'cactus', x: 600, y: 210, width: 35, height: 50, questionId: index * 5 + 2 },
                    { type: 'cactus', x: 800, y: 340, width: 35, height: 50, questionId: index * 5 + 3 },
                    { type: 'cactus', x: 1000, y: 260, width: 35, height: 50, questionId: index * 5 + 4 },
                    { type: 'sand_dune', x: 150, y: 400, width: 60, height: 40 },
                    { type: 'sand_dune', x: 350, y: 150, width: 50, height: 35 },
                    { type: 'sand_dune', x: 550, y: 420, width: 70, height: 45 },
                    { type: 'sand_dune', x: 750, y: 130, width: 55, height: 38 },
                    { type: 'sand_dune', x: 950, y: 410, width: 65, height: 42 }
                ]
            },
            australia_outback: {
                name: '澳洲内陆',
                backgroundColor: '#cd853f',
                pathColor: '#daa520',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'eucalyptus', x: 200, y: 240, width: 40, height: 60, questionId: index * 5 + 0 },
                    { type: 'eucalyptus', x: 400, y: 310, width: 40, height: 60, questionId: index * 5 + 1 },
                    { type: 'eucalyptus', x: 600, y: 200, width: 40, height: 60, questionId: index * 5 + 2 },
                    { type: 'eucalyptus', x: 800, y: 330, width: 40, height: 60, questionId: index * 5 + 3 },
                    { type: 'eucalyptus', x: 1000, y: 250, width: 40, height: 60, questionId: index * 5 + 4 },
                    { type: 'rock_decoration', x: 150, y: 400, width: 35, height: 25 },
                    { type: 'rock_decoration', x: 350, y: 150, width: 30, height: 20 },
                    { type: 'rock_decoration', x: 550, y: 420, width: 40, height: 28 },
                    { type: 'rock_decoration', x: 750, y: 130, width: 32, height: 22 },
                    { type: 'rock_decoration', x: 950, y: 410, width: 38, height: 26 }
                ]
            },
            arctic_ice: {
                name: '北极冰原',
                backgroundColor: '#f0f8ff',
                pathColor: '#b0c4de',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_block', x: 200, y: 230, width: 45, height: 50, questionId: index * 5 + 0 },
                    { type: 'ice_block', x: 400, y: 300, width: 45, height: 50, questionId: index * 5 + 1 },
                    { type: 'ice_block', x: 600, y: 190, width: 45, height: 50, questionId: index * 5 + 2 },
                    { type: 'ice_block', x: 800, y: 320, width: 45, height: 50, questionId: index * 5 + 3 },
                    { type: 'ice_block', x: 1000, y: 240, width: 45, height: 50, questionId: index * 5 + 4 },
                    { type: 'snow_decoration', x: 150, y: 400, width: 25, height: 25 },
                    { type: 'snow_decoration', x: 350, y: 150, width: 20, height: 20 },
                    { type: 'snow_decoration', x: 550, y: 420, width: 30, height: 30 },
                    { type: 'snow_decoration', x: 750, y: 130, width: 22, height: 22 },
                    { type: 'snow_decoration', x: 950, y: 410, width: 28, height: 28 }
                ]
            },
            ocean: {
                name: '海洋世界',
                backgroundColor: '#4682b4',
                pathColor: '#5f9ea0',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_rock', x: 200, y: 220, width: 40, height: 50, questionId: index * 5 + 0 },
                    { type: 'ice_rock', x: 400, y: 290, width: 40, height: 50, questionId: index * 5 + 1 },
                    { type: 'ice_rock', x: 600, y: 200, width: 40, height: 50, questionId: index * 5 + 2 },
                    { type: 'ice_rock', x: 800, y: 310, width: 40, height: 50, questionId: index * 5 + 3 },
                    { type: 'ice_rock', x: 1000, y: 240, width: 40, height: 50, questionId: index * 5 + 4 },
                    { type: 'ice_decoration', x: 150, y: 380, width: 30, height: 30 },
                    { type: 'ice_decoration', x: 350, y: 140, width: 25, height: 25 },
                    { type: 'ice_decoration', x: 550, y: 400, width: 35, height: 35 },
                    { type: 'ice_decoration', x: 750, y: 120, width: 28, height: 28 },
                    { type: 'ice_decoration', x: 950, y: 390, width: 32, height: 32 }
                ]
            },
            ice_cave: {
                name: '冰雪洞穴',
                backgroundColor: '#b0e0e6',
                pathColor: '#add8e6',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_block', x: 200, y: 210, width: 45, height: 55, questionId: index * 5 + 0 },
                    { type: 'ice_block', x: 400, y: 280, width: 45, height: 55, questionId: index * 5 + 1 },
                    { type: 'ice_block', x: 600, y: 180, width: 45, height: 55, questionId: index * 5 + 2 },
                    { type: 'ice_block', x: 800, y: 300, width: 45, height: 55, questionId: index * 5 + 3 },
                    { type: 'ice_block', x: 1000, y: 230, width: 45, height: 55, questionId: index * 5 + 4 },
                    { type: 'snow_decoration', x: 150, y: 390, width: 30, height: 30 },
                    { type: 'snow_decoration', x: 350, y: 130, width: 25, height: 25 },
                    { type: 'snow_decoration', x: 550, y: 410, width: 35, height: 35 },
                    { type: 'snow_decoration', x: 750, y: 110, width: 28, height: 28 },
                    { type: 'snow_decoration', x: 950, y: 400, width: 32, height: 32 }
                ]
            },
            mountain: {
                name: '高山峻岭',
                backgroundColor: '#8b7355',
                pathColor: '#a0826d',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'bamboo', x: 200, y: 210, width: 30, height: 65, questionId: index * 5 + 0 },
                    { type: 'bamboo', x: 400, y: 160, width: 30, height: 65, questionId: index * 5 + 1 },
                    { type: 'bamboo', x: 600, y: 370, width: 30, height: 65, questionId: index * 5 + 2 },
                    { type: 'bamboo', x: 800, y: 230, width: 30, height: 65, questionId: index * 5 + 3 },
                    { type: 'bamboo', x: 1000, y: 340, width: 30, height: 65, questionId: index * 5 + 4 },
                    { type: 'rock_decoration', x: 150, y: 390, width: 35, height: 30 },
                    { type: 'rock_decoration', x: 350, y: 140, width: 30, height: 25 },
                    { type: 'rock_decoration', x: 550, y: 410, width: 40, height: 32 },
                    { type: 'rock_decoration', x: 750, y: 120, width: 32, height: 27 },
                    { type: 'rock_decoration', x: 950, y: 400, width: 38, height: 30 }
                ]
            },
            river_valley: {
                name: '河谷秘境',
                backgroundColor: '#6b8e23',
                pathColor: '#9acd32',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'bamboo', x: 200, y: 190, width: 30, height: 75, questionId: index * 5 + 0 },
                    { type: 'bamboo', x: 400, y: 140, width: 30, height: 75, questionId: index * 5 + 1 },
                    { type: 'bamboo', x: 600, y: 390, width: 30, height: 75, questionId: index * 5 + 2 },
                    { type: 'bamboo', x: 800, y: 210, width: 30, height: 75, questionId: index * 5 + 3 },
                    { type: 'bamboo', x: 1000, y: 360, width: 30, height: 75, questionId: index * 5 + 4 },
                    { type: 'bamboo_decoration', x: 150, y: 110, width: 25, height: 55 },
                    { type: 'bamboo_decoration', x: 300, y: 410, width: 25, height: 55 },
                    { type: 'bamboo_decoration', x: 500, y: 130, width: 25, height: 55 },
                    { type: 'bamboo_decoration', x: 700, y: 460, width: 25, height: 55 },
                    { type: 'bamboo_decoration', x: 900, y: 190, width: 25, height: 55 }
                ]
            },
            oasis: {
                name: '沙漠绿洲',
                backgroundColor: '#deb887',
                pathColor: '#f0e68c',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'cactus', x: 200, y: 240, width: 35, height: 55, questionId: index * 5 + 0 },
                    { type: 'cactus', x: 400, y: 310, width: 35, height: 55, questionId: index * 5 + 1 },
                    { type: 'cactus', x: 600, y: 200, width: 35, height: 55, questionId: index * 5 + 2 },
                    { type: 'cactus', x: 800, y: 330, width: 35, height: 55, questionId: index * 5 + 3 },
                    { type: 'cactus', x: 1000, y: 250, width: 35, height: 55, questionId: index * 5 + 4 },
                    { type: 'sand_dune', x: 150, y: 390, width: 60, height: 45 },
                    { type: 'sand_dune', x: 350, y: 140, width: 50, height: 38 },
                    { type: 'sand_dune', x: 550, y: 410, width: 70, height: 48 },
                    { type: 'sand_dune', x: 750, y: 120, width: 55, height: 40 },
                    { type: 'sand_dune', x: 950, y: 400, width: 65, height: 45 }
                ]
            },
            sand_dunes: {
                name: '流沙之地',
                backgroundColor: '#f5deb3',
                pathColor: '#daa520',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'cactus', x: 200, y: 260, width: 35, height: 45, questionId: index * 5 + 0 },
                    { type: 'cactus', x: 400, y: 330, width: 35, height: 45, questionId: index * 5 + 1 },
                    { type: 'cactus', x: 600, y: 220, width: 35, height: 45, questionId: index * 5 + 2 },
                    { type: 'cactus', x: 800, y: 350, width: 35, height: 45, questionId: index * 5 + 3 },
                    { type: 'cactus', x: 1000, y: 270, width: 35, height: 45, questionId: index * 5 + 4 },
                    { type: 'sand_dune', x: 150, y: 410, width: 65, height: 42 },
                    { type: 'sand_dune', x: 350, y: 160, width: 55, height: 36 },
                    { type: 'sand_dune', x: 550, y: 430, width: 75, height: 46 },
                    { type: 'sand_dune', x: 750, y: 140, width: 60, height: 38 },
                    { type: 'sand_dune', x: 950, y: 420, width: 70, height: 44 }
                ]
            },
            eucalyptus_forest: {
                name: '桉树林',
                backgroundColor: '#8fbc8f',
                pathColor: '#9acd32',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'eucalyptus', x: 200, y: 230, width: 40, height: 65, questionId: index * 5 + 0 },
                    { type: 'eucalyptus', x: 400, y: 300, width: 40, height: 65, questionId: index * 5 + 1 },
                    { type: 'eucalyptus', x: 600, y: 190, width: 40, height: 65, questionId: index * 5 + 2 },
                    { type: 'eucalyptus', x: 800, y: 320, width: 40, height: 65, questionId: index * 5 + 3 },
                    { type: 'eucalyptus', x: 1000, y: 240, width: 40, height: 65, questionId: index * 5 + 4 },
                    { type: 'rock_decoration', x: 150, y: 390, width: 35, height: 28 },
                    { type: 'rock_decoration', x: 350, y: 140, width: 30, height: 23 },
                    { type: 'rock_decoration', x: 550, y: 410, width: 40, height: 30 },
                    { type: 'rock_decoration', x: 750, y: 120, width: 32, height: 25 },
                    { type: 'rock_decoration', x: 950, y: 400, width: 38, height: 28 }
                ]
            },
            great_barrier_reef: {
                name: '大堡礁',
                backgroundColor: '#00ced1',
                pathColor: '#48d1cc',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'eucalyptus', x: 200, y: 250, width: 40, height: 55, questionId: index * 5 + 0 },
                    { type: 'eucalyptus', x: 400, y: 320, width: 40, height: 55, questionId: index * 5 + 1 },
                    { type: 'eucalyptus', x: 600, y: 210, width: 40, height: 55, questionId: index * 5 + 2 },
                    { type: 'eucalyptus', x: 800, y: 340, width: 40, height: 55, questionId: index * 5 + 3 },
                    { type: 'eucalyptus', x: 1000, y: 260, width: 40, height: 55, questionId: index * 5 + 4 },
                    { type: 'rock_decoration', x: 150, y: 400, width: 35, height: 25 },
                    { type: 'rock_decoration', x: 350, y: 150, width: 30, height: 20 },
                    { type: 'rock_decoration', x: 550, y: 420, width: 40, height: 28 },
                    { type: 'rock_decoration', x: 750, y: 130, width: 32, height: 22 },
                    { type: 'rock_decoration', x: 950, y: 410, width: 38, height: 26 }
                ]
            },
            tundra: {
                name: '冻土苔原',
                backgroundColor: '#d3d3d3',
                pathColor: '#c0c0c0',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_block', x: 200, y: 220, width: 45, height: 52, questionId: index * 5 + 0 },
                    { type: 'ice_block', x: 400, y: 290, width: 45, height: 52, questionId: index * 5 + 1 },
                    { type: 'ice_block', x: 600, y: 180, width: 45, height: 52, questionId: index * 5 + 2 },
                    { type: 'ice_block', x: 800, y: 310, width: 45, height: 52, questionId: index * 5 + 3 },
                    { type: 'ice_block', x: 1000, y: 230, width: 45, height: 52, questionId: index * 5 + 4 },
                    { type: 'snow_decoration', x: 150, y: 380, width: 28, height: 28 },
                    { type: 'snow_decoration', x: 350, y: 140, width: 23, height: 23 },
                    { type: 'snow_decoration', x: 550, y: 400, width: 32, height: 32 },
                    { type: 'snow_decoration', x: 750, y: 120, width: 25, height: 25 },
                    { type: 'snow_decoration', x: 950, y: 390, width: 30, height: 30 }
                ]
            },
            frozen_ocean: {
                name: '冰封海洋',
                backgroundColor: '#afeeee',
                pathColor: '#b0e0e6',
                terrain: [
                    { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
                    { type: 'ice_block', x: 200, y: 240, width: 45, height: 48, questionId: index * 5 + 0 },
                    { type: 'ice_block', x: 400, y: 310, width: 45, height: 48, questionId: index * 5 + 1 },
                    { type: 'ice_block', x: 600, y: 200, width: 45, height: 48, questionId: index * 5 + 2 },
                    { type: 'ice_block', x: 800, y: 330, width: 45, height: 48, questionId: index * 5 + 3 },
                    { type: 'ice_block', x: 1000, y: 250, width: 45, height: 48, questionId: index * 5 + 4 },
                    { type: 'snow_decoration', x: 150, y: 400, width: 26, height: 26 },
                    { type: 'snow_decoration', x: 350, y: 160, width: 22, height: 22 },
                    { type: 'snow_decoration', x: 550, y: 420, width: 30, height: 30 },
                    { type: 'snow_decoration', x: 750, y: 140, width: 24, height: 24 },
                    { type: 'snow_decoration', x: 950, y: 410, width: 28, height: 28 }
                ]
            }
        };
        
        const template = mapTemplates[mapType] || mapTemplates.antarctica;
        
        return {
            ...template,
            width: 1200,
            height: 600,
            startX: 50,
            startY: 300,
            endX: 1100,
            endY: 300,
            completed: []
        };
    }
    
    generateHabitatQuestions(habitat) {
        this.questions = [];
        let questionId = 0;
        
        // 为每张地图生成题目
        this.maps.forEach((map, mapIndex) => {
            const mapName = this.animals[this.currentAnimal].maps[mapIndex];
            
            // 优先使用扩展题库
            if (typeof EXTENDED_QUESTION_BANK !== 'undefined' && EXTENDED_QUESTION_BANK[mapName]) {
                const bank = EXTENDED_QUESTION_BANK[mapName];
                const shuffled = this.shuffleArray([...bank]);
                
                // 每张地图随机抽取5题
                for (let i = 0; i < 5; i++) {
                    const question = shuffled[i % shuffled.length];
                    this.questions.push({
                        id: questionId++,
                        question: question.question,
                        options: question.options,
                        correct: question.correct,
                        type: question.type || '综合'
                    });
                }
            } else {
                // 回退到默认题库
                const bank = this.habitatQuestionBank[habitat] || this.habitatQuestionBank.antarctica;
                const shuffled = this.shuffleArray([...bank]);
                
                // 每张地图需要5题，如果题库不够就循环使用
                for (let i = 0; i < 5; i++) {
                    const question = shuffled[i % shuffled.length];
                    this.questions.push({
                        id: questionId++,
                        question: question.question,
                        options: question.options,
                        correct: question.correct
                    });
                }
            }
        });
    }
    
    generateRandomQuestions() {
        // 这个方法现在由 generateHabitatQuestions 替代
    }
    
    randomizeQuestions() {
        // 为每张地图随机分配问题
        this.maps.forEach((map, mapIndex) => {
            // 获取该地图类型对应的问题（每张地图5道题）
            const startId = mapIndex * 5;
            const endId = startId + 4;
            let questionPool = this.questions.filter(q => q.id >= startId && q.id <= endId);
            
            // 如果题目池为空，跳过这张地图
            if (questionPool.length === 0) {
                return;
            }
            
            // 随机打乱问题顺序
            questionPool = this.shuffleArray(questionPool);
            
            // 为地图中的障碍物分配问题
            let questionIndex = 0;
            map.terrain.forEach(terrain => {
                if (terrain.hasOwnProperty('questionId') && questionIndex < questionPool.length) {
                    terrain.questionId = questionPool[questionIndex].id;
                    questionIndex++;
                }
            });
        });
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    init() {
        // 设置游戏大厅的事件监听
        this.setupLobby();
        
        // 设置游戏事件监听器
        this.setupEventListeners();
    }
    
    setupLobby() {
        const gameLobby = document.getElementById('game-lobby');
        const animalSelectionScreen = document.getElementById('animal-selection-screen');
        const startGameMenuBtn = document.getElementById('start-game-menu-btn');
        
        // 确保元素存在
        if (!startGameMenuBtn) {
            console.error('找不到开始游戏按钮');
            return;
        }
        
        // 游戏大厅 - 开始游戏按钮
        startGameMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('开始游戏按钮被点击');
            
            if (gameLobby) gameLobby.classList.add('hidden');
            if (animalSelectionScreen) animalSelectionScreen.classList.remove('hidden');
        });
        
        // 动物选择界面
        this.setupAnimalSelection();
    }
    
    setupAnimalSelection() {
        const animalSelectionScreen = document.getElementById('animal-selection-screen');
        const gameLobby = document.getElementById('game-lobby');
        const animalCards = document.querySelectorAll('.animal-card');
        const confirmAnimalBtn = document.getElementById('confirm-animal-btn');
        const backToLobbyBtn = document.getElementById('back-to-lobby-btn');
        
        if (!animalCards.length || !confirmAnimalBtn || !backToLobbyBtn) {
            console.error('动物选择界面元素缺失');
            return;
        }
        
        // 动物卡片选择
        animalCards.forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const animal = card.dataset.animal;
                console.log('选择动物:', animal);
                
                // 移除所有选中状态
                animalCards.forEach(c => c.classList.remove('selected'));
                
                // 添加当前选中状态
                card.classList.add('selected');
                
                // 保存选择
                this.selectedAnimal = animal;
                
                // 启用确认按钮
                confirmAnimalBtn.disabled = false;
                confirmAnimalBtn.style.opacity = '1';
                confirmAnimalBtn.style.cursor = 'pointer';
            });
        });
        
        // 确认选择按钮
        confirmAnimalBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (!this.selectedAnimal) {
                alert('请先选择一个动物！');
                return;
            }
            
            console.log('确认选择，开始游戏:', this.selectedAnimal);
            
            this.currentAnimal = this.selectedAnimal;
            this.player.animal = this.currentAnimal;
            
            // 隐藏动物选择界面
            if (animalSelectionScreen) animalSelectionScreen.classList.add('hidden');
            
            // 显示游戏相关元素
            this.showGameUI();
            
            // 生成游戏内容
            this.generateAnimalContent();
            
            // 启动游戏
            this.updateUI();
            this.gameStarted = true;
            this.gameLoop();
        });
        
        // 返回按钮
        backToLobbyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('返回主页');
            
            if (animalSelectionScreen) animalSelectionScreen.classList.add('hidden');
            if (gameLobby) gameLobby.classList.remove('hidden');
            
            // 重置选择
            animalCards.forEach(c => c.classList.remove('selected'));
            this.selectedAnimal = null;
            confirmAnimalBtn.disabled = true;
            confirmAnimalBtn.style.opacity = '0.5';
        });
    }
    
    showGameUI() {
        // 显示游戏控制按钮
        const gameControls = document.getElementById('game-controls');
        if (gameControls) gameControls.classList.remove('hidden');
        
        // 显示顶部和底部信息栏
        const gameHeader = document.getElementById('game-header');
        const gameFooter = document.getElementById('game-footer');
        if (gameHeader) gameHeader.classList.remove('hidden');
        if (gameFooter) gameFooter.classList.remove('hidden');
        
        // 显示游戏画布
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) canvasContainer.classList.remove('hidden');
    }
    
    hideGameUI() {
        // 隐藏游戏控制按钮
        const gameControls = document.getElementById('game-controls');
        if (gameControls) gameControls.classList.add('hidden');
        
        // 隐藏顶部和底部信息栏
        const gameHeader = document.getElementById('game-header');
        const gameFooter = document.getElementById('game-footer');
        if (gameHeader) gameHeader.classList.add('hidden');
        if (gameFooter) gameFooter.classList.add('hidden');
        
        // 隐藏游戏画布
        const canvasContainer = document.getElementById('canvas-container');
        if (canvasContainer) canvasContainer.classList.add('hidden');
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
                e.preventDefault();
            }
        });
        
        // 答案按钮
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const answer = e.target.dataset.answer;
                this.checkAnswer(answer);
            });
        });
        
        // 重新开始按钮
        document.querySelector('.restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        // 暂停游戏按钮
        const pauseBtn = document.getElementById('pause-game-btn');
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                this.togglePause();
            });
        }
        
        // 退出游戏按钮
        const exitBtn = document.getElementById('exit-game-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitGame();
            });
        }
    }
    
    togglePause() {
        this.isRunning = !this.isRunning;
        const pauseBtn = document.getElementById('pause-game-btn');
        if (pauseBtn) {
            pauseBtn.textContent = this.isRunning ? '⏸️ 暂停' : '▶️ 继续';
        }
        if (this.isRunning) {
            this.gameLoop();
        }
    }
    
    exitGame() {
        // 确认退出
        if (confirm('确定要退出当前游戏吗？进度将不会保存。')) {
            this.isRunning = false;
            this.gameStarted = false;
            
            // 隐藏所有游戏UI
            this.hideGameUI();
            
            // 返回游戏大厅
            const gameLobby = document.getElementById('game-lobby');
            if (gameLobby) {
                gameLobby.classList.remove('hidden');
            }
            
            // 重置游戏状态
            this.currentMap = 0;
            this.health = 10;
            this.correctAnswers = 0;
            this.totalQuestions = 0;
            this.selectedAnimal = null;
            this.currentAnimal = null;
            this.player.x = 50;
            this.player.y = 300;
            this.player.animal = null;
            this.maps = [];
            
            // 重置动物卡片选择状态
            document.querySelectorAll('.animal-card').forEach(card => {
                card.classList.remove('selected');
            });
            
            // 禁用确认按钮
            const confirmBtn = document.getElementById('confirm-animal-btn');
            if (confirmBtn) {
                confirmBtn.disabled = true;
            }
        }
    }
    
    updatePlayer() {
        // 键盘移动控制
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
        
        // 检查是否到达终点
        this.checkEndPoint();
    }
    
    checkCollisions() {
        const currentMapData = this.maps[this.currentMap];
        
        for (let terrain of currentMapData.terrain) {
            // 只检查有questionId的地形元素
            if (!terrain.hasOwnProperty('questionId')) continue;
            
            // 检查是否已完成
            if (currentMapData.completed.includes(terrain.questionId)) {
                continue;
            }
            
            // 碰撞检测
            if (this.player.x < terrain.x + terrain.width &&
                this.player.x + this.player.width > terrain.x &&
                this.player.y < terrain.y + terrain.height &&
                this.player.y + this.player.height > terrain.y) {
                
                // 触发问题
                this.triggerQuestion(terrain.questionId);
                // 碰撞后稍微后退，避免重复触发
                this.player.x -= this.player.speed * 2;
                break;
            }
        }
    }
    
    checkEndPoint() {
        const currentMapData = this.maps[this.currentMap];
        
        // 检查是否接近终点
        const distance = Math.sqrt(
            Math.pow(this.player.x - currentMapData.endX, 2) + 
            Math.pow(this.player.y - currentMapData.endY, 2)
        );
        
        if (distance < 50 && currentMapData.completed.length === currentMapData.terrain.filter(t => t.hasOwnProperty('questionId')).length) {
            // 完成当前地图
            this.completeMap();
        }
    }
    
    completeMap() {
        // 检查是否还有下一张地图
        if (this.currentMap < this.maps.length - 1) {
            this.currentMap++;
            // 重置玩家位置到新地图的起点
            const newMapData = this.maps[this.currentMap];
            this.player.x = newMapData.startX;
            this.player.y = newMapData.startY;
            this.updateUI();
        } else {
            // 所有地图完成，游戏胜利
            this.gameWin();
        }
    }
    
    triggerQuestion(questionId) {
        if (this.currentQuestion) return; // 已有问题在进行
        
        this.currentQuestion = this.questions.find(q => q.id === questionId);
        if (!this.currentQuestion) return;
        
        // 显示问题
        document.getElementById('question-text').textContent = this.currentQuestion.question;
        document.querySelectorAll('.answer-btn').forEach((btn, index) => {
            btn.textContent = this.currentQuestion.options[index];
        });
        
        // 显示模态框
        document.getElementById('question-modal').classList.remove('hidden');
        
        // 开始倒计时
        this.timeLeft = 10;
        this.updateTimer();
        this.questionTimer = setInterval(() => {
            this.timeLeft--;
            this.updateTimer();
            
            if (this.timeLeft <= 0) {
                this.checkAnswer(''); // 超时算错误
            }
        }, 1000);
    }
    
    updateTimer() {
        document.getElementById('timer').textContent = this.timeLeft;
    }
    
    checkAnswer(answer) {
        clearInterval(this.questionTimer);
        
        const isCorrect = answer === this.currentQuestion.correct;
        this.totalQuestions++;
        
        if (isCorrect) {
            this.correctAnswers++;
            // 标记障碍物为已完成
            this.maps[this.currentMap].completed.push(this.currentQuestion.id);
            // 随机奖励（这里可以添加更多奖励逻辑）
        } else {
            this.health--;
            this.updateHealthDisplay();
        }
        
        // 隐藏模态框
        document.getElementById('question-modal').classList.add('hidden');
        this.currentQuestion = null;
        
        // 更新进度
        this.updateUI();
        
        // 检查游戏状态
        this.checkGameStatus();
    }
    
    updateHealthDisplay() {
        const hearts = document.querySelectorAll('.heart');
        hearts.forEach((heart, index) => {
            if (index < this.health) {
                heart.textContent = '❤️';
                heart.style.opacity = '1';
            } else {
                heart.textContent = '💔';
                heart.style.opacity = '0.5';
            }
        });
    }
    
    updateUI() {
        // 更新动物信息
        const animal = this.animals[this.currentAnimal];
        document.getElementById('animal-name').textContent = animal.name;
        
        // 更新地图信息
        document.getElementById('map-name').textContent = this.maps[this.currentMap].name;
        const totalQuestions = this.maps[this.currentMap].terrain.filter(t => t.hasOwnProperty('questionId')).length;
        const completed = this.maps[this.currentMap].completed.length;
        document.getElementById('map-progress').textContent = `${completed}/${totalQuestions}`;
        
        // 更新生命值显示
        this.updateHealthDisplay();
        
        // 更新画布大小以适应新地图
        const currentMapData = this.maps[this.currentMap];
        if (this.canvas.width !== currentMapData.width || this.canvas.height !== currentMapData.height) {
            this.canvas.width = currentMapData.width;
            this.canvas.height = currentMapData.height;
        }
    }
    
    checkGameStatus() {
        // 检查生命值
        if (this.health <= 0) {
            this.gameOver();
            return;
        }
    }
    
    gameOver() {
        this.isRunning = false;
        document.getElementById('correct-answers').textContent = this.correctAnswers;
        const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    gameWin() {
        this.isRunning = false;
        document.getElementById('correct-answers').textContent = this.correctAnswers;
        const accuracy = this.totalQuestions > 0 ? Math.round((this.correctAnswers / this.totalQuestions) * 100) : 0;
        document.getElementById('accuracy').textContent = `${accuracy}%`;
        document.querySelector('.game-over-content h2').textContent = '恭喜通关！';
        document.querySelector('.game-over-content p').textContent = '你已经完成了所有地图的挑战！';
        document.getElementById('game-over').classList.remove('hidden');
    }
    
    restart() {
        // 重置游戏状态
        this.currentMap = 0;
        this.health = 10;
        this.correctAnswers = 0;
        this.totalQuestions = 0;
        this.isRunning = true;
        this.gameStarted = false;
        this.selectedAnimal = null;
        this.currentAnimal = null;
        
        // 重置玩家位置
        this.player.x = 50;
        this.player.y = 300;
        this.player.animal = null;
        
        // 清空地图
        this.maps = [];
        
        // 隐藏游戏结束界面
        document.getElementById('game-over').classList.add('hidden');
        
        // 显示游戏大厅
        const gameLobby = document.getElementById('game-lobby');
        gameLobby.classList.remove('hidden');
        
        // 重置动物卡片选择状态
        document.querySelectorAll('.animal-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // 禁用确认按钮
        document.getElementById('confirm-animal-btn').disabled = true;
    }
    
    draw() {
        const currentMapData = this.maps[this.currentMap];
        
        // 清空画布并设置背景色
        this.ctx.fillStyle = currentMapData.backgroundColor;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制地形元素
        currentMapData.terrain.forEach(terrain => {
            this.drawTerrain(terrain);
        });
        
        // 绘制起点和终点标记
        this.drawStartEndPoints();
        
        // 绘制玩家角色
        this.drawPlayer();
    }
    
    drawTerrain(terrain) {
        const currentMapData = this.maps[this.currentMap];
        const isCompleted = terrain.hasOwnProperty('questionId') && 
                           currentMapData.completed.includes(terrain.questionId);
        
        switch(terrain.type) {
            case 'path':
                // 绘制路径
                this.ctx.fillStyle = currentMapData.pathColor;
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                // 添加路径纹理
                this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                this.ctx.lineWidth = 1;
                for (let i = 0; i < terrain.width; i += 20) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(terrain.x + i, terrain.y);
                    this.ctx.lineTo(terrain.x + i, terrain.y + terrain.height);
                    this.ctx.stroke();
                }
                break;
                
            case 'ice_rock':
                // 绘制冰岩
                this.drawIceRock(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'ice_decoration':
                // 绘制装饰性冰块
                this.ctx.fillStyle = '#b3d9e6';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#87ceeb';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            case 'bamboo':
                // 绘制竹子
                this.drawBamboo(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'bamboo_decoration':
                // 绘制装饰性竹子
                this.ctx.fillStyle = '#90ee90';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#228b22';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            case 'cactus':
                // 绘制仙人掌
                this.drawCactus(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'sand_dune':
                // 绘制沙丘
                this.ctx.fillStyle = '#f4e4c1';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#daa520';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            case 'eucalyptus':
                // 绘制桉树
                this.drawEucalyptus(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'rock_decoration':
                // 绘制装饰性岩石
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#2f4f4f';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            case 'ice_block':
                // 绘制冰块
                this.drawIceBlock(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'snow_decoration':
                // 绘制装饰性雪堆
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#f0f8ff';
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            // 保留原有的地形类型
            case 'tree':
                this.drawTree(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'crystal':
                this.drawCrystal(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'volcanic':
                this.drawVolcanicRock(terrain.x, terrain.y, terrain.width, terrain.height, isCompleted);
                break;
                
            case 'rock':
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.strokeStyle = '#2f4f4f';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(terrain.x, terrain.y, terrain.width, terrain.height);
                break;
                
            case 'decoration':
                if (currentMapData.name === '神秘森林') {
                    this.drawTree(terrain.x, terrain.y, terrain.width, terrain.height, false, true);
                } else if (currentMapData.name === '水晶洞穴') {
                    this.drawCrystal(terrain.x, terrain.y, terrain.width, terrain.height, false, true);
                }
                break;
                
            case 'stalactite':
                this.ctx.fillStyle = '#708090';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.fillStyle = '#2f4f4f';
                this.ctx.fillRect(terrain.x + 2, terrain.y + 2, terrain.width - 4, 4);
                break;
                
            case 'lava':
                const gradient = this.ctx.createRadialGradient(
                    terrain.x + terrain.width/2, terrain.y + terrain.height/2, 0,
                    terrain.x + terrain.width/2, terrain.y + terrain.height/2, Math.max(terrain.width, terrain.height)/2
                );
                gradient.addColorStop(0, '#ff6347');
                gradient.addColorStop(0.5, '#ff4500');
                gradient.addColorStop(1, '#8b0000');
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                
                // 添加熔岩气泡效果
                this.ctx.fillStyle = 'rgba(255, 255, 0, 0.6)';
                for (let i = 0; i < 3; i++) {
                    const bubbleX = terrain.x + Math.random() * terrain.width;
                    const bubbleY = terrain.y + Math.random() * terrain.height;
                    const bubbleSize = 2 + Math.random() * 4;
                    this.ctx.beginPath();
                    this.ctx.arc(bubbleX, bubbleY, bubbleSize, 0, Math.PI * 2);
                    this.ctx.fill();
                }
                break;
                
            case 'ash':
                this.ctx.fillStyle = '#696969';
                this.ctx.fillRect(terrain.x, terrain.y, terrain.width, terrain.height);
                this.ctx.fillStyle = 'rgba(105, 105, 105, 0.5)';
                this.ctx.fillRect(terrain.x + 2, terrain.y + 2, terrain.width - 4, terrain.height - 4);
                break;
        }
    }
    
    drawTree(x, y, width, height, isCompleted, isSmall = false) {
        // 树干
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(x + width/3, y + height/2, width/3, height/2);
        
        // 树叶
        this.ctx.fillStyle = isCompleted ? '#90ee90' : '#228b22';
        if (isSmall) {
            // 小装饰树
            this.ctx.fillRect(x, y, width, height * 0.7);
        } else {
            // 大障碍树
            this.ctx.fillRect(x, y, width, height * 0.6);
            this.ctx.fillRect(x - width/4, y + height * 0.2, width * 1.5, height * 0.4);
        }
        
        // 树叶纹理
        this.ctx.strokeStyle = isCompleted ? '#7cfc00' : '#006400';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height * 0.6);
    }
    
    drawCrystal(x, y, width, height, isCompleted, isSmall = false) {
        // 水晶主体
        const gradient = this.ctx.createLinearGradient(x, y, x, y + height);
        if (isCompleted) {
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(1, '#4682b4');
        } else {
            gradient.addColorStop(0, '#9370db');
            gradient.addColorStop(1, '#4b0082');
        }
        this.ctx.fillStyle = gradient;
        
        // 绘制水晶形状
        this.ctx.beginPath();
        this.ctx.moveTo(x + width/2, y);
        this.ctx.lineTo(x + width, y + height/3);
        this.ctx.lineTo(x + width * 0.8, y + height);
        this.ctx.lineTo(x + width * 0.2, y + height);
        this.ctx.lineTo(x, y + height/3);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 水晶光泽
        this.ctx.strokeStyle = isCompleted ? '#b0e0e6' : '#dda0dd';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawVolcanicRock(x, y, width, height, isCompleted) {
        // 火山岩主体
        this.ctx.fillStyle = isCompleted ? '#cd853f' : '#8b4513';
        this.ctx.fillRect(x, y, width, height);
        
        // 火山岩纹理
        this.ctx.strokeStyle = isCompleted ? '#daa520' : '#654321';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 添加裂纹效果
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width/3, y);
        this.ctx.lineTo(x + width/3, y + height);
        this.ctx.moveTo(x + 2*width/3, y);
        this.ctx.lineTo(x + 2*width/3, y + height);
        this.ctx.stroke();
    }
    
    drawStartEndPoints() {
        const currentMapData = this.maps[this.currentMap];
        
        // 绘制起点
        this.ctx.fillStyle = '#32cd32';
        this.ctx.fillRect(currentMapData.startX - 20, currentMapData.startY - 20, 40, 40);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 20px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('S', currentMapData.startX, currentMapData.startY);
        
        // 绘制终点
        this.ctx.fillStyle = '#ff6347';
        this.ctx.fillRect(currentMapData.endX - 20, currentMapData.endY - 20, 40, 40);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillText('E', currentMapData.endX, currentMapData.endY);
        
        // 绘制方向箭头
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(currentMapData.startX + 20, currentMapData.startY);
        this.ctx.lineTo(currentMapData.endX - 20, currentMapData.endY);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    drawPlayer() {
        const x = this.player.x;
        const y = this.player.y;
        const animal = this.animals[this.player.animal];
        
        this.ctx.fillStyle = animal.color;
        
        switch(this.player.animal) {
            case 'penguin':
                this.drawPenguin(x, y);
                break;
            case 'panda':
                this.drawPanda(x, y);
                break;
            case 'camel':
                this.drawCamel(x, y);
                break;
            case 'kangaroo':
                this.drawKangaroo(x, y);
                break;
            case 'polar_bear':
                this.drawPolarBear(x, y);
                break;
            default:
                this.drawSeagull(x, y); // 默认海鸥
        }
    }
    
    drawPenguin(x, y) {
        // 企鹅身体
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(x + 8, y + 8, 16, 20);
        // 企鹅肚子（白色）
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 10, y + 12, 12, 12);
        // 企鹅头部
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(x + 10, y + 4, 12, 8);
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 12, y + 6, 2, 2);
        this.ctx.fillRect(x + 18, y + 6, 2, 2);
        // 喙
        this.ctx.fillStyle = '#ffa500';
        this.ctx.fillRect(x + 15, y + 8, 4, 2);
        // 翅膀
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(x + 4, y + 12, 4, 12);
        this.ctx.fillRect(x + 24, y + 12, 4, 12);
        // 脚
        this.ctx.fillRect(x + 10, y + 28, 4, 4);
        this.ctx.fillRect(x + 18, y + 28, 4, 4);
    }
    
    drawPanda(x, y) {
        // 熊猫身体
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + 6, y + 10, 20, 18);
        // 熊猫肚子（白色）
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 8, y + 14, 16, 12);
        // 熊猫头部
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + 8, y + 4, 16, 12);
        // 耳朵
        this.ctx.fillRect(x + 6, y + 2, 6, 6);
        this.ctx.fillRect(x + 20, y + 2, 6, 6);
        // 眼睛（黑色眼圈）
        this.ctx.fillRect(x + 10, y + 6, 4, 4);
        this.ctx.fillRect(x + 18, y + 6, 4, 4);
        // 眼睛（白色）
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x + 11, y + 7, 2, 2);
        this.ctx.fillRect(x + 19, y + 7, 2, 2);
        // 鼻子
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 15, y + 10, 2, 2);
        // 手臂
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(x + 4, y + 16, 4, 8);
        this.ctx.fillRect(x + 24, y + 16, 4, 8);
        // 脚
        this.ctx.fillRect(x + 8, y + 28, 6, 4);
        this.ctx.fillRect(x + 18, y + 28, 6, 4);
    }
    
    drawCamel(x, y) {
        // 驼峰
        this.ctx.fillStyle = '#d2691e';
        this.ctx.fillRect(x + 8, y + 8, 16, 8);
        this.ctx.fillRect(x + 10, y + 4, 12, 4);
        // 身体
        this.ctx.fillRect(x + 6, y + 16, 20, 12);
        // 头部
        this.ctx.fillRect(x + 22, y + 12, 8, 8);
        // 脖子
        this.ctx.fillRect(x + 18, y + 10, 6, 8);
        // 腿
        this.ctx.fillRect(x + 8, y + 28, 4, 4);
        this.ctx.fillRect(x + 20, y + 28, 4, 4);
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 24, y + 14, 2, 2);
        // 鼻子
        this.ctx.fillRect(x + 26, y + 16, 2, 1);
    }
    
    drawKangaroo(x, y) {
        // 身体
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(x + 8, y + 12, 16, 16);
        // 头部
        this.ctx.fillRect(x + 20, y + 8, 10, 10);
        // 耳朵
        this.ctx.fillRect(x + 22, y + 4, 3, 4);
        this.ctx.fillRect(x + 26, y + 4, 3, 4);
        // 尾巴
        this.ctx.fillRect(x + 2, y + 16, 8, 4);
        this.ctx.fillRect(x + 4, y + 20, 6, 4);
        this.ctx.fillRect(x + 6, y + 24, 4, 4);
        // 腿
        this.ctx.fillRect(x + 10, y + 28, 4, 4);
        this.ctx.fillRect(x + 18, y + 28, 4, 4);
        // 手臂
        this.ctx.fillRect(x + 16, y + 18, 4, 6);
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 24, y + 10, 2, 2);
        // 鼻子
        this.ctx.fillRect(x + 27, y + 12, 2, 1);
    }
    
    drawPolarBear(x, y) {
        // 身体
        this.ctx.fillStyle = '#f0f0f0';
        this.ctx.fillRect(x + 6, y + 12, 20, 16);
        // 头部
        this.ctx.fillRect(x + 18, y + 6, 12, 10);
        // 耳朵
        this.ctx.fillRect(x + 20, y + 2, 4, 4);
        this.ctx.fillRect(x + 26, y + 2, 4, 4);
        // 腿
        this.ctx.fillRect(x + 8, y + 28, 4, 4);
        this.ctx.fillRect(x + 20, y + 28, 4, 4);
        // 手臂
        this.ctx.fillRect(x + 4, y + 16, 4, 8);
        this.ctx.fillRect(x + 24, y + 16, 4, 8);
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 22, y + 8, 2, 2);
        this.ctx.fillRect(x + 26, y + 8, 2, 2);
        // 鼻子
        this.ctx.fillRect(x + 24, y + 12, 2, 2);
    }
    
    drawSeagull(x, y) {
        // 简单的像素风格海鸥
        this.ctx.fillStyle = '#ffffff';
        
        // 身体
        this.ctx.fillRect(x + 8, y + 12, 16, 8);
        
        // 翅膀
        this.ctx.fillRect(x + 2, y + 14, 6, 4);
        this.ctx.fillRect(x + 24, y + 14, 6, 4);
        
        // 头部
        this.ctx.fillRect(x + 12, y + 8, 8, 6);
        
        // 眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(x + 14, y + 10, 2, 2);
        this.ctx.fillRect(x + 16, y + 10, 2, 2);
        
        // 喙
        this.ctx.fillStyle = '#ffa500';
        this.ctx.fillRect(x + 10, y + 12, 2, 2);
    }
    
    drawIceRock(x, y, width, height, isCompleted) {
        // 冰岩主体
        this.ctx.fillStyle = isCompleted ? '#87ceeb' : '#b3d9e6';
        this.ctx.fillRect(x, y, width, height);
        
        // 冰岩纹理
        this.ctx.strokeStyle = isCompleted ? '#4682b4' : '#87ceeb';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 添加冰裂纹
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(x + width/3, y);
        this.ctx.lineTo(x + width/3, y + height);
        this.ctx.stroke();
    }
    
    drawBamboo(x, y, width, height, isCompleted) {
        // 竹子主体
        this.ctx.fillStyle = isCompleted ? '#90ee90' : '#228b22';
        this.ctx.fillRect(x + width/3, y, width/3, height);
        
        // 竹节
        this.ctx.strokeStyle = isCompleted ? '#7cfc00' : '#006400';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < height; i += height/4) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + width/3, y + i);
            this.ctx.lineTo(x + 2*width/3, y + i);
            this.ctx.stroke();
        }
    }
    
    drawCactus(x, y, width, height, isCompleted) {
        // 仙人掌主体
        this.ctx.fillStyle = isCompleted ? '#90ee90' : '#228b22';
        this.ctx.fillRect(x + width/4, y, width/2, height);
        
        // 仙人掌刺
        this.ctx.fillStyle = isCompleted ? '#7cfc00' : '#006400';
        // 左刺
        this.ctx.fillRect(x + width/4 - 2, y + height/3, 2, 4);
        this.ctx.fillRect(x + width/4 - 2, y + 2*height/3, 2, 4);
        // 右刺
        this.ctx.fillRect(x + 3*width/4, y + height/3, 2, 4);
        this.ctx.fillRect(x + 3*width/4, y + 2*height/3, 2, 4);
    }
    
    drawEucalyptus(x, y, width, height, isCompleted) {
        // 桉树干
        this.ctx.fillStyle = '#8b4513';
        this.ctx.fillRect(x + width/3, y + height/2, width/3, height/2);
        
        // 桉树叶
        this.ctx.fillStyle = isCompleted ? '#90ee90' : '#228b22';
        this.ctx.fillRect(x, y, width, height/2);
        this.ctx.fillRect(x - width/4, y + height/4, width * 1.5, height/3);
        
        // 叶子纹理
        this.ctx.strokeStyle = isCompleted ? '#7cfc00' : '#006400';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, width, height/2);
    }
    
    drawIceBlock(x, y, width, height, isCompleted) {
        // 冰块主体
        this.ctx.fillStyle = isCompleted ? '#e0ffff' : '#f0f8ff';
        this.ctx.fillRect(x, y, width, height);
        
        // 冰块光泽
        this.ctx.strokeStyle = isCompleted ? '#b0e0e6' : '#87ceeb';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x, y, width, height);
        
        // 添加冰面反光
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fillRect(x + 2, y + 2, width/3, height/3);
    }
    
    gameLoop() {
        if (!this.isRunning || !this.gameStarted) return;
        
        this.updatePlayer();
        this.draw();
        
        requestAnimationFrame(() => this.gameLoop());
    }
}

// 启动游戏
window.addEventListener('DOMContentLoaded', () => {
    new GameState();
});
