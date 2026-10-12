import type { LucideIcon } from "lucide-react";
import { Globe, Plane, RotateCcw, Truck, Warehouse } from "lucide-react";

export interface ServiceFeature {
  title: string;
  text: string;
}

export interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  /** Rótulo corto que el sitio actual pone junto al nombre. */
  kicker: string;
  /** Frase de una línea para las tarjetas. */
  summary: string;
  headline: string;
  features: ServiceFeature[];
  /** Cifras destacadas del servicio, tomadas del sitio actual. */
  highlights: { value: string; label: string }[];
}

/** Los cinco servicios de ecommerce de Hound Express. */
export const SERVICES: readonly Service[] = [
  {
    id: "cross-border",
    icon: Globe,
    title: "Cross border",
    kicker: "Tecnología y estrategia",
    summary: "Cruza fronteras sin límites, con tecnología, cobertura y agilidad.",
    headline: "Cruza fronteras sin límites: tecnología, cobertura y agilidad para tu operación internacional.",
    features: [
      {
        title: "Tecnología para tu operación ecommerce",
        text: "Un sistema diseñado para automatizar y optimizar cada paso de tu operación logística y de ecommerce.",
      },
      {
        title: "Presencia estratégica internacional",
        text: "2 hubs en USA (Laredo y Miami) y 10 puntos de entrada en LATAM que garantizan cobertura y rapidez.",
      },
      {
        title: "Equipo especializado en aduanas",
        text: "Personal ubicado dentro de las aduanas para que tus procesos sean más ágiles y eficientes.",
      },
    ],
    highlights: [
      { value: "2", label: "hubs en USA" },
      { value: "10", label: "puntos de entrada en LATAM" },
    ],
  },
  {
    id: "transporte-aereo",
    icon: Plane,
    title: "Transporte aéreo",
    kicker: "Importación / Exportación",
    summary: "Transporte aéreo seguro y ágil, con el respaldo de IATA.",
    headline: "Transporte aéreo seguro y ágil, con el respaldo de IATA.",
    features: [
      {
        title: "Miembro IATA",
        text: "Operamos con el respaldo de la asociación internacional del transporte aéreo.",
      },
      {
        title: "Carga especializada",
        text: "Transportamos carga general, perecedera y peligrosa, cumpliendo estándares internacionales de seguridad.",
      },
      {
        title: "Tarifas competitivas",
        text: "Alianzas con socios logísticos en México y el extranjero para ofrecerte costos optimizados y cobertura global.",
      },
    ],
    highlights: [{ value: "IATA", label: "miembro" }],
  },
  {
    id: "logistica-inversa",
    icon: RotateCcw,
    title: "Logística inversa",
    kicker: "Retornos inteligentes",
    summary: "Devoluciones fáciles, rápidas y controladas para tu ecommerce.",
    headline: "Devoluciones fáciles, rápidas y controladas para tu ecommerce.",
    features: [
      {
        title: "Cobertura nacional",
        text: "Más de 3,000 puntos de recolección (Drop Off) distribuidos en todo México.",
      },
      {
        title: "Procesos especializados",
        text: "Flujos diseñados para retornos y almacenamiento de ecommerce con la máxima eficiencia.",
      },
      {
        title: "Alta capacidad operativa",
        text: "Capacidad para procesar más de 200,000 devoluciones al mes, con trazabilidad total en cada etapa.",
      },
    ],
    highlights: [
      { value: "+3,000", label: "puntos de recolección" },
      { value: "+200,000", label: "devoluciones al mes" },
    ],
  },
  {
    id: "ultima-milla",
    icon: Truck,
    title: "Última milla",
    kicker: "Rastreabilidad",
    summary: "Entregas confiables, oportunas y con cobertura total.",
    headline: "Entregas confiables, oportunas y con cobertura total.",
    features: [
      {
        title: "Red de distribución",
        text: "Una red logística que abarca todo México, con entregas en zonas urbanas y regionales.",
      },
      {
        title: "Opciones de envío",
        text: "Servicio estándar (6 a 9 días) y priority (3 a 5 días), según la urgencia de tu operación.",
      },
      {
        title: "Seguimiento en tiempo real",
        text: "Trazabilidad continua (end to end) para que tengas visibilidad en cada etapa del envío.",
      },
    ],
    highlights: [
      { value: "6–9 días", label: "servicio estándar" },
      { value: "3–5 días", label: "servicio priority" },
    ],
  },
  {
    id: "almacen",
    icon: Warehouse,
    title: "Almacén",
    kicker: "Capacidad y monitoreo",
    summary: "Espacio, capacidad y control para tu operación logística.",
    headline: "Espacio, capacidad y control para tu operación logística.",
    features: [
      {
        title: "Infraestructura robusta",
        text: "Más de 15,000 m² de almacenes, con capacidad para más de 1 millón de paquetes.",
      },
      {
        title: "Seguridad 24/7",
        text: "Monitoreo integral y sistemas automatizados para proteger tu mercancía de forma continua.",
      },
    ],
    highlights: [
      { value: "+15,000 m²", label: "de almacenes" },
      { value: "24/7", label: "seguridad" },
    ],
  },
];
