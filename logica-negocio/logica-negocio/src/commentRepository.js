import { openDb } from "./db.js";

export async function saveComment(sessionId, comment) {
  const db = await openDb();
  const fullComment = { ...comment, sessionId, date: new Date().toISOString() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("comments", "readwrite");
    tx.objectStore("comments").add(fullComment);
    tx.oncomplete = () => resolve(fullComment);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listCommentsBySession(sessionId) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("comments", "readonly");
    const req = tx.objectStore("comments").index("bySession").getAll(sessionId);
    req.onsuccess = () => resolve(req.result);
  });
}