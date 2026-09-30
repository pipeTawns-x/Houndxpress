import { useEffect, useState } from "react";
import { isValidGuideNumber } from "../domain/index.ts";
import type { Guide } from "../domain/index.ts";
import { useRepository } from "./useRepository.ts";

export type LookupResult =
  | { kind: "found"; number: string; guide: Guide }
  | { kind: "missing"; number: string }
  | { kind: "invalid"; number: string };

export type Lookup =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string; retry: () => void }
  | { status: "done"; results: LookupResult[] };

interface Settled {
  key: string;
  results: LookupResult[];
  error: string | null;
}

/** Busca varias guías en el repositorio. Los números con formato inválido ni siquiera se consultan. */
export function useGuideLookup(numbers: readonly string[]): Lookup {
  const repository = useRepository();
  const [attempt, setAttempt] = useState(0);
  const [settled, setSettled] = useState<Settled | null>(null);
  const list = numbers.join(",");
  // "Cargando" es la diferencia entre la búsqueda pedida y la última que terminó: no hace falta un estado propio.
  const key = `${list}#${String(attempt)}`;

  useEffect(() => {
    if (list === "") return;
    let cancelled = false;
    void Promise.all(
      list.split(",").map(async (number): Promise<LookupResult> => {
        if (!isValidGuideNumber(number)) return { kind: "invalid", number };
        const guide = await repository.get(number);
        return guide ? { kind: "found", number, guide } : { kind: "missing", number };
      }),
    ).then(
      (results) => {
        if (!cancelled) setSettled({ key, results, error: null });
      },
      (error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "No se pudo consultar la guía.";
        setSettled({ key, results: [], error: message });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [list, key, repository]);

  if (list === "") return { status: "idle" };
  if (settled?.key !== key) return { status: "loading" };
  if (settled.error !== null) {
    return {
      status: "error",
      message: settled.error,
      retry: () => {
        setAttempt((current) => current + 1);
      },
    };
  }
  return { status: "done", results: settled.results };
}
