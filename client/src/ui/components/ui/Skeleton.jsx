import { cn } from '../../lib/utils'

/**
 * Skeleton — يدعم استخدامَين:
 *   1. <Skeleton variant="text|title|avatar|card|table|badge" />   (الأصلي)
 *   2. <Skeleton type="card" count={6} />                          (متوافق مع الاستخدام الموجود)
 *   3. <Skeleton type="table" rows={5} />
 */
export default function Skeleton({ className, variant = 'text', type, count = 1, rows = 5 }) {
  // وضع type/count → SkeletonCard أو SkeletonTable
  if (type === 'card') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    )
  }
  if (type === 'table') {
    return <SkeletonTable rows={rows} />
  }

  const variants = {
    text: 'h-4 w-full',
    title: 'h-6 w-2/3',
    avatar: 'h-10 w-10 rounded-full',
    card: 'h-32 w-full rounded-lg',
    table: 'h-10 w-full',
    badge: 'h-6 w-20 rounded-full',
  }

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

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
      <Skeleton variant="title" />
      <Skeleton variant="text" />
      <Skeleton variant="text" className="w-3/4" />
      <div className="flex gap-2 pt-2">
        <Skeleton variant="badge" />
        <Skeleton variant="badge" />
      </div>
    </div>
  )
}

export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-3">
      <Skeleton variant="title" />
      <div className="border-t border-slate-100 pt-4 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/6" />
            <Skeleton className="h-4 w-1/6" />
          </div>
        ))}
      </div>
    </div>
  )
}
