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
        // 返回按钮 - 返回主页
        document.getElementById('back-btn').addEventListener('click', () => {
            if (confirm('确定要返回主页吗？当前进度将不会保存。')) {
                window.location.href = 'index.html';
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
                this.drawTask1Temperature();
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
            case 'climate_change':
                this.drawChapter5ClimateChange();
                break;
            case 'observe':
                // 第1章的观察任务（任务1-4，索引1-4）
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
    
    // ========== 第1章：任务1 - 精致温度测量场景 ==========
    drawTask1Temperature() {
        // 海洋渐变背景（从浅蓝到深蓝）
        const oceanGradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        oceanGradient.addColorStop(0, '#0c4a6e');
        oceanGradient.addColorStop(0.3, '#075985');
        oceanGradient.addColorStop(0.6, '#0369a1');
        oceanGradient.addColorStop(1, '#0284c7');
        this.ctx.fillStyle = oceanGradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制波浪纹理
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 2;
        for (let y = 50; y < 500; y += 40) {
            this.ctx.beginPath();
            for (let x = 0; x < 900; x += 20) {
                const waveY = y + Math.sin((x + this.animationFrame * 2) * 0.02) * 5;
                if (x === 0) this.ctx.moveTo(x, waveY);
                else this.ctx.lineTo(x, waveY);
            }
            this.ctx.stroke();
        }
        
        // 精致暖流区域（左下方）- 带发光效果
        this.ctx.save();
        const warmGlow = this.ctx.createRadialGradient(180, 350, 30, 180, 350, 200);
        warmGlow.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
        warmGlow.addColorStop(0.3, 'rgba(239, 68, 68, 0.4)');
        warmGlow.addColorStop(0.6, 'rgba(239, 68, 68, 0.15)');
        warmGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
        this.ctx.fillStyle = warmGlow;
        this.ctx.beginPath();
        this.ctx.ellipse(180, 350, 180, 120, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 精致寒流区域（右上方）- 带发光效果
        this.ctx.save();
        const coldGlow = this.ctx.createRadialGradient(720, 150, 30, 720, 150, 180);
        coldGlow.addColorStop(0, 'rgba(59, 130, 246, 0.8)');
        coldGlow.addColorStop(0.3, 'rgba(59, 130, 246, 0.4)');
        coldGlow.addColorStop(0.6, 'rgba(59, 130, 246, 0.15)');
        coldGlow.addColorStop(1, 'rgba(59, 130, 246, 0)');
        this.ctx.fillStyle = coldGlow;
        this.ctx.beginPath();
        this.ctx.ellipse(720, 150, 160, 100, 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 普通海域区域（中间）
        this.ctx.save();
        const normalGlow = this.ctx.createRadialGradient(450, 250, 20, 450, 250, 100);
        normalGlow.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
        normalGlow.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
        normalGlow.addColorStop(1, 'rgba(34, 197, 94, 0)');
        this.ctx.fillStyle = normalGlow;
        this.ctx.beginPath();
        this.ctx.ellipse(450, 250, 100, 80, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 精致标签卡片 - 暖流
        this.drawInfoCard(100, 420, '🔥 暖流区域', '点击测量温度', '#ef4444');
        
        // 精致标签卡片 - 寒流
        this.drawInfoCard(640, 80, '❄️ 寒流区域', '点击测量温度', '#3b82f6');
        
        // 精致标签卡片 - 普通海域
        this.drawInfoCard(380, 320, '🌊 普通海域', '点击测量温度', '#22c55e');
        
        // 标题栏
        this.drawSceneTitle('🌡️ 温度测量任务', '点击不同海域，使用科考船测量水温，发现洋流温度规律');
        
        // 绘制科考船（如果位置已设置）
        if (this.ship.x && this.ship.y) {
            this.drawDetailedShip(this.ship.x, this.ship.y);
        }
    }
    
    // 绘制信息卡片
    drawInfoCard(x, y, title, subtitle, color) {
        // 卡片背景（圆角矩形）
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 4;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 160, 70, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        // 左侧彩色条
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 6, 70, [12, 0, 0, 12]);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 18, y + 28);
        
        // 副标题
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = '13px Arial';
        this.ctx.fillText(subtitle, x + 18, y + 52);
    }
    
    // 绘制场景标题
    drawSceneTitle(title, subtitle) {
        // 标题背景
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.roundRect(200, 10, 500, 60, 15);
        this.ctx.fill();
        this.ctx.restore();
        
        // 主标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, 450, 38);
        
        // 副标题
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(subtitle, 450, 58);
    }
    
    // 精致科考船绘制
    drawDetailedShip(x, y) {
        this.ctx.save();
        
        // 船体阴影
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 5, y + 25, 35, 10, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 船体（主）
        this.ctx.fillStyle = '#f8fafc';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 35, y + 5);
        this.ctx.lineTo(x + 35, y + 5);
        this.ctx.quadraticCurveTo(x + 30, y + 20, x + 20, y + 22);
        this.ctx.lineTo(x - 20, y + 22);
        this.ctx.quadraticCurveTo(x - 30, y + 20, x - 35, y + 5);
        this.ctx.fill();
        
        // 船体红色底部
        this.ctx.fillStyle = '#dc2626';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 33, y + 8);
        this.ctx.lineTo(x + 33, y + 8);
        this.ctx.lineTo(x + 20, y + 22);
        this.ctx.lineTo(x - 20, y + 22);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 船舱
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.fillRect(x - 20, y - 12, 40, 17);
        
        // 窗户
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(x - 10, y - 3, 4, 0, Math.PI * 2);
        this.ctx.arc(x + 10, y - 3, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 桅杆
        this.ctx.strokeStyle = '#64748b';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 12);
        this.ctx.lineTo(x, y - 35);
        this.ctx.stroke();
        
        // 旗帜
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - 35);
        this.ctx.lineTo(x + 18, y - 28);
        this.ctx.lineTo(x, y - 21);
        this.ctx.fill();
        
        // 雷达
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 38, 5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 38, 2, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
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
        
        // 隐藏思考区和总结区，并清空知识点总结内容
        document.getElementById('thinking-area').style.display = 'none';
        document.getElementById('summary-area').classList.add('hidden');
        document.getElementById('summary-content').innerHTML = ''; // 清空知识点总结内容
        
        // 根据任务类型显示/隐藏观察记录区
        const observationArea = document.querySelector('.observation-area');
        if (observationArea) {
            // 只有第1章的任务1（索引0，温度测量任务）需要显示观察记录
            const needsObservation = (this.currentChapter === 1) && (this.currentTask === 0);
            observationArea.style.display = needsObservation ? 'block' : 'none';
        }
        
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
                // 第3章知识点（详细版）
                `<div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #0284c7; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #0369a1; margin-bottom: 12px; font-size: 16px;">🌍 北半球洋流分布规律</h4>
                    <p style="line-height: 1.8; color: #0c4a6e;">
                        <strong style="color: #0369a1;">答案解析：</strong><br>
                        北半球中低纬度（0°-30°N）大洋环流呈<strong style="color: #dc2626;">顺时针</strong>方向流动。<br><br>
                        <strong>🔬 科学原理：</strong><br>
                        1. <strong>地转偏向力</strong>：北半球向右偏，使洋流在运动过程中不断向右偏移<br>
                        2. <strong>信风驱动</strong>：东北信风推动赤道海水向西流动，形成北赤道暖流<br>
                        3. <strong>大陆阻挡</strong>：遇到大陆后分别向南北分流，形成完整的环流系统<br><br>
                        <strong>📍 典型代表：</strong><br>
                        • 北太平洋：北赤道暖流 → 日本暖流（黑潮）→ 北太平洋暖流 → 加利福尼亚寒流<br>
                        • 北大西洋：北赤道暖流 → 墨西哥湾暖流 → 北大西洋暖流 → 加那利寒流<br><br>
                        <strong>💡 记忆口诀：</strong>北顺南逆，东暖西寒（中低纬度大陆东岸为暖流，西岸为寒流）
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #db2777; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #be185d; margin-bottom: 12px; font-size: 16px;">🌏 南半球洋流分布规律</h4>
                    <p style="line-height: 1.8; color: #831843;">
                        <strong style="color: #be185d;">答案解析：</strong><br>
                        南半球中低纬度（0°-30°S）大洋环流呈<strong style="color: #dc2626;">逆时针</strong>方向流动。<br><br>
                        <strong>🔬 科学原理：</strong><br>
                        1. <strong>地转偏向力</strong>：南半球向左偏，与北半球相反，形成逆时针环流<br>
                        2. <strong>东南信风</strong>：推动海水向西流动，形成南赤道暖流<br>
                        3. <strong>西风漂流</strong>：南半球40°-60°S海域，强劲的西风形成环球西风漂流<br><br>
                        <strong>📍 典型代表：</strong><br>
                        • 南太平洋：南赤道暖流 → 东澳大利亚暖流 → 西风漂流 → 秘鲁寒流<br>
                        • 南大西洋：南赤道暖流 → 巴西暖流 → 西风漂流 → 本格拉寒流<br><br>
                        <strong>⚠️ 特殊现象：</strong>南极环流是全球最强大的洋流，流量约为所有河流总和的100倍！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #16a34a; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #15803d; margin-bottom: 12px; font-size: 16px;">🌊 赤道洋流系统</h4>
                    <p style="line-height: 1.8; color: #14532d;">
                        <strong style="color: #15803d;">答案解析：</strong><br>
                        赤道附近洋流主要受<strong style="color: #dc2626;">信风</strong>驱动，总体自东向西流动。<br><br>
                        <strong>🔬 形成机制：</strong><br>
                        1. <strong>信风带</strong>：赤道两侧分别为东北信风（北半球）和东南信风（南半球）<br>
                        2. <strong>风向一致</strong>：两半球信风都推动海水自东向西运动<br>
                        3. <strong>赤道逆流</strong>：在赤道附近还存在一条自西向东的赤道逆流（补偿流）<br><br>
                        <strong>📍 主要洋流：</strong><br>
                        • 北赤道暖流：位于10°-20°N，由东北信风驱动<br>
                        • 南赤道暖流：位于0°-10°S，由东南信风驱动<br>
                        • 赤道逆流：位于赤道附近，自西向东补偿流<br><br>
                        <strong>🌡️ 温度特征：</strong>赤道洋流多为暖流，携带热带温暖海水向高纬度输送
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #d97706; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #b45309; margin-bottom: 12px; font-size: 16px;">🌏 季风洋流（北印度洋）</h4>
                    <p style="line-height: 1.8; color: #78350f;">
                        <strong style="color: #b45309;">答案解析：</strong><br>
                        北印度洋是全球唯一受<strong style="color: #dc2626;">季风</strong>主导的季节性洋流系统。<br><br>
                        <strong>🔬 形成机制：</strong><br>
                        1. <strong>冬季（11月-次年2月）</strong>：东北季风 → 洋流逆时针流动<br>
                        2. <strong>夏季（6月-9月）</strong>：西南季风 → 洋流顺时针流动<br>
                        3. <strong>海陆热力差异</strong>：亚洲大陆与印度洋之间的温度差驱动季风<br><br>
                        <strong>📍 季节性变化：</strong><br>
                        • 冬季：索马里暖流 → 赤道逆流 → 孟加拉湾暖流（逆时针）<br>
                        • 夏季：索马里寒流 ← 西南季风漂流 ← 孟加拉湾暖流（顺时针）<br><br>
                        <strong>⚠️ 特殊现象：</strong>夏季索马里沿岸出现独特的<strong>上升流</strong>，形成寒流，带来丰富渔业资源！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #7c3aed; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #6d28d9; margin-bottom: 12px; font-size: 16px;">📊 全球洋流分布总结</h4>
                    <p style="line-height: 1.8; color: #4c1d95;">
                        <strong style="color: #6d28d9;">答案解析：</strong><br>
                        全球洋流分布遵循"北顺南逆，东暖西寒"的规律。<br><br>
                        <strong>🔬 规律总结：</strong><br>
                        1. <strong>北顺南逆</strong>：北半球顺时针，南半球逆时针（中低纬度）<br>
                        2. <strong>东暖西寒</strong>：大陆东岸（大洋西岸）多为暖流，大陆西岸（大洋东岸）多为寒流<br>
                        3. <strong>高纬度例外</strong>：北半球高纬度（60°N以上）为逆时针，南半球高纬度为西风漂流<br><br>
                        <strong>📍 成因分析：</strong><br>
                        • 地转偏向力是导致南北半球方向相反的根本原因<br>
                        • 大陆轮廓决定洋流路径和转向位置<br>
                        • 盛行风带是驱动洋流的主要动力<br><br>
                        <strong>💡 实际应用：</strong>理解这些规律有助于预测气候、规划航线、寻找渔场！
                    </p>
                </div>`
            ],
            4: [
                // 第4章知识点（详细版）
                `<div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #0284c7; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #0369a1; margin-bottom: 12px; font-size: 16px;">🐟 世界大渔场与洋流</h4>
                    <p style="line-height: 1.8; color: #0c4a6e;">
                        <strong style="color: #0369a1;">答案解析：</strong><br>
                        世界四大渔场中有三个形成于<strong style="color: #dc2626;">寒暖流交汇处</strong>，一个是上升流区域。<br><br>
                        <strong>🔬 形成原理：</strong><br>
                        1. <strong>海水扰动</strong>：寒暖流交汇产生搅动，将海底营养盐类带到表层<br>
                        2. <strong>营养富集</strong>：营养盐促进浮游生物大量繁殖，形成饵料基础<br>
                        3. <strong>水障效应</strong>：交汇区形成水障，阻碍鱼群游散，集中捕获<br><br>
                        <strong>📍 世界四大渔场：</strong><br>
                        • <strong>北海道渔场</strong>（日本）：日本暖流 + 千岛寒流交汇 🥇最大渔场<br>
                        • <strong>纽芬兰渔场</strong>（加拿大）：墨西哥湾暖流 + 拉布拉多寒流交汇<br>
                        • <strong>北海渔场</strong>（欧洲）：北大西洋暖流 + 东格陵兰寒流交汇<br>
                        • <strong>秘鲁渔场</strong>（南美）：秘鲁寒流（上升流）带来深层营养盐<br><br>
                        <strong>⚠️ 生态警示：</strong>过度捕捞已使纽芬兰渔场严重衰退，需要科学管理渔业资源！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #16a34a; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #15803d; margin-bottom: 12px; font-size: 16px;">🚢 航线规划与洋流</h4>
                    <p style="line-height: 1.8; color: #14532d;">
                        <strong style="color: #15803d;">答案解析：</strong><br>
                        顺流航行可<strong style="color: #dc2626;">节省30-40%燃料</strong>并缩短航行时间，逆流则成本大增。<br><br>
                        <strong>🔬 航海原理：</strong><br>
                        1. <strong>节约能源</strong>：顺流时船速=船速+流速，减少发动机功率<br>
                        2. <strong>缩短时间</strong>：同样距离下，顺流航行时间显著减少<br>
                        3. <strong>安全考虑</strong>：逆流航行增加船舶磨损和事故风险<br><br>
                        <strong>📍 经典航线案例：</strong><br>
                        • <strong>上海→旧金山</strong>：选择北太平洋航线，顺北太平洋暖流<br>
                        • <strong>欧洲→美洲</strong>：向东顺北大西洋暖流，向西则逆风逆流<br>
                        • <strong>好望角航线</strong>：利用西风漂流加速，但风浪大风险高<br><br>
                        <strong>⚠️ 历史教训：</strong>泰坦尼克号事故部分原因就是为节省燃料而选择的高纬度危险航线！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #d97706; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #b45309; margin-bottom: 12px; font-size: 16px;">🏜️ 寒流与沿岸沙漠</h4>
                    <p style="line-height: 1.8; color: #78350f;">
                        <strong style="color: #b45309;">答案解析：</strong><br>
                        寒流对沿岸气候起<strong style="color: #dc2626;">降温减湿</strong>作用，使沿海地区形成沙漠或干旱气候。<br><br>
                        <strong>🔬 形成机制：</strong><br>
                        1. <strong>降温作用</strong>：寒流使海面温度降低，空气冷却下沉<br>
                        2. <strong>减湿作用</strong>：冷空气难以蒸发水汽，无法形成降水<br>
                        3. <strong>逆温层</strong>：冷空气在下、暖空气在上，形成稳定逆温，抑制对流<br><br>
                        <strong>📍 典型荒漠案例：</strong><br>
                        • <strong>阿塔卡马沙漠</strong>（智利）：秘鲁寒流沿岸，世界最干旱地区之一<br>
                        • <strong>纳米布沙漠</strong>（纳米比亚）：本格拉寒流沿岸，沙漠直抵海边<br>
                        • <strong>撒哈拉西部</strong>：加那利寒流加剧干旱<br>
                        • <strong>澳大利亚西部</strong>：西澳大利亚寒流影响<br><br>
                        <strong>🌫️ 特殊现象：</strong>这些沙漠地区常出现海雾但无雨，形成"冷荒漠"景观！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #db2777; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #be185d; margin-bottom: 12px; font-size: 16px;">🌫️ 暖流、海雾与气候</h4>
                    <p style="line-height: 1.8; color: #831843;">
                        <strong style="color: #be185d;">答案解析：</strong><br>
                        暖流带来<strong style="color: #dc2626;">暖湿空气</strong>，遇冷海面或冷空气时凝结成雾，影响能见度和气候。<br><br>
                        <strong>🔬 形成机制：</strong><br>
                        1. <strong>蒸发增湿</strong>：暖流使海水大量蒸发，空气中水汽充沛<br>
                        2. <strong>冷却凝结</strong>：暖湿空气流经冷海面或遇到冷空气时降温凝结<br>
                        3. <strong>逆温层结</strong>：暖空气在上、冷空气在下，雾层稳定不易消散<br><br>
                        <strong>📍 典型海雾区：</strong><br>
                        • <strong>伦敦"雾都"</strong>：北大西洋暖流 + 寒冷陆地，全年多雾<br>
                        • <strong>旧金山金门大桥</strong>：加利福尼亚寒流与暖空气交汇，夏季浓雾<br>
                        • <strong>北海道东部</strong>：千岛寒流与暖湿气流交汇，渔业资源丰富但多雾<br><br>
                        <strong>⚠️ 影响与利用：</strong>海雾降低能见度影响航运，但也为沿岸干旱区带来珍贵 moisture！
                    </p>
                </div>`,
                `<div style="background: linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #7c3aed; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <h4 style="color: #6d28d9; margin-bottom: 12px; font-size: 16px;">🌍 洋流对全球气候的影响</h4>
                    <p style="line-height: 1.8; color: #4c1d95;">
                        <strong style="color: #6d28d9;">答案解析：</strong><br>
                        洋流是地球的"空调系统"，调节全球热量分布，影响气候、生态和人类活动。<br><br>
                        <strong>🔬 热量输送：</strong><br>
                        1. <strong>低纬→高纬</strong>：暖流将热带热量输送到高纬度地区（如北大西洋暖流使西欧温暖）<br>
                        2. <strong>高纬→低纬</strong>：寒流将冷水输送到低纬度，调节热带温度<br>
                        3. <strong>全球平衡</strong>：如果没有洋流，赤道会更热、极地会更冷<br><br>
                        <strong>📍 典型案例对比：</strong><br>
                        • <strong>西欧 vs 同纬度加拿大</strong>：暖流使伦敦冬季平均气温比温哥华高15°C<br>
                        • <strong>厄尔尼诺现象</strong>：洋流异常导致全球气候灾害（干旱、洪水、台风）<br>
                        • <strong>冰川融化</strong>：全球变暖导致极地洋流改变，影响整个气候系统<br><br>
                        <strong>💡 综合应用：</strong>理解洋流可预测天气、规划航线、开发渔业、应对气候变化！
                    </p>
                </div>`
            ],
            5: [
                // 第5章知识点（详细科普版）
                // 任务1：厄尔尼诺现象
                `<div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #f59e0b;">
                    <h4 style="color: #92400e; margin-bottom: 15px;">🌡️ 厄尔尼诺现象详解</h4>
                    <p style="color: #78350f; line-height: 1.8; margin-bottom: 12px;"><strong>什么是厄尔尼诺？</strong><br>
                    厄尔尼诺（El Niño）是西班牙语"圣婴"的意思，指每隔2-7年发生在<strong>东太平洋赤道海域</strong>的海水异常升温现象。正常情况下，西太平洋暖、东太平洋冷；但厄尔尼诺年份，暖水会<strong>向东扩展到南美海岸</strong>。</p>
                    <p style="color: #78350f; line-height: 1.8; margin-bottom: 12px;"><strong>形成机制：</strong><br>
                    • <strong>信风减弱</strong>：太平洋东西向的信风（贸易风）变弱<br>
                    • <strong>暖水回流</strong>：原本被吹向西边的暖水向东回流<br>
                    • <strong>秘鲁寒流减弱</strong>：南美沿岸的上升流减弱，冷水减少</p>
                    <p style="color: #78350f; line-height: 1.8; margin-bottom: 12px;"><strong>全球影响：</strong><br>
                    • 南美西海岸暴雨洪涝，秘鲁渔业大幅减产<br>
                    • 东南亚和澳大利亚干旱、森林火灾<br>
                    • 中国南方可能出现暖冬和洪涝<br>
                    • 北美冬季风暴增多，气候异常</p>
                    <p style="color: #92400e; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 8px; margin-top: 15px;"><strong>💡 科学意义：</strong>厄尔尼诺展示了地球系统的整体性——一个海域的温度变化，能影响全球天气模式！</p>
                </div>`,
                // 任务2：温盐环流
                `<div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #0ea5e9;">
                    <h4 style="color: #0369a1; margin-bottom: 15px;">🌊 温盐环流（海洋传送带）</h4>
                    <p style="color: #0c4a6e; line-height: 1.8; margin-bottom: 12px;"><strong>什么是温盐环流？</strong><br>
                    温盐环流（Thermohaline Circulation）是由<strong>温度（Thermo）</strong>和<strong>盐度（Haline）</strong>差异驱动的全球性深层海洋环流，被称为"<strong>海洋传送带</strong>"。它完成一次循环需要约<strong>1000年</strong>！</p>
                    <p style="color: #0c4a6e; line-height: 1.8; margin-bottom: 12px;"><strong>驱动机制——密度差异：</strong><br>
                    • <strong>高纬度冷却</strong>：格陵兰和挪威海域的寒冷空气使海水降温<br>
                    • <strong>结冰析盐</strong>：海冰形成时会排出盐分，周围海水盐度增加<br>
                    • <strong>密度增大下沉</strong>：冷+咸=密度大，海水下沉至2000-4000米深<br>
                    • <strong>深层流动</strong>：下沉的海水向南流动，形成深层冷流<br>
                    • <strong>上升回流</strong>：在南极或热带海域，深层水重新上升，完成循环</p>
                    <p style="color: #0c4a6e; line-height: 1.8; margin-bottom: 12px;"><strong>全球气候作用：</strong><br>
                    • <strong>热量输送</strong>：墨西哥湾暖流每年向北输送的热量，相当于人类能耗的100倍！<br>
                    • <strong>氧气循环</strong>：将表层氧气带入深海，维持深海生命<br>
                    • <strong>养分循环</strong>：深层富营养盐水上升，滋养浮游生物，支撑海洋食物链<br>
                    • <strong>气候稳定</strong>：调节地球热量分布，如果没有它，欧洲将像同纬度的加拿大一样寒冷</p>
                    <p style="color: #0369a1; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 8px; margin-top: 15px;"><strong>💡 你知道吗？</strong>温盐环流的流速很慢（约每天10公里），但它是地球气候系统的"心脏"，一旦停止，全球气候将剧烈变化！</p>
                </div>`,
                // 任务3：气候变化影响
                `<div style="background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #ef4444;">
                    <h4 style="color: #991b1b; margin-bottom: 15px;">🌍 气候变化与洋流</h4>
                    <p style="color: #7f1d1d; line-height: 1.8; margin-bottom: 12px;"><strong>全球变暖如何影响洋流？</strong><br>
                    科学家警告：全球变暖可能<strong>减缓甚至停止</strong>温盐环流！这在电影《后天》中被戏剧化呈现，虽然电影夸张，但科学原理是真实的。</p>
                    <p style="color: #7f1d1d; line-height: 1.8; margin-bottom: 12px;"><strong>关键机制——北极淡水输入：</strong><br>
                    • <strong>冰川融化</strong>：格陵兰冰川每年流失约2800亿吨冰<br>
                    • <strong>淡水稀释</strong>：淡水进入海洋，降低表层海水盐度<br>
                    • <strong>密度下降</strong>：盐度降低→海水密度变小→下沉减弱<br>
                    • <strong>环流减缓</strong>："海洋引擎"动力不足，环流变慢</p>
                    <p style="color: #7f1d1d; line-height: 1.8; margin-bottom: 12px;"><strong>可能的后果：</strong><br>
                    • <strong>欧洲变冷</strong>：失去墨西哥湾暖流的热量，西欧冬季可能降温5-10°C<br>
                    • <strong>海平面上升</strong>：环流减缓导致海水在北美东岸堆积<br>
                    • <strong>风暴增多</strong>：温度梯度变化可能引发更强烈的极端天气<br>
                    • <strong>海洋缺氧</strong>：环流减慢减少氧气输送，形成"死亡海域"</p>
                    <p style="color: #991b1b; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 8px; margin-top: 15px;"><strong>⚠️ 最新研究：</strong>2021年《自然·气候变化》研究显示，大西洋环流已比20世纪减弱了约15%。这不是科幻，是正在发生的现实！</p>
                </div>`,
                // 任务4：科学探究方法
                `<div style="background: linear-gradient(135deg, #f0fdf4 0%, #bbf7d0 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #22c55e;">
                    <h4 style="color: #166534; margin-bottom: 15px;">🔬 科学探究方法论</h4>
                    <p style="color: #14532d; line-height: 1.8; margin-bottom: 12px;"><strong>如何进行海洋科学研究？</strong></p>
                    <p style="color: #14532d; line-height: 1.8; margin-bottom: 10px;"><strong>1️⃣ 提出科学问题</strong><br>
                    好的科学问题要具体、可验证。例如："北大西洋海水密度如何随季节变化？"而不是"洋流是什么？"</p>
                    <p style="color: #14532d; line-height: 1.8; margin-bottom: 10px;"><strong>2️⃣ 设计实验方案</strong><br>
                    • <strong>实地观测</strong>：Argo浮标（全球约4000个）每10天下潜至2000米，测量温盐数据<br>
                    • <strong>卫星遥感</strong>：测量海面高度（暖水膨胀使海面升高）、海表温度<br>
                    • <strong>实验室模拟</strong>：用大型水箱模拟不同温盐条件下的环流<br>
                    • <strong>计算机模型</strong>：超级计算机模拟全球洋流，预测未来变化</p>
                    <p style="color: #14532d; line-height: 1.8; margin-bottom: 10px;"><strong>3️⃣ 收集与分析数据</strong><br>
                    科学数据需要：准确性（校准仪器）、连续性（长期观测）、覆盖性（全球网络）。单点数据无法得出可靠结论。</p>
                    <p style="color: #14532d; line-height: 1.8; margin-bottom: 12px;"><strong>4️⃣ 得出结论并验证</strong><br>
                    科学结论需要<strong>同行评议</strong>和<strong>可重复性</strong>。如果其他科学家用相同方法得出不同结果，原结论就需要修正。</p>
                    <p style="color: #166534; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 8px; margin-top: 15px;"><strong>💡 海洋科学的挑战：</strong>海洋太大、太深、太贵！一次深海探测成本可达数百万美元，Argo计划耗资超过20亿美元。这就是为什么海洋仍有许多未解之谜。</p>
                </div>`,
                // 任务5：课程总结
                `<div style="background: linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%); padding: 20px; border-radius: 12px; border-left: 5px solid #8b5cf6;">
                    <h4 style="color: #5b21b6; margin-bottom: 15px;">🎓 课程知识总结</h4>
                    <p style="color: #4c1d95; line-height: 1.8; margin-bottom: 12px;"><strong>恭喜完成全部学习！你已掌握：</strong></p>
                    <p style="color: #4c1d95; line-height: 1.8; margin-bottom: 10px;"><strong>📌 核心概念</strong><br>
                    • <strong>洋流定义</strong>：海洋水体沿一定方向的大规模流动<br>
                    • <strong>暖流与寒流</strong>：从低纬流向高纬为暖流，反之为寒流<br>
                    • <strong>洋流成因</strong>：风应力、密度差异、地转偏向力、海陆分布</p>
                    <p style="color: #4c1d95; line-height: 1.8; margin-bottom: 10px;"><strong>📌 分布规律</strong><br>
                    • 中低纬度：顺时针（北半球）/逆时针（南半球）环流<br>
                    • 北半球高纬：逆时针极地环流<br>
                    • 南半球：环绕南极的西风漂流</p>
                    <p style="color: #4c1d95; line-height: 1.8; margin-bottom: 10px;"><strong>📌 地理影响</strong><br>
                    • 暖流：增温增湿（如西欧、日本暖流影响区）<br>
                    • 寒流：降温减湿（如秘鲁、本格拉寒流影响区）<br>
                    • 寒暖流交汇处：形成世界大渔场（北海道、北海、纽芬兰）</p>
                    <p style="color: #4c1d95; line-height: 1.8; margin-bottom: 12px;"><strong>📌 环境意义</strong><br>
                    • 调节全球热量分布，维持气候平衡<br>
                    • 厄尔尼诺等异常现象影响全球天气<br>
                    • 全球变暖可能威胁洋流系统稳定</p>
                    <p style="color: #5b21b6; background: rgba(255,255,255,0.7); padding: 10px; border-radius: 8px; margin-top: 15px;"><strong>🌟 学习建议：</strong>想要深入了解？推荐阅读《海洋学导论》、关注NOAA（美国国家海洋和大气管理局）的最新研究、观看纪录片《蓝色星球》。海洋覆盖地球71%的面积，但我们只探索了5%——还有无数奥秘等你发现！</p>
                </div>`
            ]
        };
    }
    
    // ========== 任务2：精致流向观察图 ==========
    drawTask2FlowDirection() {
        // 精美海洋渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, '#0c4a6e');
        gradient.addColorStop(0.3, '#075985');
        gradient.addColorStop(0.6, '#0369a1');
        gradient.addColorStop(1, '#38bdf8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 精致纬度网格
        this.drawElegantGrid();
        
        // 精致暖流区域（左侧）- 发光效果+粒子
        this.drawElegantCurrentZone(180, 200, 'warm');
        
        // 精致寒流区域（右侧）- 发光效果+粒子
        this.drawElegantCurrentZone(720, 300, 'cold');
        
        // 精致信息卡片 - 暖流
        this.drawInfoCard(80, 360, '🔴 暖流 A', '观察流向规律', '#ef4444');
        
        // 精致信息卡片 - 寒流
        this.drawInfoCard(660, 360, '🔵 寒流 B', '观察流向规律', '#3b82f6');
        
        // 纬度标识（精致样式）
        this.drawElegantLatLabels();
        
        // 标题栏
        this.drawSceneTitle('🧭 流向观察任务', '观察不同洋流的流向方向，发现纬度与流向的关系');
        
        // 底部提示卡片
        this.drawHintCard('💡 仔细观察红色和蓝色粒子的移动方向，它们分别代表什么规律？');
    }
    
    // 精致纬度网格
    drawElegantGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        this.ctx.lineWidth = 1;
        
        // 横向纬度线
        [30, 140, 250, 360, 470].forEach((y, index) => {
            this.ctx.beginPath();
            this.ctx.moveTo(60, y);
            this.ctx.lineTo(880, y);
            this.ctx.stroke();
            
            // 纬度标签背景
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.roundRect(10, y - 12, 50, 24, 6);
            this.ctx.fill();
        });
    }
    
    // 精致纬度标签
    drawElegantLatLabels() {
        const labels = ['60°N', '40°N', '20°N', '0°赤道', '20°S'];
        const positions = [30, 140, 250, 360, 470];
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        
        labels.forEach((label, i) => {
            this.ctx.fillText(label, 18, positions[i] + 4);
        });
    }
    
    // 精致洋流区域绘制
    drawElegantCurrentZone(x, y, type) {
        const isWarm = type === 'warm';
        const color = isWarm ? '#ef4444' : '#3b82f6';
        const glowColor = isWarm ? 'rgba(239, 68, 68,' : 'rgba(59, 130, 246,';
        
        // 发光背景
        this.ctx.save();
        const glow = this.ctx.createRadialGradient(x, y, 20, x, y, 150);
        glow.addColorStop(0, glowColor + ' 0.5)');
        glow.addColorStop(0.5, glowColor + ' 0.2)');
        glow.addColorStop(1, glowColor + ' 0)');
        this.ctx.fillStyle = glow;
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 140, 100, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 流动粒子
        const particleCount = 8;
        const direction = isWarm ? -1 : 1; // 暖流向上(低纬到高纬)，寒流向下
        
        for (let i = 0; i < particleCount; i++) {
            const offset = (this.animationFrame * 1.5 + i * 60) % 400;
            const particleY = y + direction * (offset - 200);
            const particleX = x + Math.sin(offset * 0.02) * 25;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 10, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 粒子发光
            this.ctx.fillStyle = color + '66';
            this.ctx.beginPath();
            this.ctx.arc(particleX, particleY, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // 流向箭头（虚线）
        this.ctx.strokeStyle = color + 'aa';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([15, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(x + 50, y + (isWarm ? 120 : -120));
        this.ctx.quadraticCurveTo(x, y, x + 50, y + (isWarm ? -120 : 120));
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }
    
    // 提示卡片
    drawHintCard(text) {
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.roundRect(150, 440, 600, 50, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '15px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, 450, 472);
    }
    
    // ========== 任务3：精致数据对比图 ==========
    drawTask3Comparison() {
        // 精美海洋渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 900, 0);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
        gradient.addColorStop(0.5, '#075985');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0.15)');
        this.ctx.fillStyle = '#075985';
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 背景渐变叠加
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制精致波浪纹理
        this.drawWaveTexture();
        
        // 中央分隔装饰线
        this.drawElegantDivider();
        
        // 左侧洋流X卡片（暖流数据）
        this.drawElegantDataCard(60, 60, '洋流 X', [
            { icon: '🌡️', label: '洋流水温', value: '26°C', highlight: true },
            { icon: '🌊', label: '周围海水', value: '18°C' },
            { icon: '📍', label: '起点纬度', value: '10°N (低纬)' },
            { icon: '🎯', label: '终点纬度', value: '50°N (高纬)' }
        ], '#ef4444', '🔥');
        
        // 右侧洋流Y卡片（寒流数据）
        this.drawElegantDataCard(490, 60, '洋流 Y', [
            { icon: '🌡️', label: '洋流水温', value: '8°C', highlight: true },
            { icon: '🌊', label: '周围海水', value: '16°C' },
            { icon: '📍', label: '起点纬度', value: '60°N (高纬)' },
            { icon: '🎯', label: '终点纬度', value: '20°N (低纬)' }
        ], '#3b82f6', '❄️');
        
        // 精致温度计
        this.drawElegantThermometer(180, 340, 26, '#ef4444');
        this.drawElegantThermometer(610, 340, 8, '#3b82f6');
        
        // 标题栏
        this.drawSceneTitle('📊 数据分析任务', '对比两个洋流的数据，尝试定义暖流和寒流的概念');
        
        // 底部提示
        this.drawHintCard('💡 根据测量数据，分析洋流X和洋流Y分别是什么类型的洋流？');
    }
    
    // 波浪纹理
    drawWaveTexture() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
        this.ctx.lineWidth = 2;
        for (let y = 80; y < 500; y += 50) {
            this.ctx.beginPath();
            for (let x = 0; x < 900; x += 15) {
                const waveY = y + Math.sin((x + this.animationFrame) * 0.03) * 8;
                if (x === 0) this.ctx.moveTo(x, waveY);
                else this.ctx.lineTo(x, waveY);
            }
            this.ctx.stroke();
        }
    }
    
    // 精致分隔线
    drawElegantDivider() {
        // 中央垂直渐变线
        const lineGrad = this.ctx.createLinearGradient(450, 0, 450, 500);
        lineGrad.addColorStop(0, 'rgba(255,255,255,0)');
        lineGrad.addColorStop(0.5, 'rgba(255,255,255,0.4)');
        lineGrad.addColorStop(1, 'rgba(255,255,255,0)');
        
        this.ctx.strokeStyle = lineGrad;
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([20, 15]);
        this.ctx.beginPath();
        this.ctx.moveTo(450, 40);
        this.ctx.lineTo(450, 420);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 中央VS标识
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.arc(450, 230, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('VS', 450, 237);
    }
    
    // 精致数据卡片
    drawElegantDataCard(x, y, title, dataItems, themeColor, icon) {
        const width = 380;
        const height = 360;
        
        // 卡片阴影背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 8;
        
        // 卡片主体渐变
        const cardGrad = this.ctx.createLinearGradient(x, y, x, y + height);
        cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
        this.ctx.fillStyle = cardGrad;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 20);
        this.ctx.fill();
        this.ctx.restore();
        
        // 顶部彩色条
        this.ctx.fillStyle = themeColor;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, 60, [20, 20, 0, 0]);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 26px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${icon} ${title}`, x + width / 2, y + 40);
        
        // 数据项
        dataItems.forEach((item, index) => {
            const itemY = y + 100 + index * 65;
            
            // 数据行背景（交替）
            if (index % 2 === 1) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
                this.ctx.fillRect(x + 15, itemY - 20, width - 30, 55);
            }
            
            // 图标
            this.ctx.fillStyle = item.highlight ? themeColor : '#64748b';
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.icon, x + 30, itemY);
            
            // 标签
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '15px Arial';
            this.ctx.fillText(item.label, x + 60, itemY);
            
            // 数值（高亮）
            this.ctx.fillStyle = item.highlight ? themeColor : '#1e293b';
            this.ctx.font = item.highlight ? 'bold 20px Arial' : '18px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(item.value, x + width - 30, itemY);
        });
    }
    
    // 精致温度计
    drawElegantThermometer(x, y, temp, color) {
        const width = 30;
        const height = 80;
        
        // 温度计背景
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(x - width/2, y, width, height, 15);
        this.ctx.fill();
        
        // 温度填充
        const fillHeight = (temp / 30) * (height - 10);
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x - width/2 + 3, y + height - fillHeight - 5, width - 6, fillHeight, 10);
        this.ctx.fill();
        
        // 温度值
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(temp + '°C', x, y + height + 20);
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
    
    // ========== 任务4：精致气候影响示意图 ==========
    drawTask4Climate() {
        // 精美渐变天空背景
        const skyGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
        skyGrad.addColorStop(0, '#60a5fa');
        skyGrad.addColorStop(0.5, '#93c5fd');
        skyGrad.addColorStop(1, '#dbeafe');
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制云朵装饰
        this.drawElegantCloud(150, 80, 0.8);
        this.drawElegantCloud(750, 60, 0.6);
        this.drawElegantCloud(450, 100, 0.4);
        
        // 左侧城市A（暖流影响）- 温暖多雨
        this.drawElegantCityCard(40, 60, '城市 A', [
            { icon: '📍', text: '位置：某大陆西海岸' },
            { icon: '🌊', text: '附近洋流：24°C（暖流）' },
            { icon: '🌡️', text: '年均气温：18°C（温暖）' },
            { icon: '💧', text: '年降水量：1200mm（多雨）' }
        ], '#ef4444', '☀️ 温暖湿润', [
            { icon: '🌺', desc: '植被茂盛' },
            { icon: '🌧️', desc: '降雨充沛' },
            { icon: '🌈', desc: '气候宜人' }
        ]);
        
        // 右侧城市B（寒流影响）- 寒冷干燥
        this.drawElegantCityCard(480, 60, '城市 B', [
            { icon: '📍', text: '位置：大陆西海岸（同纬度）' },
            { icon: '🌊', text: '附近洋流：12°C（寒流）' },
            { icon: '🌡️', text: '年均气温：14°C（凉爽）' },
            { icon: '💧', text: '年降水量：300mm（干燥）' }
        ], '#3b82f6', '❄️ 凉爽干燥', [
            { icon: '🌵', desc: '植被稀疏' },
            { icon: '☁️', desc: '多雾少雨' },
            { icon: '🏜️', desc: '干旱气候' }
        ]);
        
        // 中央连接线（表示同纬度）
        this.drawElegantConnectionLine();
        
        // 思考问题区
        this.drawElegantQuestionArea([
            '1. 两个城市纬度相同，为什么气候差异如此显著？',
            '2. 洋流的温度如何影响沿岸地区的气候特征？',
            '3. 暖流和寒流对降水的影响机制是什么？'
        ]);
        
        // 标题栏
        this.drawSceneTitle('🌍 气候影响分析', '对比同纬度两个城市的气候差异，理解洋流对气候的影响');
    }
    
    // 精致云朵
    drawElegantCloud(x, y, opacity) {
        this.ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.arc(x + 35, y - 8, 38, 0, Math.PI * 2);
        this.ctx.arc(x + 70, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 精致城市卡片
    drawElegantCityCard(x, y, title, dataItems, themeColor, climateLabel, features) {
        const width = 400;
        const dataHeight = 160;
        const featureHeight = 90;
        
        // 阴影
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 10;
        
        // 主卡片背景
        const cardGrad = this.ctx.createLinearGradient(x, y, x, y + dataHeight + featureHeight + 40);
        cardGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
        cardGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
        this.ctx.fillStyle = cardGrad;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, dataHeight + featureHeight + 40, 20);
        this.ctx.fill();
        this.ctx.restore();
        
        // 顶部彩色条
        this.ctx.fillStyle = themeColor;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, 50, [20, 20, 0, 0]);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 22px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 20, y + 35);
        
        // 气候标签
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'right';
        this.ctx.fillText(climateLabel, x + width - 20, y + 35);
        
        // 数据项
        dataItems.forEach((item, index) => {
            const itemY = y + 75 + index * 38;
            
            // 图标
            this.ctx.fillStyle = themeColor;
            this.ctx.font = '16px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(item.icon, x + 20, itemY);
            
            // 文本
            this.ctx.fillStyle = '#1e293b';
            this.ctx.font = '15px Arial';
            this.ctx.fillText(item.text, x + 48, itemY);
        });
        
        // 特征标签区域
        const featureY = y + dataHeight + 30;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 15, featureY, width - 30, featureHeight, 12);
        this.ctx.fill();
        
        // 特征标签
        features.forEach((feature, index) => {
            const fx = x + 35 + index * 125;
            const fy = featureY + 30;
            
            // 特征图标
            this.ctx.fillStyle = themeColor;
            this.ctx.font = '20px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(feature.icon, fx, fy);
            
            // 特征描述
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '13px Arial';
            this.ctx.fillText(feature.desc, fx, fy + 25);
        });
    }
    
    // 精致连接线（同纬度标识）
    drawElegantConnectionLine() {
        const y = 140;
        
        // 虚线连接
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([15, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(440, y);
        this.ctx.lineTo(480, y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // "同纬度"标签
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect(400, y - 18, 120, 36, 18);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#475569';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📏 同纬度', 460, y + 5);
    }
    
    // 精致问题区域
    drawElegantQuestionArea(questions) {
        const x = 80;
        const y = 340;
        const width = 740;
        const height = 140;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 16);
        this.ctx.fill();
        this.ctx.restore();
        
        // 标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🤔 思考问题', x + 25, y + 35);
        
        // 问题列表
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '15px Arial';
        questions.forEach((q, i) => {
            this.ctx.fillText(q, x + 25, y + 65 + i * 30);
        });
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
    
    // ========== 任务5：精致世界地图案例 ==========
    drawTask5WorldMap() {
        // 精美海洋渐变背景
        const oceanGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
        oceanGrad.addColorStop(0, '#0c4a6e');
        oceanGrad.addColorStop(0.3, '#075985');
        oceanGrad.addColorStop(0.7, '#0369a1');
        oceanGrad.addColorStop(1, '#0284c7');
        this.ctx.fillStyle = oceanGrad;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 精致大陆绘制
        this.drawElegantEurope(500, 50);
        this.drawElegantNorthAmerica(50, 30);
        this.drawElegantBritishIsles(420, 150);
        this.drawElegantNewfoundland(280, 130);
        
        // 精致洋流P（带发光效果）
        this.drawElegantCurrentPath([
            { x: 200, y: 400 },
            { x: 280, y: 350 },
            { x: 350, y: 280 },
            { x: 400, y: 200 }
        ], '#ef4444', '洋流 P');
        
        // 精致洋流Q（带发光效果）
        this.drawElegantCurrentPath([
            { x: 250, y: 50 },
            { x: 260, y: 100 },
            { x: 270, y: 150 },
            { x: 290, y: 180 }
        ], '#3b82f6', '洋流 Q');
        
        // 精致纬度网格
        this.drawElegantLatitudeLines();
        
        // 城市信息卡片
        this.drawElegantLocationCard(360, 200, '🇬🇧 伦敦', [
            { label: '纬度', value: '51°N' },
            { label: '冬季均温', value: '5°C', highlight: true }
        ], '#ef4444');
        
        this.drawElegantLocationCard(180, 170, '🇨🇦 纽芬兰', [
            { label: '纬度', value: '49°N' },
            { label: '冬季均温', value: '-5°C', highlight: true }
        ], '#3b82f6');
        
        // 同纬度连接线
        this.drawElegantLatConnection(260, 210, 440, 240);
        
        // 精致图例
        this.drawElegantMapLegend();
        
        // 标题栏
        this.drawSceneTitle('🗺️ 世界地图案例', '分析同纬度的伦敦和纽芬兰的气候差异，探索洋流的影响');
    }
    
    // 精致欧洲大陆
    drawElegantEurope(baseX, baseY) {
        this.ctx.save();
        // 大陆阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        
        // 主体渐变
        const landGrad = this.ctx.createLinearGradient(baseX, baseY, baseX + 150, baseY + 200);
        landGrad.addColorStop(0, '#22c55e');
        landGrad.addColorStop(0.5, '#16a34a');
        landGrad.addColorStop(1, '#15803d');
        this.ctx.fillStyle = landGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(baseX, baseY);
        this.ctx.quadraticCurveTo(baseX + 80, baseY + 20, baseX + 150, baseY + 80);
        this.ctx.quadraticCurveTo(baseX + 160, baseY + 150, baseX + 120, baseY + 220);
        this.ctx.quadraticCurveTo(baseX + 50, baseY + 260, baseX - 20, baseY + 230);
        this.ctx.quadraticCurveTo(baseX - 50, baseY + 150, baseX - 30, baseY + 50);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // 高光
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(baseX + 20, baseY + 30);
        this.ctx.quadraticCurveTo(baseX + 80, baseY + 50, baseX + 120, baseY + 100);
        this.ctx.stroke();
    }
    
    // 精致北美大陆
    drawElegantNorthAmerica(baseX, baseY) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        
        const landGrad = this.ctx.createLinearGradient(baseX, baseY, baseX + 200, baseY + 300);
        landGrad.addColorStop(0, '#22c55e');
        landGrad.addColorStop(0.5, '#16a34a');
        landGrad.addColorStop(1, '#15803d');
        this.ctx.fillStyle = landGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(baseX, baseY + 20);
        this.ctx.quadraticCurveTo(baseX + 100, baseY, baseX + 200, baseY + 50);
        this.ctx.quadraticCurveTo(baseX + 260, baseY + 150, baseX + 230, baseY + 280);
        this.ctx.quadraticCurveTo(baseX + 150, baseY + 380, baseX + 50, baseY + 320);
        this.ctx.quadraticCurveTo(baseX - 20, baseY + 200, baseX, baseY + 20);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // 精致英伦三岛
    drawElegantBritishIsles(x, y) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 10;
        this.ctx.fillStyle = '#16a34a';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 35, 55, -0.2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // 精致纽芬兰
    drawElegantNewfoundland(x, y) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 8;
        this.ctx.fillStyle = '#15803d';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, 30, 40, 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // 精致洋流路径
    drawElegantCurrentPath(points, color, label) {
        // 发光效果
        this.ctx.save();
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = color + 'aa';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cpX = (points[i-1].x + points[i].x) / 2;
            const cpY = (points[i-1].y + points[i].y) / 2 - 20;
            this.ctx.quadraticCurveTo(cpX, cpY, points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
        
        // 主线条
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            const cpX = (points[i-1].x + points[i].x) / 2;
            const cpY = (points[i-1].y + points[i].y) / 2 - 20;
            this.ctx.quadraticCurveTo(cpX, cpY, points[i].x, points[i].y);
        }
        this.ctx.stroke();
        
        // 终点箭头
        const last = points[points.length - 1];
        const prev = points[points.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        this.drawArrowHead(last.x, last.y, angle, color);
        
        // 标签
        const midIndex = Math.floor(points.length / 2);
        const labelX = (points[midIndex].x + points[midIndex - 1].x) / 2;
        const labelY = (points[midIndex].y + points[midIndex - 1].y) / 2 - 30;
        this.drawFloatingLabel(labelX, labelY, label, color);
    }
    
    // 箭头绘制
    drawArrowHead(x, y, angle, color) {
        const headLen = 12;
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(
            x - headLen * Math.cos(angle - Math.PI / 6),
            y - headLen * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
            x - headLen * Math.cos(angle + Math.PI / 6),
            y - headLen * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    // 浮动标签
    drawFloatingLabel(x, y, text, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 40, y - 12, 80, 24, 12);
        this.ctx.fill();
        
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y + 4);
    }
    
    // 精致纬度线
    drawElegantLatitudeLines() {
        const yPositions = [80, 150, 220, 290, 360];
        const labels = ['60°N', '50°N', '40°N', '30°N', '20°N'];
        
        yPositions.forEach((y, i) => {
            // 纬度线
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([8, 8]);
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(900, y);
            this.ctx.stroke();
            this.ctx.setLineDash([]);
            
            // 标签背景
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            this.ctx.beginPath();
            this.ctx.roundRect(850, y - 10, 50, 20, 10);
            this.ctx.fill();
            
            // 标签文字
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(labels[i], 875, y + 4);
        });
    }
    
    // 精致位置卡片
    drawElegantLocationCard(x, y, title, data, accentColor) {
        const width = 140;
        const height = 85;
        
        // 阴影背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 14);
        this.ctx.fill();
        this.ctx.restore();
        
        // 左侧装饰条
        this.ctx.fillStyle = accentColor;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 5, height, [14, 0, 0, 14]);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 15, y + 25);
        
        // 数据
        data.forEach((item, i) => {
            const itemY = y + 48 + i * 22;
            this.ctx.fillStyle = '#64748b';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(item.label + ':', x + 15, itemY);
            
            this.ctx.fillStyle = item.highlight ? accentColor : '#1e293b';
            this.ctx.font = item.highlight ? 'bold 12px Arial' : '12px Arial';
            this.ctx.textAlign = 'right';
            this.ctx.fillText(item.value, x + width - 12, itemY);
            this.ctx.textAlign = 'left';
        });
    }
    
    // 同纬度连接线
    drawElegantLatConnection(x1, y1, x2, y2) {
        const midY = (y1 + y2) / 2;
        
        // 虚线
        this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 6]);
        this.ctx.beginPath();
        this.ctx.moveTo(x1 + 50, y1);
        this.ctx.lineTo((x1 + x2) / 2, midY);
        this.ctx.lineTo(x2 - 50, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // "同纬度"标签
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect((x1 + x2) / 2 - 35, midY - 15, 70, 30, 15);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#92400e';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📏 同纬度', (x1 + x2) / 2, midY + 4);
    }
    
    // 精致图例
    drawElegantMapLegend() {
        const x = 720;
        const y = 380;
        const width = 160;
        const height = 110;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 14);
        this.ctx.fill();
        this.ctx.restore();
        
        // 标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🗺️ 图例', x + 15, y + 25);
        
        // 洋流P
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillRect(x + 15, y + 40, 20, 4);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('洋流 P', x + 42, y + 47);
        
        // 洋流Q
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillRect(x + 15, y + 62, 20, 4);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('洋流 Q', x + 42, y + 69);
        
        // 陆地
        this.ctx.fillStyle = '#22c55e';
        this.ctx.fillRect(x + 15, y + 84, 20, 12);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('陆地', x + 42, y + 94);
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
                    instruction: '点击"抽走海水"按钮，观察画面中粒子的运动方向。注意黄色粒子和青色粒子分别向哪个方向运动？',
                    type: 'compensation',
                    hint: '💡 观察要点：①海水被抽走后产生了什么？②周围海水如何移动？③深层海水有什么变化？'
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
            
            // 第4章：案例分析 - 洋流的影响（探究式 redesign）
            4: [
                {
                    title: '探究1：渔场选址',
                    question: '你是一名渔业顾问，需要选择最佳的渔场位置。哪个海域的鱼类资源最丰富？为什么？',
                    instruction: '点击右侧"开始探测"按钮，分别选择三个区域进行鱼类资源探测。观察鱼群数量、分布密度与洋流类型的关系。',
                    type: 'fishery',
                    hint: '💡 观察要点：①不同区域鱼群数量差异 ②鱼群分布与洋流的关系 ③哪种洋流条件鱼最多？'
                },
                {
                    title: '探究2：航线规划模拟',
                    question: '选择航线A（北线）或航线B（南线），哪条更节省时间和燃料？',
                    instruction: '点击航线按钮进行模拟航行，观察航行时间、燃料消耗和顺/逆流关系。通过数据比较两条航线的效率。',
                    type: 'shipping',
                    hint: '💡 观察要点：①哪条航线用时更短？②哪条航线燃料消耗更少？③航线与洋流方向的关系？'
                },
                {
                    title: '探究3：寒流降温实验',
                    question: '为什么撒哈拉西海岸比同纬度内陆凉爽？寒流如何影响沿岸气候？',
                    instruction: '调节"寒流强度"滑块，观察沿海与内陆的温度变化对比。通过数据推断洋流对气候的影响机制。',
                    type: 'climate_case',
                    hint: '💡 观察要点：①寒流强度变化时沿海温度如何变化？②沿海与内陆温差如何变化？③风的方向有什么影响？'
                },
                {
                    title: '探究4：海雾形成实验',
                    question: '伦敦的雾与北大西洋暖流有什么关系？什么条件下会形成海雾？',
                    instruction: '调节"暖流水温"和"冷空气温度"滑块，观察雾气浓度的变化。找出海雾形成的条件组合。',
                    type: 'fog',
                    hint: '💡 观察要点：①暖流水温升高时雾气如何变化？②冷空气温度降低时雾气如何变化？③温差与雾浓度的关系？'
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
                    title: '探究2：温盐环流实验室',
                    question: '调节温度和盐度，观察海水密度如何变化？密度差异会怎样驱动水流运动？',
                    instruction: '观察实验：调节温度和盐度滑块，观察密度数值、水槽中粒子运动方向和箭头颜色的变化。你能发现温度和密度、密度和水流之间的关系吗？',
                    type: 'thermohaline',
                    hint: '💡 观察要点：①温度变化如何影响密度数值？②密度不同时粒子向哪个方向运动？③箭头颜色代表什么含义？'
                },
                {
                    title: '探究3：冰川融化危机',
                    question: '调节全球变暖程度，观察冰川融化如何影响大西洋温盐环流？会带来什么气候后果？',
                    instruction: '观察实验：调节"全球变暖程度"滑块，注意观察冰川大小、融化水流、洋流箭头速度、欧洲颜色/温度的变化。你能发现这些现象之间的联系吗？',
                    type: 'climate_change',
                    hint: '💡 观察要点：①冰川融化量如何随温度变化？②海水盐度如何变化？③洋流速度如何变化？④欧洲颜色/温度如何变化？'
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
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 500);
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
                    <div style="background: #e0f2fe; padding: 12px; border-radius: 8px; font-size: 11px; color: #0369a1; line-height: 1.5;">
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
                
            case 'thermohaline':
                panel.innerHTML = `
                    <h4>🧪 温盐环流实验室</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 密度计显示 -->
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 2px solid #0ea5e9;">
                        <div style="font-size: 12px; color: #7dd3fc; margin-bottom: 8px;">📊 当前海水密度</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                                <div id="density-bar" style="height: 100%; width: 50%; background: linear-gradient(90deg, #3b82f6, #06b6d4); transition: all 0.3s; border-radius: 10px;"></div>
                            </div>
                            <div id="density-value" style="font-size: 18px; font-weight: bold; color: white; min-width: 70px;">1025</div>
                            <div style="font-size: 11px; color: #7dd3fc;">kg/m³</div>
                        </div>
                    </div>
                    
                    <!-- 温度滑块 -->
                    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12px; color: #991b1b; font-weight: bold;">🌡️ 温度</label>
                            <span id="temp-display" style="font-size: 12px; color: #991b1b; font-weight: bold;">15°C</span>
                        </div>
                        <input type="range" id="exp-temp" min="-2" max="35" value="15" 
                            style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #3b82f6, #fbbf24, #ef4444); cursor: pointer;"
                            oninput="game.updateThermohalineExp()">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                            <span>极地(-2°C)</span>
                            <span>温带</span>
                            <span>热带(35°C)</span>
                        </div>
                    </div>
                    
                    <!-- 盐度滑块 -->
                    <div style="background: #dbeafe; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12px; color: #1e40af; font-weight: bold;">🧂 盐度</label>
                            <span id="salinity-display" style="font-size: 12px; color: #1e40af; font-weight: bold;">35‰</span>
                        </div>
                        <input type="range" id="exp-salinity" min="0" max="45" value="35" 
                            style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #93c5fd, #3b82f6, #1e40af); cursor: pointer;"
                            oninput="game.updateThermohalineExp()">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                            <span>淡水(0‰)</span>
                            <span>正常</span>
                            <span>高盐(45‰)</span>
                        </div>
                    </div>
                    
                    <!-- 快速实验按钮 -->
                    <div style="background: #f0fdf4; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #22c55e;">
                        <div style="font-size: 11px; color: #166534; margin-bottom: 8px; font-weight: bold;">⚡ 快速实验场景</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <button onclick="game.setThermohalineScene('polar')" 
                                style="padding: 8px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                                ❄️ 极地海水
                            </button>
                            <button onclick="game.setThermohalineScene('tropical')" 
                                style="padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                                ☀️ 热带海水
                            </button>
                            <button onclick="game.setThermohalineScene('glacier')" 
                                style="padding: 8px; background: #06b6d4; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                                🧊 冰川融水
                            </button>
                            <button onclick="game.setThermohalineScene('normal')" 
                                style="padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                                ✓ 正常海水
                            </button>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 12px; color: #92400e; line-height: 1.6;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                    game.updateThermohalineExp();
                }, 300);
                break;
                
            case 'climate_change':
                panel.innerHTML = `
                    <h4>🌍 冰川融化危机模拟器</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 环流强度仪表盘 -->
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 2px solid #0ea5e9;">
                        <div style="font-size: 12px; color: #7dd3fc; margin-bottom: 8px;">🌊 大西洋环流强度</div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="flex: 1; height: 20px; background: rgba(255,255,255,0.2); border-radius: 10px; overflow: hidden;">
                                <div id="current-strength-bar" style="height: 100%; width: 100%; background: linear-gradient(90deg, #3b82f6, #06b6d4); transition: all 0.5s; border-radius: 10px;"></div>
                            </div>
                            <div id="current-strength-value" style="font-size: 18px; font-weight: bold; color: white; min-width: 50px;">100%</div>
                        </div>
                    </div>
                    
                    <!-- 全球变暖滑块 -->
                    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12px; color: #991b1b; font-weight: bold;">🌡️ 全球变暖程度</label>
                            <span id="warming-display" style="font-size: 12px; color: #991b1b; font-weight: bold;">+0°C</span>
                        </div>
                        <input type="range" id="global-warming" min="0" max="5" value="0" step="0.5"
                            style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #22c55e, #f59e0b, #ef4444); cursor: pointer;"
                            oninput="game.updateClimateChangeExp()">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #64748b; margin-top: 4px;">
                            <span>正常(0°C)</span>
                            <span>危险(+5°C)</span>
                        </div>
                    </div>
                    
                    <!-- 冰川融化进度 -->
                    <div style="background: #e0f2fe; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #0ea5e9;">
                        <div style="font-size: 11px; color: #0369a1; margin-bottom: 6px;">🧊 格陵兰冰川融化量</div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <div style="flex: 1; height: 12px; background: rgba(14, 165, 233, 0.2); border-radius: 6px; overflow: hidden;">
                                <div id="glacier-melt-bar" style="height: 100%; width: 0%; background: linear-gradient(90deg, #0ea5e9, #06b6d4); transition: all 0.5s; border-radius: 6px;"></div>
                            </div>
                            <span id="glacier-melt-value" style="font-size: 11px; color: #0369a1; font-weight: bold;">0 Gt/年</span>
                        </div>
                    </div>
                    
                    <!-- 海水盐度变化 -->
                    <div style="background: #dbeafe; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
                        <div style="font-size: 11px; color: #1e40af; margin-bottom: 6px;">🧂 北大西洋盐度</div>
                        <div style="text-align: center;">
                            <span id="salinity-change" style="font-size: 18px; color: #1e40af; font-weight: bold;">35.0‰</span>
                        </div>
                    </div>
                    
                    <!-- 快速场景按钮 -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                        <button onclick="game.setClimateScene(0)" 
                            style="padding: 8px; background: #22c55e; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                            场景 1
                        </button>
                        <button onclick="game.setClimateScene(2.5)" 
                            style="padding: 8px; background: #f59e0b; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                            场景 2
                        </button>
                        <button onclick="game.setClimateScene(4)" 
                            style="padding: 8px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                            场景 3
                        </button>
                        <button onclick="game.setClimateScene(5)" 
                            style="padding: 8px; background: #7f1d1d; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 11px;">
                            场景 4
                        </button>
                    </div>
                    
                    <div style="background: #e0f2fe; padding: 12px; border-radius: 8px; font-size: 11px; color: #0369a1; line-height: 1.5;">
                        💡 观察任务：调节滑块，观察冰川、洋流和欧洲的变化。你能发现什么规律？
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                    game.updateClimateChangeExp();
                }, 300);
                break;
                
            case 'fishery':
                panel.innerHTML = `
                    <h4>🐟 渔场探测实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 探测控制 -->
                    <div style="background: #e0f2fe; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 2px solid #0ea5e9;">
                        <div style="font-size: 12px; color: #0369a1; margin-bottom: 10px; font-weight: bold;">🎯 选择探测区域</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px;">
                            <button onclick="game.selectFisheryRegion(0)" id="region-a-btn"
                                style="padding: 10px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 11px;">
                                区域A<br>北海道
                            </button>
                            <button onclick="game.selectFisheryRegion(1)" id="region-b-btn"
                                style="padding: 10px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 11px;">
                                区域B<br>大西洋
                            </button>
                            <button onclick="game.selectFisheryRegion(2)" id="region-c-btn"
                                style="padding: 10px; background: #64748b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 11px;">
                                区域C<br>秘鲁
                            </button>
                        </div>
                        <button onclick="game.startFishDetection()" 
                            style="width: 100%; padding: 12px; background: #22c55e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;">
                            🔍 开始鱼群探测
                        </button>
                    </div>
                    
                    <!-- 探测结果 -->
                    <div style="background: #f0fdf4; padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #22c55e; display: none;" id="fish-result-panel">
                        <div style="font-size: 12px; color: #166534; margin-bottom: 8px; font-weight: bold;">📊 探测结果</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-size: 10px; color: #64748b;">鱼群数量</div>
                                <div id="fish-count" style="font-size: 20px; color: #22c55e; font-weight: bold;">0</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-size: 10px; color: #64748b;">资源等级</div>
                                <div id="fish-level" style="font-size: 14px; color: #22c55e; font-weight: bold;">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 11px; color: #92400e; line-height: 1.5;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                }, 300);
                break;
                
            case 'shipping':
                panel.innerHTML = `
                    <h4>🚢 航线规划模拟</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 航线选择 -->
                    <div style="background: #e0f2fe; padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 2px solid #0ea5e9;">
                        <div style="font-size: 12px; color: #0369a1; margin-bottom: 10px; font-weight: bold;">🗺️ 选择航线</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                            <button onclick="game.selectShippingRoute('A')" id="route-a-btn"
                                style="padding: 12px; background: #22c55e; color: white; border: 2px solid #22c55e; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                航线A（北线）<br>
                                <span style="font-size: 10px;">顺北太平洋暖流</span>
                            </button>
                            <button onclick="game.selectShippingRoute('B')" id="route-b-btn"
                                style="padding: 12px; background: white; color: #64748b; border: 2px solid #cbd5e1; border-radius: 8px; cursor: pointer; font-size: 13px;">
                                航线B（南线）<br>
                                <span style="font-size: 10px;">横渡中太平洋</span>
                            </button>
                        </div>
                        <button onclick="game.startVoyageSimulation()" 
                            style="width: 100%; padding: 12px; background: #f59e0b; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: bold;">
                            ⚓ 开始航行模拟
                        </button>
                    </div>
                    
                    <!-- 航行数据 -->
                    <div style="background: #fef3c7; padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #f59e0b; display: none;" id="voyage-result-panel">
                        <div style="font-size: 12px; color: #92400e; margin-bottom: 10px; font-weight: bold;">📊 航行数据</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 6px;">
                                <div style="font-size: 10px; color: #64748b;">航行时间</div>
                                <div id="voyage-time" style="font-size: 18px; color: #f59e0b; font-weight: bold;">0天</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 6px;">
                                <div style="font-size: 10px; color: #64748b;">燃料消耗</div>
                                <div id="voyage-fuel" style="font-size: 18px; color: #f59e0b; font-weight: bold;">0吨</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 6px;">
                                <div style="font-size: 10px; color: #64748b;">平均速度</div>
                                <div id="voyage-speed" style="font-size: 16px; color: #3b82f6; font-weight: bold;">0节</div>
                            </div>
                            <div style="text-align: center; padding: 8px; background: white; border-radius: 6px;">
                                <div style="font-size: 10px; color: #64748b;">洋流影响</div>
                                <div id="voyage-current" style="font-size: 14px; color: #3b82f6; font-weight: bold;">-</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 对比表格 -->
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: none;" id="route-comparison">
                        <div style="font-size: 11px; color: #0369a1; font-weight: bold; margin-bottom: 8px;">📈 航线对比</div>
                        <table style="width: 100%; font-size: 10px; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #cbd5e1;">
                                <td style="padding: 4px; color: #64748b;">航线A</td>
                                <td id="route-a-time" style="padding: 4px; text-align: right; font-weight: bold;">-</td>
                                <td id="route-a-fuel" style="padding: 4px; text-align: right; font-weight: bold;">-</td>
                            </tr>
                            <tr>
                                <td style="padding: 4px; color: #64748b;">航线B</td>
                                <td id="route-b-time" style="padding: 4px; text-align: right; font-weight: bold;">-</td>
                                <td id="route-b-fuel" style="padding: 4px; text-align: right; font-weight: bold;">-</td>
                            </tr>
                        </table>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 11px; color: #92400e; line-height: 1.5;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                    game.experimentState.selectedRoute = 'A';
                }, 300);
                break;
                
            case 'climate_case':
                panel.innerHTML = `
                    <h4>🌡️ 寒流降温实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 寒流强度控制 -->
                    <div style="background: linear-gradient(135deg, #1e3a5f 0%, #0c4a6e 100%); padding: 15px; border-radius: 12px; margin-bottom: 15px; border: 2px solid #3b82f6;">
                        <div style="font-size: 12px; color: #7dd3fc; margin-bottom: 8px;">🌊 加那利寒流强度</div>
                        <input type="range" id="cold-current-strength" min="0" max="100" value="80" 
                            style="width: 100%; height: 8px; border-radius: 4px; background: linear-gradient(90deg, #93c5fd, #3b82f6, #1e40af); cursor: pointer; margin-bottom: 8px;"
                            oninput="game.updateClimateCaseExp()">
                        <div style="display: flex; justify-content: space-between; font-size: 10px; color: #7dd3fc;">
                            <span>无寒流</span>
                            <span id="current-strength-display">强</span>
                            <span>极强</span>
                        </div>
                    </div>
                    
                    <!-- 温度对比 -->
                    <div style="background: #fee2e2; padding: 15px; border-radius: 12px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
                        <div style="font-size: 12px; color: #991b1b; margin-bottom: 10px; font-weight: bold;">🌡️ 温度监测</div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-size: 10px; color: #64748b;">🏝️ 沿海温度</div>
                                <div id="coastal-temp" style="font-size: 24px; color: #3b82f6; font-weight: bold;">25°C</div>
                            </div>
                            <div style="text-align: center; padding: 10px; background: white; border-radius: 8px;">
                                <div style="font-size: 10px; color: #64748b;">🏜️ 内陆温度</div>
                                <div id="inland-temp" style="font-size: 24px; color: #ef4444; font-weight: bold;">45°C</div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; text-align: center; padding: 8px; background: white; border-radius: 6px;">
                            <span style="font-size: 11px; color: #64748b;">温差: </span>
                            <span id="temp-difference" style="font-size: 16px; color: #f59e0b; font-weight: bold;">20°C</span>
                        </div>
                    </div>
                    
                    <!-- 风向指示 -->
                    <div style="background: #e0f2fe; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="font-size: 11px; color: #0369a1; margin-bottom: 6px;">💨 风向: 离岸风（从陆地吹向海洋）</div>
                        <div style="height: 30px; background: white; border-radius: 6px; position: relative; overflow: hidden;">
                            <div id="wind-animation" style="position: absolute; top: 50%; transform: translateY(-50%); font-size: 16px; animation: wind-blow 2s infinite;">💨 →</div>
                        </div>
                    </div>
                    
                    <style>
                        @keyframes wind-blow {
                            0% { left: 10%; }
                            50% { left: 60%; }
                            100% { left: 10%; }
                        }
                    </style>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 11px; color: #92400e; line-height: 1.5;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                    game.updateClimateCaseExp();
                }, 300);
                break;
                
            case 'fog':
                panel.innerHTML = `
                    <h4>🌫️ 海雾形成实验</h4>
                    <p style="font-size: 13px; color: #64748b; margin-bottom: 15px; line-height: 1.6;">
                        ${task.instruction}
                    </p>
                    
                    <!-- 暖流水温控制 -->
                    <div style="background: #fee2e2; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #ef4444;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12px; color: #991b1b; font-weight: bold;">🌊 北大西洋暖流水温</label>
                            <span id="warm-water-temp" style="font-size: 14px; color: #991b1b; font-weight: bold;">15°C</span>
                        </div>
                        <input type="range" id="fog-warm-temp" min="5" max="25" value="15" 
                            style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #fca5a5, #ef4444); cursor: pointer;"
                            oninput="game.updateFogExp()">
                    </div>
                    
                    <!-- 冷空气温度控制 -->
                    <div style="background: #dbeafe; padding: 12px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #3b82f6;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                            <label style="font-size: 12px; color: #1e40af; font-weight: bold;">❄️ 冷空气温度</label>
                            <span id="cold-air-temp" style="font-size: 14px; color: #1e40af; font-weight: bold;">5°C</span>
                        </div>
                        <input type="range" id="fog-cold-temp" min="-5" max="15" value="5" 
                            style="width: 100%; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #93c5fd, #3b82f6); cursor: pointer;"
                            oninput="game.updateFogExp()">
                    </div>
                    
                    <!-- 雾浓度显示 -->
                    <div style="background: linear-gradient(135deg, #64748b 0%, #94a3b8 100%); padding: 15px; border-radius: 12px; margin-bottom: 12px; border: 2px solid #cbd5e1;">
                        <div style="font-size: 12px; color: white; margin-bottom: 8px; text-align: center;">🌫️ 雾气浓度</div>
                        <div style="height: 30px; background: rgba(255,255,255,0.2); border-radius: 15px; overflow: hidden; position: relative;">
                            <div id="fog-density-bar" style="height: 100%; width: 50%; background: linear-gradient(90deg, rgba(255,255,255,0.3), rgba(255,255,255,0.8)); transition: all 0.5s; border-radius: 15px;"></div>
                        </div>
                        <div id="fog-level-text" style="text-align: center; margin-top: 8px; font-size: 14px; color: white; font-weight: bold;">中等雾</div>
                    </div>
                    
                    <!-- 温差显示 -->
                    <div style="background: #f0f9ff; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 11px; color: #0369a1;">暖冷温差</span>
                            <span id="fog-temp-diff" style="font-size: 16px; color: #0369a1; font-weight: bold;">10°C</span>
                        </div>
                        <div style="margin-top: 6px; font-size: 10px; color: #64748b;">
                            💡 温差越大，雾气越浓
                        </div>
                    </div>
                    
                    <div style="background: #fef3c7; padding: 12px; border-radius: 8px; font-size: 11px; color: #92400e; line-height: 1.5;">
                        ${task.hint}
                    </div>
                `;
                setTimeout(() => {
                    document.getElementById('thinking-area').style.display = 'block';
                    game.updateFogExp();
                }, 300);
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
    
    // ========== 第5章温盐环流实验交互 ==========
    updateThermohalineExp() {
        const temp = parseInt(document.getElementById('exp-temp')?.value || 15);
        const salinity = parseInt(document.getElementById('exp-salinity')?.value || 35);
        
        // 保存状态
        this.experimentState.temperature = temp;
        this.experimentState.salinity = salinity;
        
        // 更新显示
        document.getElementById('temp-display').textContent = temp + '°C';
        document.getElementById('salinity-display').textContent = salinity + '‰';
        
        // 计算密度 (简化公式: 密度 = 1025 + 0.8*(盐度-35) - 0.2*(温度-15))
        let density = 1025 + 0.8 * (salinity - 35) - 0.2 * (temp - 15);
        density = Math.max(1010, Math.min(1040, density));
        
        // 更新密度计
        const densityPercent = ((density - 1010) / 30) * 100;
        document.getElementById('density-bar').style.width = densityPercent + '%';
        document.getElementById('density-value').textContent = Math.round(density);
    }
    
    setThermohalineScene(scene) {
        let temp = 15, salinity = 35;
        
        switch(scene) {
            case 'polar':
                temp = -2;
                salinity = 38; // 结冰析盐，盐度略高
                break;
            case 'tropical':
                temp = 30;
                salinity = 36;
                break;
            case 'glacier':
                temp = 5;
                salinity = 15; // 冰川融水，盐度低
                break;
            case 'normal':
                temp = 15;
                salinity = 35;
                break;
        }
        
        document.getElementById('exp-temp').value = temp;
        document.getElementById('exp-salinity').value = salinity;
        this.updateThermohalineExp();
    }
    
    // ========== 第5章气候变化实验交互 ==========
    updateClimateChangeExp() {
        const warming = parseFloat(document.getElementById('global-warming')?.value || 0);
        
        // 保存状态
        this.experimentState.globalWarming = warming;
        
        // 更新显示
        document.getElementById('warming-display').textContent = `+${warming}°C`;
        
        // 计算冰川融化量 (Gt/年)
        const glacierMelt = Math.round(warming * 560); // 每升温1度约560 Gt
        document.getElementById('glacier-melt-value').textContent = `${glacierMelt} Gt/年`;
        document.getElementById('glacier-melt-bar').style.width = `${(warming / 5) * 100}%`;
        
        // 计算盐度变化（淡水稀释效应）
        const salinity = Math.max(20, 35 - warming * 3);
        document.getElementById('salinity-change').textContent = `${salinity.toFixed(1)}‰`;
        
        // 计算环流强度（随盐度降低而减弱）
        const strength = Math.max(20, 100 - warming * 16);
        document.getElementById('current-strength-value').textContent = `${Math.round(strength)}%`;
        document.getElementById('current-strength-bar').style.width = `${strength}%`;
    }
    
    setClimateScene(warmingLevel) {
        document.getElementById('global-warming').value = warmingLevel;
        this.updateClimateChangeExp();
    }
    
    // ========== 第4章案例分析交互 ==========
    
    // 渔场选址实验
    selectFisheryRegion(regionIndex) {
        this.experimentState.selectedFisheryRegion = regionIndex;
        // 更新按钮样式
        ['a', 'b', 'c'].forEach((r, i) => {
            const btn = document.getElementById(`region-${r}-btn`);
            if (btn) {
                btn.style.background = i === regionIndex ? '#3b82f6' : '#64748b';
            }
        });
    }
    
    startFishDetection() {
        const region = this.experimentState.selectedFisheryRegion || 0;
        const resultPanel = document.getElementById('fish-result-panel');
        
        // 根据区域设置鱼群数据
        const fishData = [
            { count: 850, level: '极丰富', desc: '寒暖流交汇，营养盐丰富' },  // 北海道
            { count: 320, level: '一般', desc: '普通海域，营养盐较少' },    // 大西洋中部
            { count: 780, level: '很丰富', desc: '上升流带来深层营养盐' }    // 秘鲁
        ];
        
        const data = fishData[region];
        this.experimentState.lastFishCount = data.count;
        
        // 显示结果
        resultPanel.style.display = 'block';
        
        // 动画计数
        let current = 0;
        const counter = setInterval(() => {
            current += Math.ceil(data.count / 20);
            if (current >= data.count) {
                current = data.count;
                clearInterval(counter);
            }
            document.getElementById('fish-count').textContent = current;
        }, 50);
        
        document.getElementById('fish-level').textContent = data.level;
        
        // 存储所有区域数据用于比较
        if (!this.experimentState.fishComparison) {
            this.experimentState.fishComparison = {};
        }
        this.experimentState.fishComparison[region] = data;
    }
    
    // 航线规划模拟
    selectShippingRoute(route) {
        this.experimentState.selectedRoute = route;
        
        const btnA = document.getElementById('route-a-btn');
        const btnB = document.getElementById('route-b-btn');
        
        if (route === 'A') {
            btnA.style.background = '#22c55e';
            btnA.style.color = 'white';
            btnA.style.border = '2px solid #22c55e';
            btnB.style.background = 'white';
            btnB.style.color = '#64748b';
            btnB.style.border = '2px solid #cbd5e1';
        } else {
            btnB.style.background = '#22c55e';
            btnB.style.color = 'white';
            btnB.style.border = '2px solid #22c55e';
            btnA.style.background = 'white';
            btnA.style.color = '#64748b';
            btnA.style.border = '2px solid #cbd5e1';
        }
    }
    
    startVoyageSimulation() {
        const route = this.experimentState.selectedRoute || 'A';
        const isRouteA = route === 'A';
        
        // 航线数据（Route A顺流，更快更省燃料）
        const voyageData = isRouteA ? {
            time: 12,
            fuel: 240,
            speed: 18,
            current: '顺流 +3节',
            advantage: '顺北太平洋暖流'
        } : {
            time: 18,
            fuel: 360,
            speed: 12,
            current: '逆流 -2节',
            advantage: '无'
        };
        
        // 存储对比数据
        if (!this.experimentState.voyageComparison) {
            this.experimentState.voyageComparison = {};
        }
        this.experimentState.voyageComparison[route] = voyageData;
        
        // 显示结果
        document.getElementById('voyage-result-panel').style.display = 'block';
        document.getElementById('route-comparison').style.display = 'block';
        
        // 动画更新数据
        document.getElementById('voyage-time').textContent = voyageData.time + '天';
        document.getElementById('voyage-fuel').textContent = voyageData.fuel + '吨';
        document.getElementById('voyage-speed').textContent = voyageData.speed + '节';
        document.getElementById('voyage-current').textContent = voyageData.current;
        
        // 更新对比表
        const otherRoute = isRouteA ? 'B' : 'A';
        const otherData = this.experimentState.voyageComparison[otherRoute];
        
        if (otherData) {
            document.getElementById(`route-${route.toLowerCase()}-time`).textContent = voyageData.time + '天';
            document.getElementById(`route-${route.toLowerCase()}-fuel`).textContent = voyageData.fuel + '吨';
            document.getElementById(`route-${otherRoute.toLowerCase()}-time`).textContent = otherData.time + '天';
            document.getElementById(`route-${otherRoute.toLowerCase()}-fuel`).textContent = otherData.fuel + '吨';
        } else {
            document.getElementById(`route-${route.toLowerCase()}-time`).textContent = voyageData.time + '天';
            document.getElementById(`route-${route.toLowerCase()}-fuel`).textContent = voyageData.fuel + '吨';
        }
    }
    
    // 寒流降温实验
    updateClimateCaseExp() {
        const strength = parseInt(document.getElementById('cold-current-strength')?.value || 80);
        
        // 保存状态
        this.experimentState.coldCurrentStrength = strength;
        
        // 更新强度显示
        const strengthText = strength < 30 ? '弱' : strength < 60 ? '中等' : strength < 85 ? '强' : '极强';
        const displayEl = document.getElementById('current-strength-display');
        if (displayEl) displayEl.textContent = strengthText;
        
        // 计算温度（寒流越强，沿海温度越低，温差越大）
        // 无寒流时：沿海和内陆温度相同（都是38°C）
        // 寒流最强时：沿海降到20°C，内陆38°C，温差18°C
        const baseTemp = 38; // 基础温度
        const coastalTemp = Math.max(20, baseTemp - (strength / 100) * 18); // 20-38度
        const inlandTemp = baseTemp - (strength / 100) * 5; // 内陆也略有降温，33-38度
        const tempDiff = Math.round(inlandTemp - coastalTemp);
        
        // 更新显示
        const coastalEl = document.getElementById('coastal-temp');
        const inlandEl = document.getElementById('inland-temp');
        const diffEl = document.getElementById('temp-difference');
        
        if (coastalEl) coastalEl.textContent = Math.round(coastalTemp) + '°C';
        if (inlandEl) inlandEl.textContent = Math.round(inlandTemp) + '°C';
        if (diffEl) diffEl.textContent = tempDiff + '°C';
    }
    
    // 海雾形成实验
    updateFogExp() {
        const warmTemp = parseInt(document.getElementById('fog-warm-temp')?.value || 15);
        const coldTemp = parseInt(document.getElementById('fog-cold-temp')?.value || 5);
        
        // 保存状态
        this.experimentState.fogWarmTemp = warmTemp;
        this.experimentState.fogColdTemp = coldTemp;
        
        // 更新温度显示
        const warmEl = document.getElementById('warm-water-temp');
        const coldEl = document.getElementById('cold-air-temp');
        if (warmEl) warmEl.textContent = warmTemp + '°C';
        if (coldEl) coldEl.textContent = coldTemp + '°C';
        
        // 计算温差和雾浓度
        const tempDiff = warmTemp - coldTemp;
        const fogDensity = Math.min(100, Math.max(0, tempDiff * 8)); // 温差越大雾越浓
        
        // 更新温差显示
        const diffEl = document.getElementById('fog-temp-diff');
        if (diffEl) diffEl.textContent = tempDiff + '°C';
        
        // 更新雾浓度条
        const fogBar = document.getElementById('fog-density-bar');
        const fogText = document.getElementById('fog-level-text');
        
        if (fogBar) fogBar.style.width = fogDensity + '%';
        
        // 雾等级文字
        let fogLevel = '无雾';
        if (fogDensity > 10) fogLevel = '轻雾';
        if (fogDensity > 30) fogLevel = '中等雾';
        if (fogDensity > 60) fogLevel = '浓雾';
        if (fogDensity > 85) fogLevel = '大雾弥漫';
        
        if (fogText) fogText.textContent = fogLevel;
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
        // 补偿流实验 - 纯视觉探究版
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
        
        // 海水层次（区分表层和深层）
        this.ctx.fillStyle = 'rgba(2, 132, 199, 0.3)';
        this.ctx.fillRect(200, 180, 700, 320);
        
        // 深层海水（颜色更深）
        this.ctx.fillStyle = 'rgba(30, 58, 138, 0.5)';
        this.ctx.fillRect(200, 350, 700, 150);
        
        // 海水层次分界线
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(200, 350);
        this.ctx.lineTo(900, 350);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        if (this.experimentState.waterRemoved) {
            // 表层海水被吹走的区域（用不同颜色表示空缺）
            this.ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
            this.ctx.fillRect(350, 180, 200, 80);
            
            // 动态补偿流粒子（黄色 = 水平流动）
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
            
            // 上升流粒子（青色 = 垂直流动）
            for (let i = 0; i < 10; i++) {
                const progress = (t * 0.8 + i * 0.15) % 1;
                const x = 400 + (i % 3) * 50;
                const y = 480 - progress * 200;
                this.ctx.fillStyle = '#22d3ee';
                this.ctx.beginPath();
                this.ctx.arc(x, y, 5, 0, Math.PI * 2);
                this.ctx.fill();
            }
            
            // 箭头（纯视觉指示方向，无文字）
            this.ctx.strokeStyle = '#fbbf24';
            this.ctx.lineWidth = 3;
            this.drawArrow(250, 230, 340, 230);
            this.drawArrow(650, 230, 560, 230);
            
            // 上升箭头（青色）
            this.ctx.strokeStyle = '#22d3ee';
            this.drawArrow(420, 450, 420, 320);
            this.drawArrow(450, 450, 450, 300);
            this.drawArrow(480, 450, 480, 320);
        } else {
            // 初始状态提示（引导点击按钮）
            this.ctx.fillStyle = 'white';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('点击右侧"抽走海水"按钮开始实验', 550, 250);
            
            // 风的示意（箭头指向海洋）
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
        }
        
        // 底部探究问题（无直接结论）
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 430, 800, 45, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 探究：点击"抽走海水"后，观察黄色和青色粒子的运动方向', 450, 455);
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
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(600, 180, 750, 120, 800, 200, true, true); // 北太平洋暖流
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(800, 200, 780, 280, 700, 300, true, false); // 加利福尼亚寒流
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(700, 300, 550, 320, 500, 280, true, true); // 北赤道暖流
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(500, 280, 520, 200, 600, 180, true, true); // 黑潮
        
        // 北大西洋环流
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(200, 180, 300, 120, 380, 180, true, true);
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(380, 180, 350, 250, 300, 300, true, false);
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(300, 300, 200, 320, 150, 280, true, true);
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(150, 280, 160, 200, 200, 180, true, true);
        
        // 精致标题背景
        this.drawMapTitle('🌊 北半球中低纬度环流', '观察：环流方向是顺时针还是逆时针？');
        
        // 旋转方向指示 - 带背景圆圈
        this.drawDirectionIndicator(650, 220, 'clockwise');
        this.drawDirectionIndicator(250, 220, 'clockwise');
    }
    
    drawChapter3South() {
        // 南半球洋流 - 逆时针环流
        this.drawWorldMapBase();
        
        // 高亮南半球
        this.ctx.fillStyle = 'rgba(236, 72, 153, 0.1)';
        this.ctx.fillRect(0, 250, 900, 250);
        
        // 南太平洋环流（逆时针方向修正）
        // 逆时针流向：西风漂流 → 东澳大利亚暖流 → 南赤道暖流 → 秘鲁寒流 → 西风漂流
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(700, 350, 620, 340, 550, 350, true, false); // 西风漂流 (向东)
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(550, 350, 500, 400, 550, 450, true, true); // 东澳大利亚暖流 (向南)
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(550, 450, 650, 470, 750, 450, true, true); // 南赤道暖流 (向西)
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(750, 450, 780, 400, 700, 350, true, false); // 秘鲁寒流 (向北)
        
        // 南大西洋环流（逆时针方向 - 重新调整控制点）
        // 逆时针：西风漂流(东) → 巴西暖流(南) → 南赤道暖流(西) → 本格拉寒流(北)
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(150, 400, 225, 390, 300, 400, true, false); // 西风漂流 (向东，偏下)
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(300, 400, 340, 450, 280, 480, true, true); // 巴西暖流 (向东南弯曲)
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(280, 480, 200, 500, 130, 480, true, true); // 南赤道暖流 (向西，偏下)
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.drawCurvedArrow(130, 480, 90, 430, 150, 400, true, false); // 本格拉寒流 (向西北弯曲)
        
        // 精致标题
        this.drawMapTitle('🌊 南半球中低纬度环流', '观察：与北半球相比，旋转方向有什么不同？');
        
        // 旋转方向指示
        this.drawDirectionIndicator(650, 400, 'counterclockwise');
        this.drawDirectionIndicator(200, 400, 'counterclockwise');
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
    
    // ========== 第4章：案例分析可视化（探究式 redesign） ==========
    drawChapter4Fishery() {
        // 渔场选址实验 - 探究式可视化
        this.drawWorldMapBase();
        
        // 三个候选区域配置
        const regions = [
            { x: 650, y: 200, name: '区域A', desc: '北海道', current: 'convergence', fishCount: 850 },  // 寒暖流交汇
            { x: 300, y: 350, name: '区域B', desc: '大西洋中部', current: 'normal', fishCount: 320 },     // 普通海域
            { x: 750, y: 380, name: '区域C', desc: '秘鲁沿岸', current: 'upwelling', fishCount: 780 }   // 上升流
        ];
        
        const selectedRegion = this.experimentState.selectedFisheryRegion || 0;
        
        regions.forEach((r, i) => {
            const isSelected = selectedRegion === i;
            
            // 区域圆圈（选中时高亮）
            this.ctx.strokeStyle = isSelected ? '#fbbf24' : 'rgba(255,255,255,0.5)';
            this.ctx.lineWidth = isSelected ? 4 : 2;
            this.ctx.beginPath();
            this.ctx.arc(r.x, r.y, 45, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 区域标签
            this.ctx.fillStyle = isSelected ? '#fbbf24' : 'white';
            this.ctx.font = isSelected ? 'bold 16px Arial' : '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(r.name, r.x, r.y - 60);
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'rgba(255,255,255,0.8)';
            this.ctx.fillText(r.desc, r.x, r.y + 60);
            
            // 如果已探测，显示鱼群粒子动画
            if (this.experimentState.fishComparison && this.experimentState.fishComparison[i]) {
                const fishData = this.experimentState.fishComparison[i];
                this.drawFishParticles(r.x, r.y, fishData.count);
                
                // 显示鱼群数量指示
                this.ctx.fillStyle = '#22c55e';
                this.ctx.font = 'bold 12px Arial';
                this.ctx.fillText(`🐟 ${fishData.count}`, r.x, r.y + 80);
            }
        });
        
        // 洋流可视化（颜色编码）
        // 区域A：寒暖流交汇（红蓝交汇）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 4;
        this.drawArrow(620, 260, 660, 220);
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 4;
        this.drawArrow(680, 170, 660, 200);
        // 交汇点
        this.ctx.fillStyle = '#22c55e';
        this.ctx.beginPath();
        this.ctx.arc(660, 210, 10, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 区域C：上升流（青色向上）
        this.ctx.strokeStyle = '#22d3ee';
        this.ctx.lineWidth = 4;
        this.drawArrow(750, 440, 750, 390);
        
        // 底部提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 430, 800, 50, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 选择区域并点击"开始鱼群探测"，观察不同洋流条件下的鱼群数量', 450, 460);
    }
    
    // 绘制鱼群粒子动画
    drawFishParticles(centerX, centerY, count) {
        const t = this.animationFrame * 0.02;
        const particleCount = Math.min(30, Math.floor(count / 30)); // 根据数量显示粒子
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + t;
            const radius = 25 + Math.sin(t * 2 + i) * 10;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            // 鱼粒子
            this.ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + Math.sin(t + i) * 0.3})`;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 4, 2, angle, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawChapter4Shipping() {
        // 航线规划模拟 - 探究式可视化
        this.drawWorldMapBase();
        
        // 上海和旧金山位置
        const shanghai = { x: 720, y: 220 };
        const sf = { x: 150, y: 200 };
        
        // 标记城市
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(shanghai.x, shanghai.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🏙️ 上海', shanghai.x, shanghai.y - 20);
        
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(sf.x, sf.y, 10, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('🌉 旧金山', sf.x, sf.y - 20);
        
        const selectedRoute = this.experimentState.selectedRoute || 'A';
        
        // 航线A：北太平洋航线（顺洋流）- 绿色
        const isRouteASelected = selectedRoute === 'A';
        this.ctx.strokeStyle = isRouteASelected ? '#22c55e' : 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = isRouteASelected ? 4 : 2;
        this.ctx.setLineDash([15, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(shanghai.x, shanghai.y);
        this.ctx.quadraticCurveTo(450, 100, sf.x, sf.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 航线A标签
        this.ctx.fillStyle = isRouteASelected ? '#22c55e' : 'rgba(255,255,255,0.5)';
        this.ctx.font = isRouteASelected ? 'bold 14px Arial' : '12px Arial';
        this.ctx.fillText('航线A（北线）', 400, 80);
        if (isRouteASelected) {
            this.ctx.font = '11px Arial';
            this.ctx.fillText('顺北太平洋暖流', 400, 95);
        }
        
        // 航线B：中太平洋航线（逆洋流）- 橙色
        const isRouteBSelected = selectedRoute === 'B';
        this.ctx.strokeStyle = isRouteBSelected ? '#f59e0b' : 'rgba(255,255,255,0.3)';
        this.ctx.lineWidth = isRouteBSelected ? 4 : 2;
        this.ctx.setLineDash([15, 8]);
        this.ctx.beginPath();
        this.ctx.moveTo(shanghai.x, shanghai.y);
        this.ctx.quadraticCurveTo(450, 280, sf.x, sf.y);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 航线B标签
        this.ctx.fillStyle = isRouteBSelected ? '#f59e0b' : 'rgba(255,255,255,0.5)';
        this.ctx.font = isRouteBSelected ? 'bold 14px Arial' : '12px Arial';
        this.ctx.fillText('航线B（南线）', 400, 290);
        if (isRouteBSelected) {
            this.ctx.font = '11px Arial';
            this.ctx.fillText('横渡中太平洋', 400, 305);
        }
        
        // 洋流动画（红色箭头从西向东）
        const t = this.animationFrame * 0.03;
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        for (let i = 0; i < 6; i++) {
            const x = 200 + i * 80 + (t * 20) % 80;
            const y = 130;
            this.drawShipArrow(x, y, 0, '#ef4444');
        }
        this.ctx.fillStyle = '#fca5a5';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('→ 北太平洋暖流方向', 450, 155);
        
        // 如果有航行数据，显示船只动画
        if (this.experimentState.voyageComparison) {
            const voyageData = this.experimentState.voyageComparison[selectedRoute];
            if (voyageData) {
                this.drawShipAnimation(selectedRoute, shanghai, sf, voyageData.speed);
            }
        }
        
        // 底部提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 430, 800, 50, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 选择航线并点击"开始航行模拟"，比较两条航线的时间和燃料消耗', 450, 460);
    }
    
    // 绘制船只航行动画
    drawShipAnimation(route, start, end, speed) {
        const t = this.animationFrame * 0.01;
        const progress = (t * speed / 20) % 1; // 根据速度调整动画
        
        // 计算船只在曲线上的位置
        let x, y;
        if (route === 'A') {
            // 北线曲线
            x = start.x + (end.x - start.x) * progress;
            y = start.y + (100 - start.y) * 4 * progress * (1 - progress) + (end.y - start.y) * progress;
        } else {
            // 南线曲线
            x = start.x + (end.x - start.x) * progress;
            y = start.y + (280 - start.y) * 4 * progress * (1 - progress) + (end.y - start.y) * progress;
        }
        
        // 绘制船只
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = '20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('⛵', x, y);
        
        // 速度指示线
        const lineLength = speed;
        this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - lineLength/2, y + 15);
        this.ctx.lineTo(x + lineLength/2, y + 15);
        this.ctx.stroke();
    }
    
    // 绘制船只箭头
    drawShipArrow(x, y, angle, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 10, y);
        this.ctx.lineTo(x - 5, y - 4);
        this.ctx.lineTo(x - 5, y + 4);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawChapter4Climate() {
        // 寒流降温实验 - 探究式可视化
        const strength = this.experimentState.coldCurrentStrength || 80;
        
        // 计算温度（寒流越强，沿海越凉爽，温差越大）
        // 无寒流时：沿海和内陆温度相同（都是38°C）
        // 寒流最强时：沿海降到20°C，内陆33°C，温差13°C
        const baseTemp = 38;
        const coastalTemp = Math.max(20, baseTemp - (strength / 100) * 18); // 20-38度
        const inlandTemp = baseTemp - (strength / 100) * 5; // 内陆33-38度
        const tempDiff = Math.round(inlandTemp - coastalTemp);
        
        // 背景（根据温差调整颜色）
        const gradient = this.ctx.createLinearGradient(0, 0, 900, 0);
        gradient.addColorStop(0, '#0284c7'); // 海洋侧蓝色
        gradient.addColorStop(0.35, '#0284c7');
        gradient.addColorStop(0.35, this.interpolateColor('#f59e0b', '#fbbf24', tempDiff / 30)); // 沙漠颜色随温差变化
        gradient.addColorStop(1, this.interpolateColor('#f59e0b', '#fbbf24', tempDiff / 30));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 大西洋（动态寒流效果）
        const currentOpacity = 0.5 + (strength / 100) * 0.4;
        this.ctx.fillStyle = `rgba(2, 132, 199, ${currentOpacity})`;
        this.ctx.fillRect(0, 0, 315, 500);
        
        // 寒流动画（强度越大，箭头越多越快）
        const t = this.animationFrame * 0.02 * (strength / 50);
        const arrowCount = Math.floor(3 + (strength / 100) * 5);
        
        this.ctx.fillStyle = `rgba(147, 197, 253, ${0.5 + (strength / 100) * 0.5})`;
        for (let i = 0; i < arrowCount; i++) {
            const y = 80 + i * 60;
            const offset = (t * 20 + i * 30) % 60 - 30;
            this.ctx.beginPath();
            this.ctx.moveTo(220 + offset, y);
            this.ctx.lineTo(230 + offset, y - 5);
            this.ctx.lineTo(230 + offset, y + 5);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // 非洲大陆
        this.ctx.fillStyle = '#d97706';
        this.ctx.fillRect(315, 0, 585, 500);
        
        // 撒哈拉沙漠（颜色根据温度变化）
        const desertColor = this.interpolateColor('#f59e0b', '#fbbf24', tempDiff / 30);
        this.ctx.fillStyle = desertColor;
        this.ctx.fillRect(360, 100, 450, 200);
        
        // 内陆温度显示（使用计算出的温度）
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🏜️ 撒哈拉沙漠', 585, 180);
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillStyle = '#ef4444';
        this.ctx.fillText(`${Math.round(inlandTemp)}°C`, 585, 220);
        
        // 加那利群岛（沿海）
        const coastalColor = this.interpolateColor('#3b82f6', '#22c55e', (coastalTemp - 15) / 20);
        this.ctx.fillStyle = coastalColor;
        this.ctx.beginPath();
        this.ctx.arc(260, 200, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillText('🏝️ 加那利群岛', 260, 245);
        this.ctx.font = 'bold 20px Arial';
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.fillText(`${Math.round(coastalTemp)}°C`, 260, 275);
        
        // 温差指示器
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 50, 200, 80, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌡️ 温差', 150, 75);
        this.ctx.font = 'bold 28px Arial';
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.fillText(`${Math.round(tempDiff)}°C`, 150, 110);
        
        // 离岸风动画
        const windT = this.animationFrame * 0.03;
        this.ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
        for (let i = 0; i < 4; i++) {
            const x = 340 + Math.sin(windT + i) * 20;
            const y = 140 + i * 60;
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x - 15, y - 5);
            this.ctx.lineTo(x - 15, y + 5);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        // 底部提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 430, 800, 50, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('🔍 调节"寒流强度"滑块，观察沿海与内陆的温差变化', 450, 460);
    }
    
    drawChapter4Fog() {
        // 海雾形成实验 - 探究式可视化
        const warmTemp = this.experimentState.fogWarmTemp || 15;
        const coldTemp = this.experimentState.fogColdTemp || 5;
        const tempDiff = warmTemp - coldTemp;
        const fogDensity = Math.min(100, Math.max(0, tempDiff * 8));
        
        // 背景天空（随雾浓度变化）
        const skyOpacity = fogDensity / 100;
        const gradient = this.ctx.createLinearGradient(0, 0, 0, 500);
        gradient.addColorStop(0, this.interpolateColor('#94a3b8', '#64748b', skyOpacity));
        gradient.addColorStop(1, this.interpolateColor('#cbd5e1', '#1e293b', skyOpacity));
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 海洋（温度颜色：暖水偏红，冷水偏蓝）
        const waterColor = this.interpolateColor('#0ea5e9', '#ef4444', (warmTemp - 5) / 20);
        this.ctx.fillStyle = waterColor;
        this.ctx.fillRect(0, 280, 480, 220);
        
        // 北大西洋暖流动画（温度越高，水流越明显）
        const t = this.animationFrame * 0.02;
        const flowIntensity = (warmTemp - 5) / 20;
        
        this.ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 + flowIntensity * 0.7})`;
        this.ctx.lineWidth = 3 + flowIntensity * 5;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 400);
        this.ctx.quadraticCurveTo(250, 350, 450, 300);
        this.ctx.stroke();
        
        // 暖流粒子
        if (flowIntensity > 0.3) {
            this.ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + flowIntensity * 0.5})`;
            for (let i = 0; i < 5; i++) {
                const progress = (t + i * 0.2) % 1;
                const x = 50 + progress * 400;
                const y = 400 - progress * 100 + Math.sin(progress * Math.PI) * 20;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 3 + flowIntensity * 3, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // 英国
        const landColor = this.interpolateColor('#22c55e', '#475569', skyOpacity * 0.5);
        this.ctx.fillStyle = landColor;
        this.ctx.beginPath();
        this.ctx.ellipse(580, 200, 120, 160, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 伦敦
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.8 - skyOpacity * 0.3})`;
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🇬🇧 英国', 580, 180);
        this.ctx.font = 'bold 18px Arial';
        this.ctx.fillText('🏙️ 伦敦', 580, 210);
        
        // 温度显示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(650, 50, 200, 100, 12);
        this.ctx.fill();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = '#fca5a5';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('暖流水温', 750, 75);
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`${warmTemp}°C`, 750, 105);
        
        this.ctx.fillStyle = '#93c5fd';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('冷空气温度', 750, 135);
        this.ctx.font = 'bold 24px Arial';
        this.ctx.fillText(`${coldTemp}°C`, 750, 165);
        
        // 雾气可视化（核心效果）
        if (fogDensity > 0) {
            // 雾气覆盖层
            const fogOpacity = fogDensity / 100 * 0.7;
            this.ctx.fillStyle = `rgba(200, 210, 220, ${fogOpacity})`;
            this.ctx.fillRect(350, 50, 400, 300);
            
            // 动态雾气粒子
            const fogT = this.animationFrame * 0.01;
            const particleCount = Math.floor(fogDensity / 3);
            
            for (let i = 0; i < particleCount; i++) {
                const x = 380 + (i * 137 + fogT * 50) % 340;
                const y = 80 + Math.sin(fogT + i * 0.5) * 100 + (i * 53) % 200;
                const r = 15 + Math.sin(fogT * 2 + i) * 10;
                const alpha = (fogDensity / 100) * (0.2 + Math.sin(fogT + i) * 0.1);
                
                this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        
        // 雾气浓度指示条
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 50, 180, 100, 10);
        this.ctx.fill();
        
        this.ctx.textAlign = 'center';
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.fillText('🌫️ 雾气浓度', 140, 75);
        
        // 浓度条
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.beginPath();
        this.ctx.roundRect(70, 90, 140, 20, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + fogDensity / 100 * 0.6})`;
        this.ctx.beginPath();
        this.ctx.roundRect(70, 90, 140 * (fogDensity / 100), 20, 10);
        this.ctx.fill();
        
        this.ctx.font = 'bold 14px Arial';
        this.ctx.fillStyle = 'white';
        let fogLabel = '无雾';
        if (fogDensity > 10) fogLabel = '轻雾';
        if (fogDensity > 30) fogLabel = '中等雾';
        if (fogDensity > 60) fogLabel = '浓雾';
        if (fogDensity > 85) fogLabel = '大雾弥漫';
        this.ctx.fillText(fogLabel, 140, 135);
        
        // 底部提示
        this.ctx.fillStyle = 'rgba(0,0,0,0.6)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, 430, 800, 50, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText('🔍 调节"暖流水温"和"冷空气温度"，观察温差与雾浓度的关系', 450, 460);
    }
    
    // ========== 第5章：精致综合探究可视化 ==========
    drawChapter5ElNino() {
        // 精美海洋渐变背景
        const oceanGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
        oceanGrad.addColorStop(0, '#0c4a6e');
        oceanGrad.addColorStop(0.5, '#075985');
        oceanGrad.addColorStop(1, '#0369a1');
        this.ctx.fillStyle = oceanGrad;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制太平洋区域（带发光效果）
        this.drawElegantPacificOcean();
        
        // 精致大陆轮廓
        this.drawElegantSouthAmerica(780, 120);
        this.drawElegantAsiaAustralia(20, 120);
        
        const isElNino = this.experimentState.season === 'elnino';
        
        // 标题栏
        const title = isElNino ? '⚠️ 厄尔尼诺年份' : '✓ 正常年份';
        const subtitle = isElNino ? '东太平洋海温异常升高，气候模式被打乱' : '太平洋海温分布正常，气候模式稳定';
        this.drawChapter5Title(title, subtitle, isElNino ? '#f59e0b' : '#22c55e');
        
        if (isElNino) {
            // 厄尔尼诺：暖水向东扩展（发光效果）
            this.drawElegantWarmPool(100, 180, 700, 200, 'eastward');
            
            // 减弱的信风（虚线+发光）
            this.drawElegantTradeWinds(680, 260, 580, 260, 'weak');
            
            // 秘鲁寒流减弱标识
            this.drawElegantEffectCard(780, 320, [
                { icon: '🌡️', text: '海温升高 +4°C' },
                { icon: '🐟', text: '渔业资源减少' },
                { icon: '🌧️', text: '极端天气增加' }
            ], '#ef4444');
        } else {
            // 正常年份：西侧暖池
            this.drawElegantWarmPool(100, 180, 400, 200, 'normal');
            
            // 正常信风（实线箭头）
            this.drawElegantTradeWinds(680, 260, 480, 260, 'normal');
            this.drawElegantTradeWinds(480, 260, 280, 260, 'normal');
            
            // 秘鲁寒流（蓝色箭头）
            this.drawElegantHumboldtCurrent();
            
            // 正常状态标识
            this.drawElegantEffectCard(780, 320, [
                { icon: '🌡️', text: '海温正常' },
                { icon: '🐟', text: '渔业资源丰富' },
                { icon: '☀️', text: '气候稳定' }
            ], '#3b82f6');
        }
        
        // 精致图例
        this.drawElegantElNinoLegend();
        
        // 底部提示
        this.drawHintCard('💡 点击控制面板切换正常年份/厄尔尼诺年份，观察太平洋海温变化');
    }
    
    // 第5章标题栏
    drawChapter5Title(title, subtitle, accentColor) {
        // 背景
        this.ctx.save();
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.roundRect(200, 15, 500, 70, 15);
        this.ctx.fill();
        this.ctx.restore();
        
        // 左侧彩色条
        this.ctx.fillStyle = accentColor;
        this.ctx.beginPath();
        this.ctx.roundRect(200, 15, 6, 70, [15, 0, 0, 15]);
        this.ctx.fill();
        
        // 主标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, 450, 45);
        
        // 副标题
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(subtitle, 450, 68);
    }
    
    // 精致太平洋
    drawElegantPacificOcean() {
        // 太平洋主体
        this.ctx.save();
        const oceanGrad = this.ctx.createLinearGradient(100, 150, 800, 400);
        oceanGrad.addColorStop(0, 'rgba(2, 132, 199, 0.6)');
        oceanGrad.addColorStop(0.5, 'rgba(14, 165, 233, 0.5)');
        oceanGrad.addColorStop(1, 'rgba(2, 132, 199, 0.6)');
        this.ctx.fillStyle = oceanGrad;
        this.ctx.beginPath();
        this.ctx.roundRect(100, 150, 700, 280, 20);
        this.ctx.fill();
        this.ctx.restore();
        
        // 海洋边框
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(100, 150, 700, 280, 20);
        this.ctx.stroke();
    }
    
    // 精致南美洲
    drawElegantSouthAmerica(x, y) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        
        const landGrad = this.ctx.createLinearGradient(x, y, x + 80, y + 200);
        landGrad.addColorStop(0, '#22c55e');
        landGrad.addColorStop(0.5, '#16a34a');
        landGrad.addColorStop(1, '#15803d');
        this.ctx.fillStyle = landGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(x + 60, y);
        this.ctx.quadraticCurveTo(x + 100, y + 40, x + 110, y + 100);
        this.ctx.quadraticCurveTo(x + 120, y + 180, x + 80, y + 280);
        this.ctx.quadraticCurveTo(x + 40, y + 280, x + 20, y + 220);
        this.ctx.quadraticCurveTo(x, y + 150, x + 20, y + 80);
        this.ctx.quadraticCurveTo(x + 30, y + 20, x + 60, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // 标签
        this.drawElegantLandLabel(x + 60, y + 140, '南美洲');
    }
    
    // 精致亚洲澳洲
    drawElegantAsiaAustralia(x, y) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowOffsetY = 5;
        
        // 亚洲
        const asiaGrad = this.ctx.createLinearGradient(x, y, x + 120, y + 100);
        asiaGrad.addColorStop(0, '#22c55e');
        asiaGrad.addColorStop(1, '#16a34a');
        this.ctx.fillStyle = asiaGrad;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 100, y);
        this.ctx.lineTo(x + 140, y + 60);
        this.ctx.lineTo(x + 120, y + 140);
        this.ctx.lineTo(x + 60, y + 160);
        this.ctx.lineTo(x + 20, y + 100);
        this.ctx.lineTo(x + 40, y + 30);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 澳洲
        this.ctx.fillStyle = '#15803d';
        this.ctx.beginPath();
        this.ctx.ellipse(x + 80, y + 200, 35, 50, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 标签
        this.drawElegantLandLabel(x + 80, y + 80, '亚洲/澳洲');
    }
    
    // 大陆标签
    drawElegantLandLabel(x, y, text) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.beginPath();
        this.ctx.roundRect(x - 40, y - 12, 80, 24, 12);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, x, y + 4);
    }
    
    // 精致暖池（可切换东向扩展）
    drawElegantWarmPool(x, y, width, height, mode) {
        if (mode === 'eastward') {
            // 厄尔尼诺：向东扩展的暖水
            const warmGrad = this.ctx.createLinearGradient(x, y, x + width, y);
            warmGrad.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
            warmGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
            warmGrad.addColorStop(1, 'rgba(239, 68, 68, 0.8)');
            this.ctx.fillStyle = warmGrad;
            
            // 发光效果
            this.ctx.save();
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = 30;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, width, height, 15);
            this.ctx.fill();
            this.ctx.restore();
            
            // 暖水标签
            this.drawFloatingLabel(x + width / 2, y + height / 2, '🔥 暖水东扩', '#ef4444');
        } else {
            // 正常：西侧暖池
            const warmGrad = this.ctx.createRadialGradient(x + 100, y + height / 2, 30, x + 100, y + height / 2, 200);
            warmGrad.addColorStop(0, 'rgba(239, 68, 68, 0.7)');
            warmGrad.addColorStop(0.5, 'rgba(239, 68, 68, 0.4)');
            warmGrad.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
            this.ctx.fillStyle = warmGrad;
            
            this.ctx.save();
            this.ctx.shadowColor = '#ef4444';
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.roundRect(x, y, width, height, 15);
            this.ctx.fill();
            this.ctx.restore();
            
            // 暖池标签
            this.drawFloatingLabel(x + width / 2, y + height / 2, '🔥 西太平洋暖池', '#ef4444');
            
            // 东侧冷水上升区
            const coldGrad = this.ctx.createRadialGradient(x + width + 150, y + height / 2, 20, x + width + 150, y + height / 2, 150);
            coldGrad.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
            coldGrad.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
            this.ctx.fillStyle = coldGrad;
            this.ctx.beginPath();
            this.ctx.roundRect(x + width + 50, y, 250, height, 15);
            this.ctx.fill();
            
            this.drawFloatingLabel(x + width + 175, y + height / 2, '❄️ 东太平洋冷水', '#3b82f6');
        }
    }
    
    // 精致信风
    drawElegantTradeWinds(x1, y1, x2, y2, mode) {
        const isWeak = mode === 'weak';
        
        this.ctx.save();
        this.ctx.strokeStyle = isWeak ? 'rgba(251, 191, 36, 0.5)' : '#fbbf24';
        this.ctx.lineWidth = isWeak ? 2 : 4;
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.shadowBlur = isWeak ? 5 : 15;
        this.ctx.setLineDash(isWeak ? [8, 8] : []);
        
        // 箭头路径
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo((x1 + x2) / 2, y1 - 20, x2, y2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
        
        // 箭头头部
        const angle = Math.atan2(y2 - y1, x2 - x1);
        this.drawArrowHead(x2, y2, angle, '#fbbf24');
        
        // 标签
        if (isWeak) {
            this.ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
            this.ctx.font = '12px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('信风减弱', (x1 + x2) / 2, y1 - 30);
        }
    }
    
    // 精致秘鲁寒流
    drawElegantHumboldtCurrent() {
        // 寒流路径（发光蓝色）
        this.ctx.save();
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 5;
        this.ctx.shadowColor = '#3b82f6';
        this.ctx.shadowBlur = 20;
        this.ctx.beginPath();
        this.ctx.moveTo(850, 350);
        this.ctx.quadraticCurveTo(820, 300, 820, 250);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 箭头
        this.drawArrowHead(820, 250, -Math.PI / 2, '#3b82f6');
        
        // 标签
        this.drawFloatingLabel(850, 380, '❄️ 秘鲁寒流', '#3b82f6');
    }
    
    // 效果卡片
    drawElegantEffectCard(x, y, effects, color) {
        const width = 150;
        const height = effects.length * 28 + 20;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        // 左侧装饰条
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 4, height, [12, 0, 0, 12]);
        this.ctx.fill();
        
        // 效果列表
        effects.forEach((effect, i) => {
            const itemY = y + 22 + i * 28;
            
            // 图标
            this.ctx.fillStyle = color;
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(effect.icon, x + 12, itemY);
            
            // 文字
            this.ctx.fillStyle = '#1e293b';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(effect.text, x + 32, itemY);
        });
    }
    
    // 精致图例
    drawElegantElNinoLegend() {
        const x = 30;
        const y = 100;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 160, 120, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        // 标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🌊 图例', x + 15, y + 25);
        
        // 暖水
        this.ctx.fillStyle = '#ef4444';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 15, y + 40, 20, 12, 4);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '11px Arial';
        this.ctx.fillText('暖水区', x + 42, y + 50);
        
        // 冷水
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.roundRect(x + 15, y + 65, 20, 12, 4);
        this.ctx.fill();
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('冷水区', x + 42, y + 75);
        
        // 信风
        this.ctx.strokeStyle = '#fbbf24';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + 95);
        this.ctx.lineTo(x + 35, y + 95);
        this.ctx.stroke();
        this.drawArrowHead(x + 35, y + 95, 0, '#fbbf24');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('信风', x + 42, y + 98);
    }
    
    drawChapter5Thermohaline() {
        // 获取当前实验状态
        const temp = this.experimentState.temperature || 15;
        const salinity = this.experimentState.salinity || 35;
        
        // 计算密度 (简化公式)
        let density = 1025 + 0.8 * (salinity - 35) - 0.2 * (temp - 15);
        density = Math.max(1010, Math.min(1040, density));
        
        // 实验室背景
        const labGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
        labGrad.addColorStop(0, '#1e293b');
        labGrad.addColorStop(0.5, '#0f172a');
        labGrad.addColorStop(1, '#020617');
        this.ctx.fillStyle = labGrad;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制实验水槽
        this.drawExperimentTank(temp, salinity, density);
        
        // 绘制密度对比图（左右两侧）
        this.drawDensityComparison(temp, salinity, density);
        
        // 绘制实验说明面板
        this.drawExperimentInstructions(temp, salinity, density);
        
        // 绘制结论提示
        this.drawExperimentConclusions(density);
    }
    
    // 实验水槽可视化
    drawExperimentTank(temp, salinity, density) {
        const tankX = 250;
        const tankY = 80;
        const tankW = 400;
        const tankH = 320;
        
        // 水槽外框（玻璃效果）
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(14, 165, 233, 0.5)';
        this.ctx.shadowBlur = 30;
        this.ctx.strokeStyle = 'rgba(14, 165, 233, 0.8)';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(tankX, tankY, tankW, tankH);
        this.ctx.restore();
        
        // 水槽背景
        this.ctx.fillStyle = 'rgba(6, 182, 212, 0.1)';
        this.ctx.fillRect(tankX, tankY, tankW, tankH);
        
        // 根据温度计算水体颜色
        const tempRatio = Math.max(0, Math.min(1, (temp + 2) / 37));
        const waterColor = this.interpolateColor('#1e40af', '#ef4444', tempRatio);
        
        // 水体渐变（根据密度调整）
        const densityRatio = (density - 1010) / 30; // 0-1
        const waterAlpha = 0.3 + densityRatio * 0.4;
        
        // 绘制水体
        this.ctx.fillStyle = this.hexToRgba(waterColor, waterAlpha);
        this.ctx.beginPath();
        this.ctx.roundRect(tankX + 4, tankY + 4, tankW - 8, tankH - 8, 8);
        this.ctx.fill();
        
        // 绘制水流动画（根据密度决定方向）
        this.drawWaterFlowAnimation(tankX, tankY, tankW, tankH, density);
        
        // 水槽标签
        this.ctx.fillStyle = '#7dd3fc';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧪 实验水槽', tankX + tankW / 2, tankY + tankH + 25);
        
        // 温盐数值显示
        this.ctx.fillStyle = 'white';
        this.ctx.font = '12px Arial';
        this.ctx.fillText(`${temp}°C | ${salinity}‰`, tankX + tankW / 2, tankY + tankH + 42);
    }
    
    // 水流动画
    drawWaterFlowAnimation(tankX, tankY, tankW, tankH, density) {
        const t = this.animationFrame * 0.02;
        const flowSpeed = density > 1030 ? 2 : density < 1020 ? 2 : 0.5;
        const flowDirection = density > 1025 ? 'down' : density < 1025 ? 'up' : 'neutral';
        
        // 绘制流动粒子
        for (let i = 0; i < 20; i++) {
            let px, py;
            
            if (flowDirection === 'down') {
                // 高密度：粒子向下沉降
                px = tankX + 80 + (i % 4) * 80 + Math.sin(t + i * 0.5) * 15;
                py = tankY + 40 + ((t * flowSpeed + i * 20) % (tankH - 80));
            } else if (flowDirection === 'up') {
                // 低密度：粒子向上升
                px = tankX + 80 + (i % 4) * 80 + Math.sin(t + i * 0.5) * 15;
                py = tankY + tankH - 40 - ((t * flowSpeed + i * 20) % (tankH - 80));
            } else {
                // 中性：缓慢对流
                const side = i % 2 === 0 ? 1 : -1;
                px = tankX + tankW / 2 + side * (60 + (i % 3) * 50) + Math.sin(t + i) * 20;
                py = tankY + 80 + ((t * 0.3 + i * 30) % (tankH - 160));
            }
            
            // 粒子颜色（根据温度）
            const tempRatio = Math.max(0, Math.min(1, ((this.experimentState.temperature || 15) + 2) / 37));
            const r = Math.floor(30 + tempRatio * 209);
            const g = Math.floor(64 + tempRatio * 35);
            const b = Math.floor(175 - tempRatio * 96);
            
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
            this.ctx.beginPath();
            this.ctx.arc(px, py, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // 粒子尾迹
            if (flowDirection !== 'neutral') {
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(px, py);
                if (flowDirection === 'down') {
                    this.ctx.lineTo(px, py - 15);
                } else {
                    this.ctx.lineTo(px, py + 15);
                }
                this.ctx.stroke();
            }
        }
        
        // 大箭头指示整体流向（纯视觉，无文字标签）
        const arrowColor = flowDirection === 'down' ? '#ef4444' : flowDirection === 'up' ? '#3b82f6' : '#fbbf24';
        this.ctx.save();
        this.ctx.strokeStyle = arrowColor;
        this.ctx.lineWidth = 4;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        
        if (flowDirection === 'down') {
            // 向下的大箭头（红色 = 高密度）
            this.ctx.moveTo(tankX + tankW + 20, tankY + 40);
            this.ctx.lineTo(tankX + tankW + 20, tankY + tankH - 40);
            this.ctx.stroke();
            this.drawArrowHead(tankX + tankW + 20, tankY + tankH - 40, Math.PI / 2, arrowColor);
        } else if (flowDirection === 'up') {
            // 向上的大箭头（蓝色 = 低密度）
            this.ctx.moveTo(tankX + tankW + 20, tankY + tankH - 40);
            this.ctx.lineTo(tankX + tankW + 20, tankY + 40);
            this.ctx.stroke();
            this.drawArrowHead(tankX + tankW + 20, tankY + 40, -Math.PI / 2, arrowColor);
        } else {
            // 中性状态（黄色，无箭头）
            this.ctx.moveTo(tankX + tankW + 20, tankY + tankH / 2 - 30);
            this.ctx.lineTo(tankX + tankW + 20, tankY + tankH / 2 + 30);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
        this.ctx.restore();
    }
    
    // 密度对比图（左右两侧显示参考）
    drawDensityComparison(temp, salinity, density) {
        // 左侧：参考密度标尺
        const scaleX = 30;
        const scaleY = 100;
        const scaleH = 300;
        
        // 标尺背景
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.8)';
        this.ctx.beginPath();
        this.ctx.roundRect(scaleX - 10, scaleY - 30, 120, scaleH + 60, 12);
        this.ctx.fill();
        
        // 标尺标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('📊 密度标尺', scaleX + 50, scaleY - 12);
        
        // 绘制渐变密度条
        const barGrad = this.ctx.createLinearGradient(0, scaleY + scaleH, 0, scaleY);
        barGrad.addColorStop(0, '#3b82f6'); // 低密度蓝色
        barGrad.addColorStop(0.5, '#22c55e'); // 中密度绿色
        barGrad.addColorStop(1, '#ef4444'); // 高密度红色
        
        this.ctx.fillStyle = barGrad;
        this.ctx.fillRect(scaleX + 30, scaleY, 25, scaleH);
        
        // 刻度标记
        const densities = [1010, 1020, 1025, 1030, 1040];
        this.ctx.fillStyle = 'white';
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'left';
        densities.forEach(d => {
            const y = scaleY + scaleH - ((d - 1010) / 30) * scaleH;
            this.ctx.fillRect(scaleX + 55, y - 1, 8, 2);
            this.ctx.fillText(d.toString(), scaleX + 68, y + 3);
        });
        
        // 当前密度指示器
        const currentY = scaleY + scaleH - ((density - 1010) / 30) * scaleH;
        this.ctx.fillStyle = '#fcd34d';
        this.ctx.beginPath();
        this.ctx.moveTo(scaleX + 20, currentY - 8);
        this.ctx.lineTo(scaleX + 30, currentY);
        this.ctx.lineTo(scaleX + 20, currentY + 8);
        this.ctx.fill();
        
        // 右侧：对比参照物
        const refX = 750;
        
        // 对比卡片
        const refs = [
            { name: '🧊 极地海水', t: -2, s: 38, d: 1028, color: '#3b82f6' },
            { name: '☀️ 热带海水', t: 30, s: 36, d: 1022, color: '#f59e0b' },
            { name: '🧊 冰川融水', t: 5, s: 15, d: 1015, color: '#06b6d4' }
        ];
        
        refs.forEach((ref, i) => {
            const y = 100 + i * 90;
            const isCurrent = Math.abs(density - ref.d) < 3;
            
            // 卡片背景
            this.ctx.fillStyle = isCurrent ? 'rgba(251, 191, 36, 0.3)' : 'rgba(30, 41, 59, 0.8)';
            this.ctx.beginPath();
            this.ctx.roundRect(refX, y, 140, 75, 10);
            this.ctx.fill();
            
            if (isCurrent) {
                this.ctx.strokeStyle = '#fbbf24';
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
            }
            
            // 参照物信息
            this.ctx.fillStyle = isCurrent ? '#fbbf24' : ref.color;
            this.ctx.font = 'bold 11px Arial';
            this.ctx.textAlign = 'left';
            this.ctx.fillText(ref.name, refX + 12, y + 20);
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(`${ref.t}°C | ${ref.s}‰`, refX + 12, y + 38);
            this.ctx.fillText(`密度: ${ref.d} kg/m³`, refX + 12, y + 55);
            
            if (isCurrent) {
                this.ctx.fillStyle = '#fbbf24';
                this.ctx.font = 'bold 10px Arial';
                this.ctx.fillText('👈 当前接近', refX + 12, y + 68);
            }
        });
    }
    
    // 实验说明面板
    drawExperimentInstructions(temp, salinity, density) {
        // 标题栏
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(250, 15, 400, 50, 12);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧪 温盐环流实验室', 450, 35);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('调节温度和盐度，观察密度变化和水流运动', 450, 52);
    }
    
    // 实验结论提示 - 纯探究问题，无直接结论
    drawExperimentConclusions(density) {
        const conclusionY = 430;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, conclusionY, 800, 50, 12);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '13px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 探究：观察粒子运动方向和箭头颜色，温度和盐度如何影响水的运动？', 450, conclusionY + 28);
    }
    
    // 颜色插值
    interpolateColor(color1, color2, ratio) {
        const r1 = parseInt(color1.slice(1, 3), 16);
        const g1 = parseInt(color1.slice(3, 5), 16);
        const b1 = parseInt(color1.slice(5, 7), 16);
        
        const r2 = parseInt(color2.slice(1, 3), 16);
        const g2 = parseInt(color2.slice(3, 5), 16);
        const b2 = parseInt(color2.slice(5, 7), 16);
        
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // hex转rgba
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    
    // 深海粒子
    drawDeepSeaParticles() {
        for (let i = 0; i < 30; i++) {
            const x = ((this.animationFrame * 0.5 + i * 123) % 900);
            const y = ((i * 89) % 500);
            const size = 2 + (i % 3);
            const alpha = 0.3 + (Math.sin((this.animationFrame + i * 10) * 0.05) * 0.2);
            
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // 精致世界大陆
    drawElegantWorldContinents() {
        // 北美
        this.drawElegantContinent(50, 60, [
            { x: 0, y: 20 }, { x: 60, y: 0 }, { x: 140, y: 10 },
            { x: 160, y: 60 }, { x: 140, y: 120 }, { x: 100, y: 140 },
            { x: 40, y: 130 }, { x: 0, y: 100 }
        ], '#22c55e');
        
        // 南美
        this.drawElegantContinent(130, 230, [
            { x: 20, y: 0 }, { x: 80, y: 10 }, { x: 90, y: 60 },
            { x: 70, y: 140 }, { x: 40, y: 160 }, { x: 10, y: 130 },
            { x: 0, y: 60 }
        ], '#16a34a');
        
        // 欧洲
        this.drawElegantContinent(340, 40, [
            { x: 0, y: 30 }, { x: 40, y: 0 }, { x: 100, y: 10 },
            { x: 120, y: 50 }, { x: 100, y: 90 }, { x: 50, y: 100 },
            { x: 10, y: 80 }
        ], '#22c55e');
        
        // 非洲
        this.drawElegantContinent(340, 160, [
            { x: 10, y: 0 }, { x: 90, y: 10 }, { x: 110, y: 80 },
            { x: 90, y: 160 }, { x: 50, y: 180 }, { x: 20, y: 160 },
            { x: 0, y: 80 }
        ], '#16a34a');
        
        // 亚洲
        this.drawElegantContinent(480, 30, [
            { x: 0, y: 40 }, { x: 60, y: 0 }, { x: 180, y: 10 },
            { x: 220, y: 50 }, { x: 200, y: 110 }, { x: 150, y: 130 },
            { x: 80, y: 120 }, { x: 20, y: 100 }
        ], '#22c55e');
        
        // 澳洲
        this.drawElegantContinent(620, 260, [
            { x: 0, y: 20 }, { x: 70, y: 0 }, { x: 100, y: 30 },
            { x: 90, y: 70 }, { x: 50, y: 80 }, { x: 10, y: 60 }
        ], '#15803d');
        
        // 南极
        this.ctx.save();
        this.ctx.fillStyle = '#e2e8f0';
        this.ctx.beginPath();
        this.ctx.roundRect(0, 420, 900, 80, 0);
        this.ctx.fill();
        this.ctx.fillStyle = '#64748b';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🧊 南极冰盖', 450, 465);
        this.ctx.restore();
    }
    
    // 精致大陆绘制
    drawElegantContinent(baseX, baseY, points, color) {
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowOffsetY = 8;
        
        const landGrad = this.ctx.createLinearGradient(baseX, baseY, baseX + 100, baseY + 100);
        landGrad.addColorStop(0, color);
        landGrad.addColorStop(0.5, this.adjustColor(color, -20));
        landGrad.addColorStop(1, this.adjustColor(color, -40));
        this.ctx.fillStyle = landGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(baseX + points[0].x, baseY + points[0].y);
        for (let i = 1; i < points.length; i++) {
            const p = points[i];
            const prev = points[i - 1];
            const cpX = baseX + (prev.x + p.x) / 2;
            const cpY = baseY + (prev.y + p.y) / 2 - 10;
            this.ctx.quadraticCurveTo(cpX, cpY, baseX + p.x, baseY + p.y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
    }
    
    // 颜色调整辅助函数
    adjustColor(color, amount) {
        // 简化的颜色调整，实际应用中可以使用更复杂的颜色处理
        return color;
    }
    
    // 精致表层暖流
    drawElegantSurfaceCurrent() {
        const path = [
            { x: 200, y: 320 },
            { x: 280, y: 260 },
            { x: 380, y: 200 },
            { x: 500, y: 170 },
            { x: 620, y: 190 },
            { x: 720, y: 240 },
            { x: 780, y: 300 }
        ];
        
        // 发光效果
        this.ctx.save();
        this.ctx.shadowColor = '#ef4444';
        this.ctx.shadowBlur = 25;
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            const cpX = (path[i-1].x + path[i].x) / 2;
            const cpY = (path[i-1].y + path[i].y) / 2 - 15;
            this.ctx.quadraticCurveTo(cpX, cpY, path[i].x, path[i].y);
        }
        this.ctx.stroke();
        this.ctx.restore();
        
        // 主线条
        this.ctx.strokeStyle = '#fca5a5';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            const cpX = (path[i-1].x + path[i].x) / 2;
            const cpY = (path[i-1].y + path[i].y) / 2 - 15;
            this.ctx.quadraticCurveTo(cpX, cpY, path[i].x, path[i].y);
        }
        this.ctx.stroke();
        
        // 终点箭头
        const last = path[path.length - 1];
        const prev = path[path.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        this.drawArrowHead(last.x, last.y, angle, '#ef4444');
        
        // 标签
        this.drawFloatingLabel(500, 140, '🔥 表层暖流（墨西哥湾暖流）', '#ef4444');
    }
    
    // 精致深层冷流
    drawElegantDeepCurrent() {
        const path = [
            { x: 750, y: 340 },
            { x: 680, y: 380 },
            { x: 550, y: 400 },
            { x: 400, y: 390 },
            { x: 280, y: 360 },
            { x: 200, y: 300 }
        ];
        
        // 发光效果（虚线）
        this.ctx.save();
        this.ctx.shadowColor = '#3b82f6';
        this.ctx.shadowBlur = 20;
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 6;
        this.ctx.setLineDash([12, 8]);
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            const cpX = (path[i-1].x + path[i].x) / 2;
            const cpY = (path[i-1].y + path[i].y) / 2 + 15;
            this.ctx.quadraticCurveTo(cpX, cpY, path[i].x, path[i].y);
        }
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.ctx.restore();
        
        // 终点箭头
        const last = path[path.length - 1];
        const prev = path[path.length - 2];
        const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
        this.drawArrowHead(last.x, last.y, angle, '#3b82f6');
        
        // 标签
        this.drawFloatingLabel(500, 420, '❄️ 深层冷流', '#3b82f6');
    }
    
    // 精致下沉区
    drawElegantSinkingZone(x, y) {
        // 3D球体效果
        const gradient = this.ctx.createRadialGradient(x - 8, y - 8, 2, x, y, 25);
        gradient.addColorStop(0, '#93c5fd');
        gradient.addColorStop(0.5, '#3b82f6');
        gradient.addColorStop(1, '#1e40af');
        
        this.ctx.save();
        this.ctx.shadowColor = '#3b82f6';
        this.ctx.shadowBlur = 25;
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 22, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
        
        // 下沉箭头
        this.drawVerticalArrow(x, y - 40, x, y - 25, '#3b82f6', 'down');
        
        // 标签
        this.drawFloatingLabel(x, y - 55, '⬇️ 冷水下沉', '#3b82f6');
    }
    
    // 精致上涌区
    drawElegantUpwellingZone(x, y) {
        // 上涌效果（渐变圆）
        const gradient = this.ctx.createRadialGradient(x, y - 10, 5, x, y, 30);
        gradient.addColorStop(0, 'rgba(14, 165, 233, 0.8)');
        gradient.addColorStop(0.5, 'rgba(14, 165, 233, 0.4)');
        gradient.addColorStop(1, 'rgba(14, 165, 233, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 30, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 上涌箭头
        this.drawVerticalArrow(x, y + 25, x, y + 40, '#0ea5e9', 'up');
        
        // 标签
        this.drawFloatingLabel(x, y + 55, '⬆️ 深层水上涌', '#0ea5e9');
    }
    
    // 垂直箭头
    drawVerticalArrow(x1, y1, x2, y2, color, direction) {
        this.ctx.save();
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
        
        // 箭头头部
        const angle = direction === 'down' ? Math.PI / 2 : -Math.PI / 2;
        this.drawArrowHead(x2, y2, angle, color);
    }
    
    // 信息卡片
    drawThermohalineInfoCards() {
        // 左侧：形成机制
        this.drawElegantInfoCard(20, 100, '🧊 形成机制', [
            '高纬度海水冷却',
            '盐度增加密度变大',
            '海水下沉形成深层流'
        ], '#3b82f6', 160);
        
        // 右侧：全球影响
        this.drawElegantInfoCard(720, 100, '🌍 全球影响', [
            '调节全球气候',
            '输送热量和养分',
            '影响海洋生态系统'
        ], '#ef4444', 160);
    }
    
    // 信息卡片
    drawElegantInfoCard(x, y, title, items, color, width) {
        const height = items.length * 22 + 50;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, height, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        // 顶部条
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, width, 28, [12, 12, 0, 0]);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, x + 12, y + 19);
        
        // 列表项
        this.ctx.fillStyle = '#1e293b';
        this.ctx.font = '12px Arial';
        items.forEach((item, i) => {
            this.ctx.fillText('• ' + item, x + 12, y + 48 + i * 22);
        });
    }
    
    // 精致图例
    drawElegantThermohalineLegend() {
        const x = 30;
        const y = 320;
        
        // 背景
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 15;
        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.95)';
        this.ctx.beginPath();
        this.ctx.roundRect(x, y, 160, 90, 12);
        this.ctx.fill();
        this.ctx.restore();
        
        // 标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('🌊 环流图例', x + 15, y + 25);
        
        // 表层暖流
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + 45);
        this.ctx.lineTo(x + 45, y + 45);
        this.ctx.stroke();
        this.drawArrowHead(x + 45, y + 45, 0, '#ef4444');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '11px Arial';
        this.ctx.fillText('表层暖流', x + 55, y + 49);
        
        // 深层冷流
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([6, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(x + 15, y + 70);
        this.ctx.lineTo(x + 45, y + 70);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        this.drawArrowHead(x + 45, y + 70, 0, '#3b82f6');
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.fillText('深层冷流', x + 55, y + 74);
    }
    
    // 世界地图基础 - 精致版本
    drawWorldMapBase() {
        // 海洋背景 - 深度渐变效果
        const gradient = this.ctx.createRadialGradient(450, 250, 50, 450, 250, 400);
        gradient.addColorStop(0, '#0ea5e9');
        gradient.addColorStop(0.5, '#0284c7');
        gradient.addColorStop(1, '#0c4a6e');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制海洋纹理（波浪效果）
        this.drawOceanTexture();
        
        // 绘制经纬网格
        this.drawGridLines();
        
        // 绘制精致的大陆轮廓
        this.drawDetailedContinents();
        
        // 赤道线
        this.drawEquatorLine();
    }
    
    // 海洋纹理
    drawOceanTexture() {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.08)';
        this.ctx.lineWidth = 1;
        
        // 绘制波浪纹理
        for (let i = 0; i < 900; i += 60) {
            for (let j = 0; j < 500; j += 40) {
                this.ctx.beginPath();
                this.ctx.moveTo(i, j);
                this.ctx.quadraticCurveTo(i + 15, j - 5, i + 30, j);
                this.ctx.quadraticCurveTo(i + 45, j + 5, i + 60, j);
                this.ctx.stroke();
            }
        }
    }
    
    // 经纬网格
    drawGridLines() {
        this.ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([3, 7]);
        
        // 纬线
        for (let y = 50; y < 500; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(900, y);
            this.ctx.stroke();
        }
        
        // 经线
        for (let x = 50; x < 900; x += 100) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, 500);
            this.ctx.stroke();
        }
        
        this.ctx.setLineDash([]);
    }
    
    // 赤道线
    drawEquatorLine() {
        this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([8, 4]);
        this.ctx.beginPath();
        this.ctx.moveTo(0, 250);
        this.ctx.lineTo(900, 250);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // 赤道标签
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.9)';
        this.ctx.font = 'bold 11px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('⬡ 赤道', 8, 254);
    }
    
    // 精致的大陆轮廓
    drawDetailedContinents() {
        // 大陆基础色
        const landColor = '#16a34a';
        const landHighlight = '#22c55e';
        const coastShadow = 'rgba(0,0,0,0.3)';
        
        // 绘制每个大陆
        this.drawNorthAmerica(landColor, landHighlight, coastShadow);
        this.drawSouthAmerica(landColor, landHighlight, coastShadow);
        this.drawEurope(landColor, landHighlight, coastShadow);
        this.drawAfrica(landColor, landHighlight, coastShadow);
        this.drawAsia(landColor, landHighlight, coastShadow);
        this.drawAustralia(landColor, landHighlight, coastShadow);
        this.drawAntarctica(landColor, landHighlight, coastShadow);
        
        // 添加大陆光影效果
        this.drawContinentLighting();
    }
    
    // 北美洲
    drawNorthAmerica(baseColor, highlightColor, shadowColor) {
        // 海岸线阴影
        this.ctx.fillStyle = shadowColor;
        this.drawNorthAmericaPath(52, 82);
        this.ctx.fill();
        
        // 大陆主体
        this.ctx.fillStyle = baseColor;
        this.drawNorthAmericaPath(50, 80);
        this.ctx.fill();
        
        // 高光
        this.ctx.fillStyle = highlightColor;
        this.drawNorthAmericaHighlight(50, 80);
        this.ctx.fill();
    }
    
    drawNorthAmericaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 30, offsetY + 20);
        this.ctx.quadraticCurveTo(offsetX + 80, offsetY + 10, offsetX + 110, offsetY + 30);
        this.ctx.quadraticCurveTo(offsetX + 120, offsetY + 60, offsetX + 115, offsetY + 90);
        this.ctx.quadraticCurveTo(offsetX + 100, offsetY + 110, offsetX + 85, offsetY + 100);
        this.ctx.quadraticCurveTo(offsetX + 70, offsetY + 130, offsetX + 75, offsetY + 160);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 140, offsetX + 50, offsetY + 110);
        this.ctx.quadraticCurveTo(offsetX + 30, offsetY + 100, offsetX + 20, offsetY + 70);
        this.ctx.quadraticCurveTo(offsetX + 15, offsetY + 40, offsetX + 30, offsetY + 20);
        this.ctx.closePath();
    }
    
    drawNorthAmericaHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 40, offsetY + 35);
        this.ctx.quadraticCurveTo(offsetX + 70, offsetY + 25, offsetX + 90, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 85, offsetY + 60, offsetX + 70, offsetY + 55);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 65, offsetX + 40, offsetY + 50);
        this.ctx.quadraticCurveTo(offsetX + 35, offsetY + 40, offsetX + 40, offsetY + 35);
        this.ctx.closePath();
    }
    
    // 南美洲
    drawSouthAmerica(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawSouthAmericaPath(102, 282);
        this.ctx.fill();
        
        this.ctx.fillStyle = baseColor;
        this.drawSouthAmericaPath(100, 280);
        this.ctx.fill();
        
        this.ctx.fillStyle = highlightColor;
        this.drawSouthAmericaHighlight(100, 280);
        this.ctx.fill();
    }
    
    drawSouthAmericaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 40, offsetY + 15);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 10, offsetX + 55, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 70, offsetY + 80, offsetX + 65, offsetY + 130);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 170, offsetX + 35, offsetY + 160);
        this.ctx.quadraticCurveTo(offsetX + 25, offsetY + 120, offsetX + 30, offsetY + 80);
        this.ctx.quadraticCurveTo(offsetX + 20, offsetY + 40, offsetX + 40, offsetY + 15);
        this.ctx.closePath();
    }
    
    drawSouthAmericaHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 35, offsetY + 30);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 25, offsetX + 48, offsetY + 50);
        this.ctx.quadraticCurveTo(offsetX + 45, offsetY + 80, offsetX + 40, offsetY + 70);
        this.ctx.quadraticCurveTo(offsetX + 35, offsetY + 50, offsetX + 35, offsetY + 30);
        this.ctx.closePath();
    }
    
    // 欧洲
    drawEurope(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawEuropePath(382, 62);
        this.ctx.fill();
        
        this.ctx.fillStyle = baseColor;
        this.drawEuropePath(380, 60);
        this.ctx.fill();
        
        this.ctx.fillStyle = highlightColor;
        this.drawEuropeHighlight(380, 60);
        this.ctx.fill();
    }
    
    drawEuropePath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 15, offsetY + 25);
        this.ctx.quadraticCurveTo(offsetX + 40, offsetY + 10, offsetX + 70, offsetY + 20);
        this.ctx.quadraticCurveTo(offsetX + 75, offsetY + 45, offsetX + 65, offsetY + 60);
        this.ctx.quadraticCurveTo(offsetX + 45, offsetY + 65, offsetX + 25, offsetY + 55);
        this.ctx.quadraticCurveTo(offsetX + 10, offsetY + 40, offsetX + 15, offsetY + 25);
        this.ctx.closePath();
    }
    
    drawEuropeHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 30, offsetY + 30);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 25, offsetX + 55, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 45, offsetY + 50, offsetX + 35, offsetY + 45);
        this.ctx.quadraticCurveTo(offsetX + 25, offsetY + 40, offsetX + 30, offsetY + 30);
        this.ctx.closePath();
    }
    
    // 非洲
    drawAfrica(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawAfricaPath(382, 162);
        this.ctx.fill();
        
        this.ctx.fillStyle = baseColor;
        this.drawAfricaPath(380, 160);
        this.ctx.fill();
        
        this.ctx.fillStyle = highlightColor;
        this.drawAfricaHighlight(380, 160);
        this.ctx.fill();
    }
    
    drawAfricaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 20, offsetY + 15);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 10, offsetX + 80, offsetY + 25);
        this.ctx.quadraticCurveTo(offsetX + 90, offsetY + 70, offsetX + 80, offsetY + 120);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 190, offsetX + 45, offsetY + 180);
        this.ctx.quadraticCurveTo(offsetX + 30, offsetY + 140, offsetX + 25, offsetY + 100);
        this.ctx.quadraticCurveTo(offsetX + 10, offsetY + 60, offsetX + 20, offsetY + 15);
        this.ctx.closePath();
    }
    
    drawAfricaHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 35, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 35, offsetX + 65, offsetY + 70);
        this.ctx.quadraticCurveTo(offsetX + 55, offsetY + 110, offsetX + 45, offsetY + 100);
        this.ctx.quadraticCurveTo(offsetX + 40, offsetY + 70, offsetX + 35, offsetY + 40);
        this.ctx.closePath();
    }
    
    // 亚洲
    drawAsia(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawAsiaPath(502, 52);
        this.ctx.fill();
        
        this.ctx.fillStyle = baseColor;
        this.drawAsiaPath(500, 50);
        this.ctx.fill();
        
        this.ctx.fillStyle = highlightColor;
        this.drawAsiaHighlight(500, 50);
        this.ctx.fill();
    }
    
    drawAsiaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 30, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 80, offsetY + 15, offsetX + 150, offsetY + 25);
        this.ctx.quadraticCurveTo(offsetX + 220, offsetY + 30, offsetX + 245, offsetY + 50);
        this.ctx.quadraticCurveTo(offsetX + 240, offsetY + 90, offsetX + 220, offsetY + 120);
        this.ctx.quadraticCurveTo(offsetX + 180, offsetY + 140, offsetX + 150, offsetY + 130);
        this.ctx.quadraticCurveTo(offsetX + 120, offsetY + 150, offsetX + 100, offsetY + 140);
        this.ctx.quadraticCurveTo(offsetX + 70, offsetY + 160, offsetX + 50, offsetY + 140);
        this.ctx.quadraticCurveTo(offsetX + 30, offsetY + 100, offsetX + 40, offsetY + 70);
        this.ctx.quadraticCurveTo(offsetX + 20, offsetY + 55, offsetX + 30, offsetY + 40);
        this.ctx.closePath();
    }
    
    drawAsiaHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 60, offsetY + 60);
        this.ctx.quadraticCurveTo(offsetX + 120, offsetY + 45, offsetX + 180, offsetY + 55);
        this.ctx.quadraticCurveTo(offsetX + 200, offsetY + 80, offsetX + 180, offsetY + 100);
        this.ctx.quadraticCurveTo(offsetX + 140, offsetY + 110, offsetX + 100, offsetY + 105);
        this.ctx.quadraticCurveTo(offsetX + 70, offsetY + 115, offsetX + 60, offsetY + 90);
        this.ctx.quadraticCurveTo(offsetX + 55, offsetY + 70, offsetX + 60, offsetY + 60);
        this.ctx.closePath();
    }
    
    // 澳洲
    drawAustralia(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawAustraliaPath(702, 322);
        this.ctx.fill();
        
        this.ctx.fillStyle = baseColor;
        this.drawAustraliaPath(700, 320);
        this.ctx.fill();
        
        this.ctx.fillStyle = highlightColor;
        this.drawAustraliaHighlight(700, 320);
        this.ctx.fill();
    }
    
    drawAustraliaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 20, offsetY + 25);
        this.ctx.quadraticCurveTo(offsetX + 50, offsetY + 15, offsetX + 80, offsetY + 25);
        this.ctx.quadraticCurveTo(offsetX + 95, offsetY + 45, offsetX + 85, offsetY + 65);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 75, offsetX + 35, offsetY + 70);
        this.ctx.quadraticCurveTo(offsetX + 15, offsetY + 55, offsetX + 20, offsetY + 25);
        this.ctx.closePath();
    }
    
    drawAustraliaHighlight(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 35, offsetY + 35);
        this.ctx.quadraticCurveTo(offsetX + 60, offsetY + 30, offsetX + 70, offsetY + 40);
        this.ctx.quadraticCurveTo(offsetX + 65, offsetY + 55, offsetX + 50, offsetY + 55);
        this.ctx.quadraticCurveTo(offsetX + 40, offsetY + 50, offsetX + 35, offsetY + 35);
        this.ctx.closePath();
    }
    
    // 南极洲
    drawAntarctica(baseColor, highlightColor, shadowColor) {
        this.ctx.fillStyle = shadowColor;
        this.drawAntarcticaPath(2, 452);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#e0f2fe';
        this.drawAntarcticaPath(0, 450);
        this.ctx.fill();
        
        // 冰雪纹理
        this.ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(50, 460);
        this.ctx.lineTo(850, 460);
        this.ctx.stroke();
    }
    
    drawAntarcticaPath(offsetX, offsetY) {
        this.ctx.beginPath();
        this.ctx.moveTo(offsetX + 50, offsetY + 20);
        this.ctx.quadraticCurveTo(offsetX + 200, offsetY + 5, offsetX + 450, offsetY + 10);
        this.ctx.quadraticCurveTo(offsetX + 700, offsetY + 5, offsetX + 850, offsetY + 20);
        this.ctx.quadraticCurveTo(offsetX + 820, offsetY + 45, offsetX + 700, offsetY + 48);
        this.ctx.quadraticCurveTo(offsetX + 450, offsetY + 50, offsetX + 200, offsetY + 48);
        this.ctx.quadraticCurveTo(offsetX + 80, offsetY + 45, offsetX + 50, offsetY + 20);
        this.ctx.closePath();
    }
    
    // 大陆光影效果
    drawContinentLighting() {
        // 为大陆添加细微的边缘光
        this.ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        this.ctx.lineWidth = 1;
        
        // 北美北缘
        this.ctx.beginPath();
        this.ctx.moveTo(80, 90);
        this.ctx.quadraticCurveTo(160, 80, 160, 100);
        this.ctx.stroke();
        
        // 亚洲北缘
        this.ctx.beginPath();
        this.ctx.moveTo(580, 60);
        this.ctx.quadraticCurveTo(700, 55, 750, 70);
        this.ctx.stroke();
    }
    
    // 精致标题绘制
    drawMapTitle(title, subtitle) {
        // 标题背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.roundRect(250, 8, 400, 32, 8);
        this.ctx.fill();
        
        // 标题发光效果
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 主标题
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, 450, 30);
        
        this.ctx.shadowBlur = 0;
        
        // 副标题背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.beginPath();
        this.ctx.roundRect(200, 460, 500, 28, 6);
        this.ctx.fill();
        
        // 副标题
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(subtitle, 450, 478);
    }
    
    // 方向指示器 - 带背景圆圈
    drawDirectionIndicator(x, y, direction) {
        const symbol = direction === 'clockwise' ? '↻' : '↺';
        
        // 外圈发光
        this.ctx.save();
        this.ctx.shadowColor = '#fbbf24';
        this.ctx.shadowBlur = 15;
        
        // 背景圆圈
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.3)';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 8, 20, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
        
        // 内圈
        this.ctx.fillStyle = 'rgba(251, 191, 36, 0.5)';
        this.ctx.beginPath();
        this.ctx.arc(x, y - 8, 16, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 符号
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 28px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(symbol, x, y - 6);
    }
    
    // 绘制曲线箭头 - 精致版本带发光效果
    drawCurvedArrow(x1, y1, cx, cy, x2, y2, showHead = true, isWarm = true) {
        const color = this.ctx.strokeStyle;
        
        // 绘制发光效果（外圈）
        this.ctx.save();
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 8;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;
        
        // 主线条
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo(cx, cy, x2, y2);
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // 绘制内部高亮线
        this.ctx.save();
        this.ctx.strokeStyle = isWarm ? '#ffcccc' : '#cce5ff';
        this.ctx.lineWidth = Math.max(1, this.ctx.lineWidth - 2);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.quadraticCurveTo(cx, cy, x2, y2);
        this.ctx.stroke();
        this.ctx.restore();
        
        if (showHead) {
            const angle = Math.atan2(y2 - cy, x2 - cx);
            const headLen = 14;
            
            // 箭头发光
            this.ctx.save();
            this.ctx.shadowColor = color;
            this.ctx.shadowBlur = 6;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fillStyle = color;
            this.ctx.fill();
            this.ctx.restore();
            
            // 箭头高亮
            this.ctx.beginPath();
            this.ctx.moveTo(x2, y2);
            this.ctx.lineTo(x2 - headLen * 0.7 * Math.cos(angle - Math.PI / 6), y2 - headLen * 0.7 * Math.sin(angle - Math.PI / 6));
            this.ctx.lineTo(x2 - headLen * 0.7 * Math.cos(angle + Math.PI / 6), y2 - headLen * 0.7 * Math.sin(angle + Math.PI / 6));
            this.ctx.closePath();
            this.ctx.fillStyle = isWarm ? '#ffeeee' : '#eef6ff';
            this.ctx.fill();
        }
    }
    
    // ========== 第5章气候变化可视化 ==========
    drawChapter5ClimateChange() {
        // 获取当前变暖程度
        const warming = this.experimentState.globalWarming || 0;
        
        // 计算各项参数
        const glacierMelt = warming * 560;
        const salinity = Math.max(20, 35 - warming * 3);
        const strength = Math.max(20, 100 - warming * 16);
        const warmingPercent = (warming / 5) * 100;
        
        // 背景（根据变暖程度改变颜色）
        const bgGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
        if (warming < 2) {
            bgGrad.addColorStop(0, '#0c4a6e');
            bgGrad.addColorStop(1, '#083344');
        } else if (warming < 4) {
            bgGrad.addColorStop(0, '#7c2d12');
            bgGrad.addColorStop(1, '#451a03');
        } else {
            bgGrad.addColorStop(0, '#450a0a');
            bgGrad.addColorStop(1, '#1a0505');
        }
        this.ctx.fillStyle = bgGrad;
        this.ctx.fillRect(0, 0, 900, 500);
        
        // 绘制格陵兰冰川
        this.drawGreenlandGlacier(warming, glacierMelt);
        
        // 绘制大西洋环流系统
        this.drawAtlanticCirculation(strength, salinity);
        
        // 绘制欧洲气候影响
        this.drawEuropeImpact(strength);
        
        // 绘制数据面板
        this.drawClimateDataPanel(warming, glacierMelt, salinity, strength);
        
        // 绘制标题
        this.drawClimateTitle(warming);
        
        // 绘制底部结论
        this.drawClimateConclusion(warming, strength);
    }
    
    // 绘制格陵兰冰川
    drawGreenlandGlacier(warming, meltRate) {
        const glacierX = 150;
        const glacierY = 50;
        const glacierW = 200;
        const glacierH = 150;
        
        // 冰川基础（随融化减少）
        const remainingPercent = Math.max(20, 100 - warming * 15);
        const remainingH = glacierH * (remainingPercent / 100);
        
        // 冰川颜色（随融化变暗：亮蓝→灰→深灰）
        const iceColor = warming < 2 ? '#e0f2fe' : warming < 4 ? '#94a3b8' : '#64748b';
        
        // 绘制冰川主体
        this.ctx.save();
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
        this.ctx.shadowBlur = 20;
        
        const iceGrad = this.ctx.createLinearGradient(glacierX, glacierY, glacierX, glacierY + remainingH);
        iceGrad.addColorStop(0, iceColor);
        iceGrad.addColorStop(1, '#94a3b8');
        this.ctx.fillStyle = iceGrad;
        
        this.ctx.beginPath();
        this.ctx.moveTo(glacierX + glacierW / 2, glacierY);
        this.ctx.quadraticCurveTo(glacierX + glacierW, glacierY + 30, glacierX + glacierW, glacierY + remainingH / 2);
        this.ctx.quadraticCurveTo(glacierX + glacierW - 20, glacierY + remainingH, glacierX + glacierW / 2, glacierY + remainingH);
        this.ctx.quadraticCurveTo(glacierX + 20, glacierY + remainingH, glacierX, glacierY + remainingH / 2);
        this.ctx.quadraticCurveTo(glacierX, glacierY + 30, glacierX + glacierW / 2, glacierY);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.restore();
        
        // 融化水流效果（随变暖增强）
        if (warming > 0) {
            this.drawMeltwaterFlow(glacierX + glacierW / 2, glacierY + remainingH, warming);
        }
    }
    
    // 融化水流效果
    drawMeltwaterFlow(x, y, warming) {
        const t = this.animationFrame * 0.03;
        const flowIntensity = warming * 3;
        
        this.ctx.strokeStyle = `rgba(14, 165, 233, ${0.3 + warming * 0.1})`;
        this.ctx.lineWidth = 2 + warming;
        this.ctx.lineCap = 'round';
        
        for (let i = 0; i < flowIntensity; i++) {
            const startX = x + Math.sin(t + i * 0.5) * 30;
            const endY = y + 50 + (t * 20 + i * 15) % 100;
            
            this.ctx.beginPath();
            this.ctx.moveTo(startX, y);
            this.ctx.quadraticCurveTo(startX + Math.sin(t * 2 + i) * 20, y + 30, startX, endY);
            this.ctx.stroke();
            
            // 水滴
            this.ctx.fillStyle = 'rgba(14, 165, 233, 0.6)';
            this.ctx.beginPath();
            this.ctx.arc(startX, endY, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    // 绘制大西洋环流系统
    drawAtlanticCirculation(strength, salinity) {
        const centerX = 450;
        const centerY = 250;
        const radius = 100;
        
        // 绘制环流路径（随强度变暗、变慢）
        const flowOpacity = strength / 100;
        const flowColor = strength > 50 ? '#fbbf24' : strength > 30 ? '#f59e0b' : '#7c2d12';
        
        // 环流箭头动画速度随强度降低
        const t = this.animationFrame * (0.02 * flowOpacity);
        
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 / 8) * i + t;
            const x1 = centerX + Math.cos(angle) * (radius - 20);
            const y1 = centerY + Math.sin(angle) * (radius - 20);
            const x2 = centerX + Math.cos(angle) * (radius + 20);
            const y2 = centerY + Math.sin(angle) * (radius + 20);
            
            this.ctx.strokeStyle = flowColor;
            this.ctx.lineWidth = 3 * flowOpacity;
            this.ctx.lineCap = 'round';
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
            
            // 箭头头部
            const headAngle = angle + Math.PI / 2;
            this.drawArrowHead(x2, y2, headAngle, flowColor);
        }
        
        // 环流强度数值（仅数据，无结论文字）
        this.ctx.fillStyle = strength > 50 ? '#fbbf24' : strength > 30 ? '#f59e0b' : '#ef4444';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(`${Math.round(strength)}%`, centerX, centerY + 5);
        
        // 下沉区（北大西洋）- 随盐度降低而变小变暗
        const sinkingX = centerX - 100;
        const sinkingY = centerY - 50;
        const sinkingOpacity = (salinity - 20) / 15 * flowOpacity;
        const sinkingSize = 25 * sinkingOpacity;
        
        this.ctx.fillStyle = `rgba(59, 130, 246, ${sinkingOpacity})`;
        this.ctx.beginPath();
        this.ctx.arc(sinkingX, sinkingY, Math.max(5, sinkingSize), 0, Math.PI * 2);
        this.ctx.fill();
        
        // 上涌区（南大西洋）- 随强度降低而变暗
        const upwellingX = centerX + 100;
        const upwellingY = centerY + 50;
        this.ctx.fillStyle = `rgba(14, 165, 233, ${0.3 + flowOpacity * 0.4})`;
        this.ctx.beginPath();
        this.ctx.arc(upwellingX, upwellingY, 20, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    // 绘制欧洲气候影响 - 纯视觉变化，无文字结论
    drawEuropeImpact(strength) {
        const europeX = 720;
        const europeY = 120;
        
        // 欧洲大陆颜色随环流强度变化（绿→黄→红→灰）
        let europeColor;
        if (strength > 80) europeColor = '#22c55e';      // 绿色 - 温暖
        else if (strength > 60) europeColor = '#84cc16'; // 浅绿
        else if (strength > 50) europeColor = '#f59e0b'; // 橙色 - 变冷
        else if (strength > 40) europeColor = '#f97316'; // 深橙
        else if (strength > 30) europeColor = '#ef4444'; // 红色 - 寒冷
        else europeColor = '#64748b';                     // 灰色 - 严寒
        
        this.ctx.fillStyle = europeColor;
        this.ctx.beginPath();
        this.ctx.roundRect(europeX, europeY, 140, 180, 10);
        this.ctx.fill();
        
        // 欧洲标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌍 欧洲', europeX + 70, europeY + 25);
        
        // 温度计可视化（柱状图）
        const thermometerHeight = 100;
        const tempPercent = strength / 100;
        const filledHeight = thermometerHeight * tempPercent;
        
        // 温度计外框
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.roundRect(europeX + 20, europeY + 40, 20, thermometerHeight, 10);
        this.ctx.stroke();
        
        // 温度计填充（随温度变化颜色）
        const tempColor = strength > 60 ? '#ef4444' : strength > 40 ? '#f59e0b' : strength > 20 ? '#3b82f6' : '#1e40af';
        this.ctx.fillStyle = tempColor;
        this.ctx.beginPath();
        this.ctx.roundRect(europeX + 22, europeY + 40 + thermometerHeight - filledHeight, 16, filledHeight, 8);
        this.ctx.fill();
        
        // 温度图标（纯符号，无文字）
        let weatherSymbol = '';
        if (strength > 80) weatherSymbol = '☀️';
        else if (strength > 60) weatherSymbol = '🌤️';
        else if (strength > 40) weatherSymbol = '☁️';
        else if (strength > 20) weatherSymbol = '❄️';
        else weatherSymbol = '🧊';
        
        this.ctx.font = '35px Arial';
        this.ctx.fillText(weatherSymbol, europeX + 95, europeY + 85);
        
        // 数据数值（仅百分比）
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.fillText(`${Math.round(strength)}`, europeX + 95, europeY + 125);
        this.ctx.font = '10px Arial';
        this.ctx.fillStyle = 'rgba(255,255,255,0.7)';
        this.ctx.fillText('%', europeX + 95, europeY + 140);
    }
    
    // 绘制数据面板 - 仅数值，无结论文字
    drawClimateDataPanel(warming, glacierMelt, salinity, strength) {
        const panelX = 50;
        const panelY = 250;
        
        // 面板背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(panelX, panelY, 180, 180, 12);
        this.ctx.fill();
        
        // 标题
        this.ctx.fillStyle = '#fbbf24';
        this.ctx.font = 'bold 13px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('📊 数据监测', panelX + 15, panelY + 25);
        
        // 各项指标（仅数值，无状态描述）
        const items = [
            { label: '全球变暖', value: `+${warming.toFixed(1)}°C`, y: 0 },
            { label: '冰川融化', value: `${Math.round(glacierMelt)} Gt/年`, y: 1 },
            { label: '北大西洋盐度', value: `${salinity.toFixed(1)}‰`, y: 2 },
            { label: '大西洋环流', value: `${Math.round(strength)}%`, y: 3 }
        ];
        
        items.forEach((item) => {
            const y = panelY + 50 + item.y * 32;
            
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.font = '11px Arial';
            this.ctx.fillText(item.label, panelX + 15, y);
            
            this.ctx.fillStyle = '#7dd3fc';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(item.value, panelX + 15, y + 16);
        });
    }
    
    // 绘制标题 - 无状态描述
    drawClimateTitle(warming) {
        const titleColor = warming < 2 ? '#22c55e' : warming < 4 ? '#f59e0b' : '#ef4444';
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.beginPath();
        this.ctx.roundRect(250, 15, 400, 50, 12);
        this.ctx.fill();
        
        this.ctx.fillStyle = titleColor;
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🌍 冰川融化与洋流实验', 450, 40);
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('观察数据变化，推断其中的科学规律', 450, 55);
    }
    
    // 绘制底部 - 无结论，仅提示
    drawClimateConclusion(warming, strength) {
        const conclusionY = 450;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        this.ctx.beginPath();
        this.ctx.roundRect(50, conclusionY, 800, 45, 10);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('🔍 探究问题：冰川融化量、海水盐度、洋流强度、欧洲温度之间有什么关系？', 450, conclusionY + 28);
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
