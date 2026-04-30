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
      className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2 text-left transition-colors ${
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-card hover:bg-accent/40"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{flag}</span>
        <div>
          <div className="text-sm font-medium text-foreground">{name}</div>
          <div className="text-[0.65rem] text-muted-foreground">{native}</div>
        </div>
      </div>
      <span
        className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
          selected ? "border-primary" : "border-border"
        }`}
      >
        {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
      </span>
    </button>
  );
}
