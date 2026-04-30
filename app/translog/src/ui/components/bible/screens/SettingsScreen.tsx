import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Database, DatabaseBackup, Search, Type, X } from "lucide-react";
import { ScreenHeader } from "../parts/ScreenHeader";

export interface LanguageOption {
  flag: string;
  name: string;
  native: string;
}

export interface FontSizeOption {
  label: string;
  sample: string;
  /** Tailwind class para el sample, p. ej. `text-base`. */
  size: string;
}

export interface UserPreferences {
  language: string;
  fontSize: string;
}

interface SettingsScreenProps {
  /** Catálogo de idiomas. */
  languages?: LanguageOption[];
  /** Catálogo de tamaños de letra. */
  fontSizes?: FontSizeOption[];
  /** Preferencias persistidas del usuario (modo controlado parcial). */
  initialPreferences?: Partial<UserPreferences>;
  /** Persistir cambios al pulsar "Guardar cambios". */
  onSave?: (prefs: UserPreferences) => void;
  /** Disparado por el usuario al cambiar de idioma. */
  onChangeLanguage?: (language: string) => void;
  /** Disparado por el usuario al cambiar el tamaño de letra. */
  onChangeFontSize?: (fontSize: string) => void;
  /** Acción "Exportar todas las sesiones". */
  onExportAllData?: () => void;
  /** Acción "Importar sesiones". */
  onImportAllData?: () => void;
  /**
   * Callback de búsqueda de idiomas. Recibe el query y devuelve las
   * opciones a mostrar. Si no se provee, se filtra `languages` localmente.
   */
  onSearchLanguages?: (query: string) => LanguageOption[] | Promise<LanguageOption[]>;
  onBack?: () => void;
}

export function SettingsScreen({
  languages = [],
  fontSizes = [],
  initialPreferences,
  onSave,
  onChangeLanguage,
  onChangeFontSize,
  onExportAllData,
  onImportAllData,
  onSearchLanguages,
  onBack,
}: SettingsScreenProps = {}) {
  const [language, setLanguage] = useState(initialPreferences?.language ?? "Español");
  const [fontSize, setFontSize] = useState(initialPreferences?.fontSize ?? "Mediano");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Only used when onSearchLanguages returns a Promise (async path).
  const [asyncResults, setAsyncResults] = useState<LanguageOption[] | null>(null);
  const [asyncQuery, setAsyncQuery] = useState<string>("");

  useEffect(() => {
    if (initialPreferences?.language) setLanguage(initialPreferences.language);
  }, [initialPreferences?.language]);
  useEffect(() => {
    if (initialPreferences?.fontSize) setFontSize(initialPreferences.fontSize);
  }, [initialPreferences?.fontSize]);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  // Async-only effect: fires only when onSearchLanguages returns a Promise.
  useEffect(() => {
    if (!query || !onSearchLanguages) return;
    const resultOrPromise = onSearchLanguages(query);
    if (!(resultOrPromise instanceof Promise)) return; // handled synchronously in useMemo
    let cancelled = false;
    resultOrPromise.then((result) => {
      if (!cancelled) {
        setAsyncResults(result);
        setAsyncQuery(query);
      }
    });
    return () => { cancelled = true; };
  }, [query, onSearchLanguages]);

  /**
   * Derived synchronously on every render — no stale state between searches.
   */
  const filteredLanguages = useMemo(() => {
    if (!query) return languages;
    if (onSearchLanguages) {
      const result = onSearchLanguages(query);
      if (!(result instanceof Promise)) return result; // synchronous
      // async: return already-resolved results for the same query, else empty while loading
      return asyncQuery === query ? (asyncResults ?? []) : [];
    }
    const q = query.toLowerCase();
    return languages.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.native.toLowerCase().includes(q),
    );
  }, [query, languages, onSearchLanguages, asyncResults, asyncQuery]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  const selectFontSize = (label: string) => {
    setFontSize(label);
    onChangeFontSize?.(label);
  };

  const selectLanguage = (name: string) => {
    setLanguage(name);
    onChangeLanguage?.(name);
  };

  const currentSize = fontSizes.find((f) => f.label === fontSize)?.size ?? "text-base";

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader title="Configuración" subtitle="Preferencias de lectura" showBack onBack={onBack} />
      <div className="flex-1 overflow-y-auto p-5 pb-10">
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Idioma
            </h2>
            <button
              type="button"
              aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar idioma"}
              onClick={toggleSearch}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted"
            >
              {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            </button>
          </div>
          {searchOpen && (
            <div className="mb-3 flex items-center gap-2 rounded-full bg-muted px-4 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar idioma..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          )}
          <div className="space-y-2">
            {filteredLanguages.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Sin resultados
              </p>
            ) : (
              filteredLanguages.map((l) => {
              const selected = language === l.name;
              return (
                <button
                  type="button"
                  key={l.name}
                  onClick={() => selectLanguage(l.name)}
                  aria-pressed={selected}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-accent/40"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{l.flag}</span>
                    <div>
                      <div className="text-sm font-medium text-foreground">{l.name}</div>
                      <div className="text-xs text-muted-foreground">{l.native}</div>
                    </div>
                  </div>
                  {selected && (
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </button>
              );
            })
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tamaño de letra
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {fontSizes.map((f) => {
              const selected = fontSize === f.label;
              return (
                <button
                  type="button"
                  key={f.label}
                  onClick={() => selectFontSize(f.label)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 transition-colors ${
                    selected
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-accent/40"
                  }`}
                >
                  <span className={`font-serif font-semibold text-foreground ${f.size}`}>
                    {f.sample}
                  </span>
                  <span className="text-xs text-muted-foreground">{f.label}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Type className="h-3.5 w-3.5" />
              Vista previa
            </div>
            <p className={`font-serif leading-relaxed text-foreground ${currentSize}`}>
              «En aquellos días, cuando el rey Asuero reinaba sobre su trono real
              en Susa, capital del reino…»
            </p>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="mb-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Datos
          </h2>
          <div className="space-y-2">
            <button
              type="button"
              onClick={onExportAllData}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <Database className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  Exportar todas las sesiones
                </p>
                <p className="text-xs text-muted-foreground">
                  Descarga un archivo con las sesiones de todos los libros
                </p>
              </div>
            </button>
            <button
              type="button"
              onClick={onImportAllData}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-accent/40"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <DatabaseBackup className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">
                  Importar sesiones
                </p>
                <p className="text-xs text-muted-foreground">
                  Carga un archivo con sesiones de uno o varios libros
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>
      <div className="border-t border-border/60 p-5">
        <button
          type="button"
          onClick={() => onSave?.({ language, fontSize })}
          className="w-full rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
}
