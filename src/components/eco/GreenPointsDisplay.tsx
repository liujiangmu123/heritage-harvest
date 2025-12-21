/**
 * 绿色积分展示组件
 * 显示用户绿色积分、等级和进度
 */

import { motion } from 'framer-motion'
import { Coins, TrendingUp, Award } from 'lucide-react'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { ECO_LEVELS } from '@/types/eco'
import { cn } from '@/lib/utils'

interface GreenPointsDisplayProps {
  variant?: 'compact' | 'full' | 'card'
  showHistory?: boolean
  className?: string
}

export default function GreenPointsDisplay({
  variant = 'full',
  showHistory = false,
  className
}: GreenPointsDisplayProps) {
  const { totalPoints, currentLevel, getLevelProgress, getPointsHistory } = useGreenPointsStore()
  const levelInfo = ECO_LEVELS[currentLevel]
  const progress = getLevelProgress()
  const recentHistory = showHistory ? getPointsHistory(5) : []

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <span className="text-lg">{levelInfo.icon}</span>
        <span className="font-bold text-eco-600">{totalPoints}</span>
        <span className="text-xs text-eco-500">{levelInfo.name}</span>
      </div>
    )
  }

  if (variant === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'bg-gradient-to-br from-eco-50 to-eco-100 rounded-2xl p-6 border border-eco-200',
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-eco-500 flex items-center justify-center text-2xl">
              {levelInfo.icon}
            </div>
            <div>
              <p className="text-sm text-eco-600">当前等级</p>
              <p className="text-lg font-bold text-eco-800">{levelInfo.name}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-eco-600">绿色积分</p>
            <p className="text-2xl font-bold text-eco-700">{totalPoints}</p>
          </div>
        </div>

        {/* 进度条 */}
        {progress.next && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-eco-600 mb-1">
              <span>距离 {ECO_LEVELS[progress.next].name}</span>
              <span>{progress.pointsToNext} 积分</span>
            </div>
            <div className="h-2 bg-eco-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-eco-400 to-eco-600 rounded-full"
              />
            </div>
          </div>
        )}
      </motion.div>
    )
  }

  // Full variant
  return (
    <div className={cn('space-y-6', className)}>
      {/* 主要信息卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-eco-50 via-white to-eco-50 rounded-2xl p-6 border border-eco-200 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner"
              style={{ backgroundColor: `${levelInfo.color}20` }}
            >
              {levelInfo.icon}
            </div>
            <div>
              <p className="text-sm text-ink-500">生态等级</p>
              <p className="text-xl font-bold" style={{ color: levelInfo.color }}>
                {levelInfo.name}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              <Coins className="w-5 h-5 text-eco-500" />
              <span className="text-3xl font-bold text-eco-700">{totalPoints}</span>
            </div>
            <p className="text-sm text-ink-500">绿色积分</p>
          </div>
        </div>

        {/* 等级进度 */}
        {progress.next && (
          <div className="mt-6 pt-6 border-t border-eco-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-eco-500" />
                <span className="text-sm text-ink-600">升级进度</span>
              </div>
              <span className="text-sm font-medium text-eco-600">
                {progress.progress}%
              </span>
            </div>
            <div className="h-3 bg-eco-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress.progress}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-eco-400 via-eco-500 to-eco-600 rounded-full"
              />
            </div>
            <p className="text-xs text-ink-400 mt-2">
              再获得 <span className="font-medium text-eco-600">{progress.pointsToNext}</span> 积分即可升级为 
              <span className="font-medium" style={{ color: ECO_LEVELS[progress.next].color }}>
                {' '}{ECO_LEVELS[progress.next].name}
              </span>
            </p>
          </div>
        )}

        {/* 等级权益 */}
        <div className="mt-6 pt-6 border-t border-eco-100">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-eco-500" />
            <span className="text-sm font-medium text-ink-700">当前权益</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {levelInfo.benefits.map((benefit, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-eco-100 text-eco-700 text-xs rounded-full"
              >
                {benefit}
              </span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* 积分历史 */}
      {showHistory && recentHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border border-ink-100"
        >
          <h3 className="font-medium text-ink-800 mb-4">最近获得</h3>
          <div className="space-y-3">
            {recentHistory.map((record) => (
              <div
                key={record.id}
                className="flex items-center justify-between py-2 border-b border-ink-50 last:border-0"
              >
                <div>
                  <p className="text-sm text-ink-700">{record.description}</p>
                  <p className="text-xs text-ink-400">
                    {new Date(record.timestamp).toLocaleDateString('zh-CN')}
                  </p>
                </div>
                <span className="text-eco-600 font-medium">+{record.points}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
