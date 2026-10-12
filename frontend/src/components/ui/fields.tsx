import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";
import { bem, cx } from "../../lib/bem.ts";

interface FieldChrome {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  /** Añade "(opcional)" a la etiqueta. Un campo opcional no se anuncia como obligatorio. */
  optional?: boolean;
  /** Anuncia el campo como obligatorio (`aria-required`). Por defecto lo es, salvo que sea opcional. */
  required?: boolean;
}

/** Clases del control (input, textarea o select): `field__control field__control--input field__control--invalid`. */
function controlClasses(kind: "input" | "textarea" | "select", hasError: boolean, className?: string): string {
  return cx(bem("field__control", kind, { invalid: hasError }), className);
}

interface ChromeIds {
  controlId: string;
  hintId: string;
  errorId: string;
}

function describedBy(ids: ChromeIds, chrome: FieldChrome, extra?: string): string | undefined {
  const parts = [chrome.hint ? ids.hintId : "", chrome.error ? ids.errorId : "", extra ?? ""].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : undefined;
}

/** Etiqueta, ayuda y error alrededor de un control. Comparte la estructura de todos los campos. */
function FieldFrame({
  ids,
  chrome,
  children,
}: {
  ids: ChromeIds;
  chrome: FieldChrome;
  children: ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={ids.controlId} className="field__label">
        {chrome.label}
        {chrome.optional ? <span className="field__optional">(opcional)</span> : null}
      </label>
      {children}
      {chrome.hint ? (
        <p id={ids.hintId} className="field__hint">
          {chrome.hint}
        </p>
      ) : null}
      {chrome.error ? (
        <p id={ids.errorId} className="inline-error">
          <CircleAlert className="inline-error__icon" aria-hidden="true" />
          <span>{chrome.error}</span>
        </p>
      ) : null}
    </div>
  );
}

function useChromeIds(id: string | undefined): ChromeIds {
  const generated = useId();
  const controlId = id ?? generated;
  return { controlId, hintId: `${controlId}-hint`, errorId: `${controlId}-error` };
}

export type TextFieldProps = FieldChrome &
  Omit<ComponentProps<"input">, "id"> & {
    id?: string;
    /** Elemento a la derecha del campo, por ejemplo un botón "Generar". */
    action?: ReactNode;
  };

export function TextField({
  label,
  hint,
  error,
  optional,
  required,
  id,
  className,
  action,
  "aria-describedby": extraDescribedBy,
  ...props
}: TextFieldProps) {
  const chrome = { label, hint, error, optional };
  const ids = useChromeIds(id);
  const input = (
    <input
      id={ids.controlId}
      aria-invalid={error ? true : undefined}
      aria-required={(required ?? !optional) ? true : undefined}
      aria-describedby={describedBy(ids, chrome, extraDescribedBy)}
      {...props}
      className={controlClasses("input", Boolean(error), className)}
    />
  );
  return (
    <FieldFrame ids={ids} chrome={chrome}>
      {action ? (
        <div className="field__row">
          <div className="field__row-main">{input}</div>
          {action}
        </div>
      ) : (
        input
      )}
    </FieldFrame>
  );
}

export type TextAreaProps = FieldChrome & Omit<ComponentProps<"textarea">, "id"> & { id?: string };

export function TextArea({
  label,
  hint,
  error,
  optional,
  required,
  id,
  className,
  "aria-describedby": extraDescribedBy,
  ...props
}: TextAreaProps) {
  const chrome = { label, hint, error, optional };
  const ids = useChromeIds(id);
  return (
    <FieldFrame ids={ids} chrome={chrome}>
      <textarea
        id={ids.controlId}
        aria-invalid={error ? true : undefined}
        aria-required={(required ?? !optional) ? true : undefined}
        aria-describedby={describedBy(ids, chrome, extraDescribedBy)}
        {...props}
        className={controlClasses("textarea", Boolean(error), className)}
      />
    </FieldFrame>
  );
}

export type SelectProps = FieldChrome & Omit<ComponentProps<"select">, "id"> & { id?: string };

export function Select({
  label,
  hint,
  error,
  optional,
  required,
  id,
  className,
  children,
  "aria-describedby": extraDescribedBy,
  ...props
}: SelectProps) {
  const chrome = { label, hint, error, optional };
  const ids = useChromeIds(id);
  return (
    <FieldFrame ids={ids} chrome={chrome}>
      <div className="field__select">
        <select
          id={ids.controlId}
          aria-invalid={error ? true : undefined}
          aria-required={(required ?? !optional) ? true : undefined}
          aria-describedby={describedBy(ids, chrome, extraDescribedBy)}
          {...props}
          className={controlClasses("select", Boolean(error), className)}
        >
          {children}
        </select>
        <ChevronDown className="field__select-icon" aria-hidden="true" />
      </div>
    </FieldFrame>
  );
}

export type CheckboxProps = Omit<ComponentProps<"input">, "id" | "type"> & {
  id?: string;
  label: ReactNode;
  error?: string | undefined;
};

export function Checkbox({ label, error, id, className, ...props }: CheckboxProps) {
  const ids = useChromeIds(id);
  return (
    <div className="checkbox">
      <div className="checkbox__row">
        <input
          id={ids.controlId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.errorId : undefined}
          {...props}
          className={cx("checkbox__input", className)}
        />
        <label htmlFor={ids.controlId} className="checkbox__label">
          {label}
        </label>
      </div>
      {error ? (
        <p id={ids.errorId} className="inline-error">
          <CircleAlert className="inline-error__icon" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
