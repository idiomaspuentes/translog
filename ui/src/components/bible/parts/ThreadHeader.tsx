import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ThreadHeaderProps {
  quote: string;
  reference: string;
}

export function ThreadHeader({ quote, reference }: ThreadHeaderProps) {
  const [expanded, setExpanded] = useState(false);
  const isLong = quote.length > 80;

  return (
    <div className="rounded-xl border-l-4 border-primary bg-accent/40 px-3 py-2">
      <div
        className={
          expanded ? "scrollbar-thin max-h-32 overflow-y-auto" : ""
        }
      >
        <p
          className={`italic leading-snug text-foreground/90 text-sm whitespace-pre-wrap ${
            expanded ? "" : "line-clamp-1"
          }`}
        >
          "{quote}"
        </p>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="text-[0.7rem] font-medium text-primary">{reference}</p>
        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Colapsar cita" : "Expandir cita"}
            className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-primary hover:bg-primary/10"
          >
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        )}
      </div>
    </div>
  );
}
