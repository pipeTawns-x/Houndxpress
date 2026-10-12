import { ArrowRight } from "lucide-react";
import {
  SERVICE_WINDOWS,
  estimatedDeliveryWindow,
  findEventIn,
  formatGuideNumber,
  getStage,
  isDelivered,
} from "../../domain/index.ts";
import type { Guide } from "../../domain/index.ts";
import { TIME_ZONE_NOTE, formatDate, formatDateRange, formatDateTime } from "../../lib/format.ts";
import { StageBadge } from "../ui/StageBadge.tsx";
import { CopyButton } from "./CopyButton.tsx";
import { StageTimeline } from "./StageTimeline.tsx";

function DeliveryInfo({ guide }: { guide: Guide }) {
  const delivered = findEventIn(guide.history, "cargo_delivered");
  if (isDelivered(guide) && delivered) {
    return (
      <>
        <dt className="guide-card__term">Entrega</dt>
        <dd className="guide-card__value">Entregada el {formatDate(delivered.at)}</dd>
      </>
    );
  }
  const range = estimatedDeliveryWindow(guide);
  const service = SERVICE_WINDOWS[guide.service];
  return (
    <>
      <dt className="guide-card__term">Entrega estimada</dt>
      <dd className="guide-card__value">
        {formatDateRange(range.from, range.to)}
        <span className="guide-card__value-note">
          Servicio {service.label}: {service.minDays} a {service.maxDays} días desde el registro.
        </span>
      </dd>
    </>
  );
}

/** Resultado del rastreo de una guía: número copiable, etapa, ruta, servicio, fecha estimada, línea de tiempo y eventos. */
export function GuideResultCard({ guide }: { guide: Guide }) {
  const stage = getStage(guide.currentStage);
  const service = SERVICE_WINDOWS[guide.service];
  const events = [...guide.history].reverse();

  return (
    <article aria-label={`Guía ${formatGuideNumber(guide.number)}`} className="guide-card">
      <header className="guide-card__header">
        <div className="guide-card__top">
          <div className="guide-card__id">
            <p className="guide-card__kicker">Número de guía</p>
            <h3 className="guide-card__number">{formatGuideNumber(guide.number)}</h3>
          </div>
          <StageBadge code={guide.currentStage} />
        </div>
        <CopyButton value={guide.number} label="Copiar número" />
        <p className="guide-card__summary">
          Tu paquete está en <strong className="guide-card__summary-stage">{stage.label}</strong>, a cargo de {stage.department}.{" "}
          <span className="guide-card__summary-note">{stage.description}</span>
        </p>
      </header>

      <dl className="guide-card__facts">
        <div className="guide-card__fact">
          <dt className="guide-card__term">Ruta</dt>
          <dd className="guide-card__value guide-card__value--route">
            {guide.origin}
            <ArrowRight className="guide-card__arrow" aria-hidden="true" />
            <span className="visually-hidden">hacia</span>
            {guide.destination}
          </dd>
        </div>
        <div className="guide-card__fact">
          <dt className="guide-card__term">Servicio</dt>
          <dd className="guide-card__value">{service.label}</dd>
        </div>
        <div className="guide-card__fact">
          <DeliveryInfo guide={guide} />
        </div>
      </dl>

      <section aria-labelledby={`etapas-${guide.number}`} className="guide-card__section">
        <div className="guide-card__section-header">
          <h4 id={`etapas-${guide.number}`} className="guide-card__section-title">
            Cómo va tu envío
          </h4>
          <p className="guide-card__section-note">{TIME_ZONE_NOTE}</p>
        </div>
        <StageTimeline currentStage={guide.currentStage} history={guide.history} />
      </section>

      <section aria-labelledby={`eventos-${guide.number}`} className="guide-card__section">
        <h4 id={`eventos-${guide.number}`} className="guide-card__section-title">
          Eventos
        </h4>
        <ol className="guide-card__events">
          {events.map((event) => (
            <li key={event.stage} className="guide-card__event">
              <div className="guide-card__event-main">
                <p className="guide-card__event-title">{getStage(event.stage).label}</p>
                <p className="guide-card__event-place">
                  {event.location}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              </div>
              <time dateTime={event.at} className="guide-card__event-time">
                {formatDateTime(event.at)}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
