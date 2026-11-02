import { isValidGuideNumber } from "../domain/index.ts";

export const CONTACT_SUBJECTS = ["Seguimiento de paquete", "Cotización de servicio", "Información general"] as const;

export interface ContactValues {
  name: string;
  email: string;
  phone: string;
  subject: string;
  guideNumber: string;
  message: string;
  privacy: boolean;
}

export type ContactErrors = Partial<Record<keyof ContactValues, string>>;

export const EMPTY_CONTACT: ContactValues = {
  name: "",
  email: "",
  phone: "",
  subject: CONTACT_SUBJECTS[0],
  guideNumber: "",
  message: "",
  privacy: false,
};

export const FIELD_ORDER: (keyof ContactValues)[] = ["name", "email", "phone", "subject", "guideNumber", "message", "privacy"];

/** Validación del formulario de contacto. Devuelve un mensaje por campo con error. */
export function validateContact(values: ContactValues): ContactErrors {
  const errors: ContactErrors = {};
  if (values.name.trim() === "") errors.name = "Escribe tu nombre.";
  if (values.email.trim() === "") {
    errors.email = "Escribe tu correo.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Revisa tu correo: debe verse como nombre@empresa.com.";
  }
  const digits = values.phone.replace(/\D/g, "");
  if (values.phone.trim() === "") {
    errors.phone = "Escribe un teléfono de contacto.";
  } else if (digits.length < 8 || digits.length > 15) {
    errors.phone = "Revisa tu teléfono: usa entre 8 y 15 dígitos.";
  }
  if (values.guideNumber.trim() !== "" && !isValidGuideNumber(values.guideNumber)) {
    errors.guideNumber = "Ese número de guía no tiene el formato correcto: 16 dígitos que inician con 21, o 22 caracteres.";
  }
  if (values.message.trim().length < 10) errors.message = "Cuéntanos un poco más: escribe al menos 10 caracteres.";
  if (!values.privacy) errors.privacy = "Acepta para poder preparar el correo.";
  return errors;
}
