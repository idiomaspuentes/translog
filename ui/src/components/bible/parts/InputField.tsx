import { useEffect, useState } from "react";
import { Mic } from "lucide-react";

type InputFieldVariant = "default" | "comment-card";

interface InputFieldProps {
  label?: string;
  placeholder?: string;
  multiline?: boolean;
  /** Valor inicial (el usuario puede editarlo internamente). */
  defaultValue?: string;
  /** Callback al cambiar el valor. */
  onChange?: (value: string) => void;
  /** Estado externo: deshabilitado (controlado por capa de datos). */
  disabled?: boolean;
  /**
   * - `default`: campo bordeado independiente (uso general en formularios).
   * - `comment-card`: tarjeta unificada con avatar + nombre + textarea + barra,
   *   espejo del formulario usado en `NewCommentScreen`.
   */
  variant?: InputFieldVariant;
  /** Solo aplica a `comment-card`. Nombre por defecto editable internamente. */
  defaultAuthorName?: string;
  authorInitial?: string;
  maxLength?: number;
  /** Callback del botón "Grabar audio" (solo en variant `comment-card`). */
  onRecord?: () => void;
  /** Callback al cambiar el nombre del autor (solo `comment-card`). */
  onAuthorNameChange?: (name: string) => void;
}

export function InputField({
  label,
  placeholder,
  multiline,
  defaultValue = "",
  onChange,
  disabled,
  variant = "default",
  defaultAuthorName = "María",
  authorInitial = "M",
  maxLength = 500,
  onRecord,
  onAuthorNameChange,
}: InputFieldProps) {
  // Estado interno: el contenido es manejado por el componente.
  const [value, setValue] = useState(defaultValue);
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  useEffect(() => setValue(defaultValue), [defaultValue]);
  useEffect(() => setAuthorName(defaultAuthorName), [defaultAuthorName]);

  const handleAuthorChange = (v: string) => {
    setAuthorName(v);
    onAuthorNameChange?.(v);
  };

  const handleChange = (v: string) => {
    const next = variant === "comment-card" ? v.slice(0, maxLength) : v;
    setValue(next);
    onChange?.(next);
  };

  if (variant === "comment-card") {
    return (
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-3 pb-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-primary/60 text-sm font-semibold text-primary-foreground">
            {authorInitial}
          </div>
          <input
            value={authorName}
            onChange={(e) => handleAuthorChange(e.target.value)}
            disabled={disabled}
            placeholder="Tu nombre"
            className="flex-1 bg-transparent text-sm font-semibold text-foreground focus:outline-none disabled:opacity-60"
          />
        </div>
        <div className="border-t border-border/60" />
        <div className="pt-3">
          <textarea
            value={value}
            onChange={(e) => handleChange(e.target.value)}
            disabled={disabled}
            placeholder={placeholder ?? "Escribe tu observación..."}
            rows={5}
            className="w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none disabled:opacity-60"
          />
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <button
              type="button"
              onClick={onRecord}
              disabled={disabled}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-[0.7rem] font-medium text-primary disabled:opacity-50"
            >
              <Mic className="h-3.5 w-3.5" />
              Grabar audio
            </button>
            <span className="text-[0.65rem] font-medium text-muted-foreground">
              {value.length} / {maxLength}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <label className="block">
      {label && (
        <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      )}
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          rows={4}
          className="w-full resize-none rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none disabled:opacity-60"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none disabled:opacity-60"
        />
      )}
    </label>
  );
}
