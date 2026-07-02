import { useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import DarkModeToggle from '../components/DarkModeToggle'
import { useAuthStore } from '../store/authStore'
import { useSidebarStore } from '../store/sidebarStore'
import { ChevronLeft, Menu, GraduationCap, LayoutDashboard, CalendarDays, ClipboardCheck } from 'lucide-react'
import { cn } from '../lib/utils'

const bottomNavKeys = [
  { to: '/student', icon: LayoutDashboard, labelKey: 'sidebar.dashboard' },
  { to: '/student/schedule', icon: CalendarDays, labelKey: 'sidebar.mySchedule' },
  { to: '/student/attendance', icon: ClipboardCheck, labelKey: 'sidebar.attendance' },
]

const breadcrumbKeys = {
  '/student': 'sidebar.dashboard',
  '/student/schedule': 'sidebar.mySchedule',
  '/student/attendance': 'sidebar.attendance',
}

export default function StudentLayout() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore(s => s.user)
  const { collapsed } = useSidebarStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const bcKey = breadcrumbKeys[location.pathname]
  const currentPage = bcKey ? t(bcKey) : ''
  const isRtl = i18n.dir() === 'rtl'

  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">

      {/* ── Desktop Sidebar ── */}
      <div
        className={cn(
          'hidden lg:flex flex-shrink-0 h-full',
          'transition-[width] duration-300 ease-out',
          collapsed ? 'w-16' : 'w-72'
        )}
      >
        <Sidebar role="student" />
      </div>

      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[var(--z-modal-backdrop)] lg:hidden">
          <div
            className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className={cn(
              'absolute end-0 top-0 h-full z-[var(--z-modal)] shadow-2xl',
              isRtl ? 'animate-mobile-slide-in-rtl' : 'animate-mobile-slide-in'
            )}
          >
            <Sidebar role="student" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 z-[var(--z-sticky)] border-b border-border bg-header-bg backdrop-blur-xl">
          <div className="flex items-center justify-between h-16 px-5 md:px-8">
            {/* Left: menu + breadcrumb */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 -ms-2 rounded-lg hover:bg-hover transition-colors cursor-pointer"
                aria-label={t('layout.openMenu')}
              >
                <Menu className="w-5 h-5 text-body" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-sm rounded-lg border border-border bg-surface px-3 py-1.5 shadow-sm">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <GraduationCap className="w-3.5 h-3.5 text-violet-500" />
                  {t('layout.student.prefix')}
                </span>
                {currentPage && (
                  <>
                    <ChevronLeft
                      className={cn('w-3.5 h-3.5 text-muted', isRtl && 'rotate-180')}
                    />
                    <span className="text-title font-semibold truncate">{currentPage}</span>
                  </>
                )}
              </div>
            </div>

            {/* Right: actions + user */}
            <div className="flex items-center gap-2.5">
              <DarkModeToggle />
              <LanguageSwitcher />

              <div className="hidden sm:block w-px h-6 bg-border mx-1" />

              <div className="hidden sm:block text-end">
                <p className="text-sm font-semibold text-title leading-tight">{user?.name}</p>
                <p className="text-xs text-muted leading-tight flex items-center gap-1 justify-end">
                  <span className="w-1 h-1 rounded-full bg-violet-500" />
                  {t('layout.student.role')}
                </p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-600 to-violet-800 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-surface">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-8 pb-24 lg:pb-8">
          <div
            key={location.key}
            className="mx-auto w-full max-w-full animate-fade-in"
          >
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden flex-shrink-0 border-t border-border bg-header-bg backdrop-blur-xl z-[var(--z-sticky)] safe-area-pb">
          <div className="flex items-center justify-around h-16 px-2">
            {bottomNavKeys.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student'}
                className={({ isActive }) => cn(
                  'flex flex-col items-center justify-center gap-1 flex-1 h-full rounded-lg transition-colors',
                  isActive
                    ? 'text-violet-600'
                    : 'text-muted hover:text-body'
                )}
              >
                {({ isActive }) => (
                  <>
                    <div className={cn(
                      'flex items-center justify-center w-10 h-7 rounded-full transition-all duration-200',
                      isActive ? 'bg-violet-100 dark:bg-violet-500/15' : 'bg-transparent'
                    )}>
                      <item.icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
                    </div>
                    <span className="text-[10px] font-semibold">{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
