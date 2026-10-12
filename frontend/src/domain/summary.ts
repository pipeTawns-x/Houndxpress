import { isDelivered } from "./guide.ts";
import { STAGES } from "./stages.ts";
import type { Guide, Stage } from "./types.ts";

export interface StageCount {
  stage: Stage;
  count: number;
}

export interface GuideSummary {
  total: number;
  /** Guías en la etapa 5 (Carga entregada). */
  delivered: number;
  /** Una entrada por etapa, en el orden del proceso (también las que tienen cero guías). */
  byStage: StageCount[];
}

/** Cuenta las guías por etapa. Es lo que muestra el resumen del panel. */
export function summarizeGuides(guides: readonly Guide[]): GuideSummary {
  return {
    total: guides.length,
    delivered: guides.filter(isDelivered).length,
    byStage: STAGES.map((stage) => ({
      stage,
      count: guides.filter((guide) => guide.currentStage === stage.code).length,
    })),
  };
}
