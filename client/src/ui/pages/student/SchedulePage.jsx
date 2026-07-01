import { useEffect, useState } from 'react'
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
const DAY_LABELS = { saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' }
const DAY_STYLES = {
  saturday: { title: 'text-blue-700', bg: 'bg-blue-50', course: 'text-blue-800', time: 'text-blue-600', hall: 'text-blue-500' },
  sunday: { title: 'text-emerald-700', bg: 'bg-emerald-50', course: 'text-emerald-800', time: 'text-emerald-600', hall: 'text-emerald-500' },
  monday: { title: 'text-indigo-700', bg: 'bg-indigo-50', course: 'text-indigo-800', time: 'text-indigo-600', hall: 'text-indigo-500' },
  tuesday: { title: 'text-violet-700', bg: 'bg-violet-50', course: 'text-violet-800', time: 'text-violet-600', hall: 'text-violet-500' },
  wednesday: { title: 'text-amber-700', bg: 'bg-amber-50', course: 'text-amber-800', time: 'text-amber-600', hall: 'text-amber-500' },
  thursday: { title: 'text-rose-700', bg: 'bg-rose-50', course: 'text-rose-800', time: 'text-rose-600', hall: 'text-rose-500' },
}

export default function StudentSchedule() {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/schedules')
      .then(r => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Skeleton type="card" count={6} />

  const handleExportPdf = () => downloadFile('/schedules/export/pdf', 'my-schedule.pdf')
  const handleExportExcel = () => downloadFile('/schedules/export/excel', 'my-schedule.xlsx')

  return (
    <div className="space-y-6 animate-fade-in print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">جدولي الدراسي</h1>
          <CardDescription>عرض جميع محاضراتي المسجلة</CardDescription>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={schedules.length === 0}>
            <FileText className="w-4 h-4 ml-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={schedules.length === 0}>
            <FileSpreadsheet className="w-4 h-4 ml-1" />Excel
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title="طباعة">
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={CalendarDays} title="لا توجد محاضرات" description="لم يتم تسجيل أي محاضرات لك بعد." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const daySchedules = schedules.filter(s => s.day === day)
            const styles = DAY_STYLES[day]
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className={styles.title}>{DAY_LABELS[day]}</CardTitle>
                  <span className="text-xs text-slate-400">{daySchedules.length} محاضرة</span>
                </CardHeader>
                <CardContent>
                  {daySchedules.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-4">لا توجد محاضرات</p>
                  ) : (
                    <div className="space-y-2">
                      {daySchedules.map(sch => (
                        <div key={sch.id} className={cn('p-3 rounded-lg text-sm hover:shadow-sm transition-all', styles.bg)}>
                          <p className={cn('font-medium', styles.course)}>{sch.courseId?.name || sch.courseId?.code}</p>
                          <p className={cn('text-xs mt-1', styles.time)}>{sch.startTime} - {sch.endTime}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className={cn('text-xs', styles.hall)}>{sch.hallId?.name}</span>
                            <Badge variant={sch.weekPattern === 'weekly' ? 'default' : 'warning'}>
                              {sch.weekPattern === 'weekly' ? 'أسبوعي' : sch.weekPattern === 'odd' ? 'فردي' : 'زوجي'}
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
