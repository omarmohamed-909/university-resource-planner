import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '../store/themeStore'
import { useTranslation } from 'react-i18next'

export default function DarkModeToggle() {
  const { t } = useTranslation()
  const isDark = useThemeStore(s => s.isDark)
  const toggle = useThemeStore(s => s.toggle)

  return (
    <button
      onClick={toggle}
      className="relative w-9 h-9 rounded-lg bg-surface border border-border text-body hover:bg-hover hover:border-active active:scale-95 transition-all duration-200 cursor-pointer flex items-center justify-center overflow-hidden"
      aria-label={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
      title={isDark ? t('theme.switchToLight') : t('theme.switchToDark')}
    >
      <span className="relative w-4 h-4 flex items-center justify-center">
        <Sun className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
        <Moon className={`w-4 h-4 absolute transition-all duration-300 ${isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'}`} />
      </span>
    </button>
  )
}
