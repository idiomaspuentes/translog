import { openDb } from "./db.js";

export async function saveReview(review) {
  const db = await openDb();
  const fullReview = { ...review, date: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("reviews", "readwrite");
    const req = tx.objectStore("reviews").add(fullReview);
    req.onsuccess = () => resolve({ ...fullReview, id: req.result });
    tx.onerror = () => reject(tx.error);
  });
}

export async function listReviewsBySession(sessionId) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("reviews", "readonly");
    const req = tx.objectStore("reviews").index("bySession").getAll(sessionId);
    req.onsuccess = () => resolve(req.result.map(review => ({
      id: review.id,
      text: review.text,
      reference: review.reference,
      date: review.date
    })));
  });
}

export async function getReview(reviewId) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("reviews", "readonly");
    const req = tx.objectStore("reviews").get(reviewId);
    req.onsuccess = () => {
      if (!req.result) return reject(new Error(`Review not found: ${reviewId}`));
      resolve(req.result);
    };
  });
}