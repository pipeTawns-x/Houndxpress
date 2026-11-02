# Hound Express: frontend

Rediseño no oficial del sitio de Hound Express: sitio público, rastreo de guías y panel de operaciones. Es una aplicación de una sola página (React 19 + TypeScript + Vite, con los estilos en Sass con BEM, el estado de las guías en Redux Toolkit y las pruebas en Jest) que habla con la API Django de [`../backend`](../backend/) en el mismo origen.

La especificación está en [`../docs/diseno/`](../docs/diseno/): investigación, decisiones ([`03-arquitecto.md`](../docs/diseno/03-arquitecto.md)) y sistema de diseño ([`04-sistema-de-diseno.md`](../docs/diseno/04-sistema-de-diseno.md)). La ruta `/disenos` muestra ese sistema solo en desarrollo (`import.meta.env.DEV`); no se incluye en producción.

> **API como fuente de verdad.** El rastreo público consulta `/api/v1/public/track/`. El panel requiere una sesión de personal verificada en el servidor. No existe respaldo silencioso a datos locales cuando la API está desconectada.

## Requisitos

- Node.js 20.19 o superior (se recomienda 22; ver `.nvmrc`) y npm.
- Para rastreo y operaciones: el backend corriendo en `http://127.0.0.1:8000` (ver el README de la raíz).

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

La evidencia medida y las limitaciones de la última implementación están en [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Cómo se conecta con Django

En desarrollo (`npm run dev`) y en `npm run preview`, Vite reenvía `/api`, `/admin` y `/static` a `http://127.0.0.1:8000` (ver `vite.config.ts`). Con Docker (`docker compose up --build` desde la raíz), `Dockerfile` compila la aplicación y nginx la sirve en <http://localhost:8080> haciendo el mismo reenvío al contenedor `backend` (ver `nginx.conf`). El navegador siempre habla con un solo origen, así que no hace falta CORS. Si el backend no está encendido, el chip del pie y del panel dice "API sin conexión" el rastreo ofrece reintentar y el panel permanece cerrado si no puede verificar la sesión.

## Contrato HTTP y sesión

`httpRepository` es la implementación de producción de `GuideRepository`. Los datos de prueba de `demoRepository` solo se inyectan en las pruebas; `VITE_DATA_SOURCE` ya no activa datos locales.

- Lectura y alta: `GET` y `POST /api/v1/guides/`; detalle y avance: `GET` y `PUT /api/v1/guides/{trackingNumber}/`.
- El alta envía `trackingNumber`, `origin`, `destination`, `recipient` y `serviceLevel`. El avance envía `stage` y `location`; nunca fecha, nota interna ni autor.
- La lista recorre los cursores de DRF. Solo sigue páginas del mismo origen y ruta; rechaza ciclos.
- El resumen global usa `/api/v1/guides/summary/`. Activas = etapas 1 a 4; en tránsito = etapa 4; entregadas = etapa 5.
- El rastreo público pide de 1 a 10 números en una sola consulta. Su DTO solo contiene `trackingNumber`, `currentStatus` e historial con `stage`, `timestamp` y `location`. Nunca muestra destinatario, dirección privada ni estimación calculada.
- `/acceso` inicia sesión. Todas las rutas `/panel`, incluido el detalle `/panel/guias/:trackingNumber`, esperan a `GET /api/v1/auth/me/` antes de montar contenido privado.
- Antes de cada escritura se obtiene el token de `GET /api/v1/auth/csrf/` y se manda como `X-CSRFToken`. Nunca se leen cookies por nombre ni se guarda la contraseña.
- Un 409 de transición se comunica como conflicto. El detalle requiere actualizar antes de intentar otro avance; solo se ofrece la etapa siguiente.
- Cerrar sesión usa `POST /api/v1/auth/logout/` y limpia el estado privado de Redux. Las continuaciones de escrituras anteriores no repueblan el almacén.

El servidor debe aplicar los permisos y la máquina de cinco etapas. El guard del navegador no sustituye los permisos del backend. Los formatos de autenticación asumidos son `{ "csrfToken": "..." }` y `{ "username": "...", "isStaff": true }`; la integración real debe confirmarlos.

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
componente → useGuides() → dispatch(thunk) → thunk → GuideRepository (API)
    ↑                                                        │
    └──────── useAppSelector ← reducer guarda lo que devolvió ┘
```

- **`status`** del almacén es `idle`, `loading`, `succeeded` o `failed`. `useGuides()` conserva su interfaz de siempre (`guides`, `status: "loading" | "ready" | "error"`, `error`, `create`, `advance`, `reset`, `reload`), así que las páginas no cambiaron.
- **Las escrituras terminan con una lectura.** `createGuide`, `advanceGuide` y `resetGuides` llaman al repositorio y después vuelven a leer la lista con `fetchGuides({ background: true })`. Los reducers no arman la lista: guardan lo que devuelve el repositorio, en su orden. La lectura en segundo plano no pasa por `loading`, para que el panel no parpadee ni se desmonte el formulario mientras se guarda.
- **Solo cuenta la última lectura.** Cada lectura anota su `requestId`; la respuesta de una lectura anterior se descarta.
- **Los errores llegan intactos.** Los thunks de escritura rechazan con `rejectWithValue(error)`, y `useGuides().create` o `.advance` lanzan ese mismo `Error` (`DomainError` o `RepositoryError`), porque el formulario y la tabla los distinguen con `instanceof`. El estado solo guarda el mensaje. Por eso `createAppStore` le dice a la revisión de serialización de Redux que un `Error` es válido dentro de una acción.
- **Volver al panel.** Primero se verifica de nuevo la sesión. Después se muestra y actualiza la lista del almacén.

### Por qué el repositorio es el argumento extra del thunk

`createAppStore(repository)` pasa el repositorio a `configureStore` como `thunk.extraArgument`, y los thunks lo reciben como `extra`. Así:

1. **El almacén no conoce las implementaciones.** `src/main.tsx` elige una sola vez el repositorio (`httpRepository`) y crea el almacén con él. Los thunks no dependen del transporte HTTP.
2. **Se prueba sin trucos.** Las pruebas crean un almacén nuevo con un repositorio falso (`src/test/fakeRepository.ts`) o con el de demostración sobre un almacenamiento en memoria; no hay que sustituir módulos ni compartir estado entre pruebas. `src/test/renderApp.tsx` crea un almacén por cada montaje.
3. **La regla de negocio sigue en el dominio.** El repositorio aplica `advanceGuide` de `src/domain/` (solo la etapa siguiente) y rechaza lo demás; los reducers no la repiten. Una prueba lo demuestra: con un repositorio que saltara etapas, el almacén guardaría lo que este devuelva.
4. **Sin globales.** El repositorio no viaja en el estado ni en las acciones, que solo llevan datos serializables.

La búsqueda del rastreo (`useGuideLookup`) sigue con estado local: es una consulta pasajera ligada a la URL, que ninguna otra pantalla comparte, y consulta exclusivamente el endpoint público mediante `publicTracker`.

### Datos de prueba

`createTestRepository()` crea un repositorio aislado por montaje. El transporte de prueba de la aplicación simula los endpoints de sesión y rastreo público, proyectando únicamente los campos públicos. Las pruebas de contrato HTTP verifican directamente URL, método, CSRF, estados y contenido de los cuerpos.

## Estilos: Sass + BEM

Los estilos están en Sass con la metodología BEM. No hay clases utilitarias ni una hoja global suelta: cada `className` de los componentes es un bloque, un elemento o un modificador BEM que se define en un parcial de `src/styles/`. `src/main.tsx` importa un único `styles/main.scss`.

### Carpetas (patrón 7-1)

```text
src/styles/
├── main.scss        # punto de entrada: @use "base", "layout", "components", "pages" (en ese orden, el de la cascada)
├── abstracts/       # no emiten CSS: _tokens (colores, tipografía, radios, sombras), _breakpoints, _mixins
├── base/            # :root con los tokens como propiedades personalizadas, reinicio, tipografía, foco, movimiento reducido
├── layout/          # contenedor, secciones, encabezado, menú móvil, pie, enlace para saltar al contenido
├── components/      # un parcial por bloque: button, field, stage-badge, stage-timeline, guides-table...
└── pages/           # bloques propios de cada página: home, tracking, services, panel, designs...
```

Cada carpeta tiene un `_index.scss` que reenvía sus parciales con `@forward`, y cada parcial trae las abstracciones con `@use "../abstracts" as *;`. No se usa `@import`. Las 7 carpetas del patrón son abstracts, base, layout, components, pages, themes y vendors; aquí solo hay cinco porque el proyecto no tiene temas ni hojas de terceros (las tipografías se importan como paquetes en `main.tsx`).

### Convención BEM

`bloque`, `bloque__elemento` y `bloque--modificador`, en minúsculas con guiones. Un elemento nunca lleva otro elemento (`a__b__c` no existe: se llama `a__c`). Ejemplo real, la insignia de etapa (`src/styles/components/_stage-badge.scss` y `src/components/ui/StageBadge.tsx`):

```scss
.stage-badge {                       // bloque
  display: inline-flex;
  background-color: $color-aqua-100;

  &--delivered {                     // modificador: .stage-badge--delivered
    background-color: $color-success-soft;
  }

  &__dot {                           // elemento: .stage-badge__dot
    border-radius: $radius-full;
  }
}
```

```tsx
<span className={cx(bem("stage-badge", { delivered }), className)}>   {/* "stage-badge stage-badge--delivered" */}
  <span className="stage-badge__dot" aria-hidden="true" />
```

`bem()` y `cx()` (`src/lib/bem.ts`) solo arman la cadena de clases: `bem("button", "primary", { full })` da `button button--primary button--full`, y `cx` une la clase propia con la `className` que llega por props. Un bloque puede "mezclarse" con otro en el mismo elemento (`button tracking-search__submit`); el bloque base va antes en `components/_index.scss`.

### Dónde viven los tokens

`src/styles/abstracts/_tokens.scss`: los colores (`$color-navy-950`, `$color-aqua-500`, `$color-aqua-700`... con los mismos nombres y valores de [`04-sistema-de-diseno.md`](../docs/diseno/04-sistema-de-diseno.md)), las familias tipográficas, la escala de tamaños, los radios, las sombras y la duración de las transiciones. `base/_root.scss` los expone también como propiedades personalizadas de `:root` (`--color-aqua-500`, `--text-h1`, `--shadow-soft`...), para los componentes y las herramientas de inspección; no se usan estilos en línea. Para cambiar un color se edita `_tokens.scss` y solo ahí.

Reglas que los estilos respetan: el aqua `#4CBED8` nunca es color de texto sobre fondo claro (se usa `$color-aqua-700`, `#167088`); el foco es un anillo aqua de 3 px con un aro marino sobre fondo claro; las animaciones van dentro de `@include motion-safe` (el héroe tiene una entrada de marca de 950 ms y se muestra estático con movimiento reducido) y `prefers-reduced-motion: reduce` apaga el resto; los puntos de quiebre son 640, 768 y 1024 px (`@include up(md)`), mobile first, y 1280 px queda reservado (`xl`). El encabezado completo sustituye al menú móvil desde 1024 px, la línea de tiempo pasa a horizontal desde 768 px y la tabla de guías reemplaza a las tarjetas desde 768 px.

Una nota adicional: los interlineados de la escala (`calc(2 / 1.5)`) se leen de `--text-<paso>--line-height` (mixin `type()`), porque el minificador de CSS de Vite convierte un `calc()` suelto en un decimal de cinco cifras y la altura de las líneas cambiaría fracciones de píxel.

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
    ├── styles/            # Sass con BEM (patrón 7-1): abstracts, base, layout, components, pages y main.scss
    ├── config/            # env.ts: único lugar que lee import.meta.env
    ├── store/             # Redux: almacén, guidesSlice (thunks), selectores y hooks tipados
    ├── domain/            # tipos, etapas y reglas puras (sin React)
    ├── services/          # repositorio de guías (demo y HTTP) y estado de la API
    ├── hooks/             # useGuides, useGuideLookup, useApiHealth, useDocumentTitle...
    ├── components/        # layout, ui, tracking, panel, illustrations
    ├── content/           # textos del sitio: servicios, cobertura, preguntas, cultura
    ├── lib/               # bem.ts (clases BEM), fechas, contraste WCAG, proyección del mapa, mailto...
    ├── pages/             # una por ruta
    └── test/              # preparación de Jest y utilidades de prueba (renderApp, repositorio falso, stubGlobal)
```

Las pruebas viven junto al código (`*.test.ts` y `*.test.tsx`).

## Rutas

`/` · `/rastreo` (acepta `?guia=`, varias separadas por coma) · `/servicios` · `/cobertura` · `/nosotros` · `/preguntas` · `/contacto` · `/acceso` · `/panel` · `/panel/registro` · `/panel/alta` · `/panel/guias/:trackingNumber` · `/panel/archivo` · `/disenos` · cualquier otra ruta muestra la página 404.

## Notas de mantenimiento

- **Versiones.** React Router está en la versión 7 y no en la 8 porque la 8 exige Node 22.22 o superior, y este proyecto promete Node 20.19. Por la misma razón `@testing-library/jest-dom` está en la 6.9 y TypeScript en la 6.0 (`typescript-eslint` todavía no admite la 7).
- **npm.** Con npm 10, `npm install` de un paquete nuevo puede fallar con `Cannot read properties of null (reading 'edgesOut')` por un error de npm al resolver dependencias opcionales de plataforma (se vio con Vitest). Al agregar Redux y Jest con npm 10.9 no ocurrió, pero si aparece al agregar dependencias, usa `npx npm@11 install <paquete>`. `npm ci` no se ve afectado.
- **Jest y `"type": "module"`.** El paquete es ESM y Vite compila ESM, pero Jest ejecuta el código como CommonJS. `@swc/jest` transforma cada archivo `.ts`/`.tsx` en memoria y no revisa tipos (eso lo hace `npm run typecheck`, que incluye las pruebas). Se descartó `ts-jest` porque, con el `tsconfig` del proyecto (`verbatimModuleSyntax` y `module: ESNext`), falla al emitir CommonJS con el error TS1295 (comprobado con ts-jest 29.4 y TypeScript 6.0). Por eso `jest.config.js` es ESM, pero los sustitutos que Jest carga con `require` (`jest/fileStub.cjs`) son `.cjs`. Jest 30 exige Node 18.14 o superior, y `@swc/core` trae binarios para Linux (glibc y musl), macOS y Windows.
- **Estilos, imágenes y `?raw` en las pruebas.** `moduleNameMapper` sustituye `.css`, `.scss`, imágenes, tipografías y `@fontsource-variable/*` por un módulo vacío. Las importaciones `?raw` (`README.md?raw`, `styles/abstracts/_tokens.scss?raw`) se resuelven al archivo real y `jest/rawTransform.js` lo entrega como texto, igual que Vite.
- **`import.meta.env`.** No existe en CommonJS, así que solo se lee en `src/config/env.ts`; Jest lo sustituye por el doble `src/test/env.ts` (regla en `jest.config.js`). No uses `import.meta` en otro archivo.
- **Diferencias con Vitest al escribir pruebas.** Jest no trae `vi.stubGlobal` (usa `stubGlobal` de `src/test/stubGlobal.ts`, que `setup.ts` deshace al terminar cada prueba), `expect(valor, mensaje)`, `toBeTypeOf` ni `toHaveBeenCalledExactlyOnceWith`. jsdom no implementa `fetch`: `jest/environment.js` agrega `Response`, `Headers`, `Request` y `TextEncoder` de Node, y `setup.ts` sustituye `fetch` por un rechazo para que ninguna prueba toque la red.
- **Contacto.** El formulario no envía nada: arma un correo (`mailto:`) para `sclientes1@hound-express.com` y lo abre en el cliente de correo de la persona.
