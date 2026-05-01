/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { CheckCircle, CircleDashed, Loader, TriangleAlert } from 'lucide-react'
import { saveLanguage } from '../lib/languageRepository'
import { saveBook } from '../lib/bookRepository'
import { createSession, saveSession, closeSession } from '../lib/sessionRepository'
import { createReview } from '../lib/reviewRepository'
import { saveComment } from '../lib/commentRepository'

export const Route = createFileRoute('/admin')({
  component: AdminPage,
})

// ── Seed definitions ──────────────────────────────────────────────────────────

const LANG = { code: 'es-419', name: 'Español Latinoamericano' }

const RAW = (file: string) =>
  `https://git.door43.org/es-419_gl/es-419_glt/raw/branch/master/${file}`

interface SeedBook {
  code: string
  name: string
  usfmFile: string
  sessions: SeedSession[]
}

interface SeedSession {
  title: string
  closed: boolean
  reviews: SeedReview[]
}

interface SeedReview {
  chapterStart: number
  verseStart: number
  chapterEnd: number
  verseEnd: number
  text: string
  comments: { author: string; text: string }[]
}

const BOOKS: SeedBook[] = [
  {
    code: 'RUT',
    name: 'Rut',
    usfmFile: '08-RUT.usfm',
    sessions: [
      {
        title: 'Comunidad San Marcos — Rut cap. 1',
        closed: true,
        reviews: [
          {
            chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 5,
            text: 'En los días en que gobernaban los jueces hubo hambre en la tierra, y un hombre de Belén de Judá fue a vivir como extranjero en los campos de Moab.',
            comments: [
              { author: 'Ana López', text: 'La frase "vivir como extranjero" suena un poco rara. En nuestra comunidad decimos "irse a vivir" o simplemente "se mudó". ¿Se puede ajustar?' },
              { author: 'Carlos Mena', text: 'El resto del pasaje es claro y natural. Los nombres propios se entienden bien.' },
              { author: 'Ana López', text: 'De acuerdo con Carlos, salvo esa frase inicial el texto fluye bien.' },
            ],
          },
          {
            chapterStart: 1, verseStart: 16, chapterEnd: 1, verseEnd: 17,
            text: 'No me pidas que te deje o que regrese de seguirte, porque a donde tú vayas, yo iré.',
            comments: [
              { author: 'María García', text: 'Este pasaje se entiende perfectamente. El tono es emotivo y natural en español.' },
              { author: 'Carlos Mena', text: '¡Muy bien logrado! La fidelidad de Rut queda clara sin necesidad de explicaciones adicionales.' },
            ],
          },
        ],
      },
      {
        title: 'Comunidad San Marcos — Rut cap. 2–3',
        closed: false,
        reviews: [
          {
            chapterStart: 2, verseStart: 1, chapterEnd: 2, verseEnd: 3,
            text: 'Noemí tenía un pariente de su marido, un hombre de gran riqueza, de la familia de Elimelec, cuyo nombre era Booz.',
            comments: [
              { author: 'Carlos Mena', text: 'La palabra "pariente" puede ser ambigua aquí — no queda claro que Booz tiene la obligación de actuar como redentor. ¿Convendría decir "pariente cercano" o añadir una nota?' },
            ],
          },
          {
            chapterStart: 3, verseStart: 9, chapterEnd: 3, verseEnd: 11,
            text: 'Respondió él: "¿Quién eres tú?" Y ella dijo: "Soy Rut, tu sierva. Extiende tu manto sobre tu sierva, porque eres pariente redentor."',
            comments: [
              { author: 'María García', text: 'La expresión "extender el manto" puede parecer confusa para un lector moderno. En nuestra cultura no tenemos ese gesto. Quizá se podría añadir una nota explicativa.' },
              { author: 'Carlos Mena', text: 'Estoy de acuerdo. Sin contexto cultural, parece solo un gesto de abrigo, no una propuesta de matrimonio.' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'JON',
    name: 'Jonás',
    usfmFile: '32-JON.usfm',
    sessions: [
      {
        title: 'Iglesia Central Bethel — Jonás cap. 1–2',
        closed: true,
        reviews: [
          {
            chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 3,
            text: 'La palabra de Yahveh llegó a Jonás hijo de Amitay: "Levántate, ve a Nínive, la gran ciudad, y clama contra ella, porque su maldad ha subido hasta mí."',
            comments: [
              { author: 'Pedro Ruiz', text: 'El uso de "Yahveh" en lugar de "el Señor" puede resultar desconocido para los lectores de nuestra comunidad. ¿Es intencional usar el nombre hebreo aquí?' },
              { author: 'María Santos', text: 'La frase "su maldad ha subido hasta mí" funciona bien, es una imagen poderosa y se entiende.' },
              { author: 'Pedro Ruiz', text: 'Corrección: "clama contra ella" suena extraño. Normalmente decimos "proclama" o "anuncia". "Clamar" en nuestra variante se usa más para pedir ayuda.' },
            ],
          },
          {
            chapterStart: 1, verseStart: 17, chapterEnd: 2, verseEnd: 2,
            text: 'Yahveh dispuso un gran pez para que se tragara a Jonás, y Jonás estuvo en el vientre del pez tres días y tres noches.',
            comments: [
              { author: 'María Santos', text: 'Este versículo es muy claro y natural. El pasaje es familiar para la mayoría en nuestra comunidad.' },
              { author: 'Laura Vega', text: 'Bien logrado. "Vientre del pez" es la expresión correcta y se usa comúnmente.' },
            ],
          },
        ],
      },
      {
        title: 'Iglesia Central Bethel — Jonás cap. 3–4',
        closed: true,
        reviews: [
          {
            chapterStart: 3, verseStart: 4, chapterEnd: 3, verseEnd: 5,
            text: 'Jonás comenzó a entrar en la ciudad, caminando un día, y proclamó: "¡Dentro de cuarenta días Nínive será destruida!"',
            comments: [
              { author: 'Pedro Ruiz', text: 'El texto es directo y claro. "Destruida" transmite bien la urgencia del mensaje.' },
              { author: 'Laura Vega', text: 'La brevedad del mensaje de Jonás contrasta bien con la enorme respuesta de la ciudad. Eso queda claro en la traducción.' },
            ],
          },
          {
            chapterStart: 4, verseStart: 1, chapterEnd: 4, verseEnd: 4,
            text: 'Pero esto le desagradó mucho a Jonás, y se enojó. Oró a Yahveh y dijo: "¡Ah, Yahveh! ¿No es esto lo que yo decía cuando estaba en mi tierra?"',
            comments: [
              { author: 'María Santos', text: '"Le desagradó mucho" seguido de "se enojó" parece redundante. En nuestra comunidad bastaría con "Jonás se enojó mucho" para comunicar lo mismo.' },
              { author: 'Pedro Ruiz', text: 'Entiendo el punto de María, aunque el original hebreo también usa las dos ideas. Quizá se puede simplificar sin perder el matiz.' },
            ],
          },
        ],
      },
    ],
  },
  {
    code: 'EST',
    name: 'Ester',
    usfmFile: '17-EST.usfm',
    sessions: [
      {
        title: 'Grupo Bíblico Villa Nueva — Ester cap. 1–2',
        closed: true,
        reviews: [
          {
            chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 4,
            text: 'Este es el relato de lo que ocurrió en los días de Asuero, el Asuero que reinó desde India hasta Etiopía, sobre ciento veintisiete provincias.',
            comments: [
              { author: 'Laura Vega', text: 'La repetición del nombre "Asuero" en la misma oración suena extraña en español. Normalmente diríamos "Asuero, quien reinó..." sin repetirlo.' },
              { author: 'Diego Torres', text: 'Estoy de acuerdo con Laura. La repetición probablemente sigue la estructura del hebreo, pero en español suena redundante.' },
              { author: 'Laura Vega', text: 'El número "ciento veintisiete" está bien escrito en letras. Eso es correcto para textos formales.' },
            ],
          },
          {
            chapterStart: 2, verseStart: 7, chapterEnd: 2, verseEnd: 10,
            text: 'Él crió a Hadasa, es decir, Ester, hija de su tío, porque no tenía padre ni madre. La joven era de buen parecer y hermosa.',
            comments: [
              { author: 'Diego Torres', text: '"De buen parecer y hermosa" suena a lenguaje anticuado. En nuestra comunidad diríamos simplemente "era muy hermosa" o "era bella".' },
              { author: 'Laura Vega', text: 'El doble nombre (Hadasa/Ester) está bien explicado con "es decir". Eso es claro y útil para el lector.' },
            ],
          },
        ],
      },
      {
        title: 'Grupo Bíblico Villa Nueva — Ester cap. 4–5',
        closed: true,
        reviews: [
          {
            chapterStart: 4, verseStart: 13, chapterEnd: 4, verseEnd: 14,
            text: '"No pienses que escaparás en la casa del rey más que todos los judíos. Porque si callas en este momento, alivio y liberación vendrán de otro lugar para los judíos, pero tú y la casa de tu padre pereceréis. ¿Y quién sabe si para un momento como este has llegado al reino?"',
            comments: [
              { author: 'Diego Torres', text: 'Este pasaje es poderoso y claro. La pregunta final impacta al lector. ¡Muy bien logrado!' },
              { author: 'Laura Vega', text: '"Alivio y liberación" puede sonar repetitivo para un lector moderno. ¿Son dos conceptos distintos en el original o se podría usar solo uno de los términos?' },
              { author: 'Diego Torres', text: 'Son dos palabras distintas en hebreo (revach y hatzalah). Vale la pena mantenerlas y quizá aclarar en una nota.' },
            ],
          },
          {
            chapterStart: 5, verseStart: 1, chapterEnd: 5, verseEnd: 3,
            text: 'Al tercer día, Ester se vistió con sus ropas reales y se paró en el patio interior de la casa del rey.',
            comments: [
              { author: 'Laura Vega', text: '"Se paró" es ambiguo: puede significar "se detuvo" o "se puso de pie". En este contexto debería quedar claro que entró y se presentó ante el rey. Sugiero "se situó" o "se presentó".' },
              { author: 'Diego Torres', text: 'Muy buena observación. "Se paró" en nuestra variante regional suena a que se detuvo físicamente, no a que se presentó ante alguien.' },
            ],
          },
        ],
      },
    ],
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

type LogEntry = { msg: string; type: 'info' | 'ok' | 'warn' | 'error' }

function AdminPage() {
  const router = useRouter()
  const [log, setLog] = useState<LogEntry[]>([])
  const [running, setRunning] = useState(false)
  const [done, setDone] = useState(false)

  const push = (msg: string, type: LogEntry['type'] = 'info') =>
    setLog(prev => [...prev, { msg, type }])

  const populate = async () => {
    setRunning(true)
    setDone(false)
    setLog([])

    try {
      push(`Guardando idioma: ${LANG.name} (${LANG.code})`)
      await saveLanguage(LANG)
      push('Idioma guardado.', 'ok')

      for (const book of BOOKS) {
        const bookId = `${book.code}-${LANG.code}`

        push(`Descargando USFM: ${book.name} (${book.usfmFile})…`)
        let content = ''
        try {
          const res = await fetch(RAW(book.usfmFile))
          if (res.ok) {
            content = await res.text()
            push(`USFM descargado — ${Math.round(content.length / 1024)} KB`, 'ok')
          } else {
            push(`No se pudo descargar el USFM (HTTP ${res.status}).`, 'warn')
          }
        } catch (e) {
          push(`Error de red al descargar ${book.name}: ${String(e)}`, 'warn')
        }

        push(`Guardando libro: ${book.name}`)
        await saveBook({ code: book.code, langCode: LANG.code, name: book.name, version: 'GLT es-419', content })
        push(`Libro guardado: ${book.name}`, 'ok')

        for (const sessionDef of book.sessions) {
          push(`Creando sesión: "${sessionDef.title}"`)
          const session = await createSession(bookId)
          await saveSession({ ...session, title: sessionDef.title })

          for (const reviewDef of sessionDef.reviews) {
            const review = await createReview(session.id, {
              text: reviewDef.text,
              chapterStart: reviewDef.chapterStart,
              verseStart: reviewDef.verseStart,
              chapterEnd: reviewDef.chapterEnd,
              verseEnd: reviewDef.verseEnd,
              date: new Date().toISOString(),
            })

            for (const c of reviewDef.comments) {
              await saveComment(review.id, { author: c.author, text: c.text })
            }
          }

          if (sessionDef.closed) await closeSession(session.id)
          push(`Sesión creada${sessionDef.closed ? ' (cerrada)' : ''}: "${sessionDef.title}"`, 'ok')
        }
      }

      push('Datos de muestra cargados correctamente.', 'ok')
      setDone(true)
      await router.invalidate()
    } catch (err) {
      push(`Error inesperado: ${err instanceof Error ? err.message : String(err)}`, 'error')
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Translog
        </p>
        <h1 className="text-lg font-semibold text-foreground">Administración</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground">Cargar datos de muestra</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Crea el idioma <strong>Español Latinoamericano (es-419)</strong>, descarga tres libros
            bíblicos cortos (Rut, Jonás, Ester) desde{' '}
            <a
              href="https://git.door43.org/es-419_gl/es-419_glt"
              target="_blank"
              rel="noreferrer"
              className="text-primary underline"
            >
              Door43 GLT
            </a>{' '}
            y les añade sesiones, revisiones y comentarios de ejemplo.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={populate}
              disabled={running}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {running && <Loader className="h-4 w-4 animate-spin" />}
              {running ? 'Cargando…' : 'Cargar datos de muestra'}
            </button>
            {done && (
              <a
                href="/"
                className="text-sm font-medium text-primary underline"
              >
                Ir a los libros →
              </a>
            )}
          </div>

          {/* Log */}
          {log.length > 0 && (
            <div className="mt-4 rounded-xl border border-border bg-background p-3 text-[0.75rem] font-mono">
              <ul className="space-y-1">
                {log.map((entry, i) => (
                  <li key={i} className="flex items-start gap-2">
                    {entry.type === 'ok'    && <CheckCircle  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-green-500" />}
                    {entry.type === 'warn'  && <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-500" />}
                    {entry.type === 'error' && <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />}
                    {entry.type === 'info'  && <CircleDashed  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                    <span className={
                      entry.type === 'ok'    ? 'text-green-600 dark:text-green-400' :
                      entry.type === 'warn'  ? 'text-yellow-600 dark:text-yellow-400' :
                      entry.type === 'error' ? 'text-destructive' :
                      'text-muted-foreground'
                    }>
                      {entry.msg}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
