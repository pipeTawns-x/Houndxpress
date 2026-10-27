import { useId, useRef } from "react";
import { X } from "lucide-react";
import { SERVICE_WINDOWS, formatGuideNumber, getStage } from "../../domain/index.ts";
import type { Guide } from "../../domain/index.ts";
import { useModalBehavior } from "../../hooks/useModalBehavior.ts";
import { useScrollLock } from "../../hooks/useScrollLock.ts";
import { TIME_ZONE_NOTE, formatDateTime } from "../../lib/format.ts";
import { StageTimeline } from "../tracking/StageTimeline.tsx";
import { Button } from "../ui/Button.tsx";
import { StageBadge } from "../ui/StageBadge.tsx";

/**
 * Cajón lateral con el detalle y los eventos de una guía. Es un diálogo
 * modal: atrapa el foco, se cierra con Esc o con un clic fuera y devuelve el
 * foco al botón que lo abrió. Se monta solo mientras está abierto.
 */
export function HistoryDrawer({ guide, onClose }: { guide: Guide; onClose: () => void }) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  useModalBehavior(panelRef, onClose);
  useScrollLock(true);

  const stage = getStage(guide.currentStage);

  return (
    <div className="history-drawer">
      <div aria-hidden="true" onClick={onClose} className="history-drawer__backdrop" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="history-drawer__panel"
      >
        <header className="history-drawer__header">
          <div className="history-drawer__heading">
            <p className="history-drawer__kicker">Historial de la guía</p>
            <h2 id={titleId} className="history-drawer__title">
              {formatGuideNumber(guide.number)}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="history-drawer__close" aria-label="Cerrar historial">
            <X className="button__icon" aria-hidden="true" />
          </Button>
        </header>

        <div className="history-drawer__summary">
          <StageBadge code={guide.currentStage} className="history-drawer__badge" />
          <p className="history-drawer__stage">
            <strong className="history-drawer__stage-name">{stage.label}</strong> · {stage.department}
          </p>
          <dl className="history-drawer__details">
            <dt className="history-drawer__term">Destinatario</dt>
            <dd className="history-drawer__value">{guide.recipient}</dd>
            <dt className="history-drawer__term">Ruta</dt>
            <dd className="history-drawer__value">
              {guide.origin}
              <span aria-hidden="true"> → </span>
              <span className="visually-hidden"> hacia </span>
              {guide.destination}
            </dd>
            <dt className="history-drawer__term">Servicio</dt>
            <dd className="history-drawer__value">{SERVICE_WINDOWS[guide.service].label}</dd>
            <dt className="history-drawer__term">Registrada</dt>
            <dd className="history-drawer__value">{formatDateTime(guide.createdAt)}</dd>
          </dl>
        </div>

        <section aria-labelledby={`${titleId}-eventos`} className="history-drawer__events">
          <div className="history-drawer__events-header">
            <h3 id={`${titleId}-eventos`} className="history-drawer__events-title">
              Eventos
            </h3>
            <p className="history-drawer__note">{TIME_ZONE_NOTE}</p>
          </div>
          <StageTimeline currentStage={guide.currentStage} history={guide.history} layout="vertical" showDetails />
        </section>
      </div>
    </div>
  );
}
