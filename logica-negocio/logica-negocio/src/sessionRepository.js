import { openDb } from "./db.js";
import { groupCommentsByVerse } from "./reviewUtils.js";

export async function saveSession(session) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    tx.objectStore("sessions").put(session);
    tx.oncomplete = () => resolve(session);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listSessionsByBookId(bookId) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction(["sessions", "comments"], "readonly");
    const req = tx.objectStore("sessions").index("byBook").getAll(bookId);
    req.onsuccess = () => {
      const sessions = req.result;
      const commentsReq = tx.objectStore("comments").getAll();
      commentsReq.onsuccess = () => {
        const allComments = commentsReq.result;
        const result = sessions.map(session => {
          const sessionComments = allComments.filter(c => c.sessionId === session.id);
          const reviews = groupCommentsByVerse(sessionComments).map(review => ({
            ...review,
            comments: review.comments.length
          }));
          return { ...session, reviews };
        });
        resolve(result);
      };
    };
  });
}