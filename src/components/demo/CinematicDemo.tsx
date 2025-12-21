/**
 * 乡遗识 - 电影级自动演示组件
 * 仿照luminous-nexus风格，专注编织体验完整流程
 * 无解说，纯自动录制
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Play, Pause, X, Video, Square, Download, Sparkles, Leaf,
  Camera, Briefcase, Globe, TrendingUp, Award, Zap, Hand
} from 'lucide-react'
import { 
  createCinematicController, 
  CINEMATIC_SCENES, 
  shouldShowCard,
  shouldShowFocusTip,
  isFullscreenTitle,
  CinematicScene,
} from '../../services/cinematicDemo'
import { createScreenRecorder, RECORDING_STATUS, VIDEO_QUALITY } from '../../services/screenRecorder'

// 场景图标映射 - 与文案同步的22个场景
const SCENE_ICONS: Record<string, typeof Zap> = {
  'opening-title': Zap,
  'dual-carbon-bg': Globe,
  'heritage-data': Sparkles,
  'pain-points': TrendingUp,
  'platform-position': Leaf,
  'six-categories-intro': Sparkles,
  'six-categories-detail': Sparkles,
  'tech-threejs': Briefcase,
  'ai-design-system': Award,
  'weaving-enter': Leaf,
  'weaving-intro': Leaf,
  'weaving-close-modal': Leaf,
  'weaving-animation': Leaf,
  'gesture-tech': Hand,
  'carbon-record': Globe,
  'polaroid-transition': Camera,
  'polaroid-camera': Camera,
  'polaroid-photo': Camera,
  'polaroid-flip': Leaf,
  'six-loop-design': Sparkles,
  'carbon-account': Globe,
  'eco-promise-wall': Award,
  'webxr-tech': Briefcase,
  'business-model': Briefcase,
  'carbon-impact': Globe,
  'vision': Sparkles,
  'closing-title': Zap,
}

// ==================== 全屏标题场景 ====================
function FullscreenTitle({ scene, progress }: { scene: CinematicScene; progress: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 z-[60]"
    >
      {/* 电影黑边 */}
      <div className="absolute inset-x-0 top-0 h-16 bg-black" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-black" />
      
      {/* 粒子背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-eco-400/30 rounded-full"
            style={{ 
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100],
              opacity: [0.3, 0.8, 0],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* 主内容 */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="text-center relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <motion.div
            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-heritage-500 to-eco-600 flex items-center justify-center shadow-2xl"
            animate={{ 
              boxShadow: [
                '0 0 40px rgba(196,30,58,0.4)',
                '0 0 60px rgba(34,197,94,0.4)',
                '0 0 40px rgba(196,30,58,0.4)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Leaf className="w-10 h-10 text-white" />
          </motion.div>
        </motion.div>
        
        {/* 标题 */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-heritage-400 via-eco-400 to-heritage-400 bg-clip-text text-transparent mb-4"
        >
          {scene.title}
        </motion.h1>
        
        {/* 副标题 */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-xl text-slate-400 whitespace-pre-line"
        >
          {scene.subtitle}
        </motion.p>
        
        {/* 联系方式 */}
        {scene.showContact && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-10 flex flex-col items-center gap-2"
          >
            <div className="text-slate-500 text-sm">
              甘肃省青年生态文明创新创业大赛
            </div>
          </motion.div>
        )}
      </motion.div>
      
      {/* 底部进度条 */}
      <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-40">
        <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-heritage-500 to-eco-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 叠加信息卡片（右上角，半透明，不遮挡内容）====================
function OverlayCard({ scene, progress }: { scene: CinematicScene; progress: number }) {
  const Icon = SCENE_ICONS[scene.id] || Sparkles
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-24 right-6 z-[55] pointer-events-none"
    >
      <div className="relative max-w-sm">
        {/* 背景光晕 */}
        <div className="absolute -inset-4 bg-gradient-to-r from-heritage-500/5 via-eco-500/5 to-heritage-500/5 blur-xl rounded-full" />
        
        {/* 卡片 - 增加透明度 */}
        <div className="relative rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/40 p-5 shadow-xl">
          {/* 顶部装饰 */}
          <div className="absolute -top-px left-1/2 -translate-x-1/2 w-24 h-0.5 bg-gradient-to-r from-transparent via-eco-400 to-transparent" />
          
          {/* 图标和标题 */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-heritage-500/20 to-eco-500/20 flex items-center justify-center">
              <Icon className="w-6 h-6 text-eco-400" />
            </div>
            <div>
              <p className="text-xs text-eco-400 uppercase tracking-wider font-medium">
                {scene.type === 'feature' ? '核心功能' : scene.type === 'business' ? '技术创新' : scene.type === 'impact' ? '生态价值' : '项目介绍'}
              </p>
              <h2 className="text-xl font-bold text-white">{scene.title}</h2>
            </div>
          </div>
          
          {/* 副标题 */}
          {scene.subtitle && (
            <p className="text-slate-300 mb-3">{scene.subtitle}</p>
          )}
          
          {/* 标语 */}
          {scene.tagline && (
            <p className="text-eco-400 text-sm font-medium mb-3">{scene.tagline}</p>
          )}
          
          {/* 要点列表 */}
          {scene.bullets && (
            <div className="space-y-2">
              {scene.bullets.map((bullet, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-slate-300 text-sm"
                >
                  {bullet}
                </motion.p>
              ))}
            </div>
          )}
          
          {/* 进度条 */}
          <div className="mt-4 pt-3 border-t border-slate-700/50">
            <div className="h-0.5 bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-heritage-500 to-eco-500"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 聚焦提示条（顶部居中，不遮挡内容）====================
function FocusTip({ scene }: { scene: CinematicScene }) {
  const Icon = SCENE_ICONS[scene.id] || Sparkles
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[80] pointer-events-none"
    >
      <div className="rounded-full bg-slate-900/90 backdrop-blur-md border border-eco-500/50 px-6 py-2 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-heritage-500/30 to-eco-500/30 flex items-center justify-center flex-shrink-0">
            <Icon className="w-4 h-4 text-eco-400" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-white font-semibold text-sm">{scene.title}</h3>
            <span className="text-slate-500">·</span>
            <p className="text-slate-400 text-sm">{scene.tip}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 高亮遮罩 ====================
function HighlightMask({ area }: { area?: string }) {
  if (!area) return null
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[52] pointer-events-none"
    >
      <div className="absolute inset-0 bg-black/40" />
    </motion.div>
  )
}

// ==================== 迷你控制条 ====================
function MiniControls({ 
  isPlaying, 
  isPaused, 
  isRecording,
  sceneIndex, 
  totalScenes, 
  totalProgress,
  onPlayPause,
  onStartRecording,
  onStopRecording,
  onClose 
}: {
  isPlaying: boolean
  isPaused: boolean
  isRecording: boolean
  sceneIndex: number
  totalScenes: number
  totalProgress: number
  onPlayPause: () => void
  onStartRecording: () => void
  onStopRecording: () => void
  onClose: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-[85]"
    >
      <div className="rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-2 shadow-lg">
        {/* 进度指示 */}
        <div className="flex items-center gap-2 px-2 mb-2">
          <span className="text-xs text-slate-500">{sceneIndex + 1}/{totalScenes}</span>
          <div className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden w-20">
            <div 
              className="h-full bg-gradient-to-r from-heritage-500 to-eco-500 transition-all duration-300"
              style={{ width: `${totalProgress * 100}%` }}
            />
          </div>
          {isRecording && (
            <motion.span
              className="w-2 h-2 rounded-full bg-red-500"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          )}
        </div>
        
        {/* 控制按钮 */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPlayPause}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {isPlaying && !isPaused ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          
          {!isRecording ? (
            <button
              onClick={onStartRecording}
              className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-slate-800 transition-colors"
              title="开始录制"
            >
              <Video className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onStopRecording}
              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="停止录制"
            >
              <Square className="w-4 h-4" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            title="退出"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ==================== 录制完成面板 ====================
function RecordingCompletePanel({ 
  recorder, 
  onReset, 
  onClose 
}: { 
  recorder: ReturnType<typeof createScreenRecorder>
  onReset: () => void
  onClose: () => void 
}) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  
  useEffect(() => {
    setPreviewUrl(recorder.getPreviewUrl())
  }, [recorder])
  
  const handleExportVideo = async () => {
    try {
      await recorder.exportVideo('xiangyi-demo')
    } catch (err) {
      console.error('Export failed:', err)
    }
  }
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="max-w-md w-full mx-4 rounded-2xl bg-slate-900 border border-slate-700/50 overflow-hidden shadow-2xl"
      >
        {previewUrl && (
          <div className="bg-black">
            <video src={previewUrl} controls className="w-full max-h-56 object-contain" />
          </div>
        )}
        
        <div className="p-5">
          <div className="text-center mb-5">
            <div className="w-14 h-14 mx-auto mb-3 rounded-xl bg-gradient-to-br from-eco-500 to-heritage-500 flex items-center justify-center">
              <Download className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">录制完成！</h3>
            <p className="text-slate-400 text-sm">演示视频已准备就绪</p>
          </div>
          
          <button
            onClick={handleExportVideo}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-heritage-500 to-eco-500 text-white font-medium mb-3"
          >
            <Video className="w-4 h-4" />
            导出视频
          </button>
          
          <div className="flex gap-3">
            <button
              onClick={onReset}
              className="flex-1 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              重新录制
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 text-sm text-eco-400 hover:text-eco-300 transition-colors"
            >
              完成
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ==================== 开始界面 ====================
function StartScreen({ 
  onStart, 
  onStartWithRecording 
}: { 
  onStart: () => void
  onStartWithRecording: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/95 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="text-center"
      >
        {/* Logo */}
        <motion.div
          animate={{ 
            boxShadow: [
              '0 0 40px rgba(196,30,58,0.3)',
              '0 0 60px rgba(34,197,94,0.3)',
              '0 0 40px rgba(196,30,58,0.3)',
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-heritage-500 to-eco-600 flex items-center justify-center"
        >
          <Leaf className="w-10 h-10 text-white" />
        </motion.div>
        
        <h2 className="text-2xl font-bold text-white mb-2">电影级演示</h2>
        <p className="text-slate-400 mb-8">自动播放 · 专业运镜 · 一键录制</p>
        
        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStart}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-heritage-500 to-eco-500 text-white font-medium shadow-lg"
          >
            <Play className="w-5 h-5" />
            开始演示
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onStartWithRecording}
            className="flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-red-500/20 text-red-400 font-medium border border-red-500/30"
          >
            <Video className="w-5 h-5" />
            录制演示
          </motion.button>
        </div>
        
        <p className="text-slate-500 text-xs mt-6">
          按 ESC 退出 · 空格键 暂停/继续
        </p>
      </motion.div>
    </motion.div>
  )
}

// ==================== 主组件 ====================
interface CinematicDemoProps {
  isOpen: boolean
  onClose: () => void
}

export default function CinematicDemo({ isOpen, onClose }: CinematicDemoProps) {
  const navigate = useNavigate()
  const [controller] = useState(() => createCinematicController())
  const [recorder] = useState(() => createScreenRecorder({ quality: VIDEO_QUALITY.ULTRA }))
  
  const [showStartScreen, setShowStartScreen] = useState(true)
  const [currentScene, setCurrentScene] = useState(CINEMATIC_SCENES[0])
  const [sceneIndex, setSceneIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [sceneProgress, setSceneProgress] = useState(0)
  const [totalProgress, setTotalProgress] = useState(0)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingStatus, setRecordingStatus] = useState<string>(RECORDING_STATUS.IDLE)
  
  // 处理动作
  const handleAction = useCallback((action: string, scene: CinematicScene) => {
    switch (action) {
      case 'scrollToTop':
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
      case 'scrollToExperiences':
        // 滚动到六大体验区，确保完全可见
        const expSection = document.getElementById('experiences')
        if (expSection) {
          const rect = expSection.getBoundingClientRect()
          window.scrollTo({ 
            top: window.scrollY + rect.top - 80, // 留出顶部空间
            behavior: 'smooth' 
          })
        }
        break
      case 'scrollToJourney':
        // 滚动到"你的生态之旅"部分，确保完全显示在视口中央偏下
        const journeySection = document.querySelector('[class*="journey"]') || 
                               document.querySelector('h2')
        // 找到包含"生态之旅"文字的元素
        const allH2 = document.querySelectorAll('h2')
        let targetElement: Element | null = null
        allH2.forEach(h2 => {
          if (h2.textContent?.includes('生态之旅')) {
            targetElement = h2.parentElement || h2
          }
        })
        if (targetElement) {
          const rect = (targetElement as HTMLElement).getBoundingClientRect()
          // 滚动到该元素顶部距离视口顶部100px的位置
          window.scrollTo({ 
            top: window.scrollY + rect.top - 100, 
            behavior: 'smooth' 
          })
        } else {
          // 备用：滚动到页面45%位置
          window.scrollTo({ top: document.body.scrollHeight * 0.45, behavior: 'smooth' })
        }
        break
      case 'scrollToImpact':
        // 滚动到生态影响力数据区
        const allSections = document.querySelectorAll('section, div[class*="impact"], div[class*="stats"]')
        let impactTarget: Element | null = null
        document.querySelectorAll('h2, h3').forEach(h => {
          if (h.textContent?.includes('影响') || h.textContent?.includes('碳')) {
            impactTarget = h.parentElement || h
          }
        })
        if (impactTarget) {
          const rect = (impactTarget as HTMLElement).getBoundingClientRect()
          window.scrollTo({ 
            top: window.scrollY + rect.top - 100, 
            behavior: 'smooth' 
          })
        } else {
          window.scrollTo({ top: document.body.scrollHeight * 0.65, behavior: 'smooth' })
        }
        break
      case 'navigateToWeaving':
        navigate('/experience/bamboo-weaving')
        break
      case 'closeWeavingModal':
        // 调用编织组件暴露的全局函数关闭弹窗
        setTimeout(() => {
          if ((window as any).__demoCloseModal) {
            (window as any).__demoCloseModal()
          } else {
            // 备用方案：点击触控编织按钮
            const buttons = document.querySelectorAll('button')
            buttons.forEach(btn => {
              if (btn.textContent?.includes('触控编织')) {
                btn.click()
              }
            })
          }
        }, 500)
        break
      case 'autoWeaveAnimation':
        // 调用编织组件暴露的全局自动编织函数
        setTimeout(() => {
          if ((window as any).__demoAutoWeave) {
            (window as any).__demoAutoWeave()
          }
        }, 500)
        break
      case 'navigateToPolaroid':
        navigate('/experience/ai-polaroid')
        break
      default:
        break
    }
    
    // 路由跳转
    if (scene.route) {
      navigate(scene.route)
    }
  }, [navigate])
  
  // 设置控制器回调
  useEffect(() => {
    controller.setOnSceneChange((scene, index) => {
      setCurrentScene(scene)
      setSceneIndex(index)
      
      // 处理路由跳转
      if (scene.route) {
        navigate(scene.route)
      }
    })
    
    controller.setOnProgress((progress, total) => {
      setSceneProgress(progress)
      setTotalProgress(total)
    })
    
    controller.setOnComplete(() => {
      setIsPlaying(false)
      if (isRecording) {
        handleStopRecording()
      }
    })
    
    controller.setOnAction(handleAction)
  }, [controller, navigate, isRecording, handleAction])
  
  // 录制状态回调
  useEffect(() => {
    recorder.setOnStatusChange((status) => {
      setRecordingStatus(status)
      if (status === RECORDING_STATUS.COMPLETED) {
        setIsRecording(false)
      }
    })
  }, [recorder])
  
  // 键盘快捷键
  useEffect(() => {
    if (!isOpen) return
    
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault()
          if (showStartScreen) return
          if (isPaused) {
            controller.resume()
            setIsPaused(false)
          } else if (isPlaying) {
            controller.pause()
            setIsPaused(true)
          }
          break
        case 'Escape':
          e.preventDefault()
          handleClose()
          break
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, isPlaying, isPaused, showStartScreen, controller])
  
  const handleStart = useCallback(() => {
    setShowStartScreen(false)
    controller.reset()
    setTimeout(() => {
      controller.play()
      setIsPlaying(true)
      setIsPaused(false)
    }, 500)
  }, [controller])
  
  const handleStartWithRecording = useCallback(async () => {
    const success = await recorder.start()
    if (success) {
      setIsRecording(true)
      setShowStartScreen(false)
      controller.reset()
      setTimeout(() => {
        controller.play()
        setIsPlaying(true)
        setIsPaused(false)
      }, 1000)
    }
  }, [recorder, controller])
  
  const handleStartRecording = useCallback(async () => {
    const success = await recorder.start()
    if (success) {
      setIsRecording(true)
    }
  }, [recorder])
  
  const handleStopRecording = useCallback(async () => {
    await recorder.stop()
    controller.pause()
    setIsPlaying(false)
    setIsPaused(true)
  }, [recorder, controller])
  
  const handleResetRecording = useCallback(() => {
    recorder.reset()
    setRecordingStatus(RECORDING_STATUS.IDLE)
    setShowStartScreen(true)
    controller.reset()
    setSceneProgress(0)
    setTotalProgress(0)
  }, [recorder, controller])
  
  const handlePlayPause = useCallback(() => {
    if (isPaused) {
      controller.resume()
      setIsPaused(false)
    } else if (isPlaying) {
      controller.pause()
      setIsPaused(true)
    } else {
      controller.play()
      setIsPlaying(true)
      setIsPaused(false)
    }
  }, [controller, isPlaying, isPaused])
  
  const handleClose = useCallback(() => {
    controller.stop()
    recorder.reset()
    setShowStartScreen(true)
    setIsPlaying(false)
    setIsPaused(false)
    setIsRecording(false)
    onClose()
  }, [controller, recorder, onClose])
  
  if (!isOpen) return null
  
  const isFullscreen = isFullscreenTitle(currentScene)
  const showCard = shouldShowCard(currentScene)
  const showTip = shouldShowFocusTip(currentScene)
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[50]">
        {/* 开始界面 */}
        <AnimatePresence>
          {showStartScreen && (
            <StartScreen 
              onStart={handleStart}
              onStartWithRecording={handleStartWithRecording}
            />
          )}
        </AnimatePresence>
        
        {/* 全屏标题场景 */}
        <AnimatePresence mode="wait">
          {!showStartScreen && isFullscreen && (
            <FullscreenTitle 
              key={currentScene.id}
              scene={currentScene} 
              progress={sceneProgress} 
            />
          )}
        </AnimatePresence>
        
        {/* 叠加信息卡片 */}
        <AnimatePresence mode="wait">
          {!showStartScreen && showCard && (
            <OverlayCard 
              key={currentScene.id}
              scene={currentScene} 
              progress={sceneProgress} 
            />
          )}
        </AnimatePresence>
        
        {/* 聚焦提示 */}
        <AnimatePresence mode="wait">
          {!showStartScreen && showTip && (
            <FocusTip key={currentScene.id} scene={currentScene} />
          )}
        </AnimatePresence>
        
        {/* 高亮遮罩 */}
        <AnimatePresence>
          {!showStartScreen && !isFullscreen && currentScene?.highlight && (
            <HighlightMask area={currentScene.highlight} />
          )}
        </AnimatePresence>
        
        {/* 迷你控制条 */}
        <AnimatePresence>
          {!showStartScreen && !isFullscreen && (
            <MiniControls
              isPlaying={isPlaying}
              isPaused={isPaused}
              isRecording={isRecording}
              sceneIndex={sceneIndex}
              totalScenes={CINEMATIC_SCENES.length}
              totalProgress={totalProgress}
              onPlayPause={handlePlayPause}
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
        
        {/* 录制完成面板 */}
        <AnimatePresence>
          {recordingStatus === RECORDING_STATUS.COMPLETED && (
            <RecordingCompletePanel
              recorder={recorder}
              onReset={handleResetRecording}
              onClose={handleClose}
            />
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}
