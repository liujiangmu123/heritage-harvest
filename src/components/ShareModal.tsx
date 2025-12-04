/**
 * 作品分享模态框组件
 * 支持截图、生成分享卡片、社交分享
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Download, 
  Copy, 
  Share2, 
  Check,
  Image,
  QrCode,
  Twitter,
  MessageCircle
} from 'lucide-react'
import { useScreenshot } from '@/hooks/useScreenshot'
import { useAchievementStore } from '@/store/achievementStore'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  screenshotUrl: string | null
  experienceName: string
  onCapture?: () => Promise<string | null>
}

export default function ShareModal({
  isOpen,
  onClose,
  screenshotUrl,
  experienceName,
  onCapture,
}: ShareModalProps) {
  const [currentImage, setCurrentImage] = useState<string | null>(screenshotUrl)
  const [isGeneratingCard, setIsGeneratingCard] = useState(false)
  const [shareCardUrl, setShareCardUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)

  const { generateShareCard, downloadImage, copyToClipboard, shareToSocial } = useScreenshot()
  const { recordShare } = useAchievementStore()

  // 重新截图
  const handleRecapture = async () => {
    if (!onCapture) return
    setIsCapturing(true)
    const url = await onCapture()
    if (url) {
      setCurrentImage(url)
      setShareCardUrl(null)
    }
    setIsCapturing(false)
  }

  // 生成分享卡片
  const handleGenerateCard = async () => {
    if (!currentImage) return
    setIsGeneratingCard(true)
    
    const cardUrl = await generateShareCard(currentImage, {
      title: '非遗可视化体验',
      subtitle: 'Heritage Visualization',
      experienceName,
      timestamp: true,
      watermark: true,
      qrCodeUrl: window.location.href,
    })
    
    if (cardUrl) {
      setShareCardUrl(cardUrl)
    }
    setIsGeneratingCard(false)
  }

  // 下载
  const handleDownload = () => {
    const url = shareCardUrl || currentImage
    if (url) {
      const filename = `heritage-${experienceName}-${Date.now()}.png`
      downloadImage(url, filename)
      recordShare()
    }
  }

  // 复制
  const handleCopy = async () => {
    const url = shareCardUrl || currentImage
    if (url) {
      const success = await copyToClipboard(url)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        recordShare()
      }
    }
  }

  // 分享
  const handleShare = async () => {
    const url = shareCardUrl || currentImage
    if (url) {
      await shareToSocial(url, {
        title: `我在体验「${experienceName}」非遗可视化`,
        text: '快来感受非物质文化遗产的魅力！',
        url: window.location.href,
      })
      recordShare()
    }
  }

  const displayImage = shareCardUrl || currentImage

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
          />

          {/* 模态框 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
              md:w-[500px] md:max-h-[90vh] bg-ink-900 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-ink-700">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Share2 className="w-5 h-5 text-heritage-400" />
                分享作品
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-ink-700 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-ink-400" />
              </button>
            </div>

            {/* 内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 预览图 */}
              <div className="bg-ink-800 rounded-xl p-2 mb-4">
                {displayImage ? (
                  <img
                    src={displayImage}
                    alt="作品预览"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="aspect-video flex items-center justify-center text-ink-500">
                    <Image className="w-12 h-12" />
                  </div>
                )}
              </div>

              {/* 操作按钮 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {onCapture && (
                  <button
                    onClick={handleRecapture}
                    disabled={isCapturing}
                    className="flex items-center justify-center gap-2 py-3 bg-ink-700 hover:bg-ink-600 
                      text-white rounded-xl transition-colors disabled:opacity-50"
                  >
                    <Image className="w-4 h-4" />
                    {isCapturing ? '截图中...' : '重新截图'}
                  </button>
                )}
                
                <button
                  onClick={handleGenerateCard}
                  disabled={!currentImage || isGeneratingCard}
                  className="flex items-center justify-center gap-2 py-3 bg-heritage-500 hover:bg-heritage-600 
                    text-white rounded-xl transition-colors disabled:opacity-50"
                >
                  <QrCode className="w-4 h-4" />
                  {isGeneratingCard ? '生成中...' : shareCardUrl ? '已生成' : '生成卡片'}
                </button>
              </div>

              {/* 分享方式 */}
              <div className="space-y-3">
                <h3 className="text-sm text-ink-400">分享方式</h3>
                
                <div className="grid grid-cols-3 gap-3">
                  {/* 下载 */}
                  <button
                    onClick={handleDownload}
                    disabled={!displayImage}
                    className="flex flex-col items-center gap-2 py-4 bg-ink-800 hover:bg-ink-700 
                      rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                      <Download className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs text-ink-300">保存图片</span>
                  </button>

                  {/* 复制 */}
                  <button
                    onClick={handleCopy}
                    disabled={!displayImage}
                    className="flex flex-col items-center gap-2 py-4 bg-ink-800 hover:bg-ink-700 
                      rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      {copied ? (
                        <Check className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-green-400" />
                      )}
                    </div>
                    <span className="text-xs text-ink-300">
                      {copied ? '已复制' : '复制图片'}
                    </span>
                  </button>

                  {/* 分享 */}
                  <button
                    onClick={handleShare}
                    disabled={!displayImage}
                    className="flex flex-col items-center gap-2 py-4 bg-ink-800 hover:bg-ink-700 
                      rounded-xl transition-colors disabled:opacity-50"
                  >
                    <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <Share2 className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-xs text-ink-300">系统分享</span>
                  </button>
                </div>

                {/* 社交平台 */}
                <div className="pt-3 border-t border-ink-700">
                  <h3 className="text-sm text-ink-400 mb-3">分享到</h3>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const text = encodeURIComponent(`我在体验「${experienceName}」非遗可视化，快来感受非物质文化遗产的魅力！`)
                        window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(window.location.href)}`, '_blank')
                        recordShare()
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#1DA1F2]/20 
                        hover:bg-[#1DA1F2]/30 text-[#1DA1F2] rounded-xl transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </button>
                    
                    <button
                      onClick={() => {
                        const text = `我在体验「${experienceName}」非遗可视化，快来感受非物质文化遗产的魅力！${window.location.href}`
                        navigator.clipboard.writeText(text)
                        setCopied(true)
                        setTimeout(() => setCopied(false), 2000)
                        recordShare()
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#07C160]/20 
                        hover:bg-[#07C160]/30 text-[#07C160] rounded-xl transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      微信
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 底部提示 */}
            <div className="p-4 bg-ink-800/50 text-center">
              <p className="text-xs text-ink-500">
                分享您的创作，让更多人了解非物质文化遗产
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// 分享按钮组件（用于体验页面）
interface ShareButtonProps {
  onClick: () => void
  className?: string
}

export function ShareButton({ onClick, className = '' }: ShareButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2 bg-heritage-500 hover:bg-heritage-600 
        text-white rounded-full shadow-lg transition-colors ${className}
      `}
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">分享作品</span>
    </motion.button>
  )
}
