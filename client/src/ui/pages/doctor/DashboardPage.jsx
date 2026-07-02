import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, Bell, Clock, Sparkles } from 'lucide-react'
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
    <div className="space-y-8 animate-fade-in">

      {/* Hero welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/80 via-blue-50/40 to-transparent dark:from-emerald-500/[0.06] dark:via-blue-500/[0.05] dark:to-transparent" />
          <div
            className="aurora-blob w-72 h-72 -top-24 -end-16"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)', animationDuration: '22s' }}
          />
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 dark:opacity-[0.15]" />
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur px-3 py-1.5 border border-border shadow-sm">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-xs font-semibold text-muted">{formatDate(Date.now())}</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-title text-balance">
            {t('doctor.dashboard.welcome', { name: user?.name })}
          </h1>
          <CardDescription className="mt-2 max-w-xl text-pretty">
            {t('doctor.dashboard.description')}
          </CardDescription>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/70 border border-border text-[11px] font-semibold text-label backdrop-blur">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              {todaySchedules.length} {t('doctor.dashboard.todayLectures')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div>
        <h2 className="mb-4 text-xs font-bold tracking-widest text-muted uppercase">{t('common.overview')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 stagger">
          {stats.map((stat) => (
            <Card key={stat.label} className="hover-lift overflow-hidden">
              <CardContent className="flex items-center gap-5 px-6 py-5">
                <div className={`relative w-12 h-12 rounded-xl ${stat.bg} ${stat.color} ${stat.dark} flex items-center justify-center flex-shrink-0`}>
                  <stat.icon className="w-6 h-6" strokeWidth={2.2} />
                  <div className={`absolute inset-0 rounded-xl ${stat.accent} opacity-0 hover:opacity-10 transition-opacity`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted truncate">{stat.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-title leading-none tabular-nums">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
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
