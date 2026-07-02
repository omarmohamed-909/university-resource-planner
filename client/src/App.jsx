import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './ui/store/authStore'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from './ui/components/ErrorBoundary'
import { useThemeStore } from './ui/store/themeStore'
import Skeleton, { SkeletonCard } from './ui/components/ui/Skeleton'
import './ui/lib/i18n'

const LoginPage = lazy(() => import('./ui/pages/auth/LoginPage'))
const RegisterPage = lazy(() => import('./ui/pages/auth/RegisterPage'))
const AdminLayout = lazy(() => import('./ui/layouts/AdminLayout'))
const DoctorLayout = lazy(() => import('./ui/layouts/DoctorLayout'))
const StudentLayout = lazy(() => import('./ui/layouts/StudentLayout'))

const AdminDashboard = lazy(() => import('./ui/pages/admin/DashboardPage'))
const AdminHalls = lazy(() => import('./ui/pages/admin/HallsPage'))
const AdminSchedules = lazy(() => import('./ui/pages/admin/SchedulesPage'))
const AdminCourses = lazy(() => import('./ui/pages/admin/CoursesPage'))
const AdminUsers = lazy(() => import('./ui/pages/admin/UsersPage'))
const AdminAutoSchedule = lazy(() => import('./ui/pages/admin/AutoSchedulePage'))
const AdminSwaps = lazy(() => import('./ui/pages/admin/SwapsPage'))
const AttendanceManagePage = lazy(() => import('./ui/pages/attendance/AttendanceManagePage'))

const DoctorDashboard = lazy(() => import('./ui/pages/doctor/DashboardPage'))
const DoctorSchedule = lazy(() => import('./ui/pages/doctor/SchedulePage'))
const DoctorSwap = lazy(() => import('./ui/pages/doctor/SwapPage'))

const StudentDashboard = lazy(() => import('./ui/pages/student/DashboardPage'))
const StudentSchedule = lazy(() => import('./ui/pages/student/SchedulePage'))
const StudentAttendance = lazy(() => import('./ui/pages/student/AttendancePage'))

function ProtectedRoute({ children, role }) {
  const user = useAuthStore(s => s.user)
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to={`/${user.role}`} replace />
  return children
}

function PublicRoute({ children }) {
  const user = useAuthStore(s => s.user)
  if (user) return <Navigate to={`/${user.role}`} replace />
  return children
}

export default function App() {
  const checkAuth = useAuthStore(s => s.checkAuth)
  const isDark = useThemeStore(s => s.isDark)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    checkAuth().finally(() => setInitializing(false))
  }, [checkAuth])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas p-page">
        <div className="w-full max-w-lg section-stack">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: '12px',
            padding: '12px 16px',
            background: isDark ? '#18181b' : '#ffffff',
            color: isDark ? '#f4f4f5' : '#0f172a',
            border: isDark ? '1px solid #27272a' : '1px solid #e2e8f0',
            boxShadow: isDark
              ? '0 10px 30px -10px rgba(0,0,0,0.6), 0 4px 8px -4px rgba(0,0,0,0.4)'
              : '0 10px 30px -10px rgba(15,23,42,0.15), 0 4px 8px -4px rgba(15,23,42,0.06)',
            fontSize: '14px',
            fontWeight: 500,
          },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Suspense
        fallback={
          <div className="p-page section-stack max-w-5xl mx-auto">
            <Skeleton type="card" count={3} />
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="halls" element={<AdminHalls />} />
            <Route path="schedules" element={<AdminSchedules />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="attendance" element={<AttendanceManagePage />} />
            <Route path="swaps" element={<AdminSwaps />} />
            <Route path="auto-schedule" element={<AdminAutoSchedule />} />
          </Route>

          <Route path="/doctor" element={<ProtectedRoute role="doctor"><DoctorLayout /></ProtectedRoute>}>
            <Route index element={<DoctorDashboard />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="attendance" element={<AttendanceManagePage />} />
            <Route path="swap" element={<DoctorSwap />} />
          </Route>

          <Route path="/student" element={<ProtectedRoute role="student"><StudentLayout /></ProtectedRoute>}>
            <Route index element={<StudentDashboard />} />
            <Route path="schedule" element={<StudentSchedule />} />
            <Route path="attendance" element={<StudentAttendance />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
