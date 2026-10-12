import type { ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cx } from "../../lib/bem.ts";
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
      className={cx(buttonClasses({ variant, size, tone, fullWidth }), className)}
      disabled={disabled === true || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="button__spinner" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}
