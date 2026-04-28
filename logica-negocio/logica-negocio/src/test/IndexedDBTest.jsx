import { useState } from "react";
import { saveLanguage } from "../languageRepository";
import { saveBook, getBooks, getBook, addBookFromUSFM } from "../bookRepository";
import { saveSession, listSessionsByBookId } from "../sessionRepository";
import { saveComment, listCommentsBySession } from "../commentRepository";
import { getFullExportJSON } from "../exportService";

export function IndexedDBTest() {
  const [status, setStatus] = useState("");
  const [bookCode, setBookCode] = useState("RUT");
  const [sessionTitle, setSessionTitle] = useState("review_2026");
  const [bookVersion, setBookVersion] = useState("v1");

  const addFullTestData = async () => {
    try {
      setStatus("Guardando datos...");
      await saveLanguage({ code: "esp", name: "e_419" });
      await saveBook({ code: bookCode, name: "ruth", langCode: "esp", version: bookVersion });

      const sessionId = Date.now(); 
      const bookId = `${bookCode}-esp`;
      await saveSession({
        id: sessionId,
        title: sessionTitle,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        bookId: bookId
      });

      await saveComment(sessionId, {
        text: "Comentario para " + sessionTitle,
        author: "elias",
        verseKey: "RUT.1.1"
      });

      setStatus(`✅ Guardado: Sesión ${sessionTitle} (ID: ${sessionId})`);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const listAll = async () => {
    const bookId = `${bookCode}-esp`;
    const sessions = await listSessionsByBookId(bookId);
    console.log("Sesiones en " + bookId + ":", sessions);
    setStatus(`Sesiones encontradas: ${sessions.length}. Mira la consola.`);
  };

  // ✅ AQUÍ ESTÁ EL USO DE listCommentsBySession
  const verifyComments = async (sessionId) => {
    try {
      const comments = await listCommentsBySession(sessionId);
      console.log("Comentarios de sesión " + sessionId + ":", comments);
      setStatus(`✅ ${comments.length} comentarios encontrados en sesión ${sessionId}.`);
    } catch (err) {
      setStatus("❌ Error al verificar comentarios: " + err.message);
    }
  };

  const handleExportJSON = async () => {
    try {
      const json = await getFullExportJSON();
      console.log("JSON Final:", JSON.stringify(json, null, 2));
    
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "data_export.json";
      a.click();
      setStatus("✅ JSON exportado correctamente");
    } catch (err) {
      setStatus("❌ Error al exportar: " + err.message);
    }
  };

  const handleImportBook = async () => {
  const response = await fetch("/usfm-3jn.txt");
  const usfmText = await response.text();

  console.log("usfmText.length:", usfmText.length);
  console.log("usfmText (primeros 100 caracteres):", usfmText.slice(0, 100));

  await addBookFromUSFM(usfmText, "esp");
  alert("Libro importado y todo el USFM guardado en content");
};

  return (
    <div style={{ padding: 20 }}>
      <h2>Prueba de Múltiples Sesiones</h2>
      
      <input value={bookCode} onChange={(e) => setBookCode(e.target.value)} placeholder="Book Code" />
      <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Título" />
      <input value={bookVersion} onChange={(e) => setBookVersion(e.target.value)} placeholder="Versión (ej: v1)" />
      
      <button onClick={addFullTestData}>Guardar Nueva Sesión</button>
      <button onClick={listAll}>Listar Sesiones</button>
      <button onClick={handleExportJSON}>Exportar JSON</button>
      <button onClick={async () => console.log("Book codes:", await getBooks())}>
        Log Book Codes
      </button>

      <button onClick={async () => console.log("Book:", await getBook(bookCode, "esp"))}>
        Log Book
      </button>

      <button onClick={handleImportBook}>
        Import Rut USFM
      </button>
      
      {/* Botón de ejemplo para verificar comentarios */}
      <button onClick={() => verifyComments(123456)}>Verificar Comentarios</button>

      <p><strong>Estado:</strong> {status}</p>
    </div>
  );
}