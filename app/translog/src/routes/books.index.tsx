/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { useCallback } from 'react'
import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { listBooksByLang, handleImportBook } from '../lib/bookRepository'
import { getLanguageByCode } from '../lib/config/languages'
import { BookListScreen } from '../ui/components/bible/screens/BookListScreen'
import type { Book } from '../ui/components/bible/screens/BookListScreen'

export const Route = createFileRoute('/books/')({
  loader: () => {
    const langCode = localStorage.getItem('appLang')
    if (!langCode) return []
    return listBooksByLang(langCode)
  },
  component: BooksPage,
})

function BooksPage() {
  const rawBooks = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()

  const langCode = localStorage.getItem('appLang') ?? ''

  const books: Book[] = rawBooks.map((b: { id: string; name: string }) => ({
    id: b.id,
    name: b.name,
  }))

  const handleAddBook = useCallback(async () => {
    const lang = getLanguageByCode(langCode)
    await handleImportBook(langCode, lang?.ang ?? lang?.ln ?? langCode)
    await router.invalidate()
  }, [langCode, router])

  return (
    <div className="h-full">
      <BookListScreen
        books={books}
        onSelectBook={(book) => navigate({ to: '/books/$bookId', params: { bookId: book.id } })}
        onAddBook={handleAddBook}
        onOpenSettings={() => navigate({ to: '/settings' })}
      />
    </div>
  )
}