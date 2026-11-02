export interface ColorToken {
  /** Nombre del token en `@theme`, sin el prefijo `--color-`. */
  name: string;
  hex: string;
  usage: string;
  /** Token que no está en la tabla de 04-sistema-de-diseno.md: se agregó al implementar. */
  added?: boolean;
}

/** Tokens de color. Deben coincidir con el bloque `@theme` de `src/index.css` (hay una prueba que lo verifica). */
export const COLOR_TOKENS: readonly ColorToken[] = [
  { name: "navy-950", hex: "#0B1426", usage: "Fondos oscuros profundos: héroe y pie." },
  { name: "navy-900", hex: "#111C33", usage: "Tarjetas sobre fondo oscuro." },
  { name: "navy-800", hex: "#18233E", usage: "Marino de marca. Títulos sobre claro." },
  { name: "navy-700", hex: "#24324F", usage: "Bordes y divisores en oscuro." },
  { name: "navy-300", hex: "#AFC0D6", usage: "Texto secundario sobre marino." },
  { name: "aqua-500", hex: "#4CBED8", usage: "Aqua de marca: botón principal, acentos, etapa activa." },
  { name: "aqua-400", hex: "#6FD0E4", usage: "Hover del botón principal." },
  { name: "aqua-100", hex: "#E8F7FB", usage: "Fondos suaves de acento." },
  { name: "aqua-700", hex: "#167088", usage: "Texto y enlaces aqua sobre claro." },
  { name: "sky-600", hex: "#2F6FC0", usage: "Información y enlaces secundarios." },
  { name: "ink", hex: "#0F172A", usage: "Texto principal sobre claro." },
  { name: "muted", hex: "#475569", usage: "Texto secundario sobre claro." },
  { name: "line", hex: "#E2E8F0", usage: "Bordes." },
  { name: "surface", hex: "#F6F8FB", usage: "Fondo de secciones alternas." },
  { name: "success", hex: "#15803D", usage: "Entregada." },
  { name: "warning", hex: "#B45309", usage: "En espera y datos de demostración." },
  { name: "danger", hex: "#B91C1C", usage: "Errores y guía no encontrada." },
  { name: "edge", hex: "#75849A", usage: "Borde de campos de formulario (3:1 sobre blanco).", added: true },
  { name: "success-soft", hex: "#F0FAF3", usage: "Fondo suave de éxito.", added: true },
  { name: "warning-soft", hex: "#FFF8EC", usage: "Fondo suave de advertencia.", added: true },
  { name: "danger-soft", hex: "#FEF2F2", usage: "Fondo suave de error.", added: true },
  { name: "sky-soft", hex: "#F1F7FE", usage: "Fondo suave de información.", added: true },
];

/** Color de un token por nombre. "white" es el blanco puro. */
export function tokenHex(name: string): string {
  if (name === "white") return "#FFFFFF";
  const token = COLOR_TOKENS.find((entry) => entry.name === name);
  if (!token) throw new Error(`Token de color desconocido: ${name}`);
  return token.hex;
}

export interface ContrastPair {
  label: string;
  /** Nombres de token ("white" incluido). */
  foreground: string;
  background: string;
  /** "usar" o "evitar": la regla que se ilustra. */
  verdict: "usar" | "evitar";
}

/** Combinaciones que el sistema de diseño usa (o prohíbe) para texto. */
export const CONTRAST_PAIRS: readonly ContrastPair[] = [
  { label: "Texto blanco sobre navy-950", foreground: "white", background: "navy-950", verdict: "usar" },
  { label: "Texto blanco sobre navy-800", foreground: "white", background: "navy-800", verdict: "usar" },
  { label: "navy-300 sobre navy-800", foreground: "navy-300", background: "navy-800", verdict: "usar" },
  { label: "navy-950 sobre aqua-500 (botón principal)", foreground: "navy-950", background: "aqua-500", verdict: "usar" },
  { label: "navy-800 sobre aqua-100", foreground: "navy-800", background: "aqua-100", verdict: "usar" },
  { label: "aqua-700 sobre blanco (enlaces)", foreground: "aqua-700", background: "white", verdict: "usar" },
  { label: "sky-600 sobre blanco", foreground: "sky-600", background: "white", verdict: "usar" },
  { label: "muted sobre blanco", foreground: "muted", background: "white", verdict: "usar" },
  { label: "success sobre blanco", foreground: "success", background: "white", verdict: "usar" },
  { label: "warning sobre blanco", foreground: "warning", background: "white", verdict: "usar" },
  { label: "danger sobre blanco", foreground: "danger", background: "white", verdict: "usar" },
  { label: "aqua-500 como texto sobre blanco", foreground: "aqua-500", background: "white", verdict: "evitar" },
];
