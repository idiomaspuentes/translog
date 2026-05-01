/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback, useState } from 'react'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Capacitor } from '@capacitor/core'
import { getBook } from '../lib/bookRepository'
import { getReview } from '../lib/reviewRepository'
import { saveComment } from '../lib/commentRepository'
import { blobToBase64 } from '../lib/sessionArchive'
import { storeAudioBlob } from '../lib/audioBlobCache'
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
  const { bookId, sessionId, reviewId } = Route.useParams()
  const router = useRouter()

  const [submitState, setSubmitState] = useState<CommentFormState>('idle')

  const ref = review?.reference ?? {}
  const bookName: string = book?.name ?? ''
  const chapterVerse = ref.chapterStart != null ? `${ref.chapterStart}:${ref.verseStart}` : ''
  const reference = [bookName, chapterVerse].filter(Boolean).join(' ')

  /** Default author name remembered across sessions. */
  const defaultAuthor = localStorage.getItem('appAuthorName') ?? ''

  const handleSubmit = useCallback(
    async ({ author, text, audio }: NewCommentPayload) => {
      console.log('[new-comment] handleSubmit called', {
        author, textLen: text?.length, hasAudio: !!audio,
        audioBlobSize: audio?.size, audioBlobType: audio?.type,
      })
      if (!author.trim()) { console.log('[new-comment] early exit: no author'); return }
      if (!audio && !text.trim()) { console.log('[new-comment] early exit: no audio and no text'); return }
      setSubmitState('submitting')
      try {
        let audioName: string | undefined
        let audioPath: string | undefined
        let audioDurationMs: number | undefined

        if (audio) {
          // Measure duration from blob
          audioDurationMs = await new Promise<number>((resolve) => {
            const url = URL.createObjectURL(audio)
            const el = new Audio(url)
            el.onloadedmetadata = () => {
              console.log('[new-comment] audio duration:', el.duration)
              resolve(Math.round(el.duration * 1000))
              URL.revokeObjectURL(url)
            }
            el.onerror = (e) => {
              console.warn('[new-comment] audio loadedmetadata error:', e)
              resolve(0); URL.revokeObjectURL(url)
            }
          })

          audioName = `comment_${Date.now()}.webm`
          audioPath = `comments/audios/${audioName}`
          console.log('[new-comment] audioPath:', audioPath, 'durationMs:', audioDurationMs)

          if (Capacitor.isNativePlatform()) {
            const base64 = await blobToBase64(audio)
            await Filesystem.mkdir({ path: 'comments/audios', directory: Directory.Data, recursive: true })
            await Filesystem.writeFile({ path: audioPath, data: base64, directory: Directory.Data })
            console.log('[new-comment] audio written to native FS')
          } else {
            console.log('[new-comment] web: skipping FS write')
          }
        }

        const saved = await saveComment(Number(reviewId), {
          author: author.trim(),
          text: text.trim(),
          type: audio ? 'audio' : 'text',
          name: audioName,
          path: audioPath,
          audioDurationMs,
        })
        console.log('[new-comment] saveComment result:', saved)

        // On web (no native FS) persist the blob so the review screen can
        // create an ObjectURL for playback (sessionStorage survives refresh).
        if (audio && !Capacitor.isNativePlatform() && saved?.id != null) {
          console.log('[new-comment] storing blob in cache for id:', saved.id)
          await storeAudioBlob(saved.id, audio)
          console.log('[new-comment] blob stored, sessionStorage keys:',
            Object.keys(sessionStorage).filter(k => k.startsWith('audio_blob_')))
        }

        localStorage.setItem('appAuthorName', author.trim())
        setSubmitState('success')
        // Navigate explicitly to the review route (not history.back()) so
        // TanStack Router always re-runs the loader and sees the new comment.
        window.setTimeout(() => {
          // Invalidate the loader cache first so the review route always
          // re-fetches fresh comments (including the one we just saved).
          void router.invalidate().then(() =>
            router.navigate({
              to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId/',
              params: { bookId, sessionId, reviewId },
              replace: true,
            }),
          )
        }, 1500)
      } catch (err) {
        console.error('[new-comment] Error al guardar comentario:', err)
        setSubmitState('idle')
      }
    },
    [bookId, sessionId, reviewId, router],
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
