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
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          void copy();
        }}
        className="inline-flex h-10 items-center gap-1.5 rounded-xl px-3 text-label font-semibold text-navy-800 ring-1 ring-edge transition-colors duration-200 hover:bg-aqua-100"
      >
        {state === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {label}
      </button>
      <span role="status" className="text-label font-medium text-aqua-700">
        {state === "copied" ? "Copiado" : ""}
        {state === "failed" ? <span className="text-danger">No se pudo copiar</span> : ""}
      </span>
    </span>
  );
}
