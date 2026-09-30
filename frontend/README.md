# Hound Express: frontend

Rediseño no oficial del sitio de Hound Express hecho para el programa de EBAC: sitio público, rastreo de guías y panel de operaciones. Es una aplicación de una sola página (React + TypeScript + Vite, con el estado de las guías en Redux Toolkit) que habla con la API Django de [`../backend`](../backend/) en el mismo origen.

La especificación está en [`../docs/diseno/`](../docs/diseno/): investigación, decisiones ([`03-arquitecto.md`](../docs/diseno/03-arquitecto.md)) y sistema de diseño ([`04-sistema-de-diseno.md`](../docs/diseno/04-sistema-de-diseno.md)). La ruta `/disenos` de la aplicación muestra ese sistema en vivo.

> **Datos de demostración.** El backend todavía no tiene endpoints de guías (llegan en M64). Por defecto la aplicación usa guías de ejemplo que se guardan solo en el navegador de quien la usa, y cada pantalla con guías lo dice. El único dato real es el estado de la API (`/api/v1/health/`).

## Requisitos

- Node.js 20.19 o superior (se recomienda 22; ver `.nvmrc`) y npm.
- Para ver el estado real de la API: el backend corriendo en `http://127.0.0.1:8000` (ver el README de la raíz).

## Comandos

Desde `frontend/`:

| Comando | Qué hace |
|---|---|
| `npm ci` | Instala las dependencias exactas de `package-lock.json` |
| `npm run dev` | Servidor de desarrollo en <http://localhost:5173> |
| `npm run build` | Revisa los tipos y compila a `dist/` |
| `npm run preview` | Sirve `dist/` en <http://localhost:4173> |
| `npm run lint` | ESLint (sin errores ni advertencias) |
| `npm run typecheck` | `tsc -b --noEmit` |
| `npm test` | Jest (jsdom) con Testing Library. Para una sola prueba: `npx jest src/store` o `npx jest -t "texto del nombre"` |

## Cómo se conecta con Django

En desarrollo (`npm run dev`) y en `npm run preview`, Vite reenvía `/api`, `/admin` y `/static` a `http://127.0.0.1:8000` (ver `vite.config.ts`). Con Docker (`docker compose up --build` desde la raíz), `Dockerfile` compila la aplicación y nginx la sirve en <http://localhost:8080> haciendo el mismo reenvío al contenedor `backend` (ver `nginx.conf`). El navegador siempre habla con un solo origen, así que no hace falta CORS. Si el backend no está encendido, el chip del pie y del panel dice "API sin conexión" y todo lo demás sigue funcionando con los datos de demostración.

## Datos de demostración y `VITE_DATA_SOURCE`

El acceso a datos pasa por la interfaz `GuideRepository` (`src/services/guideRepository.ts`), con dos implementaciones:

- `demoRepository` (por defecto): guarda las guías en `localStorage`, clave `hx.guides.v1`, y arranca con 8 guías de ejemplo. Si el almacenamiento no está disponible trabaja en memoria. "Restablecer datos de ejemplo" en el panel vuelve al estado inicial.
- `httpRepository`: llama a `/api/v1/guides/` (lista, detalle, alta y `advance/`) con el contrato previsto para M64. Se activa así:

```bash
VITE_DATA_SOURCE=api npm run dev     # o al compilar: VITE_DATA_SOURCE=api npm run build
```

La regla de avance es la del negocio y vive en `src/domain/`: la única etapa válida es la siguiente, y una guía entregada no avanza más.

## Estado con Redux

Las guías del panel viven en un almacén de Redux Toolkit (`@reduxjs/toolkit` y `react-redux`, ambos MIT), en `src/store/`. Cualquier componente que use `useGuides()` lee y modifica la misma lista, y lo que cambia uno lo ve el otro.

| Archivo | Qué contiene |
|---|---|
| `store.ts` | `createAppStore(repository)`: `configureStore` con el repositorio como argumento extra de los thunks, y los tipos `RootState` y `AppDispatch` |
| `guidesSlice.ts` | El estado (`items`, `status`, `error`, `canReset`), los thunks `fetchGuides`, `createGuide`, `advanceGuide` y `resetGuides`, y el reducer |
| `selectors.ts` | `selectGuides`, `selectGuidesStatus`, `selectGuidesError`, `selectCanResetGuides` y `selectStageCounts` (memoizado con `createSelector`; usa `summarizeGuides` de `src/domain/`) |
| `hooks.ts` | `useAppDispatch` y `useAppSelector`, ya tipados |

El flujo de datos, de un clic a la pantalla:

```text
componente → useGuides() → dispatch(thunk) → thunk → GuideRepository (demo o API)
    ↑                                                        │
    └──────── useAppSelector ← reducer guarda lo que devolvió ┘
```

- **`status`** del almacén es `idle`, `loading`, `succeeded` o `failed`. `useGuides()` conserva su interfaz de siempre (`guides`, `status: "loading" | "ready" | "error"`, `error`, `create`, `advance`, `reset`, `reload`), así que las páginas no cambiaron.
- **Las escrituras terminan con una lectura.** `createGuide`, `advanceGuide` y `resetGuides` llaman al repositorio y después vuelven a leer la lista con `fetchGuides({ background: true })`. Los reducers no arman la lista: guardan lo que devuelve el repositorio, en su orden. La lectura en segundo plano no pasa por `loading`, para que el panel no parpadee ni se desmonte el formulario mientras se guarda.
- **Solo cuenta la última lectura.** Cada lectura anota su `requestId`; la respuesta de una lectura anterior se descarta.
- **Los errores llegan intactos.** Los thunks de escritura rechazan con `rejectWithValue(error)`, y `useGuides().create` o `.advance` lanzan ese mismo `Error` (`DomainError` o `RepositoryError`), porque el formulario y la tabla los distinguen con `instanceof`. El estado solo guarda el mensaje. Por eso `createAppStore` le dice a la revisión de serialización de Redux que un `Error` es válido dentro de una acción.
- **Volver al panel.** Si el almacén ya tiene la lista, el panel la muestra al instante y la actualiza en segundo plano.

### Por qué el repositorio es el argumento extra del thunk

`createAppStore(repository)` pasa el repositorio a `configureStore` como `thunk.extraArgument`, y los thunks lo reciben como `extra`. Así:

1. **El almacén no conoce las implementaciones.** `src/main.tsx` elige una sola vez el repositorio (`demoRepository` o `httpRepository`, según `VITE_DATA_SOURCE`) y crea el almacén con él. Pasar de datos de demostración a la API Django (M64) no toca ningún thunk ni reducer.
2. **Se prueba sin trucos.** Las pruebas crean un almacén nuevo con un repositorio falso (`src/test/fakeRepository.ts`) o con el de demostración sobre un almacenamiento en memoria; no hay que sustituir módulos ni compartir estado entre pruebas. `src/test/renderApp.tsx` crea un almacén por cada montaje.
3. **La regla de negocio sigue en el dominio.** El repositorio aplica `advanceGuide` de `src/domain/` (solo la etapa siguiente) y rechaza lo demás; los reducers no la repiten. Una prueba lo demuestra: con un repositorio que saltara etapas, el almacén guardaría lo que este devuelva.
4. **Sin globales.** El repositorio no viaja en el estado ni en las acciones, que solo llevan datos serializables.

La búsqueda del rastreo (`useGuideLookup`) sigue con estado local: es una consulta pasajera ligada a la URL, que ninguna otra pantalla comparte, y sigue leyendo el repositorio del contexto de React (`RepositoryContext`).

### Guías de ejemplo

Prueba el rastreo (`/rastreo`) con cualquiera de estos números. Se pueden escribir con espacios o guiones.

| Número | Etapa inicial | Ruta |
|---|---|---|
| `2148 2139 0765 0312` | Recepción de carga | Miami, FL → Bogotá, Colombia |
| `2103 9584 7201 6654` | Vehículo cargado | Laredo, TX → Ciudad de México |
| `HX7Q 4M9K 2B8T 5W1N 6R3D 0C` | Vehículo cargado | Miami, FL → Buenos Aires, Argentina |
| `2176 6402 1583 9927` | Vehículo liberado | Miami, FL → São Paulo, Brasil |
| `2119 8753 0246 7781` | Vehículo en camino | Laredo, TX → Monterrey, N.L. |
| `2187 1209 4556 3218` | Vehículo en camino | Miami, FL → Santiago, Chile |
| `2154 3029 6817 0435` | Carga entregada | Laredo, TX → Guadalajara, Jal. |
| `2131 7640 5820 9473` | Carga entregada | Laredo, TX → Ciudad de México |

Un número válido es de 16 dígitos que inician con `21`, o de 22 caracteres alfanuméricos.

## Estructura

```text
frontend/
├── index.html
├── public/                # logotipos de Hound Express (brand/) y favicon
├── vite.config.ts         # proxy a Django
├── jest.config.js, jest/  # configuración de Jest y sus ayudas (entorno jsdom, sustitutos de estilos y de ?raw)
├── Dockerfile, nginx.conf # imagen con nginx: sirve dist/ y reenvía /api, /admin y /static
├── eslint.config.js
└── src/
    ├── main.tsx, App.tsx  # arranque y rutas (el panel y /disenos cargan aparte)
    ├── index.css          # Tailwind 4 y tokens de diseño (@theme)
    ├── config/            # env.ts: único lugar que lee import.meta.env
    ├── store/             # Redux: almacén, guidesSlice (thunks), selectores y hooks tipados
    ├── domain/            # tipos, etapas y reglas puras (sin React)
    ├── services/          # repositorio de guías (demo y HTTP) y estado de la API
    ├── hooks/             # useGuides, useGuideLookup, useApiHealth, useDocumentTitle...
    ├── components/        # layout, ui, tracking, panel, illustrations
    ├── content/           # textos del sitio: servicios, cobertura, preguntas, cultura
    ├── lib/               # fechas, contraste WCAG, proyección del mapa, mailto...
    ├── pages/             # una por ruta
    └── test/              # preparación de Jest y utilidades de prueba (renderApp, repositorio falso, stubGlobal)
```

Las pruebas viven junto al código (`*.test.ts` y `*.test.tsx`).

## Rutas

`/` · `/rastreo` (acepta `?guia=`, varias separadas por coma) · `/servicios` · `/cobertura` · `/nosotros` · `/preguntas` · `/contacto` · `/panel` · `/disenos` · cualquier otra ruta muestra la página 404.

## Notas de mantenimiento

- **Versiones.** React Router está en la versión 7 y no en la 8 porque la 8 exige Node 22.22 o superior, y este proyecto promete Node 20.19. Por la misma razón `@testing-library/jest-dom` está en la 6.9 y TypeScript en la 6.0 (`typescript-eslint` todavía no admite la 7).
- **npm.** Con npm 10, `npm install` de un paquete nuevo puede fallar con `Cannot read properties of null (reading 'edgesOut')` por un error de npm al resolver dependencias opcionales de plataforma (se vio con Vitest). Al agregar Redux y Jest con npm 10.9 no ocurrió, pero si aparece al agregar dependencias, usa `npx npm@11 install <paquete>`. `npm ci` no se ve afectado.
- **Jest y `"type": "module"`.** El paquete es ESM y Vite compila ESM, pero Jest ejecuta el código como CommonJS. `@swc/jest` transforma cada archivo `.ts`/`.tsx` en memoria y no revisa tipos (eso lo hace `npm run typecheck`, que incluye las pruebas). Se descartó `ts-jest` porque, con el `tsconfig` del proyecto (`verbatimModuleSyntax` y `module: ESNext`), falla al emitir CommonJS con el error TS1295 (comprobado con ts-jest 29.4 y TypeScript 6.0). Por eso `jest.config.js` es ESM, pero los sustitutos que Jest carga con `require` (`jest/fileStub.cjs`) son `.cjs`. Jest 30 exige Node 18.14 o superior, y `@swc/core` trae binarios para Linux (glibc y musl), macOS y Windows.
- **Estilos, imágenes y `?raw` en las pruebas.** `moduleNameMapper` sustituye `.css`, `.scss`, imágenes, tipografías y `@fontsource-variable/*` por un módulo vacío. Las importaciones `?raw` (`README.md?raw`, `index.css?raw`) se resuelven al archivo real y `jest/rawTransform.js` lo entrega como texto, igual que Vite.
- **`import.meta.env`.** No existe en CommonJS, así que solo se lee en `src/config/env.ts`; Jest lo sustituye por el doble `src/test/env.ts` (regla en `jest.config.js`). No uses `import.meta` en otro archivo.
- **Diferencias con Vitest al escribir pruebas.** Jest no trae `vi.stubGlobal` (usa `stubGlobal` de `src/test/stubGlobal.ts`, que `setup.ts` deshace al terminar cada prueba), `expect(valor, mensaje)`, `toBeTypeOf` ni `toHaveBeenCalledExactlyOnceWith`. jsdom no implementa `fetch`: `jest/environment.js` agrega `Response`, `Headers`, `Request` y `TextEncoder` de Node, y `setup.ts` sustituye `fetch` por un rechazo para que ninguna prueba toque la red.
- **Contacto.** El formulario no envía nada: arma un correo (`mailto:`) para `sclientes1@hound-express.com` y lo abre en el cliente de correo de la persona.
