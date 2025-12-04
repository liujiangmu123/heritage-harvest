/**
 * 华县皮影戏 - 手势操控皮影体验
 * 使用 MediaPipe Hands 追踪手势，控制精美皮影人物动作
 * 包含详细的皮影造型、关节系统和动画效果
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hand, 
  Volume2, 
  VolumeX,
  Info,
  Camera,
  Sparkles,
  ChevronLeft,
  Play,
  Pause,
  SkipForward
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { Hands, Results } from '@mediapipe/hands'
import { Camera as MPCamera } from '@mediapipe/camera_utils'

// 皮影关节点定义
interface JointPoint {
  x: number
  y: number
  rotation: number
}

// 皮影骨骼结构
interface PuppetSkeleton {
  // 头部
  head: JointPoint
  // 身体
  neck: JointPoint
  spine: JointPoint
  hip: JointPoint
  // 左臂
  leftShoulder: JointPoint
  leftElbow: JointPoint
  leftWrist: JointPoint
  // 右臂
  rightShoulder: JointPoint
  rightElbow: JointPoint
  rightWrist: JointPoint
  // 左腿
  leftHip: JointPoint
  leftKnee: JointPoint
  leftAnkle: JointPoint
  // 右腿
  rightHip: JointPoint
  rightKnee: JointPoint
  rightAnkle: JointPoint
}

// 预设角色 - 更详细的配置
const PUPPET_CHARACTERS = [
  { 
    id: 'warrior', 
    name: '武将关羽', 
    primaryColor: '#DC2626',
    secondaryColor: '#991B1B',
    accentColor: '#FCD34D',
    description: '红脸武将，手持青龙偃月刀',
    hasWeapon: true,
    weaponType: 'blade'
  },
  { 
    id: 'beauty', 
    name: '杨贵妃', 
    primaryColor: '#EC4899',
    secondaryColor: '#BE185D',
    accentColor: '#FDF2F8',
    description: '盛唐美人，舞姿曼妙',
    hasWeapon: false,
    weaponType: null
  },
  { 
    id: 'monkey', 
    name: '孙悟空', 
    primaryColor: '#F59E0B',
    secondaryColor: '#D97706',
    accentColor: '#DC2626',
    description: '齐天大圣，金箍棒在手',
    hasWeapon: true,
    weaponType: 'staff'
  },
  { 
    id: 'scholar', 
    name: '张生', 
    primaryColor: '#3B82F6',
    secondaryColor: '#1D4ED8',
    accentColor: '#DBEAFE',
    description: '西厢才子，儒雅书生',
    hasWeapon: false,
    weaponType: null
  },
]

// 剧目场景
const PLAY_SCENES = [
  { 
    id: 'intro', 
    name: '开场亮相', 
    duration: 5000,
    actions: ['bow', 'pose']
  },
  { 
    id: 'walk', 
    name: '行走登场', 
    duration: 4000,
    actions: ['walk']
  },
  { 
    id: 'dance', 
    name: '舞蹈表演', 
    duration: 8000,
    actions: ['dance', 'spin']
  },
]

export default function ShadowPuppetShow() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stageRef = useRef<HTMLCanvasElement>(null)
  
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isMuted, setIsMuted] = useState(false)
  const [selectedCharacter, setSelectedCharacter] = useState(PUPPET_CHARACTERS[0])
  const [handPositions, setHandPositions] = useState<{ left: any; right: any }>({ left: null, right: null })
  
  // 皮影状态
  const [puppetState, setPuppetState] = useState({
    head: { rotation: 0 },
    leftArm: { rotation: 0 },
    rightArm: { rotation: 0 },
    body: { x: 400, y: 300 },
    isWalking: false,
  })

  // 初始化 MediaPipe Hands
  const initializeHands = useCallback(async () => {
    if (!videoRef.current) return

    setIsLoading(true)

    const hands = new Hands({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    })

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.7,
      minTrackingConfidence: 0.5,
    })

    hands.onResults((results: Results) => {
      processHandResults(results)
    })

    const camera = new MPCamera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current) {
          await hands.send({ image: videoRef.current })
        }
      },
      width: 640,
      height: 480,
    })

    await camera.start()
    setIsLoading(false)
    setIsStarted(true)
  }, [])

  // 处理手势结果
  const processHandResults = (results: Results) => {
    if (!results.multiHandLandmarks || !results.multiHandedness) return

    const newPositions: { left: any; right: any } = { left: null, right: null }

    results.multiHandLandmarks.forEach((landmarks, index) => {
      const handedness = results.multiHandedness![index].label
      const wrist = landmarks[0]
      const indexTip = landmarks[8]
      const thumbTip = landmarks[4]
      const middleTip = landmarks[12]

      const handData = {
        wrist: { x: wrist.x, y: wrist.y },
        indexTip: { x: indexTip.x, y: indexTip.y },
        thumbTip: { x: thumbTip.x, y: thumbTip.y },
        middleTip: { x: middleTip.x, y: middleTip.y },
        // 计算手指张开程度
        fingerSpread: Math.hypot(indexTip.x - thumbTip.x, indexTip.y - thumbTip.y),
        // 计算手的倾斜角度
        tilt: Math.atan2(middleTip.y - wrist.y, middleTip.x - wrist.x),
      }

      if (handedness === 'Left') {
        newPositions.right = handData // 镜像
      } else {
        newPositions.left = handData
      }
    })

    setHandPositions(newPositions)
    updatePuppetFromHands(newPositions)
  }

  // 根据手势更新皮影
  const updatePuppetFromHands = (positions: { left: any; right: any }) => {
    setPuppetState(prev => {
      const newState = { ...prev }

      // 右手控制右臂和头部
      if (positions.right) {
        newState.rightArm.rotation = positions.right.tilt * (180 / Math.PI) + 90
        newState.head.rotation = (positions.right.wrist.x - 0.5) * 30
      }

      // 左手控制左臂
      if (positions.left) {
        newState.leftArm.rotation = positions.left.tilt * (180 / Math.PI) + 90
      }

      // 双手同时移动控制身体位置
      if (positions.left && positions.right) {
        const centerX = (positions.left.wrist.x + positions.right.wrist.x) / 2
        const centerY = (positions.left.wrist.y + positions.right.wrist.y) / 2
        newState.body.x = (1 - centerX) * 800
        newState.body.y = centerY * 600
        
        // 判断是否在行走（双手上下交替）
        const heightDiff = Math.abs(positions.left.wrist.y - positions.right.wrist.y)
        newState.isWalking = heightDiff > 0.1
      }

      return newState
    })
  }

  // 绘制皮影舞台
  useEffect(() => {
    if (!stageRef.current) return
    const ctx = stageRef.current.getContext('2d')
    if (!ctx) return

    let animationId: number

    const draw = () => {
      const canvas = stageRef.current!
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 绘制纸质背景纹理
      drawPaperTexture(ctx, canvas.width, canvas.height)

      // 绘制背景光晕（模拟油灯效果）
      const time = Date.now() / 1000
      const flicker = Math.sin(time * 5) * 0.05 + 0.95
      
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 100, 0,
        canvas.width / 2, 100, 500
      )
      gradient.addColorStop(0, `rgba(255, 180, 80, ${0.4 * flicker})`)
      gradient.addColorStop(0.5, `rgba(255, 150, 50, ${0.2 * flicker})`)
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 绘制皮影
      drawDetailedPuppet(ctx, puppetState, selectedCharacter, time)

      animationId = requestAnimationFrame(draw)
    }

    draw()
    
    return () => cancelAnimationFrame(animationId)
  }, [puppetState, selectedCharacter])

  // 绘制纸质纹理背景
  const drawPaperTexture = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // 基础米色背景
    ctx.fillStyle = '#FEF3C7'
    ctx.fillRect(0, 0, w, h)
    
    // 添加纸张纹理
    ctx.globalAlpha = 0.03
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#D97706' : '#92400E'
      ctx.beginPath()
      ctx.arc(
        Math.random() * w,
        Math.random() * h,
        Math.random() * 3 + 1,
        0,
        Math.PI * 2
      )
      ctx.fill()
    }
    ctx.globalAlpha = 1
    
    // 边缘暗角
    const vignette = ctx.createRadialGradient(w/2, h/2, h*0.3, w/2, h/2, h*0.8)
    vignette.addColorStop(0, 'rgba(0,0,0,0)')
    vignette.addColorStop(1, 'rgba(0,0,0,0.3)')
    ctx.fillStyle = vignette
    ctx.fillRect(0, 0, w, h)
  }

  // 绘制精美皮影 - 根据角色类型
  const drawDetailedPuppet = (
    ctx: CanvasRenderingContext2D, 
    state: typeof puppetState,
    character: typeof PUPPET_CHARACTERS[0],
    time: number
  ) => {
    const { body, head, leftArm, rightArm, isWalking } = state
    const scale = 1.5 // 放大皮影
    
    ctx.save()
    ctx.translate(body.x, body.y)
    ctx.scale(scale, scale)

    // 皮影基础样式 - 半透明效果模拟皮革
    const primaryColor = character.primaryColor
    const secondaryColor = character.secondaryColor
    const accentColor = character.accentColor

    // 行走动画
    const walkPhase = isWalking ? Math.sin(time * 8) : 0
    const breathe = Math.sin(time * 2) * 2 // 呼吸动画

    // ========== 绘制腿部 ==========
    const legSwing = walkPhase * 25
    
    // 左腿
    ctx.save()
    ctx.translate(-12, 35 + breathe)
    ctx.rotate((legSwing * Math.PI) / 180)
    drawLeg(ctx, primaryColor, secondaryColor, 'left')
    ctx.restore()

    // 右腿
    ctx.save()
    ctx.translate(12, 35 + breathe)
    ctx.rotate((-legSwing * Math.PI) / 180)
    drawLeg(ctx, primaryColor, secondaryColor, 'right')
    ctx.restore()

    // ========== 绘制身体/服装 ==========
    ctx.save()
    ctx.translate(0, breathe)
    drawBody(ctx, primaryColor, secondaryColor, accentColor, character.id)
    ctx.restore()

    // ========== 绘制手臂 ==========
    // 左臂
    ctx.save()
    ctx.translate(-28, -15 + breathe)
    ctx.rotate((leftArm.rotation * Math.PI) / 180)
    drawArm(ctx, primaryColor, secondaryColor, 'left', character.hasWeapon && character.id === 'warrior')
    ctx.restore()

    // 右臂
    ctx.save()
    ctx.translate(28, -15 + breathe)
    ctx.rotate((rightArm.rotation * Math.PI) / 180)
    drawArm(ctx, primaryColor, secondaryColor, 'right', character.hasWeapon && character.id === 'monkey')
    ctx.restore()

    // ========== 绘制头部 ==========
    ctx.save()
    ctx.translate(0, -50 + breathe)
    ctx.rotate((head.rotation * Math.PI) / 180)
    drawHead(ctx, primaryColor, secondaryColor, accentColor, character.id)
    ctx.restore()

    ctx.restore()
  }

  // 绘制头部 - 根据角色不同
  const drawHead = (
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    accent: string,
    characterId: string
  ) => {
    ctx.save()
    
    // 透明皮革效果
    ctx.globalAlpha = 0.9
    
    // 脸部基础形状
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = primary
    ctx.lineWidth = 1.5
    ctx.shadowColor = primary
    ctx.shadowBlur = 15

    // 脸部轮廓 - 侧脸造型（皮影特色）
    ctx.beginPath()
    ctx.moveTo(0, -20)
    ctx.bezierCurveTo(15, -20, 20, -10, 20, 0)
    ctx.bezierCurveTo(20, 15, 10, 25, 0, 25)
    ctx.bezierCurveTo(-15, 25, -20, 15, -18, 0)
    ctx.bezierCurveTo(-18, -15, -10, -20, 0, -20)
    ctx.fill()
    ctx.stroke()

    // 面部镂空花纹（皮影特色）
    ctx.strokeStyle = accent
    ctx.lineWidth = 0.8
    ctx.globalAlpha = 0.7
    
    // 眼睛镂空
    ctx.beginPath()
    ctx.ellipse(5, -5, 4, 2.5, 0.2, 0, Math.PI * 2)
    ctx.stroke()
    
    // 眉毛
    ctx.beginPath()
    ctx.moveTo(0, -12)
    ctx.quadraticCurveTo(8, -15, 12, -10)
    ctx.stroke()

    // 嘴巴
    ctx.beginPath()
    ctx.moveTo(5, 10)
    ctx.quadraticCurveTo(10, 12, 12, 10)
    ctx.stroke()

    // 根据角色绘制头饰
    ctx.globalAlpha = 0.9
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = accent
    ctx.lineWidth = 1.5
    
    switch(characterId) {
      case 'warrior':
        // 武将头盔
        drawWarriorHelmet(ctx, primary, accent)
        break
      case 'beauty':
        // 凤冠
        drawPhoenixCrown(ctx, primary, accent)
        break
      case 'monkey':
        // 紧箍咒
        drawMonkeyCirclet(ctx, primary, accent)
        break
      case 'scholar':
        // 书生帽
        drawScholarHat(ctx, primary, accent)
        break
    }

    ctx.restore()
  }

  // 武将头盔
  const drawWarriorHelmet = (ctx: CanvasRenderingContext2D, primary: string, accent: string) => {
    ctx.strokeStyle = accent
    ctx.fillStyle = '#1a1a1a'
    
    // 头盔主体
    ctx.beginPath()
    ctx.moveTo(-20, -15)
    ctx.lineTo(-25, -35)
    ctx.lineTo(0, -45)
    ctx.lineTo(25, -35)
    ctx.lineTo(20, -15)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 头盔装饰
    ctx.beginPath()
    ctx.moveTo(0, -45)
    ctx.lineTo(-5, -60)
    ctx.lineTo(0, -55)
    ctx.lineTo(5, -60)
    ctx.lineTo(0, -45)
    ctx.stroke()
    
    // 缨穗
    ctx.strokeStyle = primary
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 3, -55)
      ctx.quadraticCurveTo(i * 5, -40, i * 4, -25)
      ctx.stroke()
    }
  }

  // 凤冠
  const drawPhoenixCrown = (ctx: CanvasRenderingContext2D, primary: string, accent: string) => {
    ctx.strokeStyle = accent
    ctx.fillStyle = '#1a1a1a'
    
    // 凤冠基座
    ctx.beginPath()
    ctx.ellipse(0, -25, 22, 8, 0, Math.PI, 0)
    ctx.fill()
    ctx.stroke()
    
    // 凤凰羽毛装饰
    ctx.strokeStyle = primary
    const feathers = [
      { x: -15, h: 25 },
      { x: -8, h: 35 },
      { x: 0, h: 40 },
      { x: 8, h: 35 },
      { x: 15, h: 25 },
    ]
    
    feathers.forEach(f => {
      ctx.beginPath()
      ctx.moveTo(f.x, -25)
      ctx.quadraticCurveTo(f.x + 5, -25 - f.h/2, f.x, -25 - f.h)
      ctx.quadraticCurveTo(f.x - 5, -25 - f.h/2, f.x, -25)
      ctx.stroke()
    })
    
    // 珠帘
    ctx.strokeStyle = accent
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 6, -18)
      ctx.lineTo(i * 7, -5)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(i * 7, -3, 2, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  // 紧箍咒
  const drawMonkeyCirclet = (ctx: CanvasRenderingContext2D, primary: string, accent: string) => {
    ctx.strokeStyle = accent
    ctx.lineWidth = 2
    
    // 金箍
    ctx.beginPath()
    ctx.ellipse(0, -22, 18, 5, 0, 0, Math.PI * 2)
    ctx.stroke()
    
    // 猴毛
    ctx.strokeStyle = primary
    for (let i = -4; i <= 4; i++) {
      ctx.beginPath()
      ctx.moveTo(i * 4, -28)
      ctx.lineTo(i * 5, -40 + Math.abs(i) * 2)
      ctx.stroke()
    }
    
    // 猴耳
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.ellipse(-22, -10, 8, 12, -0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(22, -10, 8, 12, 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
  }

  // 书生帽
  const drawScholarHat = (ctx: CanvasRenderingContext2D, primary: string, accent: string) => {
    ctx.strokeStyle = accent
    ctx.fillStyle = '#1a1a1a'
    
    // 方巾
    ctx.beginPath()
    ctx.moveTo(-18, -20)
    ctx.lineTo(-15, -40)
    ctx.lineTo(15, -40)
    ctx.lineTo(18, -20)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    // 飘带
    ctx.strokeStyle = primary
    ctx.beginPath()
    ctx.moveTo(-15, -35)
    ctx.quadraticCurveTo(-30, -30, -35, -15)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(15, -35)
    ctx.quadraticCurveTo(30, -30, 35, -15)
    ctx.stroke()
  }

  // 绘制身体
  const drawBody = (
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    accent: string,
    characterId: string
  ) => {
    ctx.save()
    
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = primary
    ctx.lineWidth = 1.5
    ctx.shadowColor = primary
    ctx.shadowBlur = 12

    // 躯干轮廓
    ctx.beginPath()
    ctx.moveTo(-25, -35)
    ctx.bezierCurveTo(-30, -20, -28, 20, -20, 40)
    ctx.lineTo(20, 40)
    ctx.bezierCurveTo(28, 20, 30, -20, 25, -35)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 服装花纹镂空
    ctx.strokeStyle = accent
    ctx.lineWidth = 0.8
    ctx.globalAlpha = 0.6

    // 衣领
    ctx.beginPath()
    ctx.moveTo(-15, -35)
    ctx.lineTo(0, -25)
    ctx.lineTo(15, -35)
    ctx.stroke()

    // 腰带
    ctx.strokeStyle = secondary
    ctx.lineWidth = 1.2
    ctx.beginPath()
    ctx.moveTo(-22, 5)
    ctx.lineTo(22, 5)
    ctx.stroke()
    
    // 腰带装饰
    ctx.beginPath()
    ctx.arc(0, 5, 4, 0, Math.PI * 2)
    ctx.stroke()

    // 衣服纹饰 - 根据角色不同
    ctx.strokeStyle = accent
    ctx.lineWidth = 0.6
    
    if (characterId === 'warrior') {
      // 铠甲纹路
      for (let y = -20; y < 0; y += 8) {
        ctx.beginPath()
        ctx.moveTo(-18, y)
        ctx.lineTo(18, y)
        ctx.stroke()
      }
    } else if (characterId === 'beauty') {
      // 花卉纹饰
      for (let i = 0; i < 3; i++) {
        const y = -15 + i * 15
        ctx.beginPath()
        ctx.arc(-8, y, 5, 0, Math.PI * 2)
        ctx.stroke()
        ctx.beginPath()
        ctx.arc(8, y, 5, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else if (characterId === 'monkey') {
      // 虎皮裙纹理
      for (let i = 0; i < 4; i++) {
        ctx.beginPath()
        ctx.ellipse(-10 + i * 8, 25, 4, 8, 0.2, 0, Math.PI * 2)
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // 绘制手臂
  const drawArm = (
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    side: 'left' | 'right',
    hasWeapon: boolean
  ) => {
    ctx.save()
    
    const dir = side === 'left' ? 1 : -1
    
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = primary
    ctx.lineWidth = 1.5
    ctx.shadowColor = primary
    ctx.shadowBlur = 10

    // 上臂
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(dir * 8, 0)
    ctx.lineTo(dir * 10, 30)
    ctx.lineTo(dir * 2, 32)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 肘部关节装饰
    ctx.beginPath()
    ctx.arc(dir * 6, 32, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // 前臂
    ctx.beginPath()
    ctx.moveTo(dir * 2, 35)
    ctx.lineTo(dir * 10, 37)
    ctx.lineTo(dir * 12, 60)
    ctx.lineTo(dir * 4, 62)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 手掌
    ctx.beginPath()
    ctx.ellipse(dir * 8, 68, 6, 8, dir * 0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // 手指
    ctx.lineWidth = 1
    for (let i = 0; i < 4; i++) {
      ctx.beginPath()
      ctx.moveTo(dir * (5 + i * 2), 72)
      ctx.lineTo(dir * (4 + i * 2.5), 80)
      ctx.stroke()
    }

    // 武器
    if (hasWeapon) {
      ctx.strokeStyle = secondary
      ctx.lineWidth = 2
      
      if (side === 'right') {
        // 金箍棒
        ctx.beginPath()
        ctx.moveTo(dir * 8, 60)
        ctx.lineTo(dir * 8, 130)
        ctx.stroke()
        
        // 棒头装饰
        ctx.beginPath()
        ctx.ellipse(dir * 8, 55, 4, 6, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else {
        // 青龙偃月刀
        ctx.beginPath()
        ctx.moveTo(dir * 8, 60)
        ctx.lineTo(dir * 8, 150)
        ctx.stroke()
        
        // 刀头
        ctx.beginPath()
        ctx.moveTo(dir * 8, 150)
        ctx.bezierCurveTo(dir * 30, 145, dir * 35, 130, dir * 20, 120)
        ctx.lineTo(dir * 8, 130)
        ctx.stroke()
      }
    }

    ctx.restore()
  }

  // 绘制腿部
  const drawLeg = (
    ctx: CanvasRenderingContext2D,
    primary: string,
    secondary: string,
    side: 'left' | 'right'
  ) => {
    ctx.save()
    
    const dir = side === 'left' ? -1 : 1
    
    ctx.fillStyle = '#1a1a1a'
    ctx.strokeStyle = primary
    ctx.lineWidth = 1.5
    ctx.shadowColor = primary
    ctx.shadowBlur = 8

    // 大腿
    ctx.beginPath()
    ctx.moveTo(-6, 0)
    ctx.lineTo(6, 0)
    ctx.lineTo(8, 35)
    ctx.lineTo(-4, 35)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 膝关节
    ctx.beginPath()
    ctx.arc(2, 38, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    // 小腿
    ctx.beginPath()
    ctx.moveTo(-3, 42)
    ctx.lineTo(7, 42)
    ctx.lineTo(8, 75)
    ctx.lineTo(-2, 75)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    // 靴子
    ctx.beginPath()
    ctx.moveTo(-4, 75)
    ctx.lineTo(10, 75)
    ctx.lineTo(15, 82)
    ctx.lineTo(12, 88)
    ctx.lineTo(-6, 88)
    ctx.lineTo(-8, 82)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-950 via-amber-900 to-stone-900">
      {/* 装饰边框 */}
      <div className="absolute inset-4 border-4 border-amber-600/30 rounded-lg pointer-events-none" />
      <div className="absolute inset-6 border border-amber-500/20 rounded-lg pointer-events-none" />

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
          >
            {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setShowTutorial(true)}
            className="p-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 皮影舞台 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {/* 幕布装饰 */}
        <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-red-900 to-transparent" />
        <div className="absolute top-0 left-0 w-16 h-full bg-gradient-to-r from-red-900/50 to-transparent" />
        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-red-900/50 to-transparent" />
        
        {/* 光源效果 */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, #FCD34D 0%, transparent 70%)',
            top: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />

        {/* 舞台画布 */}
        <canvas
          ref={stageRef}
          width={800}
          height={600}
          className="relative z-10 rounded-lg"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))',
            boxShadow: 'inset 0 0 100px rgba(251, 191, 36, 0.1)',
          }}
        />
      </div>

      {/* 隐藏的视频元素 */}
      <video
        ref={videoRef}
        className="hidden"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" width={640} height={480} />

      {/* 角色选择 */}
      <div className="absolute bottom-28 left-1/2 -translate-x-1/2 z-20">
        <div className="flex flex-col items-center gap-3">
          {/* 当前角色信息 */}
          <div className="px-4 py-2 bg-black/60 backdrop-blur rounded-xl text-center">
            <p className="text-amber-100 font-bold">{selectedCharacter.name}</p>
            <p className="text-amber-200/60 text-xs">{selectedCharacter.description}</p>
          </div>
          
          {/* 角色选择按钮 */}
          <div className="flex items-center gap-3 px-4 py-3 bg-black/40 backdrop-blur rounded-full">
            {PUPPET_CHARACTERS.map((char) => (
              <button
                key={char.id}
                onClick={() => setSelectedCharacter(char)}
                className={`
                  relative w-12 h-12 rounded-full border-2 transition-all group
                  ${selectedCharacter.id === char.id 
                    ? 'border-white scale-110 shadow-lg' 
                    : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'
                  }
                `}
                style={{ 
                  backgroundColor: char.primaryColor,
                  boxShadow: selectedCharacter.id === char.id 
                    ? `0 0 20px ${char.primaryColor}` 
                    : 'none'
                }}
                title={char.name}
              >
                {/* 角色图标 */}
                <span className="text-lg">
                  {char.id === 'warrior' && '⚔️'}
                  {char.id === 'beauty' && '👸'}
                  {char.id === 'monkey' && '🐵'}
                  {char.id === 'scholar' && '📚'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 手势指示器 */}
      {isStarted && (
        <div className="absolute bottom-8 left-8 right-8 z-20">
          <div className="flex justify-between items-end">
            {/* 左手状态 */}
            <div className={`
              px-4 py-2 rounded-xl backdrop-blur transition-all
              ${handPositions.left ? 'bg-green-500/30 text-green-300' : 'bg-black/30 text-amber-200/50'}
            `}>
              <div className="flex items-center gap-2">
                <Hand className="w-5 h-5" />
                <span className="text-sm">左手 {handPositions.left ? '已检测' : '未检测'}</span>
              </div>
            </div>

            {/* 操作提示 */}
            <div className="text-center text-amber-200/70 text-sm">
              <p>移动手掌控制皮影 · 双手移动控制位置</p>
            </div>

            {/* 右手状态 */}
            <div className={`
              px-4 py-2 rounded-xl backdrop-blur transition-all
              ${handPositions.right ? 'bg-green-500/30 text-green-300' : 'bg-black/30 text-amber-200/50'}
            `}>
              <div className="flex items-center gap-2">
                <span className="text-sm">右手 {handPositions.right ? '已检测' : '未检测'}</span>
                <Hand className="w-5 h-5 -scale-x-100" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 开始按钮 */}
      {!isStarted && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center z-30 bg-black/60"
        >
          <div className="text-center">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mb-8"
            >
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-amber-400 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                <Sparkles className="w-16 h-16 text-white" />
              </div>
            </motion.div>
            
            <h1 className="text-4xl font-bold text-amber-100 mb-4">华县皮影戏</h1>
            <p className="text-amber-200/70 mb-8 max-w-md">
              使用手势控制皮影人物，体验千年皮影艺术的魅力
            </p>
            
            <button
              onClick={initializeHands}
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-red-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all flex items-center gap-3 mx-auto"
            >
              <Camera className="w-6 h-6" />
              开启摄像头体验
            </button>
          </div>
        </motion.div>
      )}

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-30 bg-black/60">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-amber-200">正在初始化手势识别...</p>
          </div>
        </div>
      )}

      {/* 教程弹窗 */}
      <AnimatePresence>
        {showTutorial && isStarted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/70"
            onClick={() => setShowTutorial(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-950 border border-amber-600/50 rounded-2xl p-8 max-w-lg mx-4"
            >
              <h2 className="text-2xl font-bold text-amber-100 mb-6 flex items-center gap-2">
                <Hand className="w-6 h-6" />
                操控指南
              </h2>
              
              <div className="space-y-4 text-amber-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center shrink-0">1</div>
                  <p><strong className="text-amber-100">右手</strong>控制皮影的右臂和头部转向</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center shrink-0">2</div>
                  <p><strong className="text-amber-100">左手</strong>控制皮影的左臂动作</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center shrink-0">3</div>
                  <p><strong className="text-amber-100">双手同时移动</strong>可以控制皮影的位置</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-600/30 rounded-full flex items-center justify-center shrink-0">4</div>
                  <p><strong className="text-amber-100">交替上下挥动</strong>让皮影行走</p>
                </div>
              </div>

              <button
                onClick={() => setShowTutorial(false)}
                className="mt-8 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
              >
                开始表演
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
