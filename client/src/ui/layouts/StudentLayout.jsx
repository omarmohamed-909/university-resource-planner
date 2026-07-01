import { useState } from 'react'
import { Outlet, useLocation, NavLink } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuthStore } from '../store/authStore'
import { Menu, ChevronLeft, LayoutDashboard, CalendarDays, ClipboardCheck } from 'lucide-react'
import { cn } from '../lib/utils'

const bottomNav = [
  { to: '/student', icon: LayoutDashboard, label: 'الرئيسية' },
  { to: '/student/schedule', icon: CalendarDays, label: 'جدولي' },
  { to: '/student/attendance', icon: ClipboardCheck, label: 'الحضور' },
]

const breadcrumbMap = {
  '/student': 'لوحة التحكم',
  '/student/schedule': 'جدولي',
  '/student/attendance': 'الحضور',
}

export default function StudentLayout() {
  const user = useAuthStore(s => s.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPage = breadcrumbMap[location.pathname] || ''

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        <Sidebar role="student" />
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed end-0 top-0 h-full z-50 shadow-xl">
            <Sidebar role="student" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0 pb-16 lg:pb-0">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-6 py-3.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="فتح القائمة"
              >
                <Menu className="w-5 h-5 text-slate-700" />
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5">
                <span className="text-slate-500">الطالب</span>
                {currentPage && (
                  <>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-slate-950 font-semibold">{currentPage}</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-end">
                <p className="text-sm font-semibold text-slate-950">{user?.name}</p>
                <p className="text-xs text-slate-500">طالب</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-violet-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <div key={location.key} className="mx-auto w-full max-w-[1400px] animate-fade-in">
            <Outlet />
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 start-0 end-0 bg-white/95 backdrop-blur-xl border-t border-slate-200 z-40">
          <div className="flex items-center justify-around py-2">
            {bottomNav.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/student'}
                className={({ isActive }) => cn(
                  'flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg text-[10px] font-medium transition-colors',
                  isActive ? 'text-violet-600' : 'text-slate-400'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}