/**
 * 碳减排计算器组件
 * 展示碳减排计算和可视化
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Leaf, 
  TreeDeciduous, 
  Car, 
  Plane, 
  Factory,
  ArrowRight,
  Info
} from 'lucide-react'
import { 
  calculateCarbonEquivalent, 
  formatCarbonValue,
  calculateTravelCarbonSaving,
  compareProductCarbonFootprint,
  CARBON_COMPARISON_DATA
} from '@/utils/carbonCalculator'
import { CARBON_SAVINGS_CONFIG } from '@/types/eco'
import { cn } from '@/lib/utils'

interface CarbonSavingsCalculatorProps {
  experienceId?: string
  variant?: 'compact' | 'full' | 'comparison'
  className?: string
}

export default function CarbonSavingsCalculator({
  experienceId,
  variant = 'full',
  className
}: CarbonSavingsCalculatorProps) {
  const [selectedExperience, setSelectedExperience] = useState(
    experienceId || 'hani_terrace'
  )

  const config = CARBON_SAVINGS_CONFIG[selectedExperience]
  const carbonSaved = config?.baseSaving || 0
  const equivalent = calculateCarbonEquivalent(carbonSaved)

  // 紧凑模式
  if (variant === 'compact') {
    return (
      <div className={cn(
        'bg-carbon-50 rounded-xl p-4 border border-carbon-200',
        className
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-carbon-500" />
            <span className="text-sm text-ink-600">本次体验碳减排</span>
          </div>
          <span className="text-lg font-bold text-carbon-600">
            {formatCarbonValue(carbonSaved)}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-ink-500">
          <span className="flex items-center gap-1">
            <TreeDeciduous className="w-3 h-3" />
            ≈ {equivalent.treesPlanted} 棵树
          </span>
          <span className="flex items-center gap-1">
            <Car className="w-3 h-3" />
            ≈ {equivalent.kmNotDriven} km
          </span>
        </div>
      </div>
    )
  }

  // 对比模式
  if (variant === 'comparison') {
    return (
      <div className={cn('space-y-4', className)}>
        <h3 className="font-medium text-ink-800 flex items-center gap-2">
          <Factory className="w-5 h-5 text-carbon-500" />
          传统工艺 vs 工业制品
        </h3>
        
        {Object.entries(CARBON_COMPARISON_DATA).map(([key, data]) => {
          const comparison = compareProductCarbonFootprint(data.traditional, data.industrial)
          return (
            <div 
              key={key}
              className="bg-white rounded-xl p-4 border border-ink-100"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-eco-100 flex items-center justify-center">
                    <Leaf className="w-5 h-5 text-eco-600" />
                  </div>
                  <div>
                    <p className="font-medium text-ink-800">{data.traditional.name}</p>
                    <p className="text-xs text-ink-500">{formatCarbonValue(comparison.traditional)}</p>
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-ink-300" />
                
                <div className="flex items-center gap-3">
                  <div>
                    <p className="font-medium text-ink-800 text-right">{data.industrial.name}</p>
                    <p className="text-xs text-ink-500 text-right">{formatCarbonValue(comparison.industrial)}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                    <Factory className="w-5 h-5 text-ink-500" />
                  </div>
                </div>
              </div>
              
              <div className="bg-eco-50 rounded-lg p-2 text-center">
                <span className="text-sm text-eco-700">
                  选择传统工艺可减少 <strong>{comparison.savedPercentage}%</strong> 碳排放
                </span>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // 完整模式
  const travelSaving = calculateTravelCarbonSaving(selectedExperience)

  return (
    <div className={cn('space-y-6', className)}>
      {/* 体验选择 */}
      <div>
        <label className="text-sm text-ink-600 mb-2 block">选择体验</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CARBON_SAVINGS_CONFIG).map(([id, cfg]) => (
            <button
              key={id}
              onClick={() => setSelectedExperience(id)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm transition-all',
                selectedExperience === id
                  ? 'bg-eco-500 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              )}
            >
              {cfg.description.split('，')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* 碳减排数据卡片 */}
      <motion.div
        key={selectedExperience}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-carbon-50 to-eco-50 rounded-2xl p-6 border border-carbon-200"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-carbon-500 flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-sm text-ink-500">本次体验碳减排</p>
            <p className="text-2xl font-bold text-carbon-700">
              {formatCarbonValue(carbonSaved)}
            </p>
          </div>
        </div>

        <p className="text-sm text-ink-600 mb-4 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 text-ink-400" />
          {config?.description}
        </p>

        {/* 等效指标 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/80 rounded-xl p-3 text-center">
            <TreeDeciduous className="w-6 h-6 text-eco-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-eco-700">{equivalent.treesPlanted}</p>
            <p className="text-xs text-ink-500">等效种树（棵）</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 text-center">
            <Car className="w-6 h-6 text-carbon-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-carbon-700">{equivalent.kmNotDriven}</p>
            <p className="text-xs text-ink-500">少开车（km）</p>
          </div>
          <div className="bg-white/80 rounded-xl p-3 text-center">
            <span className="text-2xl">🎋</span>
            <p className="text-lg font-bold text-bamboo-700">{equivalent.plasticAvoided}</p>
            <p className="text-xs text-ink-500">减塑料（g）</p>
          </div>
        </div>
      </motion.div>

      {/* 云游vs实地对比 */}
      <div className="bg-white rounded-2xl p-6 border border-ink-100">
        <h3 className="font-medium text-ink-800 mb-4 flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary-500" />
          云游 vs 实地旅游
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-eco-100 flex items-center justify-center">
                <span className="text-lg">💻</span>
              </div>
              <div>
                <p className="font-medium text-ink-700">云游体验</p>
                <p className="text-xs text-ink-500">数字化沉浸体验</p>
              </div>
            </div>
            <span className="text-eco-600 font-medium">
              {formatCarbonValue(travelSaving.cloudTour)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                <Plane className="w-5 h-5 text-ink-500" />
              </div>
              <div>
                <p className="font-medium text-ink-700">实地旅游</p>
                <p className="text-xs text-ink-500">往返交通+住宿</p>
              </div>
            </div>
            <span className="text-ink-600 font-medium">
              {formatCarbonValue(travelSaving.physicalTour)}
            </span>
          </div>

          <div className="bg-eco-50 rounded-xl p-4 text-center">
            <p className="text-sm text-ink-600 mb-1">选择云游可减少碳排放</p>
            <p className="text-2xl font-bold text-eco-600">
              {formatCarbonValue(travelSaving.saved)}
            </p>
            <p className="text-xs text-eco-500 mt-1">
              相当于种植 {calculateCarbonEquivalent(travelSaving.saved).treesPlanted} 棵树
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
