/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { getSession } from '../lib/sessionRepository'
import { getReview } from '../lib/reviewRepository'
import { listCommentsByReview } from '../lib/commentRepository'
import { ReviewScreen } from '../ui/components/bible/screens/ReviewScreen'
import type { ReviewComment } from '../ui/components/bible/screens/ReviewScreen'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId/',
)({
  loader: async ({ params }) => {
    const firstDash = params.bookId.indexOf('-')
    const code = params.bookId.slice(0, firstDash)
    const langCode = params.bookId.slice(firstDash + 1)
    const [book, session, review, comments] = await Promise.all([
      getBook(code, langCode).catch(() => null),
      getSession(Number(params.sessionId)).catch(() => null),
      getReview(Number(params.reviewId)),
      listCommentsByReview(Number(params.reviewId)),
    ])
    return { book, session, review, comments }
  },
  component: ReviewPage,
})

function formatTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function ReviewPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { book, session, review, comments } = Route.useLoaderData() as any
  const { bookId, sessionId, reviewId } = Route.useParams()
  const navigate = useNavigate()
  const router = useRouter()

  const ref = review?.reference ?? {}
  const bookName: string = book?.name ?? ''
  const chapterVerse = ref.chapterStart != null
    ? `${ref.chapterStart}:${ref.verseStart}`
    : ''

  const uiComments: ReviewComment[] = (comments ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any): ReviewComment => ({
      id: c.id,
      author: c.author ?? 'Anónimo',
      time: c.date ? formatTime(c.date) : '',
      text: c.text,
    }),
  )

  const isClosed = Boolean(session?.endDate)
  const closedAt = session?.endDate ? formatTime(session.endDate) : undefined

  const handleNewComment = useCallback(() => {
    navigate({
      to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId/new',
      params: { bookId, sessionId, reviewId },
    })
  }, [bookId, sessionId, reviewId, navigate])

  return (
    <div className="h-full">
      <ReviewScreen
        title={session?.title ?? bookName}
        subtitle={chapterVerse ? `Capítulo ${chapterVerse}` : undefined}
        quote={review?.text ?? ''}
        reference={[bookName, chapterVerse].filter(Boolean).join(' ')}
        comments={uiComments}
        closed={isClosed}
        closedAt={closedAt}
        onBack={() => router.history.back()}
        onNewComment={handleNewComment}
      />
    </div>
  )
}
