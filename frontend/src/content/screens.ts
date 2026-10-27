export interface ScreenEntry {
  to: string;
  title: string;
  description: string;
}

/** Todas las pantallas de la aplicación, para el índice de diseños. */
export const SCREENS: readonly ScreenEntry[] = [
  {
    to: "/",
    title: "Inicio",
    description: "Héroe con buscador de guía, cifras, servicios, recorrido de un paquete, cobertura, panel, alianzas, preguntas y contacto.",
  },
  {
    to: "/rastreo",
    title: "Rastreo",
    description: "Búsqueda simple o múltiple con línea de tiempo de las cinco etapas, eventos y estado de guía no encontrada. Acepta ?guia=.",
  },
  {
    to: "/servicios",
    title: "Servicios",
    description: "Cross border, transporte aéreo, logística inversa, última milla y almacén, cada uno con sus cifras.",
  },
  {
    to: "/cobertura",
    title: "Cobertura",
    description: "Mapa de la red, hubs de Estados Unidos y México, y países de Latinoamérica.",
  },
  {
    to: "/nosotros",
    title: "Nosotros",
    description: "Filosofía de Hound Express, los seis ejes de cultura e impacto social.",
  },
  {
    to: "/preguntas",
    title: "Preguntas frecuentes",
    description: "Acordeón con filtro de texto y estado vacío con enlace a contacto.",
  },
  {
    to: "/contacto",
    title: "Contacto",
    description: "Formulario con validación que prepara un correo, contacto por país y horario.",
  },
  {
    to: "/panel",
    title: "Panel de operaciones",
    description: "Resumen por etapa, registro de guías, lista con búsqueda y filtro, avance de etapa e historial.",
  },
  {
    to: "/disenos",
    title: "Índice de diseños",
    description: "Esta página: guía de estilo viva con pantallas, paleta, tipografía y componentes.",
  },
  {
    to: "/pagina-que-no-existe",
    title: "No encontrada",
    description: "Página 404 con enlaces a Inicio y Rastreo.",
  },
];
