// @refresh reset
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { listCommentsByReview } from '../commentRepository'
import { getReview } from '../reviewRepository'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId/comments/$commentId'
)({
  loader: async ({ params }) => {
    const review = await getReview(Number(params.reviewId))
    const comments = await listCommentsByReview(Number(params.reviewId))
    const comment = comments.find(c => c.id === Number(params.commentId))
    if (!comment) throw new Error(`Comment not found: ${params.commentId}`)
    return { review, comment }
  },
  component: CommentPage,
})

function CommentPage() {
  const router = useRouter()
  const { review, comment } = Route.useLoaderData()
  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h2>
        Cap. {review.reference.chapterStart} v.{review.reference.verseStart}
      </h2>
      <p><strong>{comment.author}</strong></p>
      <p>{comment.text}</p>
      <small>{comment.date}</small>
    </div>
  )
}