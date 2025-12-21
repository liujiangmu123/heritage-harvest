/**
 * 创意画廊页面 - V3 升级版
 * 展示用户创作的非遗作品（编织作品和拍立得照片）
 * 数据来源：artworkStore（持久化存储）
 */

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Share2, X, Leaf, Sparkles, Camera, Grid, LayoutGrid, ImageOff, Trash2, Plus } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import RetroPolaroidCamera from '@/components/experiences/RetroPolaroidCamera'
import CorkboardGallery, { generateMockPhotos } from '@/components/experiences/CorkboardGallery'
import { useArtworkStore, Artwork, WeavingArtwork, PolaroidArtwork } from '@/store/artworkStore'

type FilterType = 'all' | 'weaving' | 'polaroid'
type ViewMode = 'grid' | 'corkboard'

// 获取作品标题
function getArtworkTitle(artwork: Artwork): string {
  if (artwork.type === 'weaving') {
    return (artwork as WeavingArtwork).title
  }
  return (artwork as PolaroidArtwork).sceneName
}

// 获取作品描述
function getArtworkDesc(artwork: Artwork): string {
  if (artwork.type === 'weaving') {
    const w = artwork as WeavingArtwork
    return `${w.craftLevel} · ${w.productStyle}`
  }
  return (artwork as PolaroidArtwork).ecoMessage
}

export default function CreativeGalleryPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<FilterType>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [showCamera, setShowCamera] = useState(false)
  const [animatingLikes, setAnimatingLikes] = useState<Set<string>>(new Set())

  // 从store获取真实作品数据
  const { artworks, removeArtwork, getWeavingArtworks, getPolaroidArtworks } = useArtworkStore()

  // 根据筛选条件过滤作品
  const filteredArtworks = useMemo(() => {
    if (filter === 'weaving') return getWeavingArtworks()
    if (filter === 'polaroid') return getPolaroidArtworks()
    return artworks
  }, [artworks, filter, getWeavingArtworks, getPolaroidArtworks])

  // 转换为软木板画廊格式
  const corkboardPhotos = useMemo(() => {
    return filteredArtworks.map(artwork => ({
      id: artwork.id,
      image: artwork.image,
      title: getArtworkTitle(artwork),
      creator: '我',
      date: new Date(artwork.createdAt).toLocaleDateString('zh-CN'),
      message: getArtworkDesc(artwork),
      likes: 0,
      scene: artwork.type === 'polaroid' ? (artwork as PolaroidArtwork).scene : 'bamboo_forest'
    }))
  }, [filteredArtworks])

  // 点赞处理
  const handleLike = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    
    if (!likedIds.has(id)) {
      setAnimatingLikes(prev => new Set(prev).add(id))
      setTimeout(() => {
        setAnimatingLikes(prev => {
          const newSet = new Set(prev)
          newSet.delete(id)
          return newSet
        })
      }, 600)
    }
    
    setLikedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  // 删除作品
  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (confirm('确定要删除这个作品吗？')) {
      removeArtwork(id)
      setSelectedArtwork(null)
    }
  }

  // 分享处理
  const handleShare = (artwork: Artwork, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const title = getArtworkTitle(artwork)
    
    if (navigator.share) {
      navigator.share({
        title: title,
        text: `来看看我的非遗创作「${title}」`,
        url: window.location.href,
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('链接已复制，快去分享给好友吧！')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* 页面标题 - 增加顶部间距避免与导航栏重叠 */}
      <div className="pt-20 pb-6 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">我的作品集</h1>
          <p className="text-slate-500">
            {artworks.length > 0 
              ? `已创作 ${artworks.length} 件作品` 
              : '开始你的非遗创作之旅吧！'}
          </p>
        </div>
      </div>

      {/* 筛选器和视图切换 */}
      <div className="sticky top-16 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧：筛选器 */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                全部 ({artworks.length})
              </button>
              <button
                onClick={() => setFilter('weaving')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'weaving'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                🎋 编织 ({getWeavingArtworks().length})
              </button>
              <button
                onClick={() => setFilter('polaroid')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filter === 'polaroid'
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                📷 拍立得 ({getPolaroidArtworks().length})
              </button>
            </div>

            {/* 右侧：视图切换和创作按钮 */}
            <div className="flex items-center gap-2">
              {/* 视图切换 */}
              <div className="flex bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-emerald-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="网格视图"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('corkboard')}
                  className={`p-2 rounded-md transition-all ${
                    viewMode === 'corkboard'
                      ? 'bg-white shadow-sm text-amber-600'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                  title="软木板视图"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* 创作按钮 */}
              <button
                onClick={() => navigate('/experience/bamboo-weaving')}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full text-sm font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                开始编织
              </button>
              <button
                onClick={() => setShowCamera(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-full text-sm font-medium transition-all shadow-lg shadow-amber-500/30"
              >
                <Camera className="w-4 h-4" />
                拍立得
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* 空状态 */}
          {filteredArtworks.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <ImageOff className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">还没有作品</h3>
              <p className="text-slate-400 mb-6">
                {filter === 'weaving' && '去体验藤编工艺，创作你的第一件作品吧！'}
                {filter === 'polaroid' && '去拍摄你的第一张低碳云游纪念照吧！'}
                {filter === 'all' && '开始你的非遗创作之旅吧！'}
              </p>
              <button
                onClick={() => navigate('/experience/bamboo-weaving')}
                className="px-6 py-3 bg-emerald-500 text-white rounded-full font-medium hover:bg-emerald-600 transition-colors"
              >
                开始创作
              </button>
            </motion.div>
          )}

          {/* 网格视图 */}
          {viewMode === 'grid' && filteredArtworks.length > 0 && (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredArtworks.map((artwork, index) => (
                <motion.div
                  key={artwork.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedArtwork(artwork)}
                  className="group cursor-pointer"
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    {/* 类型标签 */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        artwork.type === 'weaving' 
                          ? 'bg-amber-100 text-amber-700' 
                          : 'bg-sky-100 text-sky-700'
                      }`}>
                        {artwork.type === 'weaving' ? '🎋 编织' : '📷 拍立得'}
                      </span>
                    </div>

                    {/* 作品图片 */}
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={artwork.image}
                        alt={getArtworkTitle(artwork)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    {/* 作品信息 */}
                    <div className="p-4">
                      <h3 className="font-semibold text-slate-800 mb-1 truncate">
                        {getArtworkTitle(artwork)}
                      </h3>
                      <p className="text-sm text-slate-500 mb-3 truncate">
                        {getArtworkDesc(artwork)}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        {/* 碳减排数据 */}
                        <div className="flex items-center gap-1 text-emerald-600">
                          <Leaf className="w-4 h-4" />
                          <span className="text-sm font-medium">-{artwork.carbonSaved}g</span>
                        </div>

                        {/* 点赞按钮 */}
                        <button
                          onClick={(e) => handleLike(artwork.id, e)}
                          className="relative flex items-center gap-1 text-slate-500 hover:text-rose-500 transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 transition-all duration-200 ${
                              likedIds.has(artwork.id) ? 'fill-rose-500 text-rose-500 scale-110' : ''
                            }`}
                          />
                          {animatingLikes.has(artwork.id) && (
                            <motion.span
                              initial={{ scale: 1, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                            </motion.span>
                          )}
                        </button>
                      </div>

                      {/* 创作时间 */}
                      <p className="text-xs text-slate-400 mt-2">
                        {new Date(artwork.createdAt).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* 软木板视图 */}
          {viewMode === 'corkboard' && filteredArtworks.length > 0 && (
            <motion.div
              key="corkboard"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <CorkboardGallery photos={corkboardPhotos} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 复古拍立得相机弹窗 */}
      <AnimatePresence>
        {showCamera && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCamera(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              <RetroPolaroidCamera
                onClose={() => setShowCamera(false)}
                onComplete={() => setShowCamera(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 作品详情弹窗 */}
      <AnimatePresence>
        {selectedArtwork && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedArtwork(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl overflow-hidden max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative"
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => setSelectedArtwork(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* 作品大图 */}
              <div className="aspect-square">
                <img
                  src={selectedArtwork.image}
                  alt={getArtworkTitle(selectedArtwork)}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* 详情内容 */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      selectedArtwork.type === 'weaving' 
                        ? 'bg-amber-100 text-amber-700' 
                        : 'bg-sky-100 text-sky-700'
                    }`}>
                      {selectedArtwork.type === 'weaving' ? '🎋 编织作品' : '📷 拍立得照片'}
                    </span>
                    <h2 className="text-2xl font-bold text-slate-800 mt-2">
                      {getArtworkTitle(selectedArtwork)}
                    </h2>
                    <p className="text-slate-500 mt-1">{getArtworkDesc(selectedArtwork)}</p>
                  </div>
                  
                  {/* 删除按钮 */}
                  <button
                    onClick={(e) => handleDelete(selectedArtwork.id, e)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="删除作品"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 生态数据 */}
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl mb-6">
                  <div className="flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-500" />
                    <span className="text-emerald-700 font-medium">
                      -{selectedArtwork.carbonSaved}g 碳减排
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <span className="text-amber-700 font-medium">
                      +{selectedArtwork.pointsEarned} 绿色积分
                    </span>
                  </div>
                </div>

                {/* 编织作品额外信息 */}
                {selectedArtwork.type === 'weaving' && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {Math.round((selectedArtwork as WeavingArtwork).smoothness)}
                      </p>
                      <p className="text-xs text-slate-500">平滑度</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {Math.round((selectedArtwork as WeavingArtwork).creativity)}
                      </p>
                      <p className="text-xs text-slate-500">创意度</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {Math.round((selectedArtwork as WeavingArtwork).persistence)}
                      </p>
                      <p className="text-xs text-slate-500">坚持度</p>
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => handleLike(selectedArtwork.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
                      likedIds.has(selectedArtwork.id)
                        ? 'bg-rose-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${likedIds.has(selectedArtwork.id) ? 'fill-white' : ''}`} />
                    {likedIds.has(selectedArtwork.id) ? '已收藏' : '收藏'}
                  </button>
                  <button
                    onClick={(e) => handleShare(selectedArtwork, e)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                    分享
                  </button>
                </div>

                {/* 创作时间 */}
                <p className="text-center text-sm text-slate-400 mt-4">
                  创作于 {new Date(selectedArtwork.createdAt).toLocaleString('zh-CN')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
