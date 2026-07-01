import { useEffect, useState } from 'react'
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
  admin: { label: 'مدير', variant: 'danger' },
  doctor: { label: 'دكتور', variant: 'success' },
  student: { label: 'طالب', variant: 'info' }
}

const emptyForm = { name: '', email: '', password: '', role: 'student', department: '' }

export default function AdminUsers() {
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
        toast.success('تم تحديث المستخدم')
      } else {
        await api.post('/auth/register', form)
        toast.success('تم إضافة المستخدم')
      }
      setModalOpen(false)
      fetchUsers()
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm('هل أنت متأكد من حذف هذا المستخدم؟')
    if (!ok) return
    try {
      await api.delete(`/users/${id}`)
      toast.success('تم الحذف')
      fetchUsers()
    } catch {
      toast.error('حدث خطأ')
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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المستخدمون</h1>
          <CardDescription>إدارة حسابات المستخدمين والصلاحيات الأساسية</CardDescription>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />إضافة مستخدم</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <Input value={search} onChange={event => setSearch(event.target.value)} placeholder="بحث عن مستخدم..." className="pr-10" />
      </div>

      {fetchError ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center gap-4 text-center py-6">
              <div className="p-3 rounded-full bg-red-50">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">تعذر تحميل المستخدمين</p>
                <p className="text-sm text-slate-500 mt-1">حدث خطأ في الاتصال. حاول مرة أخرى.</p>
              </div>
              <Button variant="outline" onClick={fetchUsers}><RefreshCw className="w-4 h-4 me-2" />إعادة المحاولة</Button>
            </div>
          </CardContent>
        </Card>
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="لا يوجد مستخدمون"
          description="لم يتم إضافة أي مستخدم بعد."
          action={<Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />إضافة مستخدم</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">الاسم</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">البريد</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">الدور</th>
                    <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">القسم</th>
                    <th scope="col" className="px-4 py-3 text-start text-sm font-medium text-slate-600">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => {
                    const cfg = roleConfig[user.role] || { label: user.role, variant: 'default' }
                    return (
                      <tr key={user.id} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 max-w-[200px]">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0">
                              {user.name?.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-900 truncate">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-500 truncate max-w-[200px]">{user.email}</td>
                        <td className="px-4 py-3"><Badge variant={cfg.variant} size="lg">{cfg.label}</Badge></td>
                        <td className="px-4 py-3 text-sm text-slate-500">{user.department || '-'}</td>
                        <td className="px-4 py-3 text-left">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(user)} aria-label={`تعديل ${user.name}`}><Pencil className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)} aria-label={`حذف ${user.name}`} className="text-red-400 hover:text-red-600 hover:bg-red-50">
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
                <div className="py-8 text-center text-sm text-slate-400">لا توجد نتائج للبحث</div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editUser ? 'تعديل مستخدم' : 'إضافة مستخدم'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user-name" className="block text-sm font-medium text-slate-700 mb-1">الاسم</label>
            <Input id="user-name" value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} placeholder="الاسم" required />
          </div>
          <div>
            <label htmlFor="user-email" className="block text-sm font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
            <Input id="user-email" type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} placeholder="البريد الإلكتروني" required />
          </div>
          <div>
            <label htmlFor="user-password" className="block text-sm font-medium text-slate-700 mb-1">كلمة المرور</label>
            <Input id="user-password" type="password" value={form.password} onChange={event => setForm({ ...form, password: event.target.value })} placeholder={editUser ? 'اتركه فارغاً إذا لم ترد التغيير' : 'كلمة المرور'} required={!editUser} />
          </div>
          <div>
            <label htmlFor="user-role" className="block text-sm font-medium text-slate-700 mb-1">الدور</label>
            <Select
              id="user-role"
              options={[{ value: 'admin', label: 'مدير' }, { value: 'doctor', label: 'دكتور' }, { value: 'student', label: 'طالب' }]}
              value={form.role}
              onChange={event => setForm({ ...form, role: event.target.value })}
              placeholder="الدور"
            />
          </div>
          <div>
            <label htmlFor="user-department" className="block text-sm font-medium text-slate-700 mb-1">القسم</label>
            <Input id="user-department" value={form.department} onChange={event => setForm({ ...form, department: event.target.value })} placeholder="القسم" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving}>{editUser ? 'تحديث' : 'إضافة'}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
