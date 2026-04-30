/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { searchLanguages } from '../lib/config/languages'
import { saveLanguage } from '../lib/languageRepository'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  const navigate = useNavigate()
  const [langSearch, setLangSearch] = useState('')
  const [selected, setSelected] = useState<{ lc: string; ln: string } | null>(null)

  const candidates = searchLanguages(langSearch)

  const handleSelect = (lang: { lc: string; ln: string }) => {
    setSelected(lang)
    setLangSearch('')
  }

  const handleConfirm = async () => {
    if (!selected) return
    await saveLanguage({ code: selected.lc, name: selected.ln })
    localStorage.setItem('appLang', selected.lc)
    navigate({ to: '/books' })
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Bienvenido</h1>
      <p>Selecciona el idioma principal de la app para continuar.</p>
      <input
        placeholder="Buscar idioma..."
        value={langSearch}
        onChange={e => setLangSearch(e.target.value)}
        autoFocus
      />
      {langSearch && (
        <ul>
          {candidates.slice(0, 20).map(lang => (
            <li key={lang.lc} style={{ cursor: 'pointer' }} onClick={() => handleSelect(lang)}>
              {lang.ln} ({lang.lc})
            </li>
          ))}
        </ul>
      )}
      {selected && (
        <div style={{ marginTop: 16 }}>
          <p>Seleccionado: <strong>{selected.ln} ({selected.lc})</strong></p>
          <button onClick={handleConfirm}>Confirmar y continuar</button>
        </div>
      )}
    </div>
  )
}