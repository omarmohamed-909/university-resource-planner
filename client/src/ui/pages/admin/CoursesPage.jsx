import { useEffect, useState } from 'react'
import Card, { CardContent, CardTitle, CardHeader, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Modal from '../../components/ui/Modal'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { useConfirm } from '../../components/ui/ConfirmModal'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, BookOpen, UserPlus, RefreshCw, XCircle } from 'lucide-react'
import api from '../../../infrastructure/api/axios'

export default function AdminCourses() {
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [enrollmentOpen, setEnrollmentOpen] = useState(false)
  const [enrollmentCourse, setEnrollmentCourse] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [enrollmentSaving, setEnrollmentSaving] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ code: '', name: '', doctorId: '', department: '', creditHours: 3 })
  const { confirm, ConfirmModal } = useConfirm()

  const getId = value => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.id || value._id || String(value)
  }

  const fetchData = async () => {
    try {
      const [coursesRes, usersRes, studentsRes] = await Promise.all([
        api.get('/courses'),
        api.get('/users?role=doctor'),
        api.get('/users?role=student')
      ])
      const cData = coursesRes.data.data || coursesRes.data
      setCourses(Array.isArray(cData) ? cData : [])
      setUsers(usersRes.data.data || usersRes.data || [])
      setStudents(studentsRes.data.data || studentsRes.data || [])
    } catch {
      setCourses([])
      setUsers([])
      setStudents([])
      setFetchError(true)
    }
  }

  useEffect(() => { fetchData().finally(() => setLoading(false)) }, [])

  const openCreate = () => {
    setEditItem(null)
    setForm({ code: '', name: '', doctorId: '', department: '', creditHours: 3 })
    setModalOpen(true)
  }

  const openEdit = (course) => {
    setEditItem(course)
    setForm({ code: course.code, name: course.name, doctorId: getId(course.doctorId), department: course.department || '', creditHours: course.creditHours })
    setModalOpen(true)
  }

  const openEnrollment = (course) => {
    setEnrollmentCourse(course)
    setSelectedStudents((course.studentIds || []).map(getId))
    setEnrollmentOpen(true)
  }

  const toggleStudent = (studentId) => {
    setSelectedStudents(current =>
      current.includes(studentId)
        ? current.filter(id => id !== studentId)
        : [...current, studentId]
    )
  }

  const handleSaveEnrollment = async () => {
    if (!enrollmentCourse) return
    setEnrollmentSaving(true)
    const previous = (enrollmentCourse.studentIds || []).map(getId)
    const toAdd = selectedStudents.filter(id => !previous.includes(id))
    const toRemove = previous.filter(id => !selectedStudents.includes(id))

    try {
      if (toAdd.length) {
        await api.post(`/courses/${enrollmentCourse.id}/enroll`, { studentIds: toAdd })
      }
      await Promise.all(toRemove.map(studentId =>
        api.delete(`/courses/${enrollmentCourse.id}/enroll/${studentId}`)
      ))
      toast.success('تم تحديث تسجيل الطلاب')
      setEnrollmentOpen(false)
      setEnrollmentCourse(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'تعذر تحديث تسجيل الطلاب')
    } finally {
      setEnrollmentSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.doctorId) return toast.error('يجب اختيار دكتور للمادة')
    try {
      if (editItem) {
        await api.put(`/courses/${editItem.id}`, form)
        toast.success('تم تحديث المادة')
      } else {
        await api.post('/courses', form)
        toast.success('تم إضافة المادة')
      }
      setModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'حدث خطأ')
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm('هل أنت متأكد من حذف هذه المادة؟')
    if (!ok) return
    try {
      await api.delete(`/courses/${id}`)
      toast.success('تم الحذف')
      fetchData()
    } catch { toast.error('حدث خطأ') }
  }

  if (loading) return <Skeleton type="card" count={6} />
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-slate-900 mb-1">تعذر تحميل البيانات</h2>
      <p className="text-sm text-slate-500 mb-4">حدث خطأ أثناء الاتصال بالخادم</p>
      <Button onClick={() => { setFetchError(false); setLoading(true); fetchData().finally(() => setLoading(false)) }}><RefreshCw className="w-4 h-4 me-2" />إعادة المحاولة</Button>
    </div>
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">المواد الدراسية</h1>
          <CardDescription>إدارة المواد والمقررات الدراسية</CardDescription>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />إضافة مادة</Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title="لا توجد مواد" description="لم يتم إضافة أي مادة بعد. أضف أول مادة دراسية." action={<Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />إضافة مادة</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const maxStudents = 100
            const enrolled = course.studentIds?.length || 0
            const pct = Math.min((enrolled / maxStudents) * 100, 100)
            return (
            <Card key={course.id} hover>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                      {course.code?.slice(0, 2) || 'CO'}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{course.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{course.code}</p>
                    </div>
                  </div>
                  <Badge variant="purple" size="lg">{course.creditHours} ساعات</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-slate-600">
                  <p>القسم: {course.department || 'غير محدد'}</p>
                  <p>الدكتور: {users.find(u => u.id === getId(course.doctorId))?.name || 'غير محدد'}</p>
                </div>
                {/* Enrollment bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-500">التسجيل</span>
                    <span className={cn('font-medium', pct >= 80 ? 'text-green-600' : 'text-slate-700')}>{enrolled} طالب</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div className={cn(
                      'h-full rounded-full transition-all',
                      pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary-500' : 'bg-amber-500'
                    )} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(course)}><Pencil className="w-4 h-4 me-1" />تعديل</Button>
                  <Button variant="secondary" size="sm" onClick={() => openEnrollment(course)}><UserPlus className="w-4 h-4 me-1" />الطلاب</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}><Trash2 className="w-4 h-4 me-1" />حذف</Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? 'تعديل مادة' : 'إضافة مادة'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">كود المادة</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">اسم المادة</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">الدكتور</label>
            <Select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} placeholder="اختر الدكتور" options={users.map(u => ({ value: u.id, label: u.name }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">القسم</label>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">الساعات المعتمدة</label>
              <Input type="number" value={form.creditHours} onChange={e => setForm({ ...form, creditHours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{editItem ? 'تحديث' : 'إضافة'}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>إلغاء</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={enrollmentOpen} onClose={() => setEnrollmentOpen(false)} title="تسجيل الطلاب في المادة" description={enrollmentCourse ? `${enrollmentCourse.code} - ${enrollmentCourse.name}` : ''} size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3">
            <span className="text-sm text-slate-600">الطلاب المسجلون</span>
            <Badge variant="primary" size="lg">{selectedStudents.length}</Badge>
          </div>

          <div className="max-h-[360px] overflow-y-auto rounded-lg border border-slate-200 divide-y">
            {students.length === 0 ? (
              <div className="p-5 text-center text-sm text-slate-400">لا يوجد طلاب متاحون</div>
            ) : students.map(student => {
              const checked = selectedStudents.includes(student.id)
              return (
                <label key={student.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{student.name}</p>
                    <p className="text-xs text-slate-500 truncate">{student.email}</p>
                  </div>
                  {student.department && <Badge variant="default">{student.department}</Badge>}
                </label>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveEnrollment} loading={enrollmentSaving}>حفظ التسجيل</Button>
            <Button variant="outline" onClick={() => setEnrollmentOpen(false)}>إلغاء</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
