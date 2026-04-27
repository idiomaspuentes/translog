import { useState } from "react";
import { saveLanguage } from "../languageRepository";
import { saveBook } from "../bookRepository";
import { saveSession, listSessionsByBook } from "../sessionRepository";
import { saveComment, listCommentsBySession } from "../commentRepository";
import { getFullExportJSON } from "../exportService";

export function IndexedDBTest() {
  const [status, setStatus] = useState("");
  const [bookCode, setBookCode] = useState("RUT");
  const [sessionTitle, setSessionTitle] = useState("review_2026");

  const addFullTestData = async () => {
    try {
      setStatus("Guardando datos...");
      await saveLanguage({ code: "esp", name: "e_419" });
      await saveBook({ code: bookCode, name: "ruth", langCode: "esp" });

      const sessionId = Date.now(); 
      await saveSession({
        id: sessionId,
        title: sessionTitle,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        bookCode: bookCode
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
    const sessions = await listSessionsByBook(bookCode);
    console.log("Sesiones en " + bookCode + ":", sessions);
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
    
      // Descargar como archivo
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

  return (
    <div style={{ padding: 20 }}>
      <h2>Prueba de Múltiples Sesiones</h2>
      
      <input value={bookCode} onChange={(e) => setBookCode(e.target.value)} placeholder="Book Code" />
      <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Título" />
      
      <button onClick={addFullTestData}>Guardar Nueva Sesión</button>
      <button onClick={listAll}>Listar Sesiones</button>
      <button onClick={handleExportJSON}>Exportar JSON</button>
      
      {/* Botón de ejemplo para verificar comentarios */}
      <button onClick={() => verifyComments(123456)}>Verificar Comentarios</button>

      <p><strong>Estado:</strong> {status}</p>
    </div>
  );
}