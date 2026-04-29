import { useState } from "react";
import { saveLanguage } from "../languageRepository";
import { saveBook, getBook, getBooks, getBookCodes, handleImportBook, archiveBook, listBooksByLang } from "../bookRepository";
import { saveSession, listSessionsByBookId, searchSessionsByTitle, createSession, closeSession } from "../sessionRepository";
import { saveComment, listCommentsByReview } from "../commentRepository";
import { saveReview } from "../reviewRepository";
import { getFullExportJSON, exportSessionJSON } from "../exportService";
import { importSessions } from "../importService";
import { getLanguageByCode, searchLanguages } from "../config/languages.js";

export function IndexedDBTest() {
  const [status, setStatus] = useState("");
  const [bookCode, setBookCode] = useState("RUT");
  const [sessionTitle, setSessionTitle] = useState("review_2026");
  const [bookVersion, setBookVersion] = useState("v1");
  const [selectedLangCode, setSelectedLangCode] = useState(
    () => localStorage.getItem('appLang') || 'ha'
  );
  const [searchLang, setSearchLang] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionResults, setSessionResults] = useState([]);
  const [lastSessionId, setLastSessionId] = useState(null);

  const lang = getLanguageByCode(selectedLangCode);
  const langCandidates = searchLanguages(searchLang);

  const handleSearchSessions = async () => {
    const results = await searchSessionsByTitle(sessionSearch);
    setSessionResults(results);
  };

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
    const bookId = `${bookCode}-${selectedLangCode}`;
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

  const handleCreateSession = async () => {
    try {
      await saveLanguage({ code: selectedLangCode, name: lang?.ln });
      await saveBook({ code: bookCode, name: bookCode, langCode: selectedLangCode, version: bookVersion });
      
      const session = await createSession(`${bookCode}-${selectedLangCode}`);
      setLastSessionId(session.id);
      setStatus(`✅ Sesión creada (ID: ${session.id})`);
      console.log("Sesión creada:", session);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const handleCloseSession = async () => {
    try {
      if (!lastSessionId) return setStatus("❌ No hay sesión abierta");
      await closeSession(lastSessionId);
      setStatus(`✅ Sesión cerrada (ID: ${lastSessionId})`);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const handleFillSession = async () => {
    try {
      if (!lastSessionId) return setStatus("❌ No hay sesión abierta");

      const review1 = await saveReview({
        sessionId: lastSessionId,
        text: "Análisis del primer bloque",
        reference: { chapterStart: 1, verseStart: 1, chapterEnd: 1, verseEnd: 5 }
      });
      await saveComment(review1.id, { author: "elias", text: "Este pasaje habla sobre la fidelidad" });
      await saveComment(review1.id, { author: "maria", text: "Nótese el paralelo con Génesis" });

      const review2 = await saveReview({
        sessionId: lastSessionId,
        text: "Análisis del segundo bloque",
        reference: { chapterStart: 1, verseStart: 6, chapterEnd: 1, verseEnd: 10 }
      });
      await saveComment(review2.id, { author: "elias", text: "Cambio de tono aquí" });

      setStatus(`✅ Sesión ${lastSessionId} llenada: 2 reviews, 3 comentarios`);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const handleExportSession = async () => {
    try {
      if (!lastSessionId) return setStatus("❌ No hay sesión activa");
      await exportSessionJSON(lastSessionId);
      setStatus(`✅ Sesión ${lastSessionId} exportada`);
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  const handleImportSession = async () => {
    try {
      return new Promise((resolve, reject) => {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json";
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return reject(new Error("No file selected"));
          const text = await file.text();
          const parsed = JSON.parse(text);
          await importSessions(parsed);
          const count = Array.isArray(parsed) ? parsed.length : 1;
          setStatus(`✅ ${count} sesión(es) importada(s)`);
          resolve();
        };
        input.click();
      });
    } catch (err) {
      setStatus("❌ Error: " + err.message);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Idioma: {lang?.ln || selectedLangCode}</h2>

      <div style={{ margin: "12px 0" }}>
        <input
          type="text"
          placeholder="Buscar idioma..."
          value={searchLang}
          onChange={e => setSearchLang(e.target.value)}
          style={{ width: "240px", padding: "4px" }}
        />
        {searchLang && (
          <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid #ccc", marginTop: "4px", fontSize: "14px" }}>
            {langCandidates.length === 0 && (
              <div style={{ padding: "4px", color: "#888" }}>No encontrado.</div>
            )}
            {langCandidates.slice(0, 50).map(l => (
              <div
                key={l.lc}
                style={{ padding: "4px 8px", cursor: "pointer", background: "#f9f9f9" }}
                onClick={() => { setSelectedLangCode(l.lc); setSearchLang(""); }}
              >
                {l.ln} ({l.lc})
              </div>
            ))}
          </div>
        )}
      </div>

      <h2>Buscar Sesiones</h2>
      <input value={sessionSearch} onChange={e => setSessionSearch(e.target.value)} placeholder="Buscar por título..." />
      <button onClick={handleSearchSessions}>Buscar</button>
      {sessionResults.length > 0 && (
        <ul>
          {sessionResults.map(session => (
            <li key={session.id}><strong>{session.title}</strong> — {session.bookId} — {session.startDate}</li>
          ))}
        </ul>
      )}
      {sessionResults.length === 0 && sessionSearch && <p>No se encontraron sesiones.</p>}

      <h2>Crear / Cerrar Sesión</h2>
      <button onClick={handleCreateSession}>Crear Sesión Vacía</button>
      <button onClick={handleCloseSession} disabled={!lastSessionId}>
        Cerrar Sesión {lastSessionId ? `(ID: ${lastSessionId})` : ""}
      </button>
      <button onClick={handleFillSession} disabled={!lastSessionId}>
        Llenar Sesión con Datos
      </button>

      <h2>Prueba de Múltiples Sesiones</h2>
      <input value={bookCode} onChange={e => setBookCode(e.target.value)} placeholder="Book Code" />
      <input value={sessionTitle} onChange={e => setSessionTitle(e.target.value)} placeholder="Título" />
      <input value={bookVersion} onChange={e => setBookVersion(e.target.value)} placeholder="Versión (ej: v1)" />

      <button onClick={addFullTestData}>Guardar Nueva Sesión</button>
      <button onClick={listAll}>Listar Sesiones</button>
      <button onClick={handleExportJSON}>Exportar JSON</button>
      <button onClick={async () => console.log("Book codes:", await getBookCodes())}>Log Book Codes</button>
      <button onClick={async () => console.log("Book:", await getBook(bookCode, selectedLangCode))}>Log Book</button>
      <button onClick={async () => console.log("Books:", await getBooks())}>Log Books</button>
      <button onClick={async () => console.log("Books by lang:", await listBooksByLang(selectedLangCode))}>List Books by lang</button>
      <button onClick={() => handleImportBook(selectedLangCode, lang?.ln)}>Import USFM book</button>
      <button onClick={handleExportSession} disabled={!lastSessionId}>Exportar Sesión Activa</button>
      <button onClick={handleImportSession}>Importar Sesión desde JSON</button>
      <button onClick={() => archiveBook(bookCode, selectedLangCode)}>Archive book</button>
      <button onClick={() => verifyComments(1)}>Verificar Comentarios</button>

      <p><strong>Estado:</strong> {status}</p>
    </div>
  );
}