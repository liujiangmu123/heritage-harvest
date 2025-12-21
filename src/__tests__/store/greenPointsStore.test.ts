/**
 * 绿色积分系统单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { ECO_LEVELS, calculateEcoLevel } from '@/types/eco'

describe('Green Points Store', () => {
  beforeEach(() => {
    // 重置 store 状态
    useGreenPointsStore.getState().resetPoints()
  })

  describe('addPoints', () => {
    it('should add points correctly', () => {
      const initialPoints = useGreenPointsStore.getState().totalPoints

      useGreenPointsStore.getState().addPoints({
        type: 'learn',
        points: 10,
        description: '答对一道题'
      })

      // 重新获取状态以获取更新后的值
      expect(useGreenPointsStore.getState().totalPoints).toBe(initialPoints + 10)
    })

    it('should add record to history', () => {
      useGreenPointsStore.getState().addPoints({
        type: 'experience',
        points: 50,
        description: '完成哈尼梯田体验'
      })

      const history = useGreenPointsStore.getState().getPointsHistory()
      expect(history.length).toBe(1)
      expect(history[0].points).toBe(50)
      expect(history[0].type).toBe('experience')
    })

    it('should update level when threshold is reached', () => {
      // 添加足够积分达到 sprout 等级
      useGreenPointsStore.getState().addPoints({
        type: 'experience',
        points: 100,
        description: '测试升级'
      })

      expect(useGreenPointsStore.getState().currentLevel).toBe('sprout')
    })
  })

  describe('getLevelProgress', () => {
    it('should return correct progress for seedling', () => {
      useGreenPointsStore.getState().addPoints({ type: 'learn', points: 50, description: 'test' })

      const progress = useGreenPointsStore.getState().getLevelProgress()
      expect(progress.current).toBe('seedling')
      expect(progress.next).toBe('sprout')
      expect(progress.progress).toBe(50) // 50/100 = 50%
    })

    it('should return 100% progress for master level', () => {
      useGreenPointsStore.getState().addPoints({ type: 'learn', points: 2000, description: 'test' })

      const progress = useGreenPointsStore.getState().getLevelProgress()
      expect(progress.current).toBe('master')
      expect(progress.next).toBeNull()
      expect(progress.progress).toBe(100)
    })
  })

  describe('getPointsByType', () => {
    it('should return correct points by type', () => {
      useGreenPointsStore.getState().addPoints({ type: 'learn', points: 10, description: 'learn 1' })
      useGreenPointsStore.getState().addPoints({ type: 'learn', points: 20, description: 'learn 2' })
      useGreenPointsStore.getState().addPoints({ type: 'experience', points: 50, description: 'exp 1' })

      expect(useGreenPointsStore.getState().getPointsByType('learn')).toBe(30)
      expect(useGreenPointsStore.getState().getPointsByType('experience')).toBe(50)
      expect(useGreenPointsStore.getState().getPointsByType('share')).toBe(0)
    })
  })
})

describe('calculateEcoLevel', () => {
  it('should return seedling for 0-99 points', () => {
    expect(calculateEcoLevel(0)).toBe('seedling')
    expect(calculateEcoLevel(50)).toBe('seedling')
    expect(calculateEcoLevel(99)).toBe('seedling')
  })

  it('should return sprout for 100-499 points', () => {
    expect(calculateEcoLevel(100)).toBe('sprout')
    expect(calculateEcoLevel(300)).toBe('sprout')
    expect(calculateEcoLevel(499)).toBe('sprout')
  })

  it('should return guardian for 500-1499 points', () => {
    expect(calculateEcoLevel(500)).toBe('guardian')
    expect(calculateEcoLevel(1000)).toBe('guardian')
    expect(calculateEcoLevel(1499)).toBe('guardian')
  })

  it('should return master for 1500+ points', () => {
    expect(calculateEcoLevel(1500)).toBe('master')
    expect(calculateEcoLevel(5000)).toBe('master')
  })
})
