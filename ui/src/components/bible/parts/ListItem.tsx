import { ChevronRight } from "lucide-react";

interface ListItemProps {
  title: string;
  meta?: string;
  description?: string;
  /** Callback al pulsar el ítem. */
  onClick?: () => void;
}

export function ListItem({ title, meta, description, onClick }: ListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
    >
      <div className="min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="truncate text-sm font-medium text-foreground">{title}</span>
          {meta && <span className="text-xs text-muted-foreground">{meta}</span>}
        </div>
        {description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
