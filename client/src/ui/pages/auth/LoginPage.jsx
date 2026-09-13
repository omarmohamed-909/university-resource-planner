import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import {
  LogIn, GraduationCap, BookOpen, Users, Building2,
  Shield, Eye, EyeOff, Mail, ArrowLeft,
} from 'lucide-react'
import QnuLogo from '../../components/ui/QnuLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import DarkModeToggle from '../../components/DarkModeToggle'

function GoogleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-body">{label}</label>
      {children}
    </div>
  )
}

function AuthInput({ icon: Icon, type = 'text', action, ...props }) {
  return (
    <div className="relative group/input">
      {Icon && (
        <Icon className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted transition-colors group-focus-within/input:text-primary-600" />
      )}
      <input
        type={type}
        className="h-12 w-full rounded-lg border border-border bg-surface px-4 text-[15px] text-title outline-none transition-[border-color,box-shadow] placeholder:text-muted hover:border-slate-400 focus:border-primary-600 focus:ring-2 focus:ring-primary-600/15"
        style={{ paddingRight: Icon ? '44px' : '16px', paddingLeft: action ? '44px' : '16px' }}
        {...props}
      />
      {action && <div className="absolute left-4 top-1/2 -translate-y-1/2">{action}</div>}
    </div>
  )
}

export default function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)
  const googleLogin = useAuthStore(s => s.googleLogin)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [quickLoading, setQuickLoading] = useState(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
  const googleButtonWidth = typeof window === 'undefined' ? 350 : Math.min(440, window.innerWidth - 40)

  const demos = import.meta.env.DEV ? [
    { label: t('auth.login.demoAdmin'), role: 'admin', email: 'admin@svnu.edu', password: 'admin123', icon: Shield, color: 'bg-blue-500' },
    { label: t('auth.login.demoDoctor'), role: 'doctor', email: 'ahmed@svnu.edu', password: 'doctor123', icon: BookOpen, color: 'bg-emerald-500' },
    { label: t('auth.login.demoStudent'), role: 'student', email: 'student@svnu.edu', password: 'student123', icon: GraduationCap, color: 'bg-violet-500' },
  ] : []

  const features = [
    { icon: BookOpen, label: t('auth.login.feature1') },
    { icon: Building2, label: t('auth.login.feature2') },
    { icon: Users, label: t('auth.login.feature3') },
  ]

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!email.trim() || !password) return toast.error(t('auth.login.toast.emptyFields'))
    setLoading(true)
    try {
      const user = await login(email, password)
      toast.success(t('auth.login.toast.welcomeBack'))
      navigate(`/${user.role}`)
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.login.toast.invalidCredentials'))
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = async (demo) => {
    setQuickLoading(demo.role)
    try {
      const user = await login(demo.email, demo.password)
      toast.success(t('auth.login.toast.welcome'))
      navigate(`/${user.role}`)
    } catch {
      toast.error(t('auth.login.toast.quickLoginFailed'))
    } finally {
      setQuickLoading(null)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    try {
      const user = await googleLogin(credentialResponse.credential)
      toast.success(t('auth.login.toast.welcomeGoogle'))
      navigate(`/${user.role}`)
    } catch (error) {
      toast.error(error.response?.data?.message || t('auth.login.toast.googleFailed'))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(360px,42%)_1fr]">
      <div className="fixed end-4 top-4 z-50 flex items-center gap-2">
        <DarkModeToggle />
        <LanguageSwitcher />
      </div>

      <section className="relative hidden min-h-screen overflow-hidden bg-[#101827] text-white lg:flex lg:flex-col lg:justify-between" style={{ padding: '40px clamp(40px, 5vw, 64px)' }}>
        <div className="absolute inset-y-0 end-0 w-px bg-white/10" aria-hidden="true" />
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 overflow-hidden rounded-lg bg-white p-1">
            <QnuLogo className="h-full w-full" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none">QNU</p>
            <p className="mt-1 text-xs text-slate-400">{t('auth.login.systemTitle')}</p>
          </div>
        </div>

        <div className="max-w-lg py-14">
          <p className="mb-5 text-sm font-medium text-blue-300">South Valley National University</p>
          <h1 className="max-w-[12ch] text-4xl font-bold leading-[1.22] tracking-[-0.025em] text-balance xl:text-5xl">
            {t('auth.login.platformTitle')} {t('auth.login.platformHighlight')}
          </h1>
          <p className="mt-5 max-w-md text-base leading-8 text-slate-300 text-pretty">{t('auth.login.platformDesc')}</p>
        </div>

        <div className="border-t border-white/10 pt-6">
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-slate-300">
                <Icon className="h-4 w-4 text-blue-300" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center py-24" style={{ paddingInline: '20px' }}>
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="h-11 w-11 overflow-hidden rounded-lg border border-border bg-white p-1"><QnuLogo className="h-full w-full" /></div>
            <div><p className="font-bold text-title">QNU</p><p className="text-xs text-muted">{t('auth.login.systemTitle')}</p></div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-[-0.025em] text-title text-balance">{t('auth.login.welcomeBack')}</h2>
            <p className="mt-2 text-[15px] text-label">{t('auth.login.subtitle')}</p>
          </div>

          <div className="mb-6">
            {isGoogleConfigured ? (
              <div className="flex w-full justify-center" aria-busy={googleLoading}>
                <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => toast.error(t('auth.login.toast.googleFailed'))} width={googleButtonWidth} text="continue_with" shape="rectangular" theme="outline" size="large" useOneTap={false} />
              </div>
            ) : (
              <div>
                <button disabled className="flex h-12 w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-border bg-surface px-5 text-[15px] font-semibold text-label opacity-70"><GoogleIcon /> {t('auth.login.googleButton')}</button>
                <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-400">{t('auth.login.googleNotConfigured')}</p>
              </div>
            )}
          </div>

          <div className="mb-6 flex items-center gap-4"><div className="h-px flex-1 bg-border" /><span className="text-xs text-muted">{t('auth.login.divider')}</span><div className="h-px flex-1 bg-border" /></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <Field label={t('auth.login.emailLabel')}>
              <AuthInput icon={Mail} type="email" value={email} onChange={event => setEmail(event.target.value)} placeholder={t('auth.login.emailPlaceholder')} required dir="ltr" autoComplete="email" />
            </Field>
            <Field label={t('auth.login.passwordLabel')}>
              <AuthInput type={showPass ? 'text' : 'password'} value={password} onChange={event => setPassword(event.target.value)} placeholder={t('auth.login.passwordPlaceholder')} required dir="ltr" autoComplete="current-password" action={(
                <button type="button" onClick={() => setShowPass(value => !value)} className="rounded p-1 text-muted transition-colors hover:text-title focus-visible:outline-2 focus-visible:outline-primary-600" aria-label={showPass ? t('auth.login.hidePassword', { defaultValue: 'إخفاء' }) : t('auth.login.showPassword', { defaultValue: 'إظهار' })}>
                  {showPass ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              )} />
            </Field>
            <button type="submit" disabled={loading} className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 text-[15px] font-bold text-white transition-colors hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <LogIn className="h-4 w-4 rtl:scale-x-[-1]" />}
              {loading ? t('auth.login.loadingButton') : t('auth.login.submitButton')}
            </button>
          </form>

          {demos.length > 0 && (
            <div className="mt-8 border-t border-border pt-6">
              <div className="mb-3 flex items-baseline justify-between gap-4"><p className="text-sm font-semibold text-title">{t('auth.login.quickLogin')}</p><p className="text-xs text-muted">{t('auth.login.quickLoginHint')}</p></div>
              <div className="grid grid-cols-3 gap-2">
                {demos.map(demo => {
                  const Icon = demo.icon
                  return (
                    <button key={demo.role} onClick={() => quickLogin(demo)} disabled={!!quickLoading} className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-2 text-sm font-semibold text-body transition-colors hover:border-slate-400 hover:bg-hover focus-visible:outline-2 focus-visible:outline-primary-600 disabled:opacity-50">
                      {quickLoading === demo.role ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-muted border-t-title" /> : <span className={`flex h-5 w-5 items-center justify-center rounded ${demo.color}`}><Icon className="h-3 w-3 text-white" /></span>}
                      <span className="truncate">{demo.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          <p className="mt-8 flex items-center justify-center gap-1.5 text-sm text-label">
            {t('auth.login.noAccount')}
            <Link to="/register" className="inline-flex items-center gap-1 font-semibold text-primary-700 hover:underline dark:text-blue-400">{t('auth.login.createAccount')}<ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" /></Link>
          </p>
        </div>
      </section>
    </main>
  )
}
