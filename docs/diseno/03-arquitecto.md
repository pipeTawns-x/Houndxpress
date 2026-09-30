# 03 · Decisión del arquitecto

Respuesta a cada objeción de [`02-abogado-del-diablo.md`](02-abogado-del-diablo.md) y contrato técnico del frontend. Este documento es la especificación que siguió la implementación.

## Veredictos

| # | Objeción | Veredicto | Qué cambia |
|---|---|---|---|
| 1 | M52 pide Django, no frontend | **Se atiende** | El backend no se toca. El README conserva primero la tabla de requisitos de M52 y agrega el frontend en su propia sección. La etiqueta `m52` no se mueve. |
| 2 | Segunda cadena de herramientas | **Se atiende** | El backend sigue funcionando solo con Python. El frontend se levanta con `npm` o, sin instalar Node, con `docker compose up`. |
| 3 | Demostración que parece real | **Se atiende** | Toda pantalla con guías muestra la etiqueta "Datos de demostración" y la lista de guías de ejemplo. El README lo dice igual. |
| 4 | Modelo inventado antes que el backend | **Se reduce** | El frontend solo fija lo que el negocio ya fijó: cinco etapas, orden y responsable. El resto de campos vive en un solo archivo de tipos (`src/domain/`) y el acceso a datos pasa por una interfaz con dos implementaciones. M54 decide los nombres definitivos y se ajustan ambos lados en el mismo commit. |
| 5 | Material de la empresa | **Se atiende** | Solo se reutiliza el logotipo y datos públicos (cifras, teléfonos, preguntas). Ilustraciones e iconos son propios o de librerías con licencia permisiva. |
| 6 | "Moderna" no es medible | **Se atiende** | Criterios de aceptación medibles abajo. |
| 7 | Docker contradice el stack | **Se descarta** | Se agrega un `docker-compose.yml` propio de dos servicios. La ruta sin Docker sigue siendo la principal y el CI prueba las dos. |
| 8 | Panel abierto | **Se reduce** | El panel guarda datos solo en el navegador de quien lo usa y lo declara. La autenticación real llega con M64. |

## Stack del frontend

| Tema | Decisión | Motivo |
|---|---|---|
| Base | React 19 + TypeScript + Vite | React es lo que enseña el módulo de front-end del programa; Vite compila en segundos y sirve el proxy a Django en desarrollo. |
| Estilos | Tailwind CSS 4 con tokens en `@theme` | Un solo lugar para colores, tipografía y espaciado; sin hojas CSS paralelas. |
| Rutas | React Router | Rutas reales (`/rastreo?guia=…`) que se pueden compartir. |
| Iconos | `lucide-react` (ISC) | Trazo uniforme, se importan solo los usados. |
| Tipografías | `@fontsource-variable/plus-jakarta-sans` e `@fontsource-variable/inter` (OFL) | Autoalojadas: sin peticiones a Google Fonts. |
| Pruebas | Vitest + Testing Library | Mismo motor que Vite. |
| Calidad | ESLint + `tsc --noEmit` | Se ejecutan en CI. |
| Estado | Hooks de React y un repositorio de datos | El volumen no justifica Redux. |

Ninguna dependencia que llega al navegador es copyleft; la única de compilación con copyleft débil (lightningcss, MPL-2.0) está explicada junto a la tabla de licencias en [`docs/STACK_HOUND_EXPRESS.md`](../STACK_HOUND_EXPRESS.md).

## Estructura

```text
frontend/
├── index.html
├── public/brand/            # logotipos de Hound Express
├── src/
│   ├── main.tsx, App.tsx    # arranque y rutas
│   ├── index.css            # Tailwind y tokens (@theme)
│   ├── domain/              # tipos, etapas y reglas puras (sin React)
│   ├── services/            # repositorio de guías (demo y HTTP) y salud de la API
│   ├── hooks/               # useGuides, useApiHealth, useDocumentTitle
│   ├── components/          # piezas reutilizables (layout, ui, tracking, illustrations)
│   ├── content/             # textos del sitio: servicios, cobertura, preguntas
│   └── pages/               # una carpeta o archivo por ruta
└── tests en src/**/*.test.ts(x)
```

## Contrato de datos

Identificadores en inglés y textos en español, igual que el backend.

```ts
type StageCode =
  | "cargo_received"      // 1 Recepción de carga · Aduana
  | "vehicle_loaded"      // 2 Vehículo cargado · Aduana
  | "vehicle_released"    // 3 Vehículo liberado · Operaciones
  | "vehicle_in_transit"  // 4 Vehículo en camino · Seguridad
  | "cargo_delivered";    // 5 Carga entregada · KAM

interface StageEvent { stage: StageCode; at: string /* ISO 8601 UTC */; location: string; note?: string }

interface Guide {
  number: string;            // 16 dígitos que inician con 21, o 22 caracteres alfanuméricos
  origin: string;
  destination: string;
  recipient: string;
  service: "standard" | "priority";
  createdAt: string;
  currentStage: StageCode;
  history: StageEvent[];     // solo crece; nunca se edita ni se borra
}
```

Regla única de avance, la misma que implementará el backend: **la única etapa válida es la siguiente**. Una guía en `cargo_delivered` no avanza más.

El acceso a datos pasa por `GuideRepository` (`list`, `get`, `create`, `advance`):

- `demoRepository`: guarda en `localStorage` y arranca con guías de ejemplo. Es la implementación por defecto.
- `httpRepository`: llama a `/api/v1/guides/` con el contrato previsto para M64. Se activa con `VITE_DATA_SOURCE=api`.

El estado de la API sí es real desde hoy: el panel y el pie consultan `GET /api/v1/health/`, el endpoint que ya existe en `backend/core/views.py`.

## Cómo se conecta con el backend

| Entorno | Frontend | API |
|---|---|---|
| Desarrollo | `npm run dev` en `:5173` | Vite reenvía `/api` y `/admin` a `127.0.0.1:8000` |
| Docker | nginx sirve la compilación en `:8080` | nginx reenvía `/api`, `/admin` y `/static` al contenedor `backend` |

Mismo origen en ambos casos: no hace falta CORS.

## Criterios de aceptación

1. Todas las rutas se ven completas sin desplazamiento horizontal en 360, 390, 768, 1024 y 1440 px de ancho.
2. Contraste de texto AA (4.5:1 texto normal, 3:1 texto grande) con los tokens definidos en [`04-sistema-de-diseno.md`](04-sistema-de-diseno.md).
3. Todo se opera con teclado: enlace para saltar al contenido, foco visible, menú móvil y cajón de historial se cierran con `Esc`.
4. `prefers-reduced-motion` apaga las animaciones.
5. `npm run lint`, `npm run typecheck`, `npm test` y `npm run build` terminan sin errores, localmente y en CI.
6. El JavaScript inicial comprimido pesa menos de 150 KB; el panel y el índice de diseños se cargan aparte.
7. Buscar una guía de ejemplo muestra su etapa actual en la línea de tiempo; buscar una inexistente muestra el estado "no encontrada".
8. En el panel, registrar una guía la agrega a la lista en etapa 1, y "Avanzar" solo ofrece la etapa siguiente.
