import { useRef } from "react";
import { Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "../ui/Button.tsx";

const FEATURED_SERVICES = [
  {
    id: "transporte-aereo",
    title: "Carga que cruza fronteras.",
    label: "Transporte de carga",
    image: "servicio-cargo.webp",
    alt: "Vista ilustrativa de una terminal de contenedores con grúa y camión",
    text: "Transporte aéreo para importación y exportación.",
  },
  {
    id: "cross-border",
    title: "La frontera no es el límite.",
    label: "Cross border y aduanas",
    image: "servicio-customs.webp",
    alt: "Vista ilustrativa de un carril de inspección aduanal",
    text: "Tecnología y procesos aduanales para tu operación internacional.",
  },
  {
    id: "ultima-milla",
    title: "Hasta la última milla.",
    label: "Distribución de paquetes",
    image: "servicio-parcel.webp",
    alt: "Vista ilustrativa de un centro de clasificación de paquetes",
    text: "Seguimiento del envío, desde la recepción hasta la entrega.",
  },
  {
    id: "almacen",
    title: "Espacio para crecer.",
    label: "Logística para ecommerce",
    image: "servicio-ecommerce.webp",
    alt: "Vista ilustrativa de cajas en tarima junto a un andén de carga",
    text: "Almacenamiento y control para tu operación logística.",
  },
] as const;
export function ServiceGallery() {
  const track = useRef<HTMLUListElement>(null);
  function move(direction: number) {
    const reduced =
      typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.current?.scrollBy({
      left: direction * track.current.clientWidth * 0.8,
      behavior: reduced ? "instant" : "smooth",
    });
  }
  return (
    <section className="freight-services container" aria-labelledby="servicios-inicio">
      <div className="freight-services__heading">
        <div>
          <p className="eyebrow">Soluciones conectadas</p>
          <h2 id="servicios-inicio">
            Tu operación.
            <br />
            Sin fronteras.
          </h2>
        </div>
        <div className="freight-services__navigation">
          <Button variant="secondary" size="icon" aria-label="Servicios anteriores" onClick={() => move(-1)}>
            <ArrowLeft aria-hidden="true" />
          </Button>
          <Button variant="secondary" size="icon" aria-label="Servicios siguientes" onClick={() => move(1)}>
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>
      <ul className="freight-services__track" ref={track} tabIndex={0} aria-label="Servicios de logística">
        {FEATURED_SERVICES.map((item) => (
          <li key={item.id} className="freight-services__item">
            <Link to={`/servicios#${item.id}`} className="freight-services__link">
              <div className="freight-services__image">
                <img src={`/media/${item.image}`} alt={item.alt} width={1344} height={752} loading="lazy" />
              </div>
              <div className="freight-services__label">
                <span>{item.label}</span>
                <ArrowRight size={20} aria-hidden="true" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </Link>
          </li>
        ))}
      </ul>
      <Link to="/servicios" className="text-link">
        Conocer todos los servicios
      </Link>
    </section>
  );
}
