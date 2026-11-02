import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useRepository } from "../hooks/useRepository.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { formatGuideNumber, getStage, nextStage } from "../domain/index.ts";
import type { Guide } from "../domain/types.ts";
import { StageTimeline } from "../components/tracking/StageTimeline.tsx";
import { Button } from "../components/ui/Button.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Select } from "../components/ui/fields.tsx";

import { NETWORK_NODES } from "../content/coverage.ts";
import { PanelShell } from "../components/panel/PanelShell.tsx";

export default function GuideDetail() {
  const { trackingNumber = "" } = useParams();
  useDocumentTitle("Detalle de guía");
  const repository = useRepository();
  const navigate = useNavigate();
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<{
    number: string;
    guide: Guide | null;
  } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [location, setLocation] = useState("");
  useEffect(() => {
    let active = true;
    void repository.get(trackingNumber).then(
      (guide) => {
        if (active) {
          setResult({ number: trackingNumber, guide });
          setConflict(false);
          setError("");
        }
      },
      (caught: unknown) => {
        if (active)
          setError(
            caught instanceof Error
              ? caught.message
              : "No se pudo consultar la guía.",
          );
      },
    );
    return () => {
      active = false;
    };
  }, [repository, trackingNumber, attempt]);
  const guide = result?.number === trackingNumber ? result.guide : undefined;
  const next = guide ? nextStage(guide.currentStatus) : null;
  async function advance() {
    if (!guide || !next || busy || conflict) return;
    setBusy(true);
    setError("");
    try {
      const updated = await repository.advance(trackingNumber, {
        stage: next,
        location: location.trim(),
      });
      setResult({ number: trackingNumber, guide: updated });
    } catch (caught) {
      setConflict(true);
      setError(
        caught instanceof Error
          ? caught.message
          : "No se pudo avanzar la guía.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function archive() {
    if (!repository.archive || busy || !confirmArchive) return;
    setBusy(true);
    setError("");
    try {
      await repository.archive(trackingNumber);
      await navigate("/panel/archivo", { replace: true });
    } catch {
      setError("No se pudo archivar la guía. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <PanelShell title="Detalle de guía">
      <div className="guide-detail">
        <ButtonLink to="/panel" variant="secondary">
          Volver al panel
        </ButtonLink>

        {error ? (
          <div role="alert" className="notice notice--danger">
            <p>{error}</p>
            <Button
              variant="secondary"
              onClick={() => setAttempt((value) => value + 1)}
            >
              Actualizar guía
            </Button>
          </div>
        ) : null}
        {guide === undefined && !error ? (
          <p role="status">Cargando guía…</p>
        ) : null}
        {guide === null ? <p role="status">Guía no encontrada.</p> : null}
        {guide ? (
          <>
            <h2>{formatGuideNumber(guide.trackingNumber)}</h2>
            <dl className="guide-detail__facts">
              <div>
                <dt>Destinatario</dt>
                <dd>{guide.recipient}</dd>
              </div>
              <div>
                <dt>Ruta</dt>
                <dd>
                  {guide.origin} → {guide.destination}
                </dd>
              </div>
              <div>
                <dt>Etapa actual</dt>
                <dd>{getStage(guide.currentStatus).label}</dd>
              </div>
            </dl>
            <section className="panel-app__detail-section">
              <h3>Etapas y responsables</h3>
              <StageTimeline
                currentStatus={guide.currentStatus}
                history={guide.history}
                showDetails
              />
            </section>
            {next ? (
              <div className="guide-detail__advance">
                <Select
                  label="Ubicación del avance (opcional)"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                >
                  <option value="">Sin ubicación</option>
                  {NETWORK_NODES.map((node) => (
                    <option key={node.id} value={node.name}>
                      {node.name}
                    </option>
                  ))}
                </Select>
                <Button
                  loading={busy}
                  disabled={conflict}
                  onClick={() => {
                    void advance();
                  }}
                >
                  Avanzar a {getStage(next).label}
                </Button>
              </div>
            ) : (
              <p>Carga entregada. El recorrido está completo.</p>
            )}
            <section className="panel-app__archive-action">
              <h3>Archivar guía</h3>
              <p>
                Retira esta guía del registro operativo. Confirma antes de
                continuar.
              </p>
              {repository.archive ? (
                <>
                  {confirmArchive ? (
                    <div role="group" aria-label="Confirmar archivo">
                      <p>
                        ¿Archivar la guía{" "}
                        {formatGuideNumber(guide.trackingNumber)}?
                      </p>
                      <Button
                        loading={busy}
                        onClick={() => {
                          void archive();
                        }}
                      >
                        Confirmar archivo
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={busy}
                        onClick={() => setConfirmArchive(false)}
                      >
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmArchive(true)}
                    >
                      Archivar guía
                    </Button>
                  )}
                </>
              ) : (
                <p>El archivo no está disponible en este repositorio.</p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </PanelShell>
  );
}
