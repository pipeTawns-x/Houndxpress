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
import { bem } from "../lib/bem.ts";
import { contrastLevel, contrastRatio, formatRatio } from "../lib/contrast.ts";
import { createSeedGuides } from "../services/demoData.ts";

function DesignSection({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id} className="design-section">
      <div className="design-section__intro">
        <h2 id={id} className="design-section__title">
          {title}
        </h2>
        {description ? <p className="design-section__description">{description}</p> : null}
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
    <li className="swatch">
      <div className="swatch__color" style={{ backgroundColor: hex }} aria-hidden="true" />
      <div className="swatch__info">
        <p className="swatch__name">{name}</p>
        <p className="swatch__hex">{hex}</p>
        <p className="swatch__usage">
          {usage}
          {added ? " (token agregado en la implementación)" : ""}
        </p>
        <p className="swatch__contrast">
          Mejor contraste: {best.text} {formatRatio(best.ratio)} · {contrastLevel(best.ratio)}
        </p>
      </div>
    </li>
  );
}

const TYPE_SCALE = [
  { label: "Display · Plus Jakarta Sans 800", style: "display", sample: "Movemos tu ecommerce" },
  { label: "H1 de página · Plus Jakarta Sans 800", style: "h1", sample: "Rastrea tu paquete" },
  { label: "H2 de sección · Plus Jakarta Sans 700", style: "h2", sample: "Cómo viaja tu paquete" },
  { label: "H3 · Plus Jakarta Sans 700", style: "h3", sample: "Vehículo liberado" },
  { label: "Cuerpo destacado · Inter 400 · 1.125rem", style: "lead", sample: "Expertos en logística y comercio internacional para ecommerce." },
  { label: "Cuerpo · Inter 400 · 1rem", style: "body", sample: "Cada guía pasa por cinco etapas, siempre en el mismo orden." },
  { label: "Etiqueta · Inter 600 · 0.875rem", style: "label", sample: "Número de guía" },
  { label: "Número de guía · Inter 600 con tabular-nums", style: "number", sample: "2148 2139 0765 0312" },
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

      <Container className="designs-page">
        <DesignSection
          id="pantallas"
          title="Pantallas"
          description="Cada pantalla de la aplicación, con un enlace para abrirla."
        >
          <ul className="screen-grid">
            {SCREENS.map((screen) => (
              <li key={screen.to}>
                <Link to={screen.to} className="screen-link">
                  <span className="screen-link__title">
                    {screen.title}
                    <ArrowRight className="screen-link__arrow" aria-hidden="true" />
                  </span>
                  <span className="screen-link__path">{screen.to}</span>
                  <span className="screen-link__text">{screen.description}</span>
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
          <ul className="swatch-grid">
            {COLOR_TOKENS.map((token) => (
              <Swatch key={token.name} {...token} />
            ))}
          </ul>
          <ul aria-label="Contraste de las combinaciones de texto y fondo" className="contrast-list">
            {CONTRAST_PAIRS.map((pair) => {
              const ratio = contrastRatio(tokenHex(pair.foreground), tokenHex(pair.background));
              return (
                <li key={pair.label} className="contrast-list__row">
                  <span className="contrast-list__label">{pair.label}</span>
                  <span className="contrast-list__value">
                    <strong className="contrast-list__strong">{formatRatio(ratio)}</strong> · {contrastLevel(ratio)} ·{" "}
                    <strong className="contrast-list__strong">{pair.verdict === "usar" ? "Usar" : "Evitar"}</strong>
                  </span>
                </li>
              );
            })}
          </ul>
        </DesignSection>

        <DesignSection id="tipografia" title="Tipografía" description="Dos familias: Plus Jakarta Sans para títulos e Inter para texto.">
          <ul className="type-scale">
            {TYPE_SCALE.map((row) => (
              <li key={row.label} className="type-scale__row">
                <p className="type-scale__label">{row.label}</p>
                <p className={bem("type-scale__sample", row.style)}>{row.sample}</p>
              </li>
            ))}
            <li className="type-scale__row">
              <p className="type-scale__label">Sobretítulo · Inter 600 · mayúsculas · aqua-700 sobre claro</p>
              <p className="eyebrow">Logística cross-border para ecommerce</p>
            </li>
          </ul>
        </DesignSection>

        <DesignSection id="botones" title="Botones" description="Principal (aqua con texto navy-950), secundario (contorno) y fantasma. Alturas de 40 y 48 px.">
          <div className="showcase showcase--stack">
            <div className="showcase__row">
              <Button>Principal</Button>
              <Button variant="secondary">Secundario</Button>
              <Button variant="ghost">Fantasma</Button>
              <Button disabled>Deshabilitado</Button>
              <Button loading>Cargando</Button>
            </div>
            <div className="showcase__row">
              <Button size="lg">Principal grande</Button>
              <Button size="lg" variant="secondary">
                Secundario grande
              </Button>
              <ButtonLink to="/rastreo" size="lg" variant="ghost">
                Enlace con aspecto de botón
              </ButtonLink>
            </div>
          </div>
          <div className="showcase showcase--dark">
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
          <div className="showcase showcase--fields">
            <TextField label="Nombre" placeholder="Laura Gómez" />
            <TextField label="Número de guía" hint="16 dígitos que inician con 21, o 22 caracteres." defaultValue="2148 2139 0765 0312" />
            <TextField label="Correo" defaultValue="laura@" error="Revisa tu correo: debe verse como nombre@empresa.com." />
            <Select label="Asunto" defaultValue="Seguimiento de paquete">
              <option>Seguimiento de paquete</option>
              <option>Cotización de servicio</option>
              <option>Información general</option>
            </Select>
            <div className="showcase__wide">
              <TextArea label="Mensaje" placeholder="Cuéntanos qué necesitas." hint="Mínimo 10 caracteres." />
            </div>
            <Checkbox label="Acepto que estos datos se incluyan en el correo." />
            <TextField label="Campo deshabilitado" disabled defaultValue="No editable" />
          </div>
        </DesignSection>

        <DesignSection id="insignias" title="Insignias y avisos" description="Cada estado lleva icono o texto, no solo color.">
          <div className="showcase showcase--badges">
            <ul className="showcase__list">
              {STAGE_CODES.map((code) => (
                <li key={code}>
                  <StageBadge code={code} />
                </li>
              ))}
            </ul>
            <ul className="showcase__list">
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
            <p className="notice notice--info showcase__notice">
              <Info className="showcase__notice-icon" aria-hidden="true" />
              Aviso informativo con fondo sky-soft y texto ink.
            </p>
          </div>
        </DesignSection>

        <DesignSection
          id="linea-de-tiempo"
          title="Línea de tiempo de etapas"
          description="Horizontal desde 768 px y vertical en móvil. Completadas con palomita, la actual con anillo pulsante y las pendientes en gris."
        >
          <div className="showcase">
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
          <div className="designs-page__cards">
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
