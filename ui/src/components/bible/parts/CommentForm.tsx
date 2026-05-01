import { useEffect, useRef, useState } from "react";
import { Mic, Square, Trash2, Play, Pause } from "lucide-react";

/**
 * Estados *externos* (capa de datos / coordinación con el padre):
 * - `idle`: estado normal, el usuario interactúa libremente.
 * - `submitting`: se está enviando, inputs deshabilitados.
 * - `success`: enviado correctamente.
 *
 * Los estados visuales derivados de la interacción del usuario
 * (`typing`, `empty`, `recording`, `recorded`, `playing`) son
 * internos al componente y NO se exponen como props.
 */
export type CommentFormState = "idle" | "submitting" | "success";

interface CommentFormProps {
  /** Estado externo controlado por la capa de datos. */
  state?: CommentFormState;
  /** Nombre por defecto del autor (el usuario puede editarlo). */
  defaultAuthorName?: string;
  /** Inicial mostrada en el avatar. */
  authorInitial?: string;
  /** Texto inicial del comentario (el usuario puede editarlo). */
  defaultText?: string;
  placeholder?: string;
  maxLength?: number;
  /** Callbacks hacia la capa de datos */
  onSubmit?: (data: { author: string; text: string; audio?: Blob | null }) => void;
  onChange?: (data: { author: string; text: string }) => void;
}

const recordingBars = [30, 55, 80, 45, 70, 90, 50, 75, 40, 65, 85, 55, 35, 70, 60, 90, 45, 75];

const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * Tarjeta unificada de formulario de comentario usada en `NewCommentScreen`.
 *
 * Maneja internamente: contenido del nombre/texto, escritura, grabación
 * y reproducción del audio grabado. Solo expone hacia afuera el estado
 * de envío (`submitting`/`success`) y los callbacks de datos.
 */
export function CommentForm({
  state = "idle",
  defaultAuthorName = "María",
  authorInitial = "M",
  defaultText = "",
  placeholder = "Escribe tu observación...",
  maxLength = 500,
  onSubmit,
  onChange,
}: CommentFormProps) {
  const isSubmitting = state === "submitting";

  // ---- Estado interno (visual, derivado de la interacción) ----
  const [author, setAuthor] = useState(defaultAuthorName);
  const [comment, setComment] = useState(defaultText);
  const [recording, setRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [playProgress, setPlayProgress] = useState(0); // 0..1
  const progressIntervalRef = useRef<number | null>(null);
  const recordingSecondsRef = useRef(0);
  const wantsRecordingRef = useRef(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordedAudioUrlRef = useRef<string | null>(null);

  // Resincroniza si los valores por defecto cambian desde fuera (Storybook, padre).
  useEffect(() => setAuthor(defaultAuthorName), [defaultAuthorName]);
  useEffect(() => setComment(defaultText), [defaultText]);
  useEffect(() => {
    recordingSecondsRef.current = recordingSeconds;
  }, [recordingSeconds]);

  // Timer de grabación (solo visual)
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const showRecording = recording;
  const showRecorded = !recording && recordedSeconds !== null;
  const showTextArea = !showRecording && !showRecorded;

  const revokeRecordedAudioUrl = () => {
    if (recordedAudioUrlRef.current) {
      URL.revokeObjectURL(recordedAudioUrlRef.current);
      recordedAudioUrlRef.current = null;
    }
  };

  const setRecordedAudioUrl = (url: string) => {
    revokeRecordedAudioUrl();
    recordedAudioUrlRef.current = url;
  };

  const stopMediaStream = () => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  };

  const createFallbackAudioUrl = (durationSeconds: number) => {
    const sampleRate = 44100;
    const samples = Math.max(1, Math.ceil(durationSeconds * sampleRate));
    const buffer = new ArrayBuffer(44 + samples * 2);
    const view = new DataView(buffer);
    const writeString = (offset: number, value: string) => {
      for (let i = 0; i < value.length; i += 1) view.setUint8(offset + i, value.charCodeAt(i));
    };

    writeString(0, "RIFF");
    view.setUint32(4, 36 + samples * 2, true);
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
    view.setUint32(40, samples * 2, true);

    for (let i = 0; i < samples; i += 1) {
      const t = i / sampleRate;
      const fadeIn = Math.min(1, t / 0.03);
      const fadeOut = Math.min(1, (durationSeconds - t) / 0.08);
      const envelope = Math.max(0, Math.min(fadeIn, fadeOut));
      const sample = Math.sin(2 * Math.PI * 440 * t) * 0.22 * envelope;
      view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, sample)) * 0x7fff, true);
    }

    return URL.createObjectURL(new Blob([view], { type: "audio/wav" }));
  };

  const startRecording = () => {
    stopPlayback();
    wantsRecordingRef.current = true;
    recordedChunksRef.current = [];
    mediaRecorderRef.current = null;
    stopMediaStream();
    revokeRecordedAudioUrl();
    setPlaying(false);
    setPlayProgress(0);
    setRecordingSeconds(0);
    setRecordedSeconds(null);
    setRecording(true);

    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") return;

    void navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        if (!wantsRecordingRef.current) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        mediaStreamRef.current = stream;
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) recordedChunksRef.current.push(event.data);
        };

        recorder.onstop = () => {
          const duration = Math.max(1, recordingSecondsRef.current);
          const blob = new Blob(recordedChunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          setRecordedAudioUrl(blob.size > 0 ? URL.createObjectURL(blob) : createFallbackAudioUrl(duration));
          stopMediaStream();
          mediaRecorderRef.current = null;
        };

        recorder.start();
      })
      .catch(() => {
        mediaRecorderRef.current = null;
        stopMediaStream();
      });
  };

  const stopRecording = () => {
    const duration = Math.max(1, recordingSecondsRef.current);
    wantsRecordingRef.current = false;
    setRecording(false);
    setRecordedSeconds(duration);

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
      return;
    }

    stopMediaStream();
    setRecordedAudioUrl(createFallbackAudioUrl(duration));
  };

  const stopPlayback = () => {
    if (progressIntervalRef.current !== null) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.onended = null;
      audioRef.current.onerror = null;
      audioRef.current = null;
    }
  };

  const startProgressTimer = (durationSeconds: number, fromProgress = 0) => {
    if (progressIntervalRef.current !== null) window.clearInterval(progressIntervalRef.current);
    setPlayProgress(fromProgress);
    const tickMs = 100;
    const step = durationSeconds > 0 ? tickMs / (durationSeconds * 1000) : 0.02;
    progressIntervalRef.current = window.setInterval(() => {
      setPlayProgress((current) => {
        const next = current + step;
        if (next >= 1) {
          stopPlayback();
          setPlaying(false);
          return 0;
        }
        return next;
      });
    }, tickMs);
  };

  const startPlayback = (durationSeconds: number, fromProgress = 0) => {
    stopPlayback();
    let src = recordedAudioUrlRef.current;
    if (!src) {
      src = createFallbackAudioUrl(durationSeconds);
      setRecordedAudioUrl(src);
    }

    const audio = new Audio(src);
    audioRef.current = audio;
    audio.currentTime = Math.max(0, durationSeconds * fromProgress);
    audio.onended = () => {
      stopPlayback();
      setPlaying(false);
      setPlayProgress(0);
    };
    audio.onerror = () => {
      stopPlayback();
      setPlaying(false);
    };

    startProgressTimer(durationSeconds, fromProgress);
    void audio.play().catch(() => {
      stopPlayback();
      setPlaying(false);
    });
  };

  const togglePlayback = () => {
    if (recordedSeconds === null || recordedSeconds <= 0) return;
    if (playing) {
      stopPlayback();
      setPlaying(false);
    } else {
      const from = playProgress >= 1 ? 0 : playProgress;
      startPlayback(recordedSeconds, from);
      setPlaying(true);
    }
  };

  const seekTo = (i: number) => {
    const next = (i + 0.5) / recordingBars.length;
    const clamped = Math.max(0, Math.min(1, next));
    const wasPlaying = playing;
    if (wasPlaying) stopPlayback();
    setPlayProgress(clamped);
    if (wasPlaying && recordedSeconds !== null) {
      startPlayback(recordedSeconds, clamped);
    }
  };

  const deleteRecording = () => {
    stopPlayback();
    revokeRecordedAudioUrl();
    setRecordedSeconds(null);
    setPlaying(false);
    setPlayProgress(0);
  };

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      wantsRecordingRef.current = false;
      stopPlayback();
      stopMediaStream();
      revokeRecordedAudioUrl();
    };
  }, []);

  const handleNameChange = (v: string) => {
    setAuthor(v);
    onChange?.({ author: v, text: comment });
  };
  const handleTextChange = (v: string) => {
    const next = v.slice(0, maxLength);
    setComment(next);
    onChange?.({ author, text: next });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      {/* Cabecera con avatar y nombre */}
      <div className="flex items-center gap-3 pb-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
          {authorInitial}
        </div>
        <input
          value={author}
          onChange={(e) => handleNameChange(e.target.value)}
          disabled={isSubmitting}
          placeholder="Tu nombre"
          className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none disabled:opacity-60"
        />
      </div>

      <div className="border-t border-border/60" />

      <div className="pt-3">
        {showTextArea && (
          <textarea
            value={comment}
            onChange={(e) => handleTextChange(e.target.value)}
            disabled={isSubmitting}
            placeholder={placeholder}
            rows={5}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-60"
          />
        )}

        {showRecording && (
          <div className="flex flex-col items-center justify-center gap-3 py-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
              </span>
              <span className="text-[0.7rem] font-medium uppercase tracking-wider text-destructive">
                Grabando · {formatTime(recordingSeconds)}
              </span>
            </div>
            <div className="flex h-12 items-center gap-[3px]">
              {recordingBars.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-destructive/70"
                  style={{ height: `${h * 0.4}px` }}
                />
              ))}
            </div>
            <p className="text-[0.7rem] text-muted-foreground">Toca el botón para detener</p>
          </div>
        )}

        {showRecorded && recordedSeconds !== null && (
          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-background/60 px-2 py-1.5">
            <button
              type="button"
              aria-label={playing ? "Pausar audio" : "Reproducir audio"}
              onClick={togglePlayback}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
            </button>
            <div className="flex flex-1 items-center gap-[2px]">
              {recordingBars.map((h, i) => {
                const filled = i / recordingBars.length < playProgress;
                return (
                  <button
                    type="button"
                    key={i}
                    onClick={() => seekTo(i)}
                    aria-label={`Saltar a ${Math.round(((i + 0.5) / recordingBars.length) * 100)}%`}
                    className={`w-[2px] shrink-0 rounded-full transition-colors ${filled ? "bg-primary" : "bg-primary/30"} hover:bg-primary`}
                    style={{ height: `${Math.max(20, Math.min(100, h)) * 0.18 + 4}px` }}
                  />
                );
              })}
            </div>
            <span className="text-[0.7rem] font-medium tabular-nums text-muted-foreground">
              {playing || playProgress > 0
                ? formatTime(Math.max(0, Math.ceil(recordedSeconds * (1 - playProgress))))
                : formatTime(recordedSeconds)}
            </span>
            <button
              type="button"
              aria-label="Eliminar audio"
              onClick={deleteRecording}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Barra inferior */}
        <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
          {showRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              aria-label="Detener grabación"
              className="inline-flex items-center gap-1.5 rounded-full bg-destructive px-3 py-1.5 text-[0.7rem] font-medium text-destructive-foreground"
            >
              <Square className="h-3 w-3 fill-current" />
              Detener
            </button>
          ) : showRecorded ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[0.7rem] font-medium text-primary"
            >
              <Mic className="h-3.5 w-3.5" />
              Regrabar
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              disabled={isSubmitting}
              aria-label="Grabar audio"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[0.7rem] font-medium text-primary disabled:opacity-50"
            >
              <Mic className="h-3.5 w-3.5" />
              Grabar audio
            </button>
          )}

          <span className="text-[0.65rem] font-medium text-muted-foreground">
            {showRecording
              ? `${formatTime(recordingSeconds)} / 2:00`
              : showRecorded && recordedSeconds !== null
                ? `Audio · ${formatTime(recordedSeconds)}`
                : `${comment.length} / ${maxLength}`}
          </span>
        </div>
      </div>

      {/* onSubmit auxiliar (no se renderiza botón aquí; el padre lo controla,
          pero exponemos el callback por si quiere usarse) */}
      {onSubmit && state === "success" && null}
    </div>
  );
}
