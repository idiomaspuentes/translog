import { useNavigate, useRouter } from '@tanstack/react-router'
import { createSession } from '../sessionRepository'
import { getBook, saveBook, handleImportBook } from '../bookRepository'
import { saveLanguage } from '../languageRepository'

export function useBookSessions(bookId) {
  const navigate = useNavigate()
  const router = useRouter()

  const handleCreateSession = async () => {
    const firstDash = bookId.indexOf('-')
    const code = bookId.slice(0, firstDash)
    const langCode = bookId.slice(firstDash + 1)

    // Si el libro no existe lo crea vacío
    try {
      await getBook(code, langCode)
    } catch {
      await saveLanguage({ code: langCode, name: langCode })
      await saveBook({ code, langCode, name: code, version: '', content: '' })
    }

    const session = await createSession(bookId)
    router.invalidate()
    navigate({
      to: '/books/$bookId/sessions/$sessionId',
      params: { bookId, sessionId: String(session.id) }
    })
  }

  const handleAddBook = async (langCode, langName) => {
    await handleImportBook(langCode, langName)
    router.invalidate()
  }

  return { handleCreateSession, handleAddBook }
}