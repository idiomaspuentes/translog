import { useEffect, useRef, useState } from "react";
import { Play, Pause, Mic } from "lucide-react";

export interface CommentCardProps {
  author: string;
  time: string;
  text?: string;
  audio?: {
    duration: string; // e.g. "0:24"
    /** URL opcional del audio real. Si no se pasa, se genera un tono de demostración. */
    src?: string;
    /** Optional waveform bar heights (0–100). If omitted, a default pattern is used. */
    waveform?: number[];
  };
  /** Estado de reproducción controlado externamente (opcional). */
  playing?: boolean;
  /** Callback cuando el usuario presiona play/pause. */
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

/** Genera un WAV de tono 440Hz como data URL para usar de fallback. */
function createFallbackAudioUrl(durationSec: number): string {
  const sampleRate = 22050;
  const numSamples = Math.max(1, Math.floor(durationSec * sampleRate));
  const buffer = new ArrayBuffer(44 + numSamples * 2);
  const view = new DataView(buffer);
  const writeString = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  writeString(0, "RIFF");
  view.setUint32(4, 36 + numSamples * 2, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, numSamples * 2, true);
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const env = Math.min(1, t * 8) * Math.min(1, (durationSec - t) * 8);
    const sample = Math.sin(2 * Math.PI * 440 * t) * 0.25 * env;
    view.setInt16(44 + i * 2, sample * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
}

export function CommentCard({
  author,
  time,
  text,
  audio,
  playing: playingProp,
  onTogglePlay,
  onSeek,
  onEnded,
}: CommentCardProps) {
  const isControlled = playingProp !== undefined;
  const [internalPlaying, setInternalPlaying] = useState(false);
  const playing = isControlled ? !!playingProp : internalPlaying;

  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const audioElRef = useRef<HTMLAudioElement | null>(null);
  // Tracks the URL the current audioEl was created with so we can detect
  // when audio.src changes (e.g. resolves asynchronously after first render).
  const loadedSrcRef = useRef<string | null>(null);
  const fallbackUrlRef = useRef<string | null>(null);
  const appliedPlayingRef = useRef(false);

  const totalSeconds = audio ? parseDurationSeconds(audio.duration) : 0;
  const bars = audio?.waveform ?? defaultWaveform;

  // Limpieza al desmontar.
  useEffect(() => {
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current = null;
      }
    };
  }, []);

  const stopTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const finishPlayback = () => {
    stopTimer();
    if (audioElRef.current) audioElRef.current.pause();
    appliedPlayingRef.current = false;
    setProgress(0);
    if (!isControlled) setInternalPlaying(false);
    onEnded?.();
  };

  const syncProgressFromAudio = () => {
    const el = audioElRef.current;
    if (!el) return progress;
    const duration = Number.isFinite(el.duration) && el.duration > 0 ? el.duration : totalSeconds || 1;
    const next = Math.max(0, Math.min(1, el.currentTime / duration));
    setProgress(next);
    return next;
  };

  const startTimer = (fromProgress: number) => {
    stopTimer();
    const tickMs = 100;
    const startedAt = performance.now() - (totalSeconds || 1) * 1000 * fromProgress;
    setProgress(fromProgress);
    intervalRef.current = window.setInterval(() => {
      const el = audioElRef.current;
      const duration = el && Number.isFinite(el.duration) && el.duration > 0 ? el.duration : totalSeconds || 1;
      const next = el ? el.currentTime / duration : (performance.now() - startedAt) / (duration * 1000);
      const clamped = Math.max(0, Math.min(1, next));

      if (clamped >= 1) {
        finishPlayback();
        return;
      }

      setProgress(clamped);
    }, tickMs);
  };

  const playAudio = (fromProgress: number) => {
    if (!audio) return;
    // Determine the URL to use — prefer the real src once it resolves,
    // fall back to a synthesised tone only when src is still absent.
    const url =
      audio.src ??
      (fallbackUrlRef.current ?? (fallbackUrlRef.current = createFallbackAudioUrl(totalSeconds || 1)));

    // Rebuild the element if it doesn't exist OR if the URL it was created
    // with no longer matches (src resolved asynchronously after first play).
    if (!audioElRef.current || loadedSrcRef.current !== url) {
      if (audioElRef.current) {
        audioElRef.current.pause();
        audioElRef.current.onended = null;
      }
      const el = new Audio(url);
      el.preload = "auto";
      audioElRef.current = el;
      loadedSrcRef.current = url;
    }
    const el = audioElRef.current;
    el.onended = finishPlayback;
    try {
      el.currentTime = (totalSeconds || 1) * fromProgress;
    } catch {
      /* ignore */
    }
    setProgress(fromProgress);
    void el.play().then(() => startTimer(fromProgress)).catch(() => {
      stopTimer();
      appliedPlayingRef.current = false;
      if (!isControlled) setInternalPlaying(false);
    });
  };

  const pauseAudio = () => {
    syncProgressFromAudio();
    if (audioElRef.current) audioElRef.current.pause();
    stopTimer();
  };

  useEffect(() => {
    if (!audio || playing === appliedPlayingRef.current) return;
    appliedPlayingRef.current = playing;
    if (playing) {
      playAudio(progress >= 1 ? 0 : progress);
    } else {
      pauseAudio();
    }
  }, [playing]);

  const handleToggle = () => {
    const next = !playing;
    appliedPlayingRef.current = next;
    if (next) {
      playAudio(progress >= 1 ? 0 : progress);
    } else {
      pauseAudio();
    }
    if (!isControlled) setInternalPlaying(next);
    onTogglePlay?.(next);
  };

  const seekTo = (i: number) => {
    const next = (i + 0.5) / bars.length;
    setProgress(next);
    if (audioElRef.current) {
      try {
        audioElRef.current.currentTime = (totalSeconds || 1) * next;
      } catch {
        /* ignore */
      }
    }
    if (playing) startTimer(next);
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
            {author.charAt(0)}
          </span>
          {author}
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
