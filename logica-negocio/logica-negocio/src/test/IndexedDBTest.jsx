import { useState } from "react";
import { saveLanguage } from "../languageRepository";
import { saveBook, getBook, getBooks, getBookCodes, handleImportBook, archiveBook } from "../bookRepository";
import { saveSession, listSessionsByBookId } from "../sessionRepository";
import { saveComment, listCommentsByReview } from "../commentRepository";
import { saveReview } from "../reviewRepository";
import { getFullExportJSON } from "../exportService";
import { languages, getLanguageByCode } from "../config/languages.js";

export function IndexedDBTest() {
  const [status, setStatus] = useState("");
  const [bookCode, setBookCode] = useState("RUT");
  const [sessionTitle, setSessionTitle] = useState("review_2026");
  const [bookVersion, setBookVersion] = useState("v1");
  const [selectedLangCode, setSelectedLangCode] = useState("ha");
  const [searchLang, setSearchLang] = useState("");

  const lang = getLanguageByCode(selectedLangCode);

  // Filtra idiomas visibles (solo cuando hay búsqueda)
  const candidates = searchLang
    ? languages.filter(
        lang =>
          lang.ln?.toLowerCase().includes(searchLang.toLowerCase()) ||
          lang.lc?.toLowerCase().includes(searchLang.toLowerCase())
      )
    : [];

  const addFullTestData = async () => {
    try {
      setStatus("Guardando datos...");
      await saveLanguage({ code: selectedLangCode, name: lang?.ln });
      await saveBook({ code: bookCode, name: "ruth", langCode: selectedLangCode, version: bookVersion });

      const sessionId = Date.now();
      await saveSession({
        id: sessionId,
        title: sessionTitle,
        startDate: new Date().toISOString(),
        endDate: new Date().toISOString(),
        bookId: `${bookCode}-${selectedLangCode}`
      });

      const review = await saveReview({
        sessionId: sessionId,
        text: "text",
        reference: {
          chapterStart: 1,
          verseStart: 1,
          chapterEnd: 1,
          verseEnd: 22
        }
      });

      await saveComment(review.id, {
        text: "Comentario para " + sessionTitle,
        author: "elias"
      });

      setStatus(`✅ Guardado: Sesión ${sessionTitle} (ID: ${sessionId})`);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const listAll = async () => {
    const bookId = `${bookCode}-${lang.lc}`;
    const sessions = await listSessionsByBookId(bookId);
    console.log("Sesiones en " + bookId + ":", sessions);
    setStatus(`Sesiones encontradas: ${sessions.length}. Mira la consola.`);
  };

  const verifyComments = async (reviewId) => {
    try {
      const comments = await listCommentsByReview(reviewId);
      console.log("Comentarios de review " + reviewId + ":", comments);
      setStatus(`✅ ${comments.length} comentarios encontrados en review ${reviewId}.`);
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

  return (
    <div style={{ padding: 20 }}>

     <h2>Idioma: {lang?.ln || selectedLangCode}</h2>

      {/* Buscador sencillo (no <select> con miles de opciones) */}
      <div style={{ margin: "12px 0" }}>
        <input
          type="text"
          placeholder="Buscar idioma..."
          value={searchLang}
          onChange={e => setSearchLang(e.target.value)}
          style={{ width: "240px", padding: "4px" }}
        />

        {searchLang && (
          <div
            style={{
              maxHeight: "200px",
              overflowY: "auto",
              border: "1px solid #ccc",
              marginTop: "4px",
              fontSize: "14px",
            }}
          >
            {candidates.length === 0 && (
              <div style={{ padding: "4px", color: "#888" }}>
                No encontrado.
              </div>
            )}
            {candidates.slice(0, 50).map(lang => (
              <div
                key={lang.lc}
                style={{
                  padding: "4px 8px",
                  cursor: "pointer",
                  background: "#f9f9f9",
                }}
                onClick={() => {
                  setSelectedLangCode(lang.lc);
                  setSearchLang(""); // opcional: limpiar tras elegir
                }}
              >
                {lang.ln} ({lang.lc})
              </div>
            ))}
          </div>
        )}
      </div>

      <h2>Prueba de Múltiples Sesiones</h2>
      
      <input value={bookCode} onChange={(e) => setBookCode(e.target.value)} placeholder="Book Code" />
      <input value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} placeholder="Título" />
      <input value={bookVersion} onChange={(e) => setBookVersion(e.target.value)} placeholder="Versión (ej: v1)" />
      
      <button onClick={addFullTestData}>Guardar Nueva Sesión</button>
      <button onClick={listAll}>Listar Sesiones</button>
      <button onClick={handleExportJSON}>Exportar JSON</button>
      <button onClick={async () => console.log("Book codes:", await getBookCodes())}>
        Log Book Codes
      </button>

      <button onClick={async () => console.log("Book:", await getBook(bookCode, selectedLangCode))}>
        Log Book
      </button>

      <button onClick={async () => console.log("Book:", await getBooks())}>
        Log Books
      </button>

      <button onClick={() => handleImportBook(lang.lc, lang.ln)}>
        Import USFM book
      </button>

      <button onClick={() => archiveBook(bookCode, lang.lc)}>
        Archive book (current lang selected)
      </button>
      
      {/* Botón de ejemplo para verificar comentarios */}
      <button onClick={() => verifyComments(1)}>Verificar Comentarios</button>

      <p><strong>Estado:</strong> {status}</p>
    </div>
  );
}