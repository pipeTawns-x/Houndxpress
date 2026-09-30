import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { TriangleAlert } from "lucide-react";
import { Button } from "../ui/Button.tsx";
import { ButtonLink } from "../ui/ButtonLink.tsx";
import { Container } from "../ui/Section.tsx";

interface State {
  failed: boolean;
}

/**
 * Evita la pantalla en blanco si una pantalla falla al cargar (por ejemplo, sin
 * conexión al pedir el panel) o lanza un error al dibujarse. Cambia de ruta para
 * salir de él: el diseño de página lo monta con `key` igual a la ruta.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  override state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  override componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Error al dibujar la pantalla:", error, info.componentStack);
  }

  override render(): ReactNode {
    if (!this.state.failed) return this.props.children;
    return (
      <Container className="flex flex-col items-center gap-6 py-20 text-center md:py-28">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <TriangleAlert className="size-7" aria-hidden="true" />
        </span>
        <div className="flex max-w-lg flex-col gap-3">
          <h1 className="text-h1 font-extrabold tracking-tight">No pudimos mostrar esta pantalla</h1>
          <p className="text-lead text-muted">
            Puede ser un problema de conexión. Recarga la página; si sigue igual, vuelve al inicio.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={() => {
              window.location.reload();
            }}
          >
            Recargar la página
          </Button>
          <ButtonLink to="/" size="lg" variant="secondary">
            Ir al inicio
          </ButtonLink>
        </div>
      </Container>
    );
  }
}
