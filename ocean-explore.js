// 探究式学习系统
class OceanExploreSystem {
    constructor() {
        this.canvas = document.getElementById('explore-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        
        // 当前状态
        this.currentChapter = 0;
        this.currentTask = 0;
        this.completedChapters = [];
        
        // 章节进度
        this.chapterProgress = {
            1: { unlocked: true, completed: false, tasks: [] },
            2: { unlocked: false, completed: false, tasks: [] },
            3: { unlocked: false, completed: false, tasks: [] },
            4: { unlocked: false, completed: false, tasks: [] }
        };
        
        // 观察数据
        this.observations = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadProgress();
        this.showChapterSelect();
    }
    
    setupEventListeners() {
        // 返回按钮
        document.getElementById('back-btn').addEventListener('click', () => {
            if (confirm('确定要返回吗？当前进度将不会保存。')) {
                window.location.href = 'ocean-select.html';
            }
        });
        
        // 章节卡片点击
        document.querySelectorAll('.chapter-card').forEach(card => {
            card.addEventListener('click', () => {
                const chapter = parseInt(card.dataset.chapter);
                if (this.chapterProgress[chapter].unlocked) {
                    this.startChapter(chapter);
                }
            });
        });
        
        // 提交答案
        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });
        
        // 下一个任务
        document.getElementById('next-task-btn').addEventListener('click', () => {
            this.nextTask();
        });
        
        // 下一章
        document.getElementById('next-chapter-btn').addEventListener('click', () => {
            this.nextChapter();
        });
        
        // 返回章节选择
        document.getElementById('back-to-chapters-btn').addEventListener('click', () => {
            this.showChapterSelect();
        });
    }
    
    showChapterSelect() {
        document.getElementById('chapter-select').classList.remove('hidden');
        document.getElementById('task-screen').classList.add('hidden');
        document.getElementById('chapter-complete').classList.add('hidden');
        
        // 更新章节卡片状态
        this.updateChapterCards();
    }
    
    updateChapterCards() {
        document.querySelectorAll('.chapter-card').forEach(card => {
            const chapter = parseInt(card.dataset.chapter);
            const progress = this.chapterProgress[chapter];
            
            if (progress.unlocked) {
                card.classList.remove('locked');
            } else {
                card.classList.add('locked');
            }
        });
    }
    
    startChapter(chapter) {
        this.currentChapter = chapter;
        this.currentTask = 0;
        this.observations = [];
        
        document.getElementById('chapter-select').classList.add('hidden');
        document.getElementById('task-screen').classList.remove('hidden');
        
        // 更新进度条
        document.getElementById('progress-fill').style.width = '0%';
        
        // 加载章节任务
        this.loadChapterTasks(chapter);
        this.showTask(0);
    }
    
    loadChapterTasks(chapter) {
        // 第1章：观察与发现
        if (chapter === 1) {
            this.tasks = [
                {
                    title: '任务1：测量海水温度',
                    type: 'measurement',
                    instruction: '点击地图上不同颜色的海域，测量它们的温度',
                    question: '你发现红色海域和蓝色海域的温度有什么不同？',
                    summary: '通过测量，你发现：<br>• 红色海域的水温比周围海水<strong>高</strong><br>• 蓝色海域的水温比周围海水<strong>低</strong><br>• 这就是<strong>暖流</strong>和<strong>寒流</strong>的温度特征'
                },
                {
                    title: '任务2：观察洋流流向',
                    type: 'observation',
                    instruction: '观察地图上洋流的流动方向（箭头表示）',
                    question: '暖流和寒流的流向有什么规律？',
                    summary: '通过观察，你发现：<br>• 暖流从<strong>低纬度</strong>流向<strong>高纬度</strong><br>• 寒流从<strong>高纬度</strong>流向<strong>低纬度</strong><br>• 洋流的流向与温度变化有关'
                },
                {
                    title: '任务3：推理洋流定义',
                    type: 'reasoning',
                    instruction: '根据前面的观察，思考暖流和寒流的定义',
                    question: '你能用自己的话定义什么是暖流和寒流吗？',
                    summary: '你总结出：<br>• <strong>暖流</strong>：从水温高的海区流向水温低的海区<br>• <strong>寒流</strong>：从水温低的海区流向水温高的海区<br>• 关键是<strong>相对温度</strong>，而不是绝对温度'
                },
                {
                    title: '任务4：预测气候影响',
                    type: 'prediction',
                    instruction: '思考暖流和寒流对沿岸气候的影响',
                    question: '如果一个地区沿岸有暖流经过，你认为会对气候产生什么影响？',
                    summary: '你推理出：<br>• 暖流会使沿岸气候<strong>增温加湿</strong><br>• 寒流会使沿岸气候<strong>降温减湿</strong><br>• 洋流是影响气候的重要因素'
                },
                {
                    title: '任务5：案例验证',
                    type: 'case',
                    instruction: '用真实案例验证你的推理',
                    question: '英国和加拿大纽芬兰岛纬度相近，但英国更温暖。根据洋流知识，你能解释原因吗？',
                    summary: '案例分析：<br>• 英国受<strong>北大西洋暖流</strong>影响，气候温暖湿润<br>• 纽芬兰受<strong>拉布拉多寒流</strong>影响，气候寒冷<br>• 这验证了洋流对气候的重要影响'
                }
            ];
        }
        // 其他章节待实现
    }
    
    showTask(taskIndex) {
        if (taskIndex >= this.tasks.length) {
            this.completeChapter();
            return;
        }
        
        this.currentTask = taskIndex;
        const task = this.tasks[taskIndex];
        
        // 更新UI
        document.getElementById('task-title').textContent = task.title;
        document.getElementById('task-number').textContent = `${taskIndex + 1}/${this.tasks.length}`;
        document.getElementById('thinking-question').textContent = task.question;
        document.getElementById('chapter-title').textContent = `第${this.currentChapter}章：任务${taskIndex + 1}`;
        
        // 更新进度条
        const progress = ((taskIndex) / this.tasks.length) * 100;
        document.getElementById('progress-fill').style.width = progress + '%';
        
        // 清空输入
        document.getElementById('answer-input').value = '';
        
        // 隐藏总结，显示思考区
        document.getElementById('summary-area').classList.add('hidden');
        document.getElementById('thinking-area').classList.remove('hidden');
        
        // 清空观察记录
        document.getElementById('observation-log').innerHTML = '';
        
        // 根据任务类型加载互动内容
        this.loadTaskInteraction(task);
    }
    
    loadTaskInteraction(task) {
        const controlsPanel = document.getElementById('controls-panel');
        
        if (task.type === 'measurement') {
            // 测量任务
            controlsPanel.innerHTML = `
                <h4>🌡️ 温度计</h4>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">
                    ${task.instruction}
                </p>
                <div class="control-item">
                    <div id="temp-display" style="background: #dbeafe; padding: 15px; border-radius: 8px; text-align: center;">
                        <div style="font-size: 12px; color: #1e40af;">当前测量</div>
                        <div style="font-size: 24px; color: #1e3a8a; font-weight: bold;">--°C</div>
                    </div>
                </div>
                <div class="control-item">
                    <button onclick="game.measureTemperature('warm')">测量红色海域</button>
                </div>
                <div class="control-item">
                    <button onclick="game.measureTemperature('cold')">测量蓝色海域</button>
                </div>
                <div class="control-item">
                    <button onclick="game.measureTemperature('normal')">测量周围海水</button>
                </div>
            `;
            
            this.drawMeasurementMap();
        } else if (task.type === 'observation') {
            // 观察任务
            controlsPanel.innerHTML = `
                <h4>🔍 观察工具</h4>
                <p style="font-size: 13px; color: #64748b; margin-bottom: 15px;">
                    ${task.instruction}
                </p>
                <div class="control-item">
                    <button onclick="game.observeFlow('north')">观察北半球</button>
                </div>
                <div class="control-item">
                    <button onclick="game.observeFlow('south')">观察南半球</button>
                </div>
            `;
            
            this.drawFlowMap();
        } else {
            // 其他类型任务
            controlsPanel.innerHTML = `
                <h4>💭 思考提示</h4>
                <p style="font-size: 13px; color: #64748b; line-height: 1.6;">
                    ${task.instruction}
                </p>
            `;
            
            this.drawThinkingMap();
        }
    }
    
    drawMeasurementMap() {
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制暖流区域（红色）
        this.ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
        this.ctx.fillRect(100, 100, 250, 300);
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(100, 100, 250, 300);
        
        // 标签
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 20px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('红色海域', 225, 260);
        
        // 绘制寒流区域（蓝色）
        this.ctx.fillStyle = 'rgba(59, 130, 246, 0.4)';
        this.ctx.fillRect(550, 100, 250, 300);
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(550, 100, 250, 300);
        
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('蓝色海域', 675, 260);
    }
    
    drawFlowMap() {
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制北半球洋流（顺时针）
        this.ctx.strokeStyle = '#ef4444';
        this.ctx.lineWidth = 4;
        this.ctx.beginPath();
        this.ctx.arc(250, 150, 80, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 箭头
        this.drawArrow(this.ctx, 330, 150, 350, 150, '#ef4444');
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('北半球', 250, 150);
        this.ctx.fillText('(顺时针)', 250, 170);
        
        // 绘制南半球洋流（逆时针）
        this.ctx.strokeStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(650, 150, 80, 0, Math.PI * 2);
        this.ctx.stroke();
        
        this.drawArrow(this.ctx, 570, 150, 550, 150, '#3b82f6');
        
        this.ctx.fillStyle = 'white';
        this.ctx.fillText('南半球', 650, 150);
        this.ctx.fillText('(逆时针)', 650, 170);
    }
    
    drawThinkingMap() {
        this.ctx.fillStyle = '#0ea5e9';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('💭 思考时间', this.canvas.width / 2, this.canvas.height / 2);
    }
    
    drawArrow(ctx, fromX, fromY, toX, toY, color) {
        const headlen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(toX, toY);
        ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
    
    measureTemperature(type) {
        const temps = {
            warm: { temp: 28, desc: '红色海域温度：28°C（比周围海水高8°C）' },
            cold: { temp: 5, desc: '蓝色海域温度：5°C（比周围海水低15°C）' },
            normal: { temp: 20, desc: '周围海水温度：20°C（基准温度）' }
        };
        
        const data = temps[type];
        document.querySelector('#temp-display div:last-child').textContent = data.temp + '°C';
        
        this.addObservation(data.desc);
    }
    
    observeFlow(hemisphere) {
        const flows = {
            north: '北半球洋流呈顺时针方向流动',
            south: '南半球洋流呈逆时针方向流动'
        };
        
        this.addObservation(flows[hemisphere]);
    }
    
    addObservation(text) {
        this.observations.push(text);
        const log = document.getElementById('observation-log');
        const item = document.createElement('div');
        item.className = 'observation-item';
        item.textContent = `📌 ${text}`;
        log.appendChild(item);
    }
    
    submitAnswer() {
        const answer = document.getElementById('answer-input').value.trim();
        
        if (answer.length < 10) {
            alert('请写下更详细的想法（至少10个字）');
            return;
        }
        
        // 显示总结
        const task = this.tasks[this.currentTask];
        document.getElementById('summary-content').innerHTML = task.summary;
        document.getElementById('thinking-area').classList.add('hidden');
        document.getElementById('summary-area').classList.remove('hidden');
        
        // 记录完成
        this.chapterProgress[this.currentChapter].tasks.push({
            taskIndex: this.currentTask,
            answer: answer,
            observations: [...this.observations]
        });
    }
    
    nextTask() {
        this.showTask(this.currentTask + 1);
    }
    
    completeChapter() {
        this.chapterProgress[this.currentChapter].completed = true;
        
        // 解锁下一章
        if (this.currentChapter < 4) {
            this.chapterProgress[this.currentChapter + 1].unlocked = true;
        }
        
        // 保存进度
        this.saveProgress();
        
        // 显示完成界面
        document.getElementById('task-screen').classList.add('hidden');
        document.getElementById('chapter-complete').classList.remove('hidden');
        
        // 生成学习总结
        this.generateLearningSummary();
        
        // 更新进度条
        document.getElementById('progress-fill').style.width = '100%';
    }
    
    generateLearningSummary() {
        const summaries = {
            1: `
                <ul style="list-style: none; padding: 0;">
                    <li style="margin-bottom: 12px;">✅ 理解了暖流和寒流的温度特征</li>
                    <li style="margin-bottom: 12px;">✅ 掌握了洋流的流向规律</li>
                    <li style="margin-bottom: 12px;">✅ 能够定义暖流和寒流的概念</li>
                    <li style="margin-bottom: 12px;">✅ 了解了洋流对气候的影响</li>
                    <li style="margin-bottom: 12px;">✅ 学会用洋流知识解释实际现象</li>
                </ul>
            `
        };
        
        document.getElementById('learning-summary').innerHTML = summaries[this.currentChapter] || '恭喜完成本章学习！';
    }
    
    nextChapter() {
        if (this.currentChapter < 4 && this.chapterProgress[this.currentChapter + 1].unlocked) {
            this.startChapter(this.currentChapter + 1);
        } else {
            this.showChapterSelect();
        }
    }
    
    saveProgress() {
        localStorage.setItem('oceanExploreProgress', JSON.stringify(this.chapterProgress));
    }
    
    loadProgress() {
        const saved = localStorage.getItem('oceanExploreProgress');
        if (saved) {
            this.chapterProgress = JSON.parse(saved);
        }
    }
}

// 启动系统
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new OceanExploreSystem();
});
