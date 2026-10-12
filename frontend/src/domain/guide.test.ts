import {
  DomainError,
  STAGE_CODES,
  advanceGuide,
  createGuide,
  estimatedDeliveryWindow,
  isGuide,
  lastUpdate,
  validateNewGuideInput,
} from "./index.ts";
import type { Guide, NewGuideInput, StageCode } from "./index.ts";

const INPUT: NewGuideInput = {
  number: "2148 2139 0765 0312",
  origin: " Miami, FL ",
  destination: "Bogotá, Colombia",
  recipient: "Laura Gómez",
  service: "priority",
};

const T0 = "2026-09-28T15:00:00.000Z";

function guideAt(stage: StageCode): Guide {
  let guide = createGuide(INPUT, T0);
  for (let step = 1; guide.currentStage !== stage; step += 1) {
    guide = advanceGuide(guide, { location: "Miami, FL", at: new Date(Date.parse(T0) + step * 3_600_000).toISOString() });
  }
  return guide;
}

describe("crear una guía", () => {
  it("nace en Recepción de carga con un solo evento", () => {
    const guide = createGuide(INPUT, T0);
    expect(guide.currentStage).toBe("cargo_received");
    expect(guide.history).toEqual([{ stage: "cargo_received", at: T0, location: "Miami, FL" }]);
    expect(guide.number).toBe("2148213907650312");
    expect(guide.origin).toBe("Miami, FL");
    expect(guide.createdAt).toBe(T0);
    expect(isGuide(guide)).toBe(true);
  });

  it("rechaza un número inválido con DomainError", () => {
    expect(() => createGuide({ ...INPUT, number: "123" }, T0)).toThrow(DomainError);
    try {
      createGuide({ ...INPUT, number: "123" }, T0);
    } catch (error) {
      expect(error).toBeInstanceOf(DomainError);
      expect((error as DomainError).code).toBe("invalid_guide_number");
      expect((error as DomainError).fieldErrors.number).toMatch(/número válido/);
    }
  });

  it("valida campos obligatorios y longitudes", () => {
    const errors = validateNewGuideInput({ ...INPUT, origin: " ", destination: "", recipient: "x".repeat(81) });
    expect(errors.origin).toBeDefined();
    expect(errors.destination).toBeDefined();
    expect(errors.recipient).toMatch(/80/);
    expect(errors.number).toBeUndefined();
    expect(validateNewGuideInput(INPUT)).toEqual({});
  });
});

describe("avanzar una guía", () => {
  it("solo pasa a la etapa siguiente, una por vez", () => {
    let guide = createGuide(INPUT, T0);
    const visited: StageCode[] = [guide.currentStage];
    for (let step = 1; step < STAGE_CODES.length; step += 1) {
      guide = advanceGuide(guide, { location: "Laredo, TX", at: new Date(Date.parse(T0) + step * 60_000).toISOString() });
      visited.push(guide.currentStage);
    }
    expect(visited).toEqual([...STAGE_CODES]);
  });

  it("no avanza una guía entregada y lo dice con un error tipado", () => {
    const delivered = guideAt("cargo_delivered");
    expect(() => advanceGuide(delivered, { location: "Laredo, TX", at: "2026-10-30T00:00:00.000Z" })).toThrow(DomainError);
    try {
      advanceGuide(delivered, { location: "Laredo, TX", at: "2026-10-30T00:00:00.000Z" });
    } catch (error) {
      expect((error as DomainError).code).toBe("already_delivered");
    }
  });

  it("el historial solo crece y no modifica la guía original", () => {
    const before = guideAt("vehicle_loaded");
    const snapshot = JSON.stringify(before);
    const after = advanceGuide(before, { location: "Nuevo Laredo, Tamps.", at: "2026-09-29T15:00:00.000Z", note: " sello 2 " });

    expect(JSON.stringify(before)).toBe(snapshot);
    expect(after.history).toHaveLength(before.history.length + 1);
    expect(after.history.slice(0, -1)).toEqual(before.history);
    expect(after.history.at(-1)).toEqual({
      stage: "vehicle_released",
      at: "2026-09-29T15:00:00.000Z",
      location: "Nuevo Laredo, Tamps.",
      note: "sello 2",
    });
  });

  it("deja un evento por etapa completada, con fechas ascendentes", () => {
    const guide = guideAt("cargo_delivered");
    expect(guide.history.map((event) => event.stage)).toEqual([...STAGE_CODES]);
    const times = guide.history.map((event) => Date.parse(event.at));
    expect([...times].sort((a, b) => a - b)).toEqual(times);
    expect(lastUpdate(guide)).toBe(guide.history.at(-1)?.at);
  });

  it("rechaza una fecha anterior al evento previo, una fecha inválida y una ubicación vacía", () => {
    const guide = createGuide(INPUT, T0);
    expect(() => advanceGuide(guide, { location: "Miami, FL", at: "2026-09-27T00:00:00.000Z" })).toThrow(/anterior/);
    expect(() => advanceGuide(guide, { location: "Miami, FL", at: "ayer" })).toThrow(DomainError);
    expect(() => advanceGuide(guide, { location: "  ", at: "2026-09-29T00:00:00.000Z" })).toThrow(/ubicación/);
  });

  it("omite la nota cuando está vacía", () => {
    const guide = advanceGuide(createGuide(INPUT, T0), { location: "Miami, FL", note: "  ", at: "2026-09-29T00:00:00.000Z" });
    expect(guide.history.at(-1)).not.toHaveProperty("note");
  });
});

describe("entrega estimada", () => {
  it("usa 6 a 9 días para estándar y 3 a 5 para priority, desde el registro", () => {
    expect(estimatedDeliveryWindow({ createdAt: T0, service: "standard" })).toEqual({
      from: "2026-10-04T15:00:00.000Z",
      to: "2026-10-07T15:00:00.000Z",
    });
    expect(estimatedDeliveryWindow({ createdAt: T0, service: "priority" })).toEqual({
      from: "2026-10-01T15:00:00.000Z",
      to: "2026-10-03T15:00:00.000Z",
    });
  });
});

describe("isGuide", () => {
  it("rechaza datos con forma incorrecta", () => {
    const good = createGuide(INPUT, T0);
    expect(isGuide(null)).toBe(false);
    expect(isGuide({})).toBe(false);
    expect(isGuide({ ...good, service: "express" })).toBe(false);
    expect(isGuide({ ...good, history: [] })).toBe(false);
    expect(isGuide({ ...good, currentStage: "vehicle_loaded" })).toBe(false);
    expect(isGuide({ ...good, history: [{ stage: "otra", at: T0, location: "x" }] })).toBe(false);
  });

  it("rechaza fechas que no se pueden interpretar", () => {
    const good = createGuide(INPUT, T0);
    expect(isGuide({ ...good, createdAt: "ayer" })).toBe(false);
    expect(isGuide({ ...good, history: [{ stage: "cargo_received", at: "", location: "x" }] })).toBe(false);
  });
});
