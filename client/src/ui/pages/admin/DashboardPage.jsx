import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHallStore } from '../../store/hallStore'
import { useScheduleStore } from '../../store/scheduleStore'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'
import {
  Activity,
  CalendarDays,
  Clock,
  DoorOpen,
  GraduationCap,
  UserCog,
  Wrench,
} from 'lucide-react'

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export default function AdminDashboard() {
  const { t } = useTranslation()
  const { halls, fetchHalls, loading: hallLoading } = useHallStore()
  const { schedules, fetchSchedules, loading: scheduleLoading } = useScheduleStore()
  const [overview, setOverview] = useState(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const user = useAuthStore(s => s.user)

  useEffect(() => {
    fetchHalls({ page: 1, limit: 6 })
    fetchSchedules({ page: 1, limit: 6 })
    api.get('/stats/overview')
      .then(r => setOverview(r.data.data))
      .catch(err => console.error('[Dashboard] overview:', err?.message))
      .finally(() => setStatsLoading(false))
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

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return t('admin.dashboard.greetingMorning', { defaultValue: 'Good morning' })
    if (h < 18) return t('admin.dashboard.greetingAfternoon', { defaultValue: 'Good afternoon' })
    return t('admin.dashboard.greetingEvening', { defaultValue: 'Good evening' })
  }, [t])

  const loading = hallLoading || scheduleLoading || statsLoading
  if (loading) return (
    <div className="space-y-6">
      <div className="h-32 rounded-xl skeleton-shimmer" />
      <Skeleton type="card" count={6} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton type="table" rows={5} />
        <Skeleton type="table" rows={5} />
      </div>
    </div>
  )

  const activeHalls = overview?.activeHalls || 0
  const maintenanceHalls = overview?.maintenanceHalls || 0
  const hallTotal = overview?.halls || 0
  const scheduleTotal = overview?.schedules || 0
  const activePercent = Math.round((activeHalls / (hallTotal || 1)) * 100)

  const stats = [
    { label: t('admin.dashboard.statHalls'), value: hallTotal, icon: DoorOpen, color: 'text-blue-600' },
    { label: t('admin.dashboard.statSchedules'), value: scheduleTotal, icon: CalendarDays, color: 'text-violet-600' },
    { label: t('admin.dashboard.statDoctors'), value: overview?.doctors || 0, icon: GraduationCap, color: 'text-teal-600' },
    { label: t('admin.dashboard.statStudents'), value: overview?.students || 0, icon: UserCog, color: 'text-indigo-600' },
    { label: t('admin.dashboard.statActiveHalls'), value: activeHalls, icon: Activity, color: 'text-emerald-600' },
    { label: t('admin.dashboard.statMaintenance'), value: maintenanceHalls, icon: Wrench, color: 'text-amber-600' },
  ]

  return (
    <div className="flex flex-col gap-7">
      <section className="flex flex-col gap-5 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-medium text-label">{formatDate(Date.now())}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-title text-balance">
            {greeting}، {user?.name || t('admin.dashboard.welcomeDefault')}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-label text-pretty">{t('admin.dashboard.description')}</p>
        </div>
        <div className="min-w-56">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-title">{t('admin.dashboard.statActiveHalls')}</span>
            <span className="tabular-nums text-label">{activeHalls}/{hallTotal}</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-emerald-100 dark:bg-emerald-500/15">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${activePercent}%` }} />
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 overflow-hidden rounded-xl border border-border bg-surface md:grid-cols-3 xl:grid-cols-6">
        {stats.map(stat => (
          <div key={stat.label} className="flex min-w-0 items-center gap-3 border-b border-e border-border p-4 last:border-e-0 md:p-5 xl:border-b-0">
            <stat.icon className={`h-5 w-5 flex-shrink-0 ${stat.color}`} strokeWidth={2} />
            <div className="min-w-0">
              <p className="text-xl font-bold tabular-nums text-title">{stat.value}</p>
              <p className="truncate text-xs text-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ─────────────────────────────────────────────────────────
          Detail Cards (Halls + Schedules)
          ───────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        {/* Halls Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <DoorOpen className="w-5 h-5" />
                <div className="absolute inset-0 rounded-xl bg-blue-500 opacity-0 hover:opacity-5 transition-opacity" />
              </div>
              <div className="min-w-0">
                <CardTitle>{t('admin.dashboard.hallsCard')}</CardTitle>
                <CardDescription>{t('admin.dashboard.hallsDesc', { count: hallTotal })}</CardDescription>
              </div>
            </div>
            <Badge variant="info" className="flex-shrink-0">{t('admin.dashboard.hallsActive', { count: activeHalls })}</Badge>
          </CardHeader>
          <CardContent padding="none">
            {halls.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mx-auto flex items-center justify-center mb-3">
                  <DoorOpen className="w-6 h-6 text-muted" />
                </div>
                <p className="text-sm text-muted">{t('admin.dashboard.hallsEmpty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {halls.slice(0, 6).map((hall, idx) => {
                  const active = hall.status === 'active'
                  const maintenance = hall.status === 'maintenance'
                  return (
                    <div
                      key={hall.id}
                      className="group flex items-center gap-4 px-5 md:px-6 py-4 hover:bg-hover/60 transition-colors animate-fade-in"
                      style={{ animationDelay: `${idx * 35}ms` }}
                    >
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/60 text-body flex items-center justify-center font-bold text-base flex-shrink-0">
                        {hall.name?.charAt(0)}
                        <div className={`absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full border-2 border-surface ${active ? 'bg-emerald-500' : maintenance ? 'bg-amber-500' : 'bg-slate-400'}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-title">{hall.name}</p>
                        <p className="mt-0.5 text-xs text-muted flex items-center gap-1.5">
                          <span className="truncate">{hall.building || t('admin.dashboard.buildingUnknown')}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex-shrink-0">{t('admin.dashboard.floor', { floor: hall.floor })}</span>
                          <span className="text-slate-300 dark:text-slate-700">•</span>
                          <span className="flex-shrink-0">{t('capacity.students', { count: hall.capacity })}</span>
                        </p>
                      </div>
                      <Badge variant={active ? 'success' : maintenance ? 'warning' : 'default'} dot className="flex-shrink-0">
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
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <CardTitle>{t('admin.dashboard.schedulesCard')}</CardTitle>
                <CardDescription>{t('admin.dashboard.schedulesDesc', { count: scheduleTotal })}</CardDescription>
              </div>
            </div>
            <Badge variant="primary" className="flex-shrink-0">{t('admin.dashboard.schedulesTotal', { count: scheduleTotal })}</Badge>
          </CardHeader>
          <CardContent padding="none">
            {schedules.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800/60 mx-auto flex items-center justify-center mb-3">
                  <CalendarDays className="w-6 h-6 text-muted" />
                </div>
                <p className="text-sm text-muted">{t('admin.dashboard.schedulesEmpty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {schedules.slice(0, 6).map((schedule, idx) => (
                  <div
                    key={schedule.id}
                    className="group flex items-center gap-4 px-5 md:px-6 py-4 hover:bg-hover/60 transition-colors animate-fade-in"
                    style={{ animationDelay: `${idx * 35}ms` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-500/15 dark:to-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center flex-shrink-0">
                      <CalendarDays className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-title">
                        {schedule.courseId?.name || schedule.courseId?.code || t('admin.dashboard.courseUnknown')}
                      </p>
                      <p className="mt-0.5 text-xs text-muted flex items-center gap-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="flex-shrink-0">{t('day.' + schedule.day) || schedule.day}</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="tabular-nums flex-shrink-0">{schedule.startTime} – {schedule.endTime}</span>
                      </p>
                    </div>
                    <Badge variant={schedule.weekPattern === 'weekly' ? 'default' : 'warning'} className="flex-shrink-0">
                      {weekLabel(schedule.weekPattern)}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </section>
    </div>
  )
}
