import { openDb } from "../db.js";

export async function getAll(storeName) {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction(storeName, "readonly");
    const req = tx.objectStore(storeName).getAll();
    req.onsuccess = () => resolve(req.result);
  });
}