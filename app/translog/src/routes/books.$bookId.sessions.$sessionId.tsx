import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/books/$bookId/sessions/$sessionId')({
  component: () => <Outlet />,
})