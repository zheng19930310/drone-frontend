import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', ...props }, ref) => {
    const variantMap = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      destructive: 'btn-destructive',
      outline: 'btn-outline',
      ghost: 'btn-ghost',
    }
    const sizeMap = { sm: 'btn-sm', default: 'btn-default', lg: 'btn-lg' }

    return (
      <button
        ref={ref}
        className={cn(variantMap[variant], sizeMap[size], className)}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button }
