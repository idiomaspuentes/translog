import { useEffect, useRef, useState } from "react";
import { BookOpen, Download, FolderDown, FolderUp, Search, X } from "lucide-react";
import { ScreenHeader } from "../parts/ScreenHeader";
import { SessionRevisionsScreen, type Revision } from "./SessionRevisionsScreen";

export interface Session {
  id: string;
  title: string;
  range: string;
  date: string;
  status: "abierta" | "cerrada";
  revisions: Revision[];
}

const defaultSessions: Session[] = [
  {
    id: "s4",
    title: "Sesión matutina en la comunidad Raudal del Danto",
    range: "Ester 1–2",
    date: "Hoy",
    status: "abierta",
    revisions: [
      { id: "r4-2", title: "Ester 1:1–9", passage: "En los días de Asuero, el rey que reinó desde la India hasta Etiopía sobre ciento veintisiete provincias…", date: "Hoy", comments: 12 },
      { id: "r4-1", title: "Ester 1", passage: "Aconteció en los días de Asuero, aquel que reinó sobre ciento veintisiete provincias desde la India…", date: "Ayer", comments: 8 },
    ],
  },
  {
    id: "s3",
    title: "Taller con ancianos en Puerto Inírida",
    range: "Ester 1",
    date: "12 abr 2026",
    status: "cerrada",
    revisions: [
      { id: "r3-3", title: "Ester 1:10–22", passage: "Al séptimo día, estando el corazón del rey alegre del vino, mandó llamar a la reina Vasti…", date: "12 abr 2026", comments: 28 },
      { id: "r3-2", title: "Ester 1:1–9", passage: "En los días de Asuero, el rey que reinó desde la India hasta Etiopía sobre ciento veintisiete provincias…", date: "11 abr 2026", comments: 14 },
      { id: "r3-1", title: "Ester 1", passage: "Aconteció en los días de Asuero, aquel que reinó sobre ciento veintisiete provincias…", date: "10 abr 2026", comments: 6 },
    ],
  },
  {
    id: "s2",
    title: "Revisión vespertina con el equipo traductor",
    range: "Ester 2",
    date: "3 abr 2026",
    status: "cerrada",
    revisions: [
      { id: "r2-2", title: "Ester 2:1–18", passage: "Pasadas estas cosas, sosegada ya la ira del rey Asuero, se acordó de Vasti y de lo que ella había hecho…", date: "3 abr 2026", comments: 17 },
      { id: "r2-1", title: "Ester 2:1–11", passage: "Pasadas estas cosas, sosegada ya la ira del rey, se acordó de Vasti y de la sentencia contra ella…", date: "2 abr 2026", comments: 9 },
    ],
  },
  {
    id: "s1",
    title: "Primera lectura comunitaria — Caño Bocón",
    range: "Ester 1",
    date: "21 mar 2026",
    status: "cerrada",
    revisions: [
      { id: "r1-1", title: "Ester 1", passage: "Aconteció en los días de Asuero, aquel que reinó sobre ciento veintisiete provincias desde la India…", date: "21 mar 2026", comments: 9 },
    ],
  },
];

interface BookSessionsScreenProps {
  bookTitle?: string;
  sessions?: Session[];
  onBack?: () => void;
  /** Si se pasa, se usa la navegación externa; si no, se abre `SessionRevisionsScreen` en estado interno (modo demo). */
  onOpenSession?: (session: Session) => void;
  onReadBook?: () => void;
  onImportSessions?: () => void;
  onExportAllSessions?: () => void;
  onExportSession?: (session: Session) => void;
  /**
   * Callback de autocompletado. Recibe el query y devuelve las sesiones
   * sugeridas. Si no se provee, se filtra `sessions` localmente por título,
   * rango o fecha.
   */
  onSearchChange?: (query: string) => Session[] | Promise<Session[]>;
}

export function BookSessionsScreen({
  bookTitle = "Ester",
  sessions = defaultSessions,
  onBack,
  onOpenSession,
  onReadBook,
  onImportSessions,
  onExportAllSessions,
  onExportSession,
  onSearchChange,
}: BookSessionsScreenProps = {}) {
  const [demoSession, setDemoSession] = useState<Session | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Session[]>(sessions);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!query) {
        setSuggestions(sessions);
        return;
      }
      if (onSearchChange) {
        const result = await onSearchChange(query);
        if (!cancelled) setSuggestions(result);
      } else {
        const q = query.toLowerCase();
        setSuggestions(
          sessions.filter(
            (s) =>
              s.title.toLowerCase().includes(q) ||
              s.range.toLowerCase().includes(q) ||
              s.date.toLowerCase().includes(q),
          ),
        );
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query, sessions, onSearchChange]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  // Modo demo: si el padre no controla la navegación, mantenemos
  // el estado interno para poder mostrarlo en Storybook.
  if (!onOpenSession && demoSession) {
    return (
      <SessionRevisionsScreen
        session={demoSession}
        onBack={() => setDemoSession(null)}
      />
    );
  }

  const handleOpen = (s: Session) => {
    if (onOpenSession) onOpenSession(s);
    else setDemoSession(s);
  };

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={bookTitle}
        subtitle="Sesiones del libro"
        showBack
        onBack={onBack}
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar sesión"}
              onClick={toggleSearch}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label="Importar sesiones"
              onClick={onImportSessions}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
            >
              <FolderUp className="h-5 w-5" />
            </button>
            <button
              type="button"
              aria-label="Exportar todas las sesiones"
              onClick={onExportAllSessions}
              className="grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
            >
              <FolderDown className="h-5 w-5" />
            </button>
          </div>
        }
      />
      {searchOpen && (
        <div className="border-b border-border/60 px-5 pb-3">
          <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar sesión..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-5 pb-24">
        <button
          type="button"
          onClick={onReadBook}
          className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <BookOpen className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground">Leer libro</p>
            <p className="text-xs text-muted-foreground">Lectura libre, sin revisión</p>
          </div>
        </button>

        <p className="px-1 pt-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Sesiones
        </p>

        {suggestions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin resultados
          </p>
        ) : (
          suggestions.map((s) => (
            <div
              key={s.id}
              className="flex w-full items-center gap-2 rounded-2xl border border-border bg-card px-3 py-3 transition-colors hover:bg-accent/40"
            >
              <button
                type="button"
                onClick={() => handleOpen(s)}
                className="flex min-w-0 flex-1 flex-col gap-1 px-1 text-left"
              >
                <p className="text-sm font-medium leading-snug text-foreground">
                  {s.title}
                </p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span
                    className={
                      s.status === "abierta"
                        ? "rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-primary"
                        : "rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-muted-foreground"
                    }
                  >
                    {s.status}
                  </span>
                  <span className="truncate">
                    {s.range} · {s.date} · {s.revisions.length} rev.
                  </span>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Exportar ${s.title}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onExportSession?.(s);
                }}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Download className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
