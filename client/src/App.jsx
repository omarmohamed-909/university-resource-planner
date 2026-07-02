import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './ui/store/authStore'
import { Toaster } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'
import ErrorBoundary from './ui/components/ErrorBoundary'
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
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    checkAuth().finally(() => setInitializing(false))
  }, [checkAuth])

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-8">
        <div className="w-full max-w-lg space-y-4">
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
          style: { borderRadius: '12px', padding: '12px 16px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
      <Suspense fallback={<div className="p-6"><Skeleton type="card" count={3} /></div>}>
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
