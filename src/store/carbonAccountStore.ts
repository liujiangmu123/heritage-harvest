/**
 * 乡遗识 - 碳账户状态管理
 * 管理用户碳减排记录、里程碑和等效指标
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  CarbonRecord,
  CarbonRecordType,
  CarbonEquivalent,
  CarbonMilestone,
  CARBON_MILESTONES,
  CARBON_SAVINGS_CONFIG,
  calculateCarbonEquivalent,
  generateId
} from '../types/eco'

/** 碳账户状态接口 */
export interface CarbonAccountState {
  totalCarbonSaved: number  // 总碳减排量（克）
  carbonHistory: CarbonRecord[]
  milestones: CarbonMilestone[]
  
  // Actions
  addCarbonSaving: (record: Omit<CarbonRecord, 'id' | 'timestamp'>) => CarbonMilestone[]
  getCarbonHistory: (limit?: number) => CarbonRecord[]
  getEquivalentMetrics: () => CarbonEquivalent
  getCarbonByType: (type: CarbonRecordType) => number
  checkMilestones: () => CarbonMilestone[]
  resetCarbonAccount: () => void
}

/** 碳账户Store */
export const useCarbonAccountStore = create<CarbonAccountState>()(
  persist(
    (set, get) => ({
      totalCarbonSaved: 0,
      carbonHistory: [],
      milestones: CARBON_MILESTONES.map(m => ({ ...m })),

      addCarbonSaving: (record) => {
        const newRecord: CarbonRecord = {
          ...record,
          id: generateId(),
          timestamp: new Date().toISOString()
        }

        let newlyUnlockedMilestones: CarbonMilestone[] = []

        set((state) => {
          const newTotalCarbonSaved = state.totalCarbonSaved + record.carbonSaved
          
          // 检查并更新里程碑
          const updatedMilestones = state.milestones.map(milestone => {
            if (!milestone.unlocked && newTotalCarbonSaved >= milestone.threshold) {
              const unlockedMilestone = {
                ...milestone,
                unlocked: true,
                unlockedAt: new Date().toISOString()
              }
              newlyUnlockedMilestones.push(unlockedMilestone)
              return unlockedMilestone
            }
            return milestone
          })
          
          return {
            totalCarbonSaved: newTotalCarbonSaved,
            carbonHistory: [newRecord, ...state.carbonHistory],
            milestones: updatedMilestones
          }
        })

        return newlyUnlockedMilestones
      },

      getCarbonHistory: (limit?: number) => {
        const { carbonHistory } = get()
        if (limit) {
          return carbonHistory.slice(0, limit)
        }
        return carbonHistory
      },

      getEquivalentMetrics: () => {
        const { totalCarbonSaved } = get()
        return calculateCarbonEquivalent(totalCarbonSaved)
      },

      getCarbonByType: (type: CarbonRecordType) => {
        const { carbonHistory } = get()
        return carbonHistory
          .filter(record => record.type === type)
          .reduce((sum, record) => sum + record.carbonSaved, 0)
      },

      checkMilestones: () => {
        const { totalCarbonSaved, milestones } = get()
        return milestones.filter(m => !m.unlocked && totalCarbonSaved >= m.threshold)
      },

      resetCarbonAccount: () => {
        set({
          totalCarbonSaved: 0,
          carbonHistory: [],
          milestones: CARBON_MILESTONES.map(m => ({ ...m, unlocked: false, unlockedAt: undefined }))
        })
      }
    }),
    {
      name: 'carbon-account-storage',
      version: 1
    }
  )
)

/** 便捷方法：添加云游碳减排 */
export function addCloudTourCarbonSaving(experienceId: string): CarbonMilestone[] {
  const config = CARBON_SAVINGS_CONFIG[experienceId]
  if (!config) {
    console.warn(`Unknown experience: ${experienceId}`)
    return []
  }
  
  return useCarbonAccountStore.getState().addCarbonSaving({
    type: 'cloud_tour',
    carbonSaved: config.baseSaving,
    description: config.description,
    experienceId
  })
}

/** 便捷方法：添加生态产品碳减排 */
export function addEcoProductCarbonSaving(productId: string, carbonSaved: number, description: string): CarbonMilestone[] {
  return useCarbonAccountStore.getState().addCarbonSaving({
    type: 'eco_product',
    carbonSaved,
    description,
    experienceId: productId
  })
}

/** 便捷方法：添加数字体验碳减排 */
export function addDigitalExperienceCarbonSaving(experienceId: string, carbonSaved: number, description: string): CarbonMilestone[] {
  return useCarbonAccountStore.getState().addCarbonSaving({
    type: 'digital_experience',
    carbonSaved,
    description,
    experienceId
  })
}

/** 格式化碳减排数量显示 */
export function formatCarbonSaved(grams: number): string {
  if (grams >= 1000000) {
    return `${(grams / 1000000).toFixed(2)} 吨`
  } else if (grams >= 1000) {
    return `${(grams / 1000).toFixed(2)} kg`
  }
  return `${grams} g`
}

/** 获取碳减排等效描述 */
export function getCarbonEquivalentDescription(grams: number): string[] {
  const equivalent = calculateCarbonEquivalent(grams)
  const descriptions: string[] = []
  
  if (equivalent.treesPlanted >= 0.01) {
    descriptions.push(`相当于种植 ${equivalent.treesPlanted} 棵树一年的碳吸收`)
  }
  if (equivalent.kmNotDriven >= 1) {
    descriptions.push(`相当于少开车 ${equivalent.kmNotDriven} 公里`)
  }
  if (equivalent.plasticAvoided >= 10) {
    descriptions.push(`相当于减少 ${equivalent.plasticAvoided}g 塑料制品`)
  }
  
  return descriptions
}
