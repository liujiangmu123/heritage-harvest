/**
 * 3D虚拟展厅组件
 * 沉浸式空间漫游体验非遗艺术
 */

import { useRef, useState, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  PerspectiveCamera,
  Environment,
  Text,
  Html,
  useTexture,
  Float,
  MeshReflectorMaterial
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Info, 
  Volume2,
  Maximize,
  RotateCcw
} from 'lucide-react'
import { Link } from 'react-router-dom'

// 展品数据
const EXHIBITS = [
  {
    id: 'bamboo',
    name: '安溪藤铁工艺',
    description: '福建省安溪县传统手工艺，将藤条与铁丝巧妙结合编织成精美工艺品。',
    image: 'https://images.unsplash.com/photo-1595513046791-c87a6f0c3947?w=800',
    position: [-4, 1.5, -3],
    rotation: [0, 0.3, 0],
    link: '/experience/bamboo-weaving',
  },
  {
    id: 'paper',
    name: '中国剪纸艺术',
    description: '拥有1500多年历史的民间艺术，2009年入选世界非遗名录。',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
    position: [0, 1.5, -4],
    rotation: [0, 0, 0],
    link: '/experience/paper-cutting',
  },
  {
    id: 'terrace',
    name: '哈尼梯田',
    description: '云南红河哈尼族1300年农耕智慧结晶，2013年列入世界文化遗产。',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800',
    position: [4, 1.5, -3],
    rotation: [0, -0.3, 0],
    link: '/experience/hani-terrace',
  },
]

// 展品画框组件
function ExhibitFrame({ 
  exhibit, 
  isActive, 
  onClick 
}: { 
  exhibit: typeof EXHIBITS[0]
  isActive: boolean
  onClick: () => void 
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  
  useFrame((state) => {
    if (meshRef.current) {
      // 悬浮动画
      meshRef.current.position.y = exhibit.position[1] + Math.sin(state.clock.elapsedTime + exhibit.position[0]) * 0.05
    }
  })

  return (
    <group position={exhibit.position as [number, number, number]} rotation={exhibit.rotation as [number, number, number]}>
      {/* 画框 */}
      <mesh
        ref={meshRef}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[2.2, 1.5, 0.1]} />
        <meshStandardMaterial 
          color={isActive ? '#D97706' : hovered ? '#92400E' : '#1C1917'} 
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* 图片区域 */}
      <mesh position={[0, 0, 0.06]}>
        <planeGeometry args={[2, 1.3]} />
        <meshBasicMaterial color="#374151" />
      </mesh>

      {/* 发光边框 */}
      {(hovered || isActive) && (
        <mesh position={[0, 0, 0.05]}>
          <ringGeometry args={[1.12, 1.15, 4]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.6} />
        </mesh>
      )}

      {/* 标题 */}
      <Text
        position={[0, -1, 0.1]}
        fontSize={0.15}
        color={isActive ? '#F59E0B' : '#FFFFFF'}
        anchorX="center"
        anchorY="middle"
        font="/fonts/noto-sans-sc.woff"
      >
        {exhibit.name}
      </Text>

      {/* 信息标签 */}
      {hovered && (
        <Html position={[0, 0.9, 0.2]} center>
          <div className="bg-black/80 backdrop-blur px-3 py-1 rounded-full text-white text-xs whitespace-nowrap">
            点击查看详情
          </div>
        </Html>
      )}
    </group>
  )
}

// 地面
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <MeshReflectorMaterial
        blur={[300, 100]}
        resolution={1024}
        mixBlur={1}
        mixStrength={40}
        roughness={1}
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#050505"
        metalness={0.5}
        mirror={0.5}
      />
    </mesh>
  )
}

// 环境灯光
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <spotLight
        position={[0, 10, 0]}
        angle={0.5}
        penumbra={1}
        intensity={1}
        castShadow
      />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#F59E0B" />
      <pointLight position={[5, 5, -5]} intensity={0.5} color="#3B82F6" />
    </>
  )
}

// 装饰柱子
function Pillars() {
  return (
    <>
      {[[-6, 0, -6], [6, 0, -6], [-6, 0, 2], [6, 0, 2]].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]}>
          <cylinderGeometry args={[0.3, 0.3, 4, 32]} />
          <meshStandardMaterial color="#1C1917" metalness={0.9} roughness={0.1} />
        </mesh>
      ))}
    </>
  )
}

// 浮动装饰
function FloatingOrbs() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <Float
          key={i}
          speed={1 + Math.random()}
          rotationIntensity={0.5}
          floatIntensity={0.5}
          position={[
            (Math.random() - 0.5) * 12,
            2 + Math.random() * 2,
            (Math.random() - 0.5) * 8 - 2,
          ]}
        >
          <mesh>
            <sphereGeometry args={[0.05 + Math.random() * 0.1, 16, 16]} />
            <meshStandardMaterial
              color={['#F59E0B', '#3B82F6', '#10B981', '#EC4899'][i % 4]}
              emissive={['#F59E0B', '#3B82F6', '#10B981', '#EC4899'][i % 4]}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// 3D场景
function Scene({ 
  activeExhibit, 
  onExhibitClick 
}: { 
  activeExhibit: string | null
  onExhibitClick: (id: string) => void 
}) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 2, 6]} fov={60} />
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={10}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1, -2]}
      />
      
      <Lighting />
      <Floor />
      <Pillars />
      <FloatingOrbs />
      
      {EXHIBITS.map((exhibit) => (
        <ExhibitFrame
          key={exhibit.id}
          exhibit={exhibit}
          isActive={activeExhibit === exhibit.id}
          onClick={() => onExhibitClick(exhibit.id)}
        />
      ))}

      <Environment preset="night" />
    </>
  )
}

// 加载界面
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-ink-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-heritage-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white text-lg">正在加载虚拟展厅...</p>
      </div>
    </div>
  )
}

// 主组件
export default function VirtualGallery() {
  const [activeExhibit, setActiveExhibit] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)

  const currentExhibit = EXHIBITS.find(e => e.id === activeExhibit)

  return (
    <div className="fixed inset-0 bg-ink-950">
      {/* 3D Canvas */}
      <Suspense fallback={<LoadingScreen />}>
        <Canvas shadows dpr={[1, 2]}>
          <Scene 
            activeExhibit={activeExhibit} 
            onExhibitClick={setActiveExhibit} 
          />
        </Canvas>
      </Suspense>

      {/* 顶部导航 */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10">
        <Link
          to="/"
          className="flex items-center gap-2 px-4 py-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          返回首页
        </Link>
        
        <div className="flex items-center gap-2">
          <button className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors">
            <Volume2 className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors">
            <Maximize className="w-5 h-5" />
          </button>
          <button className="p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-black/70 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 底部展品导航 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-4 mb-4">
            {EXHIBITS.map((exhibit) => (
              <button
                key={exhibit.id}
                onClick={() => setActiveExhibit(exhibit.id)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all
                  ${activeExhibit === exhibit.id
                    ? 'bg-heritage-500 text-white scale-105'
                    : 'bg-black/50 text-white/70 hover:bg-black/70 hover:text-white'
                  }
                `}
              >
                {exhibit.name}
              </button>
            ))}
          </div>
          
          <p className="text-center text-white/50 text-sm">
            拖动鼠标旋转视角 · 滚轮缩放 · 点击展品查看详情
          </p>
        </div>
      </div>

      {/* 展品详情面板 */}
      <AnimatePresence>
        {currentExhibit && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="absolute top-20 right-4 bottom-20 w-80 bg-black/80 backdrop-blur-xl rounded-2xl p-6 z-10"
          >
            <button
              onClick={() => setActiveExhibit(null)}
              className="absolute top-4 right-4 p-1 hover:bg-white/10 rounded-full"
            >
              <X className="w-5 h-5 text-white" />
            </button>

            <div className="h-full flex flex-col">
              <div className="mb-4">
                <span className="px-2 py-1 bg-heritage-500/20 text-heritage-400 text-xs rounded-full">
                  国家级非遗
                </span>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">
                {currentExhibit.name}
              </h2>

              <p className="text-white/70 text-sm leading-relaxed mb-6">
                {currentExhibit.description}
              </p>

              <div className="mt-auto">
                <Link
                  to={currentExhibit.link}
                  className="block w-full py-3 bg-gradient-to-r from-heritage-500 to-primary-500 text-white text-center rounded-xl font-semibold hover:shadow-lg hover:shadow-heritage-500/25 transition-all"
                >
                  开始互动体验
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 左下角提示 */}
      <div className="absolute bottom-20 left-4 z-10">
        <div className="bg-black/50 backdrop-blur rounded-xl p-4 max-w-xs">
          <div className="flex items-center gap-2 text-heritage-400 text-sm mb-2">
            <Info className="w-4 h-4" />
            虚拟展厅
          </div>
          <p className="text-white/70 text-xs">
            欢迎来到非遗数字展厅，这里展示了中国珍贵的非物质文化遗产。
            点击展品可查看详情并进入互动体验。
          </p>
        </div>
      </div>
    </div>
  )
}
