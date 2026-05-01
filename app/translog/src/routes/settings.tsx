/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useRef } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { languages, searchLanguages } from '../lib/config/languages'
import { saveLanguage } from '../lib/languageRepository'
import { getFullExportJSON } from '../lib/exportService'
import { importSessions } from '../lib/importService'
import { downloadProjectAsZip, pickAndReadZip, importFromZip } from '../lib/sessionArchive'
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
      const data = await getFullExportJSON()

      // Collect audio files stored in the local filesystem so they can be
      // bundled. On native, we scan the audios folder; on web we skip (no FS).
      let audioList: { name: string; uri: string; path: string }[] = []
      if (Capacitor.isNativePlatform()) {
        try {
          const dir = await Filesystem.readdir({ path: 'comments/audios', directory: Directory.Data })
          audioList = dir.files.map(f => ({
            name: typeof f === 'string' ? f : f.name,
            uri: '',
            path: `comments/audios/${typeof f === 'string' ? f : f.name}`,
          }))
        } catch {
          // Folder doesn't exist yet – no audio comments
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await downloadProjectAsZip({ language: (data as any).language?.[0] ?? data }, 'translog_export', audioList)
    } catch (err) {
      console.error('Error al exportar:', err)
    }
  }, [])

  const handleImport = useCallback(async () => {
    try {
      const buffer = await pickAndReadZip()
      if (!buffer) return

      // Try ZIP import first; fall back to legacy JSON if the buffer doesn't
      // contain a contract.json (e.g. the user selected an old JSON export).
      let contract: unknown
      let audioByFilename: Record<string, Blob> = {}
      try {
        const result = await importFromZip(buffer)
        contract = result.contract
        audioByFilename = result.audioByFilename
      } catch {
        // Legacy JSON fallback
        const text = new TextDecoder().decode(buffer)
        contract = JSON.parse(text)
      }

      // Extract sessions from whatever shape the contract takes:
      //   - New ZIP format:  { language: Language }           (single object)
      //   - Old full export: { language: Language[] }         (array)
      //   - Legacy:          Session[] or a single Session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const lang = (contract as any)?.language
      const sessions: unknown[] = Array.isArray(lang)
        // Old full export: array of languages
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ? lang.flatMap((l: any) => (l.books as any[] ?? []).flatMap((b: any) => b.sessions ?? []))
        : lang?.books != null
          // New ZIP format: single Language object
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ? (lang.books as any[]).flatMap((b: any) => b.sessions ?? [])
          // Legacy: raw array of sessions or a single session
          : Array.isArray(contract) ? (contract as unknown[]) : [contract]

      await importSessions(sessions, audioByFilename)
      router.invalidate()
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
