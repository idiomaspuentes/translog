// src/hooks/usebooks.js
import { useBookStore } from './usebookstore'
import { useAppConfigStore } from '../configstore/languageStore' // Verifica que la ruta sea correcta
import { useMemo } from 'react'

export function useBooks({ onAddBook, onAddBooks, onRemoveBook } = {}) {
  // Aquí es donde comparten la información
  const language = useAppConfigStore((s) => s.language)
  
  const allBooks = useBookStore((s) => s.books)
  const addBookAction = useBookStore((s) => s.addBookAction)
  const addBooksAction = useBookStore((s) => s.addBooksAction)
  const removeBookAction = useBookStore((s) => s.removeBookAction)

  // Filtrado reactivo al idioma global
  const books = useMemo(() => 
    allBooks.filter((b) => b.langCode === language), 
    [allBooks, language]
  )

  const addBook = (bookData) => {
    const newBook = {
      ...bookData,
      id: bookData.id || `${bookData.code}-${language}-${Date.now()}`,
      langCode: language, // Se asigna automáticamente el idioma global
      sessions: bookData.sessions || []
    }
    addBookAction(newBook)
    if (onAddBook) onAddBook(newBook)
  }

  const addBooks = (booksDataArray) => {
    const newBooks = booksDataArray.map((bookData) => ({
      ...bookData,
      id: bookData.id || `${bookData.code}-${language}-${Math.random()}`,
      langCode: language 
    }))
    addBooksAction(newBooks)
    if (onAddBooks) onAddBooks(newBooks)
  }

  const removeBook = (id) => {
    removeBookAction(id)
    if (onRemoveBook) onRemoveBook(id)
  }

  return {
    books,
    addBook,
    addBooks,
    removeBook,
    language // Retornamos el idioma actual por si lo necesitas en la UI
  }
}