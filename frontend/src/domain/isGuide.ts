import { STAGE_CODES } from "./types.ts";
import { isStageCode } from "./stages.ts";
import type { Guide, StageEvent } from "./types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Texto que `Date.parse` entiende: las fechas alimentan el formato y la entrega estimada. */
function isDateString(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

function isStageEvent(value: unknown): value is StageEvent {
  return (
    isRecord(value) &&
    isStageCode(value.stage) &&
    isDateString(value.timestamp) &&
    typeof value.location === "string" &&
    (value.note === undefined || typeof value.note === "string")
  );
}

/**
 * Comprueba la forma de un dato que viene de fuera (almacenamiento local o API)
 * antes de tratarlo como `Guide`.
 */
export function isGuide(value: unknown): value is Guide {
  if (!isRecord(value)) return false;
  const { history } = value;
  return (
    typeof value.trackingNumber === "string" &&
    typeof value.origin === "string" &&
    typeof value.destination === "string" &&
    typeof value.recipient === "string" &&
    (value.serviceLevel === "standard" || value.serviceLevel === "priority") &&
    isDateString(value.createdAt) &&
    isStageCode(value.currentStatus) &&
    Array.isArray(history) &&
    history.length > 0 &&
    history.every(isStageEvent) &&
    history.length <= STAGE_CODES.length &&
    history.every(
      (event, index) =>
        event.stage === STAGE_CODES[index] &&
        (index === 0 || Date.parse(event.timestamp) >= Date.parse(history[index - 1]?.timestamp ?? "")),
    ) &&
    history.at(-1)?.stage === value.currentStatus
  );
}
