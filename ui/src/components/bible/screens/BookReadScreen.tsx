import { useEffect, useState } from "react";
import {
  Play,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  LayoutList,
  Download,
  FolderDown,
  X,
} from "lucide-react";
import { UsfmReadonlyView, type UsjDocument } from "@usfm-tools/usfm-readonly-react";
import "@usfm-tools/usfm-readonly-react/styles.css";
import { ScreenHeader } from "../parts/ScreenHeader";
import { FloatingButton } from "../parts/FloatingButton";
import { ChapterPickerModal } from "../parts/ChapterPickerModal";
export interface Session {
  /** Matches app Session.id (timestamp-based number). */
  id: number;
  /** Matches app Session.bookId. */
  bookId: string;
  /** ISO date string — matches app Session.startDate. */
  startDate: string;
  // UI-derived fields computed by the wrapper:
  title?: string;
  range?: string;
  status?: "abierta" | "cerrada";
  /** Total number of reviews in this session (session.reviews.length). */
  reviewCount?: number;
}

interface BookReadScreenProps {
  bookTitle?: string;
  /**
   * USFM string for the full book. Chapter navigation is discovered
   * automatically via the `onReady` callback of `UsfmReadonlyView`.
   */
  usfm?: string;
  /** Current chapter (controlled). Defaults to the first chapter found in the USFM. */
  currentChapter?: number;
  onChangeChapter?: (n: number) => void;
  /** Called when the user presses "Iniciar sesión". Includes the chapter currently visible. */
  onStartSession?: (data: { chapter: number }) => void;
  onBack?: () => void;
  sessions?: Session[];
  onOpenSession?: (session: Session) => void;
  onExportSession?: (session: Session) => void;
  onExportAllSessions?: () => void;
}

export function BookReadScreen({
  bookTitle = "",
  usfm,
  currentChapter,
  onChangeChapter,
  onStartSession,
  onBack,
  sessions = [],
  onOpenSession,
  onExportSession,
  onExportAllSessions,
}: BookReadScreenProps = {}) {
  const isControlled = currentChapter !== undefined;
  const [internalChapter, setInternalChapter] = useState(1);
  const chapter = isControlled ? currentChapter : internalChapter;

  const [cachedUsj, setCachedUsj] = useState<UsjDocument | null>(null);
  const [availableChapters, setAvailableChapters] = useState<readonly number[]>([]);

  // Reset document cache whenever the USFM source changes (different book).
  useEffect(() => {
    setCachedUsj(null);
    setAvailableChapters([]);
  }, [usfm]);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  const totalChapters =
    availableChapters.length > 0 ? availableChapters[availableChapters.length - 1] : 0;
  const chapterIdx = availableChapters.indexOf(chapter);
  const isFirst = chapterIdx <= 0;
  const isLast = chapterIdx >= availableChapters.length - 1;

  const goToChapter = (n: number) => {
    if (onChangeChapter) onChangeChapter(n);
    if (!isControlled) setInternalChapter(n);
  };

  const go = (delta: number) => {
    const next = chapterIdx + delta;
    if (next >= 0 && next < availableChapters.length) goToChapter(availableChapters[next]);
  };

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={availableChapters.length > 0 ? `${bookTitle} ${chapter}` : bookTitle}
        subtitle={
          availableChapters.length > 0 ? `Capítulo ${chapter} de ${totalChapters}` : undefined
        }
        showBack
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={() => setSessionsOpen(true)}
            aria-label={`Ver sesiones del libro (${sessions.length})`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
          >
            <LayoutList className="h-5 w-5" />
            {sessions.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold leading-none text-primary-foreground">
                {sessions.length}
              </span>
            )}
          </button>
        }
      />

      <div className="flex-1 overflow-y-auto pb-40 pt-2">
        <UsfmReadonlyView
          usfm={cachedUsj ? undefined : usfm}
          usj={cachedUsj ?? undefined}
          chapter={chapter}
          stripAlignment
          className="px-5"
          aria-label={`${bookTitle} capítulo ${chapter}`}
          onReady={({ usj, chapters }) => {
            // Guard: only initialize once per document. onReady fires a second
            // time when we swap from the `usfm` prop to the cached `usj` prop,
            // which would otherwise reset the current chapter mid-navigation.
            if (cachedUsj) return;
            // Chapter 0 is the USFM book preamble (markers before \c 1); skip it.
            const numbered = chapters.filter((c) => c > 0);
            setCachedUsj(usj);
            setAvailableChapters(numbered);
            if (!isControlled) setInternalChapter(numbered[0] ?? 1);
          }}
        />
      </div>

      <nav
        aria-label="Navegación de capítulos"
        className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 border-t border-border bg-card/95 px-5 py-3 backdrop-blur"
      >
        <button
          onClick={() => go(-1)}
          disabled={isFirst}
          aria-label="Capítulo anterior"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          disabled={availableChapters.length === 0}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2.5 text-xs font-semibold tabular-nums text-foreground transition-colors hover:bg-accent disabled:opacity-40"
          aria-label="Seleccionar capítulo"
        >
          {chapter}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={isLast}
          aria-label="Capítulo siguiente"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>

      <FloatingButton label="Iniciar sesión" onClick={() => onStartSession?.({ chapter })}>
        <Play className="h-4 w-4" />
      </FloatingButton>

      <ChapterPickerModal
        open={pickerOpen}
        current={chapter}
        total={totalChapters}
        available={availableChapters as number[]}
        onSelect={(n) => goToChapter(n)}
        onClose={() => setPickerOpen(false)}
      />

      {sessionsOpen && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => setSessionsOpen(false)}
          className="absolute inset-0 z-20 bg-foreground/30 backdrop-blur-[1px]"
        />
      )}

      <aside
        aria-hidden={!sessionsOpen}
        className={`absolute inset-y-0 right-0 z-30 flex w-[78%] max-w-[320px] flex-col border-l border-border bg-card shadow-xl transition-transform duration-200 ${
          sessionsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-10">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              {bookTitle}
            </p>
            <h2 className="truncate text-sm font-semibold text-foreground">Sesiones del libro</h2>
          </div>
          <div className="flex items-center gap-1">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
              {sessions.length}
            </span>
            <button
              type="button"
              onClick={onExportAllSessions}
              aria-label="Exportar todas las sesiones"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <FolderDown className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSessionsOpen(false)}
              aria-label="Cerrar"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto p-4">
          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Sin sesiones registradas.
            </p>
          ) : (
            sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-3"
              >
                <button
                  type="button"
                  onClick={() => onOpenSession?.(s)}
                  className="flex min-w-0 flex-1 flex-col gap-1 text-left"
                >
                  <p className="text-xs font-medium leading-snug text-foreground">{s.title}</p>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span
                      className={
                        s.status === "abierta"
                          ? "rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-primary"
                          : "rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-muted-foreground"
                      }
                    >
                      {s.status}
                    </span>
                    <span className="truncate text-[0.65rem] text-muted-foreground">
                      {[s.range, s.reviewCount != null ? `${s.reviewCount} rev.` : null]
                        .filter(Boolean)
                        .join(" · ")}
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
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
