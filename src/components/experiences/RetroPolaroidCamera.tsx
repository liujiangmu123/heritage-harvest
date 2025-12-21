/**
 * 复古拍立得相机组件 - 仿 bubbbly.com 风格
 * 包含：3D相机模型、照片堆叠、翻转动画、刮刮卡功能
 */

import { useState, useRef, useCallback, useEffect, useMemo, Suspense } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import * as THREE from 'three'
import { 
  Camera, 
  X, 
  Download, 
  RotateCcw,
  Sparkles,
  Leaf,
  Share2,
  RefreshCw,
  Heart
} from 'lucide-react'
import { 
  EcoScene, 
  PolaroidResult, 
  ECO_POLAROID_FILTER,
  getRandomEcoMessage,
  generateId
} from '@/types/eco'
import { useGreenPointsStore, addSharePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useArtworkStore } from '@/store/artworkStore'
import { ECO_LEVELS, CARBON_SAVINGS_CONFIG } from '@/types/eco'
import { cn } from '@/lib/utils'

const AUTO_WEAVING_FX_PHOTO_WIDTH = 320
const AUTO_WEAVING_FX_PHOTO_HEIGHT = 420

/** 场景配置 */
const SCENE_CONFIGS: Record<EcoScene, {
  name: string
  description: string
  bgGradient: string
  icon: string
  carbonSaving: number
  bgImage?: string
}> = {
  hani_terrace: {
    name: '哈尼梯田',
    description: '云雾缭绕的千年梯田',
    bgGradient: 'from-eco-400 via-bamboo-300 to-sky-400',
    icon: '🏔️',
    carbonSaving: CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving
  },
  tea_garden: {
    name: '生态茶园',
    description: '云雾山间的有机茶园',
    bgGradient: 'from-eco-500 via-eco-400 to-bamboo-300',
    icon: '🍵',
    carbonSaving: CARBON_SAVINGS_CONFIG.tea_ceremony.baseSaving
  },
  bamboo_forest: {
    name: '竹海深处',
    description: '翠竹摇曳的绿色海洋',
    bgGradient: 'from-bamboo-500 via-eco-400 to-bamboo-300',
    icon: '🎋',
    carbonSaving: CARBON_SAVINGS_CONFIG.bamboo_weaving.baseSaving
  },
  batik_workshop: {
    name: '蜡染工坊',
    description: '靛蓝飘香的传统工坊',
    bgGradient: 'from-blue-600 via-indigo-400 to-blue-300',
    icon: '🎨',
    carbonSaving: CARBON_SAVINGS_CONFIG.batik.baseSaving
  },
  paper_cutting: {
    name: '剪纸工坊',
    description: '红纸飞舞的艺术空间',
    bgGradient: 'from-heritage-500 via-primary-400 to-heritage-300',
    icon: '✂️',
    carbonSaving: CARBON_SAVINGS_CONFIG.paper_cutting.baseSaving
  },
  clay_studio: {
    name: '泥塑工坊',
    description: '黄土芬芳的创作天地',
    bgGradient: 'from-clay-500 via-terrace-400 to-clay-300',
    icon: '🏺',
    carbonSaving: CARBON_SAVINGS_CONFIG.clay_sculpture.baseSaving
  }
}

function AutoWeavingCaptureOverlay({
  result,
  coords,
  weavingDNA
}: {
  result: PolaroidResult
  coords: { fromX: number; fromY: number; toX: number; toY: number }
  weavingDNA?: WeavingDNAData
}) {
  const primary = weavingDNA?.colorScheme?.primary || '#8B5E34'
  const secondary = weavingDNA?.colorScheme?.secondary || '#D4A574'
  const accent = weavingDNA?.colorScheme?.accent || '#C4956A'

  return (
    <motion.div
      className="fixed inset-0 z-[60] pointer-events-none"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="absolute left-0 right-0 top-0 h-1/2 bg-black"
        initial={{ y: '-100%' }}
        animate={{ y: ['-100%', '0%', '-100%'] }}
        transition={{ duration: 0.65, times: [0, 0.25, 1], ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute left-0 right-0 bottom-0 h-1/2 bg-black"
        initial={{ y: '100%' }}
        animate={{ y: ['100%', '0%', '100%'] }}
        transition={{ duration: 0.65, times: [0, 0.25, 1], ease: 'easeInOut' }}
      />

      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 0.2, duration: 0.25, times: [0, 0.1, 1], ease: 'easeOut' }}
      />

      <motion.div
        className="absolute left-0 top-0"
        initial={{ x: coords.fromX, y: coords.fromY + 80, rotate: -10, opacity: 0, scale: 0.95 }}
        animate={{
          x: [coords.fromX, coords.fromX, coords.toX],
          y: [coords.fromY + 80, coords.fromY - 120, coords.toY],
          rotate: [-10, -10, 2],
          opacity: [0, 1, 1],
          scale: [0.95, 0.98, 1]
        }}
        transition={{ delay: 0.25, duration: 0.95, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <div
          className="w-80 bg-white p-1 pb-20 rounded-sm relative"
          style={{
            boxShadow: '0 30px 70px rgba(0,0,0,0.45)'
          }}
        >
          <div
            className="absolute inset-0 rounded-sm"
            style={{
              background: `
                repeating-linear-gradient(
                  0deg,
                  transparent,
                  transparent 2px,
                  ${primary}15 2px,
                  ${primary}15 4px
                ),
                repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 2px,
                  ${secondary}15 2px,
                  ${secondary}15 4px
                )
              `,
              border: `3px solid ${primary}`,
              borderRadius: '4px'
            }}
          />

          <div className="aspect-square overflow-hidden bg-gray-100 rounded m-1 relative">
            <img
              src={result.imageDataUrl}
              alt={result.sceneName}
              className="w-full h-full object-cover"
              style={
                result.imageDataUrl.startsWith('data:image')
                  ? {
                      transform: 'scale(1.25)',
                      transformOrigin: 'center',
                      objectPosition: '50% 35%'
                    }
                  : undefined
              }
            />

            <motion.div
              className="absolute inset-0 bg-neutral-900"
              initial={{ y: 0 }}
              animate={{ y: '-100%' }}
              transition={{ delay: 1.2, duration: 1.15, ease: 'easeOut' }}
            />

            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.15, duration: 0.6, ease: 'easeOut' }}
              style={{
                background: `radial-gradient(circle at 30% 20%, ${accent}22, transparent 55%), linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.25))`
              }}
            />
          </div>

          <div className="absolute bottom-3 left-3 right-3">
            <p className="text-gray-700 text-lg" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
              {weavingDNA?.uniqueTitle || result.sceneName}
            </p>
            <p className="text-xs text-gray-400">{result.date}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 生态寄语列表
const ECO_MESSAGES = [
  '每一次云游，都是对地球的温柔守护 🌍',
  '传承非遗，守护绿色家园 🌿',
  '低碳出行，从云游开始 ☁️',
  '文化与生态，和谐共生 🎋',
  '用心感受，用行动守护 💚',
  '千年智慧，绿色传承 🏔️',
  '每一份减碳，都是对未来的承诺 🌱',
  '探索乡村，发现生态之美 🦋'
]

// 编织DNA数据（从竹编体验传入）
interface WeavingDNAData {
  uniqueTitle?: string           // 独特称号
  craftLevel?: string            // 工艺等级
  productStyle?: string          // 成品样式
  smoothness?: number            // 平滑度
  creativity?: number            // 创意度
  persistence?: number           // 坚持度
  colorScheme?: {
    primary: string
    secondary: string
    accent: string
    highlight: string
  }
  patternName?: string           // 图案名称
  seed?: number                  // 种子码
}

interface RetroPolaroidCameraProps {
  onComplete?: (result: PolaroidResult) => void
  onClose?: () => void
  className?: string
  weavingDNA?: WeavingDNAData    // 编织DNA数据
}

// 迷你3D编织模型组件 - 用于拍立得照片正面
function MiniWeavingModel({ 
  colorScheme, 
  productShape 
}: { 
  colorScheme?: { primary: string; secondary: string; accent: string; highlight: string }
  productShape?: string 
}) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })
  
  const colors = colorScheme || { primary: '#8B5E34', secondary: '#D4A574', accent: '#C4956A', highlight: '#F5E6D3' }
  
  // 根据形状创建不同的3D模型
  const createShape = () => {
    switch (productShape) {
      case 'vase':
        return (
          <group>
            {/* 花瓶形状 */}
            {[...Array(20)].map((_, i) => {
              const t = i / 19
              const radius = 0.3 + Math.sin(t * Math.PI) * 0.4
              const y = t * 2 - 1
              return (
                <mesh key={i} position={[0, y, 0]} rotation={[0, i * 0.3, 0]}>
                  <torusGeometry args={[radius, 0.03, 8, 32]} />
                  <meshStandardMaterial 
                    color={i % 2 === 0 ? colors.primary : colors.secondary} 
                    roughness={0.6}
                  />
                </mesh>
              )
            })}
          </group>
        )
      case 'basket':
        return (
          <group>
            {/* 篮子形状 */}
            {[...Array(15)].map((_, i) => {
              const t = i / 14
              const radius = 0.4 + t * 0.3
              const y = t * 1.2 - 0.6
              return (
                <mesh key={i} position={[0, y, 0]} rotation={[0, i * 0.4, 0]}>
                  <torusGeometry args={[radius, 0.04, 8, 24]} />
                  <meshStandardMaterial 
                    color={i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent} 
                    roughness={0.5}
                  />
                </mesh>
              )
            })}
          </group>
        )
      default:
        return (
          <group>
            {/* 默认圆柱形状 */}
            {[...Array(18)].map((_, i) => {
              const t = i / 17
              const y = t * 2 - 1
              return (
                <mesh key={i} position={[0, y, 0]} rotation={[0, i * 0.35, 0]}>
                  <torusGeometry args={[0.5, 0.035, 8, 28]} />
                  <meshStandardMaterial 
                    color={i % 2 === 0 ? colors.primary : colors.secondary} 
                    roughness={0.55}
                  />
                </mesh>
              )
            })}
          </group>
        )
    }
  }
  
  return (
    <group ref={meshRef}>
      {createShape()}
      {/* 铁丝骨架 */}
      {[...Array(8)].map((_, i) => (
        <mesh key={`frame-${i}`} rotation={[0, (i * Math.PI) / 4, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 2.2, 8]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

// 迷你3D场景组件
function Mini3DScene({ 
  colorScheme, 
  productShape 
}: { 
  colorScheme?: { primary: string; secondary: string; accent: string; highlight: string }
  productShape?: string 
}) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded">
      <Canvas camera={{ position: [0, 0, 3], fov: 45 }} gl={{ preserveDrawingBuffer: true, alpha: true }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
        <directionalLight position={[-5, 3, -5]} intensity={0.4} />
        <Suspense fallback={null}>
          <MiniWeavingModel colorScheme={colorScheme} productShape={productShape} />
          <Environment preset="studio" />
        </Suspense>
        <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={2} />
      </Canvas>
    </div>
  )
}

// 3D 复古相机组件
function RetroCamera3D({ onClick, isCapturing }: { onClick: () => void; isCapturing: boolean }) {
  return (
    <motion.div 
      className="relative cursor-pointer select-none"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* 相机主体 - 更逼真的复古相机 */}
      <div className="relative w-80 h-64 mx-auto">
        {/* 相机外壳 - 皮革纹理复古风格 */}
        <div 
          className="absolute inset-0 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(145deg, #f5f0e6 0%, #e8e0d0 50%, #d4ccc0 100%)',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.1)'
          }}
        >
          {/* 皮革纹理覆盖层 */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h20v20H0z' fill='%23000' fill-opacity='0.05'/%3E%3Ccircle cx='10' cy='10' r='1' fill='%23000' fill-opacity='0.1'/%3E%3C/svg%3E")`,
              backgroundSize: '4px 4px'
            }}
          />
          {/* 顶部装饰条 - 仿皮革 */}
          <div 
            className="absolute top-0 left-0 right-0 h-4 rounded-t-2xl"
            style={{
              background: 'linear-gradient(to bottom, #8B4513 0%, #654321 50%, #5D3A1A 100%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {/* 皮革缝线 */}
            <div className="absolute top-1/2 left-4 right-4 h-px" style={{ background: 'repeating-linear-gradient(90deg, #3a2a1a 0px, #3a2a1a 4px, transparent 4px, transparent 8px)' }} />
          </div>
          
          {/* 闪光灯 - 更精致 */}
          <motion.div 
            className="absolute top-8 left-6 w-14 h-14 rounded-full"
            animate={isCapturing ? { 
              boxShadow: ['0 0 0 rgba(255,255,255,0)', '0 0 80px rgba(255,255,255,1)', '0 0 0 rgba(255,255,255,0)']
            } : {}}
            transition={{ duration: 0.3 }}
            style={{
              background: 'linear-gradient(145deg, #e8e8e8, #a0a0a0)',
              boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.2), 0 4px 8px rgba(0,0,0,0.3)'
            }}
          >
            <div className="absolute inset-1.5 rounded-full" style={{ background: 'linear-gradient(145deg, #d0d0d0, #909090)' }}>
              <div className="absolute inset-1.5 rounded-full" style={{ background: 'radial-gradient(circle at 30% 30%, #ffffff, #c0c0c0, #808080)' }}>
                {/* 反光点 */}
                <div className="absolute top-1 left-2 w-2 h-1 rounded-full bg-white opacity-80" />
              </div>
            </div>
          </motion.div>
          
          {/* 取景器 */}
          <div 
            className="absolute top-6 right-6 w-8 h-6 rounded-sm"
            style={{
              background: 'linear-gradient(145deg, #2a2a2a, #1a1a1a)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)'
            }}
          >
            <div className="absolute inset-1 rounded-sm bg-gradient-to-br from-blue-900 to-blue-950" />
          </div>

          {/* 镜头区域 - 多层玻璃效果 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-1">
            {/* 镜头座 - 粉金色 */}
            <div 
              className="w-32 h-32 rounded-full flex items-center justify-center p-1"
              style={{
                background: 'linear-gradient(145deg, #e8d4c4, #c9b8a8)',
                boxShadow: '0 6px 12px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.4)'
              }}
            >
              {/* 镜头外圈 - 金属质感 */}
              <div 
                className="w-full h-full rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(145deg, #4a4a4a, #2a2a2a, #1a1a1a)',
                  boxShadow: 'inset 0 3px 6px rgba(255,255,255,0.15), inset 0 -2px 4px rgba(0,0,0,0.4)'
                }}
              >
                {/* 镜头环纹 */}
                <div 
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{
                    background: 'repeating-radial-gradient(circle at center, #3a3a3a 0px, #2a2a2a 2px, #3a3a3a 4px)',
                    boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* 镜头玻璃 - 多层反射 */}
                  <motion.div 
                    className="w-16 h-16 rounded-full relative overflow-hidden"
                    animate={isCapturing ? { scale: [1, 0.92, 1] } : {}}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: 'radial-gradient(circle at 35% 35%, #5a7fa5, #2a4a6a, #1a2a3a, #0a1520)',
                      boxShadow: 'inset 0 0 25px rgba(0,0,0,0.6), 0 0 15px rgba(74,111,165,0.4)'
                    }}
                  >
                    {/* 镜头反光层1 */}
                    <div 
                      className="absolute top-1 left-2 w-6 h-3 rounded-full opacity-50"
                      style={{ background: 'linear-gradient(135deg, transparent, rgba(255,255,255,0.8), transparent)' }}
                    />
                    {/* 镜头反光层2 */}
                    <div 
                      className="absolute bottom-3 right-2 w-4 h-2 rounded-full opacity-30"
                      style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,0.6), transparent)' }}
                    />
                    {/* 镜头内圈 */}
                    <div 
                      className="absolute inset-3 rounded-full"
                      style={{ background: 'radial-gradient(circle at 40% 40%, #3a5a7a, #1a2a3a)', opacity: 0.5 }}
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
          
          {/* 品牌标识 - 烫金效果 */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
            <span 
              className="font-serif text-base tracking-[0.3em] font-medium"
              style={{
                background: 'linear-gradient(135deg, #d4a574, #8b7355, #d4a574)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 1px 1px rgba(255,255,255,0.3)'
              }}
            >乡遗识</span>
          </div>
          
          {/* 快门按钮 - 更精致 */}
          <motion.div 
            className="absolute -right-4 top-1/2 -translate-y-1/2 w-7 h-14 rounded-full cursor-pointer"
            whileHover={{ x: -2, scale: 1.02 }}
            whileTap={{ x: 3, scale: 0.98 }}
            style={{
              background: 'linear-gradient(to right, #dc3545, #c41e3a, #8b0000)',
              boxShadow: '3px 0 6px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.2)'
            }}
          >
            {/* 按钮凹槽 */}
            <div className="absolute inset-x-1 top-1/2 -translate-y-1/2 h-6 rounded-full" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.2), transparent)' }} />
          </motion.div>
          
          {/* 侧面把手装饰 */}
          <div 
            className="absolute -left-2 top-1/3 w-3 h-16 rounded-l-lg"
            style={{
              background: 'linear-gradient(to left, #d4ccc0, #c4b8a8)',
              boxShadow: '-2px 0 4px rgba(0,0,0,0.2)'
            }}
          />
        </div>
        
        {/* 照片出口 */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-48 h-4 rounded-b-lg"
          style={{
            background: 'linear-gradient(to bottom, #2a2a2a, #1a1a1a)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}
        />
      </div>
      
      {/* 点击提示 */}
      <p className="text-center text-ink-500 mt-4 text-sm">点击相机拍照</p>
    </motion.div>
  )
}

// 刮刮卡组件
function ScratchCard({ 
  message, 
  onReveal 
}: { 
  message: string
  onReveal: () => void 
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isRevealed, setIsRevealed] = useState(false)
  const [scratchPercent, setScratchPercent] = useState(0)
  const isDrawing = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // 绘制刮刮层
    ctx.fillStyle = '#d4af37'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    // 添加纹理
    ctx.fillStyle = '#c9a227'
    for (let i = 0; i < 100; i++) {
      ctx.fillRect(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        2,
        2
      )
    }
    
    // 添加文字提示
    ctx.fillStyle = '#8b7355'
    ctx.font = 'bold 14px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('刮开查看秘密寄语', canvas.width / 2, canvas.height / 2)
  }, [])

  const scratch = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas || isRevealed) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    let x, y
    
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left
      y = e.touches[0].clientY - rect.top
    } else {
      x = e.clientX - rect.left
      y = e.clientY - rect.top
    }
    
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x, y, 20, 0, Math.PI * 2)
    ctx.fill()
    
    // 计算刮开比例
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    let transparent = 0
    for (let i = 3; i < imageData.data.length; i += 4) {
      if (imageData.data[i] === 0) transparent++
    }
    const percent = (transparent / (imageData.data.length / 4)) * 100
    setScratchPercent(percent)
    
    if (percent > 50 && !isRevealed) {
      setIsRevealed(true)
      onReveal()
    }
  }, [isRevealed, onReveal])

  return (
    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
      {/* 底层消息 */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <p className="text-center text-amber-800 font-medium text-sm leading-relaxed">
          {message}
        </p>
      </div>
      
      {/* 刮刮层 */}
      <canvas
        ref={canvasRef}
        width={300}
        height={96}
        className={cn(
          "absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-500",
          isRevealed && "opacity-0 pointer-events-none"
        )}
        onMouseDown={() => { isDrawing.current = true }}
        onMouseUp={() => { isDrawing.current = false }}
        onMouseMove={(e) => { if (isDrawing.current) scratch(e) }}
        onTouchStart={() => { isDrawing.current = true }}
        onTouchEnd={() => { isDrawing.current = false }}
        onTouchMove={scratch}
      />
      
      {/* 进度提示 */}
      {!isRevealed && scratchPercent > 0 && (
        <div className="absolute bottom-1 right-2 text-xs text-amber-600">
          {Math.round(scratchPercent)}%
        </div>
      )}
    </div>
  )
}

// 拍立得照片卡片组件
interface PolaroidCardProps {
  image: string
  title: string
  date: string
  message: string
  rotation?: number
  isFlipped?: boolean
  onFlip?: () => void
  showScratch?: boolean
  className?: string
  weavingDNA?: WeavingDNAData    // 编织DNA数据
}

function PolaroidCard({
  image,
  title,
  date,
  message,
  rotation = 0,
  isFlipped = false,
  onFlip,
  showScratch = true,
  className,
  weavingDNA
}: PolaroidCardProps) {
  const [scratchRevealed, setScratchRevealed] = useState(false)

  // 藤编边框样式（根据编织DNA配色）
  const frameStyle = weavingDNA?.colorScheme ? {
    borderImage: `linear-gradient(135deg, ${weavingDNA.colorScheme.primary}, ${weavingDNA.colorScheme.accent}) 1`,
    borderWidth: '4px',
    borderStyle: 'solid'
  } : {}

  return (
    <motion.div
      className={cn("relative cursor-pointer perspective-1000", className)}
      style={{ transform: `rotate(${rotation}deg)` }}
      onClick={onFlip}
      whileHover={{ scale: 1.02, zIndex: 10 }}
    >
      <motion.div
        className="relative w-full preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* 正面 - 照片 */}
        <div 
          className="relative bg-white p-3 pb-20 rounded-sm shadow-xl backface-hidden"
          style={{ 
            backfaceVisibility: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2), 0 1px 3px rgba(0,0,0,0.1)',
            ...frameStyle
          }}
        >
          {/* 照片 */}
          <div className="relative aspect-square overflow-hidden bg-gray-100 rounded">
            <img 
              src={image} 
              alt={title}
              className="w-full h-full object-cover"
            />
            {/* 复古滤镜叠加 */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent mix-blend-overlay" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            
            {/* 编织DNA徽章 */}
            {weavingDNA?.uniqueTitle && (
              <div 
                className="absolute top-2 left-2 px-2 py-1 rounded-full text-white text-xs font-medium"
                style={{ background: weavingDNA.colorScheme?.primary || '#8B5E34' }}
              >
                🎋 {weavingDNA.uniqueTitle}
              </div>
            )}
            
            {/* 工艺等级徽章 */}
            {weavingDNA?.craftLevel && (
              <div 
                className="absolute top-2 right-2 px-2 py-1 rounded-full text-white text-xs"
                style={{ background: weavingDNA.colorScheme?.accent || '#C4956A' }}
              >
                {weavingDNA.craftLevel}
              </div>
            )}
          </div>
          
          {/* 底部信息 */}
          <div className="absolute bottom-3 left-3 right-3">
            <p className="font-handwriting text-gray-700 text-lg">{title}</p>
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-gray-400">{date}</p>
              {weavingDNA?.patternName && (
                <p className="text-xs text-amber-600 font-medium">{weavingDNA.patternName}</p>
              )}
            </div>
            {/* 编织DNA数据条 */}
            {weavingDNA && (weavingDNA.smoothness || weavingDNA.creativity) && (
              <div className="flex gap-1 mt-2">
                {weavingDNA.smoothness && (
                  <div 
                    className="h-1 rounded-full flex-1"
                    style={{ 
                      background: `linear-gradient(to right, ${weavingDNA.colorScheme?.primary || '#8B5E34'} ${weavingDNA.smoothness}%, #e5e5e5 ${weavingDNA.smoothness}%)`
                    }}
                    title={`平滑度 ${weavingDNA.smoothness}%`}
                  />
                )}
                {weavingDNA.creativity && (
                  <div 
                    className="h-1 rounded-full flex-1"
                    style={{ 
                      background: `linear-gradient(to right, ${weavingDNA.colorScheme?.accent || '#C4956A'} ${weavingDNA.creativity}%, #e5e5e5 ${weavingDNA.creativity}%)`
                    }}
                    title={`创意度 ${weavingDNA.creativity}%`}
                  />
                )}
              </div>
            )}
          </div>
          
          {/* 翻转提示 */}
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 rounded text-white text-xs">
            点击翻转
          </div>
        </div>

        {/* 背面 - 绿色环保数据 */}
        <div 
          className="absolute inset-0 bg-gradient-to-br from-eco-50 to-bamboo-50 p-4 rounded-sm shadow-xl backface-hidden flex flex-col"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}
        >
          {/* 藤编纹理边框 */}
          <div 
            className="absolute inset-3 rounded pointer-events-none"
            style={{ 
              border: '2px dashed',
              borderColor: weavingDNA?.colorScheme?.primary || '#2D5A27'
            }}
          />
          
          <div className="flex-1 flex flex-col items-center justify-center p-3">
            {/* 绿色数据标题 */}
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-6 h-6 text-eco-500" />
              <span className="text-eco-700 font-bold text-sm">以竹代塑 · 绿色数据</span>
            </div>
            
            {/* 环保数据卡片 */}
            <div className="w-full space-y-2">
              {/* 碳减排 */}
              <div className="bg-white/80 rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs text-eco-600">🌱 本次碳减排</span>
                <span className="text-eco-700 font-bold">500g CO₂</span>
              </div>
              
              {/* 塑料减少 */}
              <div className="bg-white/80 rounded-lg p-2 flex items-center justify-between">
                <span className="text-xs text-eco-600">♻️ 减少塑料</span>
                <span className="text-eco-700 font-bold">150g</span>
              </div>
              
              {/* 竹子分解 vs 塑料分解 */}
              <div className="bg-white/80 rounded-lg p-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-eco-600">🎋 竹子分解</span>
                  <span className="text-eco-700 font-bold">3-6月</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-red-400">🛢️ 塑料分解</span>
                  <span className="text-red-500 font-bold">450年</span>
                </div>
              </div>
              
              {/* 编织DNA信息 */}
              {weavingDNA?.uniqueTitle && (
                <div 
                  className="rounded-lg p-2 text-center"
                  style={{ backgroundColor: weavingDNA.colorScheme?.secondary || '#E8F5E0' }}
                >
                  <p className="text-xs" style={{ color: weavingDNA.colorScheme?.primary || '#2D5A27' }}>
                    🎋 {weavingDNA.uniqueTitle} · {weavingDNA.craftLevel}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* 底部标语 */}
          <div className="text-center text-xs text-eco-500 font-medium">
            🌍 乡遗识 · 守护绿色地球
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

// Bubbbly风格照片堆叠组件
function BubbblyPhotoStack({ 
  photos, 
  weavingDNA,
  onPhotoClick,
  activeIndex,
  onFlip,
  isFlipped
}: { 
  photos: PolaroidResult[]
  weavingDNA?: WeavingDNAData
  onPhotoClick: (index: number) => void
  activeIndex: number
  onFlip: (index: number) => void
  isFlipped: boolean
}) {
  if (photos.length === 0) return null

  // 预设的随机角度
  const rotations = [-8, 5, -3, 7, -5, 4, -6, 8]

  return (
    <div className="relative h-[550px] flex items-center justify-center">
      {photos.map((photo, index) => {
        const isActive = index === activeIndex
        const baseRotation = rotations[index % rotations.length]
        const xOffset = (index - activeIndex) * 30
        const yOffset = (index - activeIndex) * 15
        
        return (
          <motion.div
            key={photo.id}
            className="absolute cursor-pointer"
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              x: xOffset,
              y: yOffset,
              rotate: isActive ? 0 : baseRotation,
              scale: isActive ? 1.1 : 1,
              zIndex: isActive ? 100 : photos.length - Math.abs(index - activeIndex)
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            onClick={() => onPhotoClick(index)}
            whileHover={{ scale: isActive ? 1.12 : 1.05, zIndex: 99 }}
          >
            {/* 可翻转的照片 */}
            <motion.div
              className="relative preserve-3d"
              animate={{ rotateY: isActive && isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* 正面 - 编织作品照片 + 藤编边框 */}
              <div 
                className="w-80 bg-white p-1 pb-20 rounded-sm backface-hidden relative"
                style={{
                  backfaceVisibility: 'hidden',
                  boxShadow: isActive 
                    ? '0 25px 50px rgba(0,0,0,0.35)' 
                    : '0 15px 30px rgba(0,0,0,0.25)'
                }}
              >
                {/* 藤编纹理边框 */}
                <div 
                  className="absolute inset-0 rounded-sm pointer-events-none"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        0deg,
                        transparent,
                        transparent 2px,
                        ${weavingDNA?.colorScheme?.primary || '#8B5E34'}15 2px,
                        ${weavingDNA?.colorScheme?.primary || '#8B5E34'}15 4px
                      ),
                      repeating-linear-gradient(
                        90deg,
                        transparent,
                        transparent 2px,
                        ${weavingDNA?.colorScheme?.secondary || '#D4A574'}15 2px,
                        ${weavingDNA?.colorScheme?.secondary || '#D4A574'}15 4px
                      )
                    `,
                    border: `3px solid ${weavingDNA?.colorScheme?.primary || '#8B5E34'}`,
                    borderRadius: '4px'
                  }}
                />
                
                {/* 编织线条装饰角 */}
                <div className="absolute top-0 left-0 w-6 h-6">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path 
                      d="M0,0 Q12,0 12,12 Q12,0 24,0" 
                      fill="none" 
                      stroke={weavingDNA?.colorScheme?.accent || '#C4956A'} 
                      strokeWidth="2"
                    />
                    <path 
                      d="M0,0 Q0,12 12,12 Q0,12 0,24" 
                      fill="none" 
                      stroke={weavingDNA?.colorScheme?.accent || '#C4956A'} 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="absolute top-0 right-0 w-6 h-6 rotate-90">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path 
                      d="M0,0 Q12,0 12,12 Q12,0 24,0" 
                      fill="none" 
                      stroke={weavingDNA?.colorScheme?.accent || '#C4956A'} 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                
                <div className="aspect-square overflow-hidden bg-gray-100 rounded m-2 relative">
                  {photo.imageDataUrl.startsWith('data:image') ? (
                    /* 使用实际截图 */
                    <img 
                      src={photo.imageDataUrl} 
                      alt={photo.sceneName}
                      className="w-full h-full object-cover"
                      style={{
                        transform: 'scale(1.25)',
                        transformOrigin: 'center',
                        objectPosition: '50% 35%'
                      }}
                    />
                  ) : (
                    <img 
                      src={photo.imageDataUrl} 
                      alt={photo.sceneName}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* 编织纹理叠加 */}
                  <div 
                    className="absolute inset-0 pointer-events-none opacity-5"
                    style={{
                      backgroundImage: `
                        repeating-linear-gradient(
                          45deg,
                          ${weavingDNA?.colorScheme?.primary || '#8B5E34'} 0px,
                          transparent 1px,
                          transparent 10px
                        ),
                        repeating-linear-gradient(
                          -45deg,
                          ${weavingDNA?.colorScheme?.secondary || '#D4A574'} 0px,
                          transparent 1px,
                          transparent 10px
                        )
                      `
                    }}
                  />
                </div>
                
                {/* 照片信息 - 手写风格 */}
                <div className="absolute bottom-3 left-3 right-3">
                  <p 
                    className="text-gray-700 text-lg"
                    style={{ fontFamily: 'Comic Sans MS, cursive' }}
                  >
                    {weavingDNA?.uniqueTitle || photo.sceneName}
                  </p>
                  <p className="text-xs text-gray-400">{photo.date}</p>
                </div>
                
                {/* 活跃时显示操作按钮 */}
                {isActive && (
                  <motion.div 
                    className="absolute top-2 right-2 flex gap-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onFlip(index); }}
                      className="px-3 py-1.5 bg-eco-500 hover:bg-eco-600 text-white rounded-full text-xs font-bold shadow-lg transition-all"
                    >
                      ↻
                    </button>
                  </motion.div>
                )}
              </div>
              
              {/* 背面 - 绿色环保数据 */}
              <div 
                className="absolute inset-0 w-80 bg-gradient-to-br from-eco-50 to-bamboo-50 p-4 rounded-sm backface-hidden flex flex-col"
                style={{ 
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.35)'
                }}
              >
                {/* 藤编纹理边框 */}
                <div 
                  className="absolute inset-3 rounded pointer-events-none"
                  style={{ 
                    border: '2px dashed',
                    borderColor: weavingDNA?.colorScheme?.primary || '#2D5A27'
                  }}
                />
                
                <div className="flex-1 flex flex-col items-center justify-center p-2">
                  {/* 绿色数据标题 */}
                  <div className="flex items-center gap-2 mb-3">
                    <Leaf className="w-5 h-5 text-eco-500" />
                    <span className="text-eco-700 font-bold text-sm">以竹代塑 · 绿色数据</span>
                  </div>
                  
                  {/* 环保数据 */}
                  <div className="w-full space-y-2 text-sm">
                    <div className="bg-white/80 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-eco-600">🌱 碳减排</span>
                      <span className="text-eco-700 font-bold">{photo.carbonSaved}g</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2 flex items-center justify-between">
                      <span className="text-eco-600">♻️ 减塑料</span>
                      <span className="text-eco-700 font-bold">150g</span>
                    </div>
                    <div className="bg-white/80 rounded-lg p-2">
                      <div className="flex justify-between mb-1">
                        <span className="text-eco-600">🎋 竹分解</span>
                        <span className="text-eco-700 font-bold">3-6月</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-400">🛢️ 塑分解</span>
                        <span className="text-red-500 font-bold">450年</span>
                      </div>
                    </div>
                    
                    {weavingDNA?.uniqueTitle && (
                      <div 
                        className="rounded-lg p-2 text-center"
                        style={{ backgroundColor: weavingDNA.colorScheme?.secondary || '#E8F5E0' }}
                      >
                        <p className="text-xs" style={{ color: weavingDNA.colorScheme?.primary }}>
                          🎋 {weavingDNA.uniqueTitle}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center text-xs text-eco-500">
                  🌍 守护绿色地球
                </div>
                
                {/* 翻转按钮 */}
                <motion.div 
                  className="absolute top-2 right-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); onFlip(index); }}
                    className="px-3 py-1.5 bg-eco-500 hover:bg-eco-600 text-white rounded-full text-xs font-bold shadow-lg"
                  >
                    ↻
                  </button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 照片堆叠展示组件（旧版保留）
function PhotoStack({ 
  photos, 
  onPhotoClick 
}: { 
  photos: PolaroidResult[]
  onPhotoClick: (index: number) => void 
}) {
  const [activeIndex, setActiveIndex] = useState(photos.length - 1)

  if (photos.length === 0) return null

  return (
    <div className="relative h-80 flex items-center justify-center">
      {photos.map((photo, index) => {
        const isActive = index === activeIndex
        const offset = (index - activeIndex) * 20
        const rotation = (index - activeIndex) * 5 + (Math.random() - 0.5) * 3
        
        return (
          <motion.div
            key={photo.id}
            className="absolute cursor-pointer"
            initial={{ opacity: 0, y: 50, rotate: 0 }}
            animate={{ 
              opacity: 1, 
              y: offset,
              x: offset * 0.5,
              rotate: rotation,
              scale: isActive ? 1 : 0.95,
              zIndex: photos.length - Math.abs(index - activeIndex)
            }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            onClick={() => {
              setActiveIndex(index)
              onPhotoClick(index)
            }}
            whileHover={{ scale: isActive ? 1.02 : 1, zIndex: 100 }}
          >
            <div 
              className="w-56 bg-white p-2 pb-12 rounded-sm shadow-xl"
              style={{
                boxShadow: isActive 
                  ? '0 20px 40px rgba(0,0,0,0.3)' 
                  : '0 10px 20px rgba(0,0,0,0.2)'
              }}
            >
              <div className="aspect-square overflow-hidden bg-gray-100">
                <img 
                  src={photo.imageDataUrl} 
                  alt={photo.sceneName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 left-2 right-2">
                <p className="font-handwriting text-gray-600 text-sm truncate">
                  {photo.sceneName}
                </p>
                <p className="text-xs text-gray-400">{photo.date}</p>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}

// 主组件
export default function RetroPolaroidCamera({
  onComplete,
  onClose,
  className,
  weavingDNA: propWeavingDNA
}: RetroPolaroidCameraProps) {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraAreaRef = useRef<HTMLDivElement>(null)
  const stackAreaRef = useRef<HTMLDivElement>(null)
  const autoWeavingFxTimeouts = useRef<number[]>([])
  
  // 从URL参数解析编织DNA数据（从竹编体验传入）
  const weavingDNA = useMemo<WeavingDNAData | undefined>(() => {
    if (propWeavingDNA) return propWeavingDNA
    
    const title = searchParams.get('title')
    const level = searchParams.get('level')
    const product = searchParams.get('product')
    const smooth = searchParams.get('smooth')
    const creative = searchParams.get('creative')
    const design = searchParams.get('design')
    
    if (!title && !level) return undefined
    
    // 根据design种子生成配色
    const designSeed = design ? parseInt(design) : Date.now()
    const colorIndex = designSeed % 6
    const colors = [
      { primary: '#8B5E34', secondary: '#D4A574', accent: '#C4956A', highlight: '#F5E6D3' },
      { primary: '#2D5A27', secondary: '#6B8E23', accent: '#9ACD32', highlight: '#E8F5E0' },
      { primary: '#4A90A4', secondary: '#7CB9D8', accent: '#B8D4E8', highlight: '#E6F3F8' },
      { primary: '#8B4513', secondary: '#D2691E', accent: '#F4A460', highlight: '#FAEBD7' },
      { primary: '#6B4C3B', secondary: '#A67B5B', accent: '#C19A6B', highlight: '#F5DEB3' },
      { primary: '#556B2F', secondary: '#8FBC8F', accent: '#98FB98', highlight: '#F0FFF0' }
    ]
    
    return {
      uniqueTitle: title || undefined,
      craftLevel: level || undefined,
      productStyle: product || undefined,
      smoothness: smooth ? parseInt(smooth) : undefined,
      creativity: creative ? parseInt(creative) : undefined,
      colorScheme: colors[colorIndex],
      seed: designSeed
    }
  }, [propWeavingDNA, searchParams])
  
  // 从URL获取初始场景和3D渲染数据
  const initialScene = searchParams.get('scene') as EcoScene | null
  const render3d = searchParams.get('render3d') === 'true'
  const productShape = searchParams.get('shape') || weavingDNA?.productStyle || 'vase'
  
  // 从URL读取颜色数据
  const render3dColorScheme = useMemo(() => {
    const primary = searchParams.get('primary')
    const secondary = searchParams.get('secondary')
    const accent = searchParams.get('accent')
    const highlight = searchParams.get('highlight')
    
    if (primary && secondary && accent && highlight) {
      return { primary, secondary, accent, highlight }
    }
    return weavingDNA?.colorScheme
  }, [searchParams, weavingDNA?.colorScheme])
  
  const [step, setStep] = useState<'camera' | 'capture' | 'preview' | 'result'>('camera')
  const [selectedScene, setSelectedScene] = useState<EcoScene>(initialScene && SCENE_CONFIGS[initialScene] ? initialScene : 'hani_terrace')
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [polaroidResult, setPolaroidResult] = useState<PolaroidResult | null>(null)
  const [photoStack, setPhotoStack] = useState<PolaroidResult[]>([])
  const [isFlipped, setIsFlipped] = useState(false)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [showPhotoAnimation, setShowPhotoAnimation] = useState(false)
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [autoWeavingFx, setAutoWeavingFx] = useState<{
    result: PolaroidResult
    coords: { fromX: number; fromY: number; toX: number; toY: number }
  } | null>(null)

  useEffect(() => {
    return () => {
      autoWeavingFxTimeouts.current.forEach((t) => clearTimeout(t))
      autoWeavingFxTimeouts.current = []
    }
  }, [])

  const { currentLevel } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  const levelInfo = ECO_LEVELS[currentLevel]
  const sceneConfig = SCENE_CONFIGS[selectedScene]
  
  // 从localStorage读取编织完成时的实际截图
  const [weavingScreenshot, setWeavingScreenshot] = useState<string | null>(() => {
    // 立即读取，避免异步问题
    const savedImage = localStorage.getItem('weavingProductImage')
    const savedTime = localStorage.getItem('weavingProductTime')
    
    if (savedImage && savedTime) {
      const timeDiff = Date.now() - parseInt(savedTime)
      // 1小时内有效，且截图大小大于50KB（避免空白截图）
      if (timeDiff < 60 * 60 * 1000 && savedImage.length > 50000) {
        console.log('✅ 读取到编织截图，长度:', savedImage.length)
        return savedImage
      }
      console.log('⚠️ 编织截图无效（太小或过期），长度:', savedImage.length)
    } else {
      console.log('⚠️ 未找到编织截图')
    }
    return null
  })
  
  // 如果有编织截图，自动添加编织作品到照片堆叠
  useEffect(() => {
    // 没有截图则跳过
    if (!weavingScreenshot) return

    const sceneName = weavingDNA?.uniqueTitle || '藤编作品'
    const result: PolaroidResult = {
      id: generateId(),
      imageDataUrl: weavingScreenshot,
      scene: 'bamboo_forest',
      sceneName,
      date: new Date().toLocaleDateString('zh-CN'),
      ecoLevel: currentLevel,
      pointsEarned: POINTS_REWARDS.polaroid_create,
      carbonSaved: 500,
      ecoMessage: '以竹代塑，传承非遗，守护绿色地球',
      filter: ECO_POLAROID_FILTER
    }

    const camRect = cameraAreaRef.current?.getBoundingClientRect()
    const stackRect = stackAreaRef.current?.getBoundingClientRect()

    const fallbackX = window.innerWidth / 2 - AUTO_WEAVING_FX_PHOTO_WIDTH / 2
    const fallbackY = window.innerHeight / 2 - AUTO_WEAVING_FX_PHOTO_HEIGHT / 2

    const coords = {
      fromX: camRect ? camRect.left + camRect.width / 2 - AUTO_WEAVING_FX_PHOTO_WIDTH / 2 : fallbackX,
      fromY: camRect ? camRect.top + camRect.height * 0.55 : fallbackY,
      toX: stackRect ? stackRect.left + stackRect.width / 2 - AUTO_WEAVING_FX_PHOTO_WIDTH / 2 : fallbackX,
      toY: stackRect ? stackRect.top + stackRect.height / 2 - AUTO_WEAVING_FX_PHOTO_HEIGHT / 2 : fallbackY
    }

    setAutoWeavingFx({ result, coords })

    const flashOn = window.setTimeout(() => setIsCapturing(true), 220)
    const flashOff = window.setTimeout(() => setIsCapturing(false), 430)
    const commit = window.setTimeout(() => {
      setPhotoStack([result])
      setPolaroidResult(result)
      setActivePhotoIndex(0)
      // 照片添加完成后立即隐藏动画层
      setAutoWeavingFx(null)
    }, 2100)

    autoWeavingFxTimeouts.current = [flashOn, flashOff, commit]

    return () => {
      autoWeavingFxTimeouts.current.forEach((t) => clearTimeout(t))
      autoWeavingFxTimeouts.current = []
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weavingScreenshot])

  // 初始化摄像头
  useEffect(() => {
    if (step === 'capture' && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 640, height: 480 } 
      })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            setIsCameraReady(true)
          }
        })
        .catch(err => {
          console.error('摄像头访问失败:', err)
        })
    }

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
        tracks.forEach(track => track.stop())
      }
    }
  }, [step])

  // 点击相机拍照
  const handleCameraClick = () => {
    setStep('capture')
  }

  // 拍照
  const handleCapture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return

    setIsCapturing(true)
    
    setTimeout(() => {
      const video = videoRef.current!
      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // 镜像翻转
      ctx.translate(canvas.width, 0)
      ctx.scale(-1, 1)
      ctx.drawImage(video, 0, 0)

      // 应用滤镜效果
      applyPolaroidFilter(ctx, canvas.width, canvas.height)

      const imageData = canvas.toDataURL('image/png')
      setCapturedImage(imageData)
      setIsCapturing(false)
      setShowPhotoAnimation(true)
      
      // 直接生成拍立得并添加到堆叠
      const result: PolaroidResult = {
        id: generateId(),
        imageDataUrl: imageData,
        scene: selectedScene,
        sceneName: sceneConfig.name,
        date: new Date().toLocaleDateString('zh-CN'),
        ecoLevel: currentLevel,
        pointsEarned: POINTS_REWARDS.polaroid_create,
        carbonSaved: sceneConfig.carbonSaving,
        ecoMessage: ECO_MESSAGES[Math.floor(Math.random() * ECO_MESSAGES.length)],
        filter: ECO_POLAROID_FILTER
      }
      
      // 添加积分和碳减排
      addSharePoints(`生成${sceneConfig.name}拍立得`, POINTS_REWARDS.polaroid_create)
      addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: sceneConfig.carbonSaving,
        description: `云游${sceneConfig.name}`,
        experienceId: selectedScene
      })
      
      // 保存拍立得到画廊
      useArtworkStore.getState().addPolaroidArtwork({
        image: imageData,
        scene: selectedScene,
        sceneName: sceneConfig.name,
        ecoMessage: result.ecoMessage,
        carbonSaved: sceneConfig.carbonSaving,
        pointsEarned: POINTS_REWARDS.polaroid_create,
      })
      
      setPolaroidResult(result)
      setPhotoStack(prev => [...prev, result])
      setActivePhotoIndex(photoStack.length)
      
      setTimeout(() => {
        setShowPhotoAnimation(false)
        setStep('camera') // 返回主界面显示照片堆叠
      }, 1500)
    }, 300)
  }, [selectedScene, sceneConfig, currentLevel, addCarbonSaving, photoStack.length])

  // 应用拍立得滤镜
  const applyPolaroidFilter = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const imageData = ctx.getImageData(0, 0, width, height)
    const data = imageData.data
    const filter = ECO_POLAROID_FILTER

    for (let i = 0; i < data.length; i += 4) {
      // 暖色调
      data[i] = Math.min(255, data[i] + filter.warmth * 20)
      data[i + 2] = Math.max(0, data[i + 2] - filter.warmth * 10)

      // 褪色效果
      const avg = (data[i] + data[i + 1] + data[i + 2]) / 3
      data[i] = data[i] + (avg - data[i]) * filter.fadeLevel
      data[i + 1] = data[i + 1] + (avg - data[i + 1]) * filter.fadeLevel
      data[i + 2] = data[i + 2] + (avg - data[i + 2]) * filter.fadeLevel

      // 颗粒感
      const noise = (Math.random() - 0.5) * filter.grain * 50
      data[i] = Math.min(255, Math.max(0, data[i] + noise))
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise))
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise))
    }

    ctx.putImageData(imageData, 0, 0)

    // 暗角效果
    if (filter.vignette > 0) {
      const gradient = ctx.createRadialGradient(
        width / 2, height / 2, 0,
        width / 2, height / 2, Math.max(width, height) / 2
      )
      gradient.addColorStop(0.5, 'rgba(0,0,0,0)')
      gradient.addColorStop(1, `rgba(0,0,0,${filter.vignette})`)
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, height)
    }
  }

  // 生成最终拍立得
  const generatePolaroid = useCallback(() => {
    if (!capturedImage) return

    const result: PolaroidResult = {
      id: generateId(),
      imageDataUrl: capturedImage,
      scene: selectedScene,
      sceneName: sceneConfig.name,
      date: new Date().toLocaleDateString('zh-CN'),
      ecoLevel: currentLevel,
      pointsEarned: POINTS_REWARDS.polaroid_create,
      carbonSaved: sceneConfig.carbonSaving,
      ecoMessage: ECO_MESSAGES[Math.floor(Math.random() * ECO_MESSAGES.length)],
      filter: ECO_POLAROID_FILTER
    }

    // 添加积分和碳减排
    addSharePoints(`生成${sceneConfig.name}拍立得`, POINTS_REWARDS.polaroid_create)
    addCarbonSaving({
      type: 'cloud_tour',
      carbonSaved: sceneConfig.carbonSaving,
      description: `云游${sceneConfig.name}`,
      experienceId: selectedScene
    })

    setPolaroidResult(result)
    setPhotoStack(prev => [...prev, result])
    setStep('result')
    onComplete?.(result)
  }, [capturedImage, selectedScene, sceneConfig, currentLevel, addCarbonSaving, onComplete])

  // 下载拍立得
  const handleDownload = useCallback(() => {
    if (!polaroidResult) return
    
    const link = document.createElement('a')
    link.download = `乡遗识-${sceneConfig.name}-${Date.now()}.png`
    link.href = polaroidResult.imageDataUrl
    link.click()
  }, [polaroidResult, sceneConfig])

  // 重新拍摄
  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    setPolaroidResult(null)
    setIsFlipped(false)
    setStep('capture')
  }, [])

  // 重置到相机
  const handleReset = useCallback(() => {
    setCapturedImage(null)
    setPolaroidResult(null)
    setIsFlipped(false)
    setStep('camera')
  }, [])

  // 场景选择
  const scenes = Object.keys(SCENE_CONFIGS) as EcoScene[]

  return (
    <div className={cn('min-h-screen', className)} style={{ background: 'radial-gradient(circle at center, #f5f5f0 0%, #e8e8e0 100%)' }}>
      {/* 顶部工具栏 - 仿bubbbly风格 */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        {/* 左侧：编织DNA信息 */}
        <div className="flex items-center gap-2">
          {weavingDNA?.uniqueTitle ? (
            <div 
              className="px-4 py-2 rounded-full text-white text-sm font-medium shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${weavingDNA.colorScheme?.primary || '#2D5A27'}, ${weavingDNA.colorScheme?.accent || '#6B8E23'})`,
                border: '2px solid white'
              }}
            >
              🎋 {weavingDNA.uniqueTitle}
            </div>
          ) : (
            <div className="px-4 py-2 bg-eco-500 text-white rounded-full text-sm font-medium shadow-lg border-2 border-white">
              🌿 乡遗识拍立得
            </div>
          )}
        </div>
        
        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={photoStack.length === 0}
            className="px-4 py-2 bg-eco-600 hover:bg-eco-700 text-white rounded-full text-sm font-bold shadow-lg border-2 border-white disabled:opacity-50 transition-all"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            DOWNLOAD
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm font-bold shadow-lg border-2 border-white transition-all"
            style={{ fontFamily: 'Comic Sans MS, cursive' }}
          >
            RESET
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* 主内容区域 - 左右布局仿bubbbly */}
      <div className="min-h-screen flex items-center justify-center px-8 py-20">
        <div className="flex items-center gap-16 max-w-6xl w-full">
          {/* 左侧：3D相机 */}
          <div className="flex-shrink-0" ref={cameraAreaRef}>
            <RetroCamera3D onClick={handleCameraClick} isCapturing={isCapturing} />
          </div>
          
          {/* 右侧：照片堆叠 */}
          <div className="flex-1 min-h-[400px] relative" ref={stackAreaRef}>
            {photoStack.length > 0 ? (
              <BubbblyPhotoStack 
                photos={photoStack}
                weavingDNA={weavingDNA}
                onPhotoClick={(index) => {
                  setPolaroidResult(photoStack[index])
                  setActivePhotoIndex(index)
                }}
                activeIndex={activePhotoIndex}
                onFlip={(index) => {
                  if (activePhotoIndex === index) {
                    setIsFlipped(!isFlipped)
                  }
                }}
                isFlipped={isFlipped}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 relative">
                {/* 示例编织照片展示 */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative">
                    {/* 示例照片1 */}
                    <div 
                      className="absolute -left-8 -top-4 w-32 h-40 bg-white rounded shadow-lg transform -rotate-12"
                      style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                      <div className="w-full h-28 bg-gradient-to-br from-amber-100 to-amber-200 rounded-t flex items-center justify-center">
                        <span className="text-4xl">🏮</span>
                      </div>
                      <div className="p-1 text-center">
                        <p className="text-[8px] text-gray-600 font-bold">藤编灯笼</p>
                        <p className="text-[6px] text-gray-400">2025/12/20</p>
                      </div>
                    </div>
                    {/* 示例照片2 */}
                    <div 
                      className="absolute left-4 top-0 w-32 h-40 bg-white rounded shadow-lg transform rotate-6 z-10"
                      style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                      <div className="w-full h-28 bg-gradient-to-br from-eco-100 to-eco-200 rounded-t flex items-center justify-center">
                        <span className="text-4xl">🧺</span>
                      </div>
                      <div className="p-1 text-center">
                        <p className="text-[8px] text-gray-600 font-bold">收纳花篮</p>
                        <p className="text-[6px] text-gray-400">2025/12/20</p>
                      </div>
                    </div>
                    {/* 示例照片3 */}
                    <div 
                      className="absolute left-16 -top-2 w-32 h-40 bg-white rounded shadow-lg transform rotate-15 z-20"
                      style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
                    >
                      <div className="w-full h-28 bg-gradient-to-br from-heritage-100 to-heritage-200 rounded-t flex items-center justify-center">
                        <span className="text-4xl">🎋</span>
                      </div>
                      <div className="p-1 text-center">
                        <p className="text-[8px] text-gray-600 font-bold">经典花瓶</p>
                        <p className="text-[6px] text-gray-400">2025/12/20</p>
                      </div>
                    </div>
                  </div>
                </div>
                {/* 提示文字 */}
                <div className="relative z-30 mt-48 text-center">
                  <p className="text-lg text-gray-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
                    点击相机拍摄你的第一张照片
                  </p>
                  {weavingDNA?.uniqueTitle && (
                    <p className="text-sm mt-2 text-eco-500">
                      记录你的编织作品：{weavingDNA.productStyle}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {autoWeavingFx && (
          <AutoWeavingCaptureOverlay
            key="auto-weaving-fx"
            result={autoWeavingFx.result}
            coords={autoWeavingFx.coords}
            weavingDNA={weavingDNA}
          />
        )}
      </AnimatePresence>
      
      {/* 底部链接 - 仿bubbbly风格 */}
      <div className="fixed bottom-4 left-4 right-4 flex items-center justify-between text-sm">
        <div 
          className="px-4 py-2 bg-amber-700 text-white rounded-full cursor-pointer hover:bg-amber-800 transition-all shadow-lg"
          style={{ fontFamily: 'Comic Sans MS, cursive' }}
          onClick={() => navigate('/gallery')}
        >
          📌 查看绿色公益画廊
        </div>
        <div className="text-gray-500" style={{ fontFamily: 'Comic Sans MS, cursive' }}>
          以竹代塑，守护地球 🌍
        </div>
      </div>

      {/* 拍摄模态框 */}
      <AnimatePresence>
        {step === 'capture' && (
          <motion.div
            key="capture-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-8"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4"
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-ink-900 shadow-2xl">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                
                {/* 场景叠加层 */}
                <div 
                  className={cn(
                    'absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none',
                    sceneConfig.bgGradient
                  )}
                />

                {/* 场景标签 */}
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/50 rounded-full text-white text-sm flex items-center gap-2">
                  <span>{sceneConfig.icon}</span>
                  {sceneConfig.name}
                </div>

                {/* 拍立得边框效果 */}
                <div className="absolute inset-0 border-8 border-white pointer-events-none rounded-lg" />

                {!isCameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-ink-900">
                    <p className="text-white">正在启动摄像头...</p>
                  </div>
                )}

                {/* 闪光效果 */}
                <AnimatePresence>
                  {isCapturing && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-white"
                    />
                  )}
                </AnimatePresence>
              </div>

              <canvas ref={canvasRef} className="hidden" />

              {/* 照片弹出动画 */}
              <AnimatePresence>
                {showPhotoAnimation && capturedImage && (
                  <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute bottom-20 left-1/2 -translate-x-1/2 w-32 bg-white p-1 pb-6 rounded-sm shadow-xl"
                  >
                    <img 
                      src={capturedImage} 
                      alt="预览" 
                      className="w-full aspect-square object-cover"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 bg-white hover:bg-amber-50 text-amber-700 rounded-xl font-medium transition-colors"
                >
                  返回
                </button>
                <button
                  onClick={handleCapture}
                  disabled={!isCameraReady || isCapturing}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                  <Camera className="w-5 h-5" />
                  {isCapturing ? '拍摄中...' : '拍摄'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
