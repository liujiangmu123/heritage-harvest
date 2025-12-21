/**
 * 软木板风格画廊组件 - 仿 bubbbly.com 公共画廊
 * 特点：红色图钉、随机旋转角度、瀑布流布局
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Heart, 
  Share2, 
  Download,
  Leaf,
  Calendar,
  User,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface GalleryPhoto {
  id: string
  image: string
  title: string
  creator: string
  date: string
  message: string
  likes: number
  scene?: string
}

interface CorkboardGalleryProps {
  photos: GalleryPhoto[]
  onPhotoClick?: (photo: GalleryPhoto) => void
  className?: string
}

// 图钉组件
function Pushpin({ color = 'red' }: { color?: 'red' | 'yellow' | 'green' | 'blue' }) {
  const colors = {
    red: 'from-red-500 to-red-700',
    yellow: 'from-yellow-400 to-yellow-600',
    green: 'from-green-500 to-green-700',
    blue: 'from-blue-500 to-blue-700'
  }
  
  return (
    <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-10">
      {/* 图钉头 */}
      <div 
        className={cn(
          'w-5 h-5 rounded-full bg-gradient-to-br shadow-lg',
          colors[color]
        )}
        style={{
          boxShadow: '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.3)'
        }}
      >
        {/* 高光 */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white/40" />
      </div>
      {/* 图钉针 */}
      <div 
        className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-3 bg-gradient-to-b from-gray-400 to-gray-600"
        style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
      />
    </div>
  )
}

// 拍立得照片卡片
function PolaroidPhoto({ 
  photo, 
  rotation,
  onClick,
  onLike
}: { 
  photo: GalleryPhoto
  rotation: number
  onClick: () => void
  onLike: () => void
}) {
  const [isLiked, setIsLiked] = useState(false)
  const [showHeart, setShowHeart] = useState(false)

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLiked) {
      setIsLiked(true)
      setShowHeart(true)
      setTimeout(() => setShowHeart(false), 600)
      onLike()
    }
  }

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isLiked) {
      handleLike(e)
    }
  }

  return (
    <motion.div
      className="relative cursor-pointer group"
      style={{ transform: `rotate(${rotation}deg)` }}
      whileHover={{ 
        scale: 1.05, 
        rotate: 0,
        zIndex: 20,
        transition: { duration: 0.2 }
      }}
      onClick={onClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* 图钉 */}
      <Pushpin color={['red', 'yellow', 'green', 'blue'][Math.floor(Math.random() * 4)] as any} />
      
      {/* 拍立得卡片 */}
      <div 
        className="bg-white p-2 pb-10 rounded-sm shadow-lg transition-shadow group-hover:shadow-2xl"
        style={{
          boxShadow: '0 4px 12px rgba(0,0,0,0.15), 0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        {/* 照片 */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <img 
            src={photo.image} 
            alt={photo.title}
            className="w-full h-full object-cover"
          />
          
          {/* 复古滤镜 */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent mix-blend-overlay" />
          
          {/* 双击爱心动画 */}
          <AnimatePresence>
            {showHeart && (
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 1.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Heart className="w-16 h-16 text-white fill-red-500 drop-shadow-lg" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* 底部信息 */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="font-handwriting text-gray-700 text-sm truncate">{photo.title}</p>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-400">{photo.date}</p>
            <button
              onClick={handleLike}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              <Heart className={cn('w-3 h-3', isLiked && 'fill-red-500 text-red-500')} />
              {photo.likes + (isLiked ? 1 : 0)}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// 照片详情弹窗
function PhotoDetailModal({ 
  photo, 
  onClose 
}: { 
  photo: GalleryPhoto
  onClose: () => void 
}) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-md w-full"
      >
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {/* 可翻转的拍立得 */}
        <div 
          className="relative cursor-pointer perspective-1000"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <motion.div
            className="relative preserve-3d"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: 'spring', stiffness: 100 }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* 正面 */}
            <div 
              className="bg-white p-4 pb-20 rounded-sm shadow-2xl backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div className="aspect-square overflow-hidden bg-gray-100 rounded">
                <img 
                  src={photo.image} 
                  alt={photo.title}
                  className="w-full h-full object-cover"
                />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-handwriting text-gray-800 text-xl">{photo.title}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {photo.creator}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {photo.date}
                  </span>
                </div>
              </div>
              
              <div className="absolute top-2 right-2 px-2 py-1 bg-black/30 rounded text-white text-xs">
                点击翻转
              </div>
            </div>

            {/* 背面 */}
            <div 
              className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-sm shadow-2xl backface-hidden flex flex-col"
              style={{ 
                backfaceVisibility: 'hidden',
                transform: 'rotateY(180deg)'
              }}
            >
              <div className="absolute inset-4 border border-amber-200 rounded pointer-events-none" />
              
              <div className="flex-1 flex flex-col items-center justify-center">
                <Leaf className="w-10 h-10 text-eco-500 mb-4" />
                <p className="text-amber-600 font-medium mb-4">秘密寄语</p>
                <div className="bg-white/80 rounded-xl p-4 w-full">
                  <p className="text-center text-amber-800 leading-relaxed">
                    {photo.message}
                  </p>
                </div>
              </div>
              
              <div className="text-center text-xs text-amber-400 mt-4">
                乡遗识 · 生态智慧平台
              </div>
            </div>
          </motion.div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-4">
          <button className="flex-1 py-3 bg-white/90 hover:bg-white text-amber-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Heart className="w-5 h-5" />
            喜欢
          </button>
          <button className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
            <Share2 className="w-5 h-5" />
            分享
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// 主组件
export default function CorkboardGallery({
  photos,
  onPhotoClick,
  className
}: CorkboardGalleryProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null)

  // 为每张照片生成随机旋转角度
  const rotations = useMemo(() => {
    return photos.map(() => (Math.random() - 0.5) * 12) // -6 到 6 度
  }, [photos])

  const handlePhotoClick = (photo: GalleryPhoto) => {
    setSelectedPhoto(photo)
    onPhotoClick?.(photo)
  }

  const handleLike = (photoId: string) => {
    console.log('Liked photo:', photoId)
    // 实际应用中这里调用 store 更新点赞数
  }

  return (
    <div className={cn('relative', className)}>
      {/* 软木板背景 */}
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `
            linear-gradient(135deg, #d4a574 0%, #c49a6c 25%, #b8906a 50%, #c49a6c 75%, #d4a574 100%)
          `,
          boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.2), 0 4px 20px rgba(0,0,0,0.15)'
        }}
      >
        {/* 软木纹理 */}
        <div 
          className="absolute inset-0 opacity-30 rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
        
        {/* 木框边缘 */}
        <div className="absolute inset-0 rounded-2xl border-8 border-amber-900/30" />
      </div>

      {/* 照片网格 */}
      <div className="relative p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {photos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <PolaroidPhoto
                photo={photo}
                rotation={rotations[index]}
                onClick={() => handlePhotoClick(photo)}
                onLike={() => handleLike(photo.id)}
              />
            </motion.div>
          ))}
        </div>

        {/* 空状态 */}
        {photos.length === 0 && (
          <div className="text-center py-20">
            <MessageCircle className="w-16 h-16 text-amber-300 mx-auto mb-4" />
            <p className="text-amber-700 font-medium">还没有照片</p>
            <p className="text-amber-500 text-sm mt-1">快来拍摄第一张吧！</p>
          </div>
        )}
      </div>

      {/* 照片详情弹窗 */}
      <AnimatePresence>
        {selectedPhoto && (
          <PhotoDetailModal
            photo={selectedPhoto}
            onClose={() => setSelectedPhoto(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

// 导出示例数据生成函数
export function generateMockPhotos(count: number = 12): GalleryPhoto[] {
  const scenes = ['哈尼梯田', '生态茶园', '竹海深处', '蜡染工坊', '剪纸工坊', '泥塑工坊']
  const messages = [
    '每一次云游，都是对地球的温柔守护 🌍',
    '传承非遗，守护绿色家园 🌿',
    '低碳出行，从云游开始 ☁️',
    '文化与生态，和谐共生 🎋',
    '用心感受，用行动守护 💚',
    '千年智慧，绿色传承 🏔️'
  ]
  const names = ['小雅', '阿明', '小林', '云朵', '小蓝', '老王', '小美', '大壮']
  
  return Array.from({ length: count }, (_, i) => ({
    id: `photo-${i + 1}`,
    image: `https://picsum.photos/400/400?random=${i + 1}`,
    title: scenes[i % scenes.length],
    creator: names[i % names.length],
    date: new Date(Date.now() - i * 86400000).toLocaleDateString('zh-CN'),
    message: messages[i % messages.length],
    likes: Math.floor(Math.random() * 200) + 10,
    scene: scenes[i % scenes.length]
  }))
}
