/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useRef } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { languages, searchLanguages } from '../lib/config/languages'
import { saveLanguage } from '../lib/languageRepository'
import { getFullExportJSON } from '../lib/exportService'
import { importSessions } from '../lib/importService'
import { SettingsScreen } from '../ui/components/bible/screens/SettingsScreen'
import type {
  LanguageOption,
  FontSizeOption,
  UserPreferences,
} from '../ui/components/bible/screens/SettingsScreen'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

type RawLang = { lc: string; ln: string; ang?: string }

function toUiLanguage(l: RawLang): LanguageOption {
  return {
    flag: l.lc,
    name: l.ang ?? l.ln,
    native: l.ln,
  }
}

const FEATURED_CODES = [
  'es', 'en', 'pt', 'fr', 'ar', 'ru', 'de', 'it', 'cmn', 'hi', 'sw', 'id',
]

const featuredLanguages: LanguageOption[] = FEATURED_CODES
  .map(code => (languages as RawLang[]).find(l => l.lc === code))
  .filter((l): l is RawLang => l != null)
  .map(toUiLanguage)

const FONT_SIZES: FontSizeOption[] = [
  { label: 'Pequeño',    sample: 'Aa', size: 'text-sm'  },
  { label: 'Mediano',    sample: 'Aa', size: 'text-base' },
  { label: 'Grande',     sample: 'Aa', size: 'text-lg'  },
  { label: 'Muy grande', sample: 'Aa', size: 'text-xl'  },
]

function SettingsPage() {
  const router = useRouter()

  const langCode = localStorage.getItem('appLang') ?? ''
  const langRaw = (languages as RawLang[]).find(l => l.lc === langCode)
  const currentLangName = langRaw ? (langRaw.ang ?? langRaw.ln) : ''
  const currentFontSize = localStorage.getItem('appFontSize') ?? 'Mediano'

  /** Tracks the language code for whichever language the user last selected. */
  const selectedLang = useRef<{ code: string; name: string }>({
    code: langCode,
    name: currentLangName,
  })

  const handleChangeLanguage = useCallback((name: string) => {
    const found = (languages as RawLang[]).find(l => (l.ang ?? l.ln) === name)
    if (found) selectedLang.current = { code: found.lc, name }
  }, [])

  const handleSave = useCallback(async (prefs: UserPreferences) => {
    const { code, name } = selectedLang.current
    if (code) {
      localStorage.setItem('appLang', code)
      await saveLanguage({ code, name })
    }
    localStorage.setItem('appFontSize', prefs.fontSize)
    router.history.back()
  }, [router])

  const handleExport = useCallback(async () => {
    try {
      const json = await getFullExportJSON()
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data_export.json'
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error al exportar:', err)
    }
  }, [])

  const handleImport = useCallback(async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e: Event) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        const text = await file.text()
        const parsed = JSON.parse(text)
        await importSessions(parsed)
        router.invalidate()
      }
      input.click()
    } catch (err) {
      console.error('Error al importar:', err)
    }
  }, [router])

  return (
    <div className="h-full">
      <SettingsScreen
        languages={featuredLanguages}
        fontSizes={FONT_SIZES}
        initialPreferences={{ language: currentLangName, fontSize: currentFontSize }}
        onSearchLanguages={(q) =>
          (searchLanguages(q) as RawLang[]).map(toUiLanguage)
        }
        onChangeLanguage={handleChangeLanguage}
        onSave={handleSave}
        onExportAllData={handleExport}
        onImportAllData={handleImport}
        onBack={() => router.history.back()}
      />
    </div>
  )
}
