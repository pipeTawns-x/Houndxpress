import { Link } from "react-router";
import { formatGuideNumber } from "../../domain/index.ts";
import { isDemoData } from "../../services/index.ts";
import { LostPackageIllustration } from "../illustrations/LostPackage.tsx";

/** Estado vacío de una guía que no existe: pasos tomados de las preguntas frecuentes. */
export function TrackingNotFound({ number }: { number: string }) {
  return (
    <article
      aria-label={`Guía ${formatGuideNumber(number)} no encontrada`}
      className="flex flex-col items-center gap-6 rounded-3xl bg-white p-6 text-center shadow-soft ring-1 ring-line sm:p-10 md:flex-row md:text-left"
    >
      <LostPackageIllustration className="w-44 shrink-0 sm:w-52" />
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <p className="eyebrow text-danger">Guía no encontrada</p>
          <h3 className="text-h3 font-bold tabular-nums">No encontramos la guía {formatGuideNumber(number)}</h3>
          <p className="text-base text-muted">
            El formato es correcto, pero no hay ninguna guía registrada con ese número
            {isDemoData ? " en los datos de demostración." : "."}
          </p>
        </div>
        <ol className="flex list-decimal flex-col gap-2 pl-5 text-left text-base text-ink marker:font-semibold marker:text-aqua-700">
          <li>Confirma que el número esté completo: 16 dígitos que inician con 21, o 22 caracteres.</li>
          <li>Búscalo en la página web donde compraste tu producto; en ocasiones te lo envían por correo.</li>
          <li>
            Si sigue sin aparecer, <Link to="/contacto" className="font-semibold text-aqua-700 underline underline-offset-2 hover:text-navy-800">escríbenos</Link>{" "}
            con tu número de guía.
          </li>
        </ol>
      </div>
    </article>
  );
}
