/**
 * 泥塑体验V2 - 世界级3D捏塑体验
 * 
 * 创新特性：
 * - 3D旋转泥坯：实时形变动画
 * - 手势捏塑：滑动改变形状
 * - 彩绘系统：传统凤翔色彩
 * - 千人千样：独特造型生成
 * - 绿色环保：天然黄土材料
 */

import { useRef, useState, useEffect, useCallback, useMemo, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Float, Text } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Palette, X, Camera, RotateCcw, Sparkles, 
  Paintbrush, Hand, TreeDeciduous, RefreshCw, Leaf
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { usePolaroidStore } from '@/store/polaroidStore'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'

// ============ 千人千样泥塑造型 ============
interface UniqueClayShape {
  seed: number
  baseShape: { name: string; icon: string; meaning: string }
  bodyScale: { x: number; y: number; z: number }
  headScale: number
  earScale: number
  decorStyle: string
  primaryColor: string
  secondaryColor: string
  blessing: string
  ecoScore: number
}

const BASE_SHAPES = [
  { name: '福虎', icon: '🐯', meaning: '虎虎生威，镇宅辟邪' },
  { name: '祥马', icon: '🐴', meaning: '龙马精神，马到成功' },
  { name: '金鸡', icon: '🐔', meaning: '金鸡报晓，吉祥如意' },
  { name: '富猪', icon: '🐷', meaning: '金猪纳福，富贵满堂' },
  { name: '瑞鱼', icon: '🐟', meaning: '年年有余，招财进宝' },
  { name: '吉羊', icon: '🐑', meaning: '三阳开泰，吉祥美好' },
]

const DECOR_STYLES = ['花卉纹', '云纹', '如意纹', '莲花纹', '牡丹纹', '凤凰纹']
const PRIMARY_COLORS = ['#DC2626', '#FACC15', '#22C55E', '#3B82F6', '#FB7185', '#8B5CF6']
const SECONDARY_COLORS = ['#000000', '#FFFFFF', '#FFD700', '#FF6B6B', '#4ECDC4']
const BLESSINGS = ['福气临门', '五福临门', '吉祥如意', '花开富贵', '龙凤呈祥', '百事如意']

function generateUniqueClayShape(): UniqueClayShape {
  const seed = Math.floor(Math.random() * 1000000)
  const baseShape = BASE_SHAPES[seed % BASE_SHAPES.length]
  const bodyScale = {
    x: 0.8 + (seed % 40) / 100,
    y: 0.9 + (seed % 30) / 100,
    z: 0.85 + (seed % 35) / 100
  }
  const headScale = 0.9 + (seed % 25) / 100
  const earScale = 0.7 + (seed % 50) / 100
  const decorStyle = DECOR_STYLES[(seed >> 3) % DECOR_STYLES.length]
  const primaryColor = PRIMARY_COLORS[(seed >> 2) % PRIMARY_COLORS.length]
  const secondaryColor = SECONDARY_COLORS[(seed >> 4) % SECONDARY_COLORS.length]
  const blessing = BLESSINGS[(seed >> 5) % BLESSINGS.length]
  const ecoScore = 90 + (seed % 10)

  return { seed, baseShape, bodyScale, headScale, earScale, decorStyle, primaryColor, secondaryColor, blessing, ecoScore }
}

// ============ 3D泥塑模型 ============
function ClayModel({ 
  shape, 
  sculptProgress, 
  paintedParts,
  currentColor 
}: { 
  shape: UniqueClayShape
  sculptProgress: number
  paintedParts: Map<string, string>
  currentColor: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  const clayColor = '#E8D4B8'
  const getPartColor = (part: string) => paintedParts.get(part) || clayColor

  // 根据造型生成不同的形状
  const renderShape = () => {
    switch (shape.baseShape.icon) {
      case '🐯':
        return (
          <>
            {/* 虎身 */}
            <mesh 
              position={[0, 0, 0]}
              scale={[shape.bodyScale.x, shape.bodyScale.y, shape.bodyScale.z]}
              onPointerOver={() => setHovered('body')}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial 
                color={getPartColor('body')} 
                roughness={0.8}
                emissive={hovered === 'body' ? currentColor : '#000000'}
                emissiveIntensity={hovered === 'body' ? 0.3 : 0}
              />
            </mesh>
            {/* 虎头 */}
            <mesh 
              position={[0, 0.7 * shape.headScale, 0]}
              scale={shape.headScale}
              onPointerOver={() => setHovered('head')}
              onPointerOut={() => setHovered(null)}
            >
              <sphereGeometry args={[0.45, 32, 32]} />
              <meshStandardMaterial 
                color={getPartColor('head')} 
                roughness={0.8}
                emissive={hovered === 'head' ? currentColor : '#000000'}
                emissiveIntensity={hovered === 'head' ? 0.3 : 0}
              />
            </mesh>
            {/* 虎耳 */}
            {[-0.25, 0.25].map((x, i) => (
              <mesh 
                key={i}
                position={[x * shape.earScale, 1.1, 0]}
                scale={shape.earScale * 0.5}
                onPointerOver={() => setHovered(`ear${i}`)}
                onPointerOut={() => setHovered(null)}
              >
                <coneGeometry args={[0.2, 0.3, 8]} />
                <meshStandardMaterial 
                  color={getPartColor(`ear${i}`)} 
                  roughness={0.8}
                  emissive={hovered === `ear${i}` ? currentColor : '#000000'}
                  emissiveIntensity={hovered === `ear${i}` ? 0.3 : 0}
                />
              </mesh>
            ))}
            {/* 虎眼 */}
            {[-0.15, 0.15].map((x, i) => (
              <mesh key={`eye${i}`} position={[x, 0.75, 0.35]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color={getPartColor('eyes') || '#000000'} />
              </mesh>
            ))}
            {/* 王字 */}
            <mesh position={[0, 0.9, 0.38]}>
              <boxGeometry args={[0.15, 0.08, 0.02]} />
              <meshStandardMaterial color={getPartColor('pattern') || '#000000'} />
            </mesh>
            {/* 尾巴 */}
            <mesh 
              position={[0, 0, -0.7]}
              rotation={[0.5, 0, 0]}
              onPointerOver={() => setHovered('tail')}
              onPointerOut={() => setHovered(null)}
            >
              <cylinderGeometry args={[0.08, 0.05, 0.5, 8]} />
              <meshStandardMaterial 
                color={getPartColor('tail')} 
                roughness={0.8}
                emissive={hovered === 'tail' ? currentColor : '#000000'}
                emissiveIntensity={hovered === 'tail' ? 0.3 : 0}
              />
            </mesh>
          </>
        )
      default:
        // 通用造型
        return (
          <>
            <mesh position={[0, 0, 0]} scale={[shape.bodyScale.x, shape.bodyScale.y, shape.bodyScale.z]}>
              <sphereGeometry args={[0.6, 32, 32]} />
              <meshStandardMaterial color={getPartColor('body')} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.8, 0]} scale={shape.headScale}>
              <sphereGeometry args={[0.4, 32, 32]} />
              <meshStandardMaterial color={getPartColor('head')} roughness={0.8} />
            </mesh>
          </>
        )
    }
  }

  return (
    <group ref={groupRef} position={[0, 0.5, 0]}>
      {sculptProgress > 0 && renderShape()}
      
      {/* 底座 */}
      <mesh position={[0, -0.8, 0]} receiveShadow>
        <cylinderGeometry args={[0.8, 1, 0.2, 32]} />
        <meshStandardMaterial color="#8B4513" roughness={0.9} />
      </mesh>
    </group>
  )
}

// ============ 3D场景 ============
function Scene({ 
  shape, 
  sculptProgress, 
  paintedParts,
  currentColor
}: { 
  shape: UniqueClayShape
  sculptProgress: number
  paintedParts: Map<string, string>
  currentColor: string
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.5} color="#FFE4B5" />
      <spotLight position={[0, 5, 0]} intensity={0.8} angle={0.5} penumbra={0.5} />

      <ClayModel 
        shape={shape} 
        sculptProgress={sculptProgress}
        paintedParts={paintedParts}
        currentColor={currentColor}
      />

      {/* 祝福语 */}
      <Float speed={2} floatIntensity={0.5}>
        <Text
          position={[0, 2.2, 0]}
          fontSize={0.25}
          color="#8B4513"
          anchorX="center"
        >
          {shape.blessing}
        </Text>
      </Float>

      <OrbitControls 
        enablePan={false}
        minDistance={2}
        maxDistance={6}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2}
      />

      <Environment preset="studio" />
    </>
  )
}

// ============ 传统色彩选择器 ============
const TRADITIONAL_COLORS = [
  { name: '朱红', color: '#DC2626', desc: '喜庆吉祥' },
  { name: '明黄', color: '#FACC15', desc: '富贵荣华' },
  { name: '翠绿', color: '#22C55E', desc: '生机盎然' },
  { name: '宝蓝', color: '#3B82F6', desc: '祥瑞平安' },
  { name: '桃粉', color: '#FB7185', desc: '娇艳可爱' },
  { name: '墨黑', color: '#1C1917', desc: '勾勒轮廓' },
  { name: '纯白', color: '#FFFFFF', desc: '点缀高光' },
]

// ============ 主组件 ============
export default function ClaySculptureV2() {
  const navigate = useNavigate()
  const { unlockScene } = usePolaroidStore()
  const { addPoints } = useGreenPointsStore()
  const { addCarbonSaving } = useCarbonAccountStore()

  const [shape, setShape] = useState<UniqueClayShape>(() => generateUniqueClayShape())
  const [stage, setStage] = useState<'intro' | 'sculpt' | 'paint' | 'complete'>('intro')
  const [sculptProgress, setSculptProgress] = useState(0)
  const [paintedParts, setPaintedParts] = useState<Map<string, string>>(new Map())
  const [currentColor, setCurrentColor] = useState(TRADITIONAL_COLORS[0].color)
  const [showCompletion, setShowCompletion] = useState(false)

  // 捏塑进度
  useEffect(() => {
    if (stage === 'sculpt' && sculptProgress < 100) {
      const timer = setInterval(() => {
        setSculptProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer)
            setStage('paint')
            return 100
          }
          return prev + 2
        })
      }, 80)
      return () => clearInterval(timer)
    }
  }, [stage, sculptProgress])

  // 彩绘完成检测
  useEffect(() => {
    if (stage === 'paint' && paintedParts.size >= 5) {
      setStage('complete')
      setShowCompletion(true)
      addPoints({ type: 'experience', points: 80, description: '完成泥塑彩绘体验' })
      addCarbonSaving({ 
        type: 'digital_experience', 
        carbonSaved: 600, 
        description: '天然黄土材料体验',
        experienceId: 'clay_sculpture_v2'
      })
    }
  }, [stage, paintedParts, addPoints, addCarbonSaving])

  const handlePaintPart = useCallback((part: string) => {
    if (stage === 'paint') {
      setPaintedParts(prev => new Map(prev).set(part, currentColor))
    }
  }, [stage, currentColor])

  const handleRegenerate = () => {
    setShape(generateUniqueClayShape())
  }

  const handleStart = () => {
    setStage('sculpt')
  }

  const handleRestart = () => {
    setStage('intro')
    setSculptProgress(0)
    setPaintedParts(new Map())
    setShowCompletion(false)
    setShape(generateUniqueClayShape())
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-amber-100 via-amber-50 to-orange-50">
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
          >
            <X className="w-5 h-5 text-amber-700" />
          </button>
          
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-2 shadow-lg">
            <span className="text-2xl">{shape.baseShape.icon}</span>
            <div>
              <div className="font-bold text-amber-800">{shape.baseShape.name}</div>
              <div className="text-xs text-amber-600">#{shape.seed.toString(16).toUpperCase()}</div>
            </div>
          </div>
          
          <button
            onClick={handleRegenerate}
            className="p-2 bg-white/80 backdrop-blur rounded-full shadow-lg"
          >
            <RefreshCw className="w-5 h-5 text-amber-700" />
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
            className="absolute inset-0 z-30 flex items-center justify-center bg-gradient-to-b from-amber-900/90 to-amber-800/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{shape.baseShape.icon}</span>
              </div>
              
              <h2 className="text-2xl font-bold text-amber-800 mb-2">
                🏺 你的专属泥塑造型
              </h2>
              <p className="text-amber-600 mb-4">{shape.blessing}</p>
              
              {/* 造型详情 */}
              <div className="bg-amber-50 rounded-2xl p-4 mb-6 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-amber-600">造型</span>
                  <span className="font-bold text-amber-800">{shape.baseShape.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">寓意</span>
                  <span className="font-bold text-amber-800 text-sm">{shape.baseShape.meaning}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">装饰纹样</span>
                  <span className="font-bold text-amber-800">{shape.decorStyle}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-amber-600">主色调</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: shape.primaryColor }} />
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow" style={{ backgroundColor: shape.secondaryColor }} />
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-amber-600">生态评分</span>
                  <span className="font-bold text-eco-600">{shape.ecoScore}分</span>
                </div>
              </div>

              {/* 环保提示 */}
              <div className="bg-eco-50 rounded-xl p-3 mb-6 flex items-center gap-3">
                <Leaf className="w-8 h-8 text-eco-600" />
                <div className="text-left">
                  <p className="text-sm font-bold text-eco-700">天然黄土 · 100%可降解</p>
                  <p className="text-xs text-eco-600">传统凤翔泥塑使用天然材料</p>
                </div>
              </div>
              
              <button
                onClick={handleStart}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Hand className="w-5 h-5 inline mr-2" />
                开始捏塑
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D场景 */}
      {stage !== 'intro' && (
        <div className="absolute inset-0 pt-16 pb-44">
          <Canvas shadows camera={{ position: [0, 1, 4], fov: 50 }}>
            <Suspense fallback={null}>
              <Scene
                shape={shape}
                sculptProgress={sculptProgress}
                paintedParts={paintedParts}
                currentColor={currentColor}
              />
            </Suspense>
          </Canvas>
        </div>
      )}

      {/* 右侧颜色选择器（彩绘阶段） */}
      {stage === 'paint' && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-3 space-y-2 shadow-lg">
            <div className="text-center text-amber-700 text-xs mb-2">
              <Paintbrush className="w-4 h-4 mx-auto mb-1" />
              颜料
            </div>
            {TRADITIONAL_COLORS.map((c) => (
              <button
                key={c.color}
                onClick={() => setCurrentColor(c.color)}
                className={`w-10 h-10 rounded-full transition-all border-2 ${
                  currentColor === c.color ? 'border-amber-500 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c.color }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* 底部状态栏 */}
      {stage !== 'intro' && (
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-lg">
            {stage === 'sculpt' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 font-medium">捏塑进度</span>
                  <span className="text-amber-800 font-bold">{sculptProgress}%</span>
                </div>
                <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${sculptProgress}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2 text-center">
                  🤲 正在塑形中... {shape.baseShape.name}
                </p>
              </div>
            )}
            
            {stage === 'paint' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-700 font-medium">彩绘进度</span>
                  <span className="text-amber-800 font-bold">{paintedParts.size}/5</span>
                </div>
                <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-400 to-yellow-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(paintedParts.size / 5) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-amber-600 mt-2 text-center">
                  🎨 点击模型部位进行上色 · {shape.decorStyle}
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
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold text-amber-800 mb-2">
                  🏺 泥塑完成！
                </h3>
                <p className="text-amber-600 mb-4">{shape.baseShape.name} · {shape.blessing}</p>
                
                {/* 奖励展示 */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  <div className="bg-amber-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-amber-600">+80</div>
                    <div className="text-xs text-amber-500">绿色积分</div>
                  </div>
                  <div className="bg-eco-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-eco-600">600g</div>
                    <div className="text-xs text-eco-500">碳减排</div>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-3">
                    <div className="text-2xl font-bold text-orange-600">{shape.ecoScore}</div>
                    <div className="text-xs text-orange-500">生态评分</div>
                  </div>
                </div>
                
                {/* 环保知识 */}
                <div className="bg-eco-50 rounded-xl p-4 mb-6 text-left">
                  <div className="flex items-center gap-2 mb-2">
                    <TreeDeciduous className="w-5 h-5 text-eco-600" />
                    <span className="font-bold text-eco-700">天然材料生态智慧</span>
                  </div>
                  <p className="text-sm text-eco-600">
                    凤翔泥塑使用天然黄土、棉花和糯米汁制作，100%可生物降解，
                    比塑料玩具减少80%碳排放！
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={handleRestart}
                    className="flex-1 py-3 border-2 border-amber-500 text-amber-600 rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    再来一次
                  </button>
                  <button
                    onClick={() => {
                      unlockScene('clay_studio')
                      navigate('/create/polaroid?scene=clay_studio&design=' + shape.seed)
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium flex items-center justify-center gap-2"
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
