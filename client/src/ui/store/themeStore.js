import { create } from 'zustand'
import { persist } from 'zustand/middleware'

function getSystemPreference() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDark: getSystemPreference(),
      toggle: () => set(s => ({ isDark: !s.isDark })),
      setTheme: (isDark) => set({ isDark }),
    }),
    {
      name: 'qnu-theme',
      skipHydration: true,
    }
  )
)
