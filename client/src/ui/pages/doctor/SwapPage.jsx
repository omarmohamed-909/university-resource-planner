import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
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

export default function DoctorSwap() {
  const { t } = useTranslation()
  const [swaps, setSwaps] = useState([])
  const [schedules, setSchedules] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    originalScheduleId: '', proposedHallId: '', proposedDay: '', proposedStartTime: '', proposedEndTime: '', reason: ''
  })

  const dayLabels = {
    saturday: t('day.saturday'),
    sunday: t('day.sunday'),
    monday: t('day.monday'),
    tuesday: t('day.tuesday'),
    wednesday: t('day.wednesday'),
    thursday: t('day.thursday'),
  }

  const statusConfig = {
    pending: { label: t('status.pending'), variant: 'warning' },
    approved: { label: t('status.approved'), variant: 'success' },
    rejected: { label: t('status.rejected'), variant: 'danger' }
  }

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
      toast.success(t('doctor.swap.toast.submitted'))
      setModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || t('doctor.swap.toast.error'))
    }
  }

  if (loading) return <Skeleton type="card" count={3} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-title tracking-tight text-balance">{t('doctor.swap.title')}</h1>
          <CardDescription>{t('doctor.swap.description')}</CardDescription>
        </div>
        <Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ms-2" />{t('doctor.swap.requestButton')}</Button>
      </div>

      {swaps.length === 0 ? (
        <EmptyState icon={SwitchCamera} title={t('doctor.swap.emptyTitle')} description={t('doctor.swap.emptyDescription')} action={<Button onClick={() => setModalOpen(true)}><Plus className="w-4 h-4 ms-2" />{t('doctor.swap.requestButton')}</Button>} />
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
                      <p className="font-medium text-title">{t('doctor.swap.requestCard')}</p>
                      <p className="text-sm text-label">
                        {swap.originalScheduleId?.courseId?.name || t('doctor.swap.courseUnknown')}
                        {swap.proposedDay && t('doctor.swap.to', { day: dayLabels[swap.proposedDay] || swap.proposedDay })}
                        {swap.proposedHallId && t('doctor.swap.toHall', { hall: swap.proposedHallId?.name || t('doctor.swap.hallNew') })}
                      </p>
                      {swap.reason && <p className="text-xs text-muted mt-1">{t('doctor.swap.reason', { reason: swap.reason })}</p>}
                    </div>
                  </div>
                  <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={t('doctor.swap.modalTitle')} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formLecture')}</label>
            <Select options={schedules.map(s => ({
              value: s.id,
              label: `${s.courseId?.name || s.courseId?.code} - ${dayLabels[s.day]} ${s.startTime}-${s.endTime}`
            }))} value={form.originalScheduleId} onChange={e => setForm({ ...form, originalScheduleId: e.target.value })} placeholder={t('doctor.swap.formLecturePlaceholder')} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formHall')}</label>
              <Select options={halls.filter(h => h.status === 'active').map(h => ({ value: h.id, label: h.name }))} value={form.proposedHallId} onChange={e => setForm({ ...form, proposedHallId: e.target.value })} placeholder={t('doctor.swap.formHallPlaceholder')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formDay')}</label>
              <Select options={Object.entries(dayLabels).map(([v, l]) => ({ value: v, label: l }))} value={form.proposedDay} onChange={e => setForm({ ...form, proposedDay: e.target.value })} placeholder={t('doctor.swap.formDayPlaceholder')} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formStart')}</label>
              <Input type="time" value={form.proposedStartTime} onChange={e => setForm({ ...form, proposedStartTime: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formEnd')}</label>
              <Input type="time" value={form.proposedEndTime} onChange={e => setForm({ ...form, proposedEndTime: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('doctor.swap.formReason')}</label>
            <textarea className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-title focus:ring-4 focus:ring-slate-900/10 focus:border-active outline-none transition-all" rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder={t('doctor.swap.formReasonPlaceholder')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{t('doctor.swap.submitButton')}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
