import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const LANGUAGES = [
  { "lc": "kud", "ln": "'Auhelawa", "ang": "’Auhelawa" },
  { "lc": "es-419", "ln": "Español (Latinoamérica)", "ang": "Spanish (Latin America)" },
  { "lc": "en", "ln": "english", "ang": "englsih" }
]

export const useAppConfigStore = create(
  persist(
    (set) => ({
      language: 'es-419',
      setLanguage: (code) => {
        if (!LANGUAGES.some(l => l.lc === code)) return 
        set({ language: code })
        document.documentElement.setAttribute('lang', code)
      },
    }),
    { name: 'app-config' }
  )
)