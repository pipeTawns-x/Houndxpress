import { summarizeGuides } from "../../domain/index.ts";
import type { Guide, StageCode } from "../../domain/index.ts";
import { StatCard } from "../ui/StatCard.tsx";

const SEGMENT_COLORS: Record<StageCode, string> = {
  cargo_received: "bg-navy-300",
  vehicle_loaded: "bg-sky-600",
  vehicle_released: "bg-aqua-700",
  vehicle_in_transit: "bg-aqua-500",
  cargo_delivered: "bg-success",
};

/** Resumen del panel: total, en tránsito (etapas 1 a 4), entregadas y distribución por etapa. */
export function StageSummary({ guides }: { guides: readonly Guide[] }) {
  const { total, delivered, byStage: counts } = summarizeGuides(guides);

  return (
    <section aria-labelledby="resumen" className="flex flex-col gap-5">
      <h2 id="resumen" className="text-h2 font-bold">
        Resumen
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard value={String(total)} label="Guías en total" />
        <StatCard value={String(total - delivered)} label="En tránsito" description="Etapas 1 a 4" />
        <StatCard value={String(delivered)} label="Entregadas" description="Etapa 5" />
      </div>

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-line">
        <h3 className="text-base font-bold text-navy-800">Distribución por etapa</h3>
        <div aria-hidden="true" className="flex h-3 w-full overflow-hidden rounded-full bg-line">
          {counts.map(({ stage, count }) =>
            count > 0 ? (
              <span
                key={stage.code}
                className={SEGMENT_COLORS[stage.code]}
                style={{ width: `${String((count / total) * 100)}%` }}
              />
            ) : null,
          )}
        </div>
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-5">
          {counts.map(({ stage, count }) => (
            <li key={stage.code} className="flex items-center gap-2 text-label text-ink">
              <span aria-hidden="true" className={`size-3 shrink-0 rounded-full ${SEGMENT_COLORS[stage.code]}`} />
              <span>
                {stage.label}: <strong className="font-semibold tabular-nums">{count}</strong>
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
