import type { FaqEntry } from "../content/faq.ts";
import { foldText } from "./format.ts";

function textOf(entry: FaqEntry): string {
  return foldText([entry.question, ...entry.paragraphs, ...(entry.bullets ?? []), entry.afterBullets ?? ""].join(" "));
}

/** Una pregunta coincide si contiene todas las palabras de la búsqueda, sin distinguir mayúsculas ni acentos. */
export function filterFaq(entries: readonly FaqEntry[], query: string): FaqEntry[] {
  const words = foldText(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [...entries];
  return entries.filter((entry) => {
    const text = textOf(entry);
    return words.every((word) => text.includes(word));
  });
}
