import { useEffect } from 'react'
import { createRootRoute, Outlet, redirect, useRouterState } from '@tanstack/react-router'

const FONT_SIZE_PX: Record<string, string> = {
  'Pequeño':    '14px',
  'Mediano':    '16px',
  'Grande':     '18px',
  'Muy grande': '20px',
}

function Root() {
  // Re-read on every navigation so settings changes take effect immediately.
  const location = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    const label = localStorage.getItem('appFontSize') ?? 'Mediano'
    document.documentElement.style.fontSize = FONT_SIZE_PX[label] ?? '16px'
  }, [location])

  return (
    <div className="h-full">
      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  beforeLoad: ({ location }) => {
    const langCode = localStorage.getItem('appLang')
    const isOnboarding = location.pathname === '/onboarding'
    if (!langCode && !isOnboarding) {
      throw redirect({ to: '/onboarding' })
    }
  },
  component: Root,
  notFoundComponent: () => (
    <div style={{ padding: 20 }}>
      <h1>404 — Página no encontrada</h1>
    </div>
  ),
})