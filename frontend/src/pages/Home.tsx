import { Link, useNavigate } from "react-router";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { HeroVideo } from "../components/brand/HeroVideo.tsx";
import { ServiceGallery } from "../components/brand/ServiceGallery.tsx";
import { NetworkMap } from "../components/illustrations/NetworkMap.tsx";
import { TrackingSearch } from "../components/tracking/TrackingSearch.tsx";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { FaqAnswer } from "../components/ui/FaqAnswer.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { FAQ, FEATURED_FAQ_IDS } from "../content/faq.ts";
import { STAGES } from "../domain/index.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { trackingPath } from "../lib/routes.ts";

export default function Home() {
  useDocumentTitle("Logística cross-border para ecommerce");
  const navigate = useNavigate();
  return (
    <>
      <section className="brand-hero" aria-labelledby="titulo-inicio">
        <HeroVideo />
        <div className="container brand-hero__inner">
          <div className="brand-hero__top">
            <p>Hound Express</p>
            <p>Estados Unidos ↔ Latinoamérica</p>
          </div>
          <h1
            id="titulo-inicio"
            aria-label="Movemos tu ecommerce de local a global."
            className="brand-hero__title"
          >
            <span>Movemos tu</span>
            <span>ecommerce</span>
            <span>
              de local a <em>global.</em>
            </span>
          </h1>
          <div className="brand-hero__bottom">
            <p>
              Logística y comercio internacional.
              <br />
              Conectamos tu negocio con su próximo destino.
            </p>
            <div className="brand-hero__tracking">
              <TrackingSearch
                onSearch={(numbers) => {
                  void navigate(trackingPath(numbers));
                }}
              />
              <p>Tu número está en el correo de tu compra.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="freight-journey" aria-labelledby="titulo-recorrido">
        <div className="container freight-journey__layout">
          <div className="freight-journey__intro">
            <p className="eyebrow">Un recorrido trazable</p>
            <h2 id="titulo-recorrido">
              Cinco etapas.
              <br />
              Ningún paso
              <br />
              se queda atrás.
            </h2>
            <p>Cada avance tiene una etapa y un departamento responsable. Siempre en el mismo orden.</p>
            <Link to="/rastreo" className="text-link">
              Rastrear mi paquete <ArrowRight aria-hidden="true" size={18} />
            </Link>
          </div>
          <ol className="freight-journey__steps">
            {STAGES.map((stage) => (
              <li key={stage.code} className="freight-journey__step">
                <span className="freight-journey__number">0{stage.order}</span>
                <div>
                  <p className="freight-journey__department">{stage.department}</p>
                  <h3>{stage.label}</h3>
                  <p>{stage.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <section className="freight-coverage container" aria-labelledby="titulo-cobertura">
        <div className="freight-coverage__heading">
          <p className="eyebrow">Una red, más destinos</p>
          <h2 id="titulo-cobertura">
            Conectamos
            <br />
            Estados Unidos
            <br />
            <span>y Latinoamérica.</span>
          </h2>
          <p>Miami conecta con LATAM. Laredo conecta con México. Una red diseñada para tu ecommerce.</p>
          <ButtonLink to="/cobertura" variant="secondary">
            Explorar cobertura <ArrowUpRight size={18} aria-hidden="true" />
          </ButtonLink>
        </div>
        <div className="freight-coverage__visual">
          <img
            src="/media/cobertura-frontera.webp"
            width={1344}
            height={752}
            loading="lazy"
            alt="Vista ilustrativa de un corredor carretero entre el desierto y una ciudad"
          />
          <div className="freight-coverage__map">
            <NetworkMap />
          </div>
          <p>Laredo · Miami · México · Latinoamérica</p>
        </div>
      </section>
      <ServiceGallery />
      <section className="freight-about" aria-labelledby="titulo-nosotros">
        <div className="container freight-about__layout">
          <div className="freight-about__image">
            <img
              src="/media/nosotros-operacion.webp"
              width={1344}
              height={752}
              loading="lazy"
              alt="Vista ilustrativa de una sala de control logístico"
            />
          </div>
          <div className="freight-about__copy">
            <p className="eyebrow eyebrow--dark">Somos Hound Express</p>
            <h2 id="titulo-nosotros">
              Detrás de cada envío,
              <br />
              hay una operación
              <br />
              que lo hace posible.
            </h2>
            <p>
              Tecnología, aduanas y comercio exterior en un solo socio. Soluciones logísticas que conectan
              negocios con el mundo.
            </p>
            <ButtonLink to="/nosotros" variant="secondary" tone="dark">
              Conoce Hound Express <ArrowUpRight size={18} aria-hidden="true" />
            </ButtonLink>
          </div>
        </div>
      </section>
      <section className="freight-support container" aria-labelledby="titulo-preguntas">
        <div>
          <p className="eyebrow">Respuestas claras</p>
          <h2 id="titulo-preguntas">
            Tu envío.
            <br />
            Tus preguntas.
          </h2>
          <Link to="/preguntas" className="text-link">
            Ver todas las preguntas
          </Link>
        </div>
        <Accordion>
          {FEATURED_FAQ_IDS.flatMap((id) => FAQ.find((entry) => entry.id === id) ?? []).map((entry) => (
            <AccordionItem key={entry.id} question={entry.question}>
              <FaqAnswer entry={entry} />
            </AccordionItem>
          ))}
        </Accordion>
      </section>
      <section className="freight-contact container" aria-labelledby="titulo-contacto">
        <div>
          <p className="eyebrow">Hablemos de tu próximo destino</p>
          <h2 id="titulo-contacto">
            Tu negocio no termina
            <br />
            en la frontera.
          </h2>
        </div>
        <ButtonLink to="/contacto" size="lg">
          Contactar al equipo <ArrowUpRight aria-hidden="true" />
        </ButtonLink>
      </section>
    </>
  );
}
