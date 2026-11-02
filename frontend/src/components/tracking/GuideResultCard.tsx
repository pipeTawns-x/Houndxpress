import { StageReadout } from "./StageReadout.tsx";
import { formatGuideNumber, getStage } from "../../domain/index.ts";
import type { PublicGuide } from "../../domain/types.ts";
import { formatDateTime } from "../../lib/format.ts";
import { StageBadge } from "../ui/StageBadge.tsx";
import { CopyButton } from "./CopyButton.tsx";
import { StageTimeline } from "./StageTimeline.tsx";
export function GuideResultCard({ guide }: { guide: PublicGuide }) {
  const current = getStage(guide.currentStatus);
  return (
    <article aria-label={`Guía ${formatGuideNumber(guide.trackingNumber)}`} className="guide-card">
      <header className="guide-card__header">
        <div className="guide-card__top">
          <div>
            <p className="guide-card__kicker">Número de guía</p>
            <h3 className="guide-card__number">{formatGuideNumber(guide.trackingNumber)}</h3>
          </div>
          <StageBadge code={guide.currentStatus} />
        </div>
        <CopyButton value={guide.trackingNumber} label="Copiar número" />
        <p className="guide-card__summary">
          Tu paquete está en <strong>{current.label}</strong>.
        </p>
        <StageReadout value={current.order} />
      </header>
      <section className="guide-card__section" aria-label="Recorrido del envío">
        <StageTimeline currentStatus={guide.currentStatus} history={guide.history} />
      </section>
      <section className="guide-card__section">
        <h4>Historial del envío</h4>
        <ol className="guide-card__events">
          {[...guide.history].reverse().map((event) => (
            <li key={event.stage} className="guide-card__event">
              <div>
                <p className="guide-card__event-title">{getStage(event.stage).label}</p>
                <p>{event.location}</p>
              </div>
              <time dateTime={event.timestamp}>{formatDateTime(event.timestamp)}</time>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
