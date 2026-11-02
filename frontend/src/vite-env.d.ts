/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** "api" usa la API Django (/api/v1/guides/); cualquier otro valor usa datos de demostración. */
  readonly VITE_DATA_SOURCE?: string;
}
