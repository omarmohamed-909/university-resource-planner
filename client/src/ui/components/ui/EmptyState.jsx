import { cn } from '../../lib/utils'

export default function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-14 px-4 text-center animate-fade-in', className)}>
      {Icon && (
        <div className="w-16 h-16 rounded-lg bg-slate-100 ring-1 ring-slate-200 flex items-center justify-center mb-5 animate-pop">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      {title && <h3 className="text-lg font-bold text-slate-950 mb-1">{title}</h3>}
      {description && <p className="text-sm text-slate-500 leading-6 max-w-sm mb-6">{description}</p>}
      {action && <div className="animate-fade-in">{action}</div>}
    </div>
  )
}
