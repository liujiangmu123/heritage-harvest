/**
 * 安塞腰鼓 - 体感节奏游戏
 * 使用 MediaPipe Pose 进行全身姿态检测，评估腰鼓舞蹈动作
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Star,
  Trophy,
  ChevronLeft,
  Zap,
  Music
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Pose, Results as PoseResults } from '@mediapipe/pose'
import { Camera as MPCamera } from '@mediapipe/camera_utils'

// 节奏点类型
interface BeatNote {
  id: number
  type: 'left' | 'right' | 'both' | 'jump'
  time: number
  hit: boolean
}

// 游戏状态
interface GameState {
  score: number
  combo: number
  maxCombo: number
  perfectCount: number
  goodCount: number
  missCount: number
  isPlaying: boolean
}

// 节奏谱面（简化版）
const BEAT_PATTERN: Omit<BeatNote, 'id' | 'hit'>[] = [
  { type: 'right', time: 1000 },
  { type: 'left', time: 1500 },
  { type: 'right', time: 2000 },
  { type: 'left', time: 2500 },
  { type: 'both', time: 3000 },
  { type: 'right', time: 3500 },
  { type: 'left', time: 4000 },
  { type: 'jump', time: 4500 },
  { type: 'right', time: 5000 },
  { type: 'left', time: 5500 },
  { type: 'both', time: 6000 },
  { type: 'jump', time: 6500 },
  { type: 'right', time: 7000 },
  { type: 'right', time: 7250 },
  { type: 'left', time: 7500 },
  { type: 'left', time: 7750 },
  { type: 'both', time: 8000 },
]

export default function AnsaiDrum() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showCountdown, setShowCountdown] = useState(false)
  const [countdown, setCountdown] = useState(3)
  
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    combo: 0,
    maxCombo: 0,
    perfectCount: 0,
    goodCount: 0,
    missCount: 0,
    isPlaying: false,
  })

  const [currentBeat, setCurrentBeat] = useState<BeatNote | null>(null)
  const [beats, setBeats] = useState<BeatNote[]>([])
  const [poseData, setPoseData] = useState<{
    leftArm: 'up' | 'down'
    rightArm: 'up' | 'down'
    isJumping: boolean
  }>({ leftArm: 'down', rightArm: 'down', isJumping: false })
  
  const [feedback, setFeedback] = useState<{ type: 'perfect' | 'good' | 'miss'; show: boolean }>({ type: 'perfect', show: false })

  const gameStartTimeRef = useRef<number>(0)
  const lastPoseRef = useRef<any>(null)

  // 初始化姿态检测
  const initializePose = useCallback(async () => {
    if (!videoRef.current) return

    setIsLoading(true)

    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    })

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    })

    pose.onResults((results: PoseResults) => {
      processPoseResults(results)
      drawPose(results)
    })

    const camera = new MPCamera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await pose.send({ image: videoRef.current })
        }
      },
      width: 640,
      height: 480,
    })

    await camera.start()
    setIsLoading(false)
    setIsStarted(true)
  }, [])

  // 处理姿态结果
  const processPoseResults = (results: PoseResults) => {
    if (!results.poseLandmarks) return

    const landmarks = results.poseLandmarks

    // 获取关键点
    const leftShoulder = landmarks[11]
    const rightShoulder = landmarks[12]
    const leftElbow = landmarks[13]
    const rightElbow = landmarks[14]
    const leftWrist = landmarks[15]
    const rightWrist = landmarks[16]
    const leftHip = landmarks[23]
    const rightHip = landmarks[24]
    const leftAnkle = landmarks[27]
    const rightAnkle = landmarks[28]

    // 判断手臂状态（手腕高于肩膀为举起）
    const leftArmUp = leftWrist.y < leftShoulder.y - 0.1
    const rightArmUp = rightWrist.y < rightShoulder.y - 0.1

    // 判断跳跃（髋部和踝部的相对位置变化）
    const hipY = (leftHip.y + rightHip.y) / 2
    const ankleY = (leftAnkle.y + rightAnkle.y) / 2
    const isJumping = lastPoseRef.current 
      ? hipY < lastPoseRef.current.hipY - 0.05 
      : false

    lastPoseRef.current = { hipY, ankleY }

    setPoseData({
      leftArm: leftArmUp ? 'up' : 'down',
      rightArm: rightArmUp ? 'up' : 'down',
      isJumping,
    })

    // 检查是否击中节奏点
    if (gameState.isPlaying && currentBeat && !currentBeat.hit) {
      checkBeatHit(currentBeat, { leftArmUp, rightArmUp, isJumping })
    }
  }

  // 检查节奏点命中
  const checkBeatHit = (beat: BeatNote, pose: { leftArmUp: boolean; rightArmUp: boolean; isJumping: boolean }) => {
    let hit = false

    switch (beat.type) {
      case 'left':
        hit = pose.leftArmUp
        break
      case 'right':
        hit = pose.rightArmUp
        break
      case 'both':
        hit = pose.leftArmUp && pose.rightArmUp
        break
      case 'jump':
        hit = pose.isJumping
        break
    }

    if (hit) {
      const timeDiff = Date.now() - gameStartTimeRef.current - beat.time
      const isPerfect = Math.abs(timeDiff) < 100
      
      setFeedback({ type: isPerfect ? 'perfect' : 'good', show: true })
      setTimeout(() => setFeedback(prev => ({ ...prev, show: false })), 300)

      setGameState(prev => ({
        ...prev,
        score: prev.score + (isPerfect ? 100 : 50),
        combo: prev.combo + 1,
        maxCombo: Math.max(prev.maxCombo, prev.combo + 1),
        perfectCount: prev.perfectCount + (isPerfect ? 1 : 0),
        goodCount: prev.goodCount + (isPerfect ? 0 : 1),
      }))

      // 标记已击中
      setBeats(prev => prev.map(b => b.id === beat.id ? { ...b, hit: true } : b))
    }
  }

  // 绘制姿态骨骼
  const drawPose = (results: PoseResults) => {
    if (!canvasRef.current || !results.poseLandmarks) return

    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)

    // 镜像绘制视频
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(results.image, -canvasRef.current.width, 0)
    ctx.restore()

    // 绘制骨骼连接
    const connections = [
      [11, 13], [13, 15], // 左臂
      [12, 14], [14, 16], // 右臂
      [11, 12], // 肩膀
      [11, 23], [12, 24], // 躯干
      [23, 24], // 髋部
      [23, 25], [25, 27], // 左腿
      [24, 26], [26, 28], // 右腿
    ]

    ctx.strokeStyle = '#F59E0B'
    ctx.lineWidth = 4

    connections.forEach(([start, end]) => {
      const startPoint = results.poseLandmarks![start]
      const endPoint = results.poseLandmarks![end]
      
      ctx.beginPath()
      ctx.moveTo((1 - startPoint.x) * canvasRef.current!.width, startPoint.y * canvasRef.current!.height)
      ctx.lineTo((1 - endPoint.x) * canvasRef.current!.width, endPoint.y * canvasRef.current!.height)
      ctx.stroke()
    })

    // 绘制关键点
    ctx.fillStyle = '#EF4444'
    results.poseLandmarks.forEach((landmark, index) => {
      if ([11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].includes(index)) {
        ctx.beginPath()
        ctx.arc(
          (1 - landmark.x) * canvasRef.current!.width,
          landmark.y * canvasRef.current!.height,
          8,
          0,
          Math.PI * 2
        )
        ctx.fill()
      }
    })
  }

  // 开始游戏
  const startGame = () => {
    setShowCountdown(true)
    setCountdown(3)

    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setShowCountdown(false)
          beginPlaying()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // 开始播放节奏
  const beginPlaying = () => {
    gameStartTimeRef.current = Date.now()
    
    // 初始化节奏点
    const initialBeats = BEAT_PATTERN.map((beat, index) => ({
      ...beat,
      id: index,
      hit: false,
    }))
    setBeats(initialBeats)
    
    setGameState(prev => ({ ...prev, isPlaying: true }))

    // 设置节奏点定时器
    initialBeats.forEach((beat) => {
      setTimeout(() => {
        setCurrentBeat(beat)
      }, beat.time - 500) // 提前500ms显示

      // 检查miss
      setTimeout(() => {
        setBeats(prev => {
          const currentBeat = prev.find(b => b.id === beat.id)
          if (currentBeat && !currentBeat.hit) {
            setFeedback({ type: 'miss', show: true })
            setTimeout(() => setFeedback(p => ({ ...p, show: false })), 300)
            setGameState(p => ({
              ...p,
              combo: 0,
              missCount: p.missCount + 1,
            }))
          }
          return prev
        })
      }, beat.time + 300)
    })

    // 游戏结束
    const lastBeatTime = Math.max(...BEAT_PATTERN.map(b => b.time))
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isPlaying: false }))
      setCurrentBeat(null)
    }, lastBeatTime + 1000)
  }

  // 重置游戏
  const resetGame = () => {
    setGameState({
      score: 0,
      combo: 0,
      maxCombo: 0,
      perfectCount: 0,
      goodCount: 0,
      missCount: 0,
      isPlaying: false,
    })
    setBeats([])
    setCurrentBeat(null)
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-orange-950 via-red-900 to-stone-900">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-orange-100 hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-black/40 backdrop-blur rounded-full">
            <span className="text-orange-200 text-sm">得分：</span>
            <span className="text-white font-bold text-lg ml-2">{gameState.score}</span>
          </div>
          <div className="px-4 py-2 bg-black/40 backdrop-blur rounded-full">
            <span className="text-orange-200 text-sm">连击：</span>
            <span className="text-yellow-400 font-bold text-lg ml-2">{gameState.combo}</span>
          </div>
        </div>

        <button
          onClick={() => setIsMuted(!isMuted)}
          className="p-2 bg-black/40 backdrop-blur rounded-full text-orange-100 hover:bg-black/60 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* 主游戏区 */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-24">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`rounded-2xl shadow-2xl border-4 border-orange-600/50 ${isStarted ? 'block' : 'hidden'}`}
          />
          <video ref={videoRef} className="hidden" playsInline muted />

          {/* 节奏提示区 */}
          {gameState.isPlaying && currentBeat && (
            <div className="absolute inset-x-0 top-4 flex justify-center">
              <motion.div
                key={currentBeat.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={`
                  px-8 py-4 rounded-2xl text-white font-bold text-2xl
                  ${currentBeat.type === 'left' ? 'bg-blue-500' : ''}
                  ${currentBeat.type === 'right' ? 'bg-red-500' : ''}
                  ${currentBeat.type === 'both' ? 'bg-purple-500' : ''}
                  ${currentBeat.type === 'jump' ? 'bg-green-500' : ''}
                `}
              >
                {currentBeat.type === 'left' && '⬅️ 左手举起'}
                {currentBeat.type === 'right' && '➡️ 右手举起'}
                {currentBeat.type === 'both' && '🙌 双手举起'}
                {currentBeat.type === 'jump' && '⬆️ 跳跃'}
              </motion.div>
            </div>
          )}

          {/* 反馈效果 */}
          <AnimatePresence>
            {feedback.show && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className={`
                  absolute inset-0 flex items-center justify-center pointer-events-none
                `}
              >
                <span className={`
                  text-6xl font-black
                  ${feedback.type === 'perfect' ? 'text-yellow-400' : ''}
                  ${feedback.type === 'good' ? 'text-green-400' : ''}
                  ${feedback.type === 'miss' ? 'text-red-400' : ''}
                `}>
                  {feedback.type === 'perfect' && '完美!'}
                  {feedback.type === 'good' && '不错!'}
                  {feedback.type === 'miss' && 'Miss'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 姿态指示器 */}
          {isStarted && (
            <div className="absolute bottom-4 left-4 right-4 flex justify-between">
              <div className={`px-4 py-2 rounded-xl ${poseData.leftArm === 'up' ? 'bg-blue-500' : 'bg-black/40'}`}>
                <span className="text-white">左臂 {poseData.leftArm === 'up' ? '↑' : '↓'}</span>
              </div>
              <div className={`px-4 py-2 rounded-xl ${poseData.isJumping ? 'bg-green-500' : 'bg-black/40'}`}>
                <span className="text-white">{poseData.isJumping ? '跳跃中!' : '站立'}</span>
              </div>
              <div className={`px-4 py-2 rounded-xl ${poseData.rightArm === 'up' ? 'bg-red-500' : 'bg-black/40'}`}>
                <span className="text-white">右臂 {poseData.rightArm === 'up' ? '↑' : '↓'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-6">
          {!isStarted ? (
            <button
              onClick={initializePose}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  初始化姿态检测...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  开启相机
                </>
              )}
            </button>
          ) : (
            <>
              <button
                onClick={resetGame}
                className="p-3 bg-black/40 backdrop-blur rounded-full text-orange-100 hover:bg-black/60 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              {!gameState.isPlaying && (
                <button
                  onClick={startGame}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all flex items-center gap-3"
                >
                  <Play className="w-6 h-6" />
                  开始挑战
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 倒计时 */}
      <AnimatePresence>
        {showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/60"
          >
            <motion.span
              key={countdown}
              initial={{ scale: 2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="text-9xl font-black text-white"
            >
              {countdown}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 游戏结束结算 */}
      <AnimatePresence>
        {!gameState.isPlaying && gameState.score > 0 && !showCountdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-30 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-b from-orange-900 to-red-900 rounded-3xl p-8 text-center max-w-md mx-4"
            >
              <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-white mb-6">挑战完成!</h2>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-yellow-400">{gameState.score}</div>
                  <div className="text-white/70 text-sm">总得分</div>
                </div>
                <div className="bg-white/10 rounded-xl p-4">
                  <div className="text-3xl font-bold text-orange-400">{gameState.maxCombo}</div>
                  <div className="text-white/70 text-sm">最大连击</div>
                </div>
              </div>

              <div className="flex justify-center gap-4 text-sm mb-6">
                <span className="text-yellow-400">完美 {gameState.perfectCount}</span>
                <span className="text-green-400">不错 {gameState.goodCount}</span>
                <span className="text-red-400">Miss {gameState.missCount}</span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetGame}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={() => { resetGame(); startGame(); }}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-400 transition-colors"
                >
                  再来一次
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 装饰 */}
      <div className="absolute top-20 left-8 text-6xl opacity-20 animate-bounce">🥁</div>
      <div className="absolute top-40 right-8 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>🎵</div>
      <div className="absolute bottom-40 left-12 text-5xl opacity-20 animate-bounce" style={{ animationDelay: '1s' }}>💃</div>
    </div>
  )
}
