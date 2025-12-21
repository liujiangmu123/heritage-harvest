import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface JourneyStep {
  number: string
  title: string
  description: string
  isCompleted: boolean
  isCurrent: boolean
}

interface JourneyStepsProps {
  steps: JourneyStep[]
  onStepClick?: (stepIndex: number) => void
}

// 默认的旅程步骤数据
export const JOURNEY_STEPS: Omit<JourneyStep, 'isCompleted' | 'isCurrent'>[] = [
  { number: '01', title: '认识', description: '了解乡遗识' },
  { number: '02', title: '探索', description: '体验生态非遗' },
  { number: '03', title: '创作', description: '生成专属作品' },
  { number: '04', title: '分享', description: '传播生态理念' },
  { number: '05', title: '成长', description: '积累环保贡献' },
]

export default function JourneySteps({ steps, onStepClick }: JourneyStepsProps) {
  return (
    <div className="w-full overflow-x-auto pb-4">
      <div className="flex items-center justify-center min-w-max px-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            {/* 步骤节点 */}
            <motion.button
              onClick={() => onStepClick?.(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative flex flex-col items-center cursor-pointer group',
                onStepClick ? 'cursor-pointer' : 'cursor-default'
              )}
            >
              {/* 圆形指示器 */}
              <div
                className={cn(
                  'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300',
                  step.isCompleted
                    ? 'bg-eco-500 text-white shadow-lg shadow-eco-500/30'
                    : step.isCurrent
                    ? 'bg-eco-100 text-eco-600 ring-4 ring-eco-200'
                    : 'bg-ink-100 text-ink-400'
                )}
              >
                {step.isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-bold">{step.number}</span>
                )}
              </div>

              {/* 标题和描述 */}
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    step.isCompleted || step.isCurrent
                      ? 'text-ink-900'
                      : 'text-ink-400'
                  )}
                >
                  {step.title}
                </p>
                <p
                  className={cn(
                    'text-xs mt-0.5 transition-colors',
                    step.isCompleted || step.isCurrent
                      ? 'text-ink-500'
                      : 'text-ink-300'
                  )}
                >
                  {step.description}
                </p>
              </div>
            </motion.button>

            {/* 连接线 */}
            {index < steps.length - 1 && (
              <div className="w-16 lg:w-24 h-0.5 mx-2 relative">
                <div className="absolute inset-0 bg-ink-200 rounded-full" />
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: step.isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="absolute inset-y-0 left-0 bg-eco-500 rounded-full"
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
