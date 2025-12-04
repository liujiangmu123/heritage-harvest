import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-ink-100 text-ink-800',
        primary: 'bg-primary-100 text-primary-800',
        heritage: 'bg-heritage-100 text-heritage-800 border border-heritage-200',
        nature: 'bg-nature-100 text-nature-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        outline: 'border border-ink-200 text-ink-600',
        // 稀有度
        common: 'bg-ink-100 text-ink-600',
        rare: 'bg-blue-100 text-blue-700 border border-blue-200',
        epic: 'bg-purple-100 text-purple-700 border border-purple-200',
        legendary: 'bg-gradient-to-r from-heritage-100 to-primary-100 text-heritage-800 border border-heritage-300',
        // 非遗级别
        national: 'bg-red-50 text-red-700 border border-red-200',
        provincial: 'bg-orange-50 text-orange-700 border border-orange-200',
        municipal: 'bg-blue-50 text-blue-700 border border-blue-200',
        county: 'bg-green-50 text-green-700 border border-green-200',
      },
      size: {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'

export { Badge, badgeVariants }
