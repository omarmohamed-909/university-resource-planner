import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(({ className, error, icon, ...props }, ref) => {
  return (
    <div className="relative">
      {icon && (
        <div className="absolute inset-y-0 end-0 flex items-center pe-3 pointer-events-none text-slate-400">
          {icon}
        </div>
      )}
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm transition-all duration-200',
          'placeholder:text-slate-400 text-slate-900',
          'focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/10',
          'hover:border-slate-300',
          icon && 'pe-10',
          error ? 'border-red-500 focus:ring-red-500/15 focus:border-red-500' : 'border-slate-200',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
