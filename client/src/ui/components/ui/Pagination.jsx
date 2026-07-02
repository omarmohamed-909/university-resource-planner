import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

export default function Pagination({ page, pages, total, onPageChange }) {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.dir() === 'rtl'

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

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft
  const NextIcon = isRtl ? ChevronLeft : ChevronRight

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-label">
        {t('pagination.pageInfo', { page, pages, total })}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className={cn(
            'p-2 rounded-lg transition-colors duration-200',
            page <= 1
              ? 'text-muted cursor-not-allowed'
              : 'text-body hover:bg-hover cursor-pointer'
          )}
          aria-label={t('pagination.previous')}
        >
          <PrevIcon className="w-4 h-4" />
        </button>

        {getRange().map((item, i) =>
          item === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-muted text-sm">...</span>
          ) : (
            <button
              key={item}
              onClick={() => onPageChange(item)}
              className={cn(
                'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',
                item === page
                  ? 'bg-primary-btn text-primary-btn-text shadow-sm'
                  : 'text-body hover:bg-hover'
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
              ? 'text-muted cursor-not-allowed'
              : 'text-body hover:bg-hover cursor-pointer'
          )}
          aria-label={t('pagination.next')}
        >
          <NextIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
