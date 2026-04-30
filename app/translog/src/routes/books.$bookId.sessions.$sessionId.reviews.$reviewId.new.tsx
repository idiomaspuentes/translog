/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { getReview } from '../lib/reviewRepository'
import { saveComment } from '../lib/commentRepository'
import { NewCommentScreen } from '../ui/components/bible/screens/NewCommentScreen'
import type { CommentFormState, NewCommentPayload } from '../ui/components/bible/screens/NewCommentScreen'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId/new',
)({
  loader: async ({ params }) => {
    const firstDash = params.bookId.indexOf('-')
    const code = params.bookId.slice(0, firstDash)
    const langCode = params.bookId.slice(firstDash + 1)
    const [book, review] = await Promise.all([
      getBook(code, langCode).catch(() => null),
      getReview(Number(params.reviewId)).catch(() => null),
    ])
    return { book, review }
  },
  component: NewCommentPage,
})

function NewCommentPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { book, review } = Route.useLoaderData() as any
  const { reviewId } = Route.useParams()
  const router = useRouter()

  const [submitState, setSubmitState] = useState<CommentFormState>('idle')

  const ref = review?.reference ?? {}
  const bookName: string = book?.name ?? ''
  const chapterVerse = ref.chapterStart != null ? `${ref.chapterStart}:${ref.verseStart}` : ''
  const reference = [bookName, chapterVerse].filter(Boolean).join(' ')

  /** Default author name remembered across sessions. */
  const defaultAuthor = localStorage.getItem('appAuthorName') ?? ''

  const handleSubmit = useCallback(
    async ({ author, text }: NewCommentPayload) => {
      if (!author.trim() || !text.trim()) return
      setSubmitState('submitting')
      try {
        await saveComment(Number(reviewId), { author: author.trim(), text: text.trim() })
        // Remember the author name for next time
        localStorage.setItem('appAuthorName', author.trim())
        setSubmitState('success')
        // Navigate back to the review thread after a short delay so
        // the user sees the success confirmation.
        window.setTimeout(() => router.history.back(), 1500)
      } catch (err) {
        console.error('Error al guardar comentario:', err)
        setSubmitState('idle')
      }
    },
    [reviewId, router],
  )

  return (
    <div className="h-full">
      <NewCommentScreen
        state={submitState}
        quote={review?.text ?? ''}
        reference={reference}
        defaultAuthorName={defaultAuthor}
        authorInitial={defaultAuthor.charAt(0).toUpperCase() || undefined}
        onSubmit={handleSubmit}
        onBack={() => router.history.back()}
      />
    </div>
  )
}
