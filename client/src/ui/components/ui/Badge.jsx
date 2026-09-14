import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Badge Variants  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   Each variant has a `soft` (default) and `solid` style.
   Soft uses tinted backgrounds with matching text colors + 1px ring-inset.
   Solid uses saturated backgrounds with white text.
   All variants are theme-aware (light + dark).
   Added: subtle inner-top highlight on solid variants. */
const softVariants = {
  default:  'bg-slate-100 text-slate-700 ring-slate-200/70 dark:bg-slate-800/60 dark:text-slate-300 dark:ring-slate-700/60',
  primary:  'bg-primary-50 text-primary-800 ring-primary-200/70 dark:bg-primary-500/15 dark:text-primary-300 dark:ring-primary-500/25',
  success:  'bg-emerald-50 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/25',
  warning:  'bg-amber-50 text-amber-700 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-500/25',
  danger:   'bg-rose-50 text-rose-700 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-500/25',
  info:     'bg-sky-50 text-sky-700 ring-sky-200/70 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-500/25',
  purple:   'bg-violet-50 text-violet-700 ring-violet-200/70 dark:bg-violet-500/15 dark:text-violet-300 dark:ring-violet-500/25',
}

const solidVariants = {
  default:  'bg-slate-700 text-white ring-slate-700/50',
  primary:  'bg-primary-600 text-white ring-primary-600/50',
  success:  'bg-emerald-600 text-white ring-emerald-600/50',
  warning:  'bg-amber-500 text-white ring-amber-500/50',
  danger:   'bg-rose-600 text-white ring-rose-600/50',
  info:     'bg-sky-600 text-white ring-sky-600/50',
  purple:   'bg-violet-600 text-white ring-violet-600/50',
}

const dotColors = {
  default:  'bg-slate-500',
  primary:  'bg-primary-500',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-rose-500',
  info:     'bg-sky-500',
  purple:   'bg-violet-500',
}

const sizes = {
  xs: 'px-2 py-0.5 text-[11px] gap-1',
  sm: 'px-2.5 py-0.5 text-xs gap-1.5',
  md: 'px-3 py-1 text-xs gap-1.5',
  lg: 'px-3.5 py-1.5 text-sm gap-2',
}

const dotSizes = {
  xs: 'w-1 h-1',
  sm: 'w-1.5 h-1.5',
  md: 'w-1.5 h-1.5',
  lg: 'w-2 h-2',
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  solid = false,
  pulse = false,
  className,
}) {
  const variants = solid ? solidVariants : softVariants

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold rounded-md ring-1 ring-inset transition-colors whitespace-nowrap',
        'leading-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {dot && (
        <span className="relative flex flex-shrink-0">
          {pulse && (
            <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 animate-ping', dotColors[variant])} />
          )}
          <span className={cn('relative inline-flex rounded-full', dotSizes[size], dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  )
}
