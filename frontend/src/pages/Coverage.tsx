import { Globe, MapPin } from "lucide-react";
import { NetworkMap } from "../components/illustrations/NetworkMap.tsx";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { PageHeader, Section, SectionHeader } from "../components/ui/Section.tsx";
import { COUNTRIES, HUBS } from "../content/coverage.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";

export default function Coverage() {
  useDocumentTitle("Cobertura en Estados Unidos y Latinoamérica");
  return (
    <>
      <PageHeader
        eyebrow="Cobertura"
        title="Una red que conecta Estados Unidos con toda Latinoamérica"
        description="Nuestras instalaciones en Miami son el centro operativo para los envíos a LATAM, y Laredo es nuestro centro de EE. UU. hacia México."
      />

      <Section aria-labelledby="titulo-mapa">
        <div className="section__stack">
          <SectionHeader
            id="titulo-mapa"
            eyebrow="Mapa de la red"
            title="Dos hubs en USA y diez puntos de entrada en LATAM"
            description="Combinamos tecnología y logística para facilitar envíos de comercio electrónico a cualquier destino."
          />
          <NetworkMap className="network-map--wide" />
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="titulo-hubs">
        <div className="section__stack">
          <SectionHeader
            id="titulo-hubs"
            eyebrow="Hubs estratégicos"
            title="Hubs a lo largo de México y Estados Unidos"
            description="Múltiples puntos de entrada y salida del país, con almacenes para reducir costos y tiempos de traslado."
          />
          <ul className="card-grid">
            {HUBS.map((hub) => (
              <li key={hub.id} className="hub-card">
                <span className="hub-card__icon-box">
                  <MapPin className="hub-card__icon" aria-hidden="true" />
                </span>
                <div className="hub-card__heading">
                  <h3 className="hub-card__title">{hub.name}</h3>
                  <p className="hub-card__region">{hub.region}</p>
                </div>
                <p className="hub-card__role">{hub.role}</p>
                <ul className="hub-card__details">
                  {hub.details.map((detail) => (
                    <li key={detail} className="hub-card__detail">
                      {detail}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section aria-labelledby="titulo-paises">
        <div className="section__stack">
          <SectionHeader
            id="titulo-paises"
            eyebrow="Latinoamérica"
            title="Ampliamos nuestra presencia en América Latina"
            description="Operamos en Argentina, Brasil, Chile, Colombia y México."
          />
          <ul className="card-grid">
            {COUNTRIES.map((country) => (
              <li key={country.name} className="country-card">
                <div className="country-card__heading">
                  <Globe className="country-card__icon" aria-hidden="true" />
                  <h3 className="country-card__title">{country.name}</h3>
                </div>
                <p className="country-card__status">{country.status}</p>
                <p className="country-card__text">{country.text}</p>
              </li>
            ))}
          </ul>
          <ButtonLink to="/contacto" size="lg" className="section__action">
            Habla con nuestro equipo
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
