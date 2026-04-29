import { openDb } from "./db.js";
import { extractBookMetadata } from "./usfmParser.js";
import { saveLanguage } from "./languageRepository.js";
import { getAll } from "./config/helperFunctions.js";

export async function saveBook(book) {
  const db = await openDb();
  const bookWithId = { ...book, id: `${book.code}-${book.langCode}`, active: true };
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
      if (req.result.active === false) return reject(new Error(`Book is archived: ${id}`));
      resolve(req.result);
    };
  });
}

export async function getBooks() {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").getAll();
    req.onsuccess = () => resolve(req.result
        .filter(book => book.active !== false)
        .map(book => {
        const bookCopy = { ...book };
        delete bookCopy.content;
        return bookCopy;
    }));
  });
}

export async function getBookCodes() {
  const db = await openDb();
  return new Promise((resolve) => {
    const tx = db.transaction("books", "readonly");
    const req = tx.objectStore("books").getAll();
    req.onsuccess = () => resolve(req.result
      .filter(b => b.active !== false)
      .map(b => b.code));
  });
}

async function addBookFromUSFM(usfmText, langCode) {
  const { code, name } = extractBookMetadata(usfmText);

  if (!code) {
    throw new Error("No se encontró \\id en el archivo USFM");
  }

  const id = `${code}-${langCode}`;
  const bookId = `${code}-${langCode}`;
  const book = {
    id,
    bookId,
    code,
    name,
    langCode,
    content: usfmText,
    active: true
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

async function requestUsfmFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".txt,.usfm";
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return reject(new Error("No file selected"));
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    };
    input.click();
  });
}

export async function handleImportBook(langCode, langName) {
  await saveLanguage({ code: langCode, name: langName });

  const usfmText = await requestUsfmFile();

  await addBookFromUSFM(usfmText, langCode);

  const books = await getAll("books");
  console.log("books (después de importar):", books);

  alert("Libro importado y todo el USFM guardado en content");
};

export async function archiveBook(bookCode, langCode) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("books", "readwrite");
    const store = tx.objectStore("books");
    const req = store.get(`${bookCode}-${langCode}`);
    req.onsuccess = () => {
      const book = req.result;
      if (!book) return reject(new Error(`Book not found: ${bookCode}-${langCode}`));
      store.put({ ...book, active: false });
    };
    tx.oncomplete = () => resolve(`${bookCode}-${langCode}`);
    tx.onerror = () => reject(tx.error);
  });
}