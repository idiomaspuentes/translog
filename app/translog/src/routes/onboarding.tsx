/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { languages, searchLanguages } from '../lib/config/languages'
import { saveLanguage } from '../lib/languageRepository'
import { LanguageScreen, type Language } from '../ui/components/bible/screens/LanguageScreen'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

/** Maps the raw language-data shape { lc, ln, ang? } to the UI Language type. */
function toUiLanguage(l: { lc: string; ln: string; ang?: string }): Language {
  return {
    flag: l.lc,          // language code used as identifier (no emoji data in source)
    name: l.ang ?? l.ln, // prefer English name, fall back to native
    native: l.ln,
  }
}

/**
 * Short curated list shown before the user types anything.
 * The full catalogue (~7000 languages) is available via the search box.
 */
const FEATURED_CODES = ['es', 'en', 'pt', 'fr', 'ar', 'ru', 'de', 'it', 'cmn', 'hi', 'sw', 'id', 'nl', 'ko', 'ja', 'tr']
const featuredLanguages: Language[] = (FEATURED_CODES
  .map(code => (languages as { lc: string; ln: string; ang?: string }[]).find(l => l.lc === code))
  .filter(l => l != null) as { lc: string; ln: string; ang?: string }[])
  .map(toUiLanguage)

function OnboardingPage() {
  const navigate = useNavigate()

  const handleContinue = async (lang: Language) => {
    await saveLanguage({ code: lang.flag, name: lang.native })
    localStorage.setItem('appLang', lang.flag)
    navigate({ to: '/books' })
  }

  return (
    <div className="h-full">
      <LanguageScreen
        languages={featuredLanguages}
        onSearchChange={(q) => searchLanguages(q).map(toUiLanguage)}
        onContinue={handleContinue}
      />
    </div>
  )
}