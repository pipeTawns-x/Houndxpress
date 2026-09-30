import { MAX_TRACKED_GUIDES, parseTrackingInput, splitGuideNumbers } from "./index.ts";

const A = "2148213907650312";
const B = "2103958472016654";

describe("splitGuideNumbers", () => {
  it("separa por línea, coma o punto y coma, normaliza y quita repetidos", () => {
    expect(splitGuideNumbers(`2148 2139 0765 0312\n${B}, ${A};  \n`)).toEqual([A, B]);
  });
});

describe("parseTrackingInput", () => {
  it("modo simple: acepta un número válido con espacios", () => {
    expect(parseTrackingInput("2148 2139 0765 0312", false)).toEqual({ numbers: [A] });
  });

  it("modo simple: pide un número si está vacío y avisa del formato si es inválido", () => {
    expect(parseTrackingInput("  ", false).error).toMatch(/Escribe el número/);
    expect(parseTrackingInput("123", false).error).toMatch(/formato correcto/);
  });

  it("modo múltiple: acepta hasta 10 guías válidas", () => {
    const list = Array.from({ length: MAX_TRACKED_GUIDES }, (_, index) => `21${String(index).padStart(14, "0")}`);
    expect(parseTrackingInput(list.join("\n"), true)).toEqual({ numbers: list });
  });

  it("modo múltiple: rechaza más de 10", () => {
    const list = Array.from({ length: MAX_TRACKED_GUIDES + 1 }, (_, index) => `21${String(index).padStart(14, "0")}`);
    expect(parseTrackingInput(list.join("\n"), true).error).toMatch(/hasta 10 guías/);
  });

  it("modo múltiple: nombra las guías con formato incorrecto", () => {
    const result = parseTrackingInput(`${A}\nabc\n999`, true);
    expect(result.error).toContain("ABC");
    expect(result.error).toContain("999");
  });

  it("modo múltiple: pide al menos una guía", () => {
    expect(parseTrackingInput("\n \n", true).error).toMatch(/al menos un número/);
  });
});
