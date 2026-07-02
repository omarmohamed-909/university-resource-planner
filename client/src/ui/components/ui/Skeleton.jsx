import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Skeleton System
   ─────────────────────────────────────────────────────────────
   Use cases:
   1. <Skeleton variant="text|title|avatar|button|input|paragraph" />
      — single skeleton block, themed via .skeleton-shimmer
   2. <Skeleton type="card" count={6} />      — grid of card skeletons
   3. <Skeleton type="table" rows={5} />      — table skeleton
   4. <SkeletonCard />  /  <SkeletonTable />
   ───────────────────────────────────────────────────────────── */

const variants = {
  text:       'h-4 w-full rounded-md',
  title:      'h-6 w-2/3 rounded-md',
  subtitle:   'h-4 w-1/2 rounded-md',
  avatar:     'h-10 w-10 rounded-full',
  'avatar-sm':'h-8 w-8 rounded-full',
  'avatar-lg':'h-12 w-12 rounded-full',
  button:     'h-10 w-24 rounded-lg',
  input:      'h-10 w-full rounded-lg',
  badge:      'h-6 w-20 rounded-full',
  card:       'h-32 w-full rounded-xl',
  table:      'h-10 w-full rounded-md',
  paragraph:  'h-4 w-full rounded-md',
  icon:       'h-5 w-5 rounded-md',
}

export default function Skeleton({ className, variant = 'text', type, count = 1, rows = 5 }) {
  // ── Composite types (grid of cards / table) ──
  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  if (type === 'table') {
    return <SkeletonTable rows={rows} />
  }

  // ── Single skeleton block ──
  return (
    <div
      className={cn(
        'skeleton-shimmer',
        variants[variant] || variants.text,
        className
      )}
    />
  )
}

/* ─────────────────────────────────────────────────────────────
   SkeletonCard — a full card skeleton (header + lines + badges)
   ───────────────────────────────────────────────────────────── */
export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-border p-5 md:p-6 space-y-4">
      {/* Header row: title + badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2 flex-1">
          <Skeleton variant="title" />
          <Skeleton variant="subtitle" />
        </div>
        <Skeleton variant="avatar-sm" />
      </div>

      {/* Body lines */}
      <div className="space-y-2 pt-2">
        <Skeleton variant="text" />
        <Skeleton variant="text" className="w-4/5" />
        <Skeleton variant="text" className="w-3/4" />
      </div>

      {/* Footer: badges / actions */}
      <div className="flex gap-2 pt-3 border-t border-border/60">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" className="w-16" />
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SkeletonTable — a full table skeleton (header + N rows)
   ───────────────────────────────────────────────────────────── */
export function SkeletonTable({ rows = 5, columns = 4 }) {
  return (
    <div className="bg-surface rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-5 md:p-6">
        <Skeleton variant="title" className="w-1/4" />
      </div>

      {/* Rows */}
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 md:px-6 py-4">
            <Skeleton variant="avatar-sm" />
            {Array.from({ length: columns - 1 }).map((_, j) => (
              <Skeleton
                key={j}
                className={cn(
                  'h-4',
                  j === 0 && 'w-1/4',
                  j === 1 && 'w-1/3',
                  j === 2 && 'w-1/6',
                  j >= 3 && 'w-1/6'
                )}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────────────────────
   SkeletonList — generic list rows (for sidebar, notifications, etc.)
   ───────────────────────────────────────────────────────────── */
export function SkeletonList({ rows = 4, avatar = true }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {avatar && <Skeleton variant="avatar-sm" />}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}