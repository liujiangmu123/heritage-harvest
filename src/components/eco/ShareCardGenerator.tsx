/**
 * 分享卡片生成器组件
 * 生成包含用户徽章、积分、生态影响摘要的分享卡片
 */

import { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Download, 
  Leaf, 
  Award, 
  TreeDeciduous,
  QrCode,
  Copy,
  Check
} from 'lucide-react'
import { useGreenPointsStore } from '@/store/greenPointsStore'
import { useCarbonAccountStore } from '@/store/carbonAccountStore'
import { useEcoAchievementStore } from '@/store/ecoAchievementStore'
import { ECO_LEVELS, getRandomEcoMessage } from '@/types/eco'
import { formatCarbonValue } from '@/utils/carbonCalculator'
import { addSharePoints, POINTS_REWARDS } from '@/store/greenPointsStore'
import { cn } from '@/lib/utils'

interface ShareCardGeneratorProps {
  variant?: 'default' | 'polaroid' | 'achievement'
  customMessage?: string
  onShare?: () => void
  className?: string
}

export default function ShareCardGenerator({
  variant: _variant = 'default',
  customMessage,
  onShare,
  className
}: ShareCardGeneratorProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [ecoMessage] = useState(customMessage || getRandomEcoMessage())

  const { totalPoints, currentLevel } = useGreenPointsStore()
  const { totalCarbonSaved, getEquivalentMetrics } = useCarbonAccountStore()
  const { achievements } = useEcoAchievementStore()

  const levelInfo = ECO_LEVELS[currentLevel]
  const equivalent = getEquivalentMetrics()
  const unlockedAchievements = achievements.filter(a => a.unlocked)

  // 生成分享图片
  const generateImage = useCallback(async () => {
    if (!cardRef.current) return null
    
    setIsGenerating(true)
    try {
      // 动态导入 html2canvas
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      })
      return canvas.toDataURL('image/png')
    } catch (error) {
      console.error('生成图片失败:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }, [])

  // 下载图片
  const handleDownload = useCallback(async () => {
    const dataUrl = await generateImage()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `乡遗识-生态卡片-${Date.now()}.png`
      link.href = dataUrl
      link.click()
      
      // 奖励积分
      addSharePoints('下载分享卡片', POINTS_REWARDS.share_social)
    }
  }, [generateImage])

  // 分享
  const handleShare = useCallback(async () => {
    const dataUrl = await generateImage()
    if (dataUrl && navigator.share) {
      try {
        const blob = await (await fetch(dataUrl)).blob()
        const file = new File([blob], '乡遗识-生态卡片.png', { type: 'image/png' })
        await navigator.share({
          title: '乡遗识 - 我的生态足迹',
          text: ecoMessage,
          files: [file]
        })
        addSharePoints('分享生态卡片', POINTS_REWARDS.share_social)
        onShare?.()
      } catch (error) {
        console.error('分享失败:', error)
      }
    } else {
      // 降级处理：复制链接
      handleCopyLink()
    }
  }, [generateImage, ecoMessage, onShare])

  // 复制链接
  const handleCopyLink = useCallback(() => {
    const shareText = `${ecoMessage}\n\n我在乡遗识累计减碳 ${formatCarbonValue(totalCarbonSaved)}，相当于种植 ${equivalent.treesPlanted} 棵树！\n\n来一起探索生态智慧吧 👉 ${window.location.origin}`
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addSharePoints('复制分享链接', Math.floor(POINTS_REWARDS.share_social / 2))
  }, [ecoMessage, totalCarbonSaved, equivalent.treesPlanted])

  return (
    <div className={cn('space-y-4', className)}>
      {/* 分享卡片预览 */}
      <div 
        ref={cardRef}
        className="bg-gradient-to-br from-eco-50 via-white to-heritage-50 rounded-2xl p-6 border border-eco-200 shadow-lg"
      >
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-heritage-500 to-primary-600 flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-ink-800">乡遗识</h3>
              <p className="text-xs text-ink-500">探寻乡村生态智慧</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl">{levelInfo.icon}</p>
            <p className="text-xs text-ink-500">{levelInfo.name}</p>
          </div>
        </div>

        {/* 生态寄语 */}
        <div className="bg-white/80 rounded-xl p-4 mb-6 text-center">
          <p className="text-lg text-ink-700 font-medium">{ecoMessage}</p>
        </div>

        {/* 数据展示 */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-eco-100/80 rounded-xl p-3 text-center">
            <Award className="w-6 h-6 text-eco-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-eco-700">{totalPoints}</p>
            <p className="text-xs text-ink-500">绿色积分</p>
          </div>
          <div className="bg-carbon-100/80 rounded-xl p-3 text-center">
            <Leaf className="w-6 h-6 text-carbon-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-carbon-700">
              {totalCarbonSaved >= 1000 
                ? `${(totalCarbonSaved / 1000).toFixed(1)}kg` 
                : `${totalCarbonSaved}g`}
            </p>
            <p className="text-xs text-ink-500">碳减排</p>
          </div>
          <div className="bg-bamboo-100/80 rounded-xl p-3 text-center">
            <TreeDeciduous className="w-6 h-6 text-bamboo-600 mx-auto mb-1" />
            <p className="text-xl font-bold text-bamboo-700">{equivalent.treesPlanted}</p>
            <p className="text-xs text-ink-500">等效种树</p>
          </div>
        </div>

        {/* 成就展示 */}
        {unlockedAchievements.length > 0 && (
          <div className="mb-6">
            <p className="text-xs text-ink-500 mb-2">已获得成就</p>
            <div className="flex flex-wrap gap-2">
              {unlockedAchievements.slice(0, 6).map((achievement) => (
                <span
                  key={achievement.id}
                  className="px-2 py-1 bg-heritage-100 rounded-full text-xs text-heritage-700 flex items-center gap-1"
                >
                  <span>{achievement.icon}</span>
                  {achievement.name}
                </span>
              ))}
              {unlockedAchievements.length > 6 && (
                <span className="px-2 py-1 bg-ink-100 rounded-full text-xs text-ink-500">
                  +{unlockedAchievements.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 底部 */}
        <div className="flex items-center justify-between pt-4 border-t border-eco-200">
          <div className="flex items-center gap-2">
            <QrCode className="w-8 h-8 text-ink-300" />
            <div className="text-xs text-ink-400">
              <p>扫码体验</p>
              <p>乡遗识</p>
            </div>
          </div>
          <p className="text-xs text-ink-400">
            {new Date().toLocaleDateString('zh-CN')}
          </p>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex gap-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex-1 py-3 bg-eco-500 hover:bg-eco-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
          {isGenerating ? '生成中...' : '保存图片'}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          disabled={isGenerating}
          className="flex-1 py-3 bg-heritage-500 hover:bg-heritage-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
        >
          <Share2 className="w-5 h-5" />
          分享
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleCopyLink}
          className="py-3 px-4 bg-ink-100 hover:bg-ink-200 text-ink-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
          {copied ? <Check className="w-5 h-5 text-eco-500" /> : <Copy className="w-5 h-5" />}
        </motion.button>
      </div>

      {/* 提示 */}
      <p className="text-xs text-ink-400 text-center">
        分享可获得 {POINTS_REWARDS.share_social} 绿色积分
      </p>
    </div>
  )
}
