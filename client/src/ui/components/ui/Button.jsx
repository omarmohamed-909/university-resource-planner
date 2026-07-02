import { cn } from '../../lib/utils'

const variants = {
  primary: 'bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-900 shadow-sm',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200 active:bg-slate-300',
  destructive: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 active:bg-slate-100',
  ghost: 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
  link: 'text-primary-600 hover:text-primary-800 underline-offset-2 hover:underline p-0',
  gradient: 'bg-slate-950 text-white hover:bg-slate-800 active:bg-slate-900 shadow-sm',
}

const sizes = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2.5 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  xl: 'px-8 py-4 text-lg gap-2',
  icon: 'p-2 aspect-square',
}

export default function Button({ children, variant = 'primary', size = 'md', loading, disabled, className, ...props }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200',
        'focus-visible:outline-2 focus-visible:outline-slate-900 focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        'active:translate-y-px',
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ms-1 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
