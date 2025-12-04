/**
 * 秦腔AR脸谱 - WebGL 3D纹理贴图版本
 * 使用 Three.js + MediaPipe FaceMesh 实现完美脸谱贴合
 */

import { useRef, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Camera,
  ChevronLeft,
  Download,
  Info,
  Palette,
  Eye,
  RotateCcw,
  Share2,
  X,
  Upload
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { FaceMesh } from '@mediapipe/face_mesh'
import { Camera as MPCamera } from '@mediapipe/camera_utils'
import * as THREE from 'three'

// 脸谱角色配置
interface FaceMaskConfig {
  id: string
  name: string
  role: '生' | '旦' | '净' | '丑'
  description: string
  colors: string[]
  patterns: string
}

const FACE_MASKS: FaceMaskConfig[] = [
  {
    id: 'guangong',
    name: '关公',
    role: '净',
    description: '红色忠义，蚕眉凤眼',
    colors: ['#DC2626', '#991B1B', '#000000'],
    patterns: 'red-loyal',
  },
  {
    id: 'caocao',
    name: '曹操',
    role: '净',
    description: '白脸奸诈，三角细眉',
    colors: ['#FFFFFF', '#374151', '#1F2937'],
    patterns: 'white-cunning',
  },
  {
    id: 'zhangfei',
    name: '张飞',
    role: '净',
    description: '黑脸勇猛，蝴蝶眉',
    colors: ['#1F2937', '#111827', '#DC2626'],
    patterns: 'black-brave',
  },
  {
    id: 'wukong',
    name: '孙悟空',
    role: '净',
    description: '金脸神通，火眼金睛',
    colors: ['#F59E0B', '#B45309', '#DC2626'],
    patterns: 'gold-magic',
  },
  {
    id: 'baozheng',
    name: '包拯',
    role: '净',
    description: '黑脸正义，月牙印记',
    colors: ['#1F2937', '#111827', '#FBBF24'],
    patterns: 'black-justice',
  },
  {
    id: 'clown',
    name: '丑角',
    role: '丑',
    description: '豆腐块白，象征诙谐滑稽',
    colors: ['#FFFFFF', '#000000', '#DC2626'],
    patterns: 'clown',
  },
]

// FaceMesh 三角剖分索引 - 面部核心区域
const FACE_TRIANGLES = [
  // 脸部轮廓三角形
  10, 338, 297, 338, 297, 332, 332, 284, 251, 251, 389, 356,
  356, 454, 323, 323, 361, 288, 288, 397, 365, 365, 379, 378,
  378, 400, 377, 377, 152, 148, 148, 176, 149, 149, 150, 136,
  136, 172, 58, 58, 132, 93, 93, 234, 127, 127, 162, 21,
  21, 54, 103, 103, 67, 109, 109, 10, 338,
  
  // 内部填充三角形
  10, 109, 67, 10, 67, 103, 10, 103, 54, 10, 54, 21,
  10, 21, 162, 10, 162, 127, 10, 127, 234, 10, 234, 93,
  10, 93, 132, 10, 132, 58, 10, 58, 172, 10, 172, 136,
  10, 136, 150, 10, 150, 149, 10, 149, 176, 10, 176, 148,
  10, 148, 152, 10, 152, 377, 10, 377, 400, 10, 400, 378,
  10, 378, 379, 10, 379, 365, 10, 365, 397, 10, 397, 288,
  10, 288, 361, 10, 361, 323, 10, 323, 454, 10, 454, 356,
  10, 356, 389, 10, 389, 251, 10, 251, 284, 10, 284, 332,
  10, 332, 297, 10, 297, 338, 10, 338, 10,
  
  // 眼睛周围
  33, 246, 161, 161, 160, 159, 159, 158, 157, 157, 173, 133,
  133, 155, 154, 154, 153, 145, 145, 144, 163, 163, 7, 33,
  263, 466, 388, 388, 387, 386, 386, 385, 384, 384, 398, 362,
  362, 382, 381, 381, 380, 374, 374, 373, 390, 390, 249, 263,
  
  // 鼻子
  1, 2, 4, 4, 5, 195, 195, 5, 4, 1, 44, 45,
  1, 274, 275, 2, 98, 97, 2, 326, 327,
  
  // 嘴巴
  0, 267, 13, 13, 312, 311, 311, 310, 415, 415, 308, 324,
  324, 318, 402, 402, 317, 14, 14, 87, 178, 178, 88, 95,
  95, 78, 191, 191, 80, 81, 81, 82, 13, 0, 37, 39,
  39, 40, 185, 185, 61, 146, 146, 91, 181, 181, 84, 17,
  17, 314, 405, 405, 321, 375, 375, 291, 409, 409, 270, 269,
  269, 267, 0,
]

export default function QinqiangFaceMaskWebGL() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const threeCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [isStarted, setIsStarted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMask, setSelectedMask] = useState(FACE_MASKS[0])
  const [maskIntensity, setMaskIntensity] = useState(0.85)
  const [showInfo, setShowInfo] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [customMaskImage, setCustomMaskImage] = useState<HTMLImageElement | null>(null)
  const [useCustomMask, setUseCustomMask] = useState(false)
  
  // Three.js 相关引用
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const meshRef = useRef<THREE.Mesh | null>(null)
  const geometryRef = useRef<THREE.BufferGeometry | null>(null)
  const textureRef = useRef<THREE.Texture | null>(null)
  const landmarksRef = useRef<any[]>([])
  const animationRef = useRef<number>(0)
  
  // Refs for animation loop access
  const maskIntensityRef = useRef(0.85)
  const useCustomMaskRef = useRef(false)
  const customMaskImageRef = useRef<HTMLImageElement | null>(null)
  
  // Sync state to refs
  useEffect(() => {
    maskIntensityRef.current = maskIntensity
    useCustomMaskRef.current = useCustomMask
    customMaskImageRef.current = customMaskImage
  }, [maskIntensity, useCustomMask, customMaskImage])

  // 初始化 Three.js 场景
  const initThreeJS = useCallback(() => {
    if (!threeCanvasRef.current) return
    
    const width = 640
    const height = 480
    
    // 创建场景
    const scene = new THREE.Scene()
    sceneRef.current = scene
    
    // 创建正交相机（2D渲染）
    const camera = new THREE.OrthographicCamera(0, width, 0, height, 0.1, 1000)
    camera.position.z = 1
    cameraRef.current = camera
    
    // 创建渲染器
    const renderer = new THREE.WebGLRenderer({
      canvas: threeCanvasRef.current,
      alpha: true,
      antialias: true,
    })
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)
    rendererRef.current = renderer
    
    // 创建面部几何体
    const geometry = new THREE.BufferGeometry()
    geometryRef.current = geometry
    
    // 初始化顶点数组（468个关键点 * 3个坐标）
    const vertices = new Float32Array(468 * 3)
    const uvs = new Float32Array(468 * 2)
    
    // 初始化UV坐标
    for (let i = 0; i < 468; i++) {
      uvs[i * 2] = 0.5
      uvs[i * 2 + 1] = 0.5
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3))
    geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geometry.setIndex(FACE_TRIANGLES)
    
    // 创建材质
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: maskIntensityRef.current,
      side: THREE.DoubleSide,
      depthTest: false,
    })
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, material)
    meshRef.current = mesh
    scene.add(mesh)
    
  }, [])

  // 更新纹理
  const updateTexture = useCallback((img: HTMLImageElement) => {
    if (!meshRef.current) return
    
    // 创建新纹理
    const texture = new THREE.Texture(img)
    texture.needsUpdate = true
    texture.flipY = false
    textureRef.current = texture
    
    // 更新材质
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    material.map = texture
    material.needsUpdate = true
    
  }, [])

  // 更新面部网格
  const updateFaceMesh = useCallback((landmarks: any[]) => {
    if (!geometryRef.current || !meshRef.current) return
    
    const positions = geometryRef.current.attributes.position.array as Float32Array
    const uvs = geometryRef.current.attributes.uv.array as Float32Array
    
    const width = 640
    const height = 480
    
    // 计算人脸边界框
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i]
      const x = (1 - lm.x) * width  // 镜像
      const y = lm.y * height
      
      minX = Math.min(minX, x)
      maxX = Math.max(maxX, x)
      minY = Math.min(minY, y)
      maxY = Math.max(maxY, y)
    }
    
    // 扩展边界框
    const faceWidth = maxX - minX
    const faceHeight = maxY - minY
    const expandX = faceWidth * 0.15
    const expandY = faceHeight * 0.1
    minX -= expandX
    maxX += expandX
    minY -= expandY
    maxY += expandY
    
    // 更新顶点位置和UV
    for (let i = 0; i < landmarks.length; i++) {
      const lm = landmarks[i]
      const x = (1 - lm.x) * width  // 镜像
      const y = lm.y * height
      const z = -lm.z * 100  // 深度
      
      // 更新位置
      positions[i * 3] = x
      positions[i * 3 + 1] = height - y  // 翻转Y轴
      positions[i * 3 + 2] = z
      
      // 计算UV坐标（归一化到脸部边界框）
      uvs[i * 2] = (x - minX) / (maxX - minX)
      uvs[i * 2 + 1] = 1 - (y - minY) / (maxY - minY)
    }
    
    geometryRef.current.attributes.position.needsUpdate = true
    geometryRef.current.attributes.uv.needsUpdate = true
    geometryRef.current.computeVertexNormals()
    
    // 更新透明度
    const material = meshRef.current.material as THREE.MeshBasicMaterial
    material.opacity = maskIntensityRef.current
    
  }, [])

  // 渲染循环
  const renderLoop = useCallback(() => {
    if (!rendererRef.current || !sceneRef.current || !cameraRef.current) {
      animationRef.current = requestAnimationFrame(renderLoop)
      return
    }
    
    // 更新面部网格
    if (landmarksRef.current.length > 0) {
      updateFaceMesh(landmarksRef.current)
    }
    
    // 渲染
    rendererRef.current.render(sceneRef.current, cameraRef.current)
    
    animationRef.current = requestAnimationFrame(renderLoop)
  }, [updateFaceMesh])

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
        updateTexture(img)
      }
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  }, [updateTexture])

  // 创建默认脸谱纹理
  const createDefaultTexture = useCallback((mask: FaceMaskConfig) => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 绘制脸谱图案
    const gradient = ctx.createRadialGradient(256, 256, 0, 256, 256, 256)
    gradient.addColorStop(0, mask.colors[0])
    gradient.addColorStop(0.5, mask.colors[1])
    gradient.addColorStop(1, mask.colors[2])
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 512)
    
    // 添加脸谱特征
    ctx.fillStyle = '#000000'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 3
    
    // 眉毛
    ctx.beginPath()
    ctx.moveTo(100, 180)
    ctx.quadraticCurveTo(180, 120, 230, 180)
    ctx.stroke()
    
    ctx.beginPath()
    ctx.moveTo(412, 180)
    ctx.quadraticCurveTo(332, 120, 282, 180)
    ctx.stroke()
    
    // 眼睛
    ctx.beginPath()
    ctx.ellipse(170, 220, 40, 25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.beginPath()
    ctx.ellipse(342, 220, 40, 25, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 鼻子
    ctx.beginPath()
    ctx.moveTo(256, 200)
    ctx.lineTo(240, 320)
    ctx.lineTo(256, 340)
    ctx.lineTo(272, 320)
    ctx.closePath()
    ctx.fill()
    
    // 嘴巴
    ctx.fillStyle = '#DC2626'
    ctx.beginPath()
    ctx.ellipse(256, 400, 60, 30, 0, 0, Math.PI * 2)
    ctx.fill()
    
    // 创建纹理
    const img = new Image()
    img.onload = () => {
      updateTexture(img)
    }
    img.src = canvas.toDataURL()
    
  }, [updateTexture])

  // 启动相机
  const startCamera = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return
    
    setIsLoading(true)
    
    try {
      // 初始化 Three.js
      initThreeJS()
      
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
      
      faceMesh.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          landmarksRef.current = results.multiFaceLandmarks[0]
          setFaceDetected(true)
        } else {
          landmarksRef.current = []
          setFaceDetected(false)
        }
        
        // 绘制视频帧
        const ctx = canvasRef.current?.getContext('2d')
        if (ctx && canvasRef.current && videoRef.current) {
          ctx.save()
          ctx.scale(-1, 1)
          ctx.drawImage(videoRef.current, -canvasRef.current.width, 0)
          ctx.restore()
        }
      })
      
      // 启动相机
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
      
      // 创建默认纹理
      createDefaultTexture(selectedMask)
      
      // 开始渲染循环
      renderLoop()
      
    } catch (error) {
      console.error('Camera access denied:', error)
      setIsLoading(false)
    }
  }, [initThreeJS, createDefaultTexture, renderLoop, selectedMask])

  // 切换脸谱时更新纹理
  useEffect(() => {
    if (isStarted && !useCustomMask) {
      createDefaultTexture(selectedMask)
    }
  }, [selectedMask, isStarted, useCustomMask, createDefaultTexture])

  // 拍照
  const capturePhoto = () => {
    if (!canvasRef.current || !threeCanvasRef.current) return
    
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 640
    tempCanvas.height = 480
    const tempCtx = tempCanvas.getContext('2d')
    
    if (tempCtx) {
      tempCtx.drawImage(canvasRef.current, 0, 0)
      tempCtx.drawImage(threeCanvasRef.current, 0, 0)
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

  // 清理
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      if (rendererRef.current) {
        rendererRef.current.dispose()
      }
    }
  }, [])

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
          秦腔脸谱 · WebGL
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
            {/* Three.js WebGL 画布 */}
            <canvas
              ref={threeCanvasRef}
              width={640}
              height={480}
              className="absolute inset-0 pointer-events-none"
              style={{ mixBlendMode: 'normal' }}
            />
            
            {/* 未启动时的占位 */}
            {!isStarted && !isLoading && (
              <div className="w-[640px] h-[480px] bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">点击下方按钮开启相机</p>
                  <p className="text-sm text-white/60 mt-2">WebGL 3D渲染 · 完美贴合</p>
                </div>
              </div>
            )}
            
            {/* 加载中 */}
            {isLoading && (
              <div className="w-[640px] h-[480px] bg-black/50 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p>正在初始化 WebGL 渲染器...</p>
                </div>
              </div>
            )}
            
            {/* 人脸检测指示 */}
            {isStarted && (
              <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-sm ${faceDetected ? 'bg-green-500/80 text-white' : 'bg-red-500/80 text-white'}`}>
                <Eye className="w-4 h-4 inline mr-1" />
                {faceDetected ? '3D脸谱已贴合' : '请将脸部对准画面'}
              </div>
            )}
            
            {/* WebGL 标识 */}
            {isStarted && (
              <div className="absolute top-4 right-4 px-2 py-1 rounded bg-purple-600/80 text-white text-xs">
                WebGL 3D
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
                step="0.05"
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
              <div className="w-12 h-12 rounded-full mb-2 border-2 border-dashed border-white/50 flex items-center justify-center overflow-hidden">
                {customMaskImage ? (
                  <img 
                    src={customMaskImage.src} 
                    alt="自定义脸谱" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-white/70" />
                )}
              </div>
              <span className="text-white text-sm font-medium">上传</span>
              <span className="text-white/60 text-xs">PNG</span>
            </label>
          </div>
          
          {/* 提示文字 */}
          {useCustomMask && customMaskImage && (
            <p className="text-center text-amber-200 text-sm mt-2">
              正在使用自定义脸谱 · 
              <button 
                onClick={() => {
                  setUseCustomMask(false)
                  createDefaultTexture(selectedMask)
                }}
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
                  if (animationRef.current) {
                    cancelAnimationFrame(animationRef.current)
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
                  初始化WebGL...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6" />
                  开启相机 (WebGL)
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
            <p className="text-white/80 text-sm mb-3">{selectedMask.description}</p>
            <div className="text-white/60 text-xs">
              <p>角色行当: {selectedMask.role}</p>
              <p className="mt-2 text-purple-300">
                🔮 WebGL 3D渲染
                <br/>
                使用 Three.js 进行 GPU 加速的 3D 纹理贴图，
                支持 468 个面部关键点的精确追踪和完美贴合。
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 拍照预览弹窗 */}
      <AnimatePresence>
        {capturedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              className="bg-stone-900 rounded-2xl p-4 max-w-lg"
            >
              <img 
                src={capturedImage} 
                alt="Captured" 
                className="rounded-xl mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={downloadPhoto}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 hover:bg-red-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  保存照片
                </button>
                <button
                  onClick={() => setCapturedImage(null)}
                  className="flex-1 py-3 bg-stone-700 text-white rounded-xl hover:bg-stone-600 transition-colors"
                >
                  继续拍摄
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
