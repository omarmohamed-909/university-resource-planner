import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import {
  LogIn, GraduationCap, BookOpen, Users, Building2,
  Shield, Sparkles, Eye, EyeOff, Mail, ArrowLeft,
} from 'lucide-react'
import QnuLogo from '../../components/ui/QnuLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import DarkModeToggle from '../../components/DarkModeToggle'

/* ─────────────────────────────────────────────────────────────
   Aurora background — animated gradient blobs (dark panel only)
   ───────────────────────────────────────────────────────────── */
function AuroraBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Base color wash */}
      <div className="absolute inset-0 bg-[#070b14]" />

      {/* Gradient blobs */}
      <div
        className="aurora-blob w-[420px] h-[420px] -top-32 -end-20"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.45) 0%, transparent 70%)',
          animationDelay: '0s',
        }}
      />
      <div
        className="aurora-blob w-[380px] h-[380px] top-1/3 -start-24"
        style={{
          background: 'radial-gradient(circle, rgba(139,92,246,0.35) 0%, transparent 70%)',
          animationDelay: '-6s',
        }}
      />
      <div
        className="aurora-blob w-[320px] h-[320px] -bottom-24 end-1/4"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.25) 0%, transparent 70%)',
          animationDelay: '-12s',
        }}
      />

      {/* Subtle grid overlay */}
      <div className="absolute inset-0 bg-grid bg-grid-fade opacity-40" />

      {/* Top vignette */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/30 to-transparent" />
      {/* Bottom vignette */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/40 to-transparent" />
    </div>
  )
}

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
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
      <label className="block text-xs font-bold text-label uppercase tracking-[0.08em]">{label}</label>
      {children}
    </div>
  )
}

function PremiumInput({ icon: Icon, type = 'text', rightSlot, className = '', ...props }) {
  return (
    <div className="relative flex-shrink-0 group/input">
      {Icon && (
        <div className="absolute end-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none transition-colors group-focus-within/input:text-primary-500">
          <Icon size={17} />
        </div>
      )}
      <input
        type={type}
        className={`w-full h-14 rounded-lg border border-border bg-surface shadow-sm
                   text-title text-base placeholder:text-muted
                    focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15 focus:shadow-md
                   hover:border-active transition-all duration-200
                   ![autofill]:shadow-[inset_0_0_0px_1000px_white] ${className}`}
        style={{
          paddingInlineStart: '20px',
          paddingInlineEnd: rightSlot ? '48px' : Icon ? '44px' : '20px',
          ...props.style
        }}
        {...props}
      />
      {rightSlot && (
        <div className="absolute end-4 top-1/2 -translate-y-1/2 text-muted">
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
  const [quickLoading, setQuickLoading]         = useState(null)
  const [googleLoading, setGoogleLoading]       = useState(false)

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'

  const demos = import.meta.env.DEV ? [
    { label: t('auth.login.demoAdmin'),   role: 'admin',   email: 'admin@svnu.edu',   password: 'admin123',   icon: Shield,        accent: 'from-blue-600 to-blue-800',         ring: 'hover:ring-blue-500/30' },
    { label: t('auth.login.demoDoctor'),  role: 'doctor',  email: 'ahmed@svnu.edu',   password: 'doctor123',  icon: BookOpen,      accent: 'from-emerald-600 to-emerald-800',   ring: 'hover:ring-emerald-500/30' },
    { label: t('auth.login.demoStudent'), role: 'student', email: 'student@svnu.edu', password: 'student123', icon: GraduationCap, accent: 'from-violet-600 to-violet-800',     ring: 'hover:ring-violet-500/30' },
  ] : []

  const features = [
    { icon: BookOpen,   label: t('auth.login.feature1') },
    { icon: Building2,  label: t('auth.login.feature2') },
    { icon: Users,      label: t('auth.login.feature3') },
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
    <div className="min-h-screen flex flex-col lg:flex-row-reverse bg-surface">
      {/* Top-right tools */}
      <div className="fixed top-4 end-4 z-50 flex items-center gap-2">
        <DarkModeToggle />
        <LanguageSwitcher />
      </div>

      {/* ─────────────────────────────────────────────
          LEFT (RTL) — Aurora brand panel
          ───────────────────────────────────────────── */}
      <div className="relative lg:w-[46%] h-56 lg:h-auto overflow-hidden flex items-center justify-center">
        <AuroraBg />

        <div className="relative z-10 px-8 sm:px-10 lg:px-12 py-10 w-full max-w-md">
          {/* Brand */}
          <div className="flex items-center gap-4 mb-12">
            <div className="relative w-14 h-14 rounded-xl bg-white/10 border border-white/15 backdrop-blur flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden p-1.5">
              <QnuLogo className="w-full h-full" />
              <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/10" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-none">QNU</h1>
              <p className="text-blue-300/80 text-xs mt-1 font-medium tracking-wide">{t('auth.login.systemTitle')}</p>
            </div>
          </div>

          {/* Hero copy */}
          <h2 className="text-3xl lg:text-[2.5rem] lg:leading-[1.15] font-extrabold text-white leading-tight mb-4 hidden lg:block text-balance">
            {t('auth.login.platformTitle')} <br />
            <span className="bg-gradient-to-r from-blue-300 via-violet-300 to-blue-200 bg-clip-text text-transparent">
              {t('auth.login.platformHighlight')}
            </span>
          </h2>
          <p className="text-slate-300/80 text-base leading-relaxed mb-10 hidden lg:block text-pretty">
            {t('auth.login.platformDesc')}
          </p>

          {/* Feature list */}
          <div className="hidden lg:flex flex-col gap-2.5">
            {features.map(({ icon: Icon, label }, i) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-200 text-sm backdrop-blur-sm hover:bg-white/[0.07] hover:border-white/[0.12] transition-all duration-300 animate-slide-in-right"
                style={{ animationDelay: `${i * 80 + 100}ms` }}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/30 to-violet-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={15} className="text-blue-200" />
                </div>
                <span className="font-medium">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────
          RIGHT (RTL) — Form panel
          ───────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center bg-surface p-6 lg:p-12 xl:p-20 relative">
        {/* Subtle radial accent at top */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary-500/[0.04] to-transparent pointer-events-none" />

        <div className="relative w-full max-w-[480px] animate-slide-up">

          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 ring-1 ring-black/5">
              <QnuLogo className="w-full h-full" />
            </div>
            <span className="text-xl font-bold text-title">QNU</span>
          </div>

          {/* Heading */}
          <div className="mb-9">
            <span className="eyebrow mb-3">
              <span className="w-1 h-1 rounded-full bg-primary-500" />
              {t('auth.login.subtitle', { defaultValue: 'مرحباً بعودتك' })}
            </span>
            <h2 className="text-3xl font-extrabold text-title tracking-tight text-balance">
              {t('auth.login.welcomeBack')}
            </h2>
            <p className="text-label mt-2 text-base text-pretty">{t('auth.login.subtitle')}</p>
          </div>

          {/* Google */}
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
                  className="w-full h-12 flex items-center justify-center gap-3 px-5 border border-border rounded-lg text-muted font-semibold text-[15px] opacity-60 cursor-not-allowed">
                  <GoogleIcon />&nbsp;{t('auth.login.googleButton')}
                </button>
                <span className="absolute -top-2.5 inset-x-0 mx-auto w-fit whitespace-nowrap bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium px-3 py-0.5 rounded-full">
                  {t('auth.login.googleNotConfigured')}
                </span>
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-7">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
            <span className="text-xs text-muted font-medium">{t('auth.login.divider')}</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
          </div>

          {/* Form */}
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
                    className="text-muted hover:text-title transition-colors cursor-pointer p-1 -m-1 rounded"
                    aria-label={showPass ? t('auth.login.hidePassword', { defaultValue: 'إخفاء' }) : t('auth.login.showPassword', { defaultValue: 'إظهار' })}>
                    {showPass ? <Eye size={17}/> : <EyeOff size={17}/>}
                  </button>
                }
              />
            </Field>

            <button type="submit" disabled={loading}
              className="group relative w-full h-14 rounded-lg font-bold text-base text-primary-btn-text bg-primary-btn hover:brightness-110 active:scale-[0.99] transition-all duration-200 disabled:opacity-60 cursor-pointer flex items-center justify-center gap-2 mt-4 shadow-md overflow-hidden">
              {/* Sheen on hover */}
              <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              {loading
                ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <LogIn size={18} className="relative z-10" />}
              <span className="relative z-10">{loading ? t('auth.login.loadingButton') : t('auth.login.submitButton')}</span>
            </button>
          </form>

          {/* Quick login */}
          {demos.length > 0 && (
            <div className="mt-9">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
                <span className="flex items-center gap-1.5 text-xs text-muted font-medium">
                  <Sparkles size={12} /> {t('auth.login.quickLogin')}
                </span>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {demos.map((d, i) => {
                  const Icon = d.icon
                  return (
                    <button
                      key={d.role}
                      onClick={() => quickLogin(d)}
                      disabled={!!quickLoading}
                      className={`group relative flex flex-col items-center gap-2 py-4 px-3 rounded-lg font-semibold text-sm text-white bg-gradient-to-br ${d.accent} shadow-md hover:shadow-lg active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-60 ring-2 ring-transparent ${d.ring} animate-slide-up overflow-hidden`}
                      style={{ animationDelay: `${i * 60 + 80}ms` }}
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
                      {quickLoading === d.role
                        ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin relative z-10" />
                        : <Icon size={20} className="relative z-10" />}
                      <span className="relative z-10">{d.label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-center text-[11px] text-muted mt-2.5">{t('auth.login.quickLoginHint')}</p>
            </div>
          )}

          {/* Footer link */}
          <p className="text-center text-sm text-label mt-8 flex items-center justify-center gap-1.5">
            {t('auth.login.noAccount')}
            <Link to="/register" className="inline-flex items-center gap-1 text-primary-600 hover:text-primary-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold group">
              {t('auth.login.createAccount')}
              <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-0" />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
