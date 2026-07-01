import { useEffect, useMemo, useState } from 'react'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useConfirm } from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import api from '../../../infrastructure/api/axios'
import { CheckCircle, RefreshCw, SwitchCamera, XCircle } from 'lucide-react'

const DAY_LABELS = { saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' }
const statusConfig = {
  pending: { label: 'قيد الانتظار', variant: 'warning' },
  approved: { label: 'تمت الموافقة', variant: 'success' },
  rejected: { label: 'مرفوض', variant: 'danger' }
}

function getScheduleTitle(schedule) {
  if (!schedule) return 'محاضرة غير محددة'
  return schedule.courseId?.name || schedule.courseId?.code || 'محاضرة'
}

function getOriginalText(schedule) {
  if (!schedule) return '-'
  const day = DAY_LABELS[schedule.day] || schedule.day
  const hall = schedule.hallId?.name || 'قاعة غير محددة'
  return `${day} ${schedule.startTime}-${schedule.endTime} في ${hall}`
}

function getProposalText(swap) {
  const parts = []
  if (swap.proposedDay) parts.push(DAY_LABELS[swap.proposedDay] || swap.proposedDay)
  if (swap.proposedStartTime && swap.proposedEndTime) parts.push(`${swap.proposedStartTime}-${swap.proposedEndTime}`)
  if (swap.proposedHallId?.name) parts.push(`في ${swap.proposedHallId.name}`)
  return parts.length ? parts.join(' ') : 'لم يتم تحديد بديل'
}

export default function AdminSwaps() {
  const [swaps, setSwaps] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const { confirm, ConfirmModal } = useConfirm()

  const [fetchError, setFetchError] = useState(null)

  const fetchSwaps = async () => {
    setFetchError(null)
    try {
      const { data } = await api.get('/swaps')
      setSwaps(data.data || [])
    } catch (err) {
      setFetchError(err)
      setSwaps([])
    }
  }

  useEffect(() => {
    fetchSwaps().finally(() => setLoading(false))
  }, [])

  const pendingCount = useMemo(() => swaps.filter(swap => swap.status === 'pending').length, [swaps])

  const respond = async (swapId, action) => {
    const isApprove = action === 'approve'
    const ok = await confirm(isApprove
      ? 'هل أنت متأكد من الموافقة على طلب التبديل هذا؟'
      : 'هل أنت متأكد من رفض طلب التبديل هذا؟')
    if (!ok) return

    setSavingId(`${swapId}-${action}`)
    try {
      await api.put(`/swaps/${swapId}/respond`, { action })
      toast.success(isApprove ? 'تمت الموافقة على الطلب' : 'تم رفض الطلب')
      await fetchSwaps()
    } catch (error) {
      const msg = error.response?.data?.message
      if (error.response?.status === 404) {
        toast.error('لم يعد الطلب موجوداً')
      } else if (error.response?.status === 409) {
        toast.error('تعذر التحديث — المدرج أو الوقت محجوز بالفعل')
      } else {
        toast.error(msg || 'تعذر تحديث الطلب')
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <Skeleton type="card" count={4} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">طلبات التبديل</h1>
          <CardDescription>مراجعة طلبات تبديل مواعيد المحاضرات والقاعات والموافقة عليها</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={pendingCount > 0 ? 'warning' : 'success'} size="lg">{pendingCount} معلق</Badge>
          <Button variant="outline" size="icon" onClick={fetchSwaps} aria-label="تحديث الطلبات">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {fetchError ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="p-3 rounded-full bg-red-50">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">تعذر تحميل الطلبات</p>
                <p className="text-sm text-slate-500 mt-1">حدث خطأ في الاتصال. حاول مرة أخرى.</p>
              </div>
              <Button variant="outline" onClick={fetchSwaps}><RefreshCw className="w-4 h-4 me-2" />إعادة المحاولة</Button>
            </div>
          </CardContent>
        </Card>
      ) : swaps.length === 0 ? (
        <EmptyState icon={SwitchCamera} title="لا توجد طلبات تبديل" description="لا توجد طلبات تحتاج إلى مراجعة حالياً." />
      ) : (
        <div className="space-y-3">
          {swaps.map(swap => {
            const cfg = statusConfig[swap.status] || { label: swap.status, variant: 'default' }
            const requester = swap.requesterId?.name || swap.requesterId?.email || 'مستخدم غير محدد'
            const disabled = swap.status !== 'pending'
            return (
              <Card key={swap.id} hover>
                <CardContent>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{getScheduleTitle(swap.originalScheduleId)}</h3>
                        <Badge variant={cfg.variant} dot>{cfg.label}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-slate-50 p-3">
                          <p className="text-xs text-slate-400 mb-1">الموعد الحالي</p>
                          <p className="font-medium text-slate-800">{getOriginalText(swap.originalScheduleId)}</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-400 mb-1">الموعد المقترح</p>
                          <p className="font-medium text-blue-900">{getProposalText(swap)}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-slate-500">
                        مقدم الطلب: <span className="font-medium text-slate-700 truncate">{requester}</span>
                        {swap.reason && <span className="truncate"> - السبب: {swap.reason}</span>}
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        disabled={disabled}
                        loading={savingId === `${swap.id}-reject`}
                        onClick={() => respond(swap.id, 'reject')}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <XCircle className="w-4 h-4 me-1" />
                        رفض
                      </Button>
                      <Button
                        disabled={disabled}
                        loading={savingId === `${swap.id}-approve`}
                        onClick={() => respond(swap.id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 me-1" />
                        موافقة
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <ConfirmModal />
    </div>
  )
}
