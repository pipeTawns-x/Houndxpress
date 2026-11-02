type Modifier = string | false | null | undefined | Record<string, unknown>;

/**
 * Arma las clases BEM de un bloque o de un elemento con sus modificadores.
 *
 *   bem("button", "primary", { full: fullWidth })  →  "button button--primary button--full"
 *   bem("stage-timeline__step", { current })        →  "stage-timeline__step stage-timeline__step--current"
 *
 * Una cadena siempre agrega su modificador; en un objeto, solo las claves con valor verdadero.
 * Los valores vacíos (`false`, `null`, `undefined`) se omiten para poder escribir `cond && "mod"`.
 */
export function bem(name: string, ...modifiers: Modifier[]): string {
  const classes = [name];
  for (const modifier of modifiers) {
    if (!modifier) continue;
    if (typeof modifier === "string") {
      classes.push(`${name}--${modifier}`);
      continue;
    }
    for (const [key, enabled] of Object.entries(modifier)) {
      if (enabled) classes.push(`${name}--${key}`);
    }
  }
  return classes.join(" ");
}

/** Une clases (un BEM propio y la mezcla `className` que llega por props) y omite las vacías. */
export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
