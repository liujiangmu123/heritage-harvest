/**
 * 藤铁工艺虚拟编织交互组件 - 手部追踪版
 * 『码』上寻踪 - 安溪藤铁工艺AR互动体验
 * 
 * 技术实现：
 * - MediaPipe Hands 手部追踪（21个关键点）
 * - Three.js样条曲线动态生成藤条
 * - 手势识别：握拳=编织，张开=停止
 * - 双模式：摄像头手势 / 触摸滑动
 */

import { useRef, useState, useEffect, useCallback, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  PerspectiveCamera
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Hand, 
  RotateCcw, 
  Play, 
  Award,
  ChevronRight,
  Sparkles,
  Info,
  Camera,
  Monitor,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// ============ 手部追踪Hook ============
interface HandLandmark {
  x: number
  y: number
  z: number
}

interface HandTrackingState {
  isTracking: boolean
  landmarks: HandLandmark[] | null
  gesture: 'open' | 'fist' | 'pointing' | 'pinch' | 'thumbsUp' | 'peace' | 'none'
  handedness: 'Left' | 'Right' | null
  isLoading: boolean
  error: string | null
  // 新增：手部旋转角度和运动数据
  rotation: number  // 手掌旋转角度 (0-360)
  rotationSpeed: number  // 旋转速度
  palmCenter: { x: number; y: number } | null  // 手掌中心位置
}

function useHandTracking(videoRef: React.RefObject<HTMLVideoElement>, enabled: boolean) {
  const [state, setState] = useState<HandTrackingState>({
    isTracking: false,
    landmarks: null,
    gesture: 'none',
    handedness: null,
    isLoading: false,
    error: null,
    rotation: 0,
    rotationSpeed: 0,
    palmCenter: null
  })
  const handsRef = useRef<any>(null)
  const cameraRef = useRef<any>(null)
  
  // 手势平滑处理
  const gestureHistoryRef = useRef<string[]>([])
  const stableGestureRef = useRef<string>('none')
  const gestureCountRef = useRef<Record<string, number>>({})
  
  // 旋转检测
  const lastRotationRef = useRef(0)
  const rotationHistoryRef = useRef<number[]>([])
  
  // 计算手掌旋转角度
  const calculateRotation = (landmarks: HandLandmark[]): { rotation: number; speed: number; center: { x: number; y: number } } => {
    // 使用手腕(0)到中指根部(9)的向量来计算旋转
    const wrist = landmarks[0]
    const middleBase = landmarks[9]
    const indexBase = landmarks[5]
    const pinkyBase = landmarks[17]
    
    // 计算手掌中心
    const center = {
      x: (wrist.x + middleBase.x + indexBase.x + pinkyBase.x) / 4,
      y: (wrist.y + middleBase.y + indexBase.y + pinkyBase.y) / 4
    }
    
    // 计算手掌朝向角度（基于食指根部到小指根部的向量）
    const dx = pinkyBase.x - indexBase.x
    const dy = pinkyBase.y - indexBase.y
    const angle = Math.atan2(dy, dx) * (180 / Math.PI) + 180
    
    // 计算旋转速度
    const history = rotationHistoryRef.current
    history.push(angle)
    if (history.length > 5) history.shift()
    
    let speed = 0
    if (history.length >= 2) {
      // 计算角度变化，处理跨越0/360的情况
      let diff = history[history.length - 1] - history[history.length - 2]
      if (diff > 180) diff -= 360
      if (diff < -180) diff += 360
      speed = diff
    }
    
    lastRotationRef.current = angle
    return { rotation: angle, speed, center }
  }
  
  // 平滑手势 - 取最近N帧中出现最多的手势
  const smoothGesture = (newGesture: string): string => {
    const history = gestureHistoryRef.current
    history.push(newGesture)
    
    // 保持最近8帧
    if (history.length > 8) {
      history.shift()
    }
    
    // 统计各手势出现次数
    const counts: Record<string, number> = {}
    history.forEach(g => {
      counts[g] = (counts[g] || 0) + 1
    })
    
    // 找出出现最多的手势
    let maxCount = 0
    let dominantGesture = 'none'
    Object.entries(counts).forEach(([gesture, count]) => {
      if (count > maxCount) {
        maxCount = count
        dominantGesture = gesture
      }
    })
    
    // 只有当新手势连续出现3次以上才切换
    if (dominantGesture !== stableGestureRef.current) {
      gestureCountRef.current[dominantGesture] = (gestureCountRef.current[dominantGesture] || 0) + 1
      if (gestureCountRef.current[dominantGesture] >= 3) {
        stableGestureRef.current = dominantGesture
        gestureCountRef.current = {}
      }
    } else {
      gestureCountRef.current = {}
    }
    
    return stableGestureRef.current
  }

  // 计算手势 - 更宽松的判定条件
  const detectGesture = (landmarks: HandLandmark[]): 'open' | 'fist' | 'pointing' | 'pinch' | 'thumbsUp' | 'peace' | 'none' => {
    if (!landmarks || landmarks.length < 21) return 'none'
    
    // 关键点
    const thumbTip = landmarks[4]
    const thumbIP = landmarks[3]
    const indexTip = landmarks[8]
    const indexPIP = landmarks[6]
    const middleTip = landmarks[12]
    const middlePIP = landmarks[10]
    const ringTip = landmarks[16]
    const ringPIP = landmarks[14]
    const pinkyTip = landmarks[20]
    const pinkyPIP = landmarks[18]
    
    // 距离计算
    const dist = (a: HandLandmark, b: HandLandmark) => 
      Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
    
    // 判断手指是否伸直（指尖高于指关节）
    const isFingerExtended = (tip: HandLandmark, pip: HandLandmark) => 
      tip.y < pip.y - 0.02
    
    const thumbExtended = thumbTip.x < thumbIP.x - 0.02 || thumbTip.x > thumbIP.x + 0.02
    const indexExtended = isFingerExtended(indexTip, indexPIP)
    const middleExtended = isFingerExtended(middleTip, middlePIP)
    const ringExtended = isFingerExtended(ringTip, ringPIP)
    const pinkyExtended = isFingerExtended(pinkyTip, pinkyPIP)
    
    // 捏合手势：拇指和食指靠近
    const pinchDist = dist(thumbTip, indexTip)
    if (pinchDist < 0.06 && !middleExtended && !ringExtended) {
      return 'pinch'
    }
    
    // 竖大拇指：只有拇指伸出
    if (thumbExtended && !indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'thumbsUp'
    }
    
    // 剪刀手/和平：食指和中指伸出
    if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
      return 'peace'
    }
    
    // 食指指向：只有食指伸出
    if (indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'pointing'
    }
    
    // 握拳：所有手指都收起
    if (!indexExtended && !middleExtended && !ringExtended && !pinkyExtended) {
      return 'fist'
    }
    
    // 张开：所有手指都伸出
    if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
      return 'open'
    }
    
    return 'none'
  }

  useEffect(() => {
    if (!enabled || !videoRef.current) return
    
    // 如果已经有活跃的追踪会话，不重复初始化
    if (handsRef.current && cameraRef.current) {
      console.log('手部追踪已在运行中')
      return
    }

    let isMounted = true
    
    // 清理之前可能残留的实例
    if (handsRef.current) {
      handsRef.current.close?.()
      handsRef.current = null
    }
    if (cameraRef.current) {
      cameraRef.current.stop?.()
      cameraRef.current = null
    }
    
    // 重置手势历史
    gestureHistoryRef.current = []
    stableGestureRef.current = 'none'
    rotationHistoryRef.current = []
    
    // 设置加载状态
    setState(prev => ({ ...prev, isLoading: true, error: null }))
    
    const initHands = async () => {
      try {
        console.log('开始加载MediaPipe Hands...')
        
        // 动态导入MediaPipe
        const { Hands } = await import('@mediapipe/hands')
        const { Camera } = await import('@mediapipe/camera_utils')
        
        console.log('MediaPipe加载成功，初始化中...')
        
        const hands = new Hands({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        })
        
        hands.setOptions({
          maxNumHands: 1,
          modelComplexity: 1,
          minDetectionConfidence: 0.5,  // 降低阈值提高检测率
          minTrackingConfidence: 0.5
        })
        
        hands.onResults((results: any) => {
          if (!isMounted) return
          
          if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0]
            const handedness = results.multiHandedness?.[0]?.label || null
            const rawGesture = detectGesture(landmarks)
            const gesture = smoothGesture(rawGesture) as any
            
            // 计算旋转数据
            const rotationData = calculateRotation(landmarks)
            
            setState(prev => ({
              ...prev,
              isTracking: true,
              landmarks,
              gesture,
              handedness,
              isLoading: false,
              rotation: rotationData.rotation,
              rotationSpeed: rotationData.speed,
              palmCenter: rotationData.center
            }))
          } else {
            setState(prev => ({
              ...prev,
              isTracking: false,
              landmarks: null,
              gesture: smoothGesture('none') as any,
              rotationSpeed: 0,
              palmCenter: null
            }))
          }
        })
        
        handsRef.current = hands
        
        // 启动摄像头
        if (videoRef.current) {
          console.log('启动摄像头...')
          const camera = new Camera(videoRef.current, {
            onFrame: async () => {
              if (handsRef.current && videoRef.current) {
                await handsRef.current.send({ image: videoRef.current })
              }
            },
            width: 640,
            height: 480
          })
          cameraRef.current = camera
          await camera.start()
          console.log('摄像头启动成功')
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('手部追踪初始化失败:', error)
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: error instanceof Error ? error.message : '初始化失败'
        }))
      }
    }
    
    initHands()
    
    return () => {
      console.log('清理手部追踪...')
      isMounted = false
      // 停止摄像头
      if (cameraRef.current) {
        cameraRef.current.stop?.()
        cameraRef.current = null
      }
      if (handsRef.current) {
        handsRef.current.close?.()
        handsRef.current = null
      }
      // 重置状态
      setState({
        isTracking: false,
        landmarks: null,
        gesture: 'none',
        handedness: null,
        isLoading: false,
        error: null,
        rotation: 0,
        rotationSpeed: 0,
        palmCenter: null
      })
    }
  }, [enabled])
  
  return state
}

// ============ 3D加载指示器 ============
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 border-4 border-palace-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-palace-600 font-medium">加载中 {progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}

// ============ 世界级精细铁艺骨架模型 ============
function DetailedIronFrame() {
  const groupRef = useRef<THREE.Group>(null)
  const frameColor = "#0a0a0a"
  const decorColor = "#1a1a1a"
  const goldAccent = "#8B7355"
  
  // 微妙的光泽动画
  useFrame((state) => {
    if (groupRef.current) {
      // 极轻微的呼吸动画
      const breathe = Math.sin(state.clock.elapsedTime * 0.5) * 0.002
      groupRef.current.scale.setScalar(1 + breathe)
    }
  })
  
  // 主体轮廓点 - 精细花瓶形状
  const profilePoints = [
    { y: 0, r: 0.35 },
    { y: 0.15, r: 0.38 },
    { y: 0.3, r: 0.42 },
    { y: 0.5, r: 0.5 },
    { y: 0.8, r: 0.55 },
    { y: 1.0, r: 0.52 },
    { y: 1.2, r: 0.48 },
    { y: 1.4, r: 0.4 },
    { y: 1.6, r: 0.32 },
    { y: 1.8, r: 0.26 },
    { y: 2.0, r: 0.24 },
    { y: 2.2, r: 0.28 },
    { y: 2.4, r: 0.35 },
    { y: 2.6, r: 0.42 },
    { y: 2.8, r: 0.47 },
    { y: 3.0, r: 0.5 },
  ]
  
  // 生成主骨架线（16条，更精细）
  const mainFrameLines = Array.from({ length: 16 }).map((_, i) => {
    const angle = (i / 16) * Math.PI * 2
    const twist = i % 2 === 0 ? 0.02 : -0.02  // 交替扭转
    const points = profilePoints.map((p, idx) => 
      new THREE.Vector3(
        p.r * Math.cos(angle + twist * idx),
        p.y,
        p.r * Math.sin(angle + twist * idx)
      )
    )
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3)
  })
  
  // 生成横向支撑环（8层）
  const ringHeights = [0.08, 0.35, 0.7, 1.1, 1.5, 1.9, 2.5, 2.95]
  const getRadiusAt = (y: number) => {
    for (let i = 0; i < profilePoints.length - 1; i++) {
      if (y >= profilePoints[i].y && y <= profilePoints[i + 1].y) {
        const t = (y - profilePoints[i].y) / (profilePoints[i + 1].y - profilePoints[i].y)
        return profilePoints[i].r + t * (profilePoints[i + 1].r - profilePoints[i].r)
      }
    }
    return 0.35
  }
  
  // 装饰性菱形格纹（在腹部）
  const diamondPatterns: THREE.CatmullRomCurve3[] = []
  for (let layer = 0; layer < 3; layer++) {
    const baseY = 0.5 + layer * 0.25
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2
      const r = getRadiusAt(baseY) + 0.01
      const pts = [
        new THREE.Vector3(r * Math.cos(angle), baseY, r * Math.sin(angle)),
        new THREE.Vector3((r + 0.02) * Math.cos(angle + 0.15), baseY + 0.12, (r + 0.02) * Math.sin(angle + 0.15)),
        new THREE.Vector3(r * Math.cos(angle + 0.3), baseY + 0.24, r * Math.sin(angle + 0.3)),
      ]
      diamondPatterns.push(new THREE.CatmullRomCurve3(pts))
    }
  }
  
  // 颈部螺旋装饰
  const neckSpiralPoints: THREE.Vector3[] = []
  for (let i = 0; i <= 40; i++) {
    const t = i / 40
    const y = 1.8 + t * 0.6
    const r = getRadiusAt(y) + 0.015
    const angle = t * Math.PI * 3
    neckSpiralPoints.push(new THREE.Vector3(r * Math.cos(angle), y, r * Math.sin(angle)))
  }
  const neckSpiral = new THREE.CatmullRomCurve3(neckSpiralPoints)

  return (
    <group ref={groupRef}>
      {/* 主骨架线 - 交替粗细 */}
      {mainFrameLines.map((curve, i) => (
        <mesh key={`main-${i}`} castShadow receiveShadow>
          <tubeGeometry args={[curve, 64, i % 2 === 0 ? 0.014 : 0.01, 8, false]} />
          <meshStandardMaterial 
            color={i % 2 === 0 ? frameColor : decorColor}
            metalness={0.95}
            roughness={0.15}
            envMapIntensity={1.2}
          />
        </mesh>
      ))}
      
      {/* 横向支撑环 - 双层设计 */}
      {ringHeights.map((y, i) => {
        const r = getRadiusAt(y)
        return (
          <group key={`ring-group-${i}`}>
            <mesh position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
              <torusGeometry args={[r, 0.012, 8, 64]} />
              <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.12} />
            </mesh>
            {i % 2 === 0 && (
              <mesh position={[0, y + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
                <torusGeometry args={[r - 0.01, 0.006, 6, 64]} />
                <meshStandardMaterial color={goldAccent} metalness={0.8} roughness={0.25} />
              </mesh>
            )}
          </group>
        )
      })}
      
      {/* 菱形装饰格纹 */}
      {diamondPatterns.map((curve, i) => (
        <mesh key={`diamond-${i}`} castShadow>
          <tubeGeometry args={[curve, 16, 0.004, 4, false]} />
          <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
      
      {/* 颈部螺旋装饰 */}
      <mesh castShadow>
        <tubeGeometry args={[neckSpiral, 48, 0.005, 6, false]} />
        <meshStandardMaterial color={goldAccent} metalness={0.85} roughness={0.2} />
      </mesh>
      
      {/* 精致底座 - 五层渐变 */}
      {[
        { y: 0, r1: 0.38, r2: 0.42, h: 0.02, color: decorColor },
        { y: -0.025, r1: 0.42, r2: 0.48, h: 0.03, color: frameColor },
        { y: -0.06, r1: 0.48, r2: 0.52, h: 0.04, color: decorColor },
        { y: -0.11, r1: 0.44, r2: 0.48, h: 0.06, color: frameColor },
      ].map((base, i) => (
        <mesh key={`base-${i}`} position={[0, base.y, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[base.r1, base.r2, base.h, 48]} />
          <meshStandardMaterial color={base.color} metalness={0.92} roughness={0.15} />
        </mesh>
      ))}
      
      {/* 底座金色装饰环 */}
      <mesh position={[0, -0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.45, 0.008, 6, 48]} />
        <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.2} emissive={goldAccent} emissiveIntensity={0.1} />
      </mesh>
      
      {/* 口沿 - 三层精细设计 */}
      <mesh position={[0, 3.0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.5, 0.018, 8, 64]} />
        <meshStandardMaterial color={frameColor} metalness={0.95} roughness={0.1} />
      </mesh>
      <mesh position={[0, 2.98, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.485, 0.008, 6, 64]} />
        <meshStandardMaterial color={goldAccent} metalness={0.9} roughness={0.15} emissive={goldAccent} emissiveIntensity={0.15} />
      </mesh>
      <mesh position={[0, 2.96, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.47, 0.012, 8, 64]} />
        <meshStandardMaterial color={decorColor} metalness={0.92} roughness={0.12} />
      </mesh>
    </group>
  )
}

// ============ 世界级完成效果 ============
function CompletionEffect({ isComplete }: { isComplete: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<THREE.Group>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const burstRef = useRef<THREE.Points>(null)
  const animationPhase = useRef(0)
  
  useFrame((state, delta) => {
    if (!isComplete) {
      animationPhase.current = 0
      return
    }
    
    animationPhase.current = Math.min(animationPhase.current + delta * 0.5, 1)
    const t = animationPhase.current
    const time = state.clock.elapsedTime
    
    // 主体旋转
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.3
    }
    
    // 光环扩散和旋转
    if (ringsRef.current) {
      ringsRef.current.children.forEach((ring, i) => {
        const phase = (time + i * 0.5) % 3
        const scale = 1 + phase * 0.5
        const opacity = Math.max(0, 1 - phase / 3)
        ring.scale.setScalar(scale)
        if ((ring as THREE.Mesh).material) {
          ((ring as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = opacity * t
        }
        ring.rotation.z = time * (0.2 + i * 0.1)
      })
    }
    
    // 螺旋粒子上升
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length / 3; i++) {
        const baseAngle = (i / (positions.length / 3)) * Math.PI * 8 + time
        const baseY = ((i * 0.05 + time * 0.5) % 4) - 0.5
        const radius = 0.3 + Math.sin(baseY * 2) * 0.2
        positions[i * 3] = Math.cos(baseAngle) * radius
        positions[i * 3 + 1] = baseY
        positions[i * 3 + 2] = Math.sin(baseAngle) * radius
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // 爆发粒子
    if (burstRef.current) {
      const positions = burstRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < positions.length / 3; i++) {
        const angle = (i / (positions.length / 3)) * Math.PI * 2
        const speed = 0.5 + (i % 5) * 0.2
        const radius = (time * speed) % 2
        const y = 1.5 + Math.sin(angle * 3 + time) * 0.3
        positions[i * 3] = Math.cos(angle + time * 0.5) * radius
        positions[i * 3 + 1] = y
        positions[i * 3 + 2] = Math.sin(angle + time * 0.5) * radius
      }
      burstRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  if (!isComplete) return null
  
  // 生成初始粒子位置
  const spiralCount = 80
  const spiralPositions = new Float32Array(spiralCount * 3)
  const burstCount = 60
  const burstPositions = new Float32Array(burstCount * 3)
  
  for (let i = 0; i < spiralCount; i++) {
    spiralPositions[i * 3] = 0
    spiralPositions[i * 3 + 1] = i * 0.05
    spiralPositions[i * 3 + 2] = 0
  }
  
  for (let i = 0; i < burstCount; i++) {
    burstPositions[i * 3] = 0
    burstPositions[i * 3 + 1] = 1.5
    burstPositions[i * 3 + 2] = 0
  }
  
  return (
    <group ref={groupRef}>
      {/* 扩散光环 */}
      <group ref={ringsRef} position={[0, 1.5, 0]}>
        {[0, 1, 2].map(i => (
          <mesh key={i} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.4 + i * 0.1, 0.45 + i * 0.1, 64]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      
      {/* 能量柱 */}
      <mesh position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.02, 0.15, 4, 16, 1, true]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      
      {/* 螺旋上升粒子 */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={spiralCount} array={spiralPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#FFD700" size={0.04} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* 爆发粒子 */}
      <points ref={burstRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={burstCount} array={burstPositions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#FFA500" size={0.06} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* 顶部光球 */}
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0, 3.2, 0]}>
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshBasicMaterial color="#FFA500" transparent opacity={0.3} />
      </mesh>
      
      {/* 底部光环 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.8, 64]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.4} side={THREE.DoubleSide} />
      </mesh>
      
      {/* 周围浮动光点 */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.7, 1 + (i % 3) * 0.5, Math.sin(angle) * 0.7]}>
            <sphereGeometry args={[0.025, 8, 8]} />
            <meshBasicMaterial color="#FFE4B5" transparent opacity={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

// ============ 世界级藤条模型 ============
interface DetailedVineProps {
  progress: number
}

function DetailedVine({ progress }: DetailedVineProps) {
  const groupRef = useRef<THREE.Group>(null)
  
  // 精细花瓶轮廓（与铁架匹配）
  const profilePoints = [
    { y: 0, r: 0.35 }, { y: 0.15, r: 0.38 }, { y: 0.3, r: 0.42 },
    { y: 0.5, r: 0.5 }, { y: 0.8, r: 0.55 }, { y: 1.0, r: 0.52 },
    { y: 1.2, r: 0.48 }, { y: 1.4, r: 0.4 }, { y: 1.6, r: 0.32 },
    { y: 1.8, r: 0.26 }, { y: 2.0, r: 0.24 }, { y: 2.2, r: 0.28 },
    { y: 2.4, r: 0.35 }, { y: 2.6, r: 0.42 }, { y: 2.8, r: 0.47 }, { y: 3.0, r: 0.5 },
  ]
  
  const getRadiusAtHeight = (y: number) => {
    for (let i = 0; i < profilePoints.length - 1; i++) {
      if (y >= profilePoints[i].y && y <= profilePoints[i + 1].y) {
        const t = (y - profilePoints[i].y) / (profilePoints[i + 1].y - profilePoints[i].y)
        return profilePoints[i].r + t * (profilePoints[i + 1].r - profilePoints[i].r)
      }
    }
    return 0.35
  }
  
  // 生成主藤条路径
  const generateMainPath = useCallback((offset: number = 0, radiusOffset: number = 0) => {
    const points: THREE.Vector3[] = []
    const totalTurns = 20
    const totalPoints = totalTurns * 36
    
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints
      const height = t * 3
      const angle = t * totalTurns * Math.PI * 2 + offset
      const baseRadius = getRadiusAtHeight(height)
      
      // 真实的编织波动
      const weaveIn = Math.sin(angle * 8) * 0.02
      const weaveUp = Math.sin(angle * 4) * 0.008
      const naturalWave = Math.sin(t * Math.PI * 6) * 0.005
      
      const radius = baseRadius + weaveIn + radiusOffset + 0.015
      
      points.push(new THREE.Vector3(
        radius * Math.cos(angle),
        height + weaveUp + naturalWave,
        radius * Math.sin(angle)
      ))
    }
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.2)
  }, [])
  
  // 生成交叉编织路径（反向）
  const generateCrossPath = useCallback((offset: number = 0) => {
    const points: THREE.Vector3[] = []
    const totalTurns = 12
    const totalPoints = totalTurns * 24
    
    for (let i = 0; i <= totalPoints; i++) {
      const t = i / totalPoints
      const height = t * 3
      const angle = -t * totalTurns * Math.PI * 2 + offset  // 反向
      const baseRadius = getRadiusAtHeight(height)
      
      const weaveIn = Math.sin(angle * 6) * 0.015
      const radius = baseRadius + weaveIn + 0.025
      
      points.push(new THREE.Vector3(
        radius * Math.cos(angle),
        height,
        radius * Math.sin(angle)
      ))
    }
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.3)
  }, [])
  
  // 生成各层藤条曲线
  const mainCurve1 = generateMainPath(0, 0)
  const mainCurve2 = generateMainPath(Math.PI / 3, 0.01)
  const crossCurve1 = generateCrossPath(0)
  const crossCurve2 = generateCrossPath(Math.PI / 2)
  
  // 计算可见点数
  const getPartialCurve = (curve: THREE.CatmullRomCurve3) => {
    const visiblePoints = Math.floor(progress * curve.points.length)
    if (visiblePoints < 2) return null
    return new THREE.CatmullRomCurve3(
      curve.points.slice(0, Math.max(2, visiblePoints)),
      false, 'catmullrom', 0.2
    )
  }
  
  const partial1 = getPartialCurve(mainCurve1)
  const partial2 = getPartialCurve(mainCurve2)
  const partialCross1 = getPartialCurve(crossCurve1)
  const partialCross2 = getPartialCurve(crossCurve2)
  
  if (!partial1) return null
  
  // 藤条颜色 - 自然渐变
  const vineColors = {
    light: '#A67B4B',    // 浅棕色
    medium: '#8B5E34',   // 中棕色
    dark: '#5D4E37',     // 深棕色
    accent: '#C4956A',   // 高光色
  }

  return (
    <group ref={groupRef}>
      {/* 主藤条层1 - 粗编织 */}
      <mesh castShadow receiveShadow>
        <tubeGeometry args={[partial1, Math.floor(progress * 600), 0.016, 10, false]} />
        <meshStandardMaterial 
          color={vineColors.medium}
          roughness={0.7}
          metalness={0.05}
          envMapIntensity={0.3}
        />
      </mesh>
      
      {/* 主藤条层2 - 交错编织 */}
      {partial2 && progress > 0.05 && (
        <mesh castShadow receiveShadow>
          <tubeGeometry args={[partial2, Math.floor(progress * 500), 0.012, 8, false]} />
          <meshStandardMaterial 
            color={vineColors.light}
            roughness={0.65}
            metalness={0.08}
          />
        </mesh>
      )}
      
      {/* 交叉编织层1 */}
      {partialCross1 && progress > 0.1 && (
        <mesh castShadow>
          <tubeGeometry args={[partialCross1, Math.floor(progress * 250), 0.008, 6, false]} />
          <meshStandardMaterial 
            color={vineColors.dark}
            roughness={0.8}
            metalness={0}
          />
        </mesh>
      )}
      
      {/* 交叉编织层2 */}
      {partialCross2 && progress > 0.15 && (
        <mesh castShadow>
          <tubeGeometry args={[partialCross2, Math.floor(progress * 200), 0.006, 6, false]} />
          <meshStandardMaterial 
            color={vineColors.accent}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
      )}
      
      {/* 藤条高光纹理 */}
      {progress > 0.2 && partial1 && (
        <mesh>
          <tubeGeometry args={[partial1, Math.floor(progress * 400), 0.02, 8, false]} />
          <meshStandardMaterial 
            color={vineColors.accent}
            roughness={0.4}
            metalness={0.15}
            transparent
            opacity={0.2}
          />
        </mesh>
      )}
      
      {/* 编织进度发光效果 */}
      {progress > 0 && progress < 1 && (
        <mesh position={[0, progress * 3, 0]}>
          <torusGeometry args={[getRadiusAtHeight(progress * 3) + 0.03, 0.015, 8, 32]} />
          <meshBasicMaterial 
            color="#FFD700" 
            transparent 
            opacity={0.4 + Math.sin(Date.now() * 0.01) * 0.2}
          />
        </mesh>
      )}
    </group>
  )
}

// ============ 编织跟随光点（增强版）============
interface WeavingCursorProps {
  progress: number
  isWeaving: boolean
}

function WeavingCursor({ progress, isWeaving }: WeavingCursorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  
  // 花瓶轮廓参数
  const profilePoints = [
    { y: 0, r: 0.35 }, { y: 0.3, r: 0.4 }, { y: 0.8, r: 0.55 },
    { y: 1.2, r: 0.5 }, { y: 1.6, r: 0.35 }, { y: 2.0, r: 0.25 },
    { y: 2.4, r: 0.35 }, { y: 2.8, r: 0.45 }, { y: 3.0, r: 0.5 },
  ]
  
  const getRadiusAtHeight = (y: number) => {
    for (let i = 0; i < profilePoints.length - 1; i++) {
      if (y >= profilePoints[i].y && y <= profilePoints[i + 1].y) {
        const t = (y - profilePoints[i].y) / (profilePoints[i + 1].y - profilePoints[i].y)
        return profilePoints[i].r + t * (profilePoints[i + 1].r - profilePoints[i].r)
      }
    }
    return 0.35
  }
  
  useFrame((state) => {
    if (!groupRef.current || progress >= 1) return
    
    const totalTurns = 18
    const t = progress
    const height = t * 3
    const angle = t * totalTurns * Math.PI * 2
    const baseRadius = getRadiusAtHeight(height) + 0.05
    
    const x = baseRadius * Math.cos(angle)
    const z = baseRadius * Math.sin(angle)
    const time = state.clock.elapsedTime
    
    // 整体位置
    groupRef.current.position.set(x, height, z)
    
    // 核心脉冲
    if (coreRef.current) {
      const corePulse = isWeaving 
        ? 1 + Math.sin(time * 12) * 0.4
        : 1 + Math.sin(time * 4) * 0.15
      coreRef.current.scale.setScalar(corePulse)
    }
    
    // 光晕旋转和缩放
    if (glowRef.current) {
      glowRef.current.rotation.z = time * 2
      const glowPulse = isWeaving
        ? 1.5 + Math.sin(time * 8) * 0.5
        : 1 + Math.sin(time * 2) * 0.2
      glowRef.current.scale.setScalar(glowPulse)
    }
    
    // 轨迹环旋转
    if (trailRef.current) {
      trailRef.current.rotation.x = Math.PI / 2
      trailRef.current.rotation.z = -angle
    }
    
    // 光源
    if (lightRef.current) {
      lightRef.current.intensity = isWeaving ? 3 : 1
    }
  })
  
  if (progress >= 1) return null
  
  const coreColor = isWeaving ? '#FFD700' : '#F2D974'
  const glowColor = isWeaving ? '#FFA500' : '#A73A36'
  
  return (
    <group ref={groupRef}>
      {/* 核心发光球 */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial 
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={isWeaving ? 4 : 1.5}
        />
      </mesh>
      
      {/* 外层光晕 */}
      <mesh ref={glowRef}>
        <ringGeometry args={[0.04, 0.08, 6]} />
        <meshBasicMaterial 
          color={glowColor}
          transparent 
          opacity={isWeaving ? 0.8 : 0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* 编织轨迹圈 */}
      {isWeaving && (
        <mesh ref={trailRef} position={[0, 0, 0]}>
          <torusGeometry args={[0.12, 0.008, 8, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.5} />
        </mesh>
      )}
      
      {/* 动态点光源 */}
      <pointLight 
        ref={lightRef}
        color={coreColor}
        intensity={2}
        distance={1}
        decay={2}
      />
      
      {/* 编织时的火花粒子效果 */}
      {isWeaving && (
        <>
          <mesh position={[0.08, 0.05, 0]} scale={0.5}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#FFE4B5" transparent opacity={0.7} />
          </mesh>
          <mesh position={[-0.06, -0.04, 0.05]} scale={0.4}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#FFD700" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.03, -0.07, -0.04]} scale={0.3}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#FFA500" transparent opacity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ============ 视角模式 ============
type ViewMode = 'auto' | 'outside' | 'inside' | 'detail' | 'overview'

// ============ 动态摄像机运镜 ============
interface CameraRigProps {
  progress: number
  isWeaving: boolean
  handRotation: number
  rotationSpeed: number
  palmCenter: { x: number; y: number } | null
  viewMode: ViewMode
}

function CameraRig({ progress, isWeaving, rotationSpeed, palmCenter, viewMode }: CameraRigProps) {
  const cameraRef = useRef<THREE.PerspectiveCamera>(null)
  const targetPos = useRef(new THREE.Vector3(2.5, 2, 2.5))
  const targetLookAt = useRef(new THREE.Vector3(0, 0.5, 0))
  const manualRotation = useRef(0)
  const autoViewTimer = useRef(0)
  const currentAutoView = useRef<'outside' | 'inside' | 'detail'>('outside')
  
  // 花瓶轮廓
  const getRadiusAtHeight = (y: number) => {
    const profile = [
      { y: 0, r: 0.35 }, { y: 0.8, r: 0.55 }, { y: 1.6, r: 0.35 },
      { y: 2.0, r: 0.25 }, { y: 2.8, r: 0.45 }, { y: 3.0, r: 0.5 }
    ]
    for (let i = 0; i < profile.length - 1; i++) {
      if (y >= profile[i].y && y <= profile[i + 1].y) {
        const t = (y - profile[i].y) / (profile[i + 1].y - profile[i].y)
        return profile[i].r + t * (profile[i + 1].r - profile[i].r)
      }
    }
    return 0.4
  }
  
  useFrame((state, delta) => {
    if (!cameraRef.current) return
    
    const t = progress
    const time = state.clock.elapsedTime
    const weavingHeight = t * 3 - 1.5
    const weavingAngle = t * 18 * Math.PI * 2
    
    // 手动旋转
    if (isWeaving && Math.abs(rotationSpeed) > 3) {
      manualRotation.current += rotationSpeed * 0.005
    }
    
    // 自动视角切换计时（auto模式）
    if (viewMode === 'auto' && isWeaving) {
      autoViewTimer.current += delta
      if (autoViewTimer.current > 4) {  // 每4秒切换
        autoViewTimer.current = 0
        const views: Array<'outside' | 'inside' | 'detail'> = ['outside', 'detail', 'inside']
        const currentIdx = views.indexOf(currentAutoView.current)
        currentAutoView.current = views[(currentIdx + 1) % views.length]
      }
    }
    
    const activeView = viewMode === 'auto' ? currentAutoView.current : viewMode
    
    let newPos: THREE.Vector3
    let newLookAt: THREE.Vector3
    let fov = 50
    
    if (!isWeaving || t === 0) {
      // ===== 待机：优雅环绕 =====
      const idleAngle = time * 0.12 + manualRotation.current
      newPos = new THREE.Vector3(
        Math.cos(idleAngle) * 3.2,
        1.2 + Math.sin(time * 0.25) * 0.1,
        Math.sin(idleAngle) * 3.2
      )
      newLookAt = new THREE.Vector3(0, 0.2, 0)
      fov = 45
      
    } else if (activeView === 'overview') {
      // ===== 全貌视角：高处俯瞰整体 =====
      const overviewAngle = time * 0.1 + manualRotation.current
      newPos = new THREE.Vector3(
        Math.cos(overviewAngle) * 4,
        2.5,
        Math.sin(overviewAngle) * 4
      )
      newLookAt = new THREE.Vector3(0, 0.3, 0)
      fov = 40
      
    } else if (activeView === 'inside') {
      // ===== 内部视角：从花瓶内部向外看 =====
      const innerRadius = getRadiusAtHeight(weavingHeight + 1.5) * 0.3
      const insideAngle = time * 0.3 + manualRotation.current
      
      newPos = new THREE.Vector3(
        Math.cos(insideAngle) * innerRadius,
        weavingHeight + 0.2,
        Math.sin(insideAngle) * innerRadius
      )
      // 看向编织点
      const outerRadius = getRadiusAtHeight(weavingHeight + 1.5) + 0.05
      newLookAt = new THREE.Vector3(
        Math.cos(weavingAngle) * outerRadius,
        weavingHeight,
        Math.sin(weavingAngle) * outerRadius
      )
      fov = 70  // 广角增强沉浸感
      
    } else if (activeView === 'detail') {
      // ===== 细节特写：紧跟编织点 =====
      const detailRadius = getRadiusAtHeight(weavingHeight + 1.5) + 0.4
      const detailAngle = weavingAngle + Math.PI * 0.7  // 在编织点侧后方
      
      newPos = new THREE.Vector3(
        Math.cos(detailAngle) * detailRadius,
        weavingHeight + 0.15,
        Math.sin(detailAngle) * detailRadius
      )
      // 看向编织点
      const targetRadius = getRadiusAtHeight(weavingHeight + 1.5) + 0.05
      newLookAt = new THREE.Vector3(
        Math.cos(weavingAngle) * targetRadius,
        weavingHeight,
        Math.sin(weavingAngle) * targetRadius
      )
      fov = 55
      
    } else {
      // ===== 外部跟随：经典环绕视角 =====
      const orbitAngle = t * Math.PI * 2 + manualRotation.current
      
      let distance = 2.2
      let heightOffset = 0.6
      if (t < 0.2) {
        distance = 3 - t * 4
        heightOffset = 1.2 - t * 3
      } else if (t > 0.8) {
        distance = 2.2 + (t - 0.8) * 4
        heightOffset = 0.6 + (t - 0.8) * 2
      }
      
      newPos = new THREE.Vector3(
        Math.cos(orbitAngle) * distance,
        weavingHeight + heightOffset,
        Math.sin(orbitAngle) * distance
      )
      newLookAt = new THREE.Vector3(0, weavingHeight * 0.8, 0)
      fov = 50
    }
    
    // 手掌微调
    if (palmCenter && isWeaving) {
      newPos.x += (palmCenter.x - 0.5) * 0.1
      newLookAt.y += (palmCenter.y - 0.5) * 0.05
    }
    
    // 呼吸感
    newPos.y += Math.sin(time * 1.5) * 0.01
    
    // 平滑过渡
    const lerpSpeed = activeView === 'detail' ? 3 : 1.5
    targetPos.current.lerp(newPos, delta * lerpSpeed)
    targetLookAt.current.lerp(newLookAt, delta * lerpSpeed)
    
    cameraRef.current.position.copy(targetPos.current)
    cameraRef.current.lookAt(targetLookAt.current)
    cameraRef.current.fov = THREE.MathUtils.lerp(cameraRef.current.fov, fov, delta * 2)
    cameraRef.current.updateProjectionMatrix()
  })
  
  return <PerspectiveCamera ref={cameraRef} makeDefault fov={50} />
}

// ============ 世界级编织粒子效果 ============
function WeavingParticles({ progress, isWeaving }: { progress: number; isWeaving: boolean }) {
  const spiralRef = useRef<THREE.Points>(null)
  const dustRef = useRef<THREE.Points>(null)
  const trailRef = useRef<THREE.Points>(null)
  
  const spiralCount = 80
  const dustCount = 120
  const trailCount = 40
  
  const spiralPositions = useRef(new Float32Array(spiralCount * 3))
  const dustPositions = useRef(new Float32Array(dustCount * 3))
  const trailPositions = useRef(new Float32Array(trailCount * 3))
  
  // 初始化灰尘粒子随机位置
  useEffect(() => {
    for (let i = 0; i < dustCount; i++) {
      dustPositions.current[i * 3] = (Math.random() - 0.5) * 2
      dustPositions.current[i * 3 + 1] = Math.random() * 4 - 0.5
      dustPositions.current[i * 3 + 2] = (Math.random() - 0.5) * 2
    }
  }, [])
  
  useFrame((state) => {
    const time = state.clock.elapsedTime
    const height = progress * 3
    const weavingAngle = progress * 18 * Math.PI * 2
    
    // 螺旋上升粒子
    if (spiralRef.current && isWeaving) {
      const posArray = spiralRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < spiralCount; i++) {
        const t = i / spiralCount
        const particleTime = (time * 2 + t * 3) % 3
        const particleAngle = weavingAngle + t * Math.PI * 4 + time * 3
        const particleRadius = 0.3 + Math.sin(t * Math.PI * 2) * 0.15 + particleTime * 0.1
        const particleHeight = height - 0.5 + particleTime * 0.5
        
        posArray[i * 3] = Math.cos(particleAngle) * particleRadius
        posArray[i * 3 + 1] = particleHeight
        posArray[i * 3 + 2] = Math.sin(particleAngle) * particleRadius
      }
      spiralRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // 环境浮尘粒子
    if (dustRef.current) {
      const posArray = dustRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < dustCount; i++) {
        const baseY = dustPositions.current[i * 3 + 1]
        const drift = Math.sin(time * 0.5 + i * 0.1) * 0.02
        const rise = isWeaving ? time * 0.02 : 0
        
        posArray[i * 3] = dustPositions.current[i * 3] + Math.sin(time + i) * 0.05
        posArray[i * 3 + 1] = ((baseY + rise) % 4) - 0.5
        posArray[i * 3 + 2] = dustPositions.current[i * 3 + 2] + drift
      }
      dustRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    // 编织点尾迹
    if (trailRef.current && isWeaving && progress > 0) {
      const posArray = trailRef.current.geometry.attributes.position.array as Float32Array
      for (let i = 0; i < trailCount; i++) {
        const trailProgress = Math.max(0, progress - (i / trailCount) * 0.03)
        const trailHeight = trailProgress * 3
        const trailAngle = trailProgress * 18 * Math.PI * 2
        const trailRadius = 0.5 + Math.sin(trailAngle * 8) * 0.02
        
        posArray[i * 3] = Math.cos(trailAngle) * trailRadius
        posArray[i * 3 + 1] = trailHeight
        posArray[i * 3 + 2] = Math.sin(trailAngle) * trailRadius
      }
      trailRef.current.geometry.attributes.position.needsUpdate = true
    }
  })
  
  return (
    <group>
      {/* 螺旋上升金色粒子 */}
      {isWeaving && progress < 1 && (
        <points ref={spiralRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={spiralCount} array={spiralPositions.current} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#FFD700" size={0.025} transparent opacity={0.9} blending={THREE.AdditiveBlending} />
        </points>
      )}
      
      {/* 环境浮尘 - 营造工坊氛围 */}
      <points ref={dustRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={dustCount} array={dustPositions.current} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial color="#D4AF37" size={0.008} transparent opacity={isWeaving ? 0.4 : 0.2} blending={THREE.AdditiveBlending} />
      </points>
      
      {/* 编织尾迹 */}
      {isWeaving && progress > 0.01 && (
        <points ref={trailRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={trailCount} array={trailPositions.current} itemSize={3} />
          </bufferGeometry>
          <pointsMaterial color="#FFA500" size={0.02} transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </points>
      )}
      
      {/* 编织区域光晕 */}
      {isWeaving && progress > 0 && progress < 1 && (
        <mesh position={[0, progress * 3, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.2, 0.6, 32]} />
          <meshBasicMaterial color="#FFD700" transparent opacity={0.15} side={THREE.DoubleSide} blending={THREE.AdditiveBlending} />
        </mesh>
      )}
    </group>
  )
}

// ============ 环境氛围光效 ============
function AmbientEffects({ isWeaving }: { isWeaving: boolean }) {
  const floatingLightsRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (floatingLightsRef.current) {
      floatingLightsRef.current.rotation.y = state.clock.elapsedTime * 0.1
      floatingLightsRef.current.children.forEach((child, i) => {
        child.position.y = 1.5 + Math.sin(state.clock.elapsedTime * 0.5 + i) * 0.3
      })
    }
  })
  
  return (
    <group>
      {/* 浮动光点 */}
      <group ref={floatingLightsRef}>
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(angle) * 1.2, 1.5, Math.sin(angle) * 1.2]}>
              <sphereGeometry args={[0.015, 8, 8]} />
              <meshBasicMaterial 
                color={isWeaving ? "#FFD700" : "#8B7355"} 
                transparent 
                opacity={isWeaving ? 0.8 : 0.4} 
              />
            </mesh>
          )
        })}
      </group>
      
      {/* 底部光圈 */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 64]} />
        <meshBasicMaterial 
          color={isWeaving ? "#FFD700" : "#8B7355"} 
          transparent 
          opacity={isWeaving ? 0.2 : 0.1} 
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

// 3D场景
interface SceneProps {
  progress: number
  isComplete: boolean
  isWeaving: boolean
  handRotation: number
  rotationSpeed: number
  palmCenter: { x: number; y: number } | null
  viewMode: ViewMode
}

function Scene({ progress, isComplete, isWeaving, handRotation, rotationSpeed, palmCenter, viewMode }: SceneProps) {
  const groupRef = useRef<THREE.Group>(null)
  const keyLightRef = useRef<THREE.SpotLight>(null)
  
  // 动态光照效果
  useFrame((state) => {
    if (keyLightRef.current && isWeaving) {
      // 编织时光照微微脉动
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      keyLightRef.current.intensity = 1.5 * pulse
    }
  })
  
  return (
    <>
      {/* 动态运镜摄像机 */}
      <CameraRig 
        progress={progress} 
        isWeaving={isWeaving} 
        handRotation={handRotation}
        rotationSpeed={rotationSpeed}
        palmCenter={palmCenter}
        viewMode={viewMode}
      />
      
      {/* 三点布光系统 */}
      {/* 主光：从右上方照射 */}
      <spotLight
        ref={keyLightRef}
        position={[4, 8, 4]}
        angle={0.25}
        penumbra={0.8}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      
      {/* 补光：从左侧柔和补充 */}
      <spotLight
        position={[-4, 6, -2]}
        angle={0.4}
        penumbra={1}
        intensity={0.6}
        color="#E8E4D9"
      />
      
      {/* 轮廓光：从后方勾勒轮廓 */}
      <spotLight
        position={[0, 4, -5]}
        angle={0.5}
        penumbra={1}
        intensity={0.4}
        color="#F2D974"
      />
      
      {/* 环境光 */}
      <ambientLight intensity={0.25} color="#FFF8F0" />
      
      {/* 编织区域聚光 */}
      {isWeaving && (
        <pointLight 
          position={[0, progress * 3 - 1.5 + 0.5, 0]} 
          intensity={0.8} 
          color="#FFD700"
          distance={2}
          decay={2}
        />
      )}
      
      {/* 主模型组 */}
      <group ref={groupRef} position={[0, -1.5, 0]}>
        <DetailedIronFrame />
        <DetailedVine progress={progress} />
        <WeavingCursor progress={progress} isWeaving={isWeaving} />
        <WeavingParticles progress={progress} isWeaving={isWeaving} />
        <AmbientEffects isWeaving={isWeaving} />
        <CompletionEffect isComplete={isComplete} />
      </group>
      
      {/* 地面效果 */}
      <ContactShadows
        position={[0, -1.5, 0]}
        opacity={0.5}
        scale={10}
        blur={2.5}
        far={4}
        color="#2a1810"
      />
      
      {/* 装饰性地面圆环 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.49, 0]}>
        <ringGeometry args={[0.8, 1.2, 64]} />
        <meshBasicMaterial color="#1a1208" transparent opacity={0.15} />
      </mesh>
      
      {/* 环境贴图 - 工作室氛围 */}
      <Environment preset="studio" />
      
      {/* 背景渐变 */}
      <color attach="background" args={['#1a1612']} />
      <fog attach="fog" args={['#1a1612', 5, 15]} />
      
      {/* 用户可手动旋转查看 */}
      <OrbitControls 
        enablePan={false}
        enableZoom={true}
        minDistance={1.2}
        maxDistance={5}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping
        dampingFactor={0.08}
        rotateSpeed={0.4}
      />
    </>
  )
}

// 进度条组件
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-paper-600 rounded-full h-3 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-palace-500 to-gold-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress * 100}%` }}
        transition={{ duration: 0.1 }}
      />
    </div>
  )
}

// ============ 手势状态指示器 ============
type GestureType = 'open' | 'fist' | 'pointing' | 'pinch' | 'thumbsUp' | 'peace' | 'none'

interface GestureIndicatorProps {
  gesture: GestureType
  isTracking: boolean
  isWeaving: boolean
}

function GestureIndicator({ gesture, isTracking, isWeaving }: GestureIndicatorProps) {
  const gestureInfo: Record<GestureType, { icon: string; text: string; color: string; weaves: boolean }> = {
    fist: { icon: '✊', text: '握拳 - 快速编织', color: 'bg-palace-500', weaves: true },
    pinch: { icon: '🤏', text: '捏合 - 精细编织', color: 'bg-palace-400', weaves: true },
    pointing: { icon: '👆', text: '指向 - 缓慢编织', color: 'bg-nature-500', weaves: true },
    thumbsUp: { icon: '👍', text: '点赞 - 加速编织', color: 'bg-gold-600', weaves: true },
    peace: { icon: '✌️', text: '剪刀手 - 编织', color: 'bg-nature-400', weaves: true },
    open: { icon: '✋', text: '张开 - 暂停', color: 'bg-mountain-400', weaves: false },
    none: { icon: '❓', text: '未检测到手势', color: 'bg-mountain-500', weaves: false }
  }
  
  const info = gestureInfo[gesture]
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-white ${info.color} ${
        isWeaving ? 'ring-2 ring-white ring-opacity-50 animate-pulse' : ''
      }`}
    >
      <span className="text-xl">{info.icon}</span>
      <span className="text-sm font-medium">{info.text}</span>
      {isTracking && (
        <span className={`w-2 h-2 rounded-full ${isWeaving ? 'bg-gold-300 animate-ping' : 'bg-white animate-pulse'}`} />
      )}
    </motion.div>
  )
}

// ============ 纯净背景音乐系统 ============
interface AudioState {
  isMuted: boolean
  volume: number
  isPlaying: boolean
}

function useAudioManager() {
  const [audioState, setAudioState] = useState<AudioState>({
    isMuted: false,
    volume: 0.5,
    isPlaying: false
  })
  
  const audioContextRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const schedulerRef = useRef<NodeJS.Timeout | null>(null)
  const isPlayingRef = useRef(false)
  
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])
  
  // 播放柔和的钢琴音符
  const playPianoNote = useCallback((ctx: AudioContext, freq: number, time: number, duration: number, velocity: number) => {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, time)
    gainNode.gain.linearRampToValueAtTime(velocity, time + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(velocity * 0.6, time + duration * 0.2)
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration)
    
    // 添加轻微混响效果
    const filter = ctx.createBiquadFilter()
    filter.type = 'lowpass'
    filter.frequency.value = 2000
    
    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(masterGainRef.current || ctx.destination)
    
    osc.start(time)
    osc.stop(time + duration)
  }, [])
  
  // 播放背景音乐 - 简约钢琴循环
  const playAmbientMusic = useCallback(() => {
    if (audioState.isMuted || isPlayingRef.current) return
    
    try {
      const ctx = initAudioContext()
      if (ctx.state === 'suspended') ctx.resume()
      
      isPlayingRef.current = true
      
      // 主音量控制
      const masterGain = ctx.createGain()
      masterGain.gain.value = audioState.volume * 0.3
      masterGain.connect(ctx.destination)
      masterGainRef.current = masterGain
      
      // 简约的循环旋律（C大调，舒缓节奏）
      // 每小节4拍，BPM约60
      const melodyPattern = [
        // 小节1: C和弦分解
        { note: 261.63, beat: 0, dur: 2 },     // C4
        { note: 329.63, beat: 1, dur: 2 },     // E4
        { note: 392.00, beat: 2, dur: 2 },     // G4
        { note: 523.25, beat: 3, dur: 2 },     // C5
        // 小节2: Am和弦分解
        { note: 220.00, beat: 4, dur: 2 },     // A3
        { note: 261.63, beat: 5, dur: 2 },     // C4
        { note: 329.63, beat: 6, dur: 2 },     // E4
        { note: 440.00, beat: 7, dur: 2 },     // A4
        // 小节3: F和弦分解
        { note: 174.61, beat: 8, dur: 2 },     // F3
        { note: 261.63, beat: 9, dur: 2 },     // C4
        { note: 349.23, beat: 10, dur: 2 },    // F4
        { note: 440.00, beat: 11, dur: 2 },    // A4
        // 小节4: G和弦分解
        { note: 196.00, beat: 12, dur: 2 },    // G3
        { note: 246.94, beat: 13, dur: 2 },    // B3
        { note: 392.00, beat: 14, dur: 2 },    // G4
        { note: 493.88, beat: 15, dur: 2 },    // B4
      ]
      
      const beatDuration = 0.8  // 每拍0.8秒，约BPM 75
      const loopDuration = 16 * beatDuration  // 完整循环时长
      
      let loopCount = 0
      
      const scheduleLoop = () => {
        if (!isPlayingRef.current) return
        
        const now = ctx.currentTime
        const loopStart = now + 0.1
        
        melodyPattern.forEach(({ note, beat, dur }) => {
          const noteTime = loopStart + beat * beatDuration
          const noteDur = dur * beatDuration
          const velocity = audioState.volume * 0.15
          
          playPianoNote(ctx, note, noteTime, noteDur, velocity)
        })
        
        loopCount++
        
        // 安排下一个循环
        schedulerRef.current = setTimeout(() => {
          scheduleLoop()
        }, loopDuration * 1000 - 100)
      }
      
      scheduleLoop()
      setAudioState(prev => ({ ...prev, isPlaying: true }))
    } catch (e) {
      console.log('音频初始化失败:', e)
    }
  }, [audioState.isMuted, audioState.volume, initAudioContext, playPianoNote])
  
  // 停止背景音乐
  const stopAmbientMusic = useCallback(() => {
    isPlayingRef.current = false
    
    if (schedulerRef.current) {
      clearTimeout(schedulerRef.current)
      schedulerRef.current = null
    }
    
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      masterGainRef.current.gain.linearRampToValueAtTime(0, now + 0.5)
    }
    
    setAudioState(prev => ({ ...prev, isPlaying: false }))
  }, [])
  
  // 编织音效 - 轻柔的叮咚声
  const playWeavingSound = useCallback(() => {
    if (audioState.isMuted) return
    
    try {
      const ctx = initAudioContext()
      const now = ctx.currentTime
      
      // 随机选择一个悦耳的音高
      const notes = [523.25, 587.33, 659.25, 783.99, 880]  // C5, D5, E5, G5, A5
      const freq = notes[Math.floor(Math.random() * notes.length)]
      
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      
      const gain = ctx.createGain()
      gain.gain.setValueAtTime(0, now)
      gain.gain.linearRampToValueAtTime(audioState.volume * 0.08, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3)
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.start(now)
      osc.stop(now + 0.3)
    } catch (e) {}
  }, [audioState.isMuted, audioState.volume, initAudioContext])
  
  // 完成音效 - 优美的上行琶音
  const playCompleteSound = useCallback(() => {
    if (audioState.isMuted) return
    
    try {
      const ctx = initAudioContext()
      const now = ctx.currentTime
      
      // C大调上行琶音
      const notes = [261.63, 329.63, 392, 523.25, 659.25, 783.99, 1046.5]
      
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        
        const gain = ctx.createGain()
        const startTime = now + i * 0.15
        gain.gain.setValueAtTime(0, startTime)
        gain.gain.linearRampToValueAtTime(audioState.volume * 0.12, startTime + 0.02)
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5)
        
        osc.connect(gain)
        gain.connect(ctx.destination)
        
        osc.start(startTime)
        osc.stop(startTime + 1.5)
      })
      
      // 结尾和弦
      setTimeout(() => {
        const chordNotes = [261.63, 329.63, 392, 523.25]  // C大调和弦
        chordNotes.forEach(freq => {
          const osc = ctx.createOscillator()
          osc.type = 'sine'
          osc.frequency.value = freq
          
          const gain = ctx.createGain()
          gain.gain.setValueAtTime(audioState.volume * 0.1, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2)
          
          osc.connect(gain)
          gain.connect(ctx.destination)
          
          osc.start()
          osc.stop(ctx.currentTime + 2)
        })
      }, 1000)
    } catch (e) {}
  }, [audioState.isMuted, audioState.volume, initAudioContext])
  
  // 切换静音
  const toggleMute = useCallback(() => {
    setAudioState(prev => {
      const newMuted = !prev.isMuted
      if (masterGainRef.current) {
        masterGainRef.current.gain.value = newMuted ? 0 : prev.volume * 0.3
      }
      return { ...prev, isMuted: newMuted }
    })
  }, [])
  
  // 清理
  useEffect(() => {
    return () => {
      isPlayingRef.current = false
      if (schedulerRef.current) clearTimeout(schedulerRef.current)
    }
  }, [])
  
  return {
    audioState,
    playAmbientMusic,
    stopAmbientMusic,
    playWeavingSound,
    playCompleteSound,
    toggleMute
  }
}

// ============ 主组件 ============
export default function BambooWeavingGame() {
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showTutorial, setShowTutorial] = useState(true)
  const [isComplete, setIsComplete] = useState(false)
  const [fragmentEarned, setFragmentEarned] = useState(false)
  const [interactionMode, setInteractionMode] = useState<'touch' | 'hand'>('touch')
  const [handTrackingEnabled, setHandTrackingEnabled] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('auto')
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)
  const lastY = useRef(0)
  
  // 手部追踪Hook
  const handState = useHandTracking(videoRef, handTrackingEnabled)
  
  // 音频管理Hook
  const { 
    audioState, 
    playAmbientMusic, 
    stopAmbientMusic, 
    playWeavingSound, 
    playCompleteSound, 
    toggleMute 
  } = useAudioManager()
  
  // 编织音效计时
  const lastWeavingSoundTime = useRef(0)
  
  // 全屏切换
  const toggleFullscreen = useCallback(async () => {
    if (!gameContainerRef.current) return
    
    try {
      if (!document.fullscreenElement) {
        await gameContainerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        await document.exitFullscreen()
        setIsFullscreen(false)
      }
    } catch (err) {
      console.error('全屏切换失败:', err)
    }
  }, [])
  
  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])
  
  // 开始编织时自动进入全屏
  useEffect(() => {
    if (isPlaying && !showTutorial && !isFullscreen && gameContainerRef.current) {
      // 延迟一点进入全屏，避免用户操作冲突
      const timer = setTimeout(() => {
        gameContainerRef.current?.requestFullscreen?.().catch(() => {})
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isPlaying, showTutorial])
  
  // 开始编织时播放背景音乐
  useEffect(() => {
    if (isPlaying && !showTutorial && !isComplete) {
      playAmbientMusic()
    } else if (!isPlaying || isComplete) {
      stopAmbientMusic()
    }
  }, [isPlaying, showTutorial, isComplete, playAmbientMusic, stopAmbientMusic])
  
  // 判断当前手势是否为编织手势
  const isWeavingGesture = (gesture: GestureType): boolean => {
    return ['fist', 'pinch', 'pointing', 'thumbsUp', 'peace'].includes(gesture)
  }
  
  // 获取不同手势的编织速度
  const getWeavingSpeed = (gesture: GestureType): number => {
    const speeds: Record<GestureType, number> = {
      fist: 0.008,      // 握拳 - 快速
      thumbsUp: 0.012,  // 点赞 - 最快
      pinch: 0.004,     // 捏合 - 精细
      pointing: 0.003,  // 指向 - 缓慢
      peace: 0.006,     // 剪刀手 - 中等
      open: 0,
      none: 0
    }
    return speeds[gesture]
  }
  
  // 当前是否正在编织
  const isCurrentlyWeaving = handTrackingEnabled && isPlaying && !isComplete && isWeavingGesture(handState.gesture)
  
  // 编织时播放编织音效
  useEffect(() => {
    if (isCurrentlyWeaving) {
      const now = Date.now()
      if (now - lastWeavingSoundTime.current > 150) {  // 每150ms播放一次
        playWeavingSound()
        lastWeavingSoundTime.current = now
      }
    }
  }, [isCurrentlyWeaving, progress, playWeavingSound])
  
  // 完成时播放胜利音效
  useEffect(() => {
    if (isComplete) {
      playCompleteSound()
    }
  }, [isComplete, playCompleteSound])
  
  // 手势控制编织进度 - 使用interval持续更新
  useEffect(() => {
    if (!handTrackingEnabled || !isPlaying || isComplete) return
    
    const interval = setInterval(() => {
      const speed = getWeavingSpeed(handState.gesture)
      if (speed > 0) {
        setProgress(prev => {
          const newProgress = Math.min(1, prev + speed)
          if (newProgress >= 1) {
            setIsComplete(true)
            setTimeout(() => setFragmentEarned(true), 1000)
            clearInterval(interval)
          }
          return newProgress
        })
      }
    }, 50)  // 每50ms更新一次
    
    return () => clearInterval(interval)
  }, [handTrackingEnabled, isPlaying, isComplete, handState.gesture])
  
  // 触摸/鼠标滑动控制进度
  const handleInteraction = useCallback((clientY: number) => {
    if (!isPlaying || isComplete || interactionMode !== 'touch') return
    
    const delta = (lastY.current - clientY) * 0.003
    lastY.current = clientY
    
    setProgress(prev => {
      const newProgress = Math.max(0, Math.min(1, prev + delta))
      if (newProgress >= 1 && !isComplete) {
        setIsComplete(true)
        setTimeout(() => setFragmentEarned(true), 1000)
      }
      return newProgress
    })
  }, [isPlaying, isComplete, interactionMode])
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1 && interactionMode === 'touch') {
      handleInteraction(e.clientY)
    }
  }
  
  const handleMouseDown = (e: React.MouseEvent) => {
    lastY.current = e.clientY
    if (!isPlaying && interactionMode === 'touch') {
      setIsPlaying(true)
      setShowTutorial(false)
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (interactionMode === 'touch') {
      handleInteraction(e.touches[0].clientY)
    }
  }
  
  const handleTouchStart = (e: React.TouchEvent) => {
    lastY.current = e.touches[0].clientY
    if (!isPlaying && interactionMode === 'touch') {
      setIsPlaying(true)
      setShowTutorial(false)
    }
  }
  
  // 切换到手部追踪模式
  const enableHandTracking = () => {
    // MediaPipe Camera 会自动请求摄像头权限
    setInteractionMode('hand')
    setHandTrackingEnabled(true)
    setShowTutorial(false)
    setIsPlaying(true)
  }
  
  // 完全重置（回到教程）
  const resetGame = () => {
    setProgress(0)
    setIsPlaying(false)
    setIsComplete(false)
    setFragmentEarned(false)
    setShowTutorial(true)
    setHandTrackingEnabled(false)
    setInteractionMode('touch')
  }
  
  // 重新开始（保持当前模式）
  const restartGame = () => {
    setProgress(0)
    setIsComplete(false)
    setFragmentEarned(false)
    // 保持当前模式继续
    setIsPlaying(true)
  }

  // 绘制手部关键点的Canvas ref
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  // 绘制手部关键点
  useEffect(() => {
    if (!handState.landmarks || !canvasRef.current) return
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const landmarks = handState.landmarks
    
    // 手指连接关系
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4],      // 拇指
      [0, 5], [5, 6], [6, 7], [7, 8],      // 食指
      [0, 9], [9, 10], [10, 11], [11, 12], // 中指
      [0, 13], [13, 14], [14, 15], [15, 16], // 无名指
      [0, 17], [17, 18], [18, 19], [19, 20], // 小指
      [5, 9], [9, 13], [13, 17]             // 掌心连接
    ]
    
    // 绘制连接线
    ctx.strokeStyle = '#A73A36'
    ctx.lineWidth = 2
    connections.forEach(([i, j]) => {
      const p1 = landmarks[i]
      const p2 = landmarks[j]
      ctx.beginPath()
      // 镜像X坐标
      ctx.moveTo((1 - p1.x) * canvas.width, p1.y * canvas.height)
      ctx.lineTo((1 - p2.x) * canvas.width, p2.y * canvas.height)
      ctx.stroke()
    })
    
    // 绘制关键点
    landmarks.forEach((point: HandLandmark, index: number) => {
      ctx.beginPath()
      // 镜像X坐标
      ctx.arc((1 - point.x) * canvas.width, point.y * canvas.height, index === 0 ? 6 : 4, 0, Math.PI * 2)
      ctx.fillStyle = index === 0 ? '#F2D974' : '#A73A36'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1
      ctx.stroke()
    })
  }, [handState.landmarks])

  return (
    <div ref={gameContainerRef} className="relative w-full h-screen bg-gradient-to-b from-paper-500 to-paper-300 overflow-hidden">
      {/* 摄像头预览（同时用于MediaPipe追踪） */}
      <div className={`absolute z-20 transition-all duration-300 ${
        handTrackingEnabled 
          ? 'bottom-24 right-4 w-64 h-48 rounded-xl overflow-hidden shadow-card border-2 border-palace-500' 
          : 'w-0 h-0 opacity-0'
      }`}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100"
          playsInline
          muted
        />
        {/* 手部关键点绘制层 */}
        <canvas
          ref={canvasRef}
          width={256}
          height={192}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
        {handTrackingEnabled && (
          <div className="absolute inset-0 pointer-events-none">
            {/* 加载状态 */}
            {handState.isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="text-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <span className="text-xs">加载手部模型...</span>
                </div>
              </div>
            )}
            {/* 错误提示 */}
            {handState.error && (
              <div className="absolute inset-0 flex items-center justify-center bg-red-500/80">
                <div className="text-center text-white p-2">
                  <span className="text-xs">❌ {handState.error}</span>
                </div>
              </div>
            )}
            {/* 追踪状态 */}
            {!handState.isLoading && !handState.error && (
              <>
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-1 text-white text-xs rounded-full flex items-center gap-1 ${
                    handState.isTracking ? 'bg-nature-500' : 'bg-gold-500'
                  }`}>
                    {handState.isTracking ? (
                      <>
                        <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        追踪中
                      </>
                    ) : (
                      '等待检测...'
                    )}
                  </span>
                </div>
                
                {/* 旋转指示器 - 显示手部旋转控制视角 */}
                {handState.isTracking && Math.abs(handState.rotationSpeed) > 2 && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-1 bg-palace-500 text-white text-xs rounded-full flex items-center gap-1">
                      <span className={`transform ${handState.rotationSpeed > 0 ? 'rotate-90' : '-rotate-90'}`}>
                        ↻
                      </span>
                      旋转视角
                    </span>
                  </div>
                )}
                
                <div className="absolute bottom-2 left-2 right-2 text-center">
                  <span className={`text-sm font-bold px-3 py-1 rounded ${
                    handState.gesture === 'fist' || handState.gesture === 'pinch' || 
                    handState.gesture === 'thumbsUp' || handState.gesture === 'peace'
                      ? 'bg-palace-500 text-white' 
                      : handState.gesture === 'open'
                      ? 'bg-mountain-400 text-white'
                      : 'bg-black/50 text-white'
                  }`}>
                    {handState.gesture === 'fist' && '✊ 握拳编织'}
                    {handState.gesture === 'pinch' && '🤏 精细编织'}
                    {handState.gesture === 'thumbsUp' && '👍 加速编织'}
                    {handState.gesture === 'peace' && '✌️ 编织中'}
                    {handState.gesture === 'pointing' && '👆 缓慢编织'}
                    {handState.gesture === 'open' && '✋ 暂停'}
                    {handState.gesture === 'none' && '未识别'}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* 3D Canvas */}
      <div 
        ref={containerRef}
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <Canvas shadows>
          <Suspense fallback={<Loader />}>
            <Scene 
              progress={progress} 
              isComplete={isComplete} 
              isWeaving={isCurrentlyWeaving}
              handRotation={handState.rotation}
              rotationSpeed={handState.rotationSpeed}
              palmCenter={handState.palmCenter}
              viewMode={viewMode}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-mountain-900/80 to-transparent z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between text-white mb-2">
            <div>
              <h2 className="text-xl font-bold">安溪藤铁工艺</h2>
              <p className="text-sm text-white/70">
                {interactionMode === 'hand' ? '🖐️ 手势编织模式' : '👆 触控编织模式'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* 音量控制按钮 */}
              <button 
                onClick={toggleMute}
                className={`p-2 rounded-full transition-colors ${
                  audioState.isMuted 
                    ? 'bg-red-500/50 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={audioState.isMuted ? '开启声音' : '静音'}
              >
                {audioState.isMuted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
              {/* 模式切换按钮 */}
              <button 
                onClick={() => interactionMode === 'hand' ? resetGame() : enableHandTracking()}
                className={`p-2 rounded-full transition-colors ${
                  interactionMode === 'hand' 
                    ? 'bg-palace-500 text-white' 
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
                title={interactionMode === 'hand' ? '切换到触控模式' : '开启手势追踪'}
              >
                {interactionMode === 'hand' ? <Monitor className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
              </button>
              <button 
                onClick={resetGame}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>
          </div>
          <ProgressBar progress={progress} />
          <p className="text-xs text-white/60 mt-1 text-center">
            编织进度 {Math.floor(progress * 100)}%
          </p>
        </div>
      </div>
      
      {/* 手势状态指示器 */}
      {handTrackingEnabled && isPlaying && (
        <div className="absolute top-28 left-1/2 -translate-x-1/2 z-20">
          <GestureIndicator 
            gesture={handState.gesture} 
            isTracking={handState.isTracking} 
            isWeaving={isCurrentlyWeaving}
          />
        </div>
      )}
      
      {/* 视角切换控制（编织时显示） */}
      {isPlaying && !showTutorial && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-2">
          {/* 视角模式按钮 */}
          {[
            { mode: 'auto' as ViewMode, icon: '🎬', label: '自动' },
            { mode: 'outside' as ViewMode, icon: '🌐', label: '外部' },
            { mode: 'inside' as ViewMode, icon: '👁️', label: '内部' },
            { mode: 'detail' as ViewMode, icon: '🔍', label: '细节' },
            { mode: 'overview' as ViewMode, icon: '🏔️', label: '全貌' },
          ].map(({ mode, icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                viewMode === mode
                  ? 'bg-palace-500 text-white scale-110 shadow-lg'
                  : 'bg-black/40 text-white/80 hover:bg-black/60 hover:scale-105'
              }`}
              title={label}
            >
              <span className="text-lg">{icon}</span>
              <span className="text-[10px]">{label}</span>
            </button>
          ))}
          
          {/* 分隔线 */}
          <div className="w-8 h-px bg-white/20 mx-auto my-1" />
          
          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
              isFullscreen
                ? 'bg-gold-500 text-white'
                : 'bg-black/40 text-white/80 hover:bg-black/60'
            }`}
            title={isFullscreen ? '退出全屏' : '全屏模式'}
          >
            <span className="text-lg">{isFullscreen ? '⛶' : '⛶'}</span>
            <span className="text-[10px]">{isFullscreen ? '退出' : '全屏'}</span>
          </button>
        </div>
      )}
      
      {/* 教程提示 */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-96 max-w-[90vw] z-20"
          >
            <div className="bg-white/95 backdrop-blur rounded-2xl p-6 shadow-card text-center">
              <Hand className="w-12 h-12 mx-auto mb-3 text-palace-500" />
              <h3 className="text-lg font-bold text-mountain-700 mb-2">
                体验藤铁编织技艺
              </h3>
              <p className="text-sm text-mountain-500 mb-4">
                选择交互方式，感受传统手工艺的魅力
              </p>
              
              <div className="space-y-3">
                {/* 触控模式 */}
                <Button 
                  variant="heritage" 
                  onClick={() => {
                    setInteractionMode('touch')
                    setIsPlaying(true)
                    setShowTutorial(false)
                  }}
                  className="w-full"
                >
                  <Play className="w-4 h-4 mr-2" />
                  触控编织（向上滑动）
                </Button>
                
                {/* 手势模式 */}
                <Button 
                  variant="outline-heritage" 
                  onClick={enableHandTracking}
                  className="w-full"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  手势编织（高级体验）
                </Button>
              </div>
              
              {/* 手势说明 */}
              <div className="mt-4 p-3 bg-paper-100 rounded-xl text-left">
                <p className="text-xs font-medium text-mountain-600 mb-2">🎮 手势操作指南：</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-mountain-500">
                  <div className="flex items-center gap-1">
                    <span>✊</span> 握拳 = 快速编织
                  </div>
                  <div className="flex items-center gap-1">
                    <span>👍</span> 点赞 = 最快编织
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✌️</span> 剪刀手 = 中速编织
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🤏</span> 捏合 = 精细编织
                  </div>
                  <div className="flex items-center gap-1">
                    <span>✋</span> 张开 = 暂停编织
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🔄</span> 旋转 = 转动视角
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 完成奖励弹窗 */}
      <AnimatePresence>
        {fragmentEarned && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-50"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-heritage">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-mountain-800 mb-2">
                🎉 编织完成！
              </h3>
              <p className="text-mountain-500 mb-4">
                恭喜获得文脉碎片
              </p>
              <div className="bg-paper-500 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-palace-500 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-mountain-800">藤铁花瓶</p>
                    <p className="text-xs text-mountain-500">稀有度: 珍品</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Button variant="heritage" className="w-full" onClick={restartGame}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再来一次
                </Button>
                <Button variant="outline-heritage" className="w-full" onClick={resetGame}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  返回选择
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 底部信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-mountain-900/80 to-transparent">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
            <Info className="w-5 h-5 text-gold-400 flex-shrink-0 mt-0.5" />
            <div className="text-white/80 text-sm">
              <p className="font-medium mb-1">安溪藤铁工艺</p>
              <p className="text-xs text-white/60">
                国家级非物质文化遗产，以铁丝为骨架，用藤条缠绕编织，
                创造出精美的工艺品，被誉为"指尖上的艺术"。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
