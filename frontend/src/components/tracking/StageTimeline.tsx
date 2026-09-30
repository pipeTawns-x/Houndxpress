import { Check } from "lucide-react";
import { STAGES, findEventIn, stageIndex } from "../../domain/index.ts";
import type { StageCode, StageEvent } from "../../domain/index.ts";
import { formatDateTime } from "../../lib/format.ts";

type StepStatus = "complete" | "current" | "pending";

const STATUS_TEXT: Record<StepStatus, string> = {
  complete: "Completada",
  current: "Etapa actual",
  pending: "Pendiente",
};

function statusFor(index: number, currentIndex: number): StepStatus {
  if (index < currentIndex) return "complete";
  if (index === currentIndex) return currentIndex === STAGES.length - 1 ? "complete" : "current";
  return "pending";
}

export interface StageTimelineProps {
  currentStage: StageCode;
  history: readonly StageEvent[];
  /**
   * "responsive": horizontal desde 768 px y vertical en móvil.
   * "vertical": siempre vertical (por ejemplo, dentro de un cajón).
   */
  layout?: "responsive" | "vertical";
  /** Muestra ubicación y nota de cada evento debajo de la fecha. */
  showDetails?: boolean;
  className?: string;
}

/**
 * Las cinco etapas del proceso con número, nombre, departamento y fecha.
 * Completadas: círculo aqua con palomita. Actual: anillo pulsante.
 * Pendientes: gris. El estado siempre lleva icono y texto, no solo color.
 */
export function StageTimeline({
  currentStage,
  history,
  layout = "responsive",
  showDetails = false,
  className,
}: StageTimelineProps) {
  const currentIndex = stageIndex(currentStage);
  const horizontal = layout === "responsive";

  return (
    <ol
      aria-label="Etapas del envío"
      className={["flex flex-col", horizontal ? "md:grid md:grid-cols-5" : "", className].filter(Boolean).join(" ")}
    >
      {STAGES.map((stage, index) => {
        const status = statusFor(index, currentIndex);
        const event = findEventIn(history, stage.code);
        const isLast = index === STAGES.length - 1;
        return (
          <li
            key={stage.code}
            aria-current={status === "current" ? "step" : undefined}
            className={[
              "relative flex gap-4 pb-8 last:pb-0",
              horizontal ? "md:flex-col md:gap-3 md:pr-3 md:pb-0" : "",
            ].join(" ")}
          >
            {isLast ? null : (
              <span
                aria-hidden="true"
                className={[
                  "absolute top-12 bottom-2 left-5 w-0.5 -translate-x-1/2",
                  index < currentIndex ? "bg-aqua-500" : "bg-line",
                  horizontal
                    ? "md:top-5 md:right-2 md:bottom-auto md:left-12 md:h-0.5 md:w-auto md:translate-x-0 md:-translate-y-1/2"
                    : "",
                ].join(" ")}
              />
            )}

            <span className="relative flex size-10 shrink-0 items-center justify-center">
              {status === "current" ? (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 animate-ring-pulse rounded-full border-2 border-aqua-500"
                />
              ) : null}
              <span
                aria-hidden="true"
                className={[
                  "relative flex size-10 items-center justify-center rounded-full font-display text-base font-bold",
                  status === "complete" ? "bg-aqua-500 text-navy-950" : "",
                  status === "current" ? "bg-navy-800 text-white ring-4 ring-aqua-500" : "",
                  status === "pending" ? "bg-surface text-muted ring-1 ring-edge" : "",
                ].join(" ")}
              >
                {status === "complete" ? <Check className="size-5" strokeWidth={3} /> : stage.order}
              </span>
            </span>

            <div className="flex min-w-0 flex-col gap-0.5 pt-0.5">
              <p className="font-display text-base leading-snug font-bold text-navy-800">{stage.label}</p>
              <p className="text-label text-muted">{stage.department}</p>
              <p
                className={[
                  "inline-flex items-center gap-1 text-label font-semibold",
                  status === "pending" ? "text-muted" : "text-aqua-700",
                ].join(" ")}
              >
                {STATUS_TEXT[status]}
              </p>
              {event ? (
                <time dateTime={event.at} className="text-label text-ink tabular-nums">
                  {formatDateTime(event.at)}
                </time>
              ) : null}
              {showDetails && event ? (
                <>
                  <p className="text-label text-ink">{event.location}</p>
                  {event.note ? <p className="text-label text-muted">{event.note}</p> : null}
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
