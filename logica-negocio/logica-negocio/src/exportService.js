import { openDb } from "./db.js";
import { groupCommentsByVerse } from "./reviewUtils.js";

// Helper genérico para traer todo (sin variables locales sin usar)
async function getAll(storeName) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

export async function getFullExportJSON() {
  const languages = await getAll("languages");
  const books = await getAll("books");
  const sessions = await getAll("sessions");
  const comments = await getAll("comments");

  return {
    language: languages.map(lang => ({
      code: lang.code,
      name: lang.name,
      books: books
        .filter(b => (b.langCode === lang.code) && b.active)
        .map(book => ({
          id: book.id,
          name: book.name,
          version: book.version || "",
          content: book.content || "",
          code: book.code,
          langCode: book.langCode,
          sessions: sessions
            .filter(s => s.bookId === book.id)
            .map(session => ({
              id: session.id,
              title: session.title,
              startDate: session.startDate,
              endDate: session.endDate,
              bookId: session.bookId,
              reviews: groupCommentsByVerse(comments.filter(c => c.sessionId === session.id))
            }))
        }))
    }))
  };
}