import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Scissors, Shapes, X, Sparkles } from 'lucide-react'
import { usePolaroidStore } from '@/store/polaroidStore'
import EcoPolaroidModal from '@/components/experiences/EcoPolaroidModal'

// 创作选项
const createOptions = [
  {
    icon: Scissors,
    label: '剪纸创作',
    description: '体验剪纸艺术',
    path: '/experience/paper-cutting',
    color: 'from-red-500 to-rose-500',
  },
  {
    icon: Shapes,
    label: '泥塑体验',
    description: '感受泥塑魅力',
    path: '/experience/fengxiang-clay',
    color: 'from-amber-500 to-orange-500',
  },
]

export default function FloatingCreateButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [showPolaroidModal, setShowPolaroidModal] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const { polaroids } = usePolaroidStore()

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleOpenPolaroid = () => {
    setIsOpen(false)
    setShowPolaroidModal(true)
  }

  return (
    <>
      <div ref={containerRef} className="fixed bottom-6 right-6 z-40">
        {/* 展开的选项 */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ duration: 0.2 }}
              className="absolute bottom-16 right-0 mb-2"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-ink-100 p-2 min-w-[220px]">
                {/* 拍立得选项 - 置顶高亮 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <button
                    onClick={handleOpenPolaroid}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-purple-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow relative">
                      <Camera className="w-5 h-5 text-white" />
                      {polaroids.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-eco-500 text-white text-xs rounded-full flex items-center justify-center">
                          {polaroids.length}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-ink-900 flex items-center gap-1">
                        生态拍立得
                        <Sparkles className="w-3 h-3 text-purple-500" />
                      </p>
                      <p className="text-xs text-ink-500">生成专属生态合影</p>
                    </div>
                  </button>
                </motion.div>

                <div className="h-px bg-ink-100 my-1" />

                {/* 其他创作选项 */}
                {createOptions.map((option, index) => (
                  <motion.div
                    key={option.path}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (index + 1) * 0.05 }}
                  >
                    <Link
                      to={option.path}
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ink-50 transition-colors group"
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${option.color} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
                        <option.icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-ink-900">{option.label}</p>
                        <p className="text-xs text-ink-500">{option.description}</p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 主按钮 */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${
            isOpen 
              ? 'bg-ink-800 rotate-45' 
              : 'bg-gradient-to-br from-eco-500 to-eco-600 hover:shadow-xl hover:shadow-eco-500/25'
          }`}
        >
          {isOpen ? (
            <X className="w-6 h-6 text-white" />
          ) : (
            <Camera className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>

      {/* 拍立得弹窗 */}
      <EcoPolaroidModal
        isOpen={showPolaroidModal}
        onClose={() => setShowPolaroidModal(false)}
      />
    </>
  )
}
