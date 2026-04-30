/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// @refresh resets
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getSession } from '../lib/sessionRepository'
import { useSession } from '../hooks/useSession'

export const Route = createFileRoute('/books/$bookId/sessions/$sessionId/')({
  loader: ({ params }) => getSession(Number(params.sessionId)),
  component: SessionPage,
})

function SessionPage() {
  const session = Route.useLoaderData() as any
  const { bookId, sessionId } = Route.useParams()
  const { handleCreateReview } = useSession(bookId, sessionId)
  const router = useRouter()

  const defaultReference = {
    chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 1
  }

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>{session.title}</h1>
      <button onClick={() => handleCreateReview(defaultReference)}>Nueva review</button>
      <ul>
        {session.reviews.map((review: any) => {
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