/**
 * 生态进度条组件
 * 支持多种样式的进度展示
 */

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface EcoProgressBarProps {
  progress: number // 0-100
  variant?: 'default' | 'eco' | 'carbon' | 'heritage' | 'gradient'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  showPercentage?: boolean
  animated?: boolean
  className?: string
}

const variantStyles = {
  default: 'bg-ink-500',
  eco: 'bg-gradient-to-r from-eco-400 to-eco-600',
  carbon: 'bg-gradient-to-r from-carbon-400 to-carbon-600',
  heritage: 'bg-gradient-to-r from-heritage-400 to-primary-500',
  gradient: 'bg-gradient-to-r from-eco-400 via-bamboo-400 to-heritage-400'
}

const trackStyles = {
  default: 'bg-ink-200',
  eco: 'bg-eco-100',
  carbon: 'bg-carbon-100',
  heritage: 'bg-heritage-100',
  gradient: 'bg-ink-100'
}

const sizeStyles = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4'
}

export default function EcoProgressBar({
  progress,
  variant = 'eco',
  size = 'md',
  showLabel = false,
  label,
  showPercentage = false,
  animated = true,
  className
}: EcoProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className={cn('w-full', className)}>
      {/* 标签行 */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {showLabel && label && (
            <span className="text-sm text-ink-600">{label}</span>
          )}
          {showPercentage && (
            <span className="text-sm font-medium text-ink-700">
              {Math.round(clampedProgress)}%
            </span>
          )}
        </div>
      )}

      {/* 进度条轨道 */}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          trackStyles[variant],
          sizeStyles[size]
        )}
      >
        {/* 进度条填充 */}
        <motion.div
          initial={animated ? { width: 0 } : { width: `${clampedProgress}%` }}
          animate={{ width: `${clampedProgress}%` }}
          transition={animated ? { duration: 0.8, ease: 'easeOut' } : { duration: 0 }}
          className={cn(
            'h-full rounded-full',
            variantStyles[variant]
          )}
        />
      </div>
    </div>
  )
}

/** 分段进度条 */
interface SegmentedProgressBarProps {
  segments: { value: number; label: string; color?: string }[]
  total: number
  showLabels?: boolean
  className?: string
}

export function SegmentedProgressBar({
  segments,
  total,
  showLabels = false,
  className
}: SegmentedProgressBarProps) {
  const defaultColors = [
    'bg-eco-500',
    'bg-carbon-500',
    'bg-bamboo-500',
    'bg-heritage-500',
    'bg-primary-500'
  ]

  return (
    <div className={cn('w-full', className)}>
      <div className="h-3 bg-ink-100 rounded-full overflow-hidden flex">
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100
          return (
            <motion.div
              key={index}
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={cn(
                'h-full',
                segment.color || defaultColors[index % defaultColors.length]
              )}
            />
          )
        })}
      </div>

      {showLabels && (
        <div className="flex flex-wrap gap-4 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-full',
                  segment.color || defaultColors[index % defaultColors.length]
                )}
              />
              <span className="text-xs text-ink-600">
                {segment.label}: {segment.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** 圆形进度条 */
interface CircularProgressProps {
  progress: number
  size?: number
  strokeWidth?: number
  variant?: 'eco' | 'carbon' | 'heritage'
  showPercentage?: boolean
  children?: React.ReactNode
  className?: string
}

export function CircularProgress({
  progress,
  size = 80,
  strokeWidth = 6,
  variant = 'eco',
  showPercentage = true,
  children,
  className
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const clampedProgress = Math.min(100, Math.max(0, progress))
  const offset = circumference - (clampedProgress / 100) * circumference

  const strokeColors = {
    eco: 'stroke-eco-500',
    carbon: 'stroke-carbon-500',
    heritage: 'stroke-heritage-500'
  }

  const trackColors = {
    eco: 'stroke-eco-100',
    carbon: 'stroke-carbon-100',
    heritage: 'stroke-heritage-100'
  }

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* 背景轨道 */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className={trackColors[variant]}
        />
        {/* 进度 */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={strokeColors[variant]}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      
      {/* 中心内容 */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showPercentage && (
          <span className="text-lg font-bold text-ink-700">
            {Math.round(clampedProgress)}%
          </span>
        ))}
      </div>
    </div>
  )
}

/** 步骤进度条 */
interface StepProgressProps {
  steps: { label: string; completed: boolean; active?: boolean }[]
  variant?: 'eco' | 'heritage'
  className?: string
}

export function StepProgress({
  steps,
  variant = 'eco',
  className
}: StepProgressProps) {
  const activeColors = {
    eco: 'bg-eco-500 border-eco-500',
    heritage: 'bg-heritage-500 border-heritage-500'
  }

  const completedColors = {
    eco: 'bg-eco-500 border-eco-500',
    heritage: 'bg-heritage-500 border-heritage-500'
  }

  const lineColors = {
    eco: 'bg-eco-500',
    heritage: 'bg-heritage-500'
  }

  return (
    <div className={cn('flex items-center', className)}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          {/* 步骤圆点 */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all',
                step.completed
                  ? `${completedColors[variant]} text-white`
                  : step.active
                    ? `${activeColors[variant]} text-white`
                    : 'bg-white border-ink-300 text-ink-400'
              )}
            >
              {step.completed ? '✓' : index + 1}
            </div>
            <span className={cn(
              'text-xs mt-1 whitespace-nowrap',
              step.completed || step.active ? 'text-ink-700' : 'text-ink-400'
            )}>
              {step.label}
            </span>
          </div>

          {/* 连接线 */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                'w-12 h-0.5 mx-2',
                step.completed ? lineColors[variant] : 'bg-ink-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}
