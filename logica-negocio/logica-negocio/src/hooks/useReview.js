import { useNavigate } from '@tanstack/react-router'
import { saveComment } from '../commentRepository'

export function useReview(bookId, sessionId, reviewId) {
  const navigate = useNavigate()

  const handleCreateComment = async (author, text) => {
    await saveComment(Number(reviewId), { author, text })
    navigate({
      to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId',
      params: { bookId, sessionId, reviewId }
    })
  }

  return { handleCreateComment }
}