import { openDb } from "./db.js";

export async function getSession(sessionId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(["sessions", "reviews", "comments"], "readonly");
    const req = tx.objectStore("sessions").get(sessionId);
    req.onsuccess = () => {
      if (!req.result) return reject(new Error(`Session not found: ${sessionId}`));
      const session = req.result;
      const reviewsReq = tx.objectStore("reviews").index("bySession").getAll(sessionId);
      reviewsReq.onsuccess = () => {
        const allReviews = reviewsReq.result;
        const commentsReq = tx.objectStore("comments").getAll();
        commentsReq.onsuccess = () => {
          const allComments = commentsReq.result;
          const reviews = allReviews.map(review => ({
            id: review.id,
            text: review.text,
            reference: review.reference,
            date: review.date ?? review.startDate,
            comments: allComments
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
          }));
          resolve({ ...session, reviews });
        };
      };
    };
    tx.onerror = () => reject(tx.error);
  });
}

export async function createSession(bookId) {
  const db = await openDb();
  const session = {
    id: Date.now(),
    bookId,
    startDate: new Date().toISOString(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    tx.objectStore("sessions").put(session);
    tx.oncomplete = () => resolve(session);
    tx.onerror = () => reject(tx.error);
  });
}

export async function closeSession(sessionId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.get(sessionId);
    req.onsuccess = () => {
      const session = req.result;
      if (!session) return reject(new Error(`Session not found: ${sessionId}`));
      store.put({ ...session, endDate: new Date().toISOString() });
    };
    tx.oncomplete = () => resolve(sessionId);
    tx.onerror = () => reject(tx.error);
  });
}

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
              date: review.date ?? review.startDate,
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

export async function searchSessionsByTitle(query) {
  const db = await openDb();
  const q = query.toLowerCase().trim();
  return new Promise((resolve) => {
    const tx = db.transaction("sessions", "readonly");
    const req = tx.objectStore("sessions").getAll();
    req.onsuccess = () => resolve(
      req.result.filter(session =>
        session.title?.toLowerCase().includes(q)
      )
    );
  });
}