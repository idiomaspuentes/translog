import { openDb } from "./db.js";

export async function saveComment(reviewId, comment) {
  const db = await openDb();
  const fullComment = { ...comment, reviewId, date: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("comments", "readwrite");
    const req = tx.objectStore("comments").add(fullComment);
    req.onsuccess = () => resolve({ ...fullComment, id: req.result });
    tx.onerror = () => reject(tx.error);
  });
}

export async function listCommentsByReview(reviewId) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("comments", "readonly");
    const req = tx.objectStore("comments").index("byReview").getAll(reviewId);
    req.onsuccess = () => resolve(req.result);
  });
}