/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { listSessionsByBookId, createSession } from '../lib/sessionRepository'
import { exportSessionJSON, getFullExportJSON } from '../lib/exportService'
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

  /** Exports a single session as JSON. */
  const handleExportSession = useCallback(async (session: Session) => {
    await exportSessionJSON(session.id)
  }, [])

  /** Exports all sessions for this book as JSON. */
  const handleExportAllSessions = useCallback(async () => {
    try {
      const full = await getFullExportJSON()
      // Filter the full export to just this book's entry
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const bookEntry = (full.language as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .flatMap((l: any) => l.books as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .find((b: any) => b.id === bookId)
      const data = bookEntry ?? full
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book?.name ?? bookId}_sessions.json`
      a.click()
      URL.revokeObjectURL(url)
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
