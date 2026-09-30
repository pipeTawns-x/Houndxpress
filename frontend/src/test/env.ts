import type { Env } from "../config/env.ts";

/** Doble de `src/config/env.ts` para Jest: sin variables de entorno, la aplicación usa datos de demostración. */
export const env: Env = {
  dataSource: undefined,
};
