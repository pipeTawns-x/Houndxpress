import { Check } from "lucide-react";
import { ButtonLink } from "../components/ui/ButtonLink.tsx";
import { Eyebrow, PageHeader, Section } from "../components/ui/Section.tsx";
import { SERVICES } from "../content/services.ts";
import type { Service } from "../content/services.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";

/** Bloque visual de cada servicio: icono grande y cifras sobre marino. */
function ServiceVisual({ service }: { service: Service }) {
  const Icon = service.icon;
  return (
    <div
      aria-hidden="true"
      className="on-dark relative flex min-h-64 flex-col justify-between gap-10 overflow-hidden rounded-3xl bg-navy-950 p-8 ring-1 ring-navy-700 md:min-h-80"
    >
      <div className="bg-dot-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_30%_20%,black,transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(28rem_18rem_at_85%_0%,rgb(76_190_216/0.22),transparent_65%)]" />
      <span className="relative flex size-20 items-center justify-center rounded-2xl bg-aqua-500 text-navy-950">
        <Icon className="size-10" strokeWidth={1.75} />
      </span>
      <div className="relative flex flex-wrap gap-x-10 gap-y-4">
        {service.highlights.map((item) => (
          <div key={item.label} className="flex flex-col">
            <span className="font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{item.value}</span>
            <span className="text-label text-navy-300">{item.label}</span>
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
          className="scroll-mt-16"
        >
          <div className="reveal grid items-center gap-10 md:grid-cols-2 lg:gap-16">
            <div className={index % 2 === 1 ? "md:order-last" : ""}>
              <ServiceVisual service={service} />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <Eyebrow>{service.kicker}</Eyebrow>
                <h2 id={`${service.id}-titulo`} className="text-h2 font-bold tracking-tight">
                  {service.title}
                </h2>
                <p className="text-lead text-muted">{service.headline}</p>
              </div>
              <ul className="flex flex-col gap-4">
                {service.features.map((feature) => (
                  <li key={feature.title} className="flex items-start gap-3">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-aqua-100 text-aqua-700">
                      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                    </span>
                    <div className="flex flex-col">
                      <h3 className="text-base font-bold text-navy-800">{feature.title}</h3>
                      <p className="text-base text-muted">{feature.text}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Section>
      ))}

      <Section tone="dark" aria-labelledby="titulo-cierre-servicios">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(44rem_20rem_at_50%_-20%,rgb(76_190_216/0.22),transparent_65%)]" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
          <h2 id="titulo-cierre-servicios" className="text-h2 font-bold text-white">
            Tu ecommerce merece más que envíos, merece una logística que cuide cada detalle
          </h2>
          <p className="text-lead text-navy-300">Cuéntanos qué servicio necesitas y te respondemos.</p>
          <ButtonLink to="/contacto" size="lg">
            Contáctanos
          </ButtonLink>
        </div>
      </Section>
    </>
  );
}
