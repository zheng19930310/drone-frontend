import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'destructive' | 'muted'
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantMap = {
    default: 'badge-default',
    success: 'badge-success',
    warning: 'badge-warning',
    destructive: 'badge-destructive',
    muted: 'badge-muted',
  }
  return <span className={cn(variantMap[variant], className)} {...props} />
}
