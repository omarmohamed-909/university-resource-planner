import { forwardRef, useId } from 'react'
import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Input Component  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   Features:
   - Sizes: sm / md / lg
   - startIcon / endIcon (instead of single 'icon' that only sits at end)
   - Label + helper text + error message (with a11y wiring)
   - Focus ring uses primary color (theme-aware)
   - Smooth border + shadow transition on focus
   - Disabled + error states styled distinctly
   - Floating-ish accent: border darkens on hover, ring expands on focus
   ───────────────────────────────────────────────────────────── */

const sizes = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-10 px-3.5 text-sm',
  lg: 'h-11 px-4 text-base',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const iconPadding = {
  sm: { start: 'ps-9',   end: 'pe-9' },
  md: { start: 'ps-10',  end: 'pe-10' },
  lg: { start: 'ps-11',  end: 'pe-11' },
}

const Input = forwardRef(function Input(
  {
    className,
    error,
    helperText,
    label,
    startIcon,
    endIcon,
    size = 'md',
    id,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId
  const helperId = `${inputId}-helper`
  const errorId = `${inputId}-error`
  const hasError = Boolean(error)
  const hasHelper = Boolean(helperText) && !hasError

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-label mb-1.5 tracking-[0.06em]"
        >
          {label}
        </label>
      )}

      <div className="relative group/input">
        {startIcon && (
          <div
            className={cn(
              'absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-muted transition-colors',
              'group-focus-within/input:text-primary-500',
              hasError && 'text-rose-500 group-focus-within/input:text-rose-500'
            )}
            aria-hidden="true"
          >
            <span className={iconSizes[size]}>{startIcon}</span>
          </div>
        )}

        {endIcon && (
          <div
            className={cn(
              'absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-muted transition-colors',
              'group-focus-within/input:text-primary-500',
              hasError && 'text-rose-500 group-focus-within/input:text-rose-500'
            )}
            aria-hidden="true"
          >
            <span className={iconSizes[size]}>{endIcon}</span>
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(
            hasError && errorId,
            hasHelper && helperId,
            ariaDescribedBy
          )}
          className={cn(
            'w-full rounded-lg border bg-surface text-title placeholder:text-muted',
            'transition-[border-color,box-shadow,background-color] duration-200',
            'focus:outline-none focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500',
            'hover:border-active',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-hover/50',
            sizes[size],
            startIcon && iconPadding[size].start,
            endIcon && iconPadding[size].end,
            hasError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-border',
            className
          )}
          {...props}
        />
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
      {hasHelper && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
export default Input

/* ─────────────────────────────────────────────────────────────
   Textarea — shares the same API as Input
   ───────────────────────────────────────────────────────────── */
export const Textarea = forwardRef(function Textarea(
  {
    className,
    error,
    helperText,
    label,
    id,
    rows = 4,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const textareaId = id || generatedId
  const helperId = `${textareaId}-helper`
  const errorId = `${textareaId}-error`
  const hasError = Boolean(error)
  const hasHelper = Boolean(helperText) && !hasError

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-semibold text-label mb-1.5 tracking-[0.06em]"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        aria-invalid={hasError || undefined}
        aria-describedby={cn(
          hasError && errorId,
          hasHelper && helperId,
          ariaDescribedBy
        )}
        className={cn(
          'w-full rounded-lg border bg-surface px-3.5 py-2.5 text-sm text-title placeholder:text-muted',
          'transition-[border-color,box-shadow,background-color] duration-200 resize-y min-h-[80px]',
          'focus:outline-none focus:ring-4 focus:ring-primary-500/15 focus:border-primary-500',
          'hover:border-active',
          'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-hover/50',
          hasError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
            : 'border-border',
          className
        )}
        {...props}
      />
      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-rose-500" />
          {error}
        </p>
      )}
      {hasHelper && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">{helperText}</p>
      )}
    </div>
  )
})
Textarea.displayName = 'Textarea'
