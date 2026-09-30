import { HeartHandshake, GraduationCap, Leaf } from "lucide-react";
import { PageHeader, Section, SectionHeader } from "../components/ui/Section.tsx";
import { AXES } from "../content/culture.ts";
import { useDocumentTitle } from "../hooks/useDocumentTitle.ts";

export default function About() {
  useDocumentTitle("Nosotros");
  return (
    <>
      <PageHeader
        eyebrow="Nosotros"
        title="Impulsamos el crecimiento del ecommerce sin fronteras"
        description="Soluciones logísticas integrales y comercio internacional, diseñadas para conectar negocios con el mundo."
      />

      <Section aria-labelledby="titulo-filosofia">
        <div className="reveal grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeader
            id="titulo-filosofia"
            eyebrow="Filosofía Hound Express"
            title="Tecnología, aduanas y comercio exterior en un solo socio"
            description="Nuestra experiencia nos posiciona como un socio estratégico de referencia en servicios de ecommerce cross border, para empresas nacionales e internacionales que buscan crecer sin fronteras."
          />
          <div className="flex flex-col gap-5 text-base text-muted">
            <p>
              Incorporamos tecnología propia que da acceso inmediato a la información y garantiza una operación ágil,
              transparente y eficiente.
            </p>
            <p>
              Contamos con un equipo altamente calificado, con profundo conocimiento en logística, aduanas y comercio
              exterior. Operamos en las principales aduanas de Estados Unidos y América Latina, con certificaciones
              internacionales que respaldan nuestra calidad y compromiso.
            </p>
            <p>
              Nuestra prioridad es generar valor sostenible para todos nuestros grupos de interés, promoviendo el
              crecimiento, la rentabilidad y la responsabilidad social, con un compromiso permanente con la innovación y
              el cuidado del medio ambiente.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="titulo-ejes">
        <div className="reveal flex flex-col gap-10">
          <SectionHeader
            id="titulo-ejes"
            eyebrow="Ejes Hound Express"
            title="Los seis ejes de nuestra cultura"
            description="Son la base de cómo pensamos, actuamos y servimos, y reflejan nuestro compromiso con clientes, colaboradores y entorno."
          />
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {AXES.map((axis) => (
              <li key={axis.title} className="flex flex-col gap-3 rounded-2xl bg-white p-6 shadow-soft ring-1 ring-line">
                <span className="flex size-12 items-center justify-center rounded-xl bg-aqua-100 text-aqua-700">
                  <axis.icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="text-h3 font-bold">{axis.title}</h3>
                <p className="text-base text-muted">{axis.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section aria-labelledby="titulo-impacto">
        <div className="reveal flex flex-col gap-10">
          <SectionHeader
            id="titulo-impacto"
            eyebrow="Impacto social"
            title="Dar de regreso al mundo en el que vivimos"
            description="Nuestra estrategia de responsabilidad corporativa tiene dos ejes de acción: medio ambiente y educación."
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-line">
              <Leaf className="size-6 text-aqua-700" aria-hidden="true" />
              <h3 className="text-h3 font-bold">Compromiso con el ambiente</h3>
              <p className="text-base text-muted">
                Nos comprometemos con la conservación del medio ambiente y con reducir el impacto ecológico: preservar,
                retribuir y cuidar a nuestro planeta.
              </p>
            </div>
            <div className="flex flex-col gap-3 rounded-2xl bg-white p-6 ring-1 ring-line lg:col-span-2">
              <GraduationCap className="size-6 text-aqua-700" aria-hidden="true" />
              <h3 className="text-h3 font-bold">Fundación Becar IAP</h3>
              <p className="text-base text-muted">
                Creemos que la educación es la palanca para la movilidad social y el desarrollo de nuestra comunidad.
                Creamos programas internos que promueven y apoyan la educación continua de nuestros colaboradores, y
                apoyamos a Fundación Becar en su misión de que niñas, niños y jóvenes en situación vulnerable logren un
                desarrollo personal y participen en la transformación social de su comunidad y de México.
              </p>
              <p className="flex items-start gap-2 text-base text-ink">
                <HeartHandshake className="mt-0.5 size-5 shrink-0 text-aqua-700" aria-hidden="true" />
                <span>
                  Becar ha beneficiado a más de 60,000 personas de manera directa y a 250,000 de manera indirecta. En los
                  últimos 3 años benefició en promedio a 8,500 personas por año.
                </span>
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
