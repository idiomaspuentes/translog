import { openDb } from "./db.js";

export async function saveLanguage(lang) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("languages", "readwrite");
    tx.objectStore("languages").put(lang);
    tx.oncomplete = () => resolve(lang);
    tx.onerror = () => reject(tx.error);
  });
}