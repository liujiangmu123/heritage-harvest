/**
 * 哈尼梯田 V2.0 - 世界级沉浸式体验
 * 
 * 核心特性：
 * - 程序化3D梯田地形生成（千人千样）
 * - 互动种植系统（点击种下生态稻苗）
 * - 四季轮回系统（春夏秋冬）
 * - 时间轴系统（晨曦→黄昏）
 * - 四素同构生态循环动画
 * - 天气粒子系统（雾/雨/阳光）
 * - AI诗词生成
 * - 拍立得联动（生成专属场景）
 */

import { useRef, useState, useMemo, useCallback, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { 
  OrbitControls, 
  Html,
  Sky,
  Cloud,
  Stars,
  Float,
  Sparkles,
  Text3D,
  Center
} from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Leaf,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  Wind,
  Sparkles as SparklesIcon,
  Camera,
  RotateCcw,
  Volume2,
  VolumeX,
  TreeDeciduous,
  Home,
  Mountain,
  Waves,
  Play,
  Pause,
  ChevronRight,
  Share2,
  Download,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore, addExperiencePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { usePolaroidStore } from '@/store/polaroidStore'
import { CARBON_SAVINGS_CONFIG } from '@/types/eco'

// ============== 类型定义 ==============

type Season = 'spring' | 'summer' | 'autumn' | 'winter'
type TimeOfDay = 'dawn' | 'morning' | 'noon' | 'afternoon' | 'dusk' | 'night'

interface PlantedRice {
  id: string
  position: THREE.Vector3
  plantedAt: number
  growth: number // 0-1
}

interface TerraceConfig {
  seed: number
  season: Season
  timeOfDay: TimeOfDay
  plantedRice: PlantedRice[]
  weatherIntensity: number
}

// ============== 配置常量 ==============

const SEASON_CONFIG = {
  spring: {
    name: '春·插秧',
    emoji: '🌸',
    baseColor: new THREE.Color('#7CB342'),
    waterColor: new THREE.Color('#4FC3F7'),
    skyColor: new THREE.Color('#87CEEB'),
    fogColor: new THREE.Color('#E8F5E9'),
    ambientIntensity: 0.6,
    description: '春雨润田，插秧时节'
  },
  summer: {
    name: '夏·青禾',
    emoji: '🌿',
    baseColor: new THREE.Color('#388E3C'),
    waterColor: new THREE.Color('#29B6F6'),
    skyColor: new THREE.Color('#64B5F6'),
    fogColor: new THREE.Color('#E3F2FD'),
    ambientIntensity: 0.8,
    description: '蛙声一片，青禾摇曳'
  },
  autumn: {
    name: '秋·金穗',
    emoji: '🌾',
    baseColor: new THREE.Color('#F9A825'),
    waterColor: new THREE.Color('#4DD0E1'),
    skyColor: new THREE.Color('#FFB74D'),
    fogColor: new THREE.Color('#FFF8E1'),
    ambientIntensity: 0.7,
    description: '稻浪金黄，丰收在望'
  },
  winter: {
    name: '冬·休耕',
    emoji: '❄️',
    baseColor: new THREE.Color('#90A4AE'),
    waterColor: new THREE.Color('#B0BEC5'),
    skyColor: new THREE.Color('#CFD8DC'),
    fogColor: new THREE.Color('#ECEFF1'),
    ambientIntensity: 0.4,
    description: '田野沉睡，蓄势待春'
  }
}

const TIME_CONFIG = {
  dawn: { name: '晨曦', hour: 6, sunPosition: [100, 10, 0], intensity: 0.3, color: '#FF8A65', skyTurbidity: 8 },
  morning: { name: '清晨', hour: 8, sunPosition: [80, 40, 20], intensity: 0.7, color: '#FFF9C4', skyTurbidity: 10 },
  noon: { name: '正午', hour: 12, sunPosition: [0, 100, 0], intensity: 1.2, color: '#FFFFFF', skyTurbidity: 10 },
  afternoon: { name: '午后', hour: 15, sunPosition: [-60, 60, 30], intensity: 0.9, color: '#FFF59D', skyTurbidity: 10 },
  dusk: { name: '黄昏', hour: 18, sunPosition: [-100, 15, 0], intensity: 0.4, color: '#FF7043', skyTurbidity: 8 },
  night: { name: '夜幕', hour: 21, sunPosition: [-100, -30, 0], intensity: 0.05, color: '#1A237E', skyTurbidity: 20 }
}

// 四素同构元素
const FOUR_ELEMENTS = [
  { id: 'forest', name: '森林', icon: TreeDeciduous, color: '#2E7D32', description: '涵养水源，净化空气' },
  { id: 'village', name: '村寨', icon: Home, color: '#8D6E63', description: '人与自然和谐共生' },
  { id: 'terrace', name: '梯田', icon: Mountain, color: '#689F38', description: '千年农耕智慧结晶' },
  { id: 'water', name: '水系', icon: Waves, color: '#0288D1', description: '生命之源，循环不息' }
]

// AI诗词库
const POEMS = [
  { season: 'spring', text: '春水初生映碧天，层层绿浪入云烟。哈尼儿女勤耕作，千年梯田续新篇。' },
  { season: 'summer', text: '夏日蛙鸣满田间，青禾如浪碧连天。云雾缭绕仙境里，人间烟火胜神仙。' },
  { season: 'autumn', text: '金秋十月稻花香，层叠梯田披金装。哈尼长街宴开席，丰收喜悦满山乡。' },
  { season: 'winter', text: '冬日暖阳照梯田，银霜点点映蓝天。万物休养蓄力时，来年又是丰收年。' }
]

// ============== 3D组件 ==============

// 单棵树
function Tree({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position} scale={scale}>
      {/* 树干 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 0.8, 8]} />
        <meshStandardMaterial color="#5D4037" roughness={0.9} />
      </mesh>
      {/* 树冠 - 多层 */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <coneGeometry args={[0.5, 0.8, 8]} />
        <meshStandardMaterial color="#2E7D32" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.4, 0]} castShadow>
        <coneGeometry args={[0.4, 0.6, 8]} />
        <meshStandardMaterial color="#388E3C" roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[0.25, 0.4, 8]} />
        <meshStandardMaterial color="#43A047" roughness={0.8} />
      </mesh>
    </group>
  )
}

// 森林组（山顶）
function Forest({ position, count = 30 }: { position: [number, number, number], count?: number }) {
  const trees = useMemo(() => {
    const result = []
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5
      const radius = 2 + Math.random() * 4
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const scale = 0.6 + Math.random() * 0.6
      result.push({ x, z, scale, key: i })
    }
    return result
  }, [count])

  return (
    <group position={position}>
      {trees.map((tree) => (
        <Tree 
          key={tree.key} 
          position={[tree.x, 0, tree.z]} 
          scale={tree.scale}
        />
      ))}
    </group>
  )
}

// 蘑菇房（哈尼族传统民居）- 增大尺寸
function MushroomHouse({ position, scale = 1 }: { position: [number, number, number], scale?: number }) {
  return (
    <group position={position} scale={scale * 1.8}>
      {/* 房屋底座 - 石基 */}
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.3, 1.2]} />
        <meshStandardMaterial color="#757575" roughness={0.95} />
      </mesh>
      {/* 房屋主体 - 木结构 */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[1.4, 1.2, 1.0]} />
        <meshStandardMaterial color="#6D4C41" roughness={0.85} />
      </mesh>
      {/* 木梁装饰 */}
      <mesh position={[0, 0.4, 0.51]} castShadow>
        <boxGeometry args={[1.5, 0.1, 0.05]} />
        <meshStandardMaterial color="#5D4037" />
      </mesh>
      {/* 蘑菇形屋顶 - 更大更圆 */}
      <mesh position={[0, 1.7, 0]} castShadow>
        <coneGeometry args={[1.3, 1.0, 8]} />
        <meshStandardMaterial color="#4E342E" roughness={0.9} />
      </mesh>
      {/* 屋顶第二层 */}
      <mesh position={[0, 2.2, 0]} castShadow>
        <coneGeometry args={[0.8, 0.6, 8]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>
      {/* 屋顶尖 */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <coneGeometry args={[0.2, 0.4, 6]} />
        <meshStandardMaterial color="#212121" roughness={0.9} />
      </mesh>
      {/* 门 */}
      <mesh position={[0, 0.5, 0.51]}>
        <boxGeometry args={[0.4, 0.8, 0.05]} />
        <meshStandardMaterial color="#3E2723" />
      </mesh>
      {/* 窗户左 */}
      <mesh position={[-0.45, 0.8, 0.51]}>
        <boxGeometry args={[0.25, 0.3, 0.05]} />
        <meshStandardMaterial color="#FFECB3" emissive="#FFE082" emissiveIntensity={0.5} />
      </mesh>
      {/* 窗户右 */}
      <mesh position={[0.45, 0.8, 0.51]}>
        <boxGeometry args={[0.25, 0.3, 0.05]} />
        <meshStandardMaterial color="#FFECB3" emissive="#FFE082" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

// 村寨
function Village({ position }: { position: [number, number, number] }) {
  const houses = useMemo(() => [
    { x: 0, z: 0, scale: 1.2, rotation: 0 },
    { x: 3, z: 0.5, scale: 1.1, rotation: 0.3 },
    { x: -2.5, z: 1.5, scale: 1.0, rotation: -0.2 },
    { x: 1.5, z: 2.5, scale: 0.95, rotation: 0.5 },
    { x: -1.5, z: -2, scale: 1.1, rotation: -0.4 },
    { x: 4, z: -1.5, scale: 0.9, rotation: 0.1 },
    { x: -4, z: 0, scale: 1.0, rotation: 0.6 },
    { x: 2, z: -2.5, scale: 0.85, rotation: -0.3 },
  ], [])

  return (
    <group position={position}>
      {houses.map((house, i) => (
        <group key={i} rotation={[0, house.rotation, 0]}>
          <MushroomHouse 
            position={[house.x, 0, house.z]} 
            scale={house.scale}
          />
        </group>
      ))}
    </group>
  )
}

// 水渠
function WaterChannel({ points, width = 0.3 }: { points: THREE.Vector3[], width?: number }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points), [points])
  
  return (
    <mesh>
      <tubeGeometry args={[curve, 64, width, 8, false]} />
      <meshStandardMaterial 
        color="#4FC3F7" 
        transparent 
        opacity={0.7}
        roughness={0.1}
        metalness={0.3}
      />
    </mesh>
  )
}

// 精细梯田层 - 增强水面效果
function TerraceLayer({ 
  y, 
  radius, 
  color,
  waterColor,
  hasWater = true
}: { 
  y: number
  radius: number
  color: string
  waterColor: string
  hasWater?: boolean
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape()
    const segments = 64
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      // 不规则曲线边缘 - 更自然的波浪
      const r = radius * (1 + Math.sin(angle * 3) * 0.18 + Math.cos(angle * 5) * 0.12 + Math.sin(angle * 7) * 0.05)
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      if (i === 0) s.moveTo(x, z)
      else s.lineTo(x, z)
    }
    return s
  }, [radius])

  // 内部水面形状（稍小）
  const innerShape = useMemo(() => {
    const s = new THREE.Shape()
    const segments = 64
    const innerRadius = radius * 0.92
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      const r = innerRadius * (1 + Math.sin(angle * 3) * 0.15 + Math.cos(angle * 5) * 0.1)
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      if (i === 0) s.moveTo(x, z)
      else s.lineTo(x, z)
    }
    return s
  }, [radius])

  return (
    <group position={[0, y, 0]}>
      {/* 梯田田埂 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <extrudeGeometry args={[shape, { depth: 0.2, bevelEnabled: false }]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      
      {/* 水面 - 增强反光 */}
      {hasWater && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.18, 0]}>
            <shapeGeometry args={[innerShape]} />
            <meshStandardMaterial 
              color={waterColor} 
              transparent 
              opacity={0.7}
              roughness={0.05}
              metalness={0.6}
              envMapIntensity={1.5}
            />
          </mesh>
          {/* 水面高光层 */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.19, 0]}>
            <shapeGeometry args={[innerShape]} />
            <meshBasicMaterial 
              color="#ffffff" 
              transparent 
              opacity={0.15}
            />
          </mesh>
        </>
      )}
    </group>
  )
}

// 完整的梯田山体
function TerrainMesh({ 
  seed, 
  season, 
  plantedRice,
  onPlant 
}: { 
  seed: number
  season: Season
  plantedRice: PlantedRice[]
  onPlant: (position: THREE.Vector3) => void
}) {
  const config = SEASON_CONFIG[season]
  
  // 梯田层数据
  const terraceLayers = useMemo(() => {
    const layers = []
    const totalLayers = 12
    for (let i = 0; i < totalLayers; i++) {
      const y = i * 0.8
      const baseRadius = 18 - i * 1.2
      // 添加随机变化（基于种子）
      const variance = Math.sin(seed + i * 100) * 0.5
      layers.push({
        y,
        radius: Math.max(2, baseRadius + variance),
        hasWater: season !== 'winter' && i < totalLayers - 2
      })
    }
    return layers
  }, [seed, season])

  // 水渠路径
  const waterChannelPoints = useMemo(() => [
    new THREE.Vector3(0, 10, -2),
    new THREE.Vector3(-2, 8, -1),
    new THREE.Vector3(-4, 6, 1),
    new THREE.Vector3(-6, 4, 3),
    new THREE.Vector3(-8, 2, 5),
    new THREE.Vector3(-10, 0, 8),
  ], [])

  // 点击种植
  const handleClick = useCallback((event: any) => {
    if (event.stopPropagation) event.stopPropagation()
    const point = event.point
    if (point) {
      onPlant(new THREE.Vector3(point.x, point.y + 0.3, point.z))
    }
  }, [onPlant])

  // 季节颜色
  const terraceColors = useMemo(() => {
    const baseHue = season === 'spring' ? 120 : season === 'summer' ? 130 : season === 'autumn' ? 45 : 200
    return terraceLayers.map((_, i) => {
      const lightness = 35 + (i * 2)
      const saturation = season === 'winter' ? 10 : 50
      return `hsl(${baseHue}, ${saturation}%, ${lightness}%)`
    })
  }, [season, terraceLayers])

  return (
    <group onClick={handleClick}>
      {/* 山体基座 */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[20, 22, 1, 64]} />
        <meshStandardMaterial color="#5D4037" roughness={0.95} />
      </mesh>
      
      {/* 梯田层 */}
      {terraceLayers.map((layer, i) => (
        <TerraceLayer
          key={i}
          y={layer.y}
          radius={layer.radius}
          color={terraceColors[i]}
          waterColor={config.waterColor.getStyle()}
          hasWater={layer.hasWater}
        />
      ))}
      
      {/* 山顶森林 */}
      <Forest position={[0, 9.5, 0]} count={35} />
      
      {/* 村寨 - 位于梯田中部 */}
      <Village position={[-8, 4, 6]} />
      
      {/* 第二个村寨 */}
      <Village position={[10, 3, 2]} />
      
      {/* 水渠 */}
      <WaterChannel points={waterChannelPoints} width={0.2} />
      
      {/* 第二条水渠 */}
      <WaterChannel 
        points={[
          new THREE.Vector3(2, 10, 0),
          new THREE.Vector3(4, 7, 2),
          new THREE.Vector3(7, 4, 4),
          new THREE.Vector3(10, 1, 7),
        ]} 
        width={0.15} 
      />
      
      {/* 种植的稻苗 */}
      {plantedRice.map((rice) => (
        <RicePlant key={rice.id} rice={rice} season={season} />
      ))}
    </group>
  )
}

// 稻苗组件 - 增大尺寸，添加发光效果
function RicePlant({ rice, season }: { rice: PlantedRice, season: Season }) {
  const groupRef = useRef<THREE.Group>(null)
  const [scale, setScale] = useState(0)
  const [rippleScale, setRippleScale] = useState(1)
  
  // 生长动画
  useEffect(() => {
    const timer = setTimeout(() => setScale(1), 100)
    return () => clearTimeout(timer)
  }, [])

  // 涟漪动画
  useEffect(() => {
    const interval = setInterval(() => {
      setRippleScale(s => s >= 3 ? 1 : s + 0.05)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  useFrame((state) => {
    if (groupRef.current) {
      // 随风摇曳 - 更明显
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 2 + rice.position.x) * 0.15
      groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 1.5 + rice.position.z) * 0.05
    }
  })

  const height = 0.8 + rice.growth * 1.2  // 增大高度
  const color = season === 'autumn' ? '#F9A825' : '#4CAF50'
  const glowColor = season === 'autumn' ? '#FFD54F' : '#81C784'

  return (
    <group ref={groupRef} position={rice.position} scale={scale}>
      {/* 发光底座 */}
      <pointLight position={[0, 0.3, 0]} color={glowColor} intensity={0.5} distance={2} />
      
      {/* 稻秆 - 多根 */}
      {[0, 0.1, -0.1, 0.05, -0.05].map((offset, i) => (
        <mesh key={i} position={[offset, height / 2, offset * 0.5]} rotation={[0, i * 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.05, height * (0.8 + i * 0.05), 8]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
        </mesh>
      ))}
      
      {/* 稻叶 */}
      {[0.3, -0.3, 0.5, -0.5].map((rot, i) => (
        <mesh key={`leaf-${i}`} position={[0, height * 0.6, 0]} rotation={[0.3, rot, 0.2 * (i % 2 ? 1 : -1)]}>
          <boxGeometry args={[0.02, 0.4, 0.15]} />
          <meshStandardMaterial color={color} side={THREE.DoubleSide} />
        </mesh>
      ))}
      
      {/* 稻穗 */}
      {rice.growth > 0.3 && (
        <group position={[0, height, 0]} rotation={[0.3, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.02, 0.4, 8]} />
            <meshStandardMaterial 
              color={season === 'autumn' ? '#FFD54F' : '#81C784'} 
              emissive={season === 'autumn' ? '#FFA000' : '#66BB6A'}
              emissiveIntensity={0.3}
            />
          </mesh>
          {/* 稻粒 */}
          {[...Array(8)].map((_, i) => (
            <mesh key={i} position={[
              Math.cos(i * Math.PI / 4) * 0.06,
              -0.1 - i * 0.03,
              Math.sin(i * Math.PI / 4) * 0.06
            ]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshStandardMaterial color={season === 'autumn' ? '#FFC107' : '#A5D6A7'} />
            </mesh>
          ))}
        </group>
      )}
      
      {/* 种植涟漪效果 - 动态扩散 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} scale={rippleScale}>
        <ringGeometry args={[0.2, 0.5, 32]} />
        <meshBasicMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.6 * (1 - (rippleScale - 1) / 2)} 
        />
      </mesh>
      
      {/* 第二层涟漪 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} scale={rippleScale * 0.7 + 0.5}>
        <ringGeometry args={[0.3, 0.6, 32]} />
        <meshBasicMaterial 
          color="#81D4FA" 
          transparent 
          opacity={0.4 * (1 - (rippleScale - 1) / 2)} 
        />
      </mesh>
    </group>
  )
}

// 四素同构可视化
function FourElementsVisualization({ 
  activeElement, 
  onElementClick 
}: { 
  activeElement: string | null
  onElementClick: (id: string) => void
}) {
  return (
    <group position={[0, 8, 0]}>
      {FOUR_ELEMENTS.map((element, index) => {
        const angle = (index / 4) * Math.PI * 2 - Math.PI / 2
        const radius = 5
        const x = Math.cos(angle) * radius
        const z = Math.sin(angle) * radius
        const isActive = activeElement === element.id
        
        return (
          <Float
            key={element.id}
            speed={2}
            rotationIntensity={0.5}
            floatIntensity={0.5}
          >
            <group 
              position={[x, 0, z]}
              onClick={() => onElementClick(element.id)}
            >
              <mesh scale={isActive ? 1.3 : 1}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshStandardMaterial 
                  color={element.color}
                  emissive={element.color}
                  emissiveIntensity={isActive ? 0.5 : 0.2}
                />
              </mesh>
              
              <Html center position={[0, 1.5, 0]}>
                <div className={`px-3 py-1 rounded-full text-white text-sm whitespace-nowrap transition-all ${
                  isActive ? 'bg-eco-600 scale-110' : 'bg-black/50'
                }`}>
                  {element.name}
                </div>
              </Html>
            </group>
          </Float>
        )
      })}
      
      {/* 连接线 - 循环 */}
      <mesh>
        <torusGeometry args={[5, 0.05, 16, 100]} />
        <meshBasicMaterial color="#22c55e" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

// 粒子效果
function WeatherParticles({ season, intensity }: { season: Season, intensity: number }) {
  const count = Math.floor(500 * intensity)
  
  if (season === 'winter') {
    return (
      <Sparkles
        count={count}
        scale={40}
        size={3}
        speed={0.5}
        color="#ffffff"
      />
    )
  }
  
  if (season === 'spring') {
    return (
      <Sparkles
        count={count}
        scale={40}
        size={2}
        speed={0.3}
        color="#FFB7C5"
      />
    )
  }
  
  return null
}

// 场景组件
function Scene({ 
  config, 
  onPlant,
  activeElement,
  onElementClick,
  showFourElements
}: { 
  config: TerraceConfig
  onPlant: (position: THREE.Vector3) => void
  activeElement: string | null
  onElementClick: (id: string) => void
  showFourElements: boolean
}) {
  const seasonConfig = SEASON_CONFIG[config.season]
  const timeConfig = TIME_CONFIG[config.timeOfDay]
  
  return (
    <>
      {/* 天空 */}
      <Sky 
        distance={450000}
        sunPosition={timeConfig.sunPosition as [number, number, number]}
        inclination={0.5}
        azimuth={0.25}
      />
      
      {/* 星星（夜晚） */}
      {config.timeOfDay === 'night' && (
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
      )}
      
      {/* 云朵 */}
      {config.timeOfDay !== 'night' && (
        <Cloud
          position={[0, 15, -10]}
          speed={0.2}
          opacity={0.5}
        />
      )}
      
      {/* 光照 */}
      <ambientLight intensity={seasonConfig.ambientIntensity * timeConfig.intensity} />
      <directionalLight
        position={timeConfig.sunPosition as [number, number, number]}
        intensity={timeConfig.intensity}
        color={timeConfig.color}
        castShadow
      />
      
      {/* 雾气 */}
      <fog attach="fog" args={[seasonConfig.fogColor.getStyle(), 20, 80]} />
      
      {/* 梯田地形 */}
      <TerrainMesh
        seed={config.seed}
        season={config.season}
        plantedRice={config.plantedRice}
        onPlant={onPlant}
      />
      
      {/* 四素同构可视化 */}
      {showFourElements && (
        <FourElementsVisualization
          activeElement={activeElement}
          onElementClick={onElementClick}
        />
      )}
      
      {/* 天气粒子 */}
      <WeatherParticles season={config.season} intensity={config.weatherIntensity} />
      
      {/* 控制器 */}
      <OrbitControls
        enableZoom={true}
        enablePan={true}
        minDistance={5}
        maxDistance={50}
        minPolarAngle={0.2}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 2, 0]}
      />
    </>
  )
}

// ============== UI组件 ==============

// 季节选择器
function SeasonSelector({ 
  current, 
  onChange 
}: { 
  current: Season
  onChange: (season: Season) => void 
}) {
  const seasons: Season[] = ['spring', 'summer', 'autumn', 'winter']
  
  return (
    <div className="flex gap-2">
      {seasons.map((season) => {
        const config = SEASON_CONFIG[season]
        const isActive = current === season
        
        return (
          <button
            key={season}
            onClick={() => onChange(season)}
            className={`flex flex-col items-center p-3 rounded-xl transition-all ${
              isActive 
                ? 'bg-eco-500 text-white scale-105 shadow-lg' 
                : 'bg-white/80 text-ink-600 hover:bg-eco-50'
            }`}
          >
            <span className="text-2xl mb-1">{config.emoji}</span>
            <span className="text-xs font-medium">{config.name}</span>
          </button>
        )
      })}
    </div>
  )
}

// 时间轴控制器
function TimeSlider({ 
  current, 
  onChange,
  isPlaying,
  onTogglePlay
}: { 
  current: TimeOfDay
  onChange: (time: TimeOfDay) => void
  isPlaying: boolean
  onTogglePlay: () => void
}) {
  const times: TimeOfDay[] = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night']
  const currentIndex = times.indexOf(current)
  
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-ink-700">时间轴</span>
        <button
          onClick={onTogglePlay}
          className={`p-2 rounded-full transition-colors ${
            isPlaying ? 'bg-eco-500 text-white' : 'bg-ink-100 text-ink-600'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>
      </div>
      
      <div className="relative">
        <div className="h-2 bg-gradient-to-r from-orange-300 via-yellow-300 via-blue-300 to-indigo-900 rounded-full" />
        <input
          type="range"
          min={0}
          max={times.length - 1}
          value={currentIndex}
          onChange={(e) => onChange(times[parseInt(e.target.value)])}
          className="absolute inset-0 w-full opacity-0 cursor-pointer"
        />
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-eco-500"
          style={{ left: `calc(${(currentIndex / (times.length - 1)) * 100}% - 8px)` }}
        />
      </div>
      
      <div className="flex justify-between mt-2 text-xs text-ink-500">
        {times.map((time) => (
          <span key={time}>{TIME_CONFIG[time].name}</span>
        ))}
      </div>
    </div>
  )
}

// 种植统计
function PlantingStats({ count, season }: { count: number, season: Season }) {
  const carbonPerPlant = 5 // 每棵稻苗固碳5g
  const totalCarbon = count * carbonPerPlant
  
  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
      <h3 className="text-sm font-bold text-ink-700 mb-3 flex items-center gap-2">
        <Leaf className="w-4 h-4 text-eco-500" />
        我的生态贡献
      </h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-eco-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-eco-600">{count}</p>
          <p className="text-xs text-eco-700">棵稻苗</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalCarbon}g</p>
          <p className="text-xs text-blue-700">固碳量</p>
        </div>
      </div>
      
      <p className="text-xs text-ink-500 mt-3 text-center">
        点击梯田种下您的生态稻苗 🌱
      </p>
    </div>
  )
}

// 四素同构面板
function FourElementsPanel({ 
  activeElement,
  onClose 
}: { 
  activeElement: string | null
  onClose: () => void
}) {
  const element = FOUR_ELEMENTS.find(e => e.id === activeElement)
  if (!element) return null
  
  const Icon = element.icon
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      className="absolute right-4 top-1/2 -translate-y-1/2 w-72 bg-white/95 backdrop-blur rounded-2xl p-5 shadow-xl z-20"
    >
      <button
        onClick={onClose}
        className="absolute top-3 right-3 p-1 hover:bg-ink-100 rounded-full"
      >
        ✕
      </button>
      
      <div className="flex items-center gap-3 mb-4">
        <div 
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: element.color }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-ink-800">{element.name}</h3>
          <p className="text-xs text-ink-500">四素同构</p>
        </div>
      </div>
      
      <p className="text-sm text-ink-600 leading-relaxed mb-4">
        {element.description}
      </p>
      
      <div className="bg-eco-50 rounded-xl p-3">
        <p className="text-xs text-eco-700">
          🌿 哈尼梯田的"四素同构"是指森林、村寨、梯田、水系四个要素相互依存、循环共生的生态系统，被誉为人与自然和谐共生的典范。
        </p>
      </div>
    </motion.div>
  )
}

// 诗词展示
function PoemDisplay({ season }: { season: Season }) {
  const poem = POEMS.find(p => p.season === season)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur rounded-2xl p-4 max-w-sm"
    >
      <p className="text-sm text-ink-700 leading-relaxed font-serif">
        {poem?.text}
      </p>
      <p className="text-xs text-ink-400 mt-2 text-right">— AI生成</p>
    </motion.div>
  )
}

// 完成弹窗
function CompletionModal({ 
  config,
  onClose,
  onGeneratePolaroid
}: { 
  config: TerraceConfig
  onClose: () => void
  onGeneratePolaroid: () => void
}) {
  const seasonConfig = SEASON_CONFIG[config.season]
  const carbonSaved = CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving + config.plantedRice.length * 5
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-3xl p-6 max-w-md w-full"
      >
        <div className="text-center mb-6">
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-eco-400 to-eco-600 rounded-2xl flex items-center justify-center"
          >
            <Mountain className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold text-ink-800 mb-2">🎉 体验完成！</h2>
          <p className="text-ink-500">您已完成哈尼梯田沉浸式体验</p>
        </div>
        
        {/* 成就统计 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-eco-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-eco-600">{config.plantedRice.length}</p>
            <p className="text-xs text-eco-700">种植稻苗</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{carbonSaved}g</p>
            <p className="text-xs text-blue-700">碳减排</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-lg font-bold text-amber-600">{seasonConfig.emoji}</p>
            <p className="text-xs text-amber-700">{seasonConfig.name}</p>
          </div>
        </div>
        
        {/* 获得徽章 */}
        <div className="bg-gradient-to-r from-eco-50 to-blue-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-bold text-ink-700 mb-2">🏆 获得成就</p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="font-bold text-ink-800">梯田守护者</p>
              <p className="text-xs text-ink-500">完成哈尼梯田生态体验</p>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="space-y-3">
          <Button 
            className="w-full bg-gradient-to-r from-eco-500 to-eco-600"
            onClick={onGeneratePolaroid}
          >
            <Camera className="w-4 h-4 mr-2" />
            生成专属拍立得
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={onClose}
          >
            继续探索
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============== 主组件 ==============

export default function HaniTerraceV2() {
  // 生成唯一种子（千人千样）
  const [seed] = useState(() => Math.floor(Math.random() * 100000))
  
  // 状态
  const [season, setSeason] = useState<Season>('spring')
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning')
  const [plantedRice, setPlantedRice] = useState<PlantedRice[]>([])
  const [isTimePlaying, setIsTimePlaying] = useState(false)
  const [showFourElements, setShowFourElements] = useState(false)
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const [showPoem, setShowPoem] = useState(false)
  
  const { addCarbonSaving } = useCarbonAccountStore()
  const { unlockScene } = usePolaroidStore()
  
  // 配置对象
  const config: TerraceConfig = {
    seed,
    season,
    timeOfDay,
    plantedRice,
    weatherIntensity: season === 'winter' ? 0.5 : season === 'spring' ? 0.3 : 0
  }
  
  // 时间轴自动播放
  useEffect(() => {
    if (!isTimePlaying) return
    
    const times: TimeOfDay[] = ['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'night']
    const interval = setInterval(() => {
      setTimeOfDay(current => {
        const currentIndex = times.indexOf(current)
        const nextIndex = (currentIndex + 1) % times.length
        return times[nextIndex]
      })
    }, 3000)
    
    return () => clearInterval(interval)
  }, [isTimePlaying])
  
  // 种植稻苗
  const handlePlant = useCallback((position: THREE.Vector3) => {
    const newRice: PlantedRice = {
      id: `rice-${Date.now()}-${Math.random()}`,
      position,
      plantedAt: Date.now(),
      growth: Math.random() * 0.5 + 0.5
    }
    setPlantedRice(prev => [...prev, newRice])
    
    // 每种10棵显示诗词
    if ((plantedRice.length + 1) % 10 === 0) {
      setShowPoem(true)
      setTimeout(() => setShowPoem(false), 5000)
    }
  }, [plantedRice.length])
  
  // 完成体验
  const handleComplete = () => {
    const carbonSaved = CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving + plantedRice.length * 5
    
    addCarbonSaving({
      type: 'cloud_tour',
      carbonSaved,
      description: `哈尼梯田体验 - 种植${plantedRice.length}棵稻苗`,
      experienceId: 'hani_terrace'
    })
    
    addExperiencePoints('完成哈尼梯田V2体验', POINTS_REWARDS.experience_complete)
    unlockScene('hani_terrace')
    setShowCompletion(true)
  }
  
  // 生成拍立得
  const handleGeneratePolaroid = () => {
    // 保存体验数据用于拍立得生成
    const polaroidData = {
      seed,
      season,
      timeOfDay,
      plantedCount: plantedRice.length,
      carbonSaved: CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving + plantedRice.length * 5
    }
    
    // 存储到localStorage供拍立得组件使用
    localStorage.setItem('hani_terrace_polaroid_data', JSON.stringify(polaroidData))
    
    // 跳转到拍立得页面
    window.location.hash = '/experience/ai-polaroid?scene=hani_terrace'
  }
  
  // 重置
  const handleReset = () => {
    setPlantedRice([])
    setSeason('spring')
    setTimeOfDay('morning')
    setShowFourElements(false)
    setActiveElement(null)
  }

  return (
    <div className="relative w-full h-screen bg-ink-900">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 15, 25], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene
          config={config}
          onPlant={handlePlant}
          activeElement={activeElement}
          onElementClick={setActiveElement}
          showFourElements={showFourElements}
        />
      </Canvas>
      
      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              {SEASON_CONFIG[season].emoji} 哈尼梯田
            </h1>
            <p className="text-sm text-white/70">
              世界文化遗产 · {SEASON_CONFIG[season].description}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* 左侧控制面板 */}
      <div className="absolute left-4 top-24 space-y-4 z-10 w-64">
        {/* 季节选择 */}
        <div className="bg-white/90 backdrop-blur rounded-2xl p-4">
          <h3 className="text-sm font-bold text-ink-700 mb-3">四季轮回</h3>
          <SeasonSelector current={season} onChange={setSeason} />
        </div>
        
        {/* 时间轴 */}
        <TimeSlider
          current={timeOfDay}
          onChange={setTimeOfDay}
          isPlaying={isTimePlaying}
          onTogglePlay={() => setIsTimePlaying(!isTimePlaying)}
        />
        
        {/* 种植统计 */}
        <PlantingStats count={plantedRice.length} season={season} />
        
        {/* 四素同构按钮 */}
        <button
          onClick={() => setShowFourElements(!showFourElements)}
          className={`w-full flex items-center justify-center gap-2 p-3 rounded-xl transition-all ${
            showFourElements 
              ? 'bg-eco-500 text-white' 
              : 'bg-white/90 text-ink-700 hover:bg-eco-50'
          }`}
        >
          <TreeDeciduous className="w-5 h-5" />
          <span className="font-medium">四素同构</span>
        </button>
      </div>
      
      {/* 右侧四素面板 */}
      <AnimatePresence>
        {activeElement && (
          <FourElementsPanel
            activeElement={activeElement}
            onClose={() => setActiveElement(null)}
          />
        )}
      </AnimatePresence>
      
      {/* 诗词展示 */}
      <AnimatePresence>
        {showPoem && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20"
          >
            <PoemDisplay season={season} />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 底部操作栏 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <div className="flex items-center gap-4 px-6 py-3 bg-white/90 backdrop-blur rounded-full">
          <div className="flex items-center gap-2 text-ink-600">
            <Leaf className="w-4 h-4 text-eco-500" />
            <span className="text-sm">点击梯田种植稻苗</span>
          </div>
          
          <div className="w-px h-6 bg-ink-200" />
          
          <Button
            onClick={handleComplete}
            className="bg-gradient-to-r from-eco-500 to-eco-600"
            disabled={plantedRice.length < 3}
          >
            <Camera className="w-4 h-4 mr-2" />
            完成体验
          </Button>
        </div>
      </div>
      
      {/* 完成弹窗 */}
      <AnimatePresence>
        {showCompletion && (
          <CompletionModal
            config={config}
            onClose={() => setShowCompletion(false)}
            onGeneratePolaroid={handleGeneratePolaroid}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
