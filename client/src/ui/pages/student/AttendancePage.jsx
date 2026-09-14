import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { FileText, FileSpreadsheet, Printer, QrCode, ClipboardCheck, Camera, X } from 'lucide-react'
import api from '../../../infrastructure/api/axios'
import { downloadFile } from '../../../infrastructure/api/download'

export default function StudentAttendance() {
  const { t } = useTranslation()
  const [schedules, setSchedules] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [qrData, setQrData] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const videoRef = useRef(null)

  const dayLabels = {
    saturday: t('day.saturday'),
    sunday: t('day.sunday'),
    monday: t('day.monday'),
    tuesday: t('day.tuesday'),
    wednesday: t('day.wednesday'),
    thursday: t('day.thursday'),
  }

  useEffect(() => {
    api.get('/schedules?limit=100')
      .then(r => setSchedules(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => stopScanner()
  }, [])

  const startScanner = async () => {
    setScanning(true)
    try {
      const Html5Qrcode = (await import('html5-qrcode')).Html5Qrcode
      const scanner = new Html5Qrcode('qr-scanner')
      scannerRef.current = scanner
      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setQrData(decodedText)
          stopScanner()
          toast.success(t('student.attendance.toast.qrScanned'))
        },
        () => {}
      )
    } catch (err) {
      toast.error(t('common.error.cameraAccess'))
      setScanning(false)
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
    }
    setScanning(false)
  }

  const handleCheckIn = async () => {
    if (!selectedSchedule || !qrData) return toast.error(t('student.attendance.toast.checkinNoQR'))
    try {
      const { data } = await api.post('/attendance/checkin', {
        scheduleId: selectedSchedule.id,
        qrData
      })
      toast.success(data.data?.message || t('student.attendance.toast.checkinSuccess'))
      setModalOpen(false)
      setQrData('')
    } catch (error) {
      toast.error(error.response?.data?.message || t('student.attendance.toast.checkinFailed'))
    }
  }

  const handleExportPdf = () => downloadFile('/attendance/my/export/pdf', 'my-attendance.pdf')
  const handleExportExcel = () => downloadFile('/attendance/my/export/excel', 'my-attendance.xlsx')

  if (loading) return <Skeleton type="card" count={6} />

  return (
    <div className="space-y-6 print-container">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-title tracking-[-0.02em] text-balance">{t('student.attendance.title')}</h1>
          <CardDescription>{t('student.attendance.description')}</CardDescription>
        </div>
        <div className="flex items-center gap-2 no-print">
          <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={schedules.length === 0}>
            <FileText className="w-4 h-4 ms-1" />{t('student.attendance.exportPdf')}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} disabled={schedules.length === 0}>
            <FileSpreadsheet className="w-4 h-4 ms-1" />{t('student.attendance.exportExcel')}
          </Button>
          <Button variant="outline" size="icon" onClick={() => window.print()} title={t('common.print')}>
            <Printer className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title={t('student.attendance.emptyTitle')} description={t('student.attendance.emptyDescription')} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(sch => (
            <Card key={sch.id} hover>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-violet-100 p-2 rounded-lg"><ClipboardCheck className="w-5 h-5 text-violet-600" /></div>
                  <div>
                    <h3 className="font-semibold text-title">{sch.courseId?.name || sch.courseId?.code}</h3>
                    <p className="text-xs text-label">{sch.hallId?.name}</p>
                  </div>
                </div>
                <div className="text-sm text-body mb-4">
                  <p>{dayLabels[sch.day] || sch.day} | {sch.startTime} - {sch.endTime}</p>
                </div>
                <Button className="w-full" onClick={() => { setSelectedSchedule(sch); setModalOpen(true) }}>
                  <QrCode className="w-4 h-4 ms-2" />{t('student.attendance.registerButton')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setQrData(''); stopScanner() }} title={t('student.attendance.modalTitle')} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-body">
            {selectedSchedule?.courseId?.name || selectedSchedule?.courseId?.code}
          </p>

          <div className="relative">
            {scanning ? (
              <div className="bg-black rounded-lg overflow-hidden">
                <div id="qr-scanner" className="w-full aspect-square max-h-[300px]" />
                <button
                  onClick={stopScanner}
                  className="absolute top-2 left-2 p-1.5 bg-black/50 rounded-lg text-white hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
                <p className="text-center text-xs text-slate-400 py-2 bg-black/80">{t('student.attendance.scannerHint')}</p>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={startScanner}>
                <Camera className="w-4 h-4 ms-2" />{t('student.attendance.scanButton')}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-border" />
            <span className="text-xs text-muted">{t('student.attendance.manualDivider')}</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <div>
            <label className="block text-sm font-medium text-body mb-1">{t('student.attendance.qrLabel')}</label>
            <textarea
              className="w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm font-mono focus:ring-4 focus:ring-slate-900/10 focus:border-active outline-none transition-all"
              rows={2}
              value={qrData}
              onChange={e => setQrData(e.target.value)}
              placeholder={t('student.attendance.qrPlaceholder')}
            />
          </div>

          <Button className="w-full" onClick={handleCheckIn}>
            <QrCode className="w-4 h-4 ms-2" />{t('student.attendance.confirmButton')}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
