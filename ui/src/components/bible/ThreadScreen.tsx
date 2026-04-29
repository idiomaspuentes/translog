import { useState } from "react";
import { Plus } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { ThreadHeader } from "./ThreadHeader";
import { CommentCard, type CommentCardProps } from "./CommentCard";
import { FloatingButton } from "./FloatingButton";

const comments: (CommentCardProps & { id: string })[] = [
  {
    id: "c1",
    name: "María",
    time: "hace 2h",
    text: "¿A qué días específicos se refiere el texto? Parece ambiguo en esta traducción.",
  },
  {
    id: "c2",
    name: "Pablo",
    time: "hace 1h",
    audio: { duration: "0:32" },
  },
  {
    id: "c3",
    name: "Lucía",
    time: "hace 30m",
    text: "Sería bueno revisar el texto hebreo para mayor precisión.",
  },
  {
    id: "c4",
    name: "Daniel",
    time: "hace 10m",
    audio: {
      duration: "0:18",
      waveform: [25, 60, 80, 45, 70, 35, 90, 55, 40, 75, 60, 50, 30, 85, 65, 45, 70, 55],
    },
  },
];

interface ThreadScreenProps {
  quote?: string;
  reference?: string;
  comments?: (CommentCardProps & { id: string })[];
  onBack?: () => void;
  onNewComment?: () => void;
}

const DEFAULT_QUOTE =
  "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días";

export function ThreadScreen({
  quote = DEFAULT_QUOTE,
  reference = "Ester 1:2",
  comments: commentsProp = comments,
  onBack,
  onNewComment,
}: ThreadScreenProps = {}) {
  // Manejador externo de reproducción: solo un audio puede sonar a la vez.
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="relative flex h-full flex-col">
      <ScreenHeader title="Revisión" subtitle="Discusión comunitaria" showBack onBack={onBack} />
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 px-5 py-2 backdrop-blur">
        <ThreadHeader quote={quote} reference={reference} />
      </div>
      <div className="flex-1 space-y-2.5 overflow-y-auto p-5 pb-20">
        {commentsProp.map((c) => (
          <CommentCard
            key={c.id}
            {...c}
            playing={playingId === c.id}
            onTogglePlay={(next) => setPlayingId(next ? c.id : null)}
            onEnded={() => setPlayingId(null)}
          />
        ))}
      </div>
      <FloatingButton label="Nuevo" offset="bottom" onClick={onNewComment}>
        <Plus className="h-4 w-4" />
      </FloatingButton>
    </div>
  );
}
