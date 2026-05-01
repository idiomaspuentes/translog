/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { listSessionsByBookId, createSession } from '../lib/sessionRepository'
import { getFullExportJSON } from '../lib/exportService'
import { downloadProjectAsZip } from '../lib/sessionArchive'
import { BookReadScreen } from '../ui/components/bible/screens/BookReadScreen'
import type { Session } from '../ui/components/bible/screens/BookReadScreen'

export const Route = createFileRoute('/books/$bookId/')({
  loader: async ({ params }) => {
    const firstDash = params.bookId.indexOf('-')
    const code = params.bookId.slice(0, firstDash)
    const langCode = params.bookId.slice(firstDash + 1)
    try {
      const book = await getBook(code, langCode)
      const sessions = await listSessionsByBookId(params.bookId)
      return { book, sessions }
    } catch {
      return { book: null, sessions: [] }
    }
  },
  component: BookReadPage,
})

/** Maps a raw DB session (from listSessionsByBookId) to the BookReadScreen.Session shape. */
function toUiSession(s: {
  id: number
  bookId: string
  startDate: string
  endDate?: string
  title?: string
  reviews?: unknown[]
}): Session {
  const date = new Date(s.startDate)
  const title =
    s.title ||
    `Sesión ${date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}`
  return {
    id: s.id,
    bookId: s.bookId,
    startDate: s.startDate,
    title,
    status: s.endDate ? 'cerrada' : 'abierta',
    reviewCount: s.reviews?.length ?? 0,
  }
}

function BookReadPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { book, sessions } = Route.useLoaderData() as any
  const { bookId } = Route.useParams()
  const navigate = useNavigate()
  const router = useRouter()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const uiSessions: Session[] = (sessions as any[]).map(toUiSession)

  /** Creates a new session and navigates into it. */
  const handleStartSession = useCallback(
    async (_data: { chapter: number }) => {
      const session = await createSession(bookId)
      await router.invalidate()
      navigate({
        to: '/books/$bookId/sessions/$sessionId',
        params: { bookId, sessionId: String(session.id) },
      })
    },
    [bookId, navigate, router],
  )

  /** Opens an existing session. */
  const handleOpenSession = useCallback(
    (session: Session) => {
      navigate({
        to: '/books/$bookId/sessions/$sessionId',
        params: { bookId, sessionId: String(session.id) },
      })
    },
    [bookId, navigate],
  )

  /** Exports a single session as a ZIP (JSON + Markdown + PDF + audio files). */
  const handleExportSession = useCallback(async (session: Session) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const full = await getFullExportJSON() as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const langData = (full.language as any[])?.[0]
      if (!langData) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookEntry = (langData.books as any[]).find((b: any) => b.id === bookId)
      if (!bookEntry) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sessionEntry = (bookEntry.sessions as any[]).find((s: any) => s.id === session.id)
      if (!sessionEntry) return
      await downloadProjectAsZip(
        { language: { ...langData, books: [{ ...bookEntry, sessions: [sessionEntry] }] } },
        `${book?.name ?? bookId}_sesion_${session.id}`,
      )
    } catch (err) {
      console.error('Error al exportar sesión:', err)
    }
  }, [book, bookId])

  /** Exports all sessions for this book as a ZIP (JSON + Markdown + PDF + audio files). */
  const handleExportAllSessions = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const full = await getFullExportJSON() as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const langData = (full.language as any[])?.[0]
      if (!langData) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookEntry = (langData.books as any[]).find((b: any) => b.id === bookId)
      if (!bookEntry) return
      await downloadProjectAsZip(
        { language: { ...langData, books: [bookEntry] } },
        `${book?.name ?? bookId}_sesiones`,
      )
    } catch (err) {
      console.error('Error al exportar sesiones:', err)
    }
  }, [book, bookId])

  if (!book) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-5">
        <p className="text-sm text-muted-foreground">Libro no encontrado.</p>
        <button
          onClick={() => router.history.back()}
          className="text-sm text-primary underline"
        >
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="h-full">
      <BookReadScreen
        bookTitle={book.name}
        usfm={book.content}
        sessions={uiSessions}
        onBack={() => router.history.back()}
        onStartSession={handleStartSession}
        onOpenSession={handleOpenSession}
        onExportSession={handleExportSession}
        onExportAllSessions={handleExportAllSessions}
      />
    </div>
  )
}
