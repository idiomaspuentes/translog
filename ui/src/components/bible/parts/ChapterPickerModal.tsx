import { X } from "lucide-react";

interface ChapterPickerModalProps {
  open: boolean;
  current: number;
  total: number;
  available: number[];
  onSelect: (n: number) => void;
  onClose: () => void;
}

export function ChapterPickerModal({
  open,
  current,
  total,
  available,
  onSelect,
  onClose,
}: ChapterPickerModalProps) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-40 flex flex-col">
      <button
        type="button"
        aria-label="Cerrar"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-in fade-in"
      />
      <div className="relative z-10 flex h-full w-full flex-col bg-card p-5 pt-10 shadow-2xl animate-in slide-in-from-bottom">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Capítulo
            </p>
            <h3 className="text-base font-semibold text-foreground">
              Selecciona uno
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: total }, (_, i) => i + 1).map((n) => {
            const isAvailable = available.includes(n);
            const isCurrent = n === current;
            return (
              <button
                key={n}
                type="button"
                disabled={!isAvailable}
                onClick={() => {
                  onSelect(n);
                  onClose();
                }}
                className={[
                  "grid aspect-square place-items-center rounded-2xl text-sm font-semibold tabular-nums transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground shadow-md"
                    : isAvailable
                      ? "border border-border bg-background text-foreground hover:bg-accent"
                      : "border border-dashed border-border/60 text-muted-foreground/50",
                  !isAvailable && "cursor-not-allowed",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
