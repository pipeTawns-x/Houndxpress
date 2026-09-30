import { STAGE_CODES, formatGuideNumber, isGuide, isValidGuideNumber, stageIndex } from "../domain/index.ts";
import readme from "../../README.md?raw";
import { DEMO_GUIDE_NUMBERS, DEMO_GUIDE_ROUTES, SEED_REFERENCE_DATE, createSeedGuides } from "./demoData.ts";

describe("guías de ejemplo", () => {
  const seeds = createSeedGuides();

  it("son 8, con números válidos y sin repetir, y coinciden con la lista exportada", () => {
    expect(seeds).toHaveLength(8);
    expect(new Set(seeds.map((guide) => guide.number)).size).toBe(8);
    expect(seeds.map((guide) => guide.number)).toEqual([...DEMO_GUIDE_NUMBERS]);
    for (const guide of seeds) {
      expect(isValidGuideNumber(guide.number)).toBe(true);
      expect(isGuide(guide)).toBe(true);
      expect(DEMO_GUIDE_ROUTES[guide.number]).toBe(`${guide.origin} → ${guide.destination}`);
    }
  });

  it("cubren las cinco etapas", () => {
    expect(new Set(seeds.map((guide) => guide.currentStage))).toEqual(new Set(STAGE_CODES));
  });

  it("tienen un historial coherente: un evento por etapa completada, en orden y con fechas ascendentes", () => {
    for (const guide of seeds) {
      expect(guide.history.map((event) => event.stage)).toEqual(STAGE_CODES.slice(0, stageIndex(guide.currentStage) + 1));
      const times = guide.history.map((event) => Date.parse(event.at));
      expect([...times].sort((a, b) => a - b)).toEqual(times);
      expect(new Set(times).size).toBe(times.length);
      expect(guide.createdAt).toBe(guide.history[0]?.at);
    }
  });

  it("se calculan a partir de una fecha fija, no de la hora actual", () => {
    const reference = Date.parse(SEED_REFERENCE_DATE);
    for (const guide of seeds) {
      for (const event of guide.history) {
        expect(Date.parse(event.at)).toBeLessThanOrEqual(reference);
      }
    }
    expect(createSeedGuides()).toEqual(seeds);
  });

  it("cada llamada devuelve copias nuevas", () => {
    const first = createSeedGuides();
    const second = createSeedGuides();
    expect(first[0]).not.toBe(second[0]);
    expect(first[0]?.history).not.toBe(second[0]?.history);
  });

  it("el README del frontend lista exactamente estos números", () => {
    const listed = [...readme.matchAll(/^\| `([A-Z0-9]{4}(?: [A-Z0-9]{1,4})+)` \|/gm)].map((match) => match[1]);
    expect(listed).toEqual(DEMO_GUIDE_NUMBERS.map(formatGuideNumber));
  });
});
