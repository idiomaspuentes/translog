import { openDb } from "./db.js";

function runTransaction(storeName, mode, fn) {
  return openDb().then((db) => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, mode);
      const store = tx.objectStore(storeName);

      tx.oncomplete = () => resolve(null);
      tx.onerror = (event) => reject(event.target.error);
      tx.onabort = (event) => reject(event.target.error);

      fn(store, resolve, reject);
    });
  });
}

export async function saveComment(sessionId, verseKey, content) {
  if (!sessionId || !content) {
    throw new Error("sessionId y content son obligatorios");
  }

  const comment = {
    commentId: undefined,
    sessionId,
    verseKey: verseKey || null,
    content: content.trim(),
    createdAt: Date.now()
  };

  await runTransaction("comments", "readwrite", (store, resolve, reject) => {
    const request = store.add(comment);
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

export async function listCommentsBySession(sessionId) {
  const comments = [];
  await runTransaction("comments", "readonly", (store, resolve, reject) => {
    const index = store.index("bySessionId");
    const request = index.getAll(sessionId);
    request.onsuccess = () => {
      comments.push(...request.result);
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
  return comments;
}