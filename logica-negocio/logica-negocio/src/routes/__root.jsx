import { createRootRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const langCode = localStorage.getItem('appLang')
    const isOnboarding = location.pathname === '/onboarding' //es para que no entre en loop

    if (!langCode && !isOnboarding) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: () => (
    <div style={{ minHeight: '100vh', background: '#1a1a1a', color: '#fff' }}>
      <Outlet />
    </div>
  ),
  notFoundComponent: () => (
    <div style={{ padding: 20 }}>
      <h1>404 — Página no encontrada</h1>
      <a href="/">Volver al inicio</a>
    </div>
  ),
})