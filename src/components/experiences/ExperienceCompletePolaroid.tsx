/**
 * 体验完成后的拍立得引导组件
 * 在用户完成非遗体验后弹出，引导用户创建专属拍立得留念
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  Sparkles, 
  Leaf, 
  ArrowRight,
  CheckCircle,
  Gift
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { usePolaroidStore, EXPERIENCE_TO_SCENE } from '@/store/polaroidStore'
import { EcoScene } from '@/types/eco'
import { cn } from '@/lib/utils'

interface ExperienceCompletePolaroidProps {
  experienceId: string
  experienceName: string
  carbonSaved: number
  pointsEarned: number
  isVisible: boolean
  onClose: () => void
  onCreatePolaroid?: () => void
}

// 场景配置
const SCENE_CONFIGS: Record<EcoScene, {
  name: string
  bgGradient: string
  icon: string
  message: string
}> = {
  hani_terrace: {
    name: '哈尼梯田',
    bgGradient: 'from-eco-400 via-bamboo-300 to-sky-400',
    icon: '🏔️',
    message: '千年梯田的生态智慧，值得被记录',
  },
  tea_garden: {
    name: '生态茶园',
    bgGradient: 'from-eco-500 via-eco-400 to-bamboo-300',
    icon: '🍵',
    message: '一杯茶的碳汇故事，留下美好瞬间',
  },
  bamboo_forest: {
    name: '竹海深处',
    bgGradient: 'from-bamboo-500 via-eco-400 to-bamboo-300',
    icon: '🎋',
    message: '以竹代塑的智慧，值得传承',
  },
  batik_workshop: {
    name: '蜡染工坊',
    bgGradient: 'from-blue-600 via-indigo-400 to-blue-300',
    icon: '🎨',
    message: '靛蓝之美，天然之道',
  },
  paper_cutting: {
    name: '剪纸工坊',
    bgGradient: 'from-red-500 via-rose-400 to-red-300',
    icon: '✂️',
    message: '纸艺之美，可降解的艺术',
  },
  clay_studio: {
    name: '泥塑工坊',
    bgGradient: 'from-amber-500 via-orange-400 to-amber-300',
    icon: '🏺',
    message: '黄土芬芳，零污染的创作',
  },
}

export default function ExperienceCompletePolaroid({
  experienceId,
  experienceName,
  carbonSaved,
  pointsEarned,
  isVisible,
  onClose,
  onCreatePolaroid,
}: ExperienceCompletePolaroidProps) {
  const navigate = useNavigate()
  const { openPolaroidModal, unlockScene, unlockedScenes } = usePolaroidStore()
  const [showUnlockAnimation, setShowUnlockAnimation] = useState(false)
  
  // 获取对应的拍立得场景
  const scene = EXPERIENCE_TO_SCENE[experienceId] || 'hani_terrace'
  const sceneConfig = SCENE_CONFIGS[scene]
  const isNewUnlock = !unlockedScenes.includes(scene)

  // 解锁新场景
  useEffect(() => {
    if (isVisible && isNewUnlock) {
      setShowUnlockAnimation(true)
      unlockScene(scene)
      
      const timer = setTimeout(() => {
        setShowUnlockAnimation(false)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, isNewUnlock, scene, unlockScene])

  const handleCreatePolaroid = () => {
    onClose()
    openPolaroidModal('experience_complete', scene)
    navigate('/experience/ai-polaroid')
    onCreatePolaroid?.()
  }

  const handleSkip = () => {
    onClose()
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
          onClick={handleSkip}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl"
          >
            {/* 顶部渐变背景 */}
            <div className={cn(
              'relative h-40 bg-gradient-to-br flex items-center justify-center',
              sceneConfig.bgGradient
            )}>
              {/* 关闭按钮 */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
              
              {/* 场景图标 */}
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl"
              >
                {sceneConfig.icon}
              </motion.div>

              {/* 解锁动画 */}
              <AnimatePresence>
                {showUnlockAnimation && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-black/40"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="flex flex-col items-center"
                    >
                      <Gift className="w-12 h-12 text-white mb-2" />
                      <p className="text-white font-bold">新场景解锁！</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 装饰粒子 */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-white/30 rounded-full"
                    initial={{ 
                      x: Math.random() * 100 + '%', 
                      y: '100%',
                      opacity: 0 
                    }}
                    animate={{ 
                      y: '-20%',
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3,
                      delay: i * 0.5,
                      repeat: Infinity,
                      ease: 'easeOut'
                    }}
                  />
                ))}
              </div>
            </div>

            {/* 内容区域 */}
            <div className="p-6">
              {/* 完成提示 */}
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-5 h-5 text-eco-500" />
                <span className="text-eco-600 font-medium">体验完成</span>
              </div>
              
              <h3 className="text-2xl font-bold text-ink-900 mb-2">
                {experienceName}之旅
              </h3>
              
              <p className="text-ink-500 mb-4">
                {sceneConfig.message}
              </p>

              {/* 成就数据 */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-eco-50 rounded-xl p-3 text-center">
                  <Leaf className="w-5 h-5 text-eco-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-eco-700">{carbonSaved}g</p>
                  <p className="text-xs text-eco-600">碳减排</p>
                </div>
                <div className="bg-amber-50 rounded-xl p-3 text-center">
                  <Sparkles className="w-5 h-5 text-amber-500 mx-auto mb-1" />
                  <p className="text-lg font-bold text-amber-700">+{pointsEarned}</p>
                  <p className="text-xs text-amber-600">绿色积分</p>
                </div>
              </div>

              {/* 拍立得引导 */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 mb-4 border border-purple-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center flex-shrink-0">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-ink-900 mb-1">
                      创建专属拍立得
                    </h4>
                    <p className="text-sm text-ink-500">
                      在「{sceneConfig.name}」场景下拍摄一张专属留念，
                      记录你的生态之旅
                    </p>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleSkip}
                >
                  稍后再说
                </Button>
                <Button
                  className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                  onClick={handleCreatePolaroid}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  去创作
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
