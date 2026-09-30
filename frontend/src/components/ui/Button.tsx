import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { buttonClasses } from "./buttonStyles.ts";
import type { ButtonStyleOptions } from "./buttonStyles.ts";

export interface ButtonProps extends ComponentProps<"button">, ButtonStyleOptions {
  /** Muestra un indicador y bloquea el botón mientras dura una operación. */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  tone,
  fullWidth,
  loading = false,
  disabled,
  className,
  type = "button",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={[buttonClasses({ variant, size, tone, fullWidth }), className].filter(Boolean).join(" ")}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
