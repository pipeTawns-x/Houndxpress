import type { LucideIcon } from "lucide-react";
import { Award, HeartHandshake, Lightbulb, Scale, Target, Users } from "lucide-react";

export interface Axis {
  title: string;
  text: string;
  icon: LucideIcon;
}

/** Los seis ejes de cultura de Hound Express. */
export const AXES: readonly Axis[] = [
  {
    title: "Enfocados en el cliente",
    text: "Nos esforzamos por brindar una experiencia disruptiva en cada servicio, con escucha activa y atención a las necesidades de nuestros clientes y colaboradores.",
    icon: HeartHandshake,
  },
  {
    title: "Innovación continua",
    text: "Nos mantenemos actualizados y buscamos nuevas formas de hacer las cosas para ofrecer soluciones prácticas, integrales y personalizadas.",
    icon: Lightbulb,
  },
  {
    title: "Integridad comercial",
    text: "Actuamos con ética, transparencia y lealtad en los negocios. Construimos día a día la confianza, el respeto y el apego a la verdad.",
    icon: Scale,
  },
  {
    title: "Dirección al resultado",
    text: "Los resultados son el motor que nos lleva más lejos: nos comprometemos con el desarrollo de la empresa con una cultura de medición, solución y metas.",
    icon: Target,
  },
  {
    title: "Soluciones de calidad",
    text: "Revolucionamos la forma de hacer negocios para cumplir las expectativas de cada cliente y agregar valor a la cadena logística de empresas mexicanas y extranjeras.",
    icon: Award,
  },
  {
    title: "El valor de la persona",
    text: "Nuestro activo más importante son los colaboradores. Promovemos su formación, estabilidad, equilibrio y desarrollo, porque nuestro equipo hace la diferencia.",
    icon: Users,
  },
];
