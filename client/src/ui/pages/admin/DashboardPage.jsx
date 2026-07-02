import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHallStore } from '../../store/hallStore'
import { useScheduleStore } from '../../store/scheduleStore'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'
import { Activity, CalendarDays, DoorOpen, GraduationCap, UserCog, Wrench } from 'lucide-react'

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { halls, fetchHalls, loading: hallLoading } = useHallStore()
  const { schedules, fetchSchedules, loading: scheduleLoading } = useScheduleStore()
  const [studentCount, setStudentCount] = useState(0)
  const [doctorCount, setDoctorCount] = useState(0)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    fetchHalls()
    fetchSchedules()
    api.get('/users?role=student').then(r => setStudentCount(r.data.data?.length || 0)).catch(err => console.error('[Dashboard] student count:', err?.message))
    api.get('/users?role=doctor').then(r => setDoctorCount(r.data.data?.length || 0)).catch(err => console.error('[Dashboard] doctor count:', err?.message))
  }, [])

  const formatDate = (date) => {
    const d = new Date(date)
    return t('common.dateFormat', {
      day: t('day.' + dayKeys[d.getDay()]),
      date: d.getDate(),
      month: t('month.' + monthKeys[d.getMonth()]),
      year: d.getFullYear(),
    })
  }

  const weekLabel = (pattern) => t('weekPattern.' + pattern)

  const loading = hallLoading || scheduleLoading
  if (loading) return (
    <div className="space-y-8 animate-fade-in">
      <div className="h-36 rounded-2xl skeleton-shimmer" />
      <Skeleton type="card" count={6} />
    </div>
  )

  const activeHalls = halls.filter(h => h.status === 'active').length
  const maintenanceHalls = halls.filter(h => h.status === 'maintenance').length

  const stats = [
    { label: t('admin.dashboard.statHalls'), value: halls.length, icon: DoorOpen, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    { label: t('admin.dashboard.statSchedules'), value: schedules.length, icon: CalendarDays, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
    { label: t('admin.dashboard.statDoctors'), value: doctorCount, icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-50', border: 'border-teal-100' },
    { label: t('admin.dashboard.statStudents'), value: studentCount, icon: UserCog, color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100' },
    { label: t('admin.dashboard.statActiveHalls'), value: activeHalls, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
    { label: t('admin.dashboard.statMaintenance'), value: maintenanceHalls, icon: Wrench, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Welcome Banner ── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="px-8 py-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{formatDate(Date.now())}</p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                {t('admin.dashboard.welcome', { name: user?.name || t('admin.dashboard.welcomeDefault') })}
              </h1>
              <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                {t('admin.dashboard.description')}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-100 px-4 py-2.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-sm font-semibold text-emerald-700">{t('admin.dashboard.hallsReady', { count: activeHalls })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {stats.map(stat => (
            <div
              key={stat.label}
              className={`group flex items-center gap-5 rounded-xl border ${stat.border} bg-white px-6 py-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5`}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 truncate">{stat.label}</p>
                <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900 leading-none">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Detail Cards ── */}
      <div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

          {/* Halls Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('admin.dashboard.hallsCard')}</CardTitle>
                <CardDescription>{t('admin.dashboard.hallsDesc', { count: halls.length })}</CardDescription>
              </div>
              <Badge variant="info">{t('admin.dashboard.hallsActive', { count: activeHalls })}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {halls.length === 0 ? (
                <div className="py-14 text-center text-sm text-slate-400">{t('admin.dashboard.hallsEmpty')}</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {halls.slice(0, 6).map(hall => {
                    const active = hall.status === 'active'
                    const maintenance = hall.status === 'maintenance'
                    return (
                      <div key={hall.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {hall.name?.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold text-slate-900">{hall.name}</p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {hall.building || t('admin.dashboard.buildingUnknown')} · {t('admin.dashboard.floor', { floor: hall.floor })} · {t('capacity.students', { count: hall.capacity })}
                          </p>
                        </div>
                        <Badge variant={active ? 'success' : maintenance ? 'warning' : 'default'} dot>
                          {active ? t('status.active') : maintenance ? t('status.maintenance') : t('status.inactive')}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedules Card */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{t('admin.dashboard.schedulesCard')}</CardTitle>
                <CardDescription>{t('admin.dashboard.schedulesDesc', { count: schedules.length })}</CardDescription>
              </div>
              <Badge variant="primary">{t('admin.dashboard.schedulesTotal', { count: schedules.length })}</Badge>
            </CardHeader>
            <CardContent className="p-0">
              {schedules.length === 0 ? (
                <div className="py-14 text-center text-sm text-slate-400">{t('admin.dashboard.schedulesEmpty')}</div>
              ) : (
                <div className="divide-y divide-slate-50">
                  {schedules.slice(0, 6).map(schedule => (
                    <div key={schedule.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center flex-shrink-0">
                        <CalendarDays className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {schedule.courseId?.name || schedule.courseId?.code || t('admin.dashboard.courseUnknown')}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {t('day.' + schedule.day) || schedule.day} · {schedule.startTime} – {schedule.endTime}
                        </p>
                      </div>
                      <Badge variant={schedule.weekPattern === 'weekly' ? 'default' : 'warning'}>
                        {weekLabel(schedule.weekPattern)}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  )
}
