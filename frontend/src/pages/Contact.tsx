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
      <Container className="grid gap-10 py-14 md:py-20 lg:grid-cols-[1.5fr_1fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <h2 className="text-h2 font-bold">Escríbenos</h2>
          <p className="text-base text-muted">
            Para información de tu paquete, elige “Seguimiento de paquete” y escribe tu número de guía.
          </p>
          <ContactForm />
        </div>

        <aside aria-label="Datos de contacto" className="flex flex-col gap-5 lg:pt-14">
          <h2 className="sr-only">Teléfonos, correos y horario</h2>
          <ul className="flex flex-col gap-5">
            {CONTACTS.map((contact) => (
              <li key={contact.id} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line">
                <div>
                  <h3 className="text-h3 font-bold">{contact.country}</h3>
                  <p className="text-label text-muted">{contact.place}</p>
                </div>
                <a
                  href={telHref(contact.phone)}
                  className="inline-flex items-center gap-2 text-base font-semibold text-navy-800 hover:text-aqua-700"
                >
                  <Phone className="size-4 shrink-0 text-aqua-700" aria-hidden="true" />
                  {contact.phone}
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex items-center gap-2 text-base break-all text-navy-800 hover:text-aqua-700"
                >
                  <Mail className="size-4 shrink-0 text-aqua-700" aria-hidden="true" />
                  {contact.email}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-3 rounded-2xl bg-surface p-6">
            <h3 className="flex items-center gap-2 text-h3 font-bold">
              <Clock className="size-5 text-aqua-700" aria-hidden="true" />
              Horario
            </h3>
            <ul className="flex flex-col gap-1 text-base">
              {HOURS.map((row) => (
                <li key={row.days} className="flex justify-between gap-4">
                  <span className="text-muted">{row.days}</span>
                  <span className="font-semibold text-navy-800 tabular-nums">{row.time}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </Container>
    </>
  );
}
