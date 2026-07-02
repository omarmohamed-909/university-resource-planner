import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Modal Component  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   Features:
   - Renders into document.body via portal (escapes layout stacking)
   - 3 sizes: sm / md / lg / xl / 2xl
   - Variants: default / destructive (for confirm-delete dialogs)
   - Header (icon + title + description + close button)
   - Body (scrollable when content is tall)
   - Footer (cancel + confirm buttons)
   - Closes on: ESC key, backdrop click, close button
   - Focus trap friendly: autofocus first focusable on open
   - Locks body scroll while open
   - Accessible: role="dialog", aria-modal, aria-labelledby
   - Smoother entrance animation (scale + slide combined)
   ───────────────────────────────────────────────────────────── */

const sizes = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  '2xl':'max-w-4xl',
}

export default function Modal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  icon: Icon,
  children,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary', // primary | destructive | success
  size = 'md',
  hideFooter = false,
  closeOnBackdrop = true,
  className,
}) {
  const modalRef = useRef(null)

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return
    const original = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = original
    }
  }, [isOpen])

  // ESC key closes
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Autofocus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  if (!isOpen) return null

  const confirmBtnVariant = confirmVariant === 'destructive'
    ? 'destructive'
    : confirmVariant === 'success'
      ? 'success'
      : 'primary'

  return createPortal(
    <div
      className="fixed inset-0 z-[var(--z-modal-backdrop)] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-md animate-fade-in"
        onClick={closeOnBackdrop ? onClose : undefined}
      />

      {/* Modal panel */}
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'relative w-full bg-surface rounded-2xl border border-border',
          'shadow-[var(--shadow-2xl)]',
          'flex flex-col max-h-[calc(100vh-2rem)]',
          'animate-slide-up',
          'before:absolute before:inset-x-0 before:top-0 before:h-px before:rounded-t-2xl',
          'before:bg-gradient-to-r before:from-transparent before:via-black/[0.06] before:to-transparent',
          '[&:before]:content-[""]',
          sizes[size],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start gap-4 px-5 md:px-6 py-5 border-b border-border flex-shrink-0">
          {Icon && (
            <div
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                confirmVariant === 'destructive'
                  ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
                  : 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'
              )}
            >
              <Icon className="w-5 h-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            {title && (
              <h2
                id="modal-title"
                className="text-base font-bold text-title tracking-tight leading-tight"
              >
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-label leading-relaxed">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 -mt-1 -me-1 rounded-lg text-muted hover:text-title hover:bg-hover transition-colors cursor-pointer flex-shrink-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          {children}
        </div>

        {/* Footer */}
        {!hideFooter && (
          <div className="flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-border flex-shrink-0">
            <button
              onClick={onClose}
              className="inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg border border-border bg-surface text-body hover:bg-hover active:bg-active transition-all cursor-pointer"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={cn(
                'inline-flex items-center justify-center h-10 px-4 text-sm font-semibold rounded-lg shadow-sm transition-all cursor-pointer active:translate-y-px',
                'before:absolute before:inset-x-2 before:top-px before:h-px before:rounded-full before:bg-white/15 before:pointer-events-none',
                'relative',
                confirmBtnVariant === 'destructive' && 'bg-rose-600 text-white hover:bg-rose-700',
                confirmBtnVariant === 'success' && 'bg-emerald-600 text-white hover:bg-emerald-700',
                confirmBtnVariant === 'primary' && 'bg-primary-btn text-primary-btn-text hover:brightness-110'
              )}
            >
              {confirmText}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}
