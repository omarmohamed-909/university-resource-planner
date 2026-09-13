import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Badge from '../../components/ui/Badge'
import { useConfirm } from '../../components/ui/ConfirmModal'
import toast from 'react-hot-toast'
import { Pencil, Plus, RefreshCw, Search, Trash2, Users, XCircle } from 'lucide-react'
import api from '../../../infrastructure/api/axios'

const roleConfig = {
  admin: { variant: 'danger' },
  doctor: { variant: 'success' },
  student: { variant: 'info' }
}

const emptyForm = { name: '', email: '', password: '', role: 'student', department: '' }

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const { confirm, ConfirmModal } = useConfirm()

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users')
      setUsers(data.data || data || [])
      setFetchError(null)
    } catch {
      setUsers([])
      setFetchError(true)
    }
  }

  useEffect(() => { fetchUsers().finally(() => setLoading(false)) }, [])

  const openCreate = () => {
    setEditUser(null)
    setForm(emptyForm)
    setModalOpen(true)
  }

  const openEdit = (user) => {
    setEditUser(user)
    setForm({ name: user.name, email: user.email, password: '', role: user.role, department: user.department || '' })
    setModalOpen(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role, department: form.department }
        if (form.password) payload.password = form.password
        await api.put(`/users/${editUser.id}`, payload)
        toast.success(t('admin.users.toast.updated'))
      } else {
        await api.post('/auth/register', form)
        toast.success(t('admin.users.toast.added'))
      }
      setModalOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.users.toast.error'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm(t('admin.users.confirmDelete'))
    if (!ok) return
    try {
      await api.delete(`/users/${id}`)
      toast.success(t('admin.users.toast.deleted'))
      fetchUsers()
    } catch {
      toast.error(t('admin.users.toast.error'))
    }
  }

  const filtered = users.filter(user =>
    !search ||
    user.name?.includes(search) ||
    user.email?.includes(search) ||
    user.department?.includes(search)
  )

  if (loading) return <Skeleton type="table" rows={5} />

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('admin.users.title')}</h1>
          <CardDescription className="mt-1.5 text-pretty">{t('admin.users.description')}</CardDescription>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.users.addButton')}</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute end-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
        <Input value={search} onChange={event => setSearch(event.target.value)} placeholder={t('admin.users.searchPlaceholder')} className="pe-10" />
      </div>

      {fetchError ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-4 text-center py-6">
              <div className="p-3 rounded-full bg-red-500/10">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-title">{t('common.error.loadUsers')}</p>
                <p className="text-sm text-label mt-1">{t('common.error.tryAgain')}</p>
              </div>
              <Button variant="outline" onClick={fetchUsers}><RefreshCw className="w-4 h-4 me-2" />{t('common.retry')}</Button>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={t('admin.users.emptyTitle')}
          description={t('admin.users.emptyDescription')}
          action={<Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.users.addButton')}</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-surface">
                    <th scope="col" className="px-4 py-3 text-start text-sm font-medium text-body">{t('admin.users.tableName')}</th>
                    <th scope="col" className="px-4 py-3 text-start text-sm font-medium text-body">{t('admin.users.tableEmail')}</th>
                    <th scope="col" className="px-4 py-3 text-start text-sm font-medium text-body">{t('admin.users.tableRole')}</th>
                    <th scope="col" className="px-4 py-3 text-start text-sm font-medium text-body">{t('admin.users.tableDepartment')}</th>
                    <th scope="col" className="px-4 py-3 text-end text-sm font-medium text-body">{t('admin.users.tableActions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const cfg = roleConfig[user.role] || { label: user.role, variant: 'default' }
                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-hover transition-colors">
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-hover text-body flex items-center justify-center text-sm font-bold shrink-0">
                              {user.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-title truncate">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-label truncate max-w-[200px]">{user.email}</td>
                        <td className="px-4 py-3"><Badge variant={cfg.variant} size="lg">{t(`role.${user.role}`)}</Badge></td>
                        <td className="px-4 py-3 text-sm text-label">{user.department || '-'}</td>
                        <td className="px-4 py-3 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={t('admin.users.editButton', { name: user.name })}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} aria-label={t('admin.users.deleteButton', { name: user.name })} className="text-red-400 hover:text-red-600 hover:bg-red-500/20">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filtered.length === 0 && search && (
                <div className="py-8 text-center text-sm text-muted">{t('admin.users.noSearchResults')}</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? t('admin.users.modalEdit') : t('admin.users.modalAdd')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-body mb-1">{t('admin.users.formName')}</label>
            <Input id="user-name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder={t('admin.users.formNamePlaceholder')} required />
          </div>
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-body mb-1">{t('admin.users.formEmail')}</label>
            <Input id="user-email" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder={t('admin.users.formEmailPlaceholder')} required />
          </div>
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-body mb-1">{t('admin.users.formPassword')}</label>
            <Input id="user-password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder={editUser ? t('admin.users.formPasswordEditPlaceholder') : t('admin.users.formPasswordPlaceholder')} required={!editUser} />
          </div>
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-body mb-1">{t('admin.users.formRole')}</label>
            <Select
              id="user-role"
              options={[{ value: 'admin', label: t('role.admin') }, { value: 'doctor', label: t('role.doctor') }, { value: 'student', label: t('role.student') }]}
              value={form.role}
              onChange={event => setForm({ ...form, role: event.target.value })}
              placeholder={t('admin.users.formRolePlaceholder')}
            />
          </div>
          <div>
            <label htmlFor="user-department" className="block text-sm font-medium text-body mb-1">{t('admin.users.formDepartment')}</label>
            <Input id="user-department" value={form.department} onChange={event => setForm({ ...form, department: event.target.value })} placeholder={t('admin.users.formDepartmentPlaceholder')} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{editUser ? t('admin.users.updateButton') : t('admin.users.addButtonSubmit')}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
