import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Sidebar from '../components/layout/Sidebar'
import LanguageSwitcher from '../components/LanguageSwitcher'
import DarkModeToggle from '../components/DarkModeToggle'
import { useAuthStore } from '../store/authStore'
import { useSidebarStore } from '../store/sidebarStore'
import { ChevronLeft, Menu, Stethoscope } from 'lucide-react'
import { cn } from '../lib/utils'

const breadcrumbKeys = {
  '/doctor': 'sidebar.dashboard',
  '/doctor/schedule': 'sidebar.mySchedule',
  '/doctor/attendance': 'sidebar.attendance',
  '/doctor/swap': 'sidebar.swaps',
}

export default function DoctorLayout() {
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
        <Sidebar role="doctor" />
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
            <Sidebar role="doctor" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* ── Main Column ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">

        {/* Header */}
        <header className="flex-shrink-0 z-[var(--z-sticky)] border-b border-border bg-surface">
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

              <div className="hidden sm:flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1.5 text-muted">
                  <Stethoscope className="w-3.5 h-3.5 text-emerald-500" />
                  {t('layout.doctor.prefix')}
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
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />
                  {t('layout.doctor.role')}
                </p>
              </div>
              <div className="relative">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-surface">
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-5 md:p-8">
          <div
            key={location.key}
            className="mx-auto w-full max-w-[1400px]"
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
