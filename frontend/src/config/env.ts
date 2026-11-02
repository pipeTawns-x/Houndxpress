/**
 * Único lugar que lee `import.meta.env`. Jest ejecuta el código como CommonJS, donde
 * `import.meta` no existe, así que las pruebas sustituyen este módulo por `src/test/env.ts`
 * (regla en `jest.config.js`).
 */
export interface Env {
  /** Solo habilita herramientas locales; no concede permisos de personal. */
  readonly isDevelopment: boolean;
  readonly dataSource: string | undefined;
}

export const IS_DEVELOPMENT = import.meta.env.DEV;

export const env: Env = {
  isDevelopment: IS_DEVELOPMENT,
  dataSource: import.meta.env.VITE_DATA_SOURCE,
};
