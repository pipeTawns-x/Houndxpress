import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type CopyState = "idle" | "copied" | "failed";

/** Copia un texto al portapapeles y avisa el resultado con texto (no solo con el icono). */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [state, setState] = useState<CopyState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(
    () => () => {
      clearTimeout(timer.current);
    },
    [],
  );

  async function copy() {
    let next: CopyState = "failed";
    try {
      await navigator.clipboard.writeText(value);
      next = "copied";
    } catch {
      // Sin permiso o sin API de portapapeles: se avisa que no se pudo.
    }
    setState(next);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setState("idle");
    }, 2500);
  }

  return (
    <span className="copy-button">
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        className="copy-button__button"
      >
        {state === "copied" ? (
          <Check className="copy-button__icon" aria-hidden="true" />
        ) : (
          <Copy className="copy-button__icon" aria-hidden="true" />
        )}
        {label}
      </button>
      <span role="status" className="copy-button__status">
        {state === "copied" ? "Copiado" : ""}
        {state === "failed" ? <span className="copy-button__error">No se pudo copiar</span> : ""}
      </span>
    </span>
  );
}
