/**
 * 演示讲解录制组件 - 专家演示辅助工具
 * 功能：
 * - 自动执行演示脚本
 * - 自动运镜和界面切换
 * - 讲解字幕显示
 * - 时间估算和进度跟踪
 * - 控制面板（播放/暂停/跳转）
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Clock, 
  Video,
  Mic,
  X,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize
} from 'lucide-react'
import { cn } from '@/lib/utils'

// 演示步骤类型
interface DemoStep {
  id: string
  title: string                    // 步骤标题
  narration: string                // 讲解文字
  duration: number                 // 预估时长（秒）
  route?: string                   // 跳转路由
  action?: () => void | Promise<void>  // 自定义动作
  highlight?: string[]             // 高亮元素选择器
  camera?: {                       // 运镜配置
    zoom?: number
    pan?: { x: number; y: number }
    duration?: number
  }
  waitForUser?: boolean            // 是否等待用户操作
  autoScroll?: {                   // 自动滚动
    target: string
    behavior?: 'smooth' | 'auto'
  }
}

// 演示章节
interface DemoChapter {
  id: string
  title: string
  icon: string
  steps: DemoStep[]
}

// 完整演示脚本 - 甘肃省青年生态文明创新创业大赛
const DEMO_SCRIPT: DemoChapter[] = [
  {
    id: 'intro',
    title: '项目背景',
    icon: '🌍',
    steps: [
      {
        id: 'intro-1',
        title: '提出乡遗识',
        narration: '提出乡遗识——乡村生态智慧的数字化科普与体验平台。',
        duration: 5,
        route: '/'
      },
      {
        id: 'intro-2',
        title: '双碳目标',
        narration: '2030年碳达峰、2060年碳中和，是国家重大战略目标。传统非遗技艺蕴含着古人与自然和谐共生的生态智慧，却面临认知断层。',
        duration: 8,
        route: '/'
      },
      {
        id: 'intro-3',
        title: '三大痛点',
        narration: '当前生态科普面临三大痛点：传统科普形式枯燥缺乏吸引力；非遗生态智慧被忽视难以触及；环保行为缺乏即时反馈和激励。',
        duration: 8
      },
      {
        id: 'intro-4',
        title: '解决方案',
        narration: '乡遗识，基于WebXR技术的沉浸式生态智慧科普平台，让非遗传承成为一种绿色生活方式。',
        duration: 6
      }
    ]
  },
  {
    id: 'bamboo-weaving',
    title: '核心体验',
    icon: '🎋',
    steps: [
      {
        id: 'bamboo-1',
        title: '安溪藤铁工艺',
        narration: '我们采用Three.js技术，构建实时渲染的3D数字孪生编织场景。以国家级非遗"安溪藤铁工艺"为载体，诠释"以竹代塑"的生态智慧。',
        duration: 9,
        route: '/experience/bamboo-weaving'
      },
      {
        id: 'bamboo-2',
        title: '千人千面系统',
        narration: '基于算法生成的"千人千面"个性化系统，每位用户获得独一无二的编织设计——专属配色、产品形状、编织DNA。让每次体验都与众不同。',
        duration: 9
      },
      {
        id: 'bamboo-3',
        title: 'MediaPipe手势识别',
        narration: '集成MediaPipe手势识别技术，支持握拳、点赞、剪刀手等多种手势交互。21个手部关键点实时追踪，带来沉浸式编织体验。',
        duration: 8
      },
      {
        id: 'bamboo-4',
        title: '开始编织体验',
        narration: '现在开始编织体验。通过触控滑动或手势操作，藤条逐渐缠绕在铁丝骨架上。3D模型实时响应，创造真实的非遗手工艺体验。',
        duration: 10,
        waitForUser: true
      },
      {
        id: 'bamboo-5',
        title: '编织DNA生成',
        narration: '编织完成！系统自动生成专属编织DNA：独特称号、技能等级、平滑度、创意度。每个作品都记录了用户的碳减排贡献——减少塑料350克，减碳500克。',
        duration: 10
      }
    ]
  },
  {
    id: 'polaroid',
    title: 'AI拍立得',
    icon: '📸',
    steps: [
      {
        id: 'polaroid-1',
        title: '3D数据直传',
        narration: '点击生成专属拍立得。区别于普通截图，系统将3D模型数据直接传输到拍立得界面，实现高清实时渲染的编织作品展示。',
        duration: 8,
        route: '/experience/ai-polaroid'
      },
      {
        id: 'polaroid-2',
        title: '复古相机设计',
        narration: '仿真复古宝丽来相机设计，皮革纹理、多层镜头反射、烫金品牌标识。藤编纹理边框与编织DNA配色保持一致，形成完整的视觉体验。',
        duration: 8
      },
      {
        id: 'polaroid-3',
        title: '绿色数据背面',
        narration: '翻转拍立得，背面展示绿色环保数据：碳减排500克、减少塑料150克。竹子分解仅需6个月，而塑料需要450年。以竹代塑，守护地球。',
        duration: 9
      }
    ]
  },
  {
    id: 'eco-system',
    title: '生态体系',
    icon: '💚',
    steps: [
      {
        id: 'eco-1',
        title: '碳账户系统',
        narration: '每一次体验行为，都能实时转化为碳积分。平台内置个人碳账户系统，记录每次云游体验的碳减排量，可用于企业ESG报告。',
        duration: 8
      },
      {
        id: 'eco-2',
        title: '绿色积分激励',
        narration: '绿色积分可兑换非遗文创产品、参与碳交易，让环保行为获得真实回报。游戏化设计让绿色生活充满乐趣。',
        duration: 7
      },
      {
        id: 'eco-3',
        title: '社交裂变传播',
        narration: 'AI拍立得一键分享到社交媒体，形成"体验-创作-分享-传播"的闭环。让环保理念在年轻人中自发传播。',
        duration: 7
      }
    ]
  },
  {
    id: 'conclusion',
    title: '价值展望',
    icon: '🚀',
    steps: [
      {
        id: 'conclusion-1',
        title: '技术创新',
        narration: '乡遗识融合WebGL实时3D渲染、MediaPipe手势识别、AI个性化生成等前沿技术，为非遗传承提供全新数字化科普方案。',
        duration: 8
      },
      {
        id: 'conclusion-2',
        title: '社会价值',
        narration: '预计10万用户规模下，年减碳量可达5000吨二氧化碳，相当于种植28万棵树，为双碳目标贡献实实在在的力量。',
        duration: 8
      },
      {
        id: 'conclusion-3',
        title: '项目愿景',
        narration: '我们的愿景：让每个年轻人都能在互动体验中理解并践行绿色生活方式。技术创新驱动生态科普，共建美丽中国，贡献双碳目标。',
        duration: 8,
        route: '/'
      },
      {
        id: 'conclusion-4',
        title: '感谢关注',
        narration: '感谢您的关注！乡遗识——探寻乡村生态智慧，共享绿色文脉遗产。',
        duration: 5
      }
    ]
  }
]

// 计算总时长
const calculateTotalDuration = (chapters: DemoChapter[]) => {
  return chapters.reduce((total, chapter) => 
    total + chapter.steps.reduce((chapterTotal, step) => chapterTotal + step.duration, 0), 0
  )
}

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// 演示控制器组件
export default function DemoPresenter() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [stepProgress, setStepProgress] = useState(0)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showScript, setShowScript] = useState(true)
  
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null)
  
  const totalDuration = calculateTotalDuration(DEMO_SCRIPT)
  const currentChapter = DEMO_SCRIPT[currentChapterIndex]
  const currentStep = currentChapter?.steps[currentStepIndex]
  
  // 计算当前位置之前的总时长
  const getElapsedBeforeCurrent = () => {
    let elapsed = 0
    for (let i = 0; i < currentChapterIndex; i++) {
      elapsed += DEMO_SCRIPT[i].steps.reduce((t, s) => t + s.duration, 0)
    }
    for (let i = 0; i < currentStepIndex; i++) {
      elapsed += currentChapter.steps[i].duration
    }
    return elapsed
  }
  
  // 执行当前步骤
  const executeStep = useCallback(async (step: DemoStep) => {
    // 路由跳转
    if (step.route && location.pathname !== step.route) {
      navigate(step.route)
    }
    
    // 语音朗读
    if (!isMuted && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(step.narration)
      utterance.lang = 'zh-CN'
      utterance.rate = 0.9
      utterance.pitch = 1
      speechRef.current = utterance
      window.speechSynthesis.speak(utterance)
    }
    
    // 执行自定义动作
    if (step.action) {
      await step.action()
    }
    
    // 高亮元素
    if (step.highlight) {
      step.highlight.forEach(selector => {
        const el = document.querySelector(selector)
        if (el) {
          el.classList.add('demo-highlight')
        }
      })
    }
  }, [navigate, location.pathname, isMuted])
  
  // 清除高亮
  const clearHighlights = useCallback(() => {
    document.querySelectorAll('.demo-highlight').forEach(el => {
      el.classList.remove('demo-highlight')
    })
  }, [])
  
  // 下一步
  const nextStep = useCallback(() => {
    clearHighlights()
    
    if (currentStepIndex < currentChapter.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1)
      setStepProgress(0)
    } else if (currentChapterIndex < DEMO_SCRIPT.length - 1) {
      setCurrentChapterIndex(prev => prev + 1)
      setCurrentStepIndex(0)
      setStepProgress(0)
    } else {
      // 演示结束
      setIsPlaying(false)
    }
  }, [currentChapterIndex, currentStepIndex, currentChapter, clearHighlights])
  
  // 上一步
  const prevStep = useCallback(() => {
    clearHighlights()
    
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1)
      setStepProgress(0)
    } else if (currentChapterIndex > 0) {
      const prevChapter = DEMO_SCRIPT[currentChapterIndex - 1]
      setCurrentChapterIndex(prev => prev - 1)
      setCurrentStepIndex(prevChapter.steps.length - 1)
      setStepProgress(0)
    }
  }, [currentChapterIndex, currentStepIndex, clearHighlights])
  
  // 跳转到指定章节
  const goToChapter = useCallback((chapterIndex: number) => {
    clearHighlights()
    setCurrentChapterIndex(chapterIndex)
    setCurrentStepIndex(0)
    setStepProgress(0)
  }, [clearHighlights])
  
  // 重置
  const reset = useCallback(() => {
    setIsPlaying(false)
    setCurrentChapterIndex(0)
    setCurrentStepIndex(0)
    setElapsedTime(0)
    setStepProgress(0)
    clearHighlights()
    window.speechSynthesis?.cancel()
  }, [clearHighlights])
  
  // 播放/暂停切换
  const togglePlay = useCallback(() => {
    setIsPlaying(prev => !prev)
  }, [])
  
  // 步骤变化时执行
  useEffect(() => {
    if (currentStep) {
      executeStep(currentStep)
    }
  }, [currentChapterIndex, currentStepIndex, executeStep, currentStep])
  
  // 播放计时器
  useEffect(() => {
    if (isPlaying && currentStep) {
      timerRef.current = setInterval(() => {
        setStepProgress(prev => {
          const newProgress = prev + (100 / currentStep.duration)
          if (newProgress >= 100) {
            nextStep()
            return 0
          }
          return newProgress
        })
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, currentStep, nextStep])
  
  // 暂停时停止语音
  useEffect(() => {
    if (!isPlaying) {
      window.speechSynthesis?.pause()
    } else {
      window.speechSynthesis?.resume()
    }
  }, [isPlaying])
  
  // 静音切换
  useEffect(() => {
    if (isMuted) {
      window.speechSynthesis?.cancel()
    }
  }, [isMuted])

  // 最小化模式
  if (isMinimized) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-4 right-4 z-[9999]"
      >
        <button
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-heritage-600 to-eco-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <Video className="w-5 h-5" />
          <span className="font-medium">演示控制</span>
          <span className="text-sm opacity-80">{formatTime(elapsedTime)} / {formatTime(totalDuration)}</span>
          {isPlaying && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-t from-black/95 to-black/80 backdrop-blur-lg text-white"
    >
      {/* 进度条 */}
      <div className="h-1 bg-white/20">
        <motion.div 
          className="h-full bg-gradient-to-r from-heritage-500 to-eco-500"
          style={{ width: `${(elapsedTime / totalDuration) * 100}%` }}
        />
      </div>
      
      {/* 讲解字幕区域 */}
      <AnimatePresence mode="wait">
        {showScript && currentStep && (
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-6 py-4 border-b border-white/10"
          >
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{currentChapter.icon}</span>
                <span className="text-heritage-400 text-sm">{currentChapter.title}</span>
                <ChevronRight className="w-4 h-4 text-white/40" />
                <span className="text-white font-medium">{currentStep.title}</span>
              </div>
              <p className="text-lg leading-relaxed text-white/90">{currentStep.narration}</p>
              
              {/* 步骤进度 */}
              <div className="mt-3 h-1 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-eco-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${stepProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 控制栏 */}
      <div className="px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* 左侧：时间和章节 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-white/60" />
              <span className="font-mono">{formatTime(elapsedTime)}</span>
              <span className="text-white/40">/</span>
              <span className="font-mono text-white/60">{formatTime(totalDuration)}</span>
            </div>
            
            {/* 章节选择器 */}
            <div className="flex items-center gap-1">
              {DEMO_SCRIPT.map((chapter, index) => (
                <button
                  key={chapter.id}
                  onClick={() => goToChapter(index)}
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all',
                    index === currentChapterIndex
                      ? 'bg-heritage-500 text-white'
                      : index < currentChapterIndex
                        ? 'bg-eco-500/50 text-white'
                        : 'bg-white/10 text-white/60 hover:bg-white/20'
                  )}
                  title={chapter.title}
                >
                  {chapter.icon}
                </button>
              ))}
            </div>
          </div>
          
          {/* 中间：播放控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={reset}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="重置"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            
            <button
              onClick={prevStep}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="上一步"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={togglePlay}
              className="w-12 h-12 bg-heritage-500 hover:bg-heritage-600 rounded-full flex items-center justify-center transition-colors"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>
            
            <button
              onClick={nextStep}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="下一步"
            >
              <SkipForward className="w-5 h-5" />
            </button>
          </div>
          
          {/* 右侧：其他控制 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={isMuted ? '开启语音' : '静音'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setShowScript(!showScript)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title={showScript ? '隐藏字幕' : '显示字幕'}
            >
              <Mic className={cn('w-5 h-5', !showScript && 'opacity-50')} />
            </button>
            
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="最小化"
            >
              <Minimize className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => {/* 打开设置 */}}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="设置"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 步骤指示器 */}
      <div className="px-6 pb-3">
        <div className="max-w-4xl mx-auto flex items-center gap-1">
          {currentChapter.steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => {
                setCurrentStepIndex(index)
                setStepProgress(0)
              }}
              className={cn(
                'flex-1 h-1 rounded-full transition-all',
                index === currentStepIndex
                  ? 'bg-heritage-500'
                  : index < currentStepIndex
                    ? 'bg-eco-500'
                    : 'bg-white/20'
              )}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// 演示启动按钮组件
export function DemoStartButton({ className }: { className?: string }) {
  const [showPresenter, setShowPresenter] = useState(false)
  
  return (
    <>
      <button
        onClick={() => setShowPresenter(true)}
        className={cn(
          'flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-heritage-600 to-eco-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all font-medium',
          className
        )}
      >
        <Video className="w-5 h-5" />
        开始演示讲解
      </button>
      
      {showPresenter && <DemoPresenter />}
    </>
  )
}

// 高亮样式（需要添加到全局CSS）
// .demo-highlight {
//   animation: demo-pulse 2s ease-in-out infinite;
//   box-shadow: 0 0 0 4px rgba(var(--heritage-500), 0.5);
// }
// @keyframes demo-pulse {
//   0%, 100% { box-shadow: 0 0 0 4px rgba(var(--heritage-500), 0.5); }
//   50% { box-shadow: 0 0 0 8px rgba(var(--heritage-500), 0.3); }
// }
