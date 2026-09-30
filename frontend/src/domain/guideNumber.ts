const SIXTEEN_DIGITS = /^21\d{14}$/;
const TWENTY_TWO_ALNUM = /^[A-Z0-9]{22}$/;

/** Quita espacios y guiones que la persona escribe al copiar la guía, y pasa a mayúsculas. */
export function normalizeGuideNumber(value: string): string {
  return value.replace(/[\s\-‐-―]+/g, "").toUpperCase();
}

/** 16 dígitos que inician con "21", o 22 caracteres alfanuméricos. */
export function isValidGuideNumber(value: string): boolean {
  const normalized = normalizeGuideNumber(value);
  return SIXTEEN_DIGITS.test(normalized) || TWENTY_TWO_ALNUM.test(normalized);
}

/** Agrupa de 4 en 4 para mostrarla: "2148 2139 0765 0312". */
export function formatGuideNumber(value: string): string {
  const normalized = normalizeGuideNumber(value);
  return normalized.replace(/(.{4})(?=.)/g, "$1 ");
}

/** Genera un número válido de 16 dígitos. `random` se puede inyectar para pruebas. */
export function generateGuideNumber(random: () => number = Math.random): string {
  let digits = "21";
  for (let index = 0; index < 14; index += 1) {
    digits += String(Math.min(9, Math.floor(random() * 10)));
  }
  return digits;
}

export const GUIDE_NUMBER_HINT =
  "16 dígitos que inician con 21, o 22 caracteres alfanuméricos. Puedes escribirla con espacios o guiones.";
