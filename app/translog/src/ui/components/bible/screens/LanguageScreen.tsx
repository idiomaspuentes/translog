import { useEffect, useMemo, useRef, useState } from "react";
import { Search } from "lucide-react";
import { ScreenHeader } from "../parts/ScreenHeader";
import { LanguageOption } from "../parts/LanguageOption";

export type Language = { flag: string; name: string; native: string };

export interface LanguageScreenProps {
  /**
   * Featured / default languages shown before the user types.
   * Keep this list short (≤ 20) — the full catalogue is reached via `onSearchChange`.
   */
  languages?: Language[];
  /** Idioma inicialmente seleccionado (controlado o no). */
  initialSelected?: string | null;
  /**
   * Full-catalogue search. Receives the query and must return matching languages.
   * If the callback returns a plain array (synchronous) the list updates instantly.
   * If it returns a Promise, results are applied once resolved with stale-guard.
   * If omitted, `languages` is filtered locally.
   */
  onSearchChange?: (query: string) => Language[] | Promise<Language[]>;
  /** Notifica cada cambio de selección al padre. */
  onSelectLanguage?: (language: Language | null) => void;
  /** Acción del botón "Continuar". */
  onContinue?: (language: Language) => void;
}

/** Hard cap so we never render thousands of items at once. */
const MAX_VISIBLE = 50;

export function LanguageScreen({
  languages = [],
  initialSelected = null,
  onSearchChange,
  onSelectLanguage,
  onContinue,
}: LanguageScreenProps = {}) {
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Only used when onSearchChange returns a Promise (async path).
  const [asyncResults, setAsyncResults] = useState<Language[] | null>(null);
  const [asyncQuery, setAsyncQuery] = useState<string>("");

  // Focus the search input on mount.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Async-only effect: fires when onSearchChange returns a Promise.
  useEffect(() => {
    if (!query || !onSearchChange) return;

    const resultOrPromise = onSearchChange(query);
    if (!(resultOrPromise instanceof Promise)) return; // handled synchronously in useMemo

    let cancelled = false;
    resultOrPromise.then((result) => {
      if (!cancelled) {
        setAsyncResults(result.slice(0, MAX_VISIBLE));
        setAsyncQuery(query);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [query, onSearchChange]);

  /**
   * The visible list is derived synchronously every render from the current
   * `query`. No stale state can survive between searches.
   */
  const visibleList = useMemo(() => {
    if (!query) return languages;

    if (onSearchChange) {
      const result = onSearchChange(query);
      if (!(result instanceof Promise)) {
        // Synchronous — apply immediately, no state needed.
        return result.slice(0, MAX_VISIBLE);
      }
      // Async — use the stored result only if it matches the current query.
      return asyncQuery === query && asyncResults !== null ? asyncResults : [];
    }

    // Local filter fallback.
    const q = query.toLowerCase();
    return languages
      .filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.native.toLowerCase().includes(q),
      )
      .slice(0, MAX_VISIBLE);
  }, [query, languages, onSearchChange, asyncResults, asyncQuery]);

  const hasQuery = query.length > 0;
  const isLoadingAsync =
    hasQuery &&
    !!onSearchChange &&
    visibleList.length === 0 &&
    asyncQuery !== query;

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Seleccionar idioma"
        subtitle="Elige tu idioma de lectura"
      />

      {/* Always-visible search bar */}
      <div className="border-b border-border/60 px-5 pb-3">
        <div className="flex items-center gap-2 rounded-full bg-muted px-4 py-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar idioma..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex-1 space-y-1.5 overflow-y-auto p-5">
        {!hasQuery && languages.length > 0 && (
          <p className="pb-1 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
            Idiomas frecuentes
          </p>
        )}

        {isLoadingAsync ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Buscando...
          </p>
        ) : hasQuery && visibleList.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin resultados
          </p>
        ) : (
          visibleList.map((l) => (
            <LanguageOption
              key={l.flag}
              flag={l.flag}
              name={l.name}
              native={l.native}
              selected={selected === l.flag}
              onSelect={() => {
                const next = selected === l.flag ? null : l.flag;
                setSelected(next);
                onSelectLanguage?.(next ? l : null);
              }}
            />
          ))
        )}

        {hasQuery && visibleList.length === MAX_VISIBLE && (
          <p className="pt-2 text-center text-xs text-muted-foreground">
            Mostrando los primeros {MAX_VISIBLE} resultados · afina la búsqueda
          </p>
        )}
      </div>

      <div className="border-t border-border/60 p-5">
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            const lang =
              visibleList.find((l) => l.flag === selected) ??
              languages.find((l) => l.flag === selected);
            if (lang) onContinue?.(lang);
          }}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
