import { describe, expect, it } from "vitest";
import { COLOR_TOKENS, CONTRAST_PAIRS, tokenHex } from "../content/designTokens.ts";
import indexCss from "../index.css?raw";
import { contrastLevel, contrastRatio, formatRatio } from "./contrast.ts";

/** Contrastes que publica docs/diseno/04-sistema-de-diseno.md. */
const DOCUMENTED: [string, string, string][] = [
  ["white", "navy-950", "18.4:1"],
  ["white", "navy-800", "15.6:1"],
  ["navy-300", "navy-800", "8.4:1"],
  ["navy-950", "aqua-500", "8.5:1"],
  ["navy-800", "aqua-100", "14.2:1"],
  ["aqua-700", "white", "5.7:1"],
  ["sky-600", "white", "5.1:1"],
  ["muted", "white", "7.6:1"],
  ["success", "white", "5.0:1"],
  ["warning", "white", "5.0:1"],
  ["danger", "white", "6.5:1"],
  ["aqua-500", "white", "2.2:1"],
];

describe("contraste WCAG", () => {
  it("calcula los mismos valores que documenta el sistema de diseño", () => {
    for (const [foreground, background, expected] of DOCUMENTED) {
      expect(formatRatio(contrastRatio(tokenHex(foreground), tokenHex(background)))).toBe(expected);
    }
  });

  it("negro sobre blanco es 21:1 y el contraste es simétrico", () => {
    expect(contrastRatio("#000000", "#FFFFFF")).toBeCloseTo(21, 5);
    expect(contrastRatio("#4CBED8", "#FFFFFF")).toBeCloseTo(contrastRatio("#FFFFFF", "#4CBED8"), 10);
  });

  it("clasifica AA y AAA para texto normal y grande", () => {
    expect(contrastLevel(7.1)).toBe("AAA");
    expect(contrastLevel(4.5)).toBe("AA");
    expect(contrastLevel(4.49)).toBe("Insuficiente");
    expect(contrastLevel(3.2, true)).toBe("AA");
    expect(contrastLevel(4.6, true)).toBe("AAA");
  });

  it("rechaza colores que no son #RRGGBB", () => {
    expect(() => contrastRatio("azul", "#FFFFFF")).toThrow();
  });

  it("el aqua de marca nunca aprueba como texto sobre blanco, y las combinaciones a usar sí aprueban AA", () => {
    for (const pair of CONTRAST_PAIRS) {
      const level = contrastLevel(contrastRatio(tokenHex(pair.foreground), tokenHex(pair.background)));
      expect(level !== "Insuficiente", pair.label).toBe(pair.verdict === "usar");
    }
  });
});

describe("tokens de color", () => {
  it("coinciden con el bloque @theme de index.css", () => {
    for (const token of COLOR_TOKENS) {
      const match = new RegExp(`--color-${token.name}:\\s*(#[0-9a-fA-F]{6})`).exec(indexCss);
      expect(match, `--color-${token.name} en index.css`).not.toBeNull();
      expect(match?.[1]?.toUpperCase()).toBe(token.hex.toUpperCase());
    }
  });

  it("index.css no define colores que la guía de estilo no muestre", () => {
    const inCss = [...indexCss.matchAll(/--color-([a-z0-9-]+):\s*#[0-9a-fA-F]{6}/g)].map((match) => match[1]);
    const documented = COLOR_TOKENS.map((token) => token.name);
    // "white" es el único que no aparece como muestra.
    expect(inCss.filter((name) => name !== "white" && !documented.includes(name ?? ""))).toEqual([]);
  });
});
