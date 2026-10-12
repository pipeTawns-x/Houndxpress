import { Check } from "lucide-react";
import { STAGES, findEventIn, stageIndex } from "../../domain/index.ts";
import type { StageCode, StageEvent } from "../../domain/index.ts";
import { bem, cx } from "../../lib/bem.ts";
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
    <ol aria-label="Etapas del envío" className={cx(bem("stage-timeline", horizontal ? "responsive" : "vertical"), className)}>
      {STAGES.map((stage, index) => {
        const status = statusFor(index, currentIndex);
        const event = findEventIn(history, stage.code);
        const isLast = index === STAGES.length - 1;
        return (
          <li
            key={stage.code}
            aria-current={status === "current" ? "step" : undefined}
            className={bem("stage-timeline__step", status)}
          >
            {isLast ? null : (
              <span
                aria-hidden="true"
                className={bem("stage-timeline__connector", { done: index < currentIndex })}
              />
            )}

            <span className="stage-timeline__marker">
              {status === "current" ? <span aria-hidden="true" className="stage-timeline__pulse" /> : null}
              <span aria-hidden="true" className={bem("stage-timeline__badge", status)}>
                {status === "complete" ? <Check className="stage-timeline__check" strokeWidth={3} /> : stage.order}
              </span>
            </span>

            <div className="stage-timeline__body">
              <p className="stage-timeline__name">{stage.label}</p>
              <p className="stage-timeline__department">{stage.department}</p>
              <p className={bem("stage-timeline__status", { pending: status === "pending" })}>{STATUS_TEXT[status]}</p>
              {event ? (
                <time dateTime={event.at} className="stage-timeline__time">
                  {formatDateTime(event.at)}
                </time>
              ) : null}
              {showDetails && event ? (
                <>
                  <p className="stage-timeline__detail">{event.location}</p>
                  {event.note ? <p className="stage-timeline__note">{event.note}</p> : null}
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
