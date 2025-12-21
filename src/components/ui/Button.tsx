import { forwardRef, ButtonHTMLAttributes } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-lg hover:shadow-xl focus:ring-primary-500',
        heritage: 'bg-gradient-to-r from-heritage-500 to-heritage-600 text-white hover:from-heritage-600 hover:to-heritage-700 shadow-heritage hover:shadow-xl focus:ring-heritage-500',
        nature: 'bg-gradient-to-r from-nature-500 to-nature-600 text-white hover:from-nature-600 hover:to-nature-700 shadow-lg hover:shadow-xl focus:ring-nature-500',
        outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
        'outline-heritage': 'border-2 border-heritage-500 text-heritage-600 hover:bg-heritage-50 focus:ring-heritage-500',
        ghost: 'text-ink-600 hover:bg-ink-100 focus:ring-ink-500',
        link: 'text-primary-600 underline-offset-4 hover:underline focus:ring-primary-500',
        glass: 'glass-card text-ink-700 hover:bg-white/90 focus:ring-primary-500',
        danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500',
        // 生态主题按钮
        eco: 'bg-gradient-to-r from-eco-500 to-eco-600 text-white hover:from-eco-600 hover:to-eco-700 shadow-eco hover:shadow-eco-hover focus:ring-eco-500',
        'eco-outline': 'border-2 border-eco-500 text-eco-600 hover:bg-eco-50 focus:ring-eco-500',
        green: 'bg-gradient-to-r from-eco-400 to-eco-500 text-white hover:from-eco-500 hover:to-eco-600 shadow-lg hover:shadow-xl focus:ring-eco-500',
        carbon: 'bg-gradient-to-r from-carbon-500 to-carbon-600 text-white hover:from-carbon-600 hover:to-carbon-700 shadow-carbon hover:shadow-lg focus:ring-carbon-500',
        // 故宫红主题按钮（非遗文化）
        'heritage-red': 'bg-gradient-to-r from-heritage-500 to-heritage-600 text-white hover:from-heritage-600 hover:to-heritage-700 shadow-heritage hover:shadow-heritage-hover focus:ring-heritage-500',
        'heritage-red-outline': 'border-2 border-heritage-500 text-heritage-600 hover:bg-heritage-50 focus:ring-heritage-500',
        // 红绿融合主题按钮
        'heritage-eco': 'bg-heritage-eco-gradient text-white hover:opacity-90 shadow-heritage-eco hover:shadow-lg focus:ring-heritage-500',
        'heritage-eco-outline': 'border-2 border-heritage-500 text-heritage-600 hover:bg-gradient-to-r hover:from-heritage-50 hover:to-eco-50 focus:ring-heritage-500',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-base',
        lg: 'h-14 px-8 text-lg',
        xl: 'h-16 px-10 text-xl',
        icon: 'h-10 w-10',
        'icon-lg': 'h-12 w-12',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, asChild = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            加载中...
          </span>
        ) : (
          children
        )}
      </Comp>
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
