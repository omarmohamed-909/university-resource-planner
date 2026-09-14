import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { CalendarDays, FileText, FileSpreadsheet, Printer } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { downloadFile } from '../../../infrastructure/api/download'
import { cn } from '../../lib/utils'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
const DAY_STYLES = {
  saturday: { title: 'text-blue-600', bg: 'bg-blue-500/10', course: 'text-blue-600', time: 'text-blue-500', hall: 'text-blue-500' },
  sunday: { title: 'text-emerald-600', bg: 'bg-emerald-500/10', course: 'text-emerald-600', time: 'text-emerald-500', hall: 'text-emerald-500' },
  monday: { title: 'text-indigo-600', bg: 'bg-indigo-500/10', course: 'text-indigo-600', time: 'text-indigo-500', hall: 'text-indigo-500' },
  tuesday: { title: 'text-violet-600', bg: 'bg-violet-500/10', course: 'text-violet-600', time: 'text-violet-500', hall: 'text-violet-500' },
  wednesday: { title: 'text-amber-600', bg: 'bg-amber-500/10', course: 'text-amber-600', time: 'text-amber-500', hall: 'text-amber-500' },
  thursday: { title: 'text-rose-600', bg: 'bg-rose-500/10', course: 'text-rose-600', time: 'text-rose-500', hall: 'text-rose-500' },
}

export default function StudentSchedule() {
  const { t } = useTranslation()
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
    api.get('/schedules?limit=100')
      .then(r => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton type="card" count={6} />

  const handleExportPdf = () => downloadFile('/schedules/export/pdf', 'my-schedule.pdf')
  const handleExportExcel = () => downloadFile('/schedules/export/excel', 'my-schedule.xlsx')

  return (
    <div className="space-y-6 print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('student.schedule.title')}</h1>
          <CardDescription>{t('student.schedule.description')}</CardDescription>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={schedules.length === 0}>
            <FileText className="w-4 h-4 ms-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={schedules.length === 0}>
            <FileSpreadsheet className="w-4 h-4 ms-1" />Excel
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title={t('common.print')}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={CalendarDays} title={t('student.schedule.emptyTitle')} description={t('student.schedule.emptyDescription')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySchedules = schedules.filter(s => s.day === day)
            const styles = DAY_STYLES[day]
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className={styles.title}>{dayLabels[day]}</CardTitle>
                  <span className="text-xs text-muted">{t('student.schedule.lectureCount', { count: daySchedules.length })}</span>
                </CardHeader>
                <CardContent>
                  {daySchedules.length === 0 ? (
                    <p className="text-sm text-muted text-center py-4">{t('student.schedule.noLectures')}</p>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map(sch => (
                        <div key={sch.id} className={cn('p-3 rounded-lg text-sm hover:shadow-sm transition-all', styles.bg)}>
                          <p className={cn('font-medium', styles.course)}>{sch.courseId?.name || sch.courseId?.code}</p>
                          <p className={cn('text-xs mt-1', styles.time)}>{sch.startTime} - {sch.endTime}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={cn('text-xs', styles.hall)}>{sch.hallId?.name}</span>
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
            )
          })}
        </div>
      )}
    </div>
  )
}
