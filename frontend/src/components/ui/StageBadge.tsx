import { Check } from "lucide-react";
import { getStage } from "../../domain/index.ts";
import type { StageCode } from "../../domain/index.ts";
import { bem, cx } from "../../lib/bem.ts";

/** Píldora con punto de color y el nombre corto de la etapa. "Entregada" va en verde. */
export function StageBadge({ code, className }: { code: StageCode; className?: string }) {
  const stage = getStage(code);
  const delivered = code === "cargo_delivered";
  return (
    <span className={cx(bem("stage-badge", { delivered }), className)}>
      {delivered ? (
        <Check className="stage-badge__check" strokeWidth={3} aria-hidden="true" />
      ) : (
        <span className="stage-badge__dot" aria-hidden="true" />
      )}
      {stage.shortLabel}
    </span>
  );
}
