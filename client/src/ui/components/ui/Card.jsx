import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Card System  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   - radius-xl (16px) for the card body
   - shadow-sm at rest, shadow-lg on hover (when `hover` is set)
   - --spacing-card (24px) for inner padding (card-pad utility)
   - Subtle inset ring on top edge for premium feel
   - `tone` prop: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple'
     — adds a soft tinted top accent bar + subtle bg glow
   - `as` prop for semantic HTML (article, section, etc.)
   ───────────────────────────────────────────────────────────── */

const tones = {
  default: '',
  primary: 'before:bg-primary-500/70',
  success: 'before:bg-emerald-500/70',
  warning: 'before:bg-amber-500/70',
  danger:  'before:bg-rose-500/70',
  info:    'before:bg-sky-500/70',
  purple:  'before:bg-violet-500/70',
}

export default function Card({
  children,
  className,
  hover = false,
  onClick,
  padding = 'default',
  tone,
  as: Tag = 'div',
  ...props
}) {
  const isClickable = typeof onClick === 'function'
  const hasTone = tone && tone !== 'default'

  return (
    <Tag
      className={cn(
        'relative bg-surface rounded-xl border border-border transition-[background-color,border-color] duration-200',
        hover && 'hover:border-slate-400 hover:bg-hover/35',
        isClickable && 'cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        padding === 'none' && 'p-0',
        hasTone && tones[tone],
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      {...props}
    >
      {hasTone && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-0 inset-x-0 h-[2px] rounded-t-xl opacity-80',
            tones[tone]?.replace('before:', '')
          )}
        />
      )}
      {children}
    </Tag>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-4 border-b border-border',
        'px-5 py-4 md:px-6 md:py-5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardContent({ children, className, padding = 'default' }) {
  return (
    <div
      className={cn(
        padding === 'default' && 'p-5 md:p-6',
        padding === 'sm' && 'p-4 md:p-5',
        padding === 'none' && 'p-0',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-border',
        'px-5 py-4 md:px-6 md:py-5',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3
      className={cn(
        'text-base font-bold text-title tracking-tight leading-tight',
        className
      )}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p
      className={cn(
        'text-sm text-label mt-1 leading-relaxed',
        className
      )}
    >
      {children}
    </p>
  )
}

/* Optional: a divided section inside a card (for lists) */
export function CardSection({ children, className, divider = true }) {
  return (
    <div
      className={cn(
        'px-5 py-4 md:px-6 md:py-5',
        divider && 'border-b border-border last:border-b-0',
        className
      )}
    >
      {children}
    </div>
  )
}
