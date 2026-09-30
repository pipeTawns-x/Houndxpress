import { useId, useRef, useState } from "react";
import type { FormEvent } from "react";
import { CircleAlert, Search } from "lucide-react";
import {
  GUIDE_NUMBER_HINT,
  MAX_TRACKED_GUIDES,
  formatGuideNumber,
  parseTrackingInput,
  splitGuideNumbers,
} from "../../domain/index.ts";
import { Button } from "../ui/Button.tsx";

export interface TrackingSearchProps {
  /** Se llama solo con números que pasaron la validación de formato. */
  onSearch: (numbers: string[]) => void;
  /** Texto con el que arranca el campo (uno o varios números). */
  initialValue?: string;
  /** Números de ejemplo que la persona puede poner en el campo con un clic. */
  examples?: readonly string[];
  className?: string;
}

interface FieldState {
  multiple: boolean;
  value: string;
}

/** Con varias guías el campo arranca en modo múltiple, una por línea. */
function fieldFrom(text: string): FieldState {
  const numbers = splitGuideNumbers(text);
  return numbers.length > 1 ? { multiple: true, value: numbers.map(formatGuideNumber).join("\n") } : { multiple: false, value: text };
}

/**
 * Buscador de guía: un campo grande con icono o, con el interruptor
 * "Rastreo múltiple", un área de texto de hasta 10 guías (una por línea).
 * Valida el formato antes de buscar.
 */
export function TrackingSearch({ onSearch, initialValue = "", examples = [], className }: TrackingSearchProps) {
  const uid = useId();
  const fieldId = `${uid}-guia`;
  const hintId = `${uid}-hint`;
  const errorId = `${uid}-error`;

  const [field, setField] = useState(() => fieldFrom(initialValue));
  const [error, setError] = useState<string | null>(null);
  const [lastInitial, setLastInitial] = useState(initialValue);
  const { multiple, value } = field;
  const setValue = (next: string) => {
    setField((current) => ({ ...current, value: next }));
  };

  // Si la dirección cambia desde fuera (botón "atrás", otro enlace), el campo la refleja sin perder el foco.
  if (initialValue !== lastInitial) {
    setLastInitial(initialValue);
    setField(fieldFrom(initialValue));
    setError(null);
  }
  const fieldRef = useRef<HTMLInputElement & HTMLTextAreaElement>(null);

  function toggleMultiple() {
    const next = !multiple;
    setError(null);
    // Al volver al modo simple se conserva solo la primera guía.
    setField({ multiple: next, value: next ? value : (splitGuideNumbers(value)[0] ?? "") });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = parseTrackingInput(value, multiple);
    if (result.error) {
      setError(result.error);
      fieldRef.current?.focus();
      return;
    }
    setError(null);
    onSearch(result.numbers);
  }

  const hint = multiple
    ? `Una guía por línea o separadas por coma. Máximo ${String(MAX_TRACKED_GUIDES)}.`
    : GUIDE_NUMBER_HINT;
  const describedBy = [hintId, error ? errorId : ""].filter(Boolean).join(" ");
  const controlClasses =
    "block w-full rounded-xl border bg-white text-ink placeholder:text-muted transition-colors duration-150 " +
    (error ? "border-danger" : "border-edge hover:border-navy-800");

  return (
    <form
      role="search"
      aria-label="Rastrear guía"
      noValidate
      onSubmit={submit}
      className={["flex flex-col gap-4", className].filter(Boolean).join(" ")}
    >
      <div className="flex flex-col gap-2">
        <label htmlFor={fieldId} className="text-label font-semibold text-navy-800">
          {multiple ? "Números de guía" : "Número de guía"}
        </label>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="relative flex-1">
            {multiple ? (
              <textarea
                ref={fieldRef}
                id={fieldId}
                rows={5}
                value={value}
                onChange={(event) => {
                  setValue(event.target.value);
                }}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                spellCheck={false}
                autoComplete="off"
                placeholder={"2148 2139 0765 0312\n2103 9584 7201 6654"}
                className={`${controlClasses} min-h-32 px-4 py-3 text-base tabular-nums`}
              />
            ) : (
              <>
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-muted"
                  aria-hidden="true"
                />
                <input
                  ref={fieldRef}
                  id={fieldId}
                  type="text"
                  inputMode="text"
                  enterKeyHint="search"
                  value={value}
                  onChange={(event) => {
                    setValue(event.target.value);
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy}
                  spellCheck={false}
                  autoComplete="off"
                  autoCapitalize="characters"
                  placeholder="Ej. 2148 2139 0765 0312"
                  className={`${controlClasses} h-14 pr-4 pl-12 text-lg tabular-nums`}
                />
              </>
            )}
          </div>
          <Button type="submit" size="lg" className="sm:h-14 sm:px-8">
            <Search className="size-5" aria-hidden="true" />
            {multiple ? "Rastrear guías" : "Rastrear"}
          </Button>
        </div>

        <p id={hintId} className="text-label text-muted">
          {hint}
        </p>
        {error ? (
          <p id={errorId} className="flex items-start gap-1.5 text-label font-medium text-danger">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
        <button
          type="button"
          role="switch"
          aria-checked={multiple}
          onClick={toggleMultiple}
          className="group inline-flex items-center gap-3 rounded-lg text-label font-semibold text-navy-800"
        >
          <span
            aria-hidden="true"
            className={[
              "relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200",
              multiple ? "bg-aqua-700" : "bg-edge",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow-soft transition-transform duration-200",
                multiple ? "translate-x-5" : "",
              ].join(" ")}
            />
          </span>
          Rastreo múltiple
        </button>

        {examples.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 text-label text-muted">
            <span>Prueba con una guía de ejemplo:</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setValue(multiple ? example : formatGuideNumber(example));
                  setError(null);
                }}
                className="rounded-lg bg-aqua-100 px-2.5 py-1 font-semibold text-navy-800 tabular-nums transition-colors duration-200 hover:bg-aqua-500"
              >
                {formatGuideNumber(example)}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </form>
  );
}
