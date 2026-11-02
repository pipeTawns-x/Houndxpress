import type { Env } from "../config/env.ts";

/** Doble de `src/config/env.ts` para Jest: las pruebas inyectan sus repositorios explícitamente. */
export const IS_DEVELOPMENT = true;
export const env: Env = {
  isDevelopment: true,
  dataSource: undefined,
};
