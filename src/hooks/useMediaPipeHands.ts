/**
 * 通用 MediaPipe Hands 手势识别 Hook
 * 
 * 功能：
 * - 初始化 MediaPipe Hands
 * - 实时追踪 21 个手部关键点
 * - 手势识别：握拳、张开、指向、捏合、点赞、比心等
 * - 高频数据使用 Ref 管理，避免 React 重渲染
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import { Hands, Results } from '@mediapipe/hands'
import { Camera } from '@mediapipe/camera_utils'

// 手部关键点接口
export interface HandLandmark {
  x: number
  y: number
  z: number
}

// 手势类型
export type GestureType = 
  | 'open' 
  | 'fist' 
  | 'pointing' 
  | 'pinch' 
  | 'thumbsUp' 
  | 'peace' 
  | 'none'

// Hook 状态接口
export interface HandTrackingState {
  isTracking: boolean
  gesture: GestureType
  handedness: 'Left' | 'Right' | null
  isLoading: boolean
  error: string | null
}

// 高频数据接口（存储在 Ref 中）
export interface HandDataRef {
  landmarks: HandLandmark[] | null
  rotation: number
  rotationSpeed: number
  palmCenter: { x: number; y: number } | null
  gesture: GestureType
  confidence: number
}

// Hook 配置选项
export interface UseMediaPipeHandsOptions {
  maxNumHands?: number
  minDetectionConfidence?: number
  minTrackingConfidence?: number
  modelComplexity?: 0 | 1
  gestureSmoothing?: number // 手势平滑帧数
}

const DEFAULT_OPTIONS: UseMediaPipeHandsOptions = {
  maxNumHands: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5,
  modelComplexity: 1,
  gestureSmoothing: 5,
}

/**
 * MediaPipe Hands Hook
 * @param videoRef 视频元素引用
 * @param enabled 是否启用追踪
 * @param options 配置选项
 */
export function useMediaPipeHands(
  videoRef: React.RefObject<HTMLVideoElement>,
  enabled: boolean,
  options: UseMediaPipeHandsOptions = {}
) {
  const config = { ...DEFAULT_OPTIONS, ...options }
  
  const [state, setState] = useState<HandTrackingState>({
    isTracking: false,
    gesture: 'none',
    handedness: null,
    isLoading: false,
    error: null,
  })

  // 高频数据使用 Ref 存储，避免触发重渲染
  const handDataRef = useRef<HandDataRef>({
    landmarks: null,
    rotation: 0,
    rotationSpeed: 0,
    palmCenter: null,
    gesture: 'none',
    confidence: 0,
  })

  const handsRef = useRef<Hands | null>(null)
  const cameraRef = useRef<Camera | null>(null)
  
  // 手势平滑处理
  const gestureHistoryRef = useRef<GestureType[]>([])
  const lastRotationRef = useRef(0)

  // 计算手掌旋转角度
  const calculateRotation = useCallback((landmarks: HandLandmark[]) => {
    const wrist = landmarks[0]
    const middleBase = landmarks[9]
    const indexBase = landmarks[5]
    const pinkyBase = landmarks[17]
    
    // 计算手掌中心
    const center = {
      x: (wrist.x + middleBase.x + indexBase.x + pinkyBase.x) / 4,
      y: (wrist.y + middleBase.y + indexBase.y + pinkyBase.y) / 4,
    }

    // 计算旋转角度
    const dx = middleBase.x - wrist.x
    const dy = middleBase.y - wrist.y
    const rotation = Math.atan2(dy, dx) * (180 / Math.PI)

    // 计算旋转速度
    const speed = rotation - lastRotationRef.current
    lastRotationRef.current = rotation

    return { rotation, speed, center }
  }, [])

  // 识别手势
  const recognizeGesture = useCallback((landmarks: HandLandmark[]): GestureType => {
    // 获取关键点
    const thumbTip = landmarks[4]
    const indexTip = landmarks[8]
    const middleTip = landmarks[12]
    const ringTip = landmarks[16]
    const pinkyTip = landmarks[20]
    
    const indexMcp = landmarks[5]
    const middleMcp = landmarks[9]
    const ringMcp = landmarks[13]
    const pinkyMcp = landmarks[17]
    // wrist 保留以备后续扩展手势识别

    // 计算手指是否伸直
    const isIndexExtended = indexTip.y < indexMcp.y - 0.05
    const isMiddleExtended = middleTip.y < middleMcp.y - 0.05
    const isRingExtended = ringTip.y < ringMcp.y - 0.05
    const isPinkyExtended = pinkyTip.y < pinkyMcp.y - 0.05
    const isThumbExtended = thumbTip.x < indexMcp.x - 0.05 || thumbTip.x > indexMcp.x + 0.05

    // 捏合检测
    const pinchDistance = Math.sqrt(
      Math.pow(thumbTip.x - indexTip.x, 2) + 
      Math.pow(thumbTip.y - indexTip.y, 2)
    )
    if (pinchDistance < 0.05) return 'pinch'

    // 握拳检测
    if (!isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'fist'
    }

    // 点赞检测
    if (isThumbExtended && !isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'thumbsUp'
    }

    // 指向检测
    if (isIndexExtended && !isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'pointing'
    }

    // 比耶检测
    if (isIndexExtended && isMiddleExtended && !isRingExtended && !isPinkyExtended) {
      return 'peace'
    }

    // 张开检测
    if (isIndexExtended && isMiddleExtended && isRingExtended && isPinkyExtended) {
      return 'open'
    }

    return 'none'
  }, [])

  // 平滑手势判断
  const getStableGesture = useCallback((newGesture: GestureType): GestureType => {
    gestureHistoryRef.current.push(newGesture)
    if (gestureHistoryRef.current.length > config.gestureSmoothing!) {
      gestureHistoryRef.current.shift()
    }

    // 统计最频繁的手势
    const counts: Record<string, number> = {}
    gestureHistoryRef.current.forEach(g => {
      counts[g] = (counts[g] || 0) + 1
    })

    let maxCount = 0
    let stableGesture: GestureType = 'none'
    Object.entries(counts).forEach(([gesture, count]) => {
      if (count > maxCount) {
        maxCount = count
        stableGesture = gesture as GestureType
      }
    })

    return stableGesture
  }, [config.gestureSmoothing])

  // 处理 MediaPipe 结果
  const onResults = useCallback((results: Results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0] as HandLandmark[]
      const handedness = results.multiHandedness?.[0]?.label as 'Left' | 'Right' || null
      
      // 识别手势
      const rawGesture = recognizeGesture(landmarks)
      const stableGesture = getStableGesture(rawGesture)
      
      // 计算旋转
      const { rotation, speed, center } = calculateRotation(landmarks)

      // 更新 Ref 数据（不触发重渲染）
      handDataRef.current = {
        landmarks,
        rotation,
        rotationSpeed: speed,
        palmCenter: center,
        gesture: stableGesture,
        confidence: results.multiHandedness?.[0]?.score || 0,
      }

      // 仅当手势变化时更新 State
      setState(prev => {
        if (prev.gesture !== stableGesture || prev.handedness !== handedness || !prev.isTracking) {
          return {
            ...prev,
            isTracking: true,
            gesture: stableGesture,
            handedness,
          }
        }
        return prev
      })
    } else {
      // 清空数据
      handDataRef.current = {
        landmarks: null,
        rotation: 0,
        rotationSpeed: 0,
        palmCenter: null,
        gesture: 'none',
        confidence: 0,
      }
      
      setState(prev => {
        if (prev.isTracking) {
          return { ...prev, isTracking: false, gesture: 'none' }
        }
        return prev
      })
    }
  }, [recognizeGesture, getStableGesture, calculateRotation])

  // 初始化 MediaPipe
  useEffect(() => {
    if (!enabled || !videoRef.current) return

    let mounted = true
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    const initMediaPipe = async () => {
      try {
        // 初始化 Hands
        const hands = new Hands({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
          },
        })

        hands.setOptions({
          maxNumHands: config.maxNumHands,
          modelComplexity: config.modelComplexity,
          minDetectionConfidence: config.minDetectionConfidence,
          minTrackingConfidence: config.minTrackingConfidence,
        })

        hands.onResults(onResults)
        await hands.initialize()

        if (!mounted) return

        handsRef.current = hands

        // 启动摄像头
        const camera = new Camera(videoRef.current!, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current })
            }
          },
          width: 640,
          height: 480,
        })

        await camera.start()
        cameraRef.current = camera

        if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }))
        }
      } catch (error) {
        console.error('MediaPipe initialization error:', error)
        if (mounted) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: error instanceof Error ? error.message : '初始化失败',
          }))
        }
      }
    }

    initMediaPipe()

    return () => {
      mounted = false
      cameraRef.current?.stop()
      handsRef.current?.close()
      cameraRef.current = null
      handsRef.current = null
    }
  }, [enabled, videoRef, config.maxNumHands, config.modelComplexity, config.minDetectionConfidence, config.minTrackingConfidence, onResults])

  return {
    ...state,
    handDataRef,
  }
}

export default useMediaPipeHands
