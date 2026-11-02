export interface FaqLink {
  to: string;
  label: string;
}

export interface FaqEntry {
  id: string;
  question: string;
  /** Párrafos de la respuesta. */
  paragraphs: string[];
  bullets?: string[];
  /** Párrafo que sigue a la lista. */
  afterBullets?: string;
  link?: FaqLink;
}

const CUSTOMER_SERVICE =
  "Centro de Servicio a Clientes Hound Express: 55 4000 1920, opción 2, de lunes a viernes de 08:00 a 18:00 horas y sábados de 09:00 a 13:00 horas.";

/** Preguntas frecuentes del sitio actual, con el texto ordenado y sin erratas. */
export const FAQ: readonly FaqEntry[] = [
  {
    id: "cuanto-tarda",
    question: "¿Cuánto tarda en llegar mi paquete?",
    paragraphs: [
      "Si tu envío es internacional, el tiempo de entrega puede ser de 15 a 20 días a partir de que realizas tu compra.",
      "Si tu envío es nacional, el tiempo de entrega puede ser de 5 a 7 días.",
    ],
  },
  {
    id: "no-ha-llegado",
    question: "Mi paquete no ha llegado",
    paragraphs: ["Para saber dónde está tu paquete, ten a la mano tu número de guía y consúltalo en el rastreo."],
    link: { to: "/rastreo", label: "Ir al rastreo" },
  },
  {
    id: "numero-de-guia",
    question: "Si no tengo mi número de guía, ¿dónde lo obtengo?",
    paragraphs: [
      "Lo encuentras en la página web donde compraste tu producto; en ocasiones te lo envían por correo electrónico.",
      "Normalmente tiene 16 dígitos e inicia con 21, o 22 caracteres (solo números o con una letra intermedia).",
    ],
  },
  {
    id: "detenido-aduana",
    question: "Mi paquete aparece como “Detenido en aduana”, ¿qué significa?",
    paragraphs: [
      "Significa que la aduana está revisando tu paquete. Es ella quien determina qué paquetes se revisan, y es un filtro necesario para que todo lo que ingresa al país cumpla con la legislación vigente.",
      "Revisa la actualización en el sistema en 48 a 72 horas, el tiempo aproximado que lleva la revisión.",
    ],
  },
  {
    id: "importacion-prohibida",
    question: "¿Qué significa que mi paquete esté clasificado como “Importación prohibida”?",
    paragraphs: [
      "Se refiere a mercancías que la autoridad retiene porque no pueden ingresar al país.",
      "Ponte en contacto con la empresa donde compraste tu producto para revisar la situación de tu compra.",
    ],
  },
  {
    id: "entregado-sin-recibir",
    question: "Mi paquete aparece como entregado y no lo recibí",
    paragraphs: [
      "Si el rastreo indica que tu paquete fue entregado pero no lo recibiste, revisa con el área de vigilancia de tu domicilio (si la hay) o con algún vecino que hayas autorizado para recibir.",
      `Si aun así no lo ubicas, comunícate con el ${CUSTOMER_SERVICE} Te ayudaremos a:`,
    ],
    bullets: [
      "Verificar la dirección de envío.",
      "Revisar el seguimiento de tu paquete.",
      "Dar seguimiento con el mensajero para confirmar la entrega correcta.",
    ],
  },
  {
    id: "extraviado",
    question: "Mi paquete aparece como extraviado",
    paragraphs: [
      "Si tu paquete presenta este estatus, haz tu reclamo en la página web donde adquiriste el producto. Ellos darán respuesta de acuerdo con sus políticas.",
    ],
  },
  {
    id: "datos-incompletos",
    question: "Mis datos están incompletos o cambié de domicilio",
    paragraphs: [
      `Para corregir los datos de entrega, ten a la mano tu número de guía y comunícate con el ${CUSTOMER_SERVICE} Podrás:`,
    ],
    bullets: [
      "Corregir el domicilio.",
      "Recibir las referencias del domicilio que transmitiremos al mensajero.",
      "Corregir datos mal capturados.",
      "Compartir tu ubicación para facilitar la entrega.",
    ],
  },
  {
    id: "recoger-paquete",
    question: "¿Dónde puedo recoger mi paquete?",
    paragraphs: [
      `Para recoger tu paquete, este debe estar en uno de nuestros almacenes. Comunícate con el ${CUSTOMER_SERVICE} Te daremos el domicilio de la sucursal a la que puedes acudir y sus horarios de atención.`,
      "Acude con tu identificación oficial (pasaporte o INE) y tu número de guía.",
    ],
  },
  {
    id: "recoge-otra-persona",
    question: "¿Puede alguien más recoger mi paquete?",
    paragraphs: [
      "Sí. Emite una carta poder simple y anexa una copia de tu identificación oficial (pasaporte o INE). La persona que autorices debe llevar su identificación oficial original.",
    ],
  },
  {
    id: "paquete-devuelto",
    question: "Mi paquete fue devuelto, ¿qué puedo hacer?",
    paragraphs: [
      "Un paquete regresa a nuestro centro de resguardo en la CDMX cuando hubo inconvenientes para entregarlo, por ejemplo: domicilio incorrecto o insuficiente, no pudimos contactarte en el teléfono registrado en tu compra, cambiaste de domicilio o no había nadie para recibirlo.",
      "Puedes hacer tu reclamo en la página web donde adquiriste tu producto y procederán de acuerdo con sus políticas.",
      `En algunos casos sí podemos reenviar tu paquete con un costo adicional que debe cubrirse antes del reenvío. Comunícate con el ${CUSTOMER_SERVICE} Con gusto te daremos costos y tiempos de entrega, según cada caso y la cobertura.`,
    ],
  },
];

/** Las tres preguntas que se muestran en la página de inicio. */
export const FEATURED_FAQ_IDS = ["cuanto-tarda", "numero-de-guia", "detenido-aduana"] as const;
