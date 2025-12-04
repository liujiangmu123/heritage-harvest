/**
 * 凤翔泥塑 - 3D虚拟捏塑体验
 * 模拟揉、捏、拉、压等手法制作泥塑
 */

import { useRef, useState, useCallback, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette,
  RotateCcw,
  Download,
  ChevronLeft,
  Info,
  Droplet,
  Move,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

// 工具类型
type ToolType = 'mold' | 'smooth' | 'pull' | 'push' | 'paint'

// 颜色配置（凤翔泥塑传统色彩）
const TRADITIONAL_COLORS = [
  { name: '朱红', color: '#DC2626' },
  { name: '明黄', color: '#EAB308' },
  { name: '翠绿', color: '#16A34A' },
  { name: '宝蓝', color: '#2563EB' },
  { name: '粉白', color: '#FDF2F8' },
  { name: '墨黑', color: '#1C1917' },
]

// 预设造型
const PRESET_SHAPES = [
  { id: 'tiger', name: '虎头', icon: '🐯' },
  { id: 'horse', name: '马', icon: '🐴' },
  { id: 'chicken', name: '鸡', icon: '🐔' },
  { id: 'fish', name: '鱼', icon: '🐟' },
  { id: 'custom', name: '自由', icon: '✨' },
]

// 可变形网格组件
function DeformableMesh({ 
  selectedTool, 
  selectedColor,
  onDeform 
}: { 
  selectedTool: ToolType
  selectedColor: string
  onDeform: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const geometryRef = useRef<THREE.SphereGeometry | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [paintedVertices, setPaintedVertices] = useState<Map<number, string>>(new Map())

  // 初始化几何体
  useState(() => {
    geometryRef.current = new THREE.SphereGeometry(1.5, 32, 32)
  })

  // 鼠标交互
  const handlePointerDown = (e: THREE.Event) => {
    e.stopPropagation()
    setIsDragging(true)
    
    if (meshRef.current && geometryRef.current) {
      const point = (e as any).point as THREE.Vector3
      const positions = geometryRef.current.attributes.position
      
      // 找到最近的顶点
      let minDist = Infinity
      let closestIdx = 0
      
      for (let i = 0; i < positions.count; i++) {
        const vx = positions.getX(i)
        const vy = positions.getY(i)
        const vz = positions.getZ(i)
        const dist = point.distanceTo(new THREE.Vector3(vx, vy, vz))
        
        if (dist < minDist) {
          minDist = dist
          closestIdx = i
        }
      }

      // 根据工具类型变形
      const radius = 0.5
      for (let i = 0; i < positions.count; i++) {
        const vx = positions.getX(i)
        const vy = positions.getY(i)
        const vz = positions.getZ(i)
        const vertex = new THREE.Vector3(vx, vy, vz)
        const dist = point.distanceTo(vertex)

        if (dist < radius) {
          const influence = 1 - dist / radius
          const direction = vertex.clone().sub(point).normalize()

          switch (selectedTool) {
            case 'pull':
              vertex.add(direction.multiplyScalar(influence * 0.1))
              break
            case 'push':
              vertex.sub(direction.multiplyScalar(influence * 0.1))
              break
            case 'smooth':
              // 平滑处理
              vertex.lerp(point, influence * 0.05)
              break
            case 'mold':
              vertex.add(direction.multiplyScalar(influence * 0.05))
              break
            case 'paint':
              setPaintedVertices(prev => new Map(prev).set(i, selectedColor))
              break
          }

          if (selectedTool !== 'paint') {
            positions.setXYZ(i, vertex.x, vertex.y, vertex.z)
          }
        }
      }

      if (selectedTool !== 'paint') {
        positions.needsUpdate = true
        geometryRef.current.computeVertexNormals()
      }
      
      onDeform()
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  const handlePointerMove = (e: THREE.Event) => {
    if (isDragging) {
      handlePointerDown(e)
    }
  }

  // 应用顶点颜色
  useFrame(() => {
    if (meshRef.current && geometryRef.current && paintedVertices.size > 0) {
      const colors = new Float32Array(geometryRef.current.attributes.position.count * 3)
      
      for (let i = 0; i < colors.length / 3; i++) {
        const paintedColor = paintedVertices.get(i)
        if (paintedColor) {
          const c = new THREE.Color(paintedColor)
          colors[i * 3] = c.r
          colors[i * 3 + 1] = c.g
          colors[i * 3 + 2] = c.b
        } else {
          colors[i * 3] = 0.9
          colors[i * 3 + 1] = 0.8
          colors[i * 3 + 2] = 0.7
        }
      }
      
      geometryRef.current.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    }
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometryRef.current || undefined}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial 
        vertexColors={paintedVertices.size > 0}
        color={paintedVertices.size > 0 ? undefined : '#E8D4B8'}
        roughness={0.8}
        metalness={0.1}
      />
    </mesh>
  )
}

// 工作台
function Workbench() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]} receiveShadow>
      <cylinderGeometry args={[3, 3.5, 0.5, 32]} />
      <meshStandardMaterial color="#8B4513" roughness={0.9} />
    </mesh>
  )
}

// 场景组件
function Scene({ 
  selectedTool, 
  selectedColor,
  onDeform 
}: { 
  selectedTool: ToolType
  selectedColor: string
  onDeform: () => void
}) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[-5, 3, -5]} intensity={0.5} color="#FCD34D" />
      
      <DeformableMesh 
        selectedTool={selectedTool} 
        selectedColor={selectedColor}
        onDeform={onDeform}
      />
      <Workbench />
      
      <OrbitControls 
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />
      
      <Environment preset="studio" />
    </>
  )
}

// 加载屏幕
function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-amber-950">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-200">正在加载泥塑工坊...</p>
      </div>
    </div>
  )
}

export default function FengxiangClaySculpture() {
  const [selectedTool, setSelectedTool] = useState<ToolType>('mold')
  const [selectedColor, setSelectedColor] = useState(TRADITIONAL_COLORS[0].color)
  const [selectedShape, setSelectedShape] = useState(PRESET_SHAPES[4])
  const [showGuide, setShowGuide] = useState(true)
  const [deformCount, setDeformCount] = useState(0)

  const tools: { id: ToolType; name: string; icon: React.ReactNode }[] = [
    { id: 'mold', name: '塑形', icon: <Move className="w-5 h-5" /> },
    { id: 'pull', name: '拉伸', icon: <ZoomOut className="w-5 h-5" /> },
    { id: 'push', name: '按压', icon: <ZoomIn className="w-5 h-5" /> },
    { id: 'smooth', name: '抚平', icon: <Droplet className="w-5 h-5" /> },
    { id: 'paint', name: '上色', icon: <Palette className="w-5 h-5" /> },
  ]

  const handleDeform = useCallback(() => {
    setDeformCount(prev => prev + 1)
  }, [])

  const handleReset = () => {
    setDeformCount(0)
    // 重新加载页面以重置模型
    window.location.reload()
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-900 via-orange-900 to-stone-900">
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
          <Sparkles className="w-5 h-5" />
          凤翔泥塑
        </h1>

        <button
          onClick={() => setShowGuide(true)}
          className="p-2 bg-black/40 backdrop-blur rounded-full text-amber-100 hover:bg-black/60 transition-colors"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* 3D 画布 */}
      <div className="absolute inset-0 pt-16 pb-32">
        <Suspense fallback={<LoadingScreen />}>
          <Canvas shadows camera={{ position: [0, 2, 5], fov: 50 }}>
            <Scene 
              selectedTool={selectedTool} 
              selectedColor={selectedColor}
              onDeform={handleDeform}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* 左侧工具栏 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        <div className="bg-black/40 backdrop-blur rounded-2xl p-2 space-y-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`
                w-12 h-12 rounded-xl flex items-center justify-center transition-all
                ${selectedTool === tool.id 
                  ? 'bg-amber-500 text-white' 
                  : 'text-amber-200 hover:bg-white/10'
                }
              `}
              title={tool.name}
            >
              {tool.icon}
            </button>
          ))}
          
          <div className="w-full h-px bg-white/20" />
          
          <button
            onClick={handleReset}
            className="w-12 h-12 rounded-xl flex items-center justify-center text-amber-200 hover:bg-white/10 transition-all"
            title="重置"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 右侧颜色选择（上色模式时显示） */}
      <AnimatePresence>
        {selectedTool === 'paint' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10"
          >
            <div className="bg-black/40 backdrop-blur rounded-2xl p-2 space-y-2">
              {TRADITIONAL_COLORS.map((c) => (
                <button
                  key={c.color}
                  onClick={() => setSelectedColor(c.color)}
                  className={`
                    w-10 h-10 rounded-full transition-all border-2
                    ${selectedColor === c.color 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: c.color }}
                  title={c.name}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部形状选择 */}
      <div className="absolute bottom-20 left-0 right-0 z-10">
        <div className="flex justify-center gap-3">
          {PRESET_SHAPES.map((shape) => (
            <button
              key={shape.id}
              onClick={() => setSelectedShape(shape)}
              className={`
                px-4 py-3 rounded-xl transition-all flex items-center gap-2
                ${selectedShape.id === shape.id 
                  ? 'bg-amber-500 text-white' 
                  : 'bg-black/40 text-amber-200 hover:bg-black/60'
                }
              `}
            >
              <span className="text-xl">{shape.icon}</span>
              <span className="text-sm">{shape.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 底部信息栏 */}
      <div className="absolute bottom-6 left-0 right-0 z-10">
        <div className="flex justify-center items-center gap-6 text-amber-200/60 text-sm">
          <span>当前工具: {tools.find(t => t.id === selectedTool)?.name}</span>
          <span>•</span>
          <span>操作次数: {deformCount}</span>
          <span>•</span>
          <span>拖动鼠标在泥塑上操作</span>
        </div>
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
                <Sparkles className="w-6 h-6" />
                凤翔泥塑工坊
              </h2>
              
              <div className="space-y-4 text-amber-200/80">
                <p>
                  凤翔泥塑是陕西省宝鸡市凤翔区的传统民间艺术，被誉为"中国泥塑艺术之乡"。
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    <span><strong>塑形</strong> - 基础造型工具</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomOut className="w-4 h-4" />
                    <span><strong>拉伸</strong> - 向外拉伸泥塑</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ZoomIn className="w-4 h-4" />
                    <span><strong>按压</strong> - 向内按压泥塑</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Droplet className="w-4 h-4" />
                    <span><strong>抚平</strong> - 平滑表面</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span><strong>上色</strong> - 涂抹传统色彩</span>
                  </div>
                </div>

                <div className="p-4 bg-black/30 rounded-xl">
                  <p className="text-sm">
                    💡 凤翔泥塑以其鲜艳的色彩和夸张的造型著称，常见题材有虎、马、猴等吉祥动物。
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowGuide(false)}
                className="mt-6 w-full py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold transition-colors"
              >
                开始创作
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
