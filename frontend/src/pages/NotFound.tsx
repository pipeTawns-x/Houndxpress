import { LostPackageIllustration } from "../components/illustrations/LostPackage.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Container } from "../components/ui/Section.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";

export default function NotFound() {
  useDocumentTitle("Página no encontrada");
  return (
    <Container className="not-found">
      <LostPackageIllustration className="not-found__art" />
      <div className="not-found__copy">
        <p className="eyebrow">Error 404</p>
        <h1 className="not-found__title">Esta página no está en la ruta</h1>
        <p className="not-found__text">
          La dirección que abriste no existe o cambió de lugar. Vuelve al inicio o rastrea tu paquete desde aquí.
        </p>
      </div>
      <div className="not-found__actions">
        <ButtonLink to="/" size="lg">
          Ir al inicio
        </ButtonLink>
        <ButtonLink to="/rastreo" size="lg" variant="secondary">
          Rastrear un paquete
        </ButtonLink>
      </div>
    </Container>
  );
}
