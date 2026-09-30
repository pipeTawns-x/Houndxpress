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
        <div className="reveal flex flex-col gap-10">
          <SectionHeader
            id="titulo-mapa"
            eyebrow="Mapa de la red"
            title="Dos hubs en USA y diez puntos de entrada en LATAM"
            description="Combinamos tecnología y logística para facilitar envíos de comercio electrónico a cualquier destino."
          />
          <NetworkMap className="mx-auto w-full max-w-4xl" />
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="titulo-hubs">
        <div className="reveal flex flex-col gap-10">
          <SectionHeader
            id="titulo-hubs"
            eyebrow="Hubs estratégicos"
            title="Hubs a lo largo de México y Estados Unidos"
            description="Múltiples puntos de entrada y salida del país, con almacenes para reducir costos y tiempos de traslado."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {HUBS.map((hub) => (
              <li key={hub.id} className="flex h-full flex-col gap-3 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line transition duration-200 ease-out hover:-translate-y-1 hover:shadow-lift">
                <span className="flex size-11 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                  <MapPin className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                  <h3 className="text-h3 font-bold">{hub.name}</h3>
                  <p className="text-label text-muted">{hub.region}</p>
                </div>
                <p className="text-base text-ink">{hub.role}</p>
                <ul className="mt-auto flex flex-wrap gap-2">
                  {hub.details.map((detail) => (
                    <li key={detail} className="rounded-full bg-aqua-100 px-3 py-1 text-label font-semibold text-navy-800">
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
        <div className="reveal flex flex-col gap-10">
          <SectionHeader
            id="titulo-paises"
            eyebrow="Latinoamérica"
            title="Ampliamos nuestra presencia en América Latina"
            description="Operamos en Argentina, Brasil, Chile, Colombia y México."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {COUNTRIES.map((country) => (
              <li key={country.name} className="flex flex-col gap-2 rounded-2xl bg-white p-6 ring-1 ring-line">
                <div className="flex items-center gap-3">
                  <Globe className="size-5 text-aqua-700" aria-hidden="true" />
                  <h3 className="text-h3 font-bold">{country.name}</h3>
                </div>
                <p className="text-label font-semibold text-aqua-700">{country.status}</p>
                <p className="text-base text-muted">{country.text}</p>
              </li>
            ))}
          </ul>
          <ButtonLink to="/contacto" size="lg" className="self-start">
            Habla con nuestro equipo
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
