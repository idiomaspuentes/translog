// @refresh reset
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getSession } from '../sessionRepository'
import { useSession } from '../hooks/useSession'

export const Route = createFileRoute('/books/$bookId/sessions/$sessionId/')({
  loader: ({ params }) => getSession(Number(params.sessionId)),
  component: SessionPage,
})

function SessionPage() {
  const router = useRouter()
  const session = Route.useLoaderData()
  const { bookId, sessionId } = Route.useParams()
  const { handleCreateReview } = useSession(bookId, sessionId)

  const defaultReference = {
    chapterStart: 1,
    verseStart: 1,
    chapterEnd: 1,
    verseEnd: 1
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>{session.title}</h1>
      <button onClick={() => handleCreateReview(defaultReference)}>
        Nueva review
      </button>
      <ul>
        {session.reviews.map(review => {
          const commentCount = Array.isArray(review.comments)
            ? review.comments.length
            : review.comments
          return (
            <li key={review.id}>
              <Link
                to="/books/$bookId/sessions/$sessionId/reviews/$reviewId"
                params={{ bookId, sessionId, reviewId: String(review.id) }}
              >
                Cap. {review.reference.chapterStart} v.{review.reference.verseStart}
                {' — '}{commentCount} comentario(s)
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}