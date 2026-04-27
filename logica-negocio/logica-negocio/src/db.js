const DB_NAME = "translog";
const DB_VERSION = 4;

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("languages")) db.createObjectStore("languages", { keyPath: "code" });
      if (!db.objectStoreNames.contains("books")) {
        const s = db.createObjectStore("books", { keyPath: "code" });
        s.createIndex("byLang", "langCode", { unique: false });
      }
      if (!db.objectStoreNames.contains("sessions")) {
        const s = db.createObjectStore("sessions", { keyPath: "id" });
        s.createIndex("byBook", "bookCode", { unique: false });
      }
      if (!db.objectStoreNames.contains("comments")) {
        const s = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
        s.createIndex("bySession", "sessionId", { unique: false });
      }
    };
  });
}