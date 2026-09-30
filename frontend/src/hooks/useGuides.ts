import { useCallback, useEffect } from "react";
import type { AdvanceInput, Guide, NewGuideInput } from "../domain/index.ts";
import {
  advanceGuide,
  createGuide,
  fetchGuides,
  resetGuides,
  selectCanResetGuides,
  selectGuides,
  selectGuidesError,
  selectGuidesStatus,
  useAppDispatch,
  useAppSelector,
} from "../store/index.ts";
import type { GuidesLoadStatus } from "../store/index.ts";

export type GuidesStatus = "loading" | "ready" | "error";

export interface UseGuides {
  guides: Guide[];
  status: GuidesStatus;
  error: string | null;
  create: (input: NewGuideInput) => Promise<Guide>;
  advance: (number: string, input: AdvanceInput) => Promise<Guide>;
  /** Vuelve a los datos de ejemplo. Solo existe con el repositorio de demostración. */
  reset: (() => Promise<void>) | undefined;
  reload: () => void;
}

/** Antes de la primera lectura todavía no hay nada que mostrar: para la interfaz también es "cargando". */
const PUBLIC_STATUS: Record<GuidesLoadStatus, GuidesStatus> = {
  idle: "loading",
  loading: "loading",
  succeeded: "ready",
  failed: "error",
};

/**
 * Lista de guías con carga y errores, sobre el almacén de Redux (`src/store/`). La interfaz
 * pública es la misma que tenía cuando el estado era local. Las escrituras vuelven a leer del
 * repositorio, y si fallan rechazan con el error original para que quien llamó lo muestre.
 */
export function useGuides(): UseGuides {
  const dispatch = useAppDispatch();
  const guides = useAppSelector(selectGuides);
  const status = useAppSelector(selectGuidesStatus);
  const error = useAppSelector(selectGuidesError);
  const canReset = useAppSelector(selectCanResetGuides);

  useEffect(() => {
    // Si el almacén ya tiene una lista (se volvió a esta pantalla), la muestra mientras se actualiza.
    void dispatch(fetchGuides({ background: true }));
  }, [dispatch]);

  const create = useCallback((input: NewGuideInput) => dispatch(createGuide(input)).unwrap(), [dispatch]);

  const advance = useCallback(
    (number: string, input: AdvanceInput) => dispatch(advanceGuide({ number, input })).unwrap(),
    [dispatch],
  );

  const reset = useCallback(async () => {
    await dispatch(resetGuides()).unwrap();
  }, [dispatch]);

  const reload = useCallback(() => {
    void dispatch(fetchGuides());
  }, [dispatch]);

  return {
    guides,
    status: PUBLIC_STATUS[status],
    error,
    create,
    advance,
    reset: canReset ? reset : undefined,
    reload,
  };
}
