import type { ReactNode } from "react";
import { Link } from "react-router";
import { ArrowRight, Info } from "lucide-react";
import { GuideResultCard } from "../components/tracking/GuideResultCard.tsx";
import { StageTimeline } from "../components/tracking/StageTimeline.tsx";
import { ApiStatus } from "../components/ui/ApiStatus.tsx";
import { Button } from "../components/ui/Button.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { DemoNotice } from "../components/ui/DemoNotice.tsx";
import { Checkbox, Select, TextArea, TextField } from "../components/ui/fields.tsx";
import { Container, PageHeader } from "../components/ui/Section.tsx";
import { ServiceCard } from "../components/ui/ServiceCard.tsx";
import { StageBadge } from "../components/ui/StageBadge.tsx";
import { StatCard } from "../components/ui/StatCard.tsx";
import { CONTRAST_PAIRS, COLOR_TOKENS, tokenHex } from "../content/designTokens.ts";
import { SERVICES } from "../content/services.ts";
import { SCREENS } from "../content/screens.ts";
import { STAGE_CODES } from "../domain/index.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { contrastLevel, contrastRatio, formatRatio } from "../lib/contrast.ts";
import { createSeedGuides } from "../services/demoData.ts";

function DesignSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="flex scroll-mt-20 flex-col gap-6 border-t border-line pt-12 first:border-t-0 first:pt-0">
      <div className="flex max-w-3xl flex-col gap-2">
        <h2 id={id} className="text-h2 font-bold tracking-tight">
          {title}
        </h2>
        {description ? <p className="text-base text-muted">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Swatch({ name, hex, usage, added }: { name: string; hex: string; usage: string; added?: boolean }) {
  const onWhite = contrastRatio("#FFFFFF", hex);
  const onNavy = contrastRatio(tokenHex("navy-950"), hex);
  const best = onWhite >= onNavy ? { text: "Texto blanco", ratio: onWhite } : { text: "Texto navy-950", ratio: onNavy };
  return (
    <li className="flex flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-line">
      <div className="h-20" style={{ backgroundColor: hex }} aria-hidden="true" />
      <div className="flex flex-col gap-1.5 p-4">
        <p className="font-display text-base font-bold text-navy-800">{name}</p>
        <p className="text-label font-semibold text-ink tabular-nums">{hex}</p>
        <p className="text-label text-muted">
          {usage}
          {added ? " (token agregado en la implementación)" : ""}
        </p>
        <p className="text-label text-ink tabular-nums">
          Mejor contraste: {best.text} {formatRatio(best.ratio)} · {contrastLevel(best.ratio)}
        </p>
      </div>
    </li>
  );
}

const TYPE_SCALE = [
  { label: "Display · Plus Jakarta Sans 800", className: "font-display text-display font-extrabold", sample: "Movemos tu ecommerce" },
  { label: "H1 de página · Plus Jakarta Sans 800", className: "font-display text-h1 font-extrabold", sample: "Rastrea tu paquete" },
  { label: "H2 de sección · Plus Jakarta Sans 700", className: "font-display text-h2 font-bold", sample: "Cómo viaja tu paquete" },
  { label: "H3 · Plus Jakarta Sans 700", className: "font-display text-h3 font-bold", sample: "Vehículo liberado" },
  { label: "Cuerpo destacado · Inter 400 · 1.125rem", className: "text-lead", sample: "Expertos en logística y comercio internacional para ecommerce." },
  { label: "Cuerpo · Inter 400 · 1rem", className: "text-base", sample: "Cada guía pasa por cinco etapas, siempre en el mismo orden." },
  { label: "Etiqueta · Inter 600 · 0.875rem", className: "text-label font-semibold", sample: "Número de guía" },
  { label: "Número de guía · Inter 600 con tabular-nums", className: "font-semibold tabular-nums", sample: "2148 2139 0765 0312" },
] as const;

export default function Designs() {
  useDocumentTitle("Índice de diseños");
  const sampleGuide = createSeedGuides().find((guide) => guide.currentStage === "vehicle_released");

  return (
    <>
      <PageHeader
        eyebrow="Sistema de diseño"
        title="Índice de diseños"
        description="Guía de estilo viva: todas las pantallas, la paleta con sus contrastes, la tipografía y los componentes que usa la aplicación."
      />

      <Container className="flex flex-col gap-14 py-14 md:py-20">
        <DesignSection
          id="pantallas"
          title="Pantallas"
          description="Cada pantalla de la aplicación, con un enlace para abrirla."
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {SCREENS.map((screen) => (
              <li key={screen.to}>
                <Link
                  to={screen.to}
                  className="group flex h-full flex-col gap-2 rounded-2xl bg-white p-5 shadow-soft ring-1 ring-line transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lift"
                >
                  <span className="flex items-center justify-between gap-2 font-display text-lg font-bold text-navy-800">
                    {screen.title}
                    <ArrowRight className="size-4 text-aqua-700 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </span>
                  <span className="text-label font-semibold text-aqua-700">{screen.to}</span>
                  <span className="text-base text-muted">{screen.description}</span>
                </Link>
              </li>
            ))}
          </ul>
        </DesignSection>

        <DesignSection
          id="paleta"
          title="Paleta"
          description="Contrastes calculados con la fórmula de WCAG 2.2: 4.5:1 es AA para texto normal y 7:1 es AAA. El aqua de marca nunca es color de texto sobre fondo claro."
        >
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_TOKENS.map((token) => (
              <Swatch key={token.name} {...token} />
            ))}
          </ul>
          <ul aria-label="Contraste de las combinaciones de texto y fondo" className="flex flex-col divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
            {CONTRAST_PAIRS.map((pair) => {
              const ratio = contrastRatio(tokenHex(pair.foreground), tokenHex(pair.background));
              return (
                <li key={pair.label} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 p-4">
                  <span className="text-base text-ink">{pair.label}</span>
                  <span className="text-base text-ink tabular-nums">
                    <strong className="font-semibold">{formatRatio(ratio)}</strong> · {contrastLevel(ratio)} ·{" "}
                    <strong className="font-semibold">{pair.verdict === "usar" ? "Usar" : "Evitar"}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </DesignSection>

        <DesignSection id="tipografia" title="Tipografía" description="Dos familias: Plus Jakarta Sans para títulos e Inter para texto.">
          <ul className="flex flex-col divide-y divide-line rounded-2xl bg-white ring-1 ring-line">
            {TYPE_SCALE.map((row) => (
              <li key={row.label} className="flex flex-col gap-2 p-5">
                <p className="text-label text-muted">{row.label}</p>
                <p className={`${row.className} text-navy-800`}>{row.sample}</p>
              </li>
            ))}
            <li className="flex flex-col gap-2 p-5">
              <p className="text-label text-muted">Sobretítulo · Inter 600 · mayúsculas · aqua-700 sobre claro</p>
              <p className="eyebrow text-aqua-700">Logística cross-border para ecommerce</p>
            </li>
          </ul>
        </DesignSection>

        <DesignSection id="botones" title="Botones" description="Principal (aqua con texto navy-950), secundario (contorno) y fantasma. Alturas de 40 y 48 px.">
          <div className="flex flex-col gap-6 rounded-2xl bg-white p-6 ring-1 ring-line">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Principal</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button disabled>Deshabilitado</Button>
              <Button loading>Cargando</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg">Principal grande</Button>
              <Button size="lg" variant="secondary">
                Secundario grande
              </Button>
              <ButtonLink to="/rastreo" size="lg" variant="ghost">
                Enlace con aspecto de botón
              </ButtonLink>
            </div>
          </div>
          <div className="on-dark flex flex-wrap items-center gap-3 rounded-2xl bg-navy-950 p-6">
            <Button>Principal</Button>
            <Button variant="secondary" tone="dark">
              Secundario
            </Button>
            <Button variant="ghost" tone="dark">
              Fantasma
            </Button>
            <Button tone="dark" disabled>
              Deshabilitado
            </Button>
          </div>
        </DesignSection>

        <DesignSection id="campos" title="Campos" description="Etiqueta visible arriba; ayuda y error debajo, enlazados con aria-describedby.">
          <div className="grid gap-5 rounded-2xl bg-white p-6 ring-1 ring-line md:grid-cols-2">
            <TextField label="Nombre" placeholder="Laura Gómez" />
            <TextField label="Número de guía" hint="16 dígitos que inician con 21, o 22 caracteres." defaultValue="2148 2139 0765 0312" />
            <TextField label="Correo" defaultValue="laura@" error="Revisa tu correo: debe verse como nombre@empresa.com." />
            <Select label="Asunto" defaultValue="Seguimiento de paquete">
              <option>Seguimiento de paquete</option>
              <option>Cotización de servicio</option>
              <option>Información general</option>
            </Select>
            <div className="md:col-span-2">
              <TextArea label="Mensaje" placeholder="Cuéntanos qué necesitas." hint="Mínimo 10 caracteres." />
            </div>
            <Checkbox label="Acepto que estos datos se incluyan en el correo." />
            <TextField label="Campo deshabilitado" disabled defaultValue="No editable" />
          </div>
        </DesignSection>

        <DesignSection id="insignias" title="Insignias y avisos" description="Cada estado lleva icono o texto, no solo color.">
          <div className="flex flex-col gap-5 rounded-2xl bg-white p-6 ring-1 ring-line">
            <ul className="flex flex-wrap gap-3">
              {STAGE_CODES.map((code) => (
                <li key={code}>
                  <StageBadge code={code} />
                </li>
              ))}
            </ul>
            <ul className="flex flex-wrap gap-3">
              <li>
                <ApiStatus status="checking" />
              </li>
              <li>
                <ApiStatus status="online" />
              </li>
              <li>
                <ApiStatus status="offline" />
              </li>
            </ul>
            <DemoNotice demo showExamples={false} />
            <p className="flex items-start gap-2 rounded-2xl bg-sky-soft p-4 text-base text-ink ring-1 ring-sky-600/30">
              <Info className="mt-0.5 size-5 shrink-0 text-sky-600" aria-hidden="true" />
              Aviso informativo con fondo sky-soft y texto ink.
            </p>
          </div>
        </DesignSection>

        <DesignSection
          id="linea-de-tiempo"
          title="Línea de tiempo de etapas"
          description="Horizontal desde 768 px y vertical en móvil. Completadas con palomita, la actual con anillo pulsante y las pendientes en gris."
        >
          <div className="rounded-2xl bg-white p-6 ring-1 ring-line">
            <StageTimeline
              currentStage="vehicle_released"
              history={[
                { stage: "cargo_received", at: "2026-09-25T15:00:00.000Z", location: "Miami, FL" },
                { stage: "vehicle_loaded", at: "2026-09-26T13:00:00.000Z", location: "Miami, FL" },
                { stage: "vehicle_released", at: "2026-09-27T19:00:00.000Z", location: "Miami, FL" },
              ]}
            />
          </div>
        </DesignSection>

        <DesignSection id="tarjetas" title="Tarjetas" description="Tarjeta de cifra, tarjeta de servicio y resultado de rastreo.">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <StatCard value="+15,000" label="m² de almacenes" description="Capacidad para más de 1 millón de paquetes." />
            <StatCard tone="dark" value="10" label="puntos de entrada en LATAM" description="Cobertura y rapidez." />
            {SERVICES[0] ? (
              <ServiceCard
                icon={SERVICES[0].icon}
                title={SERVICES[0].title}
                text={SERVICES[0].summary}
                points={SERVICES[0].highlights.map((item) => `${item.value} ${item.label}`)}
                to="/servicios"
              />
            ) : null}
          </div>
          {sampleGuide ? <GuideResultCard guide={sampleGuide} /> : null}
        </DesignSection>
      </Container>
    </>
  );
}
