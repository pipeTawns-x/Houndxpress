import { useState } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { GuidesTable } from "../components/panel/GuidesTable.tsx";
import { HistoryDrawer } from "../components/panel/HistoryDrawer.tsx";
import { RegisterGuideForm } from "../components/panel/RegisterGuideForm.tsx";
import { StageSummary } from "../components/panel/StageSummary.tsx";
import { ApiStatus } from "../components/ui/ApiStatus.tsx";
import { Button } from "../components/ui/Button.tsx";
import { DemoNotice } from "../components/ui/DemoNotice.tsx";
import { Container, PageHeader } from "../components/ui/Section.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { useGuides } from "../hooks/useGuides.ts";

/** Botón "Restablecer datos de ejemplo" con confirmación, porque borra lo que se haya registrado. */
function ResetDemo({ onReset }: { onReset: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);

  async function confirm() {
    setWorking(true);
    setFailed(false);
    try {
      await onReset();
      setConfirming(false);
    } catch {
      setFailed(true);
    } finally {
      setWorking(false);
    }
  }

  if (!confirming) {
    return (
      <Button
        variant="secondary"
        onClick={() => {
          setConfirming(true);
        }}
      >
        Restablecer datos de ejemplo
      </Button>
    );
  }
  return (
    <div role="group" aria-label="Confirmar restablecimiento" className="flex flex-col gap-3">
      <p className="text-label font-semibold text-ink">
        Se borrarán las guías que registraste y los avances que hiciste en este navegador. ¿Continuar?
      </p>
      {failed ? (
        <p role="alert" className="text-label font-semibold text-danger">
          No se pudo restablecer. Inténtalo de nuevo.
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          loading={working}
          onClick={() => {
            void confirm();
          }}
        >
          Sí, restablecer
        </Button>
        <Button
          variant="ghost"
          disabled={working}
          onClick={() => {
            setConfirming(false);
            setFailed(false);
          }}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
}

export default function Panel() {
  useDocumentTitle("Panel de operaciones");
  const { guides, status, error, create, advance, reset, reload } = useGuides();
  const [historyNumber, setHistoryNumber] = useState<string | null>(null);
  const openGuide = guides.find((guide) => guide.number === historyNumber);

  return (
    <>
      <PageHeader
        eyebrow="Operaciones"
        title="Panel de operaciones"
        description="Registra guías, avánzalas por las cinco etapas y consulta el historial de cada una. Solo se puede avanzar a la etapa siguiente."
      >
        <div className="mt-6">
          <ApiStatus tone="dark" />
        </div>
      </PageHeader>

      <Container className="flex flex-col gap-12 py-10 md:py-14">
        <DemoNotice>{reset ? <ResetDemo onReset={reset} /> : null}</DemoNotice>

        {status === "loading" ? (
          <div role="status" className="flex items-center justify-center gap-3 rounded-3xl bg-surface px-6 py-16 text-muted">
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
            Cargando guías…
          </div>
        ) : null}

        {status === "error" ? (
          <div role="alert" className="flex flex-col items-start gap-4 rounded-3xl bg-danger-soft p-6 ring-1 ring-danger/30">
            <div className="flex items-start gap-3">
              <CircleAlert className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden="true" />
              <div className="flex flex-col gap-1">
                <h2 className="text-h3 font-bold text-danger">No se pudieron cargar las guías</h2>
                <p className="text-base text-ink">{error}</p>
              </div>
            </div>
            <Button variant="secondary" onClick={reload}>
              Intentar de nuevo
            </Button>
          </div>
        ) : null}

        {status === "ready" ? (
          <>
            <StageSummary guides={guides} />

            <section aria-labelledby="registrar" className="flex flex-col gap-5">
              <h2 id="registrar" className="text-h2 font-bold">
                Registrar guía
              </h2>
              <div className="rounded-3xl bg-white p-5 shadow-soft ring-1 ring-line sm:p-8">
                <RegisterGuideForm existingNumbers={guides.map((guide) => guide.number)} onCreate={create} />
              </div>
            </section>

            <section aria-labelledby="lista" className="flex flex-col gap-5">
              <h2 id="lista" className="text-h2 font-bold">
                Guías
              </h2>
              <GuidesTable guides={guides} onAdvance={advance} onHistory={setHistoryNumber} />
            </section>
          </>
        ) : null}
      </Container>

      {openGuide ? (
        <HistoryDrawer
          guide={openGuide}
          onClose={() => {
            setHistoryNumber(null);
          }}
        />
      ) : null}
    </>
  );
}
