import { bem } from "../../lib/bem.ts";

export type ButtonVariant = "primary" | "secondary" | "ghost";
/** "icon" es un botón cuadrado de 44 px que solo lleva un icono (con `aria-label`). */
export type ButtonSize = "md" | "lg" | "icon";
/** "dark" para botones sobre fondos marino. */
export type ButtonTone = "light" | "dark";

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  tone?: ButtonTone;
  fullWidth?: boolean;
}

/**
 * Clases BEM de un botón: `button button--primary button--md button--light`.
 * También sirven para enlaces con aspecto de botón.
 */
export function buttonClasses({
  variant = "primary",
  size = "md",
  tone = "light",
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return bem("button", variant, size, tone, { full: fullWidth });
}
