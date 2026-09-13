import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardDescription } from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import { CalendarDays, BookOpen, ClipboardCheck } from 'lucide-react'
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
    <div className="space-y-7">

      {/* Hero welcome banner */}
      <section className="border-b border-border pb-7">
          <p className="text-sm font-medium text-label">{formatDate(Date.now())}</p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.02em] text-title text-balance">
            {t('student.dashboard.welcome', { name: user?.name })}
          </h1>
          <CardDescription className="mt-2 max-w-2xl text-pretty">
            {t('student.dashboard.description')}
          </CardDescription>
      </section>

      {/* Stats */}
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
  )
}
