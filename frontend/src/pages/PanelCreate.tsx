import { PanelShell } from "../components/panel/PanelShell.tsx";
import { RegisterGuideForm } from "../components/panel/RegisterGuideForm.tsx";
import { GuideLoadState } from "../components/panel/GuideLoadState.tsx";
import { useGuides } from "../hooks/useGuides.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
export default function PanelCreate() {
  useDocumentTitle("Alta de guía");
  const state = useGuides();
  return (
    <PanelShell title="Alta de guía">
      <p>Registra un envío para comenzar su recorrido.</p>
      <GuideLoadState {...state} />
      {state.status === "ready" ? (
        <div className="panel-app__creation">
          <RegisterGuideForm
            existingNumbers={state.guides.map((g) => g.trackingNumber)}
            onCreate={state.create}
          />
          <aside>
            <h2>El inicio del recorrido</h2>
            <p>
              La guía se registra en Recepción de carga. Después solo puede
              avanzar a la etapa siguiente.
            </p>
            <p>Revisa el número, la ruta y el destinatario antes de guardar.</p>
          </aside>
        </div>
      ) : null}
    </PanelShell>
  );
}
