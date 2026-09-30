const LOCALE = "es-MX";
/** Todas las fechas se muestran en horario de Ciudad de México. */
export const TIME_ZONE = "America/Mexico_City";
export const TIME_ZONE_NOTE = "Horario de Ciudad de México";

const dateTimeFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

const dateFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
  year: "numeric",
});

const dayMonthFormat = new Intl.DateTimeFormat(LOCALE, {
  timeZone: TIME_ZONE,
  day: "numeric",
  month: "short",
});

function parse(iso: string): Date | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** "28 sept 2026, 9:00 a.m." */
export function formatDateTime(iso: string): string {
  const date = parse(iso);
  return date ? dateTimeFormat.format(date) : "Fecha no disponible";
}

/** "28 sept 2026" */
export function formatDate(iso: string): string {
  const date = parse(iso);
  return date ? dateFormat.format(date) : "Fecha no disponible";
}

/** "3 – 6 oct 2026" */
export function formatDateRange(fromIso: string, toIso: string): string {
  const from = parse(fromIso);
  const to = parse(toIso);
  if (!from || !to) return "Fecha no disponible";
  return `${dayMonthFormat.format(from)} – ${dateFormat.format(to)}`;
}

/** Minúsculas y sin acentos, para comparar textos al filtrar. */
export function foldText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** "+52 55 4000 1920" -> "tel:+525540001920" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
