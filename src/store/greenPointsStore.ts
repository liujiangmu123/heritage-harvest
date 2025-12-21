/**
 * 乡遗识 - 绿色积分状态管理
 * 管理用户绿色积分、等级和积分历史
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  EcoLevel,
  PointsRecord,
  PointsRecordType,
  ECO_LEVELS,
  calculateEcoLevel,
  generateId
} from '../types/eco'

/** 绿色积分状态接口 */
export interface GreenPointsState {
  totalPoints: number
  currentLevel: EcoLevel
  pointsHistory: PointsRecord[]
  
  // Actions
  addPoints: (record: Omit<PointsRecord, 'id' | 'timestamp'>) => void
  getPointsHistory: (limit?: number) => PointsRecord[]
  getLevelProgress: () => { current: EcoLevel; next: EcoLevel | null; progress: number; pointsToNext: number }
  getPointsByType: (type: PointsRecordType) => number
  resetPoints: () => void
}

/** 获取下一个等级 */
function getNextLevel(currentLevel: EcoLevel): EcoLevel | null {
  const levels: EcoLevel[] = ['seedling', 'sprout', 'guardian', 'master']
  const currentIndex = levels.indexOf(currentLevel)
  if (currentIndex < levels.length - 1) {
    return levels[currentIndex + 1]
  }
  return null
}

/** 绿色积分Store */
export const useGreenPointsStore = create<GreenPointsState>()(
  persist(
    (set, get) => ({
      totalPoints: 0,
      currentLevel: 'seedling' as EcoLevel,
      pointsHistory: [],

      addPoints: (record) => {
        const newRecord: PointsRecord = {
          ...record,
          id: generateId(),
          timestamp: new Date().toISOString()
        }

        set((state) => {
          const newTotalPoints = state.totalPoints + record.points
          const newLevel = calculateEcoLevel(newTotalPoints)
          
          return {
            totalPoints: newTotalPoints,
            currentLevel: newLevel,
            pointsHistory: [newRecord, ...state.pointsHistory]
          }
        })
      },

      getPointsHistory: (limit?: number) => {
        const { pointsHistory } = get()
        if (limit) {
          return pointsHistory.slice(0, limit)
        }
        return pointsHistory
      },

      getLevelProgress: () => {
        const { totalPoints, currentLevel } = get()
        const nextLevel = getNextLevel(currentLevel)
        
        const currentLevelInfo = ECO_LEVELS[currentLevel]
        const currentMin = currentLevelInfo.minPoints
        
        if (!nextLevel) {
          // 已达最高等级
          return {
            current: currentLevel,
            next: null,
            progress: 100,
            pointsToNext: 0
          }
        }
        
        const nextLevelInfo = ECO_LEVELS[nextLevel]
        const nextMin = nextLevelInfo.minPoints
        const range = nextMin - currentMin
        const pointsInRange = totalPoints - currentMin
        const progress = Math.min(100, Math.round((pointsInRange / range) * 100))
        const pointsToNext = nextMin - totalPoints
        
        return {
          current: currentLevel,
          next: nextLevel,
          progress,
          pointsToNext
        }
      },

      getPointsByType: (type: PointsRecordType) => {
        const { pointsHistory } = get()
        return pointsHistory
          .filter(record => record.type === type)
          .reduce((sum, record) => sum + record.points, 0)
      },

      resetPoints: () => {
        set({
          totalPoints: 0,
          currentLevel: 'seedling',
          pointsHistory: []
        })
      }
    }),
    {
      name: 'green-points-storage',
      version: 1
    }
  )
)

/** 积分奖励配置 */
export const POINTS_REWARDS = {
  // 学习类
  quiz_correct: 10,        // 答对一道题
  quiz_complete: 20,       // 完成一组问答
  timeline_view: 10,       // 浏览时间线
  knowledge_explore: 5,    // 探索知识图谱节点
  
  // 体验类
  experience_complete: 50, // 完成一个体验
  eco_cycle_view: 30,      // 观看生态循环演示
  digital_twin: 40,        // 使用数字孪生
  
  // 分享类
  share_social: 20,        // 社交分享
  polaroid_create: 30,     // 创建拍立得
  pledge_create: 20,       // 发布承诺
  pledge_support: 2,       // 支持他人承诺
  pledge_received: 5,      // 收到支持
  
  // 购买类
  purchase_base: 10,       // 基础购买积分
  purchase_eco_bonus: 5,   // 生态产品额外奖励（每10分可持续评分）
  
  // 特殊类
  achievement_unlock: 0,   // 成就解锁（由成就本身定义）
  seasonal_activity: 30,   // 参与季节活动
  first_visit: 10          // 首次访问
}

/** 便捷方法：添加学习积分 */
export function addLearnPoints(description: string, points: number = POINTS_REWARDS.quiz_correct, relatedId?: string) {
  useGreenPointsStore.getState().addPoints({
    type: 'learn',
    points,
    description,
    relatedId
  })
}

/** 便捷方法：添加体验积分 */
export function addExperiencePoints(description: string, points: number = POINTS_REWARDS.experience_complete, relatedId?: string) {
  useGreenPointsStore.getState().addPoints({
    type: 'experience',
    points,
    description,
    relatedId
  })
}

/** 便捷方法：添加分享积分 */
export function addSharePoints(description: string, points: number = POINTS_REWARDS.share_social, relatedId?: string) {
  useGreenPointsStore.getState().addPoints({
    type: 'share',
    points,
    description,
    relatedId
  })
}

/** 便捷方法：添加购买积分 */
export function addPurchasePoints(description: string, sustainabilityScore: number, relatedId?: string) {
  const bonusPoints = Math.floor(sustainabilityScore / 10) * POINTS_REWARDS.purchase_eco_bonus
  const totalPoints = POINTS_REWARDS.purchase_base + bonusPoints
  
  useGreenPointsStore.getState().addPoints({
    type: 'purchase',
    points: totalPoints,
    description,
    relatedId
  })
}

/** 便捷方法：添加承诺积分 */
export function addPledgePoints(description: string, points: number = POINTS_REWARDS.pledge_create, relatedId?: string) {
  useGreenPointsStore.getState().addPoints({
    type: 'pledge',
    points,
    description,
    relatedId
  })
}
