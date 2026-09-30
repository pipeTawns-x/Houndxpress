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
        <div className="philosophy">
          <SectionHeader
            id="titulo-filosofia"
            eyebrow="Filosofía Hound Express"
            title="Tecnología, aduanas y comercio exterior en un solo socio"
            description="Nuestra experiencia nos posiciona como un socio estratégico de referencia en servicios de ecommerce cross border, para empresas nacionales e internacionales que buscan crecer sin fronteras."
          />
          <div className="philosophy__text">
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

      <Section aria-labelledby="titulo-impacto">
        <div className="section__stack">
          <SectionHeader
            id="titulo-impacto"
            eyebrow="Impacto social"
            title="Dar de regreso al mundo en el que vivimos"
            description="Nuestra estrategia de responsabilidad corporativa tiene dos ejes de acción: medio ambiente y educación."
          />
          <div className="impact">
            <div className="impact__card">
              <Leaf className="impact__icon" aria-hidden="true" />
              <h3 className="impact__title">Compromiso con el ambiente</h3>
              <p className="impact__text">
                Nos comprometemos con la conservación del medio ambiente y con reducir el impacto ecológico: preservar,
                retribuir y cuidar a nuestro planeta.
              </p>
            </div>
            <div className="impact__card impact__card--wide">
              <GraduationCap className="impact__icon" aria-hidden="true" />
              <h3 className="impact__title">Fundación Becar IAP</h3>
              <p className="impact__text">
                Creemos que la educación es la palanca para la movilidad social y el desarrollo de nuestra comunidad.
                Creamos programas internos que promueven y apoyan la educación continua de nuestros colaboradores, y
                apoyamos a Fundación Becar en su misión de que niñas, niños y jóvenes en situación vulnerable logren un
                desarrollo personal y participen en la transformación social de su comunidad y de México.
              </p>
              <p className="impact__highlight">
                <HeartHandshake className="impact__highlight-icon" aria-hidden="true" />
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
