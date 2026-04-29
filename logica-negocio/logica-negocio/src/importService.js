import { saveSession } from "./sessionRepository.js";
import { saveReview } from "./reviewRepository.js";
import { saveComment } from "./commentRepository.js";
import { getBook, saveBook } from "./bookRepository.js";

async function ensureBookExists(bookId) {
  const [code, langCode] = bookId.split("-");
  try {
    await getBook(code, langCode);
  } catch {
    await saveBook({ code, langCode, name: code, version: "", content: "" });
  }
}

async function importSingleSession(sessionJSON) {
  await ensureBookExists(sessionJSON.bookId);

  await saveSession({
    id: sessionJSON.id,
    bookId: sessionJSON.bookId,
    title: sessionJSON.title,
    startDate: sessionJSON.startDate,
    endDate: sessionJSON.endDate
  });

  for (const review of sessionJSON.reviews) {
    const savedReview = await saveReview({
      sessionId: sessionJSON.id,
      text: review.text,
      reference: review.reference,
      date: review.date
    });

    for (const comment of review.comments) {
      await saveComment(savedReview.id, {
        author: comment.author,
        text: comment.text,
        date: comment.date
      });
    }
  }
}

export async function importSessions(input) {
  const sessions = Array.isArray(input) ? input : [input];
  for (const session of sessions) {
    await importSingleSession(session);
  }
}