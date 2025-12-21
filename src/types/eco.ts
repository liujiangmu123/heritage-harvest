/**
 * 乡遗识 - 生态类型定义
 * 绿色积分、碳账户、生态成就等核心类型
 */

// ==================== 绿色积分系统 ====================

/** 生态等级类型 */
export type EcoLevel = 'seedling' | 'sprout' | 'guardian' | 'master'

/** 生态等级信息 */
export interface EcoLevelInfo {
  name: string        // 等级名称
  minPoints: number   // 最低积分
  icon: string        // 等级图标
  color: string       // 主题色
  benefits: string[]  // 等级权益
}

/** 积分记录类型 */
export type PointsRecordType = 'learn' | 'experience' | 'share' | 'purchase' | 'pledge'

/** 积分记录 */
export interface PointsRecord {
  id: string
  type: PointsRecordType
  points: number
  description: string
  timestamp: string
  relatedId?: string  // 关联的体验/产品ID
}

/** 等级配置常量 */
export const ECO_LEVELS: Record<EcoLevel, EcoLevelInfo> = {
  seedling: {
    name: '生态新人',
    minPoints: 0,
    icon: '🌱',
    color: '#86efac',
    benefits: ['基础体验权限']
  },
  sprout: {
    name: '绿色使者',
    minPoints: 100,
    icon: '🌿',
    color: '#4ade80',
    benefits: ['绿色市集95折', '专属徽章']
  },
  guardian: {
    name: '生态守护者',
    minPoints: 500,
    icon: '🌳',
    color: '#22c55e',
    benefits: ['绿色市集9折', '优先参与活动', '专属NFT']
  },
  master: {
    name: '生态大师',
    minPoints: 1500,
    icon: '🌍',
    color: '#16a34a',
    benefits: ['绿色市集85折', '专属客服', '限量藏品']
  }
}

// ==================== 碳账户系统 ====================

/** 碳减排记录类型 */
export type CarbonRecordType = 'cloud_tour' | 'eco_product' | 'digital_experience'

/** 碳减排记录 */
export interface CarbonRecord {
  id: string
  type: CarbonRecordType
  carbonSaved: number  // 单位：克
  description: string
  timestamp: string
  experienceId?: string
}

/** 碳减排等效指标 */
export interface CarbonEquivalent {
  treesPlanted: number      // 等效种树数量
  kmNotDriven: number       // 等效不开车公里数
  plasticAvoided: number    // 等效减少塑料（克）
}

/** 碳减排里程碑 */
export interface CarbonMilestone {
  id: string
  threshold: number  // 阈值（克）
  name: string
  icon: string
  unlocked: boolean
  unlockedAt?: string
}

/** 各体验的碳减排配置（克CO2） */
export const CARBON_SAVINGS_CONFIG: Record<string, { baseSaving: number; description: string }> = {
  hani_terrace: {
    baseSaving: 2500,
    description: '云游哈尼梯田，节省往返交通碳排放'
  },
  bamboo_weaving: {
    baseSaving: 500,
    description: '体验藤编工艺，了解以竹代塑'
  },
  paper_cutting: {
    baseSaving: 300,
    description: '体验剪纸艺术，了解可降解材料'
  },
  clay_sculpture: {
    baseSaving: 400,
    description: '体验泥塑工艺，了解天然材料'
  },
  shadow_puppet: {
    baseSaving: 350,
    description: '体验皮影戏，了解循环经济'
  },
  tea_ceremony: {
    baseSaving: 600,
    description: '体验茶道文化，了解茶园生态'
  },
  batik: {
    baseSaving: 450,
    description: '体验蜡染工艺，了解天然染料'
  }
}

/** 碳减排里程碑配置 */
export const CARBON_MILESTONES: CarbonMilestone[] = [
  { id: 'carbon-1kg', threshold: 1000, name: '碳减排新手', icon: '🌱', unlocked: false },
  { id: 'carbon-5kg', threshold: 5000, name: '碳减排达人', icon: '🌿', unlocked: false },
  { id: 'carbon-10kg', threshold: 10000, name: '碳中和先锋', icon: '🌳', unlocked: false },
  { id: 'carbon-50kg', threshold: 50000, name: '碳中和卫士', icon: '🌲', unlocked: false },
  { id: 'carbon-100kg', threshold: 100000, name: '碳中和大师', icon: '🌍', unlocked: false }
]


// ==================== 生态成就系统 ====================

/** 成就类别 */
export type AchievementCategory = 'learning' | 'experience' | 'sharing' | 'carbon' | 'special'

/** 成就要求类型 */
export type AchievementRequirementType = 'count' | 'threshold' | 'combination'

/** 成就要求 */
export interface AchievementRequirement {
  type: AchievementRequirementType
  target: number | string[]
  current?: number
}

/** 生态成就 */
export interface EcoAchievement {
  id: string
  name: string
  description: string
  icon: string
  category: AchievementCategory
  pointsReward: number
  requirement: AchievementRequirement
  unlocked: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
}

/** 生态成就列表 */
export const ECO_ACHIEVEMENTS: EcoAchievement[] = [
  // 学习成就
  {
    id: 'eco-learner',
    name: '生态启蒙',
    description: '完成首次生态知识问答',
    icon: '📚',
    category: 'learning',
    pointsReward: 20,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'eco-scholar',
    name: '生态学者',
    description: '正确回答50道生态问题',
    icon: '🎓',
    category: 'learning',
    pointsReward: 100,
    requirement: { type: 'count', target: 50 },
    unlocked: false
  },
  {
    id: 'eco-master-learner',
    name: '生态智慧大师',
    description: '完成所有学习路径',
    icon: '🏆',
    category: 'learning',
    pointsReward: 200,
    requirement: { type: 'count', target: 4 },
    unlocked: false
  },
  
  // 体验成就
  {
    id: 'terrace-explorer',
    name: '梯田守望者',
    description: '完成哈尼梯田生态循环学习',
    icon: '🏔️',
    category: 'experience',
    pointsReward: 50,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'bamboo-advocate',
    name: '以竹代塑倡导者',
    description: '完成藤编体验并了解环保数据',
    icon: '🎋',
    category: 'experience',
    pointsReward: 50,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'paper-artist',
    name: '纸艺环保家',
    description: '完成剪纸体验并了解可降解材料',
    icon: '✂️',
    category: 'experience',
    pointsReward: 50,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'clay-craftsman',
    name: '泥土守护者',
    description: '完成泥塑体验并了解天然材料',
    icon: '🏺',
    category: 'experience',
    pointsReward: 50,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'shadow-master',
    name: '光影传承人',
    description: '完成皮影戏体验并了解循环经济',
    icon: '🎭',
    category: 'experience',
    pointsReward: 50,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'all-experiences',
    name: '生态体验家',
    description: '完成所有生态体验',
    icon: '🌟',
    category: 'experience',
    pointsReward: 200,
    requirement: { type: 'count', target: 5 },
    unlocked: false
  },
  
  // 碳减排成就
  {
    id: 'carbon-saver-1kg',
    name: '碳减排新手',
    description: '累计碳减排达到1kg',
    icon: '🌱',
    category: 'carbon',
    pointsReward: 30,
    requirement: { type: 'threshold', target: 1000 },
    unlocked: false
  },
  {
    id: 'carbon-saver-10kg',
    name: '碳减排达人',
    description: '累计碳减排达到10kg',
    icon: '🌿',
    category: 'carbon',
    pointsReward: 100,
    requirement: { type: 'threshold', target: 10000 },
    unlocked: false
  },
  {
    id: 'carbon-saver-100kg',
    name: '碳中和先锋',
    description: '累计碳减排达到100kg',
    icon: '🌳',
    category: 'carbon',
    pointsReward: 500,
    requirement: { type: 'threshold', target: 100000 },
    unlocked: false
  },
  
  // 分享成就
  {
    id: 'eco-sharer',
    name: '生态传播者',
    description: '分享3次生态内容',
    icon: '📤',
    category: 'sharing',
    pointsReward: 50,
    requirement: { type: 'count', target: 3 },
    unlocked: false
  },
  {
    id: 'polaroid-collector',
    name: '云游摄影师',
    description: '生成5张AI拍立得照片',
    icon: '📸',
    category: 'sharing',
    pointsReward: 80,
    requirement: { type: 'count', target: 5 },
    unlocked: false
  },
  {
    id: 'pledge-maker',
    name: '生态承诺者',
    description: '发布首个生态承诺',
    icon: '✋',
    category: 'sharing',
    pointsReward: 30,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  
  // 特殊成就
  {
    id: 'eco-historian',
    name: '生态史学家',
    description: '完整浏览生态故事时间线',
    icon: '📜',
    category: 'special',
    pointsReward: 100,
    requirement: { type: 'count', target: 1 },
    unlocked: false
  },
  {
    id: 'seasonal-participant',
    name: '节气守护者',
    description: '参与3次季节性生态活动',
    icon: '🌸',
    category: 'special',
    pointsReward: 80,
    requirement: { type: 'count', target: 3 },
    unlocked: false
  },
  {
    id: 'knowledge-explorer',
    name: '知识探索者',
    description: '探索生态知识图谱50%以上',
    icon: '🗺️',
    category: 'special',
    pointsReward: 150,
    requirement: { type: 'threshold', target: 50 },
    unlocked: false
  }
]

// ==================== AI拍立得系统 ====================

/** 生态场景类型 */
export type EcoScene = 
  | 'hani_terrace'    // 哈尼梯田
  | 'tea_garden'      // 茶园
  | 'bamboo_forest'   // 竹林
  | 'batik_workshop'  // 蜡染工坊
  | 'paper_cutting'   // 剪纸工坊
  | 'clay_studio'     // 泥塑工坊

/** 拍立得滤镜配置 */
export interface PolaroidFilter {
  grain: number        // 胶片颗粒感 0-1
  lightLeak: boolean   // 漏光效果
  fadeLevel: number    // 褪色程度 0-1
  warmth: number       // 暖色调 -1 到 1
  vignette: number     // 暗角效果 0-1
}

/** 默认生态拍立得滤镜 */
export const ECO_POLAROID_FILTER: PolaroidFilter = {
  grain: 0.3,
  lightLeak: true,
  fadeLevel: 0.2,
  warmth: 0.1,
  vignette: 0.4
}

/** 拍立得场景配置 */
export interface PolaroidConfig {
  scene: EcoScene
  sceneName: string
  sceneImage: string
  foregroundElements?: string[]
  overlayPosition: 'left' | 'right' | 'center'
  carbonSaving: number
}

/** 拍立得结果 */
export interface PolaroidResult {
  id: string
  imageDataUrl: string
  scene: EcoScene
  sceneName: string
  date: string
  ecoLevel: EcoLevel
  pointsEarned: number
  carbonSaved: number
  ecoMessage: string
  filter: PolaroidFilter
}

/** 生态寄语列表 */
export const ECO_MESSAGES = [
  '🌱 今天的云游，是明天的绿荫',
  '🌿 每一次数字旅行，都是对地球的温柔',
  '🌳 低碳出行，让美景永存',
  '🌍 用指尖丈量世界，用行动守护家园',
  '🍃 传承生态智慧，共享绿色未来',
  '💚 你的选择，正在改变世界',
  '🌾 古人智慧，今人传承',
  '🎋 以竹代塑，从我做起',
  '🌊 水润万物，生生不息',
  '🏔️ 山水相依，天人合一'
]

// ==================== 生态承诺墙 ====================

/** 承诺类别 */
export type PledgeCategory = 'reduce_plastic' | 'save_energy' | 'green_travel' | 'support_heritage'

/** 生态承诺 */
export interface EcoPledge {
  id: string
  polaroidImage: string
  ecoMessage: string
  pledgeContent: string
  userName: string
  userAvatar: string
  userEcoLevel: EcoLevel
  carbonSaved: number
  createdAt: string
  supportCount: number
  category: PledgeCategory
  fulfilled: boolean
  fulfilledAt?: string
}

// ==================== 生态问答系统 ====================

/** 问题类别 */
export type QuizCategory = 'water' | 'material' | 'biodiversity' | 'carbon'

/** 问题难度 */
export type QuizDifficulty = 'easy' | 'medium' | 'hard'

/** 生态问题 */
export interface EcoQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  category: QuizCategory
  difficulty: QuizDifficulty
  relatedHeritage?: string
}

/** 问答结果 */
export interface QuizResult {
  totalQuestions: number
  correctAnswers: number
  pointsEarned: number
  timeSpent: number
}

// ==================== 生态产品 ====================

/** 生态产品 */
export interface EcoProduct {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  images: string[]
  sustainabilityScore: number  // 1-100
  carbonFootprint: number      // 克CO2
  certifications: string[]
  ecoStory: string
  heritageId: string
  heritageConnection: string
  category: string
  inStock: boolean
}

// ==================== 工具函数类型 ====================

/** 根据积分计算等级 */
export function calculateEcoLevel(points: number): EcoLevel {
  if (points >= ECO_LEVELS.master.minPoints) return 'master'
  if (points >= ECO_LEVELS.guardian.minPoints) return 'guardian'
  if (points >= ECO_LEVELS.sprout.minPoints) return 'sprout'
  return 'seedling'
}

/** 计算碳减排等效指标 */
export function calculateCarbonEquivalent(carbonGrams: number): CarbonEquivalent {
  return {
    treesPlanted: Math.round(carbonGrams / 21000 * 100) / 100,  // 一棵树年吸收约21kg CO2
    kmNotDriven: Math.round(carbonGrams / 120 * 100) / 100,     // 汽车每公里约排放120g CO2
    plasticAvoided: Math.round(carbonGrams / 6 * 100) / 100     // 1g塑料约产生6g CO2
  }
}

/** 获取随机生态寄语 */
export function getRandomEcoMessage(): string {
  return ECO_MESSAGES[Math.floor(Math.random() * ECO_MESSAGES.length)]
}

/** 生成唯一ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}
