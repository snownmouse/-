// 全局变量
let currentMode = 'research'; // 当前模式：'research' 或 'teaching'
let nodes = []; // 节点数据
let links = []; // 连线数据
let simulation = null; // 力导向图模拟
let svg = null; // SVG 元素
let g = null; // 可缩放的容器组元素
let quizMode = false; // 是否处于自测模式
let playing = false; // 是否正在播放动画
let animationStep = 0; // 动画步骤
let animationInterval = null; // 动画定时器
let zoom = null; // 缩放行为
let currentZoom = 1; // 当前缩放比例
let energyLabels = null; // 能量变化标签组
let currentlyHighlightedIndex = -1; // 当前高亮的反应索引

// 初始化应用
function initApp() {
    svg = d3.select('#biochemical-map');
    
    // 加载数据
    loadBiochemicalData();
    
    // 绑定事件监听器
    bindEventListeners();
}

// 加载生化数据
// 直接嵌入生化数据，避免CORS问题
function loadBiochemicalData() {
    console.log('使用直接嵌入的数据...');
    
    // 这里将直接嵌入完整的生物化学反应数据
    // 为了避免文件过大，我们将使用内联数据对象
    
    // 由于data.json文件很大，我们将从文件内容中提取数据结构
    // 这种方式避免了通过fetch请求加载本地文件的CORS限制
    
    // 定义完整的生化数据
    const biochemicalData = {
        "nodes": [
            // 糖酵解途径
            { "id": "glucose", "name": "葡萄糖", "type": "metabolite", "formula": "C6H12O6", "x": 100, "y": 200 },
            { "id": "g6p", "name": "葡萄糖-6-磷酸", "type": "metabolite", "formula": "C6H13O9P", "x": 200, "y": 200 },
            { "id": "f6p", "name": "果糖-6-磷酸", "type": "metabolite", "formula": "C6H13O9P", "x": 300, "y": 200 },
            { "id": "f16bp", "name": "果糖-1,6-二磷酸", "type": "metabolite", "formula": "C6H14O12P2", "x": 400, "y": 200 },
            { "id": "g3p", "name": "甘油醛-3-磷酸", "type": "metabolite", "formula": "C3H7O6P", "x": 500, "y": 250 },
            { "id": "dhap", "name": "二羟丙酮磷酸", "type": "metabolite", "formula": "C3H7O6P", "x": 500, "y": 150 },
            { "id": "13bpg", "name": "1,3-二磷酸甘油酸", "type": "metabolite", "formula": "C3H8O10P2", "x": 600, "y": 250 },
            { "id": "3pg", "name": "3-磷酸甘油酸", "type": "metabolite", "formula": "C3H7O7P", "x": 700, "y": 250 },
            { "id": "2pg", "name": "2-磷酸甘油酸", "type": "metabolite", "formula": "C3H7O7P", "x": 800, "y": 250 },
            { "id": "pep", "name": "磷酸烯醇式丙酮酸", "type": "metabolite", "formula": "C3H5O6P", "x": 900, "y": 250 },
            { "id": "pyruvate", "name": "丙酮酸", "type": "metabolite", "formula": "C3H4O3", "x": 1000, "y": 250 },
            
            // 三羧酸循环
            { "id": "acetyl_coa", "name": "乙酰辅酶A", "type": "metabolite", "formula": "C23H38N7O17P3S", "x": 1000, "y": 400 },
            { "id": "oxaloacetate", "name": "草酰乙酸", "type": "metabolite", "formula": "C4H4O5", "x": 900, "y": 500 },
            { "id": "citrate", "name": "柠檬酸", "type": "metabolite", "formula": "C6H8O7", "x": 800, "y": 450 },
            { "id": "isocitrate", "name": "异柠檬酸", "type": "metabolite", "formula": "C6H8O7", "x": 700, "y": 400 },
            { "id": "alpha_kg", "name": "α-酮戊二酸", "type": "metabolite", "formula": "C5H6O5", "x": 600, "y": 450 },
            { "id": "succinyl_coa", "name": "琥珀酰辅酶A", "type": "metabolite", "formula": "C25H40N7O19P3S", "x": 500, "y": 400 },
            { "id": "succinate", "name": "琥珀酸", "type": "metabolite", "formula": "C4H6O4", "x": 400, "y": 450 },
            { "id": "fumarate", "name": "延胡索酸", "type": "metabolite", "formula": "C4H4O4", "x": 300, "y": 400 },
            { "id": "malate", "name": "苹果酸", "type": "metabolite", "formula": "C4H6O5", "x": 200, "y": 450 },
            
            // 磷酸戊糖途径
            { "id": "6pg", "name": "6-磷酸葡萄糖酸", "type": "metabolite", "formula": "C6H13O10P", "x": 300, "y": 300 },
            { "id": "ru5p", "name": "核酮糖-5-磷酸", "type": "metabolite", "formula": "C5H9O8P", "x": 400, "y": 350 },
            { "id": "ribose5p", "name": "核糖-5-磷酸", "type": "metabolite", "formula": "C5H9O8P", "x": 500, "y": 300 },
            { "id": "xylulose5p", "name": "木酮糖-5-磷酸", "type": "metabolite", "formula": "C5H9O8P", "x": 400, "y": 250 },
            
            // 酶节点
            { "id": "hexokinase", "name": "己糖激酶", "type": "enzyme", "ec": "2.7.1.1", "x": 150, "y": 170 },
            { "id": "g6p_isomerase", "name": "葡萄糖-6-磷酸异构酶", "type": "enzyme", "ec": "5.3.1.9", "x": 250, "y": 170 },
            { "id": "pfk", "name": "磷酸果糖激酶", "type": "enzyme", "ec": "2.7.1.11", "x": 350, "y": 170 },
            { "id": "aldolase", "name": "醛缩酶", "type": "enzyme", "ec": "4.1.2.13", "x": 450, "y": 200 },
            { "id": "g3pdh", "name": "甘油醛-3-磷酸脱氢酶", "type": "enzyme", "ec": "1.2.1.12", "x": 550, "y": 270 },
            { "id": "pgk", "name": "磷酸甘油酸激酶", "type": "enzyme", "ec": "2.7.2.3", "x": 650, "y": 270 },
            { "id": "pgm", "name": "磷酸甘油酸变位酶", "type": "enzyme", "ec": "5.4.2.1", "x": 750, "y": 270 },
            { "id": "enolase", "name": "烯醇化酶", "type": "enzyme", "ec": "4.2.1.11", "x": 850, "y": 270 },
            { "id": "pyk", "name": "丙酮酸激酶", "type": "enzyme", "ec": "2.7.1.40", "x": 950, "y": 270 },
            { "id": "pdh", "name": "丙酮酸脱氢酶复合体", "type": "enzyme", "ec": "1.2.4.1", "x": 1000, "y": 320 },
            { "id": "cs", "name": "柠檬酸合酶", "type": "enzyme", "ec": "2.3.3.1", "x": 950, "y": 450 },
            { "id": "aconitase", "name": "乌头酸酶", "type": "enzyme", "ec": "4.2.1.3", "x": 850, "y": 420 },
            { "id": "idh", "name": "异柠檬酸脱氢酶", "type": "enzyme", "ec": "1.1.1.41", "x": 750, "y": 420 },
            { "id": "kgdh", "name": "α-酮戊二酸脱氢酶复合体", "type": "enzyme", "ec": "1.2.4.2", "x": 650, "y": 420 },
            { "id": "succligase", "name": "琥珀酰辅酶A合成酶", "type": "enzyme", "ec": "6.2.1.5", "x": 550, "y": 420 },
            { "id": "sdh", "name": "琥珀酸脱氢酶", "type": "enzyme", "ec": "1.3.5.1", "x": 450, "y": 420 },
            { "id": "fumarase", "name": "延胡索酸酶", "type": "enzyme", "ec": "4.2.1.2", "x": 350, "y": 420 },
            { "id": "mdh", "name": "苹果酸脱氢酶", "type": "enzyme", "ec": "1.1.1.37", "x": 250, "y": 420 },
            { "id": "g6pdh", "name": "葡萄糖-6-磷酸脱氢酶", "type": "enzyme", "ec": "1.1.1.49", "x": 250, "y": 250 },
            { "id": "6pgdh", "name": "6-磷酸葡萄糖酸脱氢酶", "type": "enzyme", "ec": "1.1.1.44", "x": 350, "y": 320 },
            { "id": "ribose5p_islomerase", "name": "核糖-5-磷酸异构酶", "type": "enzyme", "ec": "5.3.1.6", "x": 450, "y": 320 },
            { "id": "transketolase", "name": "转酮醇酶", "type": "enzyme", "ec": "2.2.1.1", "x": 450, "y": 280 },
            { "id": "transaldolase", "name": "转醛醇酶", "type": "enzyme", "ec": "2.2.1.2", "x": 500, "y": 220 },
            
            // 糖原代谢
            { "id": "glycogen", "name": "糖原", "type": "metabolite", "formula": "(C6H10O5)n", "x": 100, "y": 300 },
            { "id": "g1p", "name": "葡萄糖-1-磷酸", "type": "metabolite", "formula": "C6H13O9P", "x": 200, "y": 300 },
            { "id": "glycogen_phosphorylase", "name": "糖原磷酸化酶", "type": "enzyme", "ec": "2.4.1.1", "x": 150, "y": 320 },
            { "id": "phosphoglucomutase", "name": "磷酸葡萄糖变位酶", "type": "enzyme", "ec": "5.4.2.2", "x": 175, "y": 250 },
            
            // 糖异生
            { "id": "lactate", "name": "乳酸", "type": "metabolite", "formula": "C3H6O3", "x": 1100, "y": 200 },
            { "id": "lactate_dehydrogenase", "name": "乳酸脱氢酶", "type": "enzyme", "ec": "1.1.1.27", "x": 1050, "y": 220 },
            
            // 脂肪酸代谢
            { "id": "fatty_acid", "name": "脂肪酸", "type": "metabolite", "formula": "RCOOH", "x": 800, "y": 550 },
            { "id": "acyl_coa", "name": "脂酰辅酶A", "type": "metabolite", "formula": "RCO-SCoA", "x": 700, "y": 550 },
            { "id": "carnitine", "name": "肉碱", "type": "metabolite", "formula": "C7H15NO3", "x": 600, "y": 550 },
            { "id": "acyl_carnitine", "name": "脂酰肉碱", "type": "metabolite", "formula": "RCO-O-carnitine", "x": 500, "y": 550 },
            { "id": "cpt1", "name": "肉碱棕榈酰转移酶I", "type": "enzyme", "ec": "2.3.1.21", "x": 650, "y": 580 },
            
            // 电子传递链
            { "id": "nadph", "name": "NADPH", "type": "metabolite", "formula": "C21H29N7O17P3", "x": 400, "y": 500 },
            { "id": "nadh", "name": "NADH", "type": "metabolite", "formula": "C21H27N7O14P2", "x": 700, "y": 600 },
            { "id": "atp", "name": "ATP", "type": "metabolite", "formula": "C10H16N5O13P3", "x": 800, "y": 600 },
            { "id": "adp", "name": "ADP", "type": "metabolite", "formula": "C10H15N5O10P2", "x": 900, "y": 600 },
            { "id": "pi", "name": "无机磷酸", "type": "metabolite", "formula": "H3PO4", "x": 850, "y": 550 },
            { "id": "atp_synthase", "name": "ATP合酶", "type": "enzyme", "ec": "3.6.3.14", "x": 800, "y": 650 },
            { "id": "fadh2", "name": "FADH2", "type": "metabolite", "formula": "C27H33N9O15P2", "x": 500, "y": 600 },
            { "id": "nadph_dehydrogenase", "name": "NADPH脱氢酶", "type": "enzyme", "ec": "1.6.99.1", "x": 350, "y": 530 },
            { "id": "nadh_dehydrogenase", "name": "NADH脱氢酶", "type": "enzyme", "ec": "1.6.5.3", "x": 700, "y": 630 },
            
            // 氨基酸代谢
            { "id": "glutamate", "name": "谷氨酸", "type": "metabolite", "formula": "C5H9NO4", "x": 500, "y": 500 },
            { "id": "glutamine", "name": "谷氨酰胺", "type": "metabolite", "formula": "C5H10N2O3", "x": 450, "y": 530 },
            { "id": "glutamate_dehydrogenase", "name": "谷氨酸脱氢酶", "type": "enzyme", "ec": "1.4.1.3", "x": 475, "y": 470 },
            
            // 核苷酸代谢
            { "id": "prpp", "name": "5-磷酸核糖-1-焦磷酸", "type": "metabolite", "formula": "C5H12O14P3", "x": 550, "y": 300 },
            { "id": "imp", "name": "次黄嘌呤核苷酸", "type": "metabolite", "formula": "C10H13N4O8P", "x": 600, "y": 300 },
            { "id": "prpp_synthetase", "name": "PRPP合成酶", "type": "enzyme", "ec": "2.7.6.1", "x": 525, "y": 330 },
            
            // 乙醛酸循环
            { "id": "glyoxylate", "name": "乙醛酸", "type": "metabolite", "formula": "C2H2O3", "x": 700, "y": 350 },
            { "id": "isocitrate_lyase", "name": "异柠檬酸裂解酶", "type": "enzyme", "ec": "4.1.3.1", "x": 725, "y": 380 },
            { "id": "malate_synthase", "name": "苹果酸合酶", "type": "enzyme", "ec": "4.1.3.2", "x": 775, "y": 380 },
            
            // 光合作用
            { "id": "co2", "name": "二氧化碳", "type": "metabolite", "formula": "CO2", "x": 100, "y": 100 },
            { "id": "rubp", "name": "核酮糖-1,5-二磷酸", "type": "metabolite", "formula": "C5H12O11P2", "x": 200, "y": 100 },
            { "id": "rubisco", "name": "核酮糖-1,5-二磷酸羧化酶/加氧酶", "type": "enzyme", "ec": "4.1.1.39", "x": 150, "y": 130 },
            
            // 激素调节与糖原代谢
            { "id": "insulin", "name": "胰岛素", "type": "hormone", "formula": "蛋白质", "x": 100, "y": 50 },
            { "id": "glucagon", "name": "胰高血糖素", "type": "hormone", "formula": "蛋白质", "x": 200, "y": 50 },
            { "id": "glycogen_phosphorylase_kinase", "name": "糖原磷酸化酶激酶", "type": "enzyme", "ec": "2.7.11.19", "x": 125, "y": 80 },
            { "id": "glycogen_synthase", "name": "糖原合酶", "type": "enzyme", "ec": "2.4.1.11", "x": 175, "y": 320 }
        ],
        "links": [
            // 糖酵解
            { "source": "glucose", "target": "g6p", "type": "synthesis", "name": "葡萄糖磷酸化", "enzyme": "hexokinase", "direction": "forward", "考点": "关键限速步骤" },
            { "source": "g6p", "target": "f6p", "type": "synthesis", "name": "葡萄糖-6-磷酸异构化", "enzyme": "g6p_isomerase", "direction": "bidirectional" },
            { "source": "f6p", "target": "f16bp", "type": "synthesis", "name": "果糖-6-磷酸磷酸化", "enzyme": "pfk", "direction": "forward", "考点": "糖酵解的主要调控点" },
            { "source": "f16bp", "target": "g3p", "type": "decomposition", "name": "果糖-1,6-二磷酸分解", "enzyme": "aldolase", "direction": "bidirectional" },
            { "source": "f16bp", "target": "dhap", "type": "decomposition", "name": "果糖-1,6-二磷酸分解", "enzyme": "aldolase", "direction": "bidirectional" },
            { "source": "g3p", "target": "13bpg", "type": "synthesis", "name": "甘油醛-3-磷酸氧化", "enzyme": "g3pdh", "direction": "bidirectional" },
            { "source": "13bpg", "target": "3pg", "type": "synthesis", "name": "1,3-二磷酸甘油酸转磷酸", "enzyme": "pgk", "direction": "bidirectional" },
            { "source": "3pg", "target": "2pg", "type": "synthesis", "name": "3-磷酸甘油酸变位", "enzyme": "pgm", "direction": "bidirectional" },
            { "source": "2pg", "target": "pep", "type": "synthesis", "name": "2-磷酸甘油酸脱水", "enzyme": "enolase", "direction": "bidirectional" },
            { "source": "pep", "target": "pyruvate", "type": "synthesis", "name": "磷酸烯醇式丙酮酸转磷酸", "enzyme": "pyk", "direction": "forward" },
            
            // 三羧酸循环
            { "source": "pyruvate", "target": "acetyl_coa", "type": "synthesis", "name": "丙酮酸氧化脱羧", "enzyme": "pdh", "direction": "forward", "考点": "连接糖酵解和三羧酸循环的关键步骤" },
            { "source": "acetyl_coa", "target": "oxaloacetate", "type": "synthesis", "name": "柠檬酸合成", "enzyme": "cs", "direction": "forward" },
            { "source": "oxaloacetate", "target": "citrate", "type": "synthesis", "name": "柠檬酸合成", "enzyme": "cs", "direction": "forward" },
            { "source": "citrate", "target": "isocitrate", "type": "synthesis", "name": "柠檬酸异构化", "enzyme": "aconitase", "direction": "bidirectional" },
            { "source": "isocitrate", "target": "alpha_kg", "type": "synthesis", "name": "异柠檬酸氧化脱羧", "enzyme": "idh", "direction": "forward", "考点": "三羧酸循环的主要调控点" },
            { "source": "alpha_kg", "target": "succinyl_coa", "type": "synthesis", "name": "α-酮戊二酸氧化脱羧", "enzyme": "kgdh", "direction": "forward" },
            { "source": "succinyl_coa", "target": "succinate", "type": "synthesis", "name": "琥珀酰辅酶A转磷酸", "enzyme": "succligase", "direction": "bidirectional" },
            { "source": "succinate", "target": "fumarate", "type": "synthesis", "name": "琥珀酸氧化", "enzyme": "sdh", "direction": "forward" },
            { "source": "fumarate", "target": "malate", "type": "synthesis", "name": "延胡索酸水合", "enzyme": "fumarase", "direction": "bidirectional" },
            { "source": "malate", "target": "oxaloacetate", "type": "synthesis", "name": "苹果酸氧化", "enzyme": "mdh", "direction": "bidirectional" },
            
            // 磷酸戊糖途径
            { "source": "g6p", "target": "6pg", "type": "synthesis", "name": "葡萄糖-6-磷酸脱氢", "enzyme": "g6pdh", "direction": "forward", "考点": "磷酸戊糖途径的限速步骤" },
            { "source": "6pg", "target": "ru5p", "type": "synthesis", "name": "6-磷酸葡萄糖酸脱氢脱羧", "enzyme": "6pgdh", "direction": "forward" },
            { "source": "ru5p", "target": "ribose5p", "type": "synthesis", "name": "核酮糖-5-磷酸异构化", "enzyme": "ribose5p_islomerase", "direction": "bidirectional" },
            { "source": "ru5p", "target": "xylulose5p", "type": "synthesis", "name": "核酮糖-5-磷酸差向异构", "enzyme": "transketolase", "direction": "bidirectional" },
            { "source": "ribose5p", "target": "xylulose5p", "type": "synthesis", "name": "转酮醇反应", "enzyme": "transketolase", "direction": "bidirectional" },
            { "source": "xylulose5p", "target": "g3p", "type": "synthesis", "name": "转醛醇反应", "enzyme": "transaldolase", "direction": "bidirectional" },
            
            // 糖原代谢
            { "source": "glycogen", "target": "g1p", "type": "decomposition", "name": "糖原磷酸解", "enzyme": "glycogen_phosphorylase", "direction": "forward", "考点": "糖原分解的关键酶" },
            { "source": "g1p", "target": "g6p", "type": "synthesis", "name": "葡萄糖-1-磷酸变位", "enzyme": "phosphoglucomutase", "direction": "bidirectional" },
            { "source": "g6p", "target": "glycogen", "type": "synthesis", "name": "糖原合成", "enzyme": "glycogen_synthase", "direction": "forward", "考点": "糖原合成的关键酶" },
            // 激素调控糖原代谢
            { "source": "insulin", "target": "glycogen_synthase", "type": "regulation", "name": "胰岛素激活糖原合酶", "direction": "forward", "考点": "糖原代谢的激素调控" },
            { "source": "insulin", "target": "glycogen_phosphorylase", "type": "inhibition", "name": "胰岛素抑制糖原磷酸化酶", "direction": "forward" },
            { "source": "glucagon", "target": "glycogen_phosphorylase_kinase", "type": "activation", "name": "胰高血糖素激活糖原磷酸化酶激酶", "direction": "forward" },
            { "source": "glycogen_phosphorylase_kinase", "target": "glycogen_phosphorylase", "type": "activation", "name": "糖原磷酸化酶激酶激活糖原磷酸化酶", "direction": "forward" },
            // 能量转化相关反应
            { "source": "atp", "target": "adp", "type": "decomposition", "name": "ATP水解供能", "enzyme": "ATP酶", "direction": "bidirectional", "考点": "高能磷酸键" },
            { "source": "atp", "target": "g6p", "type": "synthesis", "name": "ATP供能磷酸化葡萄糖", "enzyme": "己糖激酶", "direction": "forward", "考点": "糖酵解耗能步骤" },
            { "source": "13bpg", "target": "atp", "type": "synthesis", "name": "底物水平磷酸化生成ATP", "enzyme": "磷酸甘油酸激酶", "direction": "forward", "考点": "底物水平磷酸化" },
            { "source": "pep", "target": "atp", "type": "synthesis", "name": "PEP底物水平磷酸化生成ATP", "enzyme": "丙酮酸激酶", "direction": "forward", "考点": "底物水平磷酸化" },
            { "source": "succinyl_coa", "target": "atp", "type": "synthesis", "name": "琥珀酰CoA底物水平磷酸化生成ATP", "enzyme": "琥珀酰辅酶A合成酶", "direction": "forward", "考点": "三羧酸循环中的ATP生成" },
            
            // 糖异生
            { "source": "lactate", "target": "pyruvate", "type": "synthesis", "name": "乳酸脱氢", "enzyme": "lactate_dehydrogenase", "direction": "bidirectional" },
            
            // 脂肪酸代谢
            { "source": "fatty_acid", "target": "acyl_coa", "type": "synthesis", "name": "脂肪酸活化", "enzyme": "cpt1", "direction": "forward" },
            { "source": "acyl_coa", "target": "acyl_carnitine", "type": "synthesis", "name": "脂酰辅酶A转脂酰肉碱", "enzyme": "cpt1", "direction": "forward", "考点": "脂肪酸β-氧化的限速步骤" },
            { "source": "carnitine", "target": "acyl_carnitine", "type": "synthesis", "name": "肉碱参与的转脂酰反应", "enzyme": "cpt1", "direction": "bidirectional" },
            
            // 电子传递链
            { "source": "nadph", "target": "nadph_dehydrogenase", "type": "synthesis", "name": "NADPH电子传递", "enzyme": "nadph_dehydrogenase", "direction": "forward" },
            { "source": "nadh", "target": "nadh_dehydrogenase", "type": "synthesis", "name": "NADH电子传递", "enzyme": "nadh_dehydrogenase", "direction": "forward" },
            { "source": "nadh", "target": "atp", "type": "synthesis", "name": "NADH氧化磷酸化合成ATP", "enzyme": "ATP合酶", "direction": "forward", "考点": "氧化磷酸化" },
            { "source": "fadh2", "target": "atp", "type": "synthesis", "name": "FADH2氧化磷酸化合成ATP", "enzyme": "ATP合酶", "direction": "forward", "考点": "氧化磷酸化" },
            { "source": "adp", "target": "atp", "type": "synthesis", "name": "ADP磷酸化合成ATP", "enzyme": "ATP合酶", "direction": "forward", "考点": "能量偶联" },
            { "source": "pi", "target": "atp", "type": "synthesis", "name": "无机磷酸参与ATP合成", "enzyme": "ATP合酶", "direction": "forward" },
            
            // 氨基酸代谢
            { "source": "glutamate", "target": "alpha_kg", "type": "synthesis", "name": "谷氨酸脱氨", "enzyme": "glutamate_dehydrogenase", "direction": "bidirectional" },
            { "source": "glutamine", "target": "glutamate", "type": "synthesis", "name": "谷氨酰胺水解", "enzyme": "glutamate_dehydrogenase", "direction": "forward" },
            
            // 核苷酸代谢
            { "source": "ribose5p", "target": "prpp", "type": "synthesis", "name": "PRPP合成", "enzyme": "prpp_synthetase", "direction": "forward" },
            { "source": "prpp", "target": "imp", "type": "synthesis", "name": "IMP合成第一步", "enzyme": "prpp_synthetase", "direction": "forward" },
            
            // 乙醛酸循环
            { "source": "isocitrate", "target": "glyoxylate", "type": "decomposition", "name": "异柠檬酸裂解", "enzyme": "isocitrate_lyase", "direction": "forward" },
            { "source": "glyoxylate", "target": "malate", "type": "synthesis", "name": "苹果酸合成", "enzyme": "malate_synthase", "direction": "forward" },
            
            // 光合作用
            { "source": "co2", "target": "rubp", "type": "synthesis", "name": "CO2固定", "enzyme": "rubisco", "direction": "forward", "考点": "光合作用碳同化的关键酶" },
            
            // 激素调节
            { "source": "insulin", "target": "glycogen_phosphorylase_kinase", "type": "regulation", "name": "胰岛素抑制糖原分解", "enzyme": "glycogen_phosphorylase_kinase", "direction": "forward" },
            { "source": "glucagon", "target": "glycogen_phosphorylase_kinase", "type": "regulation", "name": "胰高血糖素激活糖原分解", "enzyme": "glycogen_phosphorylase_kinase", "direction": "forward" },
            { "source": "glycogen_phosphorylase_kinase", "target": "glycogen_phosphorylase", "type": "regulation", "name": "糖原磷酸化酶激酶激活糖原磷酸化酶", "enzyme": "glycogen_phosphorylase", "direction": "forward" }
        ]
    };
    
    // 设置节点和连线数据
    nodes = biochemicalData.nodes;
    links = biochemicalData.links;
    
    console.log('成功加载生化数据，节点数量:', nodes.length, '连线数量:', links.length);
    
    // 初始化图谱
    initializeMap();
    
    // 生成反应列表
    generateReactionsList();
    
    // 初始化侧边栏收放功能
    initSidebarToggle();
}

// 使用示例数据（当JSON文件加载失败时）
function useSampleData() {
    // 示例代谢通路数据
    nodes = [
        { id: 'glucose', name: '葡萄糖', type: 'metabolite', x: 100, y: 100 },
        { id: 'g6p', name: '葡萄糖-6-磷酸', type: 'metabolite', x: 200, y: 100 },
        { id: 'f6p', name: '果糖-6-磷酸', type: 'metabolite', x: 300, y: 100 },
        { id: 'f16bp', name: '果糖-1,6-二磷酸', type: 'metabolite', x: 400, y: 100 },
        { id: 'g3p', name: '甘油醛-3-磷酸', type: 'metabolite', x: 500, y: 150 },
        { id: 'dhap', name: '二羟丙酮磷酸', type: 'metabolite', x: 500, y: 50 },
        { id: 'enzyme1', name: '己糖激酶', type: 'enzyme', ec: '2.7.1.1', x: 150, y: 70 },
        { id: 'enzyme2', name: '葡萄糖-6-磷酸异构酶', type: 'enzyme', ec: '5.3.1.9', x: 250, y: 70 },
        { id: 'enzyme3', name: '磷酸果糖激酶', type: 'enzyme', ec: '2.7.1.11', x: 350, y: 70 },
        { id: 'enzyme4', name: '醛缩酶', type: 'enzyme', ec: '4.1.2.13', x: 450, y: 70 }
    ];
    
    links = [
        { source: 'glucose', target: 'g6p', type: 'synthesis', name: '葡萄糖磷酸化', enzyme: 'enzyme1',考点: '关键限速步骤' },
        { source: 'g6p', target: 'f6p', type: 'synthesis', name: '葡萄糖-6-磷酸异构化', enzyme: 'enzyme2' },
        { source: 'f6p', target: 'f16bp', type: 'synthesis', name: '果糖-6-磷酸磷酸化', enzyme: 'enzyme3',考点: '糖酵解的主要调控点' },
        { source: 'f16bp', target: 'g3p', type: 'decomposition', name: '果糖-1,6-二磷酸分解', enzyme: 'enzyme4' },
        { source: 'f16bp', target: 'dhap', type: 'decomposition', name: '果糖-1,6-二磷酸分解', enzyme: 'enzyme4' }
    ];
    
    // 初始化图谱
    initializeMap();
    
    // 生成反应列表
    generateReactionsList();
}

// 初始化图谱
function initializeMap() {
    // 清除现有内容
    svg.selectAll('*').remove();
    
    // 重置能量标签变量
    energyLabels = null;
    
    // 过滤掉酶节点，只保留代谢物和其他类型的节点
    const nonEnzymeNodes = nodes.filter(node => node.type !== 'enzyme');
    
    // 确保每个节点都有初始位置
    nonEnzymeNodes.forEach(node => {
        node.fx = node.x || Math.random() * 800; // 确保有初始位置避免重叠
        node.fy = node.y || Math.random() * 600;
    });
    
    // 创建节点ID到节点对象的映射
    const nodeMap = {};
    nonEnzymeNodes.forEach(node => {
        nodeMap[node.id] = node;
    });
    
    // 过滤连线，确保source和target都是非酶节点
    const validLinks = links.filter(link => {
        // 检查source和target是否都是有效的非酶节点
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        return nodeMap[sourceId] && nodeMap[targetId];
    });
    
    // 设置模拟，但使用固定位置
    simulation = d3.forceSimulation(nonEnzymeNodes)
        .force('link', d3.forceLink(validLinks).id(d => d.id).distance(80))
        .force('charge', d3.forceManyBody().strength(-150)) // 增加斥力以避免节点过于密集
        .force('center', d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2))
        .stop(); // 停止模拟，不进行力导向计算
    
    // 创建缩放行为
    zoom = d3.zoom()
        .scaleExtent([0.05, 5]) // 扩大缩放范围以适应更多数据
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
            currentZoom = event.transform.k;
            
            // 根据缩放级别调整文本大小
            const textScale = Math.max(0.5, Math.min(1.5, 1 / event.transform.k));
            g.selectAll('.formula-label, .name-label')
                .style('font-size', d => d.type === 'enzyme' ? `${12 * textScale}px` : `${10 * textScale}px`);
        });
    
    // 应用缩放行为到SVG
    svg.call(zoom);
    
    // 创建可缩放的容器组
    g = svg.append('g');
    
    // 重置缩放
    resetZoom();
    
    // 创建连线 - 使用路径代替线条，以支持箭头
    const link = g.append('g')
        .attr('class', 'links')
        .selectAll('path')
        .data(validLinks)
        .enter().append('path')
        .attr('class', d => `link ${d.type} ${d.direction || 'forward'}`)
        .attr('stroke-width', 1.5) // 稍微减小线条宽度以适应更多连线
        .attr('fill', 'none')
        .style('opacity', 0.7); // 添加透明度以减少视觉混乱
    
    // 创建箭头标记定义
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 10)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', '#666');
    
    // 创建双向箭头标记定义 - 反向箭头
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead-reverse')
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 0)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M10,-5L0,0L10,5')
        .attr('fill', '#666');
    
    // 创建节点 - 将圆形节点替换为显示化学式的文本节点
    const node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('g')
        .data(nonEnzymeNodes)
        .enter().append('g')
        .attr('class', 'node-group')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended));
    
    // 添加化学式作为主要节点显示
    node.append('text')
        .attr('class', 'node-formula')
        .text(d => d.formula || d.id) // 使用化学式，如果没有则使用ID
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('font-size', '14px')
        .attr('font-weight', 'bold')
        .attr('fill', '#3498db')
        .style('paint-order', 'stroke')
        .style('stroke', 'white')
        .style('stroke-width', '2px');
    
    // 添加中文名作为次要标签
    node.append('text')
        .attr('class', 'node-name')
        .text(d => d.name)
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '1.5em') // 放在化学式下方
        .attr('font-size', '10px')
        .attr('fill', '#666');
    
    // 为节点组添加背景矩形以提高可见性
    node.append('rect')
        .attr('class', 'node-background')
        .attr('fill', 'rgba(255, 255, 255, 0.8)')
        .attr('rx', 4)
        .attr('ry', 4)
        .attr('stroke', '#ddd')
        .attr('stroke-width', '1px')
        .attr('width', function(d) {
            // 估算宽度，根据文本内容动态调整
            const formula = d.formula || d.id;
            const name = d.name;
            const maxLength = Math.max(formula.length, name.length);
            return Math.max(60, maxLength * 10); // 最小60px，根据字符数增加
        })
        .attr('height', '45')
        .attr('x', function() {
            return -this.getAttribute('width') / 2;
        })
        .attr('y', '-15');
    
    // 调整图层顺序，确保文字在背景上方
    node.selectAll('text').raise();
    
    // 移除酶的特殊处理，因为我们不再显示酶作为单独节点
    
    // 移除直接显示的考点图标，改为点击时才显示考点信息
    // 考点信息将在showLinkInfo函数中通过tooltip显示
    
    // 设置提示框事件 - 节点组保持鼠标悬停显示基本信息
    node.on('mouseover', showNodeInfo)
        .on('mouseout', hideTooltip);
    
    // 确保节点组可以响应鼠标事件
    node.style('cursor', 'pointer');
    
    // 修改为点击时才显示详细信息（包括考点）
    link.on('mouseover', function(event, d) {
        // 鼠标悬停时只显示基本信息，不显示考点
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
        
        const content = tooltip.querySelector('.tooltip-content');
        if (!content) return;
        
        let html = `<h4>${d.name}</h4>`;
        html += `<p><strong>类型:</strong> ${d.type === 'synthesis' ? '合成反应' : '分解反应'}</p>`;
        
        // 添加酶信息
        const enzymeNode = nodes.find(n => n.id === d.enzyme);
        if (enzymeNode) {
            html += `<p><strong>酶:</strong> ${enzymeNode.name}</p>`;
            if (enzymeNode.ec) {
                html += `<p><strong>EC号:</strong> ${enzymeNode.ec}</p>`;
            }
        }
        
        // 不显示考点信息
        
        content.innerHTML = html;
        
        // 设置位置
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.style.display = 'block';
    })
    .on('mouseout', hideTooltip)
    .on('click', showLinkInfo); // 点击时显示完整信息，包括考点
    
    // 先移除可能存在的旧酶标签组，避免重复创建
    g.select('.enzyme-label-groups').remove();
    
    // 添加酶名称标签和反应条件标签到连线上
    const enzymeLabelGroups = g.append('g')
        .attr('class', 'enzyme-label-groups')
        .selectAll('g')
        .data(validLinks.filter(d => d.enzyme))
        .enter().append('g')
        .attr('class', 'enzyme-label-group');
    
    // 添加虚线反应标签（用小框显示在酶上方）
    enzymeLabelGroups.filter(d => d.虚线反应)
        .append('text')
        .attr('class', 'dashed-reaction-label')
        .text(d => d.虚线反应)
        .attr('font-size', '8px')
        .attr('fill', '#e74c3c')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '-15') // 放在酶上方
        .attr('pointer-events', 'none')
        .style('paint-order', 'stroke fill')
        .style('stroke', 'white')
        .style('stroke-width', '1px')
        .style('font-weight', 'bold');
    
    // 为虚线反应标签添加背景框
    enzymeLabelGroups.filter(d => d.虚线反应)
        .append('rect')
        .attr('class', 'dashed-reaction-box')
        .attr('x', function(d) {
            // 创建临时元素来测量文本宽度
            const tempText = d3.select('body').append('text')
                .style('font-size', '8px')
                .style('font-weight', 'bold')
                .text(d.虚线反应 || '');
            const textWidth = tempText.node().getComputedTextLength();
            tempText.remove(); // 移除临时元素
            return -textWidth / 2 - 4; // 左右各留4像素边距
        })
        .attr('y', '-22')
        .attr('width', function(d) {
            // 创建临时元素来测量文本宽度
            const tempText = d3.select('body').append('text')
                .style('font-size', '8px')
                .style('font-weight', 'bold')
                .text(d.虚线反应 || '');
            const textWidth = tempText.node().getComputedTextLength();
            tempText.remove(); // 移除临时元素
            return textWidth + 8; // 左右各留4像素边距
        })
        .attr('height', '14')
        .attr('rx', '2')
        .attr('ry', '2')
        .attr('fill', 'rgba(255, 255, 255, 0.9)')
        .attr('stroke', '#e74c3c')
        .attr('stroke-width', '1')
        .attr('pointer-events', 'none')
        .attr('z-index', 10);
    
    // 确保产物标签也能正确显示
    enzymeLabelGroups.filter(d => d.产物)
        .append('text')
        .attr('class', 'product-label')
        .text(d => `产物: ${d.产物}`)
        .attr('font-size', '7px')
        .attr('fill', '#2ecc71')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '-30') // 放在虚线反应标签上方
        .attr('pointer-events', 'none')
        .style('paint-order', 'stroke fill')
        .style('stroke', 'white')
        .style('stroke-width', '1px')
        .style('font-weight', 'normal');
    
    // 添加反应条件标签（放在酶下方一行）
    enzymeLabelGroups.filter(d => d.条件)
        .append('text')
        .attr('class', 'reaction-condition-label')
        .text(d => d.条件)
        .attr('font-size', '6px') // 与酶标签保持一致的较小字体
        .attr('fill', '#3498db')
        .attr('text-anchor', 'middle')
        .attr('alignment-baseline', 'middle')
        .attr('dy', '15')  // 调整到酶下方一行
        .style('z-index', 200) // 确保在顶层显示
        .attr('transform', 'rotate(-90)') // 对于旋转的标签，需要反向旋转文本以保持可读性
        .attr('pointer-events', 'none')
        .style('paint-order', 'stroke fill')
        .style('stroke', 'white')
        .style('stroke-width', '1px')
        .style('font-weight', 'normal')
        .style('z-index', 200)  // 提高层级，确保显示在其他元素之上
        .style('background-color', 'rgba(255, 255, 255, 0.8)')
        .style('padding', '1px 2px')
        .style('display', 'block')  // 确保显示
        .style('white-space', 'nowrap');
    
    // 添加酶名称标签和灯泡图标（吸附在连接线上）
    enzymeLabelGroups.each(function(d) {
        const g = d3.select(this);
        
        // 查找酶的名称
        const enzymeNode = nodes.find(n => n.id === d.enzyme);
        const enzymeName = enzymeNode ? enzymeNode.name : d.enzyme;
        
        // 创建包含酶名称和灯泡图标的复合文本
        const textGroup = g.append('g')
            .attr('class', 'enzyme-text-group')
            .attr('text-anchor', 'middle')
            .attr('alignment-baseline', 'middle');
        
        // 添加酶名称
        const enzymeText = textGroup.append('text')
            .attr('class', 'enzyme-label')
            .text(enzymeName)
            .attr('font-size', '6px')
            .attr('fill', '#333')
            .attr('dy', '0')
            .style('background-color', 'rgba(255, 255, 255, 0.9)')
            .style('padding', '1px 2px')
            .style('paint-order', 'stroke fill')
            .style('stroke', 'white')
            .style('stroke-width', '1px')
            .style('display', 'inline-block');
        
        // 如果有考点，在酶名称右侧添加灯泡图标
        if (d.考点) {
            // 简化实现：直接使用 tspan 将灯泡图标添加到同一个文本元素中
            enzymeText.append('tspan')
                .attr('class', 'exam-point-icon')
                .text(' 💡') // 注意前面有个空格作为间距
                .attr('font-size', '8px')
                .attr('pointer-events', 'all')
                .attr('cursor', 'pointer')
                .on('mouseover', (event) => {
                    event.stopPropagation();
                    showExamPoint(event, d);
                })
                .on('mouseout', hideTooltip)
                .on('click', (event) => {
                    event.stopPropagation();
                    showExamPoint(event, d);
                })
                .style('stroke', 'white')
                .style('stroke-width', '2px')
                .style('z-index', 200);
        }
    });
    
    // 为酶标签组添加指针事件和鼠标样式
    enzymeLabelGroups
        .attr('pointer-events', 'all')
        .attr('cursor', 'help')
        .style('z-index', 150); // 确保在连接线上方
    
    // 先移除可能存在的旧能量变化标签组，避免重复创建
    g.select('.energy-labels').remove();
    
    // 创建能量变化标签组
    energyLabels = g.append('g')
        .attr('class', 'energy-labels')
        .selectAll('g.energy-label-group')
        .data(validLinks.filter(d => d.能量变化))
        .enter()
        .append('g')
        .attr('class', 'energy-label-group');
    
    // 为每个有能量变化的反应添加小框
    energyLabels.append('rect')
        .attr('class', 'energy-box')
        .attr('rx', 4) // 圆角
        .attr('ry', 4)
        .style('fill', '#f8f9fa')
        .style('stroke', '#ced4da')
        .style('stroke-width', 1)
        .style('z-index', 150);
    
    // 添加能量变化文本
    energyLabels.append('text')
        .attr('class', 'energy-text')
        .style('font-size', '10px')
        .style('font-weight', 'bold')
        .style('text-anchor', 'middle')
        .style('alignment-baseline', 'middle')
        .style('fill', '#333')
        .style('z-index', 151);
    
    // 灯泡图标已在上面的代码块中实现，不再需要单独添加
    
    // 仅在酶标签组中显示灯泡图标，已在上面实现
    
    // 为酶标签组添加鼠标事件
    enzymeLabelGroups.on('mouseover', function(event, d) {
        // 找到对应的酶节点信息
        const enzymeNode = nodes.find(n => n.id === d.enzyme);
        if (enzymeNode) {
            // 显示酶的详细信息
            const tooltip = document.getElementById('tooltip');
            const tooltipContent = tooltip.querySelector('.tooltip-content');
            if (tooltipContent) {
                tooltipContent.innerHTML = `<strong>${enzymeNode.name}</strong><br>EC: ${enzymeNode.ec}`;
            } else {
                // 如果tooltip-content不存在，重新创建它
                tooltip.innerHTML = `<div class="tooltip-content"><strong>${enzymeNode.name}</strong><br>EC: ${enzymeNode.ec}</div>`;
            }
            tooltip.style.display = 'block';
            tooltip.style.left = (event.pageX + 10) + 'px';
            tooltip.style.top = (event.pageY - 10) + 'px';
        }
    })
    .on('mouseout', hideTooltip);
    
    // 确保标签组可以响应鼠标事件
    enzymeLabelGroups.style('pointer-events', 'all');
    
    // 自测模式点击事件
    nodeLabel.on('click', handleNodeClick);
    
    // 更新位置
    simulation.on('tick', () => {
        // 更新连线路径和箭头
        link
            .attr('d', d => {
                // 计算路径，使用直线连接
                return `M ${d.source.x} ${d.source.y} L ${d.target.x} ${d.target.y}`;
            })
            .attr('marker-end', d => d.direction !== 'bidirectional' ? 'url(#arrowhead)' : 'url(#arrowhead)')
            .attr('marker-start', d => d.direction === 'bidirectional' ? 'url(#arrowhead-reverse)' : null)
            // 为可逆反应添加特殊样式
            .attr('stroke-dasharray', d => d.direction === 'bidirectional' ? '5,3' : 'none')
            .attr('class', d => `link solid-link ${d.direction || 'forward'}`)
            // 直接设置颜色，确保优先于CSS样式
            .style('stroke', d => {
                if (d.type === 'synthesis') return '#3498db'; // 合成反应蓝色
                if (d.type === 'decomposition') return '#e74c3c'; // 分解反应红色
                return '#000'; // 其他反应黑色
            })
            .style('pointer-events', 'all') // 确保连线可以响应鼠标事件
            .style('cursor', 'pointer'); // 鼠标悬停时显示指针
        
        // 更新节点组位置，现在是g元素而不是circle元素
        node
            .attr('transform', d => `translate(${d.x}, ${d.y})`);
        
        // 更新节点标签组位置
        nodeLabel
            .attr('transform', d => `translate(${d.x},${d.y})`);
        
        // 更新酶标签组位置 - 放在连线中点，但稍微偏移以避免与线条重叠
        g.selectAll('.enzyme-label-group')
            .attr('transform', d => {
                // 计算连线中点
                const x = (d.source.x + d.target.x) / 2;
                // 稍微偏移以避免与线条重叠
                const y = (d.source.y + d.target.y) / 2 - 10; // 向上偏移10像素
                
                // 计算连线角度
                const dx = d.target.x - d.source.x;
                const dy = d.target.y - d.source.y;
                const angle = Math.atan2(dy, dx) * 180 / Math.PI;
                
                // 对于水平线，使用标准位置；对于斜线，旋转文本以匹配连线角度
                return `translate(${x}, ${y}) rotate(${angle})`;
            });
        
        // 为连线添加点击事件，实现直接点击高亮
        g.selectAll('.link')
            .on('click', function(event, d) {
                event.stopPropagation();
                const linkIndex = links.findIndex(link => link.source === d.source && link.target === d.target && link.name === d.name);
                if (linkIndex !== -1) {
                    highlightReaction(linkIndex);
                }
            });
        
        // 更新能量变化标签位置和内容 - 放在酶标签上方更远的位置，避免重叠
        g.selectAll('.energy-label-group')
            .attr('transform', function(d) {
                // 找到对应的酶节点
                const enzymeNode = nodes.find(node => node.id === d.enzyme);
                if (!enzymeNode) return '';
                
                // 将能量变化标签放在酶标签上方30像素，更远一些避免重叠
                return `translate(${enzymeNode.x}, ${enzymeNode.y - 30})`;
            })
            .select('.energy-text')
            .text(d => d.能量变化);
        
        // 更新能量变化框的大小和位置
        g.selectAll('.energy-box')
            .attr('x', function() {
                // 计算文本宽度，并据此设置框的位置和大小
                const textElement = this.nextElementSibling;
                if (!textElement) return 0;
                
                // 由于我们需要计算DOM节点的实际宽度，需要临时测量
                const textWidth = textElement.getComputedTextLength() || 60; // 默认宽度作为后备
                return -textWidth / 2 - 5; // 左右各留5像素边距
            })
            .attr('y', -7) // 居中对齐
            .attr('width', function() {
                // 计算文本宽度，并据此设置框的宽度
                const textElement = this.nextElementSibling;
                if (!textElement) return 0;
                
                const textWidth = textElement.getComputedTextLength() || 60; // 默认宽度作为后备
                return textWidth + 10; // 左右各留5像素边距
            })
            .attr('height', 14); // 固定高度
        
        // 确保所有连接都是实线，没有虚线
        g.selectAll('.link')
            .attr('stroke-dasharray', 'none') // 明确设置为none，确保没有虚线效果
            .style('stroke', d => {
                if (d.type === 'synthesis') return '#3498db'; // 合成反应蓝色
                if (d.type === 'decomposition') return '#e74c3c'; // 分解反应红色
                return '#000'; // 其他反应黑色
            })
            .style('stroke-width', 1.5) // 使用style而不是attr来确保优先级
            .attr('class', d => `link solid-link ${d.type || ''}`); // 确保使用实线样式类
        
        // 不再添加虚线指示器，改为在酶上方显示小框
        
        // 更新考点灯泡图标的位置
        g.selectAll('.exam-points')
            .attr('transform', function(d) {
                try {
                    // 处理source和target可能是节点对象或ID的情况
                    const sourceNode = typeof d.source === 'object' ? d.source : nodes.find(n => n.id === d.source);
                    const targetNode = typeof d.target === 'object' ? d.target : nodes.find(n => n.id === d.target);
                    
                    if (sourceNode && targetNode && sourceNode.x !== undefined && targetNode.x !== undefined) {
                        const x = (sourceNode.x + targetNode.x) / 2;
                        // 调整垂直偏移，确保在条件标签下方，避免重叠
                        const y = (sourceNode.y + targetNode.y) / 2 + 35; 
                        return `translate(${x}, ${y})`;
                    }
                } catch (error) {
                    console.error('Error updating exam point position:', error);
                }
                return '';
            });
    });
    
    // 窗口大小改变时重新调整，但保持节点固定位置
    window.addEventListener('resize', () => {
        // 保持节点相对位置不变
        simulation.force('center', d3.forceCenter(svg.node().clientWidth / 2, svg.node().clientHeight / 2));
    });
}

// 生成反应列表 - 按代谢途径分组
function generateReactionsList() {
    const container = document.getElementById('reactions-container');
    container.innerHTML = '';
    
    // 按代谢途径分组反应 - 移除"其他"类别
    const pathwayGroups = {
        '糖酵解': [],
        '三羧酸循环': [],
        '磷酸戊糖途径': [],
        '糖原代谢': [],
        '糖异生': [],
        '脂肪酸代谢': [],
        '电子传递链': [],
        '氨基酸代谢': [],
        '核苷酸代谢': [],
        '能量代谢': [], // 新增能量代谢分类
        '乙醛酸循环': [],
        '光合作用': []
    };
    // 添加一个集合存储所有已知途径
    const knownPathways = Object.keys(pathwayGroups);
    
    // 为每个途径组添加可折叠功能
    function createCollapsibleGroup(title, reactions) {
        if (reactions.length === 0) return;
        
        const groupDiv = document.createElement('div');
        groupDiv.className = 'pathway-group';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'pathway-title collapsible';
        titleDiv.textContent = title + ` (${reactions.length})`;
        titleDiv.addEventListener('click', () => {
            titleDiv.classList.toggle('active');
            contentDiv.classList.toggle('show');
        });
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'pathway-content';
        
        reactions.forEach((reactionObj) => {
            const link = reactionObj.link;
            const item = document.createElement('div');
            item.className = 'reaction-item';
            item.dataset.index = reactionObj.index;
            
            // 显示反应名称、酶和类型
            let displayText = link.name || '';
            if (link.enzyme) {
                displayText += ` [${link.enzyme}]`;
            }
            
            // 添加反应类型指示器
            const typeIndicator = document.createElement('span');
            typeIndicator.className = 'reaction-type-indicator';
            if (link.type === 'synthesis') {
                typeIndicator.style.backgroundColor = '#3498db'; // 合成反应
            } else if (link.type === 'decomposition') {
                typeIndicator.style.backgroundColor = '#e74c3c'; // 分解反应
            } else {
                typeIndicator.style.backgroundColor = '#999'; // 其他反应
            }
            
            item.appendChild(typeIndicator);
            item.appendChild(document.createTextNode(displayText));
            
            // 添加点击事件
            item.addEventListener('click', () => highlightReaction(reactionObj.index));
            
            contentDiv.appendChild(item);
        });
        
        groupDiv.appendChild(titleDiv);
        groupDiv.appendChild(contentDiv);
        return groupDiv;
    }
    
    // 分类反应
    links.forEach((link, index) => {
        // 为每个link添加index属性，以便在高亮时使用
        link.index = index;
        
        let pathway = '未分类';
        const reactionName = link.name ? link.name.toLowerCase() : '';
        // 处理link.source和link.target可能是对象的情况
        const sourceId = typeof link.source === 'object' && link.source.id ? link.source.id.toLowerCase() : (typeof link.source === 'string' ? link.source.toLowerCase() : '');
        const targetId = typeof link.target === 'object' && link.target.id ? link.target.id.toLowerCase() : (typeof link.target === 'string' ? link.target.toLowerCase() : '');
        
        // 能量代谢相关反应 - 优先检查，因为这些分子参与多个途径
        // 加强条件，确保能够匹配到所有ATP等能量转化相关反应
        if ((reactionName.includes('atp') || reactionName.includes('adp') || 
            reactionName.includes('nadp') || reactionName.includes('nadph') || 
            reactionName.includes('nadh') || reactionName.includes('fadh2') ||
            reactionName.includes('氧化磷酸化') || reactionName.includes('底物水平磷酸化') ||
            reactionName.includes('gtp') || reactionName.includes('gdp') ||
            reactionName.includes('能量') || reactionName.includes('磷酸化')) ||
            (sourceId === 'atp' || targetId === 'atp' ||
             sourceId === 'adp' || targetId === 'adp' ||
             sourceId === 'nadp' || targetId === 'nadp' ||
             sourceId === 'nadph' || targetId === 'nadph' ||
             sourceId === 'nadh' || targetId === 'nadh' ||
             sourceId === 'fadh2' || targetId === 'fadh2' ||
             sourceId === 'pi' || targetId === 'pi')) {
            pathway = '能量代谢';
        } 
        // 糖酵解途径
        else if (reactionName.includes('糖酵') || 
                 (reactionName.includes('磷酸化') && reactionName.includes('葡萄糖')) ||
                 reactionName.includes('二磷酸甘油酸') || 
                 reactionName.includes('磷酸烯醇式丙酮酸') ||
                 sourceId.includes('glucose') || targetId.includes('glucose') ||
                 sourceId.includes('pyruvate') || targetId.includes('pyruvate')) {
            pathway = '糖酵解';
        } 
        // 三羧酸循环
        else if (reactionName.includes('三羧酸') || 
                 reactionName.includes('柠檬酸') || 
                 reactionName.includes('酮戊二酸') || 
                 reactionName.includes('琥珀酸') ||
                 reactionName.includes('草酰乙酸') ||
                 reactionName.includes('苹果酸') ||
                 reactionName.includes('延胡索酸') ||
                 sourceId.includes('acetyl_coa') || targetId.includes('acetyl_coa')) {
            pathway = '三羧酸循环';
        } 
        // 磷酸戊糖途径
        else if (reactionName.includes('戊糖') || 
                 reactionName.includes('己糖') ||
                 reactionName.includes('核糖') ||
                 reactionName.includes('木酮糖') ||
                 reactionName.includes('景天庚酮糖') ||
                 reactionName.includes('赤藓糖')) {
            pathway = '磷酸戊糖途径';
        } 
        // 糖原代谢
        else if (reactionName.includes('糖原') ||
                 sourceId.includes('glycogen') || targetId.includes('glycogen') ||
                 sourceId.includes('udp_glucose') || targetId.includes('udp_glucose')) {
            pathway = '糖原代谢';
        } 
        // 糖异生
        else if (reactionName.includes('糖异生') ||
                 reactionName.includes('乳酸') ||
                 sourceId.includes('lactate') || targetId.includes('lactate') ||
                 sourceId.includes('alanine') || targetId.includes('alanine')) {
            pathway = '糖异生';
        } 
        // 脂肪酸代谢
        else if (reactionName.includes('脂肪酸') || 
                 reactionName.includes('脂酰') || 
                 reactionName.includes('肉碱') ||
                 reactionName.includes('丙二酰') ||
                 reactionName.includes('β-氧化') ||
                 sourceId.includes('acyl_coa') || targetId.includes('acyl_coa') ||
                 sourceId.includes('malonyl_coa') || targetId.includes('malonyl_coa')) {
            pathway = '脂肪酸代谢';
        } 
        // 电子传递链
        else if (reactionName.includes('电子') || 
                 reactionName.includes('呼吸链') || 
                 reactionName.includes('atp合酶') ||
                 reactionName.includes('氧化') && (sourceId.includes('nadh') || sourceId.includes('fadh2')) ||
                 sourceId.includes('oxygen') || targetId.includes('oxygen') ||
                 sourceId.includes('water') || targetId.includes('water')) {
            pathway = '电子传递链';
        } 
        // 氨基酸代谢
        else if (reactionName.includes('氨基酸') || 
                 reactionName.includes('谷氨') || 
                 reactionName.includes('转氨酶') ||
                 reactionName.includes('天冬氨酸') ||
                 reactionName.includes('尿素') ||
                 sourceId.includes('glutamate') || targetId.includes('glutamate') ||
                 sourceId.includes('glutamine') || targetId.includes('glutamine') ||
                 sourceId.includes('aspartate') || targetId.includes('aspartate') ||
                 sourceId.includes('urea') || targetId.includes('urea')) {
            pathway = '氨基酸代谢';
        } 
        // 核苷酸代谢
        else if (reactionName.includes('核苷酸') || 
                 reactionName.includes('嘌呤') || 
                 reactionName.includes('嘧啶') ||
                 reactionName.includes('prpp') ||
                 sourceId.includes('prpp') || targetId.includes('prpp') ||
                 sourceId.includes('imp') || targetId.includes('imp') ||
                 sourceId.includes('amp') || targetId.includes('amp') ||
                 sourceId.includes('gmp') || targetId.includes('gmp')) {
            pathway = '核苷酸代谢';
        } 
        // 乙醛酸循环
        else if (reactionName.includes('乙醛酸')) {
            pathway = '乙醛酸循环';
        } 
        // 光合作用
        else if (reactionName.includes('光合') || reactionName.includes('卡尔文')) {
            pathway = '光合作用';
        }
        
        // 确保pathwayGroups对象中有对应的键
        if (!pathwayGroups[pathway]) {
            pathwayGroups[pathway] = [];
        }
        pathwayGroups[pathway].push({ link, index });
    });
    
    // 创建分组标题和反应项
    Object.entries(pathwayGroups).forEach(([pathway, reactions]) => {
        if (reactions.length > 0) {
            // 使用可折叠组
            const groupElement = createCollapsibleGroup(pathway, reactions);
            if (groupElement) {
                container.appendChild(groupElement);
            }
        }
    });
    
    // 如果有未分类的反应，创建"未分类"组
    if (pathwayGroups['未分类'] && pathwayGroups['未分类'].length > 0) {
        const unclassifiedGroup = createCollapsibleGroup('未分类', pathwayGroups['未分类']);
        if (unclassifiedGroup) {
            container.appendChild(unclassifiedGroup);
        }
    }
}

// 初始化侧边栏收放功能
function initSidebarToggle() {
    const sidebar = document.querySelector('.sidebar');
    const collapseBtn = document.getElementById('collapse-sidebar-btn');
    
    collapseBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        collapseBtn.textContent = sidebar.classList.contains('collapsed') ? '▶ 展开' : '◀ 收起';
        
        // 调整画布容器的宽度
        const canvasContainer = document.querySelector('.canvas-container');
        if (sidebar.classList.contains('collapsed')) {
            canvasContainer.style.width = 'calc(100% - 50px)';
        } else {
            canvasContainer.style.width = 'calc(100% - 320px)';
        }
        
        // 重新渲染图谱以适应新布局
        renderMap();
    });
}

// 优化的高亮反应函数
function highlightReaction(index) {
    // 重置所有元素的透明度，确保取消高亮后所有元素都显示正常
    function resetAllStyles() {
        // 移除所有高亮
        g.selectAll('.link').classed('highlighted', false)
            .style('stroke-width', '') // 重置样式
            .style('stroke', '')
            .style('z-index', '')
            .style('filter', 'none') // 移除发光效果
            .style('opacity', '1'); // 重置透明度为1
        
        g.selectAll('.enzyme-label-group').classed('highlighted', false)
            .select('.enzyme-label')
            .style('font-weight', '')
            .style('background-color', '')
            .style('color', '')
            .style('padding', '')
            .style('border-radius', '')
            .style('box-shadow', 'none');
        
        // 重置节点样式 - 适配新的节点组结构
        g.selectAll('.node-group')
            .style('opacity', '1')
            .select('.node-background')
            .style('stroke-width', '1px')
            .style('stroke', '#fff')
            .style('filter', 'none');
        
        // 重置化学式文本样式
        g.selectAll('.node-formula')
            .style('fill', '#3498db')
            .style('font-weight', 'bold')
            .style('filter', 'none');
        
        // 特别确保所有酶标签组的透明度都重置为1
        g.selectAll('.enzyme-label-group')
            .style('opacity', '1');
        
        document.querySelectorAll('.reaction-item').forEach(item => {
            item.classList.remove('highlighted');
        });
    }
    
    // 检查是否是点击相同的反应，如果是则取消高亮
    if (index === currentlyHighlightedIndex) {
        resetAllStyles();
        
        // 重置当前高亮索引
        currentlyHighlightedIndex = -1;
        return;
    }
    
    // 移除所有高亮
    resetAllStyles();
    
    // 添加高亮 - 使用更强的视觉效果
    const link = links[index];
    if (!link) return;
    
    // 更新当前高亮索引
    currentlyHighlightedIndex = index;
    
    // 高亮连接线 - 进一步优化突出效果
    const selectedLink = g.selectAll('.link').filter((d, i) => i === index);
    selectedLink.classed('highlighted', true)
        .style('stroke-width', '8') // 更粗的线条，更突出
        .style('stroke', '#ff0000') // 红色更醒目
        .style('stroke-opacity', '1') // 完全不透明
        .style('z-index', '1000') // 非常高的层级
        .style('stroke-dasharray', d => d.direction === 'bidirectional' ? '5,3' : 'none')
        .style('filter', 'drop-shadow(0 0 8px rgba(255, 0, 0, 0.9))') // 更强的发光效果
        .raise(); // 将线条提升到最上层
    
    // 高亮酶标签组
    if (link && link.enzyme) {
        const enzymeGroup = g.selectAll('.enzyme-label-group').filter((d, i) => i === index);
        enzymeGroup.classed('highlighted', true)
            .select('.enzyme-label')
            .style('font-weight', 'bold')
            .style('background-color', '#ff0000')
            .style('color', 'white')
            .style('padding', '3px 8px')
            .style('border-radius', '4px')
            .style('box-shadow', '0 2px 8px rgba(255, 0, 0, 0.5)');
    }
    
    // 高亮相关节点
    let sourceNode, targetNode;
    if (typeof link.source === 'object') {
        sourceNode = link.source;
    } else {
        sourceNode = nodes.find(n => n.id === link.source);
    }
    
    if (typeof link.target === 'object') {
        targetNode = link.target;
    } else {
        targetNode = nodes.find(n => n.id === link.target);
    }
    
    if (sourceNode && sourceNode.id) {
        // 高亮源节点的背景和文本
        g.selectAll('.node-group').filter(d => d.id === sourceNode.id)
            .style('opacity', '1')
            .select('.node-background')
            .style('stroke-width', '3px')
            .style('stroke', '#ff0000')
            .style('filter', 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))')
            .raise(); // 确保边框在最上层
        
        // 高亮化学式文本
        g.selectAll('.node-group').filter(d => d.id === sourceNode.id)
            .select('.node-formula')
            .style('fill', '#ff0000')
            .style('font-weight', 'bold')
            .raise(); // 确保文本在最上层
    }
    
    if (targetNode && targetNode.id) {
        // 高亮目标节点的背景和文本
        g.selectAll('.node-group').filter(d => d.id === targetNode.id)
            .style('opacity', '1')
            .select('.node-background')
            .style('stroke-width', '3px')
            .style('stroke', '#ff0000')
            .style('filter', 'drop-shadow(0 0 5px rgba(255, 0, 0, 0.7))')
            .raise(); // 确保边框在最上层
        
        // 高亮化学式文本
        g.selectAll('.node-group').filter(d => d.id === targetNode.id)
            .select('.node-formula')
            .style('fill', '#ff0000')
            .style('font-weight', 'bold')
            .raise(); // 确保文本在最上层
    }
    
    // 降低其他元素的可见性，增强选中效果
    // 只有在实际高亮某个反应时才执行这些降低透明度的操作
    g.selectAll('.link').filter((d, i) => i !== index)
        .style('opacity', '0.3');
    
    // 降低其他节点组的可见性
    g.selectAll('.node-group').filter(d => {
        return !sourceNode || !targetNode || d.id !== sourceNode.id && d.id !== targetNode.id;
    }).style('opacity', '0.5');
    
    g.selectAll('.enzyme-label-group').filter((d, i) => i !== index)
        .style('opacity', '0.3');
    
    const reactionItem = document.querySelector(`.reaction-item[data-index="${index}"]`);
    if (reactionItem) {
        reactionItem.classList.add('highlighted');
    }
    
    // 聚焦到选中的反应
    if (!link) return; // 如果找不到连线，直接返回
    
    // 使用已声明的sourceNode和targetNode变量
    // 确保变量在使用前已定义
    if (!sourceNode || !targetNode) {
        if (typeof link.source === 'object') {
            sourceNode = link.source;
        } else {
            sourceNode = nodes.find(n => n.id === link.source);
        }
        
        if (typeof link.target === 'object') {
            targetNode = link.target;
        } else {
            targetNode = nodes.find(n => n.id === link.target);
        }
    }
    
    // 确保找到了源节点和目标节点
    if (sourceNode && targetNode && sourceNode.x !== undefined && targetNode.x !== undefined) {
        // 简单的居中逻辑
        const centerX = (sourceNode.x + targetNode.x) / 2;
        const centerY = (sourceNode.y + targetNode.y) / 2;
        
        // 调整视图中心
        svg.transition().duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(svg.node().clientWidth / 2, svg.node().clientHeight / 2).scale(currentZoom).translate(-centerX, -centerY));
        
        // 调整力导向图中心
        simulation.force('center', d3.forceCenter(centerX, centerY));
        simulation.alpha(0.3).restart();
    } else {
        console.warn('无法找到源节点或目标节点，跳过聚焦操作');
    }
}

// 显示节点信息
function showNodeInfo(event, d) {
    try {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
        
        // 确保tooltip-content元素存在
        let content = tooltip.querySelector('.tooltip-content');
        if (!content) {
            tooltip.innerHTML = '<div class="tooltip-content"></div>';
            content = tooltip.querySelector('.tooltip-content');
        }
        
        let html = `<h4>${d.name}</h4>`;
        html += `<p><strong>类型:</strong> ${d.type === 'enzyme' ? '酶' : '代谢物'}</p>`;
        
        if (d.type === 'enzyme' && d.ec) {
            html += `<p><strong>EC号:</strong> ${d.ec}</p>`;
        }
        
        if (d.formula) {
            html += `<p><strong>分子式:</strong> ${d.formula}</p>`;
        }
        
        content.innerHTML = html;
        
        // 设置位置
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.style.display = 'block';
    } catch (error) {
        console.error('显示节点信息时出错:', error);
    }
}

// 显示连线信息
function showLinkInfo(event, d) {
    try {
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) return;
        
        // 确保tooltip-content元素存在
        let content = tooltip.querySelector('.tooltip-content');
        if (!content) {
            tooltip.innerHTML = '<div class="tooltip-content"></div>';
            content = tooltip.querySelector('.tooltip-content');
        }
        
        let html = `<h4>${d.name}</h4>`;
        html += `<p><strong>类型:</strong> ${d.type === 'synthesis' ? '合成反应' : '分解反应'}</p>`;
        
        // 添加酶信息
        const enzymeNode = nodes.find(n => n.id === d.enzyme);
        if (enzymeNode) {
            html += `<p><strong>酶:</strong> ${enzymeNode.name}</p>`;
            if (enzymeNode.ec) {
                html += `<p><strong>EC号:</strong> ${enzymeNode.ec}</p>`;
            }
        }
        
        if (d.考点) {
            html += `<p><strong>考点:</strong> ${d.考点}</p>`;
        }
        
        content.innerHTML = html;
        
        // 设置位置
        tooltip.style.left = `${event.pageX + 10}px`;
        tooltip.style.top = `${event.pageY - 10}px`;
        tooltip.style.display = 'block';
    } catch (error) {
        console.error('显示连线信息时出错:', error);
    }
}

// 显示考点 - 增强版本
function showExamPoint(event, d) {
    try {
        // 获取tooltip元素
        const tooltip = document.getElementById('tooltip');
        if (!tooltip) {
            console.error('Tooltip元素未找到');
            return;
        }
        
        // 确保tooltip-content元素存在
        let tooltipContent = tooltip.querySelector('.tooltip-content');
        if (!tooltipContent) {
            // 如果不存在，创建新的content元素
            tooltip.innerHTML = '<div class="tooltip-content"></div>';
            tooltipContent = tooltip.querySelector('.tooltip-content');
        }
        
        // 构建考点信息
        let content = `<h4>考点提示</h4>`;
        
        // 显示酶信息 - 添加空值检查
        if (d && d.enzyme) {
            content += `<p><strong>酶:</strong> ${d.enzyme}</p>`;
        }
        
        // 显示考点 - 添加空值检查
        if (d && d.考点) {
            content += `<p><strong>考点:</strong> ${d.考点}</p>`;
        } else {
            content += `<p><strong>考点:</strong> 暂无考点信息</p>`;
        }
        
        // 显示反应名称 - 添加空值检查
        if (d && d.name) {
            content += `<p><strong>反应:</strong> ${d.name}</p>`;
        }
        
        // 如果有反应条件，也显示出来
        if (d && d.条件) {
            content += `<p><strong>条件:</strong> ${d.条件}</p>`;
        }
        
        // 如果有虚线反应，显示出来
        if (d && d.虚线反应) {
            content += `<p><strong>虚线反应:</strong> ${d.虚线反应}</p>`;
        }
        
        tooltipContent.innerHTML = content;
        
        // 设置位置，确保不超出视口
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        let left = event.pageX + 10;
        let top = event.pageY - 10;
        
        // 调整位置，避免超出视口
        if (left + tooltipWidth > viewportWidth) {
            left = event.pageX - tooltipWidth - 10;
        }
        if (top < 0) {
            top = 10;
        }
        if (top + tooltipHeight > viewportHeight) {
            top = viewportHeight - tooltipHeight - 10;
        }
        
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.display = 'block';
        tooltip.style.visibility = 'visible';
        tooltip.style.opacity = '1';
        tooltip.style.pointerEvents = 'none';
    } catch (error) {
        console.error('显示考点信息时出错:', error);
    }
}

// 隐藏提示框
function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// 处理节点点击（自测模式）
function handleNodeClick(event, d) {
    if (quizMode && d.type === 'enzyme') {
        const quizInput = document.getElementById('quiz-input');
        const answerInput = document.getElementById('answer-input');
        
        // 保存当前节点ID
        quizInput.dataset.nodeId = d.id;
        quizInput.dataset.correctAnswer = d.name;
        
        // 设置位置
        quizInput.style.left = `${event.pageX + 10}px`;
        quizInput.style.top = `${event.pageY + 10}px`;
        quizInput.style.display = 'block';
        
        // 聚焦输入框
        answerInput.value = '';
        answerInput.focus();
    }
}

// 提交自测答案
function submitQuizAnswer() {
    const quizInput = document.getElementById('quiz-input');
    const answerInput = document.getElementById('answer-input');
    const userAnswer = answerInput.value.trim();
    const correctAnswer = quizInput.dataset.correctAnswer;
    const nodeId = quizInput.dataset.nodeId;
    
    // 判断答案
    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    
    // 显示反馈
    if (isCorrect) {
        alert('回答正确！');
        // 恢复标签显示
        svg.selectAll('.node-label')
            .filter(d => d.id === nodeId)
            .text(d => d.name);
    } else {
        alert(`回答错误！正确答案是：${correctAnswer}`);
    }
    
    // 隐藏输入框
    quizInput.style.display = 'none';
}

// 切换模式
function switchMode(mode) {
    currentMode = mode;
    
    // 更新按钮状态
    document.getElementById('research-mode-btn').classList.toggle('active', mode === 'research');
    document.getElementById('teaching-mode-btn').classList.toggle('active', mode === 'teaching');
    
    // 显示/隐藏教学版控制
    document.querySelector('.teaching-controls').style.display = mode === 'teaching' ? 'flex' : 'none';
    
    // 重置状态
    resetTeachingState();
    
    // 重新初始化图谱
    initializeMap();
}

// 重置教学状态
function resetTeachingState() {
    quizMode = false;
    playing = false;
    animationStep = 0;
    
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
    }
    
    document.getElementById('play-btn').textContent = '▶ 播放反应';
    
    // 恢复所有标签（确保g已初始化）
    if (g) {
        g.selectAll('.node-label-group')
            .select('.name-label')
            .text(d => d.name);
    }
}

// 切换自测模式
function toggleQuizMode() {
    quizMode = !quizMode;
    
    if (quizMode) {
        // 隐藏酶标签
        g.selectAll('.node-label-group')
            .filter(d => d.type === 'enzyme')
            .select('.name-label')
            .text('?');
        
        document.getElementById('quiz-mode-btn').style.backgroundColor = '#e74c3c';
        document.getElementById('quiz-mode-btn').textContent = '退出自测';
    } else {
        // 恢复所有标签
        g.selectAll('.node-label-group')
            .filter(d => d.type === 'enzyme')
            .select('.name-label')
            .text(d => d.name);
        
        document.getElementById('quiz-mode-btn').style.backgroundColor = '#9b59b6';
        document.getElementById('quiz-mode-btn').textContent = '自测模式';
    }
}

// 播放/暂停反应动画
function togglePlay() {
    if (playing) {
        // 暂停
        clearInterval(animationInterval);
        document.getElementById('play-btn').textContent = '▶ 播放反应';
    } else {
        // 播放
        animationInterval = setInterval(() => {
            if (animationStep < links.length) {
                // 高亮当前反应
                g.selectAll('.link').classed('highlighted', false);
                g.selectAll('.link').filter((d, i) => i === animationStep).classed('highlighted', true);
                
                // 聚焦到当前反应
                const link = links[animationStep];
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                const centerX = (sourceNode.x + targetNode.x) / 2;
                const centerY = (sourceNode.y + targetNode.y) / 2;
                
                svg.transition().duration(750)
                    .call(zoom.transform, d3.zoomIdentity.translate(svg.node().clientWidth / 2, svg.node().clientHeight / 2).scale(currentZoom).translate(-centerX, -centerY));
                
                animationStep++;
            } else {
                // 重置
                clearInterval(animationInterval);
                animationStep = 0;
                playing = false;
                document.getElementById('play-btn').textContent = '▶ 播放反应';
            }
        }, 2000); // 每个反应显示2秒
        
        document.getElementById('play-btn').textContent = '⏸ 暂停';
    }
    
    playing = !playing;
}

// 搜索功能
function search(query) {
    if (!query.trim()) {
        // 重置所有高亮
        g.selectAll('.node, path.link').classed('highlighted', false);
        // 恢复节点原始大小
        g.selectAll('.node')
            .attr('r', d => d.type === 'enzyme' ? 12 : 15);
        return;
    }
    
    query = query.toLowerCase();
    
    // 搜索节点 - 添加分子式搜索
    const matchingNodes = nodes.filter(d => 
        d.name.toLowerCase().includes(query) ||
        (d.formula && d.formula.toLowerCase().includes(query)) ||
        (d.ec && d.ec.toLowerCase().includes(query))
    ).slice(0, 10); // 限制最多显示10个匹配节点
    
    // 搜索连线
    const matchingLinks = links.filter(d => 
        d.name.toLowerCase().includes(query) ||
        (d.考点 && d.考点.toLowerCase().includes(query))
    ).slice(0, 10); // 限制最多显示10个匹配连线
    
    // 重置所有高亮
    g.selectAll('.node, path.link').classed('highlighted', false);
    // 恢复节点原始大小
    g.selectAll('.node')
        .attr('r', d => d.type === 'enzyme' ? 12 : 15);
    
    // 高亮匹配的节点
    if (matchingNodes.length > 0) {
        g.selectAll('.node')
            .filter(d => matchingNodes.some(n => n.id === d.id))
            .classed('highlighted', true)
            .attr('r', 20); // 放大节点
        
        // 聚焦到第一个匹配的节点
        const firstNode = matchingNodes[0];
        svg.transition().duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(svg.node().clientWidth / 2, svg.node().clientHeight / 2).scale(currentZoom).translate(-firstNode.x, -firstNode.y));
        
        // 高亮与匹配节点相关的反应
        const relatedLinks = links.filter(link => 
            matchingNodes.some(node => node.id === link.source.id || node.id === link.target.id)
        ).slice(0, 15); // 限制相关反应数量
        
        g.selectAll('path.link')
            .filter(d => relatedLinks.some(l => l.source.id === d.source.id && l.target.id === d.target.id))
            .classed('highlighted', true);
    }
    
    // 高亮匹配的连线
    if (matchingLinks.length > 0) {
        g.selectAll('path.link')
            .filter(d => matchingLinks.some(l => l.source.id === d.source.id && l.target.id === d.target.id))
            .classed('highlighted', true);
    }
}

// 拖拽功能
function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    // 更新节点位置
    d.fx = event.x;
    d.fy = event.y;
    
    // 酶标签会在tick事件中自动更新位置，不需要在这里处理
}

function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    // 固定节点位置
    d.fx = d.x;
    d.fy = d.y;
    
    // 酶不再是单独节点，不需要固定酶节点位置
}

// 放大功能
function zoomIn() {
    if (svg && zoom) {
        svg.transition().duration(300)
            .call(zoom.scaleBy, 1.2);
    }
}

// 缩小功能
function zoomOut() {
    if (svg && zoom) {
        svg.transition().duration(300)
            .call(zoom.scaleBy, 0.8);
    }
}

// 重置缩放
function resetZoom() {
    if (svg && zoom) {
        currentZoom = 1;
        svg.transition().duration(300)
            .call(zoom.transform, d3.zoomIdentity);
    }
}

// 绑定事件监听器
function bindEventListeners() {
    // 模式切换
    document.getElementById('research-mode-btn').addEventListener('click', () => switchMode('research'));
    document.getElementById('teaching-mode-btn').addEventListener('click', () => switchMode('teaching'));
    
    // 教学版控制
    document.getElementById('play-btn').addEventListener('click', togglePlay);
    document.getElementById('reset-btn').addEventListener('click', resetTeachingState);
    document.getElementById('quiz-mode-btn').addEventListener('click', toggleQuizMode);
    
    // 缩放控制
    document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
    document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset-btn').addEventListener('click', resetZoom);
    
    // 搜索
    document.getElementById('search-input').addEventListener('input', (e) => search(e.target.value));
    
    // 自测输入
    document.getElementById('submit-answer').addEventListener('click', submitQuizAnswer);
    document.getElementById('cancel-answer').addEventListener('click', () => {
        document.getElementById('quiz-input').style.display = 'none';
    });
    
    // 按Enter提交答案
    document.getElementById('answer-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitQuizAnswer();
        }
    });
}

// 当页面加载完成时初始化应用
window.addEventListener('load', initApp);