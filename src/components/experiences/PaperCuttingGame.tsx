/**
 * 剪纸艺术AR互动游戏组件
 * 『码』上寻踪 - 陕北剪纸艺术体验
 * 
 * 用户通过触摸/滑动沿着虚线"剪"出传统剪纸图案
 * 支持多种经典图案：平安福、双喜、生肖等
 */

import { useRef, useState, useCallback, useEffect, Suspense } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Html,
  useProgress,
  PerspectiveCamera,
  Line
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Scissors, 
  RotateCcw, 
  Play,
  Award,
  ChevronRight,
  Sparkles,
  Hand,
  Check
} from 'lucide-react'
import { Button } from '@/components/ui/Button'

// 加载指示器
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

// 剪纸图案定义 - 使用SVG路径转换为点阵
interface CuttingPattern {
  name: string
  meaning: string
  paths: THREE.Vector2[][]  // 多条剪裁路径
  difficulty: 'easy' | 'medium' | 'hard'
}

// 平安福图案 - 简化的剪裁路径
const PATTERNS: Record<string, CuttingPattern> = {
  fu: {
    name: '平安福',
    meaning: '福气满满，平安喜乐',
    difficulty: 'easy',
    paths: [
      // 外框 - 方形
      [
        new THREE.Vector2(-2, -2),
        new THREE.Vector2(-2, 2),
        new THREE.Vector2(2, 2),
        new THREE.Vector2(2, -2),
        new THREE.Vector2(-2, -2),
      ],
      // 内部装饰 - "福"字轮廓简化
      [
        new THREE.Vector2(-1.5, 1),
        new THREE.Vector2(-0.5, 1),
        new THREE.Vector2(-0.5, 0),
        new THREE.Vector2(-1.5, 0),
      ],
      [
        new THREE.Vector2(0, 1),
        new THREE.Vector2(1.5, 1),
        new THREE.Vector2(1.5, -1),
        new THREE.Vector2(0, -1),
        new THREE.Vector2(0, 1),
      ],
    ]
  },
  xi: {
    name: '双喜',
    meaning: '喜事连连，好事成双',
    difficulty: 'medium',
    paths: [
      // 左喜
      [
        new THREE.Vector2(-2, 2),
        new THREE.Vector2(-2, -2),
        new THREE.Vector2(-1, -2),
        new THREE.Vector2(-1, 0),
        new THREE.Vector2(-0.3, 0),
        new THREE.Vector2(-0.3, 2),
      ],
      // 右喜
      [
        new THREE.Vector2(0.3, 2),
        new THREE.Vector2(0.3, 0),
        new THREE.Vector2(1, 0),
        new THREE.Vector2(1, -2),
        new THREE.Vector2(2, -2),
        new THREE.Vector2(2, 2),
      ],
    ]
  },
  flower: {
    name: '窗花',
    meaning: '花开富贵，春意盎然',
    difficulty: 'hard',
    paths: [
      // 八瓣花 - 每瓣
      ...Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        const nextAngle = ((i + 1) / 8) * Math.PI * 2
        return [
          new THREE.Vector2(0, 0),
          new THREE.Vector2(Math.cos(angle) * 2, Math.sin(angle) * 2),
          new THREE.Vector2(
            Math.cos((angle + nextAngle) / 2) * 1.2,
            Math.sin((angle + nextAngle) / 2) * 1.2
          ),
        ]
      })
    ]
  }
}

// 剪裁路径可视化组件
interface CuttingPathProps {
  path: THREE.Vector2[]
  cutProgress: number  // 0-1
  isActive: boolean
}

function CuttingPath2D({ 
  path, 
  cutProgress, 
  isActive 
}: CuttingPathProps) {
  // 创建路径点
  const points3D = path.map(p => [p.x, p.y, 0] as [number, number, number])
  
  // 已剪裁部分的点
  const cutIndex = Math.floor(cutProgress * points3D.length) + 1
  const cutPoints = points3D.slice(0, Math.max(2, cutIndex))
  
  return (
    <group>
      {/* 虚线 - 待剪裁路径 */}
      <Line
        points={points3D}
        color={isActive ? '#A73A36' : '#cccccc'}
        lineWidth={2}
        dashed
        dashSize={0.1}
        gapSize={0.05}
      />
      {/* 实线 - 已剪裁部分 */}
      {cutProgress > 0 && cutPoints.length >= 2 && (
        <Line
          points={cutPoints}
          color="#A73A36"
          lineWidth={4}
        />
      )}
    </group>
  )
}

// 红纸背景
function RedPaper() {
  return (
    <mesh position={[0, 0, -0.1]}>
      <planeGeometry args={[5, 5]} />
      <meshStandardMaterial 
        color="#C41E3A"
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  )
}

// 剪刀模型
function Scissors3D({ position }: { position: THREE.Vector3 }) {
  const groupRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (groupRef.current) {
      // 剪刀开合动画
      const openAngle = Math.sin(state.clock.elapsedTime * 5) * 0.2
      groupRef.current.children[0].rotation.z = openAngle
      groupRef.current.children[1].rotation.z = -openAngle
    }
  })
  
  return (
    <group ref={groupRef} position={position} scale={0.3}>
      {/* 上刀片 */}
      <mesh position={[0, 0.3, 0.1]}>
        <boxGeometry args={[0.1, 1, 0.02]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 下刀片 */}
      <mesh position={[0, 0.3, 0.1]}>
        <boxGeometry args={[0.1, 1, 0.02]} />
        <meshStandardMaterial color="#666666" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* 手柄 */}
      <mesh position={[0, -0.3, 0.1]}>
        <torusGeometry args={[0.2, 0.05, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#A73A36" roughness={0.5} />
      </mesh>
    </group>
  )
}

// 完成后的金色光效
function CompletionGlow({ isComplete }: { isComplete: boolean }) {
  const ringRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (ringRef.current && isComplete) {
      ringRef.current.rotation.z = state.clock.elapsedTime
      ringRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
    }
  })
  
  if (!isComplete) return null
  
  return (
    <mesh ref={ringRef} position={[0, 0, 0.05]}>
      <ringGeometry args={[2.2, 2.5, 32]} />
      <meshBasicMaterial color="#F2D974" transparent opacity={0.6} />
    </mesh>
  )
}

// 3D场景
interface SceneProps {
  pattern: CuttingPattern
  pathProgress: number[]
  currentPathIndex: number
  isComplete: boolean
  scissorPos: THREE.Vector3
}

function Scene({ pattern, pathProgress, currentPathIndex, isComplete, scissorPos }: SceneProps) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={45} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-3, 3, 3]} intensity={0.4} color="#F2D974" />
      
      <RedPaper />
      
      {pattern.paths.map((path, index) => (
        <CuttingPath2D
          key={index}
          path={path}
          cutProgress={pathProgress[index] || 0}
          isActive={index === currentPathIndex}
        />
      ))}
      
      <Scissors3D position={scissorPos} />
      <CompletionGlow isComplete={isComplete} />
      
      <OrbitControls 
        enablePan={false}
        enableZoom={false}
        enableRotate={false}
      />
    </>
  )
}

// 图案选择卡片
interface PatternCardProps {
  pattern: CuttingPattern
  patternKey: string
  isSelected: boolean
  onSelect: () => void
}

function PatternCard({ pattern, patternKey, isSelected, onSelect }: PatternCardProps) {
  const difficultyColors = {
    easy: 'bg-nature-500',
    medium: 'bg-gold-500',
    hard: 'bg-palace-500'
  }
  const difficultyText = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  
  return (
    <button
      onClick={onSelect}
      className={`p-4 rounded-xl border-2 transition-all ${
        isSelected 
          ? 'border-palace-500 bg-palace-50' 
          : 'border-paper-600 bg-white hover:border-palace-300'
      }`}
    >
      <div className="w-16 h-16 mx-auto mb-2 bg-palace-500 rounded-lg flex items-center justify-center">
        <span className="text-2xl text-white font-bold">
          {patternKey === 'fu' ? '福' : patternKey === 'xi' ? '囍' : '❀'}
        </span>
      </div>
      <p className="font-bold text-mountain-800">{pattern.name}</p>
      <span className={`inline-block px-2 py-0.5 rounded text-xs text-white mt-1 ${difficultyColors[pattern.difficulty]}`}>
        {difficultyText[pattern.difficulty]}
      </span>
    </button>
  )
}

// 主组件
export default function PaperCuttingGame() {
  const [selectedPattern, setSelectedPattern] = useState<string>('fu')
  const [gameState, setGameState] = useState<'select' | 'playing' | 'complete'>('select')
  const [currentPathIndex, setCurrentPathIndex] = useState(0)
  const [pathProgress, setPathProgress] = useState<number[]>([])
  const [scissorPos, setScissorPos] = useState(new THREE.Vector3(0, 0, 0.2))
  const [fragmentEarned, setFragmentEarned] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const pattern = PATTERNS[selectedPattern]
  
  // 初始化进度
  useEffect(() => {
    if (pattern) {
      setPathProgress(new Array(pattern.paths.length).fill(0))
    }
  }, [selectedPattern, pattern])
  
  // 处理剪裁交互
  const handleCut = useCallback((clientX: number, clientY: number) => {
    if (gameState !== 'playing') return
    
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * 2 - 1
    const y = -((clientY - rect.top) / rect.height) * 2 + 1
    
    // 更新剪刀位置
    setScissorPos(new THREE.Vector3(x * 3, y * 3, 0.2))
    
    // 更新剪裁进度
    setPathProgress(prev => {
      const newProgress = [...prev]
      if (newProgress[currentPathIndex] < 1) {
        newProgress[currentPathIndex] = Math.min(1, newProgress[currentPathIndex] + 0.02)
        
        // 当前路径完成
        if (newProgress[currentPathIndex] >= 1) {
          if (currentPathIndex < pattern.paths.length - 1) {
            setCurrentPathIndex(currentPathIndex + 1)
          } else {
            // 所有路径完成
            setGameState('complete')
            setTimeout(() => setFragmentEarned(true), 1000)
          }
        }
      }
      return newProgress
    })
  }, [gameState, currentPathIndex, pattern])
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (e.buttons === 1) {
      handleCut(e.clientX, e.clientY)
    }
  }
  
  const handleTouchMove = (e: React.TouchEvent) => {
    handleCut(e.touches[0].clientX, e.touches[0].clientY)
  }
  
  const startGame = () => {
    setGameState('playing')
    setCurrentPathIndex(0)
    setPathProgress(new Array(pattern.paths.length).fill(0))
  }
  
  const resetGame = () => {
    setGameState('select')
    setCurrentPathIndex(0)
    setPathProgress([])
    setFragmentEarned(false)
  }
  
  const totalProgress = pathProgress.length > 0 
    ? pathProgress.reduce((a, b) => a + b, 0) / pathProgress.length 
    : 0

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-paper-500 to-paper-300">
      {/* 图案选择界面 */}
      <AnimatePresence>
        {gameState === 'select' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-paper-500/95"
          >
            <div className="max-w-md mx-4 text-center">
              <Scissors className="w-16 h-16 mx-auto mb-4 text-palace-500" />
              <h2 className="text-2xl font-bold text-mountain-800 mb-2">
                陕北剪纸艺术
              </h2>
              <p className="text-mountain-500 mb-6">
                选择一个图案，体验传统剪纸的魅力
              </p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(PATTERNS).map(([key, pat]) => (
                  <PatternCard
                    key={key}
                    patternKey={key}
                    pattern={pat}
                    isSelected={selectedPattern === key}
                    onSelect={() => setSelectedPattern(key)}
                  />
                ))}
              </div>
              
              <div className="bg-palace-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-palace-700">
                  <strong>{pattern.name}</strong>：{pattern.meaning}
                </p>
              </div>
              
              <Button variant="heritage" size="lg" onClick={startGame} className="w-full">
                <Play className="w-5 h-5 mr-2" />
                开始剪纸
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 游戏画布 */}
      <div 
        ref={containerRef}
        className="absolute inset-0"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
      >
        <Canvas>
          <Suspense fallback={<Loader />}>
            <Scene 
              pattern={pattern}
              pathProgress={pathProgress}
              currentPathIndex={currentPathIndex}
              isComplete={gameState === 'complete'}
              scissorPos={scissorPos}
            />
          </Suspense>
        </Canvas>
      </div>
      
      {/* 游戏UI */}
      {gameState !== 'select' && (
        <>
          {/* 顶部信息 */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-mountain-900/80 to-transparent z-10">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-between text-white mb-2">
                <div>
                  <h2 className="text-xl font-bold">{pattern.name}</h2>
                  <p className="text-sm text-white/70">
                    第 {currentPathIndex + 1} / {pattern.paths.length} 条剪裁线
                  </p>
                </div>
                <button 
                  onClick={resetGame}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
              
              {/* 进度条 */}
              <div className="w-full bg-paper-600 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-palace-500 to-gold-500 rounded-full"
                  animate={{ width: `${totalProgress * 100}%` }}
                />
              </div>
            </div>
          </div>
          
          {/* 操作提示 */}
          {gameState === 'playing' && (
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-10">
              <motion.div
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full text-mountain-600"
              >
                <Hand className="w-4 h-4" />
                <span className="text-sm">沿虚线滑动剪裁</span>
              </motion.div>
            </div>
          )}
        </>
      )}
      
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
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-palace-400 to-palace-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Check className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              <h3 className="text-2xl font-bold text-mountain-800 mb-2">
                ✂️ 剪纸完成！
              </h3>
              <p className="text-mountain-500 mb-4">
                恭喜获得文脉碎片
              </p>
              <div className="bg-paper-500 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-palace-500 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                    {selectedPattern === 'fu' ? '福' : selectedPattern === 'xi' ? '囍' : '❀'}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-mountain-800">{pattern.name}剪纸</p>
                    <p className="text-xs text-mountain-500">稀有度: 精品</p>
                  </div>
                </div>
              </div>
              <Button variant="heritage" className="w-full" onClick={resetGame}>
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
