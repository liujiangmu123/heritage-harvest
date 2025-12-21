/**
 * 生态知识问答数据
 * 包含水循环、材料、生物多样性、碳中和四类问题
 */

import { EcoQuestion, QuizCategory } from '@/types/eco'

/** 水循环相关问题 */
const waterQuestions: EcoQuestion[] = [
  {
    id: 'water-1',
    question: '哈尼梯田的"四素同构"生态系统不包括以下哪个元素？',
    options: ['森林', '村寨', '梯田', '工厂'],
    correctIndex: 3,
    explanation: '哈尼梯田的"四素同构"包括森林、村寨、梯田、水系，形成完整的生态循环系统。',
    category: 'water',
    difficulty: 'easy',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'water-2',
    question: '哈尼梯田的水源主要来自哪里？',
    options: ['地下水', '山顶森林涵养的水源', '人工引水', '雨水收集'],
    correctIndex: 1,
    explanation: '哈尼梯田的水源来自山顶森林涵养的水源，森林像海绵一样储存雨水，缓慢释放到梯田。',
    category: 'water',
    difficulty: 'easy',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'water-3',
    question: '传统茶园的灌溉方式相比现代农业可以节约多少水资源？',
    options: ['约10%', '约30%', '约50%', '约70%'],
    correctIndex: 2,
    explanation: '传统茶园采用自然降水和山泉灌溉，配合梯田蓄水，比现代喷灌系统节约约50%的水资源。',
    category: 'water',
    difficulty: 'medium',
    relatedHeritage: 'tea_ceremony'
  },
  {
    id: 'water-4',
    question: '蜡染工艺中，天然靛蓝染料相比化学染料可以减少多少废水污染？',
    options: ['30%', '50%', '70%', '90%'],
    correctIndex: 3,
    explanation: '天然靛蓝染料可生物降解，废水处理后可直接用于农田灌溉，减少90%以上的水污染。',
    category: 'water',
    difficulty: 'medium',
    relatedHeritage: 'batik'
  },
  {
    id: 'water-5',
    question: '哈尼梯田的水循环系统已经运行了多少年？',
    options: ['约500年', '约800年', '约1300年', '约2000年'],
    correctIndex: 2,
    explanation: '哈尼梯田有1300多年历史，其水循环系统是人类与自然和谐共处的典范。',
    category: 'water',
    difficulty: 'hard',
    relatedHeritage: 'hani_terrace'
  }
]

/** 材料相关问题 */
const materialQuestions: EcoQuestion[] = [
  {
    id: 'material-1',
    question: '竹子相比塑料，分解时间大约是多少？',
    options: ['1-2年', '3-5年', '10-20年', '100-500年'],
    correctIndex: 0,
    explanation: '竹子是天然材料，在自然环境中1-2年即可完全分解，而塑料需要100-500年。',
    category: 'material',
    difficulty: 'easy',
    relatedHeritage: 'bamboo_weaving'
  },
  {
    id: 'material-2',
    question: '凤翔泥塑使用的主要材料是什么？',
    options: ['化学粘土', '天然黄土', '石膏', '水泥'],
    correctIndex: 1,
    explanation: '凤翔泥塑使用当地天然黄土，不含任何化学添加剂，完全可降解。',
    category: 'material',
    difficulty: 'easy',
    relatedHeritage: 'clay_sculpture'
  },
  {
    id: 'material-3',
    question: '传统剪纸使用的宣纸，其主要原料是什么？',
    options: ['木浆', '青檀树皮和稻草', '竹浆', '棉花'],
    correctIndex: 1,
    explanation: '宣纸以青檀树皮和稻草为主要原料，采用传统工艺制作，完全可生物降解。',
    category: 'material',
    difficulty: 'medium',
    relatedHeritage: 'paper_cutting'
  },
  {
    id: 'material-4',
    question: '皮影戏的皮影材料主要来自什么？',
    options: ['塑料薄膜', '牛皮或驴皮', '合成革', '纸张'],
    correctIndex: 1,
    explanation: '传统皮影使用牛皮或驴皮制作，是畜牧业的副产品，体现了"物尽其用"的循环经济理念。',
    category: 'material',
    difficulty: 'easy',
    relatedHeritage: 'shadow_puppet'
  },
  {
    id: 'material-5',
    question: '藤编工艺中，一根藤条可以使用多少年？',
    options: ['1-2年', '5-10年', '20-30年', '50年以上'],
    correctIndex: 2,
    explanation: '优质藤编制品可使用20-30年，远超塑料制品的使用寿命，且可完全降解。',
    category: 'material',
    difficulty: 'medium',
    relatedHeritage: 'bamboo_weaving'
  },
  {
    id: 'material-6',
    question: '以竹代塑每年可以减少多少塑料垃圾？',
    options: ['约100万吨', '约500万吨', '约1000万吨', '约5000万吨'],
    correctIndex: 2,
    explanation: '据估算，全面推广以竹代塑每年可减少约1000万吨塑料垃圾进入环境。',
    category: 'material',
    difficulty: 'hard',
    relatedHeritage: 'bamboo_weaving'
  }
]

/** 生物多样性相关问题 */
const biodiversityQuestions: EcoQuestion[] = [
  {
    id: 'bio-1',
    question: '哈尼梯田生态系统中，稻田养鱼的主要生态作用是什么？',
    options: ['增加产量', '控制害虫和杂草', '美化景观', '增加收入'],
    correctIndex: 1,
    explanation: '稻田养鱼是天然的生物防治方法，鱼类可以吃掉害虫和杂草，减少农药使用。',
    category: 'biodiversity',
    difficulty: 'easy',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'bio-2',
    question: '传统茶园相比单一种植茶园，生物多样性高出多少？',
    options: ['约20%', '约50%', '约100%', '约200%'],
    correctIndex: 3,
    explanation: '传统茶园采用混种模式，与森林共生，生物多样性比单一种植茶园高出约200%。',
    category: 'biodiversity',
    difficulty: 'medium',
    relatedHeritage: 'tea_ceremony'
  },
  {
    id: 'bio-3',
    question: '哈尼梯田区域记录了多少种鸟类？',
    options: ['约50种', '约100种', '约200种', '约300种'],
    correctIndex: 2,
    explanation: '哈尼梯田区域记录了约200种鸟类，是重要的生物多样性热点地区。',
    category: 'biodiversity',
    difficulty: 'hard',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'bio-4',
    question: '天然靛蓝植物种植对土壤有什么好处？',
    options: ['增加土壤酸性', '固氮改良土壤', '减少土壤水分', '增加土壤盐分'],
    correctIndex: 1,
    explanation: '靛蓝植物是豆科植物，根部有固氮菌，可以改良土壤，增加土壤肥力。',
    category: 'biodiversity',
    difficulty: 'medium',
    relatedHeritage: 'batik'
  },
  {
    id: 'bio-5',
    question: '传统农业中的"间作套种"可以提高多少土地利用率？',
    options: ['10-20%', '30-50%', '60-80%', '100%以上'],
    correctIndex: 1,
    explanation: '间作套种可以提高30-50%的土地利用率，同时增加生物多样性。',
    category: 'biodiversity',
    difficulty: 'medium'
  }
]

/** 碳中和相关问题 */
const carbonQuestions: EcoQuestion[] = [
  {
    id: 'carbon-1',
    question: '云游哈尼梯田相比实地旅游，可以减少多少碳排放？',
    options: ['约50%', '约70%', '约90%', '约99%'],
    correctIndex: 2,
    explanation: '云游体验避免了交通、住宿等碳排放，相比实地旅游可减少约90%的碳足迹。',
    category: 'carbon',
    difficulty: 'easy',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'carbon-2',
    question: '一棵成年树每年可以吸收多少二氧化碳？',
    options: ['约5公斤', '约10公斤', '约21公斤', '约50公斤'],
    correctIndex: 2,
    explanation: '一棵成年树每年可以吸收约21公斤二氧化碳，这是计算碳减排等效指标的基础。',
    category: 'carbon',
    difficulty: 'medium'
  },
  {
    id: 'carbon-3',
    question: '竹子的固碳能力是普通树木的多少倍？',
    options: ['1-2倍', '2-3倍', '3-4倍', '4-5倍'],
    correctIndex: 2,
    explanation: '竹子生长速度快，固碳能力是普通树木的3-4倍，是优秀的碳汇植物。',
    category: 'carbon',
    difficulty: 'medium',
    relatedHeritage: 'bamboo_weaving'
  },
  {
    id: 'carbon-4',
    question: '传统手工艺品相比工业制品，碳足迹通常低多少？',
    options: ['约30%', '约50%', '约70%', '约90%'],
    correctIndex: 2,
    explanation: '传统手工艺品不使用机械动力，使用天然材料，碳足迹通常比工业制品低70%以上。',
    category: 'carbon',
    difficulty: 'medium'
  },
  {
    id: 'carbon-5',
    question: '哈尼梯田的森林-梯田系统每公顷每年可以固定多少吨碳？',
    options: ['约2吨', '约5吨', '约10吨', '约20吨'],
    correctIndex: 2,
    explanation: '哈尼梯田的森林-梯田复合系统每公顷每年可固定约10吨碳，是重要的碳汇。',
    category: 'carbon',
    difficulty: 'hard',
    relatedHeritage: 'hani_terrace'
  },
  {
    id: 'carbon-6',
    question: '数字化非遗体验相比传统展览，可以减少多少能源消耗？',
    options: ['约40%', '约60%', '约80%', '约95%'],
    correctIndex: 2,
    explanation: '数字化体验无需实体场馆、照明、空调等，可减少约80%的能源消耗。',
    category: 'carbon',
    difficulty: 'medium'
  }
]

/** 所有问题 */
export const allEcoQuestions: EcoQuestion[] = [
  ...waterQuestions,
  ...materialQuestions,
  ...biodiversityQuestions,
  ...carbonQuestions
]

/** 按类别获取问题 */
export function getQuestionsByCategory(category: QuizCategory): EcoQuestion[] {
  return allEcoQuestions.filter(q => q.category === category)
}

/** 获取随机问题 */
export function getRandomQuestions(count: number, category?: QuizCategory): EcoQuestion[] {
  const pool = category ? getQuestionsByCategory(category) : allEcoQuestions
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/** 按非遗项目获取相关问题 */
export function getQuestionsByHeritage(heritageId: string): EcoQuestion[] {
  return allEcoQuestions.filter(q => q.relatedHeritage === heritageId)
}

/** 类别名称映射 */
export const categoryNames: Record<QuizCategory, string> = {
  water: '水循环',
  material: '生态材料',
  biodiversity: '生物多样性',
  carbon: '碳中和'
}

/** 类别图标映射 */
export const categoryIcons: Record<QuizCategory, string> = {
  water: '💧',
  material: '🎋',
  biodiversity: '🦋',
  carbon: '🌍'
}

/** 难度积分配置 */
export const difficultyPoints = {
  easy: 10,
  medium: 15,
  hard: 20
}
