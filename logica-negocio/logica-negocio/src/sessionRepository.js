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

function validateSession(session) {
  if (!session.bookId || typeof session.bookId !== "string" || !session.bookId.trim()) {
    return new Error("bookId debe ser string no vacío");
  }
  if (!session.bookLabel || typeof session.bookLabel !== "string" || !session.bookLabel.trim()) {
    return new Error("bookLabel debe ser string no vacío");
  }
  if (session.language && (typeof session.language !== "string" || !session.language.trim())) {
    return new Error("language, si viene, debe ser string no vacío");
  }

  session.bookId = session.bookId.trim();
  session.bookLabel = session.bookLabel.trim();
  if (session.language) session.language = session.language.trim();
  if (session.sessionLabel != null) session.sessionLabel = session.sessionLabel.trim() || "";

  return null;
}

export async function listSessions() {
  const sessions = [];
  await runTransaction("sessions", "readonly", (store, resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      sessions.push(...request.result);
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
  return sessions;
}

export async function getSession(sessionId) {
  if (!sessionId) throw new Error("sessionId es obligatorio");

  let session = null;
  await runTransaction("sessions", "readonly", (store, resolve, reject) => {
    const request = store.get(sessionId);
    request.onsuccess = () => {
      session = request.result || null;
      resolve();
    };
    request.onerror = (event) => reject(event.target.error);
  });
  return session;
}

export async function saveSession(session) {
  const validationError = validateSession(session);
  if (validationError) throw validationError;

  if (!session.sessionId) {
    session.sessionId = "s_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }
  if (!session.createdAt) session.createdAt = Date.now();

  await runTransaction("sessions", "readwrite", (store, resolve, reject) => {
    const request = store.put(session);
    request.onsuccess = () => resolve();
    request.onerror = (event) => reject(event.target.error);
  });

  return session.sessionId;
}