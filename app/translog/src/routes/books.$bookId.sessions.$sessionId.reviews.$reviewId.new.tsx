/* eslint-disable react-refresh/only-export-components */
// @refresh resets
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useReview } from '../hooks/useReview'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId/new'
)({
  component: NewCommentPage,
})

function NewCommentPage() {
  const { bookId, sessionId, reviewId } = Route.useParams()
  const { handleCreateComment } = useReview(bookId, sessionId, reviewId)
  const [author, setAuthor] = useState('')
  const [text, setText] = useState('')

  const handleSubmit = async () => {
    if (!author || !text) return
    await handleCreateComment(author, text)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Nuevo comentario</h2>
      <input
        placeholder="Autor"
        value={author}
        onChange={e => setAuthor(e.target.value)}
      />
      <textarea
        placeholder="Comentario"
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <button onClick={handleSubmit}>Guardar</button>
    </div>
  )
}