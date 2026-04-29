// @refresh reset
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { listBooksByLang } from '../bookRepository'
import { IndexedDBTest } from '../test/IndexedDBTest'
import { useBookSessions } from '../hooks/useBookSessions'

export const Route = createFileRoute('/books/')({
  loader: () => {
    const langCode = localStorage.getItem('appLang')
    if (!langCode) return []
    return listBooksByLang(langCode)
  },
  component: BooksPage,
})

function BooksPage() {
  const books = Route.useLoaderData()
  const langCode = localStorage.getItem('appLang')
  const router = useRouter()
  const { handleAddBook } = useBookSessions(null)

  return (
    <div style={{ padding: 20 }}>
        <IndexedDBTest />
      <h1>Libros — {langCode}</h1>
      <button onClick={() => router.invalidate()}>Refrescar</button>
      <button onClick={() => handleAddBook(langCode, langCode)}>
        + Importar libro USFM
      </button>
      <ul>
        {books.map(book => (
          <li key={book.id}>
            <Link to="/books/$bookId" params={{ bookId: book.id }}>
              {book.name} ({book.code})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}