import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'

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
      className="group relative w-9 h-9 rounded-lg bg-surface border border-border text-body hover:bg-hover hover:border-active active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center"
      aria-label={`Switch to ${next.native}`}
      title={next.native}
    >
      <span className="text-[11px] font-bold tracking-tight">{current.label}</span>
      <Languages className="w-3 h-3 absolute -bottom-0.5 -end-0.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}
