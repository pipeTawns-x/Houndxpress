import { Check } from "lucide-react";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Eyebrow, PageHeader, Section } from "../components/ui/Section.tsx";
import { SERVICES } from "../content/services.ts";
import type { Service } from "../content/services.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";
import { bem } from "../lib/bem.ts";

const PHOTOS = [
  "servicio-customs.webp",
  "servicio-cargo.webp",
  "servicio-ecommerce.webp",
  "servicio-parcel.webp",
  "servicio-ecommerce.webp",
];
function ServiceVisual({ serviceLevel }: { serviceLevel: Service }) {
  const index = SERVICES.findIndex((item) => item.id === serviceLevel.id);
  return (
    <figure className="service-visual">
      <img
        src={`/media/${PHOTOS[index] ?? PHOTOS[0]}`}
        alt={`Imagen ilustrativa de logística para ${serviceLevel.title.toLowerCase()}`}
        width={1344}
        height={752}
        loading="lazy"
      />
      <figcaption className="service-visual__caption">{serviceLevel.kicker}</figcaption>
    </figure>
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

      {SERVICES.map((serviceLevel, index) => (
        <Section
          key={serviceLevel.id}
          id={serviceLevel.id}
          tone={index % 2 === 0 ? "light" : "surface"}
          aria-labelledby={`${serviceLevel.id}-titulo`}
          className="service-block"
        >
          <div className="service-block__layout">
            <div className={bem("service-block__visual", { last: index % 2 === 1 })}>
              <ServiceVisual serviceLevel={serviceLevel} />
            </div>
            <div className="service-block__copy">
              <div className="service-block__intro">
                <Eyebrow>{serviceLevel.kicker}</Eyebrow>
                <h2 id={`${serviceLevel.id}-titulo`} className="service-block__title">
                  {serviceLevel.title}
                </h2>
                <p className="service-block__lead">{serviceLevel.headline}</p>
              </div>
              <ul className="service-block__features">
                {serviceLevel.features.map((feature) => (
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
