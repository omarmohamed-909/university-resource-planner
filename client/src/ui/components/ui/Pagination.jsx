import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Pagination({ page, pages, total, onPageChange }) {
  if (pages <= 1) return null

  function getRange() {
    const delta = 2
    const range = []
    const start = Math.max(2, page - delta)
    const end = Math.min(pages - 1, page + delta)

    range.push(1)
    if (start > 2) range.push('...')
    for (let i = start; i <= end; i++) range.push(i)
    if (end < pages - 1) range.push('...')
    if (pages > 1) range.push(pages)

    return range
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-slate-500">
        الصفحة {page} من {pages} ({total} إجمالاً)
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            page <= 1
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
          )}
          aria-label="الصفحة السابقة"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {getRange().map((item, i) =>
          item === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-slate-400 text-sm">...</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={cn(
                'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                item === page
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              )}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            page >= pages
              ? 'text-slate-300 cursor-not-allowed'
              : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
          )}
          aria-label="الصفحة التالية"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
