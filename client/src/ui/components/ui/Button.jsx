import { cn } from '../../lib/utils'

/* ─────────────────────────────────────────────────────────────
   Button Variants  —  "Academic Cockpit" v2
   ─────────────────────────────────────────────────────────────
   - primary:     high-emphasis CTA (theme primary, with subtle inner highlight)
   - secondary:   medium-emphasis (subtle bg)
   - outline:     bordered, transparent bg
   - ghost:       no bg/border, only hover
   - destructive: dangerous actions (delete, remove)
   - success:     positive actions (confirm, save)
   - link:        inline text link

   All variants are theme-aware (light + dark).
   Adds: subtle inner-top highlight on solid variants, smoother
   active state, better focus ring. */
const variants = {
  primary:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm dark:bg-primary-500 dark:hover:bg-primary-600 dark:text-white',
  secondary:
    'bg-hover text-title hover:bg-active active:bg-active/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] dark:text-zinc-200',
  outline:
    'border border-border bg-surface text-body hover:bg-hover hover:border-active active:bg-active dark:bg-transparent dark:hover:bg-white/[0.06]',
  ghost:
    'text-label hover:bg-hover hover:text-title active:bg-active dark:hover:bg-white/[0.06] dark:hover:text-zinc-100',
  destructive:
    'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm dark:bg-rose-700 dark:hover:bg-rose-600',
  success:
    'bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 shadow-sm dark:bg-emerald-700 dark:hover:bg-emerald-600',
  gradient:
    'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800',
  link:
    'text-primary-700 hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-200 underline-offset-4 hover:underline p-0 h-auto',
}

const sizes = {
  xs:       'h-7  px-2.5 text-xs gap-1.5 rounded-md',
  sm:       'h-9  px-3.5 text-sm gap-2 rounded-lg',
  md:       'h-10 px-4   text-sm gap-2 rounded-lg',
  lg:       'h-11 px-5   text-sm gap-2 rounded-lg',
  xl:       'h-12 px-6   text-base gap-2.5 rounded-xl',
  icon:     'w-10 h-10 rounded-lg',
  'icon-sm':'w-9 h-9 rounded-lg',
  'icon-xs':'w-7 h-7 rounded-md',
}

const spinnerSizes = {
  xs: 'h-3 w-3',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
  lg: 'h-4 w-4',
  xl: 'h-5 w-5',
  icon:     'h-4 w-4',
  'icon-sm':'h-3.5 w-3.5',
  'icon-xs':'h-3 w-3',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  loadingText,
  disabled,
  className,
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading
  return (
    <button
      type={type}
      className={cn(
        'relative inline-flex items-center justify-center font-semibold whitespace-nowrap select-none',
        'transition-[background-color,border-color,box-shadow,transform,filter] duration-200 cursor-pointer',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        'disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed',
        'active:translate-y-px',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      aria-label={loading && loadingText ? loadingText : undefined}
      {...props}
    >
      {loading && (
        <svg
          className={cn('animate-spin', spinnerSizes[size])}
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  )
}
