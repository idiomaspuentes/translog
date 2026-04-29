import { useState } from "react";
import { ScreenHeader } from "../parts/ScreenHeader";
import { ReadOnlyThreadScreen } from "./ReadOnlyThreadScreen";

export interface Revision {
  id: string;
  title: string;
  passage: string;
  date: string;
  comments: number;
}

interface SessionLike {
  title: string;
  range: string;
  status: "abierta" | "cerrada";
  revisions: Revision[];
}

interface Props {
  session: SessionLike;
  onBack?: () => void;
  /** Si se pasa, controla la apertura externamente; si no, se abre `ReadOnlyThreadScreen` en estado interno (modo demo). */
  onOpenRevision?: (revision: Revision) => void;
  onCloseSession?: () => void;
  onReopenSession?: () => void;
}

export function SessionRevisionsScreen({
  session,
  onBack,
  onOpenRevision,
  onCloseSession,
  onReopenSession,
}: Props) {
  const [demoRevision, setDemoRevision] = useState<Revision | null>(null);

  if (!onOpenRevision && demoRevision) {
    return <ReadOnlyThreadScreen onBack={() => setDemoRevision(null)} />;
  }

  const handleOpen = (r: Revision) => {
    if (onOpenRevision) onOpenRevision(r);
    else setDemoRevision(r);
  };

  const toggleSession =
    session.status === "abierta" ? onCloseSession : onReopenSession;
  const toggleLabel =
    session.status === "abierta" ? "Cerrar sesión" : "Reabrir sesión";

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={session.title}
        subtitle={`${session.range} · ${session.revisions.length} revisiones`}
        showBack
        onBack={onBack}
        right={
          toggleSession ? (
            <button
              type="button"
              onClick={toggleSession}
              className={
                session.status === "abierta"
                  ? "rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-primary hover:bg-primary/20"
                  : "rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-muted-foreground hover:bg-muted/80"
              }
              aria-label={toggleLabel}
              title={toggleLabel}
            >
              {session.status}
            </button>
          ) : (
            <span
              className={
                session.status === "abierta"
                  ? "rounded-full bg-primary/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-primary"
                  : "rounded-full bg-muted px-2 py-0.5 text-[0.6rem] font-semibold uppercase text-muted-foreground"
              }
            >
              {session.status}
            </span>
          )
        }
      />
      <div className="flex-1 space-y-2.5 overflow-y-auto p-5 pb-10">
        <p className="px-1 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
          Revisiones
        </p>
        {session.revisions.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => handleOpen(r)}
            className="flex w-full items-center justify-between rounded-2xl border border-border bg-card px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
          >
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-snug text-foreground">{r.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {r.passage}
              </p>
              <p className="mt-1 text-[0.7rem] uppercase tracking-wide text-muted-foreground/80">
                {r.date}
              </p>
            </div>
            <span className="ml-3 shrink-0 self-start text-xs text-muted-foreground">
              {r.comments} 💬
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
