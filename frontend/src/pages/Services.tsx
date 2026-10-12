import { Check } from "lucide-react";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Eyebrow, PageHeader, Section } from "../components/ui/Section.tsx";
import { SERVICES } from "../content/services.ts";
import type { Service } from "../content/services.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { bem } from "../lib/bem.ts";

/** Bloque visual de cada servicio: icono grande y cifras sobre marino. */
function ServiceVisual({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <div aria-hidden="true" className="service-visual">
      <div className="service-visual__dots" />
      <div className="service-visual__glow" />
      <span className="service-visual__icon-box">
        <Icon className="service-visual__icon" strokeWidth={1.75} />
      </span>
      <div className="service-visual__stats">
        {service.highlights.map((item) => (
          <div key={item.label} className="service-visual__stat">
            <span className="service-visual__value">{item.value}</span>
            <span className="service-visual__label">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Services() {
  useDocumentTitle("Servicios de logística para ecommerce");
  return (
    <>
      <PageHeader
        eyebrow="Servicios"
        title="Servicios para que tu ecommerce compita en el mundo"
        description="Desarrollamos todas las soluciones logísticas y aduanales que necesitas. Centraliza toda tu operación en nuestro sistema."
      />

      {SERVICES.map((service, index) => (
        <Section
          key={service.id}
          id={service.id}
          tone={index % 2 === 0 ? "light" : "surface"}
          aria-labelledby={`${service.id}-titulo`}
          className="service-block"
        >
          <div className="service-block__layout">
            <div className={bem("service-block__visual", { last: index % 2 === 1 })}>
              <ServiceVisual service={service} />
            </div>
            <div className="service-block__copy">
              <div className="service-block__intro">
                <Eyebrow>{service.kicker}</Eyebrow>
                <h2 id={`${service.id}-titulo`} className="service-block__title">
                  {service.title}
                </h2>
                <p className="service-block__lead">{service.headline}</p>
              </div>
              <ul className="service-block__features">
                {service.features.map((feature) => (
                  <li key={feature.title} className="service-block__feature">
                    <span className="service-block__feature-icon">
                      <Check className="service-block__feature-check" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <div className="service-block__feature-body">
                      <h3 className="service-block__feature-title">{feature.title}</h3>
                      <p className="service-block__feature-text">{feature.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ))}

      <Section tone="dark" aria-labelledby="titulo-cierre-servicios">
        <div className="section__glow section__glow--closing" />
        <div className="services-cta">
          <h2 id="titulo-cierre-servicios" className="services-cta__title">
            Tu ecommerce merece más que envíos, merece una logística que cuide cada detalle
          </h2>
          <p className="services-cta__text">Cuéntanos qué servicio necesitas y te respondemos.</p>
          <ButtonLink to="/contacto" size="lg">
            Contáctanos
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
