/**
 * 作品截图与分享功能 Hook
 * 支持Canvas截图、二维码生成、社交分享
 */

import { useCallback, useState } from 'react'

// 分享卡片配置
interface ShareCardConfig {
  title: string
  subtitle?: string
  experienceName: string
  userName?: string
  timestamp?: boolean
  qrCodeUrl?: string
  watermark?: boolean
}

// 分享结果
interface ShareResult {
  success: boolean
  imageUrl?: string
  error?: string
}

export function useScreenshot() {
  const [isCapturing, setIsCapturing] = useState(false)
  const [lastCapture, setLastCapture] = useState<string | null>(null)

  // 截取指定元素
  const captureElement = useCallback(async (
    element: HTMLElement | null,
    options?: { scale?: number; backgroundColor?: string }
  ): Promise<string | null> => {
    if (!element) return null
    setIsCapturing(true)

    try {
      // 动态导入 html2canvas (需要安装)
      // 这里使用原生Canvas API实现基础截图
      const canvas = document.createElement('canvas')
      const rect = element.getBoundingClientRect()
      const scale = options?.scale || window.devicePixelRatio || 1
      
      canvas.width = rect.width * scale
      canvas.height = rect.height * scale
      
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error('Cannot get canvas context')
      
      ctx.scale(scale, scale)
      ctx.fillStyle = options?.backgroundColor || '#ffffff'
      ctx.fillRect(0, 0, rect.width, rect.height)

      // 如果是Canvas元素，直接复制
      if (element instanceof HTMLCanvasElement) {
        ctx.drawImage(element, 0, 0, rect.width, rect.height)
      }

      const dataUrl = canvas.toDataURL('image/png')
      setLastCapture(dataUrl)
      setIsCapturing(false)
      return dataUrl
    } catch (error) {
      console.error('Screenshot failed:', error)
      setIsCapturing(false)
      return null
    }
  }, [])

  // 截取WebGL Canvas (Three.js场景)
  const captureWebGLCanvas = useCallback(async (
    canvas: HTMLCanvasElement | null
  ): Promise<string | null> => {
    if (!canvas) return null
    setIsCapturing(true)

    try {
      // WebGL需要在渲染后立即截图
      const dataUrl = canvas.toDataURL('image/png')
      setLastCapture(dataUrl)
      setIsCapturing(false)
      return dataUrl
    } catch (error) {
      console.error('WebGL screenshot failed:', error)
      setIsCapturing(false)
      return null
    }
  }, [])

  // 生成分享卡片
  const generateShareCard = useCallback(async (
    screenshotUrl: string,
    config: ShareCardConfig
  ): Promise<string | null> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    // 卡片尺寸
    const cardWidth = 400
    const cardHeight = 600
    canvas.width = cardWidth
    canvas.height = cardHeight

    // 背景渐变
    const gradient = ctx.createLinearGradient(0, 0, cardWidth, cardHeight)
    gradient.addColorStop(0, '#8B4513')
    gradient.addColorStop(1, '#D2691E')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, cardWidth, cardHeight)

    // 装饰边框
    ctx.strokeStyle = '#FFD700'
    ctx.lineWidth = 4
    ctx.strokeRect(10, 10, cardWidth - 20, cardHeight - 20)

    // 标题
    ctx.fillStyle = '#FFD700'
    ctx.font = 'bold 28px "Microsoft YaHei", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(config.title, cardWidth / 2, 50)

    // 副标题
    if (config.subtitle) {
      ctx.font = '16px "Microsoft YaHei", sans-serif'
      ctx.fillStyle = '#FFF8DC'
      ctx.fillText(config.subtitle, cardWidth / 2, 80)
    }

    // 加载并绘制截图
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        // 截图区域
        const imgWidth = cardWidth - 60
        const imgHeight = 280
        const imgX = 30
        const imgY = 100

        // 白色背景
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(imgX - 5, imgY - 5, imgWidth + 10, imgHeight + 10)
        
        // 绘制截图
        ctx.drawImage(img, imgX, imgY, imgWidth, imgHeight)

        // 体验名称
        ctx.fillStyle = '#FFF8DC'
        ctx.font = 'bold 20px "Microsoft YaHei", sans-serif'
        ctx.fillText(`「${config.experienceName}」`, cardWidth / 2, imgY + imgHeight + 40)

        // 用户信息
        if (config.userName) {
          ctx.font = '14px "Microsoft YaHei", sans-serif'
          ctx.fillText(`创作者: ${config.userName}`, cardWidth / 2, imgY + imgHeight + 70)
        }

        // 时间戳
        if (config.timestamp) {
          const date = new Date().toLocaleString('zh-CN')
          ctx.font = '12px "Microsoft YaHei", sans-serif'
          ctx.fillStyle = '#DEB887'
          ctx.fillText(date, cardWidth / 2, imgY + imgHeight + 95)
        }

        // 二维码占位 (实际项目中可用qrcode库生成)
        if (config.qrCodeUrl) {
          ctx.fillStyle = '#FFFFFF'
          ctx.fillRect(cardWidth / 2 - 40, cardHeight - 120, 80, 80)
          ctx.fillStyle = '#333'
          ctx.font = '10px "Microsoft YaHei", sans-serif'
          ctx.fillText('扫码体验', cardWidth / 2, cardHeight - 35)
        }

        // 水印
        if (config.watermark !== false) {
          ctx.fillStyle = 'rgba(255,255,255,0.5)'
          ctx.font = '12px "Microsoft YaHei", sans-serif'
          ctx.fillText('非遗可视化 Heritage Visualization', cardWidth / 2, cardHeight - 15)
        }

        const result = canvas.toDataURL('image/png')
        setLastCapture(result)
        resolve(result)
      }
      img.onerror = () => resolve(null)
      img.src = screenshotUrl
    })
  }, [])

  // 下载图片
  const downloadImage = useCallback((
    dataUrl: string,
    filename: string = 'heritage-creation.png'
  ) => {
    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  // 复制到剪贴板
  const copyToClipboard = useCallback(async (dataUrl: string): Promise<boolean> => {
    try {
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      return true
    } catch (error) {
      console.error('Copy to clipboard failed:', error)
      return false
    }
  }, [])

  // 社交分享 (Web Share API)
  const shareToSocial = useCallback(async (
    dataUrl: string,
    shareData: { title: string; text: string; url?: string }
  ): Promise<ShareResult> => {
    try {
      // 检查是否支持分享
      if (!navigator.share) {
        // 降级处理：复制链接
        if (shareData.url) {
          await navigator.clipboard.writeText(shareData.url)
          return { success: true, error: '已复制链接到剪贴板' }
        }
        return { success: false, error: '当前浏览器不支持分享功能' }
      }

      // 转换为文件
      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const file = new File([blob], 'heritage-share.png', { type: 'image/png' })

      await navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url,
        files: [file],
      })

      return { success: true, imageUrl: dataUrl }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { success: false, error: '分享已取消' }
      }
      return { success: false, error: error.message }
    }
  }, [])

  // 生成简单二维码 (基于Canvas)
  const generateSimpleQR = useCallback((text: string, size: number = 100): string => {
    // 简化版二维码（实际项目建议使用qrcode库）
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    // 白色背景
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, size, size)

    // 简单的格子图案作为占位
    ctx.fillStyle = '#000000'
    const cellSize = size / 10
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        if ((i + j) % 2 === 0 || (i < 3 && j < 3) || (i > 6 && j < 3) || (i < 3 && j > 6)) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize)
        }
      }
    }

    return canvas.toDataURL()
  }, [])

  return {
    isCapturing,
    lastCapture,
    captureElement,
    captureWebGLCanvas,
    generateShareCard,
    downloadImage,
    copyToClipboard,
    shareToSocial,
    generateSimpleQR,
  }
}
