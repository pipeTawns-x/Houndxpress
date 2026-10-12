import { useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { CircleAlert, LoaderCircle, PackageSearch } from "lucide-react";
import { GuideResultCard } from "../components/tracking/GuideResultCard.tsx";
import { TrackingNotFound } from "../components/tracking/TrackingNotFound.tsx";
import { TrackingSearch } from "../components/tracking/TrackingSearch.tsx";
import { Button } from "../components/ui/Button.tsx";
import { DemoNotice } from "../components/ui/DemoNotice.tsx";
import { Container, PageHeader } from "../components/ui/Section.tsx";
import { formatGuideNumber } from "../domain/index.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useGuideLookup } from "../hooks/useGuideLookup.ts";
import type { LookupResult } from "../hooks/useGuideLookup.ts";
import { readGuideParam, trackingPath } from "../lib/routes.ts";

function InvalidGuide({ number }: { number: string }) {
  return (
    <article aria-label={`Guía ${number} con formato incorrecto`} className="invalid-guide">
      <CircleAlert className="invalid-guide__icon" aria-hidden="true" />
      <div className="invalid-guide__body">
        <h3 className="invalid-guide__title">{number}</h3>
        <p className="invalid-guide__text">
          Este número no tiene el formato correcto: son 16 dígitos que inician con 21, o 22 caracteres alfanuméricos.
        </p>
      </div>
    </article>
  );
}

function ResultItem({ result }: { result: LookupResult }) {
  switch (result.kind) {
    case "found":
      return <GuideResultCard guide={result.guide} />;
    case "missing":
      return <TrackingNotFound number={result.number} />;
    case "invalid":
      return <InvalidGuide number={result.number} />;
  }
}

function summary(results: LookupResult[]): string {
  const found = results.filter((result) => result.kind === "found").length;
  if (results.length === 1) {
    const [only] = results;
    if (only?.kind === "found") return "Encontramos tu guía.";
    if (only?.kind === "missing") return "No encontramos esa guía.";
    return "Revisa el formato del número.";
  }
  return `Encontramos ${String(found)} de ${String(results.length)} guías.`;
}

export default function Tracking() {
  useDocumentTitle("Rastrea tu paquete");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const raw = params.get("guia");
  const { numbers, total } = useMemo(() => readGuideParam(raw), [raw]);
  const lookup = useGuideLookup(numbers);

  return (
    <>
      <PageHeader
        eyebrow="Rastreo"
        title="Rastrea tu paquete"
        description="Escribe tu número de guía y mira en cuál de las cinco etapas va tu envío."
      />

      <Container className="tracking-page">
        <div className="tracking-page__search">
          <TrackingSearch
            initialValue={numbers.map(formatGuideNumber).join("\n")}
            onSearch={(found) => {
              void navigate(trackingPath(found));
            }}
          />
        </div>

        {/* Antes de buscar, las guías de ejemplo invitan a probar; después, primero va el resultado. */}
        {lookup.status === "idle" ? <DemoNotice /> : null}

        <section aria-labelledby="resultados" aria-live="polite" className="tracking-page__results">
          {lookup.status === "idle" ? (
            <div className="empty-state">
              <PackageSearch className="empty-state__icon" aria-hidden="true" />
              <h2 id="resultados" className="empty-state__title">
                Aquí verás el resultado
              </h2>
              <p className="empty-state__text">
                Escribe tu número de guía arriba. ¿No lo tienes? Lo encuentras en la página donde compraste, y muchas
                veces llega por correo.{" "}
                <Link to="/preguntas" className="text-link">
                  Ver preguntas frecuentes
                </Link>
                .
              </p>
            </div>
          ) : null}

          {lookup.status === "loading" ? (
            <div className="loading-state">
              <LoaderCircle className="loading-state__icon" aria-hidden="true" />
              <h2 id="resultados" className="loading-state__label">
                Buscando tu guía…
              </h2>
            </div>
          ) : null}

          {lookup.status === "error" ? (
            <div className="error-panel">
              <div className="error-panel__header">
                <CircleAlert className="error-panel__icon" aria-hidden="true" />
                <div className="error-panel__body">
                  <h2 id="resultados" className="error-panel__title">
                    No pudimos consultar tu guía
                  </h2>
                  <p className="error-panel__text">{lookup.message}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={lookup.retry}>
                Intentar de nuevo
              </Button>
            </div>
          ) : null}

          {lookup.status === "done" ? (
            <>
              <h2 id="resultados" className="tracking-page__title">
                Resultado <span className="visually-hidden">de tu búsqueda</span>
              </h2>
              <p className="tracking-page__summary">
                {summary(lookup.results)}
                {total > numbers.length
                  ? ` La dirección traía ${String(total)} guías y solo se buscan las primeras ${String(numbers.length)}.`
                  : ""}
              </p>
              {lookup.results.map((result) => (
                <ResultItem key={result.number} result={result} />
              ))}
            </>
          ) : null}
        </section>

        {lookup.status === "idle" ? null : <DemoNotice />}
      </Container>
    </>
  );
}
