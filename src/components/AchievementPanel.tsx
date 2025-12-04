/**
 * 成就系统面板组件
 * 显示用户成就、等级和进度
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  X, 
  ChevronRight,
  Sparkles,
  Target,
  BookOpen,
  Palette,
  Zap
} from 'lucide-react'
import { 
  useAchievementStore, 
  ACHIEVEMENTS, 
  SKILL_LEVELS,
  type Achievement 
} from '@/store/achievementStore'

// 分类图标映射
const CATEGORY_ICONS = {
  exploration: Target,
  creation: Palette,
  learning: BookOpen,
  special: Zap,
}

const CATEGORY_NAMES = {
  exploration: '探索成就',
  creation: '创作成就',
  learning: '学习成就',
  special: '特殊成就',
}

interface AchievementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function AchievementPanel({ isOpen, onClose }: AchievementPanelProps) {
  const [activeTab, setActiveTab] = useState<Achievement['category'] | 'all'>('all')
  
  const { 
    totalXP, 
    currentLevel, 
    unlockedAchievements,
    achievementProgress,
    getLevelProgress 
  } = useAchievementStore()

  const levelProgress = getLevelProgress()
  const levelInfo = SKILL_LEVELS[currentLevel]

  // 筛选成就
  const filteredAchievements = activeTab === 'all' 
    ? ACHIEVEMENTS 
    : ACHIEVEMENTS.filter(a => a.category === activeTab)

  // 检查是否已解锁
  const isUnlocked = (id: string) => unlockedAchievements.includes(id)
  
  // 获取进度
  const getProgress = (achievement: Achievement) => {
    if (isUnlocked(achievement.id)) return 100
    if (achievement.maxProgress) {
      return ((achievementProgress[achievement.id] || 0) / achievement.maxProgress) * 100
    }
    return 0
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-10 lg:inset-20 bg-ink-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-heritage-600 via-primary-600 to-heritage-600 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">成就中心</h2>
                    <p className="text-white/70 text-sm">
                      已解锁 {unlockedAchievements.length}/{ACHIEVEMENTS.length} 个成就
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>

              {/* 等级信息 */}
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{levelInfo.icon}</span>
                    <div>
                      <div className="text-white font-semibold">{levelInfo.name}</div>
                      <div className="text-white/60 text-sm">{totalXP} XP</div>
                    </div>
                  </div>
                  {levelProgress.next && (
                    <div className="text-right">
                      <div className="text-white/60 text-xs">下一等级</div>
                      <div className="text-white text-sm flex items-center gap-1">
                        {SKILL_LEVELS[levelProgress.next].icon}
                        {SKILL_LEVELS[levelProgress.next].name}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* 进度条 */}
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${levelProgress.progress}%` }}
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500"
                  />
                </div>
                <div className="text-white/50 text-xs mt-1 text-right">
                  {levelProgress.progress.toFixed(0)}%
                </div>
              </div>
            </div>

            {/* 分类标签 */}
            <div className="flex gap-2 p-4 bg-ink-800/50 overflow-x-auto">
              <TabButton
                active={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                icon={<Sparkles className="w-4 h-4" />}
                label="全部"
                count={ACHIEVEMENTS.length}
              />
              {(Object.keys(CATEGORY_NAMES) as Achievement['category'][]).map(cat => {
                const Icon = CATEGORY_ICONS[cat]
                return (
                  <TabButton
                    key={cat}
                    active={activeTab === cat}
                    onClick={() => setActiveTab(cat)}
                    icon={<Icon className="w-4 h-4" />}
                    label={CATEGORY_NAMES[cat]}
                    count={ACHIEVEMENTS.filter(a => a.category === cat).length}
                  />
                )
              })}
            </div>

            {/* 成就列表 */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAchievements.map((achievement, index) => {
                  const unlocked = isUnlocked(achievement.id)
                  const progress = getProgress(achievement)
                  
                  return (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative p-4 rounded-xl border transition-all
                        ${unlocked
                          ? 'bg-gradient-to-br from-heritage-500/20 to-primary-500/20 border-heritage-500/50'
                          : 'bg-ink-800/50 border-ink-700 opacity-70'
                        }
                      `}
                    >
                      {/* 已解锁标记 */}
                      {unlocked && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-white fill-white" />
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <div className={`
                          text-3xl w-12 h-12 flex items-center justify-center rounded-lg
                          ${unlocked ? 'bg-white/10' : 'bg-ink-700 grayscale'}
                        `}>
                          {achievement.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold truncate ${unlocked ? 'text-white' : 'text-ink-400'}`}>
                            {achievement.name}
                          </h3>
                          <p className={`text-sm mt-1 ${unlocked ? 'text-ink-300' : 'text-ink-500'}`}>
                            {achievement.description}
                          </p>
                          
                          {/* XP奖励 */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`
                              text-xs px-2 py-0.5 rounded-full
                              ${unlocked ? 'bg-amber-500/20 text-amber-400' : 'bg-ink-700 text-ink-500'}
                            `}>
                              +{achievement.xpReward} XP
                            </span>
                            
                            {/* 进度显示 */}
                            {achievement.maxProgress && !unlocked && (
                              <span className="text-xs text-ink-500">
                                {achievementProgress[achievement.id] || 0}/{achievement.maxProgress}
                              </span>
                            )}
                          </div>

                          {/* 进度条 */}
                          {achievement.maxProgress && !unlocked && (
                            <div className="mt-2 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-heritage-500 transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 标签按钮组件
function TabButton({ 
  active, 
  onClick, 
  icon, 
  label, 
  count 
}: { 
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count: number
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all
        ${active
          ? 'bg-heritage-500 text-white'
          : 'bg-ink-700 text-ink-300 hover:bg-ink-600'
        }
      `}
    >
      {icon}
      <span>{label}</span>
      <span className={`
        text-xs px-1.5 py-0.5 rounded-full
        ${active ? 'bg-white/20' : 'bg-ink-600'}
      `}>
        {count}
      </span>
    </button>
  )
}

// 成就解锁通知组件
export function AchievementToast({ 
  achievement, 
  onClose 
}: { 
  achievement: Achievement
  onClose: () => void 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <div className="bg-gradient-to-r from-heritage-600 to-primary-600 rounded-xl p-4 shadow-2xl flex items-center gap-4 max-w-sm">
        <div className="text-4xl bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center">
          {achievement.icon}
        </div>
        <div className="flex-1">
          <div className="text-amber-300 text-xs font-semibold flex items-center gap-1">
            <Star className="w-3 h-3 fill-current" />
            成就解锁！
          </div>
          <div className="text-white font-bold">{achievement.name}</div>
          <div className="text-white/70 text-sm">+{achievement.xpReward} XP</div>
        </div>
        <button onClick={onClose} className="text-white/60 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  )
}
