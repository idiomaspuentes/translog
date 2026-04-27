const DB_NAME = "translog";
const DB_VERSION = 2; // CONTRACT_VERSION = 2
let db = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject(new Error(`Error abriendo base de datos: ${event.target.error}`));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains("sessions")) {
        const store = db.createObjectStore("sessions", {
            keyPath: "sessionId",
          });
        store.createIndex("byBookId", "bookId", { unique: false });
      }

      if (!db.objectStoreNames.contains("comments")) {
        const store = db.createObjectStore("comments", {
          keyPath: "commentId",
          autoIncrement: true
        });
        store.createIndex("bySessionId", "sessionId", { unique: false });
      }
    };
  });
}

export { openDb };