import { useState } from "react";
import { Lock } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { ThreadHeader } from "./ThreadHeader";
import { CommentCard, type CommentCardProps } from "./CommentCard";

export type ReadOnlyComment = CommentCardProps & { id: string };

export interface ReadOnlyThreadInfo {
  /** Título mostrado en el header (p. ej. "Revisión #3"). */
  title?: string;
  /** Subtítulo: libro · fecha. */
  subtitle?: string;
  /** Fragmento citado en el `ThreadHeader`. */
  quote: string;
  /** Referencia bíblica (p. ej. "Ester 1:2"). */
  reference: string;
  /** Fecha de cierre, por si el padre quiere mostrarla en el pie. */
  closedAt?: string;
}

interface ReadOnlyThreadScreenProps {
  thread?: ReadOnlyThreadInfo;
  comments?: ReadOnlyComment[];
  /** Audio actualmente reproduciéndose. Si se omite, se gestiona internamente. */
  playingId?: string | null;
  onTogglePlay?: (commentId: string, next: boolean) => void;
  onBack?: () => void;
}

const defaultThread: ReadOnlyThreadInfo = {
  title: "Revisión #3",
  subtitle: "Ester · 12 abr 2026",
  quote:
    "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días\nque en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días",
  reference: "Ester 1:2",
};

const defaultComments: ReadOnlyComment[] = [
  {
    id: "c1",
    name: "María",
    time: "12 abr",
    text: "¿A qué días específicos se refiere el texto? Parece ambiguo en esta traducción.",
  },
  { id: "c2", name: "Pablo", time: "12 abr", audio: { duration: "0:45" } },
  {
    id: "c3",
    name: "Lucía",
    time: "13 abr",
    text: "Sería bueno revisar el texto hebreo para mayor precisión.",
  },
  {
    id: "c4",
    name: "Daniel",
    time: "13 abr",
    audio: {
      duration: "0:22",
      waveform: [40, 70, 55, 85, 30, 65, 50, 80, 45, 60, 35, 75, 90, 50, 65, 40, 70, 55],
    },
  },
];

export function ReadOnlyThreadScreen({
  thread = defaultThread,
  comments = defaultComments,
  playingId: controlledPlayingId,
  onTogglePlay,
  onBack,
}: ReadOnlyThreadScreenProps = {}) {
  const isControlled = controlledPlayingId !== undefined;
  const [internalPlayingId, setInternalPlayingId] = useState<string | null>(null);
  const playingId = isControlled ? controlledPlayingId : internalPlayingId;

  const handleToggle = (id: string, next: boolean) => {
    if (onTogglePlay) onTogglePlay(id, next);
    if (!isControlled) setInternalPlayingId(next ? id : null);
  };

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={thread.title ?? "Revisión"}
        subtitle={thread.subtitle}
        showBack
        onBack={onBack}
        right={
          <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
            <Lock className="h-3 w-3" />
            Solo lectura
          </span>
        }
      />
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-3 backdrop-blur">
        <ThreadHeader quote={thread.quote} reference={thread.reference} />
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-5">
        {comments.map((c) => (
          <CommentCard
            key={c.id}
            {...c}
            playing={playingId === c.id}
            onTogglePlay={(next) => handleToggle(c.id, next)}
            onEnded={() => handleToggle(c.id, false)}
          />
        ))}
        <p className="pt-2 text-center text-[0.7rem] uppercase tracking-wider text-muted-foreground">
          Sesión cerrada{thread.closedAt ? ` · ${thread.closedAt}` : ""} · sin nuevos comentarios
        </p>
      </div>
    </div>
  );
}
