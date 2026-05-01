const DB_NAME = "translog";
const DB_VERSION = 8;

export function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(e.target.error);
    request.onsuccess = (e) => resolve(e.target.result);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      if (!db.objectStoreNames.contains("languages")) {
        db.createObjectStore("languages", { keyPath: "code" });
      }

      if (db.objectStoreNames.contains("books")) {
        db.deleteObjectStore("books");
      }
      const books = db.createObjectStore("books", { keyPath: "id" });
      books.createIndex("byLang", "langCode", { unique: false });

      if (db.objectStoreNames.contains("sessions")) {
        db.deleteObjectStore("sessions");
      }
      const sessions = db.createObjectStore("sessions", { keyPath: "id" });
      sessions.createIndex("byBook", "bookId", { unique: false });

      if (db.objectStoreNames.contains("reviews")) {
        db.deleteObjectStore("reviews");
      }
      const reviews = db.createObjectStore("reviews", { keyPath: "id", autoIncrement: true });
      reviews.createIndex("bySession", "sessionId", { unique: false });

      if (db.objectStoreNames.contains("comments")) {
        db.deleteObjectStore("comments");
      }
      const comments = db.createObjectStore("comments", { keyPath: "id", autoIncrement: true });
      comments.createIndex("byReview", "reviewId", { unique: false });
    };
  });
}