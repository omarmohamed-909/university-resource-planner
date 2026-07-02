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
  TrendingUp,
  UserCog,
  Wrench,
  Sparkles,
} from 'lucide-react'

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

  const greeting = useMemo(() => {
    const h = new Date().getHours()
    if (h < 12) return t('admin.dashboard.greetingMorning', { defaultValue: 'Good morning' })
    if (h < 18) return t('admin.dashboard.greetingAfternoon', { defaultValue: 'Good afternoon' })
    return t('admin.dashboard.greetingEvening', { defaultValue: 'Good evening' })
  }, [t])

  const loading = hallLoading || scheduleLoading
  if (loading) return (
    <div className="space-y-6 animate-fade-in">
      <div className="h-44 rounded-3xl skeleton-shimmer" />
      <Skeleton type="card" count={6} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Skeleton type="table" rows={5} />
        <Skeleton type="table" rows={5} />
      </div>
    </div>
  )

  const activeHalls = halls.filter(h => h.status === 'active').length
  const maintenanceHalls = halls.filter(h => h.status === 'maintenance').length
  const totalHalls = halls.length || 1
  const activePercent = Math.round((activeHalls / totalHalls) * 100)

  const stats = [
    { label: t('admin.dashboard.statHalls'),        value: halls.length,    icon: DoorOpen,      color: 'text-blue-600',    bg: 'bg-blue-50',    accent: 'bg-blue-500',    trend: '+12%',              trendUp: true },
    { label: t('admin.dashboard.statSchedules'),    value: schedules.length, icon: CalendarDays, color: 'text-violet-600',  bg: 'bg-violet-50',  accent: 'bg-violet-500',  trend: '+8%',               trendUp: true },
    { label: t('admin.dashboard.statDoctors'),      value: doctorCount,     icon: GraduationCap, color: 'text-teal-600',    bg: 'bg-teal-50',    accent: 'bg-teal-500',    trend: '+3%',               trendUp: true },
    { label: t('admin.dashboard.statStudents'),     value: studentCount,    icon: UserCog,       color: 'text-indigo-600',  bg: 'bg-indigo-50',  accent: 'bg-indigo-500',  trend: '+24%',              trendUp: true },
    { label: t('admin.dashboard.statActiveHalls'),  value: activeHalls,     icon: Activity,      color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'bg-emerald-500', trend: `${activePercent}%`, trendUp: true },
    { label: t('admin.dashboard.statMaintenance'),  value: maintenanceHalls, icon: Wrench,       color: 'text-amber-600',   bg: 'bg-amber-50',   accent: 'bg-amber-500',   trend: '-2%',               trendUp: false },
  ]

  // Ring geometry
  const RING_R = 42
  const RING_CIRC = 2 * Math.PI * RING_R
  const ringOffset = RING_CIRC * (1 - activePercent / 100)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">

      {/* ─────────────────────────────────────────────────────────
          Hero Welcome Banner — elevated
          ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {/* Aurora backdrop */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/80 via-violet-50/40 to-transparent dark:from-blue-500/[0.06] dark:via-violet-500/[0.05] dark:to-transparent" />
          <div
            className="aurora-blob w-72 h-72 -top-24 -end-16"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', animationDuration: '22s' }}
          />
          <div
            className="aurora-blob w-64 h-64 -bottom-24 -start-10"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)', animationDuration: '26s', animationDelay: '-10s' }}
          />
          {/* Subtle grid */}
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 dark:opacity-[0.15]" />
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

            {/* Left: greeting + name */}
            <div className="min-w-0 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur px-3 py-1.5 border border-border shadow-sm">
                <span className="relative flex w-1.5 h-1.5">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60 animate-ping" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
                </span>
                <span className="text-xs font-semibold text-muted">{formatDate(Date.now())}</span>
              </div>

              <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-title text-balance">
                <span className="text-violet-600 dark:text-violet-400">{greeting}</span>
                <span className="text-muted mx-2">،</span>
                <span>{user?.name || t('admin.dashboard.welcomeDefault')}</span>
              </h1>

              <p className="mt-2.5 text-sm text-label leading-relaxed max-w-xl text-pretty">
                {t('admin.dashboard.description')}
              </p>

              {/* Mini stat chips under hero copy */}
              <div className="mt-5 flex flex-wrap gap-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/70 border border-border text-[11px] font-semibold text-label backdrop-blur">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  {t('admin.dashboard.hallsReady', { count: activeHalls })}
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/70 border border-border text-[11px] font-semibold text-label backdrop-blur">
                  <CalendarDays className="w-3 h-3 text-violet-500" />
                  {schedules.length} {t('admin.dashboard.schedulesCard')}
                </div>
              </div>
            </div>

            {/* Right: progress ring + meta */}
            <div className="flex items-center gap-5 flex-shrink-0 ps-6 lg:ps-8 lg:border-s lg:border-border">
              <div className="relative flex items-center justify-center w-20 h-20">
                {/* Soft halo behind ring */}
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-xl" />
                <svg className="relative w-20 h-20 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={RING_R} fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-100 dark:text-emerald-500/15" />
                  <circle
                    cx="50" cy="50" r={RING_R}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-emerald-500 transition-[stroke-dashoffset] duration-1000 ease-out"
                    strokeDasharray={RING_CIRC}
                    strokeDashoffset={ringOffset}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">{activePercent}%</p>
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-muted uppercase tracking-wide leading-tight">
                  {t('admin.dashboard.hallsReady', { count: activeHalls })}
                </p>
                <p className="mt-1.5 text-2xl font-extrabold text-title leading-none tabular-nums">
                  {activeHalls}
                  <span className="text-sm font-medium text-muted">/{halls.length}</span>
                </p>
                <div className="mt-2 flex items-center gap-1.5">
                  <span className="relative flex w-1.5 h-1.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">{t('admin.dashboard.statActiveHalls')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────
          Stats Grid — refined cards with staggered entrance
          ───────────────────────────────────────────────────────── */}
      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm hover-lift hover:border-active/40 animate-fade-in flex items-center gap-4"
            style={{ animationDelay: `${idx * 50}ms` }}
          >
            {/* Subtle top sheen */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-black/[0.04] to-transparent dark:via-white/[0.04]" />
            
            {/* Accent line on hover */}
            <div className={`absolute top-0 bottom-0 start-0 w-1 ${stat.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

            {/* Icon */}
            <div className={`relative w-12 h-12 rounded-xl ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className="w-6 h-6" strokeWidth={2} />
              <div className={`absolute inset-0 rounded-xl ${stat.accent} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-muted leading-tight truncate">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-extrabold text-title leading-none tabular-nums">{stat.value}</p>
                <div className={`inline-flex items-center gap-1 text-[11px] font-bold ${stat.trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  <TrendingUp className={`w-3 h-3 ${!stat.trendUp && 'rotate-180'} rtl:-scale-x-100`} />
                  <span dir="ltr">{stat.trend}</span>
                </div>
              </div>
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
                <CardDescription>{t('admin.dashboard.hallsDesc', { count: halls.length })}</CardDescription>
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
                <CardDescription>{t('admin.dashboard.schedulesDesc', { count: schedules.length })}</CardDescription>
              </div>
            </div>
            <Badge variant="primary" className="flex-shrink-0">{t('admin.dashboard.schedulesTotal', { count: schedules.length })}</Badge>
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
