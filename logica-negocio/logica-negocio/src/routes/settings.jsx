// @refresh reset
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { searchLanguages } from '../config/languages'
import { getFullExportJSON } from '../exportService'
import { importSessions } from '../importService'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const router = useRouter()
  const [langSearch, setLangSearch] = useState('')
  const [fontSize, setFontSize] = useState(
    () => localStorage.getItem('appFontSize') || 'medium'
  )

  const candidates = searchLanguages(langSearch)

  const handleSelectLang = (lc) => {
    localStorage.setItem('appLang', lc)
    setLangSearch('')
    router.invalidate()
  }

  const handleFontSize = (size) => {
    localStorage.setItem('appFontSize', size)
    setFontSize(size)
  }

  const handleExport = async () => {
    try {
      const json = await getFullExportJSON()
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'data_export.json'
      a.click()
    } catch (err) {
      console.error('Error al exportar:', err)
    }
  }

  const handleImport = async () => {
    try {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const text = await file.text()
        const parsed = JSON.parse(text)
        await importSessions(parsed)
        router.invalidate()
        console.log('Importación completada')
      }
      input.click()
    } catch (err) {
      console.error('Error al importar:', err)
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>Configuración</h1>

      <h2>Idioma</h2>
      <p>Actual: {localStorage.getItem('appLang') || 'No definido'}</p>
      <input
        placeholder="Buscar idioma..."
        value={langSearch}
        onChange={e => setLangSearch(e.target.value)}
      />
      {langSearch && (
        <ul>
          {candidates.slice(0, 20).map(lang => (
            <li
              key={lang.lc}
              style={{ cursor: 'pointer' }}
              onClick={() => handleSelectLang(lang.lc)}
            >
              {lang.ln} ({lang.lc})
            </li>
          ))}
        </ul>
      )}

      <h2>Tamaño de fuente</h2>
      {['small', 'medium', 'large'].map(size => (
        <button
          key={size}
          onClick={() => handleFontSize(size)}
          style={{ fontWeight: fontSize === size ? 'bold' : 'normal', marginRight: 8 }}
        >
          {size}
        </button>
      ))}

      <h2>Datos</h2>
      <button onClick={handleExport}>Exportar JSON</button>
      <button onClick={handleImport}>Importar JSON</button>
    </div>
  )
}