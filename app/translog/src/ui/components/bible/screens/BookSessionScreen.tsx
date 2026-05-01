import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Lock,
  MessageCircle,
  MessageSquarePlus,
  MessagesSquare,
  X,
} from "lucide-react";
import { UsfmReadonlyView, type UsjDocument } from "@usfm-tools/usfm-readonly-react";
import "@usfm-tools/usfm-readonly-react/styles.css";
import { ScreenHeader } from "../parts/ScreenHeader";
import { FloatingButton } from "../parts/FloatingButton";
import { ChapterPickerModal } from "../parts/ChapterPickerModal";

export interface SessionEntry {
  fragment: string;
  comments: number;
  /** ISO date string of when the review was created. */
  date?: string;
}
export type SessionMap = Record<number, Record<number, SessionEntry[]>>;

interface BookSessionScreenProps {
  bookTitle?: string;
  /**
   * USFM string for the full book. Chapter navigation and available chapters
   * are discovered automatically via the `onReady` callback of `UsfmReadonlyView`.
   */
  usfm?: string;
  sessions?: SessionMap;
  /** Current chapter (controlled). Defaults to the first chapter found in the USFM. */
  currentChapter?: number;
  onChangeChapter?: (n: number) => void;
  /** Called when the user confirms a text selection to comment on. Includes chapter + verse for a full scripture reference. */
  onCommentSelection?: (data: { chapter: number; verse: number | null; fragment: string }) => void;
  /** Called when the user confirms saving the session. */
  onSave?: (data: { title: string }) => void;
  /** Pre-filled title in the save modal (e.g. computed by the data layer). */
  suggestedSessionTitle?: string;
  /** External control of the save modal. Omit to let the component manage it. */
  saveModalOpen?: boolean;
  onRequestSave?: () => void;
  onCancelSave?: () => void;
  /** Called when the user taps a review entry in the sessions panel. Includes the full entry so the wrapper does not need to re-look it up. */
  onOpenSession?: (data: { chapter: number; verse: number; index: number; entry: SessionEntry }) => void;
  onBack?: () => void;
  /**
   * When `true` the session is read-only: the "Finalizar" and "Comentar selección"
   * floating buttons are hidden and a "Solo lectura" badge is shown in the header.
   */
  closed?: boolean;
}

export function BookSessionScreen({
  bookTitle = "",
  usfm,
  sessions: sessionsProp = {},
  currentChapter,
  onChangeChapter,
  onCommentSelection,
  onSave,
  suggestedSessionTitle,
  saveModalOpen,
  onRequestSave,
  onCancelSave,
  onOpenSession,
  onBack,
  closed = false,
}: BookSessionScreenProps = {}) {
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
  const [selectedText, setSelectedText] = useState("");
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [sessionsOpen, setSessionsOpen] = useState(false);

  // Ref attached to the scripture scroll container so we can verify the
  // selection is inside the USFM view before updating state.
  const scriptureContainerRef = useRef<HTMLDivElement>(null);

  // Direct selectionchange listener — more reliable than the library's
  // onSelectionChange callback on Android WebView (which can lose the
  // selection after commitExpandedWordTokenSelection removes and re-adds ranges).
  useEffect(() => {
    let clearTimer: ReturnType<typeof setTimeout>;

    const handleSelectionChange = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";

      if (text && scriptureContainerRef.current && sel?.rangeCount) {
        const range = sel.getRangeAt(0);
        // Only react to selections inside the scripture view.
        if (!scriptureContainerRef.current.contains(range.commonAncestorContainer)) return;

        clearTimeout(clearTimer);

        // Walk up from the anchor node to find the nearest data-verse attribute
        // (.usfm-tok spans carry data-verse per the library's DOM contract).
        let verse: number | null = null;
        let el: Element | null =
          sel.anchorNode instanceof Element
            ? sel.anchorNode
            : sel.anchorNode?.parentElement ?? null;
        while (el && scriptureContainerRef.current.contains(el)) {
          const v = el.getAttribute("data-verse");
          if (v) { verse = Number(v); break; }
          el = el.parentElement;
        }

        setSelectedText(text);
        setSelectedVerse(verse);
      } else if (!text) {
        // Debounce the clear to avoid flickering while the user is mid-drag.
        clearTimer = setTimeout(() => {
          setSelectedText("");
          setSelectedVerse(null);
        }, 120);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
      clearTimeout(clearTimer);
    };
  }, []);

  const isSaveControlled = saveModalOpen !== undefined;
  const [internalSaveOpen, setInternalSaveOpen] = useState(false);
  const saveOpen = isSaveControlled ? saveModalOpen : internalSaveOpen;
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

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

  const openSaveModal = () => {
    setTitleDraft(suggestedSessionTitle ?? `${bookTitle} ${chapter}`);
    if (onRequestSave) onRequestSave();
    if (!isSaveControlled) setInternalSaveOpen(true);
  };
  const closeSaveModal = () => {
    if (onCancelSave) onCancelSave();
    if (!isSaveControlled) setInternalSaveOpen(false);
  };
  const confirmSave = () => {
    const title = titleDraft.trim();
    if (!title) return;
    onSave?.({ title });
    if (!isSaveControlled) setInternalSaveOpen(false);
  };

  useEffect(() => {
    if (!saveOpen) {
      setTitleDraft(suggestedSessionTitle ?? `${bookTitle} ${chapter}`);
    }
  }, [suggestedSessionTitle, bookTitle, chapter, saveOpen]);

  useEffect(() => {
    if (saveOpen) {
      const id = window.setTimeout(() => titleInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [saveOpen]);

  // Clear selection when chapter changes
  useEffect(() => {
    setSelectedText("");
    setSelectedVerse(null);
  }, [chapter]);

  const chapterSessions = sessionsProp[chapter] ?? {};
  const sessionVerses = Object.keys(chapterSessions)
    .map(Number)
    .sort((a, b) => a - b);
  const totalSessionEntries = sessionVerses.reduce(
    (sum, v) => sum + chapterSessions[v].length,
    0,
  );

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
          <div className="flex items-center gap-2">
            {closed && (
              <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
                <Lock className="h-3 w-3" />
                Solo lectura
              </span>
            )}
            <button
              type="button"
              onClick={() => setSessionsOpen(true)}
              aria-label={`Ver sesiones (${totalSessionEntries})`}
              className="relative grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
            >
              <MessagesSquare className="h-5 w-5" />
              {totalSessionEntries > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold leading-none text-primary-foreground">
                  {totalSessionEntries}
                </span>
              )}
            </button>
          </div>
        }
      />

      <div ref={scriptureContainerRef} className="flex-1 overflow-y-auto pb-40 pt-2">
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

      {!closed && (
        selectedText ? (
          <FloatingButton
            label="Comentar selección"
            onClick={() => onCommentSelection?.({ chapter, verse: selectedVerse, fragment: selectedText })}
          >
            <MessageSquarePlus className="h-4 w-4" />
          </FloatingButton>
        ) : (
          <FloatingButton label="Finalizar" onClick={openSaveModal}>
            <Check className="h-4 w-4" />
          </FloatingButton>
        )
      )}

      {saveOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-session-title"
          className="absolute inset-0 z-40 flex items-center justify-center px-5"
        >
          <button
            type="button"
            aria-label="Cerrar"
            onClick={closeSaveModal}
            className="absolute inset-0 bg-foreground/40 backdrop-blur-[1px]"
          />
          <form
            onSubmit={(e) => {
              e.preventDefault();
              confirmSave();
            }}
            className="relative w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-xl"
          >
            <h2 id="save-session-title" className="text-base font-semibold text-foreground">
              Finalizar sesión
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Ponle un título para identificarla más tarde.
            </p>
            <label
              htmlFor="session-title-input"
              className="mt-4 block text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Título
            </label>
            <input
              id="session-title-input"
              ref={titleInputRef}
              type="text"
              value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              placeholder={suggestedSessionTitle ?? `${bookTitle} ${chapter}`}
              className="mt-1.5 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground outline-none ring-0 transition-colors focus:border-primary"
            />
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeSaveModal}
                className="rounded-full border border-border bg-card px-4 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!titleDraft.trim()}
                className="rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Finalizar
              </button>
            </div>
          </form>
        </div>
      )}

      {sessionsOpen && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => setSessionsOpen(false)}
          className="fixed inset-0 z-20 bg-foreground/30 backdrop-blur-[1px]"
        />
      )}
      {sessionsOpen && (
      <aside
        className="fixed inset-y-0 right-0 z-30 flex w-[78%] max-w-[320px] flex-col border-l border-border bg-card shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-10">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Sesión actual
            </p>
            <h2 className="truncate text-sm font-semibold text-foreground">
              Comentarios · {bookTitle} {chapter}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
              {totalSessionEntries}
            </span>
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
        <div className="flex-1 overflow-y-auto p-4">
          {sessionVerses.length > 0 ? (
            <ul className="space-y-3">
              {sessionVerses.map((v) => (
                <li
                  key={v}
                  className="rounded-xl border border-border bg-background px-3 py-2.5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-xs font-semibold text-foreground">
                      {bookTitle} {chapter}:{v}
                    </p>
                    <span className="ml-3 shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground">
                      {chapterSessions[v].length}{" "}
                      {chapterSessions[v].length === 1 ? "comentario" : "comentarios"}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {chapterSessions[v].map((r, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => onOpenSession?.({ chapter, verse: v, index: i, entry: r })}
                          aria-label={`Abrir comentario: ${r.fragment} (${r.comments} comentarios)`}
                          className="group flex w-full flex-col gap-1 rounded-lg border-l-2 border-primary/60 bg-muted/40 px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="min-w-0 flex-1 text-xs italic leading-snug text-foreground/80">
                            "{r.fragment}"
                          </span>
                          <div className="flex items-center justify-between gap-2">
                            {r.date && (
                              <span className="text-[0.6rem] text-muted-foreground">
                                {new Date(r.date).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                              </span>
                            )}
                            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-semibold tabular-nums text-primary">
                              <MessageCircle className="h-3 w-3" />
                              {r.comments}
                            </span>
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay comentarios en este capítulo.
            </p>
          )}
        </div>
      </aside>
      )}

      <ChapterPickerModal
        open={pickerOpen}
        current={chapter}
        total={totalChapters}
        available={availableChapters as number[]}
        onSelect={(n) => goToChapter(n)}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
