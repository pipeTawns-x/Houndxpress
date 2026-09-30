import { STAGES, summarizeGuides } from "./index.ts";
import type { Guide } from "./index.ts";
import { createSeedGuides } from "../services/demoData.ts";

describe("summarizeGuides", () => {
  it("cuenta el total, las entregadas y las guías de cada etapa en las guías de ejemplo", () => {
    const summary = summarizeGuides(createSeedGuides());
    expect(summary.total).toBe(8);
    expect(summary.delivered).toBe(2);
    expect(summary.byStage.map(({ count }) => count)).toEqual([1, 2, 1, 2, 2]);
  });

  it("devuelve una entrada por etapa, en el orden del proceso, aunque no haya guías", () => {
    const summary = summarizeGuides([]);
    expect(summary.total).toBe(0);
    expect(summary.delivered).toBe(0);
    expect(summary.byStage.map(({ stage }) => stage.code)).toEqual(STAGES.map((stage) => stage.code));
    expect(summary.byStage.every(({ count }) => count === 0)).toBe(true);
  });

  it("la suma de las etapas es el total y no modifica la lista recibida", () => {
    const guides: readonly Guide[] = createSeedGuides();
    const before = JSON.stringify(guides);
    const summary = summarizeGuides(guides);
    expect(summary.byStage.reduce((sum, { count }) => sum + count, 0)).toBe(summary.total);
    expect(JSON.stringify(guides)).toBe(before);
  });
});
