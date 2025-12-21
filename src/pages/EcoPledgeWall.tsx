/**
 * 生态承诺墙页面
 * 展示用户的生态承诺和拍立得照片
 */

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Heart, 
  Share2, 
  X,
  Leaf
} from 'lucide-react'
import { EcoPledge, PledgeCategory, ECO_LEVELS, generateId } from '@/types/eco'
import { useGreenPointsStore, addPledgePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { cn } from '@/lib/utils'

/** 承诺类别配置 */
const PLEDGE_CATEGORIES: Record<PledgeCategory, { name: string; icon: string; color: string }> = {
  reduce_plastic: { name: '减塑行动', icon: '🎋', color: 'bg-bamboo-100 text-bamboo-700' },
  save_energy: { name: '节能减排', icon: '💡', color: 'bg-eco-100 text-eco-700' },
  green_travel: { name: '绿色出行', icon: '🚲', color: 'bg-carbon-100 text-carbon-700' },
  support_heritage: { name: '传承非遗', icon: '🏺', color: 'bg-heritage-100 text-heritage-700' }
}

/** 模拟承诺数据 */
const MOCK_PLEDGES: EcoPledge[] = [
  {
    id: '1',
    polaroidImage: '',
    ecoMessage: '🌱 今天的云游，是明天的绿荫',
    pledgeContent: '我承诺每周减少使用5个塑料袋，用竹编购物袋替代',
    userName: '生态守护者',
    userAvatar: '',
    userEcoLevel: 'guardian',
    carbonSaved: 2500,
    createdAt: '2024-12-15T10:30:00Z',
    supportCount: 42,
    category: 'reduce_plastic',
    fulfilled: false
  },
  {
    id: '2',
    polaroidImage: '',
    ecoMessage: '🌿 每一次数字旅行，都是对地球的温柔',
    pledgeContent: '我承诺每月至少参与一次云游体验，减少实地旅游碳排放',
    userName: '绿色使者',
    userAvatar: '',
    userEcoLevel: 'sprout',
    carbonSaved: 1800,
    createdAt: '2024-12-14T15:20:00Z',
    supportCount: 28,
    category: 'green_travel',
    fulfilled: true,
    fulfilledAt: '2024-12-18T09:00:00Z'
  },
  {
    id: '3',
    polaroidImage: '',
    ecoMessage: '🌳 低碳出行，让美景永存',
    pledgeContent: '我承诺学习并传承一项传统手工艺，让非遗智慧延续',
    userName: '文化传承人',
    userAvatar: '',
    userEcoLevel: 'master',
    carbonSaved: 3200,
    createdAt: '2024-12-13T08:45:00Z',
    supportCount: 56,
    category: 'support_heritage',
    fulfilled: false
  }
]

export default function EcoPledgeWall() {
  const [pledges, setPledges] = useState<EcoPledge[]>(MOCK_PLEDGES)
  const [selectedCategory, setSelectedCategory] = useState<PledgeCategory | 'all'>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPledge, setSelectedPledge] = useState<EcoPledge | null>(null)

  const { currentLevel } = useGreenPointsStore()

  // 过滤承诺
  const filteredPledges = selectedCategory === 'all' 
    ? pledges 
    : pledges.filter(p => p.category === selectedCategory)

  // 支持承诺
  const handleSupport = useCallback((pledgeId: string) => {
    setPledges(prev => prev.map(p => 
      p.id === pledgeId 
        ? { ...p, supportCount: p.supportCount + 1 }
        : p
    ))
    addPledgePoints('支持他人承诺', POINTS_REWARDS.pledge_support)
  }, [])

  // 创建承诺
  const handleCreatePledge = useCallback((content: string, category: PledgeCategory) => {
    const newPledge: EcoPledge = {
      id: generateId(),
      polaroidImage: '',
      ecoMessage: '🌱 我的生态承诺',
      pledgeContent: content,
      userName: '我',
      userAvatar: '',
      userEcoLevel: currentLevel,
      carbonSaved: 0,
      createdAt: new Date().toISOString(),
      supportCount: 0,
      category,
      fulfilled: false
    }
    setPledges(prev => [newPledge, ...prev])
    addPledgePoints('发布生态承诺', POINTS_REWARDS.pledge_create)
    setShowCreateModal(false)
  }, [currentLevel])

  return (
    <div className="min-h-screen bg-gradient-to-b from-eco-50 to-bamboo-50">
      {/* 软木板纹理背景 */}
      <div 
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 py-8">
        {/* 头部 */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-ink-800 mb-2">🌿 生态承诺墙</h1>
          <p className="text-ink-600">记录你的绿色承诺，与大家一起守护地球</p>
        </div>

        {/* 筛选和创建 */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap',
                selectedCategory === 'all'
                  ? 'bg-eco-500 text-white'
                  : 'bg-white text-ink-600 hover:bg-ink-50'
              )}
            >
              全部
            </button>
            {Object.entries(PLEDGE_CATEGORIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as PledgeCategory)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex items-center gap-1',
                  selectedCategory === key
                    ? 'bg-eco-500 text-white'
                    : 'bg-white text-ink-600 hover:bg-ink-50'
                )}
              >
                <span>{config.icon}</span>
                {config.name}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-heritage-500 hover:bg-heritage-600 text-white rounded-full font-medium flex items-center gap-2 transition-colors"
          >
            <Plus className="w-5 h-5" />
            发布承诺
          </button>
        </div>

        {/* 承诺墙 - 照片钉板布局 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPledges.map((pledge, index) => (
            <motion.div
              key={pledge.id}
              initial={{ opacity: 0, y: 20, rotate: Math.random() * 6 - 3 }}
              animate={{ opacity: 1, y: 0, rotate: Math.random() * 6 - 3 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, rotate: 0 }}
              onClick={() => setSelectedPledge(pledge)}
              className="cursor-pointer"
            >
              <div className="bg-white rounded-lg shadow-lg p-4 relative">
                {/* 图钉效果 */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-heritage-500 shadow-md" />

                {/* 拍立得照片区域 */}
                <div className="aspect-square bg-gradient-to-br from-eco-100 to-bamboo-100 rounded-lg mb-3 flex items-center justify-center">
                  {pledge.polaroidImage ? (
                    <img src={pledge.polaroidImage} alt="" className="w-full h-full object-cover rounded-lg" />
                  ) : (
                    <div className="text-center">
                      <span className="text-4xl">{PLEDGE_CATEGORIES[pledge.category].icon}</span>
                      <p className="text-sm text-ink-400 mt-2">{pledge.ecoMessage}</p>
                    </div>
                  )}
                </div>

                {/* 承诺内容 */}
                <p className="text-sm text-ink-700 mb-3 line-clamp-2">{pledge.pledgeContent}</p>

                {/* 用户信息 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-eco-100 flex items-center justify-center">
                      <span>{ECO_LEVELS[pledge.userEcoLevel].icon}</span>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-ink-700">{pledge.userName}</p>
                      <p className="text-xs text-ink-400">{ECO_LEVELS[pledge.userEcoLevel].name}</p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSupport(pledge.id)
                    }}
                    className="flex items-center gap-1 px-2 py-1 bg-heritage-50 hover:bg-heritage-100 rounded-full transition-colors"
                  >
                    <Heart className="w-4 h-4 text-heritage-500" />
                    <span className="text-xs text-heritage-600">{pledge.supportCount}</span>
                  </button>
                </div>

                {/* 完成标记 */}
                {pledge.fulfilled && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-eco-500 text-white text-xs rounded-full">
                    已践行
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredPledges.length === 0 && (
          <div className="text-center py-12">
            <Leaf className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500">暂无承诺，成为第一个发布者吧！</p>
          </div>
        )}
      </div>

      {/* 创建承诺弹窗 */}
      <AnimatePresence>
        {showCreateModal && (
          <CreatePledgeModal
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreatePledge}
          />
        )}
      </AnimatePresence>

      {/* 承诺详情弹窗 */}
      <AnimatePresence>
        {selectedPledge && (
          <PledgeDetailModal
            pledge={selectedPledge}
            onClose={() => setSelectedPledge(null)}
            onSupport={() => handleSupport(selectedPledge.id)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/** 创建承诺弹窗 */
function CreatePledgeModal({
  onClose,
  onCreate
}: {
  onClose: () => void
  onCreate: (content: string, category: PledgeCategory) => void
}) {
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<PledgeCategory>('reduce_plastic')

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-ink-800">发布生态承诺</h2>
          <button onClick={onClose} className="p-2 hover:bg-ink-100 rounded-full">
            <X className="w-5 h-5 text-ink-500" />
          </button>
        </div>

        {/* 类别选择 */}
        <div className="mb-4">
          <label className="text-sm text-ink-600 mb-2 block">承诺类别</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(PLEDGE_CATEGORIES).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setCategory(key as PledgeCategory)}
                className={cn(
                  'p-3 rounded-xl border-2 transition-all text-left',
                  category === key
                    ? 'border-eco-500 bg-eco-50'
                    : 'border-ink-200 hover:border-ink-300'
                )}
              >
                <span className="text-xl">{config.icon}</span>
                <p className="text-sm font-medium text-ink-700 mt-1">{config.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* 承诺内容 */}
        <div className="mb-6">
          <label className="text-sm text-ink-600 mb-2 block">承诺内容</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="我承诺..."
            className="w-full h-32 p-3 border border-ink-200 rounded-xl resize-none focus:outline-none focus:border-eco-500"
          />
        </div>

        <button
          onClick={() => content.trim() && onCreate(content, category)}
          disabled={!content.trim()}
          className="w-full py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          发布承诺
        </button>

        <p className="text-xs text-ink-400 text-center mt-3">
          发布承诺可获得 {POINTS_REWARDS.pledge_create} 绿色积分
        </p>
      </motion.div>
    </motion.div>
  )
}

/** 承诺详情弹窗 */
function PledgeDetailModal({
  pledge,
  onClose,
  onSupport
}: {
  pledge: EcoPledge
  onClose: () => void
  onSupport: () => void
}) {
  const categoryConfig = PLEDGE_CATEGORIES[pledge.category]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl p-6 max-w-md w-full"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-ink-100 rounded-full"
        >
          <X className="w-5 h-5 text-ink-500" />
        </button>

        {/* 拍立得照片 */}
        <div className="aspect-square bg-gradient-to-br from-eco-100 to-bamboo-100 rounded-xl mb-4 flex items-center justify-center">
          <div className="text-center">
            <span className="text-6xl">{categoryConfig.icon}</span>
            <p className="text-ink-500 mt-4">{pledge.ecoMessage}</p>
          </div>
        </div>

        {/* 承诺内容 */}
        <div className={cn('px-3 py-1 rounded-full text-xs inline-flex items-center gap-1 mb-3', categoryConfig.color)}>
          <span>{categoryConfig.icon}</span>
          {categoryConfig.name}
        </div>
        <p className="text-ink-700 mb-4">{pledge.pledgeContent}</p>

        {/* 用户信息 */}
        <div className="flex items-center justify-between py-4 border-t border-ink-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-eco-100 flex items-center justify-center">
              <span className="text-lg">{ECO_LEVELS[pledge.userEcoLevel].icon}</span>
            </div>
            <div>
              <p className="font-medium text-ink-700">{pledge.userName}</p>
              <p className="text-xs text-ink-400">
                {new Date(pledge.createdAt).toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>

          {pledge.fulfilled && (
            <span className="px-3 py-1 bg-eco-100 text-eco-700 text-sm rounded-full">
              ✓ 已践行
            </span>
          )}
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={onSupport}
            className="flex-1 py-3 bg-heritage-500 hover:bg-heritage-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <Heart className="w-5 h-5" />
            支持 ({pledge.supportCount})
          </button>
          <button className="py-3 px-4 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
