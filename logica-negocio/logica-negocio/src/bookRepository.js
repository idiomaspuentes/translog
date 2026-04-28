import { openDb } from "./db.js";
import { extractBookMetadata } from "./usfmParser.js";

export async function saveBook(book) {
  const db = await openDb();
  const bookWithId = { ...book, id: `${book.code}-${book.langCode}` };
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readwrite");
    tx.objectStore("books").put(bookWithId);
    tx.oncomplete = () => resolve(bookWithId);
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

export async function getBook(bookCode, langCode) {
  const db = await openDb();
  const id = `${bookCode}-${langCode}`;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").get(id);
    req.onsuccess = () => {
      if (!req.result) return reject(new Error(`Book not found: ${id}`));
      resolve(req.result);
    };
  });
}

export async function getBooks() {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").getAll();
    req.onsuccess = () => resolve(req.result.map(b => b.code));
  });
}

export async function addBookFromUSFM(usfmText, langCode) {
  const { code, name } = extractBookMetadata(usfmText);

  if (!code) {
    throw new Error("No se encontró \\id en el archivo USFM");
  }

  const id = `${code}-${langCode}`;
  const book = {
    id,
    code,
    name,
    langCode,
    content: usfmText,
  };

  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readwrite");
    const store = tx.objectStore("books");
    const req = store.put(book);

    req.onsuccess = () => {
      console.log("Libro guardado:", book);
      resolve(book);
    };

    req.onerror = () => {
      console.error("Error al guardar libro:", req.error);
      reject(req.error);
    };
  });
}