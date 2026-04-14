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
        // 隐藏章节选择，显示任务界面
        document.getElementById('chapter-select').classList.add('hidden');
        document.getElementById('task-screen').classList.remove('hidden');
        
        // 初始化粒子（如果还没有）
        if (this.particles.length === 0) {
            this.initParticles();
        }
        
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
        
        // 绘制洋流区域
        this.drawCurrentZones();
        
        // 绘制粒子
        this.drawParticles();
        
        // 绘制科考船
        this.drawShip();
        
        // 绘制温度计（如果正在测量）
        if (this.taskStage === 'interact' && this.currentTemp !== null) {
            this.drawThermometer();
        }
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
        
        // 任务配置
        const tasks = [
            {
                title: '任务1：测量海水温度',
                question: '你发现红色海域和蓝色海域的温度有什么不同？为什么会有这种差异？',
                instruction: '点击地图上的不同海域，科考船会自动航行到该位置并测量水温。'
            },
            {
                title: '任务2：观察洋流流向',
                question: '暖流和寒流的流向有什么规律？它们分别从哪里流向哪里？',
                instruction: '观察地图上洋流的流动方向（粒子流动方向），思考流向规律。'
            },
            {
                title: '任务3：推理洋流定义',
                question: '根据前面的观察，你能用自己的话定义什么是暖流和寒流吗？',
                instruction: '结合温度和流向的观察，总结暖流和寒流的科学定义。'
            },
            {
                title: '任务4：预测气候影响',
                question: '如果一个地区沿岸有暖流经过，你认为会对气候产生什么影响？寒流呢？',
                instruction: '思考海水温度如何影响沿岸地区的气温和降水。'
            },
            {
                title: '任务5：案例验证',
                question: '英国和加拿大纽芬兰岛纬度相近，但英国更温暖。根据洋流知识，你能解释原因吗？',
                instruction: '运用洋流知识解释真实的地理现象。'
            }
        ];
        
        const task = tasks[taskIndex];
        
        // 更新UI
        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-number').textContent = `${taskIndex + 1}/5`;
        document.getElementById('thinking-question').textContent = task.question;
        document.getElementById('chapter-title').textContent = `第1章：观察与发现 - 任务${taskIndex + 1}`;
        
        // 清空输入
        document.getElementById('answer-input').value = '';
        document.getElementById('observation-log').innerHTML = '';
        
        // 显示控制面板
        const controlsPanel = document.getElementById('controls-panel');
        if (taskIndex === 0) {
            controlsPanel.innerHTML = `
                <h4>🌡️ 温度测量仪</h4>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                    ${task.instruction}
                </p>
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
                    <div style="font-size: 12px; color: #1e40af; margin-bottom: 8px;">测量进度</div>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                        <div id="measure-warm" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">
                            ⭕ 暖流区域
                        </div>
                        <div id="measure-cold" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">
                            ⭕ 寒流区域
                        </div>
                        <div id="measure-normal" style="padding: 6px 12px; background: white; border-radius: 6px; font-size: 12px; color: #64748b;">
                            ⭕ 普通海域
                        </div>
                    </div>
                </div>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                    💡 提示：完成所有三个区域的测量后，思考它们的温度差异。
                </div>
            `;
        } else {
            controlsPanel.innerHTML = `
                <h4>💭 思考提示</h4>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                    ${task.instruction}
                </p>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                    💡 提示：结合前面的观察和测量结果来思考。
                </div>
            `;
            // 非第一个任务直接显示思考区
            setTimeout(() => {
                document.getElementById('thinking-area').style.display = 'block';
            }, 500);
        }
        
        // 隐藏思考区和总结区
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.add('hidden');
        
        // 开始互动阶段
        this.taskStage = 'interact';
        
        // 更新进度条
        document.getElementById('progress-fill').style.width = '0%';
    }
    
    submitAnswer() {
        // 不强制写感言，直接可以提交
        
        // 根据任务显示不同的总结
        const summaries = [
            `通过测量，你发现：<br><br>
            • 暖流区域的水温<strong>比周围海水高</strong><br>
            • 寒流区域的水温<strong>比周围海水低</strong><br>
            • 这就是<strong>暖流</strong>和<strong>寒流</strong>的温度特征<br><br>
            <strong>关键概念</strong>：暖流和寒流不是指绝对温度，而是指<strong>相对于周围海水</strong>的温度。`,
            
            `通过观察，你发现：<br><br>
            • 暖流从<strong>低纬度</strong>流向<strong>高纬度</strong><br>
            • 寒流从<strong>高纬度</strong>流向<strong>低纬度</strong><br>
            • 洋流的流向与温度变化有关<br><br>
            <strong>关键概念</strong>：洋流总是从温度高的地方流向温度低的地方，或相反。`,
            
            `你总结出：<br><br>
            • <strong>暖流</strong>：从水温高的海区流向水温低的海区<br>
            • <strong>寒流</strong>：从水温低的海区流向水温高的海区<br>
            • 关键是<strong>相对温度</strong>，而不是绝对温度<br><br>
            <strong>科学定义</strong>：洋流的冷暖性质取决于它相对于流经海区的温度。`,
            
            `你推理出：<br><br>
            • 暖流会使沿岸气候<strong>增温加湿</strong><br>
            • 寒流会使沿岸气候<strong>降温减湿</strong><br>
            • 洋流是影响气候的重要因素<br><br>
            <strong>原理</strong>：海水温度影响空气温度和蒸发量，进而影响气候。`,
            
            `案例分析：<br><br>
            • 英国受<strong>北大西洋暖流</strong>影响，气候温暖湿润<br>
            • 纽芬兰受<strong>拉布拉多寒流</strong>影响，气候寒冷<br>
            • 这验证了洋流对气候的重要影响<br><br>
            <strong>结论</strong>：洋流是造成同纬度地区气候差异的重要原因。`
        ];
        
        document.getElementById('summary-content').innerHTML = summaries[this.currentTask];
        
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.remove('hidden');
        
        // 更新进度
        const progress = ((this.currentTask + 1) / 5) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        this.taskStage = 'summary';
    }
    
    nextTask() {
        const nextTaskIndex = this.currentTask + 1;
        if (nextTaskIndex < 5) {
            this.showTask(nextTaskIndex);
        } else {
            // 完成所有任务
            this.completeChapter();
        }
    }
    
    completeChapter() {
        document.getElementById('task-screen').classList.add('hidden');
        document.getElementById('chapter-complete').classList.remove('hidden');
        
        // 生成学习总结
        document.getElementById('learning-summary').innerHTML = `
            <ul style="list-style: none; padding: 0;">
                <li style="margin-bottom: 12px;">✅ 理解了暖流和寒流的温度特征</li>
                <li style="margin-bottom: 12px;">✅ 掌握了洋流的流向规律</li>
                <li style="margin-bottom: 12px;">✅ 能够定义暖流和寒流的概念</li>
                <li style="margin-bottom: 12px;">✅ 了解了洋流对气候的影响</li>
                <li style="margin-bottom: 12px;">✅ 学会用洋流知识解释实际现象</li>
            </ul>
        `;
        
        document.getElementById('progress-fill').style.width = '100%';
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
