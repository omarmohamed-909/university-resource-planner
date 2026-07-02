import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
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
  saturday: { box: 'bg-blue-500/10 border-blue-500/20', course: 'text-blue-600', hall: 'text-blue-500', time: 'text-blue-500' },
  sunday: { box: 'bg-emerald-500/10 border-emerald-500/20', course: 'text-emerald-600', hall: 'text-emerald-500', time: 'text-emerald-500' },
  monday: { box: 'bg-indigo-500/10 border-indigo-500/20', course: 'text-indigo-600', hall: 'text-indigo-500', time: 'text-indigo-500' },
  tuesday: { box: 'bg-violet-500/10 border-violet-500/20', course: 'text-violet-600', hall: 'text-violet-500', time: 'text-violet-500' },
  wednesday: { box: 'bg-amber-500/10 border-amber-500/20', course: 'text-amber-600', hall: 'text-amber-500', time: 'text-amber-500' },
  thursday: { box: 'bg-rose-500/10 border-rose-500/20', course: 'text-rose-600', hall: 'text-rose-500', time: 'text-rose-500' },
}

export default function DoctorSchedule() {
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
    api.get('/schedules')
      .then(r => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton type="card" count={6} />

  const handleExportPdf = () => downloadFile('/schedules/export/pdf', 'my-schedule.pdf')
  const handleExportExcel = () => downloadFile('/schedules/export/excel', 'my-schedule.xlsx')

  const timeSlots = ['08:00', '09:30', '11:00', '12:30', '14:00', '15:30']

  return (
    <div className="space-y-6 animate-fade-in print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-title tracking-tight text-balance">{t('doctor.schedule.title')}</h1>
          <CardDescription>{t('doctor.schedule.description')}</CardDescription>
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
        <EmptyState icon={CalendarDays} title={t('doctor.schedule.emptyTitle')} description={t('doctor.schedule.emptyDescription')} />
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b bg-surface">
                  <th className="text-center px-3 py-4 text-sm font-bold text-body w-28 border-e border-border">{t('doctor.schedule.tableDay')}</th>
                  {timeSlots.map(time => (
                    <th key={time} className="text-center px-3 py-4 text-sm font-semibold text-body min-w-[160px] border-e border-border last:border-e-0">{time}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map(day => {
                  const styles = DAY_STYLES[day]
                  return (
                    <tr key={day} className="border-b border-border last:border-0 hover:bg-hover/30 transition-colors">
                      <td className="text-center px-3 py-4 text-sm font-bold text-body border-e border-border">{dayLabels[day]}</td>
                      {timeSlots.map((time, idx) => {
                        const nextTime = timeSlots[idx + 1] || '23:59'
                        const slot = schedules.filter(s => s.day === day && s.startTime < nextTime && s.endTime > time)
                        return (
                          <td key={time} className="text-center px-2 py-2 align-top h-[120px] border-e border-border last:border-e-0">
                            {slot.length === 0 ? (
                              <div className="w-full h-full min-h-[80px] rounded-lg border border-dashed border-border bg-surface/50 flex items-center justify-center text-muted text-xs">
                                —
                              </div>
                            ) : (
                              <div className="flex flex-col gap-2 h-full">
                                {slot.map(s => (
                                  <div key={s.id} className={cn('border rounded-lg p-3 text-xs shadow-sm flex-1 flex flex-col justify-center', styles.box)}>
                                    <p className={cn('font-bold text-sm mb-1', styles.course)}>{s.courseId?.name || s.courseId?.code}</p>
                                    <p className={cn('font-medium mb-1', styles.hall)}>{s.hallId?.name}</p>
                                    <p className={styles.time}>{s.startTime} - {s.endTime}</p>
                                    <div className="mt-2">
                                      <Badge variant={s.weekPattern === 'weekly' ? 'default' : 'warning'}>
                                        {s.weekPattern === 'weekly' ? t('weekPattern.weekly') : s.weekPattern === 'odd' ? t('weekPattern.odd') : t('weekPattern.even')}
                                      </Badge>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
