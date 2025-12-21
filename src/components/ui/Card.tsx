import { forwardRef, HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'heritage' | 'glass' | 'nft' | 'eco' | 'carbon' | 'heritage-eco' | 'pledge' | 'achievement' | 'heritage-red' | 'experience-entry' | 'eco-module' | 'seasonal'
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-shadow duration-300',
      heritage: 'heritage-card',
      glass: 'glass-card rounded-2xl',
      nft: 'nft-card',
      // 生态主题卡片
      eco: 'eco-card',
      carbon: 'carbon-card',
      'heritage-eco': 'heritage-eco-card',
      pledge: 'pledge-card',
      achievement: 'achievement-card',
      // 故宫红主题卡片（非遗文化）
      'heritage-red': 'heritage-card-red',
      // 非遗体验入口卡片（故宫红为主）
      'experience-entry': 'experience-entry-card',
      // 生态功能模块卡片（生态绿为主）
      'eco-module': 'eco-module-card',
      // 季节活动卡片
      seasonal: 'seasonal-card',
    }

    return (
      <div
        ref={ref}
        className={cn(variants[variant], className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pb-0', className)}
      {...props}
    />
  )
)

CardHeader.displayName = 'CardHeader'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6', className)}
      {...props}
    />
  )
)

CardContent.displayName = 'CardContent'

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('p-6 pt-0 flex items-center', className)}
      {...props}
    />
  )
)

CardFooter.displayName = 'CardFooter'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn('text-xl font-bold text-ink-900', className)}
      {...props}
    />
  )
)

CardTitle.displayName = 'CardTitle'

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn('text-sm text-ink-500 mt-1', className)}
      {...props}
    />
  )
)

CardDescription.displayName = 'CardDescription'

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription }
