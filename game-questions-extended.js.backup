// 扩展题库 - 每个场景25-50题，按题型分类
const EXTENDED_QUESTION_BANK = {
    // ========== 企鹅 - 南极场景题库 ==========
    antarctica_ice_sheet: [
        // 地形识别题 (10题)
        { question: '南极冰盖表面的波浪状起伏地貌称为？', options: ['A. 冰丘', 'B. 冰原', 'C. 冰川槽谷', 'D. 冰架'], correct: 'A', type: '地形识别' },
        { question: '南极冰盖中的裂缝主要是由什么形成的？', options: ['A. 地震', 'B. 冰川运动', 'C. 风力侵蚀', 'D. 融水冲刷'], correct: 'B', type: '地形识别' },
        { question: '南极冰盖最厚的地方厚度可达？', options: ['A. 1000米', 'B. 2000米', 'C. 4000米以上', 'D. 500米'], correct: 'C', type: '地形识别' },
        { question: '冰盖表面的蓝冰区形成原因是？', options: ['A. 冰层压实', 'B. 海水冻结', 'C. 人工染色', 'D. 矿物质沉积'], correct: 'A', type: '地形识别' },
        { question: '南极冰盖下方隐藏着什么地形？', options: ['A. 平原', 'B. 山脉和盆地', 'C. 沙漠', 'D. 森林'], correct: 'B', type: '地形识别' },
        { question: '冰盖边缘的冰崖高度通常有？', options: ['A. 10-20米', 'B. 50-100米', 'C. 200-300米', 'D. 500米以上'], correct: 'B', type: '地形识别' },
        { question: '南极冰盖占全球淡水资源的比例约为？', options: ['A. 30%', 'B. 50%', 'C. 70%', 'D. 90%'], correct: 'C', type: '地形识别' },
        { question: '冰盖表面的雪层密度从上到下如何变化？', options: ['A. 逐渐增大', 'B. 逐渐减小', 'C. 保持不变', 'D. 先增后减'], correct: 'A', type: '地形识别' },
        { question: '南极冰盖的冰龄最老可达？', options: ['A. 1万年', 'B. 10万年', 'C. 80万年以上', 'D. 100年'], correct: 'C', type: '地形识别' },
        { question: '冰盖表面的风吹雪现象最常见于？', options: ['A. 夏季', 'B. 冬季', 'C. 春季', 'D. 秋季'], correct: 'B', type: '地形识别' },
        
        // 气候分析题 (10题)
        { question: '南极冰盖中心年降水量不足50mm，但冰层很厚，主要原因是？', options: ['A. 蒸发量极小', 'B. 降雪频繁', 'C. 地下水补给', 'D. 海水冻结'], correct: 'A', type: '气候分析' },
        { question: '南极冰盖地区的年平均气温约为？', options: ['A. -10°C', 'B. -25°C', 'C. -40°C', 'D. -55°C'], correct: 'D', type: '气候分析' },
        { question: '南极为什么比北极更冷？', options: ['A. 纬度更高', 'B. 海拔更高', 'C. 洋流影响', 'D. 植被更少'], correct: 'B', type: '气候分析' },
        { question: '南极冰盖地区的风速可达？', options: ['A. 20米/秒', 'B. 50米/秒', 'C. 80米/秒以上', 'D. 10米/秒'], correct: 'C', type: '气候分析' },
        { question: '南极的极昼现象持续时间约为？', options: ['A. 1个月', 'B. 3个月', 'C. 6个月', 'D. 9个月'], correct: 'C', type: '气候分析' },
        { question: '南极冰盖反射太阳辐射的比例（反照率）约为？', options: ['A. 30%', 'B. 50%', 'C. 70%', 'D. 90%'], correct: 'D', type: '气候分析' },
        { question: '南极内陆降水稀少的主要原因是？', options: ['A. 距海远', 'B. 气温低水汽少', 'C. 地势高', 'D. 风力大'], correct: 'B', type: '气候分析' },
        { question: '南极冰盖地区的湿度特点是？', options: ['A. 极度干燥', 'B. 非常湿润', 'C. 适中', 'D. 变化大'], correct: 'A', type: '气候分析' },
        { question: '南极冰盖上空的臭氧层破坏最严重的季节是？', options: ['A. 夏季', 'B. 冬季', 'C. 春季', 'D. 秋季'], correct: 'C', type: '气候分析' },
        { question: '南极冰盖地区的气压特点是？', options: ['A. 高压', 'B. 低压', 'C. 正常', 'D. 变化剧烈'], correct: 'A', type: '气候分析' },
        
        // 区位判断题 (10题)
        { question: '南极冰盖主要位于哪个板块？', options: ['A. 太平洋板块', 'B. 南极洲板块', 'C. 印度洋板块', 'D. 非洲板块'], correct: 'B', type: '区位判断' },
        { question: '东南极冰盖和西南极冰盖的分界线是？', options: ['A. 南极半岛', 'B. 横贯南极山脉', 'C. 罗斯海', 'D. 威德尔海'], correct: 'B', type: '区位判断' },
        { question: '南极冰盖的最高点海拔约为？', options: ['A. 2000米', 'B. 3000米', 'C. 4000米', 'D. 5000米'], correct: 'C', type: '区位判断' },
        { question: '南极冰盖覆盖的陆地面积约为？', options: ['A. 500万km²', 'B. 1000万km²', 'C. 1400万km²', 'D. 2000万km²'], correct: 'C', type: '区位判断' },
        { question: '南极点位于南极冰盖的？', options: ['A. 边缘', 'B. 中心附近', 'C. 东侧', 'D. 西侧'], correct: 'B', type: '区位判断' },
        { question: '南极冰盖距离最近的大陆是？', options: ['A. 非洲', 'B. 南美洲', 'C. 澳大利亚', 'D. 亚洲'], correct: 'B', type: '区位判断' },
        { question: '南极冰盖周围的海洋统称为？', options: ['A. 北冰洋', 'B. 南大洋', 'C. 太平洋', 'D. 大西洋'], correct: 'B', type: '区位判断' },
        { question: '中国在南极冰盖附近建立的科考站是？', options: ['A. 长城站', 'B. 中山站', 'C. 昆仑站', 'D. 泰山站'], correct: 'C', type: '区位判断' },
        { question: '南极冰盖完全位于哪个纬度圈以南？', options: ['A. 南极圈', 'B. 南回归线', 'C. 赤道', 'D. 60°S'], correct: 'D', type: '区位判断' },
        { question: '南极冰盖的冰川主要流向？', options: ['A. 向内陆', 'B. 向海洋', 'C. 向北', 'D. 向南'], correct: 'B', type: '区位判断' },
        
        // 人地关系题 (10题)
        { question: '科考站为什么多建在南极边缘而非内陆？', options: ['A. 风景好', 'B. 气温较高便于生活', 'C. 地势平坦', 'D. 交通便利'], correct: 'B', type: '人地关系' },
        { question: '《南极条约》规定南极洲用于？', options: ['A. 军事基地', 'B. 和平与科学研究', 'C. 商业开发', 'D. 旅游观光'], correct: 'B', type: '人地关系' },
        { question: '南极科考的最佳季节是？', options: ['A. 极夜期', 'B. 极昼期', 'C. 春季', 'D. 秋季'], correct: 'B', type: '人地关系' },
        { question: '南极冰盖融化对全球的主要影响是？', options: ['A. 气温下降', 'B. 海平面上升', 'C. 降水增加', 'D. 风力减弱'], correct: 'B', type: '人地关系' },
        { question: '南极科考站的能源主要来自？', options: ['A. 煤炭', 'B. 石油', 'C. 风能和太阳能', 'D. 核能'], correct: 'C', type: '人地关系' },
        { question: '保护南极环境的措施不包括？', options: ['A. 禁止开采矿产', 'B. 限制游客数量', 'C. 大规模建设城市', 'D. 严格垃圾处理'], correct: 'C', type: '人地关系' },
        { question: '南极冰芯研究可以了解？', options: ['A. 古气候变化', 'B. 地震活动', 'C. 火山喷发', 'D. 海洋生物'], correct: 'A', type: '人地关系' },
        { question: '南极科考人员需要特别注意的健康问题是？', options: ['A. 中暑', 'B. 冻伤', 'C. 晒伤', 'D. 蚊虫叮咬'], correct: 'B', type: '人地关系' },
        { question: '南极旅游应遵循的原则是？', options: ['A. 随意活动', 'B. 最小环境影响', 'C. 大量采集标本', 'D. 建设永久设施'], correct: 'B', type: '人地关系' },
        { question: '南极冰盖对全球气候的作用是？', options: ['A. 调节气温', 'B. 制造降雨', 'C. 产生台风', 'D. 引发地震'], correct: 'A', type: '人地关系' },
        
        // 综合应用题 (10题)
        { question: '如果南极冰盖全部融化，全球海平面将上升约？', options: ['A. 10米', 'B. 30米', 'C. 60米', 'D. 100米'], correct: 'C', type: '综合应用' },
        { question: '南极冰盖的运动速度每年约为？', options: ['A. 几厘米', 'B. 几米', 'C. 几十米', 'D. 几百米'], correct: 'C', type: '综合应用' },
        { question: '南极冰盖下方发现的冰下湖泊有何科研价值？', options: ['A. 提供饮用水', 'B. 研究极端生命', 'C. 开发旅游', 'D. 养殖水产'], correct: 'B', type: '综合应用' },
        { question: '南极冰盖颜色呈蓝色的冰层说明？', options: ['A. 含有矿物质', 'B. 冰层古老且密实', 'C. 受到污染', 'D. 即将融化'], correct: 'B', type: '综合应用' },
        { question: '通过南极冰芯可以推断出什么信息？', options: ['A. 未来天气', 'B. 历史气候', 'C. 地震预报', 'D. 矿产分布'], correct: 'B', type: '综合应用' },
        { question: '南极冰盖对全球洋流的影响主要体现在？', options: ['A. 产生寒流', 'B. 阻挡暖流', 'C. 改变风向', 'D. 引发海啸'], correct: 'A', type: '综合应用' },
        { question: '南极冰盖的白色表面对地球的作用是？', options: ['A. 吸收热量', 'B. 反射太阳辐射', 'C. 产生氧气', 'D. 净化空气'], correct: 'B', type: '综合应用' },
        { question: '南极冰盖融化速度加快的主要原因是？', options: ['A. 火山活动', 'B. 全球变暖', 'C. 地震频发', 'D. 陨石撞击'], correct: 'B', type: '综合应用' },
        { question: '南极冰盖中保存的气泡可以告诉我们？', options: ['A. 古代大气成分', 'B. 未来气候', 'C. 地下矿产', 'D. 生物种类'], correct: 'A', type: '综合应用' },
        { question: '南极冰盖的存在对南半球气候的影响是？', options: ['A. 使气温升高', 'B. 使气温降低', 'C. 增加降水', 'D. 减少风力'], correct: 'B', type: '综合应用' }
    ],

    antarctica_peninsula: [
        // 地形识别题
        { question: '南极半岛是南极洲唯一伸出什么纬线的陆地？', options: ['A. 南回归线', 'B. 南极圈', 'C. 60°S', 'D. 赤道'], correct: 'B', type: '地形识别' },
        { question: '南极半岛的地形特点是？', options: ['A. 平原为主', 'B. 山地为主', 'C. 盆地为主', 'D. 高原为主'], correct: 'B', type: '地形识别' },
        { question: '南极半岛沿岸常见的地貌是？', options: ['A. 沙滩', 'B. 岩石海岸', 'C. 红树林', 'D. 珊瑚礁'], correct: 'B', type: '地形识别' },
        { question: '南极半岛的冰架主要分布在？', options: ['A. 山顶', 'B. 内陆', 'C. 沿海', 'D. 地下'], correct: 'C', type: '地形识别' },
        { question: '南极半岛的岩石裸露区称为？', options: ['A. 绿洲', 'B. 无冰区', 'C. 沙漠', 'D. 草原'], correct: 'B', type: '地形识别' },
        
        // 气候分析题
        { question: '南极半岛的气候相比南极内陆？', options: ['A. 更冷', 'B. 更温和', 'C. 相同', 'D. 更干燥'], correct: 'B', type: '气候分析' },
        { question: '南极半岛降水较多的原因是？', options: ['A. 纬度低', 'B. 靠近海洋', 'C. 地势高', 'D. 植被多'], correct: 'B', type: '气候分析' },
        { question: '南极半岛夏季气温可达？', options: ['A. 10°C以上', 'B. 0°C左右', 'C. -20°C', 'D. -40°C'], correct: 'B', type: '气候分析' },
        { question: '南极半岛受什么风带影响？', options: ['A. 信风', 'B. 西风', 'C. 极地东风', 'D. 季风'], correct: 'C', type: '气候分析' },
        { question: '南极半岛的冰架崩解主要发生在？', options: ['A. 冬季', 'B. 夏季', 'C. 春季', 'D. 秋季'], correct: 'B', type: '气候分析' },
        
        // 区位判断题
        { question: '南极半岛距离南美洲最近处约？', options: ['A. 100公里', 'B. 500公里', 'C. 1000公里', 'D. 2000公里'], correct: 'C', type: '区位判断' },
        { question: '南极半岛属于东南极还是西南极？', options: ['A. 东南极', 'B. 西南极', 'C. 都不是', 'D. 分界线'], correct: 'B', type: '区位判断' },
        { question: '南极半岛周围的海域是？', options: ['A. 罗斯海', 'B. 威德尔海', 'C. 别林斯高晋海', 'D. B和C'], correct: 'D', type: '区位判断' },
        { question: '中国长城站位于南极半岛的？', options: ['A. 乔治王岛', 'B. 罗斯岛', 'C. 南设得兰群岛', 'D. A和C'], correct: 'D', type: '区位判断' },
        { question: '南极半岛延伸方向大致为？', options: ['A. 南北向', 'B. 东西向', 'C. 东北-西南', 'D. 西北-东南'], correct: 'A', type: '区位判断' },
        
        // 人地关系题
        { question: '南极半岛科考站数量多的原因是？', options: ['A. 风景优美', 'B. 气候相对温和', 'C. 矿产丰富', 'D. 交通发达'], correct: 'B', type: '人地关系' },
        { question: '南极半岛的企鹅种类比内陆？', options: ['A. 更少', 'B. 更多', 'C. 相同', 'D. 没有企鹅'], correct: 'B', type: '人地关系' },
        { question: '南极半岛的冰架崩解对全球的影响是？', options: ['A. 海平面上升', 'B. 气温下降', 'C. 降水减少', 'D. 无影响'], correct: 'A', type: '人地关系' },
        { question: '南极半岛适合建站的季节是？', options: ['A. 极夜期', 'B. 极昼期', 'C. 全年', 'D. 春秋季'], correct: 'B', type: '人地关系' },
        { question: '保护南极半岛生态的措施包括？', options: ['A. 限制游客', 'B. 禁止捕鲸', 'C. 控制污染', 'D. 以上都是'], correct: 'D', type: '人地关系' },
        
        // 综合应用题
        { question: '南极半岛气候变暖速度比全球平均快，原因可能是？', options: ['A. 纬度低', 'B. 海洋影响大', 'C. 冰雪反馈', 'D. 人类活动'], correct: 'C', type: '综合应用' },
        { question: '南极半岛的无冰区面积变化趋势是？', options: ['A. 增加', 'B. 减少', 'C. 不变', 'D. 先增后减'], correct: 'A', type: '综合应用' },
        { question: '南极半岛的生物多样性相比内陆？', options: ['A. 更低', 'B. 更高', 'C. 相同', 'D. 没有生物'], correct: 'B', type: '综合应用' },
        { question: '南极半岛冰架崩解的主要驱动力是？', options: ['A. 地震', 'B. 海水温度上升', 'C. 火山', 'D. 陨石'], correct: 'B', type: '综合应用' },
        { question: '南极半岛对研究气候变化的价值在于？', options: ['A. 变化敏感', 'B. 数据丰富', 'C. 易于观测', 'D. 以上都是'], correct: 'D', type: '综合应用' }
    ],

    // 由于篇幅限制，这里只展示前两个场景的完整题库
    // 其他场景题库结构相同，每个场景50题，分5种题型，每种10题
    // 实际使用时需要补充完整所有25个场景的题库
};

// 导出题库
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EXTENDED_QUESTION_BANK;
}
