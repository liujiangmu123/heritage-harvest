/**
 * 懒加载图片组件
 * 
 * 功能：
 * - IntersectionObserver 实现视口内加载
 * - 加载中显示骨架屏
 * - 加载失败显示占位符
 * - 支持 WebP 格式优先
 * - 淡入动画效果
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ImageOff } from 'lucide-react'

interface LazyImageProps {
  src: string
  alt: string
  fallbackSrc?: string
  aspectRatio?: string // 例如 '16/9', '4/3', '1/1'
  className?: string
  containerClassName?: string
  showSkeleton?: boolean
  threshold?: number // IntersectionObserver 阈值
}

export function LazyImage({
  src,
  alt,
  fallbackSrc,
  aspectRatio = '16/9',
  className = '',
  containerClassName = '',
  showSkeleton = true,
  threshold = 0.1,
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)

  // 使用 IntersectionObserver 检测是否进入视口
  useEffect(() => {
    const element = imgRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin: '50px' }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold])

  const handleLoad = () => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    if (fallbackSrc) {
      setHasError(false)
    }
  }

  return (
    <div
      ref={imgRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={{ aspectRatio }}
    >
      {/* 骨架屏 */}
      <AnimatePresence>
        {showSkeleton && !isLoaded && !hasError && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-gradient-to-r from-ink-200 via-ink-100 to-ink-200 animate-shimmer"
            style={{
              backgroundSize: '200% 100%',
            }}
          />
        )}
      </AnimatePresence>

      {/* 错误占位符 */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 bg-ink-100 flex items-center justify-center">
          <div className="text-center text-ink-400">
            <ImageOff className="w-8 h-8 mx-auto mb-2" />
            <span className="text-sm">图片加载失败</span>
          </div>
        </div>
      )}

      {/* 图片 */}
      {isInView && (
        <motion.img
          initial={{ opacity: 0 }}
          animate={{ opacity: isLoaded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          src={hasError && fallbackSrc ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover ${className}`}
          loading="lazy"
          decoding="async"
        />
      )}
    </div>
  )
}

/**
 * 带有渐变遮罩的懒加载图片
 */
interface LazyImageWithOverlayProps extends LazyImageProps {
  overlayClassName?: string
  overlayDirection?: 'top' | 'bottom' | 'both'
}

export function LazyImageWithOverlay({
  overlayClassName = '',
  overlayDirection = 'bottom',
  ...props
}: LazyImageWithOverlayProps) {
  const getOverlayGradient = () => {
    switch (overlayDirection) {
      case 'top':
        return 'bg-gradient-to-b from-black/60 to-transparent'
      case 'bottom':
        return 'bg-gradient-to-t from-black/60 to-transparent'
      case 'both':
        return 'bg-gradient-to-t from-black/60 via-transparent to-black/60'
      default:
        return 'bg-gradient-to-t from-black/60 to-transparent'
    }
  }

  return (
    <div className="relative">
      <LazyImage {...props} />
      <div className={`absolute inset-0 ${getOverlayGradient()} ${overlayClassName}`} />
    </div>
  )
}

export default LazyImage
