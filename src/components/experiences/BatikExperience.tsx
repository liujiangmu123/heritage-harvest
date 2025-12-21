/**
 * 蜡染天然染料体验组件
 * 展示天然靛蓝植物种植、染料提取、天然vs化学染料对比
 * 
 * 技术实现：
 * - 交互式染料花园可视化
 * - 染料提取过程动画
 * - 环保数据对比展示
 */

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Leaf,
  Droplets,
  Palette,
  Sparkles,
  Award,
  Share2,
  X,
  ChevronRight,
  Flower2,
  Beaker,
  Waves,
  Recycle,
  Info,
  TreeDeciduous,
  AlertTriangle,
} from 'lucide-react'
import ShareCardGenerator from '@/components/eco/ShareCardGenerator'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'
import { CARBON_SAVINGS_CONFIG } from '@/types/eco'

// ============ 蜡染生态数据 ============
const BATIK_ECO_DATA = {
  // 天然染料 vs 化学染料对比
  natural: {
    waterUsage: 30, // 升/kg布料
    toxicity: 0,
    biodegradable: 100, // %
    carbonFootprint: 2.5, // kg CO2/kg染料
    skinSafe: true,
  },
  chemical: {
    waterUsage: 150,
    toxicity: 85, // 毒性指数
    biodegradable: 15,
    carbonFootprint: 12.8,
    skinSafe: false,
  },
  // 天然染料植物
  plants: [
    { id: 'indigo', name: '蓝草（靛蓝）', color: '#1e3a5f', icon: '🌿', description: '传统蓝染原料，种植3-4个月可收获' },
    { id: 'madder', name: '茜草（红色）', color: '#8b2942', icon: '🌺', description: '根部提取红色染料，需生长2-3年' },
    { id: 'turmeric', name: '姜黄（黄色）', color: '#d4a017', icon: '🌾', description: '根茎提取，一年生植物' },
    { id: 'pomegranate', name: '石榴皮（棕色）', color: '#5d4037', icon: '🍎', description: '果皮提取，废物利用' },
  ],
  // 染料提取过程
  process: [
    { stage: '种植', duration: '3-6个月', description: '有机种植染料植物，不使用农药' },
    { stage: '收获', duration: '适时采摘', description: '手工采摘，保护植株可持续生长' },
    { stage: '发酵', duration: '7-14天', description: '自然发酵提取色素，无化学添加' },
    { stage: '染色', duration: '数小时', description: '传统浸染工艺，可重复使用染液' },
  ],
  // 碳减排数据
  carbonSaving: CARBON_SAVINGS_CONFIG.batik.baseSaving,
  // 环保数据
  ecoFacts: {
    waterSaved: 120, // 升/kg布料（相比化学染料）
    chemicalsAvoided: 15, // kg有害化学物质/年
    biodiversitySupport: true,
  },
}

// ============ 染料植物卡片组件 ============
interface PlantCardProps {
  plant: typeof BATIK_ECO_DATA.plants[0]
  isActive: boolean
  onClick: () => void
}

function PlantCard({ plant, isActive, onClick }: PlantCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl cursor-pointer transition-all overflow-hidden ${
        isActive ? 'ring-2 ring-heritage-500 shadow-lg' : 'hover:shadow-md'
      }`}
      style={{ backgroundColor: `${plant.color}15` }}
    >
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundColor: plant.color }}
      />
      <div className="relative z-10">
        <div className="text-4xl mb-2">{plant.icon}</div>
        <h4 className="font-bold text-ink-800">{plant.name}</h4>
        <div
          className="w-8 h-2 rounded-full mt-2"
          style={{ backgroundColor: plant.color }}
        />
        {isActive && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-sm mt-3 text-ink-600"
          >
            {plant.description}
          </motion.p>
        )}
      </div>
    </motion.div>
  )
}

// ============ 对比指标组件 ============
interface CompareMetricProps {
  label: string
  natural: number | boolean
  chemical: number | boolean
  unit?: string
  icon: React.ReactNode
  lowerIsBetter?: boolean
}

function CompareMetric({ label, natural, chemical, unit = '', icon, lowerIsBetter = false }: CompareMetricProps) {
  const naturalValue = typeof natural === 'boolean' ? (natural ? '✓' : '✗') : natural
  const chemicalValue = typeof chemical === 'boolean' ? (chemical ? '✓' : '✗') : chemical
  const naturalBetter = lowerIsBetter 
    ? (typeof natural === 'number' ? natural < (chemical as number) : natural)
    : (typeof natural === 'number' ? natural > (chemical as number) : natural)

  return (
    <div className="flex items-center gap-4 p-3 bg-white/60 rounded-xl">
      <div className="w-10 h-10 rounded-full bg-heritage-100 flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm text-ink-600">{label}</p>
        <div className="flex items-center gap-4 mt-1">
          <span className={`font-bold ${naturalBetter ? 'text-eco-600' : 'text-ink-700'}`}>
            天然: {naturalValue}{unit}
          </span>
          <span className={`font-bold ${!naturalBetter ? 'text-red-500' : 'text-ink-500'}`}>
            化学: {chemicalValue}{unit}
          </span>
        </div>
      </div>
      {naturalBetter && (
        <div className="px-2 py-1 bg-eco-100 rounded-full">
          <span className="text-xs text-eco-700 font-medium">更环保</span>
        </div>
      )}
    </div>
  )
}

// ============ 染色过程步骤组件 ============
interface ProcessStepProps {
  step: typeof BATIK_ECO_DATA.process[0]
  index: number
  isActive: boolean
  onClick: () => void
}

function ProcessStep({ step, index, isActive, onClick }: ProcessStepProps) {
  const icons = [Flower2, Leaf, Beaker, Palette]
  const Icon = icons[index] || Leaf
  const colors = ['bg-eco-500', 'bg-bamboo-500', 'bg-heritage-500', 'bg-primary-500']

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
      className={`relative p-4 rounded-xl cursor-pointer transition-all ${
        isActive ? `${colors[index]} text-white shadow-lg` : 'bg-white/70 hover:bg-white'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
          isActive ? 'bg-white/20' : colors[index].replace('bg-', 'bg-') + '/20'
        }`}>
          <Icon className={`w-5 h-5 ${isActive ? 'text-white' : colors[index].replace('bg-', 'text-')}`} />
        </div>
        <div>
          <h4 className={`font-bold ${isActive ? 'text-white' : 'text-ink-800'}`}>
            {step.stage}
          </h4>
          <p className={`text-xs ${isActive ? 'text-white/80' : 'text-ink-500'}`}>
            {step.duration}
          </p>
        </div>
      </div>
      {isActive && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-sm text-white/90"
        >
          {step.description}
        </motion.p>
      )}
      {index < 3 && (
        <ChevronRight className={`absolute right-2 top-1/2 -translate-y-1/2 w-5 h-5 ${
          isActive ? 'text-white/50' : 'text-ink-300'
        }`} />
      )}
    </motion.div>
  )
}

// ============ 主组件 ============
export default function BatikExperience() {
  const [activePlant, setActivePlant] = useState<string | null>(null)
  const [activeProcess, setActiveProcess] = useState(0)
  const [experienceTime, setExperienceTime] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [showCompletion, setShowCompletion] = useState(false)
  const [showShareCard, setShowShareCard] = useState(false)
  const [showEcoInfo, setShowEcoInfo] = useState(true)

  // Store hooks
  const { addPoints } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  const { recordExperienceComplete } = useEcoAchievementStore()

  // 体验计时
  useEffect(() => {
    const timer = setInterval(() => {
      setExperienceTime(prev => prev + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // 完成检测
  useEffect(() => {
    if (experienceTime >= 60 && !isCompleted) {
      handleComplete()
    }
  }, [experienceTime, isCompleted])

  // 完成处理
  const handleComplete = useCallback(() => {
    if (isCompleted) return
    setIsCompleted(true)
    setShowCompletion(true)

    // 奖励积分
    addPoints({
      type: 'experience',
      points: 50,
      description: '完成蜡染天然染料体验',
    })

    // 碳减排
    addCarbonSaving({
      type: 'digital_experience',
      carbonSaved: BATIK_ECO_DATA.carbonSaving,
      description: CARBON_SAVINGS_CONFIG.batik.description,
      experienceId: 'batik',
    })

    // 记录体验完成
    recordExperienceComplete('batik')
  }, [isCompleted, addPoints, addCarbonSaving, recordExperienceComplete])

  return (
    <div className="min-h-screen bg-gradient-to-b from-heritage-50 via-primary-50 to-eco-50">
      {/* 顶部标题 */}
      <div className="bg-gradient-to-r from-heritage-600 to-primary-600 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">🎨 蜡染天然染料体验</h1>
          <p className="text-heritage-100">探索天然植物染料的奥秘，感受传统工艺的生态智慧</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* 染料花园 */}
        <section className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Flower2 className="w-6 h-6 text-heritage-600" />
            <h2 className="text-xl font-bold text-ink-800">染料花园</h2>
          </div>
          <p className="text-ink-600 mb-6">
            天然染料来自大自然的馈赠，每种植物都有独特的色彩
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {BATIK_ECO_DATA.plants.map(plant => (
              <PlantCard
                key={plant.id}
                plant={plant}
                isActive={activePlant === plant.id}
                onClick={() => setActivePlant(
                  activePlant === plant.id ? null : plant.id
                )}
              />
            ))}
          </div>
        </section>

        {/* 天然 vs 化学染料对比 */}
        <section className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Recycle className="w-6 h-6 text-eco-600" />
            <h2 className="text-xl font-bold text-ink-800">天然染料 vs 化学染料</h2>
          </div>
          <div className="space-y-3">
            <CompareMetric
              label="用水量（升/kg布料）"
              natural={BATIK_ECO_DATA.natural.waterUsage}
              chemical={BATIK_ECO_DATA.chemical.waterUsage}
              unit="L"
              icon={<Droplets className="w-5 h-5 text-heritage-600" />}
              lowerIsBetter
            />
            <CompareMetric
              label="毒性指数"
              natural={BATIK_ECO_DATA.natural.toxicity}
              chemical={BATIK_ECO_DATA.chemical.toxicity}
              icon={<AlertTriangle className="w-5 h-5 text-heritage-600" />}
              lowerIsBetter
            />
            <CompareMetric
              label="可生物降解"
              natural={BATIK_ECO_DATA.natural.biodegradable}
              chemical={BATIK_ECO_DATA.chemical.biodegradable}
              unit="%"
              icon={<Leaf className="w-5 h-5 text-heritage-600" />}
            />
            <CompareMetric
              label="碳足迹（kg CO₂/kg染料）"
              natural={BATIK_ECO_DATA.natural.carbonFootprint}
              chemical={BATIK_ECO_DATA.chemical.carbonFootprint}
              unit="kg"
              icon={<TreeDeciduous className="w-5 h-5 text-heritage-600" />}
              lowerIsBetter
            />
            <CompareMetric
              label="皮肤安全"
              natural={BATIK_ECO_DATA.natural.skinSafe}
              chemical={BATIK_ECO_DATA.chemical.skinSafe}
              icon={<Sparkles className="w-5 h-5 text-heritage-600" />}
            />
          </div>
        </section>

        {/* 染色过程 */}
        <section className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-bold text-ink-800">天然染色过程</h2>
          </div>
          <p className="text-ink-600 mb-6">
            从种植到染色，每一步都遵循自然规律
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {BATIK_ECO_DATA.process.map((step, index) => (
              <ProcessStep
                key={step.stage}
                step={step}
                index={index}
                isActive={activeProcess === index}
                onClick={() => setActiveProcess(index)}
              />
            ))}
          </div>
        </section>

        {/* 环保数据展示 */}
        <section className="bg-gradient-to-r from-heritage-500 to-primary-500 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-2 mb-4">
            <Waves className="w-6 h-6" />
            <h2 className="text-xl font-bold">环保贡献</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl font-bold">{BATIK_ECO_DATA.ecoFacts.waterSaved}L</p>
              <p className="text-sm text-heritage-100">节约用水</p>
              <p className="text-xs mt-1">每kg布料</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl font-bold">80%</p>
              <p className="text-sm text-heritage-100">减少碳排放</p>
              <p className="text-xs mt-1">相比化学染料</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4">
              <p className="text-3xl font-bold">{BATIK_ECO_DATA.carbonSaving}g</p>
              <p className="text-sm text-heritage-100">本次体验减碳</p>
              <p className="text-xs mt-1">云游代替实地</p>
            </div>
          </div>
        </section>

        {/* 底部生态信息面板 */}
        <AnimatePresence>
          {showEcoInfo && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-primary-50 border border-primary-200 rounded-2xl p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary-600" />
                  <h3 className="font-bold text-primary-800">蜡染生态智慧</h3>
                </div>
                <button
                  onClick={() => setShowEcoInfo(false)}
                  className="text-primary-400 hover:text-primary-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-4 grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Droplets className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary-700">节水环保</p>
                    <p className="text-primary-600">天然染料用水量仅为化学染料的20%</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Leaf className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary-700">零污染</p>
                    <p className="text-primary-600">染料废水可直接用于灌溉，无毒无害</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Recycle className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-primary-700">循环利用</p>
                    <p className="text-primary-600">染料植物残渣可堆肥，实现零废弃</p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* 体验进度提示 */}
        {!isCompleted && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur rounded-full px-6 py-3 shadow-lg">
            <p className="text-sm text-ink-600">
              体验时间: <span className="font-bold text-heritage-600">{experienceTime}秒</span>
              {experienceTime < 60 && ` / 60秒完成体验`}
            </p>
          </div>
        )}
      </div>

      {/* 完成弹窗 */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCompletion(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-heritage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-10 h-10 text-heritage-600" />
                </div>
                <h3 className="text-2xl font-bold text-ink-800 mb-2">
                  🎨 蜡染体验完成！
                </h3>
                <p className="text-ink-600 mb-6">
                  你已了解天然染料的生态智慧，感受传统工艺的环保魅力
                </p>

                {/* 奖励展示 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-eco-50 rounded-xl p-4">
                    <Leaf className="w-6 h-6 text-eco-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-eco-700">+50</p>
                    <p className="text-sm text-ink-500">绿色积分</p>
                  </div>
                  <div className="bg-carbon-50 rounded-xl p-4">
                    <TreeDeciduous className="w-6 h-6 text-carbon-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-carbon-700">
                      {BATIK_ECO_DATA.carbonSaving}g
                    </p>
                    <p className="text-sm text-ink-500">碳减排</p>
                  </div>
                </div>

                {/* 生态知识卡片 */}
                <div className="bg-primary-50 rounded-xl p-4 mb-6 text-left">
                  <p className="text-sm text-primary-700">
                    <span className="font-bold">🌿 你知道吗？</span>
                    <br />
                    使用天然靛蓝染料比化学染料减少80%的碳排放，且染料废水可直接用于灌溉！
                  </p>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowCompletion(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    继续探索
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCompletion(false)
                      setShowShareCard(true)
                    }}
                    className="flex-1 bg-heritage-500 hover:bg-heritage-600"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    分享成果
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 分享卡片弹窗 */}
      <AnimatePresence>
        {showShareCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowShareCard(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-ink-800">分享你的生态成果</h3>
                <button
                  onClick={() => setShowShareCard(false)}
                  className="text-ink-400 hover:text-ink-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <ShareCardGenerator
                customMessage="🎨 我在乡遗识完成了蜡染天然染料体验，了解了传统染色工艺的生态智慧！"
                onShare={() => setShowShareCard(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
