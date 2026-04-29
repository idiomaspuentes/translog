import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MessageCircle,
  MessageSquarePlus,
  MessagesSquare,
  X,
} from "lucide-react";
import { ScreenHeader } from "../parts/ScreenHeader";
import { VerseBlock } from "../parts/VerseBlock";
import { FloatingButton } from "../parts/FloatingButton";
import { ChapterPickerModal } from "../parts/ChapterPickerModal";

export interface Chapter {
  n: number;
  title: string;
  verses: { n: number; text: string }[];
}

const defaultChapters: Chapter[] = [
  {
    n: 1,
    title: "La reina Vasti desafía a Asuero",
    verses: [
      {
        n: 1,
        text:
          "Aconteció en los días de Asuero, el Asuero que reinó desde la India hasta Etiopía sobre ciento veintisiete provincias,",
      },
      {
        n: 2,
        text:
          "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino,",
      },
      {
        n: 3,
        text:
          "en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media.",
      },
      {
        n: 4,
        text:
          "Y mostró las riquezas de la gloria de su reino, y el brillo y la magnificencia de su poder, por muchos días, ciento ochenta días.",
      },
    ],
  },
  {
    n: 2,
    title: "Ester es proclamada reina",
    verses: [
      {
        n: 1,
        text:
          "Pasadas estas cosas, sosegada ya la ira del rey Asuero, se acordó de Vasti y de lo que ella había hecho, y de la sentencia contra ella.",
      },
      {
        n: 2,
        text:
          "Y dijeron los criados del rey, sus cortesanos: Busquen para el rey jóvenes vírgenes de buen parecer;",
      },
      {
        n: 3,
        text:
          "y ponga el rey personas en todas las provincias de su reino, que lleven a todas las jóvenes vírgenes de buen parecer a Susa.",
      },
    ],
  },
  {
    n: 3,
    title: "Amán trama destruir a los judíos",
    verses: [
      {
        n: 1,
        text:
          "Después de estas cosas el rey Asuero engrandeció a Amán hijo de Hamedata agagueo, y lo honró,",
      },
      {
        n: 2,
        text:
          "y todos los siervos del rey que estaban a la puerta del rey se arrodillaban y se inclinaban ante Amán, porque así lo había mandado el rey.",
      },
    ],
  },
];

const DEFAULT_TOTAL_CHAPTERS = 10;

// Revisiones del capítulo actual en la sesión activa (mock)
// chapterN -> verseN -> lista de fragmentos revisados
export interface ReviewEntry {
  fragment: string;
  comments: number;
}
export type ReviewMap = Record<number, Record<number, ReviewEntry[]>>;

const defaultSessionReviews: ReviewMap = {
  1: {
    1: [
      { fragment: "en los días de Asuero", comments: 3 },
      { fragment: "ciento veintisiete provincias", comments: 1 },
    ],
    3: [
      {
        fragment: "hizo banquete a todos sus príncipes y cortesanos",
        comments: 5,
      },
    ],
    4: [
      { fragment: "las riquezas de la gloria de su reino", comments: 2 },
      { fragment: "el brillo y la magnificencia de su poder", comments: 0 },
      { fragment: "ciento ochenta días", comments: 4 },
    ],
  },
  2: {
    2: [
      {
        fragment: "Busquen para el rey jóvenes vírgenes de buen parecer",
        comments: 2,
      },
    ],
  },
  3: {},
};

interface ChapterReviewScreenProps {
  bookTitle?: string;
  chapters?: Chapter[];
  totalChapters?: number;
  reviews?: ReviewMap;
  /** Capítulo activo (controlado). Si se omite, se gestiona estado interno. */
  currentChapter?: number;
  onChangeChapter?: (n: number) => void;
  onCommentSelection?: (data: { verse: number | null; fragment: string }) => void;
  /**
   * Llamado cuando el usuario confirma el guardado de la sesión.
   * Recibe el título introducido en el modal.
   */
  onSave?: (data: { title: string }) => void;
  /**
   * Título sugerido prellenado en el modal de guardado
   * (p.ej. "Ester 1-3" calculado por la capa de estado).
   */
  suggestedSessionTitle?: string;
  /**
   * Control externo del modal de guardado. Si se omite, el componente
   * gestiona su apertura/cierre internamente.
   */
  saveModalOpen?: boolean;
  onRequestSave?: () => void;
  onCancelSave?: () => void;
  onOpenReview?: (data: { chapter: number; verse: number; index: number }) => void;
  onBack?: () => void;
}

export function ChapterReviewScreen({
  bookTitle = "Ester",
  chapters = defaultChapters,
  totalChapters = DEFAULT_TOTAL_CHAPTERS,
  reviews: reviewsProp = defaultSessionReviews,
  currentChapter,
  onChangeChapter,
  onCommentSelection,
  onSave,
  suggestedSessionTitle,
  saveModalOpen,
  onRequestSave,
  onCancelSave,
  onOpenReview,
  onBack,
}: ChapterReviewScreenProps = {}) {
  const isControlled = currentChapter !== undefined;
  const [internalIndex, setInternalIndex] = useState(0);
  const index = isControlled
    ? Math.max(0, chapters.findIndex((c) => c.n === currentChapter))
    : internalIndex;
  const [pickerOpen, setPickerOpen] = useState(false);
  const availableChapters = chapters.map((c) => c.n);
  const chapter = chapters[index] ?? chapters[0];
  const isFirst = chapter.n === 1;
  const isLast = chapter.n === totalChapters;

  const goToChapter = (n: number) => {
    if (onChangeChapter) onChangeChapter(n);
    if (!isControlled) {
      const i = chapters.findIndex((c) => c.n === n);
      if (i >= 0) setInternalIndex(i);
    }
  };

  const go = (delta: number) => {
    const next = index + delta;
    if (next >= 0 && next < chapters.length) goToChapter(chapters[next].n);
  };

  const versesRef = useRef<HTMLDivElement>(null);
  const [selectedText, setSelectedText] = useState("");
  const [reviewsOpen, setReviewsOpen] = useState(false);

  // Modal de guardado: controlado externamente si saveModalOpen está definido,
  // si no se gestiona con estado interno.
  const isSaveControlled = saveModalOpen !== undefined;
  const [internalSaveOpen, setInternalSaveOpen] = useState(false);
  const saveOpen = isSaveControlled ? saveModalOpen : internalSaveOpen;
  const [titleDraft, setTitleDraft] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  const openSaveModal = () => {
    setTitleDraft(suggestedSessionTitle ?? `${bookTitle} ${chapter.n}`);
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

  // Sincroniza el borrador cuando cambian la sugerencia o el capítulo activo
  // mientras el modal no está abierto.
  useEffect(() => {
    if (!saveOpen) {
      setTitleDraft(suggestedSessionTitle ?? `${bookTitle} ${chapter.n}`);
    }
  }, [suggestedSessionTitle, bookTitle, chapter.n, saveOpen]);

  // Auto-focus al abrir el modal
  useEffect(() => {
    if (saveOpen) {
      const id = window.setTimeout(() => titleInputRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
  }, [saveOpen]);

  const reviews = reviewsProp[chapter.n] ?? {};
  const reviewedVerses = Object.keys(reviews)
    .map(Number)
    .sort((a, b) => a - b);
  const totalReviews = reviewedVerses.reduce(
    (sum, v) => sum + reviews[v].length,
    0,
  );

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      const text = sel?.toString().trim() ?? "";
      if (!text || !sel || sel.rangeCount === 0) {
        setSelectedText("");
        return;
      }
      const node = sel.anchorNode;
      if (node && versesRef.current?.contains(node)) {
        setSelectedText(text);
      } else {
        setSelectedText("");
      }
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  // Reset selection when changing chapter
  useEffect(() => {
    setSelectedText("");
    window.getSelection()?.removeAllRanges();
  }, [index]);

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={`${bookTitle} ${chapter.n}`}
        subtitle={`Capítulo ${chapter.n} de ${totalChapters}`}
        showBack
        onBack={onBack}
        right={
          <button
            type="button"
            onClick={() => setReviewsOpen(true)}
            aria-label={`Ver revisiones (${totalReviews})`}
            className="relative grid h-9 w-9 place-items-center rounded-full text-foreground hover:bg-muted"
          >
            <MessagesSquare className="h-5 w-5" />
            {totalReviews > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[0.6rem] font-semibold leading-none text-primary-foreground">
                {totalReviews}
              </span>
            )}
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-5 pb-44 pt-4">
        <div ref={versesRef}>
          <VerseBlock title={chapter.title} verses={chapter.verses} />
        </div>
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
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1.5 pl-3.5 pr-2.5 text-xs font-semibold tabular-nums text-foreground transition-colors hover:bg-accent"
          aria-label="Seleccionar capítulo"
        >
          {chapter.n}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
        <button
          onClick={() => go(1)}
          disabled={isLast || index === chapters.length - 1}
          aria-label="Capítulo siguiente"
          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
      {selectedText ? (
        <FloatingButton
          label="Comentar selección"
          onClick={() =>
            onCommentSelection?.({ verse: null, fragment: selectedText })
          }
        >
          <MessageSquarePlus className="h-4 w-4" />
        </FloatingButton>
      ) : (
        <FloatingButton label="Guardar" onClick={openSaveModal}>
          <Check className="h-4 w-4" />
        </FloatingButton>
      )}

      {/* Modal: pedir título de la sesión al guardar */}
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
            <h2
              id="save-session-title"
              className="text-base font-semibold text-foreground"
            >
              Guardar sesión
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
              placeholder={suggestedSessionTitle ?? `${bookTitle} ${chapter.n}`}
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
                Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Sidebar de revisiones */}
      {reviewsOpen && (
        <button
          type="button"
          aria-label="Cerrar"
          onClick={() => setReviewsOpen(false)}
          className="absolute inset-0 z-20 bg-foreground/30 backdrop-blur-[1px]"
        />
      )}
      <aside
        aria-hidden={!reviewsOpen}
        className={`absolute right-0 top-0 z-30 flex h-full w-[78%] max-w-[320px] flex-col border-l border-border bg-card shadow-xl transition-transform duration-200 ${
          reviewsOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 pb-3 pt-10">
          <div className="min-w-0">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Sesión actual
            </p>
            <h2 className="truncate text-sm font-semibold text-foreground">
              Revisiones · Ester {chapter.n}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.65rem] font-semibold text-primary">
              {totalReviews}
            </span>
            <button
              type="button"
              onClick={() => setReviewsOpen(false)}
              aria-label="Cerrar"
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {reviewedVerses.length > 0 ? (
            <ul className="space-y-3">
              {reviewedVerses.map((v) => (
                <li
                  key={v}
                  className="rounded-xl border border-border bg-background px-3 py-2.5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="min-w-0 truncate text-xs font-semibold text-foreground">
                      Ester {chapter.n}:{v}
                    </p>
                    <span className="ml-3 shrink-0 rounded-full bg-accent px-2 py-0.5 text-[0.65rem] font-semibold text-accent-foreground">
                      {reviews[v].length}{" "}
                      {reviews[v].length === 1 ? "revisión" : "revisiones"}
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {reviews[v].map((r, i) => (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() =>
                            onOpenReview?.({ chapter: chapter.n, verse: v, index: i })
                          }
                          aria-label={`Abrir revisión: ${r.fragment} (${r.comments} comentarios)`}
                          className="group flex w-full items-center gap-2 rounded-lg border-l-2 border-primary/60 bg-muted/40 px-2.5 py-1.5 text-left transition-colors hover:bg-muted"
                        >
                          <span className="min-w-0 flex-1 text-xs italic leading-snug text-foreground/80">
                            “{r.fragment}”
                          </span>
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[0.6rem] font-semibold tabular-nums text-primary">
                            <MessageCircle className="h-3 w-3" />
                            {r.comments}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no hay revisiones en este capítulo.
            </p>
          )}
        </div>
      </aside>

      <ChapterPickerModal
        open={pickerOpen}
        current={chapter.n}
        total={totalChapters}
        available={availableChapters}
        onSelect={(n) => goToChapter(n)}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
