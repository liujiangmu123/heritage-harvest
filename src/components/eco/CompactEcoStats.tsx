import { motion } from 'framer-motion'
import { Leaf, TreeDeciduous, Sparkles, Award } from 'lucide-react'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useExperienceStore } from '@/store'

interface CompactEcoStatsProps {
  variant?: 'light' | 'dark' | 'gradient'
  showEquivalent?: boolean
}

export default function CompactEcoStats({ 
  variant = 'gradient',
  showEquivalent = true 
}: CompactEcoStatsProps) {
  const { totalPoints } = useGreenPointsStore()
  const { totalCarbonSaved, getEquivalentMetrics } = useCarbonAccountStore()
  const { completedExperiences } = useExperienceStore()
  const equivalent = getEquivalentMetrics()

  // 格式化碳减排数值
  const formatCarbon = (value: number) => {
    if (value >= 1000) {
      return { value: (value / 1000).toFixed(1), unit: 'kg' }
    }
    return { value: value.toString(), unit: 'g' }
  }

  const carbon = formatCarbon(totalCarbonSaved)

  const stats = [
    {
      icon: Sparkles,
      value: totalPoints,
      unit: '',
      label: '绿色积分',
    },
    {
      icon: Leaf,
      value: carbon.value,
      unit: carbon.unit,
      label: '碳减排',
    },
    {
      icon: Award,
      value: completedExperiences.length,
      unit: '',
      label: '完成体验',
    },
    ...(showEquivalent ? [{
      icon: TreeDeciduous,
      value: `≈ ${equivalent.treesPlanted}`,
      unit: '',
      label: '棵树',
    }] : []),
  ]

  const containerClasses = {
    light: 'bg-white border border-ink-100',
    dark: 'bg-ink-900 text-white',
    gradient: 'bg-gradient-to-r from-eco-500 to-eco-600 text-white',
  }

  const textClasses = {
    light: {
      value: 'text-ink-900',
      unit: 'text-ink-500',
      label: 'text-ink-500',
      icon: 'text-eco-500',
    },
    dark: {
      value: 'text-white',
      unit: 'text-white/70',
      label: 'text-white/60',
      icon: 'text-eco-400',
    },
    gradient: {
      value: 'text-white',
      unit: 'text-white/80',
      label: 'text-white/70',
      icon: 'text-white/80',
    },
  }

  const colors = textClasses[variant]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl px-6 py-4 ${containerClasses[variant]}`}
    >
      <div className="flex flex-wrap items-center justify-center gap-6 lg:gap-10">
        {stats.map((stat, index) => (
          <div key={stat.label} className="flex items-center gap-3">
            {index > 0 && (
              <div className={`hidden sm:block w-px h-8 ${variant === 'light' ? 'bg-ink-200' : 'bg-white/20'}`} />
            )}
            <div className="flex items-center gap-2">
              <stat.icon className={`w-5 h-5 ${colors.icon}`} />
              <div className="text-center">
                <div className="flex items-baseline gap-0.5">
                  <span className={`text-2xl lg:text-3xl font-bold ${colors.value}`}>
                    {stat.value}
                  </span>
                  {stat.unit && (
                    <span className={`text-sm ${colors.unit}`}>{stat.unit}</span>
                  )}
                </div>
                <p className={`text-xs ${colors.label}`}>{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
