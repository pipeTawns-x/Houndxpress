import { useCallback, useEffect, useRef, useState } from "react";
import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import { useRepository } from "./useRepository.ts";

export type GuidesStatus = "loading" | "ready" | "error";

interface GuidesState {
  guides: Guide[];
  status: GuidesStatus;
  error: string | null;
}

export interface UseGuides extends GuidesState {
  create: (input: NewGuideInput) => Promise<Guide>;
  advance: (number: string, input: AdvanceInput) => Promise<Guide>;
  /** Vuelve a los datos de ejemplo. Solo existe con el repositorio de demostración. */
  reset: (() => Promise<void>) | undefined;
  reload: () => void;
}

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : "Ocurrió un error inesperado.";
}

/** Lista de guías con carga y errores. Vuelve a leer del repositorio después de cada cambio. */
export function useGuides(): UseGuides {
  const repository = useRepository();
  const [state, setState] = useState<GuidesState>({ guides: [], status: "loading", error: null });
  // Solo cuenta la última lectura: una respuesta vieja nunca pisa a una nueva.
  const latestRead = useRef(0);

  const refresh = useCallback(async () => {
    latestRead.current += 1;
    const read = latestRead.current;
    try {
      const guides = await repository.list();
      if (read === latestRead.current) setState({ guides, status: "ready", error: null });
    } catch (error) {
      if (read === latestRead.current) {
        setState((current) => ({ ...current, status: "error", error: messageOf(error) }));
      }
    }
  }, [repository]);

  useEffect(() => {
    void refresh();
    return () => {
      // Al desmontar, invalida las lecturas pendientes.
      latestRead.current += 1;
    };
  }, [refresh]);

  const create = useCallback(
    async (input: NewGuideInput) => {
      const guide = await repository.create(input);
      await refresh();
      return guide;
    },
    [repository, refresh],
  );

  const advance = useCallback(
    async (number: string, input: AdvanceInput) => {
      const guide = await repository.advance(number, input);
      await refresh();
      return guide;
    },
    [repository, refresh],
  );

  const resetRepository = repository.reset?.bind(repository);
  const reset = resetRepository
    ? async () => {
        await resetRepository();
        await refresh();
      }
    : undefined;

  const reload = useCallback(() => {
    setState((current) => ({ ...current, status: "loading", error: null }));
    void refresh();
  }, [refresh]);

  return { ...state, create, advance, reset, reload };
}
