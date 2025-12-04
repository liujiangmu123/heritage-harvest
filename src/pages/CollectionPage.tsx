import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Lock, Gift, Star, Zap, Award, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { fragments, badges, collectibles, heritages } from '@/data/mockData'
import { useUserStore } from '@/store'

export default function CollectionPage() {
  const [activeTab, setActiveTab] = useState<'fragments' | 'badges' | 'nfts'>('fragments')
  const { isAuthenticated } = useUserStore()

  const tabs = [
    { id: 'fragments', label: '尘光碎片', icon: Sparkles, count: fragments.length },
    { id: 'badges', label: '传世徽章', icon: Award, count: badges.length },
    { id: 'nfts', label: '数字藏品', icon: Star, count: collectibles.length },
  ]

  return (
    <div className="min-h-screen pt-20">
      {/* Hero */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-primary-900 to-heritage-900" />
        <div className="absolute inset-0 pattern-overlay opacity-10" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="heritage" className="mb-6">
              <Zap className="w-4 h-4 mr-2" />
              ERC-4337 无感钱包
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              数字藏品馆
            </h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto mb-8">
              收集非遗文化碎片，解锁传世徽章，获得专属权益。
              每一件藏品都是文化传承的数字见证。
            </p>
            {!isAuthenticated && (
              <Button variant="heritage" size="lg">
                连接钱包开始收集
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </motion.div>
        </div>
      </section>

      {/* Tabs */}
      <div className="sticky top-16 z-40 bg-white border-b border-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-heritage-500 text-heritage-600'
                    : 'border-transparent text-ink-500 hover:text-ink-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
                <span className="px-2 py-0.5 rounded-full bg-ink-100 text-xs">{tab.count}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {activeTab === 'fragments' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">尘光碎片</h2>
              <p className="text-ink-500">通过购买产品、参与活动获取碎片，集齐可合成传世徽章</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {fragments.map((fragment, index) => (
                <motion.div
                  key={fragment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className={`overflow-hidden ${!fragment.collected ? 'opacity-60' : ''}`}>
                    <div className="relative h-48">
                      <img src={fragment.image} alt={fragment.name} className="w-full h-full object-cover" />
                      {!fragment.collected && (
                        <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                          <Lock className="w-10 h-10 text-white/60" />
                        </div>
                      )}
                      {fragment.collected && (
                        <div className="absolute top-3 right-3">
                          <Badge variant="success">已收集</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-bold text-ink-900 mb-1">{fragment.name}</h3>
                      <p className="text-sm text-ink-500 line-clamp-2">{fragment.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">传世徽章</h2>
              <p className="text-ink-500">集齐对应碎片可合成徽章，解锁专属权益</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {badges.map((badge, index) => {
                const heritage = heritages.find(h => h.id === badge.heritageId)
                const collectedCount = badge.requiredFragments.filter(fId => 
                  fragments.find(f => f.id === fId)?.collected
                ).length
                
                return (
                  <motion.div
                    key={badge.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card variant="nft" className="p-6">
                      <div className="flex gap-6">
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={badge.image} alt={badge.name} className="w-full h-full object-cover" />
                          {!badge.unlocked && (
                            <div className="absolute inset-0 bg-ink-900/60 flex items-center justify-center">
                              <Lock className="w-8 h-8 text-white/60" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg text-ink-900">{badge.name}</h3>
                            {badge.unlocked && <Badge variant="success">已解锁</Badge>}
                          </div>
                          <p className="text-sm text-ink-500 mb-3">{badge.description}</p>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 h-2 bg-ink-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-heritage-500 to-primary-500"
                                style={{ width: `${(collectedCount / badge.requiredFragments.length) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-ink-500">
                              {collectedCount}/{badge.requiredFragments.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {badge.privileges.map((p, i) => (
                              <Badge key={i} variant="outline" size="sm">{p}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'nfts' && (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-ink-900 mb-2">数字藏品</h2>
              <p className="text-ink-500">限量发行的非遗数字艺术品，永久保存在区块链上</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {collectibles.map((nft, index) => (
                <motion.div
                  key={nft.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="nft" className="overflow-hidden group">
                    <div className="relative h-64">
                      <img 
                        src={nft.image} 
                        alt={nft.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute top-3 left-3">
                        <Badge variant={nft.rarity === 'legendary' ? 'legendary' : 'epic'}>
                          {nft.rarity === 'legendary' ? '传说' : '史诗'}
                        </Badge>
                      </div>
                      <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <p className="text-white/80 text-sm">{nft.series}</p>
                        <h3 className="text-white font-bold text-lg">{nft.name}</h3>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <p className="text-sm text-ink-500 mb-3 line-clamp-2">{nft.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <span className="text-ink-400">剩余</span>
                          <span className="font-bold text-primary-600 ml-1">
                            {nft.totalSupply - nft.currentSupply}/{nft.totalSupply}
                          </span>
                        </div>
                        <Button variant="heritage" size="sm">
                          <Gift className="w-4 h-4 mr-1" />
                          铸造
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
