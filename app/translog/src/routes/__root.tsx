import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const langCode = localStorage.getItem('appLang')
    const isOnboarding = location.pathname === '/onboarding'
    if (!langCode && !isOnboarding) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: () => (
    <div className="h-full">
      <Outlet />
    </div>
  ),
  notFoundComponent: () => (
    <div style={{ padding: 20 }}>
      <h1>404 — Página no encontrada</h1>
    </div>
  ),
})