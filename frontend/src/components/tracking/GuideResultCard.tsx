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
        <dt className="text-label text-muted">Entrega</dt>
        <dd className="text-base font-semibold text-navy-800">Entregada el {formatDate(delivered.at)}</dd>
      </>
    );
  }
  const range = estimatedDeliveryWindow(guide);
  const service = SERVICE_WINDOWS[guide.service];
  return (
    <>
      <dt className="text-label text-muted">Entrega estimada</dt>
      <dd className="text-base font-semibold text-navy-800">
        {formatDateRange(range.from, range.to)}
        <span className="block text-label font-normal text-muted">
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
    <article
      aria-label={`Guía ${formatGuideNumber(guide.number)}`}
      className="flex flex-col gap-8 rounded-3xl bg-white p-5 shadow-soft ring-1 ring-line sm:p-8"
    >
      <header className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="text-label text-muted">Número de guía</p>
            <h3 className="font-display text-2xl font-extrabold tracking-tight text-navy-800 tabular-nums sm:text-3xl">
              {formatGuideNumber(guide.number)}
            </h3>
          </div>
          <StageBadge code={guide.currentStage} />
        </div>
        <CopyButton value={guide.number} label="Copiar número" />
        <p className="text-base text-ink">
          Tu paquete está en <strong className="font-semibold">{stage.label}</strong>, a cargo de {stage.department}.{" "}
          <span className="text-muted">{stage.description}</span>
        </p>
      </header>

      <dl className="grid gap-x-8 gap-y-5 rounded-2xl bg-surface p-5 sm:grid-cols-3">
        <div className="flex flex-col gap-0.5">
          <dt className="text-label text-muted">Ruta</dt>
          <dd className="flex flex-wrap items-center gap-x-2 text-base font-semibold text-navy-800">
            {guide.origin}
            <ArrowRight className="size-4 text-aqua-700" aria-hidden="true" />
            <span className="sr-only">hacia</span>
            {guide.destination}
          </dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-label text-muted">Servicio</dt>
          <dd className="text-base font-semibold text-navy-800">{service.label}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <DeliveryInfo guide={guide} />
        </div>
      </dl>

      <section aria-labelledby={`etapas-${guide.number}`} className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 id={`etapas-${guide.number}`} className="text-h3 font-bold">
            Cómo va tu envío
          </h4>
          <p className="text-label text-muted">{TIME_ZONE_NOTE}</p>
        </div>
        <StageTimeline currentStage={guide.currentStage} history={guide.history} />
      </section>

      <section aria-labelledby={`eventos-${guide.number}`} className="flex flex-col gap-4">
        <h4 id={`eventos-${guide.number}`} className="text-h3 font-bold">
          Eventos
        </h4>
        <ol className="flex flex-col divide-y divide-line rounded-2xl ring-1 ring-line">
          {events.map((event) => (
            <li key={event.stage} className="flex flex-col gap-0.5 p-4 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6">
              <div className="flex flex-col gap-0.5">
                <p className="font-semibold text-navy-800">{getStage(event.stage).label}</p>
                <p className="text-label text-muted">
                  {event.location}
                  {event.note ? ` · ${event.note}` : ""}
                </p>
              </div>
              <time dateTime={event.at} className="text-label whitespace-nowrap text-ink tabular-nums">
                {formatDateTime(event.at)}
              </time>
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
