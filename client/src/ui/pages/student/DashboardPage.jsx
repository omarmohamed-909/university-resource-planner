import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, ClipboardCheck, Sparkles } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { useAuthStore } from '../../store/authStore'

const dayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const monthKeys = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december']

export default function StudentDashboard() {
  const { t } = useTranslation()
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
    { label: t('student.dashboard.statEnrolled'), value: uniqueCourses,    icon: BookOpen,      color: 'text-violet-600',  bg: 'bg-violet-50',  accent: 'bg-violet-500',  dark: 'dark:bg-violet-500/15 dark:text-violet-400' },
    { label: t('student.dashboard.statWeekly'),   value: schedules.length, icon: CalendarDays,  color: 'text-blue-600',    bg: 'bg-blue-50',    accent: 'bg-blue-500',    dark: 'dark:bg-blue-500/15 dark:text-blue-400' },
    { label: t('student.dashboard.statDays'),     value: uniqueDays,       icon: ClipboardCheck, color: 'text-emerald-600', bg: 'bg-emerald-50', accent: 'bg-emerald-500', dark: 'dark:bg-emerald-500/15 dark:text-emerald-400' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Hero welcome banner */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-50/80 via-blue-50/40 to-transparent dark:from-violet-500/[0.06] dark:via-blue-500/[0.05] dark:to-transparent" />
          <div
            className="aurora-blob w-72 h-72 -top-24 -end-16"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)', animationDuration: '22s' }}
          />
          <div className="absolute inset-0 bg-grid bg-grid-fade opacity-30 dark:opacity-[0.15]" />
        </div>

        <div className="relative px-6 py-7 sm:px-8 sm:py-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface/80 backdrop-blur px-3 py-1.5 border border-border shadow-sm">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-violet-500" />
            </span>
            <span className="text-xs font-semibold text-muted">{formatDate(Date.now())}</span>
          </div>

          <h1 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-title text-balance">
            {t('student.dashboard.welcome', { name: user?.name })}
          </h1>
          <CardDescription className="mt-2 max-w-xl text-pretty">
            {t('student.dashboard.description')}
          </CardDescription>

          <div className="mt-5 flex flex-wrap gap-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface/70 border border-border text-[11px] font-semibold text-label backdrop-blur">
              <Sparkles className="w-3 h-3 text-violet-500" />
              {uniqueCourses} {t('student.dashboard.statEnrolled')}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
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
  )
}
