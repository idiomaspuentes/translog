import type { ReactNode } from "react";
import { ChevronLeft } from "lucide-react";

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  /** Callback al pulsar el botón de volver. */
  onBack?: () => void;
  right?: ReactNode;
}

export function ScreenHeader({ title, subtitle, showBack, onBack, right }: ScreenHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 pb-4 pt-10">
      <div className="flex min-w-0 items-start gap-2">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            aria-label="Volver"
            className="-ml-1 mt-0.5 rounded-full p-1 text-muted-foreground hover:bg-muted"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-foreground">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </header>
  );
}
