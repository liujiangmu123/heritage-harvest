import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Award, Star, Sparkles, Share2, Download, X,
  TreeDeciduous, Leaf, Recycle, Droplets, Mountain,
  Clock, Users, Shield, Gem, Crown, ChevronRight
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'
import { ECO_LEVELS } from '@/types/eco'

/** NFT稀有度 */
type NFTRarity = 'common' | 'rare' | 'epic' | 'legendary'

/** NFT藏品 */
interface EcoNFT {
  id: string
  name: string
  description: string
  image: string
  rarity: NFTRarity
  category: 'milestone' | 'seasonal' | 'achievement' | 'special'
  requirement: string
  mintedAt?: string
  holders: number
  maxSupply?: number
  attributes: {
    name: string
    value: string | number
  }[]
}

/** 稀有度配置 */
const RARITY_CONFIG: Record<NFTRarity, { name: string; color: string; bgColor: string; icon: typeof Star }> = {
  common: { name: '普通', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Star },
  rare: { name: '稀有', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Gem },
  epic: { name: '史诗', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Sparkles },
  legendary: { name: '传说', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Crown }
}

/** NFT藏品数据 */
const ECO_NFTS: EcoNFT[] = [
  // 里程碑NFT
  {
    id: 'carbon-1kg',
    name: '碳减排新手',
    description: '累计碳减排达到1kg，迈出绿色生活第一步',
    image: '🌱',
    rarity: 'common',
    category: 'milestone',
    requirement: '累计碳减排 ≥ 1kg',
    holders: 1234,
    attributes: [
      { name: '碳减排', value: '1kg' },
      { name: '等效种树', value: '0.05棵' }
    ]
  },
  {
    id: 'carbon-10kg',
    name: '碳减排达人',
    description: '累计碳减排达到10kg，成为绿色生活践行者',
    image: '🌿',
    rarity: 'rare',
    category: 'milestone',
    requirement: '累计碳减排 ≥ 10kg',
    holders: 456,
    attributes: [
      { name: '碳减排', value: '10kg' },
      { name: '等效种树', value: '0.5棵' }
    ]
  },
  {
    id: 'carbon-100kg',
    name: '碳中和先锋',
    description: '累计碳减排达到100kg，成为碳中和先锋',
    image: '🌳',
    rarity: 'epic',
    category: 'milestone',
    requirement: '累计碳减排 ≥ 100kg',
    holders: 89,
    attributes: [
      { name: '碳减排', value: '100kg' },
      { name: '等效种树', value: '5棵' }
    ]
  },
  {
    id: 'eco-master',
    name: '生态智慧大师',
    description: '完成所有生态学习路径，掌握完整的环保知识体系',
    image: '🏆',
    rarity: 'legendary',
    category: 'achievement',
    requirement: '完成全部学习路径',
    holders: 23,
    maxSupply: 100,
    attributes: [
      { name: '学习模块', value: '4/4' },
      { name: '知识掌握', value: '100%' }
    ]
  },
  // 季节NFT
  {
    id: 'spring-equinox',
    name: '春分守护者',
    description: '参与春分节气活动，感受昼夜平分的自然平衡',
    image: '🌸',
    rarity: 'rare',
    category: 'seasonal',
    requirement: '参与春分节气活动',
    holders: 567,
    attributes: [
      { name: '节气', value: '春分' },
      { name: '季节', value: '春' }
    ]
  },
  {
    id: 'summer-solstice',
    name: '夏至先锋',
    description: '参与夏至节气活动，体验一年中最长的白昼',
    image: '☀️',
    rarity: 'rare',
    category: 'seasonal',
    requirement: '参与夏至节气活动',
    holders: 432,
    attributes: [
      { name: '节气', value: '夏至' },
      { name: '季节', value: '夏' }
    ]
  },
  {
    id: 'autumn-equinox',
    name: '秋分守护者',
    description: '参与秋分节气活动，感受丰收的喜悦',
    image: '🍂',
    rarity: 'rare',
    category: 'seasonal',
    requirement: '参与秋分节气活动',
    holders: 389,
    attributes: [
      { name: '节气', value: '秋分' },
      { name: '季节', value: '秋' }
    ]
  },
  {
    id: 'winter-solstice',
    name: '冬至先锋',
    description: '参与冬至节气活动，体验一年中最长的夜晚',
    image: '❄️',
    rarity: 'rare',
    category: 'seasonal',
    requirement: '参与冬至节气活动',
    holders: 298,
    attributes: [
      { name: '节气', value: '冬至' },
      { name: '季节', value: '冬' }
    ]
  },
  // 成就NFT
  {
    id: 'all-experiences',
    name: '非遗探索者',
    description: '完成所有非遗体验，成为传统文化的守护者',
    image: '🎭',
    rarity: 'epic',
    category: 'achievement',
    requirement: '完成全部非遗体验',
    holders: 156,
    attributes: [
      { name: '体验数量', value: '6/6' },
      { name: '文化传承', value: '100%' }
    ]
  },
  {
    id: 'knowledge-explorer',
    name: '知识探索者',
    description: '探索50%以上的生态知识图谱节点',
    image: '🔍',
    rarity: 'rare',
    category: 'achievement',
    requirement: '知识图谱探索 ≥ 50%',
    holders: 234,
    attributes: [
      { name: '探索进度', value: '50%+' },
      { name: '知识节点', value: '10+' }
    ]
  },
  // 特殊NFT
  {
    id: 'founding-member',
    name: '创始成员',
    description: '平台早期用户专属纪念藏品',
    image: '⭐',
    rarity: 'legendary',
    category: 'special',
    requirement: '2024年前注册的用户',
    holders: 50,
    maxSupply: 100,
    attributes: [
      { name: '注册时间', value: '2024年前' },
      { name: '限量编号', value: '#001-100' }
    ]
  }
]

interface EcoAchievementNFTProps {
  className?: string
}

export default function EcoAchievementNFT({ className = '' }: EcoAchievementNFTProps) {
  const [selectedNFT, setSelectedNFT] = useState<EcoNFT | null>(null)
  const [mintedNFTs, setMintedNFTs] = useState<Set<string>>(new Set())
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [showMintSuccess, setShowMintSuccess] = useState(false)
  
  const { totalPoints, currentLevel } = useGreenPointsStore()
  const { totalCarbonSaved } = useCarbonAccountStore()
  const { getCompletionPercentage } = useEcoAchievementStore()
  
  const ecoLevelInfo = ECO_LEVELS[currentLevel]
  const achievementProgress = getCompletionPercentage()
  
  // 检查NFT是否可铸造
  const canMintNFT = (nft: EcoNFT): boolean => {
    if (mintedNFTs.has(nft.id)) return false
    
    switch (nft.id) {
      case 'carbon-1kg':
        return totalCarbonSaved >= 1000
      case 'carbon-10kg':
        return totalCarbonSaved >= 10000
      case 'carbon-100kg':
        return totalCarbonSaved >= 100000
      case 'eco-master':
        return achievementProgress >= 100
      case 'knowledge-explorer':
        return achievementProgress >= 50
      default:
        return totalPoints >= 100 // 默认需要100积分
    }
  }
  
  // 铸造NFT
  const mintNFT = (nft: EcoNFT) => {
    if (!canMintNFT(nft)) return
    
    setMintedNFTs(prev => new Set([...prev, nft.id]))
    setShowMintSuccess(true)
    
    setTimeout(() => {
      setShowMintSuccess(false)
      setSelectedNFT(null)
    }, 2000)
  }
  
  // 过滤NFT
  const filteredNFTs = useMemo(() => {
    if (filterCategory === 'all') return ECO_NFTS
    if (filterCategory === 'minted') return ECO_NFTS.filter(nft => mintedNFTs.has(nft.id))
    return ECO_NFTS.filter(nft => nft.category === filterCategory)
  }, [filterCategory, mintedNFTs])
  
  // 统计数据
  const stats = useMemo(() => ({
    total: ECO_NFTS.length,
    minted: mintedNFTs.size,
    canMint: ECO_NFTS.filter(nft => canMintNFT(nft) && !mintedNFTs.has(nft.id)).length
  }), [mintedNFTs, totalCarbonSaved, achievementProgress, totalPoints])

  return (
    <div className={`${className}`}>
      {/* 头部 */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-ink-900">生态NFT藏品</h2>
            <p className="text-ink-500">收集环保里程碑，永久记录你的绿色贡献</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="eco">
              已收集 {stats.minted}/{stats.total}
            </Badge>
            {stats.canMint > 0 && (
              <Badge variant="heritage" className="animate-pulse">
                {stats.canMint} 个可铸造
              </Badge>
            )}
          </div>
        </div>
        
        {/* 用户状态 */}
        <Card className="p-4 bg-gradient-to-r from-eco-50 to-bamboo-50 border-eco-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{ecoLevelInfo.icon}</div>
              <div>
                <div className="font-bold text-eco-800">{ecoLevelInfo.name}</div>
                <div className="text-sm text-eco-600">{totalPoints} 绿色积分</div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-xl font-bold text-eco-700">
                  {totalCarbonSaved >= 1000 ? `${(totalCarbonSaved / 1000).toFixed(1)}kg` : `${totalCarbonSaved}g`}
                </div>
                <div className="text-xs text-eco-500">碳减排</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-eco-700">{achievementProgress}%</div>
                <div className="text-xs text-eco-500">成就进度</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 筛选 */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { key: 'all', name: '全部' },
          { key: 'minted', name: '已收集' },
          { key: 'milestone', name: '里程碑' },
          { key: 'seasonal', name: '节气限定' },
          { key: 'achievement', name: '成就' },
          { key: 'special', name: '特殊' }
        ].map(filter => (
          <Button
            key={filter.key}
            variant={filterCategory === filter.key ? 'eco' : 'outline'}
            size="sm"
            onClick={() => setFilterCategory(filter.key)}
          >
            {filter.name}
          </Button>
        ))}
      </div>

      {/* NFT网格 */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredNFTs.map((nft, index) => {
          const isMinted = mintedNFTs.has(nft.id)
          const canMint = canMintNFT(nft)
          const rarityConfig = RARITY_CONFIG[nft.rarity]
          
          return (
            <motion.div
              key={nft.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  isMinted ? 'ring-2 ring-eco-500 ring-offset-2' : ''
                } ${!canMint && !isMinted ? 'opacity-60' : ''}`}
                onClick={() => setSelectedNFT(nft)}
              >
                <CardContent className="p-4">
                  {/* NFT图片 */}
                  <div className={`relative aspect-square rounded-xl ${rarityConfig.bgColor} flex items-center justify-center mb-4 overflow-hidden`}>
                    <span className="text-6xl">{nft.image}</span>
                    
                    {/* 稀有度标签 */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${rarityConfig.bgColor} ${rarityConfig.color}`}>
                      {rarityConfig.name}
                    </div>
                    
                    {/* 已铸造标记 */}
                    {isMinted && (
                      <div className="absolute inset-0 bg-eco-500/20 flex items-center justify-center">
                        <div className="w-12 h-12 bg-eco-500 rounded-full flex items-center justify-center">
                          <Shield className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    )}
                    
                    {/* 可铸造提示 */}
                    {canMint && !isMinted && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Badge variant="eco" className="w-full justify-center">
                          可铸造
                        </Badge>
                      </div>
                    )}
                  </div>
                  
                  {/* NFT信息 */}
                  <h3 className="font-bold text-ink-900 mb-1">{nft.name}</h3>
                  <p className="text-sm text-ink-500 line-clamp-2 mb-3">{nft.description}</p>
                  
                  {/* 持有者数量 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-ink-400">
                      <Users className="w-4 h-4" />
                      <span>{nft.holders} 人持有</span>
                    </div>
                    {nft.maxSupply && (
                      <span className="text-amber-600">限量 {nft.maxSupply}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>

      {/* NFT详情弹窗 */}
      <AnimatePresence>
        {selectedNFT && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedNFT(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* NFT展示 */}
              <div className={`p-8 ${RARITY_CONFIG[selectedNFT.rarity].bgColor} rounded-t-2xl relative`}>
                <button
                  onClick={() => setSelectedNFT(null)}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/50 rounded-full flex items-center justify-center hover:bg-white/80"
                >
                  <X className="w-5 h-5 text-ink-600" />
                </button>
                
                <div className="text-center">
                  <span className="text-8xl">{selectedNFT.image}</span>
                </div>
              </div>
              
              {/* NFT信息 */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={`${RARITY_CONFIG[selectedNFT.rarity].bgColor} ${RARITY_CONFIG[selectedNFT.rarity].color}`}>
                    {RARITY_CONFIG[selectedNFT.rarity].name}
                  </Badge>
                  {selectedNFT.maxSupply && (
                    <Badge variant="outline">限量 {selectedNFT.maxSupply}</Badge>
                  )}
                </div>
                
                <h3 className="text-2xl font-bold text-ink-900 mb-2">{selectedNFT.name}</h3>
                <p className="text-ink-600 mb-4">{selectedNFT.description}</p>
                
                {/* 获取条件 */}
                <div className="p-4 bg-gray-50 rounded-xl mb-4">
                  <div className="text-sm text-ink-500 mb-1">获取条件</div>
                  <div className="font-medium text-ink-900">{selectedNFT.requirement}</div>
                </div>
                
                {/* 属性 */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-ink-700 mb-2">属性</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedNFT.attributes.map((attr, i) => (
                      <div key={i} className="p-3 bg-eco-50 rounded-lg">
                        <div className="text-xs text-eco-600">{attr.name}</div>
                        <div className="font-bold text-eco-800">{attr.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* 持有者信息 */}
                <div className="flex items-center justify-between text-sm text-ink-500 mb-6">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{selectedNFT.holders} 人持有</span>
                  </div>
                  {selectedNFT.mintedAt && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>铸造于 {selectedNFT.mintedAt}</span>
                    </div>
                  )}
                </div>
                
                {/* 操作按钮 */}
                {mintedNFTs.has(selectedNFT.id) ? (
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1">
                      <Share2 className="w-4 h-4 mr-2" />
                      分享
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      下载
                    </Button>
                  </div>
                ) : canMintNFT(selectedNFT) ? (
                  <Button
                    variant="eco"
                    className="w-full"
                    onClick={() => mintNFT(selectedNFT)}
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    铸造NFT
                  </Button>
                ) : (
                  <div className="p-4 bg-gray-100 rounded-xl text-center">
                    <p className="text-ink-500">暂未达到铸造条件</p>
                    <p className="text-sm text-ink-400 mt-1">{selectedNFT.requirement}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 铸造成功提示 */}
      <AnimatePresence>
        {showMintSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center"
          >
            <div className="bg-white rounded-2xl p-8 text-center max-w-sm">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 bg-eco-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Sparkles className="w-10 h-10 text-eco-600" />
              </motion.div>
              <h3 className="text-2xl font-bold text-ink-900 mb-2">铸造成功！</h3>
              <p className="text-ink-500">NFT已添加到你的收藏</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
