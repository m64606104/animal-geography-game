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
        
        // 根据任务绘制不同内容
        switch (this.currentTask) {
            case 0:
                // 任务1：测温游戏
                this.drawCurrentZones();
                this.drawParticles();
                this.drawShip();
                if (this.taskStage === 'interact' && this.currentTemp !== null) {
                    this.drawThermometer();
                }
                break;
            case 1:
                // 任务2：观察流向 - 显示流向箭头动画
                this.drawTask2FlowDirection();
                break;
            case 2:
                // 任务3：洋流定义 - 显示对比图
                this.drawTask3Comparison();
                break;
            case 3:
                // 任务4：气候影响 - 显示气候示意图
                this.drawTask4Climate();
                break;
            case 4:
                // 任务5：案例分析 - 显示世界地图
                this.drawTask5WorldMap();
                break;
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
        
        // 任务配置 - 每个任务有独立的内容
        const tasks = [
            {
                title: '任务1：测量海水温度',
                question: '观察你测量的数据，暖流区域和寒流区域的温度有什么特点？它们与普通海水相比有什么不同？',
                instruction: '点击地图上的不同海域，科考船会自动航行到该位置并测量水温。',
                hasGame: true
            },
            {
                title: '任务2：观察洋流流向',
                question: '观察地图上的粒子流动方向：暖流（红色区域）向哪个方向流动？寒流（蓝色区域）呢？这与纬度有什么关系？',
                instruction: '仔细观察地图上白色粒子的流动方向，暖流区域的粒子向上（高纬度）流动，寒流区域的粒子向下（低纬度）流动。',
                hasGame: false,
                hint: '💡 提示：注意粒子的移动方向。暖流从赤道附近流向两极方向，寒流从两极流向赤道方向。'
            },
            {
                title: '任务3：总结洋流定义',
                question: '根据前两个任务的观察，请用自己的话回答：什么是暖流？什么是寒流？（提示：从温度和流向两个角度思考）',
                instruction: '结合温度测量和流向观察的结果，尝试给出暖流和寒流的定义。',
                hasGame: false,
                hint: '💡 提示：暖流和寒流的"暖"和"寒"是相对于流经海区的温度而言的，不是指绝对温度。'
            },
            {
                title: '任务4：推理气候影响',
                question: '假设某沿海城市附近有暖流经过，你认为这会对当地气候产生什么影响？如果是寒流呢？请从气温和降水两方面分析。',
                instruction: '思考：海水温度会影响空气温度，温暖的海水蒸发更多水汽...',
                hasGame: false,
                hint: '💡 提示：暖流→海水温度高→空气增温→蒸发旺盛→降水增多；寒流则相反。'
            },
            {
                title: '任务5：案例分析',
                question: '英国伦敦（51°N）和加拿大纽芬兰岛（49°N）纬度相近，但伦敦冬季平均气温约5°C，而纽芬兰岛约-5°C。请用洋流知识解释这种差异。',
                instruction: '运用你学到的洋流知识，分析两地气候差异的原因。',
                hasGame: false,
                hint: '💡 提示：查看世界洋流分布图，英国附近有什么洋流？纽芬兰附近呢？'
            }
        ];
        
        const task = tasks[taskIndex];
        
        // 更新UI
        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-number').textContent = `${taskIndex + 1}/5`;
        document.getElementById('thinking-question').textContent = task.question;
        document.getElementById('chapter-title').textContent = `第1章：观察与发现`;
        
        // 清空输入
        document.getElementById('answer-input').value = '';
        document.getElementById('observation-log').innerHTML = '';
        
        // 显示控制面板
        const controlsPanel = document.getElementById('controls-panel');
        
        if (task.hasGame) {
            // 任务1：有测温游戏
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
                    💡 提示：完成所有三个区域的测量后，回答思考问题。
                </div>
            `;
        } else {
            // 任务2-5：观察或思考题
            controlsPanel.innerHTML = `
                <h4>� 任务说明</h4>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                    ${task.instruction}
                </p>
                <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                    ${task.hint}
                </div>
            `;
            // 非游戏任务直接显示思考区
            setTimeout(() => {
                document.getElementById('thinking-area').style.display = 'block';
            }, 300);
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
        
        document.getElementById('summary-content').innerHTML = knowledgePoints[this.currentTask];
        
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
