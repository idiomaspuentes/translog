import { LanguageStore, LANGUAGES } from '../configstore/LanguageStore'

export function LanguageStore() {
  const language = LanguageStore((s) => s.language)
  const setLanguage = LanguageStore((s) => s.setLanguage)


  return {
    language,
    currentLanguage: LANGUAGES.find(l => l.lc === language),
    setLanguage,
    languageOptions: LANGUAGES,
  }
}