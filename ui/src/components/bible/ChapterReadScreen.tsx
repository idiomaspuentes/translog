import { useState } from "react";
import { Play, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { VerseBlock } from "./VerseBlock";
import { FloatingButton } from "./FloatingButton";
import { ChapterPickerModal } from "./ChapterPickerModal";

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

interface ChapterReadScreenProps {
  bookTitle?: string;
  chapters?: Chapter[];
  totalChapters?: number;
  /** Capítulo activo (controlado). Si se omite, se usa estado interno. */
  currentChapter?: number;
  onChangeChapter?: (n: number) => void;
  onStartReview?: () => void;
  onBack?: () => void;
}

export function ChapterReadScreen({
  bookTitle = "Ester",
  chapters = defaultChapters,
  totalChapters = DEFAULT_TOTAL_CHAPTERS,
  currentChapter,
  onChangeChapter,
  onStartReview,
  onBack,
}: ChapterReadScreenProps = {}) {
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

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={`${bookTitle} ${chapter.n}`}
        subtitle={`Capítulo ${chapter.n} de ${totalChapters}`}
        showBack
        onBack={onBack}
      />
      <div className="flex-1 overflow-y-auto px-5 pb-44 pt-4">
        <VerseBlock title={chapter.title} verses={chapter.verses} />
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
      <FloatingButton label="Iniciar revisión" onClick={onStartReview}>
        <Play className="h-4 w-4" />
      </FloatingButton>
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
