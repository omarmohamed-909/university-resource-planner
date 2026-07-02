import { cn } from '../../lib/utils'

const variants = {
  default: 'bg-slate-100 text-slate-700 ring-slate-200',
  primary: 'bg-blue-50 text-blue-700 ring-blue-100',
  success: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  warning: 'bg-amber-50 text-amber-700 ring-amber-100',
  danger: 'bg-red-50 text-red-700 ring-red-100',
  info: 'bg-sky-50 text-sky-700 ring-sky-100',
  purple: 'bg-violet-50 text-violet-700 ring-violet-100',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-xs',
  lg: 'px-3 py-1 text-sm',
  xl: 'px-4 py-1.5 text-sm',
}

export default function Badge({ children, variant = 'default', size = 'md', dot, className }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-md font-semibold ring-1 transition-all',
      variants[variant],
      sizes[size],
      className
    )}>
      {dot && (
        <span className={cn(
          'w-1.5 h-1.5 rounded-full',
          variant === 'success' && 'bg-success-500',
          variant === 'warning' && 'bg-warning-500',
          variant === 'danger' && 'bg-danger-500',
          variant === 'primary' && 'bg-primary-500',
          variant === 'info' && 'bg-info-500',
          variant === 'purple' && 'bg-purple-500',
          variant === 'default' && 'bg-slate-400'
        )} />
      )}
      <span className="pe-1.5">{children}</span>
    </span>
  )
}
