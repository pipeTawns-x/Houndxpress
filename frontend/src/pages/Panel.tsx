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
    <div role="group" aria-label="Confirmar restablecimiento" className="reset-demo">
      <p className="reset-demo__text">
        Se borrarán las guías que registraste y los avances que hiciste en este navegador. ¿Continuar?
      </p>
      {failed ? (
        <p role="alert" className="reset-demo__error">
          No se pudo restablecer. Inténtalo de nuevo.
        </p>
      ) : null}
      <div className="reset-demo__actions">
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
        <div className="page-header__extra">
          <ApiStatus tone="dark" />
        </div>
      </PageHeader>

      <Container className="panel-page">
        <DemoNotice>{reset ? <ResetDemo onReset={reset} /> : null}</DemoNotice>

        {status === "loading" ? (
          <div role="status" className="loading-state loading-state--tall">
            <LoaderCircle className="loading-state__icon" aria-hidden="true" />
            Cargando guías…
          </div>
        ) : null}

        {status === "error" ? (
          <div role="alert" className="error-panel">
            <div className="error-panel__header">
              <CircleAlert className="error-panel__icon" aria-hidden="true" />
              <div className="error-panel__body">
                <h2 className="error-panel__title">No se pudieron cargar las guías</h2>
                <p className="error-panel__text">{error}</p>
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

            <section aria-labelledby="registrar" className="panel-page__section">
              <h2 id="registrar" className="panel-page__title">
                Registrar guía
              </h2>
              <div className="panel-page__card">
                <RegisterGuideForm existingNumbers={guides.map((guide) => guide.number)} onCreate={create} />
              </div>
            </section>

            <section aria-labelledby="lista" className="panel-page__section">
              <h2 id="lista" className="panel-page__title">
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
