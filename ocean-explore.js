// 精细的探究式学习系统 - 第1关：观察与发现
class OceanExploreSystem {
    constructor() {
        this.canvas = document.getElementById('explore-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 动画状态
        this.animationFrame = 0;
        this.isAnimating = false;
        
        // 科考船状态
        this.ship = {
            x: 450,
            y: 250,
            targetX: 450,
            targetY: 250,
            speed: 5,
            angle: 0
        };
        
        // 洋流粒子系统
        this.particles = [];
        this.initParticles();
        
        // 温度数据
        this.temperatureData = [];
        this.currentTemp = null;
        this.targetTemp = null;
        this.tempTransition = 0;
        
        // 当前任务
        this.currentTask = 0;
        this.taskStage = 'intro'; // intro, interact, think, summary
        this.observations = [];
        this.measurements = { warm: false, cold: false, normal: false };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showChapterSelect();
    }
    
    initParticles() {
        // 暖流粒子（沿曲线分布，向上流动）
        for (let i = 0; i < 60; i++) {
            const t = Math.random();
            // 沿暖流曲线分布
            const baseX = 100 + t * 150;
            const baseY = 450 - t * 350;
            this.particles.push({
                x: baseX + (Math.random() - 0.5) * 80,
                y: baseY + (Math.random() - 0.5) * 80,
                vx: 0.3 + Math.random() * 0.3,
                vy: -1.5 - Math.random(),
                type: 'warm',
                size: 2 + Math.random() * 3
            });
        }
        
        // 寒流粒子（沿曲线分布，向下流动）
        for (let i = 0; i < 60; i++) {
            const t = Math.random();
            // 沿寒流曲线分布
            const baseX = 800 - t * 200;
            const baseY = 80 + t * 350;
            this.particles.push({
                x: baseX + (Math.random() - 0.5) * 80,
                y: baseY + (Math.random() - 0.5) * 80,
                vx: -0.3 - Math.random() * 0.3,
                vy: 1.5 + Math.random(),
                type: 'cold',
                size: 2 + Math.random() * 3
            });
        }
    }
    
    setupEventListeners() {
        // 返回按钮
        document.getElementById('back-btn').addEventListener('click', () => {
            if (confirm('确定要返回吗？')) {
                window.location.href = 'ocean-select.html';
            }
        });
        
        // Canvas点击事件
        this.canvas.addEventListener('click', (e) => {
            if (this.taskStage !== 'interact') return;
            
            const rect = this.canvas.getBoundingClientRect();
            // 修复坐标计算，考虑canvas缩放
            const scaleX = this.canvas.width / rect.width;
            const scaleY = this.canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;
            
            this.handleCanvasClick(x, y);
        });
        
        // 提交答案
        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 下一个任务
        document.getElementById('next-task-btn').addEventListener('click', () => {
            this.nextTask();
        });
        
        // 章节卡片点击
        document.querySelectorAll('.chapter-card').forEach(card => {
            card.addEventListener('click', () => {
                const chapter = parseInt(card.dataset.chapter);
                if (!card.classList.contains('locked')) {
                    this.startChapter(chapter);
                }
            });
        });
        
        // 返回章节选择
        const backToChaptersBtn = document.getElementById('back-to-chapters-btn');
        if (backToChaptersBtn) {
            backToChaptersBtn.addEventListener('click', () => {
                this.showChapterSelect();
            });
        }
        
        // 下一章
        const nextChapterBtn = document.getElementById('next-chapter-btn');
        if (nextChapterBtn) {
            nextChapterBtn.addEventListener('click', () => {
                this.showChapterSelect();
            });
        }
    }
    
    showChapterSelect() {
        // 显示章节选择界面
        document.getElementById('chapter-select').classList.remove('hidden');
        document.getElementById('task-screen').classList.add('hidden');
        document.getElementById('chapter-complete').classList.add('hidden');
        
        // 停止动画
        this.isAnimating = false;
    }
    
    startChapter(chapter) {
        this.currentChapter = chapter;
        
        // 隐藏章节选择，显示任务界面
        document.getElementById('chapter-select').classList.add('hidden');
        document.getElementById('task-screen').classList.remove('hidden');
        
        // 清空之前的观察记录
        document.getElementById('observation-log').innerHTML = '';
        
        // 初始化粒子（如果还没有）
        if (this.particles.length === 0) {
            this.initParticles();
        }
        
        // 重置实验状态
        this.experimentState = {
            windDirection: 90,
            windStrength: 50,
            temperature: 15,
            salinity: 35,
            waterRemoved: false,
            season: 'summer',
            selectedRegion: null
        };
        
        // 重置测量状态
        this.measurements = { warm: false, cold: false, normal: false };
        
        // 开始动画
        this.startAnimation();
        
        // 显示第一个任务
        this.showTask(0);
    }
    
    startAnimation() {
        this.isAnimating = true;
        this.animate();
    }
    
    animate() {
        if (!this.isAnimating) return;
        
        this.animationFrame++;
        this.updateParticles();
        this.updateShip();
        this.updateTemperature();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    updateParticles() {
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            
            // 边界检查 - 重新生成粒子位置
            if (p.type === 'warm') {
                // 暖流向上流动，到顶部后重新从底部出现
                if (p.y < 50) {
                    p.y = 480;
                    p.x = 80 + Math.random() * 100;
                }
                if (p.x > 350) p.x = 80;
                if (p.x < 50) p.x = 300;
            } else {
                // 寒流向下流动，到底部后重新从顶部出现
                if (p.y > 450) {
                    p.y = 50;
                    p.x = 750 + Math.random() * 100;
                }
                if (p.x < 550) p.x = 850;
                if (p.x > 880) p.x = 600;
            }
        });
    }
    
    updateShip() {
        // 平滑移动到目标位置
        const dx = this.ship.targetX - this.ship.x;
        const dy = this.ship.targetY - this.ship.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 1) {
            this.ship.x += (dx / dist) * this.ship.speed;
            this.ship.y += (dy / dist) * this.ship.speed;
            this.ship.angle = Math.atan2(dy, dx);
        }
    }
    
    updateTemperature() {
        if (this.targetTemp !== null && this.tempTransition < 1) {
            this.tempTransition += 0.02;
            if (this.tempTransition >= 1) {
                this.currentTemp = this.targetTemp;
                this.tempTransition = 1;
            }
        }
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 根据章节和任务绘制不同内容
        const chapter = this.currentChapter || 1;
        const tasks = this.getChapterTasks()[chapter];
        const task = tasks ? tasks[this.currentTask] : null;
        
        if (!task) return;
        
        // 根据任务类型绘制
        switch (task.type) {
            case 'temperature':
                this.drawCurrentZones();
                this.drawParticles();
                this.drawShip();
                if (this.taskStage === 'interact' && this.currentTemp !== null) {
                    this.drawThermometer();
                }
                break;
            // 第2章实验
            case 'wind':
                this.drawChapter2Wind();
                break;
            case 'density':
                this.drawChapter2Density();
                break;
            case 'salinity':
                this.drawChapter2Salinity();
                break;
            case 'compensation':
                this.drawChapter2Compensation();
                break;
            // 第3章地图探险
            case 'map_north':
                this.drawChapter3North();
                break;
            case 'map_south':
                this.drawChapter3South();
                break;
            case 'map_equator':
                this.drawChapter3Equator();
                break;
            case 'monsoon':
                this.drawChapter3Monsoon();
                break;
            // 第4章案例分析
            case 'fishery':
                this.drawChapter4Fishery();
                break;
            case 'shipping':
                this.drawChapter4Shipping();
                break;
            case 'climate_case':
                this.drawChapter4Climate();
                break;
            case 'fog':
                this.drawChapter4Fog();
                break;
            // 第5章综合探究
            case 'elnino':
                this.drawChapter5ElNino();
                break;
            case 'thermohaline':
                this.drawChapter5Thermohaline();
                break;
            case 'observe':
                // 第1章的观察任务
                if (chapter === 1) {
                    if (this.currentTask === 1) this.drawTask2FlowDirection();
                    else if (this.currentTask === 2) this.drawTask3Comparison();
                    else if (this.currentTask === 3) this.drawTask4Climate();
                    else if (this.currentTask === 4) this.drawTask5WorldMap();
                    else this.drawDefaultScene();
                } else {
                    this.drawDefaultScene();
                }
                break;
            default:
                this.drawDefaultScene();
        }
    }
    
    drawDefaultScene() {
        // 默认场景：简单的海洋背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(1, '#0284c7');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 提示文字
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.font = '18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('请阅读左侧任务说明，思考问题后提交答案', 450, 250);
    }
    
    drawCurrentZones() {
        // 暖流区域（自然曲线形状）
        this.ctx.save();
        
        // 暖流 - 从左下到右上的弯曲带状
        const warmGradient = this.ctx.createRadialGradient(180, 300, 20, 180, 300, 150);
        warmGradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
        warmGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.3)');
        warmGradient.addColorStop(1, 'rgba(239, 68, 68, 0.05)');
        
        this.ctx.fillStyle = warmGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 450);
        this.ctx.bezierCurveTo(100, 350, 150, 250, 180, 150);
        this.ctx.bezierCurveTo(200, 80, 280, 50, 350, 80);
        this.ctx.bezierCurveTo(320, 150, 280, 250, 250, 350);
        this.ctx.bezierCurveTo(220, 420, 150, 480, 50, 450);
        this.ctx.fill();
        
        // 暖流箭头方向指示
        this.ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(100, 400);
        this.ctx.quadraticCurveTo(180, 250, 250, 100);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 暖流标签
        this.ctx.fillStyle = '#dc2626';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('暖流', 180, 280);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('(向高纬度流动)', 180, 300);
        
        // 寒流区域（自然曲线形状）
        const coldGradient = this.ctx.createRadialGradient(720, 200, 20, 720, 200, 150);
        coldGradient.addColorStop(0, 'rgba(59, 130, 246, 0.6)');
        coldGradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        coldGradient.addColorStop(1, 'rgba(59, 130, 246, 0.05)');
        
        this.ctx.fillStyle = coldGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(850, 50);
        this.ctx.bezierCurveTo(800, 100, 750, 200, 720, 300);
        this.ctx.bezierCurveTo(700, 380, 620, 450, 550, 420);
        this.ctx.bezierCurveTo(600, 350, 650, 250, 680, 150);
        this.ctx.bezierCurveTo(700, 80, 780, 30, 850, 50);
        this.ctx.fill();
        
        // 寒流箭头方向指示
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(800, 80);
        this.ctx.quadraticCurveTo(720, 230, 600, 400);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 寒流标签
        this.ctx.fillStyle = '#2563eb';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('寒流', 720, 220);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('(向低纬度流动)', 720, 240);
        
        // 普通海域标签
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('普通海域 (20°C)', 450, 480);
        
        this.ctx.restore();
    }
    
    drawParticles() {
        this.particles.forEach(p => {
            this.ctx.fillStyle = p.type === 'warm' 
                ? `rgba(255, 255, 255, ${0.3 + Math.sin(this.animationFrame * 0.05 + p.x) * 0.2})`
                : `rgba(200, 230, 255, ${0.3 + Math.sin(this.animationFrame * 0.05 + p.x) * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawShip() {
        this.ctx.save();
        this.ctx.translate(this.ship.x, this.ship.y);
        this.ctx.rotate(this.ship.angle);
        
        // 船体
        this.ctx.fillStyle = '#1e293b';
        this.ctx.beginPath();
        this.ctx.moveTo(20, 0);
        this.ctx.lineTo(-15, -10);
        this.ctx.lineTo(-15, 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 船舱
        this.ctx.fillStyle = '#64748b';
        this.ctx.fillRect(-10, -6, 15, 12);
        
        // 烟囱
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(-5, -12, 4, 6);
        
        // 波浪效果
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 25, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawThermometer() {
        const x = 750;
        const y = 50;
        const width = 60;
        const height = 200;
        
        // 温度计背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillRect(x, y, width, height);
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x, y, width, height);
        
        // 刻度
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        for (let temp = 0; temp <= 30; temp += 5) {
            const ty = y + height - (temp / 30) * (height - 40) - 20;
            this.ctx.fillText(temp + '°C', x - 5, ty + 4);
            this.ctx.beginPath();
            this.ctx.moveTo(x, ty);
            this.ctx.lineTo(x + 10, ty);
            this.ctx.stroke();
        }
        
        // 水银柱（动画）
        if (this.currentTemp !== null) {
            const currentDisplay = this.currentTemp * this.tempTransition;
            const fillHeight = (currentDisplay / 30) * (height - 40);
            
            const gradient = this.ctx.createLinearGradient(x, y + height, x, y + height - fillHeight);
            if (this.currentTemp > 20) {
                gradient.addColorStop(0, '#ef4444');
                gradient.addColorStop(1, '#f87171');
            } else {
                gradient.addColorStop(0, '#3b82f6');
                gradient.addColorStop(1, '#60a5fa');
            }
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(x + 15, y + height - fillHeight - 20, 30, fillHeight);
            
            // 当前温度显示
            this.ctx.fillStyle = '#1e293b';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(currentDisplay.toFixed(1) + '°C', x + width / 2, y + height + 25);
        }
    }
    
    handleCanvasClick(x, y) {
        // 移动船到点击位置
        this.ship.targetX = x;
        this.ship.targetY = y;
        
        // 根据点击位置判断区域类型并计算温度
        const areaInfo = this.getAreaInfo(x, y);
        this.measureArea(areaInfo.type, x, y, areaInfo.temp);
    }
    
    getAreaInfo(x, y) {
        // 暖流区域检测（曲线带状区域）
        // 暖流中心线大约在 (180, 300) 附近
        const warmCenterX = 180;
        const warmCenterY = 300;
        const warmDist = Math.sqrt(Math.pow(x - warmCenterX, 2) + Math.pow(y - warmCenterY, 2));
        
        // 寒流区域检测
        // 寒流中心线大约在 (720, 200) 附近
        const coldCenterX = 720;
        const coldCenterY = 200;
        const coldDist = Math.sqrt(Math.pow(x - coldCenterX, 2) + Math.pow(y - coldCenterY, 2));
        
        // 判断在哪个区域
        if (warmDist < 150 && x < 400) {
            // 在暖流区域
            const heatFactor = Math.max(0, 1 - warmDist / 150);
            const temp = 20 + 8 * heatFactor;
            return { type: 'warm', temp: Math.round(temp * 10) / 10 };
        } else if (coldDist < 150 && x > 500) {
            // 在寒流区域
            const coldFactor = Math.max(0, 1 - coldDist / 150);
            const temp = 20 - 15 * coldFactor;
            return { type: 'cold', temp: Math.round(temp * 10) / 10 };
        } else {
            // 普通海域
            return { type: 'normal', temp: 20 };
        }
    }
    
    measureArea(type, x, y, temp) {
        this.targetTemp = temp;
        this.tempTransition = 0;
        
        // 记录测量
        setTimeout(() => {
            this.measurements[type] = true;
            this.addObservation(type);
            
            // 检查是否完成所有测量
            if (this.measurements.warm && this.measurements.cold && this.measurements.normal) {
                this.completeInteraction();
            }
        }, 1000);
    }
    
    addObservation(type) {
        const temp = this.targetTemp;
        const diff = Math.abs(temp - 20);
        
        let text = '';
        if (type === 'warm') {
            text = `📌 暖流区域测量：水温${temp.toFixed(1)}°C，比周围海水高${diff.toFixed(1)}°C`;
        } else if (type === 'cold') {
            text = `📌 寒流区域测量：水温${temp.toFixed(1)}°C，比周围海水低${diff.toFixed(1)}°C`;
        } else {
            text = `📌 普通海域测量：水温${temp.toFixed(1)}°C（基准温度）`;
        }
        
        const log = document.getElementById('observation-log');
        const item = document.createElement('div');
        item.className = 'observation-item';
        item.textContent = text;
        item.style.opacity = '0';
        item.style.transform = 'translateY(-10px)';
        log.appendChild(item);
        
        // 动画显示
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 10);
    }
    
    completeInteraction() {
        // 显示思考问题
        setTimeout(() => {
            document.getElementById('thinking-area').style.display = 'block';
            document.getElementById('thinking-area').style.opacity = '0';
            setTimeout(() => {
                document.getElementById('thinking-area').style.transition = 'opacity 0.5s';
                document.getElementById('thinking-area').style.opacity = '1';
            }, 10);
        }, 500);
    }
    
    showTask(taskIndex) {
        this.currentTask = taskIndex;
        this.taskStage = 'intro';
        this.observations = [];
        this.measurements = { warm: false, cold: false, normal: false };
        this.currentTemp = null;
        this.targetTemp = null;
        
        // 根据章节获取任务配置
        const allChapterTasks = this.getChapterTasks();
        const tasks = allChapterTasks[this.currentChapter || 1] || allChapterTasks[1];
        const task = tasks[taskIndex];
        
        if (!task) {
            this.completeChapter();
            return;
        }
        
        // 章节标题
        const chapterTitles = {
            1: '第1章：观察与发现',
            2: '第2章：实验探索',
            3: '第3章：地图探险',
            4: '第4章：案例分析',
            5: '第5章：综合探究'
        };
        
        // 更新UI
        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-number').textContent = `${taskIndex + 1}/${tasks.length}`;
        document.getElementById('thinking-question').textContent = task.question;
        document.getElementById('chapter-title').textContent = chapterTitles[this.currentChapter || 1];
        
        // 清空输入
        document.getElementById('answer-input').value = '';
        document.getElementById('observation-log').innerHTML = '';
        
        // 显示控制面板
        const controlsPanel = document.getElementById('controls-panel');
        
        // 根据任务类型显示不同的控制面板
        this.renderControlPanel(task, controlsPanel);
        
        // 隐藏思考区和总结区
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.add('hidden');
        
        // 开始互动阶段
        this.taskStage = 'interact';
        
        // 更新进度条
        document.getElementById('progress-fill').style.width = '0%';
    }
    
    submitAnswer() {
        // 根据任务显示对应的知识点科普
        const knowledgePoints = [
            // 任务1：温度特点
            `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                <h4 style="color: #166534; margin-bottom: 10px;">📚 知识点：暖流与寒流的温度特征</h4>
                <p style="line-height: 1.8; color: #166534;">
                    通过测量，你发现了一个重要规律：<br><br>
                    • <strong>暖流</strong>的水温<strong>高于</strong>流经海区的水温<br>
                    • <strong>寒流</strong>的水温<strong>低于</strong>流经海区的水温<br><br>
                    <strong>关键理解</strong>：暖流和寒流的"暖"与"寒"是<strong>相对概念</strong>，不是指绝对温度。
                    例如，北大西洋暖流在冬季水温可能只有10°C，但它比流经海区的水温高，所以仍然是暖流。
                </p>
            </div>`,
            
            // 任务2：流向规律
            `<div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <h4 style="color: #1e40af; margin-bottom: 10px;">📚 知识点：洋流的流向规律</h4>
                <p style="line-height: 1.8; color: #1e40af;">
                    你观察到的流向规律是正确的：<br><br>
                    • <strong>暖流</strong>：从<strong>低纬度流向高纬度</strong>（从赤道流向两极）<br>
                    • <strong>寒流</strong>：从<strong>高纬度流向低纬度</strong>（从两极流向赤道）<br><br>
                    <strong>原因</strong>：赤道地区接收太阳辐射多，海水温度高；两极地区接收太阳辐射少，海水温度低。
                    洋流在全球范围内进行热量的重新分配。
                </p>
            </div>`,
            
            // 任务3：科学定义
            `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                <h4 style="color: #92400e; margin-bottom: 10px;">📚 知识点：暖流与寒流的科学定义</h4>
                <p style="line-height: 1.8; color: #92400e;">
                    <strong>暖流</strong>：从水温<strong>较高</strong>的海区流向水温<strong>较低</strong>的海区的洋流。<br>
                    <strong>寒流</strong>：从水温<strong>较低</strong>的海区流向水温<strong>较高</strong>的海区的洋流。<br><br>
                    <strong>判断方法</strong>：<br>
                    1. 看流向：低纬→高纬通常是暖流，高纬→低纬通常是寒流<br>
                    2. 看温度：与周围海水比较，温度高的是暖流，温度低的是寒流<br><br>
                    <strong>世界主要暖流</strong>：墨西哥湾暖流、北大西洋暖流、日本暖流（黑潮）<br>
                    <strong>世界主要寒流</strong>：加利福尼亚寒流、秘鲁寒流、拉布拉多寒流
                </p>
            </div>`,
            
            // 任务4：气候影响
            `<div style="background: #fce7f3; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899;">
                <h4 style="color: #9d174d; margin-bottom: 10px;">📚 知识点：洋流对气候的影响</h4>
                <p style="line-height: 1.8; color: #9d174d;">
                    <strong>暖流对沿岸气候的影响</strong>：<br>
                    • 增温：暖流使沿岸地区气温升高<br>
                    • 增湿：温暖海水蒸发旺盛，带来更多水汽和降水<br>
                    • 典型案例：西欧受北大西洋暖流影响，形成温带海洋性气候<br><br>
                    <strong>寒流对沿岸气候的影响</strong>：<br>
                    • 降温：寒流使沿岸地区气温降低<br>
                    • 减湿：冷海水蒸发弱，空气中水汽少，降水减少<br>
                    • 典型案例：秘鲁沿岸受秘鲁寒流影响，形成热带沙漠气候
                </p>
            </div>`,
            
            // 任务5：案例解析
            `<div style="background: #f5f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                <h4 style="color: #5b21b6; margin-bottom: 10px;">📚 知识点：案例解析——英国与纽芬兰的气候差异</h4>
                <p style="line-height: 1.8; color: #5b21b6;">
                    <strong>答案解析</strong>：<br><br>
                    <strong>英国</strong>（伦敦51°N）：<br>
                    • 受<strong>北大西洋暖流</strong>影响<br>
                    • 暖流带来温暖湿润的空气<br>
                    • 冬季温和（约5°C），降水丰富<br><br>
                    <strong>纽芬兰</strong>（49°N）：<br>
                    • 受<strong>拉布拉多寒流</strong>影响<br>
                    • 寒流使沿岸气温降低<br>
                    • 冬季寒冷（约-5°C），降水较少<br><br>
                    <strong>结论</strong>：同纬度地区，洋流是造成气候差异的重要因素。
                    这也是为什么西欧比同纬度的北美东岸更温暖的原因。
                </p>
            </div>`
        ];
        
        // 根据章节获取知识点
        const allKnowledgePoints = this.getKnowledgePoints();
        const chapterKnowledge = allKnowledgePoints[this.currentChapter || 1] || allKnowledgePoints[1];
        
        document.getElementById('summary-content').innerHTML = chapterKnowledge[this.currentTask] || '<p>继续探索吧！</p>';
        
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.remove('hidden');
        
        // 更新进度
        const tasks = this.getChapterTasks()[this.currentChapter || 1];
        const progress = ((this.currentTask + 1) / tasks.length) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        this.taskStage = 'summary';
    }
    
    nextTask() {
        const tasks = this.getChapterTasks()[this.currentChapter || 1];
        const nextTaskIndex = this.currentTask + 1;
        if (nextTaskIndex < tasks.length) {
            this.showTask(nextTaskIndex);
        } else {
            // 完成所有任务
            this.completeChapter();
        }
    }
    
    completeChapter() {
        document.getElementById('task-screen').classList.add('hidden');
        document.getElementById('chapter-complete').classList.remove('hidden');
        
        // 根据章节生成学习总结
        const summaries = {
            1: `<ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 理解了暖流和寒流的温度特征</li>
                <li style="margin-bottom: 12px;">✅ 掌握了洋流的流向规律</li>
                <li style="margin-bottom: 12px;">✅ 能够定义暖流和寒流的概念</li>
                <li style="margin-bottom: 12px;">✅ 了解了洋流对气候的影响</li>
                <li style="margin-bottom: 12px;">✅ 学会用洋流知识解释实际现象</li>
            </ul>`,
            2: `<ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 理解了风力对洋流形成的作用</li>
                <li style="margin-bottom: 12px;">✅ 掌握了温度与海水密度的关系</li>
                <li style="margin-bottom: 12px;">✅ 了解了盐度对海水密度的影响</li>
                <li style="margin-bottom: 12px;">✅ 认识了补偿流的形成原理</li>
                <li style="margin-bottom: 12px;">✅ 能够综合分析洋流的成因</li>
            </ul>`,
            3: `<ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 掌握了北半球洋流的顺时针规律</li>
                <li style="margin-bottom: 12px;">✅ 理解了南半球洋流的逆时针规律</li>
                <li style="margin-bottom: 12px;">✅ 了解了赤道洋流的分布特点</li>
                <li style="margin-bottom: 12px;">✅ 认识了季风洋流的季节变化</li>
                <li style="margin-bottom: 12px;">✅ 能够总结世界洋流分布规律</li>
            </ul>`,
            4: `<ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 理解了洋流对渔场分布的影响</li>
                <li style="margin-bottom: 12px;">✅ 学会了利用洋流规划航线</li>
                <li style="margin-bottom: 12px;">✅ 掌握了洋流对沿岸气候的影响</li>
                <li style="margin-bottom: 12px;">✅ 能够解释实际地理现象</li>
                <li style="margin-bottom: 12px;">✅ 学会综合应用洋流知识</li>
            </ul>`,
            5: `<ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 了解了厄尔尼诺现象的成因和影响</li>
                <li style="margin-bottom: 12px;">✅ 认识了大西洋温盐环流系统</li>
                <li style="margin-bottom: 12px;">✅ 思考了气候变化对洋流的影响</li>
                <li style="margin-bottom: 12px;">✅ 学会了设计简单的科学实验</li>
                <li style="margin-bottom: 12px;">✅ 完成了洋流知识的系统总结</li>
            </ul>`
        };
        
        document.getElementById('learning-summary').innerHTML = summaries[this.currentChapter || 1];
        document.getElementById('progress-fill').style.width = '100%';
    }
    
    // ========== 知识点配置 ==========
    getKnowledgePoints() {
        return {
            1: [
                // 第1章知识点（已有）
                `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <h4 style="color: #166534; margin-bottom: 10px;">📚 知识点：暖流与寒流的温度特征</h4>
                    <p style="line-height: 1.8; color: #166534;">
                        • <strong>暖流</strong>的水温<strong>高于</strong>流经海区的水温<br>
                        • <strong>寒流</strong>的水温<strong>低于</strong>流经海区的水温<br><br>
                        <strong>关键</strong>：暖流和寒流的"暖"与"寒"是<strong>相对概念</strong>。
                    </p>
                </div>`,
                `<div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h4 style="color: #1e40af; margin-bottom: 10px;">📚 知识点：洋流的流向规律</h4>
                    <p style="line-height: 1.8; color: #1e40af;">
                        • <strong>暖流</strong>：从<strong>低纬度流向高纬度</strong><br>
                        • <strong>寒流</strong>：从<strong>高纬度流向低纬度</strong><br><br>
                        洋流在全球范围内进行热量的重新分配。
                    </p>
                </div>`,
                `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin-bottom: 10px;">📚 知识点：暖流与寒流的定义</h4>
                    <p style="line-height: 1.8; color: #92400e;">
                        <strong>暖流</strong>：水温比流经海区高，从低纬流向高纬的洋流<br>
                        <strong>寒流</strong>：水温比流经海区低，从高纬流向低纬的洋流
                    </p>
                </div>`,
                `<div style="background: #fce7f3; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899;">
                    <h4 style="color: #9d174d; margin-bottom: 10px;">📚 知识点：洋流对气候的影响</h4>
                    <p style="line-height: 1.8; color: #9d174d;">
                        <strong>暖流</strong>：增温增湿（使沿岸气温升高、降水增多）<br>
                        <strong>寒流</strong>：降温减湿（使沿岸气温降低、降水减少）
                    </p>
                </div>`,
                `<div style="background: #f5f3ff; padding: 15px; border-radius: 8px; border-left: 4px solid #8b5cf6;">
                    <h4 style="color: #5b21b6; margin-bottom: 10px;">📚 知识点：案例解析</h4>
                    <p style="line-height: 1.8; color: #5b21b6;">
                        <strong>英国</strong>：受北大西洋暖流影响，冬季温和<br>
                        <strong>纽芬兰</strong>：受拉布拉多寒流影响，冬季寒冷<br><br>
                        同纬度地区，洋流是造成气候差异的重要因素。
                    </p>
                </div>`
            ],
            2: [
                // 第2章：实验探索知识点
                `<div style="background: #e0f2fe; padding: 15px; border-radius: 8px; border-left: 4px solid #0ea5e9;">
                    <h4 style="color: #0369a1; margin-bottom: 10px;">📚 知识点：风海流</h4>
                    <p style="line-height: 1.8; color: #0369a1;">
                        <strong>风海流</strong>是由风力驱动形成的洋流，是表层洋流的主要成因。<br><br>
                        • 盛行风持续吹拂海面，带动表层海水流动<br>
                        • 风力越大，洋流流速越快<br>
                        • 信风带、西风带是形成大洋环流的主要动力
                    </p>
                </div>`,
                `<div style="background: #fce7f3; padding: 15px; border-radius: 8px; border-left: 4px solid #ec4899;">
                    <h4 style="color: #9d174d; margin-bottom: 10px;">📚 知识点：温度与海水密度</h4>
                    <p style="line-height: 1.8; color: #9d174d;">
                        海水密度与温度成<strong>反比</strong>：<br><br>
                        • 冷水密度大 → 下沉<br>
                        • 热水密度小 → 上浮<br><br>
                        这是形成<strong>深层洋流</strong>（温盐环流）的重要原因。
                    </p>
                </div>`,
                `<div style="background: #dbeafe; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                    <h4 style="color: #1e40af; margin-bottom: 10px;">📚 知识点：盐度与海水密度</h4>
                    <p style="line-height: 1.8; color: #1e40af;">
                        海水密度与盐度成<strong>正比</strong>：<br><br>
                        • 高盐度海水密度大 → 下沉<br>
                        • 低盐度海水密度小 → 上浮<br><br>
                        蒸发旺盛的海域盐度高，降水多的海域盐度低。
                    </p>
                </div>`,
                `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px; border-left: 4px solid #22c55e;">
                    <h4 style="color: #166534; margin-bottom: 10px;">📚 知识点：补偿流</h4>
                    <p style="line-height: 1.8; color: #166534;">
                        当一个海域的海水被移走时，周围的海水会流过来补充，形成<strong>补偿流</strong>。<br><br>
                        • 水平补偿流：周围海水水平流入<br>
                        • 上升流：深层海水上涌补充<br><br>
                        上升流带来深层营养物质，形成著名渔场。
                    </p>
                </div>`,
                `<div style="background: #fef3c7; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b;">
                    <h4 style="color: #92400e; margin-bottom: 10px;">📚 知识点：洋流成因总结</h4>
                    <p style="line-height: 1.8; color: #92400e;">
                        洋流形成的主要原因：<br><br>
                        1. <strong>风力</strong>：盛行风驱动表层海水流动<br>
                        2. <strong>密度差异</strong>：温度和盐度差异导致海水垂直运动<br>
                        3. <strong>补偿作用</strong>：海水流走后的补充运动<br>
                        4. <strong>地转偏向力</strong>：使洋流发生偏转
                    </p>
                </div>`
            ],
            3: [
                // 第3章知识点（简化版）
                `<div style="background: #e0f2fe; padding: 15px; border-radius: 8px;"><h4>📚 北半球洋流规律</h4><p>北半球中低纬度大洋环流呈<strong>顺时针</strong>方向流动。</p></div>`,
                `<div style="background: #fce7f3; padding: 15px; border-radius: 8px;"><h4>📚 南半球洋流规律</h4><p>南半球中低纬度大洋环流呈<strong>逆时针</strong>方向流动。</p></div>`,
                `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px;"><h4>📚 赤道洋流</h4><p>受信风影响，赤道附近形成<strong>南北赤道暖流</strong>，自东向西流动。</p></div>`,
                `<div style="background: #fef3c7; padding: 15px; border-radius: 8px;"><h4>📚 季风洋流</h4><p>北印度洋受季风影响，夏季顺时针、冬季逆时针流动。</p></div>`,
                `<div style="background: #f5f3ff; padding: 15px; border-radius: 8px;"><h4>📚 洋流分布规律</h4><p>北顺南逆、东寒西暖（中低纬度大陆东岸暖流、西岸寒流）。</p></div>`
            ],
            4: [
                // 第4章知识点（简化版）
                `<div style="background: #e0f2fe; padding: 15px; border-radius: 8px;"><h4>📚 渔场与洋流</h4><p>寒暖流交汇处，海水扰动带来营养物质，形成大渔场（如北海道渔场）。</p></div>`,
                `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px;"><h4>📚 航线与洋流</h4><p>顺流航行可节省燃料和时间，逆流则相反。</p></div>`,
                `<div style="background: #fef3c7; padding: 15px; border-radius: 8px;"><h4>📚 寒流与沙漠</h4><p>寒流降温减湿，使沿岸形成沙漠气候（如阿塔卡马沙漠）。</p></div>`,
                `<div style="background: #fce7f3; padding: 15px; border-radius: 8px;"><h4>📚 暖流与雾</h4><p>暖流带来的暖湿空气遇冷形成雾，如伦敦"雾都"。</p></div>`,
                `<div style="background: #f5f3ff; padding: 15px; border-radius: 8px;"><h4>📚 综合应用</h4><p>洋流影响气候、渔业、航运、旅游等多个领域。</p></div>`
            ],
            5: [
                // 第5章知识点（简化版）
                `<div style="background: #fce7f3; padding: 15px; border-radius: 8px;"><h4>📚 厄尔尼诺现象</h4><p>秘鲁寒流减弱，东太平洋海温异常升高，导致全球气候异常。</p></div>`,
                `<div style="background: #e0f2fe; padding: 15px; border-radius: 8px;"><h4>📚 温盐环流</h4><p>全球性的深层环流系统，由温度和盐度差异驱动，调节全球气候。</p></div>`,
                `<div style="background: #fef3c7; padding: 15px; border-radius: 8px;"><h4>📚 气候变化影响</h4><p>全球变暖可能减弱温盐环流，影响全球气候格局。</p></div>`,
                `<div style="background: #f0fdf4; padding: 15px; border-radius: 8px;"><h4>📚 科学探究</h4><p>科学研究需要：提出问题→设计实验→收集数据→得出结论。</p></div>`,
                `<div style="background: #f5f3ff; padding: 15px; border-radius: 8px;"><h4>📚 课程总结</h4><p>恭喜完成全部学习！你已掌握洋流的基本知识和应用。</p></div>`
            ]
        };
    }
    
    // ========== 任务2：流向观察图（只显示纬度数值，让学生自己观察判断）==========
    drawTask2FlowDirection() {
        // 背景：简化的海洋，用颜色深浅表示温度（不直接说明）
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#1e3a5f');  // 上方深蓝
        gradient.addColorStop(0.5, '#0ea5e9'); 
        gradient.addColorStop(1, '#38bdf8');  // 下方浅蓝
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 只标纬度数值，不说高低
        this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('60°N', 10, 30);
        this.ctx.fillText('40°N', 10, 140);
        this.ctx.fillText('20°N', 10, 250);
        this.ctx.fillText('0° (赤道)', 10, 360);
        this.ctx.fillText('20°S', 10, 470);
        
        // 绘制纬度线
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 1;
        [30, 140, 250, 360, 470].forEach(y => {
            this.ctx.beginPath();
            this.ctx.moveTo(60, y);
            this.ctx.lineTo(880, y);
            this.ctx.stroke();
        });
        
        // 暖流区域 - 只显示流动的粒子，让学生观察方向
        // 红色粒子向上流动
        for (let i = 0; i < 8; i++) {
            const baseY = (450 - (this.animationFrame * 1.5 + i * 60) % 450);
            const x = 180 + Math.sin(baseY * 0.02) * 30;
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.arc(x, baseY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 蓝色粒子向下流动
        for (let i = 0; i < 8; i++) {
            const baseY = ((this.animationFrame * 1.5 + i * 60) % 450) + 30;
            const x = 720 + Math.sin(baseY * 0.02) * 30;
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.beginPath();
            this.ctx.arc(x, baseY, 8, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 只标注这是什么洋流，不说流向
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔴 暖流 A', 180, 250);
        this.ctx.fillText('🔵 寒流 B', 720, 250);
        
        // 提示观察
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(300, 450, 300, 40);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('👀 观察红色和蓝色圆点的移动方向', 450, 475);
    }
    
    // ========== 任务3：数据对比图（只给数据，让学生总结）==========
    drawTask3Comparison() {
        // 背景
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 中间分隔线
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(450, 0);
        this.ctx.lineTo(450, 500);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 任务3：只给测量数据，让学生自己总结定义
        // 左边：洋流X的数据
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(50, 50, 350, 400);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('洋流 X', 225, 90);
        
        // 数据卡片
        this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
        this.ctx.fillRect(80, 120, 290, 300);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('📊 测量数据：', 100, 160);
        this.ctx.fillText('• 洋流水温：26°C', 100, 200);
        this.ctx.fillText('• 周围海水温度：18°C', 100, 235);
        this.ctx.fillText('• 起点纬度：10°N', 100, 280);
        this.ctx.fillText('• 终点纬度：50°N', 100, 315);
        
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('❓ 这是暖流还是寒流？', 100, 370);
        this.ctx.fillText('❓ 你的判断依据是什么？', 100, 400);
        
        // 右边：洋流Y的数据
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(500, 50, 350, 400);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('洋流 Y', 675, 90);
        
        // 数据卡片
        this.ctx.fillStyle = 'rgba(255,255,255,0.9)';
        this.ctx.fillRect(530, 120, 290, 300);
        
        this.ctx.fillStyle = '#333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('📊 测量数据：', 550, 160);
        this.ctx.fillText('• 洋流水温：8°C', 550, 200);
        this.ctx.fillText('• 周围海水温度：16°C', 550, 235);
        this.ctx.fillText('• 起点纬度：60°N', 550, 280);
        this.ctx.fillText('• 终点纬度：20°N', 550, 315);
        
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText('❓ 这是暖流还是寒流？', 550, 370);
        this.ctx.fillText('❓ 你的判断依据是什么？', 550, 400);
        
        // 底部提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(200, 460, 500, 35);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💡 根据数据，尝试用自己的话定义"暖流"和"寒流"', 450, 483);
    }
    
    drawMiniThermometer(x, y, temp, color) {
        // 温度计外框
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x - 15, y - 60, 30, 120);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 15, y - 60, 30, 120);
        
        // 温度刻度
        this.ctx.fillStyle = '#666';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('30°', x - 18, y - 45);
        this.ctx.fillText('20°', x - 18, y);
        this.ctx.fillText('10°', x - 18, y + 45);
        
        // 水银柱
        const height = (temp / 30) * 100;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x - 8, y + 50 - height, 16, height);
        
        // 当前温度
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(temp + '°C', x, y + 80);
    }
    
    // ========== 任务4：气候影响示意图（只给现象，让学生推理）==========
    drawTask4Climate() {
        // 背景
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 标题
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌍 两个沿海城市的气候数据对比', 450, 30);
        
        // 城市A（暖流影响）
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(50, 60, 380, 180);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('城市 A', 240, 95);
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.fillRect(70, 110, 340, 120);
        this.ctx.fillStyle = '#333';
        this.ctx.font = '15px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('📍 位置：某大陆西海岸', 90, 140);
        this.ctx.fillText('🌊 附近洋流水温：24°C', 90, 165);
        this.ctx.fillText('🌡️ 年平均气温：18°C', 90, 190);
        this.ctx.fillText('💧 年降水量：1200mm', 90, 215);
        
        // 城市B（寒流影响）
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(470, 60, 380, 180);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('城市 B', 660, 95);
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.fillRect(490, 110, 340, 120);
        this.ctx.fillStyle = '#333';
        this.ctx.font = '15px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('📍 位置：某大陆西海岸（同纬度）', 510, 140);
        this.ctx.fillText('🌊 附近洋流水温：12°C', 510, 165);
        this.ctx.fillText('🌡️ 年平均气温：14°C', 510, 190);
        this.ctx.fillText('💧 年降水量：300mm', 510, 215);
        
        // 思考问题
        this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
        this.ctx.fillRect(100, 270, 700, 200);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🤔 思考问题', 450, 305);
        
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('1. 两个城市纬度相同，为什么气温和降水差异这么大？', 130, 345);
        this.ctx.fillText('2. 洋流水温与城市气候有什么关系？', 130, 380);
        this.ctx.fillText('3. 如果你是城市A的居民，你会感受到什么样的气候？', 130, 415);
        this.ctx.fillText('4. 城市B呢？', 130, 450);
    }
    
    drawWavyArrow(x1, y1, x2, y2, color) {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        // 波浪线
        const midY = (y1 + y2) / 2;
        this.ctx.quadraticCurveTo(x1 + 10, midY, x2, y2);
        this.ctx.stroke();
        
        // 箭头
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x2, y2 - 10);
        this.ctx.lineTo(x2 - 6, y2);
        this.ctx.lineTo(x2 + 6, y2);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawCloud(x, y, opacity = 1) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 30, y - 5, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 60, y, 25, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawRain(x, y) {
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            const rx = x + i * 15;
            const ry = y + (this.animationFrame * 2 + i * 10) % 40;
            this.ctx.beginPath();
            this.ctx.moveTo(rx, ry);
            this.ctx.lineTo(rx - 3, ry + 10);
            this.ctx.stroke();
        }
    }
    
    // ========== 任务5：世界地图案例 ==========
    drawTask5WorldMap() {
        // 简化的北大西洋地图
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制简化的大陆轮廓
        // 欧洲
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.moveTo(500, 50);
        this.ctx.lineTo(600, 80);
        this.ctx.lineTo(650, 150);
        this.ctx.lineTo(620, 250);
        this.ctx.lineTo(550, 300);
        this.ctx.lineTo(480, 280);
        this.ctx.lineTo(450, 200);
        this.ctx.lineTo(470, 100);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 英国
        this.ctx.fillStyle = '#16a34a';
        this.ctx.beginPath();
        this.ctx.ellipse(420, 150, 30, 50, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 北美
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.moveTo(50, 30);
        this.ctx.lineTo(250, 50);
        this.ctx.lineTo(300, 150);
        this.ctx.lineTo(280, 300);
        this.ctx.lineTo(200, 400);
        this.ctx.lineTo(100, 350);
        this.ctx.lineTo(50, 200);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 纽芬兰
        this.ctx.fillStyle = '#16a34a';
        this.ctx.beginPath();
        this.ctx.ellipse(280, 130, 25, 35, 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 洋流P（不说明是暖流还是寒流）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 8;
        this.ctx.setLineDash([]);
        this.ctx.beginPath();
        this.ctx.moveTo(200, 400);
        this.ctx.quadraticCurveTo(350, 300, 400, 200);
        this.ctx.stroke();
        
        // 洋流Q（不说明是暖流还是寒流）
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 8;
        this.ctx.beginPath();
        this.ctx.moveTo(250, 50);
        this.ctx.quadraticCurveTo(280, 100, 290, 180);
        this.ctx.stroke();
        
        // 只标注地名和数据，不给结论
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        
        // 英国标注（只给数据）
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.fillRect(380, 200, 120, 70);
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('🇬🇧 伦敦', 440, 220);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('纬度：51°N', 440, 240);
        this.ctx.fillText('冬季均温：5°C', 440, 258);
        
        // 纽芬兰标注（只给数据）
        this.ctx.fillStyle = 'rgba(255,255,255,0.95)';
        this.ctx.fillRect(200, 170, 120, 70);
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('🇨🇦 纽芬兰', 260, 190);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('纬度：49°N', 260, 210);
        this.ctx.fillText('冬季均温：-5°C', 260, 228);
        
        // 洋流标签（只标P和Q，不说明类型）
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('洋流 P', 350, 350);
        
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillText('洋流 Q', 320, 80);
        
        // 纬度线
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        [80, 150, 220, 290, 360].forEach((y, i) => {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(900, y);
            this.ctx.stroke();
        });
        
        // 纬度数值
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText('60°N', 890, 85);
        this.ctx.fillText('50°N', 890, 155);
        this.ctx.fillText('40°N', 890, 225);
        this.ctx.fillText('30°N', 890, 295);
        this.ctx.fillText('20°N', 890, 365);
        this.ctx.setLineDash([]);
        
        // 图例（不说明暖流寒流）
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(700, 380, 180, 100);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('图例', 720, 405);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(720, 420, 20, 10);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('洋流 P', 750, 430);
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(720, 445, 20, 10);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('洋流 Q', 750, 455);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(720, 470, 20, 10);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('陆地', 750, 480);
    }
    
    // ========== 章节任务配置 ==========
    getChapterTasks() {
        return {
            // 第1章：观察与发现
            1: [
                {
                    title: '任务1：测量海水温度',
                    question: '观察你测量的数据，暖流区域和寒流区域的温度有什么特点？它们与普通海水相比有什么不同？',
                    instruction: '点击地图上的不同海域，科考船会自动航行到该位置并测量水温。',
                    type: 'temperature'
                },
                {
                    title: '任务2：观察洋流流向',
                    question: '观察地图上的粒子流动方向：暖流（红色区域）向哪个方向流动？寒流（蓝色区域）呢？这与纬度有什么关系？',
                    instruction: '仔细观察粒子的流动方向，结合纬度数值思考规律。',
                    type: 'observe',
                    hint: '💡 提示：注意粒子的移动方向和纬度数值的变化。'
                },
                {
                    title: '任务3：总结洋流定义',
                    question: '根据前两个任务的观察，请用自己的话回答：什么是暖流？什么是寒流？',
                    instruction: '结合温度测量和流向观察的结果，尝试给出暖流和寒流的定义。',
                    type: 'observe',
                    hint: '💡 提示：从温度和流向两个角度思考。'
                },
                {
                    title: '任务4：推理气候影响',
                    question: '假设某沿海城市附近有暖流经过，你认为这会对当地气候产生什么影响？如果是寒流呢？',
                    instruction: '思考：海水温度会影响空气温度，温暖的海水蒸发更多水汽...',
                    type: 'observe',
                    hint: '💡 提示：从气温和降水两方面分析。'
                },
                {
                    title: '任务5：案例分析',
                    question: '英国伦敦（51°N）和加拿大纽芬兰岛（49°N）纬度相近，但伦敦冬季平均气温约5°C，而纽芬兰岛约-5°C。请用洋流知识解释这种差异。',
                    instruction: '运用你学到的洋流知识，分析两地气候差异的原因。',
                    type: 'observe',
                    hint: '💡 提示：观察地图上两地附近的洋流。'
                }
            ],
            
            // 第2章：实验探索 - 洋流是怎么形成的
            2: [
                {
                    title: '实验1：风力驱动',
                    question: '观察实验：当风持续吹向一个方向时，海水会发生什么变化？风力大小对海水流动有什么影响？',
                    instruction: '拖动风向箭头，调节风力大小，观察海水的流动变化。',
                    type: 'wind',
                    hint: '💡 提示：注意观察风向与海水流向的关系，以及风力与流速的关系。'
                },
                {
                    title: '实验2：温度与密度',
                    question: '观察实验：冷水和热水哪个会下沉？这对洋流形成有什么影响？',
                    instruction: '调节温度滑块，观察不同温度的海水如何运动。',
                    type: 'density',
                    hint: '💡 提示：密度大的物质会下沉，密度小的会上浮。'
                },
                {
                    title: '实验3：盐度与密度',
                    question: '观察实验：盐度高的海水和盐度低的海水，哪个密度更大？这会导致什么现象？',
                    instruction: '调节盐度滑块，观察不同盐度的海水如何运动。',
                    type: 'salinity',
                    hint: '💡 提示：盐分会增加海水的密度。'
                },
                {
                    title: '实验4：补偿流',
                    question: '当一个区域的海水被风吹走后，会发生什么？周围的海水会如何运动？',
                    instruction: '点击"抽走海水"按钮，观察周围海水的补偿运动。',
                    type: 'compensation',
                    hint: '💡 提示：海水会自动填补空缺的区域。'
                },
                {
                    title: '总结：洋流成因',
                    question: '根据以上实验，总结洋流形成的主要原因有哪些？',
                    instruction: '结合四个实验的观察，归纳洋流形成的动力来源。',
                    type: 'observe',
                    hint: '💡 提示：风力、温度差异、盐度差异都是重要因素。'
                }
            ],
            
            // 第3章：地图探险 - 发现洋流分布规律
            3: [
                {
                    title: '探险1：北半球洋流',
                    question: '观察北太平洋和北大西洋的洋流，它们的流动方向有什么共同规律？',
                    instruction: '在地图上观察北半球主要洋流的流向，尝试找出规律。',
                    type: 'map_north',
                    hint: '💡 提示：注意洋流整体的旋转方向。'
                },
                {
                    title: '探险2：南半球洋流',
                    question: '观察南太平洋和南大西洋的洋流，它们与北半球有什么不同？',
                    instruction: '在地图上观察南半球主要洋流的流向，与北半球对比。',
                    type: 'map_south',
                    hint: '💡 提示：南北半球的旋转方向相反吗？'
                },
                {
                    title: '探险3：赤道洋流',
                    question: '赤道附近的洋流有什么特点？为什么会形成这样的流向？',
                    instruction: '观察赤道附近的洋流分布，思考与风带的关系。',
                    type: 'map_equator',
                    hint: '💡 提示：赤道附近吹什么风？'
                },
                {
                    title: '探险4：季风洋流',
                    question: '北印度洋的洋流在夏季和冬季有什么不同？为什么会发生变化？',
                    instruction: '切换季节，观察北印度洋洋流的变化。',
                    type: 'monsoon',
                    hint: '💡 提示：季风的方向会随季节改变。'
                },
                {
                    title: '总结：洋流分布规律',
                    question: '总结世界洋流分布的主要规律（从半球、纬度、大洋环流等角度）。',
                    instruction: '结合以上观察，归纳洋流分布的规律。',
                    type: 'observe',
                    hint: '💡 提示：北顺南逆、东寒西暖...'
                }
            ],
            
            // 第4章：案例分析 - 洋流的影响
            4: [
                {
                    title: '案例1：渔场选址',
                    question: '你是一名渔业顾问，需要选择最佳的渔场位置。哪个海域的鱼类资源最丰富？为什么？',
                    instruction: '观察三个候选海域的洋流情况，选择最适合建渔场的位置。',
                    type: 'fishery',
                    hint: '💡 提示：寒暖流交汇处会发生什么？'
                },
                {
                    title: '案例2：航线规划',
                    question: '从上海到旧金山有两条航线，哪条更省时间和燃料？请计算并解释原因。',
                    instruction: '观察两条航线与洋流的关系，分析顺流和逆流的影响。',
                    type: 'shipping',
                    hint: '💡 提示：顺流航行可以节省多少时间？'
                },
                {
                    title: '案例3：气候之谜',
                    question: '为什么撒哈拉沙漠西海岸（加那利群岛附近）比同纬度的内陆更凉爽？',
                    instruction: '分析该地区的洋流类型及其对气候的影响。',
                    type: 'climate_case',
                    hint: '💡 提示：那里有什么类型的洋流？'
                },
                {
                    title: '案例4：雾都伦敦',
                    question: '伦敦曾被称为"雾都"，这与洋流有什么关系？',
                    instruction: '分析北大西洋暖流对英国气候的影响。',
                    type: 'fog',
                    hint: '💡 提示：暖流带来的水汽遇到什么会形成雾？'
                },
                {
                    title: '综合应用',
                    question: '如果你要在沿海地区建一个度假村，你会考虑哪些与洋流相关的因素？',
                    instruction: '综合运用所学知识，分析洋流对旅游业的影响。',
                    type: 'observe',
                    hint: '💡 提示：气候、海水温度、海洋生物...'
                }
            ],
            
            // 第5章：综合探究
            5: [
                {
                    title: '探究1：厄尔尼诺现象',
                    question: '什么是厄尔尼诺现象？它是如何影响全球气候的？',
                    instruction: '观察正常年份和厄尔尼诺年份的太平洋洋流变化。',
                    type: 'elnino',
                    hint: '💡 提示：秘鲁寒流减弱会导致什么？'
                },
                {
                    title: '探究2：大西洋传送带',
                    question: '什么是"大西洋温盐环流"？它对全球气候有什么重要作用？',
                    instruction: '观察大西洋深层环流的运动模式。',
                    type: 'thermohaline',
                    hint: '💡 提示：这是一个全球性的"传送带"系统。'
                },
                {
                    title: '探究3：气候变化影响',
                    question: '全球变暖会如何影响洋流系统？可能带来什么后果？',
                    instruction: '思考冰川融化、海水温度上升对洋流的影响。',
                    type: 'observe',
                    hint: '💡 提示：北极冰川融化会改变海水盐度...'
                },
                {
                    title: '探究4：设计实验',
                    question: '如果你是一名海洋科学家，你会设计什么实验来研究洋流？',
                    instruction: '设计一个简单的实验方案，说明目的、方法和预期结果。',
                    type: 'observe',
                    hint: '💡 提示：可以从模拟实验或实地观测的角度思考。'
                },
                {
                    title: '总结报告',
                    question: '写一份简短的研究报告，总结你在本课程中学到的洋流知识。',
                    instruction: '包括：洋流的定义、成因、分布规律、对人类的影响。',
                    type: 'observe',
                    hint: '💡 提示：用自己的话总结，不要照抄。'
                }
            ]
        };
    }
    
    // ========== 控制面板渲染 ==========
    renderControlPanel(task, panel) {
        switch (task.type) {
            case 'temperature':
                panel.innerHTML = `
                    <h4>🌡️ 温度测量仪</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="font-size: 12px; color: #1e40af; margin-bottom: 8px;">测量进度</div>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <div id="measure-warm" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">⭕ 暖流区域</div>
                            <div id="measure-cold" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">⭕ 寒流区域</div>
                            <div id="measure-normal" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">⭕ 普通海域</div>
                        </div>
                    </div>
                `;
                break;
                
            case 'wind':
                panel.innerHTML = `
                    <h4>💨 风力实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <div style="margin-bottom: 15px;">
                            <label style="font-size: 12px; color: #0369a1;">风向：</label>
                            <input type="range" id="wind-direction" min="0" max="360" value="90" 
                                style="width: 100%;" onchange="game.updateWind()">
                            <div style="font-size: 11px; color: #64748b; text-align: center;" id="wind-dir-label">东风 (90°)</div>
                        </div>
                        <div>
                            <label style="font-size: 12px; color: #0369a1;">风力：</label>
                            <input type="range" id="wind-strength" min="0" max="100" value="50" 
                                style="width: 100%;" onchange="game.updateWind()">
                            <div style="font-size: 11px; color: #64748b; text-align: center;" id="wind-str-label">中等 (50%)</div>
                        </div>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
                
            case 'density':
                panel.innerHTML = `
                    <h4>🌡️ 温度实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="background: #fce7f3; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <label style="font-size: 12px; color: #9d174d;">水温调节：</label>
                        <input type="range" id="water-temp" min="0" max="30" value="15" 
                            style="width: 100%;" onchange="game.updateDensity()">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                            <span>冷 (0°C)</span>
                            <span id="temp-label">15°C</span>
                            <span>热 (30°C)</span>
                        </div>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
                
            case 'salinity':
                panel.innerHTML = `
                    <h4>🧂 盐度实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                        <label style="font-size: 12px; color: #1e40af;">盐度调节：</label>
                        <input type="range" id="water-salinity" min="30" max="40" value="35" 
                            style="width: 100%;" onchange="game.updateSalinity()">
                        <div style="display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
                            <span>低盐 (30‰)</span>
                            <span id="salinity-label">35‰</span>
                            <span>高盐 (40‰)</span>
                        </div>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
                
            case 'compensation':
                panel.innerHTML = `
                    <h4>🌊 补偿流实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <button id="remove-water-btn" onclick="game.removeWater()" 
                            style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            💨 抽走海水
                        </button>
                        <button id="reset-water-btn" onclick="game.resetWater()" 
                            style="padding: 12px 24px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                            🔄 重置
                        </button>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
            
            case 'monsoon':
                panel.innerHTML = `
                    <h4>🌀 季风洋流</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <button onclick="game.setSeason('summer')" 
                            style="padding: 12px 24px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            ☀️ 夏季
                        </button>
                        <button onclick="game.setSeason('winter')" 
                            style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                            ❄️ 冬季
                        </button>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
            
            case 'elnino':
                panel.innerHTML = `
                    <h4>🌡️ 厄尔尼诺现象</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="text-align: center; margin-bottom: 15px;">
                        <button onclick="game.setSeason('normal')" 
                            style="padding: 12px 24px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px;">
                            ✓ 正常年份
                        </button>
                        <button onclick="game.setSeason('elnino')" 
                            style="padding: 12px 24px; background: #ef4444; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; margin-left: 10px;">
                            ⚠️ 厄尔尼诺
                        </button>
                    </div>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
                break;
                
            default:
                // 观察或思考题
                panel.innerHTML = `
                    <h4>📝 任务说明</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                        ${task.hint || '💡 仔细观察画面，思考问题。'}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 300);
        }
    }
    
    // ========== 第2章实验交互方法 ==========
    updateWind() {
        const dir = document.getElementById('wind-direction')?.value || 90;
        const str = document.getElementById('wind-strength')?.value || 50;
        this.experimentState.windDirection = parseInt(dir);
        this.experimentState.windStrength = parseInt(str);
        
        const directions = ['北风', '东北风', '东风', '东南风', '南风', '西南风', '西风', '西北风'];
        const dirIndex = Math.round(dir / 45) % 8;
        document.getElementById('wind-dir-label').textContent = `${directions[dirIndex]} (${dir}°)`;
        document.getElementById('wind-str-label').textContent = str > 70 ? `强 (${str}%)` : str > 30 ? `中等 (${str}%)` : `弱 (${str}%)`;
    }
    
    updateDensity() {
        const temp = document.getElementById('water-temp')?.value || 15;
        this.experimentState.temperature = parseInt(temp);
        document.getElementById('temp-label').textContent = `${temp}°C`;
    }
    
    updateSalinity() {
        const sal = document.getElementById('water-salinity')?.value || 35;
        this.experimentState.salinity = parseInt(sal);
        document.getElementById('salinity-label').textContent = `${sal}‰`;
    }
    
    removeWater() {
        this.experimentState.waterRemoved = true;
        document.getElementById('remove-water-btn').disabled = true;
        document.getElementById('remove-water-btn').textContent = '已抽走';
    }
    
    resetWater() {
        this.experimentState.waterRemoved = false;
        document.getElementById('remove-water-btn').disabled = false;
        document.getElementById('remove-water-btn').textContent = '💨 抽走海水';
    }
    
    setSeason(season) {
        this.experimentState.season = season;
    }
    
    // ========== 第2章实验可视化 ==========
    drawChapter2Wind() {
        // 风力实验 - 俯视图展示风如何驱动表层海水
        
        // 背景 - 俯视海面
        const seaGradient = this.ctx.createRadialGradient(450, 250, 50, 450, 250, 400);
        seaGradient.addColorStop(0, '#0ea5e9');
        seaGradient.addColorStop(1, '#0369a1');
        this.ctx.fillStyle = seaGradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 海面波纹
        this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        this.ctx.lineWidth = 1;
        for (let r = 50; r < 400; r += 40) {
            this.ctx.beginPath();
            this.ctx.arc(450, 250, r, 0, Math.PI * 2);
            this.ctx.stroke();
        }
        
        const windDir = this.experimentState.windDirection || 90;
        const windStr = this.experimentState.windStrength || 50;
        const windRad = (windDir - 90) * Math.PI / 180; // 转换为弧度，0度=东
        
        // 风向指示区域（顶部）
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(300, 10, 300, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        
        const directions = ['东风→', '东南风↘', '南风↓', '西南风↙', '西风←', '西北风↖', '北风↑', '东北风↗'];
        const dirIndex = Math.round(windDir / 45) % 8;
        this.ctx.fillText(`🌬️ ${directions[dirIndex]}  风力: ${windStr}%`, 450, 35);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('风吹动表层海水，形成风海流', 450, 55);
        
        // 绘制多个风箭头
        this.ctx.save();
        for (let i = 0; i < 5; i++) {
            const offsetX = (i - 2) * 120;
            const offsetY = -80;
            
            this.ctx.save();
            this.ctx.translate(450 + offsetX, 130 + offsetY);
            this.ctx.rotate(windRad);
            
            // 风箭头
            const size = 20 + windStr * 0.3;
            this.ctx.fillStyle = `rgba(251, 191, 36, ${0.6 + windStr/200})`;
            this.ctx.beginPath();
            this.ctx.moveTo(size, 0);
            this.ctx.lineTo(-size * 0.4, -size * 0.5);
            this.ctx.lineTo(-size * 0.2, 0);
            this.ctx.lineTo(-size * 0.4, size * 0.5);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.restore();
        }
        this.ctx.restore();
        
        // 海水流动粒子 - 跟随风向移动
        const speed = windStr / 30;
        const dx = Math.cos(windRad) * speed;
        const dy = Math.sin(windRad) * speed;
        
        for (let i = 0; i < 50; i++) {
            // 粒子位置随时间和风向移动
            let px = ((this.animationFrame * dx + i * 47) % 800) + 50;
            let py = ((this.animationFrame * dy + i * 31) % 300) + 150;
            
            // 粒子大小随深度变化（表层大，深层小）
            const depth = (i % 4);
            const size = 6 - depth;
            const alpha = 0.8 - depth * 0.15;
            
            this.ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 粒子尾迹
            if (windStr > 30) {
                this.ctx.strokeStyle = `rgba(255,255,255,${alpha * 0.3})`;
                this.ctx.lineWidth = size * 0.5;
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                this.ctx.lineTo(px - dx * 10, py - dy * 10);
                this.ctx.stroke();
            }
        }
        
        // 底部观察提示（不给答案）
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 430, 800, 55);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 观察：调节风向和风力，海水粒子的运动有什么变化？', 450, 450);
        this.ctx.fillText('💭 思考：风和海水流动之间有什么关系？', 450, 472);
    }
    
    drawChapter2Density() {
        // 温度密度实验 - 展示热对流
        
        // 背景
        this.ctx.fillStyle = '#1e293b';
        this.ctx.fillRect(0, 0, 900, 500);
        
        const temp = this.experimentState.temperature || 15;
        
        // 绘制水槽
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(150, 80, 600, 320);
        
        // 水体 - 根据温度显示颜色分层
        // 冷水在下（蓝色），热水在上（红色）
        const coldRatio = (30 - temp) / 30; // 0-1，温度越低越大
        const hotRatio = temp / 30;
        
        // 水体渐变
        const waterGradient = this.ctx.createLinearGradient(150, 80, 150, 400);
        if (temp < 15) {
            // 冷水模式：整体偏蓝，冷水下沉
            waterGradient.addColorStop(0, `rgba(147, 197, 253, ${0.3 + hotRatio * 0.3})`);
            waterGradient.addColorStop(0.5, '#3b82f6');
            waterGradient.addColorStop(1, '#1e40af');
        } else {
            // 热水模式：整体偏红，热水上浮
            waterGradient.addColorStop(0, '#ef4444');
            waterGradient.addColorStop(0.5, '#f87171');
            waterGradient.addColorStop(1, `rgba(59, 130, 246, ${0.3 + coldRatio * 0.5})`);
        }
        this.ctx.fillStyle = waterGradient;
        this.ctx.fillRect(152, 82, 596, 316);
        
        // 对流粒子动画
        const t = this.animationFrame * 0.03;
        for (let i = 0; i < 30; i++) {
            const phase = (t + i * 0.3) % (Math.PI * 2);
            let px, py;
            
            if (temp < 15) {
                // 冷水下沉的对流：中间下沉，两边上升
                const side = i % 2 === 0 ? -1 : 1;
                px = 450 + side * (80 + (i % 5) * 30) + Math.sin(phase) * 20;
                py = 150 + ((Math.sin(phase + (side > 0 ? 0 : Math.PI)) + 1) / 2) * 200;
            } else {
                // 热水上浮的对流：中间上升，两边下沉
                const side = i % 2 === 0 ? -1 : 1;
                px = 450 + side * (80 + (i % 5) * 30) + Math.sin(phase) * 20;
                py = 350 - ((Math.sin(phase + (side > 0 ? Math.PI : 0)) + 1) / 2) * 200;
            }
            
            // 粒子颜色
            const isHot = py < 250;
            this.ctx.fillStyle = isHot ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(px, py, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 温度计显示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(780, 100, 100, 250);
        
        // 温度计
        this.ctx.fillStyle = '#64748b';
        this.ctx.fillRect(820, 120, 20, 200);
        const mercuryHeight = (temp / 30) * 180;
        const mercuryColor = temp < 10 ? '#3b82f6' : temp < 20 ? '#22c55e' : '#ef4444';
        this.ctx.fillStyle = mercuryColor;
        this.ctx.fillRect(822, 300 - mercuryHeight, 16, mercuryHeight + 18);
        this.ctx.beginPath();
        this.ctx.arc(830, 320, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 温度标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${temp}°C`, 830, 360);
        
        // 标题和说明
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌡️ 温度与海水密度实验', 450, 40);
        
        // 对流方向指示（只显示箭头，不给结论）
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        if (temp < 15) {
            // 低温时的水流方向
            this.drawArrow(450, 150, 450, 300);
            this.drawArrow(300, 300, 300, 180);
            this.drawArrow(600, 300, 600, 180);
        } else {
            // 高温时的水流方向
            this.drawArrow(450, 300, 450, 150);
            this.drawArrow(300, 150, 300, 280);
            this.drawArrow(600, 150, 600, 280);
        }
        
        // 底部观察提示（不给答案）
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 420, 800, 65);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('🔍 观察：调节温度，水体的颜色分布和粒子运动有什么变化？', 450, 442);
        this.ctx.fillText('💭 思考：冷水和热水哪个会下沉？这对海水运动有什么影响？', 450, 465);
    }
    
    drawChapter2Salinity() {
        // 盐度实验 - 展示不同盐度水体的分层
        
        // 背景
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, 900, 500);
        
        const sal = this.experimentState.salinity || 35;
        
        // 标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧂 盐度与海水密度实验', 450, 35);
        
        // 左侧：淡水容器（盐度0‰）
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(80, 100, 200, 280);
        this.ctx.fillStyle = 'rgba(147, 197, 253, 0.6)';
        this.ctx.fillRect(82, 102, 196, 276);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('淡水 (0‰)', 180, 85);
        this.ctx.fillText('密度: 1.000', 180, 400);
        
        // 右侧：高盐水容器（盐度40‰）
        this.ctx.strokeRect(620, 100, 200, 280);
        this.ctx.fillStyle = 'rgba(30, 64, 175, 0.8)';
        this.ctx.fillRect(622, 102, 196, 276);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('高盐水 (40‰)', 720, 85);
        this.ctx.fillText('密度: 1.028', 720, 400);
        // 盐分颗粒
        for (let i = 0; i < 30; i++) {
            const x = 640 + (i % 6) * 30;
            const y = 150 + Math.floor(i / 6) * 40 + Math.sin(this.animationFrame * 0.05 + i) * 3;
            this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 中间：实验水滴
        this.ctx.strokeRect(350, 100, 200, 280);
        
        // 根据盐度计算水滴位置（盐度越高，下沉越深）
        // 盐度35‰是标准海水，与两侧对比
        const normalizedSal = (sal - 30) / 10; // 0-1范围
        const dropY = 150 + normalizedSal * 180; // 盐度高则下沉
        
        // 实验容器中的水（中等盐度参考）
        const refGradient = this.ctx.createLinearGradient(350, 100, 350, 380);
        refGradient.addColorStop(0, 'rgba(147, 197, 253, 0.5)');
        refGradient.addColorStop(1, 'rgba(30, 64, 175, 0.5)');
        this.ctx.fillStyle = refGradient;
        this.ctx.fillRect(352, 102, 196, 276);
        
        // 实验水滴
        const dropColor = sal > 35 ? '#1e40af' : sal < 35 ? '#93c5fd' : '#3b82f6';
        this.ctx.fillStyle = dropColor;
        this.ctx.beginPath();
        this.ctx.arc(450, dropY, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 水滴标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText(`${sal}‰`, 450, dropY + 5);
        
        // 箭头指示（只显示方向，不给结论）
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        if (sal > 36) {
            this.drawArrow(450, dropY + 35, 450, dropY + 80);
        } else if (sal < 34) {
            this.drawArrow(450, dropY - 35, 450, dropY - 80);
        }
        // 不显示"下沉"、"上浮"等结论性文字
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('实验水', 450, 85);
        this.ctx.fillText(`密度: ${(1 + sal * 0.0008).toFixed(3)}`, 450, 400);
        
        // 密度对比图
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.fillRect(100, 420, 700, 70);
        
        // 密度条
        const barGradient = this.ctx.createLinearGradient(150, 0, 750, 0);
        barGradient.addColorStop(0, '#93c5fd');
        barGradient.addColorStop(0.5, '#3b82f6');
        barGradient.addColorStop(1, '#1e40af');
        this.ctx.fillStyle = barGradient;
        this.ctx.fillRect(150, 445, 600, 20);
        
        // 当前盐度标记
        const markerX = 150 + (sal - 30) * 60;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(markerX, 440);
        this.ctx.lineTo(markerX - 8, 430);
        this.ctx.lineTo(markerX + 8, 430);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🔍 观察水滴位置变化', 110, 440);
        this.ctx.fillText('💭 盐度如何影响海水密度？', 110, 458);
        
        this.ctx.textAlign = 'center';
        this.ctx.fillText('低盐度 ←————— 密度 —————→ 高盐度', 450, 480);
    }
    
    drawChapter2Compensation() {
        // 补偿流实验 - 优化版
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#7dd3fc');
        gradient.addColorStop(1, '#0369a1');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 海岸线
        this.ctx.fillStyle = '#a3e635';
        this.ctx.beginPath();
        this.ctx.moveTo(0, 150);
        this.ctx.lineTo(200, 180);
        this.ctx.lineTo(200, 500);
        this.ctx.lineTo(0, 500);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 海水层次
        this.ctx.fillStyle = 'rgba(2, 132, 199, 0.3)';
        this.ctx.fillRect(200, 180, 700, 320);
        
        // 深层海水
        this.ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
        this.ctx.fillRect(200, 350, 700, 150);
        
        if (this.experimentState.waterRemoved) {
            // 表层海水被吹走的区域
            this.ctx.fillStyle = 'rgba(125, 211, 252, 0.8)';
            this.ctx.fillRect(350, 180, 200, 80);
            
            // 动态补偿流粒子
            const t = this.animationFrame * 0.05;
            
            // 水平补偿流（从两侧流入）
            for (let i = 0; i < 15; i++) {
                const progress = (t + i * 0.2) % 1;
                // 左侧流入
                const x1 = 220 + progress * 130;
                const y1 = 220 + Math.sin(progress * Math.PI) * 10;
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.beginPath();
                this.ctx.arc(x1, y1, 6, 0, Math.PI * 2);
                this.ctx.fill();
                
                // 右侧流入
                const x2 = 680 - progress * 130;
                this.ctx.beginPath();
                this.ctx.arc(x2, y1, 6, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 上升流粒子
            for (let i = 0; i < 10; i++) {
                const progress = (t * 0.8 + i * 0.15) % 1;
                const x = 400 + (i % 3) * 50;
                const y = 480 - progress * 200;
                this.ctx.fillStyle = '#22d3ee';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 箭头标注
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 3;
            this.drawArrow(250, 230, 340, 230);
            this.drawArrow(650, 230, 560, 230);
            this.drawArrow(450, 450, 450, 300);
            
            // 标签
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('表层海水被风吹走', 450, 200);
            this.ctx.fillText('水平补偿流', 300, 260);
            this.ctx.fillText('水平补偿流', 600, 260);
            this.ctx.fillText('上升流', 520, 380);
        } else {
            // 正常状态 - 显示风
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 16px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击"抽走海水"按钮，模拟风将表层海水吹走', 550, 250);
            
            // 风的示意
            for (let i = 0; i < 5; i++) {
                const x = 300 + i * 100;
                this.ctx.fillStyle = 'rgba(251, 191, 36, 0.6)';
                this.ctx.beginPath();
                this.ctx.moveTo(x, 120);
                this.ctx.lineTo(x + 40, 130);
                this.ctx.lineTo(x, 140);
                this.ctx.closePath();
                this.ctx.fill();
            }
            this.ctx.fillText('💨 离岸风', 550, 100);
        }
        
        // 图例和观察提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(20, 420, 400, 70);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🔍 观察：海水被抽走后，周围发生了什么？', 30, 445);
        this.ctx.fillText('💭 思考：这种现象在真实海洋中会如何发生？', 30, 465);
        this.ctx.fillText('       对海洋生物有什么影响？', 30, 485);
        
        // 简单图例
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(700, 420, 180, 70);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('🟡 水平方向流动', 710, 445);
        this.ctx.fillText('🔵 垂直方向流动', 710, 465);
        this.ctx.fillText('🟢 陆地', 710, 485);
    }
    
    // 绘制箭头辅助方法
    drawArrow(fromX, fromY, toX, toY) {
        const headLen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
        this.ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
        this.ctx.closePath();
        this.ctx.fillStyle = this.ctx.strokeStyle;
        this.ctx.fill();
    }
    
    // ========== 第3章：地图探险可视化 ==========
    drawChapter3North() {
        // 北半球洋流 - 顺时针环流
        this.drawWorldMapBase();
        
        // 高亮北半球
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        this.ctx.fillRect(0, 0, 900, 250);
        
        // 北太平洋环流（顺时针）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 4;
        this.drawCurvedArrow(600, 180, 750, 120, 800, 200, true); // 北太平洋暖流
        this.ctx.strokeStyle = '#3b82f6';
        this.drawCurvedArrow(800, 200, 780, 280, 700, 300, true); // 加利福尼亚寒流
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(700, 300, 550, 320, 500, 280, true); // 北赤道暖流
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(500, 280, 520, 200, 600, 180, true); // 黑潮
        
        // 北大西洋环流
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(200, 180, 300, 120, 380, 180, true);
        this.ctx.strokeStyle = '#3b82f6';
        this.drawCurvedArrow(380, 180, 350, 250, 300, 300, true);
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(300, 300, 200, 320, 150, 280, true);
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(150, 280, 160, 200, 200, 180, true);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('北半球中低纬度环流', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('观察：环流方向是顺时针还是逆时针？', 450, 480);
        
        // 旋转方向指示
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('↻', 650, 220);
        this.ctx.fillText('↻', 250, 220);
    }
    
    drawChapter3South() {
        // 南半球洋流 - 逆时针环流
        this.drawWorldMapBase();
        
        // 高亮南半球
        this.ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        this.ctx.fillRect(0, 250, 900, 250);
        
        // 南太平洋环流（逆时针）
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 4;
        this.drawCurvedArrow(700, 350, 780, 400, 750, 450, true); // 秘鲁寒流
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(750, 450, 650, 470, 550, 450, true); // 南赤道暖流
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(550, 450, 500, 400, 550, 350, true); // 东澳大利亚暖流
        this.ctx.strokeStyle = '#3b82f6';
        this.drawCurvedArrow(550, 350, 620, 340, 700, 350, true); // 西风漂流
        
        // 南大西洋环流
        this.ctx.strokeStyle = '#3b82f6';
        this.drawCurvedArrow(300, 350, 280, 400, 250, 450, true);
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(250, 450, 180, 470, 120, 450, true);
        this.ctx.strokeStyle = '#ef4444';
        this.drawCurvedArrow(120, 450, 100, 400, 150, 350, true);
        this.ctx.strokeStyle = '#3b82f6';
        this.drawCurvedArrow(150, 350, 220, 340, 300, 350, true);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('南半球中低纬度环流', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('观察：与北半球相比，旋转方向有什么不同？', 450, 480);
        
        // 旋转方向指示
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText('↺', 650, 400);
        this.ctx.fillText('↺', 200, 400);
    }
    
    drawChapter3Equator() {
        // 赤道洋流
        this.drawWorldMapBase();
        
        // 高亮赤道区域
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.2)';
        this.ctx.fillRect(0, 220, 900, 60);
        
        // 赤道线
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 250);
        this.ctx.lineTo(900, 250);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 信风箭头
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.8)';
        for (let i = 0; i < 8; i++) {
            const x = 100 + i * 100;
            // 北半球东北信风
            this.ctx.beginPath();
            this.ctx.moveTo(x + 30, 200);
            this.ctx.lineTo(x, 220);
            this.ctx.lineTo(x + 10, 220);
            this.ctx.closePath();
            this.ctx.fill();
            // 南半球东南信风
            this.ctx.beginPath();
            this.ctx.moveTo(x + 30, 300);
            this.ctx.lineTo(x, 280);
            this.ctx.lineTo(x + 10, 280);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // 赤道洋流（自东向西）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        for (let i = 0; i < 3; i++) {
            const y = 235 + i * 15;
            this.ctx.beginPath();
            this.ctx.moveTo(850, y);
            this.ctx.lineTo(100, y);
            this.ctx.stroke();
            // 箭头
            this.ctx.fillStyle = '#ef4444';
            this.ctx.beginPath();
            this.ctx.moveTo(100, y);
            this.ctx.lineTo(120, y - 8);
            this.ctx.lineTo(120, y + 8);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('赤道洋流', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('🌬️ 信风', 800, 180);
        this.ctx.fillText('赤道暖流（自东向西）', 450, 320);
        this.ctx.fillText('思考：为什么赤道洋流向西流动？与信风有什么关系？', 450, 480);
    }
    
    drawChapter3Monsoon() {
        // 季风洋流 - 北印度洋
        this.drawWorldMapBase();
        
        // 高亮印度洋区域
        this.ctx.fillStyle = 'rgba(34, 197, 94, 0.2)';
        this.ctx.fillRect(350, 200, 200, 150);
        
        const isSummer = this.experimentState.season === 'summer';
        
        // 季风方向
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 14px Arial';
        if (isSummer) {
            // 夏季西南季风
            this.ctx.fillText('☀️ 夏季 - 西南季风', 450, 180);
            this.ctx.strokeStyle = '#ef4444';
            this.ctx.lineWidth = 4;
            // 顺时针环流
            this.drawCurvedArrow(380, 280, 420, 240, 480, 250, true);
            this.drawCurvedArrow(480, 250, 520, 280, 500, 320, true);
            this.drawCurvedArrow(500, 320, 450, 340, 400, 320, true);
            this.drawCurvedArrow(400, 320, 370, 300, 380, 280, true);
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('↻', 450, 290);
        } else {
            // 冬季东北季风
            this.ctx.fillText('❄️ 冬季 - 东北季风', 450, 180);
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 4;
            // 逆时针环流
            this.drawCurvedArrow(480, 280, 440, 240, 380, 250, true);
            this.drawCurvedArrow(380, 250, 360, 280, 380, 320, true);
            this.drawCurvedArrow(380, 320, 430, 340, 480, 320, true);
            this.drawCurvedArrow(480, 320, 510, 300, 480, 280, true);
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = 'bold 20px Arial';
            this.ctx.fillText('↺', 450, 290);
        }
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('北印度洋季风洋流', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('点击切换季节，观察洋流方向的变化', 450, 480);
    }
    
    // ========== 第4章：案例分析可视化 ==========
    drawChapter4Fishery() {
        // 渔场选址
        this.drawWorldMapBase();
        
        // 三个候选区域
        const regions = [
            { x: 650, y: 200, name: '区域A', desc: '北海道附近' },
            { x: 300, y: 350, name: '区域B', desc: '大西洋中部' },
            { x: 750, y: 380, name: '区域C', desc: '秘鲁沿岸' }
        ];
        
        regions.forEach((r, i) => {
            // 区域圆圈
            this.ctx.strokeStyle = this.experimentState.selectedRegion === i ? '#fbbf24' : 'white';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 40, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 标签
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(r.name, r.x, r.y - 50);
            this.ctx.font = '12px Arial';
            this.ctx.fillText(r.desc, r.x, r.y + 55);
        });
        
        // 洋流示意
        // 区域A：寒暖流交汇
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.drawArrow(600, 250, 680, 200);
        this.ctx.strokeStyle = '#3b82f6';
        this.drawArrow(700, 150, 680, 200);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.arc(680, 200, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 区域C：上升流
        this.ctx.strokeStyle = '#22d3ee';
        this.drawArrow(750, 430, 750, 380);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🐟 渔场选址任务', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('哪个区域最适合建立渔场？为什么？', 450, 480);
        
        // 图例
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(20, 400, 180, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🔴 暖流', 30, 420);
        this.ctx.fillText('🔵 寒流', 30, 440);
        this.ctx.fillText('🟢 寒暖流交汇点', 30, 460);
        this.ctx.fillText('🔷 上升流', 30, 480);
    }
    
    drawChapter4Shipping() {
        // 航线规划
        this.drawWorldMapBase();
        
        // 上海和旧金山位置
        const shanghai = { x: 720, y: 220 };
        const sf = { x: 150, y: 200 };
        
        // 标记城市
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(shanghai.x, shanghai.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('上海', shanghai.x, shanghai.y - 15);
        
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(sf.x, sf.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillText('旧金山', sf.x, sf.y - 15);
        
        // 航线A：北太平洋航线（顺洋流）
        this.ctx.strokeStyle = '#22c55e';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(shanghai.x, shanghai.y);
        this.ctx.quadraticCurveTo(450, 100, sf.x, sf.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillText('航线A（北线）', 400, 90);
        
        // 航线B：中太平洋航线
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(shanghai.x, shanghai.y);
        this.ctx.quadraticCurveTo(450, 280, sf.x, sf.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = '#f59e0b';
        this.ctx.fillText('航线B（南线）', 400, 300);
        
        // 洋流方向
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
            this.drawArrow(700 - i * 100, 130, 650 - i * 100, 130);
        }
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        this.ctx.font = '11px Arial';
        this.ctx.fillText('北太平洋暖流 →', 450, 150);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('🚢 航线规划任务', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('从上海到旧金山，哪条航线更省时间和燃料？', 450, 480);
    }
    
    drawChapter4Climate() {
        // 气候之谜 - 撒哈拉西海岸
        const gradient = this.ctx.createLinearGradient(0, 0, 900, 0);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(0.4, '#0ea5e9');
        gradient.addColorStop(0.4, '#fcd34d');
        gradient.addColorStop(1, '#fcd34d');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 大西洋
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(0, 0, 360, 500);
        
        // 非洲大陆
        this.ctx.fillStyle = '#d97706';
        this.ctx.fillRect(360, 0, 540, 500);
        
        // 撒哈拉沙漠
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillRect(400, 100, 400, 200);
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('撒哈拉沙漠', 600, 200);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('内陆温度：45°C', 600, 230);
        
        // 加那利群岛
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.arc(320, 180, 15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('加那利群岛', 320, 210);
        this.ctx.fillText('沿岸温度：25°C', 320, 230);
        
        // 加那利寒流
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        for (let i = 0; i < 5; i++) {
            const y = 100 + i * 60;
            this.ctx.beginPath();
            this.ctx.moveTo(200, y);
            this.ctx.lineTo(340, y + 40);
            this.ctx.stroke();
        }
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('加那利寒流', 150, 250);
        this.ctx.fillText('↓', 150, 280);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText('🌡️ 气候之谜', 450, 30);
        this.ctx.font = '14px Arial';
        this.ctx.fillText('为什么沿海比同纬度内陆凉爽20°C？', 450, 480);
    }
    
    drawChapter4Fog() {
        // 雾都伦敦
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#64748b');
        gradient.addColorStop(1, '#1e293b');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 海洋
        this.ctx.fillStyle = '#0369a1';
        this.ctx.fillRect(0, 250, 500, 250);
        
        // 英国
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.ellipse(550, 200, 100, 150, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('英国', 550, 180);
        this.ctx.fillText('🏙️ 伦敦', 550, 210);
        
        // 北大西洋暖流
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 6;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 400);
        this.ctx.quadraticCurveTo(250, 350, 450, 280);
        this.ctx.stroke();
        this.ctx.fillStyle = '#ef4444';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('北大西洋暖流', 200, 420);
        this.ctx.font = '12px Arial';
        this.ctx.fillText('温暖湿润', 200, 440);
        
        // 雾气效果
        for (let i = 0; i < 20; i++) {
            const x = 400 + Math.random() * 300;
            const y = 150 + Math.random() * 150;
            const r = 20 + Math.random() * 40;
            this.ctx.fillStyle = `rgba(200, 200, 200, ${0.1 + Math.random() * 0.2})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, r, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 过程说明
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 50, 300, 100);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('暖流 → 海水蒸发 → 暖湿空气', 70, 80);
        this.ctx.fillText('暖湿空气 + 冷空气 → 雾', 70, 105);
        this.ctx.fillText('伦敦曾被称为"雾都"', 70, 130);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌫️ 雾都伦敦', 450, 480);
    }
    
    // ========== 第5章：综合探究可视化 ==========
    drawChapter5ElNino() {
        // 厄尔尼诺现象
        const gradient = this.ctx.createLinearGradient(0, 0, 900, 0);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(1, '#0ea5e9');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 太平洋
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(100, 150, 700, 250);
        
        // 南美洲
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.moveTo(800, 150);
        this.ctx.lineTo(900, 200);
        this.ctx.lineTo(900, 400);
        this.ctx.lineTo(800, 400);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('南美', 850, 280);
        
        // 亚洲/澳洲
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(0, 150, 100, 250);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('亚洲', 50, 280);
        
        const isElNino = this.experimentState.season === 'elnino';
        
        if (isElNino) {
            // 厄尔尼诺年份
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('⚠️ 厄尔尼诺年份', 450, 50);
            
            // 暖水向东扩展
            const warmGradient = this.ctx.createLinearGradient(100, 0, 800, 0);
            warmGradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
            warmGradient.addColorStop(1, 'rgba(239, 68, 68, 0.7)');
            this.ctx.fillStyle = warmGradient;
            this.ctx.fillRect(100, 200, 700, 150);
            
            // 信风减弱
            this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([5, 10]);
            this.drawArrow(700, 280, 600, 280);
            this.ctx.setLineDash([]);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('信风减弱', 650, 260);
            
            // 秘鲁寒流减弱
            this.ctx.fillStyle = '#ef4444';
            this.ctx.fillText('秘鲁寒流减弱', 780, 350);
            this.ctx.fillText('海温升高', 780, 370);
            this.ctx.fillText('渔业受损', 780, 390);
        } else {
            // 正常年份
            this.ctx.fillStyle = '#22c55e';
            this.ctx.font = 'bold 18px Arial';
            this.ctx.fillText('✓ 正常年份', 450, 50);
            
            // 正常温度分布
            const normalGradient = this.ctx.createLinearGradient(100, 0, 800, 0);
            normalGradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
            normalGradient.addColorStop(0.7, 'rgba(59, 130, 246, 0.3)');
            normalGradient.addColorStop(1, 'rgba(59, 130, 246, 0.6)');
            this.ctx.fillStyle = normalGradient;
            this.ctx.fillRect(100, 200, 700, 150);
            
            // 信风正常
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 3;
            this.drawArrow(700, 280, 500, 280);
            this.drawArrow(500, 280, 300, 280);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText('信风正常', 600, 260);
            
            // 秘鲁寒流
            this.ctx.strokeStyle = '#3b82f6';
            this.ctx.lineWidth = 4;
            this.drawArrow(780, 380, 780, 320);
            this.ctx.fillStyle = '#3b82f6';
            this.ctx.fillText('秘鲁寒流', 780, 400);
        }
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('点击切换查看正常年份和厄尔尼诺年份的差异', 450, 480);
    }
    
    drawChapter5Thermohaline() {
        // 温盐环流
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(1, '#0f172a');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 简化的世界地图轮廓
        this.ctx.fillStyle = '#22c55e';
        // 北美
        this.ctx.fillRect(50, 80, 150, 120);
        // 欧洲
        this.ctx.fillRect(350, 60, 100, 100);
        // 非洲
        this.ctx.fillRect(350, 180, 80, 150);
        // 亚洲
        this.ctx.fillRect(500, 50, 200, 150);
        // 澳洲
        this.ctx.fillRect(650, 280, 80, 60);
        // 南美
        this.ctx.fillRect(150, 250, 60, 150);
        // 南极
        this.ctx.fillRect(0, 420, 900, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('南极', 450, 460);
        
        // 表层暖流（红色）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.ctx.beginPath();
        this.ctx.moveTo(250, 300);
        this.ctx.quadraticCurveTo(300, 200, 400, 180);
        this.ctx.quadraticCurveTo(500, 160, 600, 200);
        this.ctx.quadraticCurveTo(700, 250, 750, 300);
        this.ctx.stroke();
        
        // 深层冷流（蓝色）
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.ctx.setLineDash([10, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(400, 150);
        this.ctx.quadraticCurveTo(350, 300, 300, 400);
        this.ctx.quadraticCurveTo(400, 420, 600, 400);
        this.ctx.quadraticCurveTo(750, 380, 800, 350);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 下沉区域
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(400, 150, 15, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('冷水下沉', 400, 130);
        
        // 图例
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(20, 20, 180, 80);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('━ 表层暖流', 30, 45);
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(30, 35, 20, 3);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('┅ 深层冷流', 30, 70);
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(30, 60, 20, 3);
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('● 下沉区', 30, 95);
        
        // 标注
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌊 大西洋温盐环流（全球传送带）', 450, 480);
    }
    
    // 世界地图基础
    drawWorldMapBase() {
        // 海洋背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#1e3a5f');
        gradient.addColorStop(0.5, '#0ea5e9');
        gradient.addColorStop(1, '#1e3a5f');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 简化的大陆轮廓
        this.ctx.fillStyle = '#22c55e';
        // 北美
        this.ctx.fillRect(50, 80, 120, 150);
        // 南美
        this.ctx.fillRect(100, 280, 60, 180);
        // 欧洲
        this.ctx.fillRect(380, 60, 80, 80);
        // 非洲
        this.ctx.fillRect(380, 160, 100, 200);
        // 亚洲
        this.ctx.fillRect(500, 50, 250, 200);
        // 澳洲
        this.ctx.fillRect(700, 320, 100, 80);
        
        // 赤道线
        this.ctx.strokeStyle = 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 250);
        this.ctx.lineTo(900, 250);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.fillStyle = 'rgba(255,255,255,0.5)';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('赤道', 5, 245);
    }
    
    // 绘制曲线箭头
    drawCurvedArrow(x1, y1, cx, cy, x2, y2, showHead = true) {
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo(cx, cy, x2, y2);
        this.ctx.stroke();
        
        if (showHead) {
            const angle = Math.atan2(y2 - cy, x2 - cx);
            const headLen = 12;
            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fillStyle = this.ctx.strokeStyle;
            this.ctx.fill();
        }
    }
}

// 启动系统
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new OceanExploreSystem();
    
    // 监听测量进度
    setInterval(() => {
        if (game.measurements.warm) {
            const el = document.getElementById('measure-warm');
            if (el) {
                el.style.background = '#dcfce7';
                el.style.color = '#065f46';
                el.textContent = '✅ 暖流区域';
            }
        }
        if (game.measurements.cold) {
            const el = document.getElementById('measure-cold');
            if (el) {
                el.style.background = '#dbeafe';
                el.style.color = '#1e40af';
                el.textContent = '✅ 寒流区域';
            }
        }
        if (game.measurements.normal) {
            const el = document.getElementById('measure-normal');
            if (el) {
                el.style.background = '#e0f2fe';
                el.style.color = '#0369a1';
                el.textContent = '✅ 普通海域';
            }
        }
    }, 100);
});
