import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, GraduationCap, CalendarDays, Users, DoorOpen,
  Settings, LogOut, SwitchCamera, ClipboardCheck
} from 'lucide-react'
import { cn } from '../../lib/utils'
import QnuLogo from '../ui/QnuLogo'

const roleConfig = {
  admin: {
    label: 'مدير النظام',
    accent: '#3b82f6',
    avatar: 'bg-blue-700',
  },
  doctor: {
    label: 'عضو هيئة تدريس',
    accent: '#10b981',
    avatar: 'bg-emerald-700',
  },
  student: {
    label: 'طالب',
    accent: '#8b5cf6',
    avatar: 'bg-violet-700',
  },
}

const navItems = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/admin/halls', icon: DoorOpen, label: 'المدرجات والمعامل' },
    { to: '/admin/schedules', icon: CalendarDays, label: 'الجداول' },
    { to: '/admin/courses', icon: GraduationCap, label: 'المواد الدراسية' },
    { to: '/admin/users', icon: Users, label: 'المستخدمون' },
    { to: '/admin/attendance', icon: ClipboardCheck, label: 'الحضور' },
    { to: '/admin/swaps', icon: SwitchCamera, label: 'طلبات التبديل' },
    { to: '/admin/auto-schedule', icon: Settings, label: 'توليد الجداول' },
  ],
  doctor: [
    { to: '/doctor', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/doctor/schedule', icon: CalendarDays, label: 'جدولي' },
    { to: '/doctor/attendance', icon: ClipboardCheck, label: 'الحضور' },
    { to: '/doctor/swap', icon: SwitchCamera, label: 'طلبات التبديل' },
  ],
  student: [
    { to: '/student', icon: LayoutDashboard, label: 'لوحة التحكم' },
    { to: '/student/schedule', icon: CalendarDays, label: 'جدولي' },
    { to: '/student/attendance', icon: ClipboardCheck, label: 'الحضور' },
  ],
}

export default function Sidebar({ role, onClose }) {
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const items = navItems[role] || []
  const cfg = roleConfig[role] || roleConfig.admin

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-72 flex-shrink-0 h-full flex flex-col bg-zinc-950 text-zinc-300 border-e border-zinc-800 overflow-y-auto">
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg overflow-hidden bg-white ring-1 ring-white/10">
            <QnuLogo className="w-full h-full" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">QNU</h1>
            <p className="text-[11px] text-zinc-400 mt-0.5">نظام إدارة الموارد</p>
          </div>
        </div>
      </div>

      {user && (
        <div className="mx-3 mb-5 rounded-lg border border-zinc-800 bg-zinc-900/70 p-3.5">
          <div className="flex items-center gap-3">
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm', cfg.avatar)}>
              {user.name?.charAt(0)?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-zinc-400 mt-0.5">{cfg.label}</p>
            </div>
          </div>
        </div>
      )}

      <p className="px-5 mb-2 text-[10px] font-bold tracking-[0.18em] text-zinc-500 uppercase">
        القائمة
      </p>

      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        {items.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            onClick={onClose}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  'flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none',
                  isActive
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.06]'
                )}
                style={isActive ? { borderInlineEnd: `3px solid ${cfg.accent}` } : {}}
              >
                <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive ? 'text-slate-950' : 'text-zinc-500')} />
                <span className="flex-1 truncate">{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 mt-2 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 w-full px-3.5 py-3 rounded-lg text-sm font-medium text-zinc-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 cursor-pointer"
        >
          <LogOut aria-hidden="true" className="w-5 h-5 flex-shrink-0" />
          تسجيل الخروج
        </button>
      </div>
    </aside>
  )
}
