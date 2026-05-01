import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useSessionStore = create(
  persist(
    (set) => ({
      sessions: [],

      // Agrega una sesión nueva (normalmente al iniciar)
      addSession: (session) =>
        set((state) => ({ sessions: [...state.sessions, session] })),

      // Actualiza una sesión existente (al finalizar o agregar reviews)
      updateSession: (id, data) =>
        set((state) => ({
          sessions: state.sessions.map((s) => (s.id === id ? { ...s, ...data } : s)),
        })),
    }),
    { name: 'sessions-storage' }
  )
)