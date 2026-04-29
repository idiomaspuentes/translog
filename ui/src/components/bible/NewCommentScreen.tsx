import { useEffect, useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { ScreenHeader } from "./ScreenHeader";
import { ThreadHeader } from "./ThreadHeader";
import { CommentForm, type CommentFormState } from "./CommentForm";

export type { CommentFormState };

export interface NewCommentPayload {
  name: string;
  text: string;
  audio?: Blob | null;
}

interface NewCommentScreenProps {
  /**
   * Estado externo del envío. Si se omite, la pantalla maneja
   * internamente el flujo idle → submitting → success al hacer clic
   * en "Publicar comentario" (modo demo).
   */
  state?: CommentFormState;
  /** Fragmento citado al que se comenta. */
  quote?: string;
  /** Referencia bíblica del fragmento. */
  reference?: string;
  /** Nombre por defecto del autor (autocompletado desde el usuario). */
  defaultAuthorName?: string;
  /** Inicial mostrada en el avatar. */
  authorInitial?: string;
  /** Llamado al pulsar "Publicar comentario" con los datos del formulario. */
  onSubmit?: (payload: NewCommentPayload) => void;
  /** Llamado al cancelar / cerrar la pantalla sin publicar. */
  onCancel?: () => void;
  onBack?: () => void;
}

const DEFAULT_QUOTE =
  "que en aquellos días, cuando fue afirmado el rey Asuero sobre el trono de su reino, el cual estaba en Susa capital del reino, en el tercer año de su reinado hizo banquete a todos sus príncipes y cortesanos, teniendo delante de él a los más poderosos de Persia y de Media, mostrando las riquezas de la gloria de su reino y el brillo y la magnificencia de su poder por muchos días";

export function NewCommentScreen({
  state: externalState,
  quote = DEFAULT_QUOTE,
  reference = "Ester 1:2",
  defaultAuthorName,
  authorInitial,
  onSubmit,
  onCancel,
  onBack,
}: NewCommentScreenProps = {}) {
  const isControlled = externalState !== undefined;
  const [internalState, setInternalState] = useState<CommentFormState>("idle");
  const state = isControlled ? externalState : internalState;

  // Últimos datos reportados por el formulario.
  const [draft, setDraft] = useState<{ name: string; text: string }>({
    name: defaultAuthorName ?? "María",
    text: "",
  });

  useEffect(() => {
    if (isControlled && externalState) setInternalState(externalState);
  }, [isControlled, externalState]);

  const handlePublish = () => {
    if (state !== "idle") return;
    onSubmit?.({ name: draft.name, text: draft.text });
    if (!isControlled) {
      setInternalState("submitting");
      window.setTimeout(() => setInternalState("success"), 1200);
      window.setTimeout(() => setInternalState("idle"), 3200);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <ScreenHeader
        title="Nuevo comentario"
        subtitle="Comparte tu observación"
        showBack
        onBack={onBack ?? onCancel}
      />
      <div className="flex-1 space-y-5 overflow-y-auto p-5">
        <ThreadHeader quote={quote} reference={reference} />

        <CommentForm
          state={state}
          defaultAuthorName={defaultAuthorName}
          authorInitial={authorInitial}
          onChange={(d) => setDraft(d)}
          onSubmit={(d) => onSubmit?.(d)}
        />

        {state === "success" && (
          <div className="flex items-center gap-2 rounded-2xl border border-primary/30 bg-primary/5 px-4 py-3">
            <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
            <p className="text-xs font-medium text-foreground">
              Comentario publicado correctamente
            </p>
          </div>
        )}
      </div>
      <div className="border-t border-border/60 p-5">
        <button
          onClick={handlePublish}
          disabled={state === "submitting" || state === "success"}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity disabled:opacity-50"
        >
          {state === "submitting" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Publicando...
            </>
          ) : state === "success" ? (
            <>
              <Check className="h-4 w-4" />
              Publicado
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Publicar comentario
            </>
          )}
        </button>
      </div>
    </div>
  );
}
