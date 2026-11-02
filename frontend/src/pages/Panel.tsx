import { Link } from "react-router";
import { PanelShell } from "../components/panel/PanelShell.tsx";
import { GuideLoadState } from "../components/panel/GuideLoadState.tsx";
import { StageSummary } from "../components/panel/StageSummary.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useGuides } from "../hooks/useGuides.ts";
import { formatGuideNumber, getStage } from "../domain/index.ts";
import { formatDateTime } from "../lib/format.ts";
import { Button } from "../components/ui/Button.tsx";
export default function Panel() {
  useDocumentTitle("Panel de operaciones");
  const state = useGuides();
  const activity = state.guides
    .flatMap((guide) =>
      guide.history.map((event) => ({
        ...event,
        number: guide.trackingNumber,
      })),
    )
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 6);
  const withoutRecentProgress = state.guides
    .filter((guide) => guide.currentStatus !== "cargo_delivered")
    .map((guide) => ({ guide, lastUpdate: guide.history.at(-1)?.timestamp ?? "" }))
    .sort((a, b) => Date.parse(a.lastUpdate) - Date.parse(b.lastUpdate))
    .slice(0, 5);
  return (
    <PanelShell title="Resumen">
      <div className="panel-app__intro">
        <p>El estado de tu operación, con los datos del registro.</p>
        <Button variant="secondary" onClick={state.reload}>
          Actualizar guías
        </Button>
      </div>
      <GuideLoadState {...state} />
      {state.status === "ready" ? (
        <>
          <StageSummary guides={state.guides} />
          <div className="panel-app__overview">
            <section>
              <h2>Sin avance reciente</h2>
              {withoutRecentProgress.length ? (
                <ol className="panel-app__activity">
                  {withoutRecentProgress.map(({ guide, lastUpdate }) => (
                    <li key={guide.trackingNumber}>
                      <Link to={`/panel/guias/${guide.trackingNumber}`}>
                        {formatGuideNumber(guide.trackingNumber)}
                      </Link>
                      <span>{getStage(guide.currentStatus).label}</span>
                      {lastUpdate ? (
                        <time dateTime={lastUpdate}>{formatDateTime(lastUpdate)}</time>
                      ) : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No hay guías activas.</p>
              )}
            </section>
            <section>
              <h2>Actividad reciente</h2>
              {activity.length ? (
                <ol className="panel-app__activity">
                  {activity.map((event) => (
                    <li
                      key={`${event.number}-${event.stage}-${event.timestamp}`}
                    >
                      <Link to={`/panel/guias/${event.number}`}>
                        {formatGuideNumber(event.number)}
                      </Link>
                      <span>{getStage(event.stage).label}</span>
                      <time dateTime={event.timestamp}>
                        {formatDateTime(event.timestamp)}
                      </time>
                      {event.location ? <span>{event.location}</span> : null}
                    </li>
                  ))}
                </ol>
              ) : (
                <p>No hay actividad registrada.</p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </PanelShell>
  );
}
