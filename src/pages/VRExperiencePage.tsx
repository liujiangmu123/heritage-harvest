import { useState, useRef, Suspense, lazy, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Maximize2, RotateCcw, Info, Box, Image } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { heritages } from '@/data/mockData'

// 懒加载3D组件
const ProductViewer3D = lazy(() => import('@/components/3d/ProductViewer3D'))

// 3D加载占位符
function Loader3D() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-ink-900">
      <div className="text-center text-white">
        <div className="w-16 h-16 mx-auto mb-4 border-4 border-heritage-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-heritage-400">加载3D模型中...</p>
      </div>
    </div>
  )
}

export default function VRExperiencePage() {
  const { id } = useParams()
  const [showInfo, setShowInfo] = useState(true)
  const [viewMode, setViewMode] = useState<'3d' | 'panorama'>('3d')
  const [isARSupported, setIsARSupported] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const heritage = heritages.find(h => h.vrSceneId === id) || heritages[0]

  // 根据非遗类型选择3D模型
  const getProductType = (): 'bamboo' | 'teapot' | 'scarf' => {
    if (id?.includes('bamboo')) return 'bamboo'
    if (id?.includes('tieguanyin')) return 'teapot'
    if (id?.includes('batik')) return 'scarf'
    return 'teapot'
  }

  // 检测AR支持
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.xr) {
      navigator.xr.isSessionSupported('immersive-ar').then(setIsARSupported)
    }
  }, [])

  return (
    <div className="min-h-screen bg-ink-950">
      {/* VR/3D场景容器 */}
      <div 
        ref={containerRef}
        className="relative w-full h-screen"
      >
        {/* 3D产品展示 */}
        <AnimatePresence mode="wait">
          {viewMode === '3d' ? (
            <motion.div
              key="3d"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              <Suspense fallback={<Loader3D />}>
                <ProductViewer3D 
                  productType={getProductType()}
                  backgroundColor="#1a1d24"
                  autoRotate={true}
                />
              </Suspense>
            </motion.div>
          ) : (
            <motion.div
              key="panorama"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
              {/* 360全景图模式 */}
              <img
                src={heritage.images[0]}
                alt={heritage.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 顶部导航 */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4">
          <div className="flex items-center justify-between">
            <Link to="/heritage">
              <Button variant="glass" size="sm" className="text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Badge variant="heritage">
                {heritage.level === 'national' ? '国家级' : '省级'}非遗
              </Badge>
              <Badge variant="outline" className="text-white border-white/30">
                VR沉浸体验
              </Badge>
            </div>
          </div>
        </div>

        {/* 模式切换指示 */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10">
          <div className="flex gap-2 p-1 bg-white/10 backdrop-blur-xl rounded-xl">
            <button
              onClick={() => setViewMode('3d')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === '3d' ? 'bg-heritage-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Box className="w-4 h-4" />
              3D模型
            </button>
            <button
              onClick={() => setViewMode('panorama')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'panorama' ? 'bg-heritage-500 text-white' : 'text-white/60 hover:text-white'
              }`}
            >
              <Image className="w-4 h-4" />
              全景图
            </button>
          </div>
          {isARSupported && (
            <p className="text-center text-heritage-400 text-xs mt-2">✨ 您的设备支持AR体验</p>
          )}
        </div>

        {/* 信息面板 */}
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-80 glass-card rounded-2xl p-6 text-white"
          >
            <h2 className="text-2xl font-bold mb-2">{heritage.name}</h2>
            <p className="text-white/70 text-sm mb-4">{heritage.description}</p>
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <img
                  src={heritage.inheritor.avatar}
                  alt={heritage.inheritor.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">{heritage.inheritor.name}</p>
                  <p className="text-xs text-white/60">{heritage.inheritor.title}</p>
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 pt-4">
              <h3 className="font-medium mb-2">核心技艺</h3>
              <div className="flex flex-wrap gap-2">
                {heritage.techniques.map((t) => (
                  <Badge key={t} variant="outline" size="sm" className="text-white border-white/30">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* 底部控制栏 */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          <div className="glass-card rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-heritage-500 flex items-center justify-center">
                  <Box className="w-6 h-6 text-white" />
                </div>
                <div className="text-white">
                  <p className="font-medium">{heritage.name}</p>
                  <p className="text-sm text-white/60">{viewMode === '3d' ? '3D产品展示' : '全景图浏览'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="信息面板"
                >
                  <Info className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => setViewMode(viewMode === '3d' ? 'panorama' : '3d')}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="切换模式"
                >
                  <RotateCcw className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={() => containerRef.current?.requestFullscreen()}
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                  title="全屏"
                >
                  <Maximize2 className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 360度提示 */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 text-center">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-white/60 text-sm"
          >
            拖动鼠标或使用VR设备进行360°全景浏览
          </motion.div>
        </div>
      </div>
    </div>
  )
}
