// @refresh reset
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getBook } from '../bookRepository'
import { listSessionsByBookId } from '../sessionRepository'
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
  const router = useRouter()
  const { book, sessions } = Route.useLoaderData()
  const { bookId } = Route.useParams()
  const { handleCreateSession } = useBookSessions(bookId)

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>{book.name}</h1>
      <button onClick={handleCreateSession}>Nueva sesión</button>
      <ul>
        {sessions.map(session => (
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