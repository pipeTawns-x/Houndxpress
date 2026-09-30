import { useState } from "react";
import { Link } from "react-router";
import { Search, SearchX } from "lucide-react";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { FaqAnswer } from "../components/ui/FaqAnswer.tsx";
import { TextField } from "../components/ui/fields.tsx";
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
      <Container className="flex max-w-4xl flex-col gap-8 py-14 md:py-20">
        <div className="flex flex-col gap-3">
          <div className="relative">
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
              className="pl-12"
              aria-describedby="faq-count"
            />
            <Search className="pointer-events-none absolute bottom-3.5 left-4 size-5 text-muted" aria-hidden="true" />
          </div>
          <p id="faq-count" role="status" className="text-label text-muted">
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
          <div className="flex flex-col items-center gap-4 rounded-3xl bg-surface px-6 py-14 text-center">
            <SearchX className="size-10 text-aqua-700" aria-hidden="true" />
            <h2 className="text-h3 font-bold">No encontramos preguntas con “{query.trim()}”</h2>
            <p className="max-w-md text-base text-muted">
              Prueba con otras palabras o cuéntanos tu duda y te respondemos.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink to="/contacto">Escríbenos</ButtonLink>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                }}
                className="inline-flex h-10 items-center rounded-xl px-4 text-sm font-semibold text-navy-800 hover:bg-navy-800/5"
              >
                Ver todas las preguntas
              </button>
            </div>
          </div>
        )}

        <p className="text-base text-muted">
          ¿Ya tienes tu número de guía?{" "}
          <Link to="/rastreo" className="font-semibold text-aqua-700 underline underline-offset-2 hover:text-navy-800">
            Rastrea tu paquete
          </Link>
          .
        </p>
      </Container>
    </>
  );
}
