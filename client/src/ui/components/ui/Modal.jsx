import { useEffect, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '../../lib/utils'

export default function Modal({ isOpen, onClose, title, description, children, size = 'md', footer, headerColor }) {
  const { t } = useTranslation()
  const panelRef = useRef(null)

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      // التركيز على لوحة الحوار عند الفتح فقط وليس مع كل render
      setTimeout(() => panelRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-desc' : undefined}
        tabIndex={-1}
        className={cn(
          'relative bg-white rounded-lg shadow-[0_25px_50px_rgba(15,23,42,0.25)] w-full overflow-hidden animate-slide-up border border-white/70 focus:outline-none',
          sizes[size]
        )}
      >
        {headerColor && (
          <div className={cn('h-1.5', headerColor)} />
        )}
        {(title || description) && (
          <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
            <div>
              {title && <h2 id="modal-title" className="text-lg font-bold text-slate-950">{title}</h2>}
              {description && <p id="modal-desc" className="text-sm text-slate-500 mt-1">{description}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg p-1.5 transition-colors cursor-pointer"
              aria-label={t('common.close')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
        {footer && (
          <div className="px-6 pb-6 pt-0">{footer}</div>
        )}
      </div>
    </div>
  )
}
