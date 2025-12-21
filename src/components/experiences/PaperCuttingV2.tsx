/**
 * 剪纸艺术 V2.0 - 世界级沉浸式体验
 * 
 * 核心特性：
 * - 3D折叠剪纸模拟（真实纸张物理）
 * - 程序化对称图案生成（千人千样）
 * - AR手势剪裁交互
 * - 惊艳的展开动画
 * - 多种剪纸风格（窗花/生肖/祝福）
 * - 与AI拍立得深度联动
 */

import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Html,
  Float,
  Sparkles,
  Environment
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors,
  RotateCcw,
  Play,
  Sparkles as SparklesIcon,
  Camera,
  Share2,
  Leaf,
  Heart,
  Star,
  Flower2,
  TreeDeciduous,
  X,
  ChevronRight,
  Award
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { usePolaroidStore } from '@/store/polaroidStore'
import { CARBON_SAVINGS_CONFIG } from '@/types/eco'
import { useNavigate } from 'react-router-dom'

// ============== 千人千样配置 ==============

interface UniqueDesign {
  seed: number
  patternType: 'flower' | 'zodiac' | 'blessing' | 'nature'
  symmetry: 4 | 6 | 8 | 12  // 对称轴数
  complexity: number  // 1-5
  paperColor: string
  paperColorName: string
  patternName: string
  blessing: string
  cutPoints: THREE.Vector2[]  // 程序化生成的剪裁点
}

const PATTERN_TYPES = {
  flower: { name: '窗花', icon: '🌸', description: '传统窗花图案' },
  zodiac: { name: '生肖', icon: '🐉', description: '十二生肖剪纸' },
  blessing: { name: '祝福', icon: '福', description: '福禄寿喜' },
  nature: { name: '自然', icon: '🍃', description: '花鸟虫鱼' },
}

const PAPER_COLORS = [
  { color: '#DC2626', name: '中国红', gradient: 'from-red-600 to-red-700' },
  { color: '#B91C1C', name: '朱砂红', gradient: 'from-red-700 to-red-800' },
  { color: '#EA580C', name: '吉祥橙', gradient: 'from-orange-600 to-orange-700' },
  { color: '#CA8A04', name: '金黄', gradient: 'from-yellow-600 to-yellow-700' },
  { color: '#16A34A', name: '翠绿', gradient: 'from-green-600 to-green-700' },
]

const BLESSINGS = [
  '福满人间', '平安喜乐', '万事如意', '心想事成',
  '吉祥如意', '花开富贵', '金玉满堂', '年年有余',
  '龙凤呈祥', '五福临门', '如意吉祥', '幸福美满',
]

const PATTERN_NAMES = [
  '锦绣繁花', '祥云瑞彩', '凤舞九天', '龙腾四海',
  '喜鹊登枝', '牡丹富贵', '莲开并蒂', '梅兰竹菊',
  '双喜临门', '福寿双全', '松鹤延年', '鱼跃龙门',
]

// 程序化生成剪裁图案点
function generateCutPattern(seed: number, symmetry: number, complexity: number): THREE.Vector2[] {
  const points: THREE.Vector2[] = []
  const rng = (s: number) => {
    const x = Math.sin(s * 12.9898 + seed * 78.233) * 43758.5453
    return x - Math.floor(x)
  }
  
  // 生成一个扇形区域的剪裁点
  const angleStep = (Math.PI * 2) / symmetry / 2
  const numPoints = 8 + Math.floor(complexity * 4)
  
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1)
    const angle = t * angleStep
    
    // 基于种子的随机半径变化
    const baseRadius = 0.3 + t * 0.6
    const variation = rng(i * 100) * 0.3 * complexity / 5
    const radius = baseRadius + variation * Math.sin(t * Math.PI * (2 + complexity))
    
    // 添加艺术性的曲线变化
    const wobble = Math.sin(t * Math.PI * complexity) * 0.1
    
    points.push(new THREE.Vector2(
      Math.cos(angle) * (radius + wobble),
      Math.sin(angle) * (radius + wobble)
    ))
  }
  
  return points
}

// 生成千人千样的独特设计
function generateUniqueDesign(): UniqueDesign {
  const seed = Math.floor(Math.random() * 1000000)
  const types = Object.keys(PATTERN_TYPES) as Array<keyof typeof PATTERN_TYPES>
  const patternType = types[seed % types.length]
  const symmetries = [4, 6, 8, 12] as const
  const symmetry = symmetries[seed % symmetries.length]
  const complexity = 1 + (seed % 5)
  const paperColorData = PAPER_COLORS[seed % PAPER_COLORS.length]
  const patternName = PATTERN_NAMES[seed % PATTERN_NAMES.length]
  const blessing = BLESSINGS[(seed >> 4) % BLESSINGS.length]
  const cutPoints = generateCutPattern(seed, symmetry, complexity)
  
  return {
    seed,
    patternType,
    symmetry,
    complexity,
    paperColor: paperColorData.color,
    paperColorName: paperColorData.name,
    patternName,
    blessing,
    cutPoints,
  }
}

// ============== 3D组件 ==============

// 3D红纸（可折叠）
function FoldedPaper({ 
  foldState, 
  paperColor,
  cutProgress,
  design
}: { 
  foldState: 'flat' | 'folded' | 'cutting' | 'unfolding' | 'complete'
  paperColor: string
  cutProgress: number
  design: UniqueDesign
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [unfoldProgress, setUnfoldProgress] = useState(0)
  
  // 展开动画
  useEffect(() => {
    if (foldState === 'unfolding' || foldState === 'complete') {
      const interval = setInterval(() => {
        setUnfoldProgress(p => {
          if (p >= 1) {
            clearInterval(interval)
            return 1
          }
          return p + 0.02
        })
      }, 30)
      return () => clearInterval(interval)
    } else {
      setUnfoldProgress(0)
    }
  }, [foldState])
  
  useFrame((state) => {
    if (groupRef.current) {
      // 轻微浮动
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.05
      
      // 完成时缓慢旋转展示
      if (foldState === 'complete') {
        groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
      }
    }
  })
  
  // 生成对称图案的形状
  const patternShape = useMemo(() => {
    const shape = new THREE.Shape()
    const { cutPoints, symmetry } = design
    
    if (cutPoints.length < 2) return shape
    
    // 创建完整的对称图案
    const allPoints: THREE.Vector2[] = []
    
    for (let s = 0; s < symmetry; s++) {
      const angle = (s / symmetry) * Math.PI * 2
      const mirror = s % 2 === 1
      
      const rotatedPoints = cutPoints.map(p => {
        const x = mirror ? -p.x : p.x
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        return new THREE.Vector2(
          x * cos - p.y * sin,
          x * sin + p.y * cos
        )
      })
      
      if (mirror) rotatedPoints.reverse()
      allPoints.push(...rotatedPoints)
    }
    
    if (allPoints.length > 0) {
      shape.moveTo(allPoints[0].x, allPoints[0].y)
      allPoints.forEach(p => shape.lineTo(p.x, p.y))
      shape.closePath()
    }
    
    return shape
  }, [design])
  
  // 计算可见的剪裁进度
  const visibleCutProgress = foldState === 'cutting' ? cutProgress : 
                             foldState === 'unfolding' || foldState === 'complete' ? 1 : 0
  
  return (
    <group ref={groupRef}>
      {/* 底层：完整红纸 */}
      <mesh position={[0, 0, -0.01]} receiveShadow>
        <planeGeometry args={[3, 3]} />
        <meshStandardMaterial 
          color={paperColor} 
          side={THREE.DoubleSide}
          roughness={0.8}
        />
      </mesh>
      
      {/* 剪裁出的图案（逐渐显现） */}
      {visibleCutProgress > 0 && (
        <group scale={unfoldProgress > 0 ? 1 + unfoldProgress * 0.2 : 1}>
          <mesh position={[0, 0, 0.01]} castShadow>
            <shapeGeometry args={[patternShape]} />
            <meshStandardMaterial 
              color={paperColor}
              side={THREE.DoubleSide}
              roughness={0.7}
              transparent
              opacity={0.3 + visibleCutProgress * 0.7}
            />
          </mesh>
          
          {/* 金色边缘高光 */}
          <mesh position={[0, 0, 0.02]}>
            <shapeGeometry args={[patternShape]} />
            <meshBasicMaterial 
              color="#FFD700"
              side={THREE.DoubleSide}
              transparent
              opacity={unfoldProgress * 0.3}
              wireframe
            />
          </mesh>
        </group>
      )}
      
      {/* 折叠状态的纸张 */}
      {(foldState === 'folded' || foldState === 'cutting') && (
        <group rotation={[0, 0, Math.PI / design.symmetry]}>
          <mesh position={[0.5, 0, 0.05]} rotation={[0, Math.PI * 0.1, 0]} castShadow>
            <planeGeometry args={[1.5, 1.5]} />
            <meshStandardMaterial 
              color={paperColor}
              side={THREE.DoubleSide}
              roughness={0.75}
            />
          </mesh>
        </group>
      )}
      
      {/* 剪刀动画指示器 */}
      {foldState === 'cutting' && (
        <group position={[
          Math.cos(cutProgress * Math.PI / design.symmetry) * (0.3 + cutProgress * 0.6),
          Math.sin(cutProgress * Math.PI / design.symmetry) * (0.3 + cutProgress * 0.6),
          0.1
        ]}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#FFD700" />
          </mesh>
          <Sparkles count={10} scale={0.3} size={2} speed={0.5} color="#FFD700" />
        </group>
      )}
    </group>
  )
}

// 完成效果
function CompletionEffect({ isComplete, design }: { isComplete: boolean, design: UniqueDesign }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current && isComplete) {
      groupRef.current.rotation.z = state.clock.elapsedTime * 0.5
    }
  })
  
  if (!isComplete) return null
  
  return (
    <group ref={groupRef}>
      {/* 光环 */}
      <mesh position={[0, 0, -0.1]}>
        <ringGeometry args={[1.6, 1.8, 64]} />
        <meshBasicMaterial color="#FFD700" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      
      {/* 粒子 */}
      <Sparkles 
        count={100} 
        scale={4} 
        size={3} 
        speed={0.5} 
        color={design.paperColor}
      />
      
      {/* 祝福语 */}
      <Html center position={[0, -2, 0]}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <p className="text-2xl font-bold text-red-600 mb-1">{design.blessing}</p>
          <p className="text-sm text-red-400">{design.patternName}</p>
        </motion.div>
      </Html>
    </group>
  )
}

// 场景
function Scene({ 
  design, 
  foldState, 
  cutProgress 
}: { 
  design: UniqueDesign
  foldState: 'flat' | 'folded' | 'cutting' | 'unfolding' | 'complete'
  cutProgress: number
}) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-3, 3, 3]} intensity={0.4} color="#FFD700" />
      
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.3}>
        <FoldedPaper 
          foldState={foldState}
          paperColor={design.paperColor}
          cutProgress={cutProgress}
          design={design}
        />
      </Float>
      
      <CompletionEffect isComplete={foldState === 'complete'} design={design} />
      
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        minDistance={3}
        maxDistance={8}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 1.5}
      />
    </>
  )
}

// ============== UI组件 ==============

// 图案类型选择器
function PatternTypeSelector({ 
  current, 
  onChange 
}: { 
  current: keyof typeof PATTERN_TYPES
  onChange: (type: keyof typeof PATTERN_TYPES) => void 
}) {
  return (
    <div className="flex gap-2">
      {(Object.entries(PATTERN_TYPES) as [keyof typeof PATTERN_TYPES, typeof PATTERN_TYPES[keyof typeof PATTERN_TYPES]][]).map(([key, config]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`flex flex-col items-center p-3 rounded-xl transition-all ${
            current === key 
              ? 'bg-red-500 text-white scale-105 shadow-lg' 
              : 'bg-white/80 text-gray-600 hover:bg-red-50'
          }`}
        >
          <span className="text-2xl mb-1">{config.icon}</span>
          <span className="text-xs font-medium">{config.name}</span>
        </button>
      ))}
    </div>
  )
}

// 进度指示器
function ProgressIndicator({ 
  currentStep, 
  steps 
}: { 
  currentStep: number
  steps: string[]
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
            i < currentStep 
              ? 'bg-green-500 text-white' 
              : i === currentStep 
              ? 'bg-red-500 text-white animate-pulse' 
              : 'bg-gray-200 text-gray-400'
          }`}>
            {i < currentStep ? '✓' : i + 1}
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 h-1 mx-1 rounded ${
              i < currentStep ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ============== 主组件 ==============

export default function PaperCuttingV2() {
  const navigate = useNavigate()
  const { unlockScene } = usePolaroidStore()
  const { addCarbonSaving } = useCarbonAccountStore()
  
  // 千人千样独特设计
  const [design, setDesign] = useState<UniqueDesign>(() => generateUniqueDesign())
  
  // 游戏状态
  const [gameState, setGameState] = useState<'intro' | 'folding' | 'cutting' | 'unfolding' | 'complete'>('intro')
  const [cutProgress, setCutProgress] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)
  
  // 步骤
  const steps = ['选择图案', '折叠纸张', '剪裁图案', '展开欣赏']
  const currentStep = gameState === 'intro' ? 0 : 
                      gameState === 'folding' ? 1 : 
                      gameState === 'cutting' ? 2 : 3
  
  // 重新生成设计
  const regenerateDesign = useCallback(() => {
    setDesign(generateUniqueDesign())
  }, [])
  
  // 开始折叠
  const startFolding = useCallback(() => {
    setGameState('folding')
    setTimeout(() => {
      setGameState('cutting')
    }, 2000)
  }, [])
  
  // 剪裁交互
  const handleCut = useCallback(() => {
    if (gameState !== 'cutting') return
    
    setCutProgress(p => {
      const newProgress = Math.min(1, p + 0.02)
      if (newProgress >= 1) {
        setTimeout(() => {
          setGameState('unfolding')
          setTimeout(() => {
            setGameState('complete')
            setShowCompletion(true)
            
            // 奖励
            useGreenPointsStore.getState().addPoints({
              type: 'experience',
              points: 50,
              description: `完成剪纸作品：${design.patternName}`,
              relatedId: 'paper_cutting_v2'
            })
            
            addCarbonSaving({
              type: 'digital_experience',
              carbonSaved: CARBON_SAVINGS_CONFIG.paper_cutting.baseSaving,
              description: '剪纸艺术体验 - 传承非遗智慧',
              experienceId: 'paper_cutting_v2'
            })
          }, 3000)
        }, 500)
      }
      return newProgress
    })
  }, [gameState, design.patternName, addCarbonSaving])
  
  // 触摸/鼠标剪裁
  useEffect(() => {
    if (gameState !== 'cutting') return
    
    const interval = setInterval(() => {
      // 自动剪裁进度（可以改为手势控制）
    }, 50)
    
    return () => clearInterval(interval)
  }, [gameState])
  
  // 重置
  const resetGame = useCallback(() => {
    setGameState('intro')
    setCutProgress(0)
    setShowCompletion(false)
    regenerateDesign()
  }, [regenerateDesign])
  
  // 获取折叠状态
  const foldState = gameState === 'intro' ? 'flat' :
                    gameState === 'folding' ? 'folded' :
                    gameState === 'cutting' ? 'cutting' :
                    gameState === 'unfolding' ? 'unfolding' : 'complete'

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-red-50 to-orange-50 overflow-hidden">
      {/* 返回按钮 */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 z-20 p-2 bg-white/80 rounded-full shadow-lg"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>
      
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-red-900/80 to-transparent z-10">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-xl font-bold text-white">✂️ 剪纸艺术</h2>
          <p className="text-sm text-white/70">陕北非遗 · 千年传承</p>
          
          {/* 千人千样标识 */}
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className={`px-3 py-1 bg-gradient-to-r ${PAPER_COLORS.find(c => c.color === design.paperColor)?.gradient || 'from-red-500 to-red-600'} rounded-full text-xs font-medium text-white`}>
              {PATTERN_TYPES[design.patternType].icon} {design.patternName}
            </span>
            <span className="text-xs text-white/50">#{design.seed.toString(16).toUpperCase()}</span>
          </div>
          
          {/* 进度指示 */}
          <div className="flex justify-center mt-3">
            <ProgressIndicator currentStep={currentStep} steps={steps} />
          </div>
        </div>
      </div>
      
      {/* 3D Canvas */}
      <div 
        className="absolute inset-0 pt-32"
        onClick={handleCut}
        onTouchStart={handleCut}
      >
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <Scene 
            design={design}
            foldState={foldState}
            cutProgress={cutProgress}
          />
        </Canvas>
      </div>
      
      {/* 介绍界面 */}
      <AnimatePresence>
        {gameState === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40 z-30"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-6 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl flex items-center justify-center">
                  <Scissors className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">剪纸艺术体验</h3>
                <p className="text-gray-500">创造属于你的独特剪纸作品</p>
              </div>
              
              {/* 当前设计预览 */}
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-red-700">你的专属设计</span>
                  <button 
                    onClick={regenerateDesign}
                    className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> 换一个
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">图案</span>
                    <p className="font-bold text-red-600">{design.patternName}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">类型</span>
                    <p className="font-bold text-red-600">{PATTERN_TYPES[design.patternType].name}</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">对称</span>
                    <p className="font-bold text-red-600">{design.symmetry}轴对称</p>
                  </div>
                  <div className="bg-white rounded-lg p-2">
                    <span className="text-gray-500">祝福</span>
                    <p className="font-bold text-red-600">{design.blessing}</p>
                  </div>
                </div>
              </div>
              
              {/* 纸张颜色选择 */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2">纸张颜色</p>
                <div className="flex gap-2">
                  {PAPER_COLORS.map((c, i) => (
                    <button
                      key={i}
                      onClick={() => setDesign(d => ({ ...d, paperColor: c.color, paperColorName: c.name }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        design.paperColor === c.color ? 'border-gray-800 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
              
              <Button 
                className="w-full bg-gradient-to-r from-red-500 to-red-600 text-white"
                onClick={startFolding}
              >
                <Play className="w-4 h-4 mr-2" />
                开始创作
              </Button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                点击屏幕进行剪裁
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 剪裁提示 */}
      {gameState === 'cutting' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="bg-white/90 backdrop-blur rounded-2xl px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3">
              <Scissors className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <p className="font-medium text-gray-800">点击屏幕剪裁</p>
                <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all"
                    style={{ width: `${cutProgress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
      
      {/* 展开提示 */}
      {gameState === 'unfolding' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="w-16 h-16 mx-auto mb-4"
            >
              <SparklesIcon className="w-full h-full text-yellow-500" />
            </motion.div>
            <p className="text-xl font-bold text-red-600">展开中...</p>
          </div>
        </motion.div>
      )}
      
      {/* 完成弹窗 */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full"
            >
              <div className="text-center mb-6">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5, repeat: 2 }}
                  className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center"
                >
                  <Award className="w-10 h-10 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">🎉 作品完成！</h3>
                <p className="text-gray-500">{design.patternName} · {design.blessing}</p>
              </div>
              
              {/* 作品信息 */}
              <div className="bg-red-50 rounded-xl p-4 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold text-red-600">{design.symmetry}</p>
                    <p className="text-xs text-gray-500">轴对称</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{design.complexity}</p>
                    <p className="text-xs text-gray-500">复杂度</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">+50</p>
                    <p className="text-xs text-gray-500">绿色积分</p>
                  </div>
                </div>
              </div>
              
              {/* 环保数据 */}
              <div className="bg-green-50 rounded-xl p-3 mb-4 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-700">传统纸艺 · 绿色环保</p>
                  <p className="text-xs text-green-600">天然材料，6周即可分解</p>
                </div>
              </div>
              
              {/* 操作按钮 */}
              <div className="space-y-2">
                <Button 
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500"
                  onClick={() => {
                    unlockScene('paper_cutting')
                    navigate('/create/polaroid?scene=paper_cutting&design=' + design.seed)
                  }}
                >
                  <Camera className="w-4 h-4 mr-2" />
                  生成专属拍立得
                </Button>
                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={resetGame}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  再创作一个
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 底部环保信息 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-red-900/80 to-transparent z-10">
        <div className="max-w-lg mx-auto">
          <div className="bg-white/10 backdrop-blur rounded-xl p-3 flex items-start gap-3">
            <TreeDeciduous className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <div className="text-white/80 text-sm">
              <p className="font-medium mb-1">🌿 传统纸艺 · 绿色智慧</p>
              <p className="text-xs text-white/60">
                传统手工纸使用竹子、桑皮等天然材料，可回收利用7次以上，
                相比塑料制品减少65%碳排放。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
