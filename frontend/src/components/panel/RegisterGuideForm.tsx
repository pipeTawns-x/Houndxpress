import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Dices } from "lucide-react";
import { PLACE_SUGGESTIONS } from "../../content/coverage.ts";
import {
  GUIDE_NUMBER_HINT,
  SERVICE_WINDOWS,
  formatGuideNumber,
  generateGuideNumber,
  getStage,
  isDomainError,
  normalizeGuideNumber,
  validateNewGuideInput,
} from "../../domain/index.ts";
import type { FieldErrors, Guide, NewGuideInput, ServiceLevel } from "../../domain/index.ts";
import { isRepositoryError } from "../../services/guideRepository.ts";
import { Button } from "../ui/Button.tsx";
import { Select, TextField } from "../ui/fields.tsx";

interface Draft {
  trackingNumber: string;
  origin: string;
  destination: string;
  recipient: string;
  serviceLevel: ServiceLevel;
}

const EMPTY: Draft = { trackingNumber: "", origin: "", destination: "", recipient: "", serviceLevel: "standard" };
const FIELD_ORDER: (keyof Draft)[] = ["trackingNumber", "origin", "destination", "recipient", "serviceLevel"];

export interface RegisterGuideFormProps {
  /** Para que "Generar" no proponga un número que ya existe. */
  existingNumbers: readonly string[];
  onCreate: (input: NewGuideInput) => Promise<Guide>;
}

/**
 * Formulario para registrar una guía. Toda guía nueva nace en "Recepción de
 * carga": el formulario no permite elegir otra etapa.
 */
export function RegisterGuideForm({ existingNumbers, onCreate }: RegisterGuideFormProps) {
  const listId = useId();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors<NewGuideInput>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState<Guide | null>(null);
  const [saving, setSaving] = useState(false);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function generate() {
    const taken = new Set(existingNumbers);
    let number = generateGuideNumber();
    for (let attempt = 0; taken.has(number) && attempt < 20; attempt += 1) {
      number = generateGuideNumber();
    }
    update("trackingNumber", formatGuideNumber(number));
    setErrors((current) => ({ ...current, trackingNumber: undefined }));
  }

  function focusFirstError(form: HTMLFormElement, found: FieldErrors<NewGuideInput>) {
    const first = FIELD_ORDER.find((key) => found[key]);
    const field = first ? form.elements.namedItem(first) : null;
    if (field instanceof HTMLElement) field.focus();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setCreated(null);
    setFormError(null);
    const input: NewGuideInput = { ...draft, trackingNumber: normalizeGuideNumber(draft.trackingNumber) };
    // Se valida aquí también: el repositorio HTTP envía lo que recibe, así que los campos
    // se marcan antes de la petición y no solo cuando los rechaza el repositorio de demostración.
    const invalid = validateNewGuideInput(input);
    if (Object.keys(invalid).length > 0) {
      setErrors(invalid);
      focusFirstError(form, invalid);
      return;
    }
    setSaving(true);
    try {
      const guide = await onCreate(input);
      setCreated(guide);
      setErrors({});
      setDraft({ ...EMPTY, serviceLevel: draft.serviceLevel });
    } catch (error) {
      if (isDomainError(error) && Object.keys(error.fieldErrors).length > 0) {
        setErrors(error.fieldErrors);
        focusFirstError(form, error.fieldErrors);
      } else if (isRepositoryError(error) && error.code === "duplicate") {
        const found = { trackingNumber: "Ya existe una guía con ese número. Escribe otro o usa “Generar”." };
        setErrors(found);
        focusFirstError(form, found);
      } else {
        setFormError(error instanceof Error ? error.message : "No se pudo registrar la guía.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      noValidate
      aria-label="Registrar guía"
      onSubmit={(event) => {
        void submit(event);
      }}
      className="register-form"
    >
      <div className="register-form__grid">
        <div className="register-form__wide">
          <TextField
            label="Número de guía"
            name="trackingNumber"
            hint={GUIDE_NUMBER_HINT}
            spellCheck={false}
            autoComplete="off"
            value={draft.trackingNumber}
            onChange={(event) => {
              update("trackingNumber", event.target.value);
            }}
            error={errors.trackingNumber}
            className="register-form__number"
            action={
              <Button variant="secondary" size="lg" onClick={generate}>
                <Dices className="button__icon" aria-hidden="true" />
                Generar
              </Button>
            }
          />
        </div>
        <TextField
          label="Origen"
          name="origin"
          list={listId}
          autoComplete="off"
          value={draft.origin}
          onChange={(event) => {
            update("origin", event.target.value);
          }}
          error={errors.origin}
        />
        <TextField
          label="Destino"
          name="destination"
          list={listId}
          autoComplete="off"
          value={draft.destination}
          onChange={(event) => {
            update("destination", event.target.value);
          }}
          error={errors.destination}
        />
        <TextField
          label="Destinatario"
          name="recipient"
          autoComplete="off"
          value={draft.recipient}
          onChange={(event) => {
            update("recipient", event.target.value);
          }}
          error={errors.recipient}
        />
        <Select
          label="Servicio"
          name="serviceLevel"
          value={draft.serviceLevel}
          onChange={(event) => {
            update("serviceLevel", event.target.value as ServiceLevel);
          }}
          error={errors.serviceLevel}
        >
          {(Object.keys(SERVICE_WINDOWS) as ServiceLevel[]).map((level) => (
            <option key={level} value={level}>
              {SERVICE_WINDOWS[level].label} ({SERVICE_WINDOWS[level].minDays} a {SERVICE_WINDOWS[level].maxDays} días)
            </option>
          ))}
        </Select>
      </div>
      <datalist id={listId}>
        {PLACE_SUGGESTIONS.map((place) => (
          <option key={place} value={place} />
        ))}
      </datalist>

      <div className="register-form__footer">
        <Button type="submit" size="lg" loading={saving}>
          Registrar guía
        </Button>
        <p className="register-form__footnote">
          Toda guía nueva nace en “{getStage("cargo_received").label}”.
        </p>
      </div>

      <div role="status" aria-live="polite">
        {created ? (
          <p className="notice notice--success">
            <strong className="register-form__success-title">Guía registrada.</strong> La guía{" "}
            <span className="register-form__success-number">{formatGuideNumber(created.trackingNumber)}</span> quedó en “
            {getStage(created.currentStatus).label}” y ya aparece en la lista.
          </p>
        ) : null}
      </div>
      {formError ? (
        <p role="alert" className="notice notice--danger">
          {formError}
        </p>
      ) : null}
    </form>
  );
}
