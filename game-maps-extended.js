// 扩展地图配置 - 5张地图，每个场景独特设计
const EXTENDED_MAP_TEMPLATES = {
    // ========== 企鹅 - 南极场景 ==========
    antarctica_ice_sheet: {
        name: '南极冰盖',
        description: '厚达数千米的冰盖覆盖着南极大陆',
        backgroundColor: '#e8f4f8',
        pathColor: '#c5e3ea',
        terrain: [
            { type: 'path', x: 50, y: 280, width: 1100, height: 40 },
            { type: 'ice_hill', x: 180, y: 180, width: 60, height: 80, questionId: 0 },
            { type: 'ice_crevasse', x: 380, y: 240, width: 50, height: 60, questionId: 1 },
            { type: 'ice_dome', x: 580, y: 200, width: 70, height: 70, questionId: 2 },
            { type: 'ice_ridge', x: 780, y: 220, width: 55, height: 65, questionId: 3 },
            { type: 'ice_formation', x: 980, y: 260, width: 50, height: 55, questionId: 4 },
            { type: 'snow_drift', x: 120, y: 380, width: 40, height: 30 },
            { type: 'ice_crystal', x: 320, y: 140, width: 25, height: 35 },
            { type: 'snow_patch', x: 520, y: 420, width: 45, height: 25 },
            { type: 'ice_shard', x: 720, y: 160, width: 30, height: 40 }
        ]
    },
    
    antarctica_peninsula: {
        name: '南极半岛',
        description: '南极洲唯一伸出南极圈的陆地',
        backgroundColor: '#d4e8f0',
        pathColor: '#b8d8e5',
        terrain: [
            { type: 'path', x: 50, y: 300, width: 1100, height: 35 },
            { type: 'rocky_cliff', x: 200, y: 200, width: 50, height: 90, questionId: 5 },
            { type: 'ice_shelf', x: 400, y: 250, width: 60, height: 70, questionId: 6 },
            { type: 'penguin_colony', x: 600, y: 220, width: 55, height: 75, questionId: 7 },
            { type: 'coastal_ice', x: 800, y: 240, width: 50, height: 65, questionId: 8 },
            { type: 'research_marker', x: 1000, y: 270, width: 45, height: 50, questionId: 9 },
            { type: 'rock_outcrop', x: 150, y: 400, width: 35, height: 25 },
            { type: 'ice_berg_small', x: 350, y: 150, width: 40, height: 50 }
        ]
    },
    
    ross_sea: {
        name: '罗斯海',
        description: '南极最大的边缘海，海冰广布',
        backgroundColor: '#b8d4e8',
        pathColor: '#9cc5db',
        terrain: [
            { type: 'path', x: 50, y: 290, width: 1100, height: 38 },
            { type: 'sea_ice', x: 190, y: 210, width: 65, height: 70, questionId: 10 },
            { type: 'ice_floe', x: 390, y: 240, width: 55, height: 60, questionId: 11 },
            { type: 'tabular_iceberg', x: 590, y: 190, width: 70, height: 85, questionId: 12 },
            { type: 'pack_ice', x: 790, y: 230, width: 60, height: 65, questionId: 13 },
            { type: 'ice_shelf_edge', x: 990, y: 250, width: 50, height: 60, questionId: 14 },
            { type: 'water_ripple', x: 140, y: 350, width: 30, height: 15 },
            { type: 'seal_hole', x: 340, y: 380, width: 25, height: 20 }
        ]
    },
    
    antarctica_plateau: {
        name: '南极高原',
        description: '世界上海拔最高的高原之一',
        backgroundColor: '#f0f8fc',
        pathColor: '#d8e8f0',
        terrain: [
            { type: 'path', x: 50, y: 285, width: 1100, height: 42 },
            { type: 'sastrugi', x: 185, y: 195, width: 58, height: 75, questionId: 15 },
            { type: 'wind_scoop', x: 385, y: 225, width: 52, height: 68, questionId: 16 },
            { type: 'ice_mound', x: 585, y: 205, width: 62, height: 72, questionId: 17 },
            { type: 'crevasse_field', x: 785, y: 235, width: 56, height: 66, questionId: 18 },
            { type: 'pole_marker', x: 985, y: 255, width: 48, height: 58, questionId: 19 },
            { type: 'wind_tail', x: 135, y: 390, width: 38, height: 28 }
        ]
    },
    
    research_station: {
        name: '科考站区域',
        description: '人类在南极的科学研究基地',
        backgroundColor: '#dce8f0',
        pathColor: '#c0d8e5',
        terrain: [
            { type: 'path', x: 50, y: 295, width: 1100, height: 36 },
            { type: 'station_building', x: 195, y: 215, width: 55, height: 70, questionId: 20 },
            { type: 'weather_station', x: 395, y: 245, width: 50, height: 62, questionId: 21 },
            { type: 'antenna_tower', x: 595, y: 225, width: 45, height: 68, questionId: 22 },
            { type: 'fuel_depot', x: 795, y: 255, width: 52, height: 60, questionId: 23 },
            { type: 'runway_marker', x: 995, y: 265, width: 48, height: 55, questionId: 24 },
            { type: 'supply_crate', x: 145, y: 385, width: 32, height: 30 }
        ]
    },

    // ========== 大熊猫 - 中国西南场景 ==========
    sichuan_basin: {
        name: '四川盆地',
        description: '中国著名的紫色盆地',
        backgroundColor: '#e8d4c0',
        pathColor: '#d0b8a0',
        terrain: [
            { type: 'path', x: 50, y: 285, width: 1100, height: 40 },
            { type: 'basin_hill', x: 190, y: 205, width: 58, height: 72, questionId: 25 },
            { type: 'rice_terrace', x: 390, y: 235, width: 62, height: 68, questionId: 26 },
            { type: 'river_bend', x: 590, y: 215, width: 55, height: 70, questionId: 27 },
            { type: 'farmland', x: 790, y: 245, width: 60, height: 65, questionId: 28 },
            { type: 'village_house', x: 990, y: 260, width: 50, height: 58, questionId: 29 }
        ]
    },
    
    qinling_mountains: {
        name: '秦岭山脉',
        description: '中国南北地理分界线',
        backgroundColor: '#c8d8c0',
        pathColor: '#a8c0a0',
        terrain: [
            { type: 'path', x: 50, y: 320, width: 1100, height: 35 },
            { type: 'mountain_peak', x: 185, y: 160, width: 65, height: 140, questionId: 30 },
            { type: 'forest_zone', x: 385, y: 200, width: 60, height: 100, questionId: 31 },
            { type: 'alpine_meadow', x: 585, y: 180, width: 58, height: 120, questionId: 32 },
            { type: 'rock_face', x: 785, y: 190, width: 62, height: 110, questionId: 33 },
            { type: 'mountain_pass', x: 985, y: 220, width: 55, height: 85, questionId: 34 }
        ]
    },
    
    minjiang_valley: {
        name: '岷江河谷',
        description: '长江上游重要支流',
        backgroundColor: '#b8d0c8',
        pathColor: '#98b8a8',
        terrain: [
            { type: 'path', x: 50, y: 300, width: 1100, height: 38 },
            { type: 'river_valley', x: 195, y: 220, width: 60, height: 75, questionId: 35 },
            { type: 'river_terrace', x: 395, y: 240, width: 58, height: 68, questionId: 36 },
            { type: 'alluvial_fan', x: 595, y: 230, width: 62, height: 72, questionId: 37 },
            { type: 'gorge_wall', x: 795, y: 210, width: 56, height: 80, questionId: 38 },
            { type: 'river_stone', x: 995, y: 255, width: 52, height: 62, questionId: 39 }
        ]
    },
    
    bamboo_forest: {
        name: '竹林生态区',
        description: '大熊猫的主要栖息地',
        backgroundColor: '#2d5016',
        pathColor: '#8fbc8f',
        terrain: [
            { type: 'path', x: 50, y: 290, width: 1100, height: 40 },
            { type: 'bamboo_grove', x: 190, y: 200, width: 55, height: 85, questionId: 40 },
            { type: 'bamboo_thick', x: 390, y: 220, width: 60, height: 78, questionId: 41 },
            { type: 'panda_den', x: 590, y: 210, width: 58, height: 82, questionId: 42 },
            { type: 'bamboo_shoot', x: 790, y: 230, width: 52, height: 75, questionId: 43 },
            { type: 'forest_stream', x: 990, y: 250, width: 56, height: 68, questionId: 44 }
        ]
    },
    
    nature_reserve: {
        name: '自然保护区',
        description: '大熊猫保护的核心区域',
        backgroundColor: '#3d6026',
        pathColor: '#9fcc9f',
        terrain: [
            { type: 'path', x: 50, y: 295, width: 1100, height: 37 },
            { type: 'reserve_sign', x: 195, y: 225, width: 50, height: 65, questionId: 45 },
            { type: 'watch_tower', x: 395, y: 215, width: 48, height: 72, questionId: 46 },
            { type: 'feeding_station', x: 595, y: 235, width: 54, height: 68, questionId: 47 },
            { type: 'camera_trap', x: 795, y: 245, width: 46, height: 62, questionId: 48 },
            { type: 'patrol_path', x: 995, y: 260, width: 52, height: 58, questionId: 49 }
        ]
    },

    // ========== 骆驼 - 沙漠场景 ==========
    taklamakan_desert: {
        name: '塔克拉玛干沙漠',
        description: '中国最大的沙漠',
        backgroundColor: '#f4e4c1',
        pathColor: '#daa520',
        terrain: [
            { type: 'path', x: 50, y: 290, width: 1100, height: 40 },
            { type: 'crescent_dune', x: 185, y: 200, width: 70, height: 80, questionId: 50 },
            { type: 'barchan_dune', x: 385, y: 220, width: 65, height: 75, questionId: 51 },
            { type: 'sand_ridge', x: 585, y: 210, width: 68, height: 78, questionId: 52 },
            { type: 'yardang', x: 785, y: 230, width: 62, height: 72, questionId: 53 },
            { type: 'desert_pavement', x: 985, y: 250, width: 58, height: 68, questionId: 54 }
        ]
    },
    
    desert_oasis: {
        name: '沙漠绿洲',
        description: '沙漠中的生命之源',
        backgroundColor: '#e8d8b0',
        pathColor: '#c8b890',
        terrain: [
            { type: 'path', x: 50, y: 295, width: 1100, height: 38 },
            { type: 'palm_tree', x: 195, y: 215, width: 48, height: 75, questionId: 55 },
            { type: 'spring_pool', x: 395, y: 235, width: 60, height: 68, questionId: 56 },
            { type: 'date_palm', x: 595, y: 225, width: 50, height: 72, questionId: 57 },
            { type: 'irrigation_canal', x: 795, y: 245, width: 65, height: 65, questionId: 58 },
            { type: 'mud_house', x: 995, y: 260, width: 55, height: 62, questionId: 59 }
        ]
    },
    
    gobi_desert: {
        name: '戈壁滩',
        description: '砾石覆盖的荒漠',
        backgroundColor: '#d8c8a8',
        pathColor: '#b8a888',
        terrain: [
            { type: 'path', x: 50, y: 288, width: 1100, height: 42 },
            { type: 'gravel_field', x: 190, y: 218, width: 62, height: 70, questionId: 60 },
            { type: 'rock_desert', x: 390, y: 238, width: 58, height: 68, questionId: 61 },
            { type: 'desert_varnish', x: 590, y: 228, width: 60, height: 72, questionId: 62 },
            { type: 'wind_erosion', x: 790, y: 248, width: 56, height: 66, questionId: 63 },
            { type: 'camel_thorn', x: 990, y: 265, width: 52, height: 60, questionId: 64 }
        ]
    },
    
    desert_edge: {
        name: '沙漠边缘',
        description: '荒漠化的过渡地带',
        backgroundColor: '#e0d0b0',
        pathColor: '#c0b090',
        terrain: [
            { type: 'path', x: 50, y: 292, width: 1100, height: 39 },
            { type: 'semi_desert', x: 192, y: 222, width: 58, height: 68, questionId: 65 },
            { type: 'sparse_grass', x: 392, y: 242, width: 56, height: 66, questionId: 66 },
            { type: 'degraded_land', x: 592, y: 232, width: 60, height: 70, questionId: 67 },
            { type: 'sand_fixation', x: 792, y: 252, width: 54, height: 64, questionId: 68 },
            { type: 'shelter_belt', x: 992, y: 268, width: 50, height: 58, questionId: 69 }
        ]
    },
    
    silk_road: {
        name: '古丝绸之路',
        description: '连接东西方的贸易通道',
        backgroundColor: '#d4c4a4',
        pathColor: '#b4a484',
        terrain: [
            { type: 'path', x: 50, y: 293, width: 1100, height: 40 },
            { type: 'ancient_ruins', x: 194, y: 223, width: 56, height: 70, questionId: 70 },
            { type: 'caravanserai', x: 394, y: 243, width: 60, height: 68, questionId: 71 },
            { type: 'trade_post', x: 594, y: 233, width: 58, height: 72, questionId: 72 },
            { type: 'beacon_tower', x: 794, y: 253, width: 52, height: 66, questionId: 73 },
            { type: 'merchant_camp', x: 994, y: 270, width: 54, height: 60, questionId: 74 }
        ]
    },

    // ========== 袋鼠 - 澳大利亚场景 ==========
    great_dividing_range: {
        name: '大分水岭',
        description: '澳大利亚东部山脉',
        backgroundColor: '#b8c8b0',
        pathColor: '#98a890',
        terrain: [
            { type: 'path', x: 50, y: 310, width: 1100, height: 36 },
            { type: 'mountain_ridge', x: 188, y: 180, width: 62, height: 120, questionId: 75 },
            { type: 'rainforest_zone', x: 388, y: 210, width: 60, height: 95, questionId: 76 },
            { type: 'windward_slope', x: 588, y: 190, width: 64, height: 110, questionId: 77 },
            { type: 'leeward_slope', x: 788, y: 220, width: 58, height: 88, questionId: 78 },
            { type: 'eucalyptus_forest', x: 988, y: 240, width: 56, height: 80, questionId: 79 }
        ]
    },
    
    murray_darling_basin: {
        name: '墨累-达令盆地',
        description: '澳大利亚最重要的农业区',
        backgroundColor: '#d8c8a8',
        pathColor: '#b8a888',
        terrain: [
            { type: 'path', x: 50, y: 295, width: 1100, height: 38 },
            { type: 'wheat_field', x: 193, y: 225, width: 60, height: 70, questionId: 80 },
            { type: 'irrigation_system', x: 393, y: 245, width: 62, height: 68, questionId: 81 },
            { type: 'river_murray', x: 593, y: 235, width: 58, height: 72, questionId: 82 },
            { type: 'sheep_station', x: 793, y: 255, width: 56, height: 66, questionId: 83 },
            { type: 'water_storage', x: 993, y: 270, width: 54, height: 62, questionId: 84 }
        ]
    },
    
    great_barrier_reef: {
        name: '大堡礁',
        description: '世界最大的珊瑚礁群',
        backgroundColor: '#88c8d8',
        pathColor: '#68a8b8',
        terrain: [
            { type: 'path', x: 50, y: 300, width: 1100, height: 37 },
            { type: 'coral_reef', x: 192, y: 230, width: 58, height: 68, questionId: 85 },
            { type: 'reef_lagoon', x: 392, y: 250, width: 62, height: 65, questionId: 86 },
            { type: 'coral_polyp', x: 592, y: 240, width: 56, height: 70, questionId: 87 },
            { type: 'reef_fish', x: 792, y: 260, width: 60, height: 64, questionId: 88 },
            { type: 'reef_island', x: 992, y: 275, width: 54, height: 58, questionId: 89 }
        ]
    },
    
    outback_desert: {
        name: '内陆沙漠',
        description: '澳大利亚干旱的心脏地带',
        backgroundColor: '#e8d0a8',
        pathColor: '#c8b088',
        terrain: [
            { type: 'path', x: 50, y: 292, width: 1100, height: 40 },
            { type: 'red_sand', x: 191, y: 222, width: 62, height: 72, questionId: 90 },
            { type: 'spinifex_grass', x: 391, y: 242, width: 58, height: 68, questionId: 91 },
            { type: 'uluru_rock', x: 591, y: 232, width: 70, height: 75, questionId: 92 },
            { type: 'desert_oak', x: 791, y: 252, width: 56, height: 70, questionId: 93 },
            { type: 'billabong', x: 991, y: 268, width: 60, height: 64, questionId: 94 }
        ]
    },
    
    sydney_harbour: {
        name: '悉尼港',
        description: '世界著名的天然良港',
        backgroundColor: '#a8c8d8',
        pathColor: '#88a8b8',
        terrain: [
            { type: 'path', x: 50, y: 298, width: 1100, height: 36 },
            { type: 'harbour_bridge', x: 194, y: 228, width: 65, height: 70, questionId: 95 },
            { type: 'opera_house', x: 394, y: 248, width: 60, height: 68, questionId: 96 },
            { type: 'container_port', x: 594, y: 238, width: 62, height: 72, questionId: 97 },
            { type: 'ferry_terminal', x: 794, y: 258, width: 58, height: 66, questionId: 98 },
            { type: 'coastal_city', x: 994, y: 273, width: 56, height: 60, questionId: 99 }
        ]
    },

    // ========== 北极熊 - 北极场景 ==========
    arctic_ocean_ice: {
        name: '北冰洋海冰',
        description: '漂浮在北冰洋上的海冰',
        backgroundColor: '#e0f0f8',
        pathColor: '#c0d8e8',
        terrain: [
            { type: 'path', x: 50, y: 288, width: 1100, height: 42 },
            { type: 'multi_year_ice', x: 187, y: 208, width: 68, height: 75, questionId: 100 },
            { type: 'pressure_ridge', x: 387, y: 228, width: 64, height: 72, questionId: 101 },
            { type: 'lead_water', x: 587, y: 218, width: 66, height: 78, questionId: 102 },
            { type: 'ice_floe_arctic', x: 787, y: 238, width: 62, height: 70, questionId: 103 },
            { type: 'polar_bear_track', x: 987, y: 258, width: 58, height: 68, questionId: 104 }
        ]
    },
    
    greenland: {
        name: '格陵兰岛',
        description: '世界最大的岛屿',
        backgroundColor: '#d8e8f0',
        pathColor: '#b8d0e0',
        terrain: [
            { type: 'path', x: 50, y: 293, width: 1100, height: 39 },
            { type: 'ice_sheet_greenland', x: 190, y: 213, width: 65, height: 78, questionId: 105 },
            { type: 'glacier_tongue', x: 390, y: 233, width: 62, height: 75, questionId: 106 },
            { type: 'fjord', x: 590, y: 223, width: 68, height: 80, questionId: 107 },
            { type: 'iceberg_calving', x: 790, y: 243, width: 64, height: 72, questionId: 108 },
            { type: 'nunatak', x: 990, y: 263, width: 60, height: 70, questionId: 109 }
        ]
    },
    
    tundra_zone: {
        name: '苔原带',
        description: '北极圈内的冻土植被带',
        backgroundColor: '#c8d0c0',
        pathColor: '#a8b0a0',
        terrain: [
            { type: 'path', x: 50, y: 296, width: 1100, height: 37 },
            { type: 'permafrost', x: 192, y: 226, width: 60, height: 72, questionId: 110 },
            { type: 'tundra_moss', x: 392, y: 246, width: 58, height: 68, questionId: 111 },
            { type: 'arctic_willow', x: 592, y: 236, width: 62, height: 74, questionId: 112 },
            { type: 'thermokarst', x: 792, y: 256, width: 56, height: 70, questionId: 113 },
            { type: 'caribou_trail', x: 992, y: 271, width: 60, height: 66, questionId: 114 }
        ]
    },
    
    arctic_circle: {
        name: '北极圈',
        description: '北纬66.5度的神奇纬线',
        backgroundColor: '#d0e0e8',
        pathColor: '#b0c8d8',
        terrain: [
            { type: 'path', x: 50, y: 291, width: 1100, height: 40 },
            { type: 'midnight_sun', x: 189, y: 221, width: 64, height: 74, questionId: 115 },
            { type: 'polar_night', x: 389, y: 241, width: 62, height: 72, questionId: 116 },
            { type: 'aurora_borealis', x: 589, y: 231, width: 66, height: 76, questionId: 117 },
            { type: 'arctic_circle_sign', x: 789, y: 251, width: 58, height: 70, questionId: 118 },
            { type: 'observation_post', x: 989, y: 266, width: 60, height: 68, questionId: 119 }
        ]
    },
    
    inuit_village: {
        name: '因纽特村落',
        description: '北极原住民的聚居地',
        backgroundColor: '#c8d8d0',
        pathColor: '#a8b8b0',
        terrain: [
            { type: 'path', x: 50, y: 294, width: 1100, height: 38 },
            { type: 'igloo', x: 193, y: 234, width: 56, height: 68, questionId: 120 },
            { type: 'kayak_rack', x: 393, y: 254, width: 58, height: 66, questionId: 121 },
            { type: 'dog_sled', x: 593, y: 244, width: 62, height: 70, questionId: 122 },
            { type: 'hunting_ground', x: 793, y: 264, width: 60, height: 64, questionId: 123 },
            { type: 'community_hall', x: 993, y: 279, width: 56, height: 62, questionId: 124 }
        ]
    }
};

// 为每张地图添加起点和终点
Object.keys(EXTENDED_MAP_TEMPLATES).forEach(key => {
    EXTENDED_MAP_TEMPLATES[key].startX = 50;
    EXTENDED_MAP_TEMPLATES[key].startY = 300;
    EXTENDED_MAP_TEMPLATES[key].endX = 1150;
    EXTENDED_MAP_TEMPLATES[key].endY = 300;
    EXTENDED_MAP_TEMPLATES[key].completed = [];
});
