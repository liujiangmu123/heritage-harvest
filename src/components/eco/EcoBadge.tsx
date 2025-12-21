/**
 * 生态成就徽章组件
 * 展示用户获得的生态成就
 */

import { motion } from 'framer-motion'
import { Lock, Sparkles } from 'lucide-react'
import { EcoAchievement, AchievementCategory } from '@/types/eco'
import { cn } from '@/lib/utils'

interface EcoBadgeProps {
  achievement: EcoAchievement
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  onClick?: () => void
  className?: string
}

const categoryColors: Record<AchievementCategory, { bg: string; border: string; text: string }> = {
  learning: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  experience: { bg: 'bg-eco-50', border: 'border-eco-200', text: 'text-eco-600' },
  sharing: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
  carbon: { bg: 'bg-carbon-50', border: 'border-carbon-200', text: 'text-carbon-600' },
  special: { bg: 'bg-heritage-50', border: 'border-heritage-200', text: 'text-heritage-600' }
}

const categoryNames: Record<AchievementCategory, string> = {
  learning: '学习',
  experience: '体验',
  sharing: '分享',
  carbon: '碳减排',
  special: '特殊'
}

const sizeConfig = {
  sm: { badge: 'w-12 h-12', icon: 'text-xl', text: 'text-xs' },
  md: { badge: 'w-16 h-16', icon: 'text-2xl', text: 'text-sm' },
  lg: { badge: 'w-20 h-20', icon: 'text-3xl', text: 'text-base' }
}

export default function EcoBadge({
  achievement,
  size = 'md',
  showDetails = false,
  onClick,
  className
}: EcoBadgeProps) {
  const colors = categoryColors[achievement.category]
  const config = sizeConfig[size]
  const isUnlocked = achievement.unlocked

  return (
    <motion.div
      whileHover={isUnlocked ? { scale: 1.05 } : undefined}
      whileTap={isUnlocked && onClick ? { scale: 0.95 } : undefined}
      onClick={isUnlocked ? onClick : undefined}
      className={cn(
        'flex flex-col items-center',
        onClick && isUnlocked && 'cursor-pointer',
        className
      )}
    >
      {/* 徽章图标 */}
      <div
        className={cn(
          'relative rounded-full flex items-center justify-center border-2 transition-all',
          config.badge,
          isUnlocked
            ? `${colors.bg} ${colors.border} shadow-lg`
            : 'bg-ink-100 border-ink-200 grayscale'
        )}
      >
        {isUnlocked ? (
          <>
            <span className={config.icon}>{achievement.icon}</span>
            {/* 闪光效果 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              className="absolute -top-1 -right-1"
            >
              <Sparkles className="w-4 h-4 text-heritage-400" />
            </motion.div>
          </>
        ) : (
          <Lock className="w-5 h-5 text-ink-400" />
        )}
      </div>

      {/* 徽章名称 */}
      {showDetails && (
        <div className="mt-2 text-center">
          <p className={cn(
            'font-medium',
            config.text,
            isUnlocked ? 'text-ink-800' : 'text-ink-400'
          )}>
            {achievement.name}
          </p>
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-ink-400 mt-0.5">
              {new Date(achievement.unlockedAt).toLocaleDateString('zh-CN')}
            </p>
          )}
        </div>
      )}
    </motion.div>
  )
}

/** 徽章网格展示组件 */
interface EcoBadgeGridProps {
  achievements: EcoAchievement[]
  category?: AchievementCategory
  showLocked?: boolean
  onBadgeClick?: (achievement: EcoAchievement) => void
  className?: string
}

export function EcoBadgeGrid({
  achievements,
  category,
  showLocked = true,
  onBadgeClick,
  className
}: EcoBadgeGridProps) {
  const filteredAchievements = category
    ? achievements.filter(a => a.category === category)
    : achievements

  const displayAchievements = showLocked
    ? filteredAchievements
    : filteredAchievements.filter(a => a.unlocked)

  if (displayAchievements.length === 0) {
    return (
      <div className="text-center py-8 text-ink-400">
        暂无成就
      </div>
    )
  }

  return (
    <div className={cn('grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4', className)}>
      {displayAchievements.map((achievement) => (
        <EcoBadge
          key={achievement.id}
          achievement={achievement}
          size="md"
          showDetails
          onClick={onBadgeClick ? () => onBadgeClick(achievement) : undefined}
        />
      ))}
    </div>
  )
}

/** 徽章分类展示组件 */
interface EcoBadgeCategoriesProps {
  achievements: EcoAchievement[]
  onBadgeClick?: (achievement: EcoAchievement) => void
  className?: string
}

export function EcoBadgeCategories({
  achievements,
  onBadgeClick,
  className
}: EcoBadgeCategoriesProps) {
  const categories: AchievementCategory[] = ['learning', 'experience', 'sharing', 'carbon', 'special']

  return (
    <div className={cn('space-y-6', className)}>
      {categories.map((category) => {
        const categoryAchievements = achievements.filter(a => a.category === category)
        const unlockedCount = categoryAchievements.filter(a => a.unlocked).length
        const colors = categoryColors[category]

        return (
          <div key={category}>
            <div className="flex items-center justify-between mb-3">
              <h3 className={cn('font-medium', colors.text)}>
                {categoryNames[category]}成就
              </h3>
              <span className="text-sm text-ink-400">
                {unlockedCount}/{categoryAchievements.length}
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {categoryAchievements.map((achievement) => (
                <EcoBadge
                  key={achievement.id}
                  achievement={achievement}
                  size="sm"
                  showDetails
                  onClick={onBadgeClick ? () => onBadgeClick(achievement) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
