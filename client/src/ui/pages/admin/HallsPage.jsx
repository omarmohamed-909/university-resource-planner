import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useHallStore } from '../../store/hallStore'
import { cn } from '../../lib/utils'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Pagination from '../../components/ui/Pagination'
import { useConfirm } from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, DoorOpen, Search, Filter, RefreshCw, XCircle } from 'lucide-react'
import { useHallAvailability } from './_useHallAvailability'

/* ─── Quick Status Selector ─── */
function StatusSelect({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none rounded-md border border-border bg-surface px-2.5 py-1.5 text-[11px] font-medium text-body outline-none transition-colors hover:border-active focus:border-active focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
      aria-label={t('admin.halls.toast.statusError')}
    >
      <option value="active">{t('status.active')}</option>
      <option value="maintenance">{t('status.maintenance')}</option>
      <option value="inactive">{t('status.inactive')}</option>
    </select>
  )
}

/* ─── Availability Badge ─── */
function AvailabilityBadge({ status, label }) {
  return (
    <span
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        status === 'available' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        status === 'occupied' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        status === 'unknown' && 'bg-hover text-muted ring-1 ring-border'
      )}
    >
      <span className={cn(
        'relative flex h-2 w-2',
        status === 'available' && 'text-emerald-500',
        status === 'occupied' && 'text-amber-500',
        status === 'unknown' && 'text-muted'
      )}>
        <span className={cn(
          'absolute inline-flex h-full w-full rounded-full opacity-50',
          status === 'available' && 'bg-emerald-400',
          status === 'occupied' && 'bg-amber-400'
        )} />
        <span className={cn(
          'relative inline-flex rounded-full h-2 w-2',
          status === 'available' && 'bg-emerald-500',
          status === 'occupied' && 'bg-amber-500',
          status === 'unknown' && 'bg-border'
        )} />
      </span>
      {label}
    </span>
  )
}

const DEFAULT_FORM = { name: '', type: 'lecture', capacity: 30, floor: 1, building: '', status: 'active' }

export default function AdminHalls() {
  const { t } = useTranslation()
  const { halls, pagination, fetchHalls, createHall, updateHall, deleteHall } = useHallStore()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const { confirm, ConfirmModal } = useConfirm()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  const typeFilterOptions = useMemo(() => [
    { value: 'all', label: t('status.all') },
    { value: 'lecture', label: t('hallType.lecture') },
    { value: 'lab', label: t('hallType.lab') },
  ], [t])

  const statusFilterOptions = useMemo(() => [
    { value: 'all', label: t('status.all') },
    { value: 'active', label: t('status.active') },
    { value: 'maintenance', label: t('status.maintenance') },
    { value: 'inactive', label: t('status.inactive') },
  ], [t])

  // Live availability
  const availabilityMap = useHallAvailability(halls)

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = { page, limit: 20 }
      if (search.trim()) params.search = search.trim()
      if (typeFilter !== 'all') params.type = typeFilter
      if (statusFilter !== 'all') params.status = statusFilter
      fetchHalls(params).catch(() => setFetchError(true)).finally(() => setLoading(false))
    }, search ? 300 : 0)
    return () => clearTimeout(timer)
  }, [page, search, typeFilter, statusFilter])

  const filteredHalls = halls

  const openCreate = () => {
    setEditItem(null)
    setForm(DEFAULT_FORM)
    setModalOpen(true)
  }

  const openEdit = (hall) => {
    setEditItem(hall)
    setForm({ name: hall.name, type: hall.type, capacity: hall.capacity, floor: hall.floor, building: hall.building || '', status: hall.status })
    setModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editItem) {
        await updateHall(editItem.id, form)
        toast.success(t('admin.halls.toast.updated'))
      } else {
        await createHall(form)
        toast.success(t('admin.halls.toast.added'))
      }
      setModalOpen(false)
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.halls.toast.error'))
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm(t('admin.halls.confirmDelete'))
    if (!ok) return
    try {
      await deleteHall(id)
      toast.success(t('admin.halls.toast.deleted'))
    } catch (error) {
      toast.error(t('admin.halls.toast.error'))
    }
  }

  const handleQuickStatusToggle = async (hall, newStatus) => {
    try {
      await updateHall(hall.id, { ...hall, status: newStatus })
      toast.success(t('admin.halls.toast.statusChanged', { name: hall.name, status: t('status.' + newStatus) }))
    } catch (error) {
      toast.error(t('admin.halls.toast.statusError'))
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton variant="title" className="w-48" />
          <Skeleton variant="text" className="w-72" />
        </div>
        <Skeleton variant="button" />
      </div>
      <Skeleton type="card" count={6} />
    </div>
  )
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-16 text-center animate-fade-in">
      <div className="relative mb-4">
        <div className="absolute inset-0 rounded-2xl bg-rose-500/5 blur-xl" />
        <div className="relative w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/15 text-rose-500 flex items-center justify-center ring-1 ring-rose-100 dark:ring-rose-500/20">
          <XCircle className="w-6 h-6" />
        </div>
      </div>
      <h2 className="text-lg font-semibold text-title mb-1">{t('common.error.loadData')}</h2>
      <p className="text-sm text-label mb-4">{t('common.error.connectionError')}</p>
      <Button onClick={() => { setFetchError(false); setLoading(true); fetchHalls().catch(() => setFetchError(true)).finally(() => setLoading(false)) }}><RefreshCw className="w-4 h-4 me-2" />{t('common.retry')}</Button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('admin.halls.title')}</h1>
          <CardDescription className="mt-1.5 text-pretty">{t('admin.halls.description')}</CardDescription>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.halls.addButton')}</Button>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm group">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none transition-colors group-focus-within:text-primary-500" />
          <Input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder={t('admin.halls.searchPlaceholder')}
            className="pe-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted" />
          <Select options={typeFilterOptions} value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPage(1) }} className="w-32" />
          <Select options={statusFilterOptions} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }} className="w-36" />
        </div>
        {pagination.total > halls.length && (
          <span className="text-xs text-muted whitespace-nowrap">
            {halls.length} {t('common.from')} {pagination.total}
          </span>
        )}
      </div>

      {/* ── Hall Cards Grid ── */}
      {filteredHalls.length === 0 ? (
        <EmptyState
          icon={DoorOpen}
          title={search || typeFilter !== 'all' || statusFilter !== 'all' ? t('admin.halls.emptyFilteredTitle') : t('admin.halls.emptyTitle')}
          description={search || typeFilter !== 'all' || statusFilter !== 'all' ? t('admin.halls.emptyFilteredDescription') : t('admin.halls.emptyDescription')}
          action={!search && typeFilter === 'all' && statusFilter === 'all' ? <Button onClick={openCreate}><Plus className="w-4 h-4 ms-2" />{t('admin.halls.addButton')}</Button> : undefined}
        />
      ) : (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px]">
                <thead>
                  <tr className="border-b border-border bg-hover/40">
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.formName')}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.formType')}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.building')}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.floor')}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.capacity')}</th>
                    <th className="px-5 py-3 text-start text-xs font-semibold text-label">{t('admin.halls.formStatus')}</th>
                    <th className="px-5 py-3 text-end text-xs font-semibold text-label">{t('admin.users.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHalls.map(hall => {
                    const avail = availabilityMap[hall.id || hall._id] || { status: 'unknown', label: '' }
                    return (
                      <tr key={hall.id || hall._id} className="border-b border-border last:border-0 hover:bg-hover/35">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', hall.type === 'lecture' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400' : 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400')}>
                              <DoorOpen className="h-4 w-4" />
                            </div>
                            <div><p className="font-semibold text-title">{hall.name}</p>{avail.status !== 'unknown' && <div className="mt-1"><AvailabilityBadge status={avail.status} label={avail.label} /></div>}</div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-body">{hall.type === 'lecture' ? t('hallType.lecture') : t('hallType.lab')}</td>
                        <td className="px-5 py-4 text-sm text-body">{hall.building || t('admin.halls.buildingUnknown')}</td>
                        <td className="px-5 py-4 text-sm tabular-nums text-body">{hall.floor}</td>
                        <td className="px-5 py-4 text-sm tabular-nums text-body">{t('capacity.students', { count: hall.capacity })}</td>
                        <td className="px-5 py-4"><div className="w-36"><StatusSelect value={hall.status} onChange={e => handleQuickStatusToggle(hall, e.target.value)} /></div></td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon-sm" onClick={() => openEdit(hall)} aria-label={t('admin.halls.editButton')}><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(hall.id)} aria-label={t('admin.halls.deleteButton')} className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? t('admin.halls.modalEdit') : t('admin.halls.modalAdd')} description={editItem?.name} hideFooter>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="hall-name" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formName')}</label>
                  <Input id="hall-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hall-type" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formType')}</label>
                    <Select id="hall-type" options={[{ value: 'lecture', label: t('hallType.lecture') }, { value: 'lab', label: t('hallType.lab') }]} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="hall-capacity" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formCapacity')}</label>
                    <Input id="hall-capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hall-building" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formBuilding')}</label>
                    <Input id="hall-building" value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="hall-floor" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formFloor')}</label>
                    <Input id="hall-floor" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="hall-status" className="block text-sm font-medium text-body mb-1.5">{t('admin.halls.formStatus')}</label>
                  <Select id="hall-status" options={[
                    { value: 'active', label: t('status.active') },
                    { value: 'maintenance', label: t('status.maintenance') },
                    { value: 'inactive', label: t('status.inactive') }
                  ]} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button type="submit">{editItem ? t('admin.halls.updateButton') : t('admin.halls.addButtonSubmit')}</Button>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                </div>
              </form>
      </Modal>

      <ConfirmModal />
    </div>
  )
}
