import { MAX_TRACKED_GUIDES, splitGuideNumbers } from "../domain/index.ts";

/** Ruta del rastreo con las guías en `?guia=` (varias separadas por coma). */
export function trackingPath(numbers: readonly string[]): string {
  return numbers.length > 0 ? `/rastreo?guia=${numbers.join(",")}` : "/rastreo";
}

/**
 * Lee `?guia=`: números normalizados y sin repetir, hasta el máximo permitido.
 * `total` es cuántos venían en la dirección, para avisar si se recortó la lista.
 */
export function readGuideParam(value: string | null): { numbers: string[]; total: number } {
  const all = splitGuideNumbers(value ?? "");
  return { numbers: all.slice(0, MAX_TRACKED_GUIDES), total: all.length };
}
