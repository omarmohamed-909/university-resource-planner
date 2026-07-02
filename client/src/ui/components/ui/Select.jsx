import { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Select Component
   ─────────────────────────────────────────────────────────────
   Same API as Input:
   - Sizes: sm / md / lg
   - label + helperText + error (a11y wired)
   - startIcon (e.g. search icon in a filter select)
   - Focus ring uses primary color (theme-aware)
   - Dark-mode-safe chevron (Lucide icon instead of inline SVG)

   Options format:
   <Select
     options={[{ value: '1', label: 'One' }, { value: '2', label: 'Two' }]}
   />
   ───────────────────────────────────────────────────────────── */

const sizes = {
  sm: 'h-9 px-3 text-sm pe-9',
  md: 'h-10 px-3.5 text-sm pe-10',
  lg: 'h-11 px-4 text-base pe-11',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const startIconPadding = {
  sm: 'ps-9',
  md: 'ps-10',
  lg: 'ps-11',
}

const chevronSizes = {
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
}

const Select = forwardRef(function Select(
  {
    options = [],
    value,
    onChange,
    placeholder,
    error,
    helperText,
    label,
    startIcon,
    size = 'md',
    id,
    className,
    'aria-describedby': ariaDescribedBy,
    ...props
  },
  ref
) {
  const generatedId = useId()
  const selectId = id || generatedId
  const helperId = `${selectId}-helper`
  const errorId = `${selectId}-error`
  const hasError = Boolean(error)
  const hasHelper = Boolean(helperText) && !hasError

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-title mb-1.5"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {startIcon && (
          <div
            className={cn(
              'absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none text-muted transition-colors',
              hasError && 'text-rose-500'
            )}
            aria-hidden="true"
          >
            <span className={iconSizes[size]}>{startIcon}</span>
          </div>
        )}

        <select
          ref={ref}
          id={selectId}
          value={value}
          onChange={onChange}
          aria-invalid={hasError || undefined}
          aria-describedby={cn(
            hasError && errorId,
            hasHelper && helperId,
            ariaDescribedBy
          )}
          className={cn(
            'w-full appearance-none rounded-lg border bg-surface text-title',
            'transition-all duration-200 cursor-pointer',
            'focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500',
            'hover:border-active',
            'disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-hover/50',
            sizes[size],
            startIcon && startIconPadding[size],
            hasError
              ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/15'
              : 'border-border',
            // Hide default IE/Edge arrow
            '[&::-ms-expand]:hidden',
            className
          )}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Chevron — sits on the end side, auto-flips in RTL via `end-3` */}
        <div
          className={cn(
            'absolute inset-y-0 end-0 flex items-center pe-3.5 pointer-events-none text-muted transition-colors',
            hasError && 'text-rose-500'
          )}
          aria-hidden="true"
        >
          <ChevronDown className={cn(chevronSizes[size], 'transition-transform')} />
        </div>
      </div>

      {hasError && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
      {hasHelper && (
        <p id={helperId} className="mt-1.5 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  )
})

Select.displayName = 'Select'
export default Select
