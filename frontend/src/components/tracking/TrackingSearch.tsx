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
import { bem, cx } from "../../lib/bem.ts";
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
  const controlClass = (kind: "input" | "textarea") => bem("tracking-search__control", kind, { invalid: Boolean(error) });

  return (
    <form
      role="search"
      aria-label="Rastrear guía"
      noValidate
      onSubmit={submit}
      className={cx("tracking-search", className)}
    >
      <div className="tracking-search__field">
        <label htmlFor={fieldId} className="tracking-search__label">
          {multiple ? "Números de guía" : "Número de guía"}
        </label>

        <div className="tracking-search__row">
          <div className="tracking-search__control-wrap">
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
                className={controlClass("textarea")}
              />
            ) : (
              <>
                <Search className="tracking-search__icon" aria-hidden="true" />
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
                  className={controlClass("input")}
                />
              </>
            )}
          </div>
          <Button type="submit" size="lg" className="tracking-search__submit">
            <Search className="button__icon" aria-hidden="true" />
            {multiple ? "Rastrear guías" : "Rastrear"}
          </Button>
        </div>

        <p id={hintId} className="tracking-search__hint">
          {hint}
        </p>
        {error ? (
          <p id={errorId} className="inline-error">
            <CircleAlert className="inline-error__icon" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : null}
      </div>

      <div className="tracking-search__footer">
        <button
          type="button"
          role="switch"
          aria-checked={multiple}
          onClick={toggleMultiple}
          className="tracking-search__switch"
        >
          <span aria-hidden="true" className={bem("tracking-search__switch-track", { on: multiple })}>
            <span className={bem("tracking-search__switch-thumb", { on: multiple })} />
          </span>
          Rastreo múltiple
        </button>

        {examples.length > 0 ? (
          <div className="tracking-search__examples">
            <span>Prueba con una guía de ejemplo:</span>
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => {
                  setValue(multiple ? example : formatGuideNumber(example));
                  setError(null);
                }}
                className="tracking-search__example"
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
