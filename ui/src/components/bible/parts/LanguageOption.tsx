interface LanguageOptionProps {
  flag: string;
  name: string;
  native: string;
  /**
   * Estado externo controlado por el padre (qué idioma está activo
   * en una lista de opciones). Se mantiene como prop porque la
   * selección depende del conjunto, no de este ítem aislado.
   */
  selected?: boolean;
  /** Callback al seleccionar el idioma. */
  onSelect?: () => void;
}

export function LanguageOption({ flag, name, native, selected, onSelect }: LanguageOptionProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-accent/40"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{flag}</span>
        <div>
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="text-xs text-muted-foreground">{native}</div>
        </div>
      </div>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
