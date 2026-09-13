import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, Bell, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export default function DoctorDashboard() {
  const { t } = useTranslation()
  const user = useAuthStore(s => s.user)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

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

  const formatDate = (date) => {
    const d = new Date(date)
    return t('common.dateFormat', {
      day: t('day.' + dayKeys[d.getDay()]),
      date: d.getDate(),
      month: t('month.' + monthKeys[d.getMonth()]),
      year: d.getFullYear(),
    })
  }

  const stats = [
    { label: t('doctor.dashboard.todayLectures'),  value: todaySchedules.length, icon: CalendarDays, color: 'text-blue-600',    bg: 'bg-blue-50',    accent: 'bg-blue-500',    dark: 'dark:bg-blue-500/15 dark:text-blue-400' },
    { label: t('doctor.dashboard.totalLectures'),  value: schedules.length,      icon: BookOpen,     color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'bg-emerald-500', dark: 'dark:bg-emerald-500/15 dark:text-emerald-400' },
    { label: t('doctor.dashboard.lectureDays'),    value: uniqueDays,            icon: Bell,         color: 'text-amber-600',   bg: 'bg-amber-50',   accent: 'bg-amber-500',   dark: 'dark:bg-amber-500/15 dark:text-amber-400' },
  ]

  return (
    <div className="space-y-7">

      {/* Hero welcome banner */}
      <section className="border-b border-border pb-7">
          <p className="text-sm font-medium text-label">{formatDate(Date.now())}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-title text-balance">
            {t('doctor.dashboard.welcome', { name: user?.name })}
          </h1>
          <CardDescription className="mt-2 max-w-2xl text-pretty">
            {t('doctor.dashboard.description')}
          </CardDescription>
      </section>

      {/* Stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-title">{t('common.overview')}</h2>
        <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="border-b border-e border-border p-5 last:border-e-0 md:border-b-0">
              <div className="flex items-center gap-4">
                <stat.icon className={`h-5 w-5 ${stat.color}`} strokeWidth={2} />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted truncate">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-title leading-none tabular-nums">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <CardTitle>{t('doctor.dashboard.todayCard')}</CardTitle>
              <CardDescription>{formatDate(Date.now())}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent padding="none">
          {todaySchedules.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mx-auto flex items-center justify-center mb-3">
                <CalendarDays className="w-6 h-6 text-muted" />
              </div>
              <p className="text-sm text-muted">{t('doctor.dashboard.todayEmpty')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {todaySchedules.map((sch, idx) => (
                <div
                  key={sch.id}
                  className="group flex flex-col gap-3 px-5 md:px-6 py-4 transition-colors hover:bg-hover/60 animate-fade-in sm:flex-row sm:items-center sm:justify-between"
                  style={{ animationDelay: `${idx * 35}ms` }}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-title truncate">{sch.courseId?.name || sch.courseId?.code || t('doctor.dashboard.courseUnknown')}</p>
                      <p className="text-sm text-label tabular-nums mt-0.5">{sch.startTime} - {sch.endTime}</p>
                    </div>
                  </div>
                  <div className="sm:text-end flex items-center gap-2 sm:justify-end">
                    <p className="text-sm font-medium text-body">{sch.hallId?.name || t('doctor.dashboard.hallUnknown')}</p>
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
