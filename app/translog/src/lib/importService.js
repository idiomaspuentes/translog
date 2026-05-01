import { saveSession } from "./sessionRepository.js";
import { saveReview } from "./reviewRepository.js";
import { saveComment } from "./commentRepository.js";
import { getBook, saveBook } from "./bookRepository.js";
import { Capacitor } from "@capacitor/core";
import { storeAudioBlob } from "./audioBlobCache.js";

async function ensureBookExists(bookId) {
  const [code, langCode] = bookId.split("-");
  try {
    await getBook(code, langCode);
  } catch {
    await saveBook({ code, langCode, name: code, version: "", content: "" });
  }
}

/**
 * @param {object} sessionJSON
 * @param {Record<string, Blob>} audioByFilename  filename → Blob (web only)
 */
async function importSingleSession(sessionJSON, audioByFilename = {}) {
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
      const saved = await saveComment(savedReview.id, {
        author: comment.author,
        text: comment.text,
        date: comment.date,
        type: comment.type,
        name: comment.name,
        path: comment.path,
        audioDurationMs: comment.audioDurationMs,
      });

      // On web: persist the audio blob in audioBlobCache keyed by the new
      // comment ID so it can be played back without a native Filesystem.
      if (!Capacitor.isNativePlatform() && comment.type === 'audio' && comment.name) {
        const blob = audioByFilename[comment.name];
        if (blob) {
          await storeAudioBlob(saved.id, blob);
        }
      }
    }
  }
}

/**
 * @param {unknown[]|unknown} input
 * @param {Record<string, Blob>} audioByFilename  filename → Blob (web only)
 */
export async function importSessions(input, audioByFilename = {}) {
  const sessions = Array.isArray(input) ? input : [input];
  for (const session of sessions) {
    await importSingleSession(session, audioByFilename);
  }
}