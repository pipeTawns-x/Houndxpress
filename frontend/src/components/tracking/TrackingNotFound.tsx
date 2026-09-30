import { Link } from "react-router";
import { formatGuideNumber } from "../../domain/index.ts";
import { isDemoData } from "../../services/index.ts";
import { LostPackageIllustration } from "../illustrations/LostPackage.tsx";

/** Estado vacío de una guía que no existe: pasos tomados de las preguntas frecuentes. */
export function TrackingNotFound({ number }: { number: string }) {
  return (
    <article aria-label={`Guía ${formatGuideNumber(number)} no encontrada`} className="guide-not-found">
      <LostPackageIllustration className="guide-not-found__art" />
      <div className="guide-not-found__content">
        <div className="guide-not-found__intro">
          <p className="eyebrow eyebrow--danger">Guía no encontrada</p>
          <h3 className="guide-not-found__title">No encontramos la guía {formatGuideNumber(number)}</h3>
          <p className="guide-not-found__text">
            El formato es correcto, pero no hay ninguna guía registrada con ese número
            {isDemoData ? " en los datos de demostración." : "."}
          </p>
        </div>
        <ol className="guide-not-found__steps">
          <li>Confirma que el número esté completo: 16 dígitos que inician con 21, o 22 caracteres.</li>
          <li>Búscalo en la página web donde compraste tu producto; en ocasiones te lo envían por correo.</li>
          <li>
            Si sigue sin aparecer, <Link to="/contacto" className="text-link">escríbenos</Link>{" "}
            con tu número de guía.
          </li>
        </ol>
      </div>
    </article>
  );
}
