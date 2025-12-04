import { Suspense, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment, 
  ContactShadows,
  Html,
  useProgress,
  PresentationControls,
  Float
} from '@react-three/drei'
import * as THREE from 'three'

// 加载进度指示器
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 border-4 border-heritage-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-heritage-600 font-medium">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}

// 竹编产品模型 - 程序化生成的竹编篮子
function BambooBasket({ color = '#8B7355' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })

  return (
    <group ref={meshRef}>
      {/* 篮子主体 - 圆柱形 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.8, 0.6, 1, 32, 1, true]} />
        <meshStandardMaterial 
          color={color} 
          side={THREE.DoubleSide}
          roughness={0.8}
          metalness={0.1}
        />
      </mesh>
      
      {/* 篮子底部 */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <circleGeometry args={[0.6, 32]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
      
      {/* 竹编纹理条纹 */}
      {Array.from({ length: 12 }).map((_, i) => (
        <mesh 
          key={i} 
          position={[
            Math.cos((i / 12) * Math.PI * 2) * 0.71,
            0.5,
            Math.sin((i / 12) * Math.PI * 2) * 0.71
          ]}
          rotation={[0, -(i / 12) * Math.PI * 2, 0]}
        >
          <boxGeometry args={[0.05, 1, 0.02]} />
          <meshStandardMaterial color="#5D4E37" roughness={0.7} />
        </mesh>
      ))}
      
      {/* 篮子提手 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <torusGeometry args={[0.4, 0.05, 8, 32, Math.PI]} />
        <meshStandardMaterial color="#5D4E37" roughness={0.6} />
      </mesh>
    </group>
  )
}

// 茶壶模型
function TeaPot({ color = '#8B4513' }: { color?: string }) {
  const meshRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <group ref={meshRef}>
      {/* 壶身 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial 
          color={color}
          roughness={0.3}
          metalness={0.1}
        />
      </mesh>
      
      {/* 壶嘴 */}
      <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <cylinderGeometry args={[0.08, 0.05, 0.4, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 壶把 */}
      <mesh position={[-0.55, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.2, 0.04, 8, 32, Math.PI]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 壶盖 */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.25, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 壶盖把手 */}
      <mesh position={[0, 1, 0]} castShadow>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      
      {/* 底座 */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.3, 0.1, 32]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  )
}

// 蜡染丝巾模型 - 波浪形布料
function SilkScarf({ color = '#1e3a5f' }: { color?: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const positions = meshRef.current.geometry.attributes.position
      for (let i = 0; i < positions.count; i++) {
        const x = positions.getX(i)
        const y = positions.getY(i)
        const waveX = 0.1 * Math.sin(x * 2 + state.clock.elapsedTime)
        const waveY = 0.05 * Math.sin(y * 3 + state.clock.elapsedTime * 1.5)
        positions.setZ(i, waveX + waveY)
      }
      positions.needsUpdate = true
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 4, 0, 0]} position={[0, 0.5, 0]} castShadow>
      <planeGeometry args={[2, 1.5, 32, 32]} />
      <meshStandardMaterial 
        color={color}
        side={THREE.DoubleSide}
        roughness={0.6}
        metalness={0.1}
      />
    </mesh>
  )
}

// 产品类型
type ProductType = 'bamboo' | 'teapot' | 'scarf'

interface ProductViewer3DProps {
  productType?: ProductType
  backgroundColor?: string
  showControls?: boolean
  autoRotate?: boolean
  className?: string
}

export default function ProductViewer3D({
  productType = 'teapot',
  backgroundColor = '#fdf8f3',
  showControls = true,
  autoRotate = true,
  className = ''
}: ProductViewer3DProps) {
  const [, setIsLoading] = useState(true)

  const renderProduct = () => {
    switch (productType) {
      case 'bamboo':
        return <BambooBasket />
      case 'scarf':
        return <SilkScarf />
      case 'teapot':
      default:
        return <TeaPot />
    }
  }

  return (
    <div className={`w-full h-full ${className}`} style={{ background: backgroundColor }}>
      <Canvas
        shadows
        camera={{ position: [3, 2, 3], fov: 45 }}
        onCreated={() => setIsLoading(false)}
      >
        <Suspense fallback={<Loader />}>
          {/* 灯光 */}
          <ambientLight intensity={0.5} />
          <spotLight
            position={[10, 10, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1}
            castShadow
            shadow-mapSize={2048}
          />
          <pointLight position={[-10, -10, -10]} intensity={0.5} />

          {/* 环境贴图 */}
          <Environment preset="city" />

          {/* 产品展示 */}
          <PresentationControls
            global
            config={{ mass: 2, tension: 500 }}
            snap={{ mass: 4, tension: 300 }}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.4, Math.PI / 2]}
          >
            <Float
              speed={1.5}
              rotationIntensity={0.5}
              floatIntensity={0.5}
            >
              {renderProduct()}
            </Float>
          </PresentationControls>

          {/* 地面阴影 */}
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />

          {/* 轨道控制 */}
          {showControls && (
            <OrbitControls
              autoRotate={autoRotate}
              autoRotateSpeed={2}
              enablePan={false}
              enableZoom={true}
              minPolarAngle={Math.PI / 6}
              maxPolarAngle={Math.PI / 2}
              minDistance={2}
              maxDistance={6}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  )
}
