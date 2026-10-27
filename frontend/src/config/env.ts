/**
 * Único lugar que lee `import.meta.env`. Jest ejecuta el código como CommonJS, donde
 * `import.meta` no existe, así que las pruebas sustituyen este módulo por `src/test/env.ts`
 * (regla en `jest.config.js`).
 */
export interface Env {
  /** "api" usa la API Django (/api/v1/guides/); cualquier otro valor usa datos de demostración. */
  readonly dataSource: string | undefined;
}

export const env: Env = {
  dataSource: import.meta.env.VITE_DATA_SOURCE,
};
