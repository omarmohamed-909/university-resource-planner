import { useState, useEffect, useRef } from 'react'
import Card, { CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import toast from 'react-hot-toast'
import { useScheduleStore } from '../../store/scheduleStore'
import {
  Sparkles, CalendarDays, CheckCircle, AlertCircle, ChevronLeft,
  Brain, Zap, BarChart3, Eye, Play, RotateCcw, Clock, Users,
  Building2, BookOpen, TrendingUp, X, Settings2
} from 'lucide-react'
import { cn } from '../../lib/utils'

const STEPS = [
  { num: 1, label: 'الإعداد',    icon: Sparkles },
  { num: 2, label: 'التحليل الجيني', icon: Brain },
  { num: 3, label: 'المعاينة',  icon: Eye },
  { num: 4, label: 'التطبيق',   icon: CheckCircle },
]

const DAY_LABELS = {
  saturday: 'السبت', sunday: 'الأحد', monday: 'الإثنين',
  tuesday: 'الثلاثاء', wednesday: 'الأربعاء', thursday: 'الخميس',
}

const TIME_SLOTS = ['08:00','09:45','11:30','13:15','15:00']

function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0)
  const raf = useRef(null)
  useEffect(() => {
    const start = Date.now()
    const from = display
    const step = () => {
      const t = Math.min((Date.now() - start) / duration, 1)
      const ease = 1 - Math.pow(1 - t, 3)
      setDisplay(Math.round(from + (value - from) * ease))
      if (t < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [value])
  return <span>{display}</span>
}

function ProgressBar({ value, color = 'bg-primary-500', className }) {
  return (
    <div className={cn('h-2 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div className={cn('h-full rounded-full transition-all duration-700', color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  )
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center justify-center gap-1 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon
        const done = current > step.num
        const active = current === step.num
        return (
          <div key={step.num} className="flex items-center gap-1">
            <div className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300', active ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : '', done ? 'bg-success-500 text-white' : '', !active && !done ? 'bg-slate-100 text-slate-400' : '')}>
              {done ? <CheckCircle className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={cn('w-6 h-px mx-0.5', done ? 'bg-success-400' : 'bg-slate-200')} />}
          </div>
        )
      })}
    </div>
  )
}

function GeneratingView({ semester }) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState(0)
  const phases = ['تهيئة المجتمع المبدئي...', 'تقييم اللياقة (Fitness)...', 'التزاوج والطفرات...', 'تطور الأجيال...', 'البحث عن الحل الأمثل...', 'إنهاء الجدول...']
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 95) { clearInterval(interval); return p }
        return p + Math.random() * 8
      })
      setPhase(p => (p + 1) % phases.length)
    }, 800)
    return () => clearInterval(interval)
  }, [])
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center space-y-8">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center shadow-sm">
          <Brain className="w-10 h-10 text-white" />
        </div>
      </div>
      <div className="space-y-2 w-full max-w-sm">
        <div className="flex justify-between text-sm font-medium text-slate-700">
          <span>التقدم الجيني</span><span><AnimatedNumber value={Math.round(Math.min(progress, 95))} />%</span>
        </div>
        <ProgressBar value={progress} color="bg-primary-500" />
        <p className="text-sm text-slate-500 animate-fade-in">{phases[phase]}</p>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-700">جاري توليد جدول للفصل <span className="font-medium text-primary-600">{semester}</span></p>
      </div>
    </div>
  )
}

function ConvergenceChart({ convergence, bestFitness, generationsRun }) {
  if (!convergence || convergence.length === 0) return null
  const values = convergence.map(c => c.best)
  const minF = Math.min(...values)
  const maxF = Math.max(...values)
  const range = maxF - minF
  // Color the bars: early gens are red-orange, later gens shift to indigo-green
  const barColor = (i) => {
    const t = convergence.length > 1 ? i / (convergence.length - 1) : 1
    if (t < 0.33) return 'bg-rose-400'
    if (t < 0.66) return 'bg-amber-400'
    return 'bg-indigo-500'
  }
  return (
    <Card className="border-indigo-100 overflow-hidden mb-6">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <p className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-indigo-600"/>
            تطور اللياقة — Fitness Convergence
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full">الأجيال: {generationsRun}</span>
            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full">أفضل: {Math.round(bestFitness)}</span>
          </div>
        </div>
        <div className="relative h-28 flex items-end gap-0.5 bg-slate-50 rounded-lg px-2 pb-2 pt-4">
          {/* baseline */}
          <div className="absolute bottom-2 left-2 right-2 h-px bg-slate-200" />
          {convergence.map((pt, i) => {
            // When range=0 all bars same fitness — show at 80% to still be visible
            const pct = range === 0 ? 80 : Math.max(20, ((pt.best - minF) / range) * 80)
            return (
              <div key={i} title={`Gen ${pt.gen}: ${pt.best}`}
                className={cn('relative flex-1 min-w-[2px] rounded-t-sm transition-all duration-300 cursor-pointer group', barColor(i),
                  'hover:opacity-80'
                )}
                style={{ height: `${pct}%` }}
              >
                <div className="hidden group-hover:flex absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[9px] py-0.5 px-1.5 rounded whitespace-nowrap z-10">
                  G{pt.gen}: {pt.best}
                </div>
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
          <span>Gen 0</span>
          <span>← التطور ←</span>
          <span>Gen {convergence[convergence.length-1]?.gen}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function AnalyticsBar({ analytics }) {
  if (!analytics) return null
  const { scheduledCount, totalCourses, utilization, dayDistribution } = analytics
  const maxDay = Math.max(...(dayDistribution || []).map(d => d.count), 1)

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[{ label: 'المواد المجدولة', value: scheduledCount, total: totalCourses, icon: BookOpen, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'استخدام الفترات', value: `${utilization}%`, icon: BarChart3, color: 'text-violet-600', bg: 'bg-violet-50' },
        { label: 'إجمالي المواد', value: totalCourses, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'أيام موزعة', value: (dayDistribution || []).filter(d => d.count > 0).length, icon: CalendarDays, color: 'text-emerald-600', bg: 'bg-emerald-50' }
      ].map(card => (
        <div key={card.label} className={cn('rounded-xl p-4 border border-slate-100', card.bg)}>
          <div className="flex items-center gap-2 mb-2"><card.icon className={cn('w-4 h-4', card.color)} /><span className="text-xs text-slate-500 font-medium">{card.label}</span></div>
          <p className={cn('text-2xl font-bold tabular-nums', card.color)}>{card.value}</p>
          {card.total && <ProgressBar value={(card.value / card.total) * 100} color="bg-primary-400" className="mt-2" />}
        </div>
      ))}
      {dayDistribution && dayDistribution.length > 0 && (
        <div className="col-span-2 lg:col-span-4 bg-white rounded-xl border border-slate-100 p-4">
          <p className="text-xs font-semibold text-slate-500 mb-4">توزيع المحاضرات على الأيام</p>
          <div className="flex items-end justify-between gap-2 h-24">
            {dayDistribution.map(d => (
              <div key={d.day} className="flex flex-col items-center flex-1 h-full">
                <span className="text-xs font-bold text-slate-700 mb-1">{d.count}</span>
                <div className="w-full flex-1 flex items-end justify-center">
                  <div className="w-full max-w-[40px] bg-primary-500 rounded-t-sm transition-all duration-700" style={{ height: `${maxDay > 0 ? (d.count / maxDay) * 100 : 0}%`, minHeight: d.count > 0 ? '4px' : '0' }} />
                </div>
                <span className="text-[10px] text-slate-400 mt-1">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ScheduleGrid({ preview }) {
  if (!preview || preview.length === 0) return null
  const days = [...new Set(preview.map(s => s.day))].sort((a,b) => Object.keys(DAY_LABELS).indexOf(a) - Object.keys(DAY_LABELS).indexOf(b))
  const slots = [...new Set(preview.map(s => s.startTime))].sort()
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50">
            <th className="px-3 py-3 text-right font-semibold text-slate-600 text-xs w-24">الوقت</th>
            {days.map(d => <th key={d} className="px-3 py-3 text-center font-semibold text-slate-600 text-xs">{DAY_LABELS[d] || d}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot} className="border-t border-slate-100">
              <td className="px-3 py-2 text-right"><span className="text-xs font-semibold text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" />{slot}</span></td>
              {days.map(day => (
                <td key={day} className="px-2 py-1.5 align-top">
                  {preview.filter(s => s.day === day && s.startTime === slot).map((e, i) => (
                    <div key={i} className="bg-primary-50 border border-primary-200 rounded-lg px-2 py-1.5 mb-1 last:mb-0 min-w-[90px]">
                      <p className="text-[10px] font-bold text-primary-700 leading-tight">{e.courseCode}</p>
                      <p className="text-[10px] text-slate-600 leading-tight truncate">{e.courseName}</p>
                      <p className="text-[9px] text-slate-400 flex items-center gap-0.5 mt-0.5"><Building2 className="w-2.5 h-2.5" />{e.hallName}</p>
                    </div>
                  ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function UnscheduledList({ items }) {
  if (!items || items.length === 0) return null
  return (
    <Card className="border-amber-200 mt-4 mb-6">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-100"><AlertCircle className="w-4 h-4 text-amber-600" /></div>
          <div><p className="font-semibold text-amber-700 text-sm">مواد لم تُجدَّل ({items.length})</p><p className="text-xs text-slate-500">يجب معالجة هذه المواد يدوياً</p></div>
        </div>
        <div className="space-y-2">
          {items.map(c => (
            <div key={c.id || c.code} className="flex items-start gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
              <X className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-slate-900">{c.code} — {c.name}</p><p className="text-xs text-slate-500 mt-0.5">{c.reason}</p></div>
              {c.students !== undefined && <span className="text-xs bg-amber-200 text-amber-800 rounded-full px-2 py-0.5 shrink-0">{c.students} طالب</span>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminAutoSchedule() {
  const { autoGenerate } = useScheduleStore()
  const [semester, setSemester] = useState('2026-1')
  const [populationSize, setPopulationSize] = useState(100)
  const [maxGenerations, setMaxGenerations] = useState(200)
  const [mutationRate, setMutationRate] = useState(0.05)
  const [showAdvanced, setShowAdvanced] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [preview, setPreview] = useState(null)
  const [result, setResult] = useState(null)
  const pendingRef = useRef(false)

  const reset = () => {
    pendingRef.current = false
    setStep(1); setPreview(null); setResult(null); setLoading(false)
  }

  const handlePreview = async () => {
    if (!semester.trim()) return toast.error('يرجى إدخال الفصل الدراسي')
    pendingRef.current = true
    setLoading(true); setStep(2); setPreview(null);
    try {
      const data = await autoGenerate(semester, true, { populationSize, maxGenerations, mutationRate })
      if (!pendingRef.current) return
      setPreview(data); setStep(3);
    } catch (err) {
      if (!pendingRef.current) return
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التحليل')
      setStep(1)
    } finally {
      if (pendingRef.current) setLoading(false)
    }
  }

  const handleApply = async () => {
    pendingRef.current = true
    setLoading(true)
    try {
      const data = await autoGenerate(semester, false, { populationSize, maxGenerations, mutationRate })
      if (!pendingRef.current) return
      setResult(data); setStep(4);
      if (data.applied) toast.success(`تم تطبيق ${data.schedules?.length || 0} محاضرة بنجاح 🎉`)
      else toast.error('لم يتم التطبيق — تحقق من المواد غير المجدولة')
    } catch (err) {
      if (!pendingRef.current) return
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التطبيق')
    } finally {
      if (pendingRef.current) setLoading(false)
    }
  }

  const previewList = preview?.generatedPreview || []
  const previewUnsch = preview?.unscheduled || []
  const hasConflicts = previewUnsch.length > 0
  const canApply = step === 3 && !hasConflicts && previewList.length > 0

  return (
    <div className="animate-fade-in w-full max-w-7xl mr-auto min-h-[calc(100vh-12rem)] flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shadow-sm">
              <Brain className="w-4 h-4 text-white" />
            </span>
            AI Genetic Scheduler 🧬
          </h1>
          <p className="text-slate-500 text-sm mt-1">توليد جداول باستخدام الخوارزميات الجينية للبحث عن أفضل جدول ممكن</p>
        </div>
        {(step > 1 || loading) && <Button variant="outline" onClick={reset} className="shrink-0"><RotateCcw className="w-4 h-4 me-2" />إعادة البدء</Button>}
      </div>

      <div className="shrink-0">
        <StepIndicator current={step} />
      </div>

      {step === 1 && (
        <div className="animate-slide-up flex-1 flex flex-col justify-center gap-6">
          <Card>
            <CardHeader>
              <div><CardTitle>إعداد الجدول الجيني</CardTitle><CardDescription>حدد الفصل الدراسي وقم بضبط معلمات الخوارزمية الجينية إن لزم الأمر</CardDescription></div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">الفصل الدراسي</label>
                  <Input value={semester} onChange={e => setSemester(e.target.value)} placeholder="مثال: 2026-1" className="font-mono" />
                </div>
                <div className="flex gap-3">
                  <Button onClick={() => setShowAdvanced(!showAdvanced)} variant="outline" className="h-10 flex-1 border-dashed">
                    <Settings2 className="w-4 h-4 me-2" /> إعدادات GA
                  </Button>
                  <Button onClick={handlePreview} disabled={loading} variant="gradient" className="h-10 flex-[2]">
                    <Zap className="w-4 h-4 me-2" /> بدء التطور (المعاينة)
                  </Button>
                </div>
              </div>
              {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 animate-slide-up">
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">حجم المجتمع (Population)</label><Input type="number" min={10} max={500} value={populationSize} onChange={e => setPopulationSize(Number(e.target.value))} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">عدد الأجيال الأقصى</label><Input type="number" min={10} max={1000} value={maxGenerations} onChange={e => setMaxGenerations(Number(e.target.value))} /></div>
                  <div><label className="block text-xs font-semibold text-slate-600 mb-1">معدل الطفرة (Mutation Rate)</label><Input type="number" min={0} max={1} step="0.01" value={mutationRate} onChange={e => setMutationRate(Number(e.target.value))} /></div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[{ icon: Users, title: 'المجتمع الأولي', desc: 'توليد مئات الجداول العشوائية المبدئية كمجتمع أول' },
                  { icon: Zap, title: 'دالة اللياقة (Fitness)', desc: 'تقييم الجداول ومكافأة التوزيع المتساوي ومعاقبة التعارضات' },
                  { icon: TrendingUp, title: 'التزاوج والطفرة', desc: 'دمج الجداول الأفضل وتغيير بعض الجينات عشوائياً لتحسين النتائج' }
                ].map(f => (
                  <div key={f.title} className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0"><f.icon className="w-4 h-4 text-slate-600" /></div><div><p className="text-sm font-semibold text-slate-800">{f.title}</p><p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{f.desc}</p></div></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {step === 2 && loading && <Card className="animate-fade-in flex-1 flex"><GeneratingView semester={semester} /></Card>}

      {step === 3 && preview && (
        <div className="animate-slide-up flex-1 flex flex-col gap-4 pb-10">
          <div className={cn('rounded-xl border p-4 flex items-center gap-4', hasConflicts ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200')}>
            <div className={cn('p-2 rounded-full', hasConflicts ? 'bg-amber-100' : 'bg-emerald-100')}>
              {hasConflicts ? <AlertCircle className="w-5 h-5 text-amber-600" /> : <CheckCircle className="w-5 h-5 text-emerald-600" />}
            </div>
            <div className="flex-1">
              <p className={cn('font-bold text-sm', hasConflicts ? 'text-amber-800' : 'text-emerald-800')}>
                {hasConflicts ? `انتهى التطور — ${previewUnsch.length} مادة لم تُجدَّل بنجاح` : `تم إيجاد جدول مثالي — ${previewList.length} محاضرة بدون تعارضات`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">{preview.message || ''}</p>
            </div>
            {canApply && <Button onClick={handleApply} disabled={loading} variant="gradient" className="shrink-0"><Play className="w-4 h-4 me-2" />تطبيق الجدول</Button>}
          </div>
          {preview.analytics && <ConvergenceChart {...preview.analytics} />}
          <AnalyticsBar analytics={preview.analytics} />
          <UnscheduledList items={previewUnsch} />
          {previewList.length > 0 && (
            <Card><CardHeader><div><CardTitle>أفضل جدول مستخرج — {semester}</CardTitle><CardDescription>{previewList.length} محاضرة</CardDescription></div></CardHeader><CardContent className="p-4"><ScheduleGrid preview={previewList} /></CardContent></Card>
          )}
          {canApply && <div className="flex justify-end pt-2"><Button onClick={handleApply} disabled={loading} variant="gradient" className="px-8"><Play className="w-4 h-4 me-2" />{loading ? 'جاري التطبيق...' : 'تطبيق الجدول النهائي'}</Button></div>}
        </div>
      )}

      {step === 4 && result && (
        <div className="animate-slide-up flex-1 flex flex-col gap-4 pb-10">
          {result.applied ? (
            <div className="bg-white rounded-xl border border-emerald-200 p-10 text-center shadow-sm">
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center shadow-sm animate-fade-in"><CheckCircle className="w-8 h-8 text-white" /></div>
                </div>
                <div><h3 className="text-xl font-bold text-emerald-800">تم تطبيق الجدول بنجاح!</h3><p className="text-emerald-600 mt-1">تم حفظ <span className="font-bold"><AnimatedNumber value={result.schedules?.length || 0} /></span> محاضرة للفصل <span className="font-bold">{semester}</span></p></div>
                <div className="flex items-center justify-center gap-3 mt-4">
                  <Button onClick={() => window.location.href = '/admin/schedules'}><CalendarDays className="w-4 h-4 me-2" />عرض الجداول</Button>
                  <Button variant="outline" onClick={reset}><RotateCcw className="w-4 h-4 me-2" />توليد جدول جديد</Button>
                </div>
              </div>
            </div>
          ) : (
            <Card className="border-red-200"><CardContent className="p-6 flex items-center gap-4"><div className="p-3 rounded-full bg-red-100"><AlertCircle className="w-6 h-6 text-red-600" /></div><div><p className="font-bold text-red-700">لم يتم تطبيق الجدول</p><p className="text-sm text-red-600/80 mt-0.5">{result.message}</p></div></CardContent></Card>
          )}
          {result.analytics && <ConvergenceChart {...result.analytics} />}
          <AnalyticsBar analytics={result.analytics} />
          <UnscheduledList items={result.unscheduled} />
        </div>
      )}
    </div>
  )
}
