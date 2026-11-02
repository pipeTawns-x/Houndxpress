import { useState } from "react";
import { PanelShell } from "../components/panel/PanelShell.tsx";
import { GuideLoadState } from "../components/panel/GuideLoadState.tsx";
import { GuidesTable } from "../components/panel/GuidesTable.tsx";
import { HistoryDrawer } from "../components/panel/HistoryDrawer.tsx";
import { useGuides } from "../hooks/useGuides.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { Button } from "../components/ui/Button.tsx";
export default function PanelRegistry() {
  useDocumentTitle("Registro de guías");
  const state = useGuides();
  const [historyNumber, setHistoryNumber] = useState<string | null>(null);
  const guide = state.guides.find(
    (item) => item.trackingNumber === historyNumber,
  );
  return (
    <PanelShell title="Registro de guías">
      <p>Consulta, filtra y actualiza las guías de la operación.</p>
      <Button variant="secondary" onClick={state.reload}>
        Actualizar guías
      </Button>
      <GuideLoadState {...state} />
      {state.status === "ready" ? (
        <section aria-label="Guías">
          <h2 className="visually-hidden">Guías</h2>
          <GuidesTable
            guides={state.guides}
            onAdvance={state.advance}
            onHistory={setHistoryNumber}
          />
        </section>
      ) : null}
      {guide ? (
        <HistoryDrawer guide={guide} onClose={() => setHistoryNumber(null)} />
      ) : null}
    </PanelShell>
  );
}
