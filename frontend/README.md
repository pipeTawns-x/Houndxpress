# Hound Express: frontend

Rediseño no oficial del sitio de Hound Express hecho para el programa de EBAC: sitio público, rastreo de guías y panel de operaciones. Es una aplicación de una sola página (React + TypeScript + Vite) que habla con la API Django de [`../backend`](../backend/) en el mismo origen.

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
| `npm test` | Vitest con Testing Library |

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
├── vite.config.ts         # proxy a Django y configuración de Vitest
├── Dockerfile, nginx.conf # imagen con nginx: sirve dist/ y reenvía /api, /admin y /static
├── eslint.config.js
└── src/
    ├── main.tsx, App.tsx  # arranque y rutas (el panel y /disenos cargan aparte)
    ├── index.css          # Tailwind 4 y tokens de diseño (@theme)
    ├── domain/            # tipos, etapas y reglas puras (sin React)
    ├── services/          # repositorio de guías (demo y HTTP) y estado de la API
    ├── hooks/             # useGuides, useGuideLookup, useApiHealth, useDocumentTitle...
    ├── components/        # layout, ui, tracking, panel, illustrations
    ├── content/           # textos del sitio: servicios, cobertura, preguntas, cultura
    ├── lib/               # fechas, contraste WCAG, proyección del mapa, mailto...
    ├── pages/             # una por ruta
    └── test/              # preparación de Vitest y utilidades de prueba
```

Las pruebas viven junto al código (`*.test.ts` y `*.test.tsx`).

## Rutas

`/` · `/rastreo` (acepta `?guia=`, varias separadas por coma) · `/servicios` · `/cobertura` · `/nosotros` · `/preguntas` · `/contacto` · `/panel` · `/disenos` · cualquier otra ruta muestra la página 404.

## Notas de mantenimiento

- **Versiones.** React Router está en la versión 7 y no en la 8 porque la 8 exige Node 22.22 o superior, y este proyecto promete Node 20.19. Por la misma razón `@testing-library/jest-dom` está en la 6.9 y TypeScript en la 6.0 (`typescript-eslint` todavía no admite la 7).
- **npm.** Con npm 10, `npm install` de un paquete nuevo puede fallar con `Cannot read properties of null (reading 'edgesOut')` por un error de npm al resolver las dependencias opcionales de Vitest. `npm ci` no se ve afectado. Si ocurre al agregar dependencias, usa `npx npm@11 install <paquete>`.
- **Contacto.** El formulario no envía nada: arma un correo (`mailto:`) para `sclientes1@hound-express.com` y lo abre en el cliente de correo de la persona.
