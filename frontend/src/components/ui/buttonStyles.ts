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

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold whitespace-nowrap select-none [&_svg]:shrink-0 " +
  "transition-[background-color,color,border-color,transform] duration-200 ease-out " +
  "active:translate-y-px disabled:cursor-not-allowed disabled:active:translate-y-0 aria-disabled:cursor-not-allowed";

const sizes: Record<ButtonSize, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
  icon: "size-11 text-sm",
};

const variants: Record<ButtonVariant, Record<ButtonTone, string>> = {
  primary: {
    light:
      "bg-aqua-500 text-navy-950 hover:bg-aqua-400 disabled:bg-line disabled:text-muted disabled:hover:bg-line",
    dark: "bg-aqua-500 text-navy-950 hover:bg-aqua-400 disabled:bg-navy-700 disabled:text-navy-300 disabled:hover:bg-navy-700",
  },
  secondary: {
    light:
      "border-2 border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white " +
      "disabled:border-line disabled:text-muted disabled:hover:bg-transparent disabled:hover:text-muted",
    dark:
      "border-2 border-white/40 text-white hover:border-white hover:bg-white/10 " +
      "disabled:border-navy-700 disabled:text-navy-300 disabled:hover:bg-transparent",
  },
  ghost: {
    light: "text-navy-800 hover:bg-navy-800/5 disabled:text-muted disabled:hover:bg-transparent",
    dark: "text-white hover:bg-white/10 disabled:text-navy-300 disabled:hover:bg-transparent",
  },
};

/** Clases de un botón. También sirven para enlaces con aspecto de botón. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  tone = "light",
  fullWidth = false,
}: ButtonStyleOptions = {}): string {
  return [base, sizes[size], variants[variant][tone], fullWidth ? "w-full" : ""].filter(Boolean).join(" ");
}
