import { motion } from 'framer-motion'

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-heritage-50">
      <div className="text-center">
        {/* Logo动画 */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="relative w-24 h-24 mx-auto">
            {/* 外圈 */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-heritage-200"
              style={{
                borderTopColor: '#c9a227',
                borderRightColor: '#d97d39',
              }}
            />
            {/* 内圈 */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-2 rounded-full border-4 border-primary-200"
              style={{
                borderBottomColor: '#c9a227',
                borderLeftColor: '#d97d39',
              }}
            />
            {/* 中心图标 */}
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 bg-gradient-to-br from-heritage-400 to-primary-500 rounded-lg shadow-heritage"
              />
            </div>
          </div>
        </motion.div>

        {/* 品牌名 */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-3xl font-bold text-gradient mb-2"
        >
          乡遗识
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-ink-500 text-sm"
        >
          Heritage Harvest
        </motion.p>

        {/* 加载提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex items-center justify-center gap-2">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
              className="w-2 h-2 rounded-full bg-heritage-500"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-heritage-500"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-heritage-500"
            />
          </div>
          <p className="mt-4 text-sm text-ink-400">正在加载文化之旅...</p>
        </motion.div>
      </div>
    </div>
  )
}
