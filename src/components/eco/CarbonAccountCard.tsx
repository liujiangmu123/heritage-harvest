/**
 * 碳账户卡片组件
 * 显示用户碳减排数据和等效指标
 */

import { motion } from 'framer-motion'
import { Leaf, TreeDeciduous, Car, Recycle, TrendingUp } from 'lucide-react'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { cn } from '@/lib/utils'

interface CarbonAccountCardProps {
  variant?: 'compact' | 'full' | 'mini'
  showMilestones?: boolean
  className?: string
}

export default function CarbonAccountCard({
  variant = 'full',
  showMilestones = true,
  className
}: CarbonAccountCardProps) {
  const { 
    totalCarbonSaved, 
    getEquivalentMetrics, 
    milestones,
    getCarbonHistory 
  } = useCarbonAccountStore()
  
  const equivalent = getEquivalentMetrics()
  const recentHistory = getCarbonHistory(3)

  // 格式化碳减排数值
  const formatCarbon = (grams: number) => {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(1)} kg`
    }
    return `${grams} g`
  }

  if (variant === 'mini') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Leaf className="w-4 h-4 text-carbon-500" />
        <span className="font-medium text-carbon-600">{formatCarbon(totalCarbonSaved)}</span>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-gradient-to-r from-carbon-50 to-carbon-100 rounded-xl p-4 border border-carbon-200',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-carbon-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-carbon-600">累计碳减排</p>
              <p className="text-lg font-bold text-carbon-700">{formatCarbon(totalCarbonSaved)}</p>
            </div>
          </div>
          <div className="text-right text-xs text-carbon-600">
            <p>≈ 种树 {equivalent.treesPlanted} 棵</p>
          </div>
        </div>
      </div>
    )
  }

  // Full variant
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('space-y-4', className)}
    >
      {/* 主卡片 */}
      <div className="bg-gradient-to-br from-carbon-50 via-white to-eco-50 rounded-2xl p-6 border border-carbon-200 shadow-lg">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-carbon-400 to-carbon-600 flex items-center justify-center shadow-lg">
              <Leaf className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-sm text-ink-500">我的碳账户</p>
              <p className="text-2xl font-bold text-carbon-700">{formatCarbon(totalCarbonSaved)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1 bg-eco-100 rounded-full">
            <TrendingUp className="w-4 h-4 text-eco-600" />
            <span className="text-sm font-medium text-eco-600">碳中和</span>
          </div>
        </div>

        {/* 等效指标 */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white/80 rounded-xl p-4 text-center border border-eco-100">
            <TreeDeciduous className="w-8 h-8 text-eco-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-eco-700">{equivalent.treesPlanted}</p>
            <p className="text-xs text-ink-500">等效种树（棵）</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center border border-carbon-100">
            <Car className="w-8 h-8 text-carbon-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-carbon-700">{equivalent.kmNotDriven}</p>
            <p className="text-xs text-ink-500">少开车（公里）</p>
          </div>
          <div className="bg-white/80 rounded-xl p-4 text-center border border-bamboo-100">
            <Recycle className="w-8 h-8 text-bamboo-500 mx-auto mb-2" />
            <p className="text-xl font-bold text-bamboo-700">{equivalent.plasticAvoided}</p>
            <p className="text-xs text-ink-500">减塑料（克）</p>
          </div>
        </div>

        {/* 最近记录 */}
        {recentHistory.length > 0 && (
          <div className="mt-6 pt-4 border-t border-carbon-100">
            <p className="text-sm font-medium text-ink-600 mb-3">最近减排</p>
            <div className="space-y-2">
              {recentHistory.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-ink-600">{record.description}</span>
                  <span className="text-carbon-600 font-medium">
                    -{formatCarbon(record.carbonSaved)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 里程碑 */}
      {showMilestones && (
        <div className="bg-white rounded-2xl p-6 border border-ink-100">
          <h3 className="font-medium text-ink-800 mb-4">碳减排里程碑</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className={cn(
                  'flex-shrink-0 w-20 text-center p-3 rounded-xl border transition-all',
                  milestone.unlocked
                    ? 'bg-eco-50 border-eco-200'
                    : 'bg-ink-50 border-ink-200 opacity-50'
                )}
              >
                <span className="text-2xl">{milestone.icon}</span>
                <p className="text-xs font-medium text-ink-700 mt-1 truncate">
                  {milestone.name}
                </p>
                <p className="text-xs text-ink-400">
                  {milestone.threshold >= 1000 
                    ? `${milestone.threshold / 1000}kg` 
                    : `${milestone.threshold}g`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
