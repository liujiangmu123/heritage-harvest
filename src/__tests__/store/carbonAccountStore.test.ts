/**
 * 碳账户系统单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { calculateCarbonEquivalent, CARBON_SAVINGS_CONFIG } from '@/types/eco'

describe('Carbon Account Store', () => {
  beforeEach(() => {
    // 重置 store 状态
    useCarbonAccountStore.getState().resetCarbonAccount()
  })

  describe('addCarbonSaving', () => {
    it('should add carbon saving correctly', () => {
      const initialCarbon = useCarbonAccountStore.getState().totalCarbonSaved

      useCarbonAccountStore.getState().addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: 2500,
        description: '云游哈尼梯田'
      })

      expect(useCarbonAccountStore.getState().totalCarbonSaved).toBe(initialCarbon + 2500)
    })

    it('should add record to history', () => {
      useCarbonAccountStore.getState().addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: 2500,
        description: '云游哈尼梯田',
        experienceId: 'hani_terrace'
      })

      const history = useCarbonAccountStore.getState().getCarbonHistory()
      expect(history.length).toBe(1)
      expect(history[0].carbonSaved).toBe(2500)
      expect(history[0].type).toBe('cloud_tour')
    })

    it('should unlock milestone when threshold is reached', () => {
      // 添加足够碳减排达到 1kg 里程碑
      useCarbonAccountStore.getState().addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: 1000,
        description: '测试里程碑'
      })

      const milestones = useCarbonAccountStore.getState().milestones
      const firstMilestone = milestones.find(m => m.id === 'carbon-1kg')
      expect(firstMilestone?.unlocked).toBe(true)
    })

    it('should return newly unlocked milestones', () => {
      const unlockedMilestones = useCarbonAccountStore.getState().addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: 1000,
        description: '测试里程碑'
      })

      expect(unlockedMilestones.length).toBe(1)
      expect(unlockedMilestones[0].id).toBe('carbon-1kg')
    })
  })

  describe('getEquivalentMetrics', () => {
    it('should calculate equivalent metrics correctly', () => {
      useCarbonAccountStore.getState().addCarbonSaving({
        type: 'cloud_tour',
        carbonSaved: 21000, // 21kg = 1 tree
        description: '测试等效指标'
      })

      const metrics = useCarbonAccountStore.getState().getEquivalentMetrics()
      expect(metrics.treesPlanted).toBe(1)
      expect(metrics.kmNotDriven).toBe(175) // 21000/120 = 175
    })
  })

  describe('getCarbonByType', () => {
    it('should return correct carbon by type', () => {
      useCarbonAccountStore.getState().addCarbonSaving({ type: 'cloud_tour', carbonSaved: 2500, description: 'tour 1' })
      useCarbonAccountStore.getState().addCarbonSaving({ type: 'cloud_tour', carbonSaved: 500, description: 'tour 2' })
      useCarbonAccountStore.getState().addCarbonSaving({ type: 'eco_product', carbonSaved: 100, description: 'product 1' })

      expect(useCarbonAccountStore.getState().getCarbonByType('cloud_tour')).toBe(3000)
      expect(useCarbonAccountStore.getState().getCarbonByType('eco_product')).toBe(100)
      expect(useCarbonAccountStore.getState().getCarbonByType('digital_experience')).toBe(0)
    })
  })
})

describe('calculateCarbonEquivalent', () => {
  it('should calculate trees planted correctly', () => {
    // 21000g = 21kg = 1 tree
    const result = calculateCarbonEquivalent(21000)
    expect(result.treesPlanted).toBe(1)
  })

  it('should calculate km not driven correctly', () => {
    // 120g = 1km
    const result = calculateCarbonEquivalent(1200)
    expect(result.kmNotDriven).toBe(10)
  })

  it('should calculate plastic avoided correctly', () => {
    // 6g CO2 = 1g plastic
    const result = calculateCarbonEquivalent(60)
    expect(result.plasticAvoided).toBe(10)
  })

  it('should handle zero carbon', () => {
    const result = calculateCarbonEquivalent(0)
    expect(result.treesPlanted).toBe(0)
    expect(result.kmNotDriven).toBe(0)
    expect(result.plasticAvoided).toBe(0)
  })
})

describe('CARBON_SAVINGS_CONFIG', () => {
  it('should have correct config for hani_terrace', () => {
    expect(CARBON_SAVINGS_CONFIG.hani_terrace.baseSaving).toBe(2500)
  })

  it('should have correct config for bamboo_weaving', () => {
    expect(CARBON_SAVINGS_CONFIG.bamboo_weaving.baseSaving).toBe(500)
  })
})
