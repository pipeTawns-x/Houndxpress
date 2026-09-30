export type NodeKind = "us" | "mx" | "latam";
export type LabelSide = "left" | "right" | "top" | "bottom";

export interface NetworkNode {
  id: string;
  /** Nombre en la lista de hubs y en el texto para lectores de pantalla. */
  name: string;
  /** Texto de la etiqueta en el mapa; `null` si comparte etiqueta con otro nodo. */
  label: string | null;
  lat: number;
  lon: number;
  kind: NodeKind;
  side: LabelSide;
  /** Hubs principales: se dibujan más grandes. */
  primary?: boolean;
  /** Etiquetas de segundo nivel: se ocultan en pantallas pequeñas. */
  minor?: boolean;
  role: string;
}

/** Coordenadas reales de cada ciudad (latitud y longitud en grados). */
export const NETWORK_NODES: readonly NetworkNode[] = [
  {
    id: "laredo",
    name: "Laredo, Texas",
    label: "Laredo · Nuevo Laredo",
    lat: 27.5306,
    lon: -99.4803,
    kind: "us",
    side: "top",
    primary: true,
    role: "Centro de Estados Unidos hacia México",
  },
  {
    id: "nuevo-laredo",
    name: "Nuevo Laredo, Tamaulipas",
    label: null,
    lat: 27.4763,
    lon: -99.5164,
    kind: "mx",
    side: "left",
    role: "Aduana fronteriza entre Estados Unidos y México",
  },
  {
    id: "miami",
    name: "Miami, Florida",
    label: "Miami",
    lat: 25.7617,
    lon: -80.1918,
    kind: "us",
    side: "right",
    primary: true,
    role: "Centro operativo para los envíos a Latinoamérica",
  },
  {
    id: "monterrey",
    name: "Monterrey, Nuevo León",
    label: "Monterrey",
    lat: 25.6866,
    lon: -100.3161,
    kind: "mx",
    side: "left",
    minor: true,
    role: "Oficina y almacén",
  },
  {
    id: "guadalajara",
    name: "Guadalajara, Jalisco",
    label: "Guadalajara",
    lat: 20.6597,
    lon: -103.3496,
    kind: "mx",
    side: "left",
    minor: true,
    role: "Hub de la red nacional",
  },
  {
    id: "cdmx",
    name: "Ciudad de México",
    label: "Ciudad de México",
    lat: 19.4326,
    lon: -99.1332,
    kind: "mx",
    side: "right",
    role: "Oficina corporativa y almacén principal",
  },
  {
    id: "bogota",
    name: "Bogotá, Colombia",
    label: "Bogotá",
    lat: 4.711,
    lon: -74.0721,
    kind: "latam",
    side: "right",
    role: "Operación en Colombia",
  },
  {
    id: "sao-paulo",
    name: "São Paulo, Brasil",
    label: "São Paulo",
    lat: -23.5505,
    lon: -46.6333,
    kind: "latam",
    side: "left",
    role: "Operación en Brasil",
  },
  {
    id: "santiago",
    name: "Santiago, Chile",
    label: "Santiago",
    lat: -33.4489,
    lon: -70.6693,
    kind: "latam",
    side: "left",
    role: "Operación en Chile",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires, Argentina",
    label: "Buenos Aires",
    lat: -34.6037,
    lon: -58.3816,
    kind: "latam",
    side: "right",
    role: "Operación en Argentina",
  },
];

/** Rutas dibujadas como arcos: (origen, destino). */
export const NETWORK_ROUTES: readonly (readonly [string, string])[] = [
  ["laredo", "monterrey"],
  ["laredo", "guadalajara"],
  ["laredo", "cdmx"],
  ["laredo", "miami"],
  ["miami", "bogota"],
  ["miami", "sao-paulo"],
  ["miami", "santiago"],
  ["miami", "buenos-aires"],
];

export interface Hub {
  id: string;
  name: string;
  region: string;
  role: string;
  details: string[];
}

/** Los seis hubs de Estados Unidos y México, con su función según el sitio actual. */
export const HUBS: readonly Hub[] = [
  {
    id: "laredo",
    name: "Laredo",
    region: "Texas, Estados Unidos",
    role: "Centro de Estados Unidos hacia México",
    details: ["Punto estratégico en Estados Unidos"],
  },
  {
    id: "miami",
    name: "Miami",
    region: "Florida, Estados Unidos",
    role: "Centro operativo para los envíos a Latinoamérica",
    details: ["Punto estratégico en Estados Unidos"],
  },
  {
    id: "nuevo-laredo",
    name: "Nuevo Laredo",
    region: "Tamaulipas, México",
    role: "Aduana fronteriza entre Estados Unidos y México",
    details: ["Operaciones aduaneras (NLU)"],
  },
  {
    id: "cdmx",
    name: "Ciudad de México",
    region: "México",
    role: "Oficina corporativa y almacén principal",
    details: ["Operaciones aduaneras (MEX)"],
  },
  {
    id: "monterrey",
    name: "Monterrey",
    region: "Nuevo León, México",
    role: "Oficina y almacén",
    details: ["Hub estratégico en México"],
  },
  {
    id: "guadalajara",
    name: "Guadalajara",
    region: "Jalisco, México",
    role: "Hub estratégico de la red en México",
    details: ["Punto de la red en México"],
  },
];

export interface Country {
  name: string;
  /** Cómo lo presenta el sitio actual: "Ampliamos nuestra presencia" o "Extendemos operaciones". */
  status: string;
  text: string;
}

/** Países de Latinoamérica donde opera Hound Express. */
export const COUNTRIES: readonly Country[] = [
  {
    name: "México",
    status: "Extendemos operaciones",
    text: "Hubs en Ciudad de México, Monterrey, Guadalajara y Nuevo Laredo, y más de 3,000 puntos de recolección.",
  },
  {
    name: "Colombia",
    status: "Ampliamos nuestra presencia",
    text: "Parte de nuestra red en América Latina.",
  },
  {
    name: "Chile",
    status: "Ampliamos nuestra presencia",
    text: "Parte de nuestra red en América Latina.",
  },
  {
    name: "Argentina",
    status: "Extendemos operaciones",
    text: "Parte de nuestra red en América Latina.",
  },
  {
    name: "Brasil",
    status: "Extendemos operaciones",
    text: "Parte de nuestra red en América Latina.",
  },
];

/** Ubicaciones desde las que el personal registra un avance: los hubs de Estados Unidos y México. */
export const OPERATION_LOCATIONS: readonly string[] = [
  "Laredo, TX",
  "Nuevo Laredo, Tamps.",
  "Miami, FL",
  "Monterrey, N.L.",
  "Guadalajara, Jal.",
  "Ciudad de México",
];

/** Sugerencias para origen y destino al registrar una guía. */
export const PLACE_SUGGESTIONS: readonly string[] = [
  ...OPERATION_LOCATIONS,
  "Bogotá, Colombia",
  "São Paulo, Brasil",
  "Santiago, Chile",
  "Buenos Aires, Argentina",
];
