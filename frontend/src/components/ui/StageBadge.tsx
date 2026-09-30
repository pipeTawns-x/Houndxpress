import { Check } from "lucide-react";
import { getStage } from "../../domain/index.ts";
import type { StageCode } from "../../domain/index.ts";

/** Píldora con punto de color y el nombre corto de la etapa. "Entregada" va en verde. */
export function StageBadge({ code, className }: { code: StageCode; className?: string }) {
  const stage = getStage(code);
  const delivered = code === "cargo_delivered";
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label font-semibold whitespace-nowrap",
        delivered ? "bg-success-soft text-success" : "bg-aqua-100 text-navy-800",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {delivered ? (
        <Check className="size-3.5" strokeWidth={3} aria-hidden="true" />
      ) : (
        <span className="size-2 rounded-full bg-aqua-700" aria-hidden="true" />
      )}
      {stage.shortLabel}
    </span>
  );
}
