import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   EmptyState  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   Consistent empty state for cards, tables, and full pages.

   Usage:
   <EmptyState
     icon={DoorOpen}
     title="No halls yet"
     description="Add your first hall to get started."
     action={<Button onClick={addHall}>Add Hall</Button>}
   />
   ───────────────────────────────────────────────────────────── */

const sizes = {
  sm: { wrapper: 'py-8',  icon: 'w-12 h-12 rounded-xl',  iconSize: 'w-5 h-5', title: 'text-sm',   desc: 'text-xs' },
  md: { wrapper: 'py-12', icon: 'w-14 h-14 rounded-2xl', iconSize: 'w-6 h-6', title: 'text-base', desc: 'text-sm' },
  lg: { wrapper: 'py-20', icon: 'w-16 h-16 rounded-2xl', iconSize: 'w-7 h-7', title: 'text-lg',   desc: 'text-sm' },
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  size = 'md',
  className,
}) {
  const cfg = sizes[size] || sizes.md

  return (
    <div className={cn('flex flex-col items-center justify-center text-center animate-fade-in', cfg.wrapper, className)}>
      {Icon && (
        <div className="relative mb-3">
          {/* Soft halo behind icon */}
          <div className="absolute inset-0 rounded-2xl bg-primary-500/5 blur-xl" />
          <div className={cn('relative flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/80 dark:to-slate-800/40 text-muted ring-1 ring-border', cfg.icon)}>
            <Icon className={cfg.iconSize} strokeWidth={1.8} />
          </div>
        </div>
      )}
      {title && (
        <p className={cn('font-semibold text-title text-balance', cfg.title)}>{title}</p>
      )}
      {description && (
        <p className={cn('text-muted mt-1.5 max-w-sm leading-relaxed text-pretty', cfg.desc)}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-5">
          {action}
        </div>
      )}
    </div>
  )
}
