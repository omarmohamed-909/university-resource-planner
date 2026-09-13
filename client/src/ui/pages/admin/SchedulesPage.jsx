import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useScheduleStore } from '../../store/scheduleStore'
import { useHallStore } from '../../store/hallStore'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useConfirm } from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { Plus, CalendarDays, Trash2, LayoutGrid, List, FileText, FileSpreadsheet, Printer } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { downloadFile } from '../../../infrastructure/api/download'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
const DAY_STYLES = {
  saturday: { title: 'text-blue-600 dark:text-blue-400' },
  sunday: { title: 'text-emerald-600 dark:text-emerald-400' },
  monday: { title: 'text-indigo-600 dark:text-indigo-400' },
  tuesday: { title: 'text-violet-600 dark:text-violet-400' },
  wednesday: { title: 'text-amber-600 dark:text-amber-400' },
  thursday: { title: 'text-rose-600 dark:text-rose-400' },
}

export default function AdminSchedules() {
  const { t } = useTranslation()
  const { schedules, fetchSchedules, createSchedule, deleteSchedule } = useScheduleStore()
  const { halls, fetchHalls } = useHallStore()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewMode, setViewMode] = useState('grid')
  const [form, setForm] = useState({
    courseId: '', hallId: '', day: 'saturday', startTime: '08:00', endTime: '09:30', weekPattern: 'weekly', semester: '2026-1'
  })
  const { confirm, ConfirmModal } = useConfirm()

  useEffect(() => {
    Promise.all([
      fetchSchedules(),
      fetchHalls(),
      api.get('/courses').then(r => setCourses(Array.isArray(r.data.data) ? r.data.data : [])).catch(err => console.error('[SchedulesPage] courses:', err?.message))
    ]).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await createSchedule(form)
      toast.success(t('admin.schedules.toast.added'))
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.schedules.toast.error'))
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm(t('admin.schedules.confirmDelete'))
    if (!ok) return
    try {
      await deleteSchedule(id)
      toast.success(t('admin.schedules.toast.deleted'))
    } catch { toast.error(t('admin.schedules.toast.error')) }
  }

  const handleExportPdf = () => downloadFile('/schedules/export/pdf', 'schedules.pdf')
  const handleExportExcel = () => downloadFile('/schedules/export/excel', 'schedules.xlsx')

  if (loading) return <Skeleton type="card" count={6} />

  const groupedByDay = {}
  DAYS.forEach(d => { groupedByDay[d] = schedules.filter(s => s.day === d) })
  const totalSchedules = schedules.length

  return (
    <div className="space-y-6 print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('admin.schedules.title')}</h1>
          <CardDescription className="mt-1.5 text-pretty">{t('admin.schedules.description')}</CardDescription>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={totalSchedules === 0}>
            <FileText className="w-4 h-4 ms-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={totalSchedules === 0}>
            <FileSpreadsheet className="w-4 h-4 ms-1" />Excel
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title={t('common.print')}>
            <Printer className="w-4 h-4" />
          </Button>
          <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ms-2" />{t('admin.schedules.addButton')}</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
          <LayoutGrid className="w-4 h-4 ms-1" />{t('admin.schedules.viewGrid')}
        </Button>
        <Button variant={viewMode === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
          <List className="w-4 h-4 ms-1" />{t('admin.schedules.viewList')}
        </Button>
      </div>

      {totalSchedules === 0 ? (
        <EmptyState icon={CalendarDays} title={t('admin.schedules.emptyTitle')} description={t('admin.schedules.emptyDescription')} action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ms-2" />{t('admin.schedules.addButton')}</Button>} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const style = DAY_STYLES[day]
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className={style.title}>{t('day.' + day)}</CardTitle>
                  <span className="text-xs text-muted">{t('admin.schedules.lectureCount', { count: (groupedByDay[day] || []).length })}</span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(groupedByDay[day] || []).length === 0 && (
                      <p className="text-sm text-muted text-center py-4">{t('admin.schedules.noLectures')}</p>
                    )}
                    {(groupedByDay[day] || []).map(sch => (
                      <div key={sch.id} className="rounded-lg border border-border bg-hover/25 p-3 text-sm transition-colors hover:bg-hover/50">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-title">{sch.courseId?.name || sch.courseId?.code || t('admin.schedules.courseUnknown')}</p>
                            <p className="mt-1 text-xs font-medium text-primary-600 dark:text-blue-400">{sch.startTime} - {sch.endTime}</p>
                            <p className="text-label text-xs">{sch.hallId?.name || t('admin.schedules.hallUnknown')}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={sch.weekPattern === 'weekly' ? 'default' : sch.weekPattern === 'odd' ? 'warning' : 'info'}>
                              {t('weekPattern.' + sch.weekPattern)}
                            </Badge>
                            <button onClick={() => handleDelete(sch.id)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-500/20" aria-label={t('admin.schedules.deleteLabel')}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-surface">
                  <th className="text-start px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tableCourse')}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tableDay')}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tableTime')}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tableHall')}</th>
                  <th className="text-start px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tablePattern')}</th>
                  <th className="text-end px-4 py-3 text-sm font-medium text-body">{t('admin.schedules.tableActions')}</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id} className="border-b last:border-0 hover:bg-hover transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-title">{sch.courseId?.name || sch.courseId?.code || t('admin.schedules.courseUnknown')}</td>
                    <td className="px-4 py-3 text-sm text-label">{t('day.' + sch.day)}</td>
                    <td className="px-4 py-3 text-sm text-label">{sch.startTime} - {sch.endTime}</td>
                    <td className="px-4 py-3 text-sm text-label">{sch.hallId?.name || t('admin.schedules.hallUnknown')}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sch.weekPattern === 'weekly' ? 'default' : sch.weekPattern === 'odd' ? 'warning' : 'info'}>
                        {t('weekPattern.' + sch.weekPattern)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-end">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sch.id)} className="text-red-400 hover:text-red-600 hover:bg-red-500/20">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('admin.schedules.modalTitle')} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-course" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formCourse')}</label>
              <Select id="sch-course" options={courses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} placeholder={t('admin.schedules.formCoursePlaceholder')} />
            </div>
            <div>
              <label htmlFor="sch-hall" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formHall')}</label>
              <Select id="sch-hall" options={halls.filter(h => h.status === 'active').map(h => ({ value: h.id, label: `${h.name} (${h.capacity})` }))} value={form.hallId} onChange={e => setForm({ ...form, hallId: e.target.value })} placeholder={t('admin.schedules.formHallPlaceholder')} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-day" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formDay')}</label>
              <Select id="sch-day" options={DAYS.map(d => ({ value: d, label: t('day.' + d) }))} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sch-pattern" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formPattern')}</label>
              <Select id="sch-pattern" options={[
                { value: 'weekly', label: t('weekPattern.weekly') },
                { value: 'odd', label: t('weekPattern.odd') },
                { value: 'even', label: t('weekPattern.even') }
              ]} value={form.weekPattern} onChange={e => setForm({ ...form, weekPattern: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-start" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formStart')}</label>
              <Input id="sch-start" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sch-end" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formEnd')}</label>
              <Input id="sch-end" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label htmlFor="sch-semester" className="block text-sm font-medium text-body mb-1">{t('admin.schedules.formSemester')}</label>
            <Input id="sch-semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{t('admin.schedules.addButtonSubmit')}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
