import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useBookStore = create(
    persist(
      (set) => ({
        books: [],
        
        addBookAction: (book) => 
          set((state) => ({ books: [...state.books, book] })),

        addBooksAction: (newBooks) => 
            set((state) => ({ books: [...state.books, ...newBooks] })),
          
        removeBookAction: (id) => 
          set((state) => ({ 
            books: state.books.filter((b) => b.id !== id) 
          })),
      }),
      { name: 'books-storage' }
    )
  )