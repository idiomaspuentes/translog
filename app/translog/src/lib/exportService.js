import { getAll } from "./config/helperFunctions.js";
import { getSession } from "./sessionRepository.js";

export async function getFullExportJSON() {
  const languages = await getAll("languages");
  const books = await getAll("books");
  const sessions = await getAll("sessions");
  const reviews = await getAll("reviews");
  const comments = await getAll("comments");

  return {
    language: languages.map(lang => ({
      code: lang.code,
      name: lang.name,
      books: books
        .filter(b => b.langCode === lang.code)
        .map(book => ({
          id: book.id,
          code: book.code,
          langCode: book.langCode,
          name: book.name,
          version: book.version || "",
          content: book.content || "",
          sessions: sessions
            .filter(s => s.bookId === book.id)
            .map(session => ({
              id: session.id,
              title: session.title,
              startDate: session.startDate,
              endDate: session.endDate,
              bookId: session.bookId,
              reviews: reviews
              .filter(r => r.sessionId === session.id)
              .map(review => ({
                id: review.id,
                text: review.text,
                reference: review.reference,
                date: review.date,
                comments: comments
                  .filter(c => c.reviewId === review.id)
                  .map(comment => ({
                    id: comment.id,
                    date: comment.date,
                    author: comment.author,
                    text: comment.text,
                    type: comment.type,
                    name: comment.name,
                    path: comment.path,
                    audioDurationMs: comment.audioDurationMs,
                  }))
              }))
            }))
        }))
    }))
  };
}

export async function exportSessionJSON(sessionId) {
  const session = await getSession(sessionId);
  
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `session_${sessionId}.json`;
  a.click();
}