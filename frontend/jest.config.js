// Jest corre en CommonJS aunque el proyecto sea ESM ("type": "module"): @swc/jest compila
// cada archivo a CommonJS en memoria, y Vite sigue usando ESM al compilar la aplicación.
/** @type {import("jest").Config} */
export default {
  rootDir: ".",
  roots: ["<rootDir>/src"],
  testMatch: ["<rootDir>/src/**/*.test.{ts,tsx}"],
  // jsdom más las clases de la API Fetch (Response, Headers, Request) que jsdom no trae.
  testEnvironment: "<rootDir>/jest/environment.js",
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  restoreMocks: true,
  transform: {
    "^.+\\.[jt]sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } },
        },
      },
    ],
    // Solo se usa con las importaciones `?raw` (ver moduleNameMapper): exporta el texto del archivo.
    "\\.(css|scss|md)$": "<rootDir>/jest/rawTransform.js",
  },
  // El orden importa: gana la primera regla que coincide.
  moduleNameMapper: {
    // `import texto from "./archivo.css?raw"` (Vite) lee el archivo real, sin la parte `?raw`.
    "^(.+)\\?raw$": "$1",
    // Fuentes autoalojadas: solo son CSS y tipografías, sin lógica que probar.
    "^@fontsource(-variable)?/.+$": "<rootDir>/jest/fileStub.cjs",
    // Estilos e imágenes importados desde el código no se procesan en las pruebas.
    "\\.(css|scss|sass|less)$": "<rootDir>/jest/fileStub.cjs",
    "\\.(svg|png|jpe?g|gif|webp|avif|ico|woff2?|ttf|eot)$": "<rootDir>/jest/fileStub.cjs",
    // `import.meta.env` no existe en CommonJS: las pruebas usan un doble de src/config/env.ts.
    "^(\\.{1,2}/)+config/env(\\.ts)?$": "<rootDir>/src/test/env.ts",
  },
};
