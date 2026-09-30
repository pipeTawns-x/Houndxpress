import { Link } from "react-router";
import { Clock, Mail, Phone } from "lucide-react";
import { ACADEMIC_NOTE, CONTACTS, HOURS, NAV_ITEMS, TAGLINE } from "../../content/site.ts";
import { telHref } from "../../lib/format.ts";
import { ApiStatus } from "../ui/ApiStatus.tsx";
import { Container } from "../ui/Section.tsx";

const linkClasses = "rounded text-navy-300 transition-colors duration-200 hover:text-white";

export function Footer({ inert }: { inert?: boolean }) {
  return (
    <footer inert={inert} className="on-dark bg-navy-950 text-navy-300">
      <Container className="grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-[1.3fr_0.8fr_1.6fr_1fr] lg:gap-12">
        <div className="flex flex-col items-start gap-4">
          <img src="/brand/logo-hound-express-blanco.svg" alt="Hound Express" width="130" height="45" className="h-11 w-auto" />
          <p lang="en" className="font-display text-lg font-bold text-white">
            {TAGLINE}
          </p>
          <p className="max-w-xs text-label">
            Logística y comercio internacional para ecommerce, entre Estados Unidos y Latinoamérica.
          </p>
          <ApiStatus tone="dark" />
        </div>

        <nav aria-label="Pie de página">
          <h2 className="mb-4 font-display text-base font-bold text-white">Explora</h2>
          <ul className="flex flex-col gap-2.5 text-label">
            {NAV_ITEMS.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={linkClasses}>
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link to="/panel" className={linkClasses}>
                Panel de operaciones
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-4 font-display text-base font-bold text-white">Contacto</h2>
          <ul className="flex flex-col gap-5 text-label">
            {CONTACTS.map((contact) => (
              <li key={contact.id} className="flex flex-col gap-1.5">
                <p className="font-semibold text-white">
                  {contact.country} <span className="font-normal text-navy-300">· {contact.place}</span>
                </p>
                <a href={telHref(contact.phone)} className={`${linkClasses} inline-flex items-center gap-2`}>
                  <Phone className="size-4 shrink-0 text-aqua-500" aria-hidden="true" />
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className={`${linkClasses} inline-flex items-center gap-2 break-all`}>
                  <Mail className="size-4 shrink-0 text-aqua-500" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 font-display text-base font-bold text-white">Horario</h2>
          <ul className="flex flex-col gap-3 text-label">
            {HOURS.map((row) => (
              <li key={row.days} className="flex items-start gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 text-aqua-500" aria-hidden="true" />
                <span>
                  <span className="block font-semibold text-white">{row.days}</span>
                  {row.time}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <div className="border-t border-navy-700">
        <Container className="py-6">
          <p className="text-label">{ACADEMIC_NOTE}</p>
        </Container>
      </div>
    </footer>
  );
}
