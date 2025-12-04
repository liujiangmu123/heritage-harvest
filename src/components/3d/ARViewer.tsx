import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { 
  OrbitControls, 
  Environment,
  Html,
  useProgress,
  PresentationControls
} from '@react-three/drei'
import { XR, ARButton } from '@react-three/xr'
import * as THREE from 'three'
import { Camera, RotateCcw, ZoomIn, Smartphone, Box } from 'lucide-react'

// 加载指示器
function Loader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2 text-white">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
        <p className="font-medium">{progress.toFixed(0)}%</p>
      </div>
    </Html>
  )
}

// 通用产品展示模型 - 礼盒
function GiftBox({ color = '#c9a227' }: { color?: string }) {
  const boxRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (boxRef.current) {
      boxRef.current.rotation.y += 0.01
    }
  })

  return (
    <group ref={boxRef} scale={0.5}>
      {/* 盒子主体 */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.2, 0.8, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* 盒盖 */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[1.3, 0.15, 1.3]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      
      {/* 丝带横向 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[1.35, 0.95, 0.12]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.4} />
      </mesh>
      
      {/* 丝带纵向 */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.12, 0.95, 1.35]} />
        <meshStandardMaterial color="#d32f2f" roughness={0.4} />
      </mesh>
      
      {/* 蝴蝶结 */}
      <group position={[0, 1.05, 0]}>
        <mesh position={[-0.15, 0, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#d32f2f" roughness={0.4} />
        </mesh>
        <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#d32f2f" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0]} castShadow>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#b71c1c" roughness={0.4} />
        </mesh>
      </group>
      
      {/* 非遗标签 */}
      <mesh position={[0.65, 0.6, 0.65]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial color="#fff8e1" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// 茶叶罐模型
function TeaCanister({ color = '#4a5d23' }: { color?: string }) {
  const canRef = useRef<THREE.Group>(null)
  
  useFrame(() => {
    if (canRef.current) {
      canRef.current.rotation.y += 0.008
    }
  })

  return (
    <group ref={canRef} scale={0.6}>
      {/* 罐身 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.45, 1.2, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.2} 
          metalness={0.6}
        />
      </mesh>
      
      {/* 罐盖 */}
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.42, 0.2, 32]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.6} />
      </mesh>
      
      {/* 盖顶 */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* 装饰环 */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <torusGeometry args={[0.46, 0.03, 8, 32]} />
        <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, 0]} castShadow>
        <torusGeometry args={[0.41, 0.03, 8, 32]} />
        <meshStandardMaterial color="#c9a227" roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// AR场景内容
function ARScene({ modelType }: { modelType: 'giftbox' | 'teacan' }) {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} castShadow />
      <pointLight position={[-5, 5, -5]} intensity={0.4} />
      
      <PresentationControls
        global
        config={{ mass: 2, tension: 400 }}
        snap={{ mass: 4, tension: 300 }}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 2]}
      >
        {modelType === 'giftbox' ? <GiftBox /> : <TeaCanister />}
      </PresentationControls>
    </>
  )
}

interface ARViewerProps {
  modelType?: 'giftbox' | 'teacan'
  productName?: string
  onClose?: () => void
}

export default function ARViewer({ 
  modelType = 'giftbox',
  productName = '非遗礼盒',
  onClose 
}: ARViewerProps) {
  const [isARSupported, setIsARSupported] = useState(false)

  // 检测AR支持
  useEffect(() => {
    if (navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
        setIsARSupported(supported)
      })
    }
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-ink-950">
      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{ position: [0, 1, 3], fov: 50 }}
        style={{ background: 'linear-gradient(180deg, #1a1d24 0%, #2d323c 100%)' }}
      >
        <XR>
          <Suspense fallback={<Loader />}>
            <ARScene modelType={modelType} />
            <Environment preset="apartment" />
            <OrbitControls 
              enablePan={false}
              minDistance={1.5}
              maxDistance={5}
              autoRotate
              autoRotateSpeed={1}
            />
          </Suspense>
        </XR>
      </Canvas>

      {/* 顶部信息栏 */}
      <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center justify-between">
          <div className="text-white">
            <h2 className="text-xl font-bold">{productName}</h2>
            <p className="text-sm text-white/60">3D产品展示</p>
          </div>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 底部控制栏 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="max-w-lg mx-auto space-y-4">
          {/* AR按钮 */}
          {isARSupported ? (
            <div className="flex justify-center">
              <ARButton 
                className="flex items-center gap-2 px-6 py-3 bg-heritage-500 hover:bg-heritage-600 text-white rounded-xl font-medium transition-colors"
              >
                <Camera className="w-5 h-5" />
                开启AR体验（摄像头）
              </ARButton>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/80 text-sm">
                <Smartphone className="w-4 h-4" />
                <span>请使用支持WebXR的移动设备开启AR</span>
              </div>
            </div>
          )}

          {/* 操作提示 */}
          <div className="flex justify-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/80 text-sm">
              <RotateCcw className="w-4 h-4" />
              <span>拖动旋转</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-xl text-white/80 text-sm">
              <ZoomIn className="w-4 h-4" />
              <span>双指缩放</span>
            </div>
          </div>

          {/* 提示 */}
          <p className="text-center text-white/50 text-sm">
            拖动旋转 · 双指缩放 · {isARSupported ? '点击AR按钮使用摄像头' : '在手机上体验AR'}
          </p>
        </div>
      </div>

      {/* AR功能说明浮层 */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 max-w-[200px]">
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-4 text-white text-sm space-y-3">
          <div className="flex items-start gap-2">
            <Box className="w-5 h-5 flex-shrink-0 text-heritage-400" />
            <div>
              <p className="font-medium">3D展示</p>
              <p className="text-white/60 text-xs">360°全方位查看产品细节</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Camera className="w-5 h-5 flex-shrink-0 text-heritage-400" />
            <div>
              <p className="font-medium">AR体验</p>
              <p className="text-white/60 text-xs">通过摄像头将产品放入真实环境</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
