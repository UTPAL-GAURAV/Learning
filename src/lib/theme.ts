import { create } from 'zustand'

type Theme = 'light' | 'dark'

interface ThemeState {
  theme: Theme
  toggle: () => void
}

function applyTheme(theme: Theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('theme', theme)
}

const stored = localStorage.getItem('theme') as Theme | null
const system: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
const initial: Theme = stored ?? system
applyTheme(initial)

export const useTheme = create<ThemeState>(() => ({
  theme: initial,
  toggle: () => {
    useTheme.setState(s => {
      const next: Theme = s.theme === 'dark' ? 'light' : 'dark'
      applyTheme(next)
      return { theme: next }
    })
  },
}))
