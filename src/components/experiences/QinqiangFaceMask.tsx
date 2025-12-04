/**
 * 秦腔AR脸谱 - 人脸实时上妆体验
 * 使用 MediaPipe FaceMesh 实时检测人脸，叠加精美秦腔脸谱
 */

import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Palette,
  Eye,
  RotateCcw,
  Share2,
  X
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FaceMesh, Results as FaceResults } from '@mediapipe/face_mesh'
import { Camera as MPCamera } from '@mediapipe/camera_utils'

// 脸谱角色配置
interface FaceMaskConfig {
  id: string
  name: string
  role: '生' | '旦' | '净' | '丑'
  description: string
  colors: string[]
  patterns: string
  // 脸谱图片URL（如果有的话使用图片，否则使用Canvas绘制）
  imageUrl?: string
}

// 秦腔脸谱数据
const FACE_MASKS: FaceMaskConfig[] = [
  {
    id: 'zhengyi',
    name: '关公',
    role: '净',
    description: '红脸象征忠义，代表忠勇正义的形象',
    colors: ['#DC2626', '#991B1B', '#000000'],
    patterns: 'red-loyal',
    // 可以添加真实脸谱图片URL
    // imageUrl: '/masks/guangong.png',
  },
  {
    id: 'caocao',
    name: '曹操',
    role: '净',
    description: '白脸象征奸诈，代表阴险狡猾的形象',
    colors: ['#FFFFFF', '#000000', '#1E40AF'],
    patterns: 'white-cunning',
  },
  {
    id: 'zhangfei',
    name: '张飞',
    role: '净',
    description: '黑脸象征刚直，代表勇猛威严的形象',
    colors: ['#000000', '#DC2626', '#FFFFFF'],
    patterns: 'black-brave',
  },
  {
    id: 'sunwukong',
    name: '孙悟空',
    role: '净',
    description: '金脸象征神圣，代表神仙妖怪的形象',
    colors: ['#F59E0B', '#DC2626', '#FFFFFF'],
    patterns: 'gold-magic',
  },
  {
    id: 'baozhen',
    name: '包拯',
    role: '净',
    description: '黑脸月牙，象征铁面无私',
    colors: ['#000000', '#FFFFFF', '#F59E0B'],
    patterns: 'black-justice',
  },
  {
    id: 'chou',
    name: '丑角',
    role: '丑',
    description: '豆腐块白，象征诙谐滑稽',
    colors: ['#FFFFFF', '#000000', '#DC2626'],
    patterns: 'clown',
  },
]

// 预加载脸谱图片缓存
const maskImageCache: Map<string, HTMLImageElement> = new Map()

// 加载图片的辅助函数
const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    if (maskImageCache.has(url)) {
      resolve(maskImageCache.get(url)!)
      return
    }
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      maskImageCache.set(url, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = url
  })
}

export default function QinqiangFaceMask() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const overlayRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMask, setSelectedMask] = useState(FACE_MASKS[0])
  const [maskIntensity, setMaskIntensity] = useState(0.8)
  const [showInfo, setShowInfo] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  
  // 自定义上传的脸谱图片
  const [customMaskImage, setCustomMaskImage] = useState<HTMLImageElement | null>(null)
  const [useCustomMask, setUseCustomMask] = useState(false)
  
  // 使用 ref 存储用于动画循环的值（解决闭包问题）
  const customMaskImageRef = useRef<HTMLImageElement | null>(null)
  const useCustomMaskRef = useRef(false)
  const maskIntensityRef = useRef(0.8)
  const selectedMaskRef = useRef(FACE_MASKS[0])

  // 存储人脸关键点
  const faceLandmarksRef = useRef<any>(null)
  
  // 同步 state 到 ref
  customMaskImageRef.current = customMaskImage
  useCustomMaskRef.current = useCustomMask
  maskIntensityRef.current = maskIntensity
  selectedMaskRef.current = selectedMask

  // 处理上传脸谱图片
  const handleMaskUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        setCustomMaskImage(img)
        setUseCustomMask(true)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  // ========== 高级脸谱贴合技术 ==========
  
  // FaceMesh 关键点索引 - 用于构建人脸三角网格
  // 选取具有代表性的关键点构建稀疏网格
  const FACE_MESH_POINTS = [
    10,   // 前额中心
    67, 297,  // 左右额角
    103, 332, // 左右太阳穴
    33, 263,  // 左右眼外角
    133, 362, // 左右眼内角
    159, 386, // 左右眼上
    145, 374, // 左右眼下
    1,    // 鼻尖
    4,    // 鼻梁
    168,  // 眉心
    6,    // 鼻根
    195,  // 鼻中
    94, 323,  // 左右鼻翼
    61, 291,  // 左右嘴角
    0,    // 上唇中心
    17,   // 下唇中心
    152,  // 下巴
    234, 454, // 左右耳
    127, 356, // 左右下颌
    93, 323,  // 左右脸颊
  ]
  
  // 定义三角形网格（使用上面点的索引）
  const FACE_TRIANGLES = [
    // 额头区域
    [0, 1, 3], [0, 2, 4], [0, 1, 9], [0, 2, 9],
    // 眼睛区域
    [1, 3, 5], [2, 4, 6], [3, 5, 7], [4, 6, 8],
    [5, 7, 9], [6, 8, 9], [7, 9, 11], [8, 9, 12],
    // 鼻子区域
    [9, 10, 11], [9, 10, 12], [10, 11, 13], [10, 12, 14],
    [11, 13, 15], [12, 14, 16],
    // 嘴巴区域
    [13, 15, 17], [14, 16, 17], [15, 17, 18], [16, 17, 18],
    // 下巴和脸颊
    [3, 19, 21], [4, 20, 22], [15, 19, 21], [16, 20, 22],
    [17, 18, 21], [17, 18, 22],
  ]

  // 绘制图片脸谱 - 完美贴合人脸
  const drawImageMask = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    landmarks: any[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    // 获取关键点位置（镜像处理）
    const getPoint = (index: number) => ({
      x: (1 - landmarks[index].x) * canvasWidth,
      y: landmarks[index].y * canvasHeight
    })

    // 关键人脸点
    const forehead = getPoint(10)      // 前额中心
    const chin = getPoint(152)         // 下巴
    const leftTemple = getPoint(234)   // 左太阳穴（耳朵附近）
    const rightTemple = getPoint(454)  // 右太阳穴
    const leftJaw = getPoint(172)      // 左下颌角
    const rightJaw = getPoint(397)     // 右下颌角
    
    // 计算人脸尺寸
    const faceWidth = Math.abs(rightTemple.x - leftTemple.x)
    const faceHeight = Math.abs(chin.y - forehead.y)
    const centerX = (leftTemple.x + rightTemple.x) / 2
    const centerY = (forehead.y + chin.y) / 2
    
    // 扩展覆盖区域（确保覆盖整个脸部）
    const expandW = faceWidth * 0.25
    const expandH = faceHeight * 0.15
    
    // 四个控制角点（扩展后的人脸边界）
    const topLeft = {
      x: leftTemple.x - expandW,
      y: forehead.y - expandH
    }
    const topRight = {
      x: rightTemple.x + expandW,
      y: forehead.y - expandH
    }
    const bottomLeft = {
      x: leftJaw.x - expandW * 0.5,
      y: chin.y + expandH * 0.5
    }
    const bottomRight = {
      x: rightJaw.x + expandW * 0.5,
      y: chin.y + expandH * 0.5
    }

    ctx.save()
    ctx.globalAlpha = maskIntensityRef.current
    
    // 绘制变形后的图片
    drawWarpedImage(ctx, img, topLeft, topRight, bottomLeft, bottomRight)

    ctx.restore()
  }
  
  // 绘制透视变形的图片
  const drawWarpedImage = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    topLeft: {x: number, y: number},
    topRight: {x: number, y: number},
    bottomLeft: {x: number, y: number},
    bottomRight: {x: number, y: number}
  ) => {
    // 计算变换矩阵 - 使用分割三角形方法
    // 将四边形分成多个小块来模拟透视效果
    
    const divisions = 8 // 分割数量，越大越精细
    
    for (let i = 0; i < divisions; i++) {
      for (let j = 0; j < divisions; j++) {
        const u0 = i / divisions
        const v0 = j / divisions
        const u1 = (i + 1) / divisions
        const v1 = (j + 1) / divisions
        
        // 双线性插值计算四边形顶点
        const lerp = (a: number, b: number, t: number) => a + (b - a) * t
        const bilinear = (tl: number, tr: number, bl: number, br: number, u: number, v: number) => {
          const top = lerp(tl, tr, u)
          const bottom = lerp(bl, br, u)
          return lerp(top, bottom, v)
        }
        
        // 计算目标四边形的4个顶点
        const dx0 = bilinear(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x, u0, v0)
        const dy0 = bilinear(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y, u0, v0)
        const dx1 = bilinear(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x, u1, v0)
        const dy1 = bilinear(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y, u1, v0)
        const dx2 = bilinear(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x, u1, v1)
        const dy2 = bilinear(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y, u1, v1)
        const dx3 = bilinear(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x, u0, v1)
        const dy3 = bilinear(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y, u0, v1)
        
        // 源图片坐标
        const sx0 = u0 * img.width
        const sy0 = v0 * img.height
        const sw = (u1 - u0) * img.width
        const sh = (v1 - v0) * img.height
        
        // 绘制两个三角形组成的四边形
        ctx.save()
        
        // 第一个三角形 (0, 1, 2)
        ctx.beginPath()
        ctx.moveTo(dx0, dy0)
        ctx.lineTo(dx1, dy1)
        ctx.lineTo(dx2, dy2)
        ctx.closePath()
        ctx.clip()
        
        // 计算仿射变换矩阵
        const srcTri = [[u0, v0], [u1, v0], [u1, v1]]
        const dstTri = [[dx0, dy0], [dx1, dy1], [dx2, dy2]]
        applyAffineTransform(ctx, img, srcTri, dstTri)
        
        ctx.restore()
        
        // 第二个三角形 (0, 2, 3)
        ctx.save()
        
        ctx.beginPath()
        ctx.moveTo(dx0, dy0)
        ctx.lineTo(dx2, dy2)
        ctx.lineTo(dx3, dy3)
        ctx.closePath()
        ctx.clip()
        
        const srcTri2 = [[u0, v0], [u1, v1], [u0, v1]]
        const dstTri2 = [[dx0, dy0], [dx2, dy2], [dx3, dy3]]
        applyAffineTransform(ctx, img, srcTri2, dstTri2)
        
        ctx.restore()
      }
    }
  }
  
  // 应用仿射变换绘制图片
  const applyAffineTransform = (
    ctx: CanvasRenderingContext2D,
    img: HTMLImageElement,
    srcTri: number[][],
    dstTri: number[][]
  ) => {
    // 源三角形顶点 (归一化坐标)
    const [s0, s1, s2] = srcTri
    // 目标三角形顶点 (画布坐标)
    const [d0, d1, d2] = dstTri
    
    // 计算仿射变换矩阵
    // 从归一化坐标到画布坐标
    const sx0 = s0[0], sy0 = s0[1]
    const sx1 = s1[0], sy1 = s1[1]
    const sx2 = s2[0], sy2 = s2[1]
    
    const dx0 = d0[0], dy0 = d0[1]
    const dx1 = d1[0], dy1 = d1[1]
    const dx2 = d2[0], dy2 = d2[1]
    
    // 解矩阵方程
    const det = sx0 * (sy1 - sy2) - sx1 * (sy0 - sy2) + sx2 * (sy0 - sy1)
    if (Math.abs(det) < 0.0001) return
    
    const a = ((dy0 - dy2) * (sy1 - sy2) - (dy1 - dy2) * (sy0 - sy2)) / det
    const b = ((dy1 - dy2) * (sx0 - sx2) - (dy0 - dy2) * (sx1 - sx2)) / det
    const c = dy0 - a * sx0 - b * sy0
    
    const d = ((dx0 - dx2) * (sy1 - sy2) - (dx1 - dx2) * (sy0 - sy2)) / det
    const e = ((dx1 - dx2) * (sx0 - sx2) - (dx0 - dx2) * (sx1 - sx2)) / det
    const f = dx0 - d * sx0 - e * sy0
    
    // 应用变换
    ctx.setTransform(d, a, e, b, f, c)
    ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, 1, 1)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
  }

  // 使用 MediaPipe FaceMesh 进行人脸检测
  const startCamera = useCallback(async () => {
    if (!videoRef.current) return

    setIsLoading(true)

    try {
      // 初始化 FaceMesh
      const faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      })

      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      faceMesh.onResults((results: FaceResults) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          faceLandmarksRef.current = results.multiFaceLandmarks[0]
          setFaceDetected(true)
        } else {
          faceLandmarksRef.current = null
          setFaceDetected(false)
        }
      })

      // 获取摄像头
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' }
      })
      
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      
      // 使用 MediaPipe Camera
      const camera = new MPCamera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current) {
            await faceMesh.send({ image: videoRef.current })
          }
        },
        width: 640,
        height: 480,
      })
      
      await camera.start()
      
      setIsStarted(true)
      setIsLoading(false)
      
      // 开始绘制
      requestAnimationFrame(drawFrame)
    } catch (error) {
      console.error('Camera access denied:', error)
      setIsLoading(false)
    }
  }, [])

  // 绘制帧
  const drawFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !overlayRef.current) {
      requestAnimationFrame(drawFrame)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const overlay = overlayRef.current
    const ctx = canvas.getContext('2d')
    const overlayCtx = overlay.getContext('2d')

    if (!ctx || !overlayCtx) {
      requestAnimationFrame(drawFrame)
      return
    }

    // 绘制视频帧（镜像）
    ctx.save()
    ctx.scale(-1, 1)
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
    ctx.restore()

    // 清除覆盖层
    overlayCtx.clearRect(0, 0, overlay.width, overlay.height)

    // 使用 MediaPipe FaceMesh 检测的关键点
    const landmarks = faceLandmarksRef.current
    
    if (landmarks && landmarks.length > 0) {
      // 如果使用自定义脸谱图片
      if (useCustomMaskRef.current && customMaskImageRef.current) {
        drawImageMask(overlayCtx, customMaskImageRef.current, landmarks, canvas.width, canvas.height)
      } else {
        // 计算人脸边界框
        // FaceMesh 关键点索引：
        // 10: 前额中心, 152: 下巴, 234: 左耳, 454: 右耳
        // 1: 鼻尖, 33: 左眼外角, 263: 右眼外角
        
        const forehead = landmarks[10]
        const chin = landmarks[152]
        const leftEar = landmarks[234]
        const rightEar = landmarks[454]
        
        // 计算人脸中心和尺寸（需要镜像X坐标）
        const faceX = (1 - (leftEar.x + rightEar.x) / 2) * canvas.width
        const faceY = ((forehead.y + chin.y) / 2) * canvas.height
        const faceWidth = Math.abs(rightEar.x - leftEar.x) * canvas.width * 1.5
        const faceHeight = Math.abs(chin.y - forehead.y) * canvas.height * 1.4

        // 传递关键点给脸谱绘制函数（使用ref获取当前值）
        drawMaskWithLandmarks(overlayCtx, faceX, faceY, faceWidth, faceHeight, selectedMaskRef.current, landmarks, canvas.width, canvas.height)
      }
    }

    requestAnimationFrame(drawFrame)
  }, [])

  // 使用关键点绘制脸谱
  const drawMaskWithLandmarks = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    mask: FaceMaskConfig,
    landmarks: any[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    ctx.save()
    ctx.globalAlpha = maskIntensityRef.current

    // 获取关键点位置（镜像处理）
    const getPoint = (index: number) => ({
      x: (1 - landmarks[index].x) * canvasWidth,
      y: landmarks[index].y * canvasHeight
    })

    // 关键点
    const leftEye = getPoint(33)
    const rightEye = getPoint(263)
    const noseTip = getPoint(1)
    const leftMouth = getPoint(61)
    const rightMouth = getPoint(291)
    const forehead = getPoint(10)
    const chin = getPoint(152)

    // 根据不同角色绘制不同脸谱
    switch (mask.patterns) {
      case 'red-loyal':
        drawGuanGongMaskAdvanced(ctx, x, y, width, height, leftEye, rightEye, noseTip, forehead, chin)
        break
      case 'white-cunning':
        drawCaoCaoMaskAdvanced(ctx, x, y, width, height, leftEye, rightEye, noseTip, forehead)
        break
      case 'black-brave':
        drawZhangFeiMaskAdvanced(ctx, x, y, width, height, leftEye, rightEye, noseTip, forehead)
        break
      case 'gold-magic':
        drawWukongMaskAdvanced(ctx, x, y, width, height, leftEye, rightEye, noseTip, forehead)
        break
      case 'black-justice':
        drawBaoZhengMaskAdvanced(ctx, x, y, width, height, leftEye, rightEye, noseTip, forehead)
        break
      case 'clown':
        drawClownMaskAdvanced(ctx, x, y, width, height, noseTip)
        break
    }

    ctx.restore()
  }

  // ========== 高级脸谱绘制函数 ==========

  // 关公红脸 - 超精细版
  const drawGuanGongMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    leftEye: {x: number, y: number},
    rightEye: {x: number, y: number},
    _nose: {x: number, y: number},
    forehead: {x: number, y: number},
    chin: {x: number, y: number}
  ) => {
    const eyeCenter = { x: (leftEye.x + rightEye.x) / 2, y: (leftEye.y + rightEye.y) / 2 }
    
    // 第一层：红色底色（多层渐变模拟皮肤质感）
    const baseGrad = ctx.createRadialGradient(x, y - h*0.1, 0, x, y, h*0.6)
    baseGrad.addColorStop(0, 'rgba(220, 38, 38, 0.88)')
    baseGrad.addColorStop(0.3, 'rgba(200, 30, 30, 0.85)')
    baseGrad.addColorStop(0.6, 'rgba(153, 27, 27, 0.78)')
    baseGrad.addColorStop(1, 'rgba(127, 29, 29, 0.45)')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.52, h*0.54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 第二层：额头深红晕染
    const foreheadGrad = ctx.createLinearGradient(forehead.x, forehead.y - h*0.1, forehead.x, forehead.y + h*0.12)
    foreheadGrad.addColorStop(0, 'rgba(127, 29, 29, 0.85)')
    foreheadGrad.addColorStop(1, 'rgba(185, 28, 28, 0.2)')
    ctx.fillStyle = foreheadGrad
    ctx.beginPath()
    ctx.moveTo(forehead.x - w*0.28, forehead.y)
    ctx.quadraticCurveTo(forehead.x, forehead.y - h*0.12, forehead.x + w*0.28, forehead.y)
    ctx.quadraticCurveTo(forehead.x, forehead.y + h*0.08, forehead.x - w*0.28, forehead.y)
    ctx.fill()

    // 第三层：卧蚕眉（粗壮有力）- 填充式
    ctx.fillStyle = 'rgba(0, 0, 0, 0.92)'
    // 左眉
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.17, leftEye.y - h*0.035)
    ctx.bezierCurveTo(leftEye.x - w*0.1, leftEye.y - h*0.11, leftEye.x + w*0.02, leftEye.y - h*0.1, leftEye.x + w*0.1, leftEye.y - h*0.03)
    ctx.bezierCurveTo(leftEye.x + w*0.04, leftEye.y - h*0.05, leftEye.x - w*0.06, leftEye.y - h*0.055, leftEye.x - w*0.17, leftEye.y - h*0.035)
    ctx.fill()
    // 右眉
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.17, rightEye.y - h*0.035)
    ctx.bezierCurveTo(rightEye.x + w*0.1, rightEye.y - h*0.11, rightEye.x - w*0.02, rightEye.y - h*0.1, rightEye.x - w*0.1, rightEye.y - h*0.03)
    ctx.bezierCurveTo(rightEye.x - w*0.04, rightEye.y - h*0.05, rightEye.x + w*0.06, rightEye.y - h*0.055, rightEye.x + w*0.17, rightEye.y - h*0.035)
    ctx.fill()

    // 眉毛高光
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.14, leftEye.y - h*0.07)
    ctx.quadraticCurveTo(leftEye.x - w*0.02, leftEye.y - h*0.095, leftEye.x + w*0.06, leftEye.y - h*0.045)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.14, rightEye.y - h*0.07)
    ctx.quadraticCurveTo(rightEye.x + w*0.02, rightEye.y - h*0.095, rightEye.x - w*0.06, rightEye.y - h*0.045)
    ctx.stroke()

    // 第四层：丹凤眼（眼窝阴影+眼线）
    // 眼窝阴影
    const eyeShadow = ctx.createRadialGradient(leftEye.x, leftEye.y, 0, leftEye.x, leftEye.y, w*0.1)
    eyeShadow.addColorStop(0, 'rgba(100, 20, 20, 0.5)')
    eyeShadow.addColorStop(1, 'rgba(100, 20, 20, 0)')
    ctx.fillStyle = eyeShadow
    ctx.beginPath()
    ctx.ellipse(leftEye.x, leftEye.y, w*0.1, h*0.035, -0.15, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(rightEye.x, rightEye.y, w*0.1, h*0.035, 0.15, 0, Math.PI * 2)
    ctx.fill()

    // 眼睛黑色轮廓
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    // 左眼
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.09, leftEye.y + h*0.005)
    ctx.quadraticCurveTo(leftEye.x - w*0.01, leftEye.y - h*0.022, leftEye.x + w*0.11, leftEye.y - h*0.012)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.09, leftEye.y + h*0.005)
    ctx.quadraticCurveTo(leftEye.x, leftEye.y + h*0.02, leftEye.x + w*0.11, leftEye.y - h*0.012)
    ctx.stroke()
    // 右眼
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.09, rightEye.y + h*0.005)
    ctx.quadraticCurveTo(rightEye.x + w*0.01, rightEye.y - h*0.022, rightEye.x - w*0.11, rightEye.y - h*0.012)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.09, rightEye.y + h*0.005)
    ctx.quadraticCurveTo(rightEye.x, rightEye.y + h*0.02, rightEye.x - w*0.11, rightEye.y - h*0.012)
    ctx.stroke()

    // 第五层：鼻梁纹
    ctx.strokeStyle = 'rgba(100, 20, 20, 0.7)'
    ctx.lineWidth = 3.5
    ctx.beginPath()
    ctx.moveTo(eyeCenter.x, eyeCenter.y - h*0.015)
    ctx.lineTo(chin.x, chin.y - h*0.25)
    ctx.stroke()

    // 第六层：印堂金点（精细渐变）
    const goldGrad = ctx.createRadialGradient(forehead.x, forehead.y + h*0.015, 0, forehead.x, forehead.y + h*0.015, w*0.04)
    goldGrad.addColorStop(0, '#FEF3C7')
    goldGrad.addColorStop(0.4, '#FCD34D')
    goldGrad.addColorStop(0.8, '#D97706')
    goldGrad.addColorStop(1, '#92400E')
    ctx.fillStyle = goldGrad
    ctx.beginPath()
    ctx.arc(forehead.x, forehead.y + h*0.015, w*0.032, 0, Math.PI * 2)
    ctx.fill()
    // 金点高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
    ctx.beginPath()
    ctx.arc(forehead.x - w*0.01, forehead.y + h*0.008, w*0.01, 0, Math.PI * 2)
    ctx.fill()

    // 第七层：五绺长髯
    ctx.strokeStyle = '#1a1a1a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    for (let i = -2; i <= 2; i++) {
      const ox = i * w*0.038
      ctx.beginPath()
      ctx.moveTo(chin.x + ox, chin.y - h*0.06)
      ctx.bezierCurveTo(chin.x + ox*1.1, chin.y + h*0.02, chin.x + ox*0.85, chin.y + h*0.1, chin.x + ox*0.7, chin.y + h*0.16)
      ctx.stroke()
    }

    // 第八层：颧骨纹路
    ctx.strokeStyle = 'rgba(100, 20, 20, 0.45)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.14, leftEye.y + h*0.06)
    ctx.quadraticCurveTo(leftEye.x - w*0.18, leftEye.y + h*0.12, leftEye.x - w*0.14, leftEye.y + h*0.18)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.14, rightEye.y + h*0.06)
    ctx.quadraticCurveTo(rightEye.x + w*0.18, rightEye.y + h*0.12, rightEye.x + w*0.14, rightEye.y + h*0.18)
    ctx.stroke()
  }

  // 曹操白脸 - 超精细版
  const drawCaoCaoMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    leftEye: {x: number, y: number},
    rightEye: {x: number, y: number},
    nose: {x: number, y: number},
    forehead: {x: number, y: number}
  ) => {
    // 第一层：白色底色（粉底质感）
    const baseGrad = ctx.createRadialGradient(x, y - h*0.08, 0, x, y, h*0.6)
    baseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.94)')
    baseGrad.addColorStop(0.4, 'rgba(252, 252, 252, 0.9)')
    baseGrad.addColorStop(0.7, 'rgba(245, 245, 245, 0.8)')
    baseGrad.addColorStop(1, 'rgba(230, 230, 230, 0.5)')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.52, h*0.54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 第二层：眉心蓝色主纹（双层）
    const blueGrad = ctx.createLinearGradient(forehead.x, forehead.y - h*0.03, forehead.x, forehead.y + h*0.16)
    blueGrad.addColorStop(0, 'rgba(30, 64, 175, 0.95)')
    blueGrad.addColorStop(0.7, 'rgba(30, 64, 175, 0.8)')
    blueGrad.addColorStop(1, 'rgba(30, 64, 175, 0.4)')
    ctx.strokeStyle = blueGrad
    ctx.lineWidth = 7
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y - h*0.01)
    ctx.lineTo(forehead.x, forehead.y + h*0.14)
    ctx.stroke()
    // 内部亮线
    ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y)
    ctx.lineTo(forehead.x, forehead.y + h*0.12)
    ctx.stroke()

    // 第三层：倒八字眉（填充式）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.94)'
    // 左眉 - 向外斜下
    ctx.beginPath()
    ctx.moveTo(leftEye.x + w*0.06, leftEye.y - h*0.075)
    ctx.bezierCurveTo(leftEye.x, leftEye.y - h*0.09, leftEye.x - w*0.08, leftEye.y - h*0.06, leftEye.x - w*0.14, leftEye.y - h*0.03)
    ctx.bezierCurveTo(leftEye.x - w*0.1, leftEye.y - h*0.025, leftEye.x - w*0.04, leftEye.y - h*0.04, leftEye.x + w*0.06, leftEye.y - h*0.075)
    ctx.fill()
    // 右眉
    ctx.beginPath()
    ctx.moveTo(rightEye.x - w*0.06, rightEye.y - h*0.075)
    ctx.bezierCurveTo(rightEye.x, rightEye.y - h*0.09, rightEye.x + w*0.08, rightEye.y - h*0.06, rightEye.x + w*0.14, rightEye.y - h*0.03)
    ctx.bezierCurveTo(rightEye.x + w*0.1, rightEye.y - h*0.025, rightEye.x + w*0.04, rightEye.y - h*0.04, rightEye.x - w*0.06, rightEye.y - h*0.075)
    ctx.fill()

    // 第四层：眼角蓝色纹（三道）
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.88)'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    // 左眼角
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.07, leftEye.y - h*0.008)
    ctx.lineTo(leftEye.x - w*0.15, leftEye.y - h*0.035)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.07, leftEye.y + h*0.012)
    ctx.lineTo(leftEye.x - w*0.14, leftEye.y + h*0.005)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.07, leftEye.y + h*0.032)
    ctx.lineTo(leftEye.x - w*0.13, leftEye.y + h*0.04)
    ctx.stroke()
    // 右眼角
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.07, rightEye.y - h*0.008)
    ctx.lineTo(rightEye.x + w*0.15, rightEye.y - h*0.035)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.07, rightEye.y + h*0.012)
    ctx.lineTo(rightEye.x + w*0.14, rightEye.y + h*0.005)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.07, rightEye.y + h*0.032)
    ctx.lineTo(rightEye.x + w*0.13, rightEye.y + h*0.04)
    ctx.stroke()

    // 第五层：眼睛轮廓
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    // 左眼
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.07, leftEye.y)
    ctx.quadraticCurveTo(leftEye.x, leftEye.y - h*0.018, leftEye.x + w*0.07, leftEye.y)
    ctx.quadraticCurveTo(leftEye.x, leftEye.y + h*0.014, leftEye.x - w*0.07, leftEye.y)
    ctx.stroke()
    // 右眼
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.07, rightEye.y)
    ctx.quadraticCurveTo(rightEye.x, rightEye.y - h*0.018, rightEye.x - w*0.07, rightEye.y)
    ctx.quadraticCurveTo(rightEye.x, rightEye.y + h*0.014, rightEye.x + w*0.07, rightEye.y)
    ctx.stroke()

    // 第六层：鼻部蓝纹
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.65)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.025, nose.y - h*0.025)
    ctx.lineTo(nose.x - w*0.04, nose.y + h*0.015)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(nose.x + w*0.025, nose.y - h*0.025)
    ctx.lineTo(nose.x + w*0.04, nose.y + h*0.015)
    ctx.stroke()

    // 第七层：法令纹
    ctx.strokeStyle = 'rgba(30, 64, 175, 0.75)'
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.07, nose.y + h*0.06)
    ctx.bezierCurveTo(nose.x - w*0.1, nose.y + h*0.1, nose.x - w*0.11, nose.y + h*0.13, nose.x - w*0.09, nose.y + h*0.16)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(nose.x + w*0.07, nose.y + h*0.06)
    ctx.bezierCurveTo(nose.x + w*0.1, nose.y + h*0.1, nose.x + w*0.11, nose.y + h*0.13, nose.x + w*0.09, nose.y + h*0.16)
    ctx.stroke()

    // 第八层：颧骨阴影
    ctx.fillStyle = 'rgba(210, 210, 210, 0.4)'
    ctx.beginPath()
    ctx.ellipse(leftEye.x - w*0.11, leftEye.y + h*0.09, w*0.07, h*0.05, 0.25, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(rightEye.x + w*0.11, rightEye.y + h*0.09, w*0.07, h*0.05, -0.25, 0, Math.PI * 2)
    ctx.fill()
  }

  // 张飞黑脸 - 超精细版
  const drawZhangFeiMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    leftEye: {x: number, y: number},
    rightEye: {x: number, y: number},
    nose: {x: number, y: number},
    forehead: {x: number, y: number}
  ) => {
    // 第一层：黑色底色（深邃质感）
    const baseGrad = ctx.createRadialGradient(x, y - h*0.05, 0, x, y, h*0.6)
    baseGrad.addColorStop(0, 'rgba(35, 35, 35, 0.9)')
    baseGrad.addColorStop(0.4, 'rgba(25, 25, 25, 0.88)')
    baseGrad.addColorStop(0.7, 'rgba(15, 15, 15, 0.82)')
    baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.52, h*0.54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 第二层：红色蝴蝶眉（张飞标志性特征）
    const butterflyGrad = ctx.createRadialGradient(forehead.x, forehead.y + h*0.02, 0, forehead.x, forehead.y + h*0.02, w*0.28)
    butterflyGrad.addColorStop(0, 'rgba(239, 68, 68, 0.95)')
    butterflyGrad.addColorStop(0.5, 'rgba(220, 38, 38, 0.92)')
    butterflyGrad.addColorStop(1, 'rgba(185, 28, 28, 0.75)')
    ctx.fillStyle = butterflyGrad
    // 左蝴蝶翅
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y + h*0.025)
    ctx.bezierCurveTo(forehead.x - w*0.06, forehead.y - h*0.04, forehead.x - w*0.18, forehead.y - h*0.06, forehead.x - w*0.26, forehead.y + h*0.015)
    ctx.bezierCurveTo(forehead.x - w*0.22, forehead.y + h*0.08, forehead.x - w*0.1, forehead.y + h*0.09, forehead.x, forehead.y + h*0.025)
    ctx.fill()
    // 右蝴蝶翅
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y + h*0.025)
    ctx.bezierCurveTo(forehead.x + w*0.06, forehead.y - h*0.04, forehead.x + w*0.18, forehead.y - h*0.06, forehead.x + w*0.26, forehead.y + h*0.015)
    ctx.bezierCurveTo(forehead.x + w*0.22, forehead.y + h*0.08, forehead.x + w*0.1, forehead.y + h*0.09, forehead.x, forehead.y + h*0.025)
    ctx.fill()
    // 蝴蝶眉深色边缘
    ctx.strokeStyle = 'rgba(127, 29, 29, 0.85)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y + h*0.025)
    ctx.bezierCurveTo(forehead.x - w*0.06, forehead.y - h*0.04, forehead.x - w*0.18, forehead.y - h*0.06, forehead.x - w*0.26, forehead.y + h*0.015)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y + h*0.025)
    ctx.bezierCurveTo(forehead.x + w*0.06, forehead.y - h*0.04, forehead.x + w*0.18, forehead.y - h*0.06, forehead.x + w*0.26, forehead.y + h*0.015)
    ctx.stroke()
    // 蝴蝶眉高光
    ctx.strokeStyle = 'rgba(248, 113, 113, 0.6)'
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(forehead.x - w*0.02, forehead.y + h*0.01)
    ctx.bezierCurveTo(forehead.x - w*0.08, forehead.y - h*0.02, forehead.x - w*0.15, forehead.y - h*0.03, forehead.x - w*0.2, forehead.y + h*0.01)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(forehead.x + w*0.02, forehead.y + h*0.01)
    ctx.bezierCurveTo(forehead.x + w*0.08, forehead.y - h*0.02, forehead.x + w*0.15, forehead.y - h*0.03, forehead.x + w*0.2, forehead.y + h*0.01)
    ctx.stroke()

    // 第三层：圆环眼（双层白环）
    // 外环
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineWidth = 5
    ctx.beginPath()
    ctx.arc(leftEye.x, leftEye.y, w*0.085, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(rightEye.x, rightEye.y, w*0.085, 0, Math.PI * 2)
    ctx.stroke()
    // 内环
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(leftEye.x, leftEye.y, w*0.055, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(rightEye.x, rightEye.y, w*0.055, 0, Math.PI * 2)
    ctx.stroke()
    // 眼角延伸线
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.085, leftEye.y)
    ctx.lineTo(leftEye.x - w*0.14, leftEye.y - h*0.015)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.085, rightEye.y)
    ctx.lineTo(rightEye.x + w*0.14, rightEye.y - h*0.015)
    ctx.stroke()

    // 第四层：白色鼻梁纹（粗壮）
    const noseGrad = ctx.createLinearGradient(nose.x, forehead.y + h*0.08, nose.x, nose.y + h*0.04)
    noseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
    noseGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.9)')
    noseGrad.addColorStop(1, 'rgba(240, 240, 240, 0.7)')
    ctx.strokeStyle = noseGrad
    ctx.lineWidth = 8
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(nose.x, forehead.y + h*0.09)
    ctx.lineTo(nose.x, nose.y + h*0.02)
    ctx.stroke()
    // 鼻梁边线
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.025, forehead.y + h*0.1)
    ctx.lineTo(nose.x - w*0.03, nose.y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(nose.x + w*0.025, forehead.y + h*0.1)
    ctx.lineTo(nose.x + w*0.03, nose.y)
    ctx.stroke()

    // 第五层：嘴部装饰
    ctx.fillStyle = 'rgba(220, 38, 38, 0.85)'
    ctx.beginPath()
    ctx.ellipse(nose.x, nose.y + h*0.11, w*0.09, h*0.028, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(127, 29, 29, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()
    // 嘴唇线
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.08, nose.y + h*0.11)
    ctx.lineTo(nose.x + w*0.08, nose.y + h*0.11)
    ctx.stroke()

    // 第六层：面部纹路装饰
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)'
    ctx.lineWidth = 1.5
    // 颧骨纹
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.1, leftEye.y + h*0.05)
    ctx.bezierCurveTo(leftEye.x - w*0.16, leftEye.y + h*0.1, leftEye.x - w*0.15, leftEye.y + h*0.15, leftEye.x - w*0.12, leftEye.y + h*0.18)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.1, rightEye.y + h*0.05)
    ctx.bezierCurveTo(rightEye.x + w*0.16, rightEye.y + h*0.1, rightEye.x + w*0.15, rightEye.y + h*0.15, rightEye.x + w*0.12, rightEye.y + h*0.18)
    ctx.stroke()
  }

  // 孙悟空金脸 - 超精细版
  const drawWukongMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    leftEye: {x: number, y: number},
    rightEye: {x: number, y: number},
    nose: {x: number, y: number},
    forehead: {x: number, y: number}
  ) => {
    // 第一层：金色底色（华丽金属质感）
    const baseGrad = ctx.createRadialGradient(x, y - h*0.08, 0, x, y, h*0.6)
    baseGrad.addColorStop(0, 'rgba(253, 224, 71, 0.92)')
    baseGrad.addColorStop(0.3, 'rgba(252, 211, 77, 0.88)')
    baseGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.82)')
    baseGrad.addColorStop(0.8, 'rgba(217, 119, 6, 0.7)')
    baseGrad.addColorStop(1, 'rgba(180, 83, 9, 0.5)')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.52, h*0.54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 第二层：紧箍咒（多层金环）
    // 底层暗金
    ctx.strokeStyle = '#92400E'
    ctx.lineWidth = 9
    ctx.beginPath()
    ctx.ellipse(forehead.x, forehead.y - h*0.015, w*0.4, h*0.05, 0, Math.PI * 0.92, Math.PI * 0.08, true)
    ctx.stroke()
    // 主金环渐变
    const ringGrad = ctx.createLinearGradient(forehead.x - w*0.4, forehead.y, forehead.x + w*0.4, forehead.y)
    ringGrad.addColorStop(0, '#FCD34D')
    ringGrad.addColorStop(0.2, '#FEF3C7')
    ringGrad.addColorStop(0.4, '#FCD34D')
    ringGrad.addColorStop(0.6, '#FEF3C7')
    ringGrad.addColorStop(0.8, '#FCD34D')
    ringGrad.addColorStop(1, '#D97706')
    ctx.strokeStyle = ringGrad
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.ellipse(forehead.x, forehead.y - h*0.015, w*0.4, h*0.05, 0, Math.PI * 0.92, Math.PI * 0.08, true)
    ctx.stroke()
    // 金环装饰宝石
    ctx.fillStyle = '#DC2626'
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI + (i - 3) * 0.2
      const px = forehead.x + Math.cos(angle) * w * 0.38
      const py = forehead.y - h*0.015 + Math.sin(angle) * h * 0.045
      ctx.beginPath()
      ctx.arc(px, py, w*0.018, 0, Math.PI * 2)
      ctx.fill()
    }
    // 宝石高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    for (let i = 0; i < 7; i++) {
      const angle = Math.PI + (i - 3) * 0.2
      const px = forehead.x + Math.cos(angle) * w * 0.38 - w*0.005
      const py = forehead.y - h*0.015 + Math.sin(angle) * h * 0.045 - h*0.005
      ctx.beginPath()
      ctx.arc(px, py, w*0.006, 0, Math.PI * 2)
      ctx.fill()
    }

    // 第三层：桃心脸（猴脸特征）
    const heartGrad = ctx.createRadialGradient(forehead.x, forehead.y + h*0.1, 0, forehead.x, forehead.y + h*0.1, w*0.22)
    heartGrad.addColorStop(0, 'rgba(252, 165, 165, 0.95)')
    heartGrad.addColorStop(0.4, 'rgba(248, 113, 113, 0.9)')
    heartGrad.addColorStop(0.7, 'rgba(220, 38, 38, 0.85)')
    heartGrad.addColorStop(1, 'rgba(185, 28, 28, 0.7)')
    ctx.fillStyle = heartGrad
    ctx.beginPath()
    ctx.moveTo(forehead.x, forehead.y + h*0.04)
    ctx.bezierCurveTo(forehead.x - w*0.1, forehead.y + h*0.02, forehead.x - w*0.2, forehead.y + h*0.08, forehead.x, forehead.y + h*0.2)
    ctx.bezierCurveTo(forehead.x + w*0.2, forehead.y + h*0.08, forehead.x + w*0.1, forehead.y + h*0.02, forehead.x, forehead.y + h*0.04)
    ctx.fill()
    // 桃心边缘
    ctx.strokeStyle = 'rgba(127, 29, 29, 0.8)'
    ctx.lineWidth = 2
    ctx.stroke()
    // 桃心高光
    ctx.fillStyle = 'rgba(255, 200, 200, 0.4)'
    ctx.beginPath()
    ctx.ellipse(forehead.x - w*0.05, forehead.y + h*0.08, w*0.04, h*0.025, -0.3, 0, Math.PI * 2)
    ctx.fill()

    // 第四层：火眼金睛（多层光效）
    // 眼眶金色光晕
    const eyeGlow = ctx.createRadialGradient(leftEye.x, leftEye.y, 0, leftEye.x, leftEye.y, w*0.13)
    eyeGlow.addColorStop(0, 'rgba(253, 224, 71, 0.85)')
    eyeGlow.addColorStop(0.5, 'rgba(252, 211, 77, 0.5)')
    eyeGlow.addColorStop(1, 'rgba(252, 211, 77, 0)')
    ctx.fillStyle = eyeGlow
    ctx.beginPath()
    ctx.ellipse(leftEye.x, leftEye.y, w*0.13, h*0.055, -0.1, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(rightEye.x, rightEye.y, w*0.13, h*0.055, 0.1, 0, Math.PI * 2)
    ctx.fill()
    // 红色眼睛填充
    const eyeRedGrad = ctx.createRadialGradient(leftEye.x, leftEye.y, 0, leftEye.x, leftEye.y, w*0.08)
    eyeRedGrad.addColorStop(0, 'rgba(248, 113, 113, 0.95)')
    eyeRedGrad.addColorStop(0.6, 'rgba(220, 38, 38, 0.9)')
    eyeRedGrad.addColorStop(1, 'rgba(185, 28, 28, 0.85)')
    ctx.fillStyle = eyeRedGrad
    ctx.beginPath()
    ctx.ellipse(leftEye.x, leftEye.y, w*0.075, h*0.03, -0.12, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(rightEye.x, rightEye.y, w*0.075, h*0.03, 0.12, 0, Math.PI * 2)
    ctx.fill()
    // 金色眼眶
    ctx.strokeStyle = '#FCD34D'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(leftEye.x, leftEye.y, w*0.09, h*0.038, -0.12, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(rightEye.x, rightEye.y, w*0.09, h*0.038, 0.12, 0, Math.PI * 2)
    ctx.stroke()
    // 眼睛高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
    ctx.beginPath()
    ctx.arc(leftEye.x - w*0.02, leftEye.y - h*0.008, w*0.015, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(rightEye.x - w*0.02, rightEye.y - h*0.008, w*0.015, 0, Math.PI * 2)
    ctx.fill()

    // 第五层：猴嘴
    ctx.fillStyle = 'rgba(180, 83, 9, 0.8)'
    ctx.beginPath()
    ctx.ellipse(nose.x, nose.y + h*0.08, w*0.06, h*0.025, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#78350F'
    ctx.lineWidth = 1.5
    ctx.stroke()

    // 第六层：面部毛发纹理
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)'
    ctx.lineWidth = 1
    // 脸颊毛发纹
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(leftEye.x - w*0.12, leftEye.y + h*0.04 + i*h*0.025)
      ctx.quadraticCurveTo(leftEye.x - w*0.18, leftEye.y + h*0.06 + i*h*0.025, leftEye.x - w*0.2, leftEye.y + h*0.05 + i*h*0.025)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(rightEye.x + w*0.12, rightEye.y + h*0.04 + i*h*0.025)
      ctx.quadraticCurveTo(rightEye.x + w*0.18, rightEye.y + h*0.06 + i*h*0.025, rightEye.x + w*0.2, rightEye.y + h*0.05 + i*h*0.025)
      ctx.stroke()
    }
  }

  // 包拯黑脸 - 超精细版
  const drawBaoZhengMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    leftEye: {x: number, y: number},
    rightEye: {x: number, y: number},
    nose: {x: number, y: number},
    forehead: {x: number, y: number}
  ) => {
    // 第一层：黑色底色（庄严质感）
    const baseGrad = ctx.createRadialGradient(x, y - h*0.05, 0, x, y, h*0.6)
    baseGrad.addColorStop(0, 'rgba(30, 30, 30, 0.92)')
    baseGrad.addColorStop(0.4, 'rgba(20, 20, 20, 0.88)')
    baseGrad.addColorStop(0.7, 'rgba(10, 10, 10, 0.82)')
    baseGrad.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
    ctx.fillStyle = baseGrad
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.52, h*0.54, 0, 0, Math.PI * 2)
    ctx.fill()

    // 第二层：月牙印记（包拯标志性特征）
    // 月牙主体
    const moonGrad = ctx.createRadialGradient(forehead.x + w*0.04, forehead.y + h*0.02, 0, forehead.x + w*0.04, forehead.y + h*0.02, w*0.1)
    moonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
    moonGrad.addColorStop(0.6, 'rgba(250, 250, 250, 0.95)')
    moonGrad.addColorStop(1, 'rgba(230, 230, 230, 0.85)')
    ctx.fillStyle = moonGrad
    ctx.beginPath()
    ctx.arc(forehead.x + w*0.04, forehead.y + h*0.025, w*0.085, Math.PI * 0.65, Math.PI * 2.35)
    ctx.arc(forehead.x + w*0.075, forehead.y + h*0.025, w*0.055, Math.PI * 2.35, Math.PI * 0.65, true)
    ctx.fill()
    // 月牙描边
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.8)'
    ctx.lineWidth = 1.5
    ctx.stroke()
    // 月牙高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(forehead.x + w*0.02, forehead.y + h*0.01, w*0.02, 0, Math.PI * 2)
    ctx.fill()

    // 第三层：白色粗眉（正义凛然）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
    // 左眉
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.15, leftEye.y - h*0.035)
    ctx.bezierCurveTo(leftEye.x - w*0.08, leftEye.y - h*0.1, leftEye.x + w*0.02, leftEye.y - h*0.09, leftEye.x + w*0.08, leftEye.y - h*0.03)
    ctx.bezierCurveTo(leftEye.x + w*0.02, leftEye.y - h*0.05, leftEye.x - w*0.06, leftEye.y - h*0.05, leftEye.x - w*0.15, leftEye.y - h*0.035)
    ctx.fill()
    // 右眉
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.15, rightEye.y - h*0.035)
    ctx.bezierCurveTo(rightEye.x + w*0.08, rightEye.y - h*0.1, rightEye.x - w*0.02, rightEye.y - h*0.09, rightEye.x - w*0.08, rightEye.y - h*0.03)
    ctx.bezierCurveTo(rightEye.x - w*0.02, rightEye.y - h*0.05, rightEye.x + w*0.06, rightEye.y - h*0.05, rightEye.x + w*0.15, rightEye.y - h*0.035)
    ctx.fill()

    // 第四层：眼睛轮廓
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)'
    ctx.lineWidth = 2.5
    // 左眼
    ctx.beginPath()
    ctx.moveTo(leftEye.x - w*0.08, leftEye.y)
    ctx.quadraticCurveTo(leftEye.x, leftEye.y - h*0.02, leftEye.x + w*0.08, leftEye.y)
    ctx.quadraticCurveTo(leftEye.x, leftEye.y + h*0.015, leftEye.x - w*0.08, leftEye.y)
    ctx.stroke()
    // 右眼
    ctx.beginPath()
    ctx.moveTo(rightEye.x + w*0.08, rightEye.y)
    ctx.quadraticCurveTo(rightEye.x, rightEye.y - h*0.02, rightEye.x - w*0.08, rightEye.y)
    ctx.quadraticCurveTo(rightEye.x, rightEye.y + h*0.015, rightEye.x + w*0.08, rightEye.y)
    ctx.stroke()

    // 第五层：鼻纹
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.lineWidth = 3
    ctx.lineCap = 'round'
    ctx.beginPath()
    ctx.moveTo(nose.x, forehead.y + h*0.1)
    ctx.lineTo(nose.x, nose.y)
    ctx.stroke()

    // 第六层：金色边框装饰
    const goldBorderGrad = ctx.createLinearGradient(x - w*0.5, y, x + w*0.5, y)
    goldBorderGrad.addColorStop(0, '#D97706')
    goldBorderGrad.addColorStop(0.3, '#FCD34D')
    goldBorderGrad.addColorStop(0.5, '#FEF3C7')
    goldBorderGrad.addColorStop(0.7, '#FCD34D')
    goldBorderGrad.addColorStop(1, '#D97706')
    ctx.strokeStyle = goldBorderGrad
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(x, y, w*0.5, h*0.52, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  // 丑角 - 超精细版
  const drawClownMaskAdvanced = (
    ctx: CanvasRenderingContext2D,
    x: number, y: number, w: number, h: number,
    nose: {x: number, y: number}
  ) => {
    // 第一层：豆腐块白（丑角核心标志）
    // 白色填充渐变
    const blockGrad = ctx.createRadialGradient(nose.x, nose.y - h*0.03, 0, nose.x, nose.y - h*0.03, w*0.15)
    blockGrad.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
    blockGrad.addColorStop(0.7, 'rgba(250, 250, 250, 0.95)')
    blockGrad.addColorStop(1, 'rgba(240, 240, 240, 0.9)')
    ctx.fillStyle = blockGrad
    ctx.beginPath()
    // 圆角菱形豆腐块
    ctx.moveTo(nose.x, nose.y - h*0.14)
    ctx.quadraticCurveTo(nose.x + w*0.06, nose.y - h*0.1, nose.x + w*0.13, nose.y - h*0.02)
    ctx.quadraticCurveTo(nose.x + w*0.1, nose.y + h*0.04, nose.x, nose.y + h*0.07)
    ctx.quadraticCurveTo(nose.x - w*0.1, nose.y + h*0.04, nose.x - w*0.13, nose.y - h*0.02)
    ctx.quadraticCurveTo(nose.x - w*0.06, nose.y - h*0.1, nose.x, nose.y - h*0.14)
    ctx.fill()

    // 第二层：黑色描边
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.stroke()

    // 第三层：小红点（鼻尖装饰）
    const redDotGrad = ctx.createRadialGradient(nose.x, nose.y - h*0.04, 0, nose.x, nose.y - h*0.04, w*0.03)
    redDotGrad.addColorStop(0, '#EF4444')
    redDotGrad.addColorStop(0.5, '#DC2626')
    redDotGrad.addColorStop(1, '#B91C1C')
    ctx.fillStyle = redDotGrad
    ctx.beginPath()
    ctx.arc(nose.x, nose.y - h*0.04, w*0.025, 0, Math.PI * 2)
    ctx.fill()
    // 红点高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.arc(nose.x - w*0.008, nose.y - h*0.048, w*0.008, 0, Math.PI * 2)
    ctx.fill()

    // 第四层：眼角皱纹（诙谐表情）
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.lineWidth = 1.5
    // 左眼角
    ctx.beginPath()
    ctx.moveTo(x - w*0.18, y - h*0.08)
    ctx.lineTo(x - w*0.22, y - h*0.1)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x - w*0.18, y - h*0.06)
    ctx.lineTo(x - w*0.21, y - h*0.07)
    ctx.stroke()
    // 右眼角
    ctx.beginPath()
    ctx.moveTo(x + w*0.18, y - h*0.08)
    ctx.lineTo(x + w*0.22, y - h*0.1)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w*0.18, y - h*0.06)
    ctx.lineTo(x + w*0.21, y - h*0.07)
    ctx.stroke()

    // 第五层：豆腐块内装饰线
    ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.05, nose.y - h*0.08)
    ctx.lineTo(nose.x + w*0.05, nose.y - h*0.08)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(nose.x - w*0.03, nose.y + h*0.02)
    ctx.lineTo(nose.x + w*0.03, nose.y + h*0.02)
    ctx.stroke()
  }

  // 关公红脸
  const drawGuanGongMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 红色底色
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2)
    ctx.fill()

    // 眉毛
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 8
    ctx.beginPath()
    ctx.moveTo(x - w/3, y - h/4)
    ctx.quadraticCurveTo(x - w/6, y - h/3, x - w/10, y - h/4)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w/3, y - h/4)
    ctx.quadraticCurveTo(x + w/6, y - h/3, x + w/10, y - h/4)
    ctx.stroke()

    // 眼睛轮廓
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.ellipse(x - w/5, y - h/8, w/10, h/20, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.ellipse(x + w/5, y - h/8, w/10, h/20, 0, 0, Math.PI * 2)
    ctx.stroke()

    // 胡须装饰
    ctx.strokeStyle = '#991B1B'
    ctx.lineWidth = 4
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath()
      ctx.moveTo(x + i * 15, y + h/6)
      ctx.lineTo(x + i * 20, y + h/3)
      ctx.stroke()
    }
  }

  // 曹操白脸
  const drawCaoCaoMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 白色底色
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2)
    ctx.fill()

    // 眉心纹
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(x, y - h/3)
    ctx.lineTo(x, y - h/6)
    ctx.stroke()

    // 倒八字眉
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 6
    ctx.beginPath()
    ctx.moveTo(x - w/10, y - h/4)
    ctx.lineTo(x - w/3, y - h/5)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w/10, y - h/4)
    ctx.lineTo(x + w/3, y - h/5)
    ctx.stroke()

    // 眼角纹
    ctx.strokeStyle = '#1E40AF'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x - w/4, y - h/10)
    ctx.lineTo(x - w/3, y - h/8)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x + w/4, y - h/10)
    ctx.lineTo(x + w/3, y - h/8)
    ctx.stroke()
  }

  // 张飞黑脸
  const drawZhangFeiMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 黑色底色
    ctx.fillStyle = '#1a1a1a'
    ctx.beginPath()
    ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2)
    ctx.fill()

    // 红色蝴蝶眉
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.moveTo(x, y - h/4)
    ctx.quadraticCurveTo(x - w/4, y - h/2, x - w/3, y - h/5)
    ctx.quadraticCurveTo(x - w/6, y - h/4, x, y - h/4)
    ctx.fill()
    ctx.beginPath()
    ctx.moveTo(x, y - h/4)
    ctx.quadraticCurveTo(x + w/4, y - h/2, x + w/3, y - h/5)
    ctx.quadraticCurveTo(x + w/6, y - h/4, x, y - h/4)
    ctx.fill()

    // 白色眼周
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.ellipse(x - w/5, y - h/10, w/8, h/15, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + w/5, y - h/10, w/8, h/15, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 孙悟空金脸
  const drawWukongMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 金色底色
    ctx.fillStyle = '#F59E0B'
    ctx.beginPath()
    ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2)
    ctx.fill()

    // 红色心形脸
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.moveTo(x, y + h/6)
    ctx.bezierCurveTo(x - w/4, y - h/6, x - w/3, y - h/3, x, y - h/4)
    ctx.bezierCurveTo(x + w/3, y - h/3, x + w/4, y - h/6, x, y + h/6)
    ctx.fill()

    // 白色眼周
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.ellipse(x - w/6, y - h/10, w/10, h/12, -0.2, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + w/6, y - h/10, w/10, h/12, 0.2, 0, Math.PI * 2)
    ctx.fill()

    // 金色额纹
    ctx.strokeStyle = '#92400E'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x, y - h/3, w/6, Math.PI, 0)
    ctx.stroke()
  }

  // 包拯黑脸
  const drawBaoZhengMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 黑色底色
    ctx.fillStyle = '#000000'
    ctx.beginPath()
    ctx.ellipse(x, y, w/2, h/2, 0, 0, Math.PI * 2)
    ctx.fill()

    // 白色月牙（额头标志）
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.arc(x, y - h/4, w/8, Math.PI * 0.2, Math.PI * 0.8)
    ctx.arc(x, y - h/4 - 5, w/10, Math.PI * 0.8, Math.PI * 0.2, true)
    ctx.fill()

    // 白色眼周
    ctx.fillStyle = '#FFFFFF'
    ctx.beginPath()
    ctx.ellipse(x - w/5, y - h/10, w/10, h/20, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + w/5, y - h/10, w/10, h/20, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // 丑角
  const drawClownMask = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    // 白色豆腐块（鼻梁）
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(x - w/10, y - h/6, w/5, h/4)
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.strokeRect(x - w/10, y - h/6, w/5, h/4)

    // 红色眼周
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.ellipse(x - w/5, y - h/8, w/12, h/20, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(x + w/5, y - h/8, w/12, h/20, 0, 0, Math.PI * 2)
    ctx.fill()

    // 笑纹
    ctx.strokeStyle = '#000'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y + h/10, w/4, 0.1 * Math.PI, 0.9 * Math.PI)
    ctx.stroke()
  }

  // 拍照
  const capturePhoto = () => {
    if (!canvasRef.current || !overlayRef.current) return

    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = canvasRef.current.width
    tempCanvas.height = canvasRef.current.height
    const tempCtx = tempCanvas.getContext('2d')
    
    if (tempCtx) {
      tempCtx.drawImage(canvasRef.current, 0, 0)
      tempCtx.drawImage(overlayRef.current, 0, 0)
      setCapturedImage(tempCanvas.toDataURL('image/png'))
    }
  }

  // 下载照片
  const downloadPhoto = () => {
    if (!capturedImage) return
    const link = document.createElement('a')
    link.download = `qinqiang-${selectedMask.name}-${Date.now()}.png`
    link.href = capturedImage
    link.click()
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-red-950 via-red-900 to-stone-900">
      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-20">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black/40 backdrop-blur rounded-full text-red-100 hover:bg-black/60 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回
        </Link>
        
        <h1 className="text-xl font-bold text-red-100 flex items-center gap-2">
          <Palette className="w-5 h-5" />
          秦腔脸谱
        </h1>

        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-2 bg-black/40 backdrop-blur rounded-full text-red-100 hover:bg-black/60 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* 相机预览区 */}
      <div className="absolute inset-0 flex items-center justify-center pt-16 pb-40">
        <div className="relative">
          {/* 视频/画布容器 */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-red-800/50">
            <video
              ref={videoRef}
              className="hidden"
              width={640}
              height={480}
              playsInline
              muted
            />
            <canvas
              ref={canvasRef}
              width={640}
              height={480}
              className={`${isStarted ? 'block' : 'hidden'}`}
            />
            <canvas
              ref={overlayRef}
              width={640}
              height={480}
              className="absolute inset-0"
              style={{ mixBlendMode: 'multiply' }}
            />
            
            {/* 人脸检测指示 */}
            {isStarted && (
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm ${faceDetected ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                <Eye className="w-4 h-4 inline mr-1" />
                {faceDetected ? '脸谱已应用' : '请将脸部对准画面'}
              </div>
            )}
          </div>

          {/* 强度调节 */}
          {isStarted && (
            <div className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
              <span className="text-red-200 text-xs">浓度</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={maskIntensity}
                onChange={(e) => setMaskIntensity(parseFloat(e.target.value))}
                className="w-24 -rotate-90 origin-center"
              />
              <span className="text-red-200 text-xs">{Math.round(maskIntensity * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* 脸谱选择 */}
      <div className="absolute bottom-32 left-0 right-0 z-20">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {FACE_MASKS.map((mask) => (
              <button
                key={mask.id}
                onClick={() => {
                  setSelectedMask(mask)
                  setUseCustomMask(false)
                }}
                className={`
                  shrink-0 flex flex-col items-center p-3 rounded-xl transition-all
                  ${selectedMask.id === mask.id && !useCustomMask
                    ? 'bg-red-600 scale-110' 
                    : 'bg-black/40 hover:bg-black/60'
                  }
                `}
              >
                {/* 脸谱颜色预览 */}
                <div 
                  className="w-12 h-12 rounded-full mb-2 border-2 border-white/30"
                  style={{
                    background: `linear-gradient(135deg, ${mask.colors[0]}, ${mask.colors[1]}, ${mask.colors[2]})`
                  }}
                />
                <span className="text-white text-sm font-medium">{mask.name}</span>
                <span className="text-white/60 text-xs">{mask.role}</span>
              </button>
            ))}
            
            {/* 上传自定义脸谱按钮 */}
            <label
              className={`
                shrink-0 flex flex-col items-center p-3 rounded-xl transition-all cursor-pointer
                ${useCustomMask 
                  ? 'bg-amber-600 scale-110' 
                  : 'bg-black/40 hover:bg-black/60'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMaskUpload}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-full mb-2 border-2 border-dashed border-white/50 flex items-center justify-center">
                {customMaskImage ? (
                  <img 
                    src={customMaskImage.src} 
                    alt="自定义脸谱" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-white text-2xl">+</span>
                )}
              </div>
              <span className="text-white text-sm font-medium">上传</span>
              <span className="text-white/60 text-xs">脸谱</span>
            </label>
          </div>
          
          {/* 提示文字 */}
          {useCustomMask && customMaskImage && (
            <p className="text-center text-amber-200 text-sm mt-2">
              正在使用自定义脸谱图片 · 
              <button 
                onClick={() => setUseCustomMask(false)}
                className="underline hover:text-white"
              >
                切换回预设
              </button>
            </p>
          )}
        </div>
      </div>

      {/* 底部操作栏 */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-6">
          {isStarted ? (
            <>
              <button
                onClick={() => {
                  setIsStarted(false)
                  if (videoRef.current?.srcObject) {
                    (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop())
                  }
                }}
                className="p-3 bg-black/40 backdrop-blur rounded-full text-red-100 hover:bg-black/60 transition-colors"
              >
                <RotateCcw className="w-6 h-6" />
              </button>
              
              <button
                onClick={capturePhoto}
                className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-red-500/30 transition-all"
              >
                <Camera className="w-8 h-8" />
              </button>
              
              <button
                onClick={() => {/* 分享功能 */}}
                className="p-3 bg-black/40 backdrop-blur rounded-full text-red-100 hover:bg-black/60 transition-colors"
              >
                <Share2 className="w-6 h-6" />
              </button>
            </>
          ) : (
            <button
              onClick={startCamera}
              disabled={isLoading}
              className="px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-red-500/30 transition-all flex items-center gap-3 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  初始化中...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  开启相机
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* 当前脸谱信息 */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 w-72 bg-black/80 backdrop-blur rounded-2xl p-4 z-30"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-white">{selectedMask.name}</h3>
              <button onClick={() => setShowInfo(false)}>
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            <div className="flex gap-2 mb-3">
              {selectedMask.colors.map((color, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full border border-white/30"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              {selectedMask.description}
            </p>
            <div className="mt-3 pt-3 border-t border-white/10">
              <span className="text-red-400 text-sm">行当：{selectedMask.role}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 拍照预览 */}
      <AnimatePresence>
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-40 bg-black/80"
            onClick={() => setCapturedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-red-950 rounded-2xl p-4 max-w-lg"
            >
              <img src={capturedImage} alt="拍摄结果" className="rounded-xl mb-4" />
              <div className="flex gap-4">
                <button
                  onClick={downloadPhoto}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  保存照片
                </button>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl font-semibold"
                >
                  继续拍摄
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 装饰元素 */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-red-600/20 to-transparent rounded-br-full" />
      <div className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-tl from-red-600/20 to-transparent rounded-tl-full" />
    </div>
  )
}
