import { openDb } from "./db.js";

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
    const tx = db.transaction(["sessions", "reviews", "comments"], "readonly");
    const req = tx.objectStore("sessions").index("byBook").getAll(bookId);
    req.onsuccess = () => {
      const sessions = req.result;
      const reviewsReq = tx.objectStore("reviews").getAll();
      reviewsReq.onsuccess = () => {
        const allReviews = reviewsReq.result;
        const commentsReq = tx.objectStore("comments").getAll();
        commentsReq.onsuccess = () => {
          const allComments = commentsReq.result;
          const result = sessions.map(session => {
            const reviews = allReviews
            .filter(r => r.sessionId === session.id)
            .map(review => ({
              id: review.id,
              text: review.text,
              reference: review.reference,
              date: review.date,
              comments: allComments.filter(c => c.reviewId === review.id).length
            }));
            return { ...session, reviews };
          });
          resolve(result);
        };
      };
    };
  });
}