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
        <img
          className="about-photo"
          src="/media/nosotros-operacion.webp"
          width={1344}
          height={752}
          loading="lazy"
          alt="Vista ilustrativa de una sala de control logístico"
        />
        <div className="philosophy">
          <SectionHeader
            id="titulo-filosofia"
            eyebrow="Filosofía Hound Express"
            title="Tecnología, aduanas y comercio exterior en un solo socio"
            description="Nuestra experiencia nos posiciona como un socio estratégico de referencia en servicios de ecommerce cross border, para empresas nacionales e internacionales que buscan crecer sin fronteras."
          />
          <div className="philosophy__text">
            <p>
              Incorporamos tecnología propia que da acceso inmediato a la información y garantiza una
              operación ágil, transparente y eficiente.
            </p>
            <p>
              Contamos con un equipo altamente calificado, con profundo conocimiento en logística, aduanas y
              comercio exterior. Operamos en las principales aduanas de Estados Unidos y América Latina.
            </p>
            <p>
              Nuestra prioridad es generar valor sostenible para todos nuestros grupos de interés, promoviendo
              el crecimiento, la rentabilidad y la responsabilidad social, con un compromiso permanente con la
              innovación y el cuidado del medio ambiente.
            </p>
          </div>
        </div>
      </Section>

      <Section tone="surface" aria-labelledby="titulo-ejes">
        <div className="section__stack">
          <SectionHeader
            id="titulo-ejes"
            eyebrow="Ejes Hound Express"
            title="Los seis ejes de nuestra cultura"
            description="Son la base de cómo pensamos, actuamos y servimos, y reflejan nuestro compromiso con clientes, colaboradores y entorno."
          />
          <ul className="card-grid">
            {AXES.map((axis) => (
              <li key={axis.title} className="axis-card">
                <span className="axis-card__icon-box">
                  <axis.icon className="axis-card__icon" aria-hidden="true" />
                </span>
                <h3 className="axis-card__title">{axis.title}</h3>
                <p className="axis-card__text">{axis.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </Section>
    </>
  );
}
