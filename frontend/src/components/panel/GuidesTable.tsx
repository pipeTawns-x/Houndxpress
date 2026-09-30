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
  const spoken = <span className="visually-hidden"> (guía {formatGuideNumber(guide.number)})</span>;
  return (
    <div className="guide-actions">
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
          <p id={helpId} className="guide-actions__help">
            Ya se entregó: no hay una etapa siguiente.
          </p>
        </>
      )}
      <Button data-history={guide.number} variant="secondary" onClick={onHistory}>
        <History className="button__icon" aria-hidden="true" />
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
    <div ref={root} className="guides-table">
      <div className="guides-table__filters">
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

      <div className="guides-table__feedback">
        <p role="status" className="guides-table__count">
          {filtered
            ? `${String(visible.length)} de ${String(guides.length)} guías, de la más reciente a la más antigua.`
            : `${String(guides.length)} guías, de la más reciente a la más antigua.`}
        </p>
        <div role="status" aria-live="polite">
          {notice?.kind === "ok" ? (
            <p className="notice notice--success">{notice.text}</p>
          ) : null}
        </div>
        {notice?.kind === "error" ? (
          <p role="alert" className="notice notice--danger guides-table__error">
            <CircleAlert className="guides-table__error-icon" aria-hidden="true" />
            {notice.text}
          </p>
        ) : null}
      </div>

      {visible.length === 0 ? (
        <div className="empty-state">
          <SearchX className="empty-state__icon" aria-hidden="true" />
          <h3 className="empty-state__title">{filtered ? "Ninguna guía coincide" : "Todavía no hay guías"}</h3>
          <p className="empty-state__text">
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
        <div className="guides-table__scroll">
          <table className="guides-table__table">
            <caption className="visually-hidden">Guías registradas, de la más reciente a la más antigua</caption>
            <thead className="guides-table__head">
              <tr>
                <th scope="col" className="guides-table__th">Guía y destinatario</th>
                <th scope="col" className="guides-table__th">Ruta y servicio</th>
                <th scope="col" className="guides-table__th">Etapa</th>
                <th scope="col" className="guides-table__th">Última actualización</th>
                <th scope="col" className="guides-table__th">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((guide) => (
                <tr key={guide.number} className="guides-table__row">
                  <th scope="row" className="guides-table__cell guides-table__cell--row-header">
                    <span className="guides-table__number">{formatGuideNumber(guide.number)}</span>
                    <span className="guides-table__recipient">{guide.recipient}</span>
                  </th>
                  <td className="guides-table__cell guides-table__cell--route">
                    <span className="guides-table__route">
                      {guide.origin}
                      <ArrowRight className="guides-table__arrow" aria-hidden="true" />
                      <span className="visually-hidden">hacia</span>
                      {guide.destination}
                    </span>
                    <span className="guides-table__service">{SERVICE_WINDOWS[guide.service].label}</span>
                  </td>
                  <td className="guides-table__cell">
                    <StageBadge code={guide.currentStage} />
                  </td>
                  <td className="guides-table__cell guides-table__cell--date">{formatDateTime(lastUpdate(guide))}</td>
                  <td className="guides-table__cell">
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
        <ul className="guides-table__cards">
          {visible.map((guide) => (
            <li key={guide.number} className="guides-table__card">
              <div className="guides-table__card-header">
                <div className="guides-table__card-id">
                  <span className="guides-table__card-number">{formatGuideNumber(guide.number)}</span>
                  <span className="guides-table__recipient">{guide.recipient}</span>
                </div>
                <StageBadge code={guide.currentStage} />
              </div>
              <dl className="guides-table__details">
                <dt className="guides-table__term">Ruta</dt>
                <dd className="guides-table__detail">
                  {guide.origin}
                  <span aria-hidden="true"> → </span>
                  <span className="visually-hidden"> hacia </span>
                  {guide.destination}
                </dd>
                <dt className="guides-table__term">Servicio</dt>
                <dd className="guides-table__detail">{SERVICE_WINDOWS[guide.service].label}</dd>
                <dt className="guides-table__term">Actualizada</dt>
                <dd className="guides-table__detail guides-table__detail--date">{formatDateTime(lastUpdate(guide))}</dd>
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
