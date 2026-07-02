import { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useHallStore } from '../../store/hallStore'
import { cn } from '../../lib/utils'
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
import { Plus, Pencil, Trash2, DoorOpen, Search, Filter, RefreshCw, XCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHallAvailability } from './_useHallAvailability'

/* ─── Quick Status Selector ─── */
function StatusSelect({ value, onChange }) {
  const { t } = useTranslation()
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full appearance-none rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-medium text-slate-700 outline-none transition-colors hover:border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-900/10 cursor-pointer"
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
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold',
        status === 'available' && 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
        status === 'occupied' && 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
        status === 'unknown' && 'bg-slate-100 text-slate-400 ring-1 ring-slate-200'
      )}
    >
      <span className={cn(
        'relative flex h-2 w-2',
        status === 'available' && 'text-emerald-500',
        status === 'occupied' && 'text-amber-500',
        status === 'unknown' && 'text-slate-300'
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
          status === 'unknown' && 'bg-slate-300'
        )} />
      </span>
      {label}
    </motion.div>
  )
}

const DEFAULT_FORM = { name: '', type: 'lecture', capacity: 30, floor: 1, building: '', status: 'active' }

export default function AdminHalls() {
  const { t } = useTranslation()
  const { halls, fetchHalls, createHall, updateHall, deleteHall } = useHallStore()
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState(DEFAULT_FORM)
  const { confirm, ConfirmModal } = useConfirm()

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

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

  useEffect(() => { fetchHalls().catch(() => setFetchError(true)).finally(() => setLoading(false)) }, [])

  const filteredHalls = useMemo(() => {
    return halls.filter(hall => {
      const matchesSearch = !search || hall.name.toLowerCase().includes(search.toLowerCase()) || hall.building?.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || hall.type === typeFilter
      const matchesStatus = statusFilter === 'all' || hall.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [halls, search, typeFilter, statusFilter])

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

  if (loading) return <Skeleton type="card" count={6} />
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-slate-900 mb-1">{t('common.error.loadData')}</h2>
      <p className="text-sm text-slate-500 mb-4">{t('common.error.connectionError')}</p>
      <Button onClick={() => { setFetchError(false); setLoading(true); fetchHalls().catch(() => setFetchError(true)).finally(() => setLoading(false)) }}><RefreshCw className="w-4 h-4 ms-2" />{t('common.retry')}</Button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t('admin.halls.title')}</h1>
          <CardDescription>{t('admin.halls.description')}</CardDescription>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.halls.addButton')}</Button>
        </motion.div>
      </div>

      {/* ── Search & Filters ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('admin.halls.searchPlaceholder')}
            className="pe-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <Select options={typeFilterOptions} value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-32" />
          <Select options={statusFilterOptions} value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-36" />
        </div>
        {filteredHalls.length < halls.length && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs text-slate-400 whitespace-nowrap"
          >
            {filteredHalls.length} {t('common.from')} {halls.length}
          </motion.span>
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
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <AnimatePresence mode="popLayout">
            {filteredHalls.map(hall => {
              const avail = availabilityMap[hall.id || hall._id] || { status: 'unknown', label: '' }
              return (
                <motion.div
                  key={hall.id || hall._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                >
                  <Card hover className="relative flex flex-col overflow-hidden">

                    <CardContent className="flex flex-1 flex-col p-6">
                      {/* Header row */}
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            className={cn(
                              'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg shadow-sm',
                              hall.type === 'lecture' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                            )}
                          >
                            <DoorOpen className="w-5 h-5" />
                          </motion.div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-base font-bold text-slate-900">{hall.name}</h3>
                              <Badge variant={hall.status === 'active' ? 'success' : hall.status === 'maintenance' ? 'warning' : 'default'} dot size="lg">
                                {hall.status === 'active' ? t('status.active') : hall.status === 'maintenance' ? t('status.maintenance') : t('status.inactive')}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-sm text-slate-500">
                              {hall.type === 'lecture' ? t('hallType.lecture') : t('hallType.lab')}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Stats grid */}
                      <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <div>
                          <p className="text-[11px] font-medium text-slate-400">{t('admin.halls.building')}</p>
                          <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">{hall.building || t('admin.halls.buildingUnknown')}</p>
                        </div>
                        <div className="border-x border-slate-200">
                          <p className="text-[11px] font-medium text-slate-400">{t('admin.halls.floor')}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">{hall.floor}</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-slate-400">{t('admin.halls.capacity')}</p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-800">{hall.capacity}</p>
                        </div>
                      </div>

                      {avail.status !== 'unknown' && (
                      <div className="mt-2 flex items-center gap-2">
                        <AvailabilityBadge status={avail.status} label={avail.label} />
                      </div>
                      )}

                      {/* Capacity bar */}
                      <div className="mt-2 rounded-lg border border-slate-100 bg-white px-3 py-2">
                        <div className="mb-1.5 flex items-center justify-between text-sm">
                          <span className="font-medium text-slate-500">{t('capacity.max')}</span>
                          <span className="font-semibold text-slate-800">{t('capacity.students', { count: hall.capacity })}</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((hall.capacity / 200) * 100, 100)}%` }}
                            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
                            className={cn(
                              'h-full rounded-full',
                              hall.capacity > 100 ? 'bg-amber-500' : 'bg-primary-500'
                            )}
                          />
                        </div>
                        <p className={cn(
                          'mt-1 text-[11px] font-medium',
                          hall.capacity > 100 ? 'text-amber-600' : 'text-slate-400'
                        )}>
                          {hall.capacity > 100 ? t('capacity.large') : t('capacity.medium')}
                        </p>
                      </div>
                    </CardContent>

                    {/* Quick Actions */}
                    <div className="mt-auto flex items-center gap-2 border-t border-slate-100 bg-slate-50/80 px-6 py-2">
                      <div className="relative flex-1">
                        <StatusSelect
                          value={hall.status}
                          onChange={e => handleQuickStatusToggle(hall, e.target.value)}
                        />
                      </div>
                      <button
                        onClick={() => openEdit(hall)}
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
                        aria-label={t('admin.halls.editButton')}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {t('admin.halls.editButton')}
                      </button>
                      <button
                        onClick={() => handleDelete(hall.id)}
                        className="flex items-center gap-1 rounded-md px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition-colors hover:bg-red-50 cursor-pointer"
                        aria-label={t('admin.halls.deleteButton')}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {t('admin.halls.deleteButton')}
                      </button>
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ── Morphing Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm"
              onClick={() => setModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="hall-modal-title"
              className={cn(
                'relative bg-white rounded-lg shadow-[0_25px_50px_rgba(15,23,42,0.25)] w-full overflow-hidden border border-white/70',
                'max-w-lg'
              )}
            >
              {/* Modal header */}
              <div className="flex items-start justify-between p-5 pb-4 border-b border-slate-100 bg-slate-50/70">
                <div>
                  <h2 id="hall-modal-title" className="text-lg font-bold text-slate-950">{editItem ? t('admin.halls.modalEdit') : t('admin.halls.modalAdd')}</h2>
                  {editItem && <p className="text-sm text-slate-500 mt-1">{editItem.name}</p>}
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg p-1.5 transition-colors cursor-pointer"
                  aria-label={t('common.close')}
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal form */}
              <form onSubmit={handleSubmit} className="p-5 space-y-4">
                <div>
                  <label htmlFor="hall-name" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formName')}</label>
                  <Input id="hall-name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hall-type" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formType')}</label>
                    <Select id="hall-type" options={[{ value: 'lecture', label: t('hallType.lecture') }, { value: 'lab', label: t('hallType.lab') }]} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="hall-capacity" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formCapacity')}</label>
                    <Input id="hall-capacity" type="number" value={form.capacity} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} required />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="hall-building" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formBuilding')}</label>
                    <Input id="hall-building" value={form.building} onChange={e => setForm({ ...form, building: e.target.value })} />
                  </div>
                  <div>
                    <label htmlFor="hall-floor" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formFloor')}</label>
                    <Input id="hall-floor" type="number" value={form.floor} onChange={e => setForm({ ...form, floor: Number(e.target.value) })} />
                  </div>
                </div>
                <div>
                  <label htmlFor="hall-status" className="block text-xs font-semibold text-slate-500 mb-1 tracking-[0.08em]">{t('admin.halls.formStatus')}</label>
                  <Select id="hall-status" options={[
                    { value: 'active', label: t('status.active') },
                    { value: 'maintenance', label: t('status.maintenance') },
                    { value: 'inactive', label: t('status.inactive') }
                  ]} value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
        <motion.div className="me-auto" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button type="submit">{editItem ? t('admin.halls.updateButton') : t('admin.halls.addButtonSubmit')}</Button>
                  </motion.div>
                  <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal />
    </div>
  )
}
