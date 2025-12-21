/**
 * 碳减排计算工具函数
 */

import { CarbonEquivalent, CARBON_SAVINGS_CONFIG } from '@/types/eco'

/** 计算体验的碳减排量 */
export function calculateExperienceCarbonSaving(experienceId: string): number {
  const config = CARBON_SAVINGS_CONFIG[experienceId]
  return config?.baseSaving || 0
}

/** 计算碳减排等效指标 */
export function calculateCarbonEquivalent(carbonGrams: number): CarbonEquivalent {
  return {
    treesPlanted: Math.round(carbonGrams / 21000 * 100) / 100,  // 一棵树年吸收约21kg CO2
    kmNotDriven: Math.round(carbonGrams / 120 * 100) / 100,     // 汽车每公里约排放120g CO2
    plasticAvoided: Math.round(carbonGrams / 6 * 100) / 100     // 1g塑料约产生6g CO2
  }
}

/** 格式化碳减排数值 */
export function formatCarbonValue(grams: number): string {
  if (grams >= 1000000) {
    return `${(grams / 1000000).toFixed(1)} 吨`
  }
  if (grams >= 1000) {
    return `${(grams / 1000).toFixed(1)} kg`
  }
  return `${grams} g`
}

/** 计算云游vs实地旅游的碳减排 */
export function calculateTravelCarbonSaving(
  _destination: string,
  distanceKm: number = 1000
): { cloudTour: number; physicalTour: number; saved: number } {
  // 实地旅游碳排放估算
  const flightEmission = distanceKm * 0.255 * 2  // 往返飞机，每公里255g CO2
  const hotelEmission = 3 * 20000  // 3晚住宿，每晚约20kg CO2
  const localTransport = 100 * 120  // 当地交通100km
  const physicalTour = flightEmission + hotelEmission + localTransport

  // 云游碳排放（仅设备用电）
  const cloudTour = 50  // 约50g CO2（1小时设备用电）

  return {
    cloudTour,
    physicalTour: Math.round(physicalTour),
    saved: Math.round(physicalTour - cloudTour)
  }
}

/** 计算产品碳足迹对比 */
export function compareProductCarbonFootprint(
  traditionalProduct: { name: string; carbonFootprint: number },
  industrialProduct: { name: string; carbonFootprint: number }
): {
  traditional: number
  industrial: number
  saved: number
  savedPercentage: number
} {
  const saved = industrialProduct.carbonFootprint - traditionalProduct.carbonFootprint
  const savedPercentage = Math.round((saved / industrialProduct.carbonFootprint) * 100)
  
  return {
    traditional: traditionalProduct.carbonFootprint,
    industrial: industrialProduct.carbonFootprint,
    saved: Math.max(0, saved),
    savedPercentage: Math.max(0, savedPercentage)
  }
}

/** 预设的产品碳足迹对比数据 */
export const CARBON_COMPARISON_DATA = {
  bamboo_vs_plastic: {
    traditional: { name: '竹编篮子', carbonFootprint: 200 },
    industrial: { name: '塑料篮子', carbonFootprint: 2000 }
  },
  paper_vs_plastic: {
    traditional: { name: '宣纸剪纸', carbonFootprint: 50 },
    industrial: { name: '塑料装饰', carbonFootprint: 500 }
  },
  clay_vs_plastic: {
    traditional: { name: '泥塑工艺品', carbonFootprint: 100 },
    industrial: { name: '塑料玩具', carbonFootprint: 800 }
  },
  natural_dye_vs_chemical: {
    traditional: { name: '天然靛蓝染料', carbonFootprint: 150 },
    industrial: { name: '化学染料', carbonFootprint: 1200 }
  },
  leather_vs_synthetic: {
    traditional: { name: '天然皮革皮影', carbonFootprint: 300 },
    industrial: { name: '合成材料', carbonFootprint: 1500 }
  }
}

/** 计算年度碳减排目标进度 */
export function calculateAnnualProgress(
  currentSaved: number,
  annualTarget: number = 100000  // 默认目标100kg
): {
  current: number
  target: number
  progress: number
  remaining: number
  daysRemaining: number
  dailyTarget: number
} {
  const now = new Date()
  const endOfYear = new Date(now.getFullYear(), 11, 31)
  const daysRemaining = Math.ceil((endOfYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  const remaining = Math.max(0, annualTarget - currentSaved)
  const dailyTarget = daysRemaining > 0 ? Math.ceil(remaining / daysRemaining) : 0

  return {
    current: currentSaved,
    target: annualTarget,
    progress: Math.min(100, Math.round((currentSaved / annualTarget) * 100)),
    remaining,
    daysRemaining,
    dailyTarget
  }
}
