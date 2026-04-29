import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";

export interface CommentCardProps {
  name: string;
  time: string;
  text?: string;
  audio?: {
    duration: string; // e.g. "0:24"
    /** Optional waveform bar heights (0–100). If omitted, a default pattern is used. */
    waveform?: number[];
  };
  /** Estado de reproducción controlado externamente. */
  playing?: boolean;
  /** Callback cuando el usuario presiona play/pause. El padre decide si reproduce. */
  onTogglePlay?: (next: boolean) => void;
  /** Callback cuando el usuario hace seek en la onda (0..1). */
  onSeek?: (progress: number) => void;
  /** Callback cuando el audio termina de reproducirse. */
  onEnded?: () => void;
}

const defaultWaveform = [30, 55, 70, 45, 80, 60, 90, 50, 65, 40, 75, 55, 35, 60, 80, 45, 70, 50];

function parseDurationSeconds(d: string): number {
  const [m, s] = d.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

export function CommentCard({
  name,
  time,
  text,
  audio,
  playing = false,
  onTogglePlay,
  onSeek,
  onEnded,
}: CommentCardProps) {
  // Estado visual interno SOLO de progreso (no de playing — eso lo controla el padre).
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);

  const totalSeconds = audio ? parseDurationSeconds(audio.duration) : 0;
  const bars = audio?.waveform ?? defaultWaveform;

  useEffect(() => {
    if (!playing) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }
    const tickMs = 100;
    const step = totalSeconds > 0 ? tickMs / (totalSeconds * 1000) : 0.02;
    intervalRef.current = window.setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          onEnded?.();
          return 0;
        }
        return next;
      });
    }, tickMs);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [playing, totalSeconds, onEnded]);

  const handleToggle = () => {
    onTogglePlay?.(!playing);
  };

  const seekTo = (i: number) => {
    const next = (i + 0.5) / bars.length;
    setProgress(next);
    onSeek?.(next);
  };

  const remaining = audio
    ? Math.max(0, Math.ceil(totalSeconds * (1 - progress)))
    : 0;
  const remainingLabel = audio
    ? `${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, "0")}`
    : "";

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          <span className="grid h-7 w-7 place-items-center rounded-full bg-accent text-xs font-semibold text-accent-foreground">
            {name.charAt(0)}
          </span>
          {name}
        </span>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>

      {audio ? (
        <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/60 px-2 py-1.5">
          <button
            type="button"
            onClick={handleToggle}
            aria-label={playing ? "Pausar audio" : "Reproducir audio"}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
          >
            {playing ? (
              <Pause className="h-3.5 w-3.5 fill-current" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
          </button>
          <div className="flex flex-1 items-center gap-[2px]">
            {bars.map((h, i) => {
              const played = i / bars.length < progress;
              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => seekTo(i)}
                  aria-label={`Saltar a ${Math.round(((i + 0.5) / bars.length) * 100)}%`}
                  className={`w-[2px] shrink-0 rounded-full transition-colors ${
                    played ? "bg-primary" : "bg-primary/30"
                  } hover:bg-primary`}
                  style={{ height: `${Math.max(20, Math.min(100, h)) * 0.18 + 4}px` }}
                />
              );
            })}
          </div>
          <span className="flex items-center gap-1 text-[0.7rem] font-medium tabular-nums text-muted-foreground">
            <Mic className="h-3 w-3" />
            {playing || progress > 0 ? remainingLabel : audio.duration}
          </span>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-foreground/80">{text}</p>
      )}
    </div>
  );
}
