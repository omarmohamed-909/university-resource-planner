import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, Bell } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'

export default function DoctorDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  const dayLabels = {
    saturday: t('day.saturday'),
    sunday: t('day.sunday'),
    monday: t('day.monday'),
    tuesday: t('day.tuesday'),
    wednesday: t('day.wednesday'),
    thursday: t('day.thursday'),
  }

  useEffect(() => {
    api.get('/schedules')
      .then(r => setSchedules(Array.isArray(r.data.data) ? r.data.data : []))
      .catch(err => {
        console.error('[DoctorDashboard] schedules:', err?.message)
        toast.error(t('doctor.dashboard.toast.loadFailed'))
      })
      .finally(() => setLoading(false))
  }, [t])

  if (loading) return <Skeleton type="card" count={4} />

  const DAY_BY_INDEX = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  const today = DAY_BY_INDEX[new Date().getDay()]
  const todaySchedules = schedules.filter(s => s.day === today)
  const uniqueDays = new Set(schedules.map(s => s.day)).size

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('doctor.dashboard.welcome', { name: user?.name })}</h1>
        <CardDescription>{t('doctor.dashboard.description')}</CardDescription>
      </div>

      <div>
        <h2 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">{t('common.overview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0"><CalendarDays className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">{t('doctor.dashboard.todayLectures')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{todaySchedules.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0"><BookOpen className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">{t('doctor.dashboard.totalLectures')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{schedules.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="flex items-center gap-5 px-6 py-5">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0"><Bell className="w-6 h-6" /></div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">{t('doctor.dashboard.lectureDays')}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900 leading-none">{uniqueDays}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle>{t('doctor.dashboard.todayCard')}</CardTitle></CardHeader>
        <CardContent>
          {todaySchedules.length === 0 ? (
            <p className="text-center text-slate-400 py-8">{t('doctor.dashboard.todayEmpty')}</p>
          ) : (
            <div className="space-y-3">
              {todaySchedules.map(sch => (
                <div key={sch.id} className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4 transition-colors hover:bg-blue-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{sch.courseId?.name || sch.courseId?.code || t('doctor.dashboard.courseUnknown')}</p>
                    <p className="text-sm text-slate-500">{sch.startTime} - {sch.endTime}</p>
                  </div>
                  <div className="sm:text-end">
                    <p className="text-sm font-medium text-slate-700">{sch.hallId?.name || t('doctor.dashboard.hallUnknown')}</p>
                    <Badge variant={sch.weekPattern === 'weekly' ? 'default' : 'warning'}>
                      {sch.weekPattern === 'weekly' ? t('weekPattern.weekly') : sch.weekPattern === 'odd' ? t('weekPattern.odd') : t('weekPattern.even')}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
