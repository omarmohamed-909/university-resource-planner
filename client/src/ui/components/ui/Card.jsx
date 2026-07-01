import { cn } from '../../lib/utils'

export default function Card({ children, className, hover, onClick, ...props }) {
  const isClickable = typeof onClick === 'function'
  return (
    <div
      className={cn(
        'bg-white rounded-lg border border-slate-200/80 transition-all duration-200 shadow-[0_1px_2px_rgba(15,23,42,0.04)]',
        hover && 'hover:shadow-[0_10px_24px_rgba(15,23,42,0.08)] hover:border-slate-300',
        isClickable && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/20 focus-visible:ring-offset-2',
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={isClickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e) } } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5', className)}>
      {children}
    </div>
  )
}

export function CardContent({ children, className }) {
  return <div className={cn('p-6', className)}>{children}</div>
}

export function CardFooter({ children, className }) {
  return <div className={cn('px-6 pb-6 pt-0', className)}>{children}</div>
}

export function CardTitle({ children, className }) {
  return <h3 className={cn('text-base font-bold text-slate-950', className)}>{children}</h3>
}

export function CardDescription({ children, className }) {
  return <p className={cn('text-sm text-slate-500 mt-1 leading-6', className)}>{children}</p>
}
