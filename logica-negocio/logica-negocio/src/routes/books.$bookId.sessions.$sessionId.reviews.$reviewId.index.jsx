// @refresh reset
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getReview } from '../reviewRepository'
import { listCommentsByReview } from '../commentRepository'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId/'
)({
  loader: async ({ params }) => {
    const review = await getReview(Number(params.reviewId))
    const comments = await listCommentsByReview(Number(params.reviewId))
    return { review, comments }
  },
  component: ReviewPage,
})

function ReviewPage() {
  const router = useRouter()
  const { review, comments } = Route.useLoaderData()
  const { bookId, sessionId, reviewId } = Route.useParams()

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h2>
        Cap. {review.reference.chapterStart} v.{review.reference.verseStart}
        {' → '}
        Cap. {review.reference.chapterEnd} v.{review.reference.verseEnd}
      </h2>
      <p>{review.text}</p>
      <ul>
        {comments.map(comment => (
            <li key={comment.id}>
            <Link
                to="/books/$bookId/sessions/$sessionId/reviews/$reviewId/comments/$commentId"
                params={{ bookId, sessionId, reviewId, commentId: String(comment.id) }}
            >
                <strong>{comment.author}</strong>: {comment.text}
            </Link>
            </li>
        ))}
      </ul>
      <Link
        to="/books/$bookId/sessions/$sessionId/reviews/$reviewId/new"
        params={{ bookId, sessionId, reviewId }}
      >
        + Agregar comentario
      </Link>
    </div>
  )
}