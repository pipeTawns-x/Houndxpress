import { Link } from "react-router";
import { Clock, Mail, Phone } from "lucide-react";
import { ACADEMIC_NOTE, CONTACTS, HOURS, NAV_ITEMS, TAGLINE } from "../../content/site.ts";
import { telHref } from "../../lib/format.ts";
import { ApiStatus } from "../ui/ApiStatus.tsx";
import { Container } from "../ui/Section.tsx";

export function Footer({ inert }: { inert?: boolean }) {
  return (
    <footer inert={inert} className="site-footer">
      <Container className="site-footer__grid">
        <div className="site-footer__brand">
          <img
            src="/brand/logo-hound-express-blanco.svg"
            alt="Hound Express"
            width="130"
            height="45"
            className="site-footer__logo"
          />
          <p lang="en" className="site-footer__tagline">
            {TAGLINE}
          </p>
          <p className="site-footer__blurb">
            Logística y comercio internacional para ecommerce, entre Estados Unidos y Latinoamérica.
          </p>
          <ApiStatus tone="dark" />
        </div>

        <nav aria-label="Pie de página">
          <h2 className="site-footer__heading">Explora</h2>
          <ul className="site-footer__list">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="site-footer__link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/panel" className="site-footer__link">
                Panel de operaciones
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="site-footer__heading">Contacto</h2>
          <ul className="site-footer__list site-footer__list--contacts">
            {CONTACTS.map((contact) => (
              <li key={contact.id} className="site-footer__contact">
                <p className="site-footer__country">
                  {contact.country} <span className="site-footer__place">· {contact.place}</span>
                </p>
                <a href={telHref(contact.phone)} className="site-footer__link site-footer__link--icon">
                  <Phone className="site-footer__icon" aria-hidden="true" />
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="site-footer__link site-footer__link--icon site-footer__link--wrap"
                >
                  <Mail className="site-footer__icon" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="site-footer__heading">Horario</h2>
          <ul className="site-footer__list site-footer__list--hours">
            {HOURS.map((row) => (
              <li key={row.days} className="site-footer__hours">
                <Clock className="site-footer__icon site-footer__icon--clock" aria-hidden="true" />
                <span>
                  <span className="site-footer__days">{row.days}</span>
                  {row.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="site-footer__bottom">
        <Container className="site-footer__bottom-inner">
          <p className="site-footer__note">{ACADEMIC_NOTE}</p>
        </Container>
      </div>
    </footer>
  );
}
