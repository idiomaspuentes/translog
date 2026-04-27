import { openDb } from "./db.js";

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
        .filter(b => b.langCode === lang.code)
        .map(book => ({
          name: book.name,
          content: book.content || "",
          code: book.code,
          sessions: sessions
            .filter(s => s.bookCode === book.code)
            .map(session => ({
              id: session.id,
              title: session.title,
              startDate: session.startDate,
              endDate: session.endDate,
              reviews: groupCommentsByVerse(comments.filter(c => c.sessionId === session.id))
            }))
        }))
    }))
  };
}

function groupCommentsByVerse(sessionComments) {
  const reviewsMap = {};
  
  sessionComments.forEach(c => {
    const key = c.verseKey || "general";
    if (!reviewsMap[key]) {
      reviewsMap[key] = {
        text: "",
        reference: parseVerse(key),
        date: c.date,
        comments: []
      };
    }
    reviewsMap[key].comments.push({
      date: c.date,
      author: c.author,
      text: c.text
    });
  });

  return Object.values(reviewsMap);
}

function parseVerse(key) {
  // Si no hay punto, ponemos valores por defecto
  if (!key.includes('.')) return { chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 1 };
  
  const [/*book*/, chapter, verse] = key.split('.');
  const ch = parseInt(chapter) || 1;
  const v = parseInt(verse) || 1;
  return { chapterStart: ch, verseStart: v, chapterEnd: ch, verseEnd: v };
}