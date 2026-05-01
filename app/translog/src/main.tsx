import './styles.css'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createRouter, RouterProvider, createHashHistory } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'

const hashHistory = createHashHistory()
const router = createRouter({ routeTree, history: hashHistory })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
)