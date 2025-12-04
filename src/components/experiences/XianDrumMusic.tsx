/**
 * 西安鼓乐 - 沉浸式古乐演奏
 * 虚拟演奏古乐器，配合3D声波可视化
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  Info,
  Disc
} from 'lucide-react'
import { Link } from 'react-router-dom'

// 乐器配置
interface InstrumentConfig {
  id: string
  name: string
  type: 'percussion' | 'wind' | 'string'
  keys: string[]
  sounds: string[]
  color: string
  description: string
}

// 西安鼓乐乐器
const INSTRUMENTS: InstrumentConfig[] = [
  {
    id: 'gu',
    name: '堂鼓',
    type: 'percussion',
    keys: ['Q', 'W', 'E'],
    sounds: ['low', 'mid', 'high'],
    color: '#DC2626',
    description: '鼓乐之魂，节奏核心',
  },
  {
    id: 'bo',
    name: '大钹',
    type: 'percussion',
    keys: ['A', 'S'],
    sounds: ['crash', 'ride'],
    color: '#F59E0B',
    description: '金属之声，明亮悠远',
  },
  {
    id: 'luogu',
    name: '锣',
    type: 'percussion',
    keys: ['Z', 'X'],
    sounds: ['gong', 'small'],
    color: '#EAB308',
    description: '铜锣轰鸣，气势磅礴',
  },
  {
    id: 'sheng',
    name: '笙',
    type: 'wind',
    keys: ['1', '2', '3', '4', '5'],
    sounds: ['do', 're', 'mi', 'fa', 'sol'],
    color: '#10B981',
    description: '和声乐器，悠扬动听',
  },
]

// 音符可视化粒子
interface SoundParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  velocity: { x: number; y: number }
  life: number
  maxLife: number
}

export default function XianDrumMusic() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  
  const [selectedInstrument, setSelectedInstrument] = useState(INSTRUMENTS[0])
  const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set())
  const [particles, setParticles] = useState<SoundParticle[]>([])
  const [isMuted, setIsMuted] = useState(false)
  const [showGuide, setShowGuide] = useState(true)
  const [isPlaying, setIsPlaying] = useState(false)
  const [waveformData, setWaveformData] = useState<number[]>([])

  const particleIdRef = useRef(0)

  // 初始化音频上下文
  const initAudio = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.connect(audioContextRef.current.destination)
    }
    return audioContextRef.current
  }, [])

  // 播放音符
  const playNote = useCallback((frequency: number, duration: number = 0.5, type: OscillatorType = 'sine') => {
    const ctx = initAudio()
    if (isMuted) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(analyserRef.current || ctx.destination)
    
    oscillator.start()
    oscillator.stop(ctx.currentTime + duration)
  }, [initAudio, isMuted])

  // 播放鼓声
  const playDrum = useCallback((type: 'low' | 'mid' | 'high' | 'crash' | 'ride' | 'gong' | 'small') => {
    const ctx = initAudio()
    if (isMuted) return

    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filterNode = ctx.createBiquadFilter()

    // 不同鼓声的频率和参数
    const drumParams: Record<string, { freq: number; type: OscillatorType; decay: number }> = {
      low: { freq: 80, type: 'sine', decay: 0.5 },
      mid: { freq: 150, type: 'sine', decay: 0.3 },
      high: { freq: 250, type: 'triangle', decay: 0.2 },
      crash: { freq: 400, type: 'sawtooth', decay: 0.8 },
      ride: { freq: 600, type: 'square', decay: 0.4 },
      gong: { freq: 100, type: 'sine', decay: 1.5 },
      small: { freq: 300, type: 'triangle', decay: 0.3 },
    }

    const params = drumParams[type] || drumParams.mid

    oscillator.type = params.type
    oscillator.frequency.setValueAtTime(params.freq, ctx.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(params.freq * 0.5, ctx.currentTime + params.decay)

    filterNode.type = 'lowpass'
    filterNode.frequency.setValueAtTime(2000, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.8, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + params.decay)

    oscillator.connect(filterNode)
    filterNode.connect(gainNode)
    gainNode.connect(analyserRef.current || ctx.destination)

    oscillator.start()
    oscillator.stop(ctx.currentTime + params.decay)
  }, [initAudio, isMuted])

  // 播放笙声
  const playSheng = useCallback((note: string) => {
    const notes: Record<string, number> = {
      do: 262,
      re: 294,
      mi: 330,
      fa: 349,
      sol: 392,
    }
    playNote(notes[note] || 262, 0.8, 'sine')
  }, [playNote])

  // 添加粒子效果
  const addParticle = useCallback((color: string) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const newParticle: SoundParticle = {
      id: particleIdRef.current++,
      x: canvas.width / 2,
      y: canvas.height / 2,
      size: Math.random() * 20 + 10,
      color,
      velocity: {
        x: (Math.random() - 0.5) * 10,
        y: (Math.random() - 0.5) * 10,
      },
      life: 0,
      maxLife: 60,
    }

    setParticles(prev => [...prev.slice(-50), newParticle])
  }, [])

  // 处理按键
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const key = e.key.toUpperCase()
    if (activeKeys.has(key)) return

    setActiveKeys(prev => new Set([...prev, key]))

    // 查找对应的乐器和音符
    for (const instrument of INSTRUMENTS) {
      const keyIndex = instrument.keys.indexOf(key)
      if (keyIndex !== -1) {
        const sound = instrument.sounds[keyIndex]
        
        if (instrument.type === 'percussion') {
          playDrum(sound as any)
        } else if (instrument.type === 'wind') {
          playSheng(sound)
        }
        
        addParticle(instrument.color)
        setIsPlaying(true)
        break
      }
    }
  }, [activeKeys, playDrum, playSheng, addParticle])

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const key = e.key.toUpperCase()
    setActiveKeys(prev => {
      const next = new Set(prev)
      next.delete(key)
      return next
    })
  }, [])

  // 监听键盘事件
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [handleKeyDown, handleKeyUp])

  // 绘制可视化效果
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 20, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制中心圆环
      const centerX = canvas.width / 2
      const centerY = canvas.height / 2
      const time = Date.now() / 1000

      // 同心圆波纹
      for (let i = 0; i < 5; i++) {
        const radius = 50 + i * 40 + Math.sin(time * 2 + i) * 10
        const alpha = isPlaying ? 0.3 - i * 0.05 : 0.1
        
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // 绘制粒子
      setParticles(prev => {
        return prev.filter(particle => {
          particle.life++
          particle.x += particle.velocity.x
          particle.y += particle.velocity.y
          particle.velocity.x *= 0.98
          particle.velocity.y *= 0.98

          const alpha = 1 - particle.life / particle.maxLife
          const size = particle.size * alpha

          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2)
          ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0')
          ctx.fill()

          // 光晕效果
          ctx.beginPath()
          ctx.arc(particle.x, particle.y, size * 1.5, 0, Math.PI * 2)
          ctx.fillStyle = particle.color + Math.floor(alpha * 50).toString(16).padStart(2, '0')
          ctx.fill()

          return particle.life < particle.maxLife
        })
      })

      // 绘制频谱
      if (analyserRef.current && isPlaying) {
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        const barWidth = (canvas.width / dataArray.length) * 2
        let x = 0

        for (let i = 0; i < dataArray.length; i++) {
          const barHeight = (dataArray[i] / 255) * 100
          
          ctx.fillStyle = `hsl(${i * 2}, 70%, 50%)`
          ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight)
          
          x += barWidth
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    draw()

    return () => cancelAnimationFrame(animationId)
  }, [isPlaying])

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-stone-950 via-amber-950 to-stone-900">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </Link>
        
        <h1 className="text-xl font-bold text-amber-100 flex items-center gap-2">
          <Music className="w-5 h-5" />
          西安鼓乐
        </h1>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowGuide(true)}
            className="p-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 可视化画布 */}
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl"
        style={{ background: 'rgba(0,0,0,0.3)' }}
      />

      {/* 乐器选择 */}
      <div className="absolute top-24 left-0 right-0 z-10">
        <div className="flex justify-center gap-4">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.id}
              onClick={() => setSelectedInstrument(inst)}
              className={`
                px-6 py-3 rounded-xl font-medium transition-all
                ${selectedInstrument.id === inst.id 
                  ? 'text-white scale-105' 
                  : 'bg-black/30 text-white/70 hover:bg-black/50'
                }
              `}
              style={{
                backgroundColor: selectedInstrument.id === inst.id ? inst.color : undefined,
              }}
            >
              {inst.name}
            </button>
          ))}
        </div>
      </div>

      {/* 虚拟键盘 */}
      <div className="absolute bottom-24 left-0 right-0 z-10">
        <div className="flex justify-center gap-4 flex-wrap max-w-2xl mx-auto px-4">
          {INSTRUMENTS.map((inst) => (
            <div key={inst.id} className="flex gap-2">
              {inst.keys.map((key, idx) => (
                <button
                  key={key}
                  onMouseDown={() => {
                    setActiveKeys(prev => new Set([...prev, key]))
                    if (inst.type === 'percussion') {
                      playDrum(inst.sounds[idx] as any)
                    } else {
                      playSheng(inst.sounds[idx])
                    }
                    addParticle(inst.color)
                    setIsPlaying(true)
                  }}
                  onMouseUp={() => {
                    setActiveKeys(prev => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }}
                  onMouseLeave={() => {
                    setActiveKeys(prev => {
                      const next = new Set(prev)
                      next.delete(key)
                      return next
                    })
                  }}
                  className={`
                    w-16 h-16 rounded-xl font-bold text-xl transition-all
                    ${activeKeys.has(key)
                      ? 'scale-95 shadow-lg'
                      : 'hover:scale-105'
                    }
                  `}
                  style={{
                    backgroundColor: activeKeys.has(key) ? inst.color : `${inst.color}40`,
                    color: 'white',
                    boxShadow: activeKeys.has(key) ? `0 0 30px ${inst.color}` : 'none',
                  }}
                >
                  <div>{key}</div>
                  <div className="text-xs opacity-70">{inst.sounds[idx]}</div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* 操作提示 */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-amber-200/60 text-sm">
          使用键盘 Q W E A S Z X 1 2 3 4 5 演奏，或点击上方按钮
        </p>
      </div>

      {/* 使用指南 */}
      <AnimatePresence>
        {showGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/70"
            onClick={() => setShowGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-950 border border-amber-600/50 rounded-2xl p-8 max-w-lg mx-4"
            >
              <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center gap-2">
                <Music className="w-6 h-6" />
                西安鼓乐演奏指南
              </h2>
              
              <div className="space-y-4">
                {INSTRUMENTS.map((inst) => (
                  <div key={inst.id} className="flex items-start gap-3">
                    <div 
                      className="w-4 h-4 rounded-full shrink-0 mt-1"
                      style={{ backgroundColor: inst.color }}
                    />
                    <div>
                      <div className="text-amber-100 font-medium">{inst.name}</div>
                      <div className="text-amber-200/70 text-sm">{inst.description}</div>
                      <div className="text-amber-200/50 text-xs mt-1">
                        按键：{inst.keys.join(' ')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-black/30 rounded-xl">
                <p className="text-amber-200/80 text-sm">
                  💡 西安鼓乐被誉为"中国古代音乐的活化石"，是联合国教科文组织认定的人类非物质文化遗产。
                </p>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
              >
                开始演奏
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 装饰元素 */}
      <div className="absolute top-32 left-8 w-24 h-24 rounded-full bg-amber-500/10 blur-xl animate-pulse" />
      <div className="absolute bottom-32 right-8 w-32 h-32 rounded-full bg-red-500/10 blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
    </div>
  )
}
