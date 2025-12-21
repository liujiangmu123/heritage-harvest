/**
 * 生态循环演示组件
 * 展示哈尼梯田"四素同构"生态系统
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  TreeDeciduous, 
  Home, 
  Waves, 
  Wheat,
  ArrowRight,
  Play,
  Pause,
  Leaf
} from 'lucide-react'
import { cn } from '@/lib/utils'

/** 四素同构元素 */
interface EcoElement {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  description: string
  ecoFunction: string
}

const ECO_ELEMENTS: EcoElement[] = [
  {
    id: 'forest',
    name: '森林',
    icon: <TreeDeciduous className="w-8 h-8" />,
    color: 'bg-eco-500',
    description: '山顶森林是整个生态系统的水源涵养区',
    ecoFunction: '涵养水源、调节气候、保持水土'
  },
  {
    id: 'village',
    name: '村寨',
    icon: <Home className="w-8 h-8" />,
    color: 'bg-heritage-500',
    description: '哈尼族村寨位于森林下方，与自然和谐共生',
    ecoFunction: '人居生活、文化传承、生态管理'
  },
  {
    id: 'terrace',
    name: '梯田',
    icon: <Wheat className="w-8 h-8" />,
    color: 'bg-bamboo-500',
    description: '层层梯田是农业生产的核心区域',
    ecoFunction: '粮食生产、水土保持、生物多样性'
  },
  {
    id: 'water',
    name: '水系',
    icon: <Waves className="w-8 h-8" />,
    color: 'bg-blue-500',
    description: '水系贯穿整个系统，形成完整循环',
    ecoFunction: '灌溉农田、养殖水产、净化水质'
  }
]

/** 循环流程 */
const CYCLE_STEPS = [
  { from: 'forest', to: 'village', description: '森林涵养的水源流向村寨' },
  { from: 'village', to: 'terrace', description: '村寨生活用水和有机肥料滋养梯田' },
  { from: 'terrace', to: 'water', description: '梯田水流汇入河流水系' },
  { from: 'water', to: 'forest', description: '水汽蒸发形成云雾滋润森林' }
]

interface EcoCycleDemoProps {
  variant?: 'compact' | 'full' | 'interactive'
  onComplete?: () => void
  className?: string
}

export default function EcoCycleDemo({
  variant = 'full',
  onComplete,
  className
}: EcoCycleDemoProps) {
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [viewedElements, setViewedElements] = useState<Set<string>>(new Set())

  // 自动播放循环
  const handlePlay = () => {
    setIsPlaying(true)
    let step = 0
    const interval = setInterval(() => {
      setCurrentStep(step)
      setActiveElement(CYCLE_STEPS[step].from)
      step++
      if (step >= CYCLE_STEPS.length) {
        step = 0
        setIsPlaying(false)
        clearInterval(interval)
        // 标记所有元素为已查看
        setViewedElements(new Set(ECO_ELEMENTS.map(e => e.id)))
        onComplete?.()
      }
    }, 2000)
  }

  // 点击元素
  const handleElementClick = (id: string) => {
    setActiveElement(activeElement === id ? null : id)
    setViewedElements(prev => new Set([...prev, id]))
    
    // 检查是否全部查看
    if (viewedElements.size + 1 >= ECO_ELEMENTS.length) {
      onComplete?.()
    }
  }

  const activeElementData = ECO_ELEMENTS.find(e => e.id === activeElement)

  // 紧凑模式
  if (variant === 'compact') {
    return (
      <div className={cn('bg-eco-50 rounded-xl p-4 border border-eco-200', className)}>
        <div className="flex items-center gap-2 mb-3">
          <Leaf className="w-5 h-5 text-eco-600" />
          <span className="font-medium text-ink-800">四素同构生态系统</span>
        </div>
        <div className="flex justify-between">
          {ECO_ELEMENTS.map((element, index) => (
            <div key={element.id} className="flex items-center">
              <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white', element.color)}>
                {element.icon}
              </div>
              {index < ECO_ELEMENTS.length - 1 && (
                <ArrowRight className="w-4 h-4 text-ink-300 mx-1" />
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 完整模式
  return (
    <div className={cn('bg-gradient-to-br from-eco-50 to-bamboo-50 rounded-2xl p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-ink-800 flex items-center gap-2">
            <Leaf className="w-5 h-5 text-eco-500" />
            四素同构生态系统
          </h3>
          <p className="text-sm text-ink-500">哈尼梯田千年生态智慧</p>
        </div>
        <button
          onClick={isPlaying ? () => setIsPlaying(false) : handlePlay}
          className="px-4 py-2 bg-eco-500 hover:bg-eco-600 text-white rounded-full flex items-center gap-2 transition-colors"
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          {isPlaying ? '暂停' : '演示循环'}
        </button>
      </div>

      {/* 循环图示 */}
      <div className="relative aspect-square max-w-md mx-auto mb-6">
        {/* 中心 */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center">
          <span className="text-2xl">🌏</span>
        </div>

        {/* 四个元素 */}
        {ECO_ELEMENTS.map((element, index) => {
          const angle = (index * 90 - 45) * (Math.PI / 180)
          const radius = 120
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const isActive = activeElement === element.id
          const isInCycle = isPlaying && CYCLE_STEPS[currentStep]?.from === element.id

          return (
            <motion.button
              key={element.id}
              animate={{
                scale: isActive || isInCycle ? 1.1 : 1,
                boxShadow: isActive || isInCycle 
                  ? '0 0 20px rgba(34, 197, 94, 0.5)' 
                  : '0 4px 6px rgba(0, 0, 0, 0.1)'
              }}
              onClick={() => handleElementClick(element.id)}
              className={cn(
                'absolute w-16 h-16 rounded-full flex items-center justify-center text-white transition-all cursor-pointer',
                element.color,
                viewedElements.has(element.id) && 'ring-2 ring-eco-300 ring-offset-2'
              )}
              style={{
                top: `calc(50% + ${y}px - 32px)`,
                left: `calc(50% + ${x}px - 32px)`
              }}
            >
              {element.icon}
            </motion.button>
          )
        })}

        {/* 连接箭头 */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {CYCLE_STEPS.map((step, index) => {
            const fromIndex = ECO_ELEMENTS.findIndex(e => e.id === step.from)
            const toIndex = ECO_ELEMENTS.findIndex(e => e.id === step.to)
            const fromAngle = (fromIndex * 90 - 45) * (Math.PI / 180)
            const toAngle = (toIndex * 90 - 45) * (Math.PI / 180)
            const radius = 120
            const centerX = 200
            const centerY = 200
            
            const x1 = centerX + Math.cos(fromAngle) * (radius - 40)
            const y1 = centerY + Math.sin(fromAngle) * (radius - 40)
            const x2 = centerX + Math.cos(toAngle) * (radius - 40)
            const y2 = centerY + Math.sin(toAngle) * (radius - 40)
            
            const isActive = isPlaying && currentStep === index

            return (
              <motion.path
                key={index}
                d={`M ${x1} ${y1} Q ${centerX} ${centerY} ${x2} ${y2}`}
                fill="none"
                stroke={isActive ? '#22c55e' : '#d1d5db'}
                strokeWidth={isActive ? 3 : 2}
                strokeDasharray="5,5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: isActive ? 1 : 0.3 }}
                transition={{ duration: 1 }}
              />
            )
          })}
        </svg>
      </div>

      {/* 当前步骤说明 */}
      <AnimatePresence mode="wait">
        {isPlaying && (
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center p-4 bg-white rounded-xl mb-4"
          >
            <p className="text-ink-700">{CYCLE_STEPS[currentStep]?.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 元素详情 */}
      <AnimatePresence>
        {activeElementData && !isPlaying && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-xl p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center text-white', activeElementData.color)}>
                {activeElementData.icon}
              </div>
              <div>
                <h4 className="font-bold text-ink-800">{activeElementData.name}</h4>
                <p className="text-sm text-ink-500">{activeElementData.ecoFunction}</p>
              </div>
            </div>
            <p className="text-ink-600">{activeElementData.description}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 进度指示 */}
      <div className="flex justify-center gap-2 mt-4">
        {ECO_ELEMENTS.map(element => (
          <div
            key={element.id}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              viewedElements.has(element.id) ? 'bg-eco-500' : 'bg-ink-200'
            )}
          />
        ))}
      </div>
      
      {viewedElements.size >= ECO_ELEMENTS.length && (
        <p className="text-center text-sm text-eco-600 mt-2">
          ✓ 已了解四素同构生态系统
        </p>
      )}
    </div>
  )
}
