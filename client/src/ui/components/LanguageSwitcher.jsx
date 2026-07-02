import { useTranslation } from 'react-i18next'

const languages = [
  { code: 'ar', label: 'AR', native: 'العربية', dir: 'rtl' },
  { code: 'en', label: 'EN', native: 'English', dir: 'ltr' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const current = languages.find(l => l.code === i18n.language) || languages[0]
  const next = languages.find(l => l.code !== i18n.language) || languages[1]

  const toggle = () => i18n.changeLanguage(next.code)

  return (
    <button
      onClick={toggle}
      className="w-9 h-9 rounded-full bg-white shadow-md ring-1 ring-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 hover:shadow-lg active:scale-90 active:shadow-sm transition-all duration-200 cursor-pointer"
      aria-label={`Switch to ${next.native}`}
      title={next.native}
    >
      {current.label}
    </button>
  )
}
