import type { Stage, StageCode } from "./types.ts";
import { STAGE_CODES } from "./types.ts";

/** Las cinco etapas del proceso, en el orden que fija el negocio. */
export const STAGES: readonly Stage[] = [
  {
    code: "cargo_received",
    order: 1,
    label: "Recepción de carga",
    shortLabel: "Recepción",
    department: "Aduana",
    description: "La carga llega a nuestras instalaciones y Aduana la registra.",
  },
  {
    code: "vehicle_loaded",
    order: 2,
    label: "Vehículo cargado",
    shortLabel: "Cargado",
    department: "Aduana",
    description: "Aduana confirma que la carga ya va en el vehículo que la llevará a su destino.",
  },
  {
    code: "vehicle_released",
    order: 3,
    label: "Vehículo liberado",
    shortLabel: "Liberado",
    department: "Operaciones",
    description: "Operaciones libera el vehículo para que inicie su ruta.",
  },
  {
    code: "vehicle_in_transit",
    order: 4,
    label: "Vehículo en camino",
    shortLabel: "En camino",
    department: "Seguridad",
    description: "Seguridad da seguimiento al vehículo durante todo el trayecto.",
  },
  {
    code: "cargo_delivered",
    order: 5,
    label: "Carga entregada",
    shortLabel: "Entregada",
    department: "KAM",
    description: "La carga llega a su destino y KAM cierra la guía.",
  },
];

const BY_CODE: ReadonlyMap<StageCode, Stage> = new Map(STAGES.map((stage) => [stage.code, stage]));

export function getStage(code: StageCode): Stage {
  const stage = BY_CODE.get(code);
  if (!stage) {
    throw new Error(`Etapa desconocida: ${code}`);
  }
  return stage;
}

/** Posición de la etapa en el proceso, empezando en 0. */
export function stageIndex(code: StageCode): number {
  return STAGE_CODES.indexOf(code);
}

export function isStageCode(value: unknown): value is StageCode {
  return typeof value === "string" && (STAGE_CODES as readonly string[]).includes(value);
}

export const FIRST_STAGE: StageCode = "cargo_received";
export const LAST_STAGE: StageCode = "cargo_delivered";
