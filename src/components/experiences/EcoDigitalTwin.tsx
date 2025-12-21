import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Droplets, TreeDeciduous, Home, Mountain, Sun, Cloud, 
  Thermometer, Wind, Leaf, Play, Pause, RotateCcw,
  ChevronRight, Info, Award, X, Zap
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'

/** 生态系统参数 */
interface EcoSystemParams {
  rainfall: number      // 降雨量 mm/年 (800-2000)
  temperature: number   // 平均温度 °C (10-25)
  humanIntervention: number // 人类干预程度 0-100
  forestCoverage: number    // 森林覆盖率 0-100
}

/** 生态系统状态 */
interface EcoSystemState {
  waterLevel: number        // 水位 0-100
  soilHealth: number        // 土壤健康度 0-100
  biodiversity: number      // 生物多样性指数 0-100
  carbonAbsorption: number  // 碳吸收量 kg/年
  riceYield: number         // 水稻产量 kg/亩
  stability: number         // 系统稳定性 0-100
}

/** 四素同构元素 */
interface EcoElement {
  id: string
  name: string
  icon: typeof TreeDeciduous
  color: string
  description: string
  role: string
}

const ECO_ELEMENTS: EcoElement[] = [
  {
    id: 'forest',
    name: '森林',
    icon: TreeDeciduous,
    color: 'text-green-600 bg-green-100',
    description: '山顶森林是整个生态系统的"水塔"',
    role: '涵养水源、调节气候、固碳释氧'
  },
  {
    id: 'village',
    name: '村寨',
    icon: Home,
    color: 'text-amber-600 bg-amber-100',
    description: '村寨位于森林与梯田之间',
    role: '人与自然和谐共生的纽带'
  },
  {
    id: 'terrace',
    name: '梯田',
    icon: Mountain,
    color: 'text-eco-600 bg-eco-100',
    description: '层层梯田是农业生产的核心',
    role: '粮食生产、水土保持、景观塑造'
  },
  {
    id: 'water',
    name: '水系',
    icon: Droplets,
    color: 'text-blue-600 bg-blue-100',
    description: '水系贯穿整个生态系统',
    role: '灌溉农田、维持生态、循环利用'
  }
]

/** 默认参数 */
const DEFAULT_PARAMS: EcoSystemParams = {
  rainfall: 1400,
  temperature: 18,
  humanIntervention: 30,
  forestCoverage: 70
}

/** 计算生态系统状态 */
function calculateEcoState(params: EcoSystemParams): EcoSystemState {
  const { rainfall, temperature, humanIntervention, forestCoverage } = params
  
  // 水位受降雨和森林覆盖影响
  const waterLevel = Math.min(100, (rainfall / 20) * (forestCoverage / 100) * 1.2)
  
  // 土壤健康受森林覆盖和人类干预影响
  const soilHealth = Math.max(0, forestCoverage * 0.8 - humanIntervention * 0.3 + 20)
  
  // 生物多样性受多因素影响
  const biodiversity = Math.max(0, 
    forestCoverage * 0.5 + 
    (100 - humanIntervention) * 0.3 + 
    (temperature > 15 && temperature < 22 ? 20 : 10)
  )
  
  // 碳吸收量主要受森林覆盖影响
  const carbonAbsorption = forestCoverage * 50 + (100 - humanIntervention) * 10
  
  // 水稻产量受水位、温度和土壤健康影响
  const riceYield = Math.max(0,
    waterLevel * 3 +
    (temperature > 15 && temperature < 25 ? 100 : 50) +
    soilHealth * 2
  )
  
  // 系统稳定性是综合指标
  const stability = (waterLevel + soilHealth + biodiversity) / 3
  
  return {
    waterLevel: Math.round(waterLevel),
    soilHealth: Math.round(soilHealth),
    biodiversity: Math.round(biodiversity),
    carbonAbsorption: Math.round(carbonAbsorption),
    riceYield: Math.round(riceYield),
    stability: Math.round(stability)
  }
}

interface EcoDigitalTwinProps {
  className?: string
  onComplete?: () => void
}

export default function EcoDigitalTwin({ className = '', onComplete }: EcoDigitalTwinProps) {
  const [params, setParams] = useState<EcoSystemParams>(DEFAULT_PARAMS)
  const [isSimulating, setIsSimulating] = useState(false)
  const [selectedElement, setSelectedElement] = useState<EcoElement | null>(null)
  const [showInsightReport, setShowInsightReport] = useState(false)
  const [exploredElements, setExploredElements] = useState<Set<string>>(new Set())
  
  const { addPoints } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  
  // 计算当前生态状态
  const ecoState = useMemo(() => calculateEcoState(params), [params])
  
  // 计算与默认状态的对比
  const defaultState = useMemo(() => calculateEcoState(DEFAULT_PARAMS), [])
  
  // 更新参数
  const updateParam = useCallback((key: keyof EcoSystemParams, value: number) => {
    setParams(prev => ({ ...prev, [key]: value }))
  }, [])
  
  // 重置参数
  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS)
  }, [])
  
  // 探索元素
  const exploreElement = useCallback((element: EcoElement) => {
    setSelectedElement(element)
    setExploredElements(prev => new Set([...prev, element.id]))
  }, [])
  
  // 生成洞察报告
  const generateInsightReport = useCallback(() => {
    setShowInsightReport(true)
    
    // 奖励积分
    addPoints({
      type: 'learn',
      points: 50,
      description: '完成生态数字孪生探索',
      relatedId: 'eco-digital-twin'
    })
    
    // 记录碳减排
    addCarbonSaving({
      type: 'digital_experience',
      carbonSaved: 500,
      description: '数字孪生学习替代实地考察'
    })
    
    onComplete?.()
  }, [addPoints, addCarbonSaving, onComplete])
  
  // 获取状态颜色
  const getStatusColor = (value: number) => {
    if (value >= 70) return 'text-eco-600'
    if (value >= 40) return 'text-amber-600'
    return 'text-red-600'
  }
  
  // 获取状态背景
  const getStatusBg = (value: number) => {
    if (value >= 70) return 'bg-eco-500'
    if (value >= 40) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <div className={`${className}`}>
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">生态数字孪生</h2>
            <p className="text-ink-500">模拟哈尼梯田生态系统，探索可持续农业智慧</p>
          </div>
          <Badge variant="eco" className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            交互式模拟
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* 左侧：参数控制 */}
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="font-bold text-ink-900 mb-4 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              环境参数
            </h3>
            
            {/* 降雨量 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1">
                  <Cloud className="w-4 h-4" />
                  年降雨量
                </span>
                <span className="text-sm font-medium text-ink-900">{params.rainfall} mm</span>
              </div>
              <input
                type="range"
                min="800"
                max="2000"
                value={params.rainfall}
                onChange={(e) => updateParam('rainfall', Number(e.target.value))}
                className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
            
            {/* 温度 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1">
                  <Thermometer className="w-4 h-4" />
                  平均温度
                </span>
                <span className="text-sm font-medium text-ink-900">{params.temperature}°C</span>
              </div>
              <input
                type="range"
                min="10"
                max="25"
                value={params.temperature}
                onChange={(e) => updateParam('temperature', Number(e.target.value))}
                className="w-full h-2 bg-orange-100 rounded-lg appearance-none cursor-pointer accent-orange-500"
              />
            </div>
            
            {/* 森林覆盖率 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1">
                  <TreeDeciduous className="w-4 h-4" />
                  森林覆盖率
                </span>
                <span className="text-sm font-medium text-ink-900">{params.forestCoverage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.forestCoverage}
                onChange={(e) => updateParam('forestCoverage', Number(e.target.value))}
                className="w-full h-2 bg-green-100 rounded-lg appearance-none cursor-pointer accent-green-500"
              />
            </div>
            
            {/* 人类干预 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-ink-600 flex items-center gap-1">
                  <Home className="w-4 h-4" />
                  人类干预程度
                </span>
                <span className="text-sm font-medium text-ink-900">{params.humanIntervention}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={params.humanIntervention}
                onChange={(e) => updateParam('humanIntervention', Number(e.target.value))}
                className="w-full h-2 bg-amber-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={resetParams}
              className="w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重置为传统模式
            </Button>
          </Card>
          
          {/* 四素同构 */}
          <Card className="p-4">
            <h3 className="font-bold text-ink-900 mb-4">四素同构</h3>
            <div className="space-y-2">
              {ECO_ELEMENTS.map((element) => (
                <button
                  key={element.id}
                  onClick={() => exploreElement(element)}
                  className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                    exploredElements.has(element.id)
                      ? 'bg-eco-50 border border-eco-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg ${element.color} flex items-center justify-center`}>
                    <element.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium text-ink-900">{element.name}</div>
                    <div className="text-xs text-ink-500 truncate">{element.role}</div>
                  </div>
                  {exploredElements.has(element.id) && (
                    <Badge variant="eco" className="text-xs">已探索</Badge>
                  )}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* 中间：可视化 */}
        <div className="lg:col-span-2 space-y-4">
          {/* 生态系统可视化 */}
          <Card className="p-6 bg-gradient-to-b from-sky-100 via-green-50 to-amber-50 min-h-[400px] relative overflow-hidden">
            {/* 天空 */}
            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-sky-300 to-sky-100">
              <Sun className="absolute top-4 right-8 w-12 h-12 text-amber-400" />
              {params.rainfall > 1200 && (
                <>
                  <Cloud className="absolute top-6 left-8 w-10 h-10 text-white/80" />
                  <Cloud className="absolute top-4 left-24 w-8 h-8 text-white/60" />
                </>
              )}
            </div>
            
            {/* 森林层 */}
            <div 
              className="absolute top-20 left-0 right-0 flex justify-center gap-1"
              style={{ opacity: params.forestCoverage / 100 }}
            >
              {Array.from({ length: Math.ceil(params.forestCoverage / 10) }).map((_, i) => (
                <TreeDeciduous 
                  key={i} 
                  className="w-8 h-8 text-green-600"
                  style={{ transform: `translateY(${Math.sin(i) * 4}px)` }}
                />
              ))}
            </div>
            
            {/* 村寨层 */}
            <div className="absolute top-36 left-1/2 -translate-x-1/2 flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Home key={i} className="w-6 h-6 text-amber-700" />
              ))}
            </div>
            
            {/* 梯田层 */}
            <div className="absolute bottom-16 left-0 right-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-8 mx-auto rounded-t-full"
                  style={{
                    width: `${60 + i * 8}%`,
                    background: `linear-gradient(to right, #86efac ${ecoState.waterLevel}%, #a3e635 ${ecoState.waterLevel}%)`,
                    marginTop: '-4px',
                    opacity: 0.8 + i * 0.04
                  }}
                />
              ))}
            </div>
            
            {/* 水流动画 */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
            >
              <Droplets className="w-8 h-8 text-blue-500" />
            </motion.div>
            
            {/* 状态指示器 */}
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg">
              <div className="text-xs text-ink-500 mb-1">系统稳定性</div>
              <div className={`text-2xl font-bold ${getStatusColor(ecoState.stability)}`}>
                {ecoState.stability}%
              </div>
            </div>
          </Card>

          {/* 生态指标 */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-ink-600">水位</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(ecoState.waterLevel)}`}>
                {ecoState.waterLevel}%
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusBg(ecoState.waterLevel)} transition-all`}
                  style={{ width: `${ecoState.waterLevel}%` }}
                />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Leaf className="w-5 h-5 text-eco-500" />
                <span className="text-sm text-ink-600">土壤健康</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(ecoState.soilHealth)}`}>
                {ecoState.soilHealth}%
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusBg(ecoState.soilHealth)} transition-all`}
                  style={{ width: `${ecoState.soilHealth}%` }}
                />
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TreeDeciduous className="w-5 h-5 text-green-500" />
                <span className="text-sm text-ink-600">生物多样性</span>
              </div>
              <div className={`text-2xl font-bold ${getStatusColor(ecoState.biodiversity)}`}>
                {ecoState.biodiversity}%
              </div>
              <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${getStatusBg(ecoState.biodiversity)} transition-all`}
                  style={{ width: `${ecoState.biodiversity}%` }}
                />
              </div>
            </Card>
          </div>

          {/* 产出数据 */}
          <Card className="p-4">
            <h3 className="font-bold text-ink-900 mb-4">生态产出</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-eco-50 rounded-xl">
                <div className="text-sm text-eco-600 mb-1">年碳吸收量</div>
                <div className="text-2xl font-bold text-eco-700">{ecoState.carbonAbsorption} kg</div>
                <div className="text-xs text-eco-500 mt-1">
                  {ecoState.carbonAbsorption > defaultState.carbonAbsorption ? '↑' : '↓'} 
                  对比传统模式 {Math.abs(ecoState.carbonAbsorption - defaultState.carbonAbsorption)} kg
                </div>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl">
                <div className="text-sm text-amber-600 mb-1">水稻产量</div>
                <div className="text-2xl font-bold text-amber-700">{ecoState.riceYield} kg/亩</div>
                <div className="text-xs text-amber-500 mt-1">
                  {ecoState.riceYield > defaultState.riceYield ? '↑' : '↓'} 
                  对比传统模式 {Math.abs(ecoState.riceYield - defaultState.riceYield)} kg
                </div>
              </div>
            </div>
          </Card>

          {/* 生成报告按钮 */}
          {exploredElements.size >= 4 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Button
                variant="eco"
                size="lg"
                onClick={generateInsightReport}
                className="w-full flex items-center justify-center gap-2"
              >
                <Award className="w-5 h-5" />
                生成生态洞察报告
                <ChevronRight className="w-5 h-5" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      {/* 元素详情弹窗 */}
      <AnimatePresence>
        {selectedElement && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedElement(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-xl ${selectedElement.color} flex items-center justify-center`}>
                  <selectedElement.icon className="w-7 h-7" />
                </div>
                <button
                  onClick={() => setSelectedElement(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
                >
                  <X className="w-5 h-5 text-ink-600" />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-ink-900 mb-2">{selectedElement.name}</h3>
              <p className="text-ink-600 mb-4">{selectedElement.description}</p>
              
              <div className="p-4 bg-eco-50 rounded-xl mb-4">
                <div className="text-sm font-medium text-eco-700 mb-1">生态功能</div>
                <p className="text-eco-600">{selectedElement.role}</p>
              </div>
              
              <Badge variant="eco" className="w-full justify-center py-2">
                已添加到探索记录
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 洞察报告弹窗 */}
      <AnimatePresence>
        {showInsightReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowInsightReport(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-eco-600" />
                </div>
                <h3 className="text-2xl font-bold text-ink-900">生态洞察报告</h3>
                <p className="text-ink-500">哈尼梯田生态系统分析</p>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-eco-50 rounded-xl">
                  <h4 className="font-bold text-eco-800 mb-2">🌳 核心发现</h4>
                  <p className="text-sm text-eco-700">
                    哈尼梯田的"四素同构"体系展示了人与自然和谐共生的典范。
                    森林涵养水源，村寨连接自然与农业，梯田实现可持续生产，
                    水系循环利用，形成完整的生态闭环。
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-xl">
                  <h4 className="font-bold text-blue-800 mb-2">💧 水循环智慧</h4>
                  <p className="text-sm text-blue-700">
                    传统的"木刻分水"制度确保水资源公平分配，
                    体现了古人对可持续发展的深刻理解。
                  </p>
                </div>
                
                <div className="p-4 bg-amber-50 rounded-xl">
                  <h4 className="font-bold text-amber-800 mb-2">🌾 现代启示</h4>
                  <p className="text-sm text-amber-700">
                    这种生态农业模式为现代可持续发展提供了宝贵经验：
                    尊重自然规律、维护生态平衡、实现人与自然和谐共生。
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-eco-100 to-bamboo-100 rounded-xl mb-4">
                <div>
                  <div className="text-sm text-eco-600">获得奖励</div>
                  <div className="font-bold text-eco-800">+50 绿色积分</div>
                </div>
                <div>
                  <div className="text-sm text-eco-600">碳减排</div>
                  <div className="font-bold text-eco-800">+500g CO₂</div>
                </div>
              </div>
              
              <Button
                variant="eco"
                className="w-full"
                onClick={() => setShowInsightReport(false)}
              >
                完成探索
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
