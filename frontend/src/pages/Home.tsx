import { Link, useNavigate } from "react-router";
import { ArrowRight, Check, LayoutDashboard, Phone, TriangleAlert } from "lucide-react";
import { HeroIllustration } from "../components/illustrations/HeroIllustration.tsx";
import { NetworkMap } from "../components/illustrations/NetworkMap.tsx";
import { TrackingSearch } from "../components/tracking/TrackingSearch.tsx";
import { Accordion, AccordionItem } from "../components/ui/Accordion.tsx";
import { ButtonAnchor, ButtonLink } from "../components/ui/ButtonLink.tsx";
import { FaqAnswer } from "../components/ui/FaqAnswer.tsx";
import { Container, Section, SectionHeader } from "../components/ui/Section.tsx";
import { ServiceCard } from "../components/ui/ServiceCard.tsx";
import { StageBadge } from "../components/ui/StageBadge.tsx";
import { StatCard } from "../components/ui/StatCard.tsx";
import { HUBS } from "../content/coverage.ts";
import { FAQ, FEATURED_FAQ_IDS } from "../content/faq.ts";
import { ALLIANCES, CONTACTS, STATS } from "../content/site.ts";
import { SERVICES } from "../content/services.ts";
import { STAGES } from "../domain/index.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { telHref } from "../lib/format.ts";
import { trackingPath } from "../lib/routes.ts";
import { DEMO_GUIDE_NUMBERS } from "../services/demoData.ts";
import { isDemoData } from "../services/index.ts";

function Hero() {
  const navigate = useNavigate();
  return (
    <section aria-labelledby="titulo-inicio" className="hero">
      <div aria-hidden="true" className="hero__glow" />
      <HeroIllustration className="hero__art" />
      <Container className="hero__container">
        <div className="hero__content">
          <div className="hero__intro">
            <p className="eyebrow eyebrow--dark">Logística cross-border para ecommerce</p>
            <h1 id="titulo-inicio" className="hero__title">
              Movemos tu ecommerce de local a global
            </h1>
            <p className="hero__lead">
              Expertos en logística y comercio internacional. Conectamos tu negocio con Estados Unidos y Latinoamérica, y
              te mostramos en qué etapa va cada envío.
            </p>
          </div>

          <div className="hero__search">
            <TrackingSearch
              examples={isDemoData ? DEMO_GUIDE_NUMBERS.slice(0, 2) : []}
              onSearch={(numbers) => {
                void navigate(trackingPath(numbers));
              }}
            />
          </div>

          <div className="hero__notes">
            <p>¿No tienes tu número? Está en el correo de tu compra.</p>
            {isDemoData ? (
              <p className="hero__demo">
                <TriangleAlert className="hero__demo-icon" aria-hidden="true" />
                <span>
                  <strong className="hero__demo-title">Datos de demostración:</strong> las guías de ejemplo no
                  son reales y se guardan solo en este navegador.
                </span>
              </p>
            ) : null}
          </div>
        </div>
      </Container>
    </section>
  );
}

function Stats() {
  return (
    <section aria-label="Hound Express en cifras" className="stats">
      <Container>
        <ul className="stats__list">
          {STATS.map((stat) => (
            <li key={stat.label}>
              <StatCard value={stat.value} label={stat.label} description={stat.description} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

function ServicesSection() {
  return (
    <Section aria-labelledby="titulo-servicios">
      <div className="section__stack">
        <SectionHeader
          id="titulo-servicios"
          eyebrow="Servicios"
          title="Todo lo que tu ecommerce necesita para cruzar fronteras"
          description="Desarrollamos las soluciones logísticas y aduanales para que tu ecommerce compita a nivel internacional, con toda tu operación en un solo sistema."
        />
        <ul className="card-grid">
          {SERVICES.map((service) => (
            <li key={service.id}>
              <ServiceCard
                icon={service.icon}
                title={service.title}
                text={service.summary}
                points={service.highlights.map((item) => `${item.value} ${item.label}`)}
                to={`/servicios#${service.id}`}
              />
            </li>
          ))}
          <li>
            <div className="promo-card">
              <div className="promo-card__body">
                <h3 className="promo-card__title">Tu ecommerce merece más que envíos</h3>
                <p className="promo-card__text">
                  Merece una logística que cuide cada detalle. Conoce todos los servicios y cuéntanos qué necesitas.
                </p>
              </div>
              <ButtonLink to="/servicios" tone="dark" variant="secondary" className="promo-card__action">
                Ver todos los servicios
                <ArrowRight className="button__icon" aria-hidden="true" />
              </ButtonLink>
            </div>
          </li>
        </ul>
      </div>
    </Section>
  );
}

function JourneySection() {
  return (
    <Section tone="surface" aria-labelledby="titulo-recorrido">
      <div className="section__stack">
        <SectionHeader
          id="titulo-recorrido"
          eyebrow="Seguimiento"
          title="Cómo viaja tu paquete"
          description="Cada guía pasa por cinco etapas, siempre en el mismo orden. Cada etapa la registra un departamento responsable."
        />
        <ol className="journey__list">
          {STAGES.map((stage) => (
            <li key={stage.code} className="journey__step">
              <span className="journey__number">{stage.order}</span>
              <h3 className="journey__title">{stage.label}</h3>
              <p className="journey__owner">Responsable: {stage.department}</p>
              <p className="journey__text">{stage.description}</p>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

function CoverageSection() {
  return (
    <Section aria-labelledby="titulo-cobertura">
      <div className="coverage-teaser">
        <div className="coverage-teaser__copy">
          <SectionHeader
            id="titulo-cobertura"
            eyebrow="Cobertura"
            title="Conectamos a toda Latinoamérica"
            description="Miami es el centro operativo para los envíos a LATAM y Laredo es nuestro centro de EE. UU. hacia México. Combinamos tecnología y logística para facilitar envíos de comercio electrónico a cualquier destino."
          />
          <ul className="coverage-teaser__hubs">
            {HUBS.map((hub) => (
              <li key={hub.id} className="coverage-teaser__hub">
                <Check className="coverage-teaser__check" aria-hidden="true" />
                <span>
                  <strong className="coverage-teaser__hub-name">{hub.name}</strong>
                  <span className="coverage-teaser__hub-region">{hub.region}</span>
                </span>
              </li>
            ))}
          </ul>
          <ButtonLink to="/cobertura" variant="secondary" className="section__action">
            Ver la cobertura completa
            <ArrowRight className="button__icon" aria-hidden="true" />
          </ButtonLink>
        </div>
        <NetworkMap />
      </div>
    </Section>
  );
}

/** Vista previa decorativa del panel: no es interactiva. */
function PanelPreview() {
  const rows = [
    { number: "2103 9584 7201 6654", stage: "vehicle_loaded", route: "Laredo, TX → Ciudad de México" },
    { number: "2119 8753 0246 7781", stage: "vehicle_in_transit", route: "Laredo, TX → Monterrey, N.L." },
    { number: "2154 3029 6817 0435", stage: "cargo_delivered", route: "Laredo, TX → Guadalajara, Jal." },
  ] as const;
  return (
    <div aria-hidden="true" className="panel-preview">
      <div className="panel-preview__stats">
        {["Total", "En tránsito", "Entregadas"].map((label, index) => (
          <div key={label} className="panel-preview__stat">
            <p className="panel-preview__stat-label">{label}</p>
            <p className="panel-preview__stat-value">{[8, 4, 2][index]}</p>
          </div>
        ))}
      </div>
      <div className="panel-preview__rows">
        {rows.map((row) => (
          <div key={row.number} className="panel-preview__row">
            <div className="panel-preview__row-info">
              <span className="panel-preview__row-number">{row.number}</span>
              <span className="panel-preview__row-route">{row.route}</span>
            </div>
            <StageBadge code={row.stage} />
          </div>
        ))}
      </div>
    </div>
  );
}

function PanelSection() {
  return (
    <Section tone="dark" aria-labelledby="titulo-panel">
      <div aria-hidden="true" className="section__glow section__glow--panel" />
      <div className="panel-teaser">
        <div className="panel-teaser__copy">
          <SectionHeader
            id="titulo-panel"
            tone="dark"
            eyebrow="Panel de operaciones"
            title="Ten el control de tu operación"
            description="Registra guías, avánzalas etapa por etapa y consulta el historial de cada una. El panel solo permite pasar a la etapa siguiente, así ningún paso se salta."
          />
          <ul className="panel-teaser__points">
            <li className="panel-teaser__point">
              <Check className="panel-teaser__check" aria-hidden="true" />
              Visualiza el estado de tus envíos en un solo lugar.
            </li>
            <li className="panel-teaser__point">
              <Check className="panel-teaser__check" aria-hidden="true" />
              Cada avance queda en un historial que no se edita ni se borra.
            </li>
          </ul>
          <ButtonLink to="/panel" size="lg" className="section__action">
            <LayoutDashboard className="button__icon" aria-hidden="true" />
            Abrir el panel
          </ButtonLink>
        </div>
        <PanelPreview />
      </div>
    </Section>
  );
}

function AlliancesSection() {
  return (
    <Section tone="surface" aria-labelledby="titulo-alianzas">
      <div className="section__stack">
        <SectionHeader
          id="titulo-alianzas"
          eyebrow="Alianzas y afiliaciones"
          title="Con la confianza de las instituciones del comercio internacional"
          description="Unimos esfuerzos con socios clave para maximizar el valor de tu empresa mediante un ecosistema cross border."
        />
        <ul className="alliances__list">
          {ALLIANCES.marketplaces.map((alliance) => (
            <li key={alliance.name} className="alliances__card">
              <h3 className="alliances__name">{alliance.name}</h3>
              <p className="alliances__text">{alliance.text}</p>
            </li>
          ))}
        </ul>
        <div className="alliances__members">
          <p className="alliances__members-label">Estamos afiliados a</p>
          <ul className="alliances__members-list">
            {ALLIANCES.memberships.map((name) => (
              <li key={name} className="alliances__member">
                {name}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}

function FaqSection() {
  const featured = FEATURED_FAQ_IDS.flatMap((id) => FAQ.find((entry) => entry.id === id) ?? []);
  return (
    <Section aria-labelledby="titulo-preguntas">
      <div className="faq-teaser">
        <div className="faq-teaser__intro">
          <SectionHeader
            id="titulo-preguntas"
            eyebrow="Preguntas frecuentes"
            title="Respuestas a lo que más nos preguntan"
            description="Resolvemos las dudas de quien espera un paquete."
          />
          <ButtonLink to="/preguntas" variant="secondary" className="section__action">
            Ver todas las preguntas
            <ArrowRight className="button__icon" aria-hidden="true" />
          </ButtonLink>
        </div>
        <Accordion>
          {featured.map((entry) => (
            <AccordionItem key={entry.id} question={entry.question}>
              <FaqAnswer entry={entry} />
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Section>
  );
}

function ContactSection() {
  const mexico = CONTACTS[0];
  return (
    <Section tone="surface" aria-labelledby="titulo-contacto">
      <div className="contact-cta">
        <div aria-hidden="true" className="contact-cta__glow" />
        <div className="contact-cta__inner">
          <SectionHeader
            id="titulo-contacto"
            tone="dark"
            align="center"
            eyebrow="Contacto"
            title="Estamos a un mensaje de distancia"
            description="Cuéntanos qué necesita tu ecommerce y un representante se pondrá en contacto contigo."
          />
          <div className="contact-cta__actions">
            <ButtonLink to="/contacto" size="lg">
              Escríbenos
            </ButtonLink>
            {mexico ? (
              <ButtonAnchor href={telHref(mexico.phone)} size="lg" variant="secondary" tone="dark">
                <Phone className="button__icon" aria-hidden="true" />
                {mexico.phone}
              </ButtonAnchor>
            ) : null}
          </div>
          <p className="contact-cta__note">
            ¿Buscas tu paquete? Ve directo al{" "}
            <Link to="/rastreo" className="text-link text-link--inverse">
              rastreo
            </Link>
            .
          </p>
        </div>
      </div>
    </Section>
  );
}

export default function Home() {
  useDocumentTitle("Logística cross-border para ecommerce");
  return (
    <>
      <Hero />
      <Stats />
      <ServicesSection />
      <JourneySection />
      <CoverageSection />
      <PanelSection />
      <AlliancesSection />
      <FaqSection />
      <ContactSection />
    </>
  );
}
