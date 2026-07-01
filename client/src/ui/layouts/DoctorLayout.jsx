import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/layout/Sidebar'
import { useAuthStore } from '../store/authStore'
import { Menu, ChevronLeft } from 'lucide-react'

const breadcrumbMap = {
  '/doctor': 'لوحة التحكم',
  '/doctor/schedule': 'جدولي',
  '/doctor/attendance': 'الحضور',
  '/doctor/swap': 'طلبات التبديل',
}

export default function DoctorLayout() {
  const user = useAuthStore(s => s.user)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const currentPage = breadcrumbMap[location.pathname] || ''

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:flex flex-shrink-0 h-screen sticky top-0">
        <Sidebar role="doctor" />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed end-0 top-0 h-full z-50 shadow-xl">
            <Sidebar role="doctor" onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-h-screen min-w-0">
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
                <span className="text-slate-500">الدكتور</span>
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
                <p className="text-xs text-slate-500">عضو هيئة تدريس</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-6 lg:px-10 lg:py-8">
          <div key={location.key} className="mx-auto w-full max-w-[1400px] animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}