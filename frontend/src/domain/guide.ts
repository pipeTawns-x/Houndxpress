import { DomainError } from "./errors.ts";
import { FIRST_STAGE, stageIndex } from "./stages.ts";
import { isValidGuideNumber, normalizeGuideNumber } from "./guideNumber.ts";
import type {
  AdvanceGuideInput,
  FieldErrors,
  Guide,
  NewGuideInput,
  ServiceLevel,
  StageCode,
  StageEvent,
} from "./types.ts";
import { STAGE_CODES } from "./types.ts";

const MAX_TEXT_LENGTH = 80;

type TextField = "origin" | "destination" | "recipient";
const DAY_MS = 24 * 60 * 60 * 1000;

/** La única etapa válida es la siguiente. Devuelve `null` después de "Carga entregada". */
export function nextStage(code: StageCode): StageCode | null {
  return STAGE_CODES[stageIndex(code) + 1] ?? null;
}

export function canAdvance(guide: Pick<Guide, "currentStage">): boolean {
  return nextStage(guide.currentStage) !== null;
}

export function isDelivered(guide: Pick<Guide, "currentStage">): boolean {
  return guide.currentStage === "cargo_delivered";
}

/**
 * Registra el paso a la etapa siguiente y devuelve una guía nueva (la original no se modifica).
 * El historial solo crece y sus fechas nunca retroceden.
 */
export function advanceGuide(guide: Guide, input: AdvanceGuideInput): Guide {
  const next = nextStage(guide.currentStage);
  if (next === null) {
    throw new DomainError("already_delivered", "La guía ya fue entregada y no puede avanzar.");
  }

  const location = input.location.trim();
  if (location === "") {
    throw new DomainError("invalid_input", "Indica la ubicación en la que se registra el avance.");
  }

  const at = Date.parse(input.at);
  if (Number.isNaN(at)) {
    throw new DomainError("invalid_input", "La fecha del avance no es válida.");
  }
  const previous = lastUpdate(guide);
  if (at < Date.parse(previous)) {
    throw new DomainError("out_of_order", "El avance no puede tener una fecha anterior al evento previo.");
  }

  const note = input.note?.trim();
  const event: StageEvent = {
    stage: next,
    at: new Date(at).toISOString(),
    location,
    ...(note ? { note } : {}),
  };

  return { ...guide, currentStage: next, history: [...guide.history, event] };
}

function trimmed(value: string): string {
  return value.trim();
}

/** Valida los datos de una guía nueva. Devuelve un mensaje por campo con error. */
export function validateNewGuideInput(input: NewGuideInput): FieldErrors<NewGuideInput> {
  const errors: FieldErrors<NewGuideInput> = {};

  if (!isValidGuideNumber(input.number)) {
    errors.number =
      "Escribe un número válido: 16 dígitos que inician con 21, o 22 caracteres alfanuméricos.";
  }

  const required: [TextField, string][] = [
    ["origin", "Escribe el origen."],
    ["destination", "Escribe el destino."],
    ["recipient", "Escribe el nombre del destinatario."],
  ];
  for (const [field, message] of required) {
    const value = trimmed(input[field]);
    if (value === "") {
      errors[field] = message;
    } else if (value.length > MAX_TEXT_LENGTH) {
      errors[field] = `Usa máximo ${MAX_TEXT_LENGTH} caracteres.`;
    }
  }

  if (input.service !== "standard" && input.service !== "priority") {
    errors.service = "Elige un servicio.";
  }

  return errors;
}

/** Crea una guía en "Recepción de carga" con su primer evento. Lanza `DomainError` si los datos no son válidos. */
export function createGuide(input: NewGuideInput, at: string): Guide {
  const errors = validateNewGuideInput(input);
  if (Object.keys(errors).length > 0) {
    throw new DomainError(
      errors.number ? "invalid_guide_number" : "invalid_input",
      errors.number ?? "Revisa los datos de la guía.",
      errors,
    );
  }

  const origin = trimmed(input.origin);
  return {
    number: normalizeGuideNumber(input.number),
    origin,
    destination: trimmed(input.destination),
    recipient: trimmed(input.recipient),
    service: input.service,
    createdAt: at,
    currentStage: FIRST_STAGE,
    history: [{ stage: FIRST_STAGE, at, location: origin }],
  };
}

/** Fecha del último evento; si no hay historial, la de creación. */
export function lastUpdate(guide: Guide): string {
  return guide.history.at(-1)?.at ?? guide.createdAt;
}

export function findEventIn(history: readonly StageEvent[], stage: StageCode): StageEvent | undefined {
  return history.find((event) => event.stage === stage);
}

/** Días de entrega de cada servicio, según la sección "Última milla" del sitio actual. */
export const SERVICE_WINDOWS: Record<ServiceLevel, { minDays: number; maxDays: number; label: string }> = {
  standard: { minDays: 6, maxDays: 9, label: "Estándar" },
  priority: { minDays: 3, maxDays: 5, label: "Priority" },
};

/** Ventana estimada de entrega: desde el registro de la guía, según su servicio. */
export function estimatedDeliveryWindow(guide: Pick<Guide, "createdAt" | "service">): {
  from: string;
  to: string;
} {
  const { minDays, maxDays } = SERVICE_WINDOWS[guide.service];
  const start = Date.parse(guide.createdAt);
  return {
    from: new Date(start + minDays * DAY_MS).toISOString(),
    to: new Date(start + maxDays * DAY_MS).toISOString(),
  };
}
