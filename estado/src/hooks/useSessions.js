import { useMemo } from 'react'
import { useSessionStore } from './sessionStore'

export function useSessions({ language, bookCode, onStartSession, onCloseSession }) {
  const allSessions = useSessionStore((s) => s.allSessions)
  const addSessionAction = useSessionStore((s) => s.addSessionAction)
  const updateSessionAction = useSessionStore((s) => s.updateSessionAction)

  // Generamos el bookId para filtrar: ejemplo "RUT-ha"
  const currentBookId = `${bookCode}-${language}`

  // Retorna solo las sesiones que pertenecen a este libro
  const sessions = useMemo(() => 
    allSessions.filter((s) => s.bookId === currentBookId),
    [allSessions, currentBookId]
  )

  // Inicializa la sesión solo con fecha de inicio e ID
  const startSession = (title) => {
    const newSession = {
      id: Date.now(),
      title: title || `Sesión ${new Date().toLocaleDateString()}`,
      startDate: new Date().toISOString(),
      endDate: null,
      bookId: currentBookId,
      reviews: []
    }

    addSessionAction(newSession)
    if (onStartSession) onStartSession(newSession)
    return newSession // Retornamos para saber cuál ID cerrar luego
  }

  // Finaliza la sesión completando los datos requeridos
  const closeSession = (sessionId, sessionData = {}) => {
    const sessionToClose = allSessions.find(s => s.id === sessionId)
    if (!sessionToClose) return

    const closedSession = {
      ...sessionToClose,
      endDate: new Date().toISOString(),
      reviews: sessionData.reviews || [
        {
          text: sessionData.text || "",
          reference: sessionData.reference || {
            chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 1
          },
          date: new Date().toISOString(),
          comments: sessionData.comments || []
        }
      ]
    }

    updateSessionAction(closedSession)
    if (onCloseSession) onCloseSession(closedSession)
  }

  return {
    sessions,
    startSession,
    closeSession
  }
}