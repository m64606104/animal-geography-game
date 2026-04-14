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
            x: 100,
            y: 250,
            targetX: 100,
            targetY: 250,
            speed: 2,
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
        this.startAnimation();
        this.showTask(0);
    }
    
    initParticles() {
        // 暖流粒子（红色区域）
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: 100 + Math.random() * 250,
                y: Math.random() * 500,
                vx: 1 + Math.random(),
                vy: (Math.random() - 0.5) * 0.5,
                type: 'warm',
                size: 2 + Math.random() * 2
            });
        }
        
        // 寒流粒子（蓝色区域）
        for (let i = 0; i < 50; i++) {
            this.particles.push({
                x: 550 + Math.random() * 250,
                y: Math.random() * 500,
                vx: -1 - Math.random(),
                vy: (Math.random() - 0.5) * 0.5,
                type: 'cold',
                size: 2 + Math.random() * 2
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
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
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
            
            // 边界检查
            if (p.type === 'warm') {
                if (p.x > 350) p.x = 100;
                if (p.x < 100) p.x = 350;
            } else {
                if (p.x < 550) p.x = 800;
                if (p.x > 800) p.x = 550;
            }
            
            if (p.y < 0) p.y = 500;
            if (p.y > 500) p.y = 0;
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
        // 暖流区域（红色）
        const warmGradient = this.ctx.createLinearGradient(100, 0, 350, 0);
        warmGradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');
        warmGradient.addColorStop(1, 'rgba(239, 68, 68, 0.5)');
        this.ctx.fillStyle = warmGradient;
        this.ctx.fillRect(100, 100, 250, 300);
        
        // 边框
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(100, 100, 250, 300);
        
        // 标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText('暖流区域', 225, 260);
        this.ctx.shadowBlur = 0;
        
        // 寒流区域（蓝色）
        const coldGradient = this.ctx.createLinearGradient(550, 0, 800, 0);
        coldGradient.addColorStop(0, 'rgba(59, 130, 246, 0.3)');
        coldGradient.addColorStop(1, 'rgba(59, 130, 246, 0.5)');
        this.ctx.fillStyle = coldGradient;
        this.ctx.fillRect(550, 100, 250, 300);
        
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(550, 100, 250, 300);
        
        this.ctx.fillStyle = 'white';
        this.ctx.shadowColor = 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = 4;
        this.ctx.fillText('寒流区域', 675, 260);
        this.ctx.shadowBlur = 0;
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
        // 检查点击的是哪个区域
        if (x >= 100 && x <= 350 && y >= 100 && y <= 400) {
            // 暖流区域
            this.measureArea('warm', x, y);
        } else if (x >= 550 && x <= 800 && y >= 100 && y <= 400) {
            // 寒流区域
            this.measureArea('cold', x, y);
        } else {
            // 普通海域
            this.measureArea('normal', x, y);
        }
    }
    
    measureArea(type, x, y) {
        // 移动船到点击位置
        this.ship.targetX = x;
        this.ship.targetY = y;
        
        // 设置目标温度
        const temps = {
            warm: 28,
            cold: 5,
            normal: 20
        };
        
        this.targetTemp = temps[type];
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
        const observations = {
            warm: '📌 暖流区域测量：水温28°C，比周围海水高8°C',
            cold: '📌 寒流区域测量：水温5°C，比周围海水低15°C',
            normal: '📌 普通海域测量：水温20°C（基准温度）'
        };
        
        const log = document.getElementById('observation-log');
        const item = document.createElement('div');
        item.className = 'observation-item';
        item.textContent = observations[type];
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
        
        // 更新UI
        document.getElementById('task-title').textContent = '任务1：测量海水温度';
        document.getElementById('task-number').textContent = '1/5';
        document.getElementById('thinking-question').textContent = '你发现红色海域和蓝色海域的温度有什么不同？为什么会有这种差异？';
        document.getElementById('chapter-title').textContent = '第1章：观察与发现';
        
        // 清空输入
        document.getElementById('answer-input').value = '';
        document.getElementById('observation-log').innerHTML = '';
        
        // 显示控制面板
        const controlsPanel = document.getElementById('controls-panel');
        controlsPanel.innerHTML = `
            <h4>🌡️ 温度测量仪</h4>
            <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                点击地图上的不同海域，科考船会自动航行到该位置并测量水温。
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
        
        // 隐藏思考区和总结区
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.add('hidden');
        
        // 开始互动阶段
        this.taskStage = 'interact';
        
        // 更新进度条
        document.getElementById('progress-fill').style.width = '0%';
    }
    
    submitAnswer() {
        const answer = document.getElementById('answer-input').value.trim();
        
        if (answer.length < 15) {
            alert('请写下更详细的想法（至少15个字）');
            return;
        }
        
        // 显示总结
        document.getElementById('summary-content').innerHTML = `
            通过测量，你发现：<br><br>
            • 暖流区域的水温（28°C）<strong>比周围海水高</strong><br>
            • 寒流区域的水温（5°C）<strong>比周围海水低</strong><br>
            • 这就是<strong>暖流</strong>和<strong>寒流</strong>的温度特征<br><br>
            <strong>关键概念</strong>：暖流和寒流不是指绝对温度，而是指<strong>相对于周围海水</strong>的温度。
        `;
        
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.remove('hidden');
        
        // 更新进度
        document.getElementById('progress-fill').style.width = '20%';
        
        this.taskStage = 'summary';
    }
    
    nextTask() {
        alert('第2-5个任务正在开发中，敬请期待！');
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
