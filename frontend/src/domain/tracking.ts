import { isValidGuideNumber, normalizeGuideNumber } from "./guideNumber.ts";

/** Máximo de guías por búsqueda múltiple. */
export const MAX_TRACKED_GUIDES = 10;

const FORMAT_HELP = "16 dígitos que inician con 21, o 22 caracteres alfanuméricos";

/** Separa una lista escrita por línea o con comas, normaliza cada número y quita repetidos. */
export function splitGuideNumbers(text: string): string[] {
  const numbers = text
    .split(/[\n\r,;]+/)
    .map(normalizeGuideNumber)
    .filter((entry) => entry !== "");
  return [...new Set(numbers)];
}

export interface TrackingInput {
  /** Números normalizados y sin repetir. Solo son de fiar cuando `error` no existe. */
  numbers: string[];
  error?: string;
}

/**
 * Valida lo que la persona escribió antes de buscar: en modo simple es un solo
 * número; en modo múltiple, hasta 10 números por línea o separados por comas.
 */
export function parseTrackingInput(text: string, multiple: boolean): TrackingInput {
  if (!multiple) {
    const number = normalizeGuideNumber(text);
    if (number === "") return { numbers: [], error: "Escribe el número de tu guía." };
    if (!isValidGuideNumber(number)) {
      return { numbers: [], error: `Ese número no tiene el formato correcto: son ${FORMAT_HELP}.` };
    }
    return { numbers: [number] };
  }

  const numbers = splitGuideNumbers(text);
  if (numbers.length === 0) return { numbers, error: "Escribe al menos un número de guía." };
  if (numbers.length > MAX_TRACKED_GUIDES) {
    return {
      numbers,
      error: `Puedes rastrear hasta ${String(MAX_TRACKED_GUIDES)} guías a la vez y escribiste ${String(numbers.length)}.`,
    };
  }
  const invalid = numbers.filter((number) => !isValidGuideNumber(number));
  if (invalid.length > 0) {
    const noun = invalid.length === 1 ? "esta guía no tiene" : "estas guías no tienen";
    return {
      numbers,
      error: `Revisa el formato: ${noun} ${FORMAT_HELP}. Guías con error: ${invalid.join(", ")}.`,
    };
  }
  return { numbers };
}
