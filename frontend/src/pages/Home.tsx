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
    <section aria-labelledby="titulo-inicio" className="on-dark relative overflow-hidden bg-navy-950 pt-14 pb-28 md:pt-20 md:pb-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_34rem_at_78%_-8%,rgb(76_190_216/0.2),transparent_62%)]"
      />
      <HeroIllustration className="pointer-events-none absolute -top-6 -right-24 hidden w-[34rem] sm:-right-10 sm:block sm:opacity-30 lg:top-1/2 lg:right-[max(1rem,calc(50%-38rem))] lg:w-[36rem] lg:-translate-y-1/2 lg:opacity-100" />
      <Container className="relative">
        <div className="flex max-w-xl animate-rise flex-col gap-6">
          <div className="flex flex-col gap-4">
            <p className="eyebrow text-aqua-500">Logística cross-border para ecommerce</p>
            <h1 id="titulo-inicio" className="text-display font-extrabold tracking-tight text-white">
              Movemos tu ecommerce de local a global
            </h1>
            <p className="max-w-xl text-lead text-navy-300">
              Expertos en logística y comercio internacional. Conectamos tu negocio con Estados Unidos y Latinoamérica, y
              te mostramos en qué etapa va cada envío.
            </p>
          </div>

          <div className="on-light rounded-3xl bg-white p-5 shadow-lift sm:p-6">
            <TrackingSearch
              examples={isDemoData ? DEMO_GUIDE_NUMBERS.slice(0, 2) : []}
              onSearch={(numbers) => {
                void navigate(trackingPath(numbers));
              }}
            />
          </div>

          <div className="flex flex-col gap-2 text-label text-navy-300">
            <p>¿No tienes tu número? Está en el correo de tu compra.</p>
            {isDemoData ? (
              <p className="flex items-start gap-2">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-aqua-500" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-white">Datos de demostración:</strong> las guías de ejemplo no
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
    <section aria-label="Hound Express en cifras" className="relative z-10 -mt-14">
      <Container>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="reveal flex flex-col gap-10">
        <SectionHeader
          id="titulo-servicios"
          eyebrow="Servicios"
          title="Todo lo que tu ecommerce necesita para cruzar fronteras"
          description="Desarrollamos las soluciones logísticas y aduanales para que tu ecommerce compita a nivel internacional, con toda tu operación en un solo sistema."
        />
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
            <div className="on-dark flex h-full flex-col justify-between gap-6 rounded-2xl bg-navy-800 p-6 text-white">
              <div className="flex flex-col gap-2">
                <h3 className="font-display text-h3 font-bold text-white">Tu ecommerce merece más que envíos</h3>
                <p className="text-base text-navy-300">
                  Merece una logística que cuide cada detalle. Conoce todos los servicios y cuéntanos qué necesitas.
                </p>
              </div>
              <ButtonLink to="/servicios" tone="dark" variant="secondary" className="self-start">
                Ver todos los servicios
                <ArrowRight className="size-4" aria-hidden="true" />
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
      <div className="reveal flex flex-col gap-10">
        <SectionHeader
          id="titulo-recorrido"
          eyebrow="Seguimiento"
          title="Cómo viaja tu paquete"
          description="Cada guía pasa por cinco etapas, siempre en el mismo orden. Cada etapa la registra un departamento responsable."
        />
        <ol className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((stage) => (
            <li key={stage.code} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-line">
              <span className="flex size-10 items-center justify-center rounded-full bg-aqua-500 font-display font-bold text-navy-950">
                {stage.order}
              </span>
              <h3 className="text-h3 font-bold">{stage.label}</h3>
              <p className="text-label font-semibold text-aqua-700">Responsable: {stage.department}</p>
              <p className="text-base text-muted">{stage.description}</p>
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
      <div className="reveal grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeader
            id="titulo-cobertura"
            eyebrow="Cobertura"
            title="Conectamos a toda Latinoamérica"
            description="Miami es el centro operativo para los envíos a LATAM y Laredo es nuestro centro de EE. UU. hacia México. Combinamos tecnología y logística para facilitar envíos de comercio electrónico a cualquier destino."
          />
          <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {HUBS.map((hub) => (
              <li key={hub.id} className="flex items-start gap-2 text-base">
                <Check className="mt-1 size-4 shrink-0 text-aqua-700" aria-hidden="true" />
                <span>
                  <strong className="font-semibold text-navy-800">{hub.name}</strong>
                  <span className="block text-label text-muted">{hub.region}</span>
                </span>
              </li>
            ))}
          </ul>
          <ButtonLink to="/cobertura" variant="secondary" className="self-start">
            Ver la cobertura completa
            <ArrowRight className="size-4" aria-hidden="true" />
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
    <div aria-hidden="true" className="rounded-2xl border border-navy-700 bg-navy-900 p-4 shadow-lift sm:p-5">
      <div className="mb-4 flex gap-3">
        {["Total", "En tránsito", "Entregadas"].map((label, index) => (
          <div key={label} className="flex-1 rounded-xl bg-navy-800 p-3">
            <p className="text-xs text-navy-300">{label}</p>
            <p className="font-display text-2xl font-extrabold text-white">{[8, 4, 2][index]}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col divide-y divide-navy-700 rounded-xl bg-navy-800">
        {rows.map((row) => (
          <div key={row.number} className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="flex flex-col">
              <span className="font-semibold text-white tabular-nums">{row.number}</span>
              <span className="text-xs text-navy-300">{row.route}</span>
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_24rem_at_10%_110%,rgb(76_190_216/0.16),transparent_65%)]"
      />
      <div className="reveal relative grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeader
            id="titulo-panel"
            tone="dark"
            eyebrow="Panel de operaciones"
            title="Ten el control de tu operación"
            description="Registra guías, avánzalas etapa por etapa y consulta el historial de cada una. El panel solo permite pasar a la etapa siguiente, así ningún paso se salta."
          />
          <ul className="flex flex-col gap-3 text-base text-navy-300">
            <li className="flex items-start gap-3">
              <Check className="mt-1 size-4 shrink-0 text-aqua-500" aria-hidden="true" />
              Visualiza el estado de tus envíos en un solo lugar.
            </li>
            <li className="flex items-start gap-3">
              <Check className="mt-1 size-4 shrink-0 text-aqua-500" aria-hidden="true" />
              Cada avance queda en un historial que no se edita ni se borra.
            </li>
          </ul>
          <ButtonLink to="/panel" size="lg" className="self-start">
            <LayoutDashboard className="size-5" aria-hidden="true" />
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
      <div className="reveal flex flex-col gap-10">
        <SectionHeader
          id="titulo-alianzas"
          eyebrow="Alianzas y afiliaciones"
          title="Con la confianza de las instituciones del comercio internacional"
          description="Unimos esfuerzos con socios clave para maximizar el valor de tu empresa mediante un ecosistema cross border."
        />
        <ul className="grid gap-5 md:grid-cols-2">
          {ALLIANCES.marketplaces.map((alliance) => (
            <li key={alliance.name} className="flex flex-col gap-2 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line">
              <h3 className="text-h3 font-bold">{alliance.name}</h3>
              <p className="text-base text-muted">{alliance.text}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-3">
          <p className="text-label font-semibold text-muted">Estamos afiliados a</p>
          <ul className="flex flex-wrap gap-3">
            {ALLIANCES.memberships.map((name) => (
              <li
                key={name}
                className="rounded-full bg-white px-5 py-2 font-display text-base font-bold text-navy-800 ring-1 ring-line"
              >
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
      <div className="reveal grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <div className="flex flex-col gap-6">
          <SectionHeader
            id="titulo-preguntas"
            eyebrow="Preguntas frecuentes"
            title="Respuestas a lo que más nos preguntan"
            description="Resolvemos las dudas de quien espera un paquete."
          />
          <ButtonLink to="/preguntas" variant="secondary" className="self-start">
            Ver todas las preguntas
            <ArrowRight className="size-4" aria-hidden="true" />
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
      <div className="on-dark reveal relative overflow-hidden rounded-3xl bg-navy-800 px-6 py-12 text-center sm:px-12 md:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_20rem_at_50%_-20%,rgb(76_190_216/0.22),transparent_65%)]"
        />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6">
          <SectionHeader
            id="titulo-contacto"
            tone="dark"
            align="center"
            eyebrow="Contacto"
            title="Estamos a un mensaje de distancia"
            description="Cuéntanos qué necesita tu ecommerce y un representante se pondrá en contacto contigo."
          />
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <ButtonLink to="/contacto" size="lg">
              Escríbenos
            </ButtonLink>
            {mexico ? (
              <ButtonAnchor href={telHref(mexico.phone)} size="lg" variant="secondary" tone="dark">
                <Phone className="size-5" aria-hidden="true" />
                {mexico.phone}
              </ButtonAnchor>
            ) : null}
          </div>
          <p className="text-label text-navy-300">
            ¿Buscas tu paquete? Ve directo al{" "}
            <Link to="/rastreo" className="font-semibold text-white underline underline-offset-2 hover:text-aqua-400">
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
