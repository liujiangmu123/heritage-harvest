/**
 * AI拍立得合影系统
 * 实现用户与虚拟生态场景的合影功能
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera, 
  X, 
  Download, 
  RotateCcw,
  Sparkles,
  Leaf,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { 
  EcoScene, 
  PolaroidResult, 
  ECO_POLAROID_FILTER,
  getRandomEcoMessage,
  generateId
} from '@/types/eco'
import { useGreenPointsStore, addSharePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { ECO_LEVELS, CARBON_SAVINGS_CONFIG } from '@/types/eco'
import { cn } from '@/lib/utils'

/** 场景配置 */
const SCENE_CONFIGS: Record<EcoScene, {
  name: string
  description: string
  bgGradient: string
  icon: string
  carbonSaving: number
}> = {
  hani_terrace: {
    name: '哈尼梯田',
    description: '云雾缭绕的千年梯田',
    bgGradient: 'from-eco-400 via-bamboo-300 to-sky-400',
    icon: '🏔️',
    carbonSaving: CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving
  },
  tea_garden: {
    name: '生态茶园',
    description: '云雾山间的有机茶园',
    bgGradient: 'from-eco-500 via-eco-400 to-bamboo-300',
    icon: '🍵',
    carbonSaving: CARBON_SAVINGS_CONFIG.tea_ceremony.baseSaving
  },
  bamboo_forest: {
    name: '竹海深处',
    description: '翠竹摇曳的绿色海洋',
    bgGradient: 'from-bamboo-500 via-eco-400 to-bamboo-300',
    icon: '🎋',
    carbonSaving: CARBON_SAVINGS_CONFIG.bamboo_weaving.baseSaving
  },
  batik_workshop: {
    name: '蜡染工坊',
    description: '靛蓝飘香的传统工坊',
    bgGradient: 'from-blue-600 via-indigo-400 to-blue-300',
    icon: '🎨',
    carbonSaving: CARBON_SAVINGS_CONFIG.batik.baseSaving
  },
  paper_cutting: {
    name: '剪纸工坊',
    description: '红纸飞舞的艺术空间',
    bgGradient: 'from-heritage-500 via-primary-400 to-heritage-300',
    icon: '✂️',
    carbonSaving: CARBON_SAVINGS_CONFIG.paper_cutting.baseSaving
  },
  clay_studio: {
    name: '泥塑工坊',
    description: '黄土芬芳的创作天地',
    bgGradient: 'from-clay-500 via-terrace-400 to-clay-300',
    icon: '🏺',
    carbonSaving: CARBON_SAVINGS_CONFIG.clay_sculpture.baseSaving
  }
}

interface AIPolaroidGeneratorProps {
  onComplete?: (result: PolaroidResult) => void
  onClose?: () => void
  className?: string
}

export default function AIPolaroidGenerator({
  onComplete,
  onClose,
  className
}: AIPolaroidGeneratorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [step, setStep] = useState<'select' | 'capture' | 'preview' | 'result'>('select')
  const [selectedScene, setSelectedScene] = useState<EcoScene>('hani_terrace')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [polaroidResult, setPolaroidResult] = useState<PolaroidResult | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)

  const { currentLevel } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  const levelInfo = ECO_LEVELS[currentLevel]
  const sceneConfig = SCENE_CONFIGS[selectedScene]

  // 初始化摄像头
  useEffect(() => {
    if (step === 'capture' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setIsCameraReady(true)
          }
        })
        .catch(err => {
          console.error('摄像头访问失败:', err)
        })
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [step])

  // 拍照
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // 镜像翻转
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)

    // 应用滤镜效果
    applyPolaroidFilter(ctx, canvas.width, canvas.height)

    const imageData = canvas.toDataURL('image/png')
    setCapturedImage(imageData)
    setStep('preview')
  }, [])

  // 应用拍立得滤镜
  const applyPolaroidFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const filter = ECO_POLAROID_FILTER

    for (let i = 0; i < data.length; i += 4) {
      // 暖色调
      data[i] = Math.min(255, data[i] + filter.warmth * 20)
      data[i + 2] = Math.max(0, data[i + 2] - filter.warmth * 10)

      // 褪色效果
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i] + (avg - data[i]) * filter.fadeLevel
      data[i + 1] = data[i + 1] + (avg - data[i + 1]) * filter.fadeLevel
      data[i + 2] = data[i + 2] + (avg - data[i + 2]) * filter.fadeLevel

      // 颗粒感
      const noise = (Math.random() - 0.5) * filter.grain * 50
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)

    // 暗角效果
    if (filter.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      )
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, `rgba(0,0,0,${filter.vignette})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  }

  // 生成最终拍立得
  const generatePolaroid = useCallback(() => {
    if (!capturedImage) return

    const result: PolaroidResult = {
      id: generateId(),
      imageDataUrl: capturedImage,
      scene: selectedScene,
      sceneName: sceneConfig.name,
      date: new Date().toLocaleDateString('zh-CN'),
      ecoLevel: currentLevel,
      pointsEarned: POINTS_REWARDS.polaroid_create,
      carbonSaved: sceneConfig.carbonSaving,
      ecoMessage: getRandomEcoMessage(),
      filter: ECO_POLAROID_FILTER
    }

    // 添加积分和碳减排
    addSharePoints(`生成${sceneConfig.name}拍立得`, POINTS_REWARDS.polaroid_create)
    addCarbonSaving({
      type: 'cloud_tour',
      carbonSaved: sceneConfig.carbonSaving,
      description: `云游${sceneConfig.name}`,
      experienceId: selectedScene
    })

    setPolaroidResult(result)
    setStep('result')
    onComplete?.(result)
  }, [capturedImage, selectedScene, sceneConfig, currentLevel, addCarbonSaving, onComplete])

  // 下载拍立得
  const handleDownload = useCallback(() => {
    if (!polaroidResult) return
    
    const link = document.createElement('a')
    link.download = `乡遗识-${sceneConfig.name}-${Date.now()}.png`
    link.href = polaroidResult.imageDataUrl
    link.click()
  }, [polaroidResult, sceneConfig])

  // 重新拍摄
  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setPolaroidResult(null)
    setIsFlipped(false)
    setStep('capture')
  }, [])

  // 场景选择
  const scenes = Object.keys(SCENE_CONFIGS) as EcoScene[]
  const currentSceneIndex = scenes.indexOf(selectedScene)

  const handlePrevScene = () => {
    const newIndex = currentSceneIndex > 0 ? currentSceneIndex - 1 : scenes.length - 1
    setSelectedScene(scenes[newIndex])
  }

  const handleNextScene = () => {
    const newIndex = currentSceneIndex < scenes.length - 1 ? currentSceneIndex + 1 : 0
    setSelectedScene(scenes[newIndex])
  }

  return (
    <div className={cn('bg-white rounded-2xl overflow-hidden', className)}>
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-ink-100">
        <h2 className="font-bold text-ink-800 flex items-center gap-2">
          <Camera className="w-5 h-5 text-eco-500" />
          AI拍立得
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-ink-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-ink-500" />
        </button>
      </div>

      {/* 内容区域 */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {/* 场景选择 */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              <p className="text-center text-ink-600">选择你想要合影的生态场景</p>

              {/* 场景轮播 */}
              <div className="relative">
                <button
                  onClick={handlePrevScene}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div 
                  className={cn(
                    'aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br',
                    sceneConfig.bgGradient
                  )}
                >
                  <div className="h-full flex flex-col items-center justify-center text-white p-6">
                    <span className="text-6xl mb-4">{sceneConfig.icon}</span>
                    <h3 className="text-2xl font-bold">{sceneConfig.name}</h3>
                    <p className="text-white/80 mt-2">{sceneConfig.description}</p>
                    <div className="mt-4 px-3 py-1 bg-white/20 rounded-full text-sm">
                      碳减排 {sceneConfig.carbonSaving}g
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleNextScene}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* 场景指示器 */}
              <div className="flex justify-center gap-2">
                {scenes.map((scene, index) => (
                  <button
                    key={scene}
                    onClick={() => setSelectedScene(scene)}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      index === currentSceneIndex ? 'w-6 bg-eco-500' : 'bg-ink-200'
                    )}
                  />
                ))}
              </div>

              <button
                onClick={() => setStep('capture')}
                className="w-full py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Camera className="w-5 h-5" />
                开始拍摄
              </button>
            </motion.div>
          )}

          {/* 拍摄界面 */}
          {step === 'capture' && (
            <motion.div
              key="capture"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-ink-900">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* 场景叠加层 */}
                <div 
                  className={cn(
                    'absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none',
                    sceneConfig.bgGradient
                  )}
                />

                {/* 场景标签 */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm flex items-center gap-2">
                  <span>{sceneConfig.icon}</span>
                  {sceneConfig.name}
                </div>

                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
                    <p className="text-white">正在启动摄像头...</p>
                  </div>
                )}
              </div>

              <canvas ref={canvasRef} className="hidden" />

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('select')}
                  className="flex-1 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-medium transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleCapture}
                  disabled={!isCameraReady}
                  className="flex-1 py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  拍摄
                </button>
              </div>
            </motion.div>
          )}

          {/* 预览界面 */}
          {step === 'preview' && capturedImage && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-4"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                <img 
                  src={capturedImage} 
                  alt="预览" 
                  className="w-full h-full object-cover"
                />
                
                {/* 拍立得边框效果 */}
                <div className="absolute inset-0 border-8 border-white pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-white" />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  重拍
                </button>
                <button
                  onClick={generatePolaroid}
                  className="flex-1 py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-5 h-5" />
                  生成拍立得
                </button>
              </div>
            </motion.div>
          )}

          {/* 结果展示 */}
          {step === 'result' && polaroidResult && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* 可翻转的拍立得卡片 */}
              <div 
                className="relative aspect-[3/4] cursor-pointer perspective-1000"
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <motion.div
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6 }}
                  className="w-full h-full preserve-3d"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* 正面 - 照片 */}
                  <div 
                    className="absolute inset-0 bg-white rounded-xl shadow-xl p-3 backface-hidden"
                    style={{ backfaceVisibility: 'hidden' }}
                  >
                    <div className="relative h-[70%] rounded-lg overflow-hidden">
                      <img 
                        src={polaroidResult.imageDataUrl} 
                        alt="拍立得" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs flex items-center gap-1">
                        <span>{sceneConfig.icon}</span>
                        {sceneConfig.name}
                      </div>
                    </div>
                    <div className="h-[30%] flex flex-col justify-center items-center">
                      <p className="text-sm text-ink-600">{polaroidResult.date}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span>{levelInfo.icon}</span>
                        <span className="text-xs text-ink-500">{levelInfo.name}</span>
                      </div>
                      <p className="text-xs text-ink-400 mt-2">点击翻转查看生态寄语</p>
                    </div>
                  </div>

                  {/* 背面 - 生态寄语 */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-br from-eco-50 to-bamboo-50 rounded-xl shadow-xl p-6 backface-hidden flex flex-col justify-center items-center"
                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                  >
                    <Leaf className="w-12 h-12 text-eco-500 mb-4" />
                    <p className="text-lg text-center text-ink-700 font-medium mb-4">
                      {polaroidResult.ecoMessage}
                    </p>
                    <div className="text-center">
                      <p className="text-sm text-eco-600">
                        本次云游减碳 {polaroidResult.carbonSaved}g
                      </p>
                      <p className="text-xs text-ink-400 mt-1">
                        获得 {polaroidResult.pointsEarned} 绿色积分
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <RotateCcw className="w-5 h-5" />
                  再拍一张
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  保存
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
