import { LostPackageIllustration } from "../components/illustrations/LostPackage.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Container } from "../components/ui/Section.tsx";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";

export default function NotFound() {
  useDocumentTitle("Página no encontrada");
  return (
    <Container className="flex flex-col items-center gap-8 py-20 text-center md:py-28">
      <LostPackageIllustration className="w-56 sm:w-64" />
      <div className="flex max-w-lg flex-col gap-3">
        <p className="eyebrow text-aqua-700">Error 404</p>
        <h1 className="text-h1 font-extrabold tracking-tight">Esta página no está en la ruta</h1>
        <p className="text-lead text-muted">
          La dirección que abriste no existe o cambió de lugar. Vuelve al inicio o rastrea tu paquete desde aquí.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
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
