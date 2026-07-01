import { useEffect, useState } from 'react'
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
import { cn } from '../../lib/utils'
import api from '../../../infrastructure/api/axios'
import { downloadFile } from '../../../infrastructure/api/download'

const DAYS = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday']
const DAY_LABELS = { saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' }
const WEEK_LABELS = { weekly: 'أسبوعي', odd: 'فردي', even: 'زوجي' }
const DAY_STYLES = {
  saturday: { bar: 'bg-blue-500', title: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
  sunday: { bar: 'bg-emerald-500', title: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-600' },
  monday: { bar: 'bg-indigo-500', title: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-100', text: 'text-indigo-600' },
  tuesday: { bar: 'bg-violet-500', title: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-100', text: 'text-violet-600' },
  wednesday: { bar: 'bg-amber-500', title: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
  thursday: { bar: 'bg-rose-500', title: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-600' },
}

export default function AdminSchedules() {
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
      toast.success('تم إضافة المحاضرة بنجاح')
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ')
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm('هل أنت متأكد من حذف هذه المحاضرة؟')
    if (!ok) return
    try {
      await deleteSchedule(id)
      toast.success('تم الحذف')
    } catch { toast.error('حدث خطأ') }
  }

  const handleExportPdf = () => downloadFile('/schedules/export/pdf', 'schedules.pdf')
  const handleExportExcel = () => downloadFile('/schedules/export/excel', 'schedules.xlsx')

  if (loading) return <Skeleton type="card" count={6} />

  const groupedByDay = {}
  DAYS.forEach(d => { groupedByDay[d] = schedules.filter(s => s.day === d) })
  const totalSchedules = schedules.length

  return (
    <div className="space-y-6 animate-fade-in print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">الجداول الدراسية</h1>
          <CardDescription>إدارة مواعيد المحاضرات والقاعات</CardDescription>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={totalSchedules === 0}>
            <FileText className="w-4 h-4 ml-1" />PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={totalSchedules === 0}>
            <FileSpreadsheet className="w-4 h-4 ml-1" />Excel
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title="طباعة">
            <Printer className="w-4 h-4" />
          </Button>
          <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ml-2" />إضافة محاضرة</Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={viewMode === 'grid' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('grid')}>
          <LayoutGrid className="w-4 h-4 ml-1" />مجموعات
        </Button>
        <Button variant={viewMode === 'list' ? 'primary' : 'outline'} size="sm" onClick={() => setViewMode('list')}>
          <List className="w-4 h-4 ml-1" />قائمة
        </Button>
      </div>

      {totalSchedules === 0 ? (
        <EmptyState icon={CalendarDays} title="لا توجد جداول" description="لم يتم إضافة أي محاضرة بعد. أضف أول محاضرة لبدء تنظيم الجدول." action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ml-2" />إضافة محاضرة</Button>} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.map(day => {
            const style = DAY_STYLES[day]
            return (
              <Card key={day}>
                <CardHeader>
                  <CardTitle className={style.title}>{DAY_LABELS[day]}</CardTitle>
                  <span className="text-xs text-slate-400">{(groupedByDay[day] || []).length} محاضرة</span>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {(groupedByDay[day] || []).length === 0 && (
                      <p className="text-sm text-slate-400 text-center py-4">لا توجد محاضرات</p>
                    )}
                    {(groupedByDay[day] || []).map(sch => (
                      <div key={sch.id} className={cn('p-3 rounded-lg text-sm hover:shadow-sm transition-all border', style.bg, style.border)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-900">{sch.courseId?.name || sch.courseId?.code || 'مادة'}</p>
                            <p className={cn('text-xs mt-1', style.text)}>{sch.startTime} - {sch.endTime}</p>
                            <p className="text-slate-500 text-xs">{sch.hallId?.name || 'مدرج'}</p>
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <Badge variant={sch.weekPattern === 'weekly' ? 'default' : sch.weekPattern === 'odd' ? 'warning' : 'info'}>
                              {WEEK_LABELS[sch.weekPattern] || sch.weekPattern}
                            </Badge>
                            <button onClick={() => handleDelete(sch.id)} className="text-red-400 hover:text-red-600 transition-colors cursor-pointer p-1 rounded-lg hover:bg-red-100" aria-label="حذف المحاضرة">
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
                <tr className="border-b bg-slate-50">
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">المادة</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">اليوم</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">الوقت</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">المدرج</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-600">النمط</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-600">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map(sch => (
                  <tr key={sch.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{sch.courseId?.name || sch.courseId?.code || 'مادة'}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{DAY_LABELS[sch.day]}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{sch.startTime} - {sch.endTime}</td>
                    <td className="px-4 py-3 text-sm text-slate-500">{sch.hallId?.name || 'مدرج'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={sch.weekPattern === 'weekly' ? 'default' : sch.weekPattern === 'odd' ? 'warning' : 'info'}>
                        {WEEK_LABELS[sch.weekPattern] || sch.weekPattern}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-left">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(sch.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
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

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="إضافة محاضرة" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-course" className="block text-sm font-medium text-slate-700 mb-1">المادة</label>
              <Select id="sch-course" options={courses.map(c => ({ value: c.id, label: `${c.code} - ${c.name}` }))} value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} placeholder="اختر المادة" />
            </div>
            <div>
              <label htmlFor="sch-hall" className="block text-sm font-medium text-slate-700 mb-1">المدرج</label>
              <Select id="sch-hall" options={halls.filter(h => h.status === 'active').map(h => ({ value: h.id, label: `${h.name} (${h.capacity})` }))} value={form.hallId} onChange={e => setForm({ ...form, hallId: e.target.value })} placeholder="اختر المدرج" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-day" className="block text-sm font-medium text-slate-700 mb-1">اليوم</label>
              <Select id="sch-day" options={DAYS.map(d => ({ value: d, label: DAY_LABELS[d] }))} value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sch-pattern" className="block text-sm font-medium text-slate-700 mb-1">النمط</label>
              <Select id="sch-pattern" options={[{ value: 'weekly', label: 'أسبوعي' }, { value: 'odd', label: 'فردي' }, { value: 'even', label: 'زوجي' }]} value={form.weekPattern} onChange={e => setForm({ ...form, weekPattern: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sch-start" className="block text-sm font-medium text-slate-700 mb-1">بداية</label>
              <Input id="sch-start" type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })} />
            </div>
            <div>
              <label htmlFor="sch-end" className="block text-sm font-medium text-slate-700 mb-1">نهاية</label>
              <Input id="sch-end" type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label htmlFor="sch-semester" className="block text-sm font-medium text-slate-700 mb-1">الفصل الدراسي</label>
            <Input id="sch-semester" value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">إضافة</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
