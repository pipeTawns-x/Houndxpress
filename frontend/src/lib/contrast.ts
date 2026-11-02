/** Contraste WCAG 2.2 entre dos colores hexadecimales (#RRGGBB). */

function channel(value: number): number {
  const scaled = value / 255;
  return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (!match) throw new Error(`Color no válido: ${hex}`);
  const [, r = "00", g = "00", b = "00"] = match;
  return (
    0.2126 * channel(parseInt(r, 16)) + 0.7152 * channel(parseInt(g, 16)) + 0.0722 * channel(parseInt(b, 16))
  );
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** "18.4:1" */
export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(1)}:1`;
}

export type ContrastLevel = "AAA" | "AA" | "Insuficiente";

/** Nivel para texto normal (4.5:1 = AA, 7:1 = AAA) o grande (3:1 = AA, 4.5:1 = AAA). */
export function contrastLevel(ratio: number, largeText = false): ContrastLevel {
  const aa = largeText ? 3 : 4.5;
  const aaa = largeText ? 4.5 : 7;
  if (ratio >= aaa) return "AAA";
  if (ratio >= aa) return "AA";
  return "Insuficiente";
}
