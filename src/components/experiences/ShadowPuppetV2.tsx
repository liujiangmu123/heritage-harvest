/**
 * 皮影戏体验 - 简化版：剧目驱动的自定义皮影创建与表演
 * 
 * 流程：选择剧目 → 创建角色 → 表演
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Theater, X, Camera, Sparkles, Play, Pause, Leaf, 
  Volume2, VolumeX, ChevronRight, Users, Upload
} from 'lucide-react'
import { lazy, Suspense } from 'react'
const ShadowPuppetCreator = lazy(() => import('./ShadowPuppetCreator'))
import { useNavigate } from 'react-router-dom'
import { usePolaroidStore } from '@/store/polaroidStore'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'

// ============ 剧目配置 ============
interface PlayCharacter {
  id: string
  name: string
  role: string
  imageUrl: string | null
}

interface PlayConfig {
  id: string
  title: string
  description: string
  characters: PlayCharacter[]
  ecoMessage: string
  duration: number
  isCreated: boolean  // 是否已创建
}

// 默认剧目列表
const DEFAULT_PLAYS: PlayConfig[] = [
  {
    id: 'xixiang',
    title: '西厢记',
    description: '张生与崔莺莺的爱情故事',
    characters: [
      { id: 'cuiyingying', name: '崔莺莺', role: '旦角', imageUrl: null },
      { id: 'zhangsheng', name: '张生', role: '生角', imageUrl: null }
    ],
    ecoMessage: '一张牛皮承载千年爱情，传承百代',
    duration: 60,
    isCreated: false
  },
  {
    id: 'sanguo',
    title: '三英战吕布',
    description: '刘关张大战吕布',
    characters: [
      { id: 'guanyu', name: '关羽', role: '净角', imageUrl: null },
      { id: 'zhaoyun', name: '赵云', role: '武生', imageUrl: null }
    ],
    ecoMessage: '传统皮革工艺，植物鞣制零污染',
    duration: 55,
    isCreated: false
  },
  {
    id: 'mulan',
    title: '木兰从军',
    description: '花木兰代父出征',
    characters: [
      { id: 'mulan', name: '花木兰', role: '武旦', imageUrl: null }
    ],
    ecoMessage: '皮影戏中的巾帼不让须眉',
    duration: 50,
    isCreated: false
  },
  {
    id: 'baishe',
    title: '白蛇传',
    description: '白娘子与许仙的故事',
    characters: [
      { id: 'baisuzhen', name: '白素贞', role: '青衣', imageUrl: null },
      { id: 'xuxian', name: '许仙', role: '小生', imageUrl: null }
    ],
    ecoMessage: '千年传说，皮影演绎',
    duration: 60,
    isCreated: false
  }
]

// ============ 自定义皮影显示组件 ============
interface CustomPuppetProps {
  character: PlayCharacter
  x: number
  y: number
  isActive?: boolean
  onDrag?: (x: number, y: number) => void
}

function CustomPuppet({ character, x, y, isActive, onDrag }: CustomPuppetProps) {
  const puppetRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && puppetRef.current) {
      const parent = puppetRef.current.parentElement
      if (parent) {
        const rect = parent.getBoundingClientRect()
        const newX = ((e.clientX - rect.left) / rect.width) * 100
        const newY = ((e.clientY - rect.top) / rect.height) * 100
        onDrag?.(Math.max(10, Math.min(90, newX)), Math.max(15, Math.min(85, newY)))
      }
    }
  }, [isDragging, onDrag])
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])
  
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  if (!character.imageUrl) return null

  return (
    <motion.div
      ref={puppetRef}
      className="absolute cursor-grab active:cursor-grabbing select-none"
      style={{ 
        left: `${x}%`, 
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        filter: isActive ? 'drop-shadow(0 0 30px rgba(255,200,100,0.6))' : 'drop-shadow(2px 4px 6px rgba(0,0,0,0.3))'
      }}
      animate={{ 
        y: isActive ? [0, -8, 0] : 0,
        rotate: isActive ? [-2, 2, -2] : 0
      }}
      transition={{ 
        duration: 2, 
        repeat: isActive ? Infinity : 0,
        ease: "easeInOut"
      }}
      onMouseDown={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
    >
      <img 
        src={character.imageUrl} 
        alt={character.name}
        className="h-64 md:h-80 w-auto object-contain"
        draggable={false}
      />
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
        <span className="px-3 py-1 bg-amber-900/80 text-amber-100 text-sm rounded-full">
          {character.name}
        </span>
      </div>
    </motion.div>
  )
}

// ============ 主组件 ============
export default function ShadowPuppetV2() {
  const navigate = useNavigate()
  const stageRef = useRef<HTMLDivElement>(null)
  const { addPoints } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()

  const [stage, setStage] = useState<'intro' | 'select' | 'perform' | 'complete'>('intro')
  const [plays, setPlays] = useState<PlayConfig[]>(DEFAULT_PLAYS)
  const [selectedPlayId, setSelectedPlayId] = useState<string | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  
  // 皮影位置状态
  const [puppetPositions, setPuppetPositions] = useState<{[key: string]: {x: number, y: number}}>({})

  const selectedPlay = plays.find(p => p.id === selectedPlayId) || null

  // 初始化皮影位置
  useEffect(() => {
    if (selectedPlay && stage === 'perform') {
      const positions: {[key: string]: {x: number, y: number}} = {}
      selectedPlay.characters.forEach((char, index) => {
        positions[char.id] = {
          x: 25 + index * 50,
          y: 50
        }
      })
      setPuppetPositions(positions)
    }
  }, [selectedPlay, stage])

  // 自动表演动画
  useEffect(() => {
    if (stage === 'perform' && isPlaying && selectedPlay) {
      const animationInterval = setInterval(() => {
        const time = Date.now()
        setPuppetPositions(prev => {
          const newPos = { ...prev }
          selectedPlay.characters.forEach((char, index) => {
            if (prev[char.id]) {
              newPos[char.id] = {
                x: 25 + index * 50 + Math.sin(time / 2000 + index) * 15,
                y: 50 + Math.sin(time / 1500 + index * 0.5) * 8
              }
            }
          })
          return newPos
        })
      }, 50)

      const progressInterval = setInterval(() => {
        setProgress(prev => {
          const duration = selectedPlay.duration
          const increment = 100 / duration
          if (prev >= 100) {
            setIsPlaying(false)
            setShowCompletion(true)
            clearInterval(animationInterval)
            clearInterval(progressInterval)
            
            addPoints({ type: 'experience', points: 80, description: '完成皮影戏表演体验' })
            addCarbonSaving({ 
              type: 'digital_experience', 
              carbonSaved: 350, 
              description: '传统皮影循环利用体验',
              experienceId: 'shadow_puppet'
            })
            
            return 100
          }
          return prev + increment
        })
      }, 1000)

      return () => {
        clearInterval(animationInterval)
        clearInterval(progressInterval)
      }
    }
  }, [stage, isPlaying, selectedPlay, addPoints, addCarbonSaving])

  // 开始播放（只有已创建的剧目才能播放）
  const handleStartPlay = (play: PlayConfig) => {
    if (!play.isCreated) return
    setSelectedPlayId(play.id)
    setStage('perform')
    setProgress(0)
    setIsPlaying(true)
    setShowCompletion(false)
  }

  // 选择剧目进入创建
  const handleSelectForCreate = (play: PlayConfig) => {
    setSelectedPlayId(play.id)
    setShowCreator(true)
  }

  // 创建完成回调
  const handleCreatorComplete = (createdPlay: any) => {
    // 更新剧目状态
    setPlays(prev => prev.map(p => {
      if (p.id === selectedPlayId) {
        return {
          ...p,
          characters: createdPlay.characters,
          isCreated: true
        }
      }
      return p
    }))
    setShowCreator(false)
    
    // 创建完成后直接开始播放
    const updatedPlay = {
      ...plays.find(p => p.id === selectedPlayId)!,
      characters: createdPlay.characters,
      isCreated: true
    }
    handleStartPlay(updatedPlay)
  }

  const handlePuppetDrag = (charId: string, x: number, y: number) => {
    setPuppetPositions(prev => ({
      ...prev,
      [charId]: { x, y }
    }))
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-amber-950 via-amber-900 to-amber-950">
      {/* 返回按钮 */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 z-50 p-2 bg-black/30 hover:bg-black/50 rounded-full text-white/80 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* 开始演示按钮 */}
      <button
        onClick={() => setStage('select')}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded-full text-white text-sm flex items-center gap-2 transition-colors"
      >
        <Play className="w-4 h-4" />
        开始演示
      </button>

      {/* 舞台背景 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 90% 70% at 50% 45%, 
            rgba(255,248,230,1) 0%,
            rgba(255,238,200,1) 15%,
            rgba(255,215,155,1) 30%,
            rgba(240,185,115,1) 50%,
            rgba(200,140,70,1) 70%,
            rgba(140,85,40,1) 85%,
            rgba(60,35,18,1) 100%
          )`
        }}
      />

      {/* 舞台边框装饰 */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 flex items-center gap-4 z-30">
        <img src="/images/木窗框元素.png" alt="" className="h-12 opacity-90" />
        <span className="text-amber-100 text-2xl font-bold tracking-[0.5em] drop-shadow-lg">
          光 影 戏 台
        </span>
        <img src="/images/木窗框元素.png" alt="" className="h-12 opacity-90 scale-x-[-1]" />
      </div>

      {/* 音量控制 */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-black/30 hover:bg-black/50 rounded-full text-white/80"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 介绍界面 */}
      <AnimatePresence>
        {stage === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center"
          >
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-gradient-to-b from-amber-100/95 to-amber-50/95 backdrop-blur-sm rounded-3xl p-8 max-w-lg mx-4 shadow-2xl text-center"
            >
              <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-amber-900 mb-2">🎭 皮影戏 · 光影传奇</h2>
              <p className="text-amber-600 mb-6">两千年的光影艺术，指尖上的中华文化</p>
              
              <div className="bg-eco-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 text-eco-700 mb-2">
                  <Leaf className="w-4 h-4" />
                  <span className="font-bold">循环经济 · 百年传承</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-eco-600 font-bold">100年+</div>
                    <div className="text-eco-500 text-xs">传统皮影寿命</div>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <div className="text-eco-600 font-bold">100%</div>
                    <div className="text-eco-500 text-xs">天然牛皮材料</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStage('select')}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <Theater className="w-5 h-5" />
                选择剧目开始创建
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 剧目选择界面 */}
      <AnimatePresence>
        {stage === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[85vh] overflow-y-auto"
            >
              <h3 className="text-2xl font-bold text-amber-900 mb-2 text-center">选择剧目</h3>
              <p className="text-amber-600 text-center mb-6">已创建的剧目可直接播放，未创建需先上传角色</p>
              
              <div className="space-y-4">
                {plays.map((play) => (
                  <motion.div
                    key={play.id}
                    whileHover={{ scale: 1.01 }}
                    className={`w-full bg-white/80 rounded-2xl p-4 transition-colors shadow-sm ${
                      play.isCreated ? 'hover:bg-white border-2 border-green-300' : 'border-2 border-amber-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
                        play.isCreated 
                          ? 'bg-gradient-to-br from-green-200 to-green-300' 
                          : 'bg-gradient-to-br from-amber-200 to-amber-300'
                      }`}>
                        {play.isCreated ? '✅' : '🎭'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-lg text-amber-900">{play.title}</h4>
                          {play.isCreated && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">已创建</span>
                          )}
                        </div>
                        <p className="text-amber-600 text-sm mb-2">{play.description}</p>
                        <div className="flex items-center gap-3 text-xs text-amber-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {play.characters.map(c => c.name).join('、')}
                          </span>
                        </div>
                      </div>
                      
                      {/* 操作按钮 */}
                      <div className="flex flex-col gap-2">
                        {play.isCreated ? (
                          <button
                            onClick={() => handleStartPlay(play)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 flex items-center gap-1"
                          >
                            <Play className="w-4 h-4" />
                            播放
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSelectForCreate(play)}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 flex items-center gap-1"
                          >
                            <Upload className="w-4 h-4" />
                            创建
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-eco-50 rounded-lg">
                      <p className="text-xs text-eco-600 flex items-center gap-1">
                        <Leaf className="w-3 h-3" />
                        {play.ecoMessage}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <button
                onClick={() => setStage('intro')}
                className="w-full mt-4 py-3 text-amber-600 hover:text-amber-800 transition-colors"
              >
                返回
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 表演舞台 */}
      {stage === 'perform' && selectedPlay && (
        <div 
          ref={stageRef}
          className="absolute inset-0 pt-24 pb-36"
        >
          <div className="relative w-full h-full">
            {selectedPlay.characters.map((char) => {
              const pos = puppetPositions[char.id]
              if (!pos) return null
              
              return (
                <CustomPuppet
                  key={char.id}
                  character={char}
                  x={pos.x}
                  y={pos.y}
                  isActive={isPlaying}
                  onDrag={(x, y) => handlePuppetDrag(char.id, x, y)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* 播放控制条 */}
      {stage === 'perform' && selectedPlay && (
        <div className="absolute bottom-0 left-0 right-0 z-30">
          <div className="bg-gradient-to-t from-amber-950/95 to-transparent pt-12 pb-6 px-6">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-2 text-amber-200 text-sm">
                <span>表演进度</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-amber-800/50 rounded-full overflow-hidden mb-4">
                <motion.div 
                  className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => {
                    setStage('select')
                    setIsPlaying(false)
                    setProgress(0)
                  }}
                  className="p-3 bg-amber-800/50 hover:bg-amber-800 rounded-full text-amber-200"
                >
                  <X className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-4 bg-amber-500 hover:bg-amber-600 rounded-full text-white"
                >
                  {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                </button>
                <button
                  onClick={() => {/* 截图功能 */}}
                  className="p-3 bg-amber-800/50 hover:bg-amber-800 rounded-full text-amber-200"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>
              
              <div className="text-center mt-3">
                <p className="text-amber-100 font-bold">{selectedPlay.title}</p>
                <p className="text-amber-300 text-sm">{selectedPlay.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 完成弹窗 */}
      <AnimatePresence>
        {showCompletion && selectedPlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-amber-100 to-amber-50 rounded-3xl p-8 max-w-md mx-4 shadow-2xl text-center"
            >
              <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-amber-900 mb-2">🎭 精彩表演！</h3>
              <p className="text-amber-600 mb-6">{selectedPlay.title} · 完美落幕</p>
              
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-eco-100 rounded-xl p-3">
                  <div className="text-eco-600 font-bold text-lg">+80</div>
                  <div className="text-eco-500 text-xs">绿色积分</div>
                </div>
                <div className="bg-eco-100 rounded-xl p-3">
                  <div className="text-eco-600 font-bold text-lg">350g</div>
                  <div className="text-eco-500 text-xs">碳减排</div>
                </div>
                <div className="bg-eco-100 rounded-xl p-3">
                  <div className="text-eco-600 font-bold text-lg">1</div>
                  <div className="text-eco-500 text-xs">剧目完成</div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCompletion(false)
                    setStage('select')
                    setProgress(0)
                  }}
                  className="flex-1 py-3 bg-amber-200 text-amber-800 rounded-xl hover:bg-amber-300"
                >
                  换个剧目
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600"
                >
                  返回首页
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 皮影创建器 */}
      {showCreator && (
        <Suspense fallback={<div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"><div className="text-white">加载中...</div></div>}>
          <ShadowPuppetCreator 
            onClose={() => {
              setShowCreator(false)
              setSelectedPlayId(null)
            }}
            preSelectedPlayId={selectedPlayId || undefined}
            onComplete={handleCreatorComplete}
          />
        </Suspense>
      )}
    </div>
  )
}
