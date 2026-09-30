import { STAGES, canAdvance, getStage, nextStage, stageIndex } from "./index.ts";
import { STAGE_CODES } from "./types.ts";

describe("etapas", () => {
  it("son cinco, en el orden que fija el negocio, cada una con su responsable", () => {
    expect(STAGES.map((stage) => [stage.order, stage.label, stage.department])).toEqual([
      [1, "Recepción de carga", "Aduana"],
      [2, "Vehículo cargado", "Aduana"],
      [3, "Vehículo liberado", "Operaciones"],
      [4, "Vehículo en camino", "Seguridad"],
      [5, "Carga entregada", "KAM"],
    ]);
    expect(STAGES.map((stage) => stage.code)).toEqual([...STAGE_CODES]);
  });

  it("cada etapa tiene nombre corto y una descripción de una oración", () => {
    for (const stage of STAGES) {
      expect(stage.shortLabel.length).toBeGreaterThan(0);
      expect(stage.description.endsWith(".")).toBe(true);
    }
  });

  it("getStage y stageIndex resuelven por código", () => {
    expect(getStage("vehicle_released").label).toBe("Vehículo liberado");
    expect(stageIndex("cargo_received")).toBe(0);
    expect(stageIndex("cargo_delivered")).toBe(4);
  });

  it.each([
    ["cargo_received", "vehicle_loaded"],
    ["vehicle_loaded", "vehicle_released"],
    ["vehicle_released", "vehicle_in_transit"],
    ["vehicle_in_transit", "cargo_delivered"],
    ["cargo_delivered", null],
  ] as const)("nextStage(%s) es %s", (current, expected) => {
    expect(nextStage(current)).toBe(expected);
  });

  it("solo se puede avanzar desde una etapa que tiene siguiente", () => {
    expect(canAdvance({ currentStage: "vehicle_in_transit" })).toBe(true);
    expect(canAdvance({ currentStage: "cargo_delivered" })).toBe(false);
  });
});
