/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useMemo } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { getBook } from '../lib/bookRepository'
import { getSession, saveSession, closeSession } from '../lib/sessionRepository'
import { createReview } from '../lib/reviewRepository'
import { BookSessionScreen } from '../ui/components/bible/screens/BookSessionScreen'
import type { SessionMap, SessionEntry } from '../ui/components/bible/screens/BookSessionScreen'

export const Route = createFileRoute('/books/$bookId/sessions/$sessionId/')({
  loader: async ({ params }) => {
    const firstDash = params.bookId.indexOf('-')
    const code = params.bookId.slice(0, firstDash)
    const langCode = params.bookId.slice(firstDash + 1)
    const [book, session] = await Promise.all([
      getBook(code, langCode).catch(() => null),
      getSession(Number(params.sessionId)),
    ])
    return { book, session }
  },
  component: SessionPage,
})

type RawReview = {
  id: number
  text: string
  reference: { chapterStart: number; verseStart: number; chapterEnd: number; verseEnd: number }
  date: string
  comments: unknown[]
}

function SessionPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { book, session } = Route.useLoaderData() as any
  const { bookId, sessionId } = Route.useParams()
  const navigate = useNavigate()
  const router = useRouter()

  const reviews: RawReview[] = session?.reviews ?? []

  /**
   * Build SessionMap indexed by [chapter][verse] from the session's reviews.
   * Each review maps to one SessionEntry: { fragment, comments }.
   */
  const sessionMap = useMemo<SessionMap>(() => {
    const map: SessionMap = {}
    reviews.forEach((r) => {
      const ch = r.reference.chapterStart
      const v = r.reference.verseStart
      if (!map[ch]) map[ch] = {}
      if (!map[ch][v]) map[ch][v] = []
      map[ch][v].push({
        fragment: r.text,
        comments: Array.isArray(r.comments) ? r.comments.length : (r.comments as number) ?? 0,
      } satisfies SessionEntry)
    })
    return map
  }, [reviews])

  /**
   * Suggested title: use stored title or generate from book name + date.
   */
  const suggestedTitle = useMemo(() => {
    if (session?.title) return session.title as string
    const date = new Date(session?.startDate ?? Date.now())
    return `${book?.name ?? ''} ${date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })}`.trim()
  }, [session, book])

  /**
   * User selected a text fragment → create a new review and open its thread.
   */
  const handleCommentSelection = useCallback(
    async ({ chapter, verse, fragment }: { chapter: number; verse: number | null; fragment: string }) => {
      const v = verse ?? 1
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const review: any = await createReview(Number(sessionId), {
        text: fragment,
        chapterStart: chapter,
        verseStart: v,
        chapterEnd: chapter,
        verseEnd: v,
        date: new Date().toISOString(),
      })
      await router.invalidate()
      navigate({
        to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId',
        params: { bookId, sessionId, reviewId: String(review.id) },
      })
    },
    [bookId, sessionId, navigate, router],
  )

  /**
   * User tapped a review entry in the side panel → look up the review by
   * chapter + verse + index and navigate to its thread.
   */
  const handleOpenSession = useCallback(
    ({ chapter, verse, index }: { chapter: number; verse: number; index: number; entry: SessionEntry }) => {
      const matching = reviews.filter(
        (r) => r.reference.chapterStart === chapter && r.reference.verseStart === verse,
      )
      const review = matching[index]
      if (!review) return
      navigate({
        to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId',
        params: { bookId, sessionId, reviewId: String(review.id) },
      })
    },
    [reviews, bookId, sessionId, navigate],
  )

  /**
   * User confirmed the session title → persist and go back.
   */
  const handleSave = useCallback(
    async ({ title }: { title: string }) => {
      // Save title first, then close the session (sets endDate) if not already closed.
      await saveSession({ ...session, title })
      if (!session?.endDate) await closeSession(session.id)
      router.history.back()
    },
    [session, router],
  )

  if (!session) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-5">
        <p className="text-sm text-muted-foreground">Sesión no encontrada.</p>
        <button onClick={() => router.history.back()} className="text-sm text-primary underline">
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <div className="h-full">
      <BookSessionScreen
        bookTitle={book?.name ?? ''}
        usfm={book?.content}
        sessions={sessionMap}
        suggestedSessionTitle={suggestedTitle}
        closed={Boolean(session?.endDate)}
        onCommentSelection={handleCommentSelection}
        onOpenSession={handleOpenSession}
        onSave={handleSave}
        onBack={() => router.history.back()}
      />
    </div>
  )
}
