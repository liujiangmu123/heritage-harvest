/**
 * 游戏化成就系统 Store
 * 包含徽章、等级、进度追踪
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// 技能等级
export type SkillLevel = 'beginner' | 'apprentice' | 'craftsman' | 'master'

export const SKILL_LEVELS: Record<SkillLevel, { name: string; minXP: number; icon: string }> = {
  beginner: { name: '初学者', minXP: 0, icon: '🌱' },
  apprentice: { name: '学徒', minXP: 100, icon: '🌿' },
  craftsman: { name: '匠人', minXP: 500, icon: '🎋' },
  master: { name: '大师', minXP: 1500, icon: '🏆' },
}

// 成就徽章类型
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'exploration' | 'creation' | 'learning' | 'special'
  xpReward: number
  unlockedAt?: string
  progress?: number  // 0-100
  maxProgress?: number
}

// 预设成就列表
export const ACHIEVEMENTS: Achievement[] = [
  // 探索成就
  {
    id: 'first-visit',
    name: '初次探索',
    description: '首次进入非遗体验',
    icon: '🎯',
    category: 'exploration',
    xpReward: 10,
  },
  {
    id: 'bamboo-explorer',
    name: '藤铁探索者',
    description: '完成安溪藤铁工艺体验',
    icon: '🎍',
    category: 'exploration',
    xpReward: 50,
  },
  {
    id: 'paper-explorer',
    name: '剪纸探索者',
    description: '完成剪纸艺术体验',
    icon: '✂️',
    category: 'exploration',
    xpReward: 50,
  },
  {
    id: 'terrace-explorer',
    name: '梯田守望者',
    description: '完成哈尼梯田VR全景体验',
    icon: '🏔️',
    category: 'exploration',
    xpReward: 50,
  },
  {
    id: 'all-experiences',
    name: '非遗达人',
    description: '完成所有非遗体验项目',
    icon: '🌟',
    category: 'exploration',
    xpReward: 200,
  },
  // 创作成就
  {
    id: 'first-creation',
    name: '首次创作',
    description: '在任意体验中完成首次创作',
    icon: '🎨',
    category: 'creation',
    xpReward: 20,
  },
  {
    id: 'weaving-master',
    name: '编织能手',
    description: '在藤铁编织中完成10次编织',
    icon: '🧶',
    category: 'creation',
    xpReward: 100,
    progress: 0,
    maxProgress: 10,
  },
  {
    id: 'paper-artist',
    name: '剪纸艺术家',
    description: '创作5幅剪纸作品',
    icon: '🎭',
    category: 'creation',
    xpReward: 100,
    progress: 0,
    maxProgress: 5,
  },
  {
    id: 'share-master',
    name: '分享达人',
    description: '分享3次作品',
    icon: '📤',
    category: 'creation',
    xpReward: 50,
    progress: 0,
    maxProgress: 3,
  },
  // 学习成就
  {
    id: 'listen-narration',
    name: '聆听者',
    description: '收听完整语音导览',
    icon: '🎧',
    category: 'learning',
    xpReward: 30,
  },
  {
    id: 'knowledge-seeker',
    name: '求知者',
    description: '收集所有热点知识点',
    icon: '📚',
    category: 'learning',
    xpReward: 80,
  },
  {
    id: 'map-explorer',
    name: '地图探索家',
    description: '在非遗地图中浏览5个以上地区',
    icon: '🗺️',
    category: 'learning',
    xpReward: 60,
    progress: 0,
    maxProgress: 5,
  },
  // 特殊成就
  {
    id: 'night-owl',
    name: '夜猫子',
    description: '在晚上10点后体验非遗',
    icon: '🦉',
    category: 'special',
    xpReward: 20,
  },
  {
    id: 'early-bird',
    name: '早起的鸟儿',
    description: '在早上6点前体验非遗',
    icon: '🐦',
    category: 'special',
    xpReward: 20,
  },
  {
    id: 'dedication',
    name: '专注者',
    description: '单次体验时长超过10分钟',
    icon: '⏱️',
    category: 'special',
    xpReward: 40,
  },
]

// Store 状态类型
interface AchievementState {
  // 用户数据
  totalXP: number
  currentLevel: SkillLevel
  unlockedAchievements: string[]
  achievementProgress: Record<string, number>
  
  // 统计数据
  totalExperienceTime: number  // 秒
  experienceVisits: Record<string, number>
  creationsCount: number
  sharesCount: number
  
  // 操作
  addXP: (amount: number) => void
  unlockAchievement: (achievementId: string) => boolean
  updateProgress: (achievementId: string, progress: number) => boolean
  recordVisit: (experienceId: string) => void
  recordCreation: () => void
  recordShare: () => void
  addExperienceTime: (seconds: number) => void
  
  // 查询
  getAchievement: (id: string) => Achievement | undefined
  getUnlockedAchievements: () => Achievement[]
  getLockedAchievements: () => Achievement[]
  getAchievementsByCategory: (category: Achievement['category']) => Achievement[]
  getLevelProgress: () => { current: SkillLevel; next: SkillLevel | null; progress: number }
  
  // 重置
  resetProgress: () => void
}

export const useAchievementStore = create<AchievementState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      currentLevel: 'beginner',
      unlockedAchievements: [],
      achievementProgress: {},
      totalExperienceTime: 0,
      experienceVisits: {},
      creationsCount: 0,
      sharesCount: 0,

      addXP: (amount) => {
        set((state) => {
          const newXP = state.totalXP + amount
          // 计算新等级
          let newLevel: SkillLevel = 'beginner'
          if (newXP >= SKILL_LEVELS.master.minXP) newLevel = 'master'
          else if (newXP >= SKILL_LEVELS.craftsman.minXP) newLevel = 'craftsman'
          else if (newXP >= SKILL_LEVELS.apprentice.minXP) newLevel = 'apprentice'
          
          return { totalXP: newXP, currentLevel: newLevel }
        })
      },

      unlockAchievement: (achievementId) => {
        const state = get()
        if (state.unlockedAchievements.includes(achievementId)) {
          return false
        }
        
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!achievement) return false

        set((s) => ({
          unlockedAchievements: [...s.unlockedAchievements, achievementId],
        }))
        
        // 添加经验值
        get().addXP(achievement.xpReward)
        return true
      },

      updateProgress: (achievementId, progress) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId)
        if (!achievement || !achievement.maxProgress) return false

        const newProgress = Math.min(progress, achievement.maxProgress)
        set((state) => ({
          achievementProgress: {
            ...state.achievementProgress,
            [achievementId]: newProgress,
          },
        }))

        // 检查是否完成
        if (newProgress >= achievement.maxProgress) {
          return get().unlockAchievement(achievementId)
        }
        return false
      },

      recordVisit: (experienceId) => {
        set((state) => {
          const visits = { ...state.experienceVisits }
          visits[experienceId] = (visits[experienceId] || 0) + 1
          return { experienceVisits: visits }
        })

        // 检查首次访问成就
        const state = get()
        if (Object.keys(state.experienceVisits).length === 1) {
          state.unlockAchievement('first-visit')
        }

        // 检查特定体验成就
        const achievementMap: Record<string, string> = {
          'bamboo-weaving': 'bamboo-explorer',
          'paper-cutting': 'paper-explorer',
          'hani-terrace': 'terrace-explorer',
        }
        if (achievementMap[experienceId]) {
          state.unlockAchievement(achievementMap[experienceId])
        }

        // 检查是否完成所有体验
        const allExperiences = ['bamboo-weaving', 'paper-cutting', 'hani-terrace']
        if (allExperiences.every(e => state.experienceVisits[e])) {
          state.unlockAchievement('all-experiences')
        }

        // 检查时间成就
        const hour = new Date().getHours()
        if (hour >= 22 || hour < 4) {
          state.unlockAchievement('night-owl')
        }
        if (hour >= 4 && hour < 6) {
          state.unlockAchievement('early-bird')
        }
      },

      recordCreation: () => {
        set((state) => ({ creationsCount: state.creationsCount + 1 }))
        
        const state = get()
        if (state.creationsCount === 1) {
          state.unlockAchievement('first-creation')
        }
      },

      recordShare: () => {
        set((state) => ({ sharesCount: state.sharesCount + 1 }))
        get().updateProgress('share-master', get().sharesCount)
      },

      addExperienceTime: (seconds) => {
        set((state) => ({
          totalExperienceTime: state.totalExperienceTime + seconds,
        }))
        
        // 检查专注成就 (10分钟 = 600秒)
        if (seconds >= 600) {
          get().unlockAchievement('dedication')
        }
      },

      getAchievement: (id) => {
        const achievement = ACHIEVEMENTS.find(a => a.id === id)
        if (!achievement) return undefined
        
        const state = get()
        return {
          ...achievement,
          unlockedAt: state.unlockedAchievements.includes(id) 
            ? new Date().toISOString() 
            : undefined,
          progress: state.achievementProgress[id] || achievement.progress,
        }
      },

      getUnlockedAchievements: () => {
        const state = get()
        return ACHIEVEMENTS.filter(a => state.unlockedAchievements.includes(a.id))
      },

      getLockedAchievements: () => {
        const state = get()
        return ACHIEVEMENTS.filter(a => !state.unlockedAchievements.includes(a.id))
      },

      getAchievementsByCategory: (category) => {
        return ACHIEVEMENTS.filter(a => a.category === category)
      },

      getLevelProgress: () => {
        const state = get()
        const levels: SkillLevel[] = ['beginner', 'apprentice', 'craftsman', 'master']
        const currentIndex = levels.indexOf(state.currentLevel)
        const nextLevel = currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null
        
        const currentMin = SKILL_LEVELS[state.currentLevel].minXP
        const nextMin = nextLevel ? SKILL_LEVELS[nextLevel].minXP : currentMin
        const progress = nextLevel 
          ? ((state.totalXP - currentMin) / (nextMin - currentMin)) * 100
          : 100

        return {
          current: state.currentLevel,
          next: nextLevel,
          progress: Math.min(100, Math.max(0, progress)),
        }
      },

      resetProgress: () => {
        set({
          totalXP: 0,
          currentLevel: 'beginner',
          unlockedAchievements: [],
          achievementProgress: {},
          totalExperienceTime: 0,
          experienceVisits: {},
          creationsCount: 0,
          sharesCount: 0,
        })
      },
    }),
    {
      name: 'achievement-storage',
    }
  )
)
