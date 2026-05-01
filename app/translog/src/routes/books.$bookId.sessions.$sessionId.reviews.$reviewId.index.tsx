/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useEffect, useState } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { getBook } from '../lib/bookRepository'
import { getSession } from '../lib/sessionRepository'
import { getReview } from '../lib/reviewRepository'
import { listCommentsByReview } from '../lib/commentRepository'
import { getAudioBlob } from '../lib/audioBlobCache'
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

function formatDurationMs(ms: number | undefined): string {
  if (!ms) return '0:00'
  const totalSeconds = Math.round(ms / 1000)
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

/** Reads a native audio file from Filesystem and returns a base64 data URI. */
async function resolveNativeAudioSrc(path: string): Promise<string | undefined> {
  try {
    const { data } = await Filesystem.readFile({ path, directory: Directory.Data })
    return `data:audio/webm;base64,${data as string}`
  } catch {
    try {
      const { uri } = await Filesystem.getUri({ path, directory: Directory.Data })
      return Capacitor.convertFileSrc(uri)
    } catch {
      return undefined
    }
  }
}

/**
 * Build an audio-src map for web synchronously from the blob cache.
 * Called only once per component mount (inside useState lazy initializer).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildWebAudioSrcs(comments: any[]): Record<number, string> {
  console.log('[review] buildWebAudioSrcs called with', comments?.length, 'comments')
  const map: Record<number, string> = {}
  for (const c of comments) {
    console.log('[review] comment', c.id, 'type:', c.type, 'path:', c.path, 'durationMs:', c.audioDurationMs)
    if (c.type !== 'audio') continue
    const blob = getAudioBlob(c.id)
    console.log('[review] getAudioBlob(', c.id, '):', blob ? `Blob(${blob.size})` : 'undefined')
    if (blob) map[c.id] = URL.createObjectURL(blob)
  }
  console.log('[review] built web audio srcs:', Object.keys(map))
  return map
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

  // Web: resolve blob-cache URLs synchronously before the first render so the
  // user never taps play against an undefined src.
  // Native: starts empty and is populated by the async useEffect below.
  const [audioSrcs, setAudioSrcs] = useState<Record<number, string>>(() =>
    Capacitor.isNativePlatform() ? {} : buildWebAudioSrcs(comments ?? []),
  )

  // Web: re-build audio srcs whenever comments change (covers same-instance
  // updates after router.invalidate() refreshes loader data without remounting).
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return
    const newSrcs = buildWebAudioSrcs(comments ?? [])
    if (Object.keys(newSrcs).length > 0) {
      setAudioSrcs(prev => ({ ...prev, ...newSrcs }))
    }
  }, [comments])

  // Native only: resolve audio files from Filesystem asynchronously.
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const audioComments = (comments ?? []).filter((c: any) => c.type === 'audio' && c.path)
    if (audioComments.length === 0) return
    let cancelled = false
    void Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      audioComments.map(async (c: any) => {
        const src = await resolveNativeAudioSrc(c.path)
        return { id: c.id, src }
      }),
    ).then((results) => {
      if (cancelled) return
      const map: Record<number, string> = {}
      for (const { id, src } of results) {
        if (src) map[id] = src
      }
      setAudioSrcs(map)
    })
    return () => { cancelled = true }
  }, [comments])

  const uiComments: ReviewComment[] = (comments ?? []).map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (c: any): ReviewComment => ({
      id: c.id,
      author: c.author ?? 'Anónimo',
      time: c.date ? formatTime(c.date) : '',
      text: c.text,
      ...(c.type === 'audio'
        ? {
            audio: {
              duration: formatDurationMs(c.audioDurationMs),
              src: audioSrcs[c.id],
            },
          }
        : {}),
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
