import { useEffect, useState } from "react";
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
  onSubmit?: (data: { name: string; text: string; audio?: Blob | null }) => void;
  onChange?: (data: { name: string; text: string }) => void;
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
  const [name, setName] = useState(defaultAuthorName);
  const [comment, setComment] = useState(defaultText);
  const [recording, setRecording] = useState(false);
  const [recordedSeconds, setRecordedSeconds] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [playing, setPlaying] = useState(false);

  // Resincroniza si los valores por defecto cambian desde fuera (Storybook, padre).
  useEffect(() => setName(defaultAuthorName), [defaultAuthorName]);
  useEffect(() => setComment(defaultText), [defaultText]);

  // Timer de grabación (solo visual)
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const showRecording = recording;
  const showRecorded = !recording && recordedSeconds !== null;
  const showTextArea = !showRecording && !showRecorded;

  const startRecording = () => {
    setRecordingSeconds(0);
    setRecordedSeconds(null);
    setRecording(true);
  };
  const stopRecording = () => {
    setRecording(false);
    setRecordedSeconds(recordingSeconds);
  };
  const deleteRecording = () => {
    setRecordedSeconds(null);
    setPlaying(false);
  };

  const handleNameChange = (v: string) => {
    setName(v);
    onChange?.({ name: v, text: comment });
  };
  const handleTextChange = (v: string) => {
    const next = v.slice(0, maxLength);
    setComment(next);
    onChange?.({ name, text: next });
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
      {/* Cabecera con avatar y nombre */}
      <div className="flex items-center gap-3 pb-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
          {authorInitial}
        </div>
        <input
          value={name}
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
              onClick={() => setPlaying((p) => !p)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              {playing ? (
                <Pause className="h-3.5 w-3.5 fill-current" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-current" />
              )}
            </button>
            <div className="flex flex-1 items-center gap-[2px]">
              {recordingBars.map((h, i) => (
                <span
                  key={i}
                  className={`w-[2px] rounded-full ${playing ? "bg-primary" : "bg-primary/60"}`}
                  style={{ height: `${h * 0.18 + 4}px` }}
                />
              ))}
            </div>
            <span className="text-[0.7rem] font-medium text-muted-foreground">
              {formatTime(recordedSeconds)}
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
