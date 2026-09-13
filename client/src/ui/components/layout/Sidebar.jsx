import { NavLink, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useSidebarStore } from '../../store/sidebarStore'
import {
  LayoutDashboard, GraduationCap, CalendarDays, Users, DoorOpen,
  Settings, LogOut, SwitchCamera, ClipboardCheck,
  PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import QnuLogo from '../ui/QnuLogo'

/* ── Role metadata ──
   Each role gets its own accent color used for active states, avatars,
   and indicator dots — so the sidebar feels personalized per role. */
const roleMeta = {
  admin: {
    accent: '#3b82f6',
    accentSoft: 'bg-blue-500/15',
    accentText: 'text-blue-400',
    avatar: 'bg-blue-600',
    labelKey: 'role.adminFull',
  },
  doctor: {
    accent: '#10b981',
    accentSoft: 'bg-emerald-500/15',
    accentText: 'text-emerald-400',
    avatar: 'bg-emerald-600',
    labelKey: 'role.doctorFull',
  },
  student: {
    accent: '#8b5cf6',
    accentSoft: 'bg-violet-500/15',
    accentText: 'text-violet-400',
    avatar: 'bg-violet-600',
    labelKey: 'role.studentFull',
  },
}

const navDefs = {
  admin: [
    { to: '/admin', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
    { to: '/admin/halls', icon: DoorOpen, labelKey: 'sidebar.halls' },
    { to: '/admin/schedules', icon: CalendarDays, labelKey: 'sidebar.schedules' },
    { to: '/admin/courses', icon: GraduationCap, labelKey: 'sidebar.courses' },
    { to: '/admin/users', icon: Users, labelKey: 'sidebar.users' },
    { to: '/admin/attendance', icon: ClipboardCheck, labelKey: 'sidebar.attendance' },
    { to: '/admin/swaps', icon: SwitchCamera, labelKey: 'sidebar.swaps' },
    { to: '/admin/auto-schedule', icon: Settings, labelKey: 'sidebar.autoSchedule' },
  ],
  doctor: [
    { to: '/doctor', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
    { to: '/doctor/schedule', icon: CalendarDays, labelKey: 'sidebar.mySchedule' },
    { to: '/doctor/attendance', icon: ClipboardCheck, labelKey: 'sidebar.attendance' },
    { to: '/doctor/swap', icon: SwitchCamera, labelKey: 'sidebar.swaps' },
  ],
  student: [
    { to: '/student', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
    { to: '/student/schedule', icon: CalendarDays, labelKey: 'sidebar.mySchedule' },
    { to: '/student/attendance', icon: ClipboardCheck, labelKey: 'sidebar.attendance' },
  ],
}

export default function Sidebar({ role, onClose }) {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const logout = useAuthStore(s => s.logout)
  const { collapsed, toggle } = useSidebarStore()
  const isRtl = i18n.dir() === 'rtl'
  const items = navDefs[role] || []
  const cfg = roleMeta[role] || roleMeta.admin
  const isMobile = !!onClose
  const shrunk = collapsed && !isMobile

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const ToggleIcon = isRtl
    ? (shrunk ? PanelLeftOpen : PanelRightClose)
    : (shrunk ? PanelLeftOpen : PanelLeftClose)

  /* Nav item class — shared between menu items and logout button */
  const itemBase = cn(
    'group relative flex items-center rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer select-none',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500',
    shrunk
      ? 'justify-center w-10 h-10 mx-auto'
      : 'px-3.5 h-11 gap-3 w-full'
  )

  return (
    <aside
      className={cn(
        'sidebar-dark flex flex-col h-full text-zinc-300 border-e border-zinc-800/60',
        'transition-[width] duration-300 ease-out relative',
        isMobile ? 'w-72 overflow-y-auto' : (shrunk ? 'w-16' : 'w-72'),
        shrunk && 'overflow-hidden scrollbar-hide'
      )}
    >
      {/* ── Brand / Logo ── */}
      <div className={cn('relative pt-5 pb-4', shrunk ? 'px-0 w-full flex justify-center' : 'px-4')}>
        <div className={cn('flex items-center', shrunk ? 'justify-center' : 'gap-3')}>
          <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white flex-shrink-0 p-0.5">
            <QnuLogo className="w-full h-full" />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/5 rounded-xl pointer-events-none" />
          </div>
          {!shrunk && (
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-white leading-tight tracking-tight">QNU</h1>
              <p className="text-[11px] text-zinc-400 mt-0.5 truncate">{t('sidebar.title')}</p>
            </div>
          )}
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 -me-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              aria-label={t('layout.closeMenu', { defaultValue: 'Close menu' })}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Spacer for shrunk mode */}
      {shrunk && <div className="h-1 flex-shrink-0" aria-hidden="true" />}

      {/* ── User Profile Card ── */}
      {user && (
        <div className={cn('mb-4', shrunk ? 'w-full flex justify-center px-0' : 'mx-3')}>
          {shrunk ? (
            <div className="relative flex-shrink-0">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm',
                cfg.avatar
              )}>
                {user.name?.charAt(0)?.toUpperCase()}
              </div>
              <div className="absolute -bottom-0.5 -end-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-900">
              </div>
            </div>
          ) : (
            <div className="relative rounded-lg bg-white/[0.045] overflow-hidden p-3 transition-colors duration-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-shrink-0">
                  <div className={cn(
                    'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm',
                    cfg.avatar
                  )}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-zinc-900">
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-white truncate leading-tight">{user.name}</p>
                  <p className={cn('text-xs mt-0.5 font-medium flex items-center gap-1.5', cfg.accentText)}>
                    <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cfg.accent }} />
                    {t(cfg.labelKey)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Section Label ── */}
      {!shrunk && (
        <p className="px-4 mb-2 text-[11px] font-bold tracking-[0.16em] text-zinc-500 uppercase">
          {t('sidebar.menu')}
        </p>
      )}

      {/* ── Navigation ── */}
      <nav className={cn(
        'flex-1 space-y-1 overflow-y-auto scrollbar-hide',
        shrunk ? 'px-0 w-full flex flex-col items-center' : 'px-3'
      )}>
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${role}`}
            onClick={onClose}
            title={shrunk ? t(item.labelKey) : undefined}
            className={cn("w-full", shrunk ? "flex justify-center" : "block")}
          >
            {({ isActive }) => (
              <div
                className={cn(
                  itemBase,
                  isActive
                    ? cn('text-white bg-white/[0.04]', cfg.accentSoft)
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                )}
              >
                {/* Active dot indicator for shrunk mode */}
                {isActive && shrunk && (
                  <span
                    className="absolute -start-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: cfg.accent }}
                  />
                )}
                <item.icon
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-colors',
                    isActive ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'
                  )}
                  strokeWidth={isActive ? 2.4 : 2}
                />
                {!shrunk && (
                  <span className="flex-1 truncate">{t(item.labelKey)}</span>
                )}
                {/* Active trailing dot */}
                {isActive && !shrunk && (
                  <span
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cfg.accent }}
                  />
                )}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Footer (Logout + Collapse toggle) ── */}
      <div className={cn(
        'mt-2 border-t border-zinc-800/60',
        shrunk ? 'py-2 px-0 w-full flex flex-col items-center space-y-1' : 'p-3 space-y-1'
      )}>
        <button
          onClick={handleLogout}
          title={shrunk ? t('sidebar.logout') : undefined}
          className={cn(
            itemBase,
            'text-zinc-400 hover:text-rose-300 hover:bg-rose-500/10'
          )}
        >
          <LogOut
            aria-hidden="true"
            className="w-5 h-5 flex-shrink-0 group-hover:scale-105 transition-transform"
          />
          {!shrunk && <span>{t('sidebar.logout')}</span>}
        </button>

        {!isMobile && (
          <button
            onClick={toggle}
            className={cn(
              itemBase,
              'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.05]'
            )}
            aria-label={shrunk ? t('sidebar.expand') : t('sidebar.collapse')}
          >
            <ToggleIcon className="w-5 h-5" />
            {!shrunk && (
              <span className="text-zinc-400 group-hover:text-zinc-300">
                {t('sidebar.collapse')}
              </span>
            )}
          </button>
        )}
      </div>
    </aside>
  )
}
