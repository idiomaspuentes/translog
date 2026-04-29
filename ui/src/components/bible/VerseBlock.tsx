import { useRef } from "react";

interface Verse {
  n: number;
  text: string;
}

export interface VerseSelection {
  /** Texto seleccionado por el usuario. */
  fragment: string;
  /** Número del primer versículo de la selección. */
  verse: number;
}

interface VerseBlockProps {
  title: string;
  verses: Verse[];
  /**
   * Llamado cuando el usuario suelta el botón / quita el dedo después de
   * seleccionar texto dentro de este bloque. El padre recibe el fragmento y
   * el versículo donde empieza la selección. No se dispara si la selección
   * está vacía.
   */
  onSelectionChange?: (selection: VerseSelection | null) => void;
}

export function VerseBlock({ title, verses, onSelectionChange }: VerseBlockProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSelectionEnd = () => {
    if (!onSelectionChange) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
      onSelectionChange(null);
      return;
    }
    const range = sel.getRangeAt(0);
    if (!containerRef.current?.contains(range.commonAncestorContainer)) return;

    // Localizar el versículo donde empieza la selección.
    let node: Node | null = range.startContainer;
    let verseNumber: number | null = null;
    while (node && node !== containerRef.current) {
      if (node instanceof HTMLElement && node.dataset.verseNumber) {
        verseNumber = Number(node.dataset.verseNumber);
        break;
      }
      node = node.parentNode;
    }

    const fragment = sel.toString().trim();
    if (!fragment || verseNumber == null) return;
    onSelectionChange({ fragment, verse: verseNumber });
  };

  return (
    <article className="space-y-3">
      <h2 className="text-base font-semibold leading-snug text-foreground">{title}</h2>
      <div
        ref={containerRef}
        onMouseUp={handleSelectionEnd}
        onTouchEnd={handleSelectionEnd}
        className="space-y-2 text-sm leading-relaxed text-foreground/85"
      >
        {verses.map((v) => (
          <p key={v.n} data-verse-number={v.n}>
            <sup className="mr-1 text-[0.65rem] font-semibold text-primary">{v.n}</sup>
            {v.text}
          </p>
        ))}
      </div>
    </article>
  );
}
