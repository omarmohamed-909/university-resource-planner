import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { UserPlus, GraduationCap, BookOpen, Users, Building2, Eye, EyeOff, CheckCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react'
import QnuLogo from '../../components/ui/QnuLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import DarkModeToggle from '../../components/DarkModeToggle'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function Field({ label, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-semibold text-body">{label}</label>
      {children}
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
    </div>
  )
}

function PInput({ rightSlot, leftSlot, className = '', ...props }) {
  return (
    <div className="relative">
      {rightSlot && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted">{rightSlot}</div>}
      <input
        className={`h-11 w-full rounded-lg border border-border bg-canvas text-[15px] text-title placeholder:text-muted transition-[border-color,box-shadow] duration-200 hover:border-primary-400 focus:border-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600/15 sm:h-12 ${className}`}
        style={{
          paddingLeft: leftSlot ? '48px' : '16px',
          paddingRight: rightSlot ? '48px' : '16px',
          ...props.style
        }}
        {...props}
      />
      {leftSlot && <div className="absolute left-3.5 top-1/2 -translate-y-1/2">{leftSlot}</div>}
    </div>
  )
}

function PasswordStrength({ password }) {
  const { t } = useTranslation()
  if (!password) return null
  const checks = [
    { ok: password.length >= 8,  label: t('auth.register.passwordHint') },
    { ok: /[A-Z]/.test(password), label: t('auth.register.passwordUppercase') },
    { ok: /\d/.test(password),    label: t('auth.register.passwordDigit') },
  ]
  const score = checks.filter(c => c.ok).length
  const barColor = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500'][score - 1] || 'bg-border'
  const strengthLabels = [t('auth.register.passwordWeak'), t('auth.register.passwordMedium'), t('auth.register.passwordStrong')]
  const strengthLabel = strengthLabels[score - 1] || ''
  const strengthColor = ['text-red-500', 'text-amber-500', 'text-emerald-600'][score - 1] || ''

  return (
    <div className="mt-2.5 flex flex-col gap-2">
      <div className="flex gap-1.5 w-full">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-200 ${i < score ? barColor : 'bg-border'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label} className={`flex items-center gap-1 text-[11px] font-medium transition-colors duration-200 ${c.ok ? 'text-emerald-600' : 'text-muted'}`}>
              <CheckCircle size={10} />
              {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span className={`text-[11px] font-bold ${strengthColor}`}>{strengthLabel}</span>}
      </div>
    </div>
  )
}

function Steps({ current }) {
  const { t } = useTranslation()
  const steps = [t('auth.register.step1'), t('auth.register.step2')]
  return (
    <div className="flex items-center gap-3">
      {steps.map((s, i) => {
        const n = i + 1
        const done   = current > n
        const active = current === n
        return (
          <div key={s} className="flex items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200
                ${done   ? 'bg-emerald-500 text-white'
                : active ? 'bg-blue-500 text-white'
                         : 'bg-white/[0.12] text-white/40'}`}>
                {done ? <CheckCircle size={16} /> : n}
              </div>
              <span className={`text-sm font-medium transition-colors duration-200 ${active || done ? 'text-white' : 'text-white/40'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-8 h-px rounded transition-all duration-200 ${done ? 'bg-white/60' : 'bg-white/[0.12]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default function RegisterPage() {
  const { t, i18n } = useTranslation()
  const navigate    = useNavigate()
  const register    = useAuthStore(s => s.register)
  const googleLogin = useAuthStore(s => s.googleLogin)
  const isRtl = i18n.dir() === 'rtl'

  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', department: '', password: '', confirmPassword: '', role: 'student' })
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true)
    try {
      const user = await googleLogin(credentialResponse.credential)
      toast.success(t('auth.register.toast.googleSuccess'))
      navigate(`/${user.role}`)
    } catch (err) { toast.error(err.response?.data?.message || t('auth.register.toast.googleFailed')) }
    finally { setGoogleLoading(false) }
  }

  const isGoogleConfigured = import.meta.env.VITE_GOOGLE_CLIENT_ID &&
    import.meta.env.VITE_GOOGLE_CLIENT_ID !== 'your_google_client_id_here'
  const googleButtonWidth = typeof window === 'undefined' ? 350 : Math.min(440, window.innerWidth - 32)

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const features = [
    { icon: BookOpen, label: t('auth.login.feature1') },
    { icon: Building2, label: t('auth.login.feature2') },
    { icon: Users, label: t('auth.login.feature3') },
  ]

  const goNext = () => {
    if (!form.name.trim())  return toast.error(t('auth.register.toast.nameRequired'))
    if (!form.email.trim()) return toast.error(t('auth.register.toast.emailRequired'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error(t('auth.register.toast.emailInvalid'))
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 8)                  return toast.error(t('auth.register.toast.passwordTooShort'))
    if (!/[A-Z]/.test(form.password))               return toast.error(t('auth.register.toast.passwordNoUppercase'))
    if (!/\d/.test(form.password))                  return toast.error(t('auth.register.toast.passwordNoDigit'))
    if (form.password !== form.confirmPassword)     return toast.error(t('auth.register.toast.passwordsMismatch'))
    setLoading(true)
    try {
      const { confirmPassword, ...payload } = form
      const user = await register(payload)
      toast.success(t('auth.register.toast.accountCreated'))
      navigate(`/${user.role}`)
    } catch (err) { toast.error(err.response?.data?.message || t('auth.register.toast.accountFailed')) }
    finally { setLoading(false) }
  }

  return (
    <main className="h-dvh overflow-hidden bg-canvas lg:grid lg:grid-cols-[minmax(360px,42%)_1fr]">
      {/* ─── Controls ─── */}
      <div className="fixed top-4 end-4 z-50 hidden items-center gap-2 lg:flex">
        <DarkModeToggle />
        <LanguageSwitcher />
      </div>

      {/* ═══════════════════════════════════════════
          BRAND PANEL — mirrors login page
         ═══════════════════════════════════════════ */}
      <section className="auth-brand-panel relative hidden h-full overflow-hidden text-white lg:flex lg:flex-col lg:justify-between" style={{ padding: 'clamp(28px, 5vh, 40px) clamp(40px, 5vw, 56px)' }}>
        {/* subtle dot texture */}
        <div className="bg-dots absolute inset-0 opacity-[0.35]" style={{ WebkitMaskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent)', maskImage: 'radial-gradient(ellipse 70% 50% at 50% 50%, black, transparent)' }} aria-hidden="true" />
        {/* edge line */}
        <div className="absolute inset-y-0 end-0 w-px bg-white/[0.06]" aria-hidden="true" />

        {/* logo + name */}
        <div className="relative flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-white p-1">
            <QnuLogo className="h-full w-full" />
          </div>
          <div>
            <p className="text-base font-bold leading-none tracking-tight">QNU</p>
            <p className="mt-1 text-xs text-slate-400">{t('auth.login.systemTitle')}</p>
          </div>
        </div>

        {/* registration context + stepper */}
        <div className="relative flex flex-col gap-8">
          <div>
            <h1 className="text-[2rem] font-bold leading-[1.25] tracking-[-0.02em] text-white text-balance xl:text-[2.5rem]">
              {t('auth.register.title')}
            </h1>
            <p className="mt-3 max-w-sm text-[15px] leading-7 text-slate-400 text-pretty">{t('auth.register.subtitle')}</p>
          </div>
          <Steps current={step} />
        </div>

        {/* features — same as login */}
        <div className="relative border-t border-white/[0.08] pt-5">
          <div className="flex flex-wrap gap-x-6 gap-y-2.5">
            {features.map(({ icon: FIcon, label }) => (
              <div key={label} className="flex items-center gap-2 text-[13px] text-slate-400">
                <FIcon className="h-4 w-4 shrink-0 text-slate-500" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          FORM PANEL
         ═══════════════════════════════════════════ */}
      <section className="auth-form-panel flex h-full min-h-0 items-center justify-center px-5 py-3 sm:py-5 lg:py-4">
        <div className="w-full max-w-[460px]">
          {/* mobile logo + steps */}
          <div className="mb-4 flex items-center justify-between gap-4 lg:hidden">
            <div className="flex min-w-0 items-center gap-3">
              <div className="auth-logo-tile h-10 w-10 overflow-hidden rounded-lg border border-border p-1">
                <QnuLogo className="h-full w-full" />
              </div>
              <div>
                <p className="font-bold text-title">QNU</p>
                <p className="hidden text-xs text-muted sm:block">{t('auth.login.systemTitle')}</p>
              </div>
            </div>
            {/* mobile steps indicator */}
            <div className="flex items-center gap-2">
              {[1, 2].map(n => (
                <div key={n} className="flex items-center gap-2">
                  <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-200
                    ${step > n ? 'bg-emerald-500 text-white'
                    : step === n ? 'bg-primary-600 text-white'
                    : 'bg-border text-muted'}`}>
                    {step > n ? <CheckCircle size={12} /> : n}
                  </div>
                  {n < 2 && <div className={`h-px w-6 transition-all duration-200 ${step > n ? 'bg-emerald-400' : 'bg-border'}`} />}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <DarkModeToggle />
              <LanguageSwitcher />
            </div>
          </div>

          {/* ─── STEP 1 ─── */}
          {step === 1 && (
            <div className="flex flex-col gap-3 sm:gap-3.5">
              {/* heading */}
              <div>
                <h2 className="text-[1.75rem] font-bold tracking-[-0.02em] text-title text-balance">{t('auth.register.title')}</h2>
                <p className="mt-2 text-[15px] text-label">{t('auth.register.subtitle')}</p>
              </div>

              {/* google signup */}
              <div>
                {isGoogleConfigured ? (
                  <div className="w-full flex justify-center" aria-busy={googleLoading}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t('auth.register.toast.googleCancelled'))}
                      width={googleButtonWidth}
                      text="signup_with"
                      shape="rectangular"
                      theme="outline"
                      size="large"
                      useOneTap={false}
                    />
                  </div>
                ) : (
                  <div className="relative">
                    <button disabled className="flex h-11 w-full cursor-not-allowed items-center justify-center gap-3 rounded-lg border border-border bg-canvas px-5 text-[15px] font-semibold text-label opacity-60 sm:h-12">
                      <GoogleIcon /> {t('auth.register.googleButton')}
                    </button>
                    <p className="auth-warning mt-2 text-center text-xs">{t('auth.register.googleNotConfigured')}</p>
                  </div>
                )}
              </div>

              {/* divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-medium text-muted">{t('auth.register.divider')}</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* fields */}
              <Field label={t('auth.register.nameLabel')}>
                <PInput value={form.name} onChange={upd('name')} placeholder={t('auth.register.namePlaceholder')} required />
              </Field>

              <Field label={t('auth.register.emailLabel')}>
                <PInput type="email" value={form.email} onChange={upd('email')} placeholder="student@svnu.edu" required dir="ltr" />
              </Field>

              <Field label={t('auth.register.departmentLabel')} hint={t('auth.register.departmentHint')}>
                <PInput value={form.department} onChange={upd('department')} placeholder={t('auth.register.departmentPlaceholder')} />
              </Field>

              {/* info notice */}
              <div className="auth-info flex items-start gap-3 rounded-lg p-2.5 sm:p-3">
                <Info size={16} className="mt-0.5 shrink-0" />
                <p className="text-[13px] leading-relaxed">{t('auth.register.infoNotice')}</p>
              </div>

              {/* next button */}
              <button onClick={goNext}
                className="mt-1 flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:bg-primary-800 sm:h-12">
                {t('auth.register.nextButton')}
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          )}

          {/* ─── STEP 2 ─── */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* heading */}
              <div className="mb-1">
                <h2 className="text-[1.75rem] font-bold tracking-[-0.02em] text-title text-balance">{t('auth.register.passwordLabel')}</h2>
                <p className="mt-2 text-[15px] text-label">{t('auth.register.subtitle')}</p>
              </div>

              <Field label={t('auth.register.passwordLabel')}>
                <PInput
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={upd('password')}
                  placeholder="••••••••" required dir="ltr"
                  rightSlot={
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="text-muted hover:text-title transition-colors duration-200 cursor-pointer rounded p-0.5 focus-visible:outline-2 focus-visible:outline-primary-600">
                      {showPass ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  }
                />
                <PasswordStrength password={form.password} />
              </Field>

              <Field label={t('auth.register.confirmPasswordLabel')}>
                <PInput
                  type={showConfirm ? 'text' : 'password'}
                  value={form.confirmPassword} onChange={upd('confirmPassword')}
                  placeholder="••••••••" required dir="ltr"
                  className={form.confirmPassword && form.password !== form.confirmPassword
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-400/10' : ''}
                  rightSlot={
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="text-muted hover:text-title transition-colors duration-200 cursor-pointer rounded p-0.5 focus-visible:outline-2 focus-visible:outline-primary-600">
                      {showConfirm ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  }
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">{t('auth.register.toast.passwordsMismatch')}</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length >= 8 && (
                  <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1.5">
                    <CheckCircle size={12} /> {t('auth.register.confirmPasswordMatch')}
                  </p>
                )}
              </Field>

              {/* action buttons */}
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border px-5 text-sm font-semibold text-body transition-all duration-200 hover:border-primary-400 hover:bg-hover focus-visible:outline-2 focus-visible:outline-primary-600">
                  {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t('auth.register.backButton')}
                </button>
                <button type="submit" disabled={loading}
                  className="flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary-600 text-[15px] font-bold text-white transition-colors duration-200 hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60">
                  {loading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserPlus size={18} />}
                  {loading ? t('auth.register.loadingButton') : t('auth.register.submitButton')}
                </button>
              </div>
            </form>
          )}

          {/* login link */}
          <p className="mt-3 text-center text-sm text-label sm:mt-4">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="auth-link font-semibold transition-colors duration-200 hover:underline">{t('auth.register.loginLink')}</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
