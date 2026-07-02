import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import { formatTime } from '../../lib/formatDate'
import toast from 'react-hot-toast'
import { ClipboardCheck, FileText, FileSpreadsheet, Printer, QrCode, RefreshCw, Users } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { downloadFile } from '../../../infrastructure/api/download'

const today = () => new Date().toISOString().slice(0, 10)

function getStudentName(record) {
  if (record.studentId && typeof record.studentId === 'object') {
    return record.studentId.name || record.studentId.email || record.studentId.id
  }
  return record.studentId || '-'
}

export default function AttendanceManagePage() {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState([])
  const [selectedScheduleId, setSelectedScheduleId] = useState('')
  const [date, setDate] = useState(today())
  const [records, setRecords] = useState([])
  const [qr, setQr] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [qrLoading, setQrLoading] = useState(false)

  const selectedSchedule = useMemo(
    () => schedules.find(schedule => schedule.id === selectedScheduleId),
    [schedules, selectedScheduleId]
  )

  const fetchSchedules = async () => {
    const { data } = await api.get('/schedules')
    const items = data.data || []
    setSchedules(items)
    if (!selectedScheduleId && items[0]) setSelectedScheduleId(items[0].id)
  }

  const fetchRecords = async () => {
    if (!selectedScheduleId) return
    setRecordsLoading(true)
    try {
      const { data } = await api.get(`/attendance/schedule/${selectedScheduleId}?date=${date}`)
      setRecords(data.data || [])
    } catch (error) {
      toast.error(error.response?.data?.message || t('attendance.toast.loadFailed'))
      setRecords([])
    } finally {
      setRecordsLoading(false)
    }
  }

  const generateQr = async () => {
    if (!selectedScheduleId) return toast.error(t('attendance.toast.noSchedule'))
    setQrLoading(true)
    try {
      const { data } = await api.post('/attendance/generate-qr', { scheduleId: selectedScheduleId })
      setQr(data.data)
      toast.success(t('attendance.toast.qrGenerated'))
    } catch (error) {
      toast.error(error.response?.data?.message || t('attendance.toast.qrFailed'))
    } finally {
      setQrLoading(false)
    }
  }

  const handleExportPdf = () => {
    if (!selectedScheduleId) return toast.error(t('attendance.toast.noSchedule'))
    downloadFile(`/attendance/export/pdf?scheduleId=${selectedScheduleId}&date=${date}`, 'attendance.pdf')
  }

  const handleExportExcel = () => {
    if (!selectedScheduleId) return toast.error(t('attendance.toast.noSchedule'))
    downloadFile(`/attendance/export/excel?scheduleId=${selectedScheduleId}&date=${date}`, 'attendance.xlsx')
  }

  useEffect(() => {
    fetchSchedules()
      .catch(() => setSchedules([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRecords()
  }, [selectedScheduleId, date])

  const presentCount = records.filter(record => record.status === 'present').length

  if (loading) return <Skeleton type="card" count={4} />

  return (
    <div className="space-y-6 animate-fade-in print-container">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{t('attendance.title')}</h1>
        <CardDescription>{t('attendance.description')}</CardDescription>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title={t('attendance.emptyTitle')} description={t('attendance.emptyDescription')} />
      ) : (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_180px_auto] gap-4 items-end">
                <div>
                  <label htmlFor="att-schedule" className="block text-sm font-medium text-slate-700 mb-1">{t('attendance.formLecture')}</label>
                  <Select
                    id="att-schedule"
                    value={selectedScheduleId}
                    onChange={event => {
                      setSelectedScheduleId(event.target.value)
                      setQr(null)
                    }}
                    options={schedules.map(schedule => ({
                      value: schedule.id,
                      label: `${schedule.courseId?.code || schedule.courseId?.name || t('admin.schedules.courseUnknown')} - ${t(`day.${schedule.day}`, schedule.day)} ${schedule.startTime}-${schedule.endTime}`
                    }))}
                  />
                </div>
                <div>
                  <label htmlFor="att-date" className="block text-sm font-medium text-slate-700 mb-1">{t('attendance.formDate')}</label>
                  <Input id="att-date" type="date" value={date} onChange={event => setDate(event.target.value)} />
                </div>
                <Button onClick={generateQr} loading={qrLoading}>
                  <QrCode className="w-4 h-4 ms-2" />
                  {t('attendance.generateButton')}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t('attendance.qrCard')}</CardTitle>
                <CardDescription>
                  {selectedSchedule
                    ? t('attendance.qrCardDesc', { course: selectedSchedule.courseId?.name || selectedSchedule.courseId?.code || t('admin.schedules.courseUnknown'), hall: selectedSchedule.hallId?.name || t('attendance.hallUnknown') })
                    : t('attendance.noSelection')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {qr ? (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-slate-200 bg-white p-4">
                      <img src={qr.qrCode} alt="QR Code" className="mx-auto w-64 max-w-full" />
                    </div>
                    {qr.expiresAt && (
                      <div className="rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {t('attendance.qrExpires', { time: formatTime(qr.expiresAt) })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-400">
                    {t('attendance.qrPlaceholder')}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{t('attendance.recordsCard')}</CardTitle>
                    <CardDescription>{t('attendance.recordsDesc')}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success" size="lg">{t('attendance.presentCount', { count: presentCount })}</Badge>
                    <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={records.length === 0}>
                      <FileText className="w-4 h-4 ms-1" />PDF
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={records.length === 0}>
                      <FileSpreadsheet className="w-4 h-4 ms-1" />Excel
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => window.print()} title={t('common.print')}>
                      <Printer className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={fetchRecords} loading={recordsLoading} title={t('common.refresh')}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {recordsLoading ? (
                  <div className="p-5"><Skeleton type="table" rows={4} /></div>
                ) : records.length === 0 ? (
                  <div className="p-8 text-center">
                    <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">{t('attendance.recordsEmpty')}</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-slate-50">
                          <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">{t('attendance.tableStudent')}</th>
                          <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">{t('attendance.tableStatus')}</th>
                          <th scope="col" className="px-4 py-3 text-right text-sm font-medium text-slate-600">{t('attendance.tableTime')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {records.map(record => (
                          <tr key={record.id} className="border-b last:border-0 hover:bg-slate-50">
                            <td className="px-4 py-3 text-sm font-medium text-slate-900">{getStudentName(record)}</td>
                            <td className="px-4 py-3">
                              <Badge variant={record.status === 'present' ? 'success' : 'warning'}>
                                {record.status === 'present' ? t('status.present') : t('status.absent')}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-500">
                              {record.createdAt ? formatTime(record.createdAt) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
