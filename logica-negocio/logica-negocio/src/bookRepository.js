import { openDb } from "./db.js";

export async function saveBook(book) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readwrite");
    tx.objectStore("books").put(book);
    tx.oncomplete = () => resolve(book);
    tx.onerror = () => reject(tx.error);
  });
}

export async function listBooksByLang(langCode) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").index("byLang").getAll(langCode);
    req.onsuccess = () => resolve(req.result);
  });
}