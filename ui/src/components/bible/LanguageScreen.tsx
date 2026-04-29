import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { LanguageOption } from "./LanguageOption";

export type Language = { flag: string; name: string; native: string };

const DEFAULT_LANGUAGES: Language[] = [
  { flag: "🇪🇸", name: "Español", native: "Spanish" },
  { flag: "🇬🇧", name: "English", native: "English" },
  { flag: "🇵🇹", name: "Português", native: "Portuguese" },
  { flag: "🇫🇷", name: "Français", native: "French" },
  { flag: "🇩🇪", name: "Deutsch", native: "German" },
  { flag: "🇮🇹", name: "Italiano", native: "Italian" },
];

export interface LanguageScreenProps {
  /** Lista completa de idiomas disponibles (capa de datos). */
  languages?: Language[];
  /** Idioma inicialmente seleccionado (controlado o no). */
  initialSelected?: string | null;
  /**
   * Callback de autocompletado. Recibe el query escrito por el usuario
   * y debe devolver las opciones sugeridas a mostrar.
   * Si no se provee, se filtra `languages` localmente.
   */
  onSearchChange?: (query: string) => Language[] | Promise<Language[]>;
  /** Notifica cada cambio de selección al padre. */
  onSelectLanguage?: (language: Language | null) => void;
  /** Acción del botón "Continuar". */
  onContinue?: (language: Language) => void;
}

export function LanguageScreen({
  languages = DEFAULT_LANGUAGES,
  initialSelected = "Español",
  onSearchChange,
  onSelectLanguage,
  onContinue,
}: LanguageScreenProps = {}) {
  const [selected, setSelected] = useState<string | null>(initialSelected);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Language[]>(languages);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!query) {
        setSuggestions(languages);
        return;
      }
      if (onSearchChange) {
        const result = await onSearchChange(query);
        if (!cancelled) setSuggestions(result);
      } else {
        const q = query.toLowerCase();
        setSuggestions(
          languages.filter(
            (l) =>
              l.name.toLowerCase().includes(q) ||
              l.native.toLowerCase().includes(q),
          ),
        );
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query, languages, onSearchChange]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Seleccionar idioma"
        subtitle="Elige tu idioma de lectura"
        right={
          <button
            aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar idioma"}
            onClick={toggleSearch}
            className="rounded-full p-2 text-muted-foreground hover:bg-muted"
          >
            {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </button>
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
              placeholder="Buscar idioma..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
      )}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
        {suggestions.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Sin resultados
          </p>
        ) : (
          suggestions.map((l) => (
            <LanguageOption
              key={l.name}
              flag={l.flag}
              name={l.name}
              native={l.native}
              selected={selected === l.name}
              onSelect={() => {
                const next = selected === l.name ? null : l.name;
                setSelected(next);
                onSelectLanguage?.(next ? l : null);
              }}
            />
          ))
        )}
      </div>
      <div className="border-t border-border/60 p-5">
        <button
          type="button"
          disabled={!selected}
          onClick={() => {
            const lang = languages.find((l) => l.name === selected);
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
