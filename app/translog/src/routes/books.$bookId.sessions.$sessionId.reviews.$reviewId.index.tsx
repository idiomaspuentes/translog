/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// @refresh resets
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { getReview } from '../lib/reviewRepository'
import { listCommentsByReview } from '../lib/commentRepository'

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
  const { review, comments } = Route.useLoaderData() as any
  const { bookId, sessionId, reviewId } = Route.useParams()
  const router = useRouter()

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
        {comments.map((comment: any) => (
          <li key={comment.id}>
            <strong>{comment.author}</strong>: {comment.text}
            <br />
            <small>{comment.date}</small>
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