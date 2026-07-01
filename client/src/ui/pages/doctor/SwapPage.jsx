import { useEffect, useState } from 'react'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import toast from 'react-hot-toast'
import api from '../../../infrastructure/api/axios'
import { SwitchCamera, Plus } from 'lucide-react'

const DAY_LABELS = { saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' }
const statusConfig = {
  pending: { label: 'قيد الانتظار', variant: 'warning' },
  approved: { label: 'تمت الموافقة', variant: 'success' },
  rejected: { label: 'مرفوض', variant: 'danger' }
}

export default function DoctorSwap() {
  const [swaps, setSwaps] = useState([])
  const [schedules, setSchedules] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    originalScheduleId: '', proposedHallId: '', proposedDay: '', proposedStartTime: '', proposedEndTime: '', reason: ''
  })

  const fetchData = async () => {
    try {
      const [sRes, hRes, swapRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/halls'),
        api.get('/swaps')
      ])
      setSchedules(sRes.data.data || [])
      setHalls(hRes.data.data || [])
      setSwaps(swapRes.data.data || [])
    } catch {}
  }

  useEffect(() => { fetchData().finally(() => setLoading(false)) }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/swaps', form)
      toast.success('تم تقديم طلب التبديل')
      setModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ')
    }
  }

  if (loading) return <Skeleton type="card" count={3} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">طلبات التبديل</h1>
          <CardDescription>إدارة طلبات تبديل المواعيد والمدرجات</CardDescription>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ml-2" />طلب تبديل</Button>
      </div>

      {swaps.length === 0 ? (
        <EmptyState icon={SwitchCamera} title="لا توجد طلبات تبديل" description="لم تقم بتقديم أي طلب تبديل بعد." action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ml-2" />طلب تبديل</Button>} />
      ) : (
        <div className="space-y-3">
          {swaps.map(swap => {
            const cfg = statusConfig[swap.status] || { label: swap.status, variant: 'default' }
            return (
              <Card key={swap._id || swap.id} hover>
                <CardContent className="p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="p-2 rounded-lg bg-blue-100 shrink-0"><SwitchCamera className="w-5 h-5 text-blue-600" /></div>
                    <div className="min-w-0">
                      <p className="font-medium text-slate-900">طلب تبديل</p>
                      <p className="text-sm text-slate-500">
                        {swap.originalScheduleId?.courseId?.name || 'مادة'}
                        {swap.proposedDay && ` إلى ${DAY_LABELS[swap.proposedDay]}`}
                        {swap.proposedHallId && ` إلى ${swap.proposedHallId?.name || 'مدرج جديد'}`}
                      </p>
                      {swap.reason && <p className="text-xs text-slate-400 mt-1">السبب: {swap.reason}</p>}
                    </div>
                  </div>
                  <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="طلب تبديل" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">المحاضرة الأصلية</label>
            <Select options={schedules.map(s => ({
              value: s.id,
              label: `${s.courseId?.name || s.courseId?.code} - ${DAY_LABELS[s.day]} ${s.startTime}-${s.endTime}`
            }))} value={form.originalScheduleId} onChange={e => setForm({ ...form, originalScheduleId: e.target.value })} placeholder="اختر المحاضرة" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">المدرج البديل</label>
              <Select options={halls.filter(h => h.status === 'active').map(h => ({ value: h.id, label: h.name }))} value={form.proposedHallId} onChange={e => setForm({ ...form, proposedHallId: e.target.value })} placeholder="اختر المدرج" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">اليوم البديل</label>
              <Select options={Object.entries(DAY_LABELS).map(([v, l]) => ({ value: v, label: l }))} value={form.proposedDay} onChange={e => setForm({ ...form, proposedDay: e.target.value })} placeholder="اختر اليوم" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوقت البديل (بداية)</label>
              <Input type="time" value={form.proposedStartTime} onChange={e => setForm({ ...form, proposedStartTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الوقت البديل (نهاية)</label>
              <Input type="time" value={form.proposedEndTime} onChange={e => setForm({ ...form, proposedEndTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السبب</label>
            <textarea className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:ring-4 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="اذكر سبب طلب التبديل" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">إرسال الطلب</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
