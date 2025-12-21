import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ArrowRight, Camera, Share2, Compass } from 'lucide-react'
import { Button } from './Button'

interface Suggestion {
  icon: React.ElementType
  label: string
  description: string
  path: string
}

interface NextStepCardProps {
  title?: string
  suggestions?: Suggestion[]
  onClose?: () => void
  isVisible?: boolean
}

// 默认的下一步建议
const DEFAULT_SUGGESTIONS: Suggestion[] = [
  {
    icon: Camera,
    label: '去创作',
    description: 'AI拍立得/剪纸/泥塑',
    path: '/experience/ai-polaroid',
  },
  {
    icon: Share2,
    label: '去分享',
    description: '承诺墙/社交分享',
    path: '/eco-pledge-wall',
  },
  {
    icon: Compass,
    label: '探索更多',
    description: '发现更多体验',
    path: '/#experiences',
  },
]

export default function NextStepCard({
  title = '完成体验！',
  suggestions = DEFAULT_SUGGESTIONS,
  onClose,
  isVisible = true,
}: NextStepCardProps) {
  const [isOpen, setIsOpen] = useState(isVisible)

  const handleClose = () => {
    setIsOpen(false)
    onClose?.()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.9 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-6 z-30 w-80"
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-ink-100 overflow-hidden">
            {/* 头部 */}
            <div className="bg-gradient-to-r from-eco-500 to-eco-600 px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{title}</p>
                <p className="text-white/70 text-sm">选择下一步行动</p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* 建议列表 */}
            <div className="p-3">
              {suggestions.map((suggestion, index) => (
                <motion.div
                  key={suggestion.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={suggestion.path}
                    onClick={handleClose}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-eco-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-eco-100 flex items-center justify-center group-hover:bg-eco-200 transition-colors">
                      <suggestion.icon className="w-5 h-5 text-eco-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-ink-900">{suggestion.label}</p>
                      <p className="text-xs text-ink-500">{suggestion.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-ink-300 group-hover:text-eco-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* 底部 */}
            <div className="px-5 pb-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={handleClose}
              >
                稍后再说
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
