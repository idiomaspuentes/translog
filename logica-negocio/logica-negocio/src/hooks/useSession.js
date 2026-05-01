import { useNavigate } from '@tanstack/react-router'
import { saveReview } from '../reviewRepository'

export function useSession(bookId, sessionId) {
  const navigate = useNavigate()

  const handleCreateReview = async (reference) => {
    const review = await saveReview({
      sessionId: Number(sessionId),
      text: '',
      reference
    })
    navigate({
      to: '/books/$bookId/sessions/$sessionId/reviews/$reviewId',
      params: { bookId, sessionId, reviewId: String(review.id) }
    })
  }

  return { handleCreateReview }
}