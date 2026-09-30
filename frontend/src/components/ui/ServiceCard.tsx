import type { LucideIcon } from "lucide-react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "react-router";

export interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  text: string;
  points?: readonly string[];
  /** Si se indica, el título enlaza a esa ruta. */
  to?: string;
  linkLabel?: string;
}

/** Tarjeta de servicio: icono en cuadro aqua suave, título, texto y lista de puntos. Se eleva al pasar el cursor. */
export function ServiceCard({ icon: Icon, title, text, points = [], to, linkLabel = "Conocer más" }: ServiceCardProps) {
  return (
    <article className="group flex h-full flex-col gap-4 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lift">
      <span className="flex size-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h3 className="text-h3 font-bold">{title}</h3>
        <p className="text-base text-muted">{text}</p>
      </div>
      {points.length > 0 ? (
        <ul className="flex flex-col gap-2 text-label text-ink">
          {points.map((point) => (
            <li key={point} className="flex items-start gap-2">
              <Check className="mt-0.5 size-4 shrink-0 text-aqua-700" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {to ? (
        <Link
          to={to}
          className="mt-auto inline-flex items-center gap-1.5 pt-2 text-label font-semibold text-aqua-700 hover:text-navy-800"
        >
          {linkLabel}
          <span className="sr-only"> sobre {title}</span>
          <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}
