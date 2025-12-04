import { Fragment, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className,
}: ModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <Fragment>
          {/* 遮罩层 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className={cn(
                'relative w-full bg-white rounded-2xl shadow-2xl overflow-hidden',
                sizeClasses[size],
                className
              )}
            >
              {/* 标题栏 */}
              {title && (
                <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100">
                  <h3 className="text-lg font-bold text-ink-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* 关闭按钮（无标题时） */}
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 z-10 p-2 rounded-lg text-ink-400 hover:text-ink-600 hover:bg-ink-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}

              {/* 内容 */}
              <div className="p-6">{children}</div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>
  )
}
