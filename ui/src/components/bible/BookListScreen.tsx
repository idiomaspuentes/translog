import { useEffect, useRef, useState } from "react";
import { Plus, Search, Settings, X } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { ListItem } from "./ListItem";

export interface Book {
  id: string;
  title: string;
  meta: string;
  description: string;
}

const defaultBooks: Book[] = [
  { id: "ester", title: "Ester", meta: "10 capítulos", description: "Antiguo Testamento · Históricos" },
  { id: "jonas", title: "Jonás", meta: "4 capítulos", description: "Antiguo Testamento · Profetas" },
  { id: "tito", title: "Tito", meta: "3 capítulos", description: "Nuevo Testamento · Cartas" },
  { id: "rut", title: "Rut", meta: "4 capítulos", description: "Antiguo Testamento · Históricos" },
  { id: "filemon", title: "Filemón", meta: "1 capítulo", description: "Nuevo Testamento · Cartas" },
  { id: "habacuc", title: "Habacuc", meta: "3 capítulos", description: "Antiguo Testamento · Profetas" },
];

interface BookListScreenProps {
  books?: Book[];
  onSelectBook?: (book: Book) => void;
  onAddBook?: () => void;
  /**
   * Callback de autocompletado. Recibe el query escrito por el usuario
   * y debe devolver los libros sugeridos a mostrar.
   * Si no se provee, se filtra `books` localmente por título.
   */
  onSearchChange?: (query: string) => Book[] | Promise<Book[]>;
  onOpenSettings?: () => void;
}

export function BookListScreen({
  books = defaultBooks,
  onSelectBook,
  onAddBook,
  onSearchChange,
  onOpenSettings,
}: BookListScreenProps = {}) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Book[]>(books);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!query) {
        setSuggestions(books);
        return;
      }
      if (onSearchChange) {
        const result = await onSearchChange(query);
        if (!cancelled) setSuggestions(result);
      } else {
        const q = query.toLowerCase();
        setSuggestions(
          books.filter(
            (b) =>
              b.title.toLowerCase().includes(q) ||
              b.description.toLowerCase().includes(q),
          ),
        );
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [query, books, onSearchChange]);

  const toggleSearch = () => {
    setSearchOpen((open) => {
      if (open) setQuery("");
      return !open;
    });
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Libros"
        subtitle="Revisión comunitaria"
        right={
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label={searchOpen ? "Cerrar búsqueda" : "Buscar libro"}
              onClick={toggleSearch}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              {searchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </button>
            <button
              type="button"
              aria-label="Configuración"
              onClick={onOpenSettings}
              className="rounded-full p-2 text-muted-foreground hover:bg-muted"
            >
              <Settings className="h-5 w-5" />
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
              placeholder="Buscar libro..."
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
          suggestions.map((b) => (
            <ListItem
              key={b.id}
              title={b.title}
              meta={b.meta}
              description={b.description}
              onClick={onSelectBook ? () => onSelectBook(b) : undefined}
            />
          ))
        )}
      </div>
      <div className="border-t border-border/60 p-5">
        <button
          type="button"
          onClick={onAddBook}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          Añadir libro
        </button>
      </div>
    </div>
  );
}
