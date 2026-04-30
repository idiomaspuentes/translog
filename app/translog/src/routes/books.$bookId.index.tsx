/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// @refresh resets
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { listSessionsByBookId } from '../lib/sessionRepository'
import { useBookSessions } from '../hooks/useBookSessions'

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
  component: BookSessionsPage,
})

function BookSessionsPage() {
  const { book, sessions } = Route.useLoaderData() as any
  const { bookId } = Route.useParams()
  const { handleCreateSession } = useBookSessions(bookId)
  const router = useRouter()

  if (!book) return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <p>Libro no encontrado.</p>
    </div>
  )

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>{book.name}</h1>
      <button onClick={handleCreateSession}>Nueva sesión</button>
      <ul>
        {sessions.map((session: any) => (
          <li key={session.id}>
            <Link
              to="/books/$bookId/sessions/$sessionId"
              params={{ bookId, sessionId: String(session.id) }}
            >
              {session.title} — {session.reviews.length} review(s)
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}