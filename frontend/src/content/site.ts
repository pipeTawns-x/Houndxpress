export const TAGLINE = "We move ecommerce globally!";

export interface NavItem {
  to: string;
  label: string;
}

/** Navegación principal, en el orden del sistema de diseño. */
export const NAV_ITEMS: readonly NavItem[] = [
  { to: "/servicios", label: "Servicios" },
  { to: "/cobertura", label: "Cobertura" },
  { to: "/rastreo", label: "Rastreo" },
  { to: "/nosotros", label: "Nosotros" },
  { to: "/preguntas", label: "Preguntas" },
  { to: "/contacto", label: "Contacto" },
];

export interface ContactPoint {
  id: string;
  country: string;
  place: string;
  phone: string;
  email: string;
}

export const CONTACTS: readonly ContactPoint[] = [
  {
    id: "mx",
    country: "México",
    place: "Ciudad de México",
    phone: "+52 55 4000 1920",
    email: "sclientes1@hound-express.com",
  },
  {
    id: "laredo",
    country: "Estados Unidos",
    place: "Laredo, Texas",
    phone: "+1 956 568 3443",
    email: "cslaredo1@hound-express.com",
  },
  {
    id: "miami",
    country: "Estados Unidos",
    place: "Miami, Florida",
    phone: "+1 786 528 8261",
    email: "sales@hound-express.com",
  },
];

/** Correo que recibe los mensajes del formulario de contacto. */
export const CONTACT_EMAIL = "sclientes1@hound-express.com";

export const HOURS = [
  { days: "Lunes a viernes", time: "09:00 – 18:00" },
  { days: "Sábados", time: "09:00 – 13:00" },
] as const;

export interface Stat {
  value: string;
  label: string;
  description: string;
}

/** Cifras del sitio actual de Hound Express. */
export const STATS: readonly Stat[] = [
  {
    value: "2",
    label: "hubs en USA",
    description: "Laredo, Texas y Miami, Florida.",
  },
  {
    value: "10",
    label: "puntos de entrada en LATAM",
    description: "Cobertura y rapidez en cada país.",
  },
  {
    value: "+15,000",
    label: "m² de almacenes",
    description: "Capacidad para más de 1 millón de paquetes.",
  },
  {
    value: "+3,000",
    label: "puntos de recolección",
    description: "Drop Off en todo México.",
  },
];

export const ALLIANCES = {
  marketplaces: [
    {
      name: "Amazon LATAM",
      text: "Vende en Amazon LATAM desde Estados Unidos sin complicaciones.",
    },
    {
      name: "Walmart Marketplace",
      text: "Vende y envía tus productos de México a EE. UU. de forma sencilla y segura.",
    },
  ],
  memberships: ["IATA", "COFOCE", "Aftership"],
} as const;

export const ACADEMIC_NOTE = "Proyecto académico de EBAC para Hound Express. Rediseño no oficial.";
