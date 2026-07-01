import { useEffect, useState } from 'react'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, ClipboardCheck } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'

export default function StudentDashboard() {
  const user = useAuthStore(s => s.user)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/schedules')
      .then(r => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton type="card" count={3} />

  const uniqueCourses = new Set(schedules.map(s => s.courseId?._id || s.courseId)).size
  const uniqueDays = new Set(schedules.map(s => s.day)).size

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">مرحباً، {user?.name}</h1>
        <CardDescription>لوحة تحكم الطالب</CardDescription>
      </div>

      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">المسجل في مواد</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{uniqueCourses}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"><CalendarDays className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">محاضرات أسبوعياً</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{schedules.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><ClipboardCheck className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">أيام الدراسة</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{uniqueDays}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
