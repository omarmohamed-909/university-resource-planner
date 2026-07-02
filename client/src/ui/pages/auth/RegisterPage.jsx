import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { GoogleLogin } from '@react-oauth/google'
import toast from 'react-hot-toast'
import { UserPlus, GraduationCap, Eye, EyeOff, CheckCircle, Info, ArrowRight, ArrowLeft } from 'lucide-react'
import QnuLogo from '../../components/ui/QnuLogo'
import LanguageSwitcher from '../../components/LanguageSwitcher'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
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
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-[0.08em]">{label}</label>
      {children}
      {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function PInput({ rightSlot, leftSlot, className = '', ...props }) {
  return (
    <div className="relative">
      {rightSlot && <div className="absolute end-4 top-1/2 -translate-y-1/2 text-slate-400">{rightSlot}</div>}
      <input
        className={`w-full h-14 px-5 ${leftSlot ? 'ps-12' : ''} ${rightSlot ? 'pe-12' : ''}
                    rounded-lg border border-slate-200 bg-slate-50/50 shadow-sm text-slate-900 text-base
                   placeholder:text-slate-400
                   focus:outline-none focus:border-slate-500 focus:ring-4 focus:ring-slate-900/15 focus:shadow-md
                   hover:border-slate-300 transition-all duration-200
                   ![autofill]:shadow-[inset_0_0_0px_1000px_white]
                   ![autofill]:text-slate-900 ${className}`}
        style={{
          paddingInlineStart: leftSlot ? '48px' : '20px',
          paddingInlineEnd: rightSlot ? '48px' : '20px',
          ...props.style
        }}
        {...props}
      />
      {leftSlot && <div className="absolute start-4 top-1/2 -translate-y-1/2">{leftSlot}</div>}
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
  const barColor = ['bg-red-400', 'bg-amber-400', 'bg-emerald-500'][score - 1] || 'bg-slate-200'
  const strengthLabels = [t('auth.register.passwordWeak'), t('auth.register.passwordMedium'), t('auth.register.passwordStrong')]
  const strengthLabel = strengthLabels[score - 1] || ''
  const strengthColor = ['text-red-500', 'text-amber-500', 'text-emerald-600'][score - 1] || ''

  return (
    <div className="flex flex-col gap-2 mt-2.5">
      <div className="flex gap-1.5 w-full">
        {[0, 1, 2].map(i => (
          <div key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i < score ? barColor : 'bg-slate-200'}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {checks.map(c => (
            <span key={c.label} className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${c.ok ? 'text-emerald-600' : 'text-slate-400'}`}>
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
    <div className="flex items-center justify-center gap-2 mt-5">
      {steps.map((s, i) => {
        const n = i + 1
        const done    = current > n
        const active  = current === n
        return (
          <div key={s} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                              ${done   ? 'bg-emerald-500 text-white'
                              : active ? 'bg-white text-blue-700'
                                       : 'bg-white/15 text-white/50'}`}>
                {done ? <CheckCircle size={16} /> : n}
              </div>
              <span className={`text-xs font-medium transition-colors ${active || done ? 'text-white' : 'text-white/40'}`}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 h-px rounded transition-all duration-300 mx-1 ${done ? 'bg-white' : 'bg-white/20'}`} />
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

  const upd = k => e => setForm(f => ({ ...f, [k]: e.target.value }))

  const goNext = () => {
    if (!form.name.trim())  return toast.error(t('auth.register.toast.nameRequired'))
    if (!form.email.trim()) return toast.error(t('auth.register.toast.emailRequired'))
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error(t('auth.register.toast.emailInvalid'))
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6)              return toast.error(t('auth.register.toast.passwordTooShort'))
    if (form.password !== form.confirmPassword) return toast.error(t('auth.register.toast.passwordsMismatch'))
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
    <div className="min-h-screen flex items-center justify-center p-4 lg:p-8 bg-[#f5f7fb]">
      <div className="fixed top-4 end-4 z-50">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-[560px] animate-slide-up">

        <div className="bg-[#080f1a] rounded-t-lg px-8 pt-8 pb-6 text-center relative">
          <div className="absolute inset-0 overflow-hidden rounded-t-lg">
            <div className="absolute inset-0 bg-slate-900/30" />
          </div>

          <div className="absolute top-3 end-5 w-16 h-16 rounded-full overflow-hidden bg-white p-1 shadow-xl flex-shrink-0 flex items-center justify-center z-10">
            <QnuLogo className="w-full h-full object-contain" />
          </div>

          <div className="relative z-10 pt-4 pb-2 text-center mt-4">
            <h1 className="text-2xl font-bold text-white">{t('auth.register.title')}</h1>
            <p className="text-blue-400 text-sm mt-1 mb-6">{t('auth.register.subtitle')}</p>
            <Steps current={step} />
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-xl px-8 pb-8 pt-8 border-x border-b border-slate-100">

          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div style={{ marginTop: '24px' }}>
                {isGoogleConfigured ? (
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => toast.error(t('auth.register.toast.googleCancelled'))}
                      width={480}
                      text="signup_with"
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
                    <GoogleIcon /> {t('auth.register.googleButton')}
                  </button>
                  <span className="absolute -top-3 inset-x-0 mx-auto w-fit whitespace-nowrap bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-medium px-3 py-0.5 rounded-full">
                    {t('auth.register.googleNotConfigured')}
                  </span>
                </div>
              )}
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400">{t('auth.register.divider')}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              <Field label={t('auth.register.nameLabel')}>
                <PInput value={form.name} onChange={upd('name')} placeholder={t('auth.register.namePlaceholder')} required />
              </Field>

              <Field label={t('auth.register.emailLabel')}>
                <PInput type="email" value={form.email} onChange={upd('email')} placeholder="student@svnu.edu" required dir="ltr" />
              </Field>

              <Field label={t('auth.register.departmentLabel')} hint={t('auth.register.departmentHint')}>
                <PInput value={form.department} onChange={upd('department')} placeholder={t('auth.register.departmentPlaceholder')} />
              </Field>

              <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                <Info size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-700 leading-relaxed">{t('auth.register.infoNotice')}</p>
              </div>

              <button onClick={goNext}
                className="w-full h-14 rounded-lg font-bold text-base text-white bg-slate-950 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-4">
                {t('auth.register.nextButton')}
                {isRtl ? <ArrowLeft size={18} /> : <ArrowRight size={18} />}
              </button>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-6">
              <Field label={t('auth.register.passwordLabel')}>
                <PInput
                  type={showPass ? 'text' : 'password'}
                  value={form.password} onChange={upd('password')}
                  placeholder="••••••••" required dir="ltr"
                  rightSlot={
                    <button type="button" onClick={() => setShowPass(v => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
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
                    ? 'border-red-300 focus:border-red-400 focus:ring-red-400/10' : ''}
                  rightSlot={
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
                      {showConfirm ? <Eye size={17} /> : <EyeOff size={17} />}
                    </button>
                  }
                />
                {form.confirmPassword && form.password !== form.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1.5">{t('auth.register.toast.passwordsMismatch')}</p>
                )}
                {form.confirmPassword && form.password === form.confirmPassword && form.confirmPassword.length >= 6 && (
                  <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle size={12} /> {t('auth.register.confirmPasswordMatch')}
                  </p>
                )}
              </Field>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-5 h-12 rounded-lg border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 cursor-pointer">
                  {isRtl ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {t('auth.register.backButton')}
                </button>
                <button type="submit" disabled={loading}
                  className="flex-1 h-12 rounded-lg font-bold text-base text-white bg-slate-950 hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-[0.99] transition-all duration-200 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading
                    ? <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <UserPlus size={18} />}
                  {loading ? t('auth.register.loadingButton') : t('auth.register.submitButton')}
                </button>
              </div>
            </form>
          )}

          <p className="text-center text-sm text-slate-500 mt-6">
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">{t('auth.register.loginLink')}</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
