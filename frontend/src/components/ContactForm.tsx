import { useState } from "react";
import type { FormEvent } from "react";
import { Mail } from "lucide-react";
import { formatGuideNumber, normalizeGuideNumber } from "../domain/index.ts";
import { CONTACT_EMAIL } from "../content/site.ts";
import { CONTACT_SUBJECTS, EMPTY_CONTACT, FIELD_ORDER, validateContact } from "../lib/contactForm.ts";
import type { ContactErrors, ContactValues } from "../lib/contactForm.ts";
import { buildMailto } from "../lib/mailto.ts";
import { Button } from "./ui/Button.tsx";
import { Checkbox, Select, TextArea, TextField } from "./ui/fields.tsx";

export interface ContactFormProps {
  /** Abre el cliente de correo. Por defecto navega al enlace `mailto:`; las pruebas lo sustituyen. */
  onOpenMail?: (url: string) => void;
}

function defaultOpenMail(url: string): void {
  window.location.href = url;
}

/**
 * Formulario de contacto. Como el sitio no tiene un servicio de mensajes, al
 * enviar arma un correo (`mailto:`) para que la persona lo revise y lo mande
 * desde su propia aplicación. Nunca dice que el mensaje "se envió".
 */
export function ContactForm({ onOpenMail = defaultOpenMail }: ContactFormProps) {
  const [values, setValues] = useState<ContactValues>(EMPTY_CONTACT);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [mailto, setMailto] = useState<string | null>(null);

  function set<K extends keyof ContactValues>(key: K, value: ContactValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      setMailto(null);
      const first = FIELD_ORDER.find((key) => found[key]);
      const field = first ? event.currentTarget.elements.namedItem(first) : null;
      if (field instanceof HTMLElement) field.focus();
      return;
    }
    const url = buildMailto({
      name: values.name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      subject: values.subject,
      guideNumber: values.guideNumber.trim() ? formatGuideNumber(normalizeGuideNumber(values.guideNumber)) : "",
      message: values.message.trim(),
    });
    setMailto(url);
    onOpenMail(url);
  }

  return (
    <form noValidate onSubmit={submit} aria-label="Formulario de contacto" className="contact-form">
      <div className="contact-form__grid">
        <TextField
          label="Nombre"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => {
            set("name", event.target.value);
          }}
          error={errors.name}
        />
        <TextField
          label="Correo"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(event) => {
            set("email", event.target.value);
          }}
          error={errors.email}
        />
        <TextField
          label="Teléfono de contacto"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => {
            set("phone", event.target.value);
          }}
          error={errors.phone}
        />
        <Select
          label="Asunto"
          name="subject"
          value={values.subject}
          onChange={(event) => {
            set("subject", event.target.value);
          }}
        >
          {CONTACT_SUBJECTS.map((subject) => (
            <option key={subject} value={subject}>
              {subject}
            </option>
          ))}
        </Select>
      </div>
      <TextField
        label="Número de guía"
        name="guideNumber"
        optional
        spellCheck={false}
        autoComplete="off"
        hint="Si tu mensaje es sobre un paquete, escríbelo aquí."
        value={values.guideNumber}
        onChange={(event) => {
          set("guideNumber", event.target.value);
        }}
        error={errors.guideNumber}
      />
      <TextArea
        label="Mensaje"
        name="message"
        rows={6}
        value={values.message}
        onChange={(event) => {
          set("message", event.target.value);
        }}
        error={errors.message}
      />
      <Checkbox
        name="privacy"
        checked={values.privacy}
        onChange={(event) => {
          set("privacy", event.target.checked);
        }}
        label="Acepto que estos datos se incluyan en el correo que enviaré a Hound Express."
        error={errors.privacy}
      />

      <div className="contact-form__how">
        <p className="contact-form__how-text">
          <Mail className="contact-form__how-icon" aria-hidden="true" />
          <span>
            <strong className="contact-form__how-title">Así funciona:</strong> este sitio no envía ni guarda tu mensaje.
            Al continuar se abre tu aplicación de correo con el mensaje ya escrito para <strong>{CONTACT_EMAIL}</strong>,
            y tú decides si lo mandas.
          </span>
        </p>
        <Button type="submit" size="lg" className="contact-form__submit">
          Abrir mi correo con el mensaje
        </Button>
      </div>

      <div role="status" aria-live="polite">
        {mailto ? (
          <p className="contact-form__sent">
            Preparamos el correo y le pedimos a tu aplicación que lo abra. Revísalo y envíalo desde ahí. Si no se abrió,{" "}
            <a href={mailto} className="text-link">
              ábrelo de nuevo
            </a>{" "}
            o escribe directamente a {CONTACT_EMAIL}.
          </p>
        ) : null}
      </div>
    </form>
  );
}
