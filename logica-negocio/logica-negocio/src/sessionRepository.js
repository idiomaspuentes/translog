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
    const tx = db.transaction("sessions", "readonly");
    const req = tx.objectStore("sessions").index("byBook").getAll(bookId);
    req.onsuccess = () => resolve(req.result);
  });
}