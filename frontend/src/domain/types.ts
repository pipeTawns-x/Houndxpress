/**
 * Contrato de datos del frontend (ver docs/diseno/03-arquitecto.md).
 * Los identificadores van en inglés y los textos para personas en español,
 * igual que en el backend.
 */

export const STAGE_CODES = [
  "cargo_received",
  "vehicle_loaded",
  "vehicle_released",
  "vehicle_in_transit",
  "cargo_delivered",
] as const;

export type StageCode = (typeof STAGE_CODES)[number];

export type Department = "Aduana" | "Operaciones" | "Seguridad" | "KAM";

export interface Stage {
  code: StageCode;
  /** Posición en el proceso, de 1 a 5. */
  order: number;
  /** Nombre completo de la etapa. */
  label: string;
  /** Nombre corto para insignias y botones. */
  shortLabel: string;
  /** Departamento responsable de registrar la etapa. */
  department: Department;
  description: string;
}

export type ServiceLevel = "standard" | "priority";

export interface StageEvent {
  stage: StageCode;
  /** Fecha y hora en ISO 8601 (UTC). */
  at: string;
  location: string;
  note?: string;
}

export interface Guide {
  /** 16 dígitos que inician con 21, o 22 caracteres alfanuméricos. */
  number: string;
  origin: string;
  destination: string;
  recipient: string;
  service: ServiceLevel;
  createdAt: string;
  currentStage: StageCode;
  /** Solo crece: nunca se edita ni se borra. Un evento por etapa completada. */
  history: StageEvent[];
}

export interface NewGuideInput {
  number: string;
  origin: string;
  destination: string;
  recipient: string;
  service: ServiceLevel;
}

export interface AdvanceInput {
  location: string;
  note?: string;
}

export interface AdvanceGuideInput extends AdvanceInput {
  /** Fecha y hora del evento en ISO 8601 (UTC). */
  at: string;
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;
