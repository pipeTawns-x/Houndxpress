import { describe, expect, it } from "vitest";
import { formatGuideNumber, generateGuideNumber, isValidGuideNumber, normalizeGuideNumber } from "./index.ts";

describe("número de guía", () => {
  it.each([
    "2148213907650312",
    "2100000000000000",
    "HX7Q4M9K2B8T5W1N6R3D0C",
    "2148213907650312780415",
    "21482139076503A2780415",
    "hx7q4m9k2b8t5w1n6r3d0c",
  ])("acepta %s", (value) => {
    expect(isValidGuideNumber(value)).toBe(true);
  });

  it.each([
    ["vacío", ""],
    ["16 dígitos que no inician con 21", "2248213907650312"],
    ["15 dígitos", "214821390765031"],
    ["17 dígitos", "21482139076503123"],
    ["16 caracteres con letras", "21482139076503AB"],
    ["21 caracteres alfanuméricos", "HX7Q4M9K2B8T5W1N6R3D0"],
    ["23 caracteres alfanuméricos", "HX7Q4M9K2B8T5W1N6R3D0CD"],
    ["22 caracteres con símbolos", "HX7Q4M9K2B8T5W1N6R3D0!"],
    ["texto cualquiera", "hola"],
  ])("rechaza %s", (_name, value) => {
    expect(isValidGuideNumber(value)).toBe(false);
  });

  it("ignora los espacios y guiones que la persona escribe", () => {
    expect(isValidGuideNumber("2148 2139 0765 0312")).toBe(true);
    expect(isValidGuideNumber("2148-2139-0765-0312")).toBe(true);
    expect(isValidGuideNumber("  2148 – 2139 — 0765 0312 ")).toBe(true);
    expect(normalizeGuideNumber(" 2148-2139 0765\t0312 ")).toBe("2148213907650312");
  });

  it("normaliza a mayúsculas", () => {
    expect(normalizeGuideNumber("hx7q-4m9k 2b8t5w1n6r3d0c")).toBe("HX7Q4M9K2B8T5W1N6R3D0C");
  });

  it("la formatea en grupos de 4", () => {
    expect(formatGuideNumber("2148213907650312")).toBe("2148 2139 0765 0312");
    expect(formatGuideNumber("HX7Q4M9K2B8T5W1N6R3D0C")).toBe("HX7Q 4M9K 2B8T 5W1N 6R3D 0C");
    expect(formatGuideNumber("2148 2139 0765 0312")).toBe("2148 2139 0765 0312");
    expect(formatGuideNumber("")).toBe("");
  });

  it("genera números válidos de 16 dígitos que inician con 21", () => {
    for (let index = 0; index < 50; index += 1) {
      const number = generateGuideNumber();
      expect(number).toMatch(/^21\d{14}$/);
      expect(isValidGuideNumber(number)).toBe(true);
    }
  });

  it("acepta un generador de números aleatorios para ser determinista", () => {
    expect(generateGuideNumber(() => 0)).toBe("2100000000000000");
    expect(generateGuideNumber(() => 0.999999)).toBe("2199999999999999");
  });
});
