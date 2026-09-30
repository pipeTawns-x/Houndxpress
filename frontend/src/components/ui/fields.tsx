import { useId } from "react";
import type { ComponentProps, ReactNode } from "react";
import { ChevronDown, CircleAlert } from "lucide-react";

interface FieldChrome {
  label: string;
  hint?: ReactNode;
  error?: string | undefined;
  /** Añade "(opcional)" a la etiqueta. Un campo opcional no se anuncia como obligatorio. */
  optional?: boolean;
  /** Anuncia el campo como obligatorio (`aria-required`). Por defecto lo es, salvo que sea opcional. */
  required?: boolean;
}

const controlClasses =
  "block w-full rounded-xl border bg-white px-4 text-base text-ink placeholder:text-muted " +
  "transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted";

function borderClasses(hasError: boolean): string {
  return hasError ? "border-danger" : "border-edge hover:border-navy-800";
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
    <div className="flex flex-col gap-1.5">
      <label htmlFor={ids.controlId} className="text-label font-semibold text-navy-800">
        {chrome.label}
        {chrome.optional ? <span className="ml-1 font-normal text-muted">(opcional)</span> : null}
      </label>
      {children}
      {chrome.hint ? (
        <p id={ids.hintId} className="text-label text-muted">
          {chrome.hint}
        </p>
      ) : null}
      {chrome.error ? (
        <p id={ids.errorId} className="flex items-start gap-1.5 text-label font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
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
        className={[controlClasses, "h-12", borderClasses(Boolean(error)), className].filter(Boolean).join(" ")}
      />
  );
  return (
    <FieldFrame ids={ids} chrome={chrome}>
      {action ? (
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">{input}</div>
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
        className={[controlClasses, "min-h-28 py-3", borderClasses(Boolean(error)), className]
          .filter(Boolean)
          .join(" ")}
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
      <div className="relative">
        <select
          id={ids.controlId}
          aria-invalid={error ? true : undefined}
          aria-required={(required ?? !optional) ? true : undefined}
          aria-describedby={describedBy(ids, chrome, extraDescribedBy)}
          {...props}
          className={[controlClasses, "h-12 appearance-none pr-11", borderClasses(Boolean(error)), className]
            .filter(Boolean)
            .join(" ")}
        >
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-navy-800"
          aria-hidden="true"
        />
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
    <div className="flex flex-col gap-1.5">
      <div className="flex items-start gap-3">
        <input
          id={ids.controlId}
          type="checkbox"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? ids.errorId : undefined}
          {...props}
          className={["mt-0.5 size-5 shrink-0 accent-aqua-700", className].filter(Boolean).join(" ")}
        />
        <label htmlFor={ids.controlId} className="text-base text-ink">
          {label}
        </label>
      </div>
      {error ? (
        <p id={ids.errorId} className="flex items-start gap-1.5 text-label font-medium text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </p>
      ) : null}
    </div>
  );
}
