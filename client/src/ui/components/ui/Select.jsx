import { cn } from '../../lib/utils'

export default function Select({ options, value, onChange, placeholder, error, className, ...props }) {
  return (
    <div>
      <select
        className={cn(
          'w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-900 transition-all duration-200 appearance-none',
          'bg-no-repeat bg-[left_12px_center] rtl:bg-[right_12px_center] pe-8',
          'bg-[url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 12 12%27%3E%3Cpath fill=%27%2364748b%27 d=%27M6 8L1 3h10z%27/%3E%3C/svg%3E")]',
          'focus:outline-none focus:ring-4 focus:ring-slate-900/10 focus:border-slate-500',
          error ? 'border-red-500' : 'border-slate-200 hover:border-slate-300',
          className
        )}
        value={value}
        onChange={onChange}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-danger-500 mt-1">{error}</p>}
    </div>
  )
}
