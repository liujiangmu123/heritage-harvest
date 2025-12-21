/**
 * 乡遗识 - 生态成就系统 Store
 * 管理生态徽章、成就进度和解锁逻辑
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  EcoAchievement,
  AchievementCategory,
  ECO_ACHIEVEMENTS
} from '../types/eco'
import { useGreenPointsStore } from './greenPointsStore'

/** 成就解锁事件 */
export interface AchievementUnlockEvent {
  achievement: EcoAchievement
  timestamp: string
}

/** 生态成就状态接口 */
export interface EcoAchievementState {
  achievements: EcoAchievement[]
  unlockedIds: string[]
  achievementProgress: Record<string, number>
  recentUnlocks: AchievementUnlockEvent[]
  
  // 统计数据
  quizCorrectCount: number
  experienceCompleteCount: Record<string, number>
  shareCount: number
  polaroidCount: number
  pledgeCount: number
  timelineViewed: boolean
  knowledgeGraphProgress: number
  seasonalActivityCount: number
  
  // Actions
  checkAndUnlockAchievement: (achievementId: string) => boolean
  updateProgress: (achievementId: string, progress: number) => boolean
  incrementQuizCorrect: () => void
  recordExperienceComplete: (experienceId: string) => void
  recordShare: () => void
  recordPolaroid: () => void
  recordPledge: () => void
  recordTimelineView: () => void
  updateKnowledgeGraphProgress: (progress: number) => void
  recordSeasonalActivity: () => void
  
  // Queries
  getAchievement: (id: string) => EcoAchievement | undefined
  getUnlockedAchievements: () => EcoAchievement[]
  getLockedAchievements: () => EcoAchievement[]
  getAchievementsByCategory: (category: AchievementCategory) => EcoAchievement[]
  getRecentUnlocks: (limit?: number) => AchievementUnlockEvent[]
  getCompletionPercentage: () => number
  
  // Reset
  resetAchievements: () => void
}

/** 生态成就Store */
export const useEcoAchievementStore = create<EcoAchievementState>()(
  persist(
    (set, get) => ({
      achievements: ECO_ACHIEVEMENTS.map(a => ({ ...a })),
      unlockedIds: [],
      achievementProgress: {},
      recentUnlocks: [],
      
      // 统计数据初始值
      quizCorrectCount: 0,
      experienceCompleteCount: {},
      shareCount: 0,
      polaroidCount: 0,
      pledgeCount: 0,
      timelineViewed: false,
      knowledgeGraphProgress: 0,
      seasonalActivityCount: 0,

      checkAndUnlockAchievement: (achievementId) => {
        const state = get()
        if (state.unlockedIds.includes(achievementId)) {
          return false
        }
        
        const achievement = state.achievements.find(a => a.id === achievementId)
        if (!achievement) return false

        const now = new Date().toISOString()
        const unlockedAchievement = {
          ...achievement,
          unlocked: true,
          unlockedAt: now
        }

        set((s) => ({
          unlockedIds: [...s.unlockedIds, achievementId],
          achievements: s.achievements.map(a => 
            a.id === achievementId ? unlockedAchievement : a
          ),
          recentUnlocks: [
            { achievement: unlockedAchievement, timestamp: now },
            ...s.recentUnlocks.slice(0, 9) // 保留最近10个
          ]
        }))
        
        // 奖励绿色积分
        if (achievement.pointsReward > 0) {
          useGreenPointsStore.getState().addPoints({
            type: 'learn',
            points: achievement.pointsReward,
            description: `解锁成就: ${achievement.name}`,
            relatedId: achievementId
          })
        }
        
        return true
      },

      updateProgress: (achievementId, progress) => {
        const state = get()
        const achievement = state.achievements.find(a => a.id === achievementId)
        if (!achievement || !achievement.maxProgress) return false

        const newProgress = Math.min(progress, achievement.maxProgress)
        
        set((s) => ({
          achievementProgress: {
            ...s.achievementProgress,
            [achievementId]: newProgress
          },
          achievements: s.achievements.map(a => 
            a.id === achievementId ? { ...a, progress: newProgress } : a
          )
        }))

        // 检查是否完成
        if (newProgress >= achievement.maxProgress) {
          return get().checkAndUnlockAchievement(achievementId)
        }
        return false
      },

      incrementQuizCorrect: () => {
        set((state) => ({ quizCorrectCount: state.quizCorrectCount + 1 }))
        
        const state = get()
        // 检查学习成就
        if (state.quizCorrectCount === 1) {
          state.checkAndUnlockAchievement('eco-learner')
        }
        if (state.quizCorrectCount >= 50) {
          state.checkAndUnlockAchievement('eco-scholar')
        }
      },

      recordExperienceComplete: (experienceId) => {
        set((state) => ({
          experienceCompleteCount: {
            ...state.experienceCompleteCount,
            [experienceId]: (state.experienceCompleteCount[experienceId] || 0) + 1
          }
        }))

        const state = get()
        
        // 检查特定体验成就
        const achievementMap: Record<string, string> = {
          'hani_terrace': 'terrace-explorer',
          'bamboo_weaving': 'bamboo-advocate',
          'paper_cutting': 'paper-artist',
          'clay_sculpture': 'clay-craftsman',
          'shadow_puppet': 'shadow-master'
        }
        
        if (achievementMap[experienceId]) {
          state.checkAndUnlockAchievement(achievementMap[experienceId])
        }

        // 检查是否完成所有体验
        const allExperiences = ['hani_terrace', 'bamboo_weaving', 'paper_cutting', 'clay_sculpture', 'shadow_puppet']
        const completedCount = allExperiences.filter(e => state.experienceCompleteCount[e]).length
        
        if (completedCount >= 5) {
          state.checkAndUnlockAchievement('all-experiences')
        }
      },

      recordShare: () => {
        set((state) => ({ shareCount: state.shareCount + 1 }))
        
        const state = get()
        if (state.shareCount >= 3) {
          state.checkAndUnlockAchievement('eco-sharer')
        }
      },

      recordPolaroid: () => {
        set((state) => ({ polaroidCount: state.polaroidCount + 1 }))
        
        const state = get()
        if (state.polaroidCount >= 5) {
          state.checkAndUnlockAchievement('polaroid-collector')
        }
      },

      recordPledge: () => {
        set((state) => ({ pledgeCount: state.pledgeCount + 1 }))
        
        const state = get()
        if (state.pledgeCount === 1) {
          state.checkAndUnlockAchievement('pledge-maker')
        }
      },

      recordTimelineView: () => {
        set({ timelineViewed: true })
        get().checkAndUnlockAchievement('eco-historian')
      },

      updateKnowledgeGraphProgress: (progress) => {
        set({ knowledgeGraphProgress: progress })
        
        if (progress >= 50) {
          get().checkAndUnlockAchievement('knowledge-explorer')
        }
      },

      recordSeasonalActivity: () => {
        set((state) => ({ seasonalActivityCount: state.seasonalActivityCount + 1 }))
        
        const state = get()
        if (state.seasonalActivityCount >= 3) {
          state.checkAndUnlockAchievement('seasonal-participant')
        }
      },

      getAchievement: (id) => {
        const state = get()
        const achievement = state.achievements.find(a => a.id === id)
        if (!achievement) return undefined
        
        return {
          ...achievement,
          progress: state.achievementProgress[id] || achievement.progress
        }
      },

      getUnlockedAchievements: () => {
        const state = get()
        return state.achievements.filter(a => state.unlockedIds.includes(a.id))
      },

      getLockedAchievements: () => {
        const state = get()
        return state.achievements.filter(a => !state.unlockedIds.includes(a.id))
      },

      getAchievementsByCategory: (category) => {
        const state = get()
        return state.achievements.filter(a => a.category === category)
      },

      getRecentUnlocks: (limit = 5) => {
        return get().recentUnlocks.slice(0, limit)
      },

      getCompletionPercentage: () => {
        const state = get()
        return Math.round((state.unlockedIds.length / state.achievements.length) * 100)
      },

      resetAchievements: () => {
        set({
          achievements: ECO_ACHIEVEMENTS.map(a => ({ ...a, unlocked: false, unlockedAt: undefined })),
          unlockedIds: [],
          achievementProgress: {},
          recentUnlocks: [],
          quizCorrectCount: 0,
          experienceCompleteCount: {},
          shareCount: 0,
          polaroidCount: 0,
          pledgeCount: 0,
          timelineViewed: false,
          knowledgeGraphProgress: 0,
          seasonalActivityCount: 0
        })
      }
    }),
    {
      name: 'eco-achievement-storage',
      version: 1
    }
  )
)

/** 便捷方法：检查并解锁碳减排相关成就 */
export function checkCarbonAchievements(totalCarbonSaved: number) {
  const store = useEcoAchievementStore.getState()
  
  if (totalCarbonSaved >= 1000) {
    store.checkAndUnlockAchievement('carbon-saver-1kg')
  }
  if (totalCarbonSaved >= 10000) {
    store.checkAndUnlockAchievement('carbon-saver-10kg')
  }
  if (totalCarbonSaved >= 100000) {
    store.checkAndUnlockAchievement('carbon-saver-100kg')
  }
}

/** 便捷方法：检查学习路径完成成就 */
export function checkLearningPathAchievement(completedModules: number) {
  if (completedModules >= 4) {
    useEcoAchievementStore.getState().checkAndUnlockAchievement('eco-master-learner')
  }
}
