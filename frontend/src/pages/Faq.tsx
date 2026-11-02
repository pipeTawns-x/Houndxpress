import { useState } from "react";
import { Link } from "react-router";
import { Search, SearchX } from "lucide-react";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { FaqAnswer } from "../components/ui/FaqAnswer.tsx";
import { TextField } from "../components/ui/fields.tsx";
import { buttonClasses } from "../components/ui/buttonStyles.ts";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Container, PageHeader } from "../components/ui/Section.tsx";
import { FAQ } from "../content/faq.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { filterFaq } from "../lib/faqSearch.ts";

export default function Faq() {
  useDocumentTitle("Preguntas frecuentes");
  const [query, setQuery] = useState("");
  const results = filterFaq(FAQ, query);
  const filtering = query.trim() !== "";

  return (
    <>
      <PageHeader
        eyebrow="Preguntas frecuentes"
        title="Respuestas a las consultas más comunes"
        description="Si no encuentras lo que necesitas, escríbenos y nuestro equipo de soporte te ayudará."
      />
      <Container className="faq-page">
        <div className="faq-page__search">
          <div className="faq-page__search-field">
            <TextField
              label="Buscar en las preguntas"
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Ej. aduana, domicilio, recoger…"
              autoComplete="off"
              required={false}
              className="faq-page__input"
              aria-describedby="faq-count"
            />
            <Search className="faq-page__search-icon" aria-hidden="true" />
          </div>
          <p id="faq-count" role="status" className="faq-page__count">
            {filtering
              ? `${String(results.length)} de ${String(FAQ.length)} preguntas coinciden con tu búsqueda.`
              : `${String(FAQ.length)} preguntas.`}
          </p>
        </div>

        {results.length > 0 ? (
          <Accordion>
            {results.map((entry) => (
              <AccordionItem key={entry.id} question={entry.question}>
                <FaqAnswer entry={entry} />
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="empty-state empty-state--tall">
            <SearchX className="empty-state__icon" aria-hidden="true" />
            <h2 className="empty-state__title">No encontramos preguntas con “{query.trim()}”</h2>
            <p className="empty-state__text">Prueba con otras palabras o cuéntanos tu duda y te respondemos.</p>
            <div className="empty-state__actions">
              <ButtonLink to="/contacto">Escríbenos</ButtonLink>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                }}
                className={buttonClasses({ variant: "ghost" })}
              >
                Ver todas las preguntas
              </button>
            </div>
          </div>
        )}

        <p className="faq-page__tracking">
          ¿Ya tienes tu número de guía?{" "}
          <Link to="/rastreo" className="text-link">
            Rastrea tu paquete
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
