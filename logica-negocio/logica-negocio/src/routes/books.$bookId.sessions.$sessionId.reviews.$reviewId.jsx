// @refresh reset
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/books/$bookId/sessions/$sessionId/reviews/$reviewId'
)({
  component: () => <Outlet />,
})