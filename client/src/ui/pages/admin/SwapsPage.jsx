import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useConfirm } from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import api from '../../../infrastructure/api/axios'
import { CheckCircle, RefreshCw, SwitchCamera, XCircle } from 'lucide-react'

const statusConfig = {
  pending: { variant: 'warning' },
  approved: { variant: 'success' },
  rejected: { variant: 'danger' }
}

function getScheduleTitle(schedule, t) {
  if (!schedule) return t('admin.swaps.scheduleUnknown')
  return schedule.courseId?.name || schedule.courseId?.code || t('admin.swaps.lecture')
}

function getOriginalText(schedule, t) {
  if (!schedule) return '-'
  const day = t(`day.${schedule.day}`, schedule.day)
  const hall = schedule.hallId?.name || t('admin.swaps.hallUnknown')
  return t('admin.swaps.scheduleInfo', { day, time: `${schedule.startTime}-${schedule.endTime}`, hall })
}

function getProposalText(swap, t) {
  const parts = []
  if (swap.proposedDay) parts.push(t(`day.${swap.proposedDay}`, swap.proposedDay))
  if (swap.proposedStartTime && swap.proposedEndTime) parts.push(`${swap.proposedStartTime}-${swap.proposedEndTime}`)
  if (swap.proposedHallId?.name) parts.push(t('admin.swaps.atHall', { hall: swap.proposedHallId.name }))
  return parts.length ? parts.join(' ') : t('admin.swaps.noProposal')
}

export default function AdminSwaps() {
  const { t } = useTranslation()
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
    const ok = await confirm(isApprove ? t('admin.swaps.confirmApprove') : t('admin.swaps.confirmReject'))
    if (!ok) return

    setSavingId(`${swapId}-${action}`)
    try {
      await api.put(`/swaps/${swapId}/respond`, { action })
      toast.success(isApprove ? t('admin.swaps.toast.approved') : t('admin.swaps.toast.rejected'))
      await fetchSwaps()
    } catch (error) {
      const msg = error.response?.data?.message
      if (error.response?.status === 404) {
        toast.error(t('common.error.notFound'))
      } else if (error.response?.status === 409) {
        toast.error(t('admin.swaps.toast.conflict'))
      } else {
        toast.error(msg || t('admin.swaps.toast.error'))
      }
    } finally {
      setSavingId(null)
    }
  }

  if (loading) return <Skeleton type="card" count={4} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('admin.swaps.title')}</h1>
          <CardDescription className="mt-1.5 text-pretty">{t('admin.swaps.description')}</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={pendingCount > 0 ? 'warning' : 'success'} size="lg">{t('admin.swaps.pending', { count: pendingCount })}</Badge>
          <Button variant="outline" size="icon" onClick={fetchSwaps} aria-label={t('common.refresh')}>
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
                <p className="font-semibold text-title">{t('common.error.loadData')}</p>
                <p className="text-sm text-label mt-1">{t('common.error.tryAgain')}</p>
              </div>
              <Button variant="outline" onClick={fetchSwaps}><RefreshCw className="w-4 h-4 me-2" />{t('common.retry')}</Button>
            </div>
          </CardContent>
        </Card>
      ) : swaps.length === 0 ? (
        <EmptyState icon={SwitchCamera} title={t('admin.swaps.emptyTitle')} description={t('admin.swaps.emptyDescription')} />
      ) : (
        <div className="space-y-3">
          {swaps.map(swap => {
            const cfg = statusConfig[swap.status] || { label: swap.status, variant: 'default' }
            const requester = swap.requesterId?.name || swap.requesterId?.email || t('admin.swaps.requesterUnknown')
            const disabled = swap.status !== 'pending'
            return (
              <Card key={swap.id} hover>
                <CardContent>
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-title">{getScheduleTitle(swap.originalScheduleId, t)}</h3>
                        <Badge variant={cfg.variant} dot>{t(`status.${swap.status}`)}</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="rounded-lg bg-surface p-3">
                          <p className="text-xs text-muted mb-1">{t('admin.swaps.currentSchedule')}</p>
                          <p className="font-medium text-title">{getOriginalText(swap.originalScheduleId, t)}</p>
                        </div>
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-xs text-blue-400 mb-1">{t('admin.swaps.proposedSchedule')}</p>
                          <p className="font-medium text-blue-900">{getProposalText(swap, t)}</p>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-label">
                        {t('admin.swaps.requester', { name: requester })}
                        {swap.reason && t('admin.swaps.reason', { reason: swap.reason })}
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
                        {t('admin.swaps.rejectButton')}
                      </Button>
                      <Button
                        disabled={disabled}
                        loading={savingId === `${swap.id}-approve`}
                        onClick={() => respond(swap.id, 'approve')}
                      >
                        <CheckCircle className="w-4 h-4 me-1" />
                        {t('admin.swaps.approveButton')}
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
