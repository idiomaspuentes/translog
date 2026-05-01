import { useState } from "react";
import { Lock, Plus } from "lucide-react";
import { ScreenHeader } from "../parts/ScreenHeader";
import { ThreadHeader } from "../parts/ThreadHeader";
import { CommentCard, type CommentCardProps } from "../parts/CommentCard";
import { FloatingButton } from "../parts/FloatingButton";

export type ReviewComment = CommentCardProps & { id: number };

interface ReviewScreenProps {
  title?: string;
  subtitle?: string;
  quote?: string;
  reference?: string;
  comments?: ReviewComment[];
  /**
   * When `true`, the review is closed: the "Nuevo comentario" button is hidden
   * and a "Sesión cerrada" notice is shown at the bottom of the list.
   */
  closed?: boolean;
  /** Optional date shown in the closed-review notice, e.g. "12 abr 2026". */
  closedAt?: string;
  /** Audio currently playing (controlled). Omit to let the component manage it. */
  playingId?: number | null;
  onTogglePlay?: (commentId: number, next: boolean) => void;
  onBack?: () => void;
  /** Called when the user taps the "Nuevo comentario" floating button. */
  onNewComment?: () => void;
}

export function ReviewScreen({
  title = "",
  subtitle = "",
  quote = "",
  reference = "",
  comments = [],
  closed = false,
  closedAt,
  playingId: controlledPlayingId,
  onTogglePlay,
  onBack,
  onNewComment,
}: ReviewScreenProps = {}) {
  const isControlled = controlledPlayingId !== undefined;
  const [internalPlayingId, setInternalPlayingId] = useState<number | null>(null);
  const playingId = isControlled ? controlledPlayingId : internalPlayingId;

  const handleToggle = (id: number, next: boolean) => {
    if (onTogglePlay) onTogglePlay(id, next);
    if (!isControlled) setInternalPlayingId(next ? id : null);
  };

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader
        title={title}
        subtitle={subtitle}
        showBack
        onBack={onBack}
        right={
          closed ? (
            <span className="flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-[0.65rem] font-medium text-muted-foreground">
              <Lock className="h-3 w-3" />
              Solo lectura
            </span>
          ) : undefined
        }
      />
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-2 backdrop-blur">
        <ThreadHeader quote={quote} reference={reference} />
      </div>
      <div className={`flex-1 space-y-2.5 overflow-y-auto p-5 ${closed ? "" : "pb-20"}`}>
        {comments.map(({ id, ...cardProps }) => (
          <CommentCard
            key={id}
            {...cardProps}
            playing={playingId === id}
            onTogglePlay={(next) => handleToggle(id, next)}
            onEnded={() => handleToggle(id, false)}
          />
        ))}
        {closed && (
          <p className="pt-2 text-center text-[0.7rem] uppercase tracking-wider text-muted-foreground">
            Sesión cerrada{closedAt ? ` · ${closedAt}` : ""} · sin nuevos comentarios
          </p>
        )}
      </div>
      {!closed && (
        <FloatingButton label="Nuevo" onClick={onNewComment}>
          <Plus className="h-4 w-4" />
        </FloatingButton>
      )}
    </div>
  );
}
