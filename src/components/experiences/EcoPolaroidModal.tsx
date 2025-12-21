/**
 * 生态拍立得弹窗组件
 * 可以在任意页面以弹窗形式打开拍立得功能
 * 深度融入整个应用的生态宣教流程
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
  ChevronRight,
  Share2,
  Lock,
  CheckCircle
} from 'lucide-react'
import { 
  EcoScene, 
  PolaroidResult, 
  ECO_POLAROID_FILTER,
  generateId
} from '@/types/eco'
import { useGreenPointsStore, addSharePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { usePolaroidStore, SCENE_UNLOCK_CONDITIONS } from '@/store/polaroidStore'
import { ECO_LEVELS, CARBON_SAVINGS_CONFIG } from '@/types/eco'
import { cn } from '@/lib/utils'

/** 场景配置 */
const SCENE_CONFIGS: Record<EcoScene, {
  name: string
  description: string
  bgGradient: string
  icon: string
  carbonSaving: number
  ecoFact: string
}> = {
  hani_terrace: {
    name: '哈尼梯田',
    description: '云雾缭绕的千年梯田',
    bgGradient: 'from-eco-400 via-bamboo-300 to-sky-400',
    icon: '🏔️',
    carbonSaving: CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving,
    ecoFact: '哈尼梯田的"四素同构"生态系统，实现了水资源100%循环利用',
  },
  tea_garden: {
    name: '生态茶园',
    description: '云雾山间的有机茶园',
    bgGradient: 'from-eco-500 via-eco-400 to-bamboo-300',
    icon: '🍵',
    carbonSaving: CARBON_SAVINGS_CONFIG.tea_ceremony.baseSaving,
    ecoFact: '1公顷茶园每年可吸收约15吨二氧化碳，是天然的碳汇宝库',
  },
  bamboo_forest: {
    name: '竹海深处',
    description: '翠竹摇曳的绿色海洋',
    bgGradient: 'from-bamboo-500 via-eco-400 to-bamboo-300',
    icon: '🎋',
    carbonSaving: CARBON_SAVINGS_CONFIG.bamboo_weaving.baseSaving,
    ecoFact: '竹子生长速度是普通树木的3-5倍，是最佳的"以竹代塑"材料',
  },
  batik_workshop: {
    name: '蜡染工坊',
    description: '靛蓝飘香的传统工坊',
    bgGradient: 'from-blue-600 via-indigo-400 to-blue-300',
    icon: '🎨',
    carbonSaving: CARBON_SAVINGS_CONFIG.batik.baseSaving,
    ecoFact: '传统蜡染使用植物染料，可完全生物降解，零化学污染',
  },
  paper_cutting: {
    name: '剪纸工坊',
    description: '红纸飞舞的艺术空间',
    bgGradient: 'from-red-500 via-rose-400 to-red-300',
    icon: '✂️',
    carbonSaving: CARBON_SAVINGS_CONFIG.paper_cutting.baseSaving,
    ecoFact: '纸张可100%回收再利用，是最环保的艺术载体之一',
  },
  clay_studio: {
    name: '泥塑工坊',
    description: '黄土芬芳的创作天地',
    bgGradient: 'from-amber-500 via-orange-400 to-amber-300',
    icon: '🏺',
    carbonSaving: CARBON_SAVINGS_CONFIG.clay_sculpture.baseSaving,
    ecoFact: '泥塑使用天然黏土，烧制过程零化学添加，是古老的环保工艺',
  }
}

// 生态寄语
const ECO_MESSAGES = [
  '每一次云游，都是对地球的温柔守护 🌍',
  '传承非遗，守护绿色家园 🌿',
  '低碳出行，从云游开始 ☁️',
  '文化与生态，和谐共生 🎋',
  '用心感受，用行动守护 💚',
  '千年智慧，绿色传承 🏔️',
  '每一份减碳，都是对未来的承诺 🌱',
  '探索乡村，发现生态之美 🦋',
]

interface EcoPolaroidModalProps {
  isOpen: boolean
  onClose: () => void
  initialScene?: EcoScene
  onComplete?: (result: PolaroidResult) => void
}

export default function EcoPolaroidModal({
  isOpen,
  onClose,
  initialScene,
  onComplete,
}: EcoPolaroidModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const { 
    currentScene, 
    setCurrentScene, 
    unlockedScenes, 
    addPolaroid,
    triggerSource 
  } = usePolaroidStore()
  
  const [step, setStep] = useState<'select' | 'capture' | 'preview' | 'result'>('select')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [polaroidResult, setPolaroidResult] = useState<PolaroidResult | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const { currentLevel } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  const levelInfo = ECO_LEVELS[currentLevel]
  
  // 使用初始场景或当前场景
  const selectedScene = initialScene || currentScene
  const sceneConfig = SCENE_CONFIGS[selectedScene]
  const isSceneUnlocked = unlockedScenes.includes(selectedScene)

  // 设置初始场景
  useEffect(() => {
    if (initialScene && isOpen) {
      setCurrentScene(initialScene)
    }
  }, [initialScene, isOpen, setCurrentScene])

  // 初始化摄像头
  useEffect(() => {
    if (step === 'capture' && videoRef.current && isSceneUnlocked) {
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
  }, [step, isSceneUnlocked])

  // 重置状态
  useEffect(() => {
    if (!isOpen) {
      setStep('select')
      setCapturedImage(null)
      setPolaroidResult(null)
      setIsFlipped(false)
      setIsCameraReady(false)
    }
  }, [isOpen])

  // 拍照
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    setTimeout(() => {
      const video = videoRef.current!
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0)

      applyPolaroidFilter(ctx, canvas.width, canvas.height)

      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      setIsCapturing(false)
      setStep('preview')
    }, 300)
  }, [])

  // 应用滤镜
  const applyPolaroidFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const filter = ECO_POLAROID_FILTER

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, data[i] + filter.warmth * 20)
      data[i + 2] = Math.max(0, data[i + 2] - filter.warmth * 10)

      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i] + (avg - data[i]) * filter.fadeLevel
      data[i + 1] = data[i + 1] + (avg - data[i + 1]) * filter.fadeLevel
      data[i + 2] = data[i + 2] + (avg - data[i + 2]) * filter.fadeLevel

      const noise = (Math.random() - 0.5) * filter.grain * 50
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)

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

  // 生成拍立得
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
      ecoMessage: ECO_MESSAGES[Math.floor(Math.random() * ECO_MESSAGES.length)],
      filter: ECO_POLAROID_FILTER
    }

    addSharePoints(`生成${sceneConfig.name}拍立得`, POINTS_REWARDS.polaroid_create)
    addCarbonSaving({
      type: 'cloud_tour',
      carbonSaved: sceneConfig.carbonSaving,
      description: `云游${sceneConfig.name}`,
      experienceId: selectedScene
    })

    addPolaroid(result)
    setPolaroidResult(result)
    setStep('result')
    onComplete?.(result)
  }, [capturedImage, selectedScene, sceneConfig, currentLevel, addCarbonSaving, addPolaroid, onComplete])

  // 下载
  const handleDownload = useCallback(() => {
    if (!polaroidResult) return
    
    const link = document.createElement('a')
    link.download = `乡遗识-${sceneConfig.name}-${Date.now()}.png`
    link.href = polaroidResult.imageDataUrl
    link.click()
  }, [polaroidResult, sceneConfig])

  // 重拍
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
    setCurrentScene(scenes[newIndex])
  }

  const handleNextScene = () => {
    const newIndex = currentSceneIndex < scenes.length - 1 ? currentSceneIndex + 1 : 0
    setCurrentScene(scenes[newIndex])
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl overflow-hidden max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl"
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-4 border-b border-ink-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-eco-500" />
              <h2 className="font-bold text-ink-800">生态拍立得</h2>
              {triggerSource === 'experience_complete' && (
                <span className="px-2 py-0.5 bg-eco-100 text-eco-600 text-xs rounded-full">
                  体验纪念
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-ink-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-ink-500" />
            </button>
          </div>

          {/* 内容 */}
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
                  <p className="text-center text-ink-600">选择生态场景，留下专属记忆</p>

                  {/* 场景轮播 */}
                  <div className="relative">
                    <button
                      onClick={handlePrevScene}
                      className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div 
                      className={cn(
                        'aspect-[4/3] rounded-2xl overflow-hidden bg-gradient-to-br relative',
                        sceneConfig.bgGradient,
                        !isSceneUnlocked && 'opacity-60'
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

                      {/* 锁定遮罩 */}
                      {!isSceneUnlocked && (
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center">
                          <Lock className="w-12 h-12 text-white/80 mb-2" />
                          <p className="text-white/90 text-sm text-center px-4">
                            {SCENE_UNLOCK_CONDITIONS[selectedScene]}
                          </p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleNextScene}
                      className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/80 rounded-full shadow-lg hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* 生态知识卡片 */}
                  <div className="bg-eco-50 rounded-xl p-4 border border-eco-100">
                    <div className="flex items-start gap-3">
                      <Leaf className="w-5 h-5 text-eco-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-eco-700 mb-1">生态知识</p>
                        <p className="text-sm text-eco-600">{sceneConfig.ecoFact}</p>
                      </div>
                    </div>
                  </div>

                  {/* 场景指示器 */}
                  <div className="flex justify-center gap-2">
                    {scenes.map((scene, index) => (
                      <button
                        key={scene}
                        onClick={() => setCurrentScene(scene)}
                        className={cn(
                          'h-2 rounded-full transition-all',
                          index === currentSceneIndex ? 'w-6 bg-eco-500' : 'w-2 bg-ink-200',
                          !unlockedScenes.includes(scene) && 'opacity-50'
                        )}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => isSceneUnlocked && setStep('capture')}
                    disabled={!isSceneUnlocked}
                    className={cn(
                      'w-full py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
                      isSceneUnlocked
                        ? 'bg-eco-500 hover:bg-eco-600 text-white'
                        : 'bg-ink-200 text-ink-400 cursor-not-allowed'
                    )}
                  >
                    <Camera className="w-5 h-5" />
                    {isSceneUnlocked ? '开始拍摄' : '场景未解锁'}
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
                  <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-900">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover scale-x-[-1]"
                    />
                    
                    <div 
                      className={cn(
                        'absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none',
                        sceneConfig.bgGradient
                      )}
                    />

                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm flex items-center gap-2">
                      <span>{sceneConfig.icon}</span>
                      {sceneConfig.name}
                    </div>

                    {/* 拍立得边框 */}
                    <div className="absolute inset-3 border-4 border-white/30 rounded-lg pointer-events-none" />

                    {!isCameraReady && (
                      <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                          <p className="text-white">启动摄像头...</p>
                        </div>
                      </div>
                    )}

                    {/* 闪光效果 */}
                    <AnimatePresence>
                      {isCapturing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-white"
                        />
                      )}
                    </AnimatePresence>
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
                      disabled={!isCameraReady || isCapturing}
                      className="flex-1 py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Camera className="w-5 h-5" />
                      {isCapturing ? '拍摄中...' : '拍摄'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* 预览 */}
              {step === 'preview' && capturedImage && (
                <motion.div
                  key="preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-4"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-xl bg-white p-3">
                    <img 
                      src={capturedImage} 
                      alt="预览" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute bottom-6 left-0 right-0 text-center">
                      <p className="text-ink-600 font-medium">{sceneConfig.name}</p>
                      <p className="text-ink-400 text-sm">{new Date().toLocaleDateString('zh-CN')}</p>
                    </div>
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

              {/* 结果 */}
              {step === 'result' && polaroidResult && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {/* 可翻转拍立得 */}
                  <div 
                    className="relative aspect-[3/4] cursor-pointer mx-auto max-w-xs"
                    onClick={() => setIsFlipped(!isFlipped)}
                    style={{ perspective: '1000px' }}
                  >
                    <motion.div
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.6 }}
                      className="w-full h-full"
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      {/* 正面 */}
                      <div 
                        className="absolute inset-0 bg-white rounded-xl shadow-xl p-3"
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

                      {/* 背面 */}
                      <div 
                        className="absolute inset-0 bg-gradient-to-br from-eco-50 to-bamboo-50 rounded-xl shadow-xl p-6 flex flex-col justify-between"
                        style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      >
                        <div className="flex-1 flex flex-col items-center justify-center">
                          <Leaf className="w-10 h-10 text-eco-500 mb-3" />
                          <p className="text-center text-ink-700 font-medium mb-4">
                            {polaroidResult.ecoMessage}
                          </p>
                          <div className="bg-white/60 rounded-xl p-3 w-full">
                            <p className="text-xs text-eco-600 text-center mb-1">生态贡献</p>
                            <div className="flex justify-center gap-4">
                              <div className="text-center">
                                <p className="font-bold text-eco-700">{polaroidResult.carbonSaved}g</p>
                                <p className="text-xs text-ink-500">碳减排</p>
                              </div>
                              <div className="text-center">
                                <p className="font-bold text-amber-600">+{polaroidResult.pointsEarned}</p>
                                <p className="text-xs text-ink-500">积分</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-center text-xs text-eco-400">
                          乡遗识 · 生态智慧平台
                        </p>
                      </div>
                    </motion.div>
                  </div>

                  {/* 成功提示 */}
                  <div className="flex items-center justify-center gap-2 text-eco-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">拍立得已保存到相册</span>
                  </div>

                  {/* 操作按钮 */}
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={handleRetake}
                      className="py-3 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-medium flex flex-col items-center gap-1 transition-colors"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <span className="text-xs">再拍一张</span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex flex-col items-center gap-1 transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span className="text-xs">保存</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium flex flex-col items-center gap-1 transition-colors"
                    >
                      <Share2 className="w-5 h-5" />
                      <span className="text-xs">分享</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
