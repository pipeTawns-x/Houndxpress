import { Clock, Mail, Phone } from "lucide-react";
import { ContactForm } from "../components/ContactForm.tsx";
import { Container, PageHeader } from "../components/ui/Section.tsx";
import { CONTACTS, HOURS } from "../content/site.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { telHref } from "../lib/format.ts";

export default function Contact() {
  useDocumentTitle("Contacto");
  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title="Estamos a un mensaje de distancia"
        description="Entendemos la importancia de mantener una comunicación efectiva. Elige el asunto y cuéntanos qué necesitas."
      />
      <Container className="contact-page">
        <div className="contact-page__main">
          <h2 className="contact-page__title">Escríbenos</h2>
          <p className="contact-page__intro">
            Para información de tu paquete, elige “Seguimiento de paquete” y escribe tu número de guía.
          </p>
          <ContactForm />
        </div>

        <aside aria-label="Datos de contacto" className="contact-page__aside">
          <h2 className="visually-hidden">Teléfonos, correos y horario</h2>
          <ul className="contact-page__cards">
            {CONTACTS.map((contact) => (
              <li key={contact.id} className="contact-card">
                <div>
                  <h3 className="contact-card__title">{contact.country}</h3>
                  <p className="contact-card__place">{contact.place}</p>
                </div>
                <a href={telHref(contact.phone)} className="contact-card__link contact-card__link--phone">
                  <Phone className="contact-card__icon" aria-hidden="true" />
                  {contact.phone}
                </a>
                <a href={`mailto:${contact.email}`} className="contact-card__link contact-card__link--email">
                  <Mail className="contact-card__icon" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            ))}
          </ul>
          <div className="hours-card">
            <h3 className="hours-card__title">
              <Clock className="hours-card__icon" aria-hidden="true" />
              Horario
            </h3>
            <ul className="hours-card__list">
              {HOURS.map((row) => (
                <li key={row.days} className="hours-card__row">
                  <span className="hours-card__days">{row.days}</span>
                  <span className="hours-card__time">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}
