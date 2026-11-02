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
    <article className="service-card">
      <span className="service-card__icon-box">
        <Icon className="service-card__icon" aria-hidden="true" />
      </span>
      <div className="service-card__body">
        <h3 className="service-card__title">{title}</h3>
        <p className="service-card__text">{text}</p>
      </div>
      {points.length > 0 ? (
        <ul className="service-card__points">
          {points.map((point) => (
            <li key={point} className="service-card__point">
              <Check className="service-card__check" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {to ? (
        <Link to={to} className="service-card__link">
          {linkLabel}
          <span className="visually-hidden"> sobre {title}</span>
          <ArrowRight className="service-card__arrow" aria-hidden="true" />
        </Link>
      ) : null}
    </article>
  );
}
