import { STAGE_CODES } from "../domain/index.ts";
import type { Guide, ServiceLevel, StageEvent } from "../domain/index.ts";

/**
 * Fecha fija de referencia de las guías de ejemplo. Las semillas se calculan
 * a partir de ella (y no de `Date.now()`) para que sean idénticas en cada
 * ejecución y en las pruebas.
 */
export const SEED_REFERENCE_DATE = "2026-09-28T15:00:00.000Z";

const REFERENCE_MS = Date.parse(SEED_REFERENCE_DATE);
const HOUR_MS = 60 * 60 * 1000;

interface SeedEvent {
  /** Horas antes de la fecha de referencia. */
  hoursAgo: number;
  location: string;
  note?: string;
}

interface SeedGuide {
  number: string;
  origin: string;
  destination: string;
  recipient: string;
  service: ServiceLevel;
  /** Un evento por etapa completada, en orden. La etapa actual es la del último. */
  events: SeedEvent[];
}

const SEEDS: readonly SeedGuide[] = [
  {
    number: "2148213907650312",
    origin: "Miami, FL",
    destination: "Bogotá, Colombia",
    recipient: "Laura Gómez",
    service: "priority",
    events: [{ hoursAgo: 3, location: "Miami, FL" }],
  },
  {
    number: "2103958472016654",
    origin: "Laredo, TX",
    destination: "Ciudad de México",
    recipient: "Andrés Ramírez",
    service: "standard",
    events: [
      { hoursAgo: 30, location: "Laredo, TX" },
      { hoursAgo: 6, location: "Laredo, TX", note: "Carga consolidada en el almacén." },
    ],
  },
  {
    number: "HX7Q4M9K2B8T5W1N6R3D0C",
    origin: "Miami, FL",
    destination: "Buenos Aires, Argentina",
    recipient: "Julián Pereyra",
    service: "priority",
    events: [
      { hoursAgo: 27, location: "Miami, FL" },
      { hoursAgo: 9, location: "Miami, FL" },
    ],
  },
  {
    number: "2176640215839927",
    origin: "Miami, FL",
    destination: "São Paulo, Brasil",
    recipient: "Camila Souza",
    service: "standard",
    events: [
      { hoursAgo: 76, location: "Miami, FL" },
      { hoursAgo: 50, location: "Miami, FL" },
      { hoursAgo: 20, location: "Miami, FL" },
    ],
  },
  {
    number: "2119875302467781",
    origin: "Laredo, TX",
    destination: "Monterrey, N.L.",
    recipient: "Diego Herrera",
    service: "priority",
    events: [
      { hoursAgo: 70, location: "Laredo, TX" },
      { hoursAgo: 60, location: "Laredo, TX" },
      { hoursAgo: 52, location: "Nuevo Laredo, Tamps." },
      { hoursAgo: 40, location: "Nuevo Laredo, Tamps.", note: "Salida hacia Monterrey." },
    ],
  },
  {
    number: "2187120945563218",
    origin: "Miami, FL",
    destination: "Santiago, Chile",
    recipient: "Felipe Araya",
    service: "standard",
    events: [
      { hoursAgo: 150, location: "Miami, FL" },
      { hoursAgo: 128, location: "Miami, FL" },
      { hoursAgo: 110, location: "Miami, FL" },
      { hoursAgo: 96, location: "Miami, FL" },
    ],
  },
  {
    number: "2154302968170435",
    origin: "Laredo, TX",
    destination: "Guadalajara, Jal.",
    recipient: "Mariana Torres",
    service: "standard",
    events: [
      { hoursAgo: 216, location: "Laredo, TX" },
      { hoursAgo: 200, location: "Laredo, TX" },
      { hoursAgo: 190, location: "Nuevo Laredo, Tamps." },
      { hoursAgo: 168, location: "Monterrey, N.L.", note: "Paso por el centro de distribución." },
      { hoursAgo: 96, location: "Guadalajara, Jal.", note: "Recibió Mariana Torres." },
    ],
  },
  {
    number: "2131764058209473",
    origin: "Laredo, TX",
    destination: "Ciudad de México",
    recipient: "Sofía Martínez",
    service: "priority",
    events: [
      { hoursAgo: 120, location: "Laredo, TX" },
      { hoursAgo: 112, location: "Laredo, TX" },
      { hoursAgo: 106, location: "Nuevo Laredo, Tamps." },
      { hoursAgo: 100, location: "Monterrey, N.L." },
      { hoursAgo: 52, location: "Ciudad de México" },
    ],
  },
];

function buildGuide(seed: SeedGuide): Guide {
  const history: StageEvent[] = seed.events.map((event, index) => {
    const stage = STAGE_CODES[index];
    if (stage === undefined) {
      throw new Error(`La guía ${seed.number} tiene más eventos que etapas.`);
    }
    return {
      stage,
      at: new Date(REFERENCE_MS - event.hoursAgo * HOUR_MS).toISOString(),
      location: event.location,
      ...(event.note ? { note: event.note } : {}),
    };
  });
  const first = history[0];
  const last = history.at(-1);
  if (!first || !last) {
    throw new Error(`La guía ${seed.number} no tiene eventos.`);
  }
  return {
    number: seed.number,
    origin: seed.origin,
    destination: seed.destination,
    recipient: seed.recipient,
    service: seed.service,
    createdAt: first.at,
    currentStage: last.stage,
    history,
  };
}

/** Guías de ejemplo nuevas cada vez que se llama: nadie comparte referencias. */
export function createSeedGuides(): Guide[] {
  return SEEDS.map(buildGuide);
}

/** Números de las guías de ejemplo, para mostrarlos en la interfaz. */
export const DEMO_GUIDE_NUMBERS: readonly string[] = SEEDS.map((seed) => seed.number);

/** Ruta de cada guía de ejemplo (no cambia aunque la guía avance). */
export const DEMO_GUIDE_ROUTES: Readonly<Record<string, string>> = Object.fromEntries(
  SEEDS.map((seed) => [seed.number, `${seed.origin} → ${seed.destination}`]),
);
