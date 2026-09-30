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
    <article
      aria-label={`Guía ${number} con formato incorrecto`}
      className="flex items-start gap-3 rounded-2xl bg-danger-soft p-5 ring-1 ring-danger/30"
    >
      <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <h3 className="text-base font-bold break-all text-danger">{number}</h3>
        <p className="text-base text-ink">
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

      <Container className="relative z-10 -mt-10 flex flex-col gap-6 pb-16 md:pb-24">
        <div className="rounded-3xl bg-white p-5 shadow-lift ring-1 ring-line sm:p-8">
          <TrackingSearch
            initialValue={numbers.map(formatGuideNumber).join("\n")}
            onSearch={(found) => {
              void navigate(trackingPath(found));
            }}
          />
        </div>

        {/* Antes de buscar, las guías de ejemplo invitan a probar; después, primero va el resultado. */}
        {lookup.status === "idle" ? <DemoNotice /> : null}

        <section aria-labelledby="resultados" aria-live="polite" className="flex flex-col gap-6">
          {lookup.status === "idle" ? (
            <div className="flex flex-col items-center gap-3 rounded-3xl bg-surface px-6 py-12 text-center">
              <PackageSearch className="size-10 text-aqua-700" aria-hidden="true" />
              <h2 id="resultados" className="text-h3 font-bold">
                Aquí verás el resultado
              </h2>
              <p className="max-w-md text-base text-muted">
                Escribe tu número de guía arriba. ¿No lo tienes? Lo encuentras en la página donde compraste, y muchas
                veces llega por correo.{" "}
                <Link to="/preguntas" className="font-semibold text-aqua-700 underline underline-offset-2 hover:text-navy-800">
                  Ver preguntas frecuentes
                </Link>
                .
              </p>
            </div>
          ) : null}

          {lookup.status === "loading" ? (
            <div className="flex items-center justify-center gap-3 rounded-3xl bg-surface px-6 py-12 text-muted">
              <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
              <h2 id="resultados" className="text-base font-semibold text-muted">
                Buscando tu guía…
              </h2>
            </div>
          ) : null}

          {lookup.status === "error" ? (
            <div className="flex flex-col items-start gap-4 rounded-3xl bg-danger-soft p-6 ring-1 ring-danger/30">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <h2 id="resultados" className="text-h3 font-bold text-danger">
                    No pudimos consultar tu guía
                  </h2>
                  <p className="text-base text-ink">{lookup.message}</p>
                </div>
              </div>
              <Button variant="secondary" onClick={lookup.retry}>
                Intentar de nuevo
              </Button>
            </div>
          ) : null}

          {lookup.status === "done" ? (
            <>
              <h2 id="resultados" className="text-h2 font-bold">
                Resultado <span className="sr-only">de tu búsqueda</span>
              </h2>
              <p className="-mt-3 text-base text-muted">
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
