/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
// @refresh reset
import { createFileRoute, Link, useRouter } from '@tanstack/react-router'
import { listBooksByLang } from '../lib/bookRepository'

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

  return (
    <div style={{ padding: 20 }}>
      <button onClick={() => router.history.back()}>← Volver</button>
      <h1>Libros — {langCode}</h1>
      <button onClick={() => router.invalidate()}>Refrescar</button>
      <ul>
        {books.map((book: any) => (
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