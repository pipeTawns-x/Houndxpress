import { useEffect, useState } from "react";
import { PanelShell } from "../components/panel/PanelShell.tsx";
import { useRepository } from "../hooks/useRepository.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import type { Guide } from "../domain/index.ts";
import { formatGuideNumber, getStage } from "../domain/index.ts";
import { Button } from "../components/ui/Button.tsx";
export default function PanelArchive() {
  useDocumentTitle("Archivo de guías");
  const repository = useRepository();
  const [guides, setGuides] = useState<Guide[] | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!repository.listArchived) return;
    let active = true;
    void repository.listArchived().then(
      (items) => {
        if (active) setGuides(items);
      },
      () => {
        if (active)
          setError(
            "No se pudo consultar el archivo. El listado de guías archivadas no está disponible.",
          );
      },
    );
    return () => {
      active = false;
    };
  }, [repository, attempt]);
  return (
    <PanelShell title="Archivo">
      <p>Guías retiradas del registro operativo.</p>
      {!repository.listArchived ? (
        <p role="status">
          El listado de guías archivadas no está disponible en esta API.
        </p>
      ) : error ? (
        <div role="alert">
          <p>{error}</p>
          <Button
            variant="secondary"
            onClick={() => {
              setError("");
              setGuides(null);
              setAttempt((n) => n + 1);
            }}
          >
            Intentar de nuevo
          </Button>
        </div>
      ) : guides === null ? (
        <p role="status">Consultando archivo…</p>
      ) : guides.length === 0 ? (
        <p>No hay guías archivadas.</p>
      ) : (
        <ul className="panel-app__archive-list">
          {guides.map((guide) => (
            <li key={guide.trackingNumber}>
              <strong>{formatGuideNumber(guide.trackingNumber)}</strong>
              <span>
                {guide.origin} → {guide.destination}
              </span>
              <span>{getStage(guide.currentStatus).label}</span>
            </li>
          ))}
        </ul>
      )}
    </PanelShell>
  );
}
