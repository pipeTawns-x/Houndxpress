import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, CircleAlert, History, SearchX } from "lucide-react";
import { OPERATION_LOCATIONS } from "../../content/coverage.ts";
import {
  SERVICE_WINDOWS,
  STAGES,
  formatGuideNumber,
  getStage,
  isStageCode,
  lastUpdate,
  nextStage,
  normalizeGuideNumber,
} from "../../domain/index.ts";
import type { AdvanceInput, Guide, StageCode } from "../../domain/index.ts";
import { useMediaQuery } from "../../hooks/useMediaQuery.ts";
import { foldText, formatDateTime } from "../../lib/format.ts";
import { Button } from "../ui/Button.tsx";
import { Select, TextField } from "../ui/fields.tsx";
import { StageBadge } from "../ui/StageBadge.tsx";

export interface GuidesTableProps {
  guides: readonly Guide[];
  onAdvance: (number: string, input: AdvanceInput) => Promise<Guide>;
  onHistory: (number: string) => void;
}

type Notice = { kind: "ok" | "error"; text: string };

function matchesQuery(guide: Guide, query: string): boolean {
  const text = query.trim();
  if (text === "") return true;
  const byNumber = normalizeGuideNumber(text);
  return (
    (byNumber !== "" && guide.number.includes(byNumber)) ||
    foldText(guide.recipient).includes(foldText(text))
  );
}

function GuideActions({
  guide,
  busy,
  onAdvance,
  onHistory,
}: {
  guide: Guide;
  busy: boolean;
  onAdvance: () => void;
  onHistory: () => void;
}) {
  const next = nextStage(guide.currentStage);
  const helpId = `ayuda-${guide.number}`;
  const spoken = <span className="sr-only"> (guía {formatGuideNumber(guide.number)})</span>;
  return (
    <div className="flex flex-col gap-2">
      {next ? (
        <Button data-advance={guide.number} loading={busy} onClick={onAdvance}>
          Avanzar a {getStage(next).shortLabel}
          {spoken}
        </Button>
      ) : (
        <>
          <Button data-advance={guide.number} disabled aria-describedby={helpId}>
            Avanzar etapa
            {spoken}
          </Button>
          <p id={helpId} className="text-label text-muted">
            Ya se entregó: no hay una etapa siguiente.
          </p>
        </>
      )}
      <Button data-history={guide.number} variant="secondary" onClick={onHistory}>
        <History className="size-4" aria-hidden="true" />
        Historial
        {spoken}
      </Button>
    </div>
  );
}

/**
 * Lista de guías con búsqueda por número o destinatario, filtro por etapa y
 * las acciones de cada fila: "Avanzar a {etapa siguiente}" e "Historial".
 * Tabla desde 768 px y tarjetas en pantallas más chicas.
 */
export function GuidesTable({ guides, onAdvance, onHistory }: GuidesTableProps) {
  const isWide = useMediaQuery("(min-width: 768px)", true);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<StageCode | "all">("all");
  const [location, setLocation] = useState<string>(OPERATION_LOCATIONS[0] ?? "");
  // Guías con un avance en curso. Es un Set, no un solo número, para que terminar una
  // petición no vuelva a habilitar el botón de otra guía que sigue esperando.
  const [busy, setBusy] = useState<ReadonlySet<string>>(() => new Set());
  const inFlight = useRef(new Set<string>());
  const [notice, setNotice] = useState<Notice | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const focusAfter = useRef<string | null>(null);

  const visible = useMemo(
    () =>
      guides
        .filter((guide) => (stageFilter === "all" || guide.currentStage === stageFilter) && matchesQuery(guide, query))
        .sort((a, b) => Date.parse(lastUpdate(b)) - Date.parse(lastUpdate(a))),
    [guides, query, stageFilter],
  );

  // Al avanzar, la fila sube (orden por última actualización): se devuelve el foco a su botón.
  useEffect(() => {
    const number = focusAfter.current;
    if (!number || busy.has(number)) return;
    focusAfter.current = null;
    const button =
      root.current?.querySelector<HTMLElement>(`button[data-advance="${number}"]:not(:disabled)`) ??
      root.current?.querySelector<HTMLElement>(`button[data-history="${number}"]`);
    button?.focus();
  });

  async function advance(guide: Guide) {
    // La ref bloquea un segundo clic que llegue antes de que React deshabilite el botón.
    if (inFlight.current.has(guide.number)) return;
    inFlight.current.add(guide.number);
    setBusy(new Set(inFlight.current));
    setNotice(null);
    focusAfter.current = guide.number;
    try {
      const updated = await onAdvance(guide.number, { location });
      setNotice({
        kind: "ok",
        text: `La guía ${formatGuideNumber(updated.number)} avanzó a “${getStage(updated.currentStage).label}” en ${location}.`,
      });
    } catch (error) {
      focusAfter.current = null;
      setNotice({
        kind: "error",
        text: error instanceof Error ? error.message : "No se pudo avanzar la guía.",
      });
    } finally {
      inFlight.current.delete(guide.number);
      setBusy(new Set(inFlight.current));
    }
  }

  const filtered = query.trim() !== "" || stageFilter !== "all";

  return (
    <div ref={root} className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        <TextField
          label="Buscar por número o destinatario"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
          }}
          autoComplete="off"
          spellCheck={false}
          required={false}
          placeholder="Ej. 2148 o Laura"
        />
        <Select
          label="Filtrar por etapa"
          required={false}
          value={stageFilter}
          onChange={(event) => {
            const value = event.target.value;
            setStageFilter(isStageCode(value) ? value : "all");
          }}
        >
          <option value="all">Todas las etapas</option>
          {STAGES.map((stage) => (
            <option key={stage.code} value={stage.code}>
              {stage.order}. {stage.label}
            </option>
          ))}
        </Select>
        <Select
          label="Ubicación del avance"
          required={false}
          hint="Se anota en el historial de cada guía que avances."
          value={location}
          onChange={(event) => {
            setLocation(event.target.value);
          }}
        >
          {OPERATION_LOCATIONS.map((place) => (
            <option key={place} value={place}>
              {place}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-2">
        <p role="status" className="text-label text-muted">
          {filtered
            ? `${String(visible.length)} de ${String(guides.length)} guías, de la más reciente a la más antigua.`
            : `${String(guides.length)} guías, de la más reciente a la más antigua.`}
        </p>
        <div role="status" aria-live="polite">
          {notice?.kind === "ok" ? (
            <p className="rounded-2xl bg-success-soft p-4 text-base text-ink ring-1 ring-success/30">{notice.text}</p>
          ) : null}
        </div>
        {notice?.kind === "error" ? (
          <p role="alert" className="flex items-start gap-2 rounded-2xl bg-danger-soft p-4 text-base text-danger ring-1 ring-danger/30">
            <CircleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            {notice.text}
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface px-6 py-12 text-center">
          <SearchX className="size-10 text-aqua-700" aria-hidden="true" />
          <h3 className="text-h3 font-bold">{filtered ? "Ninguna guía coincide" : "Todavía no hay guías"}</h3>
          <p className="max-w-md text-base text-muted">
            {filtered
              ? "Cambia la búsqueda o el filtro de etapa para ver más guías."
              : "Registra la primera guía con el formulario de arriba."}
          </p>
          {filtered ? (
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setStageFilter("all");
              }}
            >
              Quitar filtros
            </Button>
          ) : null}
        </div>
      ) : isWide ? (
        <div className="overflow-x-auto rounded-2xl bg-white ring-1 ring-line">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Guías registradas, de la más reciente a la más antigua</caption>
            <thead className="bg-surface text-label text-muted">
              <tr>
                <th scope="col" className="px-3 py-3 font-semibold">Guía y destinatario</th>
                <th scope="col" className="px-3 py-3 font-semibold">Ruta y servicio</th>
                <th scope="col" className="px-3 py-3 font-semibold">Etapa</th>
                <th scope="col" className="px-3 py-3 font-semibold">Última actualización</th>
                <th scope="col" className="px-3 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {visible.map((guide) => (
                <tr key={guide.number} className="align-top">
                  <th scope="row" className="px-3 py-4 text-left font-normal">
                    <span className="block font-display text-base font-bold text-navy-800 tabular-nums">
                      {formatGuideNumber(guide.number)}
                    </span>
                    <span className="block text-label text-muted">{guide.recipient}</span>
                  </th>
                  <td className="px-3 py-4 text-base text-ink">
                    <span className="flex flex-wrap items-center gap-x-1.5">
                      {guide.origin}
                      <ArrowRight className="size-3.5 text-aqua-700" aria-hidden="true" />
                      <span className="sr-only">hacia</span>
                      {guide.destination}
                    </span>
                    <span className="block text-label text-muted">{SERVICE_WINDOWS[guide.service].label}</span>
                  </td>
                  <td className="px-3 py-4">
                    <StageBadge code={guide.currentStage} />
                  </td>
                  <td className="px-3 py-4 text-label text-ink tabular-nums">{formatDateTime(lastUpdate(guide))}</td>
                  <td className="px-3 py-4">
                    <GuideActions
                      guide={guide}
                      busy={busy.has(guide.number)}
                      onAdvance={() => {
                        void advance(guide);
                      }}
                      onHistory={() => {
                        onHistory(guide.number);
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {visible.map((guide) => (
            <li key={guide.number} className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-line">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <span className="font-display text-lg font-bold text-navy-800 tabular-nums">
                    {formatGuideNumber(guide.number)}
                  </span>
                  <span className="text-label text-muted">{guide.recipient}</span>
                </div>
                <StageBadge code={guide.currentStage} />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-label">
                <dt className="text-muted">Ruta</dt>
                <dd className="text-ink">
                  {guide.origin}
                  <span aria-hidden="true"> → </span>
                  <span className="sr-only"> hacia </span>
                  {guide.destination}
                </dd>
                <dt className="text-muted">Servicio</dt>
                <dd className="text-ink">{SERVICE_WINDOWS[guide.service].label}</dd>
                <dt className="text-muted">Actualizada</dt>
                <dd className="text-ink tabular-nums">{formatDateTime(lastUpdate(guide))}</dd>
              </dl>
              <GuideActions
                guide={guide}
                busy={busy.has(guide.number)}
                onAdvance={() => {
                  void advance(guide);
                }}
                onHistory={() => {
                  onHistory(guide.number);
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
