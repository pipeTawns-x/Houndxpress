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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-navy-950/60 backdrop-blur-sm"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative flex h-full w-full max-w-md animate-slide-in flex-col gap-6 overflow-y-auto bg-white p-5 shadow-lift focus:outline-none sm:p-6"
      >
        <header className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-label text-muted">Historial de la guía</p>
            <h2 id={titleId} className="font-display text-2xl font-extrabold tracking-tight text-navy-800 tabular-nums">
              {formatGuideNumber(guide.number)}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="-mt-1 -mr-2 shrink-0" aria-label="Cerrar historial">
            <X className="size-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4">
          <StageBadge code={guide.currentStage} className="self-start" />
          <p className="text-label text-ink">
            <strong className="font-semibold">{stage.label}</strong> · {stage.department}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-label">
            <dt className="text-muted">Destinatario</dt>
            <dd className="font-semibold text-navy-800">{guide.recipient}</dd>
            <dt className="text-muted">Ruta</dt>
            <dd className="font-semibold text-navy-800">
              {guide.origin}
              <span aria-hidden="true"> → </span>
              <span className="sr-only"> hacia </span>
              {guide.destination}
            </dd>
            <dt className="text-muted">Servicio</dt>
            <dd className="font-semibold text-navy-800">{SERVICE_WINDOWS[guide.service].label}</dd>
            <dt className="text-muted">Registrada</dt>
            <dd className="font-semibold text-navy-800">{formatDateTime(guide.createdAt)}</dd>
          </dl>
        </div>

        <section aria-labelledby={`${titleId}-eventos`} className="flex flex-col gap-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 id={`${titleId}-eventos`} className="text-h3 font-bold">
              Eventos
            </h3>
            <p className="text-label text-muted">{TIME_ZONE_NOTE}</p>
          </div>
          <StageTimeline currentStage={guide.currentStage} history={guide.history} layout="vertical" showDetails />
        </section>
      </div>
    </div>
  );
}
