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
        
        // 初始化粒子（如果还没有）
        if (this.particles.length === 0) {
            this.initParticles();
        }
        
        // 重置实验状态
        this.experimentState = {
            windDirection: 0,
            windStrength: 0,
            temperature: 20,
            salinity: 35,
            waterRemoved: false
        };
        
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
    
    // ========== 第2章实验可视化 ==========
    drawChapter2Wind() {
        // 风力实验可视化
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 水面
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(0, 250, 900, 250);
        
        // 风向箭头
        const windDir = this.experimentState.windDirection || 90;
        const windStr = this.experimentState.windStrength || 50;
        
        this.ctx.save();
        this.ctx.translate(450, 120);
        this.ctx.rotate((windDir - 90) * Math.PI / 180);
        
        // 风箭头
        const arrowSize = 30 + windStr * 0.5;
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.beginPath();
        this.ctx.moveTo(arrowSize, 0);
        this.ctx.lineTo(-arrowSize/2, -arrowSize/2);
        this.ctx.lineTo(-arrowSize/2, arrowSize/2);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // 风的标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌬️ 风', 450, 80);
        
        // 海水流动粒子
        const speed = windStr / 50;
        for (let i = 0; i < 30; i++) {
            const x = (this.animationFrame * speed + i * 30) % 900;
            const y = 300 + Math.sin(x * 0.02) * 20 + (i % 5) * 30;
            this.ctx.fillStyle = 'rgba(255,255,255,0.6)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 说明
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 420, 800, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('观察：风持续吹动海面，海水会沿着风向流动', 450, 445);
        this.ctx.fillText(`当前风力：${windStr}%，海水流速随风力增大而加快`, 450, 465);
    }
    
    drawChapter2Density() {
        // 温度密度实验
        this.ctx.fillStyle = '#1e3a5f';
        this.ctx.fillRect(0, 0, 900, 500);
        
        const temp = this.experimentState.temperature || 15;
        
        // 左边：冷水
        const coldGradient = this.ctx.createLinearGradient(100, 100, 100, 400);
        coldGradient.addColorStop(0, '#93c5fd');
        coldGradient.addColorStop(1, '#1e40af');
        this.ctx.fillStyle = coldGradient;
        this.ctx.fillRect(100, 100, 200, 300);
        
        // 右边：热水
        const warmGradient = this.ctx.createLinearGradient(600, 100, 600, 400);
        warmGradient.addColorStop(0, '#fca5a5');
        warmGradient.addColorStop(1, '#ef4444');
        this.ctx.fillStyle = warmGradient;
        this.ctx.fillRect(600, 100, 200, 300);
        
        // 中间：实验水
        const testY = 100 + (30 - temp) * 8; // 温度越低，下沉越多
        const testColor = temp < 15 ? '#60a5fa' : '#f87171';
        this.ctx.fillStyle = testColor;
        this.ctx.beginPath();
        this.ctx.arc(450, testY, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('冷水 (5°C)', 200, 80);
        this.ctx.fillText('热水 (25°C)', 700, 80);
        this.ctx.fillText(`实验水 (${temp}°C)`, 450, 50);
        
        // 箭头指示
        if (temp < 15) {
            this.ctx.fillText('↓ 下沉', 450, testY + 60);
        } else {
            this.ctx.fillText('↑ 上浮', 450, testY - 50);
        }
        
        // 说明
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 420, 800, 60);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('观察：冷水密度大会下沉，热水密度小会上浮', 450, 445);
        this.ctx.fillText('这种密度差异是形成深层洋流的重要原因', 450, 465);
    }
    
    drawChapter2Salinity() {
        // 盐度实验
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, 900, 500);
        
        const sal = this.experimentState.salinity || 35;
        
        // 容器
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(200, 100, 500, 300);
        
        // 盐分粒子
        const saltY = 100 + (sal - 30) * 20; // 盐度越高，下沉越多
        for (let i = 0; i < sal - 25; i++) {
            const x = 250 + (i % 10) * 45;
            const y = saltY + Math.floor(i / 10) * 30 + Math.sin(this.animationFrame * 0.05 + i) * 5;
            this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`盐度：${sal}‰`, 450, 70);
        
        if (sal > 36) {
            this.ctx.fillText('高盐度海水 → 密度大 → 下沉', 450, 450);
        } else if (sal < 34) {
            this.ctx.fillText('低盐度海水 → 密度小 → 上浮', 450, 450);
        } else {
            this.ctx.fillText('正常盐度海水', 450, 450);
        }
    }
    
    drawChapter2Compensation() {
        // 补偿流实验
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 海水
        this.ctx.fillStyle = '#0284c7';
        this.ctx.fillRect(0, 200, 900, 300);
        
        if (this.experimentState.waterRemoved) {
            // 抽走的区域
            this.ctx.fillStyle = '#0ea5e9';
            this.ctx.fillRect(350, 200, 200, 150);
            
            // 补偿流箭头
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 4;
            
            // 左边补偿
            this.ctx.beginPath();
            this.ctx.moveTo(250, 280);
            this.ctx.lineTo(340, 280);
            this.ctx.stroke();
            this.ctx.fillStyle = '#fbbf24';
            this.ctx.beginPath();
            this.ctx.moveTo(340, 280);
            this.ctx.lineTo(320, 265);
            this.ctx.lineTo(320, 295);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 右边补偿
            this.ctx.beginPath();
            this.ctx.moveTo(650, 280);
            this.ctx.lineTo(560, 280);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(560, 280);
            this.ctx.lineTo(580, 265);
            this.ctx.lineTo(580, 295);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 底部上升流
            this.ctx.beginPath();
            this.ctx.moveTo(450, 450);
            this.ctx.lineTo(450, 360);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.moveTo(450, 360);
            this.ctx.lineTo(435, 380);
            this.ctx.lineTo(465, 380);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('海水被抽走', 450, 280);
            this.ctx.fillText('周围海水补充', 450, 420);
        }
        
        // 说明
        this.ctx.fillStyle = 'rgba(0,0,0,0.7)';
        this.ctx.fillRect(50, 30, 800, 50);
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('补偿流：当一个区域的海水被移走时，周围的海水会流过来补充', 450, 60);
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
