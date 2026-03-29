import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          {
            'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500':
              variant === 'default',
            'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus-visible:ring-blue-500':
              variant === 'outline',
            'text-gray-600 hover:bg-gray-100 focus-visible:ring-gray-500':
              variant === 'ghost',
            'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500':
              variant === 'destructive',
            'text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500':
              variant === 'link',
          },
          {
            'h-10 px-4 py-2 text-sm': size === 'default',
            'h-8 px-3 py-1 text-xs': size === 'sm',
            'h-12 px-8 py-3 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }