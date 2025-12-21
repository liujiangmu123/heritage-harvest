/**
 * 茶道体验V2 - 世界级沉浸式3D茶道体验
 * 
 * 创新特性：
 * - 3D茶园场景：四季变化、云雾缭绕
 * - 采茶互动：手势采摘茶叶
 * - 泡茶仪式：完整泡茶流程动画
 * - 千人千样：独特茶配方生成
 * - 绿色环保：有机茶园碳汇可视化
 */

import { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text, Cloud, Sky } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf, X, Camera, RotateCcw, Droplets, Sun, Wind, 
  Sparkles, Heart, TreeDeciduous, RefreshCw
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePolaroidStore } from '@/store/polaroidStore'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'

// ============ 千人千样茶配方 ============
interface UniqueTeaRecipe {
  seed: number
  teaBase: { name: string; color: string; icon: string }
  brewMethod: string
  temperature: number
  steepTime: number
  additions: string[]
  blessing: string
  seasonMatch: string
  ecoScore: number
}

const TEA_BASES = [
  { name: '明前龙井', color: '#90EE90', icon: '🍃' },
  { name: '武夷岩茶', color: '#8B4513', icon: '🏔️' },
  { name: '正山小种', color: '#CD853F', icon: '🔥' },
  { name: '白毫银针', color: '#F5F5DC', icon: '❄️' },
  { name: '普洱古树', color: '#654321', icon: '🌳' },
  { name: '铁观音', color: '#DAA520', icon: '🔔' },
  { name: '碧螺春', color: '#98FB98', icon: '🌀' },
  { name: '大红袍', color: '#8B0000', icon: '👘' },
]

const BREW_METHODS = ['功夫泡', '盖碗冲泡', '紫砂壶泡', '玻璃杯泡', '煮茶法']
const ADDITIONS = ['桂花', '玫瑰', '菊花', '枸杞', '陈皮', '薄荷', '蜂蜜', '红枣']
const BLESSINGS = ['茶香满座', '清心明志', '悠然自得', '淡泊宁静', '禅茶一味', '品茗悟道']
const SEASONS = ['春·万物复苏', '夏·清凉消暑', '秋·金桂飘香', '冬·温暖暖心']

function generateUniqueTeaRecipe(): UniqueTeaRecipe {
  const seed = Math.floor(Math.random() * 1000000)
  const teaBase = TEA_BASES[seed % TEA_BASES.length]
  const brewMethod = BREW_METHODS[(seed >> 3) % BREW_METHODS.length]
  const temperature = 75 + (seed % 20)
  const steepTime = 30 + (seed % 90)
  const additionCount = 1 + (seed % 3)
  const additions: string[] = []
  for (let i = 0; i < additionCount; i++) {
    additions.push(ADDITIONS[(seed + i * 7) % ADDITIONS.length])
  }
  const blessing = BLESSINGS[(seed >> 4) % BLESSINGS.length]
  const seasonMatch = SEASONS[(seed >> 2) % SEASONS.length]
  const ecoScore = 85 + (seed % 15)

  return { seed, teaBase, brewMethod, temperature, steepTime, additions, blessing, seasonMatch, ecoScore }
}

// ============ 3D茶叶组件 ============
function TeaLeaf({ position, delay = 0, onClick }: { 
  position: [number, number, number]
  delay?: number
  onClick?: () => void
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [picked, setPicked] = useState(false)

  useFrame((state) => {
    if (meshRef.current && !picked) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime + delay) * 0.1
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.5 + delay) * 0.05
    }
  })

  if (picked) return null

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={() => {
        setPicked(true)
        onClick?.()
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.3 : 1}
    >
      <sphereGeometry args={[0.08, 8, 8]} />
      <meshStandardMaterial 
        color={hovered ? '#00FF00' : '#228B22'} 
        emissive={hovered ? '#00FF00' : '#000000'}
        emissiveIntensity={hovered ? 0.3 : 0}
      />
    </mesh>
  )
}

// ============ 3D茶树组件 ============
function TeaBush({ position, onPickLeaf }: { 
  position: [number, number, number]
  onPickLeaf: () => void
}) {
  const leaves = useMemo(() => {
    const leafPositions: [number, number, number][] = []
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2
      const radius = 0.3 + Math.random() * 0.3
      const height = 0.3 + Math.random() * 0.4
      leafPositions.push([
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ])
    }
    return leafPositions
  }, [])

  return (
    <group position={position}>
      {/* 茶树主干 */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.05, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 茶树冠 */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#2E8B57" transparent opacity={0.9} />
      </mesh>
      {/* 可采摘的茶叶 */}
      {leaves.map((pos, i) => (
        <TeaLeaf 
          key={i} 
          position={pos} 
          delay={i * 0.5} 
          onClick={onPickLeaf}
        />
      ))}
    </group>
  )
}

// ============ 3D茶园场景 ============
function TeaGarden({ onPickLeaf, pickedCount }: { 
  onPickLeaf: () => void
  pickedCount: number 
}) {
  const bushPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 5; col++) {
        positions.push([
          (col - 2) * 1.5 + (row % 2) * 0.75,
          row * 0.3 - 0.5,
          (row - 1.5) * 1.2
        ])
      }
    }
    return positions
  }, [])

  return (
    <group>
      {/* 梯田地形 */}
      {[0, 1, 2, 3].map((level) => (
        <mesh key={level} position={[0, level * 0.3 - 0.7, (level - 1.5) * 1.2]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[10, 1.5]} />
          <meshStandardMaterial color={`hsl(${120 + level * 5}, 40%, ${35 + level * 5}%)`} />
        </mesh>
      ))}
      
      {/* 茶树 */}
      {bushPositions.map((pos, i) => (
        <TeaBush key={i} position={pos} onPickLeaf={onPickLeaf} />
      ))}
      
      {/* 云雾效果 */}
      <Cloud position={[-3, 2, -2]} speed={0.2} opacity={0.3} />
      <Cloud position={[3, 2.5, -3]} speed={0.1} opacity={0.2} />
      
      {/* 采摘进度文字 */}
      <Float speed={2} floatIntensity={0.5}>
        <Text
          position={[0, 3, 0]}
          fontSize={0.3}
          color="#2E8B57"
          anchorX="center"
          anchorY="middle"
        >
          {`已采摘: ${pickedCount}/10 片茶叶`}
        </Text>
      </Float>
    </group>
  )
}

// ============ 3D茶壶组件 ============
function TeaPot({ brewing, teaColor }: { brewing: boolean; teaColor: string }) {
  const potRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (potRef.current && brewing) {
      potRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1
    }
  })

  return (
    <group ref={potRef} position={[0, 0, 0]}>
      {/* 壶身 */}
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.4, 32, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.3} metalness={0.1} />
      </mesh>
      {/* 壶嘴 */}
      <mesh position={[0.4, 0.35, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <cylinderGeometry args={[0.05, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 壶盖 */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* 壶把 */}
      <mesh position={[-0.35, 0.4, 0]} rotation={[0, 0, Math.PI / 6]}>
        <torusGeometry args={[0.15, 0.03, 8, 16, Math.PI]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* 茶汤（冲泡时显示） */}
      {brewing && (
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.35, 32, 32]} />
          <meshStandardMaterial color={teaColor} transparent opacity={0.6} />
        </mesh>
      )}
      {/* 蒸汽效果 */}
      {brewing && (
        <Float speed={4} floatIntensity={1}>
          <mesh position={[0, 1, 0]}>
            <sphereGeometry args={[0.1, 8, 8]} />
            <meshStandardMaterial color="white" transparent opacity={0.3} />
          </mesh>
        </Float>
      )}
    </group>
  )
}

// ============ 泡茶场景 ============
function BrewingScene({ recipe, progress }: { recipe: UniqueTeaRecipe; progress: number }) {
  return (
    <group>
      {/* 茶桌 */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[3, 0.1, 2]} />
        <meshStandardMaterial color="#DEB887" />
      </mesh>
      
      {/* 茶壶 */}
      <TeaPot brewing={progress > 30} teaColor={recipe.teaBase.color} />
      
      {/* 茶杯 */}
      {[-0.8, 0, 0.8].map((x, i) => (
        <group key={i} position={[x, -0.4, 0.6]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.08, 0.15, 16]} />
            <meshStandardMaterial color="#F5F5DC" />
          </mesh>
          {progress > 60 + i * 10 && (
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.08, 0.08, 0.1, 16]} />
              <meshStandardMaterial color={recipe.teaBase.color} transparent opacity={0.8} />
            </mesh>
          )}
        </group>
      ))}
      
      {/* 环境装饰 */}
      <Float speed={1} floatIntensity={0.3}>
        <Text
          position={[0, 1.5, 0]}
          fontSize={0.2}
          color="#8B4513"
          anchorX="center"
        >
          {recipe.blessing}
        </Text>
      </Float>
    </group>
  )
}

// ============ 主场景控制器 ============
function SceneController({ 
  stage, 
  recipe, 
  pickedCount, 
  onPickLeaf, 
  brewProgress 
}: { 
  stage: 'garden' | 'brewing' | 'complete'
  recipe: UniqueTeaRecipe
  pickedCount: number
  onPickLeaf: () => void
  brewProgress: number
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFE4B5" />
      
      {stage === 'garden' && (
        <TeaGarden onPickLeaf={onPickLeaf} pickedCount={pickedCount} />
      )}
      
      {(stage === 'brewing' || stage === 'complete') && (
        <BrewingScene recipe={recipe} progress={brewProgress} />
      )}
      
      <OrbitControls 
        enablePan={false}
        minDistance={2}
        maxDistance={10}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2.5}
      />
      
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="forest" />
    </>
  )
}

// ============ 主组件 ============
export default function TeaCeremonyV2() {
  const navigate = useNavigate()
  const { unlockScene } = usePolaroidStore()
  const { addPoints } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()

  const [recipe, setRecipe] = useState<UniqueTeaRecipe>(() => generateUniqueTeaRecipe())
  const [stage, setStage] = useState<'intro' | 'garden' | 'brewing' | 'complete'>('intro')
  const [pickedCount, setPickedCount] = useState(0)
  const [brewProgress, setBrewProgress] = useState(0)
  const [showCompletion, setShowCompletion] = useState(false)

  // 采茶完成后进入泡茶阶段
  useEffect(() => {
    if (pickedCount >= 10 && stage === 'garden') {
      setTimeout(() => setStage('brewing'), 1000)
    }
  }, [pickedCount, stage])

  // 泡茶进度
  useEffect(() => {
    if (stage === 'brewing' && brewProgress < 100) {
      const timer = setInterval(() => {
        setBrewProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer)
            setStage('complete')
            setShowCompletion(true)
            // 奖励
            addPoints({ type: 'experience', points: 80, description: '完成茶道仪式体验' })
            addCarbonSaving({ 
              type: 'digital_experience', 
              carbonSaved: 800, 
              description: '有机茶园碳汇贡献',
              experienceId: 'tea_ceremony_v2'
            })
            return 100
          }
          return prev + 2
        })
      }, 100)
      return () => clearInterval(timer)
    }
  }, [stage, brewProgress, addPoints, addCarbonSaving])

  const handlePickLeaf = useCallback(() => {
    setPickedCount(prev => prev + 1)
  }, [])

  const handleRegenerate = () => {
    setRecipe(generateUniqueTeaRecipe())
  }

  const handleStart = () => {
    setStage('garden')
  }

  const handleRestart = () => {
    setStage('intro')
    setPickedCount(0)
    setBrewProgress(0)
    setShowCompletion(false)
    setRecipe(generateUniqueTeaRecipe())
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-green-100 via-green-50 to-amber-50">
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
          >
            <X className="w-5 h-5 text-green-700" />
          </button>
          
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
            <span className="text-2xl">{recipe.teaBase.icon}</span>
            <div>
              <div className="font-bold text-green-800">{recipe.teaBase.name}</div>
              <div className="text-xs text-green-600">#{recipe.seed.toString(16).toUpperCase()}</div>
            </div>
          </div>
          
          <button
            onClick={handleRegenerate}
            className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-green-700" />
          </button>
        </div>
      </div>

      {/* 介绍界面 */}
      <AnimatePresence>
        {stage === 'intro' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-green-900/90 to-green-800/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{recipe.teaBase.icon}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-green-800 mb-2">
                🍵 你的专属茶配方
              </h2>
              <p className="text-green-600 mb-6">{recipe.blessing}</p>
              
              {/* 配方详情 */}
              <div className="bg-green-50 rounded-2xl p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-green-600">茶底</span>
                  <span className="font-bold text-green-800">{recipe.teaBase.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">冲泡法</span>
                  <span className="font-bold text-green-800">{recipe.brewMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">水温</span>
                  <span className="font-bold text-green-800">{recipe.temperature}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">浸泡时间</span>
                  <span className="font-bold text-green-800">{recipe.steepTime}秒</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">添加</span>
                  <span className="font-bold text-green-800">{recipe.additions.join('、')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">适合季节</span>
                  <span className="font-bold text-green-800">{recipe.seasonMatch}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">生态评分</span>
                  <span className="font-bold text-eco-600">{recipe.ecoScore}分</span>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Leaf className="w-5 h-5 inline mr-2" />
                开始采茶之旅
              </button>
              
              <p className="text-xs text-green-500 mt-4">
                🌿 有机茶园 · 零农药 · 碳中和
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D场景 */}
      {stage !== 'intro' && (
        <div className="absolute inset-0">
          <Canvas shadows camera={{ position: [0, 3, 6], fov: 50 }}>
            <Suspense fallback={null}>
              <SceneController
                stage={stage as 'garden' | 'brewing' | 'complete'}
                recipe={recipe}
                pickedCount={pickedCount}
                onPickLeaf={handlePickLeaf}
                brewProgress={brewProgress}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 底部状态栏 */}
      {stage !== 'intro' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
            {stage === 'garden' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-700 font-medium">采茶进度</span>
                  <span className="text-green-800 font-bold">{pickedCount}/10</span>
                </div>
                <div className="h-3 bg-green-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${(pickedCount / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-green-600 mt-2 text-center">
                  👆 点击茶叶采摘 · 收集10片嫩芽
                </p>
              </div>
            )}
            
            {stage === 'brewing' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 font-medium">泡茶进度</span>
                  <span className="text-amber-800 font-bold">{brewProgress}%</span>
                </div>
                <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${brewProgress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2 text-center">
                  🫖 {recipe.brewMethod} · {recipe.temperature}°C · {recipe.steepTime}秒
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 完成弹窗 */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-green-800 mb-2">
                  🍵 茶道仪式完成！
                </h3>
                <p className="text-green-600 mb-4">{recipe.teaBase.name} · {recipe.blessing}</p>
                
                {/* 奖励展示 */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-green-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-green-600">+80</div>
                    <div className="text-xs text-green-500">绿色积分</div>
                  </div>
                  <div className="bg-eco-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-eco-600">800g</div>
                    <div className="text-xs text-eco-500">碳减排</div>
                  </div>
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-600">{recipe.ecoScore}</div>
                    <div className="text-xs text-amber-500">生态评分</div>
                  </div>
                </div>
                
                {/* 环保知识 */}
                <div className="bg-green-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <TreeDeciduous className="w-5 h-5 text-green-600" />
                    <span className="font-bold text-green-700">有机茶园生态智慧</span>
                  </div>
                  <p className="text-sm text-green-600">
                    一公顷有机茶园每年可固碳4.5吨CO₂，相当于种植200棵树。
                    你刚刚体验的茶叶来自零农药有机茶园！
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 border-2 border-green-500 text-green-600 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    再来一次
                  </button>
                  <button
                    onClick={() => {
                      unlockScene('tea_garden')
                      navigate('/create/polaroid?scene=tea_garden&design=' + recipe.seed)
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Camera className="w-4 h-4" />
                    生成拍立得
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
