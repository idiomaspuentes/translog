import type { ReactNode } from "react";

interface FloatingButtonProps {
  children: ReactNode;
  variant?: "primary" | "secondary";
  position?: "right" | "left";
  label?: string;
  offset?: "default" | "bottom";
  /** Callback al pulsar el botón. */
  onClick?: () => void;
  /** Estado externo: si está deshabilitado (controlado por la capa de datos). */
  disabled?: boolean;
  "aria-label"?: string;
}

export function FloatingButton({
  children,
  variant = "primary",
  position = "right",
  label,
  offset = "default",
  onClick,
  disabled,
  "aria-label": ariaLabel,
}: FloatingButtonProps) {
  const bottom = offset === "bottom" ? "bottom-5" : "bottom-20";
  const base = `absolute ${bottom} z-20 inline-flex items-center justify-center gap-1.5 rounded-full shadow-lg transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100`;
  const pos = position === "right" ? "right-5" : "left-5";
  const styles =
    variant === "primary"
      ? "bg-primary text-primary-foreground"
      : "bg-card border border-border text-foreground";
  const size = label ? "h-12 px-5 text-sm font-medium" : "h-12 w-12";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel ?? label}
      className={`${base} ${pos} ${styles} ${size}`}
    >
      {children}
      {label && <span>{label}</span>}
    </button>
  );
}
