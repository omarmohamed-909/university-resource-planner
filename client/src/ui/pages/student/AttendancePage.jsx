import { useEffect, useRef, useState } from 'react'
import Card, { CardContent, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Skeleton from '../../components/ui/Skeleton'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import toast from 'react-hot-toast'
import { QrCode, ClipboardCheck, Camera, X } from 'lucide-react'
import api from '../../../infrastructure/api/axios'

const DAY_LABELS = { saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين', tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس' }

export default function StudentAttendance() {
  const [schedules, setSchedules] = useState([])
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState(null)
  const [qrData, setQrData] = useState('')
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const scannerRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    api.get('/schedules')
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
          toast.success('تم قراءة الرمز بنجاح')
        },
        () => {}
      )
    } catch (err) {
      toast.error('تعذر الوصول إلى الكاميرا')
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
    if (!selectedSchedule || !qrData) return toast.error('يرجى مسح رمز QR أو إدخاله يدوياً')
    try {
      const { data } = await api.post('/attendance/checkin', {
        scheduleId: selectedSchedule.id,
        qrData
      })
      toast.success(data.data?.message || 'تم تسجيل الحضور')
      setModalOpen(false)
      setQrData('')
    } catch (error) {
      toast.error(error.response?.data?.message || 'فشل تسجيل الحضور')
    }
  }

  if (loading) return <Skeleton type="card" count={6} />

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">تسجيل الحضور</h1>
        <CardDescription>سجل حضورك في المحاضرات عبر مسح رمز QR بالكاميرا</CardDescription>
      </div>

      {schedules.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="لا توجد محاضرات" description="ليس لديك أي محاضرات مسجلة لتسجيل الحضور فيها." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schedules.map(sch => (
            <Card key={sch.id} hover>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-violet-100 p-2 rounded-lg"><ClipboardCheck className="w-5 h-5 text-violet-600" /></div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{sch.courseId?.name || sch.courseId?.code}</h3>
                    <p className="text-xs text-slate-500">{sch.hallId?.name}</p>
                  </div>
                </div>
                <div className="text-sm text-slate-600 mb-4">
                  <p>{DAY_LABELS[sch.day] || sch.day} | {sch.startTime} - {sch.endTime}</p>
                </div>
                <Button className="w-full" onClick={() => { setSelectedSchedule(sch); setModalOpen(true) }}>
                  <QrCode className="w-4 h-4 ml-2" />تسجيل حضور
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setQrData(''); stopScanner() }} title="تسجيل الحضور" size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            المحاضرة: {selectedSchedule?.courseId?.name || selectedSchedule?.courseId?.code}
          </p>

          {/* QR Scanner */}
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
                <p className="text-center text-xs text-slate-400 py-2 bg-black/80">وجه الكاميرا نحو رمز QR</p>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={startScanner}>
                <Camera className="w-4 h-4 ml-2" />مسح QR بالكاميرا
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-200" />
            <span className="text-xs text-slate-400">أو أدخل الرمز يدوياً</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">رمز QR</label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-mono focus:ring-4 focus:ring-slate-900/10 focus:border-slate-500 outline-none transition-all"
              rows={2}
              value={qrData}
              onChange={e => setQrData(e.target.value)}
              placeholder="أو قم بلصق رمز QR هنا"
            />
          </div>

          <Button className="w-full" onClick={handleCheckIn}>
            <QrCode className="w-4 h-4 ml-2" />تأكيد الحضور
          </Button>
        </div>
      </Modal>
    </div>
  )
}
