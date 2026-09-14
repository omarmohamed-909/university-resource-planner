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
import Pagination from '../../components/ui/Pagination'
import { useConfirm } from '../../components/ui/ConfirmModal'
import { cn } from '../../lib/utils'
import toast from 'react-hot-toast'
import { Plus, Pencil, Trash2, BookOpen, UserPlus, RefreshCw, XCircle } from 'lucide-react'
import api from '../../../infrastructure/api/axios'

export default function AdminCourses() {
  const { t } = useTranslation()
  const [courses, setCourses] = useState([])
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [users, setUsers] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [enrollmentOpen, setEnrollmentOpen] = useState(false)
  const [enrollmentCourse, setEnrollmentCourse] = useState(null)
  const [selectedStudents, setSelectedStudents] = useState([])
  const [initialSelectedStudents, setInitialSelectedStudents] = useState([])
  const [studentSearch, setStudentSearch] = useState('')
  const [enrollmentSaving, setEnrollmentSaving] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [form, setForm] = useState({ code: '', name: '', doctorId: '', department: '', creditHours: 3 })
  const { confirm, ConfirmModal } = useConfirm()

  const getId = value => {
    if (!value) return ''
    if (typeof value === 'string') return value
    return value.id || value._id || String(value)
  }

  const fetchData = async (targetPage = page) => {
    try {
      const [coursesRes, usersRes, studentsRes] = await Promise.all([
        api.get(`/courses?page=${targetPage}&limit=18`),
        api.get('/users?role=doctor&limit=100'),
        api.get('/users?role=student&limit=100')
      ])
      const cData = coursesRes.data.data || coursesRes.data
      setCourses(Array.isArray(cData) ? cData : [])
      setPagination(coursesRes.data.pagination || { page: 1, pages: 1, total: cData?.length || 0 })
      setUsers(usersRes.data.data || usersRes.data || [])
      setStudents(studentsRes.data.data || studentsRes.data || [])
    } catch {
      setCourses([])
      setUsers([])
      setStudents([])
      setFetchError(true)
    }
  }

  useEffect(() => { fetchData(page).finally(() => setLoading(false)) }, [page])

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
    setStudentSearch('')
    setEnrollmentOpen(true)
  }

  useEffect(() => {
    if (!enrollmentOpen || !enrollmentCourse) return undefined
    const timer = setTimeout(async () => {
      const query = new URLSearchParams({ role: 'student', limit: 100 })
      const enrolledQuery = new URLSearchParams({ limit: 100 })
      if (studentSearch.trim()) {
        query.set('search', studentSearch.trim())
        enrolledQuery.set('search', studentSearch.trim())
      }
      try {
        const [studentResponse, enrolledResponse] = await Promise.all([
          api.get(`/users?${query}`),
          api.get(`/courses/${enrollmentCourse.id}/enrollments?${enrolledQuery}`),
        ])
        setStudents(studentResponse.data.data || [])
        const ids = (enrolledResponse.data.data || []).map(getId)
        setSelectedStudents(ids)
        setInitialSelectedStudents(ids)
      } catch {
        setStudents([])
      }
    }, studentSearch ? 300 : 0)
    return () => clearTimeout(timer)
  }, [enrollmentOpen, enrollmentCourse?.id, studentSearch])

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
    const previous = initialSelectedStudents
    const toAdd = selectedStudents.filter(id => !previous.includes(id))
    const toRemove = previous.filter(id => !selectedStudents.includes(id))

    try {
      if (toAdd.length) {
        await api.post(`/courses/${enrollmentCourse.id}/enroll`, { studentIds: toAdd })
      }
      await Promise.all(toRemove.map(studentId =>
        api.delete(`/courses/${enrollmentCourse.id}/enroll/${studentId}`)
      ))
      toast.success(t('admin.courses.toast.enrollmentUpdated'))
      setEnrollmentOpen(false)
      setEnrollmentCourse(null)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.courses.toast.enrollmentFailed'))
    } finally {
      setEnrollmentSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.doctorId) return toast.error(t('admin.courses.toast.noDoctor'))
    try {
      if (editItem) {
        await api.put(`/courses/${editItem.id}`, form)
        toast.success(t('admin.courses.toast.updated'))
      } else {
        await api.post('/courses', form)
        toast.success(t('admin.courses.toast.added'))
      }
      setModalOpen(false)
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.courses.toast.error'))
    }
  }

  const handleDelete = async (id) => {
    const ok = await confirm(t('admin.courses.confirmDelete'))
    if (!ok) return
    try {
      await api.delete(`/courses/${id}`)
      toast.success(t('admin.courses.toast.deleted'))
      fetchData()
    } catch { toast.error(t('admin.courses.toast.error')) }
  }

  if (loading) return <Skeleton type="card" count={6} />
  if (fetchError) return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <XCircle className="w-12 h-12 text-red-400 mb-4" />
      <h2 className="text-lg font-semibold text-title mb-1">{t('common.error.loadData')}</h2>
      <p className="text-sm text-label mb-4">{t('common.error.connectionError')}</p>
      <Button onClick={() => { setFetchError(false); setLoading(true); fetchData().finally(() => setLoading(false)) }}><RefreshCw className="w-4 h-4 me-2" />{t('common.retry')}</Button>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('admin.courses.title')}</h1>
          <CardDescription className="mt-1.5 text-pretty">{t('admin.courses.description')}</CardDescription>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.courses.addButton')}</Button>
      </div>

      {courses.length === 0 ? (
        <EmptyState icon={BookOpen} title={t('admin.courses.emptyTitle')} description={t('admin.courses.emptyDescription')} action={<Button onClick={openCreate}><Plus className="w-4 h-4 me-2" />{t('admin.courses.addButton')}</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const maxStudents = 100
            const enrolled = course.studentCount ?? course.studentIds?.length ?? 0
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
                      <h3 className="font-semibold text-title">{course.name}</h3>
                      <p className="text-xs text-label font-mono">{course.code}</p>
                    </div>
                  </div>
                  <Badge variant="purple" size="lg">{t('admin.courses.creditHours', { count: course.creditHours })}</Badge>
                </div>
                <div className="mt-3 space-y-1 text-sm text-body">
                  <p>{t('admin.courses.department', { department: course.department || t('admin.courses.departmentUnknown') })}</p>
                  <p>{t('admin.courses.doctor', { doctor: users.find(u => u.id === getId(course.doctorId))?.name || t('admin.courses.doctorUnknown') })}</p>
                </div>
                {/* Enrollment bar */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-label">{t('admin.courses.enrollment')}</span>
                    <span className={cn('font-medium', pct >= 80 ? 'text-green-600' : 'text-body')}>{t('admin.courses.enrolled', { count: enrolled })}</span>
                  </div>
                  <div className="w-full bg-hover rounded-full h-2 overflow-hidden">
                    <div className={cn(
                      'h-full rounded-full transition-all',
                      pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-primary-500' : 'bg-amber-500'
                    )} style={{ width: `${pct}%` }} />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(course)}><Pencil className="w-4 h-4 me-1" />{t('admin.courses.editButton')}</Button>
                  <Button variant="secondary" size="sm" onClick={() => openEnrollment(course)}><UserPlus className="w-4 h-4 me-1" />{t('admin.courses.enrollButton')}</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(course.id)}><Trash2 className="w-4 h-4 me-1" />{t('admin.courses.deleteButton')}</Button>
                </div>
              </CardContent>
            </Card>
            )
          })}
        </div>
      )}

      <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={setPage} />

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editItem ? t('admin.courses.modalEdit') : t('admin.courses.modalAdd')}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('admin.courses.formCode')}</label>
              <Input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('admin.courses.formName')}</label>
              <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('admin.courses.formDoctor')}</label>
            <Select value={form.doctorId} onChange={e => setForm({ ...form, doctorId: e.target.value })} placeholder={t('admin.courses.formDoctorPlaceholder')} options={users.map(u => ({ value: u.id, label: u.name }))} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('admin.courses.formDepartment')}</label>
              <Input value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-body mb-1">{t('admin.courses.formHours')}</label>
              <Input type="number" value={form.creditHours} onChange={e => setForm({ ...form, creditHours: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{editItem ? t('admin.courses.updateButton') : t('admin.courses.addButtonSubmit')}</Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>{t('common.cancel')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={enrollmentOpen} onClose={() => setEnrollmentOpen(false)} title={t('admin.courses.modalEnroll')} description={enrollmentCourse ? `${enrollmentCourse.code} - ${enrollmentCourse.name}` : ''} size="lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-lg bg-surface px-4 py-3">
            <span className="text-sm text-body">{t('admin.courses.enrolledStudents')}</span>
            <Badge variant="primary" size="lg">{selectedStudents.length}</Badge>
          </div>

          <Input
            value={studentSearch}
            onChange={event => setStudentSearch(event.target.value)}
            placeholder={t('admin.users.searchPlaceholder')}
          />

          <div className="max-h-[360px] overflow-y-auto rounded-lg border border-border divide-y">
            {students.length === 0 ? (
              <div className="p-5 text-center text-sm text-muted">{t('admin.courses.noStudents')}</div>
            ) : students.map(student => {
              const checked = selectedStudents.includes(student.id)
              return (
                <label key={student.id} className="flex items-center gap-3 p-3 hover:bg-hover cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 rounded border-active text-primary-600 focus:ring-primary-500"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-title truncate">{student.name}</p>
                    <p className="text-xs text-label truncate">{student.email}</p>
                  </div>
                  {student.department && <Badge variant="default">{student.department}</Badge>}
                </label>
              )
            })}
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSaveEnrollment} loading={enrollmentSaving}>{t('admin.courses.saveEnrollment')}</Button>
            <Button variant="outline" onClick={() => setEnrollmentOpen(false)}>{t('common.cancel')}</Button>
          </div>
        </div>
      </Modal>
      <ConfirmModal />
    </div>
  )
}
