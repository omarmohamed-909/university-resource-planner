import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { LogIn, GraduationCap, BookOpen, Users, Building2, Shield, Sparkles, Eye, EyeOff, Mail } from 'lucide-react'
import QnuLogo from '../../components/ui/QnuLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'

function AnimatedBg() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let id
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize()
    window.addEventListener('resize', resize)
    const pts = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: 1 + Math.random() * 2.5, dx: (Math.random() - .5) * .4, dy: (Math.random() - .5) * .4,
      a: .12 + Math.random() * .3,
    }))
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pts.forEach(p => {
        p.x += p.dx; p.y += p.dy
        if (p.x < 0 || p.x > canvas.width)  p.dx *= -1
        if (p.y < 0 || p.y > canvas.height) p.dy *= -1
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.a})`; ctx.fill()
      }); id = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])
  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">{label}</label>
      {children}
    </div>
  )
}

function PremiumInput({ icon: Icon, type = 'text', rightSlot, className = '', ...props }) {
  return (
    <div className="relative flex-shrink-0">
      {Icon && (
        <div className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={17} />
        </div>
      )}
      <input
        type={type}
        className={`w-full h-14 px-5 ${rightSlot ? 'pe-12' : Icon ? 'pe-11' : ''}
                    rounded-lg border border-slate-200 bg-white shadow-sm
                   text-slate-900 text-base placeholder:text-slate-400
                    focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/15 focus:shadow-md
                   hover:border-slate-300 transition-all duration-200
                   ![autofill]:shadow-[inset_0_0_0px_1000px_white]
                   ![autofill]:text-slate-900 ${className}`}
        style={{
          paddingInlineStart: '20px',
          paddingInlineEnd: rightSlot ? '48px' : Icon ? '44px' : '20px',
          ...props.style
        }}
        {...props}
      />
      {rightSlot && (
        <div className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400">
          {rightSlot}
        </div>
      )}
    </div>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate    = useNavigate()
  const login       = useAuthStore(s => s.login)
  const googleLogin = useAuthStore(s => s.googleLogin)

  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [loading, setLoading]     = useState(false)
  const [quickLoading, setQuickLoading]   = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'

  const demos = import.meta.env.DEV ? [
    { label: t('auth.login.demoAdmin'), role: 'admin', email: 'admin@svnu.edu', password: 'admin123', className: 'bg-slate-950 hover:bg-slate-800', icon: Shield },
    { label: t('auth.login.demoDoctor'), role: 'doctor', email: 'ahmed@svnu.edu', password: 'doctor123', className: 'bg-teal-700 hover:bg-teal-800', icon: BookOpen },
    { label: t('auth.login.demoStudent'), role: 'student', email: 'student@svnu.edu', password: 'student123', className: 'bg-indigo-700 hover:bg-indigo-800', icon: GraduationCap },
  ] : []

  const features = [
    { icon: BookOpen,  label: t('auth.login.feature1') },
    { icon: Building2, label: t('auth.login.feature2') },
    { icon: Users,     label: t('auth.login.feature3') },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password) return toast.error(t('auth.login.toast.emptyFields'))
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(t('auth.login.toast.welcomeBack'))
      navigate(`/${user.role}`)
    } catch (err) { toast.error(err.response?.data?.message || t('auth.login.toast.invalidCredentials')) }
    finally { setLoading(false) }
  }

  const quickLogin = async (d) => {
    setQuickLoading(d.role)
    try {
      const user = await login(d.email, d.password)
      toast.success(t('auth.login.toast.welcome'))
      navigate(`/${user.role}`)
    } catch { toast.error(t('auth.login.toast.quickLoginFailed')) }
    finally { setQuickLoading(null) }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    try {
      const user = await googleLogin(credentialResponse.credential)
      toast.success(t('auth.login.toast.welcomeGoogle'))
      navigate(`/${user.role}`)
    } catch (err) { toast.error(err.response?.data?.message || t('auth.login.toast.googleFailed')) }
    finally { setGoogleLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row-reverse">
      <div className="fixed top-4 end-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="relative lg:w-[46%] h-52 lg:h-auto overflow-hidden flex items-center justify-center bg-[#080f1a]">
        <AnimatedBg />
        <div className="absolute inset-0 bg-slate-900/35" />
        <div className="relative z-10 px-10 py-12 w-full max-w-md">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/20 backdrop-blur flex items-center justify-center shadow-xl flex-shrink-0 overflow-hidden p-1">
              <QnuLogo className="w-full h-full" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">QNU</h1>
              <p className="text-blue-400 text-xs mt-0.5">{t('auth.login.systemTitle')}</p>
            </div>
          </div>

          <h2 className="text-3xl lg:text-4xl font-bold text-white leading-tight mb-4 hidden lg:block">
            {t('auth.login.platformTitle')} <br />
            <span className="text-blue-300">{t('auth.login.platformHighlight')}</span>
          </h2>
          <p className="text-slate-400 text-base leading-relaxed mb-10 hidden lg:block">
            {t('auth.login.platformDesc')}
          </p>

          <div className="hidden lg:flex flex-col gap-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label}
                   className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-slate-300 text-sm">
                <div className="w-8 h-8 rounded-lg bg-blue-600/25 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center bg-white p-6 lg:p-12 xl:p-20">
        <div className="w-full max-w-[480px] animate-slide-up">

          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
              <QnuLogo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-slate-900">QNU</span>
          </div>

          <div className="mb-9">
            <h2 className="text-3xl font-bold text-slate-900">{t('auth.login.welcomeBack')}</h2>
            <p className="text-slate-500 mt-2 text-base">{t('auth.login.subtitle')}</p>
          </div>

          <div className="mt-6 mb-6">
            {isGoogleConfigured ? (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error(t('auth.login.toast.googleFailed'))}
                  width={440}
                  text="continue_with"
                  shape="rectangular"
                  theme="outline"
                  size="large"
                  useOneTap={false}
                />
              </div>
            ) : (
            <div className="relative">
              <button disabled
                className="w-full h-12 flex items-center justify-center gap-3 px-5 border border-slate-200 rounded-lg text-slate-400 font-semibold text-[15px] opacity-55 cursor-not-allowed">
                <GoogleIcon />&nbsp;{t('auth.login.googleButton')}
              </button>
              <span className="absolute -top-3 inset-x-0 mx-auto w-fit whitespace-nowrap bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium px-3 py-0.5 rounded-full">
                {t('auth.login.googleNotConfigured')}
              </span>
            </div>
          )}
          </div>

          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-xs text-slate-400 font-medium">{t('auth.login.divider')}</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label={t('auth.login.emailLabel')}>
              <PremiumInput
                icon={Mail}
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')} required dir="ltr"
              />
            </Field>

            <Field label={t('auth.login.passwordLabel')}>
              <PremiumInput
                type={showPass ? 'text' : 'password'}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder={t('auth.login.passwordPlaceholder')} required dir="ltr"
                rightSlot={
                  <button type="button" onClick={() => setShowPass(v => !v)}
                    className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                    {showPass ? <Eye size={17}/> : <EyeOff size={17}/>}
                  </button>
                }
              />
            </Field>
            <button type="submit" disabled={loading}
              className="w-full h-14 rounded-lg font-bold text-base text-white bg-slate-950 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4">
              {loading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn size={18} />}
              {loading ? t('auth.login.loadingButton') : t('auth.login.submitButton')}
            </button>
          </form>

          <div className="mt-9">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Sparkles size={12} /> {t('auth.login.quickLogin')}
              </span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              {demos.map(d => {
                const Icon = d.icon
                return (
                  <button key={d.role} onClick={() => quickLogin(d)} disabled={!!quickLoading}
                    className={`flex flex-col items-center gap-2 py-4 px-3 rounded-lg font-semibold text-sm text-white ${d.className} hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60`}>
                    {quickLoading === d.role
                      ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      : <Icon size={20} />}
                    {d.label}
                  </button>
                )
              })}
            </div>
            <p className="text-center text-[11px] text-slate-400 mt-2.5">{t('auth.login.quickLoginHint')}</p>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">
            {t('auth.login.noAccount')}{' '}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">{t('auth.login.createAccount')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
