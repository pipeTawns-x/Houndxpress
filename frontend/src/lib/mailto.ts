import { CONTACT_EMAIL } from "../content/site.ts";

export interface ContactMessage {
  name: string;
  email: string;
  phone: string;
  subject: string;
  guideNumber: string;
  message: string;
}

/** Arma el enlace `mailto:` con el asunto y el cuerpo ya escritos. */
export function buildMailto(data: ContactMessage, to: string = CONTACT_EMAIL): string {
  const subject = data.guideNumber ? `${data.subject} · Guía ${data.guideNumber}` : data.subject;
  const lines = [
    `Nombre: ${data.name}`,
    `Correo: ${data.email}`,
    `Teléfono: ${data.phone}`,
    `Asunto: ${data.subject}`,
    ...(data.guideNumber ? [`Número de guía: ${data.guideNumber}`] : []),
    "",
    data.message,
  ];
  const query = new URLSearchParams({ subject, body: lines.join("\n") });
  // URLSearchParams codifica los espacios como "+", que los clientes de correo muestran tal cual.
  return `mailto:${to}?${query.toString().replace(/\+/g, "%20")}`;
}
