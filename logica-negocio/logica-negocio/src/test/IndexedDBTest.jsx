import { useState } from "react";
import { listCommentsBySession } from "../commentRepository.js";
import { buildSessionZipBlob, toZipBasename } from "../zipService.js";

function openDb() {
  const DB_NAME = "translog";
  const DB_VERSION = 1;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("❌ Error abriendo IndexedDB:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      console.log("✅ Base de datos abierta:", DB_NAME);
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
        const db = event.target.result;

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

async function saveSession(session) {
  const db = await openDb();

  const tx = db.transaction("sessions", "readwrite");
  const store = tx.objectStore("sessions");

  return new Promise((resolve, reject) => {
    const request = store.put(session);
    request.onsuccess = () => {
      console.log("✅ Sesión guardada en IndexedDB:", session);
      resolve(session);
    };
    request.onerror = (event) => {
      console.error("❌ Error al guardar:", event.target.error);
      reject(event.target.error);
    };
  });
}

async function listSessions() {
  const db = await openDb();

  const tx = db.transaction("sessions", "readonly");
  const store = tx.objectStore("sessions");

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      console.log("📋 Sesiones en IndexedDB:", request.result);
      resolve(request.result);
    };
    request.onerror = (event) => {
      console.error("❌ Error al leer sesiones:", event.target.error);
      reject(event.target.error);
    };
  });
}

function deleteDb() {
  const DB_NAME = "translog";
  const request = indexedDB.deleteDatabase(DB_NAME);

  request.onsuccess = () => {
    console.log("🗑️ Base de datos borrada:", DB_NAME);
  };

  request.onerror = (event) => {
    console.error("❌ Error al borrar DB:", event.target.error);
  };

  request.onblocked = (event) => {
    console.warn("⚠️ No se pudo borrar: hay conexión abierta.", event);
  };
}

export function IndexedDBTest() {
  const [sessions, setSessions] = useState([]);
  const [status, setStatus] = useState("");
  const [bookId, setBookId] = useState("");
  const [bookLabel, setBookLabel] = useState("");
  const [sessionLabel, setSessionLabel] = useState("");
  const [verseKey, setVerseKey] = useState("");
  const [commentContent, setCommentContent] = useState("");

  const handleSave = async () => {
    if (!bookId || !bookLabel) {
      setStatus("❌ bookId y bookLabel son obligatorios.");
      return;
    }

    const sessionId = `sesion-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

    const session = {
      sessionId,
      bookId: bookId.trim(),
      bookLabel: bookLabel.trim(),
      sessionLabel: sessionLabel.trim() || "", // opcional; si está vacío, se guarda como ''
      createdAt: Date.now(),
    };

    setStatus("Guardando sesión...");
    try {
      await saveSession(session);
      setStatus("✅ Sesión guardada en IndexedDB.");
      // Opcional: limpiar inputs
      setBookId("");
      setBookLabel("");
      setSessionLabel("");
    } catch (error) {
      setStatus(`❌ Error al guardar sesión: ${error}`);
    }
  };

  const handleRead = async () => {
    setStatus("Leyendo sesiones...");
    try {
      const s = await listSessions();
      setSessions(s);
      setStatus(`✅ ${s.length} sesiones cargadas.`);
    } catch (error) {
      setStatus(`❌ Error al leer sesiones: ${error}`);
    }
  };

  const handleExport = async () => {

    const testSession = {
      bookId: "libro-prueba",
      bookLabel: "Libro de prueba",
      language: "es",
      sessionId: "prueba-001",
      createdAt: Date.now()
    };
    
    try {
        const comments = await listCommentsBySession("prueba-001");
        const blob = await buildSessionZipBlob(testSession, comments);
        const filename = toZipBasename(testSession) + ".zip";

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("❌ Error al exportar ZIP:", error);
    }
  }; 

  const handleDelete = () => {
    deleteDb();
    setStatus("🗑️ Base borrada (recarga la página para reconstruir).");
    setSessions([]);
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", margin: "20px 0" }}>
      <h2>Prueba IndexedDB – Sesiones con inputs</h2>

      <p>
        <strong>Estado:</strong> {status}
      </p>

      <div style={{ margin: "10px 0" }}>
        <label>
          bookId (obligatorio):{" "}
          <input
            type="text"
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            style={{ width: 200 }}
          />
        </label>
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>
          bookLabel (obligatorio):{" "}
          <input
            type="text"
            value={bookLabel}
            onChange={(e) => setBookLabel(e.target.value)}
            style={{ width: 200 }}
          />
        </label>
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>
          sessionLabel (opcional):{" "}
          <input
            type="text"
            value={sessionLabel}
            onChange={(e) => setSessionLabel(e.target.value)}
            style={{ width: 200 }}
          />
        </label>
      </div>

      <div style={{ margin: "10px 0" }}>
        <label>
            verseKey (ej. MAT.1.23):{" "}
            <input
            type="text"
            value={verseKey}
            onChange={(e) => setVerseKey(e.target.value)}
            style={{ width: 200 }}
            />
        </label>
    </div>

    <div style={{ margin: "10px 0" }}>
        <label>
            Comentario (text):{" "}
            <input
            type="text"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            style={{ width: 300 }}
            />
        </label>
    </div>

      <div style={{ margin: "10px 0" }}>
        <button onClick={handleSave} style={{ marginRight: 10 }}>
          GUARDAR SESIÓN
        </button>

        <button onClick={handleRead} style={{ marginRight: 10 }}>
          LEER SESIONES
        </button>

        <button onClick={handleExport} style={{ marginLeft: 10 }}>
            EXPORTAR ACTA .ZIP
        </button>

        <button onClick={handleDelete} style={{ marginLeft: 10, color: "red" }}>
          BORRAR BASE (dev)
        </button>
      </div>

      {sessions.length > 0 && (
        <div style={{ marginTop: 20 }}>
          <h3>Sesiones guardadas:</h3>
          <ul>
            {sessions.map((s) => (
              <li key={s.sessionId}>
                <strong>{s.bookLabel}</strong> ({s.bookId}) —{" "}
                {s.sessionLabel ? `"${s.sessionLabel}"` : "sin label"} —{" "}
                {new Date(s.createdAt).toLocaleString()}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}