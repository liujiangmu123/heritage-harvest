/**
 * 哈尼梯田VR全景体验组件
 * 『码』上寻踪 - 云南哈尼族农耕文化与长街宴VR全景
 * 
 * 提供360°全景沉浸式体验，展示哈尼梯田壮丽景观
 * 支持热点交互，了解哈尼族农耕文化
 */

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Html,
  useProgress
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Eye,
  RotateCcw, 
  MapPin,
  Volume2,
  VolumeX,
  ChevronRight,
  Sparkles,
  Info,
  Mountain,
  Users,
  Wheat
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// 加载指示器
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-3">
        <div className="w-16 h-16 border-4 border-palace-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-white font-medium">加载全景中 {progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}

// 热点数据
interface Hotspot {
  id: string
  position: THREE.Vector3
  title: string
  description: string
  icon: 'mountain' | 'users' | 'wheat' | 'info'
}

const HOTSPOTS: Hotspot[] = [
  {
    id: 'terrace',
    position: new THREE.Vector3(-8, 0, 5),
    title: '千年梯田',
    description: '哈尼梯田已有1300多年历史，是哈尼族人民世代耕作的结晶，2013年被列入世界文化遗产名录。',
    icon: 'mountain'
  },
  {
    id: 'village',
    position: new THREE.Vector3(5, 2, -8),
    title: '蘑菇房',
    description: '哈尼族传统民居，屋顶呈蘑菇形状，以茅草覆盖，冬暖夏凉，与自然和谐共生。',
    icon: 'users'
  },
  {
    id: 'farming',
    position: new THREE.Vector3(8, -1, 3),
    title: '农耕文化',
    description: '哈尼族独创的"木刻分水"灌溉系统，按规定时间、比例分配水源，体现了古老的生态智慧。',
    icon: 'wheat'
  },
  {
    id: 'feast',
    position: new THREE.Vector3(-5, -2, -7),
    title: '长街宴',
    description: '每年农历十月，哈尼族举办盛大的"长街宴"，家家户户摆出美食，庆祝丰收，是国家级非遗项目。',
    icon: 'info'
  }
]

// 全景球体
function PanoramaSphere() {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // 使用渐变色作为临时纹理（实际项目中应使用真实全景图）
  const geometry = new THREE.SphereGeometry(50, 64, 64)
  // 反转面朝内
  geometry.scale(-1, 1, 1)
  
  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshBasicMaterial>
        <canvasTexture 
          attach="map" 
          image={createPanoramaTexture()}
        />
      </meshBasicMaterial>
    </mesh>
  )
}

// 创建模拟全景纹理
function createPanoramaTexture(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 1024
  const ctx = canvas.getContext('2d')!
  
  // 天空渐变
  const skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 0.4)
  skyGradient.addColorStop(0, '#87CEEB')
  skyGradient.addColorStop(1, '#E0F4FF')
  ctx.fillStyle = skyGradient
  ctx.fillRect(0, 0, canvas.width, canvas.height * 0.4)
  
  // 山脉
  ctx.fillStyle = '#4A6741'
  ctx.beginPath()
  ctx.moveTo(0, canvas.height * 0.4)
  for (let x = 0; x <= canvas.width; x += 50) {
    const y = canvas.height * 0.35 + Math.sin(x * 0.01) * 50 + Math.random() * 30
    ctx.lineTo(x, y)
  }
  ctx.lineTo(canvas.width, canvas.height)
  ctx.lineTo(0, canvas.height)
  ctx.fill()
  
  // 梯田层次
  for (let i = 0; i < 8; i++) {
    const y = canvas.height * (0.4 + i * 0.07)
    const hue = 100 + i * 5
    ctx.fillStyle = `hsl(${hue}, 50%, ${45 + i * 3}%)`
    ctx.beginPath()
    ctx.moveTo(0, y)
    for (let x = 0; x <= canvas.width; x += 30) {
      const curveY = y + Math.sin(x * 0.02 + i) * 15
      ctx.lineTo(x, curveY)
    }
    ctx.lineTo(canvas.width, y + 80)
    ctx.lineTo(0, y + 80)
    ctx.fill()
  }
  
  // 水面反光
  ctx.fillStyle = 'rgba(135, 206, 235, 0.3)'
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * canvas.width
    const y = canvas.height * 0.5 + Math.random() * canvas.height * 0.3
    ctx.fillRect(x, y, 100, 5)
  }
  
  return canvas
}

// 热点标记组件
interface HotspotMarkerProps {
  hotspot: Hotspot
  isActive: boolean
  onClick: () => void
}

function HotspotMarker({ hotspot, isActive, onClick }: HotspotMarkerProps) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (groupRef.current) {
      // 始终面向相机
      groupRef.current.lookAt(state.camera.position)
      // 悬浮动画
      groupRef.current.position.y = hotspot.position.y + Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })
  
  const IconComponent = {
    mountain: Mountain,
    users: Users,
    wheat: Wheat,
    info: Info
  }[hotspot.icon]
  
  return (
    <group 
      ref={groupRef}
      position={hotspot.position}
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <Html center>
        <motion.button
          animate={{ 
            scale: hovered || isActive ? 1.2 : 1,
            boxShadow: isActive 
              ? '0 0 20px rgba(167, 58, 54, 0.6)' 
              : '0 0 10px rgba(0,0,0,0.3)'
          }}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            isActive 
              ? 'bg-palace-500 text-white' 
              : 'bg-white/90 text-mountain-700 hover:bg-palace-100'
          }`}
          style={{ cursor: 'pointer' }}
        >
          <IconComponent className="w-6 h-6" />
        </motion.button>
      </Html>
    </group>
  )
}

// 3D场景
interface SceneProps {
  hotspots: Hotspot[]
  activeHotspot: string | null
  onHotspotClick: (id: string) => void
}

function Scene({ hotspots, activeHotspot, onHotspotClick }: SceneProps) {
  return (
    <>
      <PanoramaSphere />
      
      {hotspots.map(hotspot => (
        <HotspotMarker
          key={hotspot.id}
          hotspot={hotspot}
          isActive={activeHotspot === hotspot.id}
          onClick={() => onHotspotClick(hotspot.id)}
        />
      ))}
      
      <OrbitControls 
        enableZoom={false}
        enablePan={false}
        rotateSpeed={-0.3}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  )
}

// 信息面板
interface InfoPanelProps {
  hotspot: Hotspot | null
  onClose: () => void
  onCollect: () => void
}

function InfoPanel({ hotspot, onClose, onCollect }: InfoPanelProps) {
  if (!hotspot) return null
  
  const IconComponent = {
    mountain: Mountain,
    users: Users,
    wheat: Wheat,
    info: Info
  }[hotspot.icon]
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 w-80 bg-white/95 backdrop-blur rounded-2xl p-6 shadow-card z-20"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1 rounded-full hover:bg-paper-500"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-palace-500 rounded-xl flex items-center justify-center">
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-mountain-800">{hotspot.title}</h3>
      </div>
      
      <p className="text-mountain-600 mb-6 leading-relaxed">
        {hotspot.description}
      </p>
      
      <Button 
        variant="heritage" 
        className="w-full"
        onClick={onCollect}
      >
        <Sparkles className="w-4 h-4 mr-2" />
        收集文脉碎片
      </Button>
    </motion.div>
  )
}

// 导航指南
function NavigationGuide() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute bottom-20 left-1/2 -translate-x-1/2"
    >
      <div className="flex items-center gap-4 px-6 py-3 bg-white/90 backdrop-blur rounded-full text-mountain-600 text-sm">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          <span>拖动环顾四周</span>
        </div>
        <div className="w-px h-4 bg-mountain-300" />
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>点击热点探索</span>
        </div>
      </div>
    </motion.div>
  )
}

// 主组件
export default function HaniTerracePanorama() {
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null)
  const [isMuted, setIsMuted] = useState(true)
  const [collectedFragments, setCollectedFragments] = useState<string[]>([])
  const [showReward, setShowReward] = useState(false)
  
  const handleHotspotClick = (id: string) => {
    setActiveHotspot(activeHotspot === id ? null : id)
  }
  
  const handleCollect = () => {
    if (activeHotspot && !collectedFragments.includes(activeHotspot)) {
      setCollectedFragments(prev => [...prev, activeHotspot])
      
      // 收集完所有碎片时显示奖励
      if (collectedFragments.length + 1 >= HOTSPOTS.length) {
        setTimeout(() => setShowReward(true), 500)
      }
    }
    setActiveHotspot(null)
  }
  
  const resetExperience = () => {
    setActiveHotspot(null)
    setCollectedFragments([])
    setShowReward(false)
  }
  
  const activeHotspotData = HOTSPOTS.find(h => h.id === activeHotspot) || null

  return (
    <div className="relative w-full h-screen bg-mountain-900">
      {/* 3D Canvas */}
      <Canvas camera={{ fov: 75, position: [0, 0, 0.1] }}>
        <Suspense fallback={<Loader />}>
          <Scene 
            hotspots={HOTSPOTS}
            activeHotspot={activeHotspot}
            onHotspotClick={handleHotspotClick}
          />
        </Suspense>
      </Canvas>
      
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-bold">哈尼梯田</h2>
            <p className="text-sm text-white/70">世界文化遗产 · VR全景</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={resetExperience}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 收集进度 */}
      <div className="absolute top-20 left-4 z-10">
        <div className="bg-white/90 backdrop-blur rounded-xl p-3">
          <p className="text-xs text-mountain-500 mb-2">文脉碎片收集</p>
          <div className="flex gap-1">
            {HOTSPOTS.map(h => (
              <div
                key={h.id}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                  collectedFragments.includes(h.id)
                    ? 'bg-palace-500 text-white'
                    : 'bg-paper-600 text-mountain-400'
                }`}
              >
                {collectedFragments.includes(h.id) ? '✓' : '?'}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* 信息面板 */}
      <AnimatePresence>
        <InfoPanel 
          hotspot={activeHotspotData}
          onClose={() => setActiveHotspot(null)}
          onCollect={handleCollect}
        />
      </AnimatePresence>
      
      {/* 导航指南 */}
      {!activeHotspot && <NavigationGuide />}
      
      {/* 完成奖励 */}
      <AnimatePresence>
        {showReward && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute inset-0 flex items-center justify-center bg-black/70 z-50"
          >
            <div className="bg-white rounded-3xl p-8 max-w-sm mx-4 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: 2 }}
              >
                <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-gold-400 to-gold-600 rounded-2xl flex items-center justify-center shadow-heritage">
                  <Mountain className="w-12 h-12 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-mountain-800 mb-2">
                🎉 探索完成！
              </h3>
              <p className="text-mountain-500 mb-4">
                您已收集所有哈尼梯田文脉碎片
              </p>
              <div className="bg-paper-500 rounded-xl p-4 mb-6">
                <p className="font-bold text-palace-600">获得成就</p>
                <p className="text-sm text-mountain-600">「梯田守望者」徽章</p>
              </div>
              <Button variant="heritage" className="w-full" onClick={resetExperience}>
                <ChevronRight className="w-4 h-4 mr-2" />
                继续探索
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
